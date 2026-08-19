# Global Wealth University — SmartBio Problems, Features & Implementation

This document provides the exhaustive specification of the **Academic Problem Statement**, **Literature Gaps**, **Innovative Solved Features**, and **Technical Implementation Details** for the **SmartBio Biometric Attendance & NUC Compliance Management System**.

---

## 🎯 Part 1: Academic Problem Statement & Literature Gaps

### 1. The Core Academic Problem
In higher education institutions governed by the **National Universities Commission (NUC)**, students must satisfy a statutory minimum attendance threshold of **75%** in conducted course lectures to qualify for semester examinations.

Traditional attendance management suffers from systemic vulnerabilities:
* **Paper-Based Attendance Rosters**: Prone to sheet theft, illegibility, physical deterioration, and loss of records during departmental moderation.
* **Proxy Attendance & Impersonation**: Absent students frequently have peers forge signatures or call out names during manual roll calls.
* **Administrative Burden & Human Error**: Manually calculating percentages for hundreds of students across 10–14 lectures per semester at the end of term causes delayed release of examination clearance lists.

---

### 2. The Biometric Literature Gap (The Unreadable / Sweaty Scan Dilemma)
Existing academic literature and commercial biometric solutions introduce a critical operational failure point:
* **The Lockout Failure**: When a student arrives at a lecture hall with sweaty fingers, physical skin abrasions, dry skin, or temporary ridge distortion, the optical sensor yields a False Non-Match Rate (FNMR) or fails to match the enrolled template.
* **The Lecture Interruption Dilemma**: In conventional systems, the student is either barred from class or the lecturer must pause the lecture to perform administrative data entry.
* **SmartBio Innovation (The Flagged Exception Workflow)**:
  - SmartBio routes low-confidence and distorted scans to a real-time **Flagged Exception Queue** on the lecturer's radar.
  - The student enters the lecture hall and takes their seat.
  - The lecturer verifies the student's physical University ID card and approves the record with a mandatory **NDPA 2023 compliant audit remark**.

---

## 🚀 Part 2: System Features & Functional Modules

### 1. Role-Based Access Control (RBAC) Architecture with Institutional Gatekeeping

SmartBio implements a **dual-layer RBAC architecture** combining Firebase Authentication JWT tokens with Institutional Security Passcode gatekeeping at the registration level.

#### 1a. Institutional Security Passcodes (Privilege Escalation Prevention)
Registering for any role above `STUDENT` requires a confidential institutional authorization key:

| Role | Access Scope | Institutional Passcode Required |
| :--- | :--- | :--- |
| **🎓 Student** | Student Portal only | None (Open Enrollment) |
| **👥 Class Representative** | Class Rep · Student · Kiosk | `GWU-PROCTOR-2026` |
| **👨‍🏫 Lecturer** | Lecturer Portal · Kiosk | `GWU-FACULTY-2026` |
| **👨‍💼 Administrator** | All Portals (Full Oversight) | `GWU-ADMIN-2026` |

#### 1b. Navbar Route Guards (Least Privilege UI Enforcement)
Upon authentication, the top navigation bar dynamically locks down to show only portals permitted by the user's role. Restricted tabs are hidden — not just disabled — preventing any URL-based or click-based access to unauthorized views.

#### 1c. Switch User / Sign Out
A dedicated **`🚪 Switch User`** button clears the Firebase Auth JWT session and returns the user to the Sign-In screen, enabling safe role-switching during multi-user demonstrations (e.g., project defense).

#### 1d. Role Descriptions
* **Administrator**: Full academic session configuration, student and lecturer directory, NDPA audit trail viewer, 1-click database reset, **1-Click Firestore Cloud Seeder**, and **SQL Dump Exporter**.
* **Lecturer**: Lecture session creation with real-time countdown timer, live attendance streaming radar, flagged exception resolution queue, and exportable 75% NUC defaulter rosters.
* **Class Representative (Course Proctor)**: Dedicated proctor role allowing the rep to launch the classroom kiosk terminal, view real-time hall headcount (e.g. 42/50 in hall), and broadcast defaulter warning alerts, with a strict prohibition against flag overrides.
* **Student**: Personal attendance percentage progress bars, detailed lecture breakdown logs, and **Official Printable Examination Clearance Dockets** with anti-tamper QR tokens.
* **Classroom Kiosk Scanner**: Optical sensor graphical simulation with laser sweep, minutiae detection, acoustic feedback (Web Audio API), and native browser WebAuthn biometrics.

---

### 2. Firebase Authentication & Cloud Firestore Integration

#### 2a. Firebase Authentication (Email/Password)
* All users authenticate via `firebase/auth` using institutional email addresses.
* JWT tokens returned on sign-in carry the user's role claims, used to enforce backend Firestore Security Rules and frontend Route Guards.
* **1-Click Cloud Seeder**: Automatically provisions all demo user accounts (students, lecturers, class rep, admin) in Firebase Authentication with `password123` during the Admin Portal seeding operation.
* **Self-Registration**: New users can register via the Sign Up screen. Accounts are created in Firebase Auth and simultaneously written to Cloud Firestore `/users` collection.
* **Password Recovery**: Institutional email-based password reset flow with role verification.

#### 2b. Firebase Cloud Firestore (Real-Time Sync)
* **`/attendance_records`**: Live biometric scan stream — every check-in event broadcasted via `onSnapshot` WebSocket to all connected devices in < 200ms.
* **`/flagged_exceptions`**: Real-time flag queue for low-confidence scans awaiting lecturer resolution.
* **`/lecture_sessions`**: Active session state — kiosk terminals auto-detect live sessions and activate scanner mode.
* **`/users`**: Institutional directory of students, lecturers, and admins.
* **`/courses`** & **`/departments`**: Academic structure seeded from the local data repository.
* **`/audit_logs`**: Immutable NDPA 2023 compliant audit trail (write-once, no delete).

#### 2c. Firestore Security Rules
Production rules enforce RBAC at the database layer. Test mode (`allow read, write: if true`) is used during development. Production rules restrict:
* Flag overrides to `LECTURER` and `ADMIN` roles only.
* Audit logs to write-once (no update/delete).
* User profile edits to the account owner or `ADMIN`.

---

### 3. Dual-Mode Biometric Verification Engine
* **Modern WebAuthn API**: Interoperates with native operating system biometric authenticators (Apple TouchID, Windows Hello, Android Biometric Prompt) via browser cryptographic handshakes.
* **Interactive Optical Scanner Terminal**: High-fidelity optical sensor simulation supporting stress testing and edge-case simulations (Sweaty Finger, Injured Ridge, Non-Enrolled Stranger).

---

### 4. NUC 75% Rule Compliance & Clearance Algorithm
* Real-time statutory attendance calculation:
  $$\text{Attendance Rate } (P) = \left(\frac{\text{Attended Sessions}}{\text{Conducted Sessions}}\right) \times 100$$
* Dynamic Classification:
  - 🟢 **Eligible ($\ge 75.00\%$)**: Fully cleared for semester examination.
  - 🟡 **At Risk ($70.00\% - 74.99\%$)**: Automated deficit forecast indicating exact number of upcoming lectures required to clear the deficit:
    $$x = \left\lceil \frac{0.75 \times C - A}{0.25} \right\rceil$$
  - 🔴 **Ineligible ($< 70.00\%$)**: Flagged as academic defaulter, barred from course examination.

### 6. Dynamic User Registration & Anti-Fake Matric ID Generator
* **Algorithmic ID Generation**: Selecting **Department** (e.g., `CSC`, `CYB`, `IFT`) and **Academic Level** (`100L`–`400L` / `Faculty`) automatically computes entry year and derives the next sequential institutional matric/staff number:
  $$\text{Format: } \mathbf{\text{GWU}} \ / \ \mathbf{\text{DEPT\_CODE}} \ / \ \mathbf{\text{ENTRY\_YEAR}} \ / \ \mathbf{\text{SEQUENCE}} \quad \text{(e.g. } \texttt{GWU/CSC/22/053}\text{)}$$
* **Automated Cohort Course Enrollment**:
  - Automatically queries all active courses matching the registrant's Department and Level.
  - Automatically registers the student into `courseRegistrations`, landing them on a pre-populated dashboard with active course tracking at 0% baseline.

---

### 7. Course Creation & Academic Delegation (Lecturer & Class Rep)
* **Delegated Course Creation Modal (`#createCourseModal`)**:
  - **Lecturers**: Create new courses assigned to themselves or co-lecturers with custom statutory attendance thresholds (default 75%).
  - **Class Representatives**: Create courses on behalf of departmental faculty members with automatic cohort linkage.
* **Instant Cohort Linkage**: When a course is registered for `CSC 400L`, all active students matching that cohort are automatically enrolled into `courseRegistrations`.
* **NDPA Audit Trail**: Logs an immutable audit record documenting the creator, beneficiary faculty member, and cohort enrollment headcount.

---

### 8. Admin Course Ownership Governance & User Management
* **Course Ownership Transfer (Faculty Reassignment)**:
  - Admin can reassign any active course from one lecturer to another with documented administrative justification.
  - The new lecturer immediately gains live session broadcasting authority, and all historical lecture records remain intact.
* **User Role Elevation & Biometric Governance**:
  - **Role Elevation**: 1-click promotion of Students to Class Representatives (and vice versa).
  - **Biometric Reset**: Admin can reset corrupted or changed biometric credentials (`hasBiometrics: false`), prompting physical re-enrollment.
  - **Deactivation/Deletion**: Remove obsolete course offerings or unenroll test accounts.

---

### 9. User Profile Modal & Real-Time Biometric Lifecycle
* **Unified Profile Modal (`#profileModal`)**:
  - Displays user avatar, full legal name, institutional ID, department, level, and 2FA status.
  - **Biometric Panel**: Real-time enrollment status badge (`✓ ENROLLED` vs `⚠️ PENDING ENROLLMENT`), cryptographic minutiae hash / FIDO2 credential ID, and active **"Enroll / Test Device Passkey"** / **"Test Optical Scanner"** triggers.
  - **Academic / Scope Overview**: Real-time stats dynamically computed per role (course clearance rate for students, teaching load for faculty, proctor scope for class reps).

---

### 10. Persistent Authenticated Session Navigation
* **Decoupled Architecture**: Authenticated identity (`this.authenticatedUser`) is strictly decoupled from perspective view routing (`this.currentView`).
* **Zero Session Mutation**: Tab switching never mutates or overwrites user credentials.
* **Admin Global Access**: When an Admin inspects the Student or Lecturer view, all 5 navbar pills remain permanently active, allowing 1-click return to the Admin Portal.

## 💻 Part 3: Technical Implementation Details

| Layer | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5, CSS3 Glassmorphism, Modular ES6 JavaScript | Single-Page Application (SPA), zero build toolchain, 100% GitHub Pages compatible |
| **Authentication** | Firebase Authentication (Email/Password + WebAuthn FIDO2) | JWT-based identity, RBAC role claims, session management |
| **Real-Time Cloud Sync** | Firebase Cloud Firestore (SDK v10 CDN) | Real-time WebSocket multi-device sync (`onSnapshot`) between kiosks, phones, and laptops |
| **RBAC Gatekeeping** | Institutional Passcodes + Navbar Route Guards | Prevents privilege escalation; locks UI tabs per authenticated role |
| **Offline Storage Engine** | IndexedDB & LocalStorage Repository | Offline-first relational cache with 1-click seed preloading and SQL dump generation |
| **Acoustic Feedback** | Web Audio API Oscillator & Gain Synthesizer | Tactile audio cues (laser chirp, success chime, warning beep, error buzz) with 0 external sound files |
| **Relational Database DDL** | MySQL 8.0 & PostgreSQL 16 (3NF Normalized) | Formal schema and seed scripts for Chapter 4 academic dissertation |
| **Diagramming System** | Mermaid (`.mmd` & `.md`) | Standardized flowcharts and ERDs exportable via `mermaid.live` |
| **Mobile-First UI** | CSS3 Responsive Grid, Bottom-Sheet Modals, `.form-row-2col` | All screens functional at 360px; touch targets ≥ 44px; iOS zoom prevention |
| **Deployment** | GitHub Pages (static) + Firebase Hosting | Zero-cost dual deployment; live URL for defense demo |

---

## 🔑 Part 4: Demo Credentials (For Project Defense)

| Role | Full Name | Email | Password | Institutional Passcode |
| :--- | :--- | :--- | :--- | :--- |
| 👨‍💼 Admin | Dr. Kola Balogun | `admin@smartbio.edu.ng` | `password123` | `GWU-ADMIN-2026` |
| 👨‍🏫 Lecturer | Dr. Olawale Adeyemi | `o.adeyemi@smartbio.edu.ng` | `password123` | `GWU-FACULTY-2026` |
| 👩‍🏫 Lecturer | Prof. Ngozi Okoro | `n.okoro@smartbio.edu.ng` | `password123` | `GWU-FACULTY-2026` |
| 👥 Class Rep | Chukwudi Eze | `c.eze@student.gwu.edu` | `password123` | `GWU-PROCTOR-2026` |
| 🎓 Student | Benedict Uche | `b.uche@student.gwu.edu` | `password123` | *(none required)* |
| 🎓 Student | Folake Adebayo | `f.adebayo@student.gwu.edu` | `password123` | *(none required)* |
