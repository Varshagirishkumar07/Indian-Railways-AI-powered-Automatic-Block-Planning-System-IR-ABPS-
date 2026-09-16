"""
FastAPI Server & Web Application for Indian Railways AI-Powered Automatic Block Planning System.
Exposes REST API endpoints and serves the interactive HTML/JS dashboard UI.
"""

import os
import json
import sqlite3
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.data_hub import import_raw_csvs, build_unified_maintenance, DB_PATH
from backend.priority_engine import run_priority_analysis
from backend.grouping_engine import find_nearby_maintenance_groups
from backend.coa_engine import generate_block_recommendations

app = FastAPI(
    title="Indian Railways AI Block Planning API",
    description="Intelligent integration layer for TMS, SMMS, TDMS, BDMS, and COA data",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
JS_DIR = os.path.join(FRONTEND_DIR, "js")
if os.path.exists(JS_DIR):
    app.mount("/js", StaticFiles(directory=JS_DIR), name="js")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.on_event("startup")
def startup_event():
    """Ensure database is seeded and pipeline is executed on server start."""
    try:
        import_raw_csvs()
        build_unified_maintenance()
        run_priority_analysis()
        find_nearby_maintenance_groups()
        generate_block_recommendations()
    except Exception as e:
        print(f"Startup pipeline warning: {e}")

@app.get("/", response_class=HTMLResponse)
def read_root():
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Indian Railways AI Block Planning API Online</h1>"

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "Indian Railways AI Block Planning System"}

@app.post("/api/import")
def trigger_import():
    try:
        import_raw_csvs()
        build_unified_maintenance()
        return {"status": "success", "message": "CSV datasets imported and unified maintenance view built."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/maintenance")
def get_maintenance_list(
    department: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None
):
    conn = get_db()
    cursor = conn.cursor()
    query = """
        SELECT u.*, p.priority_score, p.priority_level, p.explainable_note
        FROM unified_maintenance u
        LEFT JOIN priority_results p ON u.maintenance_id = p.maintenance_id
        WHERE 1=1
    """
    params = []

    if department:
        query += " AND u.department = ?"
        params.append(department)
    if severity:
        query += " AND u.severity = ?"
        params.append(severity)
    if search:
        query += " AND (u.asset_id LIKE ? OR u.defect_type LIKE ? OR u.source_record_id LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    query += " ORDER BY p.priority_score DESC"

    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"count": len(rows), "data": rows}

@app.get("/api/maintenance/{maint_id}")
def get_maintenance_detail(maint_id: str):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT u.*, p.priority_score, p.priority_level, p.explainable_note,
               p.severity_subscore, p.overdue_subscore, p.criticality_subscore,
               p.recurrence_subscore, p.postponement_subscore
        FROM unified_maintenance u
        LEFT JOIN priority_results p ON u.maintenance_id = p.maintenance_id
        WHERE u.maintenance_id = ?
    """, (maint_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Maintenance record not found")
        
    res = dict(row)
    asset_id = res['asset_id']
    
    history = []
    for sys_name, table in [('TMS', 'tms_data'), ('SMMS', 'smms_data'), ('TDMS', 'tdms_data')]:
        cursor.execute(f"SELECT * FROM {table} WHERE asset_id = ?", (asset_id,))
        for r in cursor.fetchall():
            d = dict(r)
            d['source_system'] = sys_name
            history.append(d)

    conn.close()
    res['history'] = history
    return res

@app.post("/api/priority/analyze")
def trigger_priority_analysis():
    try:
        results = run_priority_analysis()
        return {"status": "success", "count": len(results), "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/priority")
def get_priority_results():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.*, u.department, u.asset_id, u.location_km, u.defect_type, u.overdue_days
        FROM priority_results p
        JOIN unified_maintenance u ON p.maintenance_id = u.maintenance_id
        ORDER BY p.priority_score DESC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"count": len(rows), "data": rows}

@app.get("/api/groups")
def get_maintenance_groups():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM maintenance_groups ORDER BY primary_location_km")
    rows = [dict(r) for r in cursor.fetchall()]
    for r in rows:
        r['maintenance_ids'] = json.loads(r['maintenance_ids'])
        r['departments'] = json.loads(r['departments'])
    conn.close()
    return {"count": len(rows), "data": rows}

@app.get("/api/coa/schedule")
def get_coa_schedule():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coa_data ORDER BY date, start_time")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"count": len(rows), "data": rows}

@app.post("/api/blocks/recommend")
def trigger_block_recommendation():
    try:
        recs = generate_block_recommendations()
        return {"status": "success", "count": len(recs), "data": recs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/blocks/recommendations")
def get_recommendations():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.*, g.group_name, g.primary_location_km, g.km_min, g.km_max, g.departments, g.task_count,
               a.officer_action, a.comments as officer_comments, a.decided_at
        FROM block_recommendations r
        JOIN maintenance_groups g ON r.group_id = g.group_id
        LEFT JOIN approvals a ON r.recommendation_id = a.recommendation_id
        ORDER BY r.recommendation_score DESC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    for r in rows:
        r['departments'] = json.loads(r['departments'])
    conn.close()
    return {"count": len(rows), "data": rows}

class ApprovalRequest(BaseModel):
    recommendation_id: str
    officer_action: str
    officer_name: Optional[str] = "Authorized Railway Officer"
    modified_start_time: Optional[str] = None
    modified_end_time: Optional[str] = None
    comments: Optional[str] = None

@app.post("/api/approvals")
def record_approval(req: ApprovalRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    app_id = f"APP_{req.recommendation_id}"
    cursor.execute("""
        INSERT OR REPLACE INTO approvals
        (approval_id, recommendation_id, officer_action, officer_name, modified_start_time, modified_end_time, comments)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        app_id, req.recommendation_id, req.officer_action, req.officer_name,
        req.modified_start_time, req.modified_end_time, req.comments
    ))
    
    cursor.execute("""
        UPDATE block_recommendations
        SET approval_status = ?
        WHERE recommendation_id = ?
    """, (req.officer_action, req.recommendation_id))
    
    conn.commit()
    conn.close()
    return {"status": "success", "approval_id": app_id, "action": req.officer_action}

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM unified_maintenance")
    total_maintenance = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM priority_results WHERE priority_level = 'Critical'")
    critical_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM priority_results WHERE priority_level = 'High'")
    high_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM priority_results WHERE priority_level = 'Medium'")
    medium_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM priority_results WHERE priority_level = 'Low'")
    low_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM unified_maintenance WHERE overdue_days > 0")
    overdue_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM block_recommendations WHERE affected_train_count > 0")
    conflict_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM block_recommendations WHERE approval_status = 'Pending'")
    pending_approval_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM maintenance_groups")
    group_count = cursor.fetchone()[0]

    conn.close()
    return {
        "total_maintenance": total_maintenance,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "overdue_count": overdue_count,
        "conflict_count": conflict_count,
        "pending_approval_count": pending_approval_count,
        "group_count": group_count
    }
