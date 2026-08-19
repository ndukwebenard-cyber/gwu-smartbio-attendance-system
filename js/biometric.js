/**
 * SMARTBIO ATTENDANCE SYSTEM - BIOMETRIC VERIFICATION & WEBAUTHN ENGINE
 * Modular Biometric Abstraction Layer (WebAuthn FIDO2 + Optical Hardware Simulation)
 */

// ── Base Biometric Provider Interface ──────────────────────────────────────
class BiometricProvider {
  constructor(name, type) {
    this.name = name;
    this.type = type; // 'WEBAUTHN_HARDWARE' | 'SIMULATION'
  }

  async enroll(user) {
    throw new Error('enroll() must be implemented by subclass');
  }

  async verify(user, options) {
    throw new Error('verify() must be implemented by subclass');
  }

  getStatus() {
    return { name: this.name, type: this.type, ready: true };
  }
}

// ── 1. WebAuthn FIDO2 Passkey Provider (Hardware Security / Windows Hello) ─
class WebAuthnProvider extends BiometricProvider {
  constructor() {
    super('WebAuthn FIDO2 / Passkey Authenticator', 'WEBAUTHN_HARDWARE');
    this.rpId = window.location.hostname || 'localhost';
    this.rpName = 'Global Wealth University SmartBio';
  }

  isSupported() {
    return !!(window.PublicKeyCredential && window.navigator.credentials);
  }

  // Generate cryptographically secure random challenge buffer
  generateChallenge() {
    const buffer = new Uint8Array(32);
    window.crypto.getRandomValues(buffer);
    return buffer;
  }

  // Convert ArrayBuffer to Base64URL string
  bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Convert Base64URL string to Uint8Array buffer
  base64ToBuffer(base64Url) {
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  // Step A: Registration / Enrollment via navigator.credentials.create()
  async enroll(user) {
    if (!this.isSupported()) {
      throw new Error('WebAuthn FIDO2 API is not supported in this browser environment.');
    }

    const challenge = this.generateChallenge();
    const userIdBuffer = new TextEncoder().encode(user.identifier || user.email);

    const publicKeyOptions = {
      challenge: challenge,
      rp: {
        id: this.rpId,
        name: this.rpName
      },
      user: {
        id: userIdBuffer,
        name: user.email,
        displayName: user.fullName
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256 (ECDSA)
        { alg: -257, type: 'public-key' } // RS256 (RSA)
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Built-in Touch ID, Windows Hello, Face ID
        userVerification: 'preferred',
        requireResidentKey: false
      },
      timeout: 60000,
      attestation: 'none'
    };

    const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
    const rawIdBase64 = this.bufferToBase64(credential.rawId);

    // Securely package registered credential metadata
    const registeredCredential = {
      credentialId: rawIdBase64,
      algorithm: -7,
      type: 'public-key',
      enrolledAt: new Date().toISOString(),
      userIdentifier: user.identifier
    };

    return {
      success: true,
      provider: 'WEBAUTHN',
      method: 'WEBAUTHN_BIOMETRIC',
      credentialId: rawIdBase64,
      credentialData: registeredCredential,
      confidence: 99.9,
      statusLabel: 'FIDO2 Passkey Enrolled'
    };
  }

  // Step B: Authentication / Assertion Verification via navigator.credentials.get()
  async verify(user, options = {}) {
    if (!this.isSupported()) {
      throw new Error('WebAuthn API not available.');
    }

    const challenge = this.generateChallenge();
    const allowCredentials = [];

    // If user has registered credential ID, bind assertion to it
    if (user && user.credentialId) {
      allowCredentials.push({
        id: this.base64ToBuffer(user.credentialId),
        type: 'public-key',
        transports: ['internal', 'hybrid', 'usb', 'nfc', 'ble']
      });
    }

    const getOptions = {
      challenge: challenge,
      rpId: this.rpId,
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: allowCredentials.length ? allowCredentials : undefined
    };

    const assertion = await navigator.credentials.get({ publicKey: getOptions });
    if (!assertion || !assertion.id) {
      throw new Error('WebAuthn verification failed: no assertion returned.');
    }

    return {
      success: true,
      provider: 'WEBAUTHN',
      method: 'WEBAUTHN_BIOMETRIC',
      credentialId: assertion.id,
      confidence: 99.9,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
}

// ── 2. Optical Hardware Scanner Simulation Provider ────────────────────────
class SimulatedFingerprintProvider extends BiometricProvider {
  constructor() {
    super('Optical Fingerprint Sensor (Defense Simulation Mode)', 'SIMULATION');
  }

  async verify(user, { testMode = 'NORMAL', sessionId = 1 } = {}) {
    // Artificial physical optical scanner capture delay (1.0s)
    await new Promise(r => setTimeout(r, 1000));

    switch (testMode) {
      case 'NORMAL':
        return {
          success: true,
          status: 'PRESENT',
          provider: 'SIMULATED_OPTICAL',
          method: 'OPTICAL_FINGERPRINT_SIM',
          confidence: Number((96.5 + Math.random() * 3.2).toFixed(1)),
          student: user,
          sessionId: sessionId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

      case 'SWEATY_RIDGE':
      case 'INJURED_FINGER':
        return {
          success: false,
          status: 'FLAGGED',
          provider: 'SIMULATED_OPTICAL',
          flagReason: testMode === 'SWEATY_RIDGE' ? 'SWEATY_RIDGE_BLURRED' : 'INJURED_FINGER_LOW_RIDGE',
          confidence: Number((45.0 + Math.random() * 8.0).toFixed(1)),
          student: user,
          sessionId: sessionId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

      case 'NON_ENROLLED':
      default:
        return {
          success: false,
          status: 'REJECTED',
          provider: 'SIMULATED_OPTICAL',
          flagReason: 'FINGERPRINT_NOT_REGISTERED',
          confidence: 12.4,
          student: null,
          sessionId: sessionId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }
  }
}

// ── 3. High-Level Biometric Orchestration Engine ───────────────────────────
class BiometricEngine {
  constructor() {
    this.webAuthn = new WebAuthnProvider();
    this.simulator = new SimulatedFingerprintProvider();
    this.isScanning = false;
  }

  // Attempt WebAuthn hardware passkey verification
  async authenticateWithWebAuthn(user) {
    return await this.webAuthn.verify(user);
  }

  // Register WebAuthn passkey
  async enrollWebAuthn(user) {
    return await this.webAuthn.enroll(user);
  }

  // Run optical scanner simulation with sensory UI updates
  async simulateOpticalScan({ studentId = 4, testMode = 'NORMAL', sessionId = 1 } = {}) {
    if (this.isScanning) return null;
    this.isScanning = true;

    // Visual & Audio platen activation
    if (window.smartBioAudio) window.smartBioAudio.playScanLaser();
    this.setPlatenVisualState('scanning');

    const student = window.smartBioData.getUserById(studentId);
    const result = await this.simulator.verify(student, { testMode, sessionId });

    if (result.status === 'PRESENT') {
      this.setPlatenVisualState('success');
      if (window.smartBioAudio) window.smartBioAudio.playSuccessChime();
    } else if (result.status === 'FLAGGED') {
      this.setPlatenVisualState('flagged');
      if (window.smartBioAudio) window.smartBioAudio.playFlaggedWarning();
    } else {
      this.setPlatenVisualState('error');
      if (window.smartBioAudio) window.smartBioAudio.playErrorBuzz();
    }

    this.isScanning = false;
    setTimeout(() => this.clearPlatenVisualState(), 2800);
    return result;
  }

  setPlatenVisualState(state) {
    const platen = document.getElementById('opticalPlaten');
    if (platen) platen.className = 'optical-platen-wrapper ' + state;
  }

  clearPlatenVisualState() {
    const platen = document.getElementById('opticalPlaten');
    if (platen) platen.className = 'optical-platen-wrapper';
  }
}

// Attach singleton
window.smartBioBiometric = new BiometricEngine();

