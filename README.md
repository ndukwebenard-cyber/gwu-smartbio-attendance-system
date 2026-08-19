# Global Wealth University — SmartBio Attendance & NUC Compliance Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00f2fe?style=for-the-badge&logo=github)](https://ndukwebenard-cyber.github.io/gwu-smartbio-attendance-system/)
[![Firebase Realtime](https://img.shields.io/badge/Cloud%20Database-Firebase%20Firestore-FFA611?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![WebAuthn FIDO2](https://img.shields.io/badge/Biometrics-WebAuthn%20FIDO2-7928ca?style=for-the-badge&logo=w3c)](https://www.w3.org/TR/webauthn-2/)
[![NUC Compliant](https://img.shields.io/badge/Regulatory%20Standard-NUC%2075%25%20Rule-10b981?style=for-the-badge)](https://www.nuc.edu.ng/)
[![NDPA 2023](https://img.shields.io/badge/Data%20Privacy-NDPA%202023%20Compliant-blue?style=for-the-badge)](https://ndpc.gov.ng/)

> **Candidate**: Ndukwe Benedict Chibuikem (`GWU/BSC/CS/2020/36182`)  
> **Degree**: Bachelor of Science (B.Sc.) in Computer Science and Software Engineering  
> **Department**: Department of Computer Science & Software Engineering, Global Wealth University, Lome, Togo  
> **Supervisor**: Engr. Ebofuai Joshua  
> **Academic Session**: 2025/2026 (August, 2026)  
> **Live Web Application**: [https://ndukwebenard-cyber.github.io/gwu-smartbio-attendance-system/](https://ndukwebenard-cyber.github.io/gwu-smartbio-attendance-system/)

---

## 🌟 Executive Overview

**SmartBio** is an enterprise-grade biometric attendance and academic compliance management system developed for **Global Wealth University (GWU)**. Engineered as a zero-build Single-Page Application (SPA) powered by Google Cloud Firestore and native browser WebAuthn FIDO2 APIs, the platform replaces vulnerable paper registers with **cryptographic biometric authentication**, **near-real-time multi-device database synchronization**, and an **automated NUC 75% Examination Eligibility computation engine**.

### 🎯 Key Academic Problem Solved
Traditional attendance systems in West African higher education suffer from:
1. **Pervasive Proxy Attendance**: Absent students have peers forge signatures or call out names during manual roll calls.
2. **Sheet Degradation & Transit Loss**: Paper rosters become illegible, torn, or misplaced during departmental moderation.
3. **The Sweaty/Injured Finger Lockout Dilemma (Literature Gap)**: Conventional biometric systems reject students with temporary skin abrasions or moisture, disrupting lectures. SmartBio introduces a real-time **Flagged Exception Resolution Workflow** under Nigeria Data Protection Act (NDPA) 2023 standards.

---

## 🚀 Core Functional Modules

### 1. 🔐 Role-Based Access Control (RBAC) & Gatekeeping
- **Authoritative Identity Provider**: Password verification is strictly authoritative via Firebase Auth and registered institutional credentials.
- **Institutional Passcode Gatekeeping**: Prevents privilege escalation during self-registration. Privileged roles require university-issued authorization keys:
  - System Administrator: `GWU-ADMIN-2026`
  - Course Lecturer / Faculty: `GWU-FACULTY-2026`
  - Class Representative / Proctor: `GWU-PROCTOR-2026`
  - Student: *Open Enrollment*
- **Navbar Route Guards**: Top navigation automatically locks down to display only portals authorized for the authenticated user's role.
- **`🚪 Switch User`**: Rapid identity switching between perspectives for seamless defense demonstrations.

### 2. 👨‍🏫 Lecturer Live Streaming Radar & Exception Queue
- **Active Lecture Controller**: Configures course, topic, and venue with a live duration countdown timer.
- **Real-Time Synchronizer**: Attendance check-ins broadcast via Firebase Firestore (`onSnapshot`) to the lecturer's screen in near-real-time.
- **Flagged Exception Resolution**: Degraded/unreadable scans are placed in a live queue. The lecturer verifies physical ID cards, enters an audit remark, and credits attendance.

### 3. 👥 Class Representative Proctoring Portal (Separation of Duties)
- Dedicated proctoring mode allowing class representatives to launch the classroom kiosk on hall tablets, track live headcount (e.g. 5 Enrolled, 4 In Good Standing, 1 At Risk), and broadcast 75% defaulter warning notices.
- **Separation of Duties (SoD)**: Class reps are strictly prohibited from overriding flagged scans or altering attendance percentages.

### 4. 🖲️ Dual-Mode Biometric Kiosk Terminal
- **Native Browser WebAuthn API (FIDO2)**: Hardware-backed cryptographic biometric verification (TouchID, Windows Hello, Android Biometrics).
- **Interactive Optical Sensor Simulator**: Minutiae extraction with real-time laser sweep, acoustic synthesizer feedback (laser chirp, success chime, warning beep), and edge-case simulation (*Sweaty Finger, Injured Ridge, Non-Enrolled Stranger*) for academic defense and testing.

### 5. 🎓 Student NUC 75% Compliance Dashboard & QR Docket
- Real-time statutory attendance rate calculation:
  $$\text{Attendance Rate } (P) = \left(\frac{\text{Attended Sessions}}{\text{Conducted Sessions}}\right) \times 100$$
- **Automated Deficit Forecast**: Calculates the exact number of upcoming consecutive lectures needed to regain 75% eligibility:
  $$x = \max\left(0, \left\lceil \frac{0.75 \times C - A}{0.25} \right\rceil\right)$$
- **Printable Examination Clearance Docket**: Stamped with clearance status and an anti-tamper QR verification token (`GWU-NUC-V2.<id>.<epoch>.<sig>`).

### 6. 👨‍💼 Administrator Portal, Course Governance & 1-Click Cloud Seeder
- **Course Ownership Governance**: Reassign course ownership from one faculty member to another with documented administrative justification.
- **User Role Elevation**: 1-click promotion of students to Class Representatives (and vice versa) and biometric credential resets.
- Complete university directory management, NDPA 2023 audit trail logs, 1-Click Firestore Cloud Seeder, and SQL schema dump export.

---

## 🔑 Pre-Configured Demo Accounts & Credentials

All accounts are auto-provisioned into **Firebase Authentication** and **Cloud Firestore (`/users`)** via the **1-Click Cloud Seeder** in the Administrator portal:

| Role | User Name | Institutional Email | Password | Institutional Passcode | Demonstration Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **👨‍💼 Admin** | Dr. Kola Balogun | `admin@smartbio.edu.ng` | `password123` | `GWU-ADMIN-2026` | Session config, NDPA audit logs, 1-Click Cloud Seeder, SQL export. |
| **👨‍🏫 Lecturer** | Dr. Olawale Adeyemi | `o.adeyemi@smartbio.edu.ng` | `password123` | `GWU-FACULTY-2026` | Start CSC 401 lecture, stream live radar, resolve flagged scans. |
| **👩‍🏫 Lecturer** | Prof. Ngozi Okoro | `n.okoro@smartbio.edu.ng` | `password123` | `GWU-FACULTY-2026` | CSC 407 lecture sessions and multi-course moderation. |
| **👥 Class Rep** | Chukwudi Eze | `c.eze@student.gwu.edu` | `password123` | `GWU-PROCTOR-2026` | Proctor tablet kiosk, track live headcount, broadcast alerts. |
| **🎓 Student (Cleared)** | Benedict Uche (80%) | `b.uche@student.gwu.edu` | `password123` | *(None - Open)* | 8/10 attendance (80% Cleared), view progress gauges and mint QR clearance docket. |
| **👩‍🎓 Student (100%)** | Folake Adebayo | `f.adebayo@student.gwu.edu` | `password123` | *(None - Open)* | 10/10 attendance rate (100% Fully Cleared), perfect clearance status. |
| **👩‍🎓 Student (Defaulter)**| Amina Mohammed (50%) | `a.mohammed@student.gwu.edu` | `password123` | *(None - Open)* | 5/10 attendance (50% Ineligible), displays automated deficit forecast (+10 classes). |

---

## 📚 Master Documentation & Defense Suite

The repository contains a full suite of technical architecture specifications, defense playbooks, and database DDL scripts:

| Document / Artifact | Location | Purpose |
| :--- | :--- | :--- |
| **🛡️ Security Policy & Hardening** | [`SECURITY.md`](SECURITY.md) | Authoritative authentication, Firestore security rules, and NDPA 2023 alignment. |
| **🏗️ Technical Architecture Specification** | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Multi-tier topology, service layers, real-time sync, and sequence diagrams. |
| **📊 Data Model & Schema Specification** | [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Entity-Relationship schema, Firestore collection definitions, and relational integrity. |
| **🧪 Automated Test & Verification Suite** | [`docs/TESTING.md`](docs/TESTING.md) | 38 automated unit, integration, RBAC, and cryptographic signature assertions. |
| **📋 57-Test Master Verification Checklist** | [`docs/VERIFICATION_CHECKLIST.md`](docs/VERIFICATION_CHECKLIST.md) | Printable/editable test checklist with PASS/FAIL checkmarks & observation note fields. |
| **🎙️ Project Defense Presentation Guide** | [`docs/DEFENSE_DEMO.md`](docs/DEFENSE_DEMO.md) | Word-for-word 5-minute presentation pitch, role demos, and adversarial security tests. |
| **🔑 Credentials & Passcodes Roster** | [`docs/ACCOUNTS_CREDENTIALS.md`](docs/ACCOUNTS_CREDENTIALS.md) | Exhaustive list of demo accounts, passwords, and institutional authorization keys. |
| **💾 Production Database Schema DDL** | [`database/smartbio_schema.sql`](database/smartbio_schema.sql) | 3NF Relational MySQL/PostgreSQL schema with audit triggers and foreign keys. |
