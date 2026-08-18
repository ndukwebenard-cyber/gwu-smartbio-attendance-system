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
  - The lecturer verifies the student’s physical University ID card and approves the record with a mandatory **NDPA 2023 compliant audit remark**.

---

## 🚀 Part 2: System Features & Functional Modules

### 1. Role-Based Access Control (RBAC) Architecture
* **Administrator**: Full academic session configuration, student and lecturer directory, NDPA audit trail viewer, 1-click database reset, and **1-Click SQL Dump Exporter**.
* **Lecturer**: Lecture session creation with real-time countdown timer, live attendance streaming radar, flagged exception resolution queue, and exportable 75% NUC defaulter rosters.
* **Class Representative (Course Proctor)**: Dedicated proctor role allowing the rep to launch the classroom kiosk terminal, view real-time hall headcount (e.g. 42/50 in hall), and broadcast defaulter warning alerts, with a strict prohibition against flag overrides.
* **Student**: Personal attendance percentage progress bars, detailed lecture breakdown logs, and **Official Printable Examination Clearance Dockets** with anti-tamper QR tokens.
* **Classroom Kiosk Scanner**: Optical sensor graphical simulation with laser sweep, minutiae detection, acoustic feedback (Web Audio API), and native browser WebAuthn biometrics.

---

### 2. Dual-Mode Biometric Verification Engine
* **Modern WebAuthn API**: Interoperates with native operating system biometric authenticators (Apple TouchID, Windows Hello, Android Biometric Prompt) via browser cryptographic handshakes.
* **Interactive Optical Scanner Terminal**: High-fidelity optical sensor simulation supporting stress testing and edge-case simulations (Sweaty Finger, Injured Ridge, Non-Enrolled Stranger).

---

### 3. NUC 75% Rule Compliance & Clearance Algorithm
* Real-time statutory attendance calculation:
  $$\text{Attendance Rate } (P) = \left(\frac{\text{Attended Sessions}}{\text{Conducted Sessions}}\right) \times 100$$
* Dynamic Classification:
  - 🟢 **Eligible ($\ge 75.00\%$)**: Fully cleared for semester examination.
  - 🟡 **At Risk ($70.00\% - 74.99\%$)**: Automated deficit forecast indicating exact number of upcoming lectures required to clear the deficit:
    $$x = \left\lceil \frac{0.75 \times C - A}{0.25} \right\rceil$$
  - 🔴 **Ineligible ($< 70.00\%$)**: Flagged as academic defaulter, barred from course examination.

---

### 4. Nigeria Data Protection Act (NDPA) 2023 Compliance
* **Zero Raw Image Storage**: Only irreversible one-way SHA-256 minutiae hashes and WebAuthn public keys are persisted.
* **Immutable Audit Trail**: Every session creation, scan attempt, and lecturer override logs actor identity, timestamp, IP address, and security reason notes.

---

## 💻 Part 3: Technical Implementation Details

| Layer | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5, CSS3 Glassmorphism, Modular ES6 JavaScript | Single-Page Application (SPA), zero build toolchain, 100% GitHub Pages compatible |
| **Real-Time Cloud Sync** | Firebase Cloud Firestore (SDK v10 CDN) | Real-time WebSocket multi-device sync (`onSnapshot`) between kiosks, phones, and laptops |
| **Offline Storage Engine** | IndexedDB & LocalStorage Repository | Offline-first relational cache with 1-click seed preloading and SQL dump generation |
| **Acoustic Feedback** | Web Audio API Oscillator & Gain Synthesizer | Tactile audio cues (laser chirp, success chime, warning beep, error buzz) with 0 external sound files |
| **Relational Database DDL** | MySQL 8.0 & PostgreSQL 16 (3NF Normalized) | Formal schema and seed scripts for Chapter 4 academic dissertation |
| **Diagramming System** | Mermaid (`.mmd` & `.md`) | Standardized flowcharts and ERDs exportable via `mermaid.live` |
