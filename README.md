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

**SmartBio** is an enterprise-grade, cloud-integrated biometric attendance and academic compliance management system developed for **Global Wealth University (GWU)**. Engineered as a high-performance, zero-build Single-Page Application (SPA), the platform replaces vulnerable paper registers with **cryptographic biometric authentication**, **sub-200ms real-time multi-device WebSocket streaming**, and an **automated NUC 75% Examination Eligibility computation engine**.

### 🎯 Key Academic Problem Solved
Traditional attendance systems in West African higher education suffer from:
1. **Pervasive Proxy Attendance**: Absent students have peers forge signatures or call out names during roll calls.
2. **Sheet Degradation & Transit Loss**: Paper rosters become illegible, torn, or misplaced during departmental moderation.
3. **The Sweaty/Injured Finger Lockout Dilemma (Literature Gap)**: Conventional biometric systems reject students with temporary skin abrasions or moisture, disrupting lectures. SmartBio introduces a real-time **Flagged Exception Resolution Workflow** under Nigeria Data Protection Act (NDPA) 2023 standards.

---

## 🚀 Core Functional Modules

### 1. 🔐 Role-Based Access Control (RBAC) & Gatekeeping
- **Institutional Passcode Gatekeeping**: Prevents privilege escalation during self-registration. Privileged roles require university-issued authorization keys:
  - System Administrator: `GWU-ADMIN-2026`
  - Course Lecturer / Faculty: `GWU-FACULTY-2026`
  - Class Representative / Proctor: `GWU-PROCTOR-2026`
  - Student: *Open Enrollment*
- **Navbar Route Guards**: Top navigation automatically locks down to display only portals authorized for the authenticated user's role.
- **`🚪 Switch User`**: Rapid identity switching between perspectives for seamless defense demonstrations.

### 2. 👨‍🏫 Lecturer Live Streaming Radar & Exception Queue
- **Active Lecture Controller**: Configures course, topic, and venue with a live duration countdown timer.
- **WebSocket Live Radar**: Attendance check-ins broadcast via Firebase Firestore (`onSnapshot`) to the lecturer's screen in `< 200ms`.
- **Flagged Exception Resolution**: Degraded/unreadable scans are placed in a live queue. The lecturer verifies physical ID cards, enters an audit remark, and credits attendance.

### 3. 👥 Class Representative Proctoring Portal (Separation of Duties)
- Dedicated proctoring mode allowing class representatives to launch the classroom kiosk on hall tablets, track live headcount (e.g. 42/50 present), and broadcast 75% defaulter warning notices.
- **Separation of Duties (SoD)**: Class reps are strictly prohibited from overriding flagged scans or altering attendance percentages.

### 4. 🖲️ Dual-Mode Biometric Kiosk Terminal
- **Native Browser WebAuthn API (FIDO2)**: Hardware-backed cryptographic biometric verification (TouchID, Windows Hello, Android Biometrics).
- **Interactive Optical Sensor Simulator**: Minutiae extraction with real-time laser sweep, acoustic synthesizer feedback (laser chirp, success chime, warning beep), and edge-case simulation (*Sweaty Finger, Injured Ridge, Non-Enrolled Stranger*).

### 5. 🎓 Student NUC 75% Compliance Dashboard & QR Docket
- Real-time statutory attendance rate calculation:
  $$\text{Attendance Rate } (P) = \left(\frac{\text{Attended Sessions}}{\text{Conducted Sessions}}\right) \times 100$$
- **Automated Deficit Forecast**: Calculates the exact number of upcoming consecutive lectures needed to regain 75% eligibility:
  $$x = \left\lceil \frac{0.75 \times C - A}{0.25} \right\rceil$$
- **Printable Examination Clearance Docket**: Stamped with clearance status and an anti-tamper QR verification token.

### 6. 👨‍💼 Administrator Portal & 1-Click Cloud Seeder
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
| **🎓 Student (Cleared)** | Benedict Uche (80%) | `b.uche@student.gwu.edu` | `password123` | *(None - Open)* | View 80% cleared gauge and mint QR clearance docket. |
| **👩‍🎓 Student (100%)** | Folake Adebayo | `f.adebayo@student.gwu.edu` | `password123` | *(None - Open)* | 100% attendance rate, perfect clearance status. |
| **👩‍🎓 Student (Defaulter)**| Amina Mohammed (50%) | `a.mohammed@student.gwu.edu` | `password123` | *(None - Open)* | 50% attendance, displays automated deficit forecast (+3 classes). |

---

## 📚 Master Documentation & Defense Suite

The repository contains a full suite of dissertation chapters, defense playbooks, and database DDL scripts:

| Document / Artifact | Location | Purpose |
| :--- | :--- | :--- |
| **📄 2-Page Defense Quick Reference PDF** | [`docs/Quick_Reference_of_Generated_Artifacts.pdf`](docs/Quick_Reference_of_Generated_Artifacts.pdf) | Compiled 2-page printable defense matrix, credentials roster, and screenshot guide. |
| **🎙️ Project Defense Guidelines & Oral Script** | [`docs/PROJECT_DEFENSE_GUIDELINES.md`](docs/PROJECT_DEFENSE_GUIDELINES.md) | Word-for-word 5-minute presentation pitch, live demo sequence, and examiner Q&A playbook. |
| **📝 Dissertation Corrections & Screenshot Guide** | [`docs/DISSERTATION_CORRECTIONS_AND_SCREENSHOT_GUIDE.md`](docs/DISSERTATION_CORRECTIONS_AND_SCREENSHOT_GUIDE.md) | Page-by-page thesis fixes, screenshot capture matrix, and case study alignment. |
| **🔑 Master Credentials & Passcodes** | [`docs/ACCOUNTS_CREDENTIALS.md`](docs/ACCOUNTS_CREDENTIALS.md) | Complete reference for all Firebase Auth accounts and institutional keys. |
| **🗄️ 3NF Relational Database Dictionary** | [`docs/DATABASE_DICTIONARY.md`](docs/DATABASE_DICTIONARY.md) | Formal data dictionary for MySQL 8.0 / PostgreSQL 16 for Chapter 4 dissertation. |
| **📑 Problems & Solved Features Spec** | [`docs/PROBLEMS_FEATURES_IMPLEMENTATION.md`](docs/PROBLEMS_FEATURES_IMPLEMENTATION.md) | Academic problem statement, literature gaps, and technical implementation breakdown. |
| **📊 Standardized UML & Flowchart Gallery** | [`diagrams/DIAGRAMS_GALLERY.md`](diagrams/DIAGRAMS_GALLERY.md) | 6 Mermaid diagrams exportable to high-res SVG/PNG via [mermaid.live](https://mermaid.live). |
| **🗃️ Relational SQL DDL & Seed Dataset** | [`database/schema.sql`](database/schema.sql) & [`database/seeds.sql`](database/seeds.sql) | 3NF normalized SQL schema DDL and test seeds for Chapter 4. |
| **🛡️ Firebase Security Rules** | [`firestore.rules`](firestore.rules) | Production access control rules enforcing RBAC and immutable NDPA audit logs. |

---

## 🏗️ System Architecture & Visual Diagrams

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SMARTBIO MULTI-TIER ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. AUTHENTICATION & RBAC: Firebase Auth JWT + Institutional Passcodes      │
│  2. CLIENT LAYER: Admin · Lecturer Radar · Class Rep · Student · Kiosk (SPA)│
│  3. BIOMETRICS: WebAuthn FIDO2 Public Key + Optical Minutiae Laser Engine   │
│  4. CLOUD SYNC: Google Cloud Firestore WebSockets (sub-200ms onSnapshot)    │
│  5. COMPLIANCE: Automated NUC 75% Engine + NDPA 2023 Immutable Audit Trail  │
└─────────────────────────────────────────────────────────────────────────────┘
```

The system is fully documented with **6 formal Mermaid diagrams** in the [`diagrams/`](diagrams/) directory:
1. `01_system_architecture.mmd` — High-Level Multi-Tier Client-Cloud Architecture
2. `02_biometric_and_flagging_workflow.mmd` — Optical Scan & Flagged Exception Workflow
3. `03_nuc_75_compliance_flow.mmd` — NUC 75% Rule Compliance & Clearance Algorithm
4. `04_rbac_and_class_rep_flow.mmd` — Role-Based Access Control & Gatekeeping Flow
5. `05_entity_relationship_diagram.mmd` — 3NF Entity Relationship Diagram (ERD)
6. `06_multi_device_sync_sequence.mmd` — Multi-Device WebSocket Real-Time Sync Sequence

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | HTML5, Modern Vanilla CSS3, ES6+ JavaScript | Zero-build, high-performance SPA compatible with GitHub Pages. |
| **Design System** | Custom Glassmorphism UI System | Dark-mode tailored palette, responsive bottom-sheets, `.form-row-2col`. |
| **Cloud Synchronization** | Firebase Cloud Firestore (SDK v10 CDN) | Real-time WebSocket multi-device sync (`onSnapshot`). |
| **Authentication** | Firebase Authentication + WebAuthn (FIDO2) | Email/Password JWT tokens and hardware biometric passkeys. |
| **Acoustic Feedback** | W3C Web Audio API Synthesizer | Real-time procedural audio (laser chirp, arpeggio chime, warning beep). |
| **Relational Database** | MySQL 8.0 / PostgreSQL 16 (3NF Normalized) | Formal schema and seed scripts for Chapter 4 dissertation. |
| **Version Control & Hosting**| GitHub Pages + Git SCM | Zero-cost continuous deployment directly from `main` branch. |

---

## 🚀 How to Run & Test the Application

### 1. Live Web Version (Instant Access)
Navigate to: **[https://ndukwebenard-cyber.github.io/gwu-smartbio-attendance-system/](https://ndukwebenard-cyber.github.io/gwu-smartbio-attendance-system/)**

### 2. Local Execution (No Node.js Required)
Simply clone the repository and open `index.html` in any modern web browser:
```bash
git clone https://github.com/ndukwebenard-cyber/gwu-smartbio-attendance-system.git
cd gwu-smartbio-attendance-system
# Open index.html in your browser
start index.html  # On Windows
```

### 3. Provisioning Cloud Firestore & Auth (1-Click Seeder)
1. Open the application and switch to **`👨‍💼 Administrator`**.
2. Click the blue **`☁️ Seed Firestore Cloud`** button in the header.
3. The system will automatically create all user accounts in Firebase Auth and populate all Firestore collections in 2 seconds.

---

## ⚖️ Academic & Legal Compliance

- **National Universities Commission (NUC)**: Enforces the statutory 75% course attendance prerequisite for undergraduate examination clearance.
- **Nigeria Data Protection Act (NDPA) 2023**: Complies with §30 (Data Minimization) by storing one-way SHA-256 minutiae coordinate hashes instead of raw fingerprint images, and maintaining immutable audit logs (§37).

---

## 👨‍💻 Author & Acknowledgements

**Ndukwe Benedict Chibuikem**  
Matriculation Number: `GWU/BSC/CS/2020/36182`  
Department of Computer Science & Software Engineering  
Global Wealth University, Lome, Togo  

*Supervised by*: **Engr. Ebofuai Joshua**
