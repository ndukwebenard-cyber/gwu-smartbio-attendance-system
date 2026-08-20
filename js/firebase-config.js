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
        this.setupRealtimeListeners();

        // Listen to online / offline network transitions
        window.addEventListener('online', () => {
          this.isConnected = true;
          this.updateSyncUI();
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

      // 4. Sync attendance records accumulated while offline
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

      // 5. Sync flagged exceptions accumulated while offline
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
      this.db.collection('attendance_records')
        .orderBy('timestamp', 'desc')
        .limit(30)
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const record = change.doc.data();
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
          if (doc.exists) {
            const sessionData = doc.data();
            window.dispatchEvent(new CustomEvent('smartbio:session_update', { detail: sessionData }));
          } else {
            // Only broadcast end if no active session is persisted in local storage
            let localSess = null;
            try {
              localSess = localStorage.getItem('smartbio_active_session');
            } catch (e) {}
            if (!localSess) {
              window.dispatchEvent(new CustomEvent('smartbio:session_update', { detail: null, isExplicitEnd: true }));
            }
          }
        }, (error) => {
          console.warn('Firestore active session listener notice:', error.message);
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
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Active session broadcast skipped:', e.message);
      }
    }
  }

  // End Active Lecture Session in Cloud
  async endActiveSessionCloud() {
    if (this.isConnected && this.db) {
      try {
        await this.db.collection('lecture_sessions').doc('active_session').delete();
      } catch (e) {
        console.warn('Active session end skipped:', e.message);
      }
    }
  }

  // Push new attendance record to Cloud + Local Store
  async recordAttendance(record) {
    // 1. Save to Local Store first (idempotent check inside addAttendance)
    const saved = window.smartBioData.addAttendance(record);
    if (!saved) {
      return null; // duplicate check-in prevented
    }

    // 2. Broadcast via Firestore Cloud
    if (this.isConnected && this.db) {
      try {
        await this.db.collection('attendance_records').add({
          ...record,
          serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Cloud sync skipped (using local):', e.message);
      }
    }

    // 3. Emit event locally
    window.dispatchEvent(new CustomEvent('smartbio:attendance_stream', { detail: record }));
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
