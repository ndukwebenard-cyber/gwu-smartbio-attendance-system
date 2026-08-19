/**
 * SMARTBIO ATTENDANCE SYSTEM - DATA STORE & SEED REPOSITORY
 * Persistent Local Database Engine with Relational Modeling & Schema Export
 */

const DEFAULT_SEEDS = {
  departments: [
    { id: 1, code: 'CSC', name: 'Computer Science & Software Engineering', faculty: 'Faculty of Basic & Applied Sciences' },
    { id: 2, code: 'CYB', name: 'Cyber Security Science', faculty: 'Faculty of Basic & Applied Sciences' },
    { id: 3, code: 'IFT', name: 'Information Technology', faculty: 'Faculty of Basic & Applied Sciences' }
  ],
  sessions: [
    { id: 1, name: '2025/2026', isCurrent: true, startDate: '2025-10-01', endDate: '2026-07-30' }
  ],
  semesters: [
    { id: 1, sessionId: 1, type: 'FIRST', isActive: false },
    { id: 2, sessionId: 1, type: 'SECOND', isActive: true }
  ],
  users: [
    {
      id: 1,
      identifier: 'ADM/2026/001',
      fullName: 'System Administrator (Dr. K. Balogun)',
      email: 'admin@smartbio.edu.ng',
      role: 'ADMIN',
      departmentId: 1,
      academicLevel: null,
      avatar: '👨‍💼',
      hasBiometrics: true
    },
    {
      id: 2,
      identifier: 'STF/CSC/042',
      fullName: 'Dr. Olawale Adeyemi',
      email: 'o.adeyemi@smartbio.edu.ng',
      role: 'LECTURER',
      departmentId: 1,
      academicLevel: null,
      avatar: '👨‍🏫',
      hasBiometrics: true
    },
    {
      id: 3,
      identifier: 'STF/CSC/018',
      fullName: 'Prof. Ngozi Okoro',
      email: 'n.okoro@smartbio.edu.ng',
      role: 'LECTURER',
      departmentId: 1,
      academicLevel: null,
      avatar: '👩‍🏫',
      hasBiometrics: true
    },
    {
      id: 4,
      identifier: 'GWU/CSC/22/001',
      fullName: 'Benedict Uchechukwu',
      email: 'b.uche@student.gwu.edu',
      role: 'STUDENT',
      departmentId: 1,
      academicLevel: 400,
      avatar: '🎓',
      hasBiometrics: true,
      fingerTemplate: 'SHA256:8f4c2e91b637dae15091726a84d29f03'
    },
    {
      id: 5,
      identifier: 'GWU/CSC/22/014',
      fullName: 'Folake Adebayo',
      email: 'f.adebayo@student.gwu.edu',
      role: 'STUDENT',
      departmentId: 1,
      academicLevel: 400,
      avatar: '👩‍🎓',
      hasBiometrics: true,
      fingerTemplate: 'SHA256:7b1e4c90a518cfe24182635b73e18a92'
    },
    {
      id: 6,
      identifier: 'GWU/CSC/22/028',
      fullName: 'Chukwudi Eze (Class Representative)',
      email: 'c.eze@student.gwu.edu',
      role: 'CLASS_REP',
      departmentId: 1,
      academicLevel: 400,
      avatar: '👥',
      hasBiometrics: true,
      fingerTemplate: 'SHA256:6a0d3b89e407bed13071524a62d07b81'
    },
    {
      id: 7,
      identifier: 'GWU/CSC/22/035',
      fullName: 'Amina Mohammed',
      email: 'a.mohammed@student.gwu.edu',
      role: 'STUDENT',
      departmentId: 1,
      academicLevel: 400,
      avatar: '👩‍🎓',
      hasBiometrics: true,
      fingerTemplate: 'SHA256:59fc2a78d3f6adc02f60413951c96a70'
    },
    {
      id: 8,
      identifier: 'GWU/CSC/22/052',
      fullName: 'Tunde Bakare',
      email: 't.bakare@student.gwu.edu',
      role: 'STUDENT',
      departmentId: 1,
      academicLevel: 400,
      avatar: '🧑‍🎓',
      hasBiometrics: true,
      fingerTemplate: 'SHA256:48eb1967c2e59cb01e5f302840b8596f'
    }
  ],
  courses: [
    {
      id: 1,
      code: 'CSC 401',
      title: 'Advanced Software Engineering & Architecture',
      units: 3,
      departmentId: 1,
      level: 400,
      lecturerId: 2,
      minAttendancePct: 75
    },
    {
      id: 2,
      code: 'CSC 405',
      title: 'Biometrics & Cyber-Physical Systems',
      units: 3,
      departmentId: 1,
      level: 400,
      lecturerId: 2,
      minAttendancePct: 75
    },
    {
      id: 3,
      code: 'CSC 407',
      title: 'Distributed Cloud Computing & Web Services',
      units: 3,
      departmentId: 1,
      level: 400,
      lecturerId: 3,
      minAttendancePct: 75
    },
    {
      id: 4,
      code: 'CSC 411',
      title: 'Database Administration & Big Data Systems',
      units: 3,
      departmentId: 1,
      level: 400,
      lecturerId: 3,
      minAttendancePct: 75
    }
  ],
  courseRegistrations: [
    { id: 1, studentId: 4, courseId: 1, sessionId: 1 },
    { id: 2, studentId: 4, courseId: 2, sessionId: 1 },
    { id: 3, studentId: 4, courseId: 3, sessionId: 1 },
    { id: 4, studentId: 4, courseId: 4, sessionId: 1 },
    { id: 5, studentId: 5, courseId: 1, sessionId: 1 },
    { id: 6, studentId: 5, courseId: 2, sessionId: 1 },
    { id: 7, studentId: 6, courseId: 1, sessionId: 1 },
    { id: 8, studentId: 6, courseId: 2, sessionId: 1 },
    { id: 9, studentId: 7, courseId: 1, sessionId: 1 },
    { id: 10, studentId: 8, courseId: 1, sessionId: 1 }
  ],
  lectureSessions: [
    { id: 1, courseId: 1, lecturerId: 2, topic: 'Software Architectural Styles & Microservices', venue: 'ICT Hall A', timestamp: '2026-02-03 09:00', status: 'CONCLUDED' },
    { id: 2, courseId: 1, lecturerId: 2, topic: 'Design Patterns & SOLID Principles in Web Systems', venue: 'ICT Hall A', timestamp: '2026-02-10 09:00', status: 'CONCLUDED' },
    { id: 3, courseId: 1, lecturerId: 2, topic: 'RESTful APIs & Asynchronous Micro-frontends', venue: 'ICT Hall A', timestamp: '2026-02-17 09:00', status: 'CONCLUDED' },
    { id: 4, courseId: 1, lecturerId: 2, topic: 'Relational 3NF vs NoSQL Real-time Datastores', venue: 'ICT Hall A', timestamp: '2026-02-24 09:00', status: 'CONCLUDED' },
    { id: 5, courseId: 1, lecturerId: 2, topic: 'WebAuthn Standard & Cryptographic Handshakes', venue: 'ICT Hall A', timestamp: '2026-03-03 09:00', status: 'CONCLUDED' },
    { id: 6, courseId: 1, lecturerId: 2, topic: 'Biometric Template Extraction & Minutiae Matching', venue: 'ICT Hall A', timestamp: '2026-03-10 09:00', status: 'CONCLUDED' },
    { id: 7, courseId: 1, lecturerId: 2, topic: 'Fault Tolerance & Exception Flagging Workflows', venue: 'ICT Hall A', timestamp: '2026-03-17 09:00', status: 'CONCLUDED' },
    { id: 8, courseId: 1, lecturerId: 2, topic: 'NDPA 2023 Compliance & Data Privacy in Software', venue: 'ICT Hall A', timestamp: '2026-03-24 09:00', status: 'CONCLUDED' },
    { id: 9, courseId: 1, lecturerId: 2, topic: 'Automated Defaulter Computation & Clearance Algorithms', venue: 'ICT Hall A', timestamp: '2026-03-31 09:00', status: 'CONCLUDED' },
    { id: 10, courseId: 1, lecturerId: 2, topic: 'Final Project Defense Preparation & Live Testing', venue: 'ICT Hall A', timestamp: '2026-04-07 09:00', status: 'CONCLUDED' }
  ],
  attendanceRecords: [
    // Benedict (GWU/CSC/22/001) - Attended 9/10 (90%)
    { id: 1, sessionId: 1, studentId: 4, method: 'OPTICAL_FINGERPRINT', confidence: 98.4, status: 'PRESENT', time: '09:04 AM' },
    { id: 2, sessionId: 2, studentId: 4, method: 'OPTICAL_FINGERPRINT', confidence: 99.1, status: 'PRESENT', time: '09:02 AM' },
    { id: 3, sessionId: 3, studentId: 4, method: 'WEBAUTHN_BIOMETRIC', confidence: 97.8, status: 'PRESENT', time: '09:05 AM' },
    { id: 4, sessionId: 4, studentId: 4, method: 'OPTICAL_FINGERPRINT', confidence: 99.0, status: 'PRESENT', time: '09:01 AM' },
    { id: 5, sessionId: 5, studentId: 4, method: 'OPTICAL_FINGERPRINT', confidence: 96.5, status: 'PRESENT', time: '09:06 AM' },
    { id: 6, sessionId: 6, studentId: 4, method: 'FLAGGED_RESOLVED', confidence: 82.0, status: 'PRESENT', time: '09:12 AM', flagReason: 'SWEATY_RIDGE', notes: 'Verified student ID card physically' },
    { id: 7, sessionId: 7, studentId: 4, method: 'OPTICAL_FINGERPRINT', confidence: 99.4, status: 'PRESENT', time: '09:03 AM' },
    { id: 8, sessionId: 8, studentId: 4, method: 'OPTICAL_FINGERPRINT', confidence: 98.9, status: 'PRESENT', time: '09:04 AM' },
    { id: 9, sessionId: 9, studentId: 4, method: 'OPTICAL_FINGERPRINT', confidence: 97.2, status: 'PRESENT', time: '09:05 AM' },

    // Folake Adebayo (GWU/CSC/22/014) - Attended 10/10 (100%)
    { id: 10, sessionId: 1, studentId: 5, method: 'OPTICAL_FINGERPRINT', confidence: 99.5, status: 'PRESENT', time: '09:01 AM' },
    { id: 11, sessionId: 2, studentId: 5, method: 'OPTICAL_FINGERPRINT', confidence: 98.8, status: 'PRESENT', time: '09:02 AM' },
    { id: 12, sessionId: 3, studentId: 5, method: 'OPTICAL_FINGERPRINT', confidence: 99.2, status: 'PRESENT', time: '09:04 AM' },
    { id: 13, sessionId: 4, studentId: 5, method: 'WEBAUTHN_BIOMETRIC', confidence: 99.9, status: 'PRESENT', time: '09:01 AM' },
    { id: 14, sessionId: 5, studentId: 5, method: 'OPTICAL_FINGERPRINT', confidence: 97.9, status: 'PRESENT', time: '09:03 AM' },
    { id: 15, sessionId: 6, studentId: 5, method: 'OPTICAL_FINGERPRINT', confidence: 98.4, status: 'PRESENT', time: '09:05 AM' },
    { id: 16, sessionId: 7, studentId: 5, method: 'OPTICAL_FINGERPRINT', confidence: 99.1, status: 'PRESENT', time: '09:02 AM' },
    { id: 17, sessionId: 8, studentId: 5, method: 'OPTICAL_FINGERPRINT', confidence: 98.6, status: 'PRESENT', time: '09:03 AM' },
    { id: 18, sessionId: 9, studentId: 5, method: 'OPTICAL_FINGERPRINT', confidence: 99.3, status: 'PRESENT', time: '09:01 AM' },
    { id: 19, sessionId: 10, studentId: 5, method: 'OPTICAL_FINGERPRINT', confidence: 99.0, status: 'PRESENT', time: '09:02 AM' },

    // Chukwudi Eze (GWU/CSC/22/028) - Attended 7/10 (70% -> AT RISK)
    { id: 20, sessionId: 1, studentId: 6, method: 'OPTICAL_FINGERPRINT', confidence: 96.2, status: 'PRESENT', time: '09:08 AM' },
    { id: 21, sessionId: 2, studentId: 6, method: 'OPTICAL_FINGERPRINT', confidence: 97.1, status: 'PRESENT', time: '09:07 AM' },
    { id: 22, sessionId: 3, studentId: 6, method: 'OPTICAL_FINGERPRINT', confidence: 95.8, status: 'PRESENT', time: '09:10 AM' },
    { id: 23, sessionId: 4, studentId: 6, method: 'OPTICAL_FINGERPRINT', confidence: 98.0, status: 'PRESENT', time: '09:06 AM' },
    { id: 24, sessionId: 5, studentId: 6, method: 'OPTICAL_FINGERPRINT', confidence: 96.9, status: 'PRESENT', time: '09:09 AM' },
    { id: 25, sessionId: 6, studentId: 6, method: 'OPTICAL_FINGERPRINT', confidence: 97.4, status: 'PRESENT', time: '09:05 AM' },
    { id: 26, sessionId: 7, studentId: 6, method: 'OPTICAL_FINGERPRINT', confidence: 98.1, status: 'PRESENT', time: '09:07 AM' },

    // Amina Mohammed (GWU/CSC/22/035) - Attended 5/10 (50% -> INELIGIBLE / DEFAULTER)
    { id: 27, sessionId: 1, studentId: 7, method: 'OPTICAL_FINGERPRINT', confidence: 98.0, status: 'PRESENT', time: '09:11 AM' },
    { id: 28, sessionId: 2, studentId: 7, method: 'OPTICAL_FINGERPRINT', confidence: 97.5, status: 'PRESENT', time: '09:12 AM' },
    { id: 29, sessionId: 3, studentId: 7, method: 'OPTICAL_FINGERPRINT', confidence: 99.1, status: 'PRESENT', time: '09:08 AM' },
    { id: 30, sessionId: 4, studentId: 7, method: 'OPTICAL_FINGERPRINT', confidence: 98.4, status: 'PRESENT', time: '09:09 AM' },
    { id: 31, sessionId: 5, studentId: 7, method: 'OPTICAL_FINGERPRINT', confidence: 96.8, status: 'PRESENT', time: '09:10 AM' }
  ],
  flaggedExceptions: [
    {
      id: 101,
      sessionId: 10,
      studentId: 8, // Tunde Bakare
      flagReason: 'INJURED_FINGER_LOW_RIDGE',
      capturedConfidence: 48.5,
      timestamp: 'Just now',
      status: 'PENDING_REVIEW'
    }
  ],
  auditLogs: [
    { id: 1, actor: 'Dr. K. Balogun (Admin)', action: 'SYSTEM_INIT', details: 'Initialized 2025/2026 academic structure with NUC 75% rule threshold', time: '2026-02-01 08:00' },
    { id: 2, actor: 'Dr. Olawale Adeyemi', action: 'FLAG_OVERRIDE', details: 'Approved flagged attendance for Benedict Uchechukwu after verifying physical ID card', time: '2026-03-10 09:14' }
  ]
};

class DataStore {
  constructor() {
    this.STORAGE_KEY = 'smartbio_db_v1';
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage load error, using default seeds', e);
    }
    this.save(DEFAULT_SEEDS);
    return JSON.parse(JSON.stringify(DEFAULT_SEEDS));
  }

  save(data = this.data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      this.data = data;
    } catch (e) {
      console.error('LocalStorage save error', e);
    }
  }

  resetToSeeds() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SEEDS));
    this.save();
    return this.data;
  }

  // Query helpers
  getUsers() { return this.data.users; }
  getCourses() { return this.data.courses; }
  getSessions() { return this.data.lectureSessions; }
  getAttendance() { return this.data.attendanceRecords; }
  getFlagged() { return this.data.flaggedExceptions; }
  getAuditLogs() { return this.data.auditLogs; }

  getUserById(id) {
    return this.data.users.find(u => u.id === Number(id));
  }

  getUserByIdentifier(identifier) {
    return this.data.users.find(u => u.identifier.toLowerCase() === identifier.toLowerCase().trim());
  }

  getCourseById(id) {
    return this.data.courses.find(c => c.id === Number(id));
  }

  addAttendance(record) {
    // Prevent duplicate attendance for the same session and student
    const isDuplicate = this.data.attendanceRecords.some(a => 
      Number(a.sessionId) === Number(record.sessionId) && 
      Number(a.studentId) === Number(record.studentId) && 
      (a.status === 'PRESENT' || a.status === 'FLAGGED_RESOLVED')
    );

    if (isDuplicate) {
      console.warn(`[SmartBio] Idempotency notice: Student #${record.studentId} is already marked present for session #${record.sessionId}.`);
      return null;
    }

    record.id = Date.now();
    this.data.attendanceRecords.push(record);
    this.save();
    return record;
  }

  addFlaggedException(exception) {
    // Avoid multiple pending flags for same student and session
    const existing = this.data.flaggedExceptions.find(f => 
      Number(f.sessionId) === Number(exception.sessionId) && 
      Number(f.studentId) === Number(exception.studentId)
    );
    if (existing) {
      console.warn(`[SmartBio] Flag already pending for student #${exception.studentId}.`);
      return existing;
    }

    exception.id = Date.now();
    this.data.flaggedExceptions.push(exception);
    this.save();
    return exception;
  }

  resolveFlaggedException(exceptionId, resolvedByLecturerId, action = 'APPROVE', notes = '') {
    const idx = this.data.flaggedExceptions.findIndex(f => f.id === Number(exceptionId));
    if (idx !== -1) {
      const exception = this.data.flaggedExceptions[idx];
      this.data.flaggedExceptions.splice(idx, 1);

      if (action === 'APPROVE') {
        const student = this.getUserById(exception.studentId);
        const lecturer = this.getUserById(resolvedByLecturerId) || { fullName: `Lecturer #${resolvedByLecturerId}` };
        
        this.addAttendance({
          sessionId: exception.sessionId,
          studentId: exception.studentId,
          method: 'FLAGGED_RESOLVED',
          confidence: 100.0,
          status: 'PRESENT',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: notes || 'Approved by lecturer via physical ID verification'
        });

        this.addAuditLog({
          actorId: resolvedByLecturerId,
          actor: lecturer.fullName,
          action: 'FLAG_OVERRIDE_APPROVED',
          details: `Approved flagged attendance for ${student ? student.fullName : 'Student'} (${student ? student.identifier : ''}). Note: ${notes}`,
          time: new Date().toLocaleString()
        });
      }
      this.save();
      return true;
    }
    return false;
  }

  addAuditLog(log) {
    log.id = Date.now();
    if (!log.actorId) log.actorId = null;
    this.data.auditLogs.unshift(log);
    this.save();
  }

  // Purge test insertions (attendance & flags) and normalize authentic datasets with clean system unique IDs in local store
  cleanLocalTestDataAndNormalizeUniqueIds() {
    // 1. Purge transient test attendance records
    this.data.attendanceRecords = [];

    // 2. Purge transient test flagged exceptions
    this.data.flaggedExceptions = [];

    // 3. Normalize permanent datasets with unified system-wide unique IDs
    // Users
    this.data.users = (this.data.users || []).map(u => ({
      ...u,
      systemUid: `GWU-USR-${String(u.id).padStart(4, '0')}`,
      updatedAt: new Date().toISOString()
    }));

    // Departments
    this.data.departments = (this.data.departments || []).map(d => ({
      ...d,
      systemUid: `GWU-DEPT-${d.code}`,
      updatedAt: new Date().toISOString()
    }));

    // Courses
    this.data.courses = (this.data.courses || []).map(c => ({
      ...c,
      systemUid: `GWU-CRS-${c.code.replace(/\s+/g, '')}`,
      updatedAt: new Date().toISOString()
    }));

    // 4. Record immutable audit log
    this.addAuditLog({
      actorId: null,
      actor: 'Administrator (System)',
      action: 'DATA_CLEANSE_NORMALIZATION',
      details: 'Purged transient test attendance and flagged exceptions. Normalized unique IDs across all authentic users, departments, and courses.',
      time: new Date().toLocaleString()
    });

    this.save();

    // 5. Clear transient active lecture session from localStorage
    try {
      localStorage.removeItem('smartbio_active_session');
    } catch (e) {}

    return this.data;
  }

  // Export entire DB as standard SQL dump
  exportSQLDump() {
    let sql = `-- SMARTBIO ATTENDANCE SYSTEM SQL DUMP\n-- Exported At: ${new Date().toISOString()}\n\n`;
    
    // Users
    sql += `-- USERS TABLE\nINSERT INTO users (id, identifier, full_name, email, role, level) VALUES\n`;
    sql += this.data.users.map(u => 
      `(${u.id}, '${u.identifier}', '${u.fullName.replace(/'/g, "''")}', '${u.email}', '${u.role}', ${u.academicLevel || 'NULL'})`
    ).join(',\n') + ';\n\n';

    // Courses
    sql += `-- COURSES TABLE\nINSERT INTO courses (id, course_code, course_title, units, min_attendance_pct) VALUES\n`;
    sql += this.data.courses.map(c => 
      `(${c.id}, '${c.code}', '${c.title.replace(/'/g, "''")}', ${c.units}, ${c.minAttendancePct})`
    ).join(',\n') + ';\n\n';

    // Attendance Records
    sql += `-- ATTENDANCE RECORDS\nINSERT INTO attendance_records (id, session_id, student_id, method, confidence, status) VALUES\n`;
    sql += this.data.attendanceRecords.map(a => 
      `(${a.id}, ${a.sessionId}, ${a.studentId}, '${a.method}', ${a.confidence}, '${a.status}')`
    ).join(',\n') + ';\n\n';

    return sql;
  }
}

// Global data store instance
window.smartBioData = new DataStore();
