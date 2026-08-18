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

  async initializeFirebase() {
    if (!this.config || !this.config.apiKey || !this.config.projectId) {
      this.isConnected = false;
      this.updateSyncUI('OFFLINE / LOCAL STORAGE');
      return false;
    }

    try {
      // Dynamic load of Firebase Web SDK if not already loaded
      if (!window.firebase) {
        await this.loadFirebaseSDK();
      }

      if (window.firebase) {
        if (!firebase.apps.length) {
          firebase.initializeApp(this.config);
        }
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.isConnected = true;
        this.updateSyncUI('LIVE CLOUD (FIREBASE)');
        this.setupRealtimeListeners();
        console.log('⚡ Firebase Cloud Firestore Connected successfully to gwu-smartbio-attendance-system');
        return true;
      }
    } catch (e) {
      console.error('Firebase initialization error:', e);
      this.isConnected = false;
      this.updateSyncUI('CLOUD ERROR (USING LOCAL)');
      return false;
    }
  }

  loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
      const scriptApp = document.createElement('script');
      scriptApp.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js';
      scriptApp.onload = () => {
        const scriptAuth = document.createElement('script');
        scriptAuth.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js';
        
        const scriptFirestore = document.createElement('script');
        scriptFirestore.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js';

        let loaded = 0;
        const checkDone = () => {
          loaded++;
          if (loaded === 2) resolve(true);
        };

        scriptAuth.onload = checkDone;
        scriptFirestore.onload = checkDone;
        scriptAuth.onerror = reject;
        scriptFirestore.onerror = reject;

        document.head.appendChild(scriptAuth);
        document.head.appendChild(scriptFirestore);
      };
      scriptApp.onerror = reject;
      document.head.appendChild(scriptApp);
    });
  }

  setupRealtimeListeners() {
    if (!this.db) return;

    // 1. Real-time Attendance Stream (Prepend live scans across all devices)
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
        console.warn('Firestore attendance listener:', error);
      });

    // 2. Real-time Flagged Exceptions Queue
    this.db.collection('flagged_exceptions')
      .onSnapshot((snapshot) => {
        const flags = [];
        snapshot.forEach(doc => flags.push({ id: doc.id, ...doc.data() }));
        window.dispatchEvent(new CustomEvent('smartbio:flagged_update', { detail: flags }));
      }, (error) => {
        console.warn('Firestore flagged queue listener:', error);
      });

    // 3. Real-time Active Lecture Sessions
    this.db.collection('lecture_sessions')
      .where('status', '==', 'ACTIVE')
      .limit(1)
      .onSnapshot((snapshot) => {
        snapshot.forEach(doc => {
          const session = { id: doc.id, ...doc.data() };
          window.dispatchEvent(new CustomEvent('smartbio:session_active', { detail: session }));
        });
      }, (error) => {
        console.warn('Firestore session listener:', error);
      });
  }

  // Push new attendance record to Cloud + Local Store
  async recordAttendance(record) {
    // 1. Save to Local Store first (instant zero-lag UI response)
    window.smartBioData.addAttendance(record);

    // 2. Broadcast via Firestore Cloud
    if (this.isConnected && this.db) {
      try {
        await this.db.collection('attendance_records').add({
          ...record,
          serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Failed to sync attendance to cloud:', e);
      }
    }

    // 3. Emit event locally
    window.dispatchEvent(new CustomEvent('smartbio:attendance_stream', { detail: record }));
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
        console.warn('Failed to sync flag to cloud:', e);
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
        console.warn('Failed to resolve cloud flag:', e);
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
        alert('Could not connect to Firebase Firestore. Please check your internet connection.');
        return false;
      }
    }

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
    return true;
  }

  updateSyncUI(statusText) {
    const el = document.getElementById('cloudStatusText');
    const dot = document.getElementById('cloudSyncDot');
    if (el) el.innerText = statusText;
    if (dot) {
      if (this.isConnected) {
        dot.classList.remove('offline');
      } else {
        dot.classList.add('offline');
      }
    }
  }
}

window.smartBioCloud = new CloudSyncEngine();
