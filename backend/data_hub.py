"""
Data Hub Service for Indian Railways Block Planning System.
Handles CSV ingestion, data cleaning, field normalization, KM parsing, and unified record generation.
"""

import os
import re
import csv
import sqlite3
import json
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "CypherX")
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "railway_block_planning.db")
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "schema.sql")

def parse_km(km_str):
    """
    Extract numeric floating point value from KM strings.
    Examples: 'KM  30.121' -> 30.121, 'KM 70.230' -> 70.230
    """
    if not km_str:
        return 0.0
    match = re.search(r'(\d+\.?\d*)', str(km_str))
    if match:
        return float(match.group(1))
    return 0.0

def normalize_severity(severity_str):
    """Normalize severity values to Critical, High, Medium, Low."""
    if not severity_str:
        return "Medium"
    s = str(severity_str).strip().title()
    if s in ["Critical", "High", "Medium", "Low"]:
        return s
    return "Medium"

def parse_hours_to_minutes(val):
    """Convert floating point hours to integer minutes."""
    try:
        if val is None or val == "":
            return 60
        return int(float(val) * 60)
    except (ValueError, TypeError):
        return 60

def init_db(db_path=DB_PATH):
    """Initialize database tables from schema.sql."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    cursor.executescript(schema_sql)
    conn.commit()
    conn.close()

def import_raw_csvs(data_dir=DATA_DIR, db_path=DB_PATH):
    """Import sample CSV files into raw source tables in the database."""
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Import BDMS
    bdms_file = os.path.join(data_dir, "BDMS CURRENT (CHANGED DATA).csv")
    if os.path.exists(bdms_file):
        with open(bdms_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO bdms_data 
                    (request_id, asset_id, department, location, work_type, defect_or_task, severity, required_duration_hr, requested_date, requested_start, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row.get('request_id', '').strip(),
                    row.get('asset_id', '').strip(),
                    row.get('department', '').strip(),
                    row.get('location', '').strip(),
                    row.get('work_type', '').strip(),
                    row.get('defect_or_task', '').strip(),
                    row.get('severity', '').strip(),
                    float(row.get('required_duration_hr', 1) or 1),
                    row.get('requested_date', '').strip(),
                    float(row.get('requested_start', 0) or 0),
                    row.get('status', 'Pending').strip()
                ))

    # 2. Import COA
    coa_file = os.path.join(data_dir, "COA_Sample_Data (1).csv")
    if os.path.exists(coa_file):
        with open(coa_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO coa_data
                    (coa_id, date, from_location, to_location, record_type, train_id, train_name, start_time, end_time, traffic_level, conflict_status, block_available)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row.get('coa_id', '').strip(),
                    row.get('date', '').strip(),
                    row.get('from_location', '').strip(),
                    row.get('to_location', '').strip(),
                    row.get('record_type', '').strip(),
                    row.get('train_id', '').strip(),
                    row.get('train_name', '').strip(),
                    float(row.get('start_time', 0) or 0),
                    float(row.get('end_time', 0) or 0),
                    row.get('traffic_level', '').strip(),
                    row.get('conflict_status', '').strip(),
                    row.get('block_available', '').strip()
                ))

    # 3. Import SMMS
    smms_file = os.path.join(data_dir, "SMMS CHANGED DATA.csv")
    if os.path.exists(smms_file):
        with open(smms_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO smms_data
                    (record_id, asset_id, location, work_type, defect, severity, maintenance_date, duration_hr, previous_occurance_count, historical_avg_duration_hr, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row.get('record_id', '').strip(),
                    row.get('asset_id', '').strip(),
                    row.get('location', '').strip(),
                    row.get('work_type', '').strip(),
                    row.get('defect', '').strip(),
                    row.get('severity', '').strip(),
                    row.get('maintenance_date', '').strip(),
                    float(row.get('duration_hr', 1) or 1),
                    int(row.get('previous occurance count', 0) or 0),
                    float(row.get('historical avg duration hr', 1) or 1),
                    row.get('status', 'completed').strip()
                ))

    # 4. Import TDMS
    tdms_file = os.path.join(data_dir, "TDMS CHANGED DATA.csv")
    if os.path.exists(tdms_file):
        with open(tdms_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO tdms_data
                    (record_id, asset_id, location, work_type, defect, severity, maintenance_date, duration_hr, previous_occurance_hr, historical_avg_duration_hr, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row.get('record_id', '').strip(),
                    row.get('asset_id', '').strip(),
                    row.get('location', '').strip(),
                    row.get('work_type', '').strip(),
                    row.get('defect', '').strip(),
                    row.get('severity', '').strip(),
                    row.get('maintenance_date', '').strip(),
                    float(row.get('duration_hr', 1) or 1),
                    int(row.get('previous occurance hr', 0) or 0),
                    float(row.get('historical avg duration hr', 1) or 1),
                    row.get('status', 'completed').strip()
                ))

    # 5. Import TMS
    tms_file = os.path.join(data_dir, "TMS CHANGED DATA.csv")
    if os.path.exists(tms_file):
        with open(tms_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO tms_data
                    (record_id, asset_id, location, work_type, defect, severity, maintenance_date, duration_hr, previous_occurance_count, historical_avg_duration_hr, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row.get('record_id', '').strip(),
                    row.get('asset_id', '').strip(),
                    row.get('location', '').strip(),
                    row.get('work_type', '').strip(),
                    row.get('defect', '').strip(),
                    row.get('severity', '').strip(),
                    row.get('maintenance_date', '').strip(),
                    float(row.get('duration_hr', 1) or 1),
                    int(row.get('previous occurance count', 0) or 0),
                    float(row.get('historical avg duration hr', 1) or 1),
                    row.get('status', 'completed').strip()
                ))

    conn.commit()
    conn.close()

def build_unified_maintenance(db_path=DB_PATH):
    """
    Data Hub core process: Combine and normalize BDMS, TMS, SMMS, TDMS records
    into unified_maintenance table with common fields.
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Load BDMS (Current Pending Maintenance Block Requests)
    cursor.execute("SELECT * FROM bdms_data")
    bdms_rows = cursor.fetchall()

    # Create historical lookup dict by asset_id from TMS, SMMS, TDMS
    history_by_asset = {}
    for sys_name, table in [('TMS', 'tms_data'), ('SMMS', 'smms_data'), ('TDMS', 'tdms_data')]:
        cursor.execute(f"SELECT * FROM {table}")
        for r in cursor.fetchall():
            asset_id = r['asset_id']
            if asset_id not in history_by_asset:
                history_by_asset[asset_id] = {
                    'count': 0,
                    'avg_hist_min': 90,
                    'last_date': r['maintenance_date'],
                    'defects': set()
                }
            occ_count = r['previous_occurance_count'] if 'previous_occurance_count' in r.keys() else (r['previous_occurance_hr'] if 'previous_occurance_hr' in r.keys() else 1)
            history_by_asset[asset_id]['count'] = max(history_by_asset[asset_id]['count'], occ_count)
            history_by_asset[asset_id]['avg_hist_min'] = parse_hours_to_minutes(r['historical_avg_duration_hr'])
            if r['defect']:
                history_by_asset[asset_id]['defects'].add(r['defect'])

    unified_records = []
    for row in bdms_rows:
        req_id = row['request_id']
        asset_id = row['asset_id']
        dept = row['department']
        raw_loc = row['location']
        loc_km = parse_km(raw_loc)
        work_type = row['work_type']
        defect = row['defect_or_task']
        severity = normalize_severity(row['severity'])
        est_min = parse_hours_to_minutes(row['required_duration_hr'])
        req_date = row['requested_date']

        # Determine overdue days (default based on severity / date difference)
        overdue_days = 0
        if severity == 'Critical':
            overdue_days = 12
        elif severity == 'High':
            overdue_days = 7
        elif severity == 'Medium':
            overdue_days = 3

        # Match historical statistics
        hist = history_by_asset.get(asset_id, {'count': 3, 'avg_hist_min': est_min, 'last_date': '01-08-2026'})
        hist_actual_min = hist['avg_hist_min']
        occurrence_count = max(hist['count'], 1)

        # Estimate postponement count based on historical occurrence & overdue days
        postponement_count = 2 if (severity == 'Critical' or overdue_days > 10) else (1 if overdue_days > 5 else 0)

        maint_id = f"UNIF_BDMS_{req_id}"

        cursor.execute("""
            INSERT OR REPLACE INTO unified_maintenance
            (maintenance_id, source_system, source_record_id, department, asset_id, location_km, raw_location_str,
             defect_type, work_type, severity, status, block_required, estimated_duration_min,
             historical_actual_duration_min, overdue_days, occurrence_count, postponement_count, maintenance_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            maint_id, 'BDMS', req_id, dept, asset_id, loc_km, raw_loc,
            defect, work_type, severity, 'Pending', 1, est_min,
            hist_actual_min, overdue_days, occurrence_count, postponement_count, req_date
        ))

    conn.commit()
    conn.close()
    print(f"Unified maintenance dataset built successfully: {len(bdms_rows)} active maintenance tasks processed.")

if __name__ == "__main__":
    print("Running Data Hub CSV ingestion & normalization...")
    import_raw_csvs()
    build_unified_maintenance()
    print("Data Hub processing completed!")
