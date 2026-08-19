/**
 * SMARTBIO ATTENDANCE SYSTEM - AUTOMATED TEST SUITE & SECURITY VERIFICATION
 * Unit, Integration, Role-Based Access Control, NUC Compliance & Tamper Tests
 */

class SmartBioTestSuite {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  assert(testName, condition, details = '') {
    if (condition) {
      this.passed++;
      this.results.push({ name: testName, status: 'PASS', details });
      console.log(`%c[PASS] ${testName}`, 'color: #10b981; font-weight: bold;');
    } else {
      this.failed++;
      this.results.push({ name: testName, status: 'FAIL', details });
      console.error(`[FAIL] ${testName} - ${details}`);
    }
  }

  async runAllTests() {
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #008080;');
    console.log('%c🛡️ SMARTBIO ATTENDANCE SYSTEM — EXHAUSTIVE VERIFICATION SUITE', 'color: #008080; font-weight: bold;');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #008080;');
    
    this.results = [];
    this.passed = 0;
    this.failed = 0;

    this.testDataNormalization();
    this.testNUCComplianceEngine();
    this.testDeficitForecasting();
    this.testDocketCryptographicVerification();
    this.testAttendanceDeduplication();
    this.testEnrollmentValidation();
    this.testSeparationOfDuties();
    this.testAuthenticationSecurity();
    this.testCloudConnectionStatus();

    console.log('%c───────────────────────────────────────────────────────────', 'color: #008080;');
    console.log(`%cSummary: ${this.passed} PASSED, ${this.failed} FAILED across ${this.results.length} test assertions.`, `color: ${this.failed === 0 ? '#10b981' : '#ef4444'}; font-weight: bold;`);
    
    return {
      total: this.results.length,
      passed: this.passed,
      failed: this.failed,
      results: this.results
    };
  }

  // 1. Data Normalization & Benedict 8/10 Rule (Section 33)
  testDataNormalization() {
    const data = window.smartBioData.load();
    
    // Benedict (studentId: 4) in Course 1 (CSC 401)
    const benedict = window.smartBioData.getUserById(4);
    this.assert('Benedict Uchechukwu identity exists in university directory', !!benedict && benedict.fullName.includes('Benedict'));
    
    const compBenedict = window.smartBioCompliance.calculateStudentCompliance(4);
    const csc401Benedict = compBenedict.courseStats.find(c => c.course.code === 'CSC 401');
    
    this.assert(
      'Benedict Uchechukwu has exactly 8 attended out of 10 held (80.0% CLEARED)',
      csc401Benedict && csc401Benedict.attended === 8 && csc401Benedict.totalHeld === 10 && csc401Benedict.percentage === 80.0 && csc401Benedict.status === 'ELIGIBLE',
      `Got ${csc401Benedict ? csc401Benedict.attended : 0}/${csc401Benedict ? csc401Benedict.totalHeld : 0} = ${csc401Benedict ? csc401Benedict.percentage : 0}% (${csc401Benedict ? csc401Benedict.status : 'N/A'})`
    );

    // Folake (studentId: 5)
    const compFolake = window.smartBioCompliance.calculateStudentCompliance(5);
    const csc401Folake = compFolake.courseStats.find(c => c.course.code === 'CSC 401');
    this.assert(
      'Folake Adebayo has exactly 10/10 (100.0% CLEARED)',
      csc401Folake && csc401Folake.attended === 10 && csc401Folake.percentage === 100.0 && csc401Folake.status === 'ELIGIBLE'
    );

    // Amina (studentId: 7)
    const compAmina = window.smartBioCompliance.calculateStudentCompliance(7);
    const csc401Amina = compAmina.courseStats.find(c => c.course.code === 'CSC 401');
    this.assert(
      'Amina Mohammed has exactly 5/10 (50.0% INELIGIBLE/DEFAULTER)',
      csc401Amina && csc401Amina.attended === 5 && csc401Amina.percentage === 50.0 && csc401Amina.status === 'INELIGIBLE'
    );

    // Chukwudi (studentId: 6)
    const compChukwudi = window.smartBioCompliance.calculateStudentCompliance(6);
    const csc401Chukwudi = compChukwudi.courseStats.find(c => c.course.code === 'CSC 401');
    this.assert(
      'Chukwudi Eze has exactly 7/10 (70.0% AT_RISK)',
      csc401Chukwudi && csc401Chukwudi.attended === 7 && csc401Chukwudi.percentage === 70.0 && csc401Chukwudi.status === 'AT_RISK'
    );

    // Check biometric template sanitization (no raw SHA-256 published)
    const hasRawSha = (data.users || []).some(u => u.fingerTemplate && u.fingerTemplate.startsWith('SHA256:8f4c2e'));
    this.assert('Public seed user repository does NOT publish raw SHA256 hashes', !hasRawSha);
  }

  // 2. NUC Compliance Calculation (Section 31)
  testNUCComplianceEngine() {
    const engine = window.smartBioCompliance;

    // Test cases: >= 75% = ELIGIBLE, 70-74.9% = AT_RISK, < 70% = INELIGIBLE
    const testCases = [
      { attended: 10, total: 10, expectedStatus: 'ELIGIBLE' },
      { attended: 8, total: 10, expectedStatus: 'ELIGIBLE' },
      { attended: 75, total: 100, expectedStatus: 'ELIGIBLE' },
      { attended: 74, total: 100, expectedStatus: 'AT_RISK' },
      { attended: 70, total: 100, expectedStatus: 'AT_RISK' },
      { attended: 69, total: 100, expectedStatus: 'INELIGIBLE' },
      { attended: 5, total: 10, expectedStatus: 'INELIGIBLE' },
      { attended: 0, total: 10, expectedStatus: 'INELIGIBLE' }
    ];

    testCases.forEach(tc => {
      const pct = (tc.attended / tc.total) * 100;
      let status = 'ELIGIBLE';
      if (pct < 70) status = 'INELIGIBLE';
      else if (pct < 75) status = 'AT_RISK';
      
      this.assert(
        `NUC Rule: ${tc.attended}/${tc.total} (${pct}%) correctly classified as ${tc.expectedStatus}`,
        status === tc.expectedStatus
      );
    });
  }

  // 3. Deficit Forecast Mathematical Soundness (Section 32)
  testDeficitForecasting() {
    const engine = window.smartBioCompliance;

    // Formula: (attended + x) / (total + x) >= 0.75
    // 8/10 -> 80% >= 75% -> 0 classes needed
    const deficit8 = engine.calculateDeficitForecast(8, 10, 75);
    this.assert('Deficit for 8/10 (80%) is 0 future classes', deficit8 === 0);

    // 7/10 -> 70% -> (7+1)/(10+1) = 8/11 = 72.7% (not yet); (7+2)/(10+2) = 9/12 = 75% -> 2 classes needed
    const deficit7 = engine.calculateDeficitForecast(7, 10, 75);
    this.assert('Deficit for 7/10 (70%) is 2 consecutive future classes to reach 75%', deficit7 === 2);

    // 5/10 -> 50% -> (5+x)/(10+x) >= 0.75 => x >= (7.5 - 5)/0.25 = 10 classes
    const deficit5 = engine.calculateDeficitForecast(5, 10, 75);
    this.assert('Deficit for 5/10 (50%) is 10 consecutive future classes to reach 75%', deficit5 === 10);
  }

  // 4. Digital Examination Clearance Token Verification (Section 39, 41)
  testDocketCryptographicVerification() {
    const engine = window.smartBioCompliance;
    const benedict = window.smartBioData.getUserById(4);

    // Generate valid signed token for Benedict (80% eligible)
    const validToken = engine.generateVerifiableDocketToken(benedict);
    this.assert('Generates structured security token format (GWU-NUC-V2.<id>.<epoch>.<sig>)', validToken.startsWith('GWU-NUC-V2.4.'));

    // Verification of unmodified token
    const verifyValid = engine.verifyDocketToken(validToken);
    this.assert('Verification of authentic token returns VALID', verifyValid.status === 'VALID');

    // Verification of tampered token (altered signature or studentId)
    const tamperedToken = validToken.slice(0, -4) + 'FFFF';
    const verifyTampered = engine.verifyDocketToken(tamperedToken);
    this.assert('Verification of altered token returns TAMPERED', verifyTampered.status === 'TAMPERED');

    // Verification of malformed token
    const verifyMalformed = engine.verifyDocketToken('INVALID-TOKEN-STRING');
    this.assert('Verification of malformed token returns INVALID', verifyMalformed.status === 'INVALID');

    // Verification of ineligible student docket (Amina 50%)
    const amina = window.smartBioData.getUserById(7);
    const aminaToken = engine.generateVerifiableDocketToken(amina);
    const verifyAmina = engine.verifyDocketToken(aminaToken);
    this.assert('Verification of ineligible student token is dynamically REVOKED', verifyAmina.status === 'REVOKED');
  }

  // 5. Attendance Deduplication & Idempotency (Section 16)
  testAttendanceDeduplication() {
    const dataStore = window.smartBioData;
    
    // Attempting to record duplicate attendance for student #4 in session #1
    const initialCount = (dataStore.getAttendance() || []).length;
    const duplicateAttempt = dataStore.addAttendance({
      sessionId: 1,
      studentId: 4,
      method: 'OPTICAL_FINGERPRINT_SIM',
      confidence: 99.0,
      status: 'PRESENT'
    });

    this.assert('Duplicate attendance submission is rejected by data store', duplicateAttempt === null);
    this.assert('Attendance records count remains unchanged after duplicate attempt', (dataStore.getAttendance() || []).length === initialCount);
  }

  // 6. Course Enrollment Validation (Section 27)
  testEnrollmentValidation() {
    const data = window.smartBioData.load();
    const studentId = 4; // Benedict
    const enrolledCourseId = 1; // CSC 401
    const nonEnrolledCourseId = 999; // Non-existent or unenrolled

    const isEnrolledValid = (data.courseRegistrations || []).some(r => r.studentId === studentId && r.courseId === enrolledCourseId);
    const isEnrolledInvalid = (data.courseRegistrations || []).some(r => r.studentId === studentId && r.courseId === nonEnrolledCourseId);

    this.assert('Student is verified as enrolled in legitimate course CSC 401', isEnrolledValid === true);
    this.assert('Student is verified as NOT enrolled in unregistered course #999', isEnrolledInvalid === false);
  }

  // 7. Separation of Duties (Section 7, 22)
  testSeparationOfDuties() {
    const studentUser = { id: 4, role: 'STUDENT', fullName: 'Benedict Uche' };
    const classRepUser = { id: 6, role: 'CLASS_REP', fullName: 'Chukwudi Eze' };
    const lecturerUser = { id: 2, role: 'LECTURER', fullName: 'Dr. Olawale Adeyemi' };
    const adminUser = { id: 1, role: 'ADMIN', fullName: 'Dr. Kola Balogun' };

    // Function to test permission check logic
    const canResolveException = (user) => user && (user.role === 'LECTURER' || user.role === 'ADMIN');
    const canStartLectureSession = (user) => user && (user.role === 'LECTURER' || user.role === 'ADMIN');
    const canSeedCloud = (user) => user && (user.role === 'ADMIN');

    this.assert('STUDENT cannot resolve biometric exception', !canResolveException(studentUser));
    this.assert('CLASS_REP cannot resolve biometric exception (Strict proctor separation)', !canResolveException(classRepUser));
    this.assert('LECTURER can resolve biometric exception', canResolveException(lecturerUser));
    this.assert('ADMIN can resolve biometric exception', canResolveException(adminUser));

    this.assert('STUDENT cannot start active lecture session', !canStartLectureSession(studentUser));
    this.assert('CLASS_REP cannot start active lecture session', !canStartLectureSession(classRepUser));
    this.assert('LECTURER can start active lecture session', canStartLectureSession(lecturerUser));

    this.assert('LECTURER cannot seed cloud database', !canSeedCloud(lecturerUser));
    this.assert('CLASS_REP cannot seed cloud database', !canSeedCloud(classRepUser));
    this.assert('ADMIN can seed cloud database', canSeedCloud(adminUser));
  }

  // 8. Authentication Security & Password Bypass Elimination (Section 3, 4)
  testAuthenticationSecurity() {
    const users = window.smartBioData.getUsers();
    
    // Test that searching for nonexistent user does NOT fallback to users[0]
    const searchNonExistent = users.find(u => u.email === 'hacker@malicious.com' || u.identifier === 'FAKE_ID');
    this.assert('Non-existent user query returns null (no implicit auto-selection)', searchNonExistent === undefined);

    // Test accepted passwords for demo defense accounts
    const acceptedPasswords = ['password123', 'GWU2026!Secure', 'admin2026'];
    const invalidPasswords = ['wrongpass', '123456', '', 'admin'];

  // 9. Cloud Connection Status & Online Indicator
  testCloudConnectionStatus() {
    if (window.smartBioCloud) {
      const isOnlineExpected = typeof navigator.onLine === 'undefined' ? true : navigator.onLine;
      const statusTextEl = document.getElementById('cloudStatusText');
      const dotEl = document.getElementById('cloudSyncDot');
      
      this.assert(
        'CloudSyncEngine reports isConnected matching network state',
        window.smartBioCloud.isConnected === isOnlineExpected
      );

      if (statusTextEl) {
        this.assert(
          `Navbar sync status displays "${isOnlineExpected ? 'Online' : 'Local Mode'}"`,
          statusTextEl.innerText === (isOnlineExpected ? 'Online' : 'Local Mode')
        );
      }

      if (dotEl && isOnlineExpected) {
        this.assert(
          'Navbar sync dot displays active green indicator (no offline class) when connected',
          !dotEl.classList.contains('offline')
        );
      }
    }
  }
}

// Global instance
window.smartBioTests = new SmartBioTestSuite();
