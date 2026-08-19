# SmartBio Attendance System — Master Verification & Test Case Checklist

This checklist provides an exhaustive, structured test plan to verify all functional modules, security boundaries, biometric workflows, and edge cases for the **Global Wealth University SmartBio Attendance & NUC Compliance Management System**.

---

## 📋 Test Execution Summary Matrix

| Category ID | Functional Category | Total Cases | Passed | Failed | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **CAT-01** | Authentication, Passwords & Session Lifecycle | 8 | [ ] | [ ] | PENDING |
| **CAT-02** | Role-Based Access Control & Separation of Duties | 6 | [ ] | [ ] | PENDING |
| **CAT-03** | Dual Biometrics (WebAuthn FIDO2 & Optical Simulation) | 7 | [ ] | [ ] | PENDING |
| **CAT-04** | NUC 75% Statutory Compliance & Deficit Forecasting | 6 | [ ] | [ ] | PENDING |
| **CAT-05** | Digital Examination Clearance Dockets & QR Token Verification | 5 | [ ] | [ ] | PENDING |
| **CAT-06** | Real-Time Sync & Live Lecture Session Radar | 6 | [ ] | [ ] | PENDING |
| **CAT-07** | Flagged Exception Workflow & Lecturer Audit Overrides | 5 | [ ] | [ ] | PENDING |
| **CAT-08** | Administrator Governance, Cloud Seeder & Data Normalization | 6 | [ ] | [ ] | PENDING |
| **CAT-09** | Adversarial Security, Penetration & Boundary Edge Cases | 8 | [ ] | [ ] | PENDING |
| **TOTAL** | **Comprehensive System Validation** | **57** | **[ ]** | **[ ]** | **OVERALL PASS / FAIL** |

---

## 🔑 CAT-01: Authentication, Passwords & Session Lifecycle

### TC-AUTH-01: Valid Password Login
- **Persona / Account**: Dr. Olawale Adeyemi (`o.adeyemi@smartbio.edu.ng`)
- **Action**: Enter email and password `password123`. Click "Sign In to Dashboard".
- **Expected Result**: Successfully authenticated as `LECTURER`. Navbar displays avatar, name, and green `LECTURER` badge. Welcome toast shown.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-AUTH-02: Invalid Password Rejection (No Bypass)
- **Persona / Account**: Dr. Olawale Adeyemi (`o.adeyemi@smartbio.edu.ng`)
- **Action**: Enter email with wrong password `wrongpassword999`. Click "Sign In".
- **Expected Result**: Access hard-rejected with red error toast: `⛔ Authentication Failed: Incorrect password`. No login or fallback occurs.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-AUTH-03: Non-Existent Account Rejection
- **Action**: Enter `nonexistent.user@random.com` with password `password123`. Click "Sign In".
- **Expected Result**: System hard-rejects with: `⛔ Authentication Failed: No institutional account matches that identifier`. Does NOT fall back to `users[0]`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-AUTH-04: Student Registration with Departmental Auto-Enrollment
- **Action**: Open Register tab. Select `STUDENT`, Dept: `CSC`, Level: `400L`, Name: `David Okon`, Matric: `GWU/CSC/22/099`, Email: `d.okon@student.gwu.edu`, Password: `password123`. Submit.
- **Expected Result**: Account created, auto-enrolled in CSC 400L cohort courses. Logged in to Student portal.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-AUTH-05: Privileged Role Registration — Valid Passcode Gatekeeping
- **Action**: Register as `LECTURER` using institutional passcode `GWU-FACULTY-2026`. Submit form.
- **Expected Result**: Registration succeeds with faculty privileges.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-AUTH-06: Privileged Role Registration — Invalid Passcode Gatekeeping
- **Action**: Register as `ADMIN` with wrong passcode `WRONG-KEY-1234`. Submit form.
- **Expected Result**: Access denied alert: `⛔ Unauthorized Role Access!`. Registration aborted.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-AUTH-07: Sign Out & Session Teardown
- **Action**: Click `🚪 Switch User` in top navigation bar.
- **Expected Result**: Session state and `localStorage` cleared. View resets to logged-out state with role selection.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-AUTH-08: Authoritative Role Derivation (No Dropdown Spoofing)
- **Action**: Select `ADMIN` in login dropdown, but enter Student credentials (`b.uche@student.gwu.edu` / `password123`). Submit.
- **Expected Result**: Authenticated strictly as `STUDENT` (derived from user account record). Student dashboard opens, Admin console is inaccessible.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

---

## 👥 CAT-02: Role-Based Access Control & Separation of Duties

### TC-RBAC-01: Student Portal Lockdown
- **Persona**: Benedict Uchechukwu (`STUDENT`)
- **Action**: Inspect top navbar and attempt to click Lecturer or Admin actions.
- **Expected Result**: Navbar displays only student authorized routes. Admin seeding, lecture start, and exception resolution controls are hidden.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-RBAC-02: Class Rep Cannot Resolve Flagged Exceptions (Separation of Duties)
- **Persona**: Chukwudi Eze (`CLASS_REP`)
- **Action**: Open DevTools console and execute `smartBioApp.submitResolveOverride('APPROVE')`.
- **Expected Result**: System hard-rejects with alert: `⛔ Access Denied: You are not authorized to resolve biometric exceptions`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-RBAC-03: Class Rep Proctoring Controls
- **Persona**: Chukwudi Eze (`CLASS_REP`)
- **Action**: Access Class Rep dashboard. View headcount stats (5 Enrolled, 4 Good Standing, 1 At Risk). Click `📢 Broadcast 75% Warning Alert`.
- **Expected Result**: Headcount displays accurately. Audio alert plays and warning toast is dispatched.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-RBAC-04: Lecturer Course Ownership Validation
- **Persona**: Dr. Olawale Adeyemi (`LECTURER` - Owner of CSC 401 & CSC 405)
- **Action**: Attempt to start a lecture session for CSC 407 (assigned to Prof. Ngozi Okoro).
- **Expected Result**: Blocked with toast: `⛔ Course Ownership Violation: You are not assigned as the course lecturer for CSC 407`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-RBAC-05: Lecturer Exception Approval Privilege
- **Persona**: Dr. Olawale Adeyemi (`LECTURER`)
- **Action**: Open pending flag for Tunde Bakare. Enter remark and click `✓ Approve Attendance`.
- **Expected Result**: Flag cleared, attendance credited as `FLAGGED_RESOLVED`, and NDPA audit log generated.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-RBAC-06: Administrator Global Curriculum Control
- **Persona**: Dr. Kola Balogun (`ADMIN`)
- **Action**: Open Course Governance table. Click `🔄 Reassign Owner` on CSC 401 and transfer to Prof. Ngozi Okoro.
- **Expected Result**: Course ownership transfers and immutable audit trail event `COURSE_OWNERSHIP_TRANSFER` is logged.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

---

## 🖲️ CAT-03: Dual Biometric Engine (WebAuthn & Optical Simulation)

### TC-BIO-01: Native WebAuthn Passkey Registration
- **Persona**: Benedict Uchechukwu
- **Action**: Open User Profile Modal. Click `Register Hardware WebAuthn Passkey`.
- **Expected Result**: Browser prompts native platform authenticator (Windows Hello / Touch ID). On confirmation, credential ID is saved.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-BIO-02: Native WebAuthn Passkey Authentication
- **Persona**: Benedict Uchechukwu
- **Action**: From sign-in screen, enter matric `GWU/CSC/22/001` and click `Sign In with Biometric Hardware (WebAuthn)`.
- **Expected Result**: Browser biometric prompt verifies signature. User authenticated directly to student portal.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-BIO-03: Kiosk Terminal — Normal Scan (Benedict Uche)
- **Prerequisite**: Start live lecture session for CSC 401.
- **Action**: In Kiosk Scanner, click `🟢 Normal Scan (Benedict Uche)`.
- **Expected Result**: Laser scan animation executes for 1.0s, success chime sounds, HUD displays `VERIFIED (MATCH 99.4%)`, attendance logged as `PRESENT`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-BIO-04: Kiosk Terminal — Sweaty Finger Scan (Tunde Bakare)
- **Action**: In Kiosk Scanner, click `🟡 Sweaty Finger Scan (Tunde Bakare)`.
- **Expected Result**: Low confidence (48.5%) simulated, warning sound plays, HUD displays `FLAGGED EXCEPTION ROUTED`. Flag appears in lecturer's live queue.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-BIO-05: Kiosk Terminal — Injured Ridge Scan (Chukwudi Eze)
- **Action**: In Kiosk Scanner, click `🟡 Injured Finger Scan (Chukwudi Eze)`.
- **Expected Result**: Ridge blur simulated, flagged exception created with reason `INJURED_FINGER_LOW_RIDGE`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-BIO-06: Kiosk Terminal — Unregistered Finger (Stranger)
- **Action**: In Kiosk Scanner, click `🔴 Unregistered Finger`.
- **Expected Result**: Error buzz sounds, platen flashes red, HUD displays `ACCESS DENIED: Fingerprint template not found`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-BIO-07: Biometric Template Reset by Administrator
- **Persona**: Dr. Kola Balogun (`ADMIN`)
- **Action**: In Admin User Directory, click `🔄 Reset Biometrics` for student #4.
- **Expected Result**: Biometric status reverts to `⚠️ PENDING ENROLLMENT`. Audit log `BIOMETRIC_RESET` generated.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

---

## 📊 CAT-04: NUC 75% Statutory Compliance & Deficit Forecasting

### TC-NUC-01: Benedict Uchechukwu 8/10 (80.0% CLEARED)
- **Persona**: Benedict Uchechukwu (`GWU/CSC/22/001`)
- **Action**: View CSC 401 Attendance Gauge in Student Portal.
- **Expected Result**: Attended: 8 / 10 (80.0%). Status Badge: Green `ELIGIBLE (CLEARED)`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-NUC-02: Folake Adebayo 10/10 (100.0% CLEARED)
- **Persona**: Folake Adebayo (`GWU/CSC/22/014`)
- **Action**: View CSC 401 Attendance Gauge in Student Portal.
- **Expected Result**: Attended: 10 / 10 (100.0%). Status Badge: Green `ELIGIBLE (CLEARED)`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-NUC-03: Chukwudi Eze 7/10 (70.0% AT_RISK)
- **Persona**: Chukwudi Eze (`GWU/CSC/22/028`)
- **Action**: View CSC 401 Attendance Gauge in Class Rep / Student Portal.
- **Expected Result**: Attended: 7 / 10 (70.0%). Status Badge: Amber `AT RISK (WARNING)`. Deficit: `Attend next 2 classes`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-NUC-04: Amina Mohammed 5/10 (50.0% INELIGIBLE / DEFAULTER)
- **Persona**: Amina Mohammed (`GWU/CSC/22/035`)
- **Action**: View CSC 401 Attendance Gauge in Student Portal.
- **Expected Result**: Attended: 5 / 10 (50.0%). Status Badge: Red `BARRED (DEFAULTER)`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-NUC-05: Deficit Forecast Formula Mathematical Accuracy
- **Action**: Test deficit calculation across edge rates:
  - 8/10 (80%) $\rightarrow$ 0 classes needed
  - 7/10 (70%) $\rightarrow$ 2 classes needed: $(7+2)/(10+2) = 9/12 = 75.0\%$
  - 5/10 (50%) $\rightarrow$ 10 classes needed: $(5+10)/(10+10) = 15/20 = 75.0\%$
- **Expected Result**: All calculations strictly match mathematical model.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-NUC-06: Lecturer Defaulter Roster Real-Time Calculation
- **Persona**: Dr. Olawale Adeyemi (`LECTURER`)
- **Action**: In Lecturer Portal, view Defaulter Table for CSC 401.
- **Expected Result**: Displays list of all enrolled students with attendance fractions, percentages, compliance badges, and required classes needed.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

---

## 📜 CAT-05: Digital Examination Clearance Dockets & QR Verification

### TC-DOC-01: Clearance Docket Generation for Eligible Student
- **Persona**: Benedict Uchechukwu (`STUDENT` - 80% Cleared)
- **Action**: Click `📜 View Examination Clearance Docket`.
- **Expected Result**: Official GWU Docket renders with candidate info, course breakdown (CSC 401: `✓ CLEARED`), NUC clause, signature lines, and QR security token.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-DOC-02: Cryptographic Token Signature Validation
- **Action**: Click on the QR Token Box inside the open Examination Docket.
- **Expected Result**: Verification popup appears: `STATUS: VALID — Authoritative NUC 75% Biometric Attendance Verification Passed`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-DOC-03: Tampered Token Detection
- **Action**: In console, run `smartBioApp.verifyDocketInModal('GWU-NUC-V2.4.1771500000.TAMPERED')`.
- **Expected Result**: System rejects token: `STATUS: TAMPERED — Cryptographic signature mismatch. Token was modified`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-DOC-04: Ineligible Student Docket Revocation
- **Action**: In console, generate token for Amina (50%) and verify: `smartBioApp.verifyDocketInModal(smartBioCompliance.generateVerifiableDocketToken(smartBioData.getUserById(7)))`.
- **Expected Result**: System dynamically marks docket as `STATUS: REVOKED — Student attendance has dropped below the NUC 75% threshold`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-DOC-05: Printable Examination Docket Layout
- **Action**: In Docket Modal, click `🖨️ Print / Save as PDF`.
- **Expected Result**: Triggers browser print dialog with clean layout (navbars and buttons hidden via `.no-print`).
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

---

## ⚡ CAT-06: Real-Time Sync & Live Lecture Session Radar

### TC-SYNC-01: Start Live Lecture Session
- **Persona**: Dr. Olawale Adeyemi (`LECTURER`)
- **Action**: Select CSC 401, Topic: `Advanced Software Architecture & WebAuthn`, Venue: `ICT Hall A`. Click `⚡ Start Live Lecture Session`.
- **Expected Result**: Active session banner displays duration timer. Audit event `SESSION_START` generated. Live alert broadcasted to student portals.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SYNC-02: Live Attendance Streaming to Radar
- **Action**: With active session open, execute scan in Kiosk.
- **Expected Result**: Lecturer's Live Radar Table immediately prepends new student check-in row with animation.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SYNC-03: Conclude Lecture Session
- **Persona**: Dr. Olawale Adeyemi (`LECTURER`)
- **Action**: In active session banner, click `Conclude Session`.
- **Expected Result**: Session state closed in cloud and local cache. Active session banner hidden, config box restored.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SYNC-04: Network Online/Offline State Transition
- **Action**: In browser DevTools Network tab, switch throttling to `Offline`. Then switch back to `No throttling`.
- **Expected Result**: Navbar indicator transitions smoothly between `Local Mode` (amber dot) and `Online` (green dot).
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SYNC-05: Attendance Deduplication (Idempotency)
- **Action**: Scan Benedict Uche twice during the same active lecture session.
- **Expected Result**: First scan succeeds; second scan is ignored by data store to prevent duplicate counting.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SYNC-06: Session Scan Rejection when No Session is Active
- **Action**: Ensure no lecture session is running. Tap optical platen or click scan trigger in Kiosk.
- **Expected Result**: Scan rejected with warning toast: `⚠️ Scan Rejected: No lecture session is currently active`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

---

## ⚠️ CAT-07: Flagged Exception Workflow & Lecturer Audit Overrides

### TC-EXC-01: Real-Time Flag Routing to Lecturer Queue
- **Action**: Trigger `🟡 Sweaty Finger Scan` in Kiosk.
- **Expected Result**: Flag exception badge increments and student card appears in lecturer's `⚠️ Live Flagged Exceptions Queue`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-EXC-02: Review Flagged Exception Modal
- **Persona**: Dr. Olawale Adeyemi (`LECTURER`)
- **Action**: Click `Review & Override` on flagged case for Tunde Bakare.
- **Expected Result**: Modal displays student name, matric no, capture confidence (48.5%), and flag reason (`SWEATY_RIDGE_BLURRED`).
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-EXC-03: Approve Flagged Exception with Mandatory Audit Remark
- **Persona**: Dr. Olawale Adeyemi (`LECTURER`)
- **Action**: Enter remark: *"Verified student ID card physically"* and click `✓ Approve Attendance`.
- **Expected Result**: Flag cleared from queue. Attendance record created with method `FLAGGED_RESOLVED`. Defaulter table updates.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-EXC-04: Reject Flagged Exception
- **Persona**: Dr. Olawale Adeyemi (`LECTURER`)
- **Action**: In review modal, click `Reject`.
- **Expected Result**: Flag removed from queue without attendance credit.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-EXC-05: Immutable NDPA 2023 Audit Trail Verification
- **Persona**: Dr. Kola Balogun (`ADMIN`)
- **Action**: Open Administrator Audit Trail.
- **Expected Result**: Displays chronological log entries recording actor, role, timestamp, action (`FLAG_OVERRIDE_APPROVED`), and physical verification note.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

---

## 👨‍💼 CAT-08: Administrator Governance, Cloud Seeder & Data Normalization

### TC-ADM-01: 1-Click Automated Verification Suite
- **Persona**: Dr. Kola Balogun (`ADMIN`)
- **Action**: In Admin Console, click `🧪 Run Verification Suite`.
- **Expected Result**: Executes all unit and security boundary tests. Displays success alert: `✅ ALL TESTS PASSED (39/39 Assertions Passed)`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-ADM-02: Academic Department Creation
- **Persona**: Dr. Kola Balogun (`ADMIN`)
- **Action**: Click `➕ Create Department`. Code: `SE`, Name: `Software Engineering`, Faculty: `Faculty of Computing`. Submit.
- **Expected Result**: Department created, immediately appears in registry and populates all registration/course dropdowns.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-ADM-03: Delegated Course Creation & Auto-Cohort Linkage
- **Action**: In Admin or Lecturer portal, click `➕ Create New Course`. Code: `CSC 409`, Level: `400L`, Dept: `CSC`. Submit.
- **Expected Result**: Course added. All existing CSC 400L students are automatically enrolled in `courseRegistrations`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-ADM-04: 1-Click Cloud Firestore Seeder
- **Persona**: Dr. Kola Balogun (`ADMIN`)
- **Action**: Click `☁️ Seed Firestore Cloud`. Confirm prompt.
- **Expected Result**: Cloud Firestore populated with standard GWU academic users, courses, departments, and attendance records.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-ADM-05: Export Complete Firestore JSON Backup
- **Persona**: Dr. Kola Balogun (`ADMIN`)
- **Action**: Click `📥 Export Firestore Backup (JSON)`.
- **Expected Result**: Downloads complete JSON payload containing all Firestore collections with schema metadata.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-ADM-06: Export SQL DDL Dump
- **Persona**: Dr. Kola Balogun (`ADMIN`)
- **Action**: Click `💾 Export SQL Dump`.
- **Expected Result**: Generates and downloads 3NF relational SQL script (`smartbio_gwu_dump_*.sql`).
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

---

## 🛡️ CAT-09: Adversarial Security, Penetration & Boundary Edge Cases

### TC-SEC-01: Unauthenticated Database Write Attempt (Firestore Rules)
- **Action**: Test unauthenticated document write to `/attendance_records` or `/users` via Firestore REST/client.
- **Expected Result**: Firestore Security Rules block write with `permission-denied`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SEC-02: Student Attempting Course Creation
- **Persona**: Benedict Uchechukwu (`STUDENT`)
- **Action**: In console, execute `smartBioApp.openCreateCourseModal()`.
- **Expected Result**: UI modal does not allow unprivileged submission; backend rejects write.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SEC-03: Student Attempting Cloud Seeding
- **Persona**: Benedict Uchechukwu (`STUDENT`)
- **Action**: In console, execute `smartBioApp.seedCloudFirestore()`.
- **Expected Result**: System hard-rejects with alert: `⛔ Administrative Authorization Required: Only System Administrators can initiate cloud database seeding`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SEC-04: Student Attempting Database Purge / Clean
- **Persona**: Benedict Uchechukwu (`STUDENT`)
- **Action**: In console, execute `smartBioApp.cleanFirestoreData()`.
- **Expected Result**: Blocked with alert: `⛔ Administrative Authorization Required: Only System Administrators can purge and normalize institutional records`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SEC-05: Non-Enrolled Student Attendance Check-In
- **Action**: In active CSC 401 session, attempt check-in for a student not registered in CSC 401.
- **Expected Result**: Terminal rejects scan with error: `⛔ Attendance Denied: Student is not enrolled in this course`.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SEC-06: Student Attempting to Read Other Students' Private Records
- **Persona**: Benedict Uchechukwu (Student #4)
- **Action**: Attempt Firestore read on `/users/5` (Folake Adebayo).
- **Expected Result**: Firestore Rules enforce `isOwner(userId)` isolation.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SEC-07: Audit Trail Modification / Deletion Attempt
- **Action**: Attempt HTTP `DELETE` or `UPDATE` on `/audit_logs/{id}`.
- **Expected Result**: Firestore Rules explicitly enforce `allow update, delete: if false` (Append-Only Immutability).
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

### TC-SEC-08: Client-Side Role Tampering Resistance
- **Persona**: Benedict Uchechukwu (`STUDENT`)
- **Action**: In DevTools console, mutate `smartBioApp.authenticatedUser.role = 'ADMIN'` and attempt cloud action.
- **Expected Result**: Cloud Firestore validates the underlying Firebase Auth token claims; unauthorized write is rejected by server rules.
- **Status**: `[ ] PASS   [ ] FAIL`
- **Tester Notes**: __________________________________________________________________________

---

## ✍️ Overall Test Verification Sign-Off

- **Lead Examiner / Tester Name**: ________________________________________________
- **Institution / Department**: Department of Computer Science & Software Engineering, Global Wealth University
- **Date of Test Execution**: ________________________
- **Total Tests Conducted**: 57
- **Total Tests Passed**: ________
- **Total Tests Failed**: ________
- **Final Recommendation**:
  - `[ ] APPROVED FOR B.Sc. PROJECT DEFENSE & INSTITUTIONAL DEPLOYMENT`
  - `[ ] CONDITIONAL APPROVAL (REMEDIATIONS REQUIRED)`
  - `[ ] REJECTED`
- **Official Signature / Stamp**: ________________________________________________
