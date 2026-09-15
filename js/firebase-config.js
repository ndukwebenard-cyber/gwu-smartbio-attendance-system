/**
 * GLOBAL WEALTH UNIVERSITY — SMARTBIO ATTENDANCE SYSTEM
 * Firebase Real-Time Cloud Engine (Firestore, Auth & Multi-Device Sync)
 * Project: gwu-smartbio-attendance-system
 */

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAavLJpGfZVjPD3e6L3Iq3uMJfwGsKbSZE",
  authDomain: "gwu-smartbio-attendance-system.firebaseapp.com",
  projectId: "gwu-smartbio-attendance-system",
  storageBucket: "gwu-smartbio-attendance-system.firebasestorage.app",
  messagingSenderId: "1035782543474",
  appId: "1:1035782543474:web:2d7e00197b4c9a4d780aeb",
  measurementId: "G-C4FP847Q4S"
};

class CloudSyncEngine {
  constructor() {
    this.CONFIG_STORAGE_KEY = 'smartbio_firebase_cfg';
    this.config = this.loadConfig() || DEFAULT_FIREBASE_CONFIG;
    this.isConnected = false;
    this.db = null;
    this.auth = null;
    this.listeners = [];
    this.recentLocalAttendance = new Set();
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(this.CONFIG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load cloud config', e);
    }
    return null;
  }

  saveConfig(config) {
    localStorage.setItem(this.CONFIG_STORAGE_KEY, JSON.stringify(config));
    this.config = config;
    this.initializeFirebase();
  }

  async ensureFirebaseSDK() {
    if (window.firebase && window.firebase.firestore && window.firebase.auth) {
      return true;
    }

    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.firebase && window.firebase.firestore && window.firebase.auth) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 30) { // 3 seconds timeout
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  }

  async initializeFirebase() {
    if (!this.config || !this.config.apiKey || !this.config.projectId) {
      this.isConnected = false;
      this.updateSyncUI();
      return false;
    }

    try {
      const sdkReady = await this.ensureFirebaseSDK();

      if (window.firebase && window.firebase.firestore) {
        // Properly handle re-initialization: reuse existing app or initialize fresh
        if (!firebase.apps.length) {
          firebase.initializeApp(this.config);
        } else {
          // If config changed (e.g. user updated Firebase config), re-init with a new app
          try {
            const existingApp = firebase.apps[0];
            if (existingApp.options.projectId !== this.config.projectId) {
              await existingApp.delete();
              firebase.initializeApp(this.config);
            }
          } catch (reiErr) {
            console.warn('Firebase app reuse notice:', reiErr.message);
          }
        }

        this.db = firebase.firestore();
        this.auth = firebase.auth();

        // Enable network if supported
        try {
          if (this.db.enableNetwork) {
            await this.db.enableNetwork();
          }
        } catch (netErr) {
          console.warn('Firestore enableNetwork notice:', netErr.message);
        }

        this.isConnected = typeof navigator.onLine === 'undefined' ? true : navigator.onLine;
        this.updateSyncUI();

        // 1. Authoritative Cloud Hydration: Pull all datasets from Firestore
        await this.hydrateFromFirestore();

        // 2. Attach Real-time Listeners
        this.setupRealtimeListeners();

        // Listen to online / offline network transitions
        window.addEventListener('online', async () => {
          this.isConnected = true;
          this.updateSyncUI();
          await this.hydrateFromFirestore();
          this.setupRealtimeListeners();
          console.log('🌐 Network online: Cloud Firestore connected');
        });

        window.addEventListener('offline', () => {
          this.isConnected = false;
          this.updateSyncUI();
          console.log('📡 Network offline: Switched to Local Mode');
        });

        console.log('⚡ Firebase Cloud Firestore initialized & online for project', this.config.projectId);
        return true;
      } else {
        console.warn('Firebase SDK not yet loaded or offline');
        this.isConnected = false;
        this.updateSyncUI();
        return false;
      }
    } catch (e) {
      console.error('Firebase initialization error:', e);
      this.isConnected = false;
      this.updateSyncUI();
      return false;
    }
  }

  // Authoritative Cloud Hydration: Read collections directly from Firestore
  async hydrateFromFirestore() {
    if (!this.isConnected || !this.db) return false;

    try {
      console.log('🔄 Hydrating authoritative university data from Google Cloud Firestore...');
      const data = window.smartBioData.load();

      // 1. Fetch Departments
      const deptSnap = await this.db.collection('departments').get();
      if (!deptSnap.empty) {
        const cloudDepts = deptSnap.docs.map(doc => {
          const d = doc.data();
          return {
            id: Number(d.id) || Number(doc.id) || d.id,
            code: d.code,
            name: d.name,
            faculty: d.faculty || 'Faculty of Basic & Applied Sciences'
          };
        });

        const deptMap = new Map();
        (data.departments || []).forEach(d => deptMap.set(Number(d.id), d));
        cloudDepts.forEach(d => deptMap.set(Number(d.id), d));
        data.departments = Array.from(deptMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
      }

      // 2. Fetch Courses
      const courseSnap = await this.db.collection('courses').get();
      if (!courseSnap.empty) {
        const cloudCourses = courseSnap.docs.map(doc => {
          const c = doc.data();
          return {
            id: Number(c.id) || Number(doc.id) || c.id,
            code: c.code,
            title: c.title,
            units: Number(c.units) || 3,
            departmentId: Number(c.departmentId),
            level: Number(c.level),
            lecturerId: Number(c.lecturerId) || 1,
            minAttendancePct: Number(c.minAttendancePct) || 75
          };
        });

        const courseMap = new Map();
        (data.courses || []).forEach(c => courseMap.set(Number(c.id), c));
        cloudCourses.forEach(c => courseMap.set(Number(c.id), c));
        data.courses = Array.from(courseMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
      }

      // 3. Fetch Users
      const userSnap = await this.db.collection('users').get();
      if (!userSnap.empty) {
        const cloudUsers = userSnap.docs.map(doc => {
          const u = doc.data();
          return {
            id: Number(u.id) || Number(doc.id) || u.id,
            identifier: u.identifier,
            fullName: u.fullName,
            email: u.email,
            role: u.role,
            departmentId: Number(u.departmentId) || 1,
            academicLevel: u.academicLevel ? Number(u.academicLevel) : null,
            avatar: u.avatar || (u.role === 'LECTURER' ? '👨‍🏫' : (u.role === 'ADMIN' ? '👨‍💼' : '🎓')),
            hasBiometrics: !!u.hasBiometrics,
            fingerTemplate: u.fingerTemplate || null,
            credentialId: u.credentialId || null
          };
        });

        const userMap = new Map();
        (data.users || []).forEach(u => userMap.set(Number(u.id), u));
        cloudUsers.forEach(u => userMap.set(Number(u.id), u));
        data.users = Array.from(userMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
      }

      // 4. Fetch Course Registrations
      const regSnap = await this.db.collection('courseRegistrations').get();
      const cloudRegs = [];
      if (!regSnap.empty) {
        regSnap.docs.forEach(doc => {
          const r = doc.data();
          cloudRegs.push({
            id: Number(r.id) || Number(doc.id) || r.id,
            studentId: Number(r.studentId),
            courseId: Number(r.courseId),
            sessionId: Number(r.sessionId) || 1
          });
        });
      }

      const regMap = new Map();
      (data.courseRegistrations || []).forEach(r => regMap.set(`${r.studentId}_${r.courseId}`, r));
      cloudRegs.forEach(r => regMap.set(`${r.studentId}_${r.courseId}`, r));

      // Auto-Reconcile cohort enrollments for courses/students in same department & level
      let nextRegId = Math.max(0, ...Array.from(regMap.values()).map(r => Number(r.id) || 0));
      const missingCloudWrites = [];

      (data.courses || []).forEach(course => {
        const eligibleStudents = (data.users || []).filter(u =>
          (u.role === 'STUDENT' || u.role === 'CLASS_REP') &&
          Number(u.departmentId) === Number(course.departmentId) &&
          (!course.level || Number(u.academicLevel) === Number(course.level))
        );

        eligibleStudents.forEach(st => {
          const key = `${st.id}_${course.id}`;
          if (!regMap.has(key)) {
            nextRegId++;
            const newReg = {
              id: nextRegId,
              studentId: Number(st.id),
              courseId: Number(course.id),
              sessionId: 1
            };
            regMap.set(key, newReg);
            missingCloudWrites.push(newReg);
          }
        });
      });

      data.courseRegistrations = Array.from(regMap.values());

      // 5. Fetch Lecture Sessions from Cloud
      try {
        const sessionSnap = await this.db.collection('lecture_sessions').get();
        if (!sessionSnap.empty) {
          const cloudSessions = [];
          sessionSnap.docs.forEach(doc => {
            if (doc.id === 'active_session') return; // Skip active_session pointer
            const s = doc.data();
            cloudSessions.push({
              id: Number(s.id) || Number(doc.id) || s.id,
              courseId: Number(s.courseId),
              lecturerId: Number(s.lecturerId),
              lecturerName: s.lecturerName || 'Faculty Member',
              topic: s.topic || 'Class Session',
              venue: s.venue || 'Classroom',
              startTime: s.startTime || '09:00 AM',
              timestamp: s.timestamp || (s.endedAt ? new Date().toLocaleDateString() : 'Today, 09:00 AM'),
              status: s.status || 'CONCLUDED'
            });
          });
          const sessMap = new Map();
          (data.lectureSessions || []).forEach(s => sessMap.set(String(s.id), s));
          cloudSessions.forEach(s => sessMap.set(String(s.id), s));
          data.lectureSessions = Array.from(sessMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
        }
      } catch (sessErr) {
        console.warn('Lecture sessions hydration notice:', sessErr.message);
      }

      // 6. Fetch Attendance Records from Cloud
      try {
        const attSnap = await this.db.collection('attendance_records').get();
        if (!attSnap.empty) {
          const cloudAtt = [];
          attSnap.docs.forEach(doc => {
            const a = doc.data();
            cloudAtt.push({
              id: Number(a.id) || Number(doc.id) || a.id,
              sessionId: Number(a.sessionId) || a.sessionId,
              courseId: Number(a.courseId),
              studentId: Number(a.studentId) || a.studentId,
              method: a.method || 'OPTICAL_FINGERPRINT',
              confidence: Number(a.confidence) || 98.4,
              status: a.status || 'PRESENT',
              timestamp: a.timestamp || new Date().toISOString(),
              time: a.time || '09:00 AM'
            });
          });
          const attMap = new Map();
          (data.attendanceRecords || []).forEach(a => attMap.set(`${a.sessionId}_${a.studentId}`, a));
          cloudAtt.forEach(a => attMap.set(`${a.sessionId}_${a.studentId}`, a));
          data.attendanceRecords = Array.from(attMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
        }
      } catch (attErr) {
        console.warn('Attendance records hydration notice:', attErr.message);
      }

      // Save to local cache
      window.smartBioData.save(data);

      // Backfill missing registrations to Firestore
      if (missingCloudWrites.length > 0) {
        try {
          const batch = this.db.batch();
          missingCloudWrites.forEach(reg => {
            const ref = this.db.collection('courseRegistrations').doc(String(reg.id));
            batch.set(ref, reg);
          });
          await batch.commit();
          console.log(`✓ Synchronized ${missingCloudWrites.length} course registrations to Cloud Firestore.`);
        } catch (regWriteErr) {
          console.warn('Registration backfill notice:', regWriteErr.message);
        }
      }

      console.log('✅ Authoritative university datasets hydrated from Cloud Firestore.');

      // Notify application of fresh cloud state
      window.dispatchEvent(new CustomEvent('smartbio:cloud_hydrated', { detail: data }));
      return true;
    } catch (e) {
      console.warn('Firestore hydration notice:', e.message);
      return false;
    }
  }

  // After reconnect: push all locally accumulated data to Firestore Cloud
  async syncLocalDataToCloud() {
    if (!this.isConnected || !this.db) return { synced: 0, skipped: 0 };

    const data = window.smartBioData.load();
    let synced = 0, skipped = 0;

    try {
      const batch = this.db.batch();

      // 1. Sync Users
      (data.users || []).forEach(u => {
        batch.set(this.db.collection('users').doc(String(u.id)), {
          ...u,
          systemUid: `GWU-USR-${String(u.id).padStart(4, '0')}`,
          syncedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        synced++;
      });

      // 2. Sync Departments
      (data.departments || []).forEach(d => {
        batch.set(this.db.collection('departments').doc(String(d.id)), {
          ...d,
          systemUid: `GWU-DEPT-${d.code}`,
          syncedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        synced++;
      });

      // 3. Sync Courses
      (data.courses || []).forEach(c => {
        batch.set(this.db.collection('courses').doc(String(c.id)), {
          ...c,
          systemUid: `GWU-CRS-${c.code.replace(/\s+/g, '')}`,
          syncedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        synced++;
      });

      // 4. Sync Course Registrations
      (data.courseRegistrations || []).forEach(r => {
        batch.set(this.db.collection('courseRegistrations').doc(String(r.id)), {
          ...r,
          syncedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        synced++;
      });

      // 5. Sync attendance records accumulated while offline
      for (const a of (data.attendanceRecords || [])) {
        const ref = this.db.collection('attendance_records').doc(String(a.id));
        const existing = await ref.get();
        if (!existing.exists) {
          batch.set(ref, { ...a, syncedAt: firebase.firestore.FieldValue.serverTimestamp() });
          synced++;
        } else {
          skipped++;
        }
      }

      // 6. Sync flagged exceptions accumulated while offline
      for (const f of (data.flaggedExceptions || [])) {
        const ref = this.db.collection('flagged_exceptions').doc(String(f.id));
        const existing = await ref.get();
        if (!existing.exists) {
          batch.set(ref, { ...f, syncedAt: firebase.firestore.FieldValue.serverTimestamp() });
          synced++;
        } else {
          skipped++;
        }
      }

      await batch.commit();
      console.log(`✅ Sync complete: ${synced} documents uploaded, ${skipped} already existed.`);
      return { synced, skipped };
    } catch (err) {
      console.error('Sync local to cloud error:', err);
      throw err;
    }
  }

  setupRealtimeListeners() {
    if (!this.db) return;

    try {
      // 1. Real-time Attendance Stream
      let initialAttendanceLoaded = false;
      this.db.collection('attendance_records')
        .orderBy('timestamp', 'desc')
        .limit(30)
        .onSnapshot((snapshot) => {
          if (!initialAttendanceLoaded) {
            // Seed any records into local DataStore silently on initial connect
            snapshot.docs.forEach((doc) => {
              const record = doc.data();
              if (window.smartBioData) {
                window.smartBioData.addAttendance(record);
              }
            });
            initialAttendanceLoaded = true;
            return;
          }

          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const record = change.doc.data();
              if (window.smartBioData) {
                window.smartBioData.addAttendance(record);
              }
              const recId = String(record.id || '');
              if (recId && this.recentLocalAttendance && this.recentLocalAttendance.has(recId)) {
                // Already dispatched and rendered locally, skip duplicate event
                return;
              }
              window.dispatchEvent(new CustomEvent('smartbio:attendance_stream', { detail: record }));
            }
          });
        }, (error) => {
          console.warn('Firestore attendance listener notice:', error.message);
        });

      // 2. Real-time Flagged Exceptions Queue
      this.db.collection('flagged_exceptions')
        .onSnapshot((snapshot) => {
          const flags = [];
          snapshot.forEach(doc => flags.push({ id: doc.id, ...doc.data() }));
          window.dispatchEvent(new CustomEvent('smartbio:flagged_update', { detail: flags }));
        }, (error) => {
          console.warn('Firestore flagged listener notice:', error.message);
        });

      // 3. Real-time Active Lecture Session Broadcast
      this.db.collection('lecture_sessions').doc('active_session')
        .onSnapshot((doc) => {
          if (doc.exists && doc.data().status === 'ACTIVE') {
            const sessionData = doc.data();
            window.dispatchEvent(new CustomEvent('smartbio:session_update', { detail: sessionData }));
          } else {
            try {
              localStorage.removeItem('smartbio_active_session');
            } catch (e) {}
            window.dispatchEvent(new CustomEvent('smartbio:session_update', { 
              detail: { session: null, status: 'CONCLUDED', isExplicitEnd: true } 
            }));
          }
        }, (error) => {
          console.warn('Firestore active session listener notice:', error.message);
        });

      // 4. Real-time Departments Listener (SSOT)
      this.db.collection('departments')
        .onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const data = window.smartBioData.load();
            const cloudDepts = snapshot.docs.map(d => ({ ...d.data(), id: Number(d.data().id) || Number(d.id) || d.id }));
            const deptMap = new Map();
            (data.departments || []).forEach(d => deptMap.set(Number(d.id), d));
            cloudDepts.forEach(d => deptMap.set(Number(d.id), d));
            data.departments = Array.from(deptMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
            window.smartBioData.save(data);
            window.dispatchEvent(new CustomEvent('smartbio:departments_updated', { detail: data.departments }));
          }
        }, (error) => {
          console.warn('Firestore departments listener notice:', error.message);
        });

      // 5. Real-time Courses Listener (SSOT)
      this.db.collection('courses')
        .onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const data = window.smartBioData.load();
            const cloudCourses = snapshot.docs.map(doc => {
              const c = doc.data();
              return {
                id: Number(c.id) || Number(doc.id) || c.id,
                code: c.code,
                title: c.title,
                units: Number(c.units) || 3,
                departmentId: Number(c.departmentId),
                level: Number(c.level),
                lecturerId: Number(c.lecturerId) || 1,
                minAttendancePct: Number(c.minAttendancePct) || 75
              };
            });
            const courseMap = new Map();
            (data.courses || []).forEach(c => courseMap.set(Number(c.id), c));
            cloudCourses.forEach(c => courseMap.set(Number(c.id), c));
            data.courses = Array.from(courseMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
            window.smartBioData.save(data);
            window.dispatchEvent(new CustomEvent('smartbio:courses_updated', { detail: data.courses }));
          }
        }, (error) => {
          console.warn('Firestore courses listener notice:', error.message);
        });

      // 6. Real-time Users Listener (SSOT)
      this.db.collection('users')
        .onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const data = window.smartBioData.load();
            const cloudUsers = snapshot.docs.map(doc => {
              const u = doc.data();
              return {
                id: Number(u.id) || Number(doc.id) || u.id,
                identifier: u.identifier,
                fullName: u.fullName,
                email: u.email,
                role: u.role,
                departmentId: Number(u.departmentId) || 1,
                academicLevel: u.academicLevel ? Number(u.academicLevel) : null,
                avatar: u.avatar || (u.role === 'LECTURER' ? '👨‍🏫' : '🎓'),
                hasBiometrics: !!u.hasBiometrics,
                fingerTemplate: u.fingerTemplate || null,
                credentialId: u.credentialId || null
              };
            });
            const userMap = new Map();
            (data.users || []).forEach(u => userMap.set(Number(u.id), u));
            cloudUsers.forEach(u => userMap.set(Number(u.id), u));
            data.users = Array.from(userMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
            window.smartBioData.save(data);
            window.dispatchEvent(new CustomEvent('smartbio:users_updated', { detail: data.users }));
          }
        }, (error) => {
          console.warn('Firestore users listener notice:', error.message);
        });

      // 7. Real-time Course Registrations Listener (SSOT)
      this.db.collection('courseRegistrations')
        .onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const data = window.smartBioData.load();
            const cloudRegs = snapshot.docs.map(doc => {
              const r = doc.data();
              return {
                id: Number(r.id) || Number(doc.id) || r.id,
                studentId: Number(r.studentId),
                courseId: Number(r.courseId),
                sessionId: Number(r.sessionId) || 1
              };
            });
            const regMap = new Map();
            (data.courseRegistrations || []).forEach(r => regMap.set(`${r.studentId}_${r.courseId}`, r));
            cloudRegs.forEach(r => regMap.set(`${r.studentId}_${r.courseId}`, r));
            data.courseRegistrations = Array.from(regMap.values());
            window.smartBioData.save(data);
            window.dispatchEvent(new CustomEvent('smartbio:registrations_updated', { detail: data.courseRegistrations }));
          }
        }, (error) => {
          console.warn('Firestore registrations listener notice:', error.message);
        });
    } catch (e) {
      console.warn('Could not attach Firestore listeners:', e);
    }
  }

  // Broadcast Active Lecture Session to Cloud
  async broadcastActiveSession(session) {
    if (this.isConnected && this.db) {
      try {
        await this.db.collection('lecture_sessions').doc('active_session').set({
          ...session,
          status: 'ACTIVE',
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Active session broadcast skipped:', e.message);
      }
    }
  }

  // End Active Lecture Session in Cloud
  async endActiveSessionCloud(session = null) {
    if (this.isConnected && this.db) {
      try {
        // 1. Mark active_session document as CONCLUDED so snapshot listeners react immediately
        await this.db.collection('lecture_sessions').doc('active_session').set({
          status: 'CONCLUDED',
          endedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 2. Archive to permanent sessions collection if session object provided
        if (session && session.id) {
          await this.db.collection('lecture_sessions').doc(String(session.id)).set({
            ...session,
            status: 'CONCLUDED',
            endedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }

        // 3. Clean up active_session pointer
        try {
          await this.db.collection('lecture_sessions').doc('active_session').delete();
        } catch (delErr) {
          // If delete permissions fail, status is already CONCLUDED
        }
      } catch (e) {
        console.warn('Active session end skipped:', e.message);
      }
    }
  }

  // Push new attendance record to Cloud + Local Store
  async recordAttendance(record) {
    // Ensure timestamp & formatted time exist
    record.timestamp = record.timestamp || new Date().toISOString();
    record.time = record.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Save to Local Store first (idempotent check inside addAttendance)
    const saved = window.smartBioData.addAttendance(record);
    if (!saved) {
      return null; // duplicate check-in prevented
    }

    const recId = String(saved.id || record.id || Date.now());
    if (this.recentLocalAttendance) {
      this.recentLocalAttendance.add(recId);
      if (this.recentLocalAttendance.size > 100) {
        const firstKey = this.recentLocalAttendance.values().next().value;
        this.recentLocalAttendance.delete(firstKey);
      }
    }

    // 2. Broadcast via Firestore Cloud with explicit timestamp and doc ID
    if (this.isConnected && this.db) {
      try {
        await this.db.collection('attendance_records').doc(recId).set({
          ...record,
          id: saved.id || record.id,
          timestamp: saved.timestamp || record.timestamp,
          time: saved.time || record.time,
          serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn('Cloud sync skipped (using local):', e.message);
      }
    }

    // 3. Emit event locally
    window.dispatchEvent(new CustomEvent('smartbio:attendance_stream', { detail: saved || record }));
    return saved;
  }

  // Push new flagged exception to Cloud + Local Store
  async recordFlaggedException(exception) {
    window.smartBioData.addFlaggedException(exception);

    if (this.isConnected && this.db) {
      try {
        await this.db.collection('flagged_exceptions').doc(String(exception.id)).set({
          ...exception,
          serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Cloud flag sync skipped:', e.message);
      }
    }

    window.dispatchEvent(new CustomEvent('smartbio:flagged_update', { detail: window.smartBioData.getFlagged() }));
  }

  // Resolve Flagged Exception on Cloud & Local
  async resolveFlaggedException(exceptionId, resolvedByLecturerId, action, notes) {
    const success = window.smartBioData.resolveFlaggedException(exceptionId, resolvedByLecturerId, action, notes);

    if (this.isConnected && this.db) {
      try {
        await this.db.collection('flagged_exceptions').doc(String(exceptionId)).delete();
        
        // Write audit trail document to Firestore
        await this.db.collection('audit_logs').add({
          exceptionId,
          resolvedByLecturerId,
          action,
          notes,
          timestamp: new Date().toISOString(),
          serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Cloud flag resolve skipped:', e.message);
      }
    }

    window.dispatchEvent(new CustomEvent('smartbio:flagged_update', { detail: window.smartBioData.getFlagged() }));
    return success;
  }

  // 1-Click Cloud Database Seeder (Uploads all university datasets to Firestore)
  async seedCloudDatabase() {
    if (!this.isConnected || !this.db) {
      const initialized = await this.initializeFirebase();
      if (!initialized) {
        throw new Error('Firebase SDK is initializing or offline. Please ensure Cloud Firestore is enabled in Firebase Console.');
      }
    }

    try {
      const data = window.smartBioData.load();
      const batch = this.db.batch();

      // 1. Seed Users
      data.users.forEach(user => {
        const ref = this.db.collection('users').doc(String(user.id));
        batch.set(ref, user);
      });

      // 2. Seed Courses
      data.courses.forEach(course => {
        const ref = this.db.collection('courses').doc(String(course.id));
        batch.set(ref, course);
      });

      // 3. Seed Departments
      data.departments.forEach(dept => {
        const ref = this.db.collection('departments').doc(String(dept.id));
        batch.set(ref, dept);
      });

      await batch.commit();
      console.log('✅ Google Cloud Firestore populated with university datasets!');

      // 4. Optionally provision corresponding Firebase Auth accounts
      if (this.auth) {
        console.log('🔐 Provisioning demo Firebase Auth accounts...');
        for (const user of data.users) {
          try {
            await this.auth.createUserWithEmailAndPassword(user.email, 'password123');
            console.log(`✓ Created Firebase Auth account for: ${user.email}`);
          } catch (authErr) {
            if (authErr.code === 'auth/email-already-in-use') {
              console.log(`Account ${user.email} already registered in Firebase Auth.`);
            } else {
              console.warn(`Auth creation notice for ${user.email}:`, authErr.message);
            }
          }
        }
      }

      return true;
    } catch (err) {
      console.error('Firestore Seed Error:', err);
      if (err.code === 'permission-denied') {
        throw new Error('Firestore Security Rules Denied: In Firebase Console -> Firestore -> Rules, set: allow read, write: if true;');
      } else if (err.code === 'not-found' || err.message.includes('NOT_FOUND')) {
        throw new Error('Firestore Database not created yet. In Firebase Console -> Build -> Firestore Database, click "Create Database".');
      } else {
        throw err;
      }
    }
  }

  // Purge test insertions (attendance & flags) while retaining and normalizing users, departments, and courses with clean unique IDs
  async cleanFirestoreAndNormalizeUniqueIds() {
    if (!this.isConnected || !this.db) {
      const initialized = await this.initializeFirebase();
      if (!initialized) throw new Error('Firebase Cloud Firestore is offline. Check API credentials.');
    }

    try {
      console.log('🧹 Purging test insertions from Firestore...');

      // 1. Delete all attendance_records (test scans)
      const attSnap = await this.db.collection('attendance_records').get();
      if (!attSnap.empty) {
        const attBatch = this.db.batch();
        attSnap.forEach(doc => attBatch.delete(doc.ref));
        await attBatch.commit();
        console.log(`✓ Purged ${attSnap.size} test attendance records.`);
      }

      // 2. Delete all flagged_exceptions (test exceptions)
      const flagSnap = await this.db.collection('flagged_exceptions').get();
      if (!flagSnap.empty) {
        const flagBatch = this.db.batch();
        flagSnap.forEach(doc => flagBatch.delete(doc.ref));
        await flagBatch.commit();
        console.log(`✓ Purged ${flagSnap.size} test flagged exceptions.`);
      }

      // 3. Clear active lecture session doc
      await this.db.collection('lecture_sessions').doc('active_session').delete().catch(() => {});

      // 4. Update / Normalize permanent datasets with unified system-wide unique IDs
      const data = window.smartBioData.load();
      const normBatch = this.db.batch();

      // Users: doc ID = user.id (1, 2, 3...) or user.identifier
      data.users.forEach(u => {
        const uRef = this.db.collection('users').doc(String(u.id));
        normBatch.set(uRef, {
          ...u,
          systemUid: `GWU-USR-${String(u.id).padStart(4, '0')}`,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });

      // Departments: doc ID = dept.id
      data.departments.forEach(d => {
        const dRef = this.db.collection('departments').doc(String(d.id));
        normBatch.set(dRef, {
          ...d,
          systemUid: `GWU-DEPT-${d.code}`,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });

      // Courses: doc ID = course.id
      data.courses.forEach(c => {
        const cRef = this.db.collection('courses').doc(String(c.id));
        normBatch.set(cRef, {
          ...c,
          systemUid: `GWU-CRS-${c.code.replace(/\s+/g, '')}`,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });

      await normBatch.commit();
      console.log('✅ Firestore sanitized: test records purged; authentic users, depts, and courses normalized.');
      return true;
    } catch (err) {
      console.error('Clean Firestore Error:', err);
      throw err;
    }
  }

  // Full JSON Data Exporter from Google Cloud Firestore
  async exportFirestoreDataAsJSON() {
    if (!this.isConnected || !this.db) {
      const initialized = await this.initializeFirebase();
      if (!initialized) {
        throw new Error('Google Cloud Firestore is offline. Check API credentials or network.');
      }
    }

    try {
      console.log('📥 Exporting complete Firestore dataset...');
      const collections = [
        'users',
        'departments',
        'courses',
        'courseRegistrations',
        'lecture_sessions',
        'attendance_records',
        'flagged_exceptions',
        'audit_logs'
      ];

      const exportPayload = {
        metadata: {
          system: 'Global Wealth University SmartBio Attendance System',
          exportTimestamp: new Date().toISOString(),
          source: 'Google Cloud Firestore',
          schemaVersion: '2.0-FIDO2-RBAC'
        },
        collections: {}
      };

      for (const col of collections) {
        try {
          const snap = await this.db.collection(col).get();
          exportPayload.collections[col] = snap.docs.map(doc => ({
            _id: doc.id,
            ...doc.data()
          }));
        } catch (e) {
          console.warn(`Could not export collection ${col}:`, e.message);
          exportPayload.collections[col] = [];
        }
      }

      // Trigger automatic JSON download
      const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `gwu_smartbio_firestore_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      return exportPayload;
    } catch (err) {
      console.error('Firestore Export Error:', err);
      throw err;
    }
  }

  updateSyncUI(statusText) {
    const el = document.getElementById('cloudStatusText');
    const dot = document.getElementById('cloudSyncDot');
    const modalBadge = document.getElementById('cloudModalStatusBadge');

    if (el) el.innerText = this.isConnected ? 'Online' : 'Local Mode';
    if (dot) {
      if (this.isConnected) {
        dot.classList.remove('offline');
      } else {
        dot.classList.add('offline');
      }
    }
    if (modalBadge) {
      modalBadge.className = `badge ${this.isConnected ? 'badge-eligible' : 'badge-at-risk'}`;
      modalBadge.innerText = this.isConnected ? '🟢 ONLINE (LIVE FIRESTORE)' : '🟠 LOCAL STORAGE (OFFLINE)';
    }
  }
}

window.smartBioCloud = new CloudSyncEngine();

// Auto-boot Firebase Cloud connection on startup
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartBioCloud.initializeFirebase();
  });
} else {
  window.smartBioCloud.initializeFirebase();
}
