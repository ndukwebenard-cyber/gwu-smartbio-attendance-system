/**
 * SMARTBIO ATTENDANCE SYSTEM - FIREBASE REAL-TIME MULTI-DEVICE SYNC ENGINE
 * Cloud Firestore Real-time WebSockets with Seamless Offline/Demo Fallback
 */

class CloudSyncEngine {
  constructor() {
    this.CONFIG_STORAGE_KEY = 'smartbio_firebase_cfg';
    this.config = this.loadConfig();
    this.isConnected = false;
    this.db = null;
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
        this.isConnected = true;
        this.updateSyncUI('ONLINE (FIREBASE CLOUD)');
        this.setupRealtimeListeners();
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
      scriptApp.src = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js';
      scriptApp.onload = () => {
        const scriptFirestore = document.createElement('script');
        scriptFirestore.src = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js';
        scriptFirestore.onload = () => resolve(true);
        scriptFirestore.onerror = reject;
        document.head.appendChild(scriptFirestore);
      };
      scriptApp.onerror = reject;
      document.head.appendChild(scriptApp);
    });
  }

  setupRealtimeListeners() {
    if (!this.db) return;

    // Listen to real-time attendance stream
    this.db.collection('attendance')
      .orderBy('timestamp', 'desc')
      .limit(30)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            window.dispatchEvent(new CustomEvent('smartbio:attendance_stream', { detail: data }));
          }
        });
      }, (error) => {
        console.warn('Firestore live listener error', error);
      });

    // Listen to live flagged exceptions
    this.db.collection('flagged_exceptions')
      .onSnapshot((snapshot) => {
        const flags = [];
        snapshot.forEach(doc => flags.push({ id: doc.id, ...doc.data() }));
        window.dispatchEvent(new CustomEvent('smartbio:flagged_update', { detail: flags }));
      });
  }

  // Push new attendance record to Cloud + Local Store
  async recordAttendance(record) {
    // 1. Save to Local Store first (Instant responsiveness)
    window.smartBioData.addAttendance(record);

    // 2. Broadcast via cloud if connected
    if (this.isConnected && this.db) {
      try {
        await this.db.collection('attendance').add({
          ...record,
          cloudSyncedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Failed to sync attendance to cloud', e);
      }
    }

    // 3. Emit local event for immediate multi-view update
    window.dispatchEvent(new CustomEvent('smartbio:attendance_stream', { detail: record }));
  }

  // Push new flagged exception to Cloud + Local Store
  async recordFlaggedException(exception) {
    window.smartBioData.addFlaggedException(exception);

    if (this.isConnected && this.db) {
      try {
        await this.db.collection('flagged_exceptions').doc(String(exception.id)).set({
          ...exception,
          cloudSyncedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Failed to sync flag to cloud', e);
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
      } catch (e) {
        console.warn('Failed to delete resolved cloud flag', e);
      }
    }

    window.dispatchEvent(new CustomEvent('smartbio:flagged_update', { detail: window.smartBioData.getFlagged() }));
    return success;
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
