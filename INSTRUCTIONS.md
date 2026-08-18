# Global Wealth University — SmartBio Project Instructions & Verification Protocol

> **CRITICAL DIRECTIVE**: This instructions document **MUST BE CONSULTED AND CHECKED** before performing any modifications, feature additions, database schema updates, or deployments on the **Global Wealth University SmartBio Attendance Platform**.

---

## 🛡️ Part 1: Mandatory Pre-Action Checklist

Before altering any code or database structure, verify that your proposed change adheres to the following 7 core invariants:

- [ ] **1. NUC 75% Regulatory Formula Invariant**:
  - The statutory attendance calculation must strictly follow:
    $$\text{Attendance Rate } (P) = \left(\frac{\text{Attended Sessions}}{\text{Conducted Sessions}}\right) \times 100$$
  - Thresholds must remain:
    - $\ge 75.00\% \rightarrow \text{ELIGIBLE (CLEARED)}$
    - $70.00\% - 74.99\% \rightarrow \text{AT RISK (WARNING)}$
    - $< 70.00\% \rightarrow \text{INELIGIBLE (DEFAULTER)}$

- [ ] **2. NDPA 2023 Biometric Privacy Invariant**:
  - **NEVER** persist or transmit raw fingerprint images or biometric pixel arrays.
  - Only store cryptographic SHA-256 minutiae hashes, WebAuthn public keys, or standard feature descriptors.
  - Every manual flag override and attendance credit **MUST** produce an immutable audit log entry.

- [ ] **3. Strict Separation of Duties & RBAC Gatekeeping Invariant**:
  - **Student Self-Enrollment**: Open to students registering with institutional matric numbers. Enforces strict Route Guard locking them exclusively to the Student Portal.
  - **Privileged Role Gatekeeping**: Registering as `LECTURER`, `CLASS_REP`, or `ADMIN` mandates verification of confidential institutional security passcodes (`GWU-FACULTY-2026`, `GWU-PROCTOR-2026`, `GWU-ADMIN-2026`).
  - **Class Representatives**: Proctor privileges only (kiosk launch, live headcount monitoring, defaulter notice broadcast).
  - **Class Representatives MUST NEVER** be granted permission to override/approve biometric flags or manually mark peers present.
  - Only **Lecturers** and **System Administrators** hold flag override authority with mandatory audit notes.
  - **Navbar Route Guards**: Active navbar tabs dynamically lock down based on the authenticated role. Switching accounts is done via the dedicated `🚪 Switch User` action.

- [ ] **4. GitHub Pages Zero-Build Compatibility Invariant**:
  - The application must run directly from GitHub Pages as a high-performance Single-Page Application (SPA) without requiring Node.js, Webpack, Vite build pipelines, or backend server runtimes.
  - Firebase Web SDK must be loaded modularly or via CDN (`compat/v10`).

- [ ] **5. Mobile-First & Touch Responsiveness Invariant** _(strict enforcement for ALL screens including Auth)_:
  - All interactive tap zones (buttons, role pills, platen scanner, modal controls) must satisfy the minimum touch target standard of **44px × 44px** (`--touch-min`).
  - All views must remain fully functional on mobile viewports (**360px – 480px**) without horizontal layout overflow.
  - **Modals (Sign In / Sign Up / Reset Password / Docket / Cloud Config)**: Already configured as bottom-sheet on ≤768px. NEVER add `max-width` to `.modal-dialog` via inline styles — use the `#authModal .modal-dialog` CSS rule only.
  - **Two-column form grids**: ALWAYS use the `.form-row-2col` CSS class. NEVER use raw `style="display: grid; grid-template-columns: 1fr 1fr"` inline — this will overflow on 360px phones and fail mobile review.
    - `.form-row-2col` renders as single column by default (mobile), and expands to two columns only at `min-width: 540px`.
  - **Navbar auth chip (`#btnNavAuth`)**: Must show `avatar + first name + role badge` on tablet. On ≤380px, the role badge and button label are hidden — only the emoji icon and avatar remain.
  - **`🚪 Switch User` button**: On ≤380px, renders as icon-only (`🚪`) to preserve navbar space.
  - **All `select`, `input`, `textarea` form controls**: Must have `font-size: 1rem` (≥16px) to prevent iOS Safari auto-zoom on focus.
  - **Auth modal forms**: All `input` and `select` controls already inherit `min-height: var(--touch-min)` from `.form-control`. NEVER override this to less than 44px.


- [ ] **6. Academic SQL & Repository Synchrony**:
  - Any entity or field added in `js/data.js` must be simultaneously updated in:
    - [`database/schema.sql`](database/schema.sql) (MySQL 8.0 / PostgreSQL DDL)
    - [`database/seeds.sql`](database/seeds.sql) (Test Seed Dataset)
    - [`docs/DATABASE_DICTIONARY.md`](docs/DATABASE_DICTIONARY.md) (Data Dictionary)

- [ ] **7. Mermaid Diagram Synchrony**:
  - Any architectural or workflow adjustment must be reflected in both the `.mmd` files in [`diagrams/`](diagrams/) and the rendered gallery in [`diagrams/DIAGRAMS_GALLERY.md`](diagrams/DIAGRAMS_GALLERY.md).

---

## 🚀 Part 2: Development & Modification Workflow

When implementing new features or making bug fixes:

1. **Step 1: Check Relevant Documentation**:
   - Review [`docs/PROBLEMS_FEATURES_IMPLEMENTATION.md`](docs/PROBLEMS_FEATURES_IMPLEMENTATION.md) and [`docs/DATABASE_DICTIONARY.md`](docs/DATABASE_DICTIONARY.md).
2. **Step 2: Apply Edits to Modular Layer**:
   - Styling changes: [`css/main.css`](css/main.css), [`css/dashboards.css`](css/dashboards.css), [`css/onboarding.css`](css/onboarding.css), [`css/scanner.css`](css/scanner.css).
   - Data & Business Logic: [`js/data.js`](js/data.js), [`js/compliance.js`](js/compliance.js), [`js/biometric.js`](js/biometric.js), [`js/firebase-config.js`](js/firebase-config.js), [`js/app.js`](js/app.js).
   - Markup: [`index.html`](index.html).
3. **Step 3: Test Interactive Flows**:
   - Test Onboarding Tour $\rightarrow$ Lecturer Session Start $\rightarrow$ Kiosk Normal/Flagged Scan $\rightarrow$ Lecturer Override $\rightarrow$ Student Docket Generation $\rightarrow$ Admin SQL Export.
4. **Step 4: Update Documentation**:
   - Keep [`README.md`](README.md), [`INSTRUCTIONS.md`](INSTRUCTIONS.md), and [`walkthrough.md`](walkthrough.md) synchronized.

---

## 🧪 Part 3: Oral Defense Testing Checklist

Before demonstrating the system to project supervisors, external examiners, or department boards:

- [ ] **1. Onboarding Tour**: Verify that the 4-step onboarding modal displays smoothly on first visit with the Global Wealth University header.
- [ ] **2. Audio Synthesizer**: Ensure computer/device volume is audible so examiners hear the tactile scan chirp, crystal success chime, warning double-beep, and rejection buzz.
- [ ] **3. Exception Flagging Demonstration**:
  - Trigger **Sweaty Finger Scan** or **Injured Finger Scan** on the Kiosk.
  - Show examiners how the system flags the issue to the Lecturer's queue without halting the class.
  - Perform the Lecturer physical ID review and approve the student with an audit remark.
- [ ] **4. Examination Clearance Docket**:
  - Open Student Portal (Benedict Uche).
  - Click **Generate Exam Clearance Docket** and demonstrate the printable PDF format with the anti-tamper QR code token.
- [ ] **5. 1-Click SQL Dump**:
  - Open Admin Portal.
  - Click **Export SQL Dump** to prove that the browser relational engine exports valid SQL DDL.
