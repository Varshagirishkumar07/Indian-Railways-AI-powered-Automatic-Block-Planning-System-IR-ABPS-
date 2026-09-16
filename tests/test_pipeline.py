"""
End-to-End Automated Test Suite for Indian Railways AI Block Planning System.
Tests Data Hub ingestion, field normalization, priority scoring, proximity grouping,
COA conflict detection, recommendation engine, and officer approval audit trail.
"""

import os
import sys
import sqlite3
import unittest

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.data_hub import import_raw_csvs, build_unified_maintenance, parse_km, normalize_severity, DB_PATH
from backend.priority_engine import run_priority_analysis, calculate_priority_score
from backend.grouping_engine import find_nearby_maintenance_groups
from backend.coa_engine import generate_block_recommendations, is_time_overlapping

class TestRailwayBlockPlanningPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Run entire pipeline prior to testing."""
        import_raw_csvs()
        build_unified_maintenance()
        run_priority_analysis()
        find_nearby_maintenance_groups()
        generate_block_recommendations()

    def test_01_km_parsing(self):
        """Verify regex extraction of numeric KM values from raw strings."""
        self.assertEqual(parse_km("KM  30.121"), 30.121)
        self.assertEqual(parse_km("KM 70.230"), 70.230)
        self.assertEqual(parse_km("KM 20.120"), 20.120)
        self.assertEqual(parse_km(None), 0.0)

    def test_02_severity_normalization(self):
        """Verify severity normalization to Critical, High, Medium, Low."""
        self.assertEqual(normalize_severity("critical"), "Critical")
        self.assertEqual(normalize_severity("HIGH"), "High")
        self.assertEqual(normalize_severity("medium"), "Medium")
        self.assertEqual(normalize_severity("low"), "Low")

    def test_03_data_hub_unified_table(self):
        """Verify that unified_maintenance contains all 12 BDMS maintenance tasks."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM unified_maintenance")
        count = cursor.fetchone()[0]
        conn.close()
        self.assertEqual(count, 12, "Data Hub should process exactly 12 unified maintenance records.")

    def test_04_priority_scoring_engine(self):
        """Verify priority scoring and explainable reason generation."""
        sample_task = {
            "severity": "Critical",
            "overdue_days": 12,
            "defect_type": "Rail defect",
            "occurrence_count": 8,
            "postponement_count": 2,
            "block_required": True
        }
        score, level, subscores, note = calculate_priority_score(sample_task)
        self.assertGreaterEqual(score, 85.0, "Critical task should yield score >= 85.0")
        self.assertEqual(level, "Critical")
        self.assertIn("Critical", note)
        self.assertIn("overdue by 12 days", note)

    def test_05_time_overlap_logic(self):
        """Verify time collision matrix calculation for COA trains."""
        # 21:00 to 22:00 vs 21:30 to 22:30 -> Overlap True
        self.assertTrue(is_time_overlapping(21.0, 22.0, 21.5, 22.5))
        # 21:00 to 22:00 vs 23:00 to 02:00 -> Overlap False
        self.assertFalse(is_time_overlapping(21.0, 22.0, 23.0, 2.0))

    def test_06_recommendation_generation(self):
        """Verify block recommendations and explainable notes."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM block_recommendations")
        count = cursor.fetchone()[0]
        conn.close()
        self.assertGreater(count, 0, "Block recommendation engine should generate candidate recommendations.")

if __name__ == "__main__":
    unittest.main()
