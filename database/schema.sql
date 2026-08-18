-- ============================================================================
-- SMARTBIO ATTENDANCE & NUC COMPLIANCE MANAGEMENT SYSTEM
-- Relational Database Schema (3NF Normalized) for MySQL 8.0 / PostgreSQL 16
-- Compliant with National Universities Commission (NUC) 75% Attendance Mandate
-- Compliant with Nigeria Data Protection Act (NDPA) 2023 for Biometric Storage
-- ============================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS smartbio_attendance_db
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE smartbio_attendance_db;

-- ----------------------------------------------------------------------------
-- 1. DEPARTMENTS & ACADEMIC STRUCTURE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(10) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS academic_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    session_name VARCHAR(20) NOT NULL UNIQUE, -- e.g., '2025/2026'
    is_current BOOLEAN DEFAULT FALSE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semesters (
    semester_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    semester_type ENUM('FIRST', 'SECOND', 'SUMMER') NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (session_id) REFERENCES academic_sessions(session_id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_semester (session_id, semester_type)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. USERS, ROLES & AUTHENTICATION
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name ENUM('ADMIN', 'LECTURER', 'CLASS_REP', 'STUDENT', 'KIOSK_TERMINAL') NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(50) NOT NULL UNIQUE, -- Matric Number or Staff ID or Admin Username
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    department_id INT,
    academic_level INT DEFAULT NULL, -- 100, 200, 300, 400, 500 (For Students)
    profile_photo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    INDEX idx_user_identifier (identifier),
    INDEX idx_user_role (role_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. BIOMETRIC CREDENTIALS & TEMPLATES (NDPA 2023 COMPLIANT)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS biometric_credentials (
    credential_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    credential_type ENUM('WEBAUTHN', 'FINGERPRINT_OPTICAL', 'FACIAL_HASH') NOT NULL,
    biometric_template_hash VARCHAR(255) NOT NULL, -- Cryptographic one-way hash / Minutiae descriptor
    public_key_pem TEXT,                          -- For WebAuthn asymmetric verification
    authenticator_attachment ENUM('PLATFORM', 'CROSS_PLATFORM', 'TERMINAL_SCANNER') DEFAULT 'PLATFORM',
    finger_position ENUM('RIGHT_THUMB', 'RIGHT_INDEX', 'LEFT_THUMB', 'LEFT_INDEX', 'OTHER') DEFAULT 'RIGHT_THUMB',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_verified_at TIMESTAMP NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_biometric (user_id, credential_type, finger_position)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. COURSES & COURSE ENROLLMENT
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(15) NOT NULL UNIQUE, -- e.g., 'CSC 401'
    course_title VARCHAR(150) NOT NULL,
    credit_units INT NOT NULL DEFAULT 3,
    department_id INT NOT NULL,
    level INT NOT NULL,                      -- e.g., 400
    semester_id INT NOT NULL,
    lecturer_id INT,                         -- Assigned Lecturer (user_id)
    minimum_attendance_pct DECIMAL(5,2) DEFAULT 75.00, -- NUC 75% Requirement
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_course_code (course_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    session_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES academic_sessions(session_id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_course_session (student_id, course_id, session_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. LECTURE SESSIONS & REAL-TIME ATTENDANCE TRACKING
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lecture_sessions (
    session_instance_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    topic VARCHAR(200) NOT NULL,
    venue_hall VARCHAR(100) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    status ENUM('ACTIVE', 'CONCLUDED', 'CANCELLED') DEFAULT 'ACTIVE',
    session_passcode VARCHAR(10),
    total_enrolled_count INT DEFAULT 0,
    total_present_count INT DEFAULT 0,
    total_flagged_count INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_session_course (course_id),
    INDEX idx_session_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_records (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    session_instance_id INT NOT NULL,
    student_id INT NOT NULL,
    verification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_method ENUM('WEBAUTHN_BIOMETRIC', 'OPTICAL_FINGERPRINT', 'MANUAL_OVERRIDE', 'FLAGGED_RESOLVED') NOT NULL,
    match_confidence_score DECIMAL(5,2) DEFAULT 0.00, -- e.g., 98.50%
    status ENUM('PRESENT', 'FLAGGED', 'ABSENT', 'EXCUSED') DEFAULT 'PRESENT',
    flag_reason VARCHAR(255) NULL, -- 'UNMATCHED_SCAN', 'SWEATY_RIDGE', 'INJURED_FINGER'
    resolved_by_lecturer_id INT NULL,
    resolution_notes TEXT NULL,
    terminal_device_id VARCHAR(100),
    ip_address VARCHAR(45),
    FOREIGN KEY (session_instance_id) REFERENCES lecture_sessions(session_instance_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by_lecturer_id) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_session_student_attendance (session_instance_id, student_id),
    INDEX idx_attendance_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. AUDIT TRAIL & NDPA 2023 SECURITY LOGGING
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id INT,
    action_type ENUM('LOGIN', 'SESSION_START', 'SESSION_END', 'BIOMETRIC_SCAN', 'MANUAL_OVERRIDE', 'FLAG_RESOLVED', 'DOCKET_GENERATED', 'ADMIN_UPDATE') NOT NULL,
    target_entity VARCHAR(50),
    target_id VARCHAR(50),
    action_details TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. NUC 75% ELIGIBILITY VIEW (AUTOMATED COMPUTATION)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW view_nuc_exam_eligibility AS
SELECT 
    u.user_id AS student_id,
    u.identifier AS matric_number,
    u.full_name AS student_name,
    c.course_id,
    c.course_code,
    c.course_title,
    COUNT(DISTINCT ls.session_instance_id) AS total_held_sessions,
    COUNT(DISTINCT CASE WHEN ar.status IN ('PRESENT', 'FLAGGED_RESOLVED') THEN ar.attendance_id END) AS attended_sessions,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT ls.session_instance_id) = 0 THEN 0.00
            ELSE (COUNT(DISTINCT CASE WHEN ar.status IN ('PRESENT', 'FLAGGED_RESOLVED') THEN ar.attendance_id END) * 100.0) / COUNT(DISTINCT ls.session_instance_id)
        END, 2
    ) AS attendance_percentage,
    CASE 
        WHEN (
            CASE 
                WHEN COUNT(DISTINCT ls.session_instance_id) = 0 THEN 0.00
                ELSE (COUNT(DISTINCT CASE WHEN ar.status IN ('PRESENT', 'FLAGGED_RESOLVED') THEN ar.attendance_id END) * 100.0) / COUNT(DISTINCT ls.session_instance_id)
            END
        ) >= 75.00 THEN 'ELIGIBLE'
        WHEN (
            CASE 
                WHEN COUNT(DISTINCT ls.session_instance_id) = 0 THEN 0.00
                ELSE (COUNT(DISTINCT CASE WHEN ar.status IN ('PRESENT', 'FLAGGED_RESOLVED') THEN ar.attendance_id END) * 100.0) / COUNT(DISTINCT ls.session_instance_id)
            END
        ) BETWEEN 70.00 AND 74.99 THEN 'AT_RISK'
        ELSE 'INELIGIBLE_DEFAULTER'
    END AS nuc_exam_status
FROM users u
JOIN course_registrations cr ON u.user_id = cr.student_id
JOIN courses c ON cr.course_id = c.course_id
LEFT JOIN lecture_sessions ls ON c.course_id = ls.course_id AND ls.status = 'CONCLUDED'
LEFT JOIN attendance_records ar ON ls.session_instance_id = ar.session_instance_id AND ar.student_id = u.user_id
WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'STUDENT')
GROUP BY u.user_id, u.identifier, u.full_name, c.course_id, c.course_code, c.course_title;
