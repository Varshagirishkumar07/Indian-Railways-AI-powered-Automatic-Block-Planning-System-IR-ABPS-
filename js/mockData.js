/**
 * INDIAN RAILWAYS AI-POWERED AUTOMATIC BLOCK PLANNING SYSTEM
 * Reusable Mock Data Layer (Phase 1, 2, 3 & Defect History Integration)
 * 
 * Designed to be replaced seamlessly with Supabase / Backend API calls in future phases.
 */

window.IR_MOCK_DATA = {
    // 1. DATA SOURCES & SYSTEM HEALTH STATUS (5 SOURCE SYSTEMS)
    systemDataSources: [
        { id: 'tms', code: 'TMS', name: 'Track Management System', department: 'Engineering (Track)', status: 'Connected', lastSync: '2 mins ago', records: 1420, qualityScore: '98.5%', statusColor: 'emerald' },
        { id: 'smms', code: 'SMMS', name: 'Signalling Maintenance System', department: 'S&T (Signals & Telecom)', status: 'Connected', lastSync: '5 mins ago', records: 850, qualityScore: '95.2%', statusColor: 'emerald' },
        { id: 'tdms', code: 'TDMS', name: 'Traction Distribution System', department: 'Electrical (OHE/Traction)', status: 'Connected', lastSync: '1 min ago', records: 620, qualityScore: '99.0%', statusColor: 'emerald' },
        { id: 'bdms', code: 'BDMS', name: 'Block & Disconnection System', department: 'Operating / Safety', status: 'Synced', lastSync: 'Just now', records: 310, qualityScore: '100%', statusColor: 'emerald' },
        { id: 'coa', code: 'COA', name: 'Control Office Application', department: 'Traffic Operations', status: 'Synced', lastSync: 'Live Stream', records: 4500, qualityScore: '97.8%', statusColor: 'emerald' }
    ],

    // 2. UNIFIED MAINTENANCE DATASET
    unifiedMaintenance: [
        {
            maintenance_id: "UNIF-BDMS-001",
            source_system: "BDMS",
            source_record_id: "BDMS001",
            department: "Engineering",
            asset_id: "TRK-002",
            track_id: "TRACK-DN-01",
            location_km: 30.121,
            raw_location_str: "KM  30.121",
            defect_type: "Rail Defect & Weld Crack",
            work_type: "Repair",
            severity: "Critical",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 120,
            historical_actual_duration_min: 135,
            overdue_days: 12,
            postponement_count: 2,
            maintenance_date: "14-09-2026",
            section: "Howrah - Burdwan Main Line"
        },
        {
            maintenance_id: "UNIF-BDMS-002",
            source_system: "BDMS",
            source_record_id: "BDMS002",
            department: "S&T",
            asset_id: "SIG-001",
            track_id: "TRACK-UP-02",
            location_km: 70.230,
            raw_location_str: "KM  70.230",
            defect_type: "Signal Point Machine Contact Failure",
            work_type: "Repair",
            severity: "High",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 60,
            historical_actual_duration_min: 75,
            overdue_days: 7,
            postponement_count: 1,
            maintenance_date: "14-09-2026",
            section: "Asansol - Dhanbad Line"
        },
        {
            maintenance_id: "UNIF-BDMS-003",
            source_system: "BDMS",
            source_record_id: "BDMS003",
            department: "Traction",
            asset_id: "OHE-001",
            track_id: "TRACK-DN-02",
            location_km: 20.120,
            raw_location_str: "KM  20.120",
            defect_type: "OHE Catenary Wire Sparking & Wear",
            work_type: "Inspection",
            severity: "High",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 60,
            historical_actual_duration_min: 60,
            overdue_days: 7,
            postponement_count: 1,
            maintenance_date: "14-09-2026",
            section: "Sealdah - Ranaghat Line"
        },
        {
            maintenance_id: "UNIF-BDMS-004",
            source_system: "BDMS",
            source_record_id: "BDMS004",
            department: "Engineering",
            asset_id: "TRK-003",
            track_id: "TRACK-DN-01",
            location_km: 31.125,
            raw_location_str: "KM 31.125",
            defect_type: "Track Sleepers & Fastener Wear",
            work_type: "Inspection",
            severity: "Medium",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 90,
            historical_actual_duration_min: 90,
            overdue_days: 3,
            postponement_count: 0,
            maintenance_date: "15-09-2026",
            section: "Howrah - Burdwan Main Line"
        },
        {
            maintenance_id: "UNIF-BDMS-005",
            source_system: "BDMS",
            source_record_id: "BDMS005",
            department: "S&T",
            asset_id: "SIG-005",
            track_id: "TRACK-UP-01",
            location_km: 70.400,
            raw_location_str: "KM 70.400",
            defect_type: "Signal Cable Insulation Deterioration",
            work_type: "Repair",
            severity: "High",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 120,
            historical_actual_duration_min: 120,
            overdue_days: 7,
            postponement_count: 1,
            maintenance_date: "15-09-2026",
            section: "Asansol - Dhanbad Line"
        },
        {
            maintenance_id: "UNIF-BDMS-006",
            source_system: "BDMS",
            source_record_id: "BDMS006",
            department: "Engineering",
            asset_id: "TRK-006",
            track_id: "TRACK-DN-01",
            location_km: 32.240,
            raw_location_str: "KM 32.240",
            defect_type: "Track Alignment Geometry Correction",
            work_type: "Inspection",
            severity: "High",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 120,
            historical_actual_duration_min: 120,
            overdue_days: 7,
            postponement_count: 1,
            maintenance_date: "15-09-2026",
            section: "Howrah - Burdwan Main Line"
        },
        {
            maintenance_id: "UNIF-BDMS-007",
            source_system: "BDMS",
            source_record_id: "BDMS007",
            department: "S&T",
            asset_id: "SIG-006",
            track_id: "TRACK-UP-02",
            location_km: 70.460,
            raw_location_str: "KM 70.460",
            defect_type: "Point Machine Crossover Lock Issue",
            work_type: "Inspection",
            severity: "Critical",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 150,
            historical_actual_duration_min: 140,
            overdue_days: 12,
            postponement_count: 2,
            maintenance_date: "16-09-2026",
            section: "Asansol - Dhanbad Line"
        },
        {
            maintenance_id: "UNIF-BDMS-008",
            source_system: "BDMS",
            source_record_id: "BDMS008",
            department: "Traction",
            asset_id: "OHE-004",
            track_id: "TRACK-DN-02",
            location_km: 20.400,
            raw_location_str: "KM 20.400",
            defect_type: "OHE Cantilever Insulator Fault",
            work_type: "Repair",
            severity: "High",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 90,
            historical_actual_duration_min: 90,
            overdue_days: 7,
            postponement_count: 1,
            maintenance_date: "16-09-2026",
            section: "Sealdah - Ranaghat Line"
        },
        {
            maintenance_id: "UNIF-BDMS-009",
            source_system: "BDMS",
            source_record_id: "BDMS009",
            department: "Engineering",
            asset_id: "TRK-005",
            track_id: "TRACK-DN-01",
            location_km: 31.200,
            raw_location_str: "KM 31.200",
            defect_type: "Rail Track Defect & Fishplate Wear",
            work_type: "Repair",
            severity: "High",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 120,
            historical_actual_duration_min: 120,
            overdue_days: 7,
            postponement_count: 1,
            maintenance_date: "16-09-2026",
            section: "Howrah - Burdwan Main Line"
        },
        {
            maintenance_id: "UNIF-BDMS-010",
            source_system: "BDMS",
            source_record_id: "BDMS010",
            department: "S&T",
            asset_id: "SIG-009",
            track_id: "TRACK-UP-01",
            location_km: 70.720,
            raw_location_str: "KM 70.720",
            defect_type: "Track Circuit Relay Issue",
            work_type: "Inspection",
            severity: "Medium",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 60,
            historical_actual_duration_min: 60,
            overdue_days: 3,
            postponement_count: 0,
            maintenance_date: "17-09-2026",
            section: "Asansol - Dhanbad Line"
        },
        {
            maintenance_id: "UNIF-BDMS-011",
            source_system: "BDMS",
            source_record_id: "BDMS011",
            department: "Traction",
            asset_id: "OHE-008",
            track_id: "TRACK-DN-02",
            location_km: 22.300,
            raw_location_str: "KM 22.300",
            defect_type: "Traction Insulator Flashover Deterioration",
            work_type: "Inspection",
            severity: "Critical",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 120,
            historical_actual_duration_min: 120,
            overdue_days: 12,
            postponement_count: 2,
            maintenance_date: "17-09-2026",
            section: "Sealdah - Ranaghat Line"
        },
        {
            maintenance_id: "UNIF-BDMS-012",
            source_system: "BDMS",
            source_record_id: "BDMS012",
            department: "Engineering",
            asset_id: "TRK-010",
            track_id: "TRACK-DN-01",
            location_km: 34.300,
            raw_location_str: "KM 34.300",
            defect_type: "Track Geometry & Curve Elevation",
            work_type: "Inspection",
            severity: "Medium",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 90,
            historical_actual_duration_min: 90,
            overdue_days: 3,
            postponement_count: 0,
            maintenance_date: "17-09-2026",
            section: "Howrah - Burdwan Main Line"
        }
    ],

    // 3. HISTORICAL DEFECT OCCURRENCES SEED DATASET
    historicalDefects: [
        // UNIF-BDMS-001 (8 Previous Occurrences: 4 Critical, 2 High, 1 Medium, 1 Low)
        { history_id: "HIST-001-1", maintenance_id: "UNIF-BDMS-001", asset_id: "TRK-002", track_id: "TRACK-DN-01", department: "Engineering", location_km: 30.121, defect_type: "Rail Defect & Weld Crack", severity: "Critical", occurrence_date: "20-08-2026", resolved_date: "21-08-2026" },
        { history_id: "HIST-001-2", maintenance_id: "UNIF-BDMS-001", asset_id: "TRK-002", track_id: "TRACK-DN-01", department: "Engineering", location_km: 30.121, defect_type: "Rail Defect & Weld Crack", severity: "Critical", occurrence_date: "15-06-2026", resolved_date: "16-06-2026" },
        { history_id: "HIST-001-3", maintenance_id: "UNIF-BDMS-001", asset_id: "TRK-002", track_id: "TRACK-DN-01", department: "Engineering", location_km: 30.121, defect_type: "Rail Defect & Weld Crack", severity: "Critical", occurrence_date: "04-04-2026", resolved_date: "05-04-2026" },
        { history_id: "HIST-001-4", maintenance_id: "UNIF-BDMS-001", asset_id: "TRK-002", track_id: "TRACK-DN-01", department: "Engineering", location_km: 30.121, defect_type: "Rail Defect & Weld Crack", severity: "Critical", occurrence_date: "10-02-2026", resolved_date: "11-02-2026" },
        { history_id: "HIST-001-5", maintenance_id: "UNIF-BDMS-001", asset_id: "TRK-002", track_id: "TRACK-DN-01", department: "Engineering", location_km: 30.121, defect_type: "Rail Defect & Weld Crack", severity: "High", occurrence_date: "18-12-2025", resolved_date: "19-12-2025" },
        { history_id: "HIST-001-6", maintenance_id: "UNIF-BDMS-001", asset_id: "TRK-002", track_id: "TRACK-DN-01", department: "Engineering", location_km: 30.121, defect_type: "Rail Defect & Weld Crack", severity: "High", occurrence_date: "01-10-2025", resolved_date: "02-10-2025" },
        { history_id: "HIST-001-7", maintenance_id: "UNIF-BDMS-001", asset_id: "TRK-002", track_id: "TRACK-DN-01", department: "Engineering", location_km: 30.121, defect_type: "Rail Defect & Weld Crack", severity: "Medium", occurrence_date: "14-07-2025", resolved_date: "15-07-2025" },
        { history_id: "HIST-001-8", maintenance_id: "UNIF-BDMS-001", asset_id: "TRK-002", track_id: "TRACK-DN-01", department: "Engineering", location_km: 30.121, defect_type: "Rail Defect & Weld Crack", severity: "Low", occurrence_date: "20-04-2025", resolved_date: "21-04-2025" },

        // UNIF-BDMS-007 (6 Previous Occurrences: 3 Critical, 2 High, 1 Medium, 0 Low)
        { history_id: "HIST-007-1", maintenance_id: "UNIF-BDMS-007", asset_id: "SIG-006", track_id: "TRACK-UP-02", department: "S&T", location_km: 70.460, defect_type: "Point Machine Crossover Lock Issue", severity: "Critical", occurrence_date: "10-07-2026", resolved_date: "11-07-2026" },
        { history_id: "HIST-007-2", maintenance_id: "UNIF-BDMS-007", asset_id: "SIG-006", track_id: "TRACK-UP-02", department: "S&T", location_km: 70.460, defect_type: "Point Machine Crossover Lock Issue", severity: "Critical", occurrence_date: "22-05-2026", resolved_date: "23-05-2026" },
        { history_id: "HIST-007-3", maintenance_id: "UNIF-BDMS-007", asset_id: "SIG-006", track_id: "TRACK-UP-02", department: "S&T", location_km: 70.460, defect_type: "Point Machine Crossover Lock Issue", severity: "Critical", occurrence_date: "18-03-2026", resolved_date: "19-03-2026" },
        { history_id: "HIST-007-4", maintenance_id: "UNIF-BDMS-007", asset_id: "SIG-006", track_id: "TRACK-UP-02", department: "S&T", location_km: 70.460, defect_type: "Point Machine Crossover Lock Issue", severity: "High", occurrence_date: "05-01-2026", resolved_date: "06-01-2026" },
        { history_id: "HIST-007-5", maintenance_id: "UNIF-BDMS-007", asset_id: "SIG-006", track_id: "TRACK-UP-02", department: "S&T", location_km: 70.460, defect_type: "Point Machine Crossover Lock Issue", severity: "High", occurrence_date: "12-11-2025", resolved_date: "13-11-2025" },
        { history_id: "HIST-007-6", maintenance_id: "UNIF-BDMS-007", asset_id: "SIG-006", track_id: "TRACK-UP-02", department: "S&T", location_km: 70.460, defect_type: "Point Machine Crossover Lock Issue", severity: "Medium", occurrence_date: "30-08-2025", resolved_date: "31-08-2025" },

        // UNIF-BDMS-011 (5 Previous Occurrences: 2 Critical, 2 High, 1 Medium)
        { history_id: "HIST-011-1", maintenance_id: "UNIF-BDMS-011", asset_id: "OHE-008", track_id: "TRACK-DN-02", department: "Traction", location_km: 22.300, defect_type: "Traction Insulator Flashover Deterioration", severity: "Critical", occurrence_date: "23-08-2026", resolved_date: "24-08-2026" },
        { history_id: "HIST-011-2", maintenance_id: "UNIF-BDMS-011", asset_id: "OHE-008", track_id: "TRACK-DN-02", department: "Traction", location_km: 22.300, defect_type: "Traction Insulator Flashover Deterioration", severity: "Critical", occurrence_date: "14-06-2026", resolved_date: "15-06-2026" },
        { history_id: "HIST-011-3", maintenance_id: "UNIF-BDMS-011", asset_id: "OHE-008", track_id: "TRACK-DN-02", department: "Traction", location_km: 22.300, defect_type: "Traction Insulator Flashover Deterioration", severity: "High", occurrence_date: "02-04-2026", resolved_date: "03-04-2026" },
        { history_id: "HIST-011-4", maintenance_id: "UNIF-BDMS-011", asset_id: "OHE-008", track_id: "TRACK-DN-02", department: "Traction", location_km: 22.300, defect_type: "Traction Insulator Flashover Deterioration", severity: "High", occurrence_date: "19-01-2026", resolved_date: "20-01-2026" },
        { history_id: "HIST-011-5", maintenance_id: "UNIF-BDMS-011", asset_id: "OHE-008", track_id: "TRACK-DN-02", department: "Traction", location_km: 22.300, defect_type: "Traction Insulator Flashover Deterioration", severity: "Medium", occurrence_date: "10-10-2025", resolved_date: "11-10-2025" },

        // UNIF-BDMS-002 (5 Previous Occurrences: 1 Critical, 3 High, 1 Medium)
        { history_id: "HIST-002-1", maintenance_id: "UNIF-BDMS-002", asset_id: "SIG-001", track_id: "TRACK-UP-02", department: "S&T", location_km: 70.230, defect_type: "Signal Point Machine Contact Failure", severity: "Critical", occurrence_date: "12-05-2026", resolved_date: "13-05-2026" },
        { history_id: "HIST-002-2", maintenance_id: "UNIF-BDMS-002", asset_id: "SIG-001", track_id: "TRACK-UP-02", department: "S&T", location_km: 70.230, defect_type: "Signal Point Machine Contact Failure", severity: "High", occurrence_date: "20-06-2026", resolved_date: "21-06-2026" },
        { history_id: "HIST-002-3", maintenance_id: "UNIF-BDMS-002", asset_id: "SIG-001", track_id: "TRACK-UP-02", department: "S&T", location_km: 70.230, defect_type: "Signal Point Machine Contact Failure", severity: "High", occurrence_date: "15-03-2026", resolved_date: "16-03-2026" },

        // UNIF-BDMS-005 (4 Previous Occurrences: 0 Critical, 3 High, 1 Medium)
        { history_id: "HIST-005-1", maintenance_id: "UNIF-BDMS-005", asset_id: "SIG-005", track_id: "TRACK-UP-01", department: "S&T", location_km: 70.400, defect_type: "Signal Cable Insulation Deterioration", severity: "High", occurrence_date: "28-06-2026", resolved_date: "29-06-2026" },
        { history_id: "HIST-005-2", maintenance_id: "UNIF-BDMS-005", asset_id: "SIG-005", track_id: "TRACK-UP-01", department: "S&T", location_km: 70.400, defect_type: "Signal Cable Insulation Deterioration", severity: "High", occurrence_date: "14-04-2026", resolved_date: "15-04-2026" }
    ],

    // 4. COA TRAIN SCHEDULES (Standardized ISO and 24h String format)
    coaTrainSchedules: [
        { train_id: "12301", train_name: "Howrah Rajdhani Express", train_type: "Passenger", date: "14-09-2026", start_time: "21:00", end_time: "22:15", direction: "Up", route: "KM 20.0 - 75.0", traffic_level: "Critical" },
        { train_id: "12002", train_name: "Bhopal Shatabdi Express", train_type: "Passenger", date: "14-09-2026", start_time: "22:30", end_time: "23:35", direction: "Down", route: "KM 20.0 - 75.0", traffic_level: "High" },
        { train_id: "G-201", train_name: "Freight Rake (Coal)", train_type: "Goods", date: "14-09-2026", start_time: "23:45", end_time: "01:00", direction: "Up", route: "KM 30.0 - 50.0", traffic_level: "Medium" },
        { train_id: "BLOCK-WIN-01", train_name: "COA Allowed Night Block Window", train_type: "Block Window", date: "14-09-2026", start_time: "04:30", end_time: "08:00", direction: "Both", route: "KM 30.0 - 35.0", traffic_level: "Low / Maintenance Open" },
        { train_id: "13009", train_name: "Doon Express", train_type: "Passenger", date: "15-09-2026", start_time: "20:15", end_time: "21:45", direction: "Up", route: "KM 60.0 - 80.0", traffic_level: "High" },
        { train_id: "G-202", train_name: "Steel Coil Freight", train_type: "Goods", date: "15-09-2026", start_time: "02:15", end_time: "03:30", direction: "Down", route: "KM 65.0 - 75.0", traffic_level: "Medium" }
    ],

    // 5. RAW DATASET SAMPLE TABLES
    rawDatasets: {
        TMS: [
            { record_id: "TMS001", asset_id: "TRK001", location: "KM 30.120", work_type: "Inspection", defect: "Rail crack", severity: "High", maintenance_date: "10-05-2026", duration_hr: 2.0, previous_occurance_count: 1, historical_avg_duration_hr: 2.0, status: "completed" },
            { record_id: "TMS002", asset_id: "TRK002", location: "KM 30.121", work_type: "Repair", defect: "Rail defect", severity: "Critical", maintenance_date: "18-06-2026", duration_hr: 3.0, previous_occurance_count: 8, historical_avg_duration_hr: 3.5, status: "completed" }
        ],
        SMMS: [
            { record_id: "SM001", asset_id: "SIG001", location: "KM 70.200", work_type: "Inspection", defect: "Signal failure", severity: "Critical", maintenance_date: "12-05-2026", duration_hr: 1.0, previous_occurance_count: 5, historical_avg_duration_hr: 1.0, status: "completed" },
            { record_id: "SM006", asset_id: "SIG006", location: "KM 70.460", work_type: "Inspection", defect: "Point machine issue", severity: "Critical", maintenance_date: "10-07-2026", duration_hr: 2.0, previous_occurance_count: 9, historical_avg_duration_hr: 3.0, status: "completed" }
        ],
        TDMS: [
            { record_id: "TD001", asset_id: "OHE001", location: "KM 20.120", work_type: "Inspection", defect: "OHE wear", severity: "High", maintenance_date: "14-05-2026", duration_hr: 1.5, previous_occurance_hr: 3, historical_avg_duration_hr: 2.0, status: "completed" },
            { record_id: "TD008", asset_id: "OHE008", location: "KM 22.300", work_type: "Inspection", defect: "Insulator deterioration", severity: "Critical", maintenance_date: "23-08-2026", duration_hr: 1.5, previous_occurance_hr: 5, historical_avg_duration_hr: 2.5, status: "completed" }
        ],
        BDMS: [
            { request_id: "BDMS001", asset_id: "TRK002", department: "Engineering", location: "KM  30.121", work_type: "Repair", defect_or_task: "Rail defect", severity: "Critical", required_duration_hr: 2.0, requested_date: "14-09-2026", requested_start: 22.0, status: "Pending" },
            { request_id: "BDMS007", asset_id: "SIG006", department: "S&T", location: "KM 70.460", work_type: "inspection", defect_or_task: "Point machine", severity: "Critical", required_duration_hr: 2.5, requested_date: "16-09-2026", requested_start: 22.3, status: "Pending" }
        ],
        COA: [
            { coa_id: "COA001", date: "14-09-2026", from_location: "KM 30.121", to_location: "KM 31.300", record_type: "Passenger", train_id: "P101", train_name: "Express Passenger", start_time: 21.0, end_time: 22.0, traffic_level: "Critical", conflict_status: "Available", block_available: "Yes" }
        ]
    },

    // 6. DATA QUALITY LOGS
    dataQualityLogs: [
        { id: "LOG-101", timestamp: "Today 11:24:15", type: "NORMALIZATION", source: "BDMS", record_id: "BDMS001", detail: "Location string 'KM  30.121' normalized to numeric float 30.121 KM", status: "Resolved", statusColor: "emerald" },
        { id: "LOG-102", timestamp: "Today 11:24:15", type: "HISTORY LINK", source: "Data Hub", record_id: "ALL", detail: "Linked historical_defects table dynamically by asset_id, defect_type, and location_km", status: "Success", statusColor: "emerald" }
    ],

    // 7. UPCOMING BLOCK RECOMMENDATIONS
    blockRecommendations: [
        {
            id: "REC-BLK-101",
            group_id: "GRP-001",
            group_name: "Corridor Block KM 30.120 - 30.400 (Multi-Dept)",
            date: "14-09-2026",
            start_time: "04:30",
            end_time: "08:00",
            duration_min: 210,
            score: 94,
            passenger_conflicts: 0,
            goods_conflicts: 0,
            feasible: true,
            status: "Pending Approval",
            departments: ["Engineering", "S&T", "Traction"],
            maint_ids: ["UNIF-BDMS-001", "UNIF-BDMS-004", "UNIF-BDMS-006"],
            explanation: "Recommended 04:30 - 08:00 because 3 nearby activities can be grouped within 0.28 KM radius with ZERO passenger & freight train conflicts in COA schedule."
        },
        {
            id: "REC-BLK-102",
            group_id: "GRP-002",
            group_name: "Asansol Signaling Corridor KM 70.230 - 70.460",
            date: "15-09-2026",
            start_time: "01:00",
            end_time: "04:30",
            duration_min: 210,
            score: 89,
            passenger_conflicts: 0,
            goods_conflicts: 1,
            feasible: true,
            status: "Approved",
            departments: ["S&T"],
            maint_ids: ["UNIF-BDMS-002", "UNIF-BDMS-005", "UNIF-BDMS-007"],
            explanation: "Recommended 01:00 - 04:30 because 3 critical signal tasks are grouped along 0.23 KM stretch with freight train G-202 regulated at Asansol loop."
        }
    ],

    // 8. SAMPLE GROUP DATA (Used by Smart Block Planner for candidate window ranking)
    sampleGroupData: {
        groupId: 'GRP-001',
        groupName: 'Corridor Block KM 30.120 – 32.240 (Engineering/S&T/Traction)',
        minKm: 30.120,
        maxKm: 32.240,
        depts: ['Engineering', 'S&T', 'Traction'],
        taskCount: 3,
        coaWindowStart: '04:30',
        coaWindowEnd: '08:00',
        candidates: [
            {
                rank: 1,
                window: '04:30 – 08:00',
                startTime: '04:30',
                endTime: '08:00',
                duration: '210 min',
                durationMin: 210,
                passengerConflicts: 0,
                goodsConflicts: 0,
                feasible: true,
                badge: 'RECOMMENDED',
                score: 94,
                reason: 'COA-approved maintenance window with zero passenger & goods train conflicts.'
            },
            {
                rank: 2,
                window: '02:00 – 05:30',
                startTime: '02:00',
                endTime: '05:30',
                duration: '210 min',
                durationMin: 210,
                passengerConflicts: 0,
                goodsConflicts: 1,
                feasible: true,
                badge: 'FEASIBLE',
                score: 78,
                reason: 'Goods train G-201 requires regulation at Howrah loop. Minor impact.'
            },
            {
                rank: 3,
                window: '22:00 – 01:00',
                startTime: '22:00',
                endTime: '01:00',
                duration: '180 min',
                durationMin: 180,
                passengerConflicts: 2,
                goodsConflicts: 1,
                feasible: false,
                badge: 'REJECTED',
                score: 31,
                reason: 'Conflicts with Rajdhani Express (21:00-22:15) and Shatabdi Express (22:30-23:35). High passenger disruption risk.'
            }
        ]
    },

    recentConflicts: [
        { id: "CONF-001", train_id: "12301", train_name: "Howrah - New Delhi Rajdhani Express", train_type: "Passenger", maint_group: "GRP-001 (KM 30.120 - 30.400)", time: "23:15 - 23:45", severity: "Critical", status: "Conflict Detected", impact: "High Passenger Disruption (35 min delay)", resolution: "Block window shifted to 04:30 - 08:00 (Zero impact option selected)" },
        { id: "CONF-002", train_id: "12002", train_name: "Bhopal Shatabdi Express", train_type: "Passenger", maint_group: "GRP-002 (KM 70.230 - 70.460)", time: "00:40 - 01:10", severity: "High", status: "Conflict Detected", impact: "Premium Passenger Delay Risk", resolution: "Block candidate window 23:00-02:30 rejected by AI Engine" }
    ]
};
