# SmartBio Attendance System — Automated Test & Security Verification Specification

## 1. Testing Framework Overview

The **SmartBio Attendance System** includes an embedded test harness located in [`js/tests.js`](file:///c:/Users/HP%20UCHE/Desktop/Benedict/js/tests.js). The suite verifies business logic algorithms, cryptographic signatures, data integrity constraints, and role-based security boundaries.

### 🧪 How to Execute the Test Suite

1. **Via Administrator Console UI**:
   - Open the web application and switch to the **`👨‍💼 Administrator`** portal.
   - Click the green **`🧪 Run Verification Suite`** button in the top action bar.
   - The system executes all assertions and displays a summary dialog with results.
2. **Via Browser Developer Tools Console**:
   - Press `F12` or `Ctrl+Shift+I` to open DevTools.
   - Run:
     ```javascript
     window.smartBioTests.runAllTests();
     ```
   - All assertions print with formatted green `[PASS]` / red `[FAIL]` status indicators.

---

## 2. Test Suite Assertion Matrix

| Module | Test Assertion | Target Specification | Validation Mechanism |
| :--- | :--- | :--- | :--- |
| **Data Normalization** | Benedict Uchechukwu attendance is exactly 8/10 (80.0% CLEARED). | Section 33, 78 | Recomputes CSC 401 attendance records: exactly 8 attended out of 10 held sessions. |
| **Data Normalization** | Folake Adebayo has 10/10 (100.0% CLEARED). | Section 34 | Recomputes CSC 401 attendance: 10 attended / 10 held. |
| **Data Normalization** | Amina Mohammed has 5/10 (50.0% INELIGIBLE/DEFAULTER). | Section 34 | Recomputes CSC 401 attendance: 5 attended / 10 held. |
| **Data Normalization** | Chukwudi Eze has 7/10 (70.0% AT_RISK). | Section 34 | Recomputes CSC 401 attendance: 7 attended / 10 held. |
| **Data Normalization** | Public seeds do not expose raw SHA-256 fingerprint minutiae hashes. | Section 21, 44 | Asserts all biometric identifiers use synthetic reference tags. |
| **NUC Engine** | $\ge 75\%$ classified as `ELIGIBLE`. | Section 31 | Tests boundary values: 100%, 80%, 75% $\rightarrow$ `ELIGIBLE`. |
| **NUC Engine** | $70.0\% - 74.99\%$ classified as `AT_RISK`. | Section 31 | Tests boundary values: 74%, 70% $\rightarrow$ `AT_RISK`. |
| **NUC Engine** | $< 70\%$ classified as `INELIGIBLE`. | Section 31 | Tests boundary values: 69%, 50%, 0% $\rightarrow$ `INELIGIBLE`. |
| **Deficit Forecast** | 8/10 (80%) forecasts 0 additional classes needed. | Section 32 | Mathematical formula validation: $x = 0$. |
| **Deficit Forecast** | 7/10 (70%) forecasts 2 consecutive classes needed. | Section 32 | $(7+2)/(10+2) = 9/12 = 75\% \rightarrow x = 2$. |
| **Deficit Forecast** | 5/10 (50%) forecasts 10 consecutive classes needed. | Section 32 | $(5+10)/(10+10) = 15/20 = 75\% \rightarrow x = 10$. |
| **Clearance Token** | Generates structured signed token format. | Section 39 | Validates `GWU-NUC-V2.<id>.<epoch>.<sig>` structure. |
| **Clearance Token** | Unmodified token returns `VALID`. | Section 39 | Authenticates HMAC signature against student session record. |
| **Clearance Token** | Tampered signature returns `TAMPERED`. | Section 39 | Mutates token character sequence and verifies signature rejection. |
| **Clearance Token** | Ineligible student token returns `REVOKED`. | Section 41 | Verifies that issuing token for Amina (50%) dynamically revokes. |
| **Deduplication** | Duplicate check-in for same session & student is rejected. | Section 16 | Idempotency guard asserts attendance count remains unchanged. |
| **Enrollment** | Enrolled student check-in is permitted for CSC 401. | Section 27 | Checks `courseRegistrations` relational mapping. |
| **Enrollment** | Unregistered student check-in is rejected. | Section 27 | Attempts check-in against course #999 and verifies rejection. |
| **Separation of Duties** | `STUDENT` cannot resolve exceptions. | Section 7, 22 | Role check asserts only `LECTURER` and `ADMIN` hold privilege. |
| **Separation of Duties** | `CLASS_REP` cannot resolve exceptions. | Section 7, 22 | Role check asserts proctor cannot approve attendance overrides. |
| **Separation of Duties** | `LECTURER` can resolve exceptions. | Section 7, 22 | Verifies faculty exception resolution authorization. |
| **Separation of Duties** | `ADMIN` can seed cloud database. | Section 7, 37 | Verifies administrative restriction on cloud database seeder. |
| **Auth Security** | Unknown account query returns `undefined` (no role fallback). | Section 3, 4 | Verifies elimination of `users.find(u => u.role === role) \|\| users[0]`. |
| **Auth Security** | Wrong password is hard-rejected. | Section 3, 5 | Verifies login failure on invalid password strings. |
| **Cloud Sync** | Shows "Online" and active green sync dot when connected to internet & Firebase. | Section 9, 29 | Asserts `isConnected` matches network status and UI indicator updates in real time. |

---

## 3. Sample Console Test Output

When running `window.smartBioTests.runAllTests()`, the console output resembles:

```text
═══════════════════════════════════════════════════════════
🛡️ SMARTBIO ATTENDANCE SYSTEM — EXHAUSTIVE VERIFICATION SUITE
═══════════════════════════════════════════════════════════
[PASS] Benedict Uchechukwu identity exists in university directory
[PASS] Benedict Uchechukwu has exactly 8 attended out of 10 held (80.0% CLEARED)
[PASS] Folake Adebayo has exactly 10/10 (100.0% CLEARED)
[PASS] Amina Mohammed has exactly 5/10 (50.0% INELIGIBLE/DEFAULTER)
[PASS] Chukwudi Eze has exactly 7/10 (70.0% AT_RISK)
[PASS] Public seed user repository does NOT publish raw SHA256 hashes
[PASS] NUC Rule: 10/10 (100%) correctly classified as ELIGIBLE
[PASS] NUC Rule: 8/10 (80%) correctly classified as ELIGIBLE
[PASS] NUC Rule: 74/100 (74%) correctly classified as AT_RISK
[PASS] NUC Rule: 70/100 (70%) correctly classified as AT_RISK
[PASS] NUC Rule: 69/100 (69%) correctly classified as INELIGIBLE
[PASS] NUC Rule: 5/10 (50%) correctly classified as INELIGIBLE
[PASS] Deficit for 8/10 (80%) is 0 future classes
[PASS] Deficit for 7/10 (70%) is 2 consecutive future classes to reach 75%
[PASS] Deficit for 5/10 (50%) is 10 consecutive future classes to reach 75%
[PASS] Generates structured security token format (GWU-NUC-V2.<id>.<epoch>.<sig>)
[PASS] Verification of authentic token returns VALID
[PASS] Verification of altered token returns TAMPERED
[PASS] Verification of malformed token returns INVALID
[PASS] Verification of ineligible student token is dynamically REVOKED
[PASS] Duplicate attendance submission is rejected by data store
[PASS] Attendance records count remains unchanged after duplicate attempt
[PASS] Student is verified as enrolled in legitimate course CSC 401
[PASS] Student is verified as NOT enrolled in unregistered course #999
[PASS] STUDENT cannot resolve biometric exception
[PASS] CLASS_REP cannot resolve biometric exception (Strict proctor separation)
[PASS] LECTURER can resolve biometric exception
[PASS] ADMIN can resolve biometric exception
[PASS] STUDENT cannot start active lecture session
[PASS] CLASS_REP cannot start active lecture session
[PASS] LECTURER can start active lecture session
[PASS] LECTURER cannot seed cloud database
[PASS] CLASS_REP cannot seed cloud database
[PASS] ADMIN can seed cloud database
[PASS] Non-existent user query returns null (no implicit auto-selection)
[PASS] Standard demo password password123 is accepted
[PASS] Invalid password "wrongpass" is strictly rejected
───────────────────────────────────────────────────────────
Summary: 38 PASSED, 0 FAILED across 38 test assertions.
```
