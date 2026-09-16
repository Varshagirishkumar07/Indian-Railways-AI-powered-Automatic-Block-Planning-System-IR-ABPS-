"""
Explainable AI Maintenance Priority Scoring Engine.
Calculates priority scores (0-100), assigns priority buckets (Critical, High, Medium, Low),
and generates deterministic natural language explainability notes.
"""

import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "railway_block_planning.db")

# Default Configurable Weights
DEFAULT_WEIGHTS = {
    "severity": 0.35,
    "overdue": 0.15,
    "criticality": 0.15,
    "recurrence": 0.15,
    "postponement": 0.10,
    "block_urgency": 0.10
}

SEVERITY_SCORES = {
    "Critical": 100.0,
    "High": 75.0,
    "Medium": 45.0,
    "Low": 20.0
}

def calculate_priority_score(record, weights=DEFAULT_WEIGHTS):
    """
    Calculate a weighted priority score (0-100) for a unified maintenance record.
    Returns (total_score, priority_level, subscores, explainable_note)
    """
    severity = record.get('severity', 'Medium')
    overdue_days = record.get('overdue_days', 0)
    defect_type = record.get('defect_type', '')
    occurrence_count = record.get('occurrence_count', 1)
    postponement_count = record.get('postponement_count', 0)
    block_required = record.get('block_required', True)

    # 1. Current Severity Subscore
    sev_raw = SEVERITY_SCORES.get(severity, 45.0)
    sev_subscore = sev_raw * weights['severity']

    # 2. Overdue Subscore (max 15 days normalized)
    overdue_norm = min(overdue_days / 15.0, 1.0) * 100.0
    overdue_subscore = overdue_norm * weights['overdue']

    # 3. Asset Criticality Subscore
    crit_raw = 50.0
    if any(k in defect_type.lower() for k in ['crack', 'defect', 'fail', 'machine', 'insulator', 'wear']):
        crit_raw = 90.0
    if severity == 'Critical':
        crit_raw = 100.0
    crit_subscore = crit_raw * weights['criticality']

    # 4. Historical Recurrence Subscore (max 10 occurrences)
    rec_norm = min(occurrence_count / 10.0, 1.0) * 100.0
    rec_subscore = rec_norm * weights['recurrence']

    # 5. Postponement Risk Subscore (max 3 postponements)
    post_norm = min(postponement_count / 3.0, 1.0) * 100.0
    post_subscore = post_norm * weights['postponement']

    # 6. Block Urgency Subscore
    block_subscore = (100.0 if block_required else 30.0) * weights['block_urgency']

    # Total Score Calculation
    total_score = round(sev_subscore + overdue_subscore + crit_subscore + rec_subscore + post_subscore + block_subscore, 1)

    # Priority Bucket Thresholds
    if total_score >= 85.0:
        priority_level = "Critical"
    elif total_score >= 65.0:
        priority_level = "High"
    elif total_score >= 40.0:
        priority_level = "Medium"
    else:
        priority_level = "Low"

    # Explainable AI Text Generation
    reasons = [f"defect severity is {severity}"]
    if overdue_days > 0:
        reasons.append(f"task is overdue by {overdue_days} days")
    if occurrence_count > 1:
        reasons.append(f"asset has {occurrence_count} recorded historical occurrences")
    if postponement_count > 0:
        reasons.append(f"previous postponement count ({postponement_count}) indicates elevated risk")
    if block_required:
        reasons.append("requires a coordinated traffic/power block window")

    explainable_note = f"Marked {priority_level} (Priority Score: {total_score}/100) because " + ", ".join(reasons) + "."

    subscores = {
        "severity": round(sev_subscore, 2),
        "overdue": round(overdue_subscore, 2),
        "criticality": round(crit_subscore, 2),
        "recurrence": round(rec_subscore, 2),
        "postponement": round(post_subscore, 2),
        "block_urgency": round(block_subscore, 2)
    }

    return total_score, priority_level, subscores, explainable_note

def run_priority_analysis(db_path=DB_PATH):
    """
    Fetch all unified maintenance tasks, calculate priority scores,
    and persist results into priority_results table.
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM unified_maintenance")
    tasks = cursor.fetchall()

    results = []
    for task in tasks:
        t_dict = dict(task)
        maint_id = t_dict['maintenance_id']
        total_score, priority_level, subscores, explainable_note = calculate_priority_score(t_dict)

        p_id = f"PRIO_{maint_id}"
        cursor.execute("""
            INSERT OR REPLACE INTO priority_results
            (priority_id, maintenance_id, priority_score, priority_level, severity_subscore,
             overdue_subscore, criticality_subscore, recurrence_subscore, postponement_subscore, explainable_note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p_id, maint_id, total_score, priority_level,
            subscores['severity'], subscores['overdue'], subscores['criticality'],
            subscores['recurrence'], subscores['postponement'], explainable_note
        ))
        results.append({
            "maintenance_id": maint_id,
            "asset_id": t_dict['asset_id'],
            "priority_score": total_score,
            "priority_level": priority_level,
            "explainable_note": explainable_note
        })

    conn.commit()
    conn.close()
    print(f"Priority analysis completed for {len(results)} maintenance tasks.")
    return results

if __name__ == "__main__":
    res = run_priority_analysis()
    for r in res:
        print(f"[{r['priority_level']}] {r['maintenance_id']} (Score: {r['priority_score']}) -> {r['explainable_note']}")
