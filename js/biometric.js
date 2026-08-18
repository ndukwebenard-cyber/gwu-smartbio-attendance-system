/**
 * SMARTBIO ATTENDANCE SYSTEM - BIOMETRIC VERIFICATION & WEBAUTHN ENGINE
 * WebAuthn Asymmetric Browser Biometrics + Optical Hardware Simulator
 */

class BiometricEngine {
  constructor() {
    this.isScanning = false;
  }

  // 1. Native Browser WebAuthn Biometric Authentication
  async authenticateWithWebAuthn(user) {
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn API is not supported in this browser environment.');
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyOptions = {
        challenge: challenge,
        timeout: 60000,
        userVerification: 'required',
        rp: {
          name: 'Global Wealth University SmartBio'
        },
        user: {
          id: new TextEncoder().encode(user.identifier),
          name: user.email,
          displayName: user.fullName
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }] // ES256
      };

      // Call browser WebAuthn prompt
      const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
      return {
        success: true,
        method: 'WEBAUTHN_BIOMETRIC',
        confidence: 99.8,
        credentialId: credential.id
      };
    } catch (err) {
      console.warn('WebAuthn prompt cancelled or unavailable:', err);
      throw err;
    }
  }

  // 2. Optical Hardware Scanner Simulation
  async simulateOpticalScan({ studentId = 4, testMode = 'NORMAL', sessionId = 10 } = {}) {
    if (this.isScanning) return;
    this.isScanning = true;

    // Start audio & visual effects
    window.smartBioAudio.playScanLaser();
    this.setPlatenVisualState('scanning');

    // Simulate hardware processing delay (1.2s)
    await new Promise(r => setTimeout(r, 1200));

    const student = window.smartBioData.getUserById(studentId);
    let result = null;

    switch (testMode) {
      case 'NORMAL':
        // High confidence instant match
        result = {
          success: true,
          status: 'PRESENT',
          method: 'OPTICAL_FINGERPRINT',
          confidence: (96.5 + Math.random() * 3.2).toFixed(1),
          student: student,
          sessionId: sessionId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.setPlatenVisualState('success');
        window.smartBioAudio.playSuccessChime();
        break;

      case 'SWEATY_RIDGE':
      case 'INJURED_FINGER':
        // Literature gap solved: Flagged Exception Workflow!
        result = {
          success: false,
          status: 'FLAGGED',
          flagReason: testMode === 'SWEATY_RIDGE' ? 'SWEATY_RIDGE_BLURRED' : 'INJURED_FINGER_LOW_RIDGE',
          confidence: (45.0 + Math.random() * 8.0).toFixed(1),
          student: student,
          sessionId: sessionId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.setPlatenVisualState('flagged');
        window.smartBioAudio.playFlaggedWarning();
        break;

      case 'NON_ENROLLED':
        // Unregistered finger / stranger
        result = {
          success: false,
          status: 'REJECTED',
          flagReason: 'FINGERPRINT_NOT_REGISTERED',
          confidence: 12.4,
          student: null,
          sessionId: sessionId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.setPlatenVisualState('error');
        window.smartBioAudio.playErrorBuzz();
        break;
    }

    this.isScanning = false;
    setTimeout(() => {
      this.clearPlatenVisualState();
    }, 2800);

    return result;
  }

  setPlatenVisualState(state) {
    const platen = document.getElementById('opticalPlaten');
    if (!platen) return;
    platen.className = 'optical-platen-wrapper ' + state;
  }

  clearPlatenVisualState() {
    const platen = document.getElementById('opticalPlaten');
    if (!platen) return;
    platen.className = 'optical-platen-wrapper';
  }
}

window.smartBioBiometric = new BiometricEngine();
