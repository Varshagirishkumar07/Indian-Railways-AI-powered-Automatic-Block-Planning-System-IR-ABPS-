-- AI-Powered Automatic Block Planning System for Indian Railways
-- Database Schema Definition (Compatible with PostgreSQL / Supabase & SQLite)

-- 1. RAW SOURCE TABLES
CREATE TABLE IF NOT EXISTS tms_data (
    record_id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(50),
    location VARCHAR(50),
    work_type VARCHAR(100),
    defect VARCHAR(255),
    severity VARCHAR(20),
    maintenance_date VARCHAR(50),
    duration_hr REAL,
    previous_occurance_count INT DEFAULT 0,
    historical_avg_duration_hr REAL,
    status VARCHAR(50),
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smms_data (
    record_id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(50),
    location VARCHAR(50),
    work_type VARCHAR(100),
    defect VARCHAR(255),
    severity VARCHAR(20),
    maintenance_date VARCHAR(50),
    duration_hr REAL,
    previous_occurance_count INT DEFAULT 0,
    historical_avg_duration_hr REAL,
    status VARCHAR(50),
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tdms_data (
    record_id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(50),
    location VARCHAR(50),
    work_type VARCHAR(100),
    defect VARCHAR(255),
    severity VARCHAR(20),
    maintenance_date VARCHAR(50),
    duration_hr REAL,
    previous_occurance_hr INT DEFAULT 0,
    historical_avg_duration_hr REAL,
    status VARCHAR(50),
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bdms_data (
    request_id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(50),
    department VARCHAR(50),
    location VARCHAR(50),
    work_type VARCHAR(100),
    defect_or_task VARCHAR(255),
    severity VARCHAR(20),
    required_duration_hr REAL,
    requested_date VARCHAR(50),
    requested_start REAL,
    status VARCHAR(50),
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coa_data (
    coa_id VARCHAR(50) PRIMARY KEY,
    date VARCHAR(50),
    from_location VARCHAR(50),
    to_location VARCHAR(50),
    record_type VARCHAR(50),
    train_id VARCHAR(50),
    train_name VARCHAR(100),
    start_time REAL,
    end_time REAL,
    traffic_level VARCHAR(20),
    conflict_status VARCHAR(50),
    block_available VARCHAR(20),
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. UNIFIED MAINTENANCE TABLE (STANDARDIZED BY DATA HUB)
CREATE TABLE IF NOT EXISTS unified_maintenance (
    maintenance_id VARCHAR(100) PRIMARY KEY,
    source_system VARCHAR(20) NOT NULL,
    source_record_id VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    asset_id VARCHAR(50) NOT NULL,
    location_km REAL NOT NULL,
    raw_location_str VARCHAR(50),
    defect_type VARCHAR(255) NOT NULL,
    work_type VARCHAR(100),
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    block_required BOOLEAN DEFAULT TRUE,
    estimated_duration_min INT NOT NULL,
    historical_actual_duration_min INT,
    overdue_days INT DEFAULT 0,
    occurrence_count INT DEFAULT 1,
    postponement_count INT DEFAULT 0,
    maintenance_date VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. HISTORICAL DEFECT OCCURRENCES TABLE
CREATE TABLE IF NOT EXISTS historical_defects (
    history_id VARCHAR(100) PRIMARY KEY,
    maintenance_id VARCHAR(100) NOT NULL,
    asset_id VARCHAR(50) NOT NULL,
    track_id VARCHAR(50),
    department VARCHAR(50) NOT NULL,
    location_km REAL NOT NULL,
    defect_type VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    occurrence_date VARCHAR(50) NOT NULL,
    resolved_date VARCHAR(50),
    FOREIGN KEY (maintenance_id) REFERENCES unified_maintenance(maintenance_id) ON DELETE CASCADE
);

-- 4. PRIORITY ANALYSIS RESULTS
CREATE TABLE IF NOT EXISTS priority_results (
    priority_id VARCHAR(100) PRIMARY KEY,
    maintenance_id VARCHAR(100) NOT NULL,
    priority_score REAL NOT NULL,
    priority_level VARCHAR(20) NOT NULL,
    severity_subscore REAL,
    overdue_subscore REAL,
    criticality_subscore REAL,
    recurrence_subscore REAL,
    postponement_subscore REAL,
    explainable_note TEXT NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maintenance_id) REFERENCES unified_maintenance(maintenance_id) ON DELETE CASCADE
);

-- 5. GEOGRAPHICAL & OPERATIONAL GROUPS
CREATE TABLE IF NOT EXISTS maintenance_groups (
    group_id VARCHAR(100) PRIMARY KEY,
    group_name VARCHAR(100),
    maintenance_ids TEXT NOT NULL,
    primary_location_km REAL NOT NULL,
    km_min REAL NOT NULL,
    km_max REAL NOT NULL,
    departments TEXT NOT NULL,
    task_count INT NOT NULL,
    combined_duration_min INT NOT NULL,
    required_block_type VARCHAR(50) DEFAULT 'Traffic/Power Block',
    grouping_reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. BLOCK RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS block_recommendations (
    recommendation_id VARCHAR(100) PRIMARY KEY,
    group_id VARCHAR(100) NOT NULL,
    target_date VARCHAR(50) NOT NULL,
    recommended_start_time VARCHAR(20) NOT NULL,
    recommended_end_time VARCHAR(20) NOT NULL,
    start_time_numeric REAL NOT NULL,
    end_time_numeric REAL NOT NULL,
    total_duration_min INT NOT NULL,
    affected_train_count INT DEFAULT 0,
    passenger_conflict_count INT DEFAULT 0,
    goods_conflict_count INT DEFAULT 0,
    feasibility_status VARCHAR(50) NOT NULL,
    recommendation_score REAL NOT NULL,
    explanation TEXT NOT NULL,
    approval_status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES maintenance_groups(group_id) ON DELETE CASCADE
);

-- 7. OFFICER APPROVAL AUDIT LOG
CREATE TABLE IF NOT EXISTS approvals (
    approval_id VARCHAR(100) PRIMARY KEY,
    recommendation_id VARCHAR(100) NOT NULL,
    officer_action VARCHAR(20) NOT NULL,
    officer_name VARCHAR(100) DEFAULT 'Authorized Railway Officer',
    modified_start_time VARCHAR(20),
    modified_end_time VARCHAR(20),
    comments TEXT,
    decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES block_recommendations(recommendation_id) ON DELETE CASCADE
);
