/**
 * INDIAN RAILWAYS AI-POWERED AUTOMATIC BLOCK PLANNING SYSTEM
 * Centralized End-to-End Workflow State Store
 * 
 * Manages the sequential data flow:
 * Departmental Datasets -> Data Hub -> Unified Maintenance -> Priority Engine -> Smart Block Planner -> Recommendations -> Officer Approval -> Dashboard
 */

window.IR_WORKFLOW_STORE = {
    selectedMaintenanceId: 'UNIF-BDMS-001',
    selectedGroupId: 'GRP-001',
    selectedRecommendationId: 'REC-BLK-101',

    /**
     * Retrieves all unified maintenance records from Data Hub.
     */
    getUnifiedTasks: function() {
        return window.IR_MOCK_DATA.unifiedMaintenance;
    },

    /**
     * Gets evaluated priority results for all tasks using priorityService.
     */
    getEvaluatedPriorityTasks: function() {
        const tasks = this.getUnifiedTasks();
        return tasks.map(t => {
            const priorityInfo = window.IR_PRIORITY_SERVICE.evaluatePriority(t);
            return {
                ...t,
                priorityInfo
            };
        }).sort((a, b) => b.priorityInfo.totalScore - a.priorityInfo.totalScore);
    },

    /**
     * Dynamically clusters maintenance tasks by location_km proximity (threshold = 1.0 KM).
     */
    getDynamicGroups: function(proximityThresholdKm = 1.0) {
        const tasks = this.getEvaluatedPriorityTasks();
        const groups = [];

        const visited = new Set();
        let groupCounter = 1;

        tasks.forEach(baseTask => {
            if (visited.has(baseTask.maintenance_id)) return;

            const cluster = [baseTask];
            visited.add(baseTask.maintenance_id);

            tasks.forEach(nextTask => {
                if (visited.has(nextTask.maintenance_id)) return;

                const kms = cluster.map(c => c.location_km);
                const minKm = Math.min(...kms);
                const maxKm = Math.max(...kms);

                if (Math.abs(nextTask.location_km - baseTask.location_km) <= proximityThresholdKm ||
                    Math.abs(nextTask.location_km - minKm) <= proximityThresholdKm ||
                    Math.abs(nextTask.location_km - maxKm) <= proximityThresholdKm) {
                    cluster.push(nextTask);
                    visited.add(nextTask.maintenance_id);
                }
            });

            const kms = cluster.map(c => c.location_km);
            const minKm = Math.min(...kms);
            const maxKm = Math.max(...kms);
            const depts = [...new Set(cluster.map(c => c.department))];

            const durInfo = window.IR_BLOCK_PLANNER_SERVICE.calculateDurationBreakdown(cluster, 30);
            const groupId = `GRP-${String(groupCounter).padStart(3, '0')}`;
            groupCounter++;

            groups.push({
                groupId,
                groupName: `Corridor Block KM ${minKm.toFixed(2)}–${maxKm.toFixed(2)} (${depts.join('/')})`,
                minKm,
                maxKm,
                depts,
                taskCount: cluster.length,
                tasks: cluster,
                durInfo
            });
        });

        return groups;
    },

    /**
     * Selects a maintenance task to inspect across Data Hub, Priority, and Planner.
     */
    selectMaintenanceTask: function(maintId) {
        this.selectedMaintenanceId = maintId;
        // Auto-select corresponding corridor group
        const groups = this.getDynamicGroups();
        const matchGroup = groups.find(g => g.tasks.some(t => t.maintenance_id === maintId));
        if (matchGroup) {
            this.selectedGroupId = matchGroup.groupId;
        }
    },

    /**
     * Records officer approval decision and updates live recommendation state.
     */
    recordOfficerApproval: function(recId, action, officerName, comments) {
        const recs = window.IR_MOCK_DATA.blockRecommendations;
        const target = recs.find(r => r.id === recId);
        if (target) {
            target.status = action; // 'Approved' or 'Rejected'
            target.officer_name = officerName || 'Divisional Operational Manager (DOM)';
            target.officer_comments = comments || `Decision executed: ${action}`;
            target.decided_at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return target;
    },

    /**
     * Aggregates historical defect occurrences for a given maintenance ID.
     * Returns: { total, counts { Critical, High, Medium, Low }, lastOccurrence, recurrenceLevel, records }
     * Designed so real railway DB query can replace this later without UI changes.
     */
    getHistoryForTask: function(maintId) {
        const records = (window.IR_MOCK_DATA.historicalDefects || [])
            .filter(h => h.maintenance_id === maintId);
        const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        records.forEach(r => { if (counts[r.severity] !== undefined) counts[r.severity]++; });
        const lastOccurrence = records.length ? records[0].occurrence_date : null;
        const total = records.length;
        const recurrenceLevel = total >= 6 ? 'Very High' : total >= 4 ? 'High' : total >= 2 ? 'Moderate' : total === 1 ? 'Low' : 'None';
        return { total, counts, lastOccurrence, recurrenceLevel, records };
    }
};
