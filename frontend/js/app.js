/**
 * INDIAN RAILWAYS AI-POWERED AUTOMATIC BLOCK PLANNING SYSTEM
 * Main Application Logic & Component Router (Modules 1, 2, and 3 Integrated Workflow)
 */

// Global State
let currentTab = 'dashboard';
let dataHubSubTab = 'unified';
let rawSourceSubTab = 'TMS';

// Initialize Application on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderPage(currentTab);
});

// Setup Navigation Event Listeners
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-link');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-tab');
            if (target) {
                switchTab(target);
            }
        });
    });
}

// Switch Navigation Tab
function switchTab(tabId) {
    currentTab = tabId;

    // Update Sidebar Active States
    document.querySelectorAll('.nav-link').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('bg-slate-800', 'text-amber-400', 'border-r-4', 'border-amber-400', 'font-bold');
            btn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/50');
        } else {
            btn.classList.remove('bg-slate-800', 'text-amber-400', 'border-r-4', 'border-amber-400', 'font-bold');
            btn.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/50');
        }
    });

    // Update Header Breadcrumb Title
    const titleMap = {
        'dashboard': 'Executive Dashboard & Operations Overview',
        'data-hub': 'Data Hub — Multi-Department Integration Layer',
        'maintenance': 'Departmental Maintenance Management',
        'priority': 'AI Priority Intelligence & Explainable Scoring',
        'coa': 'COA Train Operations & Timetable Visualizer',
        'conflict': 'COA Train & Maintenance Conflict Engine',
        'smart-planner': 'Smart Block Planner (7-Step Workflow)',
        'recommendations': 'AI Block Window Recommendations & Justification',
        'approval': 'Human Officer Approval & Decision Desk',
        'system-status': 'System Technical Health & Interface Connectors'
    };

    const breadcrumbEl = document.getElementById('page-title-breadcrumb');
    if (breadcrumbEl) {
        breadcrumbEl.innerText = titleMap[tabId] || 'Railway Operations Dashboard';
    }

    renderPage(tabId);
}

// Main Page Component Router
function renderPage(tabId) {
    const mainContainer = document.getElementById('main-content-area');
    if (!mainContainer) return;

    switch (tabId) {
        case 'dashboard':
            mainContainer.innerHTML = renderDashboardPage();
            initDashboardCharts();
            break;
        case 'data-hub':
            mainContainer.innerHTML = renderDataHubPage();
            break;
        case 'maintenance':
            mainContainer.innerHTML = renderMaintenancePage();
            break;
        case 'priority':
            mainContainer.innerHTML = renderPriorityPage();
            break;
        case 'coa':
            mainContainer.innerHTML = renderCoaPage();
            break;
        case 'conflict':
            mainContainer.innerHTML = renderConflictPage();
            break;
        case 'smart-planner':
            mainContainer.innerHTML = renderSmartPlannerPage();
            break;
        case 'recommendations':
            mainContainer.innerHTML = renderRecommendationsPage();
            break;
        case 'approval':
            mainContainer.innerHTML = renderApprovalPage();
            break;
        case 'system-status':
            mainContainer.innerHTML = renderSystemStatusPage();
            break;
        default:
            mainContainer.innerHTML = renderDashboardPage();
            initDashboardCharts();
    }
}

// PAGE 1: EXECUTIVE DASHBOARD
function renderDashboardPage() {
    const evaluatedTasks = window.IR_WORKFLOW_STORE.getEvaluatedPriorityTasks();
    const recs = window.IR_MOCK_DATA.blockRecommendations;
    const conflicts = window.IR_MOCK_DATA.recentConflicts;
    const sources = window.IR_MOCK_DATA.systemDataSources;

    const criticalList = evaluatedTasks.filter(a => a.priorityInfo.priorityClass === 'Critical');
    const highList = evaluatedTasks.filter(a => a.priorityInfo.priorityClass === 'High');
    const medList = evaluatedTasks.filter(a => a.priorityInfo.priorityClass === 'Medium');
    const lowList = evaluatedTasks.filter(a => a.priorityInfo.priorityClass === 'Low');

    return `
        <div class="space-y-6">
            <!-- TOP KPI METRICS CARDS -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
                    <p class="text-2xl font-black text-slate-900 mt-1">${evaluatedTasks.length}</p>
                </div>
                <div class="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm text-center">
                    <p class="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical</p>
                    <p class="text-2xl font-black text-red-700 mt-1">${criticalList.length}</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm text-center">
                    <p class="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Medium</p>
                    <p class="text-2xl font-black text-yellow-700 mt-1">${medList.length}</p>
                </div>
                <div class="bg-rose-50 p-4 rounded-xl border border-rose-200 shadow-sm text-center">
                    <p class="text-xs font-semibold text-rose-600 uppercase tracking-wider">Pending Blocks</p>
                    <p class="text-2xl font-black text-rose-700 mt-1">${evaluatedTasks.filter(a => a.status === 'Pending').length}</p>
                </div>
                <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-sm text-center">
                    <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Recommended</p>
                    <p class="text-2xl font-black text-indigo-700 mt-1">${recs.length}</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-sm text-center">
                    <p class="text-xs font-semibold text-purple-600 uppercase tracking-wider">Conflicts</p>
                    <p class="text-2xl font-black text-purple-700 mt-1">${conflicts.length}</p>
                </div>
            </div>

            <!-- GRID ROW 1: PRIORITY OVERVIEW CHART & CRITICAL MAINTENANCE -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                                <i class="fa-solid fa-chart-pie text-blue-900"></i> Maintenance Priority Overview
                            </h3>
                            <p class="text-xs text-slate-500">Distribution across urgency classes</p>
                        </div>
                        <span class="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded">${evaluatedTasks.length} Total Tasks</span>
                    </div>
                    <div class="relative flex justify-center items-center h-48">
                        <canvas id="priorityOverviewChart"></canvas>
                    </div>
                </div>

                <div class="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                                <i class="fa-solid fa-triangle-exclamation text-red-600"></i> Today's Critical Maintenance Requirements
                            </h3>
                            <p class="text-xs text-slate-500">High priority track, signal, and traction defects requiring immediate block allocation</p>
                        </div>
                        <button onclick="switchTab('priority')" class="text-xs bg-blue-900 hover:bg-blue-950 text-white font-semibold px-3 py-1.5 rounded transition">
                            View Priority Intelligence <i class="fa-solid fa-arrow-right ml-1"></i>
                        </button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs">
                            <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                                <tr>
                                    <th class="p-2.5">Maintenance ID</th>
                                    <th class="p-2.5">Dept</th>
                                    <th class="p-2.5">Location KM</th>
                                    <th class="p-2.5">Defect / Issue</th>
                                    <th class="p-2.5">Priority</th>
                                    <th class="p-2.5">Overdue</th>
                                    <th class="p-2.5">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${criticalList.map(item => `
                                    <tr class="hover:bg-slate-50 transition">
                                        <td class="p-2.5 font-mono font-bold text-blue-950">${item.maintenance_id}</td>
                                        <td class="p-2.5 font-semibold text-slate-800">${item.department}</td>
                                        <td class="p-2.5 font-medium text-slate-700">KM ${item.location_km.toFixed(3)}</td>
                                        <td class="p-2.5 font-medium text-slate-900">${item.defect_type}</td>
                                        <td class="p-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-800 border border-red-300 font-extrabold">CRITICAL (${item.priorityInfo.totalScore})</span></td>
                                        <td class="p-2.5 font-bold text-rose-600">${item.overdue_days} days</td>
                                        <td class="p-2.5">
                                            <button onclick="sendToPlanner('${item.maintenance_id}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px]">
                                                Plan Block <i class="fa-solid fa-arrow-right"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- GRID ROW 2: UPCOMING RECOMMENDATIONS & CONFLICTS -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                                <i class="fa-solid fa-robot text-blue-900"></i> AI Block Window Recommendations
                            </h3>
                            <p class="text-xs text-slate-500">AI-optimized maintenance windows with conflict evaluation</p>
                        </div>
                        <button onclick="switchTab('recommendations')" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded transition">
                            View All Recs
                        </button>
                    </div>

                    <div class="space-y-3">
                        ${recs.map(rec => `
                            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-400 transition space-y-2">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <span class="font-mono text-[11px] font-bold text-blue-950">${rec.id}</span>
                                        <h4 class="font-bold text-slate-900 text-xs mt-0.5">${rec.group_name}</h4>
                                    </div>
                                    <span class="px-2 py-0.5 text-[10px] rounded font-bold ${rec.status === 'Approved' ? 'bg-emerald-600 text-white' : (rec.status === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300')}">
                                        ${rec.status}
                                    </span>
                                </div>
                                <div class="grid grid-cols-4 gap-2 text-[11px] bg-white p-2 rounded border border-slate-100">
                                    <div><span class="text-slate-400">Date:</span> <strong class="text-slate-800">${rec.date}</strong></div>
                                    <div><span class="text-slate-400">Window:</span> <strong class="text-slate-900">${rec.start_time} - ${rec.end_time}</strong></div>
                                    <div><span class="text-slate-400">Conflicts:</span> <strong class="${rec.passenger_conflicts > 0 ? 'text-red-600' : 'text-emerald-600'}">${rec.passenger_conflicts} Pass / ${rec.goods_conflicts} Goods</strong></div>
                                    <div><span class="text-slate-400">AI Score:</span> <strong class="text-blue-900 font-black">${rec.score}/100</strong></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                                <i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Recent Train & Block Conflicts
                            </h3>
                            <p class="text-xs text-slate-500">Live operational overlap detection between scheduled trains and maintenance requests</p>
                        </div>
                        <button onclick="switchTab('conflict')" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded transition">
                            Conflict Analysis
                        </button>
                    </div>

                    <div class="space-y-3">
                        ${conflicts.map(conf => `
                            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <div class="flex justify-between items-start">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 text-[10px] rounded font-bold ${conf.train_type === 'Passenger' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}">
                                            ${conf.train_type}
                                        </span>
                                        <h4 class="font-bold text-slate-900 text-xs">${conf.train_name} (${conf.train_id})</h4>
                                    </div>
                                    <span class="px-2 py-0.5 text-[10px] rounded-full font-bold bg-red-100 text-red-800 border border-red-300">
                                        ${conf.severity}
                                    </span>
                                </div>
                                <div class="text-[11px] text-slate-600">
                                    <p><strong>Group:</strong> ${conf.maint_group} | <strong>Time:</strong> ${conf.time}</p>
                                    <p class="text-emerald-700 font-medium bg-emerald-50 p-1.5 rounded border border-emerald-200 mt-1"><i class="fa-solid fa-check mr-1"></i> AI Resolution: ${conf.resolution}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- SECTION E: SYSTEM DATA SOURCES CONNECTORS -->
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-server text-blue-900"></i> Integrated Departmental Systems & Connectors
                        </h3>
                        <p class="text-xs text-slate-500">Live operational interfaces with Railway legacy databases</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    ${sources.map(src => `
                        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-center">
                            <div class="flex justify-center items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span class="text-xs font-black text-slate-900">${src.code}</span>
                            </div>
                            <p class="text-[11px] font-semibold text-slate-700 truncate">${src.name}</p>
                            <div class="text-[10px] text-slate-500 space-y-0.5 border-t border-slate-200 pt-2">
                                <p>Sync: <strong class="text-emerald-700">${src.lastSync}</strong></p>
                                <p>Records: <strong class="text-blue-950">${src.records}</strong></p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// PAGE 2: DATA HUB COMPONENT RENDERER
function renderDataHubPage() {
    const data = window.IR_MOCK_DATA;
    const sources = data.systemDataSources;
    const unified = window.IR_WORKFLOW_STORE.getUnifiedTasks();

    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-5 rounded-xl text-white shadow-md border border-blue-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="bg-amber-500 text-slate-950 text-[10px] px-2.5 py-0.5 rounded font-black uppercase">Data Integration Layer</span>
                        <h2 class="text-lg font-bold">Multi-Department Data Hub Architecture</h2>
                    </div>
                    <p class="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        The Data Hub unifies maintenance requests from <strong>TMS</strong>, <strong>SMMS</strong>, <strong>TDMS</strong>, <strong>BDMS</strong>, and <strong>COA</strong> on normalized <strong>Location KM</strong> keys.
                    </p>
                </div>
                <button onclick="openCsvUploadModal()" class="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs px-4 py-2.5 rounded-lg font-bold shadow transition flex items-center gap-2 flex-shrink-0">
                    <i class="fa-solid fa-file-csv text-base"></i> Upload CSV Dataset
                </button>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase">
                            <tr>
                                <th class="p-2.5">Maintenance ID</th>
                                <th class="p-2.5">Source</th>
                                <th class="p-2.5">Department</th>
                                <th class="p-2.5">Asset ID</th>
                                <th class="p-2.5">Location KM</th>
                                <th class="p-2.5">Defect Type</th>
                                <th class="p-2.5">Severity</th>
                                <th class="p-2.5">Overdue</th>
                                <th class="p-2.5 text-right">Workflow Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${unified.map(item => `
                                <tr class="hover:bg-slate-50 border-b border-slate-100">
                                    <td class="p-2.5 font-mono font-bold text-blue-950">${item.maintenance_id}</td>
                                    <td class="p-2.5 font-bold text-slate-800">${item.source_system}</td>
                                    <td class="p-2.5 font-semibold text-slate-800">${item.department}</td>
                                    <td class="p-2.5 font-mono">${item.asset_id}</td>
                                    <td class="p-2.5 font-bold text-blue-900 bg-blue-50/50">KM ${item.location_km.toFixed(3)}</td>
                                    <td class="p-2.5 font-medium text-slate-900">${item.defect_type}</td>
                                    <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${item.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}">${item.severity}</span></td>
                                    <td class="p-2.5 font-bold text-rose-600">${item.overdue_days}d</td>
                                    <td class="p-2.5 text-right">
                                        <button onclick="inspectTaskInPriority('${item.maintenance_id}')" class="px-2.5 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded font-bold text-[10px]">
                                            Analyze Priority <i class="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// PAGE 3: MAINTENANCE MANAGEMENT PAGE
function renderMaintenancePage() {
    const list = window.IR_WORKFLOW_STORE.getUnifiedTasks();
    return `
        <div class="space-y-6">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-wrench text-blue-900"></i> Departmental Maintenance Management
                        </h2>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase">
                            <tr>
                                <th class="p-3">ID</th>
                                <th class="p-3">Source</th>
                                <th class="p-3">Department</th>
                                <th class="p-3">Asset</th>
                                <th class="p-3">Location KM</th>
                                <th class="p-3">Defect</th>
                                <th class="p-3">Severity</th>
                                <th class="p-3">Overdue</th>
                                <th class="p-3">History</th>
                                <th class="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${list.map(item => {
                                const hist = window.IR_WORKFLOW_STORE.getHistoryForTask(item.maintenance_id);
                                const histBadge = hist.total > 0
                                    ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 cursor-pointer" title="C:${hist.counts.Critical} H:${hist.counts.High} M:${hist.counts.Medium} L:${hist.counts.Low} | Last: ${hist.lastOccurrence}">${hist.total} prev (${hist.counts.Critical}C/${hist.counts.High}H)</span>`
                                    : `<span class="text-slate-400 text-[10px]">No history</span>`;
                                return `
                                <tr class="hover:bg-slate-50 border-b border-slate-100">
                                    <td class="p-3 font-mono font-bold text-blue-950">${item.maintenance_id}</td>
                                    <td class="p-3 font-bold">${item.source_system}</td>
                                    <td class="p-3 font-semibold">${item.department}</td>
                                    <td class="p-3 font-mono">${item.asset_id}</td>
                                    <td class="p-3 font-bold text-blue-900">KM ${item.location_km.toFixed(3)}</td>
                                    <td class="p-3 font-medium text-slate-900">${item.defect_type}</td>
                                    <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${item.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}">${item.severity}</span></td>
                                    <td class="p-3 font-bold text-rose-600">${item.overdue_days}d</td>
                                    <td class="p-3">${histBadge}</td>
                                    <td class="p-3 text-right">
                                        <button onclick="sendToPlanner('${item.maintenance_id}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px]">
                                            Send to Block Planner <i class="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}


// PAGE 4: PRIORITY INTELLIGENCE PAGE
function renderPriorityPage() {
    const evaluatedList = window.IR_WORKFLOW_STORE.getEvaluatedPriorityTasks();

    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-xl text-white shadow-md border border-indigo-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="bg-emerald-500 text-slate-950 text-[10px] px-2.5 py-0.5 rounded font-black uppercase tracking-wider">Explainable Decision Support</span>
                        <h2 class="text-lg font-bold">AI Priority Intelligence Engine</h2>
                    </div>
                    <p class="text-xs text-slate-300">Calculates transparent priority scores (0-100) using current severity, overdue duration, asset criticality, historical recurrence, and postponement risk.</p>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
                            <tr>
                                <th class="p-3">Rank & Score</th>
                                <th class="p-3">Maintenance ID</th>
                                <th class="p-3">Priority Class</th>
                                <th class="p-3">Dept & Asset</th>
                                <th class="p-3">Location KM</th>
                                <th class="p-3">Defect Type</th>
                                <th class="p-3">Overdue</th>
                                <th class="p-3">History</th>
                                <th class="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${evaluatedList.map((item, idx) => {
                                const pi = item.priorityInfo;
                                const histBadge = pi.histTotal > 0
                                    ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800" title="Recurrence: ${pi.recurrenceLevel} | Last: ${pi.lastOccurrenceDate}">${pi.histTotal} prev (${pi.histCritical}C/${pi.histHigh}H)</span>`
                                    : `<span class="text-slate-400 text-[10px]">First occurrence</span>`;
                                return `
                                <tr class="hover:bg-slate-50 border-b border-slate-100">
                                    <td class="p-3 font-mono font-black text-base text-blue-950">#${idx + 1} (${pi.totalScore})</td>
                                    <td class="p-3 font-mono font-bold">${item.maintenance_id}</td>
                                    <td class="p-3"><span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${pi.priorityClass === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}">${pi.priorityClass}</span></td>
                                    <td class="p-3 font-semibold">${item.department} (${item.asset_id})</td>
                                    <td class="p-3 font-bold text-blue-900">KM ${item.location_km.toFixed(3)}</td>
                                    <td class="p-3 font-medium">${item.defect_type}</td>
                                    <td class="p-3 font-bold text-rose-600">${item.overdue_days}d</td>
                                    <td class="p-3">${histBadge}</td>
                                    <td class="p-3 text-right space-x-1">
                                        <button onclick="openPriorityModal('${item.maintenance_id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[10px] font-bold border border-slate-300">
                                            AI Reasons
                                        </button>
                                        <button onclick="sendToPlanner('${item.maintenance_id}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[10px] font-bold">
                                            Plan Block <i class="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}


// PAGE 5: COA OPERATIONS TIMETABLE PAGE
function renderCoaPage() {
    const trains = window.IR_MOCK_DATA.coaTrainSchedules;
    return `
        <div class="space-y-6">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-calendar-days text-blue-900"></i> COA Control Office Train Schedule Timetable
                        </h2>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase">
                            <tr>
                                <th class="p-3">Train ID</th>
                                <th class="p-3">Train Name</th>
                                <th class="p-3">Train Type</th>
                                <th class="p-3">Date</th>
                                <th class="p-3">Start Time</th>
                                <th class="p-3">End Time</th>
                                <th class="p-3">Traffic Level</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${trains.map(t => `
                                <tr class="hover:bg-slate-50 border-b border-slate-100">
                                    <td class="p-3 font-mono font-bold text-blue-950">${t.train_id}</td>
                                    <td class="p-3 font-bold text-slate-900">${t.train_name}</td>
                                    <td class="p-3"><span class="px-2.5 py-0.5 rounded text-[10px] font-bold ${t.train_type === 'Passenger' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'}">${t.train_type}</span></td>
                                    <td class="p-3 font-medium">${t.date}</td>
                                    <td class="p-3 font-mono font-bold text-slate-900">${t.start_time}</td>
                                    <td class="p-3 font-mono font-bold text-slate-900">${t.end_time}</td>
                                    <td class="p-3 font-bold">${t.traffic_level}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// PAGE 6: CONFLICT DETECTION PAGE
function renderConflictPage() {
    const conflicts = window.IR_MOCK_DATA.recentConflicts;
    return `
        <div class="space-y-6">
            <div class="bg-red-950 text-white p-5 rounded-xl shadow-md border border-red-800 space-y-1">
                <h2 class="text-lg font-bold">Train & Maintenance Conflict Detection Engine</h2>
                <p class="text-xs text-slate-300">Detects schedule collisions between passenger/goods trains and proposed maintenance block requests.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${conflicts.map(conf => `
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div class="flex justify-between items-start border-b pb-2">
                            <div>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${conf.train_type === 'Passenger' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'}">${conf.train_type}</span>
                                <h4 class="font-bold text-slate-900 text-xs mt-1">${conf.train_name} (${conf.train_id})</h4>
                            </div>
                            <span class="px-2 py-0.5 text-[10px] rounded font-bold bg-red-100 text-red-800 border border-red-300">${conf.severity}</span>
                        </div>
                        <div class="text-xs text-slate-700 space-y-1">
                            <p><strong>Target Group:</strong> ${conf.maint_group}</p>
                            <p><strong>Overlap Interval:</strong> ${conf.time}</p>
                            <p class="text-rose-700 font-semibold"><i class="fa-solid fa-triangle-exclamation mr-1"></i> ${conf.impact}</p>
                            <p class="bg-emerald-50 text-emerald-900 p-2 rounded border border-emerald-200 font-medium text-[11px]"><i class="fa-solid fa-check mr-1"></i> ${conf.resolution}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// PAGE 7: SMART BLOCK PLANNER COMPONENT RENDERER
function renderSmartPlannerPage() {
    const dynamicGroups = window.IR_WORKFLOW_STORE.getDynamicGroups();
    const selGroupId = window.IR_WORKFLOW_STORE.selectedGroupId;
    const activeGroup = dynamicGroups.find(g => g.groupId === selGroupId) || dynamicGroups[0];
    const sample = window.IR_MOCK_DATA.sampleGroupData;

    const durInfo = window.IR_BLOCK_PLANNER_SERVICE.calculateDurationBreakdown(activeGroup.tasks, 30);
    const bestRec = sample.candidates[0];
    const explanationBullets = window.IR_BLOCK_PLANNER_SERVICE.generateBlockExplanation(bestRec, sample, durInfo);

    return `
        <div class="space-y-6">
            <!-- STEPPER HEADER BAR -->
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    7-Step Smart Block Planning Workflow
                </div>
                <div class="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-xs">
                    <div class="p-2 rounded bg-slate-100 font-semibold text-slate-600">1. Select Tasks</div>
                    <div class="p-2 rounded bg-slate-100 font-semibold text-slate-600">2. Find Nearby</div>
                    <div class="p-2 rounded bg-slate-100 font-semibold text-slate-600">3. Group Work</div>
                    <div class="p-2 rounded bg-slate-100 font-semibold text-slate-600">4. Calculate Duration</div>
                    <div class="p-2 rounded bg-slate-100 font-semibold text-slate-600">5. COA Conflict</div>
                    <div class="p-2 rounded bg-slate-100 font-semibold text-slate-600">6. Candidate Windows</div>
                    <div class="p-2 rounded bg-blue-900 text-white font-bold shadow">7. Rank & Recommend</div>
                </div>
            </div>

            <!-- DYNAMIC GROUP SELECTOR BAR -->
            <div class="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center">
                <div>
                    <span class="text-[10px] text-amber-400 font-mono font-bold uppercase">Active Corridor Cluster</span>
                    <h3 class="font-bold text-sm text-white">${activeGroup.groupName}</h3>
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-xs text-slate-300 font-semibold">Select Group:</label>
                    <select onchange="changePlannerGroup(this.value)" class="bg-slate-800 border border-slate-700 text-amber-400 text-xs rounded px-3 py-1.5 font-mono font-bold">
                        ${dynamicGroups.map(g => `
                            <option value="${g.groupId}" ${g.groupId === activeGroup.groupId ? 'selected' : ''}>${g.groupId}: ${g.groupName} (${g.taskCount} Tasks)</option>
                        `).join('')}
                    </select>
                </div>
            </div>

            <!-- GROUP & PROXIMITY CARD -->
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="border-b pb-3 flex justify-between items-center">
                    <div>
                        <span class="bg-blue-100 text-blue-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-blue-300">${activeGroup.groupId}</span>
                        <h3 class="text-base font-bold text-slate-900 mt-1">${activeGroup.groupName}</h3>
                        <p class="text-xs text-slate-500">Proximity Radius: <strong class="text-blue-900 font-mono">Within 1.0 KM threshold</strong></p>
                    </div>
                    <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                        Multi-Department Compatible
                    </span>
                </div>

                <!-- COMBINED ACTIVITIES LIST -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    ${activeGroup.tasks.map(act => `
                        <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                            <div class="flex justify-between items-center font-bold">
                                <span class="text-blue-950 font-mono">${act.maintenance_id} (${act.source_system})</span>
                                <span class="px-2 py-0.5 bg-white rounded text-[10px] border border-slate-300">${act.department}</span>
                            </div>
                            <p class="font-semibold text-slate-800">${act.defect_type}</p>
                            <p class="text-slate-500">Location: <strong class="text-blue-900 font-mono">KM ${act.location_km.toFixed(3)}</strong></p>
                            <p class="text-slate-500">Duration: <strong class="text-slate-900">${act.estimated_duration_min} mins</strong></p>
                        </div>
                    `).join('')}
                </div>

                <!-- DURATION MATHEMATICAL CALCULATION BOX -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-2">
                    <h4 class="font-bold text-blue-950 flex items-center gap-1.5">
                        <i class="fa-solid fa-calculator text-blue-900"></i> Multi-Department Duration Math & Safety Buffer Sizing
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-blue-100 text-slate-800">
                        <div><span class="text-slate-500">Work Sum:</span> <strong class="block text-slate-900 font-mono">${durInfo.workSumMin} mins</strong></div>
                        <div><span class="text-slate-500">Max Single:</span> <strong class="block text-slate-900 font-mono">${durInfo.maxSingleMin} mins</strong></div>
                        <div><span class="text-slate-500">Safety Buffer:</span> <strong class="block text-amber-700 font-mono">30 mins</strong></div>
                        <div><span class="text-slate-500">Total Required:</span> <strong class="block text-blue-900 font-mono font-bold">${durInfo.totalRequiredMin} mins</strong></div>
                    </div>
                </div>
            </div>

            <!-- RANKED CANDIDATE BLOCK WINDOWS -->
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="border-b pb-3 flex justify-between items-center">
                    <div>
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-list-check text-blue-900"></i> Ranked Candidate Block Windows (COA Conflict Engine)
                        </h3>
                    </div>
                </div>

                <div class="space-y-3">
                    ${sample.candidates.map(cand => `
                        <div class="p-4 rounded-xl border transition ${cand.rank === 1 ? 'bg-amber-50/50 border-amber-400 shadow' : 'bg-slate-50 border-slate-200'} space-y-3">
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-3">
                                    <span class="w-7 h-7 rounded-full font-black text-xs flex justify-center items-center ${cand.rank === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-300 text-slate-800'}">#${cand.rank}</span>
                                    <div>
                                        <h4 class="font-bold text-slate-900 text-sm font-mono">${cand.window} (${cand.duration})</h4>
                                        <span class="px-2.5 py-0.5 text-[10px] font-black rounded ${cand.feasible ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}">${cand.badge}</span>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs text-slate-500 font-medium">Recommendation Score</span>
                                    <p class="text-2xl font-black text-blue-950 font-mono">${cand.score}<span class="text-xs text-slate-400 font-normal">/100</span></p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- EXPLAINABLE AI PANEL ("WHY THIS BLOCK?") & HUMAN APPROVAL DESK -->
            <div class="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-xl shadow-lg border border-blue-800 space-y-5">
                <div class="border-b border-blue-800 pb-3 flex justify-between items-center">
                    <div>
                        <span class="bg-amber-500 text-slate-950 text-[10px] px-2.5 py-0.5 rounded font-black uppercase">Decision Support Explanation</span>
                        <h3 class="text-lg font-bold mt-1">Why Was Block Window 04:30 - 08:00 Recommended?</h3>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div class="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                        <h4 class="font-bold text-amber-400 text-sm"><i class="fa-solid fa-lightbulb mr-1"></i> Explainable AI Justification</h4>
                        <ul class="space-y-1.5 list-disc pl-5 text-slate-300">
                            ${explanationBullets.map(b => `<li>${b}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                        <h4 class="font-bold text-white text-sm flex items-center gap-2">
                            <i class="fa-solid fa-user-check text-emerald-400"></i> Authorized Railway Officer Approval Desk
                        </h4>
                        <div>
                            <label class="block text-[11px] text-slate-300 font-semibold mb-1">Officer Remarks / Modifications</label>
                            <textarea id="planner-remarks" rows="2" placeholder="Enter divisional operational comments..." class="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2"></textarea>
                        </div>
                        <div class="flex items-center gap-3 pt-1">
                            <button onclick="handleOfficerAction('Approved')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold text-xs shadow transition flex justify-center items-center gap-1.5">
                                <i class="fa-solid fa-check"></i> APPROVE BLOCK
                            </button>
                            <button onclick="handleOfficerAction('Rejected')" class="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-bold text-xs shadow transition flex justify-center items-center gap-1.5">
                                <i class="fa-solid fa-xmark"></i> REJECT BLOCK
                            </button>
                        </div>
                    </div>
                </div>

                <div class="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-3">
                    <i class="fa-solid fa-triangle-exclamation text-amber-400 text-xl flex-shrink-0"></i>
                    <p>
                        <strong>MANDATORY SAFETY DECLARATION:</strong> This AI system is an <em>Advisory Decision-Support Platform</em> only. All generated block recommendations require explicit review and electronic signature by an authorized Railway Officer (DOM/Sr.DEN). The system does NOT directly operate signals, points, or traction power disconnections.
                    </p>
                </div>
            </div>
        </div>
    `;
}

// PAGE 8: RECOMMENDATIONS PAGE
function renderRecommendationsPage() {
    const recs = window.IR_MOCK_DATA.blockRecommendations;
    return `
        <div class="space-y-6">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="border-b pb-3 flex justify-between items-center">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-robot text-blue-900"></i> AI Maintenance Block Window Recommendations
                        </h2>
                    </div>
                </div>

                <div class="space-y-4">
                    ${recs.map(rec => `
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <div class="flex justify-between items-start">
                                <div>
                                    <span class="font-mono text-xs font-bold text-blue-950">${rec.id}</span>
                                    <h3 class="font-bold text-slate-900 text-sm mt-0.5">${rec.group_name}</h3>
                                </div>
                                <span class="px-3 py-1 rounded text-xs font-bold ${rec.status === 'Approved' ? 'bg-emerald-600 text-white' : (rec.status === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300')}">${rec.status}</span>
                            </div>
                            <div class="bg-blue-50/80 p-3 rounded-lg border border-blue-200 text-xs text-slate-800">
                                <strong>Explainable AI Recommendation Note:</strong> ${rec.explanation}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// PAGE 9: APPROVAL DESK PAGE
function renderApprovalPage() {
    const recs = window.IR_MOCK_DATA.blockRecommendations;
    return `
        <div class="space-y-6">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="border-b pb-3 flex justify-between items-center">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-user-check text-blue-900"></i> Authorized Railway Officer Approval Workflow
                        </h2>
                    </div>
                </div>

                <div class="space-y-4">
                    ${recs.map(rec => `
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold text-slate-900 text-sm">${rec.group_name} (${rec.id})</h4>
                                    <p class="text-xs text-slate-500">Target Date: ${rec.date} | Window: ${rec.start_time} - ${rec.end_time}</p>
                                </div>
                                <span class="px-3 py-1 rounded text-xs font-bold ${rec.status === 'Approved' ? 'bg-emerald-600 text-white' : (rec.status === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300')}">${rec.status}</span>
                            </div>
                            ${rec.officer_comments ? `
                                <div class="bg-emerald-50 text-emerald-900 p-2.5 rounded border border-emerald-200 text-xs font-medium">
                                    <strong>Officer Remarks (${rec.officer_name || 'DOM'}):</strong> ${rec.officer_comments}
                                </div>
                            ` : ''}
                            <div class="flex justify-end gap-2 pt-2 border-t">
                                <button onclick="handleOfficerActionForRec('${rec.id}', 'Approved')" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow">APPROVE</button>
                                <button onclick="handleOfficerActionForRec('${rec.id}', 'Rejected')" class="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded shadow">REJECT</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// PAGE 10: SYSTEM TECHNICAL STATUS PAGE
function renderSystemStatusPage() {
    const sources = window.IR_MOCK_DATA.systemDataSources;
    return `
        <div class="space-y-6">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="border-b pb-3 flex justify-between items-center">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-server text-blue-900"></i> Technical Connector Health & System Status
                        </h2>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${sources.map(src => `
                        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                            <div class="space-y-1">
                                <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ${src.name}
                                </h4>
                                <p class="text-xs text-slate-500">Dept: ${src.department} | Last Sync: ${src.lastSync}</p>
                            </div>
                            <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">${src.status}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// WORKFLOW NAVIGATION ACTIONS
function inspectTaskInPriority(maintId) {
    window.IR_WORKFLOW_STORE.selectMaintenanceTask(maintId);
    switchTab('priority');
    openPriorityModal(maintId);
}

function sendToPlanner(maintId) {
    window.IR_WORKFLOW_STORE.selectMaintenanceTask(maintId);
    switchTab('smart-planner');
}

function changePlannerGroup(groupId) {
    window.IR_WORKFLOW_STORE.selectedGroupId = groupId;
    renderPage('smart-planner');
}

function handleOfficerAction(action) {
    const remarks = document.getElementById('planner-remarks')?.value || '';
    const recId = window.IR_WORKFLOW_STORE.selectedRecommendationId;
    window.IR_WORKFLOW_STORE.recordOfficerApproval(recId, action, 'Divisional Operational Manager (DOM)', remarks);
    alert(`Decision Sign-Off Recorded: Recommendation ${recId} updated to [${action.toUpperCase()}]. Remarks: "${remarks || 'None'}". Decision updated on Dashboard.`);
    renderPage(currentTab);
}

function handleOfficerActionForRec(recId, action) {
    const remarks = prompt(`Enter officer remarks for recommendation ${recId}:`, `Verified operational safety for ${action.toLowerCase()} block window.`);
    if (remarks !== null) {
        window.IR_WORKFLOW_STORE.recordOfficerApproval(recId, action, 'Divisional Operational Manager (DOM)', remarks);
        alert(`Decision Sign-Off Recorded: Recommendation ${recId} updated to [${action.toUpperCase()}]. Dashboard state refreshed!`);
        renderPage(currentTab);
    }
}

function openPriorityModal(maintId) {
    const rawList = window.IR_WORKFLOW_STORE.getUnifiedTasks();
    const item = rawList.find(i => i.maintenance_id === maintId);
    if (!item) return;

    const res = window.IR_PRIORITY_SERVICE.evaluatePriority(item);

    const body = document.getElementById('priority-modal-body');
    body.innerHTML = `
        <div class="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl">
            <div>
                <p class="text-xs text-slate-400 font-mono">${item.maintenance_id} | ${item.department} (${item.asset_id})</p>
                <h4 class="text-base font-bold text-white mt-0.5">${item.defect_type} @ KM ${item.location_km.toFixed(3)}</h4>
            </div>
            <div class="text-right">
                <p class="text-[10px] text-slate-400 uppercase font-bold">Priority Score</p>
                <p class="text-3xl font-black text-amber-400">${res.totalScore}<span class="text-xs text-slate-400 font-normal">/100</span></p>
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${res.priorityClass === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'}">${res.priorityClass.toUpperCase()}</span>
            </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-slate-800">
            <h5 class="font-bold text-amber-950 flex items-center gap-2 text-sm">
                <i class="fa-solid fa-robot text-amber-600"></i> WHY DID THIS MAINTENANCE RECEIVE PRIORITY SCORE ${res.totalScore}?
            </h5>
            <ul class="space-y-1.5 pl-5 list-disc text-xs text-slate-700 font-medium">
                ${res.bulletReasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
        </div>
        <div class="pt-2 flex justify-end">
            <button onclick="closePriorityModal(); sendToPlanner('${item.maintenance_id}');" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow">
                Send to Smart Block Planner <i class="fa-solid fa-arrow-right ml-1"></i>
            </button>
        </div>
    `;

    document.getElementById('modal-priority-detail')?.classList.remove('hidden');
}

function closePriorityModal() {
    document.getElementById('modal-priority-detail')?.classList.add('hidden');
}

function openCsvUploadModal() { document.getElementById('modal-csv-upload')?.classList.remove('hidden'); }
function closeCsvUploadModal() { document.getElementById('modal-csv-upload')?.classList.add('hidden'); }

function simulateCsvUpload(e) {
    e.preventDefault();
    const src = document.getElementById('upload-source-system')?.value || 'TMS';
    alert(`CSV Ingestion Simulated: Validated and normalized sample records for ${src}. Data Hub records refreshed!`);
    closeCsvUploadModal();
}

function simulateSync(srcCode) {
    alert(`Manual Sync Initiated: Connected to ${srcCode} API endpoint. Cleaned and normalized latest source records.`);
}

function initDashboardCharts() {
    setTimeout(() => {
        const ctx = document.getElementById('priorityOverviewChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    data: [3, 6, 3, 0],
                    backgroundColor: ['#dc2626', '#f59e0b', '#facc15', '#10b981'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                cutout: '70%'
            }
        });
    }, 50);
}
