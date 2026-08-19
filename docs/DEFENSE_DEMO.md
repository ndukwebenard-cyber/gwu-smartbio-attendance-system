# SmartBio Attendance System — Academic Defense Demonstration Guide

## 🎯 Defense Presentation Overview

This playbook provides the step-by-step demonstration script for the **Final-Year Project Defense Examination** before the Departmental Board of Examiners.

---

## 📋 Pre-Defense Demonstration Checklist

1. Open the application: [`https://ndukwebenard-cyber.github.io/gwu-smartbio-attendance-system/`](https://ndukwebenard-cyber.github.io/gwu-smartbio-attendance-system/)
2. Open browser Developer Tools (`F12` $\rightarrow$ `Console`) to show live logs and execution tracing to the examiners.
3. Ensure the test data is normalized by clicking **`👨‍💼 Administrator`** $\rightarrow$ **`🧪 Run Verification Suite`** (confirming 38/38 tests pass).

---

## 🎙️ Demonstration Sequence (Word-for-Word Walkthrough)

### 🎓 Part 1: Student Perspective & NUC 75% Compliance Engine (2 Minutes)

#### Step 1: Sign in as Benedict Uchechukwu (Cleared Candidate)
1. Click **`🚪 Switch User`** in the top navigation bar.
2. Select **`🎓 Student (Benedict Uchechukwu)`** or click **`🎓 Student (80%)`** in the Quick-Fill bar.
3. Credentials: `b.uche@student.gwu.edu` / `password123`.
4. Click **`Sign In to Dashboard →`**.

**Examiner Talking Point:**
> *"Distinguished examiners, we begin with the student view for candidate **Benedict Uchechukwu (GWU/CSC/22/001)**. In CSC 401 (Advanced Software Engineering), Benedict has attended **8 out of 10 held lectures**, yielding an exact attendance rate of **80.0%**. Because $80.0\% \ge 75.0\%$, the system automatically issues a green `ELIGIBLE (CLEARED)` status badge."*

#### Step 2: Generate & Verify the Digital Clearance Docket
1. Click the blue **`📜 View Examination Clearance Docket`** button.
2. The system dynamically renders the official GWU Examination Docket.
3. Point out:
   - **Student Identity**: Benedict Uchechukwu, Computer Science, 400L.
   - **Course Breakdown**: CSC 401 (8/10, 80.0%, `✓ CLEARED`).
   - **Verifiable Token**: Click the QR Token Box to trigger the digital verification popup:
     $$\text{Status: } \text{VALID — Authoritative NUC 75\% Biometric Attendance Verification Passed.}$$
4. Click **`🖨️ Print / Save as PDF`** to demonstrate official paper docket generation. Close modal.

#### Step 3: Demonstrate Defaulter Forecast (Amina Mohammed)
1. Click **`🚪 Switch User`** $\rightarrow$ Sign in as `a.mohammed@student.gwu.edu` / `password123`.
2. Notice the red status badge: `BARRED (DEFAULTER)` (**5/10 sessions attended = 50.0%**).
3. Point out the **Automated Deficit Forecast**:
   $$\text{Deficit: Attend next 10 consecutive classes to regain 75\% eligibility.}$$
   $$\left\lceil \frac{0.75 \times 10 - 5}{0.25} \right\rceil = \left\lceil \frac{2.5}{0.25} \right\rceil = 10 \text{ lectures}$$

---

### 👨‍🏫 Part 2: Lecturer Live Session & Flagged Exception Workflow (2 Minutes)

#### Step 1: Sign in as Dr. Olawale Adeyemi
1. Click **`🚪 Switch User`** $\rightarrow$ Click **`👨‍🏫 Lecturer`** (`o.adeyemi@smartbio.edu.ng` / `password123`).
2. Click **`Sign In to Dashboard →`**.

#### Step 2: Start an Active Lecture Session
1. In the Lecture Session Controller, select **`CSC 401`**, Topic: `Advanced Software Architecture & WebAuthn`, Venue: `ICT Hall A`.
2. Click **`⚡ Start Live Lecture Session`**.
3. Point out the **Live Radar Countdown Timer** and the active streaming banner.

#### Step 3: Switch to Terminal Kiosk & Demonstrate Scans
1. Click the **`🖲️ Kiosk Scanner`** pill in the top navigation bar.
2. Notice the HUD: `ACTIVE SESSION DETECTED • CSC 401 (ICT Hall A) — Simulation Mode`.
3. Click the green **`🟢 Normal Scan (Benedict Uche)`** trigger:
   - Laser sweep activates, success chime plays.
   - HUD displays `VERIFIED (MATCH 99.4%)`.
4. Click the yellow **`🟡 Sweaty Finger Scan (Tunde Bakare)`** trigger:
   - Low ridge quality simulated (48.5% confidence).
   - Warning tone sounds.
   - HUD displays `FLAGGED EXCEPTION ROUTED`.

#### Step 4: Review & Resolve Exception in Lecturer Dashboard
1. Switch back to **`👨‍🏫 Lecturer`** portal.
2. Scroll to the **`⚠️ Live Flagged Exceptions Queue`**. Notice **Tunde Bakare** is pending review.
3. Click **`Review & Override`**.
4. Remark: *"Verified physical student ID card and photo match."*
5. Click **`✓ Approve Attendance`**.
6. The flag is cleared, attendance credited, and an immutable NDPA audit trail event is automatically generated.

---

### 👥 Part 3: Class Representative Proctoring & Separation of Duties (1 Minute)

#### Step 1: Sign in as Chukwudi Eze (Class Rep)
1. Click **`🚪 Switch User`** $\rightarrow$ Click **`👥 Class Rep`** (`c.eze@student.gwu.edu` / `password123`).
2. Point out the proctoring dashboard:
   - Cohort: `CSC 400L`
   - Headcount Tracker: `5 Enrolled • 4 In Good Standing • 1 At Risk`
3. Click **`📢 Broadcast 75% Warning Alert`** to notify cohort defaulters.

#### Step 2: Adversarial Security Test — Class Rep Attempts Exception Override
1. As the Class Rep, open browser Developer Tools Console (`F12`).
2. Attempt to manually invoke the lecturer's exception override function:
   ```javascript
   smartBioApp.submitResolveOverride('APPROVE');
   ```
3. **Result**: The system immediately rejects the attempt:
   $$\text{"⛔ Access Denied: You are not authorized to resolve biometric exceptions."}$$
4. **Examiner Takeaway**: Demonstrates backend-enforced **Separation of Duties (SoD)**.

---

### 👨‍💼 Part 4: Administrator Governance & Audit Trail (1 Minute)

#### Step 1: Sign in as Dr. Kola Balogun (Administrator)
1. Click **`🚪 Switch User`** $\rightarrow$ Click **`👨‍💼 Admin`** (`admin@smartbio.edu.ng` / `password123`).
2. Demonstrate core governance functions:
   - **Academic Department Registry**: View CSC, CYB, IFT.
   - **Course Allocations & Ownership Governance**: Click **`🔄 Reassign Owner`** on CSC 401 to transfer course ownership with audit logging.
   - **User Directory**: View biometric enrollment statuses and role promotion buttons (`👑 Make Class Rep`).
   - **Immutable NDPA 2023 Audit Trail**: Inspect chronological audit events (`SESSION_START`, `FLAG_OVERRIDE_APPROVED`, `COURSE_OWNERSHIP_TRANSFER`).

---

### 🛡️ Part 5: Adversarial Security Demonstrations

Show the examiners that the system cannot be compromised by client-side manipulation:

| Test Scenario | Attack Vector | System Defense | Result |
| :--- | :--- | :--- | :--- |
| **Attack 1** | Wrong password on login. | Password authentication check. | `⛔ Authentication Failed: Incorrect password.` (Access Denied) |
| **Attack 2** | Student attempts to start a lecture session. | Role capability check (`role === LECTURER \|\| ADMIN`). | `⛔ Access Denied: Only assigned faculty members can initiate live sessions.` |
| **Attack 3** | Lecturer attempts to start session for unassigned course. | Course ownership verification (`course.lecturerId === authUser.id`). | `⛔ Course Ownership Violation.` |
| **Attack 4** | Tampered QR token checked in verification modal. | Cryptographic HMAC signature check. | `STATUS: TAMPERED — Cryptographic signature mismatch.` |
| **Attack 5** | Unenrolled student scans fingerprint in active session. | Cohort enrollment verification (`courseRegistrations`). | `⛔ Attendance Denied: Student is not enrolled in this course.` |
