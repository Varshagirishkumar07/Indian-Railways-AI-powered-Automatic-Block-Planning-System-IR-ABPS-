"""
COA Conflict Analysis & Block Recommendation Engine for Indian Railways.
Analyzes passenger and goods train schedules, detects operational collisions,
evaluates available block windows, and generates explainable block recommendations.
"""

import sqlite3
import json
import os
import re

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "railway_block_planning.db")

def parse_km(km_str):
    if not km_str:
        return 0.0
    match = re.search(r'(\d+\.?\d*)', str(km_str))
    return float(match.group(1)) if match else 0.0

def format_float_time(val):
    try:
        hours = int(val)
        frac = val - hours
        minutes = int(round(frac * 60))
        if minutes >= 60:
            hours += 1
            minutes = 0
        return f"{hours:02d}:{minutes:02d}"
    except (ValueError, TypeError):
        return "00:00"

def is_time_overlapping(start1, end1, start2, end2):
    def get_intervals(s, e):
        if e < s:
            return [(s, 24.0), (0.0, e)]
        return [(s, e)]

    i1_list = get_intervals(start1, end1)
    i2_list = get_intervals(start2, end2)

    for (s1, e1) in i1_list:
        for (s2, e2) in i2_list:
            if max(s1, s2) < min(e1, e2):
                return True
    return False

def generate_block_recommendations(db_path=DB_PATH):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM maintenance_groups")
    groups = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM coa_data")
    coa_records = [dict(r) for r in cursor.fetchall()]

    # Clear previous recommendations
    cursor.execute("DELETE FROM block_recommendations")

    recommendations = []

    for grp in groups:
        grp_id = grp['group_id']
        combined_dur_min = grp['combined_duration_min']
        km_min = grp['km_min']
        km_max = grp['km_max']
        
        # Load associated maintenance tasks for target date
        maint_ids = json.loads(grp['maintenance_ids'])
        cursor.execute(f"SELECT maintenance_date FROM unified_maintenance WHERE maintenance_id = '{maint_ids[0]}'")
        maint_row = cursor.fetchone()
        target_date = maint_row['maintenance_date'] if maint_row else '14-09-2026'

        # Match COA records by date
        date_coa = [c for c in coa_records if c['date'] == target_date]
        if not date_coa:
            date_coa = coa_records # fallback to all COA

        # Find COA Block Window for target date/section
        candidate_windows = [c for c in date_coa if c['record_type'] == 'Block Window']
        train_schedules = [c for c in date_coa if c['record_type'] in ['Passenger', 'Goods']]

        best_window = None
        if candidate_windows:
            best_window = candidate_windows[0]
        
        if best_window:
            cand_start = best_window['start_time']
            cand_end = best_window['end_time']
            win_name = best_window['train_name'] or best_window['train_id']
        else:
            cand_start = 23.25 # 23:15
            cand_end = 2.5    # 02:30
            win_name = "Night Low-Traffic Window"

        passenger_conflicts = 0
        goods_conflicts = 0
        conflicting_train_names = []

        for trn in train_schedules:
            t_start = trn['start_time']
            t_end = trn['end_time']
            if is_time_overlapping(cand_start, cand_end, t_start, t_end):
                if trn['record_type'] == 'Passenger':
                    passenger_conflicts += 1
                else:
                    goods_conflicts += 1
                conflicting_train_names.append(f"{trn['train_name']} ({trn['train_id']})")

        total_conflicts = passenger_conflicts + goods_conflicts

        if total_conflicts == 0:
            feasibility_status = "Feasible"
            score = 95.0
        elif passenger_conflicts == 0 and goods_conflicts > 0:
            feasibility_status = "Feasible with Freight Regulation"
            score = 80.0
        else:
            feasibility_status = "Conflict Warning"
            score = 55.0

        start_str = format_float_time(cand_start)
        end_str = format_float_time(cand_end)

        reasons = []
        if grp['task_count'] > 1:
            reasons.append(f"combines {grp['task_count']} compatible tasks along corridor KM {km_min:.2f}–{km_max:.2f}")
        else:
            reasons.append(f"covers maintenance at KM {grp['primary_location_km']:.2f}")

        reasons.append(f"historical duration estimates require {combined_dur_min} minutes")

        if total_conflicts == 0:
            reasons.append("candidate window has zero detected passenger or freight train overlaps in COA timetable")
        else:
            reasons.append(f"overlaps with {total_conflicts} scheduled trains ({', '.join(conflicting_train_names)}) requiring signal/control approval")

        explanation = f"Recommended block {start_str}–{end_str} on {target_date} because " + "; ".join(reasons) + "."

        rec_id = f"REC_{grp_id}"

        cursor.execute("""
            INSERT OR REPLACE INTO block_recommendations
            (recommendation_id, group_id, target_date, recommended_start_time, recommended_end_time,
             start_time_numeric, end_time_numeric, total_duration_min, affected_train_count,
             passenger_conflict_count, goods_conflict_count, feasibility_status, recommendation_score,
             explanation, approval_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rec_id, grp_id, target_date, start_str, end_str,
            cand_start, cand_end, combined_dur_min, total_conflicts,
            passenger_conflicts, goods_conflicts, feasibility_status, score,
            explanation, 'Pending'
        ))

        recommendations.append({
            "recommendation_id": rec_id,
            "group_id": grp_id,
            "target_date": target_date,
            "recommended_window": f"{start_str}–{end_str}",
            "duration_min": combined_dur_min,
            "passenger_conflicts": passenger_conflicts,
            "goods_conflicts": goods_conflicts,
            "feasibility_status": feasibility_status,
            "score": score,
            "explanation": explanation
        })

    conn.commit()
    conn.close()
    print(f"COA Conflict Analysis completed: {len(recommendations)} block recommendations generated.")
    return recommendations

if __name__ == "__main__":
    recs = generate_block_recommendations()
    for r in recs:
        print(f"[{r['feasibility_status']}] {r['recommendation_id']} ({r['target_date']}) -> Window: {r['recommended_window']}\n  Note: {r['explanation']}\n")
