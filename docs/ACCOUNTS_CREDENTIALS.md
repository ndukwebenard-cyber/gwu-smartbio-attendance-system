# Global Wealth University — SmartBio User Accounts & Authentication Credentials

This document provides the exhaustive list of pre-configured **Firebase Authentication Accounts**, **Institutional Security Passcodes**, and **Role-Based Access Control (RBAC)** credentials for the **SmartBio Biometric Attendance & NUC Compliance Management System**.

---

## 🔑 1. Master Firebase Auth & Demo Accounts Roster

All accounts are auto-provisioned into **Firebase Authentication** and **Cloud Firestore (`/users`)** via the **1-Click Cloud Seeder** in the Administrator Portal.

| Role | Avatar | Full Legal Name | Institutional Identifier | Email Address | Password | Gatekeeping Passcode | Defense Demonstration Scope |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | 👨‍💼 | Dr. Kola Balogun | `ADM/2026/001` | `admin@smartbio.edu.ng` | `password123` | `GWU-ADMIN-2026` | Full academic session configuration, user directory management, NDPA 2023 audit trail inspection, 1-Click Firestore Cloud Seeder, and SQL schema dump export. |
| **Course Lecturer** | 👨‍🏫 | Dr. Olawale Adeyemi | `STF/CSC/042` | `o.adeyemi@smartbio.edu.ng` | `password123` | `GWU-FACULTY-2026` | CSC 401 lecture session creation, real-time WebSocket attendance radar monitoring, sweaty/injured finger flagged exception review & overrides, and NUC 75% defaulter roster export. |
| **Course Lecturer** | 👩‍🏫 | Prof. Ngozi Okoro | `STF/CSC/018` | `n.okoro@smartbio.edu.ng` | `password123` | `GWU-FACULTY-2026` | CSC 407 lecture session management and multi-course departmental moderation. |
| **Class Representative** | 👥 | Chukwudi Eze | `GWU/CSC/22/028` | `c.eze@student.gwu.edu` | `password123` | `GWU-PROCTOR-2026` | Hall session proctoring, launching scanner kiosk mode on hall tablet, live hall headcount tracking (e.g. 42/50 present), and broadcasting 75% defaulter warning alerts. *(Separation of Duties: Cannot override flags)*. |
| **Student** *(At Risk)* | 🎓 | Benedict Uchechukwu | `GWU/CSC/22/001` | `b.uche@student.gwu.edu` | `password123` | *(None - Open)* | 8/10 attendance (80% - Cleared), inspecting personal NUC 75% progress gauges, viewing lecture logs, and generating official QR-coded exam clearance dockets. |
| **Student** *(Eligible)* | 👩‍🎓 | Folake Adebayo | `GWU/CSC/22/014` | `f.adebayo@student.gwu.edu` | `password123` | *(None - Open)* | 10/10 attendance (100% - Fully Cleared), generating examination clearance docket. |
| **Student** *(Defaulter)* | 👩‍🎓 | Amina Mohammed | `GWU/CSC/22/035` | `a.mohammed@student.gwu.edu` | `password123` | *(None - Open)* | 5/10 attendance (50% - Ineligible/Barred), displaying automated deficit forecast (+3 classes required). |

---

## 🔐 2. Institutional RBAC Gatekeeping Passcodes

To prevent privilege escalation during user self-registration, privileged roles require institutional passcodes issued by university administration:

```text
┌─────────────────────────────────────────────────────────────┐
│               GWU INSTITUTIONAL PASSCODES                   │
├──────────────────────────────┬──────────────────────────────┤
│ System Administrator:        │ GWU-ADMIN-2026               │
│ Course Lecturer / Faculty:   │ GWU-FACULTY-2026             │
│ Class Representative / Proctor:│ GWU-PROCTOR-2026           │
│ Student Open Enrollment:     │ (No passcode required)       │
└──────────────────────────────┴──────────────────────────────┘
```

---

## ☁️ 3. How to Provision or Reset All Accounts (1-Click Seeder)

If setting up a new Firebase environment or resetting data before project defense:

1. Open the application: [`https://ndukwebenard-cyber.github.io/gwu-smartbio-attendance-system/`](https://ndukwebenard-cyber.github.io/gwu-smartbio-attendance-system/)
2. Switch to the **`👨‍💼 Administrator`** portal.
3. Click the blue **`☁️ Seed Firestore Cloud`** button in the top action bar.
4. The system will automatically:
   - Create all 7 accounts in **Firebase Authentication** with password `password123`.
   - Seed all academic records (`/users`, `/courses`, `/departments`, `/attendance_records`, `/flagged_exceptions`) into **Cloud Firestore**.
5. Once complete, you can sign in with any of the accounts above using the **`🚪 Switch User`** button.
