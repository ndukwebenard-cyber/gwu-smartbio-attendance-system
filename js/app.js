/**
 * SMARTBIO ATTENDANCE SYSTEM - CORE APPLICATION CONTROLLER
 * SPA View Routing, Real-time Radars, Exception Resolution & UI Actions
 */

class SmartBioApp {
  constructor() {
    this.currentView = 'LECTURER';
    this.authenticatedUser = null; // Strictly tracks the logged-in user account
    this.activeLectureSession = null;
    this.sessionTimerInterval = null;
    this.sessionSecondsElapsed = 0;
  }

  init() {
    // Initialize Subsystems
    window.smartBioTour.init();
    // Initial session restoration from localStorage
    try {
      const storedAuth = localStorage.getItem('smartbio_logged_in_user');
      if (storedAuth) {
        this.authenticatedUser = JSON.parse(storedAuth);
        this.currentUserId = this.authenticatedUser ? this.authenticatedUser.id : null;
      }
    } catch (e) {
      console.warn('Auth restoration notice:', e);
    }

    // Institutional Security Passcodes for RBAC Gatekeeping
    this.AUTH_PASSCODES = {
      LECTURER: 'GWU-FACULTY-2026',
      ADMIN: 'GWU-ADMIN-2026',
      CLASS_REP: 'GWU-PROCTOR-2026'
    };

    this.bindNavbarEvents();
    this.bindAuthEvents();
    this.bindLecturerEvents();
    this.bindClassRepEvents();
    this.bindStudentEvents();
    this.bindAdminEvents();
    this.bindScannerEvents();
    this.bindCloudModalEvents();
    this.listenToGlobalEvents();

    this.populateDepartmentDropdowns();
    this.populateLectureCourseDropdown();
    this.updateRegMatricPreview();
    this.bindAutoCaseInputs();

    // Restore ongoing active lecture session from localStorage across page refreshes
    try {
      const savedSess = localStorage.getItem('smartbio_active_session');
      if (savedSess) {
        const parsed = JSON.parse(savedSess);
        if (parsed && parsed.status === 'ACTIVE') {
          this.activeLectureSession = parsed;
          this.renderActiveSessionUI(parsed);
        }
      }
    } catch (e) {
      console.warn('Session restoration notice:', e);
    }

    // Route depending on authentication state
    if (this.authenticatedUser) {
      this.switchRole(this.authenticatedUser.role);
    } else {
      this.renderLoggedOutState();
    }
  }

  bindAutoCaseInputs() {
    // Title Case Auto-Capitalization on blur / change
    document.querySelectorAll('input[data-autocase="title"]').forEach(input => {
      input.addEventListener('blur', () => {
        if (input.value) {
          input.value = input.value
            .toLowerCase()
            .split(' ')
            .map(word => word ? (word.charAt(0).toUpperCase() + word.slice(1)) : '')
            .join(' ');
        }
      });
    });

    // Uppercase Auto-Capitalization on live input
    document.querySelectorAll('input[data-autocase="upper"]').forEach(input => {
      input.addEventListener('input', () => {
        input.value = input.value.toUpperCase();
      });
    });
  }

  // 1. Role & View Switching (Changes Perspective Without Mutating Auth Identity)
  switchRole(targetView) {
    this.currentView = targetView;
    const authUser = this.authenticatedUser || window.smartBioData.getUserById(2);

    // Update Navbar User Profile Chip (Always reflects true authenticated user)
    const navAvatar = document.getElementById('navAuthAvatar');
    const navName = document.getElementById('navAuthName');
    const navRoleBadge = document.getElementById('navAuthRoleBadge');
    
    if (authUser) {
      if (navAvatar) navAvatar.innerText = authUser.avatar || '👤';
      if (navName) navName.innerText = authUser.fullName.split(' ')[0] || authUser.fullName;
      if (navRoleBadge) {
        navRoleBadge.innerText = authUser.role;
        navRoleBadge.className = `badge ${authUser.role === 'ADMIN' ? 'badge-flagged' : (authUser.role === 'LECTURER' ? 'badge-eligible' : 'badge-at-risk')}`;
      }
    }

    // Role-based view authorization gating based on authenticated role
    this.updateNavbarRouteGuards(authUser ? authUser.role : 'STUDENT');

    // Update Navbar active pill
    document.querySelectorAll('.role-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.role === targetView);
    });

    // Hide all views
    document.querySelectorAll('.portal-view').forEach(view => {
      view.classList.remove('active');
    });

    // Refresh course dropdowns
    this.populateLectureCourseDropdown();

    // Show active view
    if (targetView === 'ADMIN') {
      const v = document.getElementById('adminPortalView');
      if (v) v.classList.add('active');
      this.renderAdminPortal();
    } else if (targetView === 'LECTURER') {
      const v = document.getElementById('lecturerPortalView');
      if (v) v.classList.add('active');
      this.renderLecturerPortal();
    } else if (targetView === 'CLASS_REP') {
      const v = document.getElementById('classRepPortalView');
      if (v) v.classList.add('active');
      this.renderClassRepPortal();
    } else if (targetView === 'STUDENT') {
      const v = document.getElementById('studentPortalView');
      if (v) v.classList.add('active');
      this.renderStudentPortal();
    } else if (targetView === 'SCANNER') {
      const v = document.getElementById('scannerKioskView');
      if (v) v.classList.add('active');
      this.renderScannerTerminal();
    }

    this.showToast(`Active Perspective: ${targetView} View`, 'info');
  }

  // Route Guard: Locks down navigation tabs based on least-privilege RBAC
  updateNavbarRouteGuards(userRole) {
    const pillAdmin = document.getElementById('pillAdmin');
    const pillLecturer = document.getElementById('pillLecturer');
    const pillClassRep = document.getElementById('pillClassRep');
    const pillStudent = document.getElementById('pillStudent');
    const pillScanner = document.getElementById('pillScanner');

    if (userRole === 'STUDENT') {
      if (pillAdmin) pillAdmin.style.display = 'none';
      if (pillLecturer) pillLecturer.style.display = 'none';
      if (pillClassRep) pillClassRep.style.display = 'none';
      if (pillStudent) pillStudent.style.display = 'inline-flex';
      if (pillScanner) pillScanner.style.display = 'none';
    } else if (userRole === 'CLASS_REP') {
      if (pillAdmin) pillAdmin.style.display = 'none';
      if (pillLecturer) pillLecturer.style.display = 'none';
      if (pillClassRep) pillClassRep.style.display = 'inline-flex';
      if (pillStudent) pillStudent.style.display = 'inline-flex';
      if (pillScanner) pillScanner.style.display = 'inline-flex';
    } else if (userRole === 'LECTURER') {
      if (pillAdmin) pillAdmin.style.display = 'none';
      if (pillLecturer) pillLecturer.style.display = 'inline-flex';
      if (pillClassRep) pillClassRep.style.display = 'none';
      if (pillStudent) pillStudent.style.display = 'none';
      if (pillScanner) pillScanner.style.display = 'inline-flex';
    } else if (userRole === 'ADMIN') {
      // Administrator has global oversight over all portals for testing & auditing
      if (pillAdmin) pillAdmin.style.display = 'inline-flex';
      if (pillLecturer) pillLecturer.style.display = 'inline-flex';
      if (pillClassRep) pillClassRep.style.display = 'inline-flex';
      if (pillStudent) pillStudent.style.display = 'inline-flex';
      if (pillScanner) pillScanner.style.display = 'inline-flex';
    }
  }

  handleSignOut() {
    this.showToast('Signing out of session...', 'info');
    window.smartBioAudio.playLaserChirp();

    if (window.smartBioCloud && window.smartBioCloud.auth && window.smartBioCloud.isConnected) {
      try {
        window.smartBioCloud.auth.signOut();
      } catch (e) {}
    }

    if (this.sessionTimerInterval) clearInterval(this.sessionTimerInterval);
    this.activeLectureSession = null;

    this.renderLoggedOutState();
    this.showToast('Signed out completely. Please sign in to continue.', 'info');
  }

  renderLoggedOutState() {
    this.authenticatedUser = null;
    this.currentUserId = null;
    try {
      localStorage.removeItem('smartbio_logged_in_user');
      localStorage.removeItem('smartbio_active_session');
    } catch (e) {}

    // Update navbar user chip
    const navAvatar = document.getElementById('navAuthAvatar');
    const navName = document.getElementById('navAuthName');
    const navRoleBadge = document.getElementById('navAuthRoleBadge');
    if (navAvatar) navAvatar.innerText = '👤';
    if (navName) navName.innerText = 'Guest';
    if (navRoleBadge) {
      navRoleBadge.innerText = 'SIGNED OUT';
      navRoleBadge.className = 'badge badge-ineligible';
    }

    // Hide all portal views
    document.querySelectorAll('.portal-view').forEach(view => {
      view.classList.remove('active');
    });

    // Hide all navigation pills
    document.querySelectorAll('.role-pill').forEach(pill => {
      pill.style.display = 'none';
      pill.classList.remove('active');
    });

    // Open Auth Modal in Login mode
    this.openAuthModal('LOGIN');
  }

  handleRegRoleChange() {
    const role = document.getElementById('regRoleSelect').value;
    const passcodeGroup = document.getElementById('regPasscodeGroup');
    const passcodeLabel = document.getElementById('regPasscodeLabel');
    const passcodeInput = document.getElementById('regPasscodeInput');

    if (passcodeGroup) {
      if (role === 'STUDENT') {
        passcodeGroup.style.display = 'none';
        if (passcodeInput) passcodeInput.required = false;
      } else {
        passcodeGroup.style.display = 'block';
        if (passcodeInput) {
          passcodeInput.required = true;
          passcodeInput.value = '';
        }

        if (role === 'LECTURER') {
          passcodeLabel.innerText = '🔐 Institutional Faculty Authorization Key Required';
          passcodeInput.placeholder = 'e.g. GWU-FACULTY-2026';
        } else if (role === 'CLASS_REP') {
          passcodeLabel.innerText = '🔐 Course Proctor Authorization Key Required';
          passcodeInput.placeholder = 'e.g. GWU-PROCTOR-2026';
        } else if (role === 'ADMIN') {
          passcodeLabel.innerText = '🔐 Master Administrator Security Key Required';
          passcodeInput.placeholder = 'e.g. GWU-ADMIN-2026';
        }

        const badgeEl = document.getElementById('regPasscodeRequiredBadge');
        if (badgeEl) badgeEl.innerText = this.AUTH_PASSCODES[role] || '';
      }
    }

    // Hide Dept/Level fields for Admin — institution-wide role, no cohort
    const deptLevelGroup = document.getElementById('regDeptLevelGroup');
    if (deptLevelGroup) {
      deptLevelGroup.style.display = (role === 'ADMIN') ? 'none' : 'block';
    }

    this.updateRegMatricPreview();
  }

  updateRegMatricPreview() {
    const roleSelect = document.getElementById('regRoleSelect');
    const deptSelect = document.getElementById('regDepartment');
    const levelSelect = document.getElementById('regLevel');
    const matricInput = document.getElementById('regMatricNo');
    const emailInput = document.getElementById('regEmail');
    const cohortLabel = document.getElementById('regAutoEnrollCohortLabel');
    const infoBox = document.getElementById('regAutoEnrollInfoBox');

    const role = roleSelect ? roleSelect.value : 'STUDENT';
    const deptId = Number(deptSelect ? deptSelect.value : 1);
    const levelVal = levelSelect ? levelSelect.value : '400';

    const data = window.smartBioData.load();
    const dept = (data.departments || []).find(d => d.id === deptId) || { code: 'CSC', name: 'Computer Science & Software Eng.' };
    const deptCode = dept.code;

    // Derive academic entry year (2025/2026 baseline)
    let entryYear = '22';
    if (levelVal === '500') entryYear = '21'; // Postgraduate / Masters (5-year)
    if (levelVal === '300') entryYear = '23';
    if (levelVal === '200') entryYear = '24';
    if (levelVal === '100') entryYear = '25';

    if (cohortLabel) {
      cohortLabel.innerText = `${deptCode} ${levelVal === 'Faculty' ? 'Faculty Staff' : levelVal + ' Level'}`;
    }

    if (role === 'STUDENT' || role === 'CLASS_REP') {
      const existingUsers = (data.users || []).filter(u => u.identifier && u.identifier.startsWith(`GWU/${deptCode}`));
      const nextSeq = String(existingUsers.length + 1).padStart(3, '0');
      if (matricInput) matricInput.value = `GWU/${deptCode}/${entryYear}/${nextSeq}`;
      if (emailInput && !emailInput.value.trim()) emailInput.placeholder = `student.${deptCode.toLowerCase()}@student.gwu.edu`;
      if (infoBox) infoBox.style.display = 'block';
    } else if (role === 'LECTURER') {
      const existingStaff = (data.users || []).filter(u => u.identifier && u.identifier.startsWith(`STF/${deptCode}`));
      const nextSeq = String(existingStaff.length + 1).padStart(3, '0');
      if (matricInput) matricInput.value = `STF/${deptCode}/${nextSeq}`;
      if (emailInput && !emailInput.value.trim()) emailInput.placeholder = `staff.${deptCode.toLowerCase()}@smartbio.edu.ng`;
      if (infoBox) infoBox.style.display = 'none';
    } else if (role === 'ADMIN') {
      const existingAdmins = (data.users || []).filter(u => u.identifier && u.identifier.startsWith('ADM/'));
      const nextSeq = String(existingAdmins.length + 1).padStart(3, '0');
      if (matricInput) matricInput.value = `ADM/2026/${nextSeq}`;
      if (emailInput && !emailInput.value.trim()) emailInput.placeholder = `admin@smartbio.edu.ng`;
      if (infoBox) infoBox.style.display = 'none';
    }
  }

  bindNavbarEvents() {
    // Role Pills in Top Bar
    document.querySelectorAll('.role-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.switchRole(pill.dataset.role);
      });
    });

    // Cloud Status Button
    const btnSync = document.getElementById('btnCloudSyncSettings');
    if (btnSync) {
      btnSync.addEventListener('click', () => this.openCloudModal());
    }

    // Auth Button in Top Bar (Opens Profile Modal if logged in, else Auth Modal)
    const btnAuth = document.getElementById('btnNavAuth');
    if (btnAuth) {
      btnAuth.addEventListener('click', () => {
        if (this.authenticatedUser) {
          this.openProfileModal();
        } else {
          this.openAuthModal('LOGIN');
        }
      });
    }
  }

  // =========================================================================
  // 1b. CLOUD SYNC & DIAGNOSTICS MODAL
  // =========================================================================
  bindCloudModalEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeCloudModal();
    });
  }

  // =========================================================================
  // Central Modal Manager (Scroll-locks body & manages active overlay state)
  // =========================================================================
  openModal(modalId) {
    const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (el) {
      el.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  closeModal(modalId) {
    const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (el) {
      el.classList.remove('active');
      if (!document.querySelector('.modal-overlay.active')) {
        document.body.classList.remove('modal-open');
      }
    }
  }

  openCloudModal() {
    this.openModal('cloudConfigModal');
    if (window.smartBioCloud) window.smartBioCloud.updateSyncUI();
  }

  closeCloudModal() {
    this.closeModal('cloudConfigModal');
  }

  async reconnectCloud() {
    this.showToast('Connecting to Google Cloud Firestore...', 'info');
    const success = await window.smartBioCloud.initializeFirebase();
    if (success) {
      window.smartBioAudio.playSuccessChime();
      this.showToast('🟢 Successfully connected to Cloud Firestore (Real-Time)', 'success');
    } else {
      window.smartBioAudio.playFlaggedWarning();
      this.showToast('Offline fallback: Operating with Local Relational Store', 'warning');
    }
  }

  // =========================================================================
  // 1c. AUTHENTICATION & ACCESS CONTROL METHODS
  // =========================================================================
  bindAuthEvents() {
    // Escape key to close auth modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAuthModal();
    });
  }

  openAuthModal(view = 'LOGIN') {
    this.populateDepartmentDropdowns();
    this.openModal('authModal');
    this.switchAuthView(view);
  }

  closeAuthModal() {
    this.closeModal('authModal');
  }

  switchAuthView(viewName) {
    const signInView = document.getElementById('authSignInView');
    const registerView = document.getElementById('authRegisterView');
    const resetView = document.getElementById('authResetView');

    if (signInView) signInView.style.display = viewName === 'LOGIN' ? 'block' : 'none';
    if (registerView) {
      registerView.style.display = viewName === 'REGISTER' ? 'block' : 'none';
      if (viewName === 'REGISTER') {
        this.populateDepartmentDropdowns();
        this.updateRegMatricPreview();
      }
    }
    if (resetView) resetView.style.display = viewName === 'RESET' ? 'block' : 'none';
  }

  fillDemoAuth(role) {
    const roleSelect = document.getElementById('loginRoleSelect');
    const emailInput = document.getElementById('loginEmailInput');
    const passwordInput = document.getElementById('loginPasswordInput');

    if (roleSelect) roleSelect.value = role;
    if (passwordInput) passwordInput.value = 'password123';

    if (role === 'LECTURER' && emailInput) {
      emailInput.value = 'o.adeyemi@smartbio.edu.ng';
    } else if (role === 'CLASS_REP' && emailInput) {
      emailInput.value = 'c.eze@student.gwu.edu';
    } else if (role === 'STUDENT' && emailInput) {
      emailInput.value = 'b.uche@student.gwu.edu';
    } else if (role === 'ADMIN' && emailInput) {
      emailInput.value = 'admin@smartbio.edu.ng';
    }

    this.showToast(`Auto-filled demo credentials for ${role}`, 'info');
  }

  togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btnEl) btnEl.innerText = '🙈';
    } else {
      input.type = 'password';
      if (btnEl) btnEl.innerText = '👁️';
    }
  }

  fillPasscode(code) {
    const passcodeInput = document.getElementById('regPasscodeInput');
    if (passcodeInput) {
      passcodeInput.value = code;
      this.showToast(`Passcode set to ${code}`, 'info');
    }
  }

  async handleSignIn(e) {
    e.preventDefault();
    const role = document.getElementById('loginRoleSelect').value;
    const identifier = document.getElementById('loginEmailInput').value.trim();
    const password = document.getElementById('loginPasswordInput').value;

    // Optional Firebase Auth sign-in if connected
    if (window.smartBioCloud.isConnected && window.smartBioCloud.auth && identifier.includes('@')) {
      try {
        await window.smartBioCloud.auth.signInWithEmailAndPassword(identifier, password);
        console.log('🔐 Authenticated with Firebase Auth:', identifier);
      } catch (authErr) {
        console.warn('Firebase Auth sign in notice (proceeding with local DB session):', authErr.message);
      }
    }

    // Find matching user in data store
    const users = window.smartBioData.getUsers();
    let user = users.find(u =>
      u.email.toLowerCase() === identifier.toLowerCase() ||
      u.identifier.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      // Fallback by role for instant access
      user = users.find(u => u.role === role) || users[0];
    }

    // === CRITICAL: Set authenticated session identity BEFORE switching view ===
    // Route guards, navbar badge and profile modal all key off authenticatedUser.
    // Never mutate this outside of explicit login / logout flows.
    this.authenticatedUser = user;
    this.currentUserId = user.id;
    try {
      localStorage.setItem('smartbio_logged_in_user', JSON.stringify(user));
    } catch (err) {}

    this.closeAuthModal();
    this.switchRole(user.role); // Open the view matching the user's own role

    window.smartBioAudio.playSuccessChime();
    this.showToast(`Welcome back, ${user.fullName}! Signed in as ${user.role}.`, 'success');
  }

  async handleSignUp(e) {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value.trim();
    const matricNo = document.getElementById('regMatricNo').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const role = document.getElementById('regRoleSelect').value;
    const departmentId = Number(document.getElementById('regDepartment').value);
    const academicLevel = document.getElementById('regLevel').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const passcodeInput = document.getElementById('regPasscodeInput');

    if (password !== confirmPassword) {
      this.showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    // RBAC GATEKEEPING: Verify Institutional Security Passcode for privileged roles
    if (role !== 'STUDENT') {
      const enteredPasscode = passcodeInput ? passcodeInput.value.trim() : '';
      const requiredPasscode = this.AUTH_PASSCODES[role];

      if (enteredPasscode !== requiredPasscode) {
        window.smartBioAudio.playFlaggedWarning();
        alert(`⛔ Unauthorized Role Access!\n\nTo register as a ${role}, you must provide the confidential Institutional Authorization Passcode.\n\n(Demo Passcode for ${role}: ${requiredPasscode})`);
        this.showToast(`Access Denied: Invalid passcode for ${role}`, 'error');
        return;
      }
    }

    // 1. Create account in Firebase Auth if cloud is connected
    if (window.smartBioCloud.isConnected && window.smartBioCloud.auth) {
      try {
        await window.smartBioCloud.auth.createUserWithEmailAndPassword(email, password);
        console.log('🔐 Created user in Firebase Auth:', email);
      } catch (authErr) {
        if (authErr.code !== 'auth/email-already-in-use') {
          console.warn('Firebase Auth creation notice:', authErr.message);
        }
      }
    }

    // 2. Add user to local data repository & cloud Firestore
    const data = window.smartBioData.load();
    const newUserId = data.users.length ? Math.max(...data.users.map(u => u.id)) + 1 : 1;

    let avatar = '🧑‍🎓';
    if (role === 'LECTURER') avatar = '👨‍🏫';
    if (role === 'ADMIN') avatar = '👨‍💼';
    if (role === 'CLASS_REP') avatar = '👥';

    const targetLevel = academicLevel === 'Faculty' ? null : Number(academicLevel);

    const newUser = {
      id: newUserId,
      identifier: matricNo,
      fullName: fullName,
      email: email,
      role: role,
      departmentId: departmentId,
      academicLevel: targetLevel,
      avatar: avatar,
      hasBiometrics: false,
      fingerTemplate: null
    };

    data.users.push(newUser);

    // 3. Auto-Enroll in departmental cohort courses
    let enrolledCoursesCount = 0;
    if (role === 'STUDENT' || role === 'CLASS_REP') {
      const matchingCourses = (data.courses || []).filter(c => c.departmentId === departmentId && (c.level === targetLevel || !targetLevel));
      let maxRegId = (data.courseRegistrations && data.courseRegistrations.length) ? Math.max(...data.courseRegistrations.map(r => r.id)) : 0;
      
      matchingCourses.forEach(c => {
        maxRegId++;
        data.courseRegistrations.push({
          id: maxRegId,
          studentId: newUserId,
          courseId: c.id,
          sessionId: 1
        });
        enrolledCoursesCount++;
      });
    }

    window.smartBioData.save(data);

    // If Firestore connected, sync user document
    if (window.smartBioCloud.isConnected && window.smartBioCloud.db) {
      try {
        await window.smartBioCloud.db.collection('users').doc(String(newUserId)).set(newUser);
      } catch (err) {
        console.warn('Cloud user sync notice:', err.message);
      }
    }

    this.currentUserId = newUserId;
    this.switchRole(role, newUserId);
    this.closeAuthModal();

    window.smartBioAudio.playSuccessChime();
    this.showToast(`Account registered with ID ${matricNo}! Auto-enrolled in ${enrolledCoursesCount} departmental courses.`, 'success');

    const enrollBiometricsChecked = document.getElementById('regEnrollBiometrics')?.checked;
    if (enrollBiometricsChecked) {
      setTimeout(() => {
        this.authenticatedUser = newUser;
        this.currentUserId = newUser.id;
        try {
          localStorage.setItem('smartbio_logged_in_user', JSON.stringify(newUser));
        } catch (err) {}
        this.switchRole(newUser.role);
        this.openProfileModal();
        this.showToast('Please complete your WebAuthn device passkey enrollment in your profile.', 'info');
      }, 600);
    }
  }

  handleSignOut() {
    // Sign out of Firebase Auth if connected
    if (window.smartBioCloud && window.smartBioCloud.auth && window.smartBioCloud.isConnected) {
      try { window.smartBioCloud.auth.signOut(); } catch (e) {}
    }
    
    // Clear Session
    this.authenticatedUser = null;
    this.currentUserId = null;
    localStorage.removeItem('smartbio_logged_in_user');
    
    window.smartBioAudio.playErrorBuzz();
    // Reset all role pills to visible for fresh login selection
    document.querySelectorAll('.role-pill').forEach(p => p.style.display = '');
    this.openAuthModal('LOGIN');
    this.showToast('Signed out. Select a profile to continue.', 'info');
  }

  handleResetPassword(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmailInput').value.trim();
    const role = document.getElementById('resetRoleSelect').value;

    this.showToast(`Password reset link dispatched to ${email} (${role})!`, 'success');
    this.switchAuthView('LOGIN');
  }

  async handleBiometricPasskeyLogin() {
    const role = document.getElementById('loginRoleSelect').value;
    try {
      this.showToast('Initiating WebAuthn FIDO2 Biometric Hardware Prompt...', 'info');
      if (window.smartBioBiometrics) {
        const user = window.smartBioData.getUsers().find(u => u.role === role) || window.smartBioData.getUsers()[0];
        const authResult = await window.smartBioBiometrics.authenticateWithWebAuthn(user);
        if (authResult) {
          this.currentUserId = user.id;
          this.switchRole(role, user.id);
          this.closeAuthModal();
          window.smartBioAudio.playSuccessChime();
          this.showToast(`Hardware WebAuthn Biometric Verified! Welcome ${user.fullName}.`, 'success');
          return;
        }
      }
    } catch (err) {
      console.warn('WebAuthn hardware prompt unavailable on this client:', err.message);
      this.showToast('No physical biometric sensor detected. Continuing with simulated biometric credentials.', 'warning');
    }
    // Fallback authentication
    this.fillDemoAuth(role);
    this.handleSignIn({ preventDefault: () => {} });
  }

  // 2. Global Event Listeners (Syncs across all views & devices)
  listenToGlobalEvents() {
    // When a scan happens anywhere (terminal, phone, or test)
    window.addEventListener('smartbio:attendance_stream', (e) => {
      this.handleIncomingAttendance(e.detail);
    });

    // When flagged exceptions change
    window.addEventListener('smartbio:flagged_update', () => {
      this.renderFlaggedQueue();
      if (this.currentRole === 'ADMIN') this.renderAdminPortal();
    });

    // When active lecture session state changes in Firestore Cloud or local bus
    window.addEventListener('smartbio:session_update', (e) => {
      const sessionData = e.detail;
      if (sessionData && sessionData.status === 'ACTIVE') {
        this.activeLectureSession = sessionData;
        try {
          localStorage.setItem('smartbio_active_session', JSON.stringify(sessionData));
        } catch (err) {}
        this.renderActiveSessionUI(sessionData);

        // If current role is student or class rep, notify with gentle alert
        if (this.currentView === 'STUDENT' || this.currentView === 'CLASS_REP') {
          window.smartBioAudio.playSuccessChime();
          const course = (window.smartBioData.load().courses || []).find(c => c.id === sessionData.courseId) || { code: 'CSC 401' };
          this.showToast(`🔔 Live Lecture Alert: ${course.code} is now in session at ${sessionData.venue}!`, 'info');
        }
      } else if (e.isExplicitEnd || (!sessionData && !this.activeLectureSession)) {
        this.activeLectureSession = null;
        try {
          localStorage.removeItem('smartbio_active_session');
        } catch (err) {}
        if (this.sessionTimerInterval) clearInterval(this.sessionTimerInterval);
        const banner = document.getElementById('liveSessionActiveBanner');
        const formBox = document.getElementById('lectureSessionConfigBox');
        if (banner) banner.classList.add('hidden');
        if (formBox) formBox.classList.remove('hidden');
        this.updateRoleSessionBanners(null);
      }
    });
  }

  handleIncomingAttendance(record) {
    if (!record) return;

    // If lecturer is viewing live radar, prepend to table
    const tableBody = document.getElementById('liveRadarTableBody');
    if (tableBody) {
      const student = window.smartBioData.getUserById(record.studentId);
      const tr = document.createElement('tr');
      tr.style.animation = 'fade-in 0.4s ease forwards';
      tr.innerHTML = `
        <td><strong class="font-mono">${student ? student.identifier : 'N/A'}</strong></td>
        <td>${student ? student.fullName : 'Student'}</td>
        <td><span class="badge ${record.status === 'PRESENT' ? 'badge-eligible' : 'badge-flagged'}">${record.status}</span></td>
        <td>${record.confidence}%</td>
        <td>${record.time || new Date().toLocaleTimeString()}</td>
      `;
      tableBody.insertBefore(tr, tableBody.firstChild);
    }

    // Refresh active view to reflect updated attendance percentages in real time
    if (this.currentView === 'LECTURER') {
      this.renderLecturerDefaulterTable();
    } else if (this.currentView === 'CLASS_REP') {
      this.renderClassRepPortal();
    } else if (this.currentView === 'STUDENT') {
      this.renderStudentPortal();
    } else if (this.currentView === 'ADMIN') {
      this.renderAdminPortal();
    }
  }

  // 3. Lecturer Portal Logic
  bindLecturerEvents() {
    const btnStartSession = document.getElementById('btnStartLectureSession');
    const btnEndSession = document.getElementById('btnEndLectureSession');

    if (btnStartSession) {
      btnStartSession.addEventListener('click', () => this.startActiveLectureSession());
    }
    if (btnEndSession) {
      btnEndSession.addEventListener('click', () => this.endActiveLectureSession());
    }
  }

  startActiveLectureSession() {
    const courseSelect = document.getElementById('lectureCourseSelect');
    const topicInput = document.getElementById('lectureTopicInput');
    const venueInput = document.getElementById('lectureVenueInput');

    const courseId = Number(courseSelect ? courseSelect.value : 1);
    const topic = topicInput && topicInput.value.trim() ? topicInput.value.trim() : 'Advanced Software Architecture & WebAuthn';
    const venue = venueInput && venueInput.value.trim() ? venueInput.value.trim() : 'ICT Hall A';
    const currentUser = window.smartBioData.getUserById(this.currentUserId) || { fullName: 'Dr. Olawale Adeyemi' };

    const startTimeMs = Date.now();
    this.activeLectureSession = {
      id: startTimeMs,
      startTimeMs: startTimeMs,
      courseId,
      lecturerId: this.currentUserId,
      lecturerName: currentUser.fullName,
      topic,
      venue,
      startTime: new Date().toLocaleTimeString(),
      status: 'ACTIVE'
    };

    // Save session to localStorage so page refresh preserves live state and timer
    try {
      localStorage.setItem('smartbio_active_session', JSON.stringify(this.activeLectureSession));
    } catch (e) {
      console.warn('Storage persistence notice:', e);
    }

    // Broadcast to Cloud Firestore & local event bus for zero-latency detection
    window.smartBioCloud.broadcastActiveSession(this.activeLectureSession);
    window.dispatchEvent(new CustomEvent('smartbio:session_update', { detail: this.activeLectureSession }));

    this.renderActiveSessionUI(this.activeLectureSession);

    // Audit log with actorId
    window.smartBioData.addAuditLog({
      actorId: this.currentUserId,
      actor: currentUser.fullName,
      action: 'SESSION_START',
      details: `Started lecture session for course #${courseId} (${topic}) at ${venue}`,
      time: new Date().toLocaleString()
    });

    this.showToast('Live Lecture Session is now ACTIVE & Streaming to Cloud', 'success');
  }

  renderActiveSessionUI(session) {
    if (!session || session.status !== 'ACTIVE') return;

    const banner = document.getElementById('liveSessionActiveBanner');
    const formBox = document.getElementById('lectureSessionConfigBox');
    if (banner) banner.classList.remove('hidden');
    if (formBox) formBox.classList.add('hidden');

    const titleEl = document.getElementById('activeSessionTitle');
    const venueEl = document.getElementById('activeSessionVenue');
    const courseCodeEl = document.getElementById('activeSessionCourseCode');
    const course = (window.smartBioData.load().courses || []).find(c => c.id === session.courseId) || { code: 'CSC 401', title: 'Advanced Software Engineering' };

    if (titleEl) titleEl.innerText = session.topic;
    if (venueEl) venueEl.innerText = session.venue;
    if (courseCodeEl) courseCodeEl.innerText = course.code;

    // Calculate elapsed duration accurately across page refreshes
    const startMs = session.startTimeMs || session.id || Date.now();
    this.sessionSecondsElapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    
    const updateTimer = () => {
      const mins = String(Math.floor(this.sessionSecondsElapsed / 60)).padStart(2, '0');
      const secs = String(this.sessionSecondsElapsed % 60).padStart(2, '0');
      const timerEl = document.getElementById('activeSessionTimer');
      if (timerEl) timerEl.innerText = `${mins}:${secs}`;
    };
    updateTimer();

    if (this.sessionTimerInterval) clearInterval(this.sessionTimerInterval);
    this.sessionTimerInterval = setInterval(() => {
      this.sessionSecondsElapsed++;
      updateTimer();
    }, 1000);

    // Update in-session banners in Student & Class Rep portals
    this.updateRoleSessionBanners(session, course);
  }

  updateRoleSessionBanners(session, course) {
    const studentBanner = document.getElementById('studentLiveSessionBanner');
    const repBanner = document.getElementById('repLiveSessionBanner');

    if (session && session.status === 'ACTIVE') {
      const c = course || (window.smartBioData.load().courses || []).find(item => item.id === session.courseId) || { code: 'CSC 401', title: 'Advanced Software Engineering' };
      
      if (studentBanner) {
        studentBanner.classList.remove('hidden');
        const cCode = document.getElementById('studentActiveCourseCode');
        const topic = document.getElementById('studentActiveTopic');
        const lect = document.getElementById('studentActiveLecturer');
        const ven = document.getElementById('studentActiveVenue');
        if (cCode) cCode.innerText = c.code;
        if (topic) topic.innerText = session.topic || c.title;
        if (lect) lect.innerText = session.lecturerName || 'Dr. Olawale Adeyemi';
        if (ven) ven.innerText = session.venue || 'ICT Hall A';
      }

      if (repBanner) {
        repBanner.classList.remove('hidden');
        const cCode = document.getElementById('repActiveCourseCode');
        const topic = document.getElementById('repActiveTopic');
        const lect = document.getElementById('repActiveLecturer');
        const ven = document.getElementById('repActiveVenue');
        if (cCode) cCode.innerText = c.code;
        if (topic) topic.innerText = session.topic || c.title;
        if (lect) lect.innerText = session.lecturerName || 'Dr. Olawale Adeyemi';
        if (ven) ven.innerText = session.venue || 'ICT Hall A';
      }
    } else {
      if (studentBanner) studentBanner.classList.add('hidden');
      if (repBanner) repBanner.classList.add('hidden');
    }
  }

  endActiveLectureSession() {
    if (this.sessionTimerInterval) clearInterval(this.sessionTimerInterval);
    const currentUser = window.smartBioData.getUserById(this.currentUserId) || { fullName: 'Dr. Olawale Adeyemi' };

    // Clear active session from localStorage, Cloud Firestore & local event bus
    try {
      localStorage.removeItem('smartbio_active_session');
    } catch (e) {}

    window.smartBioCloud.endActiveSessionCloud();
    window.dispatchEvent(new CustomEvent('smartbio:session_update', { detail: null, isExplicitEnd: true }));
    this.activeLectureSession = null;

    const banner = document.getElementById('liveSessionActiveBanner');
    const formBox = document.getElementById('lectureSessionConfigBox');
    if (banner) banner.classList.add('hidden');
    if (formBox) formBox.classList.remove('hidden');

    this.updateRoleSessionBanners(null);

    window.smartBioData.addAuditLog({
      actorId: this.currentUserId,
      actor: currentUser.fullName,
      action: 'SESSION_END',
      details: `Concluded live lecture session`,
      time: new Date().toLocaleString()
    });

    this.showToast('Lecture Session concluded and saved.', 'info');
  }

  renderLecturerPortal() {
    const data = window.smartBioData.load();
    const user = this.authenticatedUser;
    const lecturer = (user && user.role === 'LECTURER') ? user : (window.smartBioData.getUserById(2) || { fullName: 'Dr. Olawale Adeyemi', departmentId: 1 });
    
    const nameEl = document.getElementById('lecturerWelcomeName');
    const deptEl = document.getElementById('lecturerDeptName');
    if (nameEl) nameEl.innerText = lecturer.fullName;
    if (deptEl) {
      const dept = (data.departments || []).find(d => d.id === lecturer.departmentId) || { name: 'Computer Science & Software Engineering' };
      deptEl.innerText = `Dept of ${dept.name}`;
    }

    if (this.activeLectureSession && this.activeLectureSession.status === 'ACTIVE') {
      this.renderActiveSessionUI(this.activeLectureSession);
    }

    this.populateDefaulterCourseDropdown();
    this.renderLiveAttendanceStream();
    this.renderFlaggedQueue();
    this.renderLecturerDefaulterTable();
  }

  renderLiveAttendanceStream() {
    const tableBody = document.getElementById('liveRadarTableBody');
    if (!tableBody) return;

    const data = window.smartBioData.load();
    const records = (data.attendanceRecords || []).slice(-8).reverse();

    if (records.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">
            📡 Radar Active — No attendance scans recorded yet for this session.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    records.forEach(r => {
      const student = window.smartBioData.getUserById(r.studentId) || { fullName: 'Student', identifier: 'GWU/CSC/22/001' };
      const scanTime = r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (r.time || '09:00 AM');
      html += `
        <tr>
          <td><strong class="font-mono">${student.identifier}</strong></td>
          <td>${student.fullName}</td>
          <td><span class="badge ${r.status === 'PRESENT' ? 'badge-eligible' : 'badge-flagged'}">${r.status}</span></td>
          <td>${r.confidence || 98.4}%</td>
          <td>${scanTime}</td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;
  }

  populateDefaulterCourseDropdown() {
    const select = document.getElementById('defaulterCourseSelect');
    if (!select) return;

    const data = window.smartBioData.load();
    const courses = data.courses || [];
    const currentVal = select.value;

    let html = '';
    courses.forEach(c => {
      html += `<option value="${c.id}">${c.code} — ${c.title}</option>`;
    });
    select.innerHTML = html;
    if (currentVal && courses.some(c => String(c.id) === String(currentVal))) {
      select.value = currentVal;
    }
  }

  renderFlaggedQueue() {
    const container = document.getElementById('flaggedQueueContainer');
    if (!container) return;

    const flags = window.smartBioData.getFlagged();
    const countBadge = document.getElementById('flaggedCountBadge');
    if (countBadge) countBadge.innerText = `${flags.length} Pending`;

    if (flags.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-dim);">
          <div style="font-size: 28px; margin-bottom: 6px;">✨</div>
          <p>No flagged exception cases pending review.</p>
        </div>
      `;
      return;
    }

    let html = '';
    flags.forEach(flag => {
      const student = window.smartBioData.getUserById(flag.studentId) || { fullName: 'Student', identifier: 'GWU/CSC/22/052' };
      html += `
        <div class="flagged-card">
          <div class="flagged-student-info">
            <div class="student-avatar-box">${student.fullName.charAt(0)}</div>
            <div class="flagged-details">
              <h4>${student.fullName}</h4>
              <p class="font-mono">${student.identifier} • Match Conf: <span class="text-warning">${flag.capturedConfidence}%</span></p>
              <span class="flag-tag">⚠️ ${flag.flagReason || 'UNREADABLE_RIDGE'}</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-success" onclick="smartBioApp.openResolveModal(${flag.id})">
              Review & Override
            </button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  openResolveModal(flagId) {
    const flag = window.smartBioData.getFlagged().find(f => f.id === flagId);
    if (!flag) return;
    const student = window.smartBioData.getUserById(flag.studentId);

    const nameEl = document.getElementById('resolveStudentName');
    const matricEl = document.getElementById('resolveStudentMatric');
    const reasonEl = document.getElementById('resolveFlagReason');
    const flagIdInput = document.getElementById('resolveFlagId');

    if (nameEl) nameEl.innerText = student ? student.fullName : 'Unknown';
    if (matricEl) matricEl.innerText = student ? student.identifier : 'N/A';
    if (reasonEl) reasonEl.innerText = flag.flagReason;
    if (flagIdInput) flagIdInput.value = flag.id;

    this.openModal('flagResolveModal');
  }

  closeResolveModal() {
    this.closeModal('flagResolveModal');
  }

  submitResolveOverride(action) {
    const flagIdInput = document.getElementById('resolveFlagId');
    const noteInput = document.getElementById('resolveLecturerNote');
    const flagId = Number(flagIdInput ? flagIdInput.value : 0);
    const note = noteInput ? noteInput.value.trim() : '';

    if (!flagId) return;

    window.smartBioCloud.resolveFlaggedException(flagId, this.currentUserId, action, note);
    this.closeResolveModal();
    this.showToast(action === 'APPROVE' ? 'Flag override approved! Attendance credited.' : 'Flag rejected.', action === 'APPROVE' ? 'success' : 'warning');
    
    // Refresh views
    this.renderFlaggedQueue();
    this.renderLecturerDefaulterTable();
  }

  renderLecturerDefaulterTable() {
    const tableBody = document.getElementById('defaultersTableBody');
    if (!tableBody) return;

    const data = window.smartBioData.load();
    const select = document.getElementById('defaulterCourseSelect');
    const selectedCourseId = select && select.value ? Number(select.value) : (data.courses[0] ? data.courses[0].id : 1);

    const course = (data.courses || []).find(c => c.id === selectedCourseId) || { code: 'CSC 401', minAttendancePct: 75 };
    const courseTitleEl = document.getElementById('lecturerDefaulterCourseCode');
    if (courseTitleEl) courseTitleEl.innerText = course.code;

    const students = (data.users || []).filter(u => u.role === 'STUDENT' || u.role === 'CLASS_REP');
    
    let totalConducted = 0;
    let html = '';

    students.forEach(student => {
      const comp = window.smartBioCompliance.calculateStudentCompliance(student.id);
      if (!comp || !comp.courseStats || comp.courseStats.length === 0) return;
      const stat = comp.courseStats.find(cs => cs.courseId === selectedCourseId) || comp.courseStats[0];

      if (stat.totalHeld > totalConducted) totalConducted = stat.totalHeld;

      html += `
        <tr>
          <td><strong class="font-mono">${student.identifier}</strong></td>
          <td>${student.fullName}</td>
          <td>${stat.attended} / ${stat.totalHeld}</td>
          <td><strong>${stat.percentage}%</strong></td>
          <td><span class="badge ${stat.statusClass}">${stat.badgeLabel}</span></td>
          <td>
            ${stat.status === 'ELIGIBLE' 
              ? '<span class="text-success font-bold">✓ Cleared</span>' 
              : `<span class="text-danger font-bold">Needs +${stat.classesNeeded} classes</span>`}
          </td>
        </tr>
      `;
    });

    if (!html) {
      html = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No students enrolled in ${course.code} yet.</td></tr>`;
    }

    const metaEl = document.getElementById('lecturerDefaulterSubMeta');
    if (metaEl) {
      metaEl.innerText = `Real-time calculation based on ${totalConducted} conducted lecture(s) • NUC Statutory Min: ${course.minAttendancePct || 75}%`;
    }

    tableBody.innerHTML = html;
  }

  // 3b. Class Representative Portal Logic
  bindClassRepEvents() {
    const btnLaunchKiosk = document.getElementById('btnRepLaunchKiosk');
    const btnBroadcast = document.getElementById('btnRepBroadcastAlert');
    const btnDocket = document.getElementById('btnRepOpenDocketModal');

    if (btnLaunchKiosk) {
      btnLaunchKiosk.addEventListener('click', () => {
        this.switchRole('SCANNER');
        this.showToast('Classroom Kiosk launched for student check-ins', 'info');
      });
    }

    if (btnBroadcast) {
      btnBroadcast.addEventListener('click', () => {
        window.smartBioAudio.playFlaggedWarning();
        this.showToast('📢 NUC 75% Defaulter Warning Broadcasted to Course Roster!', 'warning');
      });
    }

    if (btnDocket) {
      btnDocket.addEventListener('click', () => {
        this.openDocketModal();
      });
    }
  }

  populateRepCourseDropdown(rep) {
    const select = document.getElementById('repCourseFilterSelect');
    if (!select) return;

    const data = window.smartBioData.load();
    const courses = data.courses || [];
    const currentVal = select.value;

    let html = '';
    courses.forEach(c => {
      html += `<option value="${c.id}">${c.code} — ${c.title}</option>`;
    });
    select.innerHTML = html;
    if (currentVal && courses.some(c => String(c.id) === String(currentVal))) {
      select.value = currentVal;
    }
  }

  renderClassRepPortal() {
    const user = this.authenticatedUser;
    const rep = (user && user.role === 'CLASS_REP') ? user : (window.smartBioData.getUserById(6) || { fullName: 'Chukwudi Eze', departmentId: 1, academicLevel: '400' });
    const nameEl = document.getElementById('classRepWelcomeName');
    if (nameEl) nameEl.innerText = `${rep.fullName} (Class Rep)`;

    const data = window.smartBioData.load();
    const dept = (data.departments || []).find(d => d.id === rep.departmentId) || { name: 'Computer Science & Software Eng.', code: 'CSC' };
    const cohortEl = document.getElementById('classRepCohortBadge');
    if (cohortEl) cohortEl.innerText = `${dept.name} ${rep.academicLevel ? rep.academicLevel + 'L' : '400L'}`;

    this.populateRepCourseDropdown(rep);

    const select = document.getElementById('repCourseFilterSelect');
    const selectedCourseId = select && select.value ? Number(select.value) : (data.courses[0] ? data.courses[0].id : 1);
    const course = (data.courses || []).find(c => c.id === selectedCourseId) || (data.courses[0] || { code: 'CSC 401' });

    const courseHeadingEl = document.getElementById('repDefaulterCourseCode');
    if (courseHeadingEl) courseHeadingEl.innerText = course.code;

    const repStatMeta = document.getElementById('repStatMetaCourse');
    if (repStatMeta) repStatMeta.innerText = `${course.code} Cohort`;

    const students = data.users.filter(u => u.role === 'STUDENT' || u.role === 'CLASS_REP');
    
    let presentCount = 0;
    let atRiskCount = 0;

    const tableBody = document.getElementById('repDefaultersTableBody');
    let html = '';

    students.forEach(student => {
      const comp = window.smartBioCompliance.calculateStudentCompliance(student.id);
      if (!comp || !comp.courseStats || comp.courseStats.length === 0) return;
      const stat = comp.courseStats.find(cs => cs.courseId === selectedCourseId) || comp.courseStats[0];

      if (stat.status === 'ELIGIBLE') presentCount++;
      if (stat.status === 'AT_RISK' || stat.status === 'INELIGIBLE') atRiskCount++;

      html += `
        <tr>
          <td><strong class="font-mono">${student.identifier}</strong></td>
          <td>${student.fullName}</td>
          <td>${stat.attended} / ${stat.totalHeld}</td>
          <td><strong>${stat.percentage}%</strong></td>
          <td><span class="badge ${stat.statusClass}">${stat.badgeLabel}</span></td>
          <td>
            ${stat.status === 'ELIGIBLE' 
              ? '<span class="text-success font-bold">✓ In Good Standing</span>' 
              : `<span class="text-warning font-bold">⚠️ Must attend next ${stat.classesNeeded} classes</span>`}
          </td>
        </tr>
      `;
    });

    if (!html) {
      html = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No students enrolled in ${course.code} yet.</td></tr>`;
    }

    if (this.activeLectureSession && this.activeLectureSession.status === 'ACTIVE') {
      this.updateRoleSessionBanners(this.activeLectureSession);
    }

    const totalEnrolledEl = document.getElementById('repStatEnrolled');
    const totalPresentEl = document.getElementById('repStatPresent');
    const totalAtRiskEl = document.getElementById('repStatAtRisk');

    if (totalEnrolledEl) totalEnrolledEl.innerText = students.length;
    if (totalPresentEl) totalPresentEl.innerText = presentCount;
    if (totalAtRiskEl) totalAtRiskEl.innerText = atRiskCount;
    if (tableBody) tableBody.innerHTML = html;
  }

  // 4. Student Portal Logic
  bindStudentEvents() {
    const btnDocket = document.getElementById('btnOpenDocketModal');
    const btnPrint = document.getElementById('btnPrintDocketAction');

    if (btnDocket) {
      btnDocket.addEventListener('click', () => this.openDocketModal());
    }
    if (btnPrint) {
      btnPrint.addEventListener('click', () => this.printDocket());
    }
  }

  printDocket() {
    document.body.classList.add('printing-docket');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-docket');
    }, 1500);
  }

  populateStudentHistoryCourseDropdown(studentId) {
    const select = document.getElementById('studentHistoryCourseSelect');
    if (!select) return;

    const data = window.smartBioData.load();
    const courses = data.courses || [];
    const currentVal = select.value;

    let html = '<option value="ALL">All Enrolled Courses</option>';
    courses.forEach(c => {
      html += `<option value="${c.id}">${c.code} — ${c.title}</option>`;
    });
    select.innerHTML = html;
    if (currentVal && (currentVal === 'ALL' || courses.some(c => String(c.id) === String(currentVal)))) {
      select.value = currentVal;
    }
  }

  renderStudentPortal() {
    const user = this.authenticatedUser;
    const student = (user && (user.role === 'STUDENT' || user.role === 'CLASS_REP')) ? user : (window.smartBioData.getUserById(4) || window.smartBioData.getUsers().find(u => u.role === 'STUDENT'));
    
    const nameEl = document.getElementById('studentWelcomeName');
    const matricEl = document.getElementById('studentMatricBadge');
    const deptBadgeEl = document.getElementById('studentDeptBadge');

    if (nameEl) nameEl.innerText = student.fullName;
    if (matricEl) matricEl.innerText = student.identifier;

    const data = window.smartBioData.load();
    const dept = (data.departments || []).find(d => d.id === student.departmentId) || { name: 'Computer Science & Software Eng.', code: 'CSC' };
    if (deptBadgeEl) deptBadgeEl.innerText = `${dept.name} • ${student.academicLevel ? student.academicLevel + 'L' : '400L'}`;

    // Render course attendance cards
    const compliance = window.smartBioCompliance.calculateStudentCompliance(student.id);
    const gaugeGrid = document.getElementById('studentCourseGaugeGrid');
    if (gaugeGrid && compliance) {
      let html = '';
      compliance.courseStats.forEach(stat => {
        let fillClass = 'fill-eligible';
        if (stat.status === 'AT_RISK') fillClass = 'fill-at-risk';
        if (stat.status === 'INELIGIBLE') fillClass = 'fill-ineligible';

        html += `
          <div class="course-gauge-card">
            <div>
              <div class="gauge-header">
                <div class="gauge-header-info">
                  <h3>${stat.course.code}</h3>
                  <span class="course-title-label">${stat.course.title}</span>
                </div>
                <span class="badge ${stat.statusClass}">${stat.badgeLabel}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 10px;">
                <span class="text-muted">Conducted: ${stat.totalHeld}</span>
                <span class="text-muted">Attended: <strong>${stat.attended}</strong></span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill ${fillClass}" style="width: ${stat.percentage}%"></div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 14px;">
              <span style="font-size: 1.4rem; font-weight: 800;">${stat.percentage}%</span>
              <span style="font-size: 0.75rem; color: ${stat.status === 'ELIGIBLE' ? 'var(--success)' : 'var(--danger)'}">
                ${stat.status === 'ELIGIBLE' ? 'NUC 75% Mandate Met' : `Deficit: Attend next ${stat.classesNeeded} classes`}
              </span>
            </div>
          </div>
        `;
      });
      gaugeGrid.innerHTML = html;
    }

    if (this.activeLectureSession && this.activeLectureSession.status === 'ACTIVE') {
      this.updateRoleSessionBanners(this.activeLectureSession);
    }

    // Populate course dropdown for history & render lecture log
    this.populateStudentHistoryCourseDropdown(student.id);
    this.renderStudentLectureLog(student.id);
  }

  renderStudentLectureLog(studentId) {
    const tableBody = document.getElementById('studentLectureLogTableBody');
    if (!tableBody) return;

    const data = window.smartBioData.load();
    const select = document.getElementById('studentHistoryCourseSelect');
    const selectedCourseVal = select ? select.value : 'ALL';

    const courseHeadingEl = document.getElementById('studentHistoryCourseCode');
    if (courseHeadingEl) {
      if (selectedCourseVal === 'ALL' || !selectedCourseVal) {
        courseHeadingEl.innerText = 'All Courses';
      } else {
        const c = (data.courses || []).find(item => item.id === Number(selectedCourseVal));
        courseHeadingEl.innerText = c ? c.code : 'All Courses';
      }
    }

    let sessions = data.lectureSessions || [];
    if (selectedCourseVal && selectedCourseVal !== 'ALL') {
      sessions = sessions.filter(s => s.courseId === Number(selectedCourseVal));
    }

    if (sessions.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
            No lecture sessions held for this course yet.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    sessions.forEach(session => {
      const record = (data.attendanceRecords || []).find(a => a.sessionId === session.id && a.studentId === Number(studentId));
      const isPresent = record && (record.status === 'PRESENT' || record.status === 'FLAGGED_RESOLVED');
      const course = (data.courses || []).find(c => c.id === session.courseId) || { code: 'CSC 401' };

      html += `
        <tr>
          <td><strong class="font-mono">#${session.id}</strong> <span class="badge badge-eligible" style="font-size:0.68rem; margin-left:4px;">${course.code}</span></td>
          <td><strong>${session.topic}</strong></td>
          <td>${session.venue}</td>
          <td>${session.timestamp || 'Today, 09:00 AM'}</td>
          <td>
            <span class="badge ${isPresent ? 'badge-eligible' : 'badge-ineligible'}">
              ${isPresent ? '✓ PRESENT' : '✗ ABSENT'}
            </span>
          </td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${record ? (record.method || 'Biometric WebAuthn') : '—'}</td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;
  }

  openDocketModal() {
    const data = window.smartBioData.load();
    let student = window.smartBioData.getUserById(this.currentUserId);
    if (!student || (student.role !== 'STUDENT' && student.role !== 'CLASS_REP')) {
      student = (data.users || []).find(u => u.role === 'STUDENT') || { id: 4 };
    }
    const container = document.getElementById('docketRenderContainer');
    if (container && student) {
      container.innerHTML = window.smartBioCompliance.renderClearanceDocket(student.id);
    }
    this.openModal('docketModal');
  }

  closeDocketModal() {
    this.closeModal('docketModal');
  }

  // 5. Admin Portal Logic
  bindAdminEvents() {
    const btnReset = document.getElementById('btnAdminResetDB');
    const btnExportSQL = document.getElementById('btnAdminExportSQL');
    const btnSeedCloud = document.getElementById('btnAdminSeedCloud');

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Reset entire database to initial academic seeds?')) {
          window.smartBioData.resetToSeeds();
          this.renderAdminPortal();
          this.showToast('Database reset to seeds successfully', 'success');
        }
      });
    }

    if (btnExportSQL) {
      btnExportSQL.addEventListener('click', () => {
        const sql = window.smartBioData.generateSQLDump();
        const blob = new Blob([sql], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartbio_gwu_dump_${Date.now()}.sql`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('SQL DDL Dump generated & downloaded', 'success');
      });
    }

    if (btnSeedCloud) {
      btnSeedCloud.addEventListener('click', () => this.seedCloudFirestore());
    }
  }

  async seedCloudFirestore() {
    this.showToast('Uploading GWU courses, users & departments to Google Cloud Firestore...', 'info');
    try {
      const success = await window.smartBioCloud.seedCloudDatabase();
      if (success) {
        window.smartBioAudio.playSuccessChime();
        this.showToast('✅ Google Cloud Firestore populated with live university records!', 'success');
      }
    } catch (e) {
      console.error(e);
      alert(`Cloud Seeding Notice:\n${e.message}`);
      this.showToast(e.message, 'error');
    }
  }

  renderAdminPortal() {
    const data = window.smartBioData.load();

    // Metric counters
    const totalStudentsEl = document.getElementById('adminStatTotalStudents');
    const totalLecturersEl = document.getElementById('adminStatTotalLecturers');
    const totalCoursesEl = document.getElementById('adminStatTotalCourses');
    const totalSessionsEl = document.getElementById('adminStatTotalSessions');

    if (totalStudentsEl) totalStudentsEl.innerText = data.users.filter(u => u.role === 'STUDENT' || u.role === 'CLASS_REP').length;
    if (totalLecturersEl) totalLecturersEl.innerText = data.users.filter(u => u.role === 'LECTURER').length;
    if (totalCoursesEl) totalCoursesEl.innerText = data.courses.length;
    if (totalSessionsEl) totalSessionsEl.innerText = data.lectureSessions.length;

    // Dynamic Meta Subtitles
    const metaStudentsEl = document.getElementById('adminStatMetaStudents');
    const metaCoursesEl = document.getElementById('adminStatMetaCourses');
    const metaSessionsEl = document.getElementById('adminStatMetaSessions');
    const sessionLabelEl = document.getElementById('adminActiveSessionLabel');
    const semesterLabelEl = document.getElementById('adminActiveSemesterLabel');

    if (metaStudentsEl) metaStudentsEl.innerText = `Across ${(data.departments || []).length} Academic Departments`;
    if (metaCoursesEl) metaCoursesEl.innerText = `${(data.courses || []).length} Accredited Offerings`;

    const totalRecs = (data.attendanceRecords || []).length;
    const presentRecs = (data.attendanceRecords || []).filter(r => r.status === 'PRESENT' || r.status === 'FLAGGED_RESOLVED').length;
    const avgPct = totalRecs ? Math.round((presentRecs / totalRecs) * 100) : 86;
    if (metaSessionsEl) metaSessionsEl.innerText = `Average Att. ${avgPct}%`;

    const session = (data.sessions || []).find(s => s.isCurrent) || { name: '2025/2026' };
    const semester = (data.semesters || []).find(s => s.isActive) || { type: 'SECOND' };
    if (sessionLabelEl) sessionLabelEl.innerText = session.name;
    if (semesterLabelEl) semesterLabelEl.innerText = `${semester.type === 'SECOND' ? 'Second' : 'First'} Semester`;

    // 0. Departments table
    this.renderAdminDepartments(data);

    // 1. Course Governance Table
    const coursesTableBody = document.getElementById('adminCoursesTableBody');
    if (coursesTableBody) {
      let html = '';
      (data.courses || []).forEach(c => {
        const dept = (data.departments || []).find(d => d.id === c.departmentId) || { code: 'CSC' };
        const lecturer = (data.users || []).find(u => u.id === c.lecturerId) || { fullName: 'Unassigned Faculty' };
        html += `
          <tr>
            <td><strong class="font-mono">${c.code}</strong></td>
            <td><strong>${c.title}</strong></td>
            <td><span class="badge badge-eligible">${dept.code}</span></td>
            <td>${c.level}L</td>
            <td>${c.units} Units</td>
            <td>
              <span class="text-primary font-bold">👨‍🏫 ${lecturer.fullName}</span>
            </td>
            <td><strong class="text-warning">${c.minAttendancePct || 75}%</strong></td>
            <td>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="smartBioApp.openReassignCourseModal(${c.id})" style="padding: 4px 8px; font-size: 0.72rem; border-color: var(--primary); color: var(--primary);">
                  🔄 Reassign Owner
                </button>
                <button class="btn btn-danger btn-sm" onclick="smartBioApp.handleAdminDeleteCourse(${c.id})" style="padding: 4px 8px; font-size: 0.72rem;">
                  🗑️ Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      });
      coursesTableBody.innerHTML = html;
    }

    // 2. Users directory table with administrative governance
    const usersTableBody = document.getElementById('adminUsersTableBody');
    if (usersTableBody) {
      let html = '';
      data.users.forEach(u => {
        const dept = (data.departments || []).find(d => d.id === u.departmentId) || { code: 'CSC' };
        const isEnrolled = u.hasBiometrics;
        html += `
          <tr>
            <td><strong class="font-mono">${u.identifier}</strong></td>
            <td>${u.avatar || '👤'} ${u.fullName}</td>
            <td>
              <span class="badge ${u.role === 'ADMIN' ? 'badge-flagged' : (u.role === 'LECTURER' ? 'badge-eligible' : (u.role === 'CLASS_REP' ? 'badge-warning' : 'badge-at-risk'))}">
                ${u.role}
              </span>
            </td>
            <td>${dept.code} • ${u.academicLevel ? `${u.academicLevel}L` : 'Faculty / Staff'}</td>
            <td>
              <span class="badge ${isEnrolled ? 'badge-eligible' : 'badge-ineligible'}">
                ${isEnrolled ? '✓ ENROLLED' : '⚠️ PENDING'}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${u.role === 'STUDENT' ? `
                  <button class="btn btn-secondary btn-sm" onclick="smartBioApp.handleAdminToggleUserRole(${u.id})" style="padding: 3px 8px; font-size: 0.72rem;">
                    👑 Make Class Rep
                  </button>
                ` : ''}
                ${u.role === 'CLASS_REP' ? `
                  <button class="btn btn-secondary btn-sm" onclick="smartBioApp.handleAdminToggleUserRole(${u.id})" style="padding: 3px 8px; font-size: 0.72rem;">
                    🎓 Revert to Student
                  </button>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="smartBioApp.handleAdminResetBiometrics(${u.id})" style="padding: 3px 8px; font-size: 0.72rem;">
                  🔄 Reset Biometrics
                </button>
              </div>
            </td>
          </tr>
        `;
      });
      usersTableBody.innerHTML = html;
    }

    // 3. Audit trail table
    const auditTableBody = document.getElementById('adminAuditTableBody');
    if (auditTableBody) {
      let html = '';
      data.auditLogs.slice().reverse().slice(0, 15).forEach(log => {
        html += `
          <tr>
            <td><strong class="font-mono">${log.time}</strong></td>
            <td>${log.actor}</td>
            <td><span class="badge badge-flagged">${log.action}</span></td>
            <td>${log.details}</td>
          </tr>
        `;
      });
      auditTableBody.innerHTML = html;
    }
  }

  async cleanFirestoreData() {
    if (!confirm('🧹 Clean Firestore Test Records?\n\nThis will purge transient test attendance scans and test flags, while retaining and normalizing all authentic user accounts, courses, and departments with clean system unique IDs.')) {
      return;
    }

    this.showToast('🧹 Purging test records & normalizing Firestore documents...', 'info');
    try {
      await window.smartBioCloud.cleanFirestoreAndNormalizeUniqueIds();
      window.smartBioAudio.playSuccessChime();
      this.showToast('✅ Google Cloud Firestore sanitized & normalized with unique IDs!', 'success');
    } catch (err) {
      console.error(err);
      this.showToast(`Clean Firestore Notice: ${err.message}`, 'error');
    }
  }

  // 6. Scanner Terminal Logic
  bindScannerEvents() {
    const platen = document.getElementById('opticalPlaten');
    if (platen) {
      platen.addEventListener('click', () => this.runTerminalScan('NORMAL'));
    }

    // Hardware Simulation Action Buttons
    document.querySelectorAll('.btn-sim-test').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.simMode;
        const studentId = Number(btn.dataset.studentId || 4);
        this.runTerminalScan(mode, studentId);
      });
    });

    // WebAuthn Browser Biometrics Trigger
    const btnWebAuthn = document.getElementById('btnTriggerWebAuthn');
    if (btnWebAuthn) {
      btnWebAuthn.addEventListener('click', async () => {
        try {
          const user = window.smartBioData.getUserById(4); // Benedict
          const res = await window.smartBioBiometric.authenticateWithWebAuthn(user);
          if (res && res.success) {
            window.smartBioAudio.playSuccessChime();
            this.showToast('WebAuthn Authenticator Verified Successfully!', 'success');
            const activeSess = this.activeLectureSession;
            window.smartBioCloud.recordAttendance({
              sessionId: activeSess ? activeSess.id : 10,
              courseId: activeSess ? activeSess.courseId : 1,
              studentId: user.id,
              method: 'WEBAUTHN_BIOMETRIC',
              confidence: 99.8,
              status: 'PRESENT',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }
        } catch (e) {
          this.showToast('WebAuthn verification cancelled or unavailable on device', 'warning');
        }
      });
    }
  }

  renderScannerTerminal() {
    if (this.activeLectureSession) {
      const course = (window.smartBioData.load().courses || []).find(c => c.id === this.activeLectureSession.courseId) || { code: 'CSC 401' };
      this.updateScannerHUD('ACTIVE SESSION DETECTED', `Streaming attendance for ${course.code} (${this.activeLectureSession.venue})`);
    } else {
      this.updateScannerHUD('SYSTEM READY', 'Waiting for student fingerprint touch on platen...');
    }
  }

  async runTerminalScan(mode = 'NORMAL', studentId = 4) {
    this.updateScannerHUD('SCANNING...', 'Extracting optical ridge patterns & minutiae points...');
    
    const activeSess = this.activeLectureSession;
    const currentSessionId = activeSess ? activeSess.id : 10;
    const currentCourseId = activeSess ? activeSess.courseId : 1;

    const result = await window.smartBioBiometric.simulateOpticalScan({
      studentId,
      testMode: mode,
      sessionId: currentSessionId
    });

    if (!result) return;

    if (result.status === 'PRESENT') {
      this.updateScannerHUD('VERIFIED (MATCH 99%)', `${result.student.fullName} (${result.student.identifier}) verified. Attendance logged.`);
      window.smartBioCloud.recordAttendance({
        sessionId: currentSessionId,
        courseId: currentCourseId,
        studentId: result.student.id,
        method: result.method,
        confidence: Number(result.confidence),
        status: 'PRESENT',
        time: result.timestamp
      });
    } else if (result.status === 'FLAGGED') {
      this.updateScannerHUD('FLAGGED EXCEPTION', `${result.student.fullName} flagged: ${result.flagReason}. Routed to Lecturer.`);
      window.smartBioCloud.recordFlaggedException({
        sessionId: currentSessionId,
        courseId: currentCourseId,
        studentId: result.student.id,
        flagReason: result.flagReason,
        capturedConfidence: Number(result.confidence),
        timestamp: result.timestamp,
        status: 'PENDING_REVIEW'
      });
    } else if (result.status === 'REJECTED') {
      this.updateScannerHUD('ACCESS DENIED', 'Fingerprint template not found in university roster.');
    }
  }

  updateScannerHUD(title, log) {
    const titleEl = document.getElementById('hudStatusTitle');
    const logEl = document.getElementById('hudStatusLog');
    if (titleEl) titleEl.innerText = title;
    if (logEl) logEl.innerText = log;
  }

  // 7. Cloud Firebase Config Modal
  bindCloudModalEvents() {
    const btnSave = document.getElementById('btnSaveFirebaseConfig');
    const btnTest = document.getElementById('btnTestFirebaseConnect');
    const btnClose = document.getElementById('btnCloseCloudModal');

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const apiKey = document.getElementById('fbApiKey').value.trim();
        const projectId = document.getElementById('fbProjectId').value.trim();
        const appId = document.getElementById('fbAppId').value.trim();

        if (apiKey && projectId) {
          window.smartBioCloud.saveConfig({ apiKey, projectId, appId });
          this.showToast('Firebase Cloud settings saved & connected!', 'success');
          this.closeCloudModal();
        } else {
          this.showToast('Please enter valid API Key & Project ID', 'warning');
        }
      });
    }

    if (btnClose) btnClose.addEventListener('click', () => this.closeCloudModal());
  }

  // 8. Dynamic Department & Course Select Populators
  populateDepartmentDropdowns() {
    const data = window.smartBioData.load();
    const departments = data.departments || [];

    // 1. Sign Up / Registration Department Select
    const regDept = document.getElementById('regDepartment');
    if (regDept) {
      const currentVal = regDept.value;
      regDept.innerHTML = departments.map(d => `<option value="${d.id}">${d.code} — ${d.name}</option>`).join('');
      if (currentVal && departments.some(d => String(d.id) === String(currentVal))) {
        regDept.value = currentVal;
      }
    }

    // 2. Course Creation Modal Department Select
    const courseDept = document.getElementById('newCourseDepartment');
    if (courseDept) {
      const currentVal = courseDept.value;
      courseDept.innerHTML = departments.map(d => `<option value="${d.id}">${d.code} — ${d.name}</option>`).join('');
      if (currentVal && departments.some(d => String(d.id) === String(currentVal))) {
        courseDept.value = currentVal;
      }
    }
  }

  populateLectureCourseDropdown() {
    const select = document.getElementById('lectureCourseSelect');
    if (!select) return;

    const data = window.smartBioData.load();
    const courses = data.courses || [];
    
    // Filter courses relevant to current lecturer or show all
    let relevantCourses = courses;
    if (this.currentRole === 'LECTURER' && this.currentUserId) {
      relevantCourses = courses.filter(c => c.lecturerId === this.currentUserId);
      if (relevantCourses.length === 0) relevantCourses = courses;
    }

    let html = '';
    relevantCourses.forEach(c => {
      html += `<option value="${c.id}">${c.code} — ${c.title} (${c.units} Units)</option>`;
    });

    select.innerHTML = html;
  }

  // 9. User Profile Modal & Biometric Lifecycle
  openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;

    const user = this.authenticatedUser || window.smartBioData.getUserById(this.currentUserId) || (window.smartBioData.getUsers() || [])[0];
    if (!user) return;

    const data = window.smartBioData.load();
    const dept = (data.departments || []).find(d => d.id === user.departmentId) || { name: 'Computer Science & Software Eng.', code: 'CSC' };

    // Identity block
    const avatarEl = document.getElementById('profileModalAvatar');
    const nameEl = document.getElementById('profileModalFullName');
    const roleBadge = document.getElementById('profileModalRoleBadge');
    const idEl = document.getElementById('profileModalIdentifier');
    const emailEl = document.getElementById('profileModalEmail');
    const deptEl = document.getElementById('profileModalDepartment');
    const levelEl = document.getElementById('profileModalLevel');
    const bioStatusBadge = document.getElementById('profileModalBiometricStatusBadge');
    const bioHashEl = document.getElementById('profileModalBiometricHash');
    const summaryBox = document.getElementById('profileRoleSummaryBox');

    if (avatarEl) avatarEl.innerText = user.avatar || '👤';
    if (nameEl) nameEl.innerText = user.fullName;
    if (roleBadge) {
      roleBadge.innerText = user.role;
      roleBadge.className = `badge ${user.role === 'ADMIN' ? 'badge-flagged' : (user.role === 'LECTURER' ? 'badge-eligible' : 'badge-at-risk')}`;
    }
    if (idEl) idEl.innerText = user.identifier;
    if (emailEl) emailEl.innerText = user.email;

    if (user.role === 'ADMIN') {
      if (deptEl) deptEl.innerText = 'Institution-Wide (All Faculties & Depts)';
      if (levelEl) levelEl.innerText = 'Master System Administrator';
    } else if (user.role === 'LECTURER') {
      if (deptEl) deptEl.innerText = `Dept of ${dept.name}`;
      if (levelEl) levelEl.innerText = 'Academic Board / Course Faculty';
    } else {
      if (deptEl) deptEl.innerText = `Dept of ${dept.name}`;
      if (levelEl) levelEl.innerText = `${user.academicLevel || '400'} Level (${dept.code})`;
    }

    // Biometric Status
    if (user.hasBiometrics) {
      if (bioStatusBadge) {
        bioStatusBadge.innerText = '✓ ENROLLED (NDPA 2023)';
        bioStatusBadge.className = 'badge badge-eligible';
      }
      if (bioHashEl) {
        bioHashEl.innerText = user.fingerTemplate || 'SHA256:8f4c2e91b637dae15091726a84d29f03';
        bioHashEl.style.color = 'var(--primary)';
      }
    } else {
      if (bioStatusBadge) {
        bioStatusBadge.innerText = '⚠️ PENDING ENROLLMENT';
        bioStatusBadge.className = 'badge badge-ineligible';
      }
      if (bioHashEl) {
        bioHashEl.innerText = '⚠️ No hardware biometric or WebAuthn passkey enrolled yet.';
        bioHashEl.style.color = 'var(--warning)';
      }
    }

    // Role-specific metrics in profile
    if (summaryBox) {
      if (user.role === 'STUDENT') {
        const comp = window.smartBioCompliance.calculateStudentCompliance(user.id);
        const registeredCount = comp ? comp.courseStats.length : 0;
        const eligibleCount = comp ? comp.courseStats.filter(c => c.status === 'ELIGIBLE').length : 0;
        summaryBox.innerHTML = `
          <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px;">🎓 Student Academic &amp; Clearance Overview</div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">
            <span>Enrolled Courses: <strong class="text-main">${registeredCount}</strong></span>
            <span>Cleared for Exams: <strong class="text-success">${eligibleCount} / ${registeredCount}</strong></span>
          </div>
          <div style="font-size: 0.78rem; color: var(--primary);">
            Overall Status: <strong>${comp ? comp.overallStatus : 'N/A'}</strong>
          </div>
        `;
      } else if (user.role === 'LECTURER') {
        const coursesTaught = (data.courses || []).filter(c => c.lecturerId === user.id);
        const sessionsTaught = (data.lectureSessions || []).filter(s => s.lecturerId === user.id);
        summaryBox.innerHTML = `
          <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px;">👨‍🏫 Faculty Teaching Load</div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
            <span>Courses Assigned: <strong class="text-main">${coursesTaught.length}</strong></span>
            <span>Concluded Sessions: <strong class="text-main">${sessionsTaught.length}</strong></span>
          </div>
        `;
      } else if (user.role === 'CLASS_REP') {
        const classStudents = (data.users || []).filter(u => u.role === 'STUDENT' && u.departmentId === user.departmentId);
        summaryBox.innerHTML = `
          <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px;">👥 Class Proctor Scope</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Cohort: <strong class="text-main">${dept.code} ${user.academicLevel || 400}L</strong> • Students Managed: <strong class="text-main">${classStudents.length}</strong>
          </div>
        `;
      } else {
        summaryBox.innerHTML = `
          <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 8px;">👨‍💼 Administrator Scope</div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
            <span>System Users: <strong class="text-main">${data.users.length}</strong></span>
            <span>Active Departments: <strong class="text-main">${data.departments.length}</strong></span>
          </div>
        `;
      }
    }

    this.openModal('profileModal');
  }

  closeProfileModal() {
    this.closeModal('profileModal');
  }

  async handleEnrollBiometrics(mode = 'WEBAUTHN') {
    const currentUser = window.smartBioData.getUserById(this.currentUserId);
    if (!currentUser) return;

    if (mode === 'WEBAUTHN') {
      this.showToast('Triggering WebAuthn device passkey enrollment (Windows Hello / Touch ID / Passkey)...', 'info');
      try {
        const res = await window.smartBioBiometric.authenticateWithWebAuthn(currentUser);
        currentUser.hasBiometrics = true;
        currentUser.fingerTemplate = `WEBAUTHN:FIDO2:${res.credentialId ? res.credentialId.slice(0, 24) : 'PASSKEY_' + Date.now().toString(36)}`;

        const data = window.smartBioData.load();
        const idx = data.users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) data.users[idx] = currentUser;
        window.smartBioData.save(data);

        // Firestore sync
        if (window.smartBioCloud.isConnected && window.smartBioCloud.db) {
          try {
            await window.smartBioCloud.db.collection('users').doc(String(currentUser.id)).update({
              hasBiometrics: true,
              fingerTemplate: currentUser.fingerTemplate
            });
          } catch (e) {}
        }

        window.smartBioAudio.playSuccessChime();
        this.showToast(`✓ Hardware WebAuthn Passkey successfully registered for ${currentUser.fullName}!`, 'success');
        this.openProfileModal(); // Refresh profile UI
      } catch (err) {
        console.warn('WebAuthn registration error:', err);
        this.showToast('WebAuthn prompt was cancelled or not supported on this device. You can test via the Optical Scanner.', 'warning');
      }
    } else if (mode === 'OPTICAL') {
      this.showToast('Simulating physical optical scanner capture...', 'info');
      const res = await window.smartBioBiometric.simulateOpticalScan({ studentId: currentUser.id });
      if (res && (res.status === 'PRESENT' || res.status === 'FLAGGED')) {
        currentUser.hasBiometrics = true;
        currentUser.fingerTemplate = `SHA256:${Date.now().toString(16)}07b81`;

        const data = window.smartBioData.load();
        const idx = data.users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) data.users[idx] = currentUser;
        window.smartBioData.save(data);

        // Firestore sync
        if (window.smartBioCloud.isConnected && window.smartBioCloud.db) {
          try {
            await window.smartBioCloud.db.collection('users').doc(String(currentUser.id)).update({
              hasBiometrics: true,
              fingerTemplate: currentUser.fingerTemplate
            });
          } catch (e) {}
        }

        this.showToast(`✓ Optical fingerprint registered with confidence ${res.confidence}%!`, 'success');
        this.openProfileModal(); // Refresh profile UI
      }
    }
  }

  // 10. Course Creation Modal & Delegation
  // ── Department Management (Admin) ──────────────────────────────────────────

  renderAdminDepartments(data) {
    if (!data) data = window.smartBioData.load();
    const tbody = document.getElementById('adminDeptTableBody');
    if (!tbody) return;
    const users = data.users || [];
    let html = '';
    (data.departments || []).forEach((dept, idx) => {
      const studentCount = users.filter(u => u.departmentId === dept.id && (u.role === 'STUDENT' || u.role === 'CLASS_REP')).length;
      html += `
        <tr>
          <td style="color:var(--text-muted);">${idx + 1}</td>
          <td><strong class="font-mono badge badge-eligible">${dept.code}</strong></td>
          <td><strong>${dept.name}</strong></td>
          <td style="color:var(--text-muted); font-size:0.82rem;">${dept.faculty || '—'}</td>
          <td><span class="badge badge-at-risk">${studentCount} students</span></td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="smartBioApp.handleDeleteDept(${dept.id})" style="padding: 3px 10px; font-size: 0.72rem;">
              🗑️ Delete
            </button>
          </td>
        </tr>
      `;
    });
    if (!html) {
      html = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding: 24px;">No departments registered yet. Create the first one above.</td></tr>';
    }
    tbody.innerHTML = html;
  }

  openCreateDeptModal() {
    document.getElementById('formCreateDept').reset();
    document.getElementById('deptPreviewBox').innerText = 'GWU/???/22/001';
    this.openModal('createDeptModal');
    // live preview on code input
    const codeInput = document.getElementById('deptCodeInput');
    if (codeInput) {
      codeInput.oninput = () => {
        const c = codeInput.value.toUpperCase() || '???';
        document.getElementById('deptPreviewBox').innerText = `GWU/${c}/22/001`;
      };
    }
  }

  closeCreateDeptModal() {
    this.closeModal('createDeptModal');
  }

  handleCreateDept(e) {
    e.preventDefault();
    const code    = document.getElementById('deptCodeInput').value.trim().toUpperCase();
    const name    = document.getElementById('deptNameInput').value.trim();
    const faculty = document.getElementById('deptFacultyInput').value.trim();

    const data = window.smartBioData.load();
    const depts = data.departments || [];

    if (depts.find(d => d.code === code)) {
      this.showToast(`Department code "${code}" already exists.`, 'error');
      return;
    }

    const newId = Math.max(0, ...depts.map(d => d.id)) + 1;
    depts.push({ id: newId, code, name, faculty });
    data.departments = depts;
    window.smartBioData.save(data);

    // Dynamically refresh department dropdowns across all modals & views
    this.populateDepartmentDropdowns();
    this.updateRegMatricPreview();

    this.closeCreateDeptModal();
    this.renderAdminDepartments(data);
    this.writeAuditLog('DEPT_CREATED', `Department ${code} (${name}) created`);
    window.smartBioAudio.playSuccessChime();
    this.showToast(`✓ Department ${code} — ${name} created successfully!`, 'success');
  }

  handleDeleteDept(deptId) {
    const data = window.smartBioData.load();
    const dept = (data.departments || []).find(d => d.id === deptId);
    if (!dept) return;

    const usersInDept = (data.users || []).filter(u => u.departmentId === deptId).length;
    if (usersInDept > 0) {
      this.showToast(`Cannot delete ${dept.code} — ${usersInDept} user(s) are currently enrolled in it.`, 'error');
      return;
    }
    if (!confirm(`⚠️ Permanently delete the "${dept.code} — ${dept.name}" department?\n\nThis cannot be undone.`)) return;

    data.departments = data.departments.filter(d => d.id !== deptId);
    window.smartBioData.save(data);
    this.populateDepartmentDropdowns();
    this.updateRegMatricPreview();
    this.renderAdminDepartments(data);
    this.writeAuditLog('DEPT_DELETED', `Department ${dept.code} (${dept.name}) deleted by admin`);
    this.showToast(`🗑️ Department ${dept.code} deleted.`, 'info');
  }


  // 10. Course Creation Modal & Delegation
  openCreateCourseModal() {
    const modal = document.getElementById('createCourseModal');
    if (!modal) return;

    const data = window.smartBioData.load();
    const currentUser = window.smartBioData.getUserById(this.currentUserId);

    // Populate department select
    const deptSelect = document.getElementById('newCourseDepartment');
    if (deptSelect) {
      deptSelect.innerHTML = (data.departments || []).map(d => `<option value="${d.id}">${d.code} — ${d.name}</option>`).join('');
      if (currentUser && currentUser.departmentId) deptSelect.value = currentUser.departmentId;
    }

    // Populate lecturer select
    const lecturerSelect = document.getElementById('newCourseLecturer');
    if (lecturerSelect) {
      const lecturers = (data.users || []).filter(u => u.role === 'LECTURER' || u.role === 'ADMIN');
      lecturerSelect.innerHTML = lecturers.map(l => `<option value="${l.id}">${l.fullName} (${l.identifier})</option>`).join('');
      if (currentUser && (currentUser.role === 'LECTURER' || currentUser.role === 'ADMIN')) {
        lecturerSelect.value = currentUser.id;
      }
    }

    // Set level default
    const levelSelect = document.getElementById('newCourseLevel');
    if (levelSelect && currentUser && currentUser.academicLevel) {
      levelSelect.value = currentUser.academicLevel;
    }

    this.openModal('createCourseModal');
  }

  closeCreateCourseModal() {
    this.closeModal('createCourseModal');
  }

  async handleCreateCourse(e) {
    e.preventDefault();
    const code = document.getElementById('newCourseCode').value.trim().toUpperCase();
    const title = document.getElementById('newCourseTitle').value.trim();
    const units = Number(document.getElementById('newCourseUnits').value);
    const departmentId = Number(document.getElementById('newCourseDepartment').value);
    const level = Number(document.getElementById('newCourseLevel').value);
    const lecturerId = Number(document.getElementById('newCourseLecturer').value);
    const minAttendancePct = Number(document.getElementById('newCourseThreshold').value) || 75;

    const data = window.smartBioData.load();
    const nextCourseId = data.courses.length ? Math.max(...data.courses.map(c => c.id)) + 1 : 1;

    const newCourse = {
      id: nextCourseId,
      code,
      title,
      units,
      departmentId,
      level,
      lecturerId,
      minAttendancePct
    };

    data.courses.push(newCourse);

    // Auto-enroll all existing students in this department and level cohort
    const cohortStudents = (data.users || []).filter(u => 
      (u.role === 'STUDENT' || u.role === 'CLASS_REP') && 
      u.departmentId === departmentId && 
      Number(u.academicLevel) === level
    );

    let maxRegId = (data.courseRegistrations && data.courseRegistrations.length) ? Math.max(...data.courseRegistrations.map(r => r.id)) : 0;
    let autoEnrolledCount = 0;

    cohortStudents.forEach(st => {
      const alreadyRegistered = data.courseRegistrations.some(r => r.studentId === st.id && r.courseId === nextCourseId);
      if (!alreadyRegistered) {
        maxRegId++;
        data.courseRegistrations.push({
          id: maxRegId,
          studentId: st.id,
          courseId: nextCourseId,
          sessionId: 1
        });
        autoEnrolledCount++;
      }
    });

    const currentUser = window.smartBioData.getUserById(this.currentUserId) || { fullName: 'Course Coordinator', role: 'LECTURER' };
    const lecturerUser = window.smartBioData.getUserById(lecturerId) || { fullName: 'Faculty Member' };

    // Record Immutable Audit Log
    data.auditLogs.push({
      id: data.auditLogs.length ? Math.max(...data.auditLogs.map(a => a.id)) + 1 : 1,
      actorId: this.currentUserId,
      actor: `${currentUser.fullName} (${currentUser.role})`,
      action: 'COURSE_CREATE',
      details: `Created new course ${code} (${title}, ${units} Units) assigned to ${lecturerUser.fullName}. Auto-enrolled ${autoEnrolledCount} cohort students.`,
      time: new Date().toLocaleString()
    });

    window.smartBioData.save(data);

    // Cloud Firestore sync if connected
    if (window.smartBioCloud.isConnected && window.smartBioCloud.db) {
      try {
        await window.smartBioCloud.db.collection('courses').doc(String(nextCourseId)).set(newCourse);
      } catch (err) {
        console.warn('Cloud course sync notice:', err.message);
      }
    }

    this.populateLectureCourseDropdown();
    if (this.currentView === 'STUDENT') this.renderStudentPortal();
    if (this.currentView === 'CLASS_REP') this.renderClassRepPortal();
    if (this.currentView === 'LECTURER') this.renderLecturerPortal();
    if (this.currentView === 'ADMIN') this.renderAdminPortal();

    this.closeCreateCourseModal();
    window.smartBioAudio.playSuccessChime();
    this.showToast(`✓ Course ${code} successfully created! Auto-enrolled ${autoEnrolledCount} cohort students.`, 'success');
  }

  // 11. Admin Governance & Ownership Transfer Methods
  openReassignCourseModal(courseId) {
    const modal = document.getElementById('reassignCourseModal');
    if (!modal) return;

    const data = window.smartBioData.load();
    const course = (data.courses || []).find(c => c.id === Number(courseId));
    if (!course) return;

    const currentLecturer = (data.users || []).find(u => u.id === course.lecturerId) || { fullName: 'Unassigned' };
    const lecturers = (data.users || []).filter(u => u.role === 'LECTURER' || u.role === 'ADMIN');

    const idInput = document.getElementById('reassignCourseId');
    const titleEl = document.getElementById('reassignCourseCodeTitle');
    const lecturerEl = document.getElementById('reassignCurrentLecturerName');
    const selectEl = document.getElementById('reassignNewLecturerSelect');

    if (idInput) idInput.value = course.id;
    if (titleEl) titleEl.innerText = `${course.code} — ${course.title}`;
    if (lecturerEl) lecturerEl.innerText = currentLecturer.fullName;

    if (selectEl) {
      selectEl.innerHTML = lecturers.map(l => `
        <option value="${l.id}" ${l.id === course.lecturerId ? 'selected' : ''}>
          ${l.fullName} (${l.identifier}) ${l.id === course.lecturerId ? '— (Current Owner)' : ''}
        </option>
      `).join('');
    }
    this.openModal('reassignCourseModal');
  }

  closeReassignCourseModal() {
    this.closeModal('reassignCourseModal');
  }

  async handleSaveCourseReassignment(e) {
    e.preventDefault();
    const courseId = Number(document.getElementById('reassignCourseId').value);
    const newLecturerId = Number(document.getElementById('reassignNewLecturerSelect').value);
    const reason = document.getElementById('reassignReasonInput').value.trim() || 'HOD Faculty Course Reallocation';

    const data = window.smartBioData.load();
    const courseIdx = data.courses.findIndex(c => c.id === courseId);
    if (courseIdx === -1) return;

    const oldCourse = data.courses[courseIdx];
    const previousLecturer = (data.users || []).find(u => u.id === oldCourse.lecturerId) || { fullName: 'Previous Faculty' };
    const newLecturer = (data.users || []).find(u => u.id === newLecturerId) || { fullName: 'New Faculty' };

    // Update course owner
    data.courses[courseIdx].lecturerId = newLecturerId;

    // Log immutable audit trail
    const adminUser = this.authenticatedUser || { fullName: 'Administrator', role: 'ADMIN', id: 1 };
    data.auditLogs.push({
      id: data.auditLogs.length ? Math.max(...data.auditLogs.map(a => a.id)) + 1 : 1,
      actorId: adminUser.id,
      actor: `${adminUser.fullName} (${adminUser.role})`,
      action: 'COURSE_OWNERSHIP_TRANSFER',
      details: `Reassigned course ${oldCourse.code} (${oldCourse.title}) from ${previousLecturer.fullName} to ${newLecturer.fullName}. Reason: ${reason}`,
      time: new Date().toLocaleString()
    });

    window.smartBioData.save(data);

    // Sync to Firestore
    if (window.smartBioCloud.isConnected && window.smartBioCloud.db) {
      try {
        await window.smartBioCloud.db.collection('courses').doc(String(courseId)).update({
          lecturerId: newLecturerId
        });
      } catch (err) {}
    }

    this.closeReassignCourseModal();
    this.populateLectureCourseDropdown();
    this.renderAdminPortal();

    window.smartBioAudio.playSuccessChime();
    this.showToast(`✓ Transferred ownership of ${oldCourse.code} to ${newLecturer.fullName}!`, 'success');
  }

  handleAdminToggleUserRole(userId) {
    const data = window.smartBioData.load();
    const userIdx = data.users.findIndex(u => u.id === Number(userId));
    if (userIdx === -1) return;

    const user = data.users[userIdx];
    const oldRole = user.role;
    const newRole = oldRole === 'STUDENT' ? 'CLASS_REP' : (oldRole === 'CLASS_REP' ? 'STUDENT' : oldRole);

    if (newRole === oldRole) return;

    data.users[userIdx].role = newRole;
    if (newRole === 'CLASS_REP') data.users[userIdx].avatar = '👥';
    if (newRole === 'STUDENT') data.users[userIdx].avatar = '🎓';

    const adminUser = this.authenticatedUser || { fullName: 'Administrator', role: 'ADMIN', id: 1 };
    data.auditLogs.push({
      id: data.auditLogs.length ? Math.max(...data.auditLogs.map(a => a.id)) + 1 : 1,
      actorId: adminUser.id,
      actor: `${adminUser.fullName} (${adminUser.role})`,
      action: 'ROLE_ELEVATION',
      details: `Modified role for ${user.fullName} (${user.identifier}) from ${oldRole} to ${newRole}`,
      time: new Date().toLocaleString()
    });

    window.smartBioData.save(data);

    if (window.smartBioCloud.isConnected && window.smartBioCloud.db) {
      try {
        window.smartBioCloud.db.collection('users').doc(String(userId)).update({
          role: newRole,
          avatar: data.users[userIdx].avatar
        });
      } catch (e) {}
    }

    this.renderAdminPortal();
    window.smartBioAudio.playSuccessChime();
    this.showToast(`✓ Updated role for ${user.fullName} to ${newRole}`, 'success');
  }

  handleAdminResetBiometrics(userId) {
    const data = window.smartBioData.load();
    const userIdx = data.users.findIndex(u => u.id === Number(userId));
    if (userIdx === -1) return;

    const user = data.users[userIdx];
    data.users[userIdx].hasBiometrics = false;
    data.users[userIdx].fingerTemplate = null;

    const adminUser = this.authenticatedUser || { fullName: 'Administrator', role: 'ADMIN', id: 1 };
    data.auditLogs.push({
      id: data.auditLogs.length ? Math.max(...data.auditLogs.map(a => a.id)) + 1 : 1,
      actorId: adminUser.id,
      actor: `${adminUser.fullName} (${adminUser.role})`,
      action: 'BIOMETRIC_RESET',
      details: `Reset biometric template credential for ${user.fullName} (${user.identifier}). Required to re-enroll.`,
      time: new Date().toLocaleString()
    });

    window.smartBioData.save(data);

    if (window.smartBioCloud.isConnected && window.smartBioCloud.db) {
      try {
        window.smartBioCloud.db.collection('users').doc(String(userId)).update({
          hasBiometrics: false,
          fingerTemplate: null
        });
      } catch (e) {}
    }

    this.renderAdminPortal();
    window.smartBioAudio.playLaserChirp();
    this.showToast(`Biometric credential reset for ${user.fullName}. User must re-enroll.`, 'warning');
  }

  handleAdminDeleteCourse(courseId) {
    const data = window.smartBioData.load();
    const course = (data.courses || []).find(c => c.id === Number(courseId));
    if (!course) return;

    if (!confirm(`Are you sure you want to delete course ${course.code} (${course.title})?`)) return;

    data.courses = data.courses.filter(c => c.id !== Number(courseId));
    data.courseRegistrations = (data.courseRegistrations || []).filter(r => r.courseId !== Number(courseId));

    const adminUser = this.authenticatedUser || { fullName: 'Administrator', role: 'ADMIN', id: 1 };
    data.auditLogs.push({
      id: data.auditLogs.length ? Math.max(...data.auditLogs.map(a => a.id)) + 1 : 1,
      actorId: adminUser.id,
      actor: `${adminUser.fullName} (${adminUser.role})`,
      action: 'COURSE_DELETE',
      details: `Removed course ${course.code} (${course.title}) from active curriculum.`,
      time: new Date().toLocaleString()
    });

    window.smartBioData.save(data);
    this.populateLectureCourseDropdown();
    this.renderAdminPortal();
    this.showToast(`Deleted course ${course.code}`, 'info');
  }

  // 12. Toast UI Notification System
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Global instance
window.smartBioApp = new SmartBioApp();

// Boot on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.smartBioApp.init();
});
