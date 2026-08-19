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
      this.updateSyncUI('OFFLINE / LOCAL STORAGE');
      return false;
    }

    try {
      const sdkReady = await this.ensureFirebaseSDK();

      if (window.firebase && window.firebase.firestore) {
        if (!firebase.apps.length) {
          firebase.initializeApp(this.config);
        }
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.isConnected = true;
        this.updateSyncUI('Online');
        this.setupRealtimeListeners();
        console.log('⚡ Firebase Cloud Firestore connected to', this.config.projectId);
        return true;
      } else {
        console.warn('Firebase SDK not yet loaded or offline');
        this.isConnected = false;
        this.updateSyncUI('Local Mode');
        return false;
      }
    } catch (e) {
      console.error('Firebase initialization error:', e);
      this.isConnected = false;
      this.updateSyncUI('Local Mode');
      return false;
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
            window.dispatchEvent(new CustomEvent('smartbio:session_update', { detail: null }));
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
