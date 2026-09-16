# 🚆 Indian Railways AI-Powered Automatic Block Planning System (IR-ABPS)

> **Advisory Decision Support System (DSS)** for automated, intelligent railway traffic and maintenance block scheduling across Indian Railways divisions.

[![GitHub Pages](https://img.shields.io/badge/Hosted%20Demo-GitHub%20Pages-brightgreen?logo=github)](https://varshagirishkumar07.github.io/Indian-Railways-AI-powered-Automatic-Block-Planning-System-IR-ABPS-/)
[![Python](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-blue?logo=python)](backend/)
[![UI](https://img.shields.io/badge/Frontend-TailwindCSS%20%7C%20Chart.js-orange)](frontend/)
[![Tests](https://img.shields.io/badge/Tests-Passing%20(6%2F6)-success)]()

---

## 🌐 Live Hosted Demo

🔗 **Public Sharable Link:**  
👉 **[https://varshagirishkumar07.github.io/Indian-Railways-AI-powered-Automatic-Block-Planning-System-IR-ABPS-/](https://varshagirishkumar07.github.io/Indian-Railways-AI-powered-Automatic-Block-Planning-System-IR-ABPS-/)**

---

## 📌 Executive Summary

Maintaining thousands of kilometers of track, overhead equipment (TRD), signaling (S&T), and bridge structures while running hundreds of scheduled passenger and freight trains daily is one of the most critical operational challenges for Indian Railways. 

Currently, block planning involves manual cross-departmental coordination, resulting in:
- Underutilized block windows
- Unplanned train detentions and cascading delays
- High safety risks due to deferred maintenance
- Inefficient single-department blocks on the same track corridor

**IR-ABPS** solves this by unifying raw data from departmental silos into an automated, explainable AI recommendation engine and a rich interactive Operations Dashboard.

---

## 🏗️ Architecture & Integrated Data Pipelines

`mermaid
graph TD
    A[TMS Track Management] --> E[Data Hub Ingestion Layer]
    B[SMMS Signaling] --> E
    C[TDMS TRD/OHE] --> E
    D[BDMS Bridge Works] --> E
    F[COA Control Office Application] --> H[Conflict Detection Engine]
    
    E --> G[Unified Maintenance Database]
    G --> I[Explainable AI Priority Engine]
    G --> J[Proximity Grouping Corridor Engine]
    
    I --> K[Smart Block Window Optimization Engine]
    J --> K
    H --> K
    
    K --> L[AI Recommendation Engine]
    L --> M[Officer Approval & Decision Desk]
    M --> N[Approved Block Execution Log]
`

### 1. Unified Data Hub
Integrates disparate departmental CSV datasets into a single schema:
- **TMS**: Track Machine & P-Way maintenance records
- **SMMS**: Signal and Telecommunication work requirements
- **TDMS**: Overhead Equipment (OHE) and traction power isolations
- **BDMS**: Bridge and culvert rehabilitation works
- **COA**: Live train schedules, paths, train types (Rajdhani, Mail/Exp, Freight), and speed limits

### 2. Explainable AI Priority Engine
Calculates a multi-factor score (0–100) with deterministic, audit-proof explainability notes based on:
- Severity level (Critical, High, Medium, Low)
- Overdue duration (days elapsed past scheduled maintenance)
- Track & corridor criticality
- Recurrence frequency
- Deferral / postponement history

### 3. Proximity Corridor Grouping Engine
Clusters overlapping or adjacent maintenance demands within a 15 km corridor and identical direction into single composite "Shadow Block" opportunities, saving up to 40% in total line blockage hours.

### 4. COA Conflict Engine & Schedule Optimization
Analyzes time overlaps between requested maintenance windows and scheduled train paths. Automatically proposes optimal low-impact maintenance slots during non-peak or night-time operational gaps.

### 5. Officer Approval Desk & Audit Trail
Adheres strictly to the Indian Railways safety philosophy: **AI Recommends, Human Decides**. Divisional Operations Managers (DOM) review AI justifications, evaluate impacted trains, and approve/reject blocks with full audit logging.

---

## 🖥️ Application Features & Navigation

The interactive dashboard includes 10 integrated modules:
1. **Executive Dashboard**: High-level KPIs, maintenance health gauges, priority distribution, and corridor heatmaps.
2. **Data Hub**: Source dataset viewer and unified maintenance table.
3. **Maintenance Management**: Searchable and filterable departmental tasks.
4. **AI Priority Intelligence**: Breakdown of priority scores, weight adjustments, and natural language explanations.
5. **COA Operations**: Timetable visualizer with train schedules, categories, and speeds.
6. **Conflict Engine**: Live matrix detecting train-maintenance corridor overlaps.
7. **Smart Block Planner**: Interactive 7-step planning pipeline.
8. **Recommendations**: Top AI block proposals ranked by impact minimization.
9. **Approval Desk**: Actionable approvals with notes and status tracking.
10. **System Status**: Real-time connector latency and pipeline metrics.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Modern Web Browser (Chrome, Edge, Firefox, Safari)

### 1. Clone the Repository
`ash
git clone https://github.com/Varshagirishkumar07/Indian-Railways-AI-powered-Automatic-Block-Planning-System-IR-ABPS-.git
cd Indian-Railways-AI-powered-Automatic-Block-Planning-System-IR-ABPS-
`

### 2. Run Locally via Python FastAPI Server
`ash
# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
`
Open your browser and navigate to:
👉 **http://127.0.0.1:8000**

### 3. Run Static Client Directly
You can also open rontend/index.html directly in any web browser without running a backend server!

---

## 🧪 Automated Testing

Run the full end-to-end test suite:
`ash
python -m unittest tests/test_pipeline.py
`
All 6 core pipeline tests verify:
- ✅ KM regex extraction and spatial coordinate parsing
- ✅ Multi-department severity normalization
- ✅ Unified maintenance view generation
- ✅ Deterministic priority scoring algorithm
- ✅ Spatial proximity grouping logic
- ✅ COA train schedule conflict detection

---

## 📄 License & Advisory Notice

This project is built for the CypherX Hackathon.  
**Advisory Notice**: This system is designed strictly as an Advisory Decision Support System (DSS). All AI recommendations require authorized officer review and sign-off prior to granting actual track possession.
