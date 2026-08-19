/**
 * SMARTBIO ATTENDANCE SYSTEM - NUC 75% COMPLIANCE & CLEARANCE DOCKET ENGINE
 * Authoritative Defaulter Identification, Deficit Forecasting & Digitally Verifiable Clearance Dockets
 */

class NUCComplianceEngine {
  constructor() {
    this.STATUTORY_MIN_PCT = 75.0;
    this.WARNING_THRESHOLD_PCT = 70.0;
    this.SIGNING_SECRET = 'GWU_NUC_SMARTBIO_AUTHORITATIVE_KEY_2026';
  }

  // Authoritative Deficit Forecast formula:
  // (attended + x) / (totalHeld + x) >= (targetPct / 100)
  // => attended + x >= (targetPct / 100) * totalHeld + (targetPct / 100) * x
  // => x * (1 - targetPct / 100) >= (targetPct / 100) * totalHeld - attended
  // => x >= (targetPct/100 * totalHeld - attended) / (1 - targetPct/100)
  calculateDeficitForecast(attended, totalHeld, targetPct = 75) {
    if (totalHeld === 0) return 0;
    const currentPct = (attended / totalHeld) * 100;
    if (currentPct >= targetPct) return 0;
    
    const targetFrac = targetPct / 100;
    const needed = (targetFrac * totalHeld - attended) / (1 - targetFrac);
    return Math.max(0, Math.ceil(needed));
  }

  // Compute attendance stats for a specific student across all registered courses
  calculateStudentCompliance(studentId) {
    const data = window.smartBioData.load();
    const student = window.smartBioData.getUserById(studentId);
    if (!student) return null;

    const registrations = (data.courseRegistrations || []).filter(r => r.studentId === Number(studentId));
    const courseStats = [];

    registrations.forEach(reg => {
      const course = window.smartBioData.getCourseById(reg.courseId);
      if (!course) return;

      const sessions = (data.lectureSessions || []).filter(s => s.courseId === course.id && s.status === 'CONCLUDED');
      const totalHeld = sessions.length;

      // Find valid attended sessions (PRESENT or FLAGGED_RESOLVED)
      const attended = (data.attendanceRecords || []).filter(a => 
        sessions.some(s => s.id === a.sessionId) && 
        a.studentId === Number(studentId) && 
        (a.status === 'PRESENT' || a.status === 'FLAGGED_RESOLVED')
      ).length;

      const percentage = totalHeld === 0 ? 100 : Number(((attended / totalHeld) * 100).toFixed(1));
      const minThreshold = course.minAttendancePct || this.STATUTORY_MIN_PCT;
      
      let status = 'ELIGIBLE';
      let statusClass = 'badge-eligible';
      let badgeLabel = 'ELIGIBLE (CLEARED)';

      if (totalHeld === 0) {
        status = 'PENDING';
        statusClass = 'badge-at-risk';
        badgeLabel = 'NOT STARTED (0 HELD)';
      } else if (percentage < this.WARNING_THRESHOLD_PCT) {
        status = 'INELIGIBLE';
        statusClass = 'badge-ineligible';
        badgeLabel = 'BARRED (DEFAULTER)';
      } else if (percentage < minThreshold) {
        status = 'AT_RISK';
        statusClass = 'badge-at-risk';
        badgeLabel = 'AT RISK (WARNING)';
      }

      // Calculate authoritative deficit forecast
      const classesNeeded = this.calculateDeficitForecast(attended, totalHeld, minThreshold);

      courseStats.push({
        course,
        courseId: course.id,
        totalHeld,
        attended,
        percentage: totalHeld === 0 ? 0 : percentage,
        status,
        statusClass,
        badgeLabel,
        classesNeeded
      });
    });

    // Overall clearance status across all registered courses
    const allEligible = courseStats.length > 0 && courseStats.every(c => c.status === 'ELIGIBLE' || c.totalHeld === 0);
    const hasDefaulter = courseStats.some(c => c.status === 'INELIGIBLE');
    const hasAtRisk = courseStats.some(c => c.status === 'AT_RISK');

    let overallStatus = 'FULLY CLEARED FOR EXAMS';
    if (hasDefaulter) {
      overallStatus = 'BARRED FROM SOME PAPERS';
    } else if (hasAtRisk) {
      overallStatus = 'CONDITIONAL CLEARANCE (AT RISK)';
    }

    return {
      student,
      courseStats,
      allEligible,
      hasDefaulter,
      hasAtRisk,
      overallStatus
    };
  }

  // Simple synchronous HMAC-like digest generator for tamper detection
  computeSignature(payload) {
    let hash = 0;
    const str = `${payload}:${this.SIGNING_SECRET}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).toUpperCase().padStart(8, '0');
  }

  // Generate Digitally Verifiable Security Token for Examination Docket
  generateVerifiableDocketToken(student) {
    const issueEpoch = Date.now();
    const payload = `${student.identifier}:${student.id}:${issueEpoch}`;
    const sig = this.computeSignature(payload);
    return `GWU-NUC-V2.${student.id}.${issueEpoch}.${sig}`;
  }

  // Authoritatively verify a docket token against current student attendance
  verifyDocketToken(tokenString) {
    if (!tokenString || typeof tokenString !== 'string' || !tokenString.startsWith('GWU-NUC-V2.')) {
      return { status: 'INVALID', reason: 'Malformed token structure or unknown signature version.' };
    }

    const parts = tokenString.split('.');
    if (parts.length !== 4) {
      return { status: 'INVALID', reason: 'Invalid token segment count.' };
    }

    const [, studentIdStr, issueEpochStr, receivedSig] = parts;
    const studentId = Number(studentIdStr);
    const student = window.smartBioData.getUserById(studentId);

    if (!student) {
      return { status: 'NONEXISTENT', reason: 'Student record not found in university directory.' };
    }

    const payload = `${student.identifier}:${student.id}:${issueEpochStr}`;
    const expectedSig = this.computeSignature(payload);

    if (receivedSig !== expectedSig) {
      return { status: 'TAMPERED', reason: 'Cryptographic signature mismatch. Token was modified.' };
    }

    // Check expiration (dockets expire after 180 days)
    const issueTime = Number(issueEpochStr);
    const maxAgeMs = 180 * 24 * 60 * 60 * 1000;
    if (Date.now() - issueTime > maxAgeMs) {
      return { status: 'EXPIRED', reason: 'Examination docket validity window expired.', student };
    }

    // Dynamically recompute current eligibility from authoritative attendance records
    const compliance = this.calculateStudentCompliance(studentId);
    if (!compliance || !compliance.allEligible) {
      return {
        status: 'REVOKED',
        reason: 'Student attendance has dropped below the NUC 75% threshold since docket issuance.',
        student,
        compliance
      };
    }

    return {
      status: 'VALID',
      reason: 'Authoritative NUC 75% Biometric Attendance Verification Passed.',
      student,
      compliance,
      issuedAt: new Date(issueTime).toLocaleString()
    };
  }

  // Generate Examination Clearance Docket HTML for preview, print, and verification
  renderClearanceDocket(studentId) {
    const compliance = this.calculateStudentCompliance(studentId);
    if (!compliance) return '<p>Student data not found</p>';

    const student = compliance.student;
    const dateGenerated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const qrSecurityToken = this.generateVerifiableDocketToken(student);

    let courseRows = '';
    compliance.courseStats.forEach((stat, idx) => {
      const isCleared = stat.status === 'ELIGIBLE';
      courseRows += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${stat.course.code}</strong></td>
          <td>${stat.course.title}</td>
          <td>${stat.course.units}</td>
          <td>${stat.attended} / ${stat.totalHeld}</td>
          <td><strong>${stat.percentage}%</strong></td>
          <td>
            <span class="stamp-badge ${isCleared ? 'stamp-cleared' : 'stamp-barred'}">
              ${isCleared ? '✓ CLEARED' : '✗ BARRED'}
            </span>
          </td>
        </tr>
      `;
    });

    return `
      <div class="docket-wrapper" id="printableDocket">
        <div class="docket-header">
          <h2>GLOBAL WEALTH UNIVERSITY, TOGO</h2>
          <h4>DIRECTORATE OF ACADEMIC AFFAIRS &amp; EXAMINATIONS</h4>
          <p class="docket-session">2025/2026 ACADEMIC SESSION — SECOND SEMESTER</p>
          <h3 style="margin-top: 8px; color: #008080; letter-spacing: 0.5px;">OFFICIAL NUC BIOMETRIC ATTENDANCE CLEARANCE DOCKET</h3>
        </div>

        <div class="docket-student-info-grid">
          <div class="docket-info-list">
            <div class="docket-info-item"><span>Student Name:</span><br><strong>${student.fullName}</strong></div>
            <div class="docket-info-item"><span>Matriculation No:</span><br><strong class="font-mono">${student.identifier}</strong></div>
            <div class="docket-info-item"><span>Department:</span><br><strong>Computer Science &amp; Software Eng.</strong></div>
            <div class="docket-info-item"><span>Academic Level:</span><br><strong>${student.academicLevel ? student.academicLevel + ' Level' : '400 Level'}</strong></div>
            <div class="docket-info-item"><span>Issue Date:</span><br><strong>${dateGenerated}</strong></div>
            <div class="docket-info-item"><span>NUC Overall Status:</span><br><strong style="color: ${compliance.allEligible ? '#166534' : '#991b1b'}">${compliance.overallStatus}</strong></div>
          </div>
          <div class="docket-qr-box">
            <div class="qr-placeholder" onclick="smartBioApp.verifyDocketInModal('${qrSecurityToken}')" style="cursor:pointer;" title="Click to verify digital signature">
              <div style="font-size: 15px; margin-bottom: 2px;">⬛ ⬜ ⬛<br>⬜ ⬛ ⬜<br>⬛ ⬜ ⬛</div>
              <span style="font-size: 7px; font-weight: bold;">VERIFIED NUC TOKEN</span>
            </div>
            <span style="font-size: 7.5px; font-family: monospace; margin-top: 4px; color: #64748b; text-align: center; word-break: break-all;">${qrSecurityToken}</span>
          </div>
        </div>

        <div style="overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -2px;">
          <table class="docket-courses-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Course Title</th>
                <th>Units</th>
                <th>Classes</th>
                <th>Attendance</th>
                <th>Exam Status</th>
              </tr>
            </thead>
            <tbody>
              ${courseRows}
            </tbody>
          </table>
        </div>

        <div style="font-size: 0.72rem; color: #64748b; margin-top: 12px; border-left: 3px solid #008080; padding-left: 10px; line-height: 1.5;">
          <strong>NUC Regulatory Clause:</strong> In accordance with National Universities Commission (NUC) regulations, candidates must attain a minimum attendance threshold of 75% to qualify for semester examinations. Any alteration of this digitally signed biometric clearance docket renders it void.
        </div>

        <div class="docket-signatures">
          <div class="sign-item">
            <div class="sign-line">Student Signature</div>
          </div>
          <div class="sign-item">
            <div class="sign-line">Course Lecturer / HOD</div>
          </div>
          <div class="sign-item">
            <div class="sign-line">Dean of Faculty / Exams Officer</div>
          </div>
        </div>
      </div>
    `;
  }
}

window.smartBioCompliance = new NUCComplianceEngine();

