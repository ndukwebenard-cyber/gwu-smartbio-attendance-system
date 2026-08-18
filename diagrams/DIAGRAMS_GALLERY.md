# Global Wealth University — SmartBio Complete Mermaid Diagrams Gallery

All system architecture, flowcharts, RBAC matrices, ERDs, and sequence diagrams are compiled below. These diagrams render automatically on GitHub and can be edited directly on **[https://mermaid.live](https://mermaid.live)**.

---

## 1. System Architecture (`01_system_architecture.mmd`)

```mermaid
graph TB
    subgraph Client_Layer ["Client Presentation & Terminal Layer (GitHub Pages / SPA)"]
        A1["👨‍💼 Administrator Portal<br>(User & Session Config, SQL Dump)"]
        A2["👨‍🏫 Lecturer Portal<br>(Live Radar, Session Timer, Flag Resolver)"]
        A3["👥 Class Representative Portal<br>(Kiosk Proctor, Live Headcount, Defaulter Alerts)"]
        A4["🎓 Student Portal<br>(NUC 75% Gauges, Lecture Logs, Exam Docket)"]
        A5["🖲️ Classroom Kiosk Scanner<br>(Optical Laser Simulator & Minutiae Detector)"]
    end

    subgraph Biometric_Layer ["Biometric Verification & Security Subsystem"]
        B1["🔐 Browser Native WebAuthn API<br>(TouchID, Windows Hello, Android Biometrics)"]
        B2["🔬 Optical Sensor Minutiae Engine<br>(SHA-256 Hash Matching, Quality Threshold >= 70%)"]
        B3["⚠️ Flagged Exception Router<br>(Low Ridge, Sweaty Finger -> Lecturer Queue)"]
    end

    subgraph Sync_Storage_Layer ["Dual-Tier Data & Real-Time Sync Layer"]
        C1["☁️ Firebase Cloud Firestore<br>(Real-time WebSockets onSnapshot Multi-Device Sync)"]
        C2["💾 Browser Relational Data Engine<br>(IndexedDB / LocalStorage Repository + Offline Cache)"]
        C3["🗄️ Standard Relational SQL Engine<br>(MySQL 8.0 / PostgreSQL 16 3NF Normalized Schema)"]
    end

    subgraph Regulatory_Compliance ["Regulatory & Security Enforcement Layer"]
        D1["🏛️ NUC 75% Compliance Engine<br>(Automated Defaulter & Clearance Computation)"]
        D2["🛡️ NDPA 2023 Security Audit Trail<br>(Cryptographic Hash & Immutable Override Logs)"]
        D3["📜 Official Verification Engine<br>(Anti-Tamper QR Clearance Token Generation)"]
    end

    A5 --> B2
    A4 --> B1
    A2 --> B3
    B1 --> C1
    B2 --> C1
    B3 --> C1
    C1 <--> C2
    C2 -.->|Export DDL/Dump| C3
    C1 --> D1
    C1 --> D2
    D1 --> D3
    D3 --> A4
```

---

## 2. Biometric Verification & Flagged Exception Workflow (`02_biometric_and_flagging_workflow.mmd`)

```mermaid
flowchart TD
    Start(["Student Places Finger on Optical Platen / WebAuthn Sensor"]) --> Capture["Optical Sensor Captures Ridge Pattern<br>& Extracts Minutiae Features"]
    Capture --> QualityCheck{"Ridge Image Quality<br>& Clarity Sufficient?"}

    QualityCheck -- "No (Sweaty / Injured Ridge)" --> GenFlag1["Generate Exception Status: FLAGGED<br>Reason: SWEATY_RIDGE / LOW_CLARITY"]
    QualityCheck -- "Yes" --> MatchDB["Compare Minutiae Hash against<br>University Enrolled Template DB"]
    MatchDB --> MatchConfidence{"Minutiae Match Confidence<br>Score >= 70.0%?"}

    MatchConfidence -- "No (40.0% - 69.9%)" --> GenFlag2["Generate Exception Status: FLAGGED<br>Reason: UNMATCHED_TEMPLATE_RIDGE"]
    MatchConfidence -- "No (< 20.0%)" --> Rejected["Status: REJECTED (Access Denied)<br>Student Not Enrolled in Course"]
    Rejected --> PlayBuzz["Play Error Buzz & HUD: Access Denied"] --> EndFail(["Scan Terminated"])

    MatchConfidence -- "Yes (>= 70.0%)" --> Verified["Status: PRESENT (Verified)<br>Match Confidence 96.0% - 99.8%"]
    Verified --> PlayChime["Play Crystal Success Chime"]
    PlayChime --> SyncStream["Push to Live Attendance Stream<br>& Update NUC Rate"]
    SyncStream --> EndPass(["Student Successfully Checked In"])

    GenFlag1 --> PlayWarn["Play Double Warning Beep<br>& HUD: FLAGGED EXCEPTION"]
    GenFlag2 --> PlayWarn
    PlayWarn --> PushQueue["Route Flag to Lecturer's Live Queue<br>with Student Details & Timestamp"]
    PushQueue --> LecturerReview["Lecturer Inspects Physical Student ID Card<br>& Photo Roster in Lecture Hall"]
    LecturerReview --> Decision{"Lecturer Verification<br>Decision"}

    Decision -- "Approve Identity" --> InputNote["Lecturer Enters Mandatory Audit Note:<br>'Verified physical ID card & photo'"]
    InputNote --> CreditAttendance["Credit Attendance as FLAGGED_RESOLVED<br>(Marked as PRESENT)"]
    CreditAttendance --> LogAudit["Log Immutable NDPA 2023 Audit Trail<br>(Actor: Lecturer, Target: Student, Time)"]
    LogAudit --> EndResolved(["Attendance Credited to Student"])

    Decision -- "Reject Identity" --> RejectFlag["Mark as REJECTED / ABSENT"]
    RejectFlag --> LogAuditReject["Log Fraud / Impersonation Attempt in Audit Log"]
    LogAuditReject --> EndRejected(["Student Denied Attendance"])
```

---

## 3. NUC 75% Rule Compliance & Clearance Algorithm (`03_nuc_75_compliance_flow.mmd`)

```mermaid
flowchart TD
    Start(["Start NUC Compliance Evaluation for Student"]) --> FetchRecords["Fetch Total Conducted Lectures (C)<br>Fetch Student Attended Lectures (A)"]
    FetchRecords --> CheckConducted{"Conducted Lectures (C) > 0?"}

    CheckConducted -- "No (Semester Just Began)" --> Default100["Attendance Percentage = 100.0%<br>Status: ELIGIBLE (Initial)"]
    CheckConducted -- "Yes" --> ComputeFormula["Apply NUC Formula:<br>P = (A / C) * 100"]

    Default100 --> ThresholdCheck
    ComputeFormula --> ThresholdCheck{"Evaluate Percentage (P)<br>Against NUC Mandates"}

    ThresholdCheck -- "P >= 75.00%" --> CatEligible["Status: ELIGIBLE (CLEARED)<br>Badge: 🟢 GREEN"]
    CatEligible --> ActionEligible["Authorize Examination Clearance<br>Generate Clearance Stamp: CLEARED"]

    ThresholdCheck -- "70.00% <= P < 74.99%" --> CatAtRisk["Status: AT_RISK (WARNING)<br>Badge: 🟡 AMBER"]
    CatAtRisk --> Forecast["Compute Required Lectures (x):<br>x = ceil((0.75*C - A) / 0.25)"]
    Forecast --> AlertStudent["Send Deficit Alert to Student & Class Rep:<br>'Must attend next x lectures'"]

    ThresholdCheck -- "P < 70.00%" --> CatIneligible["Status: INELIGIBLE (DEFAULTER)<br>Badge: 🔴 RED"]
    CatIneligible --> Barred["Flag as Examination Defaulter<br>Barred from Writing Course Exam"]

    ActionEligible --> DocketPipeline["Compile All Registered 400L Courses"]
    AlertStudent --> DocketPipeline
    Barred --> DocketPipeline

    DocketPipeline --> GenerateQR["Generate Cryptographic QR Verification Token:<br>GWU-NUC-VERIFY:MATRIC:HASH"]
    GenerateQR --> RenderDocket["Render Official Printable Clearance Docket<br>(Student Details, Course Stamps, Signatures)"]
    RenderDocket --> EndDoc(["Defense-Ready Printable Exam Clearance Docket"])
```

---

## 4. Role-Based Access Control (RBAC) & Class Rep Matrix (`04_rbac_and_class_rep_flow.mmd`)

```mermaid
graph TD
    User([Authenticated User Enters Platform]) --> RoleCheck{System RBAC Role Resolver}

    RoleCheck -- "Role: ADMINISTRATOR" --> AdminView["👨‍💼 Administrator Portal"]
    AdminView --> AdminPerms["• Manage Academic Sessions & Courses<br>• Register Users & Hash Biometrics<br>• View Immutable NDPA Audit Trail<br>• 1-Click SQL Dump Exporter<br>• System Reset to Seeds"]

    RoleCheck -- "Role: LECTURER" --> LecturerView["👨‍🏫 Lecturer Portal"]
    LecturerView --> LecturerPerms["• Start/End Live Lecture Sessions<br>• Stream Real-Time Attendance Radar<br>• Review & Override Flagged Exceptions<br>• Export NUC Defaulter Lists"]

    RoleCheck -- "Role: CLASS_REPRESENTATIVE" --> RepView["👥 Class Representative Portal (Proctor)"]
    RepView --> RepPermsAllowed["✅ ALLOWED PRIVILEGES:<br>• Launch Kiosk Scanner Mode on Hall Tablet<br>• View Live Headcount Radar (e.g. 42/50 In Hall)<br>• Broadcast Course 75% Defaulter Warning Notice<br>• View & Print Own Exam Clearance Docket"]
    RepView --> RepPermsDenied["❌ STRICTLY PROHIBITED (SoD Boundary):<br>• CANNOT Override Flagged Scans<br>• CANNOT Manually Mark Students Present<br>• CANNOT Modify Database Registrations"]

    RoleCheck -- "Role: STUDENT" --> StudentView["🎓 Student Portal"]
    StudentView --> StudentPerms["• View Personal NUC 75% Progress Gauges<br>• Inspect Detailed Lecture Attendance Log<br>• Generate Official QR-Coded Exam Docket"]

    RoleCheck -- "Role: KIOSK_TERMINAL" --> KioskView["🖲️ Classroom Scanner Kiosk Terminal"]
    KioskView --> KioskPerms["• Interactive Optical Fingerprint Scanner<br>• Laser Sweep & Minutiae Point Detection<br>• Web Audio Acoustic Feedback<br>• Edge-Case Error Simulation Triggers"]
```

---

## 5. 3NF Relational Entity-Relationship Diagram (`05_entity_relationship_diagram.mmd`)

```mermaid
erDiagram
    DEPARTMENTS ||--o{ USERS : "employs / enrolls"
    DEPARTMENTS ||--o{ COURSES : "offers"
    ACADEMIC_SESSIONS ||--|{ SEMESTERS : "contains"
    ACADEMIC_SESSIONS ||--o{ COURSE_REGISTRATIONS : "registered_in"
    ROLES ||--o{ USERS : "assigned_to"
    USERS ||--o{ BIOMETRIC_CREDENTIALS : "owns"
    USERS ||--o{ COURSES : "lectures"
    USERS ||--o{ COURSE_REGISTRATIONS : "registers"
    USERS ||--o{ LECTURE_SESSIONS : "conducts"
    USERS ||--o{ ATTENDANCE_RECORDS : "records_for"
    USERS ||--o{ AUDIT_LOGS : "acts_as"
    SEMESTERS ||--o{ COURSES : "schedules"
    COURSES ||--o{ COURSE_REGISTRATIONS : "has_enrolled"
    COURSES ||--o{ LECTURE_SESSIONS : "conducted_for"
    LECTURE_SESSIONS ||--o{ ATTENDANCE_RECORDS : "captures"

    DEPARTMENTS {
        int department_id PK
        string department_code UK
        string department_name
        string faculty
    }

    ACADEMIC_SESSIONS {
        int session_id PK
        string session_name UK
        boolean is_current
        date start_date
        date end_date
    }

    SEMESTERS {
        int semester_id PK
        int session_id FK
        string semester_type
        boolean is_active
    }

    ROLES {
        int role_id PK
        string role_name UK
        string description
    }

    USERS {
        int user_id PK
        string identifier UK
        string full_name
        string email UK
        string password_hash
        int role_id FK
        int department_id FK
        int academic_level
        boolean is_active
    }

        BIOMETRIC_CREDENTIALS {
        int credential_id PK
        int user_id FK
        string credential_type
        string biometric_template_hash
        string finger_position
        timestamp registered_at
    }

    COURSES {
        int course_id PK
        string course_code UK
        string course_title
        int credit_units
        int department_id FK
        int level
        int semester_id FK
        int lecturer_id FK
        decimal minimum_attendance_pct
    }

    COURSE_REGISTRATIONS {
        int registration_id PK
        int student_id FK
        int course_id FK
        int session_id FK
        timestamp registration_date
        boolean is_approved
    }

    LECTURE_SESSIONS {
        int session_instance_id PK
        int course_id FK
        int lecturer_id FK
        string topic
        string venue_hall
        timestamp start_time
        timestamp end_time
        string status
    }

    ATTENDANCE_RECORDS {
        int attendance_id PK
        int session_instance_id FK
        int student_id FK
        timestamp verification_time
        string verification_method
        decimal match_confidence_score
        string status
        string flag_reason
        int resolved_by_lecturer_id FK
    }

    AUDIT_LOGS {
        int log_id PK
        int actor_user_id FK
        string action_type
        string target_entity
        string action_details
        timestamp timestamp
    }
```
