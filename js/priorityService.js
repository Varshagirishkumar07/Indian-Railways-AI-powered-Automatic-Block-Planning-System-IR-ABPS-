/**
 * INDIAN RAILWAYS AI-POWERED AUTOMATIC BLOCK PLANNING SYSTEM
 * Priority Calculation & Explainability Service (Module 2 Business Logic)
 *
 * Separates priority scoring math and deterministic AI explanation text generation
 * from the UI so it can later be moved to a Python/FastAPI backend seamlessly.
 */

window.IR_PRIORITY_SERVICE = {
    // Configurable Scoring Weights (Must sum to 1.0 across base 6 factors)
    DEFAULT_WEIGHTS: {
        severity:       0.30,  // 30 pts max
        overdue:        0.13,  // 13 pts max
        criticality:    0.13,  // 13 pts max
        recurrence:     0.12,  // 12 pts max
        postponement:   0.09,  // 9 pts max
        blockUrgency:   0.09,  // 9 pts max
        historyBoost:   0.14   // 14 pts max (7th factor – historical critical recurrence)
    },

    SEVERITY_POINTS: {
        'Critical': 100,
        'High':     75,
        'Medium':   45,
        'Low':      20
    },

    /**
     * Calculates Priority Score (0-100), Subscores, Risk Rating, and Explainable AI Note.
     * Historical factor is sourced from IR_WORKFLOW_STORE.getHistoryForTask() so it can
     * be swapped for a real DB call without touching the UI layer.
     */
    evaluatePriority: function(item, weights) {
        weights = weights || this.DEFAULT_WEIGHTS;

        const severity     = item.severity || 'Medium';
        const overdueDays  = item.overdue_days || 0;
        const postponements = item.postponement_count || 0;
        const defect       = item.defect_type || '';
        const blockRequired = item.block_required !== false;

        // ── 1. Severity Subscore (30 pts max) ──────────────────────────────────
        const sevBase = this.SEVERITY_POINTS[severity] || 45;
        const severitySubscore = Number((sevBase * weights.severity).toFixed(1));

        // ── 2. Overdue Subscore (13 pts max — normalised to 15 days) ──────────
        const overdueNorm = Math.min(overdueDays / 15.0, 1.0) * 100;
        const overdueSubscore = Number((overdueNorm * weights.overdue).toFixed(1));

        // ── 3. Asset Criticality Subscore (13 pts max) ────────────────────────
        let critBase = 60;
        if (/crack|weld|defect|interlocking|flashover|failure|point/i.test(defect)) critBase = 90;
        if (severity === 'Critical') critBase = 100;
        const criticalitySubscore = Number((critBase * weights.criticality).toFixed(1));

        // ── 4. Recurrence Subscore (12 pts max — live field occurrence_count) ─
        const occurrences = item.occurrence_count || 1;
        const recNorm = Math.min(occurrences / 10.0, 1.0) * 100;
        const recurrenceSubscore = Number((recNorm * weights.recurrence).toFixed(1));

        // ── 5. Postponement Risk Subscore (9 pts max) ─────────────────────────
        const postNorm = Math.min(postponements / 3.0, 1.0) * 100;
        const postponementSubscore = Number((postNorm * weights.postponement).toFixed(1));

        // ── 6. Block Urgency Subscore (9 pts max) ─────────────────────────────
        const blockSubscore = Number(((blockRequired ? 100 : 30) * weights.blockUrgency).toFixed(1));

        // ── 7. Historical Critical Recurrence Boost (14 pts max) ──────────────
        // Pull historical data from workflowStore — replace body with API call when backend is ready
        let histTotal = 0, histCritical = 0, histHigh = 0, lastDate = null, recurrenceLevel = 'None';
        if (window.IR_WORKFLOW_STORE && typeof window.IR_WORKFLOW_STORE.getHistoryForTask === 'function') {
            const hist = window.IR_WORKFLOW_STORE.getHistoryForTask(item.maintenance_id);
            histTotal      = hist.total;
            histCritical   = hist.counts.Critical;
            histHigh       = hist.counts.High;
            lastDate       = hist.lastOccurrence;
            recurrenceLevel = hist.recurrenceLevel;
        }
        // Boost is weighted: critical past occurrences count double
        const histRaw = Math.min((histCritical * 2 + histHigh * 1 + (histTotal - histCritical - histHigh) * 0.5) / 14.0, 1.0) * 100;
        const historyBoostSubscore = Number((histRaw * weights.historyBoost).toFixed(1));

        // ── Total Score (0-100) ────────────────────────────────────────────────
        const totalScore = Math.min(100, Math.round(
            severitySubscore + overdueSubscore + criticalitySubscore +
            recurrenceSubscore + postponementSubscore + blockSubscore + historyBoostSubscore
        ));

        // ── Priority Class Thresholds ──────────────────────────────────────────
        let priorityClass = 'Low';
        if (totalScore >= 85)      priorityClass = 'Critical';
        else if (totalScore >= 65) priorityClass = 'High';
        else if (totalScore >= 40) priorityClass = 'Medium';

        // ── Risk Level Indicator ───────────────────────────────────────────────
        let riskLevel = 'Moderate', riskColor = 'yellow';
        if (totalScore >= 85 || postponements >= 2) {
            riskLevel = 'Severe Recurrence Risk'; riskColor = 'red';
        } else if (totalScore >= 65 || overdueDays >= 7) {
            riskLevel = 'Elevated Failure Risk'; riskColor = 'amber';
        } else if (totalScore < 40) {
            riskLevel = 'Low Risk'; riskColor = 'emerald';
        }

        // ── Explainable AI Reasons (Bulleted) ─────────────────────────────────
        const bulletReasons = [
            `Current defect severity is rated ${severity.toUpperCase()} (${severitySubscore}/30 pts)`
        ];
        if (overdueDays > 0) {
            bulletReasons.push(`Maintenance is ${overdueDays} days overdue beyond standard window (+${overdueSubscore}/13 pts)`);
        }
        if (histTotal > 0) {
            const histDesc = histCritical > 0
                ? `${histTotal} previous occurrences recorded, including ${histCritical} Critical — priority boosted (+${historyBoostSubscore}/14 pts)`
                : `${histTotal} previous occurrences recorded (${histHigh} High severity) — recurrence pattern detected (+${historyBoostSubscore}/14 pts)`;
            bulletReasons.push(histDesc);
        }
        if (occurrences > 1) {
            bulletReasons.push(`${occurrences} asset-level occurrences in live maintenance record (+${recurrenceSubscore}/12 pts)`);
        }
        if (postponements > 0) {
            bulletReasons.push(`${postponements} previous block postponements increase failure risk (+${postponementSubscore}/9 pts)`);
        }
        bulletReasons.push(`High corridor asset criticality on main line (+${criticalitySubscore}/13 pts)`);
        if (blockRequired) {
            bulletReasons.push(`Requires traffic & traction power block disconnection (+${blockSubscore}/9 pts)`);
        }

        const summaryNote = `Priority Score ${totalScore}/100 [${priorityClass.toUpperCase()}]: Severity ${severity}, ${overdueDays}d overdue` +
            (histTotal > 0 ? `, ${histTotal} historical occurrences (${histCritical} Critical)` : '') +
            `, ${postponements} postponements on critical corridor asset.`;

        return {
            totalScore,
            priorityClass,
            riskLevel,
            riskColor,
            summaryNote,
            bulletReasons,
            histTotal,
            histCritical,
            histHigh,
            lastOccurrenceDate: lastDate,
            recurrenceLevel,
            subscores: {
                severity:      severitySubscore,
                overdue:       overdueSubscore,
                criticality:   criticalitySubscore,
                recurrence:    recurrenceSubscore,
                postponement:  postponementSubscore,
                blockUrgency:  blockSubscore,
                historyBoost:  historyBoostSubscore
            }
        };
    }
};

