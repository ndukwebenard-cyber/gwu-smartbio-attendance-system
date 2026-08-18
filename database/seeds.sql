-- ============================================================================
-- SMARTBIO ATTENDANCE & NUC COMPLIANCE MANAGEMENT SYSTEM
-- Seed Dataset for Academic Testing & Defense Demonstration
-- ============================================================================

USE smartbio_attendance_db;

-- 1. Insert Roles
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'ADMIN', 'System Administrator with full management & audit privileges'),
(2, 'LECTURER', 'Academic staff creating sessions, monitoring radar & resolving flags'),
(3, 'CLASS_REP', 'Class Representative / Proctor launching kiosk & broadcasting alerts'),
(4, 'STUDENT', 'Enrolled student tracking attendance and generating clearance dockets'),
(5, 'KIOSK_TERMINAL', 'Classroom physical scanner kiosk / terminal interface')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 2. Insert Departments
INSERT INTO departments (department_id, department_code, department_name, faculty) VALUES
(1, 'CSC', 'Computer Science & Software Engineering', 'Faculty of Basic & Applied Sciences'),
(2, 'CYB', 'Cyber Security Science', 'Faculty of Basic & Applied Sciences'),
(3, 'IFT', 'Information Technology', 'Faculty of Basic & Applied Sciences')
ON DUPLICATE KEY UPDATE department_name=VALUES(department_name);

-- 3. Insert Academic Sessions & Semesters
INSERT INTO academic_sessions (session_id, session_name, is_current, start_date, end_date) VALUES
(1, '2025/2026', TRUE, '2025-10-01', '2026-07-30')
ON DUPLICATE KEY UPDATE is_current=VALUES(is_current);

INSERT INTO semesters (semester_id, session_id, semester_type, is_active) VALUES
(1, 1, 'FIRST', FALSE),
(2, 1, 'SECOND', TRUE)
ON DUPLICATE KEY UPDATE is_active=VALUES(is_active);

-- 4. Insert Users
INSERT INTO users (user_id, identifier, full_name, email, phone_number, password_hash, role_id, department_id, academic_level) VALUES
-- Admin
(1, 'ADM/2026/001', 'System Administrator (Dr. K. Balogun)', 'admin@smartbio.edu.ng', '+2348030000001', '$2y$10$hashed_admin_pass', 1, 1, NULL),
-- Lecturers
(2, 'STF/CSC/042', 'Dr. Olawale Adeyemi', 'o.adeyemi@smartbio.edu.ng', '+2348031234567', '$2y$10$hashed_lecturer_pass', 2, 1, NULL),
(3, 'STF/CSC/018', 'Prof. Ngozi Okoro', 'n.okoro@smartbio.edu.ng', '+2348039876543', '$2y$10$hashed_lecturer_pass', 2, 1, NULL),
-- Students (400 Level Final Year)
(4, 'GWU/CSC/22/001', 'Benedict Uchechukwu', 'b.uche@student.gwu.edu', '+2348141112233', '$2y$10$hashed_student_pass', 4, 1, 400),
(5, 'GWU/CSC/22/014', 'Folake Adebayo', 'f.adebayo@student.gwu.edu', '+2348142223344', '$2y$10$hashed_student_pass', 4, 1, 400),
-- Class Representative (Course Proctor)
(6, 'GWU/CSC/22/028', 'Chukwudi Eze', 'c.eze@student.gwu.edu', '+2348143334455', '$2y$10$hashed_student_pass', 3, 1, 400),
-- Other Students
(7, 'GWU/CSC/22/035', 'Amina Mohammed', 'a.mohammed@student.gwu.edu', '+2348144445566', '$2y$10$hashed_student_pass', 4, 1, 400),
(8, 'GWU/CSC/22/052', 'Tunde Bakare', 't.bakare@student.gwu.edu', '+2348145556677', '$2y$10$hashed_student_pass', 4, 1, 400),
(9, 'GWU/CSC/22/063', 'Emeka Nwosu', 'e.nwosu@student.gwu.edu', '+2348146667788', '$2y$10$hashed_student_pass', 4, 1, 400),
(10, 'GWU/CSC/22/077', 'Zainab Bello', 'z.bello@student.gwu.edu', '+2348147778899', '$2y$10$hashed_student_pass', 4, 1, 400)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 5. Insert Courses
INSERT INTO courses (course_id, course_code, course_title, credit_units, department_id, level, semester_id, lecturer_id, minimum_attendance_pct) VALUES
(1, 'CSC 401', 'Advanced Software Engineering & Architecture', 3, 1, 400, 2, 2, 75.00),
(2, 'CSC 405', 'Biometrics & Cyber-Physical Systems', 3, 1, 400, 2, 2, 75.00),
(3, 'CSC 407', 'Distributed Cloud Computing & Web Services', 3, 1, 400, 2, 3, 75.00),
(4, 'CSC 411', 'Database Administration & Big Data Systems', 3, 1, 400, 2, 3, 75.00)
ON DUPLICATE KEY UPDATE course_title=VALUES(course_title);

-- 6. Insert Course Registrations (Enrolling Students in Courses)
INSERT IGNORE INTO course_registrations (student_id, course_id, session_id) VALUES
-- Benedict
(4, 1, 1), (4, 2, 1), (4, 3, 1), (4, 4, 1),
-- Folake
(5, 1, 1), (5, 2, 1), (5, 3, 1), (5, 4, 1),
-- Chukwudi
(6, 1, 1), (6, 2, 1), (6, 3, 1), (6, 4, 1),
-- Amina
(7, 1, 1), (7, 2, 1), (7, 3, 1), (7, 4, 1),
-- Tunde
(8, 1, 1), (8, 2, 1), (8, 3, 1), (8, 4, 1),
-- Emeka
(9, 1, 1), (9, 2, 1), (9, 3, 1), (9, 4, 1),
-- Zainab
(10, 1, 1), (10, 2, 1), (10, 3, 1), (10, 4, 1);

-- 7. Insert Biometric Credentials
INSERT INTO biometric_credentials (user_id, credential_type, biometric_template_hash, finger_position) VALUES
(4, 'OPTICAL_FINGERPRINT', 'SHA256:8f4c2e91b637dae15091726a84d29f03', 'RIGHT_THUMB'),
(5, 'OPTICAL_FINGERPRINT', 'SHA256:7b1e4c90a518cfe24182635b73e18a92', 'RIGHT_THUMB'),
(6, 'OPTICAL_FINGERPRINT', 'SHA256:6a0d3b89e407bed13071524a62d07b81', 'RIGHT_THUMB'),
(7, 'OPTICAL_FINGERPRINT', 'SHA256:59fc2a78d3f6adc02f60413951c96a70', 'RIGHT_THUMB'),
(8, 'OPTICAL_FINGERPRINT', 'SHA256:48eb1967c2e59cb01e5f302840b8596f', 'RIGHT_THUMB'),
(9, 'OPTICAL_FINGERPRINT', 'SHA256:37da0856b1d48ba00d4e2f173fa7485e', 'RIGHT_THUMB'),
(10, 'OPTICAL_FINGERPRINT', 'SHA256:26c9f745a0c37a90fc3d1e062e96374d', 'RIGHT_THUMB')
ON DUPLICATE KEY UPDATE biometric_template_hash=VALUES(biometric_template_hash);

-- 8. Insert Lecture Sessions (CSC 401 - 10 Sessions Held)
INSERT INTO lecture_sessions (session_instance_id, course_id, lecturer_id, topic, venue_hall, start_time, end_time, status) VALUES
(1, 1, 2, 'Software Architectural Styles & Microservices', 'ICT Hall A', '2026-02-03 09:00:00', '2026-02-03 11:00:00', 'CONCLUDED'),
(2, 1, 2, 'Design Patterns & SOLID Principles in Web Systems', 'ICT Hall A', '2026-02-10 09:00:00', '2026-02-10 11:00:00', 'CONCLUDED'),
(3, 1, 2, 'RESTful APIs & Asynchronous Micro-frontends', 'ICT Hall A', '2026-02-17 09:00:00', '2026-02-17 11:00:00', 'CONCLUDED'),
(4, 1, 2, 'Relational 3NF vs NoSQL Real-time Datastores', 'ICT Hall A', '2026-02-24 09:00:00', '2026-02-24 11:00:00', 'CONCLUDED'),
(5, 1, 2, 'WebAuthn Standard & Cryptographic Handshakes', 'ICT Hall A', '2026-03-03 09:00:00', '2026-03-03 11:00:00', 'CONCLUDED'),
(6, 1, 2, 'Biometric Template Extraction & Minutiae Matching', 'ICT Hall A', '2026-03-10 09:00:00', '2026-03-10 11:00:00', 'CONCLUDED'),
(7, 1, 2, 'Fault Tolerance & Exception Flagging Workflows', 'ICT Hall A', '2026-03-17 09:00:00', '2026-03-17 11:00:00', 'CONCLUDED'),
(8, 1, 2, 'NDPA 2023 Compliance & Data Privacy in Software', 'ICT Hall A', '2026-03-24 09:00:00', '2026-03-24 11:00:00', 'CONCLUDED'),
(9, 1, 2, 'Automated Defaulter Computation & Clearance Algorithms', 'ICT Hall A', '2026-03-31 09:00:00', '2026-03-31 11:00:00', 'CONCLUDED'),
(10, 1, 2, 'Final Project Defense Preparation & Live Testing', 'ICT Hall A', '2026-04-07 09:00:00', '2026-04-07 11:00:00', 'CONCLUDED')
ON DUPLICATE KEY UPDATE topic=VALUES(topic);

-- 9. Insert Realistic Attendance Records for CSC 401
-- Benedict: Attended 9/10 (90% -> ELIGIBLE)
INSERT IGNORE INTO attendance_records (session_instance_id, student_id, verification_method, match_confidence_score, status) VALUES
(1, 4, 'OPTICAL_FINGERPRINT', 98.4, 'PRESENT'),
(2, 4, 'OPTICAL_FINGERPRINT', 99.1, 'PRESENT'),
(3, 4, 'WEBAUTHN_BIOMETRIC', 97.8, 'PRESENT'),
(4, 4, 'OPTICAL_FINGERPRINT', 99.0, 'PRESENT'),
(5, 4, 'OPTICAL_FINGERPRINT', 96.5, 'PRESENT'),
(6, 4, 'FLAGGED_RESOLVED', 82.0, 'PRESENT'), -- Solved flag exception!
(7, 4, 'OPTICAL_FINGERPRINT', 99.4, 'PRESENT'),
(8, 4, 'OPTICAL_FINGERPRINT', 98.9, 'PRESENT'),
(9, 4, 'OPTICAL_FINGERPRINT', 97.2, 'PRESENT');

-- Folake Adebayo: Attended 10/10 (100% -> ELIGIBLE)
INSERT IGNORE INTO attendance_records (session_instance_id, student_id, verification_method, match_confidence_score, status) VALUES
(1, 5, 'OPTICAL_FINGERPRINT', 99.5, 'PRESENT'),
(2, 5, 'OPTICAL_FINGERPRINT', 98.8, 'PRESENT'),
(3, 5, 'OPTICAL_FINGERPRINT', 99.2, 'PRESENT'),
(4, 5, 'WEBAUTHN_BIOMETRIC', 99.9, 'PRESENT'),
(5, 5, 'OPTICAL_FINGERPRINT', 97.9, 'PRESENT'),
(6, 5, 'OPTICAL_FINGERPRINT', 98.4, 'PRESENT'),
(7, 5, 'OPTICAL_FINGERPRINT', 99.1, 'PRESENT'),
(8, 5, 'OPTICAL_FINGERPRINT', 98.6, 'PRESENT'),
(9, 5, 'OPTICAL_FINGERPRINT', 99.3, 'PRESENT'),
(10, 5, 'OPTICAL_FINGERPRINT', 99.0, 'PRESENT');

-- Chukwudi Eze: Attended 7/10 (70% -> AT RISK)
INSERT IGNORE INTO attendance_records (session_instance_id, student_id, verification_method, match_confidence_score, status) VALUES
(1, 6, 'OPTICAL_FINGERPRINT', 96.2, 'PRESENT'),
(2, 6, 'OPTICAL_FINGERPRINT', 97.1, 'PRESENT'),
(3, 6, 'OPTICAL_FINGERPRINT', 95.8, 'PRESENT'),
(4, 6, 'OPTICAL_FINGERPRINT', 98.0, 'PRESENT'),
(5, 6, 'OPTICAL_FINGERPRINT', 96.9, 'PRESENT'),
(6, 6, 'OPTICAL_FINGERPRINT', 97.4, 'PRESENT'),
(7, 6, 'OPTICAL_FINGERPRINT', 98.1, 'PRESENT');

-- Amina Mohammed: Attended 5/10 (50% -> INELIGIBLE / DEFAULTER)
INSERT IGNORE INTO attendance_records (session_instance_id, student_id, verification_method, match_confidence_score, status) VALUES
(1, 7, 'OPTICAL_FINGERPRINT', 98.0, 'PRESENT'),
(2, 7, 'OPTICAL_FINGERPRINT', 97.5, 'PRESENT'),
(3, 7, 'OPTICAL_FINGERPRINT', 99.1, 'PRESENT'),
(4, 7, 'OPTICAL_FINGERPRINT', 98.4, 'PRESENT'),
(5, 7, 'OPTICAL_FINGERPRINT', 96.8, 'PRESENT');

-- 10. Audit Logs
INSERT INTO audit_logs (actor_user_id, action_type, target_entity, target_id, action_details) VALUES
(1, 'ADMIN_UPDATE', 'system', 'config', 'Initialized academic session 2025/2026 with NUC 75% threshold.'),
(2, 'SESSION_START', 'lecture_sessions', '1', 'Dr. Adeyemi started lecture for CSC 401 in ICT Hall A.'),
(2, 'FLAG_RESOLVED', 'attendance_records', '6', 'Resolved unreadable biometric scan for Benedict Uchechukwu via physical student ID verification.');
