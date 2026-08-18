# Global Wealth University — SmartBio Project Defense Guidelines & Oral Playbook

**Candidate**: Ndukwe Benedict Chibuikem  
**Matriculation No**: `GWU/BSC/CS/2020/36182`  
**Project Title**: *Design and Implementation of a Cloud-Integrated Fingerprint Biometric Attendance and NUC Compliance Management System (Global Wealth University as Case Study)*  
**Supervisor**: Engr. Ebofuai Joshua  
**Department**: Computer Science & Software Engineering  
**Date of Defense**: August, 2026  

---

## 🎙️ 1. Structured 5–7 Minute Defense Presentation Script

Use this exact oral structure when introducing your project to the panel of examiners:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ORAL DEFENSE TIMELINE & SCRIPT                        │
├────────┬─────────────────┬──────────────────────────────────────────────────┤
│ Min 1  │ Introduction    │ Problem statement & NUC 75% regulatory mandate   │
│ Min 2  │ Literature Gap  │ The "Sweaty/Injured Finger Lockout Failure"      │
│ Min 3  │ Architecture    │ Real-time Cloud Sync + WebAuthn + RBAC Gatekeep  │
│ Min 4-6│ Live Demo       │ Lecturer Start → Kiosk Flag → Override → Docket │
│ Min 7  │ Conclusion      │ NDPA 2023 compliance & Academic contributions    │
└────────┴─────────────────┴──────────────────────────────────────────────────┘
```

### 🗣️ Spoken Script (Word-for-Word Guide):

> *"Good morning, respected Chairman of the Defense Panel, my supervisor Engr. Ebofuai Joshua, and distinguished members of the Department of Computer Science and Software Engineering.*
> 
> *My name is **Ndukwe Benedict Chibuikem**, matriculation number **GWU/BSC/CS/2020/36182**. Today, I present my final year project titled: **Design and Implementation of a Cloud-Integrated Fingerprint Biometric Attendance and NUC Compliance Management System**.*
> 
> *In Nigerian and West African tertiary institutions, the National Universities Commission (NUC) mandates that students achieve a minimum of **75% lecture attendance** before being certified eligible for semester examinations.*
> 
> *However, traditional attendance management relies on paper roll-calls, which suffer from **three critical failures**:*
> 1. *Pervasive proxy signing where absentees have friends forge signatures.*
> 2. *Loss and physical degradation of paper sheets during departmental transit.*
> 3. *Massive administrative calculation latency at the end of the semester.*
> 
> *Furthermore, my critical review of 24 peer-reviewed empirical studies identified a **fundamental literature gap**: existing commercial and academic biometric systems suffer from the **'Sweaty or Injured Finger Lockout Failure'**. When a student arrives with sweaty or scarred fingers, optical sensors reject them, forcing lecturers to either halt the class or turn students away.*
> 
> *To solve this, I designed and implemented **SmartBio**—a cloud-integrated Single-Page Application powered by Google Cloud Firestore for sub-200ms multi-device WebSocket synchronization, Firebase Auth with institutional passcode gatekeeping, browser-native WebAuthn FIDO2 biometrics, an automated NUC 75% clearance engine with anti-tamper QR dockets, and the **Flagged Exception Workflow** complying with Nigeria Data Protection Act (NDPA) 2023.*
> 
> *With your permission, I would like to demonstrate the live working system."*

---

## 💻 2. Step-by-Step Live Demonstration Script

Follow this sequence during your live demo to keep examiners engaged:

### **Step 1: Role-Based Gatekeeping & Authentication**
* **What to Show**: Click `🚪 Switch User` → Select **`Register / Sign Up`**.
* **What to Explain**: 
  > *"To prevent students from creating unauthorized lecturer or administrative accounts, SmartBio implements **Institutional Passcode Gatekeeping**. Selecting Lecturer or Class Rep requires institutional authorization keys (e.g. `GWU-FACULTY-2026`)."*
* **Action**: Sign in as **Dr. Olawale Adeyemi** (`o.adeyemi@smartbio.edu.ng` / `password123`).
* **Highlight**: Notice how the navigation bar automatically locks down, hiding student and admin portals to enforce the **Principle of Least Privilege (PoLP)**.

### **Step 2: Lecturer Starts Live Session**
* **What to Show**: In Lecturer Portal, select course `CSC 401: Advanced Software Architecture`, topic *"Distributed WebAuthn Biometrics"*, venue *"ICT Hall A"*, and click **`▶ Start Live Session`**.
* **What to Explain**: 
  > *"The moment the lecturer starts class, the session metadata and live timer are broadcast via Cloud Firestore WebSockets to all kiosks and students across campus in real time."*

### **Step 3: Edge Case Simulation at Kiosk Scanner**
* **What to Show**: Switch to **`🖲️ Scanner Terminal`**.
* **Action**: Select student **Tunde Bakare**, choose **`Sweaty / Blurred Ridge`**, and click **`Simulate Optical Finger Scan`**.
* **What Happens**: The scanner plays an acoustic warning double-beep, and HUD shows **`FLAGGED EXCEPTION: SWEATY_RIDGE_BLURRED`**.
* **What to Explain**: 
  > *"Instead of disrupting class or barring the student, SmartBio routes degraded scans into a real-time Flagged Queue on the lecturer's radar while the student takes their seat."*

### **Step 4: Lecturer Overrides Flag with NDPA 2023 Audit Trail**
* **What to Show**: Switch back to **`👨‍🏫 Lecturer Portal`**.
* **Action**: See Tunde Bakare appear in the Flagged Queue. Click **`Review & Override`**, enter remark: *"Verified student physical University ID card"*, and click **`Approve & Credit Attendance`**.
* **What to Explain**: 
  > *"The student receives their attendance credit, and an immutable audit log is generated containing the lecturer's ID, timestamp, and verification justification, satisfying NDPA 2023 compliance standards."*

### **Step 5: Student NUC 75% Compliance & Anti-Tamper QR Docket**
* **What to Show**: Switch to **`🎓 Student Portal`** (`b.uche@student.gwu.edu`).
* **What to Explain**:
  > *"SmartBio calculates the exact statutory percentage across all registered courses. For students below 75%, it calculates an automated deficit forecast ($x = \lceil(0.75C - A)/0.25\rceil$) showing exactly how many upcoming classes they must attend to regain clearance."*
* **Action**: Click **`📜 Generate Exam Clearance Docket`**.
* **Highlight**: Show the official clearance docket with the student's photo, status stamps, and cryptographically verifiable QR verification token.

---

## 🎯 3. Anticipated Difficult Examiner Questions & Winning Answers

| # | Anticipated Examiner Question | Flawless Technical Answer |
| :-: | :--- | :--- |
| **Q1** | *"Why did you use web-based WebAuthn and optical simulation instead of physical Arduino fingerprint sensors?"* | **Answer**: *"Modern industry standard biometric architecture is shifting to zero-trust web authenticators (FIDO2/WebAuthn) already embedded in mobile devices and laptops. Physical USB/Arduino modules create driver dependency bottlenecks and single-point hardware lockouts. Our design supports both: WebAuthn for browser biometrics and standardized optical minutiae processing over WebSocket cloud bridges."* |
| **Q2** | *"How does your system comply with the Nigeria Data Protection Act (NDPA) 2023 regarding biometric privacy?"* | **Answer**: *"Under NDPA 2023 §30, storing raw biometric image files (like JPEG/BMP fingerprints) is a critical compliance violation. SmartBio adheres to the principle of Data Minimization: raw images are instantly processed into one-way SHA-256 minutiae coordinate hashes and discarded. Even if the database is breached, raw fingerprints cannot be reverse-engineered."* |
| **Q3** | *"What prevents a class representative or tech-savvy student from altering their attendance percentage?"* | **Answer**: *"We enforce strict Separation of Duties (SoD) and Route Guards. Class Reps can only proctor kiosks and view headcount; they cannot approve flags. At the database layer, Firestore Security Rules prohibit client-side modification of `/attendance_records` and `/audit_logs` without verified lecturer/admin JWT claims."* |
| **Q4** | *"What happens if there is an internet outage in the lecture hall during class?"* | **Answer**: *"SmartBio is built with an Offline-First cache. All scans are recorded locally into the browser's IndexedDB / LocalStorage data store with timestamps. Once network connectivity is restored, the CloudSync engine automatically pushes buffered records to Cloud Firestore."* |
| **Q5** | *"How does the mathematical deficit formula work for at-risk students?"* | **Answer**: *"Let $C$ be total sessions conducted and $A$ be sessions attended. To find additional consecutive classes $x$ required to reach $75\%$: $\frac{A + x}{C + x} \ge 0.75 \implies A + x \ge 0.75C + 0.75x \implies 0.25x \ge 0.75C - A \implies x = \left\lceil \frac{0.75C - A}{0.25} \right\rceil$. Our system calculates this dynamically."* |

---

## 📋 4. Demo Login Credentials Quick-Card (Keep on Desk)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DEFENSE CREDENTIALS QUICK REFERENCE                    │
├───────────────┬───────────────────────────────┬─────────────┬───────────────┤
│ Role          │ Email                         │ Password    │ Passcode      │
├───────────────┼───────────────────────────────┼─────────────┼───────────────┤
│ Administrator │ admin@smartbio.edu.ng         │ password123 │ GWU-ADMIN-2026│
│ Lecturer      │ o.adeyemi@smartbio.edu.ng     │ password123 │ GWU-FACULTY-2026│
│ Lecturer      │ n.okoro@smartbio.edu.ng       │ password123 │ GWU-FACULTY-2026│
│ Class Rep     │ c.eze@student.gwu.edu         │ password123 │ GWU-PROCTOR-2026│
│ Student (80%) │ b.uche@student.gwu.edu        │ password123 │ (Open)        │
│ Student (50%) │ a.mohammed@student.gwu.edu    │ password123 │ (Open)        │
└───────────────┴───────────────────────────────┴─────────────┴───────────────┘
```
