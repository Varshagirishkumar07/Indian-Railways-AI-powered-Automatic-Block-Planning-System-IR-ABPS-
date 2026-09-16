"""
Proximity Grouping Engine for Indian Railways Block Planning.
Clusters maintenance tasks located close to each other (e.g. within 1.5 KM)
that can be combined into a single coordinated block.
"""

import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "railway_block_planning.db")

def find_nearby_maintenance_groups(proximity_threshold_km=1.5, db_path=DB_PATH):
    """
    Groups active maintenance tasks that are geographically close (within proximity_threshold_km)
    or share the same railway section corridor.
    Returns list of group dictionary objects and persists into maintenance_groups table.
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT u.*, p.priority_score, p.priority_level
        FROM unified_maintenance u
        LEFT JOIN priority_results p ON u.maintenance_id = p.maintenance_id
        ORDER BY u.maintenance_date, u.location_km
    """)
    tasks = [dict(r) for r in cursor.fetchall()]

    groups_by_date = {}
    for task in tasks:
        dt = task['maintenance_date']
        if dt not in groups_by_date:
            groups_by_date[dt] = []
        groups_by_date[dt].append(task)

    created_groups = []
    group_counter = 1

    # Clear previous groups
    cursor.execute("DELETE FROM maintenance_groups")

    for dt, date_tasks in groups_by_date.items():
        sorted_tasks = sorted(date_tasks, key=lambda x: x['location_km'])
        visited = set()

        for i, base_task in enumerate(sorted_tasks):
            if base_task['maintenance_id'] in visited:
                continue

            cluster = [base_task]
            visited.add(base_task['maintenance_id'])

            for j in range(i + 1, len(sorted_tasks)):
                next_task = sorted_tasks[j]
                if next_task['maintenance_id'] in visited:
                    continue

                cluster_km_min = min(t['location_km'] for t in cluster)
                cluster_km_max = max(t['location_km'] for t in cluster)

                # Check proximity threshold or section match (e.g. KM 30-34 corridor vs KM 70 corridor vs KM 20 corridor)
                dist_to_base = abs(next_task['location_km'] - base_task['location_km'])
                dist_to_min = abs(next_task['location_km'] - cluster_km_min)
                dist_to_max = abs(next_task['location_km'] - cluster_km_max)

                if min(dist_to_base, dist_to_min, dist_to_max) <= proximity_threshold_km:
                    cluster.append(next_task)
                    visited.add(next_task['maintenance_id'])

            group_id = f"GRP_{dt.replace('-', '')}_{group_counter:03d}"
            group_counter += 1

            maint_ids = [t['maintenance_id'] for t in cluster]
            departments = list(set(t['department'] for t in cluster))
            kms = [t['location_km'] for t in cluster]
            km_min = min(kms)
            km_max = max(kms)
            primary_km = round(sum(kms) / len(kms), 3)

            max_single_duration = max(t['estimated_duration_min'] for t in cluster)
            combined_duration_min = max_single_duration + (15 * (len(cluster) - 1))

            if len(cluster) > 1:
                group_name = f"Grouped Corridor Block KM {km_min:.2f}–{km_max:.2f} ({'/'.join(departments)})"
                grouping_reason = f"Combined {len(cluster)} maintenance tasks across {', '.join(departments)} departments located within {proximity_threshold_km} km on {dt}. Reduces track downtime and optimizes block utility."
            else:
                group_name = f"Standalone Block KM {primary_km:.2f} ({departments[0]})"
                grouping_reason = f"Standalone maintenance task at KM {primary_km:.2f} for {departments[0]} department."

            cursor.execute("""
                INSERT OR REPLACE INTO maintenance_groups
                (group_id, group_name, maintenance_ids, primary_location_km, km_min, km_max, departments,
                 task_count, combined_duration_min, required_block_type, grouping_reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                group_id, group_name, json.dumps(maint_ids), primary_km, km_min, km_max,
                json.dumps(departments), len(cluster), combined_duration_min,
                'Traffic/Power Block', grouping_reason
            ))

            created_groups.append({
                "group_id": group_id,
                "group_name": group_name,
                "date": dt,
                "maintenance_ids": maint_ids,
                "primary_location_km": primary_km,
                "km_range": f"{km_min:.3f} - {km_max:.3f}",
                "departments": departments,
                "task_count": len(cluster),
                "combined_duration_min": combined_duration_min,
                "grouping_reason": grouping_reason
            })

    conn.commit()
    conn.close()
    print(f"Grouping completed: {len(created_groups)} maintenance groups formed.")
    return created_groups

if __name__ == "__main__":
    groups = find_nearby_maintenance_groups()
    for g in groups:
        print(f"[{g['group_id']}] {g['group_name']} ({g['date']}) -> {g['task_count']} tasks, Duration: {g['combined_duration_min']}m. Reason: {g['grouping_reason']}")
