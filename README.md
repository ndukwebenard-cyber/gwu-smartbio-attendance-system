# Global Wealth University — SmartBio Attendance & NUC Compliance System

An enterprise-grade, defense-ready web application implementing a full-featured biometric attendance tracking and NUC regulatory compliance infrastructure for **Global Wealth University**. Designed and developed for final-year B.Sc. Computer Science & Software Engineering project defense.

---

## 🌟 Key Features

1. **Interactive Onboarding Screen & Product Tour**:
   - Guided step-by-step feature showcase explaining the NUC 75% rule, WebAuthn biometrics, and exception flagging.
   - 1-Click **Instant Demo Sandbox** to switch between Administrator, Lecturer, Student, and Kiosk Terminal perspectives.

2. **Multi-Role Role-Based Access Control (RBAC)**:
   - **Administrator Portal**: Student/staff enrollment, academic sessions, course allocations, NDPA 2023 audit trail logs, 1-click database reset, and SQL dump export.
   - **Lecturer Portal**: Active lecture session controller, live real-time attendance radar stream, flagged exception queue with physical ID override, and automated NUC 75% defaulter roster.
   - **Student Portal**: Course attendance percentages with color-coded compliance gauges, full lecture history breakdown, and official printable **Examination Clearance Docket**.
   - **Classroom Scanner Terminal**: High-fidelity optical sensor simulation with moving laser beam, minutiae detection, acoustic feedback (Web Audio API), edge-case simulators (sweaty finger, injured ridge), and native browser WebAuthn biometrics.

3. **Multi-Device Real-Time Synchronization (Firebase Firestore + Offline Fallback)**:
   - Live WebSockets (`onSnapshot`) synchronize attendance scans on mobile phones/kiosks directly to the lecturer's dashboard in real-time.
   - Seamless offline fallback to persistent local storage so demonstrations never fail even without internet connectivity.

4. **Academic Defense & Database DDL Package**:
   - 3NF Normalized Relational Database Schema (`database/schema.sql`) for MySQL 8.0 / PostgreSQL 16.
   - Full academic seed dataset (`database/seeds.sql`) for university testing.

---

## 🚀 How to Deploy to GitHub Pages (Step-by-Step)

### Option 1: Direct GitHub Pages Deployment (Recommended)
1. Initialize a Git repository in this folder and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SmartBio Web Attendance System"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```
2. Go to your GitHub Repository in your browser.
3. Click **Settings** → **Pages** (under Code and automation in the left sidebar).
4. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
5. Under **Branch**, select `main` and folder `/ (root)`, then click **Save**.
6. Within 1 minute, your live site will be live at:
   ```
   https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/
   ```

---

## ☁️ Setting Up Real-Time Multi-Device Sync (Firebase)

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a free project.
2. Click **Add App** (`</>` Web icon) and copy your Firebase Config keys.
3. Go to **Firestore Database** → **Create Database** (Start in Test Mode).
4. Open the live SmartBio web application on your device.
5. Click the **Cloud Status** button in the top navigation bar, paste your `API Key` and `Project ID`, and click **Save & Connect**.
6. Any scan on a phone or kiosk will now stream instantly to your laptop's lecturer radar!

---

## 📂 Project Structure

```
.
├── index.html                   # Core Single-Page Application container
├── README.md                    # Deployment & setup documentation
├── css/
│   ├── main.css                 # Design tokens, glassmorphism, responsive styles
│   ├── onboarding.css           # Onboarding tour modal, feature carousel & role cards
│   ├── dashboards.css           # Admin, Lecturer, Student & Printable Docket styles
│   └── scanner.css              # Optical sensor animation, laser beam & HUD styles
├── js/
│   ├── data.js                  # Relational seed store, queries & SQL dump exporter
│   ├── audio.js                 # Web Audio synthesizer for acoustic feedback
│   ├── firebase-config.js       # Cloud Firestore multi-device real-time sync engine
│   ├── biometric.js             # WebAuthn and optical scanner simulation engine
│   ├── compliance.js            # NUC 75% calculation engine & clearance docket
│   ├── onboarding.js            # Onboarding tour controller
│   └── app.js                   # Application state manager and view router
└── database/
    ├── schema.sql               # MySQL 8.0 / PostgreSQL 16 3NF relational schema
    └── seeds.sql                # Complete university test dataset for defense
```

---

## ⚖️ Regulatory & Academic Compliance
- **National Universities Commission (NUC)**: Enforces the statutory 75% lecture attendance prerequisite for semester examination eligibility.
- **Nigeria Data Protection Act (NDPA) 2023**: Implements cryptographic template hashing and immutable audit logging for biometric data handling.
