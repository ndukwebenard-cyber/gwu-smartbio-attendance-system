/**
 * SMARTBIO ATTENDANCE SYSTEM - CORE APPLICATION CONTROLLER
 * SPA View Routing, Real-time Radars, Exception Resolution & UI Actions
 */

class SmartBioApp {
  constructor() {
    this.currentRole = 'LECTURER';
    this.currentUserId = 2; // Dr. Olawale Adeyemi by default
    this.activeLectureSession = null;
    this.sessionTimerInterval = null;
    this.sessionSecondsElapsed = 0;
  }

  init() {
    // Initialize Subsystems
    window.smartBioTour.init();
    window.smartBioCloud.initializeFirebase();

    this.bindNavbarEvents();
    this.bindLecturerEvents();
    this.bindClassRepEvents();
    this.bindStudentEvents();
    this.bindAdminEvents();
    this.bindScannerEvents();
    this.bindCloudModalEvents();
    this.listenToGlobalEvents();

    // Default view
    this.switchRole(this.currentRole, this.currentUserId);
  }

  // 1. Role & View Switching
  switchRole(role, userId = null) {
    this.currentRole = role;
    
    // Set default user based on role if not provided
    if (!userId) {
      if (role === 'ADMIN') this.currentUserId = 1;
      else if (role === 'LECTURER') this.currentUserId = 2; // Dr. Adeyemi
      else if (role === 'CLASS_REP') this.currentUserId = 6; // Chukwudi Eze
      else if (role === 'STUDENT') this.currentUserId = 4;  // Benedict
      else if (role === 'SCANNER') this.currentUserId = null;
    } else {
      this.currentUserId = Number(userId);
    }

    // Update Navbar active pill
    document.querySelectorAll('.role-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.role === role);
    });

    // Hide all views
    document.querySelectorAll('.portal-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show active view
    if (role === 'ADMIN') {
      const v = document.getElementById('adminPortalView');
      if (v) v.classList.add('active');
      this.renderAdminPortal();
    } else if (role === 'LECTURER') {
      const v = document.getElementById('lecturerPortalView');
      if (v) v.classList.add('active');
      this.renderLecturerPortal();
    } else if (role === 'CLASS_REP') {
      const v = document.getElementById('classRepPortalView');
      if (v) v.classList.add('active');
      this.renderClassRepPortal();
    } else if (role === 'STUDENT') {
      const v = document.getElementById('studentPortalView');
      if (v) v.classList.add('active');
      this.renderStudentPortal();
    } else if (role === 'SCANNER') {
      const v = document.getElementById('scannerKioskView');
      if (v) v.classList.add('active');
      this.renderScannerTerminal();
    }

    this.showToast(`Switched to ${role} Portal`, 'info');
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
  }

  // 2. Global Event Listeners (Syncs across all views)
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
  }

  handleIncomingAttendance(record) {
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

    // If student is viewing, refresh gauges
    if (this.currentRole === 'STUDENT') {
      this.renderStudentPortal();
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

    this.activeLectureSession = {
      id: Date.now(),
      courseId,
      lecturerId: this.currentUserId,
      topic,
      venue,
      startTime: new Date().toLocaleTimeString(),
      status: 'ACTIVE'
    };

    // Update UI elements
    const banner = document.getElementById('liveSessionActiveBanner');
    const formBox = document.getElementById('lectureSessionConfigBox');
    if (banner) banner.classList.remove('hidden');
    if (formBox) formBox.classList.add('hidden');

    const titleEl = document.getElementById('activeSessionTitle');
    const venueEl = document.getElementById('activeSessionVenue');
    if (titleEl) titleEl.innerText = topic;
    if (venueEl) venueEl.innerText = venue;

    // Start live duration counter
    this.sessionSecondsElapsed = 0;
    if (this.sessionTimerInterval) clearInterval(this.sessionTimerInterval);
    this.sessionTimerInterval = setInterval(() => {
      this.sessionSecondsElapsed++;
      const mins = String(Math.floor(this.sessionSecondsElapsed / 60)).padStart(2, '0');
      const secs = String(this.sessionSecondsElapsed % 60).padStart(2, '0');
      const timerEl = document.getElementById('activeSessionTimer');
      if (timerEl) timerEl.innerText = `${mins}:${secs}`;
    }, 1000);

    // Audit log
    window.smartBioData.addAuditLog({
      actor: 'Dr. Olawale Adeyemi',
      action: 'SESSION_START',
      details: `Started lecture session for CSC 401 (${topic}) at ${venue}`,
      time: new Date().toLocaleString()
    });

    this.showToast('Live Lecture Session is now ACTIVE & Streaming', 'success');
  }

  endActiveLectureSession() {
    if (this.sessionTimerInterval) clearInterval(this.sessionTimerInterval);
    this.activeLectureSession = null;

    const banner = document.getElementById('liveSessionActiveBanner');
    const formBox = document.getElementById('lectureSessionConfigBox');
    if (banner) banner.classList.add('hidden');
    if (formBox) formBox.classList.remove('hidden');

    this.showToast('Lecture Session concluded and saved.', 'info');
  }

  renderLecturerPortal() {
    const lecturer = window.smartBioData.getUserById(this.currentUserId) || { fullName: 'Dr. Olawale Adeyemi' };
    const nameEl = document.getElementById('lecturerWelcomeName');
    if (nameEl) nameEl.innerText = lecturer.fullName;

    this.renderFlaggedQueue();
    this.renderLecturerDefaulterTable();
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

    const modal = document.getElementById('flagResolveModal');
    const nameEl = document.getElementById('resolveStudentName');
    const matricEl = document.getElementById('resolveStudentMatric');
    const reasonEl = document.getElementById('resolveFlagReason');
    const flagIdInput = document.getElementById('resolveFlagId');

    if (nameEl) nameEl.innerText = student ? student.fullName : 'Unknown';
    if (matricEl) matricEl.innerText = student ? student.identifier : 'N/A';
    if (reasonEl) reasonEl.innerText = flag.flagReason;
    if (flagIdInput) flagIdInput.value = flag.id;

    if (modal) modal.classList.add('active');
  }

  closeResolveModal() {
    const modal = document.getElementById('flagResolveModal');
    if (modal) modal.classList.remove('active');
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
    const students = data.users.filter(u => u.role === 'STUDENT');
    
    let html = '';
    students.forEach(student => {
      const comp = window.smartBioCompliance.calculateStudentCompliance(student.id);
      if (!comp || comp.courseStats.length === 0) return;
      const stat = comp.courseStats[0]; // CSC 401

      html += `
        <tr>
          <td><strong class="font-mono">${student.identifier}</strong></td>
          <td>${student.fullName}</td>
          <td>${stat.attended} / ${stat.totalHeld}</td>
          <td><strong>${stat.percentage}%</strong></td>
          <td><span class="badge ${stat.statusClass}">${stat.badgeLabel}</span></td>
          <td>
            ${stat.status === 'ELIGIBLE' 
              ? '<span class="text-success">✓ Cleared</span>' 
              : `<span class="text-danger">Needs +${stat.classesNeeded} classes</span>`}
          </td>
        </tr>
      `;
    });
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

  renderClassRepPortal() {
    const rep = window.smartBioData.getUserById(6) || { fullName: 'Chukwudi Eze' };
    const nameEl = document.getElementById('classRepWelcomeName');
    if (nameEl) nameEl.innerText = `${rep.fullName} (Class Rep)`;

    const data = window.smartBioData.load();
    const students = data.users.filter(u => u.role === 'STUDENT' || u.role === 'CLASS_REP');
    
    // Stats calculation
    const totalEnrolledEl = document.getElementById('repStatEnrolled');
    const totalPresentEl = document.getElementById('repStatPresent');
    const totalAtRiskEl = document.getElementById('repStatAtRisk');

    let presentCount = 0;
    let atRiskCount = 0;

    const tableBody = document.getElementById('repDefaultersTableBody');
    let html = '';

    students.forEach(student => {
      const comp = window.smartBioCompliance.calculateStudentCompliance(student.id);
      if (!comp || comp.courseStats.length === 0) return;
      const stat = comp.courseStats[0]; // CSC 401

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
              ? '<span class="text-success">✓ In Good Standing</span>' 
              : `<span class="text-warning">⚠️ Must attend next ${stat.classesNeeded} classes</span>`}
          </td>
        </tr>
      `;
    });

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

  renderStudentPortal() {
    const student = window.smartBioData.getUserById(this.currentUserId) || window.smartBioData.getUsers().find(u => u.role === 'STUDENT');
    const nameEl = document.getElementById('studentWelcomeName');
    const matricEl = document.getElementById('studentMatricBadge');
    if (nameEl) nameEl.innerText = student.fullName;
    if (matricEl) matricEl.innerText = student.identifier;

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
                <div>
                  <h3>${stat.course.code}</h3>
                  <span>${stat.course.title}</span>
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

    // Render student lecture log
    this.renderStudentLectureLog(student.id);
  }

  renderStudentLectureLog(studentId) {
    const tableBody = document.getElementById('studentLectureLogTableBody');
    if (!tableBody) return;

    const data = window.smartBioData.load();
    const sessions = data.lectureSessions;
    let html = '';

    sessions.forEach(session => {
      const record = data.attendanceRecords.find(a => a.sessionId === session.id && a.studentId === Number(studentId));
      const isPresent = record && (record.status === 'PRESENT' || record.status === 'FLAGGED_RESOLVED');

      html += `
        <tr>
          <td><strong class="font-mono">#${session.id}</strong></td>
          <td>${session.topic}</td>
          <td>${session.venue}</td>
          <td>${session.timestamp}</td>
          <td>
            <span class="badge ${isPresent ? 'badge-eligible' : 'badge-ineligible'}">
              ${isPresent ? 'PRESENT' : 'ABSENT'}
            </span>
          </td>
          <td>${record ? record.method : '—'}</td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;
  }

  openDocketModal() {
    const student = window.smartBioData.getUserById(this.currentUserId);
    const container = document.getElementById('docketRenderContainer');
    if (container && student) {
      container.innerHTML = window.smartBioCompliance.renderClearanceDocket(student.id);
    }
    const modal = document.getElementById('docketModal');
    if (modal) modal.classList.add('active');
  }

  closeDocketModal() {
    const modal = document.getElementById('docketModal');
    if (modal) modal.classList.remove('active');
  }

  // 5. Admin Portal Logic
  bindAdminEvents() {
    const btnReset = document.getElementById('btnAdminResetDB');
    const btnExportSQL = document.getElementById('btnAdminExportSQL');

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
        const sql = window.smartBioData.exportSQLDump();
        const blob = new Blob([sql], { type: 'text/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartbio_dump_${Date.now()}.sql`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('SQL Dump exported successfully', 'success');
      });
    }
  }

  renderAdminPortal() {
    const data = window.smartBioData.load();

    // Metric counters
    const totalStudentsEl = document.getElementById('adminStatTotalStudents');
    const totalLecturersEl = document.getElementById('adminStatTotalLecturers');
    const totalCoursesEl = document.getElementById('adminStatTotalCourses');
    const totalSessionsEl = document.getElementById('adminStatTotalSessions');

    if (totalStudentsEl) totalStudentsEl.innerText = data.users.filter(u => u.role === 'STUDENT').length;
    if (totalLecturersEl) totalLecturersEl.innerText = data.users.filter(u => u.role === 'LECTURER').length;
    if (totalCoursesEl) totalCoursesEl.innerText = data.courses.length;
    if (totalSessionsEl) totalSessionsEl.innerText = data.lectureSessions.length;

    // Users directory table
    const usersTableBody = document.getElementById('adminUsersTableBody');
    if (usersTableBody) {
      let html = '';
      data.users.forEach(u => {
        html += `
          <tr>
            <td><strong class="font-mono">${u.identifier}</strong></td>
            <td>${u.avatar || ''} ${u.fullName}</td>
            <td><span class="badge ${u.role === 'ADMIN' ? 'badge-ineligible' : (u.role === 'LECTURER' ? 'badge-at-risk' : 'badge-eligible')}">${u.role}</span></td>
            <td>${u.academicLevel ? `${u.academicLevel}L` : 'Staff'}</td>
            <td>
              <span class="badge badge-eligible">✓ ENROLLED (NDPA)</span>
            </td>
          </tr>
        `;
      });
      usersTableBody.innerHTML = html;
    }

    // Audit trail table
    const auditTableBody = document.getElementById('adminAuditTableBody');
    if (auditTableBody) {
      let html = '';
      data.auditLogs.slice(0, 10).forEach(log => {
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
            window.smartBioCloud.recordAttendance({
              sessionId: 10,
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
    this.updateScannerHUD('SYSTEM READY', 'Waiting for student fingerprint touch on platen...');
  }

  async runTerminalScan(mode = 'NORMAL', studentId = 4) {
    this.updateScannerHUD('SCANNING...', 'Extracting optical ridge patterns & minutiae points...');
    
    const result = await window.smartBioBiometric.simulateOpticalScan({
      studentId,
      testMode: mode,
      sessionId: 10
    });

    if (!result) return;

    if (result.status === 'PRESENT') {
      this.updateScannerHUD('VERIFIED (MATCH 99%)', `${result.student.fullName} (${result.student.identifier}) verified. Attendance logged.`);
      window.smartBioCloud.recordAttendance({
        sessionId: result.sessionId,
        studentId: result.student.id,
        method: result.method,
        confidence: Number(result.confidence),
        status: 'PRESENT',
        time: result.timestamp
      });
    } else if (result.status === 'FLAGGED') {
      this.updateScannerHUD('FLAGGED EXCEPTION', `${result.student.fullName} flagged: ${result.flagReason}. Routed to Lecturer.`);
      window.smartBioCloud.recordFlaggedException({
        sessionId: result.sessionId,
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

  openCloudModal() {
    const modal = document.getElementById('cloudConfigModal');
    if (modal) modal.classList.add('active');
  }

  closeCloudModal() {
    const modal = document.getElementById('cloudConfigModal');
    if (modal) modal.classList.remove('active');
  }

  // 8. Toast UI Notification System
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
