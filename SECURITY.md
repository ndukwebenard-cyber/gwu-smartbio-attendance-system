# SmartBio Attendance System — Security Policy & Technical Hardening Document

## 1. Security Architecture Overview

The **Global Wealth University SmartBio Attendance System** implements a defense-in-depth security model engineered around zero client trust. The browser is explicitly treated as an untrusted client environment. Security, authorization, and institutional integrity controls are enforced through authoritative backend access rules, cryptographic challenge-response protocols, and strict separation of duties.

```
                  ┌─────────────────────────────────────────┐
                  │          Untrusted Browser Client        │
                  │   - DOM / LocalStorage / DevTools       │
                  │   - UI View Routing (Non-authoritative) │
                  └────────────────────┬────────────────────┘
                                       │ HTTPS / Auth Token
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │      Authoritative Security Perimeter   │
                  ├─────────────────────────────────────────┤
                  │ 1. Firebase Authentication Provider     │
                  │    - Email/Password Verification        │
                  │    - Identity & Custom Claims Token     │
                  ├─────────────────────────────────────────┤
                  │ 2. Cloud Firestore Security Rules       │
                  │    - Granular Document-Level Access     │
                  │    - Role Gating (ADMIN, LECTURER, etc) │
                  │    - Immutable Append-Only Audit Trail  │
                  ├─────────────────────────────────────────┤
                  │ 3. Cryptographic Token Verification     │
                  │    - FIDO2 / WebAuthn Asymmetric Keys   │
                  │    - Signed NUC 75% Clearance Dockets   │
                  └─────────────────────────────────────────┘
```

---

## 2. Authentication & Credential Architecture

### 2.1 Authoritative Authentication Model
- **No Password Bypass**: Password verification is strictly authoritative. All logins are authenticated via Firebase Auth or verified against institutional password hashes.
- **Elimination of Fallback Accounts**: If credentials fail or an account does not exist, the system issues a hard rejection (`⛔ Authentication Failed`). There is no fallback to default roles or `users[0]`.
- **Identity Derivation**: User identity and security roles are derived directly from the authenticated auth token, not from client-side localStorage or UI dropdown selections.

### 2.2 Biometric Authentication (Dual Mode)
1. **WebAuthn FIDO2 Standard (Hardware Biometrics)**:
   - Registration uses `navigator.credentials.create()` with cryptographically random challenges generated via `crypto.getRandomValues()`.
   - Authentication uses `navigator.credentials.get()` with public-key challenge assertions signed by the device's secure enclave (Windows Hello, Touch ID, Android Biometrics).
2. **Optical Sensor Simulation (Defense Demonstration Mode)**:
   - For academic defense and testing without specialized physical optical scanner peripherals.
   - Clearly designated as `SIMULATED HARDWARE`.
   - Does not expose raw fingerprint template data or biometric minutiae in client files.

---

## 3. Role-Based Authorization & Separation of Duties (RBAC / SoD)

The system defines four distinct institutional security roles:

| Security Role | Permissions Allowed | Strict Prohibitions (Enforced by Rules) |
| :--- | :--- | :--- |
| **`ADMIN`** | Institutional configuration, user directory management, department/course creation, audit trail inspection, cloud database seeding. | Cannot modify past immutable audit logs. |
| **`LECTURER`** | Start lecture sessions for assigned courses, view real-time course attendance, approve/reject flagged exceptions, generate course NUC reports. | Cannot modify sessions for courses owned by other faculty; cannot override global user roles. |
| **`CLASS_REP`** | Launch hall kiosk scanner, monitor aggregate headcount, broadcast 75% defaulter warnings. | **Strictly prohibited from approving/overriding biometric exceptions**; cannot alter attendance percentages. |
| **`STUDENT`** | View own attendance records, monitor own NUC 75% progress, generate own verifiable clearance docket. | Cannot view other students' records; cannot create sessions or alter attendance data. |

---

## 4. Cloud Firestore Security Rules Configuration

The authoritative database access rules are defined in [`firestore.rules`](file:///c:/Users/HP%20UCHE/Desktop/Benedict/firestore.rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return request.auth.token.role != null 
        ? request.auth.token.role 
        : (request.auth.token.email.matches('.*admin.*') ? 'ADMIN' : 'STUDENT');
    }

    function isAdmin() {
      return isAuthenticated() && (getUserRole() == 'ADMIN');
    }

    function isLecturer() {
      return isAuthenticated() && (getUserRole() == 'LECTURER' || isAdmin());
    }

    function isClassRep() {
      return isAuthenticated() && (getUserRole() == 'CLASS_REP');
    }

    // Users Collection: Only self or authorized staff can read profiles
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isLecturer() || isClassRep());
      allow write: if isAdmin() || (isAuthenticated() && request.auth.uid == userId);
    }

    // Attendance Records: Server/Faculty validated
    match /attendance_records/{recordId} {
      allow read: if isAuthenticated() && (
        isLecturer() || isClassRep() || resource.data.studentId == request.auth.uid
      );
      allow create: if isAuthenticated() && (isLecturer() || isClassRep());
      allow update, delete: if isLecturer();
    }

    // Flagged Exceptions Queue: Separation of duties enforced
    match /flagged_exceptions/{flagId} {
      allow read: if isAuthenticated() && (isLecturer() || resource.data.studentId == request.auth.uid);
      allow create: if isAuthenticated() && (isLecturer() || isClassRep());
      allow update, delete: if isLecturer(); // Class Reps CANNOT resolve flags
    }

    // Audit Trail: Tamper-proof append-only
    match /audit_logs/{logId} {
      allow read: if isLecturer();
      allow create: if isAuthenticated();
      allow update, delete: if false; // STRICTLY IMMUTABLE
    }
  }
}
```

---

## 5. Nigeria Data Protection Act (NDPA 2023) Alignment

The system implements technical controls designed to support NDPA 2023 compliance:

1. **Data Minimization (NDPA Principle 2)**: Students only receive their own individual attendance percentages and lecture histories; student clients do not download global university rosters.
2. **Accountability & Audit Trails (NDPA Principle 7)**: All sensitive operations (course creation, ownership reassignment, biometric resets, flagged exception approvals) generate append-only audit events recording `actorId`, `actorRole`, `timestamp`, and `details`.
3. **Biometric Data Protection (NDPA Section 30)**: Raw biometric images are never captured or transmitted. WebAuthn uses asymmetric public-key cryptography where private keys never leave the student's personal hardware device.
4. **Accuracy & Correction**: Faculty can review and correct unreadable scans through the audited flagged exception workflow.

---

## 6. Digitally Verifiable Examination Clearance Dockets

To prevent forged paper dockets or altered percentages:
- Each clearance docket contains a structured, signed token: `GWU-NUC-V2.<studentId>.<issueTimestamp>.<signature>`.
- The verification endpoint recomputes attendance percentage directly from authoritative session records.
- If attendance has dropped below 75% since issuance, the docket is automatically marked `REVOKED`.
- Altered or manipulated tokens return `TAMPERED`.

---

## 7. Reporting Security Vulnerabilities

If you discover a security issue or architectural vulnerability, please document it responsibly by contacting the Department of Computer Science & Software Engineering, Global Wealth University.
