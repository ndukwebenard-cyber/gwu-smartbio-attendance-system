# Global Wealth University — SmartBio Database Data Dictionary

This document provides the formal **3NF Normalized Relational Database Schema Data Dictionary** for the **SmartBio Attendance & NUC Compliance Management System**. It is formatted for direct inclusion into **Chapter 4 (System Implementation & Database Design)** of the final-year B.Sc. Software Engineering dissertation.

---

## 📑 Entity Summary Table

| Table Name | Description | Primary Key | Foreign Keys |
| :--- | :--- | :--- | :--- |
| `departments` | Academic faculties & departments | `department_id` | — |
| `academic_sessions` | Annual university academic sessions | `session_id` | — |
| `semesters` | First, Second, and Summer semesters | `semester_id` | `session_id` |
| `roles` | System roles (Admin, Lecturer, Class Rep, Student, Kiosk) | `role_id` | — |
| `users` | All system users (Staff, Students, Admins) | `user_id` | `role_id`, `department_id` |
| `biometric_credentials` | NDPA 2023 compliant hashed biometric templates | `credential_id` | `user_id` |
| `courses` | Registered departmental courses & credit units | `course_id` | `department_id`, `semester_id`, `lecturer_id` |
| `course_registrations` | Student enrollment records for courses | `registration_id` | `student_id`, `course_id`, `session_id` |
| `lecture_sessions` | Individual classroom lecture sessions held | `session_instance_id`| `course_id`, `lecturer_id` |
| `attendance_records` | Captured verification logs & confidence scores | `attendance_id` | `session_instance_id`, `student_id`, `resolved_by_lecturer_id` |
| `audit_logs` | Immutable NDPA 2023 security and override audit trail | `log_id` | `actor_user_id` |

---

## 🗄️ Detailed Table Specifications

### 1. `departments`
Stores university faculty and departmental classifications.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `department_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Unique identifier for department |
| `department_code` | `VARCHAR(10)` | No | `UK` | — | Department acronym (e.g. 'CSC', 'CYB') |
| `department_name` | `VARCHAR(100)` | No | — | — | Full department title |
| `faculty` | `VARCHAR(100)` | No | — | — | Supervising faculty name |
| `created_at` | `TIMESTAMP` | No | — | `CURRENT_TIMESTAMP` | Record creation timestamp |

---

### 2. `academic_sessions`
Maintains university academic calendars.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `session_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Unique identifier for academic year |
| `session_name` | `VARCHAR(20)` | No | `UK` | — | Academic session name (e.g. '2025/2026') |
| `is_current` | `BOOLEAN` | Yes | — | `FALSE` | Flag indicating active university session |
| `start_date` | `DATE` | No | — | — | Session start date |
| `end_date` | `DATE` | No | — | — | Session conclusion date |

---

### 3. `semesters`
Divides academic sessions into instructional terms.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `semester_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Unique identifier for semester |
| `session_id` | `INT` | No | `FK` | — | References `academic_sessions(session_id)` |
| `semester_type` | `ENUM('FIRST','SECOND','SUMMER')` | No | — | — | Semester category |
| `is_active` | `BOOLEAN` | Yes | — | `FALSE` | Currently running semester flag |

---

### 4. `roles`
Implements Role-Based Access Control (RBAC).

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `role_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Unique role identifier |
| `role_name` | `ENUM('ADMIN','LECTURER','CLASS_REP','STUDENT','KIOSK_TERMINAL')` | No | `UK` | — | System security role name |
| `description` | `VARCHAR(255)` | Yes | — | `NULL` | Scope of permissions |

---

### 5. `users`
Contains profiles for all university actors.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Primary user identifier |
| `identifier` | `VARCHAR(50)` | No | `UK` | — | Matriculation Number or Staff ID |
| `full_name` | `VARCHAR(150)` | No | — | — | User's full formal name |
| `email` | `VARCHAR(100)` | No | `UK` | — | Institutional email address |
| `phone_number` | `VARCHAR(20)` | Yes | — | `NULL` | Contact phone number |
| `password_hash` | `VARCHAR(255)` | No | — | — | Bcrypt hashed password |
| `role_id` | `INT` | No | `FK` | — | References `roles(role_id)` |
| `department_id` | `INT` | Yes | `FK` | `NULL` | References `departments(department_id)` |
| `academic_level`| `INT` | Yes | — | `NULL` | Student level (100, 200, 300, 400, 500) |
| `profile_photo_url`| `VARCHAR(255)`| Yes | — | `NULL` | Photo URL for visual verification |
| `is_active` | `BOOLEAN` | Yes | — | `TRUE` | Account status flag |
| `created_at` | `TIMESTAMP` | No | — | `CURRENT_TIMESTAMP` | Registration date |

---

### 6. `biometric_credentials` (NDPA 2023 Compliant)
Maintains cryptographic biometric descriptors without storing raw fingerprint images.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `credential_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Unique credential ID |
| `user_id` | `INT` | No | `FK` | — | References `users(user_id)` |
| `credential_type`| `ENUM('WEBAUTHN','FINGERPRINT_OPTICAL','FACIAL_HASH')` | No | — | — | Biometric modal type |
| `biometric_template_hash` | `VARCHAR(255)` | No | — | — | Cryptographic SHA-256 minutiae descriptor |
| `finger_position`| `ENUM('RIGHT_THUMB','RIGHT_INDEX','LEFT_THUMB','LEFT_INDEX','OTHER')` | Yes | — | `'RIGHT_THUMB'` | Enrolled finger position |
| `registered_at` | `TIMESTAMP` | No | — | `CURRENT_TIMESTAMP` | Enrollment timestamp |
| `is_revoked` | `BOOLEAN` | Yes | — | `FALSE` | Revocation status |

---

### 7. `courses`
Maintains departmental course catalogs and regulatory thresholds.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `course_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Primary course identifier |
| `course_code` | `VARCHAR(15)` | No | `UK` | — | Course code (e.g. 'CSC 401') |
| `course_title` | `VARCHAR(150)` | No | — | — | Descriptive course title |
| `credit_units` | `INT` | No | — | `3` | Academic credit weighting |
| `department_id` | `INT` | No | `FK` | — | References `departments(department_id)` |
| `level` | `INT` | No | — | — | Academic level (e.g. 400) |
| `semester_id` | `INT` | No | `FK` | — | References `semesters(semester_id)` |
| `lecturer_id` | `INT` | Yes | `FK` | `NULL` | Assigned Lecturer `users(user_id)` |
| `minimum_attendance_pct` | `DECIMAL(5,2)` | No | — | `75.00` | Statutory NUC attendance threshold |

---

### 8. `course_registrations`
Maps enrolled students to their registered courses.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `registration_id`| `INT` | No | `PK` | `AUTO_INCREMENT` | Enrollment record ID |
| `student_id` | `INT` | No | `FK` | — | References `users(user_id)` |
| `course_id` | `INT` | No | `FK` | — | References `courses(course_id)` |
| `session_id` | `INT` | No | `FK` | — | References `academic_sessions(session_id)` |
| `registration_date` | `TIMESTAMP` | No | — | `CURRENT_TIMESTAMP` | Registration date |
| `is_approved` | `BOOLEAN` | Yes | — | `TRUE` | Departmental registration clearance |

---

### 9. `lecture_sessions`
Records each instance of a lecture delivered.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `session_instance_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Unique lecture session ID |
| `course_id` | `INT` | No | `FK` | — | References `courses(course_id)` |
| `lecturer_id` | `INT` | No | `FK` | — | Conducting lecturer `users(user_id)` |
| `topic` | `VARCHAR(200)` | No | — | — | Topic delivered in class |
| `venue_hall` | `VARCHAR(100)` | No | — | — | Classroom venue / lecture hall |
| `start_time` | `TIMESTAMP` | No | — | `CURRENT_TIMESTAMP` | Session start time |
| `end_time` | `TIMESTAMP` | Yes | — | `NULL` | Session conclusion time |
| `status` | `ENUM('ACTIVE','CONCLUDED','CANCELLED')` | No | — | `'ACTIVE'` | Session state |

---

### 10. `attendance_records`
Captures biometric attendance events and exception resolutions.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `attendance_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Primary attendance record ID |
| `session_instance_id` | `INT` | No | `FK` | — | References `lecture_sessions(session_instance_id)` |
| `student_id` | `INT` | No | `FK` | — | References `users(user_id)` |
| `verification_time` | `TIMESTAMP` | No | — | `CURRENT_TIMESTAMP` | Exact scan timestamp |
| `verification_method` | `ENUM('WEBAUTHN_BIOMETRIC','OPTICAL_FINGERPRINT','MANUAL_OVERRIDE','FLAGGED_RESOLVED')` | No | — | — | Capture method |
| `match_confidence_score` | `DECIMAL(5,2)` | Yes | — | `0.00` | Match confidence (e.g. 98.50%) |
| `status` | `ENUM('PRESENT','FLAGGED','ABSENT','EXCUSED')` | No | — | `'PRESENT'` | Verification outcome |
| `flag_reason` | `VARCHAR(255)` | Yes | — | `NULL` | Reason (e.g. 'SWEATY_RIDGE') |
| `resolved_by_lecturer_id` | `INT` | Yes | `FK` | `NULL` | Approving lecturer `users(user_id)` |
| `resolution_notes` | `TEXT` | Yes | — | `NULL` | Lecturer audit remarks |

---

### 11. `audit_logs`
Provides non-repudiation and NDPA 2023 regulatory compliance.

| Column Name | Data Type | Nullable | Key | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `log_id` | `INT` | No | `PK` | `AUTO_INCREMENT` | Primary log ID |
| `actor_user_id` | `INT` | Yes | `FK` | `NULL` | Performing actor `users(user_id)` |
| `action_type` | `ENUM('LOGIN','SESSION_START','SESSION_END','BIOMETRIC_SCAN','MANUAL_OVERRIDE','FLAG_RESOLVED','DOCKET_GENERATED','ADMIN_UPDATE')` | No | — | — | Security action category |
| `target_entity` | `VARCHAR(50)` | Yes | — | `NULL` | Affected database table/resource |
| `target_id` | `VARCHAR(50)` | Yes | — | `NULL` | Primary key of affected record |
| `action_details` | `TEXT` | No | — | — | Detailed narrative of event |
| `ip_address` | `VARCHAR(45)` | Yes | — | `NULL` | Client IP address |
| `timestamp` | `TIMESTAMP` | No | — | `CURRENT_TIMESTAMP` | Exact event timestamp |
