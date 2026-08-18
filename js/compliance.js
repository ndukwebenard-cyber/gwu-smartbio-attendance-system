/**
 * SMARTBIO ATTENDANCE SYSTEM - NUC 75% COMPLIANCE & CLEARANCE DOCKET ENGINE
 * Automatic Defaulter Identification & Defense-Ready Examination Clearance
 */

class NUCComplianceEngine {
  // Compute attendance stats for a specific student across all their registered courses
  calculateStudentCompliance(studentId) {
    const data = window.smartBioData.load();
    const student = window.smartBioData.getUserById(studentId);
    if (!student) return null;

    const registrations = data.courseRegistrations.filter(r => r.studentId === Number(studentId));
    const courseStats = [];

    registrations.forEach(reg => {
      const course = window.smartBioData.getCourseById(reg.courseId);
      if (!course) return;

      const sessions = data.lectureSessions.filter(s => s.courseId === course.id && s.status === 'CONCLUDED');
      const totalHeld = sessions.length;

      // Find sessions attended by this student
      const attended = data.attendanceRecords.filter(a => 
        sessions.some(s => s.id === a.sessionId) && 
        a.studentId === Number(studentId) && 
        (a.status === 'PRESENT' || a.status === 'FLAGGED_RESOLVED')
      ).length;

      const percentage = totalHeld === 0 ? 100 : Number(((attended / totalHeld) * 100).toFixed(1));
      
      let status = 'ELIGIBLE';
      let statusClass = 'badge-eligible';
      let badgeLabel = 'ELIGIBLE (CLEARED)';

      if (totalHeld === 0) {
        status = 'PENDING';
        statusClass = 'badge-at-risk';
        badgeLabel = 'NOT STARTED (0 HELD)';
      } else if (percentage < 70) {
        status = 'INELIGIBLE';
        statusClass = 'badge-ineligible';
        badgeLabel = 'BARRED (DEFAULTER)';
      } else if (percentage < 75) {
        status = 'AT_RISK';
        statusClass = 'badge-at-risk';
        badgeLabel = 'AT RISK (WARNING)';
      }

      // Calculate how many more classes needed to reach 75%
      let classesNeeded = 0;
      if (totalHeld > 0 && percentage < 75) {
        // formula: (attended + x) / (totalHeld + x) >= 0.75 => x >= (0.75*totalHeld - attended)/0.25
        classesNeeded = Math.max(0, Math.ceil((0.75 * totalHeld - attended) / 0.25));
      }

      courseStats.push({
        course,
        totalHeld,
        attended,
        percentage: totalHeld === 0 ? 0 : percentage,
        status,
        statusClass,
        badgeLabel,
        classesNeeded
      });
    });

    // Overall university clearance decision
    const allEligible = courseStats.every(c => c.status === 'ELIGIBLE');
    const hasDefaulter = courseStats.some(c => c.status === 'INELIGIBLE');

    return {
      student,
      courseStats,
      allEligible,
      hasDefaulter,
      overallStatus: allEligible ? 'FULLY CLEARED FOR EXAMS' : (hasDefaulter ? 'BARRED FROM SOME PAPERS' : 'CONDITIONAL CLEARANCE')
    };
  }

  // Generate Examination Clearance Docket HTML for preview and print
  renderClearanceDocket(studentId) {
    const compliance = this.calculateStudentCompliance(studentId);
    if (!compliance) return '<p>Student data not found</p>';

    const student = compliance.student;
    const dateGenerated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const qrSecurityToken = `GWU-NUC-VERIFY:${student.identifier}:${Date.now().toString(36).toUpperCase()}`;

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
            <div class="docket-info-item"><span>Academic Level:</span><br><strong>${student.academicLevel} Level</strong></div>
            <div class="docket-info-item"><span>Issue Date:</span><br><strong>${dateGenerated}</strong></div>
            <div class="docket-info-item"><span>NUC Overall Status:</span><br><strong style="color: ${compliance.allEligible ? '#166534' : '#991b1b'}">${compliance.overallStatus}</strong></div>
          </div>
          <div class="docket-qr-box">
            <div class="qr-placeholder">
              <div style="font-size: 15px; margin-bottom: 2px;">⬛ ⬜ ⬛<br>⬜ ⬛ ⬜<br>⬛ ⬜ ⬛</div>
              <span style="font-size: 7px;">VERIFIED NUC TOKEN</span>
            </div>
            <span style="font-size: 7.5px; font-family: monospace; margin-top: 4px; color: #64748b; text-align: center;">${qrSecurityToken.substring(0, 16)}...</span>
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
          <strong>NUC Regulatory Clause:</strong> In accordance with National Universities Commission regulations, candidates must attain a minimum attendance threshold of 75% to qualify for semester examinations. Any alteration of this biometric clearance docket renders it null and void.
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
