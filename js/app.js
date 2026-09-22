/**
 * INDIAN RAILWAYS AI-POWERED AUTOMATIC BLOCK PLANNING SYSTEM (IR-ABPS)
 * Enterprise Operations & Decision Support System (DSS)
 * Operating Department — Eastern Railway / Howrah Division
 */

// Global Navigation & Operational Subtab State
let currentTab = 'dashboard';
let dataHubSubTab = 'unified';
let rawSourceSubTab = 'TMS';
let maintenanceDeptFilter = 'ALL';
let maintenanceSeverityFilter = 'ALL';
let pendingSanctionRecId = null;

// Enterprise Railway Operational Toast Notification System
function showIrToast(title, message, type = 'success') {
    const container = document.getElementById('ir-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const borderClass = type === 'success' ? 'border-emerald-600' : (type === 'danger' ? 'border-red-600' : (type === 'warning' ? 'border-amber-600' : 'border-blue-900'));
    toast.className = `pointer-events-auto bg-white rounded border ${borderClass} shadow-xl overflow-hidden transition-all duration-300 transform translate-x-4 opacity-0 flex flex-col`;
    
    const headerBg = type === 'success' ? 'bg-emerald-950 text-emerald-100' : (type === 'danger' ? 'bg-red-950 text-red-100' : (type === 'warning' ? 'bg-amber-950 text-amber-100' : 'bg-[#0b1e38] text-slate-100'));
    const icon = type === 'success' ? 'fa-circle-check text-emerald-400' : (type === 'danger' ? 'fa-circle-exclamation text-red-400' : (type === 'warning' ? 'fa-triangle-exclamation text-amber-400' : 'fa-circle-info text-blue-400'));
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} IST`;

    toast.innerHTML = `
        <div class="${headerBg} px-3 py-1.5 flex items-center justify-between text-[11px] font-bold border-b border-black/20">
            <div class="flex items-center gap-1.5">
                <i class="fa-solid ${icon}"></i>
                <span class="uppercase tracking-wider font-mono">${title}</span>
            </div>
            <span class="text-[10px] font-mono opacity-80">${timeStr}</span>
        </div>
        <div class="px-3 py-2 text-xs text-slate-800 bg-white">
            <p class="leading-snug">${message}</p>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-x-4', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-4', 'opacity-0');
        setTimeout(() => toast.remove(), 350);
    }, 4500);
}

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
            btn.classList.add('ir-nav-active');
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('text-slate-400');
                icon.classList.add('text-amber-400');
            }
        } else {
            btn.classList.remove('ir-nav-active');
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('text-amber-400');
                icon.classList.add('text-slate-400');
            }
        }
    });

    // Update Header Breadcrumb Title
    const titleMap = {
        'dashboard': 'Executive Operations Overview & Control Desk',
        'data-hub': 'Multi-Department Data Ingestion & Integration Hub (TMS/SMMS/TDMS/BDMS/COA)',
        'maintenance': 'Departmental Maintenance Demands & Defect Register',
        'priority': 'AI Priority Intelligence & Multi-Factor Risk Scoring',
        'coa': 'COA Train Operations & Live Section Timetable',
        'conflict': 'Train-Block Conflict Analysis & Overlap Engine',
        'corridor-map': 'Linear Track Corridor Diagram & Section Occupancy (KM 20.0 - 80.0)',
        'smart-planner': 'Smart Composite Block Planner (7-Step Workflow)',
        'recommendations': 'DSS Recommended Composite Block Windows',
        'approval': 'Divisional Operating Officer Sign-Off & Sanction Desk',
        'history': 'Historical Defect Register & Block Postponement Audit Log',
        'system-status': 'Enterprise Connector Health & Pipeline Telemetry'
    };

    const breadcrumbEl = document.getElementById('page-title-breadcrumb');
    if (breadcrumbEl) {
        breadcrumbEl.innerText = `${titleMap[tabId] || 'Railway Operations Dashboard'} — Howrah Division (ER)`;
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
        case 'corridor-map':
            mainContainer.innerHTML = renderCorridorMapPage();
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
        case 'history':
            mainContainer.innerHTML = renderHistoryPage();
            break;
        case 'system-status':
            mainContainer.innerHTML = renderSystemStatusPage();
            break;
        default:
            mainContainer.innerHTML = renderDashboardPage();
            initDashboardCharts();
    }
}

// PAGE 1: EXECUTIVE DASHBOARD (DIVISIONAL CONTROL DESK)
function renderDashboardPage() {
    const evaluatedTasks = window.IR_WORKFLOW_STORE.getEvaluatedPriorityTasks();
    const recs = window.IR_MOCK_DATA.blockRecommendations;
    const conflicts = window.IR_MOCK_DATA.recentConflicts;
    const sources = window.IR_MOCK_DATA.systemDataSources;

    const criticalList = evaluatedTasks.filter(a => a.priorityInfo.priorityClass === 'Critical');
    const highList = evaluatedTasks.filter(a => a.priorityInfo.priorityClass === 'High');
    const medList = evaluatedTasks.filter(a => a.priorityInfo.priorityClass === 'Medium');
    const pendingBlocks = evaluatedTasks.filter(a => a.status === 'Pending').length;
    const overdueCount = evaluatedTasks.filter(a => a.overdue_days >= 7).length;

    return `
        <div class="space-y-4">
            <!-- SECTION 1: OPERATIONAL TELEMETRY & KPI STRIP -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div class="bg-white p-3 rounded border border-slate-300 shadow-sm">
                    <div class="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <span>Total Demands</span>
                        <i class="fa-solid fa-list-check text-slate-400"></i>
                    </div>
                    <div class="mt-1 flex items-baseline justify-between">
                        <span class="text-xl font-bold font-mono text-slate-900">${evaluatedTasks.length}</span>
                        <span class="text-[10px] text-slate-500 font-medium">TMS / SMMS / TDMS</span>
                    </div>
                </div>

                <div class="bg-white p-3 rounded border border-red-300 border-l-4 border-l-red-700 shadow-sm">
                    <div class="flex items-center justify-between text-red-700 text-[10px] font-bold uppercase tracking-wider">
                        <span>Critical Defects</span>
                        <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
                    </div>
                    <div class="mt-1 flex items-baseline justify-between">
                        <span class="text-xl font-bold font-mono text-red-700">${criticalList.length}</span>
                        <span class="text-[10px] text-red-600 font-medium">Immediate Block</span>
                    </div>
                </div>

                <div class="bg-white p-3 rounded border border-amber-300 border-l-4 border-l-amber-600 shadow-sm">
                    <div class="flex items-center justify-between text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                        <span>Overdue (>7 Days)</span>
                        <i class="fa-solid fa-clock-rotate-left text-amber-600"></i>
                    </div>
                    <div class="mt-1 flex items-baseline justify-between">
                        <span class="text-xl font-bold font-mono text-amber-800">${overdueCount}</span>
                        <span class="text-[10px] text-amber-700 font-medium">Safety Risk</span>
                    </div>
                </div>

                <div class="bg-white p-3 rounded border border-slate-300 border-l-4 border-l-blue-800 shadow-sm">
                    <div class="flex items-center justify-between text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        <span>Pending Demands</span>
                        <i class="fa-solid fa-hourglass-half text-blue-700"></i>
                    </div>
                    <div class="mt-1 flex items-baseline justify-between">
                        <span class="text-xl font-bold font-mono text-slate-900">${pendingBlocks}</span>
                        <span class="text-[10px] text-slate-500 font-medium">Awaiting Grant</span>
                    </div>
                </div>

                <div class="bg-white p-3 rounded border border-emerald-300 border-l-4 border-l-emerald-700 shadow-sm">
                    <div class="flex items-center justify-between text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        <span>Recommended Blocks</span>
                        <i class="fa-solid fa-calendar-check text-emerald-600"></i>
                    </div>
                    <div class="mt-1 flex items-baseline justify-between">
                        <span class="text-xl font-bold font-mono text-emerald-800">${recs.length}</span>
                        <span class="text-[10px] text-emerald-700 font-medium">Shadow Bundled</span>
                    </div>
                </div>

                <div class="bg-white p-3 rounded border border-purple-300 border-l-4 border-l-purple-700 shadow-sm">
                    <div class="flex items-center justify-between text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                        <span>Train Overlaps</span>
                        <i class="fa-solid fa-code-merge text-purple-600"></i>
                    </div>
                    <div class="mt-1 flex items-baseline justify-between">
                        <span class="text-xl font-bold font-mono text-purple-800">${conflicts.length}</span>
                        <span class="text-[10px] text-purple-700 font-medium">Deconflicted</span>
                    </div>
                </div>
            </div>

            <!-- SECTION 2: SECTION OVERVIEW & CORRIDOR TRACK SCHEMATIC STRIP -->
            <div class="bg-white rounded border border-slate-300 shadow-sm">
                <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 bg-blue-800 rounded-sm"></span>
                        <h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Section Corridor Schematic: Howrah – Burdwan Main Line (KM 20.000 – KM 80.000)
                        </h2>
                    </div>
                    <div class="flex items-center gap-3 text-[11px]">
                        <span class="flex items-center gap-1 text-slate-600">
                            <span class="w-2 h-2 rounded-sm bg-blue-600 inline-block"></span> Engineering (Track)
                        </span>
                        <span class="flex items-center gap-1 text-slate-600">
                            <span class="w-2 h-2 rounded-sm bg-amber-500 inline-block"></span> S&T (Signaling)
                        </span>
                        <span class="flex items-center gap-1 text-slate-600">
                            <span class="w-2 h-2 rounded-sm bg-purple-600 inline-block"></span> Traction (OHE)
                        </span>
                        <button onclick="switchTab('corridor-map')" class="text-blue-900 hover:text-blue-950 font-bold hover:underline">
                            Full Track Diagram <i class="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                    </div>
                </div>

                <div class="p-3.5 space-y-2">
                    <!-- Visual Linear Track Bar -->
                    <div class="relative bg-slate-900 rounded p-3 text-white overflow-x-auto">
                        <!-- Kilometer Scale -->
                        <div class="flex justify-between text-[10px] font-mono text-slate-400 border-b border-slate-700 pb-1 mb-2">
                            <span>KM 20.0 (Sheoraphuli/SRP)</span>
                            <span>KM 30.0 (CGR)</span>
                            <span>KM 40.0 (Bandel/BDC)</span>
                            <span>KM 50.0 (MUG)</span>
                            <span>KM 60.0 (BOI)</span>
                            <span>KM 70.0 (Memari/MYM)</span>
                            <span>KM 80.0 (Saktigarh/SKG)</span>
                        </div>

                        <!-- UP Track Line -->
                        <div class="relative h-6 flex items-center border-b border-slate-800">
                            <span class="w-16 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">UP LINE</span>
                            <div class="flex-1 relative h-1 bg-slate-700">
                                <!-- Track 1 Defect points -->
                                <div class="absolute left-[83%] -top-2.5 cursor-pointer" onclick="inspectTaskInPriority('UNIF-BDMS-002')" title="KM 70.230 - Signal Point Machine (Critical)">
                                    <span class="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-bold rounded font-mono">SIG @ KM 70.2</span>
                                </div>
                                <div class="absolute left-[84%] -top-2.5 cursor-pointer ml-14" onclick="inspectTaskInPriority('UNIF-BDMS-007')" title="KM 70.460 - Point Machine Crossover (Critical)">
                                    <span class="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded font-mono">S&T @ KM 70.4</span>
                                </div>
                            </div>
                        </div>

                        <!-- DOWN Track Line -->
                        <div class="relative h-6 flex items-center pt-1">
                            <span class="w-16 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">DN LINE</span>
                            <div class="flex-1 relative h-1 bg-slate-700">
                                <!-- Track 2 Defect points -->
                                <div class="absolute left-[0.2%] -top-2.5 cursor-pointer" onclick="inspectTaskInPriority('UNIF-BDMS-003')" title="KM 20.120 - OHE Catenary Wire">
                                    <span class="px-1.5 py-0.5 bg-purple-500 text-white text-[9px] font-bold rounded font-mono">OHE @ KM 20.1</span>
                                </div>
                                <div class="absolute left-[16.8%] -top-2.5 cursor-pointer" onclick="inspectTaskInPriority('UNIF-BDMS-001')" title="KM 30.121 - Rail Defect & Weld Crack (Critical)">
                                    <span class="px-1.5 py-0.5 bg-red-700 text-white text-[9px] font-bold rounded font-mono shadow-sm"><i class="fa-solid fa-triangle-exclamation mr-0.5 text-[8px]"></i>TRK @ KM 30.1 [CRIT]</span>
                                </div>
                                <div class="absolute left-[17.5%] -top-2.5 ml-28 cursor-pointer" onclick="inspectTaskInPriority('UNIF-BDMS-004')" title="KM 31.125 - Track Sleepers">
                                    <span class="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded font-mono">TRK @ KM 31.1</span>
                                </div>
                                <!-- Corridor Cluster Highlight Box -->
                                <div class="absolute left-[16%] -top-4 w-44 h-8 border-2 border-amber-400 bg-amber-400/10 rounded pointer-events-none" title="GRP-001 Recommended Block Corridor"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECTION 3: MAIN OPERATIONAL WORK DESK (2 COLUMN LAYOUT) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                <!-- Left Column (8 cols): Critical Maintenance & Recommended Blocks -->
                <div class="lg:col-span-8 space-y-4">
                    
                    <!-- Table A: Today's Critical Maintenance Requirements -->
                    <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                        <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                    <i class="fa-solid fa-triangle-exclamation text-red-700"></i>
                                    Critical Maintenance Demands (Immediate Block Allocation Mandated)
                                </h3>
                            </div>
                            <span class="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold border border-red-300">
                                ${criticalList.length} High-Risk Defects
                            </span>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th class="ir-table-th">Rank</th>
                                        <th class="ir-table-th">Demand ID</th>
                                        <th class="ir-table-th">Dept / Asset</th>
                                        <th class="ir-table-th">Track & KM</th>
                                        <th class="ir-table-th">Defect Classification</th>
                                        <th class="ir-table-th">Overdue</th>
                                        <th class="ir-table-th">Recurrence</th>
                                        <th class="ir-table-th text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${criticalList.map((item, idx) => {
                                        const hist = window.IR_WORKFLOW_STORE.getHistoryForTask(item.maintenance_id);
                                        return `
                                        <tr class="hover:bg-slate-50 transition border-b border-slate-200">
                                            <td class="ir-table-td font-mono font-bold text-slate-900">#${idx + 1}</td>
                                            <td class="ir-table-td font-mono font-bold text-blue-950">${item.maintenance_id}</td>
                                            <td class="ir-table-td">
                                                <span class="font-semibold text-slate-800">${item.department}</span>
                                                <span class="text-slate-400 font-mono text-[10px] block">${item.asset_id}</span>
                                            </td>
                                            <td class="ir-table-td">
                                                <span class="font-mono font-bold text-blue-900">KM ${item.location_km.toFixed(3)}</span>
                                                <span class="text-[10px] text-slate-500 font-mono block">${item.track_id}</span>
                                            </td>
                                            <td class="ir-table-td font-medium text-slate-900">${item.defect_type}</td>
                                            <td class="ir-table-td font-mono font-bold text-red-700">${item.overdue_days}d</td>
                                            <td class="ir-table-td">
                                                ${hist.total > 0
                                                    ? `<span class="text-[10px] font-mono text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-bold" title="${hist.counts.Critical} Critical occurrences">${hist.total} prev (${hist.counts.Critical}C)</span>`
                                                    : `<span class="text-[10px] text-slate-400">First Defect</span>`}
                                            </td>
                                            <td class="ir-table-td text-right">
                                                <button onclick="sendToPlanner('${item.maintenance_id}')" class="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px] uppercase tracking-wider shadow-sm transition">
                                                    Plan Block <i class="fa-solid fa-arrow-right ml-0.5 text-[9px]"></i>
                                                </button>
                                            </td>
                                        </tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Table B: DSS Recommended Composite Blocks -->
                    <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                        <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                    <i class="fa-solid fa-calendar-check text-blue-900"></i>
                                    DSS Recommended Maintenance Block Windows (Composite Bundles)
                                </h3>
                            </div>
                            <button onclick="switchTab('recommendations')" class="text-xs text-blue-900 hover:text-blue-950 font-bold hover:underline">
                                View Full Recommendation Dossier <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th class="ir-table-th">Block Proposal</th>
                                        <th class="ir-table-th">Corridor Stretch</th>
                                        <th class="ir-table-th">Target Slot</th>
                                        <th class="ir-table-th">Duration</th>
                                        <th class="ir-table-th">Traffic Conflict</th>
                                        <th class="ir-table-th">DSS Score</th>
                                        <th class="ir-table-th">Sanction</th>
                                        <th class="ir-table-th text-right">Desk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recs.map(rec => `
                                        <tr class="hover:bg-slate-50 transition border-b border-slate-200">
                                            <td class="ir-table-td font-mono font-bold text-blue-950">${rec.id}</td>
                                            <td class="ir-table-td">
                                                <span class="font-bold text-slate-800">${rec.group_name}</span>
                                                <span class="text-[10px] text-slate-500 block">${rec.departments.join(' + ')}</span>
                                            </td>
                                            <td class="ir-table-td font-mono font-bold text-slate-900">
                                                ${rec.start_time} – ${rec.end_time}
                                                <span class="text-[10px] text-slate-500 font-normal block">${rec.date}</span>
                                            </td>
                                            <td class="ir-table-td font-mono text-slate-800">${rec.duration_min} min</td>
                                            <td class="ir-table-td">
                                                ${rec.passenger_conflicts === 0 && rec.goods_conflicts === 0
                                                    ? `<span class="ir-badge ir-badge-low">Zero Conflict</span>`
                                                    : `<span class="ir-badge ir-badge-high">${rec.passenger_conflicts} Pass / ${rec.goods_conflicts} Freight</span>`}
                                            </td>
                                            <td class="ir-table-td font-mono font-bold text-blue-900 text-sm">${rec.score}/100</td>
                                            <td class="ir-table-td">
                                                <span class="ir-badge ${rec.status === 'Approved' ? 'ir-badge-approved' : (rec.status === 'Rejected' ? 'ir-badge-rejected' : 'ir-badge-pending')}">
                                                    ${rec.status}
                                                </span>
                                            </td>
                                            <td class="ir-table-td text-right">
                                                <button onclick="switchTab('approval')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded font-semibold text-[10px]">
                                                    Sign-Off Desk
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Right Column (4 cols): Train Conflict Radar & System Telemetry -->
                <div class="lg:col-span-4 space-y-4">
                    
                    <!-- Table C: Live COA Train Conflict Radar -->
                    <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                        <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                <i class="fa-solid fa-code-merge text-purple-700"></i>
                                COA Train Overlap Radar
                            </h3>
                            <button onclick="switchTab('conflict')" class="text-[11px] text-blue-900 font-bold hover:underline">
                                Conflict Matrix <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>

                        <div class="p-3 space-y-2.5">
                            ${conflicts.map(conf => `
                                <div class="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1 text-xs">
                                    <div class="flex justify-between items-center">
                                        <div class="flex items-center gap-1.5">
                                            <span class="ir-badge ${conf.train_type === 'Passenger' ? 'ir-badge-critical' : 'ir-badge-medium'}">
                                                ${conf.train_type}
                                            </span>
                                            <span class="font-bold text-slate-900">${conf.train_name}</span>
                                        </div>
                                        <span class="font-mono text-[10px] text-slate-500">${conf.train_id}</span>
                                    </div>
                                    <div class="text-[11px] text-slate-600 font-mono">
                                        Time: <strong class="text-slate-900">${conf.time}</strong> | Target: ${conf.maint_group.split(' ')[0]}
                                    </div>
                                    <div class="text-[11px] text-slate-700 bg-white p-1.5 rounded border border-slate-200">
                                        <span class="text-red-700 font-bold block"><i class="fa-solid fa-triangle-exclamation mr-1"></i> ${conf.impact}</span>
                                        <span class="text-emerald-800 font-medium block mt-0.5"><i class="fa-solid fa-check text-emerald-600 mr-1"></i> ${conf.resolution}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Panel D: Priority Class Distribution Doughnut -->
                    <div class="bg-white rounded border border-slate-300 shadow-sm p-3.5 space-y-3">
                        <div class="flex justify-between items-center border-b border-slate-200 pb-2">
                            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                Maintenance Demands by Urgency Class
                            </h3>
                            <span class="text-[10px] font-mono text-slate-500">${evaluatedTasks.length} Total</span>
                        </div>
                        <div class="relative flex justify-center items-center h-36">
                            <canvas id="priorityOverviewChart"></canvas>
                        </div>
                        <div class="grid grid-cols-4 gap-1 text-center text-[10px] border-t border-slate-200 pt-2 font-mono">
                            <div><span class="block text-red-700 font-bold">Critical</span>${criticalList.length}</div>
                            <div><span class="block text-amber-700 font-bold">High</span>${highList.length}</div>
                            <div><span class="block text-yellow-700 font-bold">Medium</span>${medList.length}</div>
                            <div><span class="block text-emerald-700 font-bold">Low</span>0</div>
                        </div>
                    </div>

                    <!-- Panel E: Legacy Interfaces & Data Connectors -->
                    <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                        <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                Integrated Railway Databases
                            </h3>
                            <button onclick="switchTab('system-status')" class="text-[11px] text-blue-900 font-bold hover:underline">
                                Interface Health <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                        <div class="p-2 divide-y divide-slate-100 text-xs">
                            ${sources.map(src => `
                                <div class="py-1.5 px-2 flex justify-between items-center">
                                    <div class="flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <div>
                                            <span class="font-bold text-slate-900 text-xs">${src.code}</span>
                                            <span class="text-[10px] text-slate-500 block leading-none">${src.name}</span>
                                        </div>
                                    </div>
                                    <div class="text-right text-[10px] font-mono">
                                        <span class="text-emerald-700 font-bold block">${src.status}</span>
                                        <span class="text-slate-400">${src.records} records</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
}

// PAGE 2: DATA INGESTION & INTEGRATION HUB
function renderDataHubPage() {
    const data = window.IR_MOCK_DATA;
    const sources = data.systemDataSources;
    const unified = window.IR_WORKFLOW_STORE.getUnifiedTasks();
    const rawData = data.rawDatasets;
    const logs = data.dataQualityLogs || [];

    return `
        <div class="space-y-4">
            <!-- Header Operational Banner -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-950 text-amber-400 border border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">CRIS INGESTION FEED</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Multi-Department Data Ingestion & Integration Hub</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Harmonizes disparate railway legacy data from <strong>TMS</strong> (Track), <strong>SMMS</strong> (Signals), <strong>TDMS</strong> (OHE/Traction), <strong>BDMS</strong> (Bridges), and <strong>COA</strong> into unified location-keyed maintenance demands.
                    </p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button onclick="openCsvUploadModal()" class="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded shadow-sm transition flex items-center gap-1.5">
                        <i class="fa-solid fa-file-arrow-up text-amber-400"></i> Ingest Departmental CSV
                    </button>
                </div>
            </div>

            <!-- Departmental Connectors Summary Strip -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                ${sources.map(src => `
                    <div class="bg-white p-2.5 rounded border border-slate-300 shadow-sm flex items-center justify-between text-xs">
                        <div>
                            <div class="flex items-center gap-1.5 font-bold font-mono text-slate-900">
                                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                ${src.code}
                            </div>
                            <span class="text-[10px] text-slate-500 block truncate max-w-[110px]">${src.department}</span>
                        </div>
                        <div class="text-right text-[10px] font-mono">
                            <span class="text-slate-900 font-bold block">${src.records} recs</span>
                            <span class="text-emerald-700 font-medium">${src.lastSync}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Main Data Hub Container -->
            <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                <!-- Subtab Navigation -->
                <div class="bg-slate-100 px-3.5 pt-2 border-b border-slate-300 flex justify-between items-center">
                    <div class="flex gap-1 text-xs font-semibold">
                        <button onclick="dataHubSubTab='unified'; renderPage('data-hub');" class="px-3 py-1.5 rounded-t border-t-2 ${dataHubSubTab === 'unified' ? 'bg-white text-blue-950 border-blue-900 font-bold' : 'text-slate-600 hover:text-slate-900 border-transparent'} transition">
                            Unified Demands Queue (${unified.length})
                        </button>
                        <button onclick="dataHubSubTab='raw'; renderPage('data-hub');" class="px-3 py-1.5 rounded-t border-t-2 ${dataHubSubTab === 'raw' ? 'bg-white text-blue-950 border-blue-900 font-bold' : 'text-slate-600 hover:text-slate-900 border-transparent'} transition">
                            Raw Source Feeds
                        </button>
                        <button onclick="dataHubSubTab='logs'; renderPage('data-hub');" class="px-3 py-1.5 rounded-t border-t-2 ${dataHubSubTab === 'logs' ? 'bg-white text-blue-950 border-blue-900 font-bold' : 'text-slate-600 hover:text-slate-900 border-transparent'} transition">
                            Data Normalization Logs
                        </button>
                    </div>
                    <span class="text-[10px] font-mono text-slate-500 pb-1">Primary Key: Location KM Normalizer</span>
                </div>

                <!-- Subtab 1: Unified Maintenance Table -->
                ${dataHubSubTab === 'unified' ? `
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th class="ir-table-th">Demand ID</th>
                                    <th class="ir-table-th">Source</th>
                                    <th class="ir-table-th">Dept / Asset</th>
                                    <th class="ir-table-th">Track & KM</th>
                                    <th class="ir-table-th">Defect Classification</th>
                                    <th class="ir-table-th">Severity</th>
                                    <th class="ir-table-th">Est. Duration</th>
                                    <th class="ir-table-th">Overdue</th>
                                    <th class="ir-table-th text-right">DSS Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${unified.map(item => `
                                    <tr class="hover:bg-slate-50 transition border-b border-slate-200">
                                        <td class="ir-table-td font-mono font-bold text-blue-950">${item.maintenance_id}</td>
                                        <td class="ir-table-td font-mono font-bold text-slate-700">${item.source_system}</td>
                                        <td class="ir-table-td">
                                            <span class="font-semibold text-slate-800">${item.department}</span>
                                            <span class="text-slate-400 font-mono text-[10px] block">${item.asset_id}</span>
                                        </td>
                                        <td class="ir-table-td">
                                            <span class="font-mono font-bold text-blue-900">KM ${item.location_km.toFixed(3)}</span>
                                            <span class="text-[10px] text-slate-500 font-mono block">${item.track_id}</span>
                                        </td>
                                        <td class="ir-table-td font-medium text-slate-900">${item.defect_type}</td>
                                        <td class="ir-table-td">
                                            <span class="ir-badge ${item.severity === 'Critical' ? 'ir-badge-critical' : (item.severity === 'High' ? 'ir-badge-high' : 'ir-badge-medium')}">
                                                ${item.severity}
                                            </span>
                                        </td>
                                        <td class="ir-table-td font-mono text-slate-800">${item.estimated_duration_min} min</td>
                                        <td class="ir-table-td font-mono font-bold text-red-700">${item.overdue_days}d</td>
                                        <td class="ir-table-td text-right space-x-1">
                                            <button onclick="inspectTaskInPriority('${item.maintenance_id}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded font-semibold text-[10px]">
                                                Priority Score
                                            </button>
                                            <button onclick="sendToPlanner('${item.maintenance_id}')" class="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px]">
                                                Plan Block
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}

                <!-- Subtab 2: Raw Source Inspector -->
                ${dataHubSubTab === 'raw' ? `
                    <div class="p-3.5 space-y-3">
                        <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <span class="text-xs font-bold text-slate-700">Select Departmental Feed:</span>
                            ${['TMS', 'SMMS', 'TDMS', 'BDMS', 'COA'].map(feed => `
                                <button onclick="rawSourceSubTab='${feed}'; renderPage('data-hub');" class="px-2.5 py-1 text-xs font-mono font-bold rounded border ${rawSourceSubTab === feed ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}">
                                    ${feed}
                                </button>
                            `).join('')}
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr>
                                        ${Object.keys(rawData[rawSourceSubTab]?.[0] || {}).map(k => `
                                            <th class="ir-table-th font-mono">${k}</th>
                                        `).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(rawData[rawSourceSubTab] || []).map(row => `
                                        <tr class="hover:bg-slate-50 border-b border-slate-200">
                                            ${Object.values(row).map(v => `
                                                <td class="ir-table-td font-mono">${v}</td>
                                            `).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- Subtab 3: Data Normalization Logs -->
                ${dataHubSubTab === 'logs' ? `
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th class="ir-table-th">Log ID</th>
                                    <th class="ir-table-th">Timestamp</th>
                                    <th class="ir-table-th">Operation Type</th>
                                    <th class="ir-table-th">Source Feed</th>
                                    <th class="ir-table-th">Audit Description</th>
                                    <th class="ir-table-th">Resolution Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logs.map(log => `
                                    <tr class="hover:bg-slate-50 border-b border-slate-200 text-xs">
                                        <td class="ir-table-td font-mono font-bold text-slate-800">${log.id}</td>
                                        <td class="ir-table-td font-mono text-slate-600">${log.timestamp}</td>
                                        <td class="ir-table-td font-bold text-blue-900">${log.type}</td>
                                        <td class="ir-table-td font-mono font-bold">${log.source}</td>
                                        <td class="ir-table-td text-slate-800">${log.detail}</td>
                                        <td class="ir-table-td">
                                            <span class="ir-badge ir-badge-low">${log.status}</span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// PAGE 3: DEPARTMENTAL MAINTENANCE DEMANDS REGISTER
function setMaintenanceFilter(dept, severity) {
    if (dept !== undefined) maintenanceDeptFilter = dept;
    if (severity !== undefined) maintenanceSeverityFilter = severity;
    renderPage('maintenance');
}

function renderMaintenancePage() {
    const allTasks = window.IR_WORKFLOW_STORE.getUnifiedTasks();
    let list = allTasks;

    if (maintenanceDeptFilter !== 'ALL') {
        list = list.filter(t => t.department.toLowerCase().includes(maintenanceDeptFilter.toLowerCase()));
    }
    if (maintenanceSeverityFilter !== 'ALL') {
        list = list.filter(t => t.severity.toLowerCase() === maintenanceSeverityFilter.toLowerCase());
    }

    return `
        <div class="space-y-4">
            <!-- Top Controls Bar -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                        <i class="fa-solid fa-wrench text-blue-900"></i>
                        Departmental Maintenance Demands & Defect Register
                    </h2>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Comprehensive registry of permanent way track defects, signalling relays, and traction catenary wear with recurrence risk flags.
                    </p>
                </div>
                <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded font-bold">
                        Critical: ${allTasks.filter(t => t.severity === 'Critical').length}
                    </span>
                    <span class="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded font-bold">
                        High: ${allTasks.filter(t => t.severity === 'High').length}
                    </span>
                    <span class="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-1 rounded font-bold">
                        Total Ingested: ${allTasks.length}
                    </span>
                </div>
            </div>

            <!-- Operational Filter Bar -->
            <div class="bg-white rounded border border-slate-300 p-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                <!-- Department Filters -->
                <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-slate-500 font-bold uppercase text-[10px] mr-1">Department:</span>
                    <button onclick="setMaintenanceFilter('ALL', undefined)" class="px-2.5 py-1 rounded border font-semibold ${maintenanceDeptFilter === 'ALL' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}">
                        All Depts (${allTasks.length})
                    </button>
                    <button onclick="setMaintenanceFilter('Engineering', undefined)" class="px-2.5 py-1 rounded border font-semibold ${maintenanceDeptFilter === 'Engineering' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}">
                        Engineering (${allTasks.filter(t => t.department === 'Engineering').length})
                    </button>
                    <button onclick="setMaintenanceFilter('S&T', undefined)" class="px-2.5 py-1 rounded border font-semibold ${maintenanceDeptFilter === 'S&T' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}">
                        S&T (${allTasks.filter(t => t.department === 'S&T').length})
                    </button>
                    <button onclick="setMaintenanceFilter('Traction', undefined)" class="px-2.5 py-1 rounded border font-semibold ${maintenanceDeptFilter === 'Traction' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}">
                        Traction (${allTasks.filter(t => t.department === 'Traction').length})
                    </button>
                </div>

                <!-- Severity Filters -->
                <div class="flex items-center gap-1.5">
                    <span class="text-slate-500 font-bold uppercase text-[10px] mr-1">Severity:</span>
                    <button onclick="setMaintenanceFilter(undefined, 'ALL')" class="px-2 py-1 rounded border font-mono font-bold ${maintenanceSeverityFilter === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'}">
                        ALL
                    </button>
                    <button onclick="setMaintenanceFilter(undefined, 'Critical')" class="px-2 py-1 rounded border font-mono font-bold ${maintenanceSeverityFilter === 'Critical' ? 'bg-red-700 text-white border-red-700' : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'}">
                        CRITICAL
                    </button>
                    <button onclick="setMaintenanceFilter(undefined, 'High')" class="px-2 py-1 rounded border font-mono font-bold ${maintenanceSeverityFilter === 'High' ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'}">
                        HIGH
                    </button>
                    <button onclick="setMaintenanceFilter(undefined, 'Medium')" class="px-2 py-1 rounded border font-mono font-bold ${maintenanceSeverityFilter === 'Medium' ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'}">
                        MEDIUM
                    </button>
                </div>
            </div>

            <!-- Maintenance Records Table -->
            <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="ir-table-th">Demand ID</th>
                                <th class="ir-table-th">Source</th>
                                <th class="ir-table-th">Department</th>
                                <th class="ir-table-th">Asset ID</th>
                                <th class="ir-table-th">Track & Section</th>
                                <th class="ir-table-th">Location KM</th>
                                <th class="ir-table-th">Defect / Work Type</th>
                                <th class="ir-table-th">Severity</th>
                                <th class="ir-table-th">Overdue</th>
                                <th class="ir-table-th">Historical Recurrence</th>
                                <th class="ir-table-th text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.map(item => {
                                const hist = window.IR_WORKFLOW_STORE.getHistoryForTask(item.maintenance_id);
                                const histBadge = hist.total > 0
                                    ? `<span class="text-[10px] font-mono text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-bold cursor-pointer" title="C:${hist.counts.Critical} H:${hist.counts.High} M:${hist.counts.Medium} | Last: ${hist.lastOccurrence}">
                                        ${hist.total} prev (${hist.counts.Critical}C/${hist.counts.High}H)
                                       </span>`
                                    : `<span class="text-[10px] text-slate-400 font-mono">First Defect</span>`;
                                return `
                                <tr class="hover:bg-slate-50 border-b border-slate-200 transition">
                                    <td class="ir-table-td font-mono font-bold text-blue-950">${item.maintenance_id}</td>
                                    <td class="ir-table-td font-mono font-bold text-slate-700">${item.source_system}</td>
                                    <td class="ir-table-td font-semibold text-slate-800">${item.department}</td>
                                    <td class="ir-table-td font-mono">${item.asset_id}</td>
                                    <td class="ir-table-td font-mono text-slate-600">
                                        <span class="font-bold text-slate-800 block">${item.track_id}</span>
                                        <span class="text-[10px] text-slate-400 block">${item.section.split(' ')[0]}</span>
                                    </td>
                                    <td class="ir-table-td font-mono font-bold text-blue-900">KM ${item.location_km.toFixed(3)}</td>
                                    <td class="ir-table-td font-medium text-slate-900">
                                        ${item.defect_type}
                                        <span class="text-[10px] text-slate-500 block font-normal">${item.work_type} Required</span>
                                    </td>
                                    <td class="ir-table-td">
                                        <span class="ir-badge ${item.severity === 'Critical' ? 'ir-badge-critical' : (item.severity === 'High' ? 'ir-badge-high' : 'ir-badge-medium')}">
                                            ${item.severity}
                                        </span>
                                    </td>
                                    <td class="ir-table-td font-mono font-bold text-red-700">${item.overdue_days}d</td>
                                    <td class="ir-table-td">${histBadge}</td>
                                    <td class="ir-table-td text-right">
                                        <button onclick="sendToPlanner('${item.maintenance_id}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px] uppercase tracking-wider shadow-sm transition">
                                            Dispatch to Planner <i class="fa-solid fa-arrow-right ml-0.5 text-[9px]"></i>
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

// PAGE 4: PRIORITY INTELLIGENCE & MULTI-FACTOR SCORING
function renderPriorityPage() {
    const evaluatedList = window.IR_WORKFLOW_STORE.getEvaluatedPriorityTasks();

    return `
        <div class="space-y-4">
            <!-- Header Explanatory Strip -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-950 text-amber-400 border border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">DETERMINISTIC DSS MATRIX</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">AI Priority Intelligence & Multi-Factor Risk Scoring Engine</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Deterministic mathematical model (0–100 points) evaluating defect severity, overdue elapsed days, asset criticality, postponement risk, and historical recurrence frequency.
                    </p>
                </div>
            </div>

            <!-- Mathematical Weight Reference Banner -->
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                <div class="bg-white p-2.5 rounded border border-slate-300 text-center shadow-sm">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">1. Severity</span>
                    <span class="font-mono font-bold text-blue-950 text-sm">30 pts max</span>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Weight: 30%</span>
                </div>
                <div class="bg-white p-2.5 rounded border border-slate-300 text-center shadow-sm">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">2. Overdue</span>
                    <span class="font-mono font-bold text-blue-950 text-sm">13 pts max</span>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Norm: 15 days</span>
                </div>
                <div class="bg-white p-2.5 rounded border border-slate-300 text-center shadow-sm">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">3. Criticality</span>
                    <span class="font-mono font-bold text-blue-950 text-sm">13 pts max</span>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Rail/Signal/OHE</span>
                </div>
                <div class="bg-white p-2.5 rounded border border-slate-300 text-center shadow-sm">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">4. Recurrence</span>
                    <span class="font-mono font-bold text-blue-950 text-sm">12 pts max</span>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Live Count</span>
                </div>
                <div class="bg-white p-2.5 rounded border border-slate-300 text-center shadow-sm">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">5. Postponement</span>
                    <span class="font-mono font-bold text-blue-950 text-sm">9 pts max</span>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Deferred Risk</span>
                </div>
                <div class="bg-white p-2.5 rounded border border-slate-300 text-center shadow-sm">
                    <span class="text-[10px] font-bold text-slate-500 uppercase block">6. Urgency</span>
                    <span class="font-mono font-bold text-blue-950 text-sm">9 pts max</span>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Block Mandate</span>
                </div>
                <div class="bg-white p-2.5 rounded border border-slate-300 text-center shadow-sm">
                    <span class="text-[10px] font-bold text-purple-700 uppercase block">7. History Boost</span>
                    <span class="font-mono font-bold text-purple-900 text-sm">14 pts max</span>
                    <span class="text-[9px] text-purple-600 block mt-0.5">Critical Past Log</span>
                </div>
            </div>

            <!-- Priority Matrix Table -->
            <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Ranked Priority Assessment Register
                    </h3>
                    <span class="text-[10px] font-mono text-slate-600">Threshold: Critical &ge; 85 | High &ge; 65 | Medium &ge; 40</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="ir-table-th">Rank & Score</th>
                                <th class="ir-table-th">Demand ID</th>
                                <th class="ir-table-th">Urgency Class</th>
                                <th class="ir-table-th">Dept / Asset</th>
                                <th class="ir-table-th">Track & KM</th>
                                <th class="ir-table-th">Defect Classification</th>
                                <th class="ir-table-th">Overdue</th>
                                <th class="ir-table-th">Historical Recurrence</th>
                                <th class="ir-table-th text-right">Audit & Planning Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${evaluatedList.map((item, idx) => {
                                const pi = item.priorityInfo;
                                const histBadge = pi.histTotal > 0
                                    ? `<span class="text-[10px] font-mono text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-bold" title="Recurrence: ${pi.recurrenceLevel} | Last: ${pi.lastOccurrenceDate}">
                                        ${pi.histTotal} past (${pi.histCritical}C/${pi.histHigh}H)
                                       </span>`
                                    : `<span class="text-[10px] text-slate-400 font-mono">First Defect</span>`;
                                return `
                                <tr class="hover:bg-slate-50 border-b border-slate-200 transition">
                                    <td class="ir-table-td">
                                        <div class="flex items-baseline gap-1.5">
                                            <span class="font-mono font-bold text-slate-400 text-xs">#${idx + 1}</span>
                                            <span class="font-mono font-bold text-blue-950 text-base">${pi.totalScore}</span>
                                            <span class="text-[10px] text-slate-400 font-mono">/100</span>
                                        </div>
                                    </td>
                                    <td class="ir-table-td font-mono font-bold text-blue-950">${item.maintenance_id}</td>
                                    <td class="ir-table-td">
                                        <span class="ir-badge ${pi.priorityClass === 'Critical' ? 'ir-badge-critical' : (pi.priorityClass === 'High' ? 'ir-badge-high' : 'ir-badge-medium')}">
                                            ${pi.priorityClass}
                                        </span>
                                    </td>
                                    <td class="ir-table-td">
                                        <span class="font-semibold text-slate-800">${item.department}</span>
                                        <span class="text-[10px] font-mono text-slate-400 block">${item.asset_id}</span>
                                    </td>
                                    <td class="ir-table-td">
                                        <span class="font-mono font-bold text-blue-900">KM ${item.location_km.toFixed(3)}</span>
                                        <span class="text-[10px] font-mono text-slate-500 block">${item.track_id}</span>
                                    </td>
                                    <td class="ir-table-td font-medium text-slate-900">${item.defect_type}</td>
                                    <td class="ir-table-td font-mono font-bold text-red-700">${item.overdue_days}d</td>
                                    <td class="ir-table-td">${histBadge}</td>
                                    <td class="ir-table-td text-right space-x-1">
                                        <button onclick="openPriorityModal('${item.maintenance_id}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded font-semibold text-[10px]">
                                            Factor Breakdown
                                        </button>
                                        <button onclick="sendToPlanner('${item.maintenance_id}')" class="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px]">
                                            Plan Block <i class="fa-solid fa-arrow-right ml-0.5 text-[9px]"></i>
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


// PAGE 5: COA TRAIN OPERATIONS TIMETABLE
function renderCoaPage() {
    const trains = window.IR_MOCK_DATA.coaTrainSchedules;
    return `
        <div class="space-y-4">
            <!-- Header Strip -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">COA FEED</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Control Office Application (COA) Train Schedule Timetable</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Live section timetable for Howrah – Burdwan Main Line. Used by the conflict engine to identify maintenance gaps and prevent passenger delays.
                    </p>
                </div>
                <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-1 rounded font-bold">
                        Passenger: ${trains.filter(t => t.train_type === 'Passenger').length}
                    </span>
                    <span class="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded font-bold">
                        Freight: ${trains.filter(t => t.train_type === 'Goods').length}
                    </span>
                    <span class="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-1 rounded font-bold">
                        Block Openings: ${trains.filter(t => t.train_type === 'Block Window').length}
                    </span>
                </div>
            </div>

            <!-- Timetable Master Table -->
            <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Master Section Train Path Chart (24-Hour Operations)
                    </h3>
                    <span class="text-[10px] font-mono text-slate-500">Live COA Interlocking Feed Active</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="ir-table-th">Train No</th>
                                <th class="ir-table-th">Train Name</th>
                                <th class="ir-table-th">Classification</th>
                                <th class="ir-table-th">Date</th>
                                <th class="ir-table-th">Section Entry</th>
                                <th class="ir-table-th">Section Exit</th>
                                <th class="ir-table-th">Direction</th>
                                <th class="ir-table-th">Route KM Span</th>
                                <th class="ir-table-th">Traffic Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${trains.map(t => `
                                <tr class="hover:bg-slate-50 border-b border-slate-200 transition">
                                    <td class="ir-table-td font-mono font-bold text-blue-950">${t.train_id}</td>
                                    <td class="ir-table-td font-bold text-slate-900">${t.train_name}</td>
                                    <td class="ir-table-td">
                                        <span class="ir-badge ${t.train_type === 'Passenger' ? 'ir-badge-critical' : (t.train_type === 'Goods' ? 'ir-badge-high' : 'ir-badge-low')}">
                                            ${t.train_type}
                                        </span>
                                    </td>
                                    <td class="ir-table-td font-mono text-slate-700">${t.date}</td>
                                    <td class="ir-table-td font-mono font-bold text-slate-900">${t.start_time}</td>
                                    <td class="ir-table-td font-mono font-bold text-slate-900">${t.end_time}</td>
                                    <td class="ir-table-td font-mono font-bold text-slate-700">${t.direction}</td>
                                    <td class="ir-table-td font-mono text-slate-600">${t.route}</td>
                                    <td class="ir-table-td font-semibold text-slate-800">${t.traffic_level}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// PAGE 6: TRAIN-MAINTENANCE CONFLICT DETECTION ENGINE
function renderConflictPage() {
    const conflicts = window.IR_MOCK_DATA.recentConflicts;
    return `
        <div class="space-y-4">
            <!-- Header Strip -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-red-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">SAFETY ENGINE</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Train & Maintenance Conflict Detection Matrix</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Detects temporal and spatial overlaps between scheduled train services and proposed maintenance block requests along common tracks.
                    </p>
                </div>
                <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded font-bold">
                        Conflicts Analyzed: ${conflicts.length}
                    </span>
                    <span class="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded font-bold">
                        Resolutions Active: ${conflicts.length}
                    </span>
                </div>
            </div>

            <!-- Conflict Matrix Table -->
            <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Active Schedule Collision Register & Deconfliction Plans
                    </h3>
                    <span class="text-[10px] font-mono text-slate-500">Auto-Resolved via Shadow Block Windows</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="ir-table-th">Conflict ID</th>
                                <th class="ir-table-th">Train Involved</th>
                                <th class="ir-table-th">Category</th>
                                <th class="ir-table-th">Target Corridor Group</th>
                                <th class="ir-table-th">Overlap Window</th>
                                <th class="ir-table-th">Disruption Severity</th>
                                <th class="ir-table-th">Traffic Impact Assessment</th>
                                <th class="ir-table-th">DSS Advisory Resolution</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${conflicts.map(conf => `
                                <tr class="hover:bg-slate-50 border-b border-slate-200 transition">
                                    <td class="ir-table-td font-mono font-bold text-blue-950">${conf.id}</td>
                                    <td class="ir-table-td">
                                        <span class="font-bold text-slate-900 block">${conf.train_name}</span>
                                        <span class="text-[10px] font-mono text-slate-500">${conf.train_id}</span>
                                    </td>
                                    <td class="ir-table-td">
                                        <span class="ir-badge ${conf.train_type === 'Passenger' ? 'ir-badge-critical' : 'ir-badge-high'}">
                                            ${conf.train_type}
                                        </span>
                                    </td>
                                    <td class="ir-table-td font-mono text-slate-800">${conf.maint_group}</td>
                                    <td class="ir-table-td font-mono font-bold text-slate-900">${conf.time}</td>
                                    <td class="ir-table-td">
                                        <span class="ir-badge ir-badge-critical">${conf.severity}</span>
                                    </td>
                                    <td class="ir-table-td font-medium text-red-700">
                                        <i class="fa-solid fa-triangle-exclamation mr-1 text-[10px]"></i>
                                        ${conf.impact}
                                    </td>
                                    <td class="ir-table-td">
                                        <div class="p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 font-medium">
                                            <i class="fa-solid fa-check text-emerald-600 mr-1"></i>
                                            ${conf.resolution}
                                        </div>
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

// PAGE 7: SMART COMPOSITE BLOCK PLANNER
function renderSmartPlannerPage() {
    const dynamicGroups = window.IR_WORKFLOW_STORE.getDynamicGroups();
    const selGroupId = window.IR_WORKFLOW_STORE.selectedGroupId;
    const activeGroup = dynamicGroups.find(g => g.groupId === selGroupId) || dynamicGroups[0];
    const sample = window.IR_MOCK_DATA.sampleGroupData;

    const durInfo = window.IR_BLOCK_PLANNER_SERVICE.calculateDurationBreakdown(activeGroup.tasks, 30);
    const bestRec = sample.candidates[0];
    const explanationBullets = window.IR_BLOCK_PLANNER_SERVICE.generateBlockExplanation(bestRec, sample, durInfo);

    return `
        <div class="space-y-4">
            <!-- Header Strip -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-950 text-amber-400 border border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">CORRIDOR BUNDLING ENGINE</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Smart Composite Block Planner & Conflict Optimizer</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Clusters adjacent cross-departmental maintenance demands within a 1.0 KM proximity corridor, calculates safety buffers, and deconflicts with COA train paths.
                    </p>
                </div>
            </div>

            <!-- Railway 7-Step Planning Stepper -->
            <div class="bg-white rounded border border-slate-300 p-3 shadow-sm">
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Operating Department Block Sizing & Sanction Workflow
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-center text-xs font-mono">
                    <div class="p-1.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-bold">1. Ingest Demands</div>
                    <div class="p-1.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-bold">2. Proximity Filter</div>
                    <div class="p-1.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-bold">3. Shadow Cluster</div>
                    <div class="p-1.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-bold">4. Duration Math</div>
                    <div class="p-1.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-bold">5. COA Deconflict</div>
                    <div class="p-1.5 bg-slate-100 rounded border border-slate-200 text-slate-700 font-bold">6. Evaluate Slots</div>
                    <div class="p-1.5 bg-blue-900 rounded border border-blue-950 text-white font-bold">7. Officer Sanction</div>
                </div>
            </div>

            <!-- Corridor Group Selector Bar -->
            <div class="bg-slate-900 text-white p-3 rounded border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                <div>
                    <span class="text-[9px] text-amber-400 font-mono font-bold uppercase tracking-widest block">ACTIVE CORRIDOR CLUSTER</span>
                    <h3 class="font-bold text-xs text-white font-mono">${activeGroup.groupName}</h3>
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-xs text-slate-300 font-medium">Select Cluster:</label>
                    <select onchange="changePlannerGroup(this.value)" class="bg-slate-800 border border-slate-700 text-amber-400 text-xs rounded px-2.5 py-1 font-mono font-bold">
                        ${dynamicGroups.map(g => `
                            <option value="${g.groupId}" ${g.groupId === activeGroup.groupId ? 'selected' : ''}>
                                ${g.groupId}: KM ${g.minKm.toFixed(2)}–${g.maxKm.toFixed(2)} (${g.taskCount} Tasks)
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>

            <!-- Cluster Work Activities & Sizing Math -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                <!-- Left (7 cols): Bundled Demands Table -->
                <div class="lg:col-span-7 bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                    <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Coordinated Departmental Maintenance Tasks (${activeGroup.taskCount})
                        </h3>
                        <span class="ir-badge ir-badge-approved">Multi-Dept Compatible</span>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th class="ir-table-th">Demand ID</th>
                                    <th class="ir-table-th">Dept / Feed</th>
                                    <th class="ir-table-th">KM Post</th>
                                    <th class="ir-table-th">Defect Classification</th>
                                    <th class="ir-table-th">Required Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${activeGroup.tasks.map(act => `
                                    <tr class="hover:bg-slate-50 border-b border-slate-200 transition">
                                        <td class="ir-table-td font-mono font-bold text-blue-950">${act.maintenance_id}</td>
                                        <td class="ir-table-td">
                                            <span class="font-semibold text-slate-800">${act.department}</span>
                                            <span class="text-[10px] text-slate-400 font-mono block">${act.source_system}</span>
                                        </td>
                                        <td class="ir-table-td font-mono font-bold text-blue-900">KM ${act.location_km.toFixed(3)}</td>
                                        <td class="ir-table-td font-medium text-slate-900">${act.defect_type}</td>
                                        <td class="ir-table-td font-mono font-bold text-slate-900">${act.estimated_duration_min} min</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Right (5 cols): Mathematical Duration Breakdown Panel -->
                <div class="lg:col-span-5 bg-white rounded border border-slate-300 shadow-sm p-3.5 space-y-3">
                    <div class="border-b border-slate-200 pb-2">
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                            <i class="fa-solid fa-calculator text-blue-900"></i>
                            Composite Duration & Safety Sizing Math
                        </h3>
                    </div>

                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between items-center py-1 border-b border-slate-100">
                            <span class="text-slate-600">Sum of Independent Demands:</span>
                            <span class="font-mono font-bold text-slate-900">${durInfo.workSumMin} min</span>
                        </div>
                        <div class="flex justify-between items-center py-1 border-b border-slate-100">
                            <span class="text-slate-600">Parallel Coordination Critical Path:</span>
                            <span class="font-mono font-bold text-blue-900">${durInfo.maxSingleMin} min</span>
                        </div>
                        <div class="flex justify-between items-center py-1 border-b border-slate-100">
                            <span class="text-slate-600">Statutory G&SR Safety Buffer:</span>
                            <span class="font-mono font-bold text-amber-700">+30 min</span>
                        </div>
                        <div class="flex justify-between items-center py-1.5 bg-blue-50/70 px-2 rounded border border-blue-200">
                            <span class="font-bold text-blue-950">Net Block Window Required:</span>
                            <span class="font-mono font-extrabold text-blue-950 text-sm">${durInfo.totalRequiredMin} min (${(durInfo.totalRequiredMin / 60).toFixed(1)} hrs)</span>
                        </div>
                    </div>

                    <div class="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600">
                        <p class="leading-snug">
                            <strong>Corridor Shadow Savings:</strong> Bundling Engineering and S&T works concurrently saves <strong class="text-emerald-700">${Math.max(0, durInfo.workSumMin - durInfo.maxSingleMin)} minutes</strong> of track possession compared to isolated single-department blocks.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Ranked Candidate Windows Table -->
            <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        <i class="fa-solid fa-list-ol text-blue-900"></i>
                        Ranked Candidate Block Windows (Evaluated by COA Conflict Engine)
                    </h3>
                    <span class="text-[10px] font-mono text-slate-500">Corridor Window Search (24-Hour Scope)</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="ir-table-th">Rank</th>
                                <th class="ir-table-th">Time Window</th>
                                <th class="ir-table-th">Available Span</th>
                                <th class="ir-table-th">Passenger Overlap</th>
                                <th class="ir-table-th">Freight Regulation</th>
                                <th class="ir-table-th">Feasibility</th>
                                <th class="ir-table-th">DSS Score</th>
                                <th class="ir-table-th">Operational Justification</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sample.candidates.map(cand => `
                                <tr class="hover:bg-slate-50 border-b border-slate-200 transition ${cand.rank === 1 ? 'bg-amber-50/40' : ''}">
                                    <td class="ir-table-td font-mono font-bold">
                                        <span class="w-5 h-5 rounded-full inline-flex items-center justify-center text-xs ${cand.rank === 1 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'}">
                                            ${cand.rank}
                                        </span>
                                    </td>
                                    <td class="ir-table-td font-mono font-bold text-slate-900 text-xs">${cand.window}</td>
                                    <td class="ir-table-td font-mono text-slate-800">${cand.duration}</td>
                                    <td class="ir-table-td font-mono ${cand.passengerConflicts > 0 ? 'text-red-700 font-bold' : 'text-emerald-700 font-medium'}">
                                        ${cand.passengerConflicts} Trains
                                    </td>
                                    <td class="ir-table-td font-mono ${cand.goodsConflicts > 0 ? 'text-amber-700' : 'text-slate-600'}">
                                        ${cand.goodsConflicts} Trains
                                    </td>
                                    <td class="ir-table-td">
                                        <span class="ir-badge ${cand.feasible ? 'ir-badge-approved' : 'ir-badge-rejected'}">
                                            ${cand.badge}
                                        </span>
                                    </td>
                                    <td class="ir-table-td font-mono font-bold text-blue-950 text-sm">${cand.score}/100</td>
                                    <td class="ir-table-td text-slate-700 text-xs">${cand.reason}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Decision Support Explanation & Officer Sign-off Desk -->
            <div class="bg-white rounded border border-slate-300 shadow-sm p-4 space-y-4">
                <div class="border-b border-slate-200 pb-2">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Decision Support System Justification & Officer Sanction Desk
                    </h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <!-- Left: Operational Explanation -->
                    <div class="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                        <h4 class="font-bold text-slate-900 flex items-center gap-1.5">
                            <i class="fa-solid fa-clipboard-check text-blue-900"></i>
                            Why Was Block Slot 04:30 – 08:00 Recommended?
                        </h4>
                        <ul class="space-y-1 text-slate-700 list-disc pl-4 leading-relaxed">
                            ${explanationBullets.map(b => `<li>${b}</li>`).join('')}
                        </ul>
                    </div>

                    <!-- Right: Operating Officer Sanction Desk -->
                    <div class="p-3 bg-slate-50 rounded border border-slate-200 space-y-2.5">
                        <h4 class="font-bold text-slate-900 flex items-center gap-1.5">
                            <i class="fa-solid fa-signature text-emerald-800"></i>
                            Divisional Operating Officer (DOM) Sanction Desk
                        </h4>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-700 mb-1">Operating Remarks / Special Caution Orders</label>
                            <textarea id="planner-remarks" rows="2" placeholder="e.g. Caution order 30 kmph on adjacent line, Section Controller alerted..." class="w-full border border-slate-300 rounded p-2 text-xs bg-white"></textarea>
                        </div>
                        <div class="flex items-center gap-2 pt-1">
                            <button onclick="handleOfficerAction('Approved')" class="flex-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded shadow-sm transition flex justify-center items-center gap-1.5">
                                <i class="fa-solid fa-check"></i> GRANT BLOCK SANCTION
                            </button>
                            <button onclick="handleOfficerAction('Rejected')" class="flex-1 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded shadow-sm transition flex justify-center items-center gap-1.5">
                                <i class="fa-solid fa-xmark"></i> DECLINE SANCTION
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Statutory Safety Declaration -->
                <div class="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2.5">
                    <i class="fa-solid fa-shield-halved text-amber-700 text-base flex-shrink-0"></i>
                    <p class="leading-snug">
                        <strong>STATUTORY COMPLIANCE:</strong> In accordance with Indian Railways General and Subsidiary Rules (G&SR), the AI Automatic Block Planning System functions solely as a Decision-Support System (DSS). The line block becomes operative only after physical disconnection memo issuance and Station Master interlocking block grant.
                    </p>
                </div>
            </div>
        </div>
    `;
}

// PAGE 8: RECOMMENDED COMPOSITE BLOCKS DOSSIER
function renderRecommendationsPage() {
    const recs = window.IR_MOCK_DATA.blockRecommendations;
    return `
        <div class="space-y-4">
            <!-- Header Strip -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">RECOMMENDATIONS</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">DSS Recommended Maintenance Block Dossier</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Formal operational proposals for composite corridor blocks evaluated against section train density and past work durations.
                    </p>
                </div>
                <button onclick="switchTab('approval')" class="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded shadow-sm transition flex items-center gap-1.5">
                    <i class="fa-solid fa-signature"></i> Go to Officer Sign-Off Desk
                </button>
            </div>

            <!-- Recommendations Table -->
            <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Proposed Corridor Maintenance Block Windows
                    </h3>
                    <span class="text-[10px] font-mono text-slate-500">${recs.length} Proposals Formulated</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="ir-table-th">Proposal Ref</th>
                                <th class="ir-table-th">Target Corridor & Stretches</th>
                                <th class="ir-table-th">Target Date</th>
                                <th class="ir-table-th">Proposed Block Window</th>
                                <th class="ir-table-th">Duration</th>
                                <th class="ir-table-th">Traffic Feasibility</th>
                                <th class="ir-table-th">DSS Score</th>
                                <th class="ir-table-th">Status</th>
                                <th class="ir-table-th text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recs.map(rec => `
                                <tr class="hover:bg-slate-50 border-b border-slate-200 transition">
                                    <td class="ir-table-td font-mono font-bold text-blue-950">${rec.id}</td>
                                    <td class="ir-table-td">
                                        <span class="font-bold text-slate-900 block">${rec.group_name}</span>
                                        <span class="text-[10px] text-slate-500 block font-mono">Depts: ${rec.departments.join(', ')} | Demands: ${rec.maint_ids.join(', ')}</span>
                                    </td>
                                    <td class="ir-table-td font-mono text-slate-700">${rec.date}</td>
                                    <td class="ir-table-td font-mono font-bold text-slate-900">${rec.start_time} – ${rec.end_time}</td>
                                    <td class="ir-table-td font-mono text-slate-800">${rec.duration_min} min</td>
                                    <td class="ir-table-td">
                                        ${rec.passenger_conflicts === 0 && rec.goods_conflicts === 0
                                            ? `<span class="ir-badge ir-badge-low">Zero Conflict</span>`
                                            : `<span class="ir-badge ir-badge-high">${rec.passenger_conflicts} Pass / ${rec.goods_conflicts} Freight</span>`}
                                    </td>
                                    <td class="ir-table-td font-mono font-bold text-blue-950 text-sm">${rec.score}/100</td>
                                    <td class="ir-table-td">
                                        <span class="ir-badge ${rec.status === 'Approved' ? 'ir-badge-approved' : (rec.status === 'Rejected' ? 'ir-badge-rejected' : 'ir-badge-pending')}">
                                            ${rec.status}
                                        </span>
                                    </td>
                                    <td class="ir-table-td text-right">
                                        <button onclick="handleOfficerActionForRec('${rec.id}', 'Approved')" class="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[10px]">
                                            Sanction
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

// PAGE 9: DIVISIONAL OPERATING OFFICER SIGN-OFF DESK
function renderApprovalPage() {
    const recs = window.IR_MOCK_DATA.blockRecommendations;
    return `
        <div class="space-y-4">
            <!-- Header Strip -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">SANCTION DESK</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Divisional Operating Officer Approval & Sanction Desk</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Formal electronic grant and audit trail for railway maintenance block possessions in Howrah Division.
                    </p>
                </div>
            </div>

            <!-- Approval Queue Cards -->
            <div class="space-y-3">
                ${recs.map(rec => `
                    <div class="bg-white rounded border border-slate-300 shadow-sm p-4 space-y-3">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-2.5 gap-2">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="font-mono text-xs font-bold text-blue-950">${rec.id}</span>
                                    <span class="ir-badge ${rec.status === 'Approved' ? 'ir-badge-approved' : (rec.status === 'Rejected' ? 'ir-badge-rejected' : 'ir-badge-pending')}">
                                        ${rec.status}
                                    </span>
                                </div>
                                <h3 class="font-bold text-slate-900 text-xs mt-0.5">${rec.group_name}</h3>
                            </div>
                            <div class="text-right text-xs font-mono">
                                <span class="text-slate-500">Scheduled Date:</span>
                                <strong class="text-slate-900">${rec.date}</strong> | 
                                <span class="text-slate-500">Slot:</span>
                                <strong class="text-slate-900">${rec.start_time} – ${rec.end_time} (${rec.duration_min} min)</strong>
                            </div>
                        </div>

                        <div class="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                            <span class="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">DSS Recommendation Rationale:</span>
                            <p class="text-slate-800 leading-relaxed">${rec.explanation}</p>
                        </div>

                        ${rec.officer_comments ? `
                            <div class="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-900 space-y-0.5 font-mono">
                                <span class="font-bold block uppercase tracking-wider text-[10px]">Officer Sanction Endorsement (${rec.officer_name || 'DOM'}):</span>
                                <p class="font-medium font-sans">"${rec.officer_comments}"</p>
                                <span class="text-[10px] text-emerald-700 block">Sanctioned At: ${rec.decided_at || 'Recorded on Dashboard'}</span>
                            </div>
                        ` : ''}

                        <div class="flex justify-end gap-2 pt-1 border-t border-slate-100">
                            <button onclick="handleOfficerActionForRec('${rec.id}', 'Approved')" class="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded shadow-sm flex items-center gap-1">
                                <i class="fa-solid fa-check"></i> SANCTION BLOCK
                            </button>
                            <button onclick="handleOfficerActionForRec('${rec.id}', 'Rejected')" class="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded shadow-sm flex items-center gap-1">
                                <i class="fa-solid fa-xmark"></i> REJECT
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// PAGE 10: LINEAR CORRIDOR TRACK SCHEMATIC DIAGRAM
function renderCorridorMapPage() {
    const tasks = window.IR_WORKFLOW_STORE.getUnifiedTasks();
    const trains = window.IR_MOCK_DATA.coaTrainSchedules;

    return `
        <div class="space-y-4">
            <!-- Header Strip -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">SECTION CHART</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Linear Railway Track Diagram & Section Occupancy (KM 20.0 – 80.0)</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Schematic representation of running tracks, physical defect locations, scheduled train paths, and planned composite block windows.
                    </p>
                </div>
            </div>

            <!-- Full Track Schematic Viewer -->
            <div class="bg-white rounded border border-slate-300 shadow-sm p-4 space-y-4">
                <!-- Legend -->
                <div class="flex flex-wrap items-center gap-4 text-xs border-b border-slate-200 pb-3">
                    <span class="font-bold text-slate-700">Legend:</span>
                    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-blue-700"></span> Engineering (Track Defect)</span>
                    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-amber-500"></span> S&T (Signalling Issue)</span>
                    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-purple-600"></span> Traction (OHE Defect)</span>
                    <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-red-600"></span> Critical Priority Marker</span>
                    <span class="flex items-center gap-1.5"><span class="w-4 h-3 border-2 border-amber-500 bg-amber-200/40"></span> Planned Composite Block</span>
                </div>

                <!-- Interactive Track Schematic -->
                <div class="bg-slate-950 rounded p-4 text-white overflow-x-auto min-w-[700px] space-y-6">
                    <!-- Physical KM Scale -->
                    <div class="relative border-b border-slate-700 pb-2">
                        <div class="flex justify-between font-mono text-[11px] text-slate-400">
                            <span>KM 20.000<br><span class="text-[9px] text-slate-400 font-bold">Sheoraphuli (SRP)</span></span>
                            <span>KM 30.000<br><span class="text-[9px] text-slate-400 font-bold">Chandan Nagar (CGR)</span></span>
                            <span>KM 40.000<br><span class="text-[9px] text-slate-400 font-bold">Bandel Jcn (BDC)</span></span>
                            <span>KM 50.000<br><span class="text-[9px] text-slate-400 font-bold">Mogra (MUG)</span></span>
                            <span>KM 60.000<br><span class="text-[9px] text-slate-400 font-bold">Bainchi (BOI)</span></span>
                            <span>KM 70.000<br><span class="text-[9px] text-slate-400 font-bold">Memari (MYM)</span></span>
                            <span>KM 80.000<br><span class="text-[9px] text-slate-400 font-bold">Saktigarh (SKG)</span></span>
                        </div>
                    </div>

                    <!-- UP MAIN LINE TRACK -->
                    <div class="space-y-1">
                        <div class="flex justify-between items-center text-xs font-mono text-slate-400">
                            <span class="font-bold text-white">UP MAIN LINE (Toward Burdwan)</span>
                            <span class="text-[10px] text-emerald-400">Section Speed: 130 km/h</span>
                        </div>
                        <div class="relative h-12 bg-slate-900 border-y border-slate-700 flex items-center px-2">
                            <!-- Track Center Steel Line -->
                            <div class="w-full h-1 bg-slate-600"></div>

                            <!-- UP Line Maintenance Points -->
                            ${tasks.filter(t => t.track_id.includes('UP')).map(t => {
                                const leftPercent = Math.min(95, Math.max(3, ((t.location_km - 20) / 60) * 100));
                                return `
                                    <div class="absolute cursor-pointer -top-1" style="left: ${leftPercent}%;" onclick="openPriorityModal('${t.maintenance_id}')" title="${t.maintenance_id}: ${t.defect_type} @ KM ${t.location_km}">
                                        <div class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${t.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'} shadow flex items-center gap-1">
                                            <i class="fa-solid fa-triangle-exclamation text-[8px]"></i>
                                            ${t.asset_id} (${t.department})
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- DOWN MAIN LINE TRACK -->
                    <div class="space-y-1 pt-2">
                        <div class="flex justify-between items-center text-xs font-mono text-slate-400">
                            <span class="font-bold text-white">DOWN MAIN LINE (Toward Howrah)</span>
                            <span class="text-[10px] text-emerald-400">Section Speed: 130 km/h</span>
                        </div>
                        <div class="relative h-12 bg-slate-900 border-y border-slate-700 flex items-center px-2">
                            <!-- Track Center Steel Line -->
                            <div class="w-full h-1 bg-slate-600"></div>

                            <!-- Composite Shadow Block Box -->
                            <div class="absolute -top-1 h-14 border-2 border-amber-400 bg-amber-500/20 rounded flex items-end justify-center pb-1 text-[9px] font-mono font-bold text-amber-300" style="left: 16%; width: 22%;">
                                PLANNED COMPOSITE BLOCK: KM 30.1 – 32.2 (04:30 – 08:00)
                            </div>

                            <!-- DN Line Maintenance Points -->
                            ${tasks.filter(t => t.track_id.includes('DN')).map(t => {
                                const leftPercent = Math.min(95, Math.max(3, ((t.location_km - 20) / 60) * 100));
                                return `
                                    <div class="absolute cursor-pointer -top-1" style="left: ${leftPercent}%;" onclick="openPriorityModal('${t.maintenance_id}')" title="${t.maintenance_id}: ${t.defect_type} @ KM ${t.location_km}">
                                        <div class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${t.severity === 'Critical' ? 'bg-red-600 text-white' : (t.department === 'Traction' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white')} shadow flex items-center gap-1">
                                            ${t.asset_id}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// PAGE 11: HISTORICAL DEFECT REGISTER & POSTPONEMENT AUDIT
function renderHistoryPage() {
    const histRecords = window.IR_MOCK_DATA.historicalDefects || [];
    return `
        <div class="space-y-4">
            <!-- Header Strip -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">AUDIT LOG</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Historical Defect Register & Block Postponement Audit</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Historical recurrence log used by Module 02 AI to dynamically weight critical asset repeat failures and calculate postponement risk.
                    </p>
                </div>
                <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-1 rounded font-bold">
                        Total Past Records: ${histRecords.length}
                    </span>
                </div>
            </div>

            <!-- Historical Table -->
            <div class="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                <div class="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Past Defect Incidents & Resolution History
                    </h3>
                    <span class="text-[10px] font-mono text-slate-500">Asset Life-Cycle Telemetry</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="ir-table-th">History ID</th>
                                <th class="ir-table-th">Demand ID</th>
                                <th class="ir-table-th">Asset ID</th>
                                <th class="ir-table-th">Track & Section</th>
                                <th class="ir-table-th">Department</th>
                                <th class="ir-table-th">Location KM</th>
                                <th class="ir-table-th">Defect Description</th>
                                <th class="ir-table-th">Severity</th>
                                <th class="ir-table-th">Incident Date</th>
                                <th class="ir-table-th">Resolved Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${histRecords.map(h => `
                                <tr class="hover:bg-slate-50 border-b border-slate-200 transition">
                                    <td class="ir-table-td font-mono font-bold text-slate-700">${h.history_id}</td>
                                    <td class="ir-table-td font-mono font-bold text-blue-950">${h.maintenance_id}</td>
                                    <td class="ir-table-td font-mono">${h.asset_id}</td>
                                    <td class="ir-table-td font-mono text-slate-600">${h.track_id}</td>
                                    <td class="ir-table-td font-semibold text-slate-800">${h.department}</td>
                                    <td class="ir-table-td font-mono font-bold text-blue-900">KM ${h.location_km.toFixed(3)}</td>
                                    <td class="ir-table-td font-medium text-slate-900">${h.defect_type}</td>
                                    <td class="ir-table-td">
                                        <span class="ir-badge ${h.severity === 'Critical' ? 'ir-badge-critical' : (h.severity === 'High' ? 'ir-badge-high' : 'ir-badge-medium')}">
                                            ${h.severity}
                                        </span>
                                    </td>
                                    <td class="ir-table-td font-mono text-slate-700">${h.occurrence_date}</td>
                                    <td class="ir-table-td font-mono text-emerald-800 font-bold">${h.resolved_date}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// PAGE 12: SYSTEM TECHNICAL HEALTH & INTERFACE FEEDS
function renderSystemStatusPage() {
    const sources = window.IR_MOCK_DATA.systemDataSources;
    return `
        <div class="space-y-4">
            <!-- Header Strip -->
            <div class="bg-white rounded border border-slate-300 p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">TELEMETRY</span>
                        <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Enterprise Interface Connector Health & Status</h2>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">
                        Live connection status to Indian Railways legacy divisional databases and COA train location streams.
                    </p>
                </div>
            </div>

            <!-- Connectors Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${sources.map(src => `
                    <div class="bg-white p-4 rounded border border-slate-300 shadow-sm flex justify-between items-center">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <h4 class="font-bold text-slate-900 text-xs">${src.code} — ${src.name}</h4>
                            </div>
                            <p class="text-[11px] text-slate-500">Department: <strong>${src.department}</strong> | Last Sync: <strong>${src.lastSync}</strong></p>
                            <p class="text-[11px] text-slate-500 font-mono">Records Synchronized: <strong class="text-blue-950">${src.records}</strong> | Data Quality: <strong class="text-emerald-700">${src.qualityScore}</strong></p>
                        </div>
                        <div class="text-right space-y-1.5">
                            <span class="ir-badge ir-badge-approved">${src.status}</span>
                            <button onclick="simulateSync('${src.code}')" class="block px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded font-semibold text-[10px]">
                                Force Sync
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// WORKFLOW INTERACTION HANDLERS & MODAL CONTROLLERS
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
    window.IR_WORKFLOW_STORE.recordOfficerApproval(recId, action, 'DOM / Sr.DOM (Howrah)', remarks || `Block ${action.toLowerCase()} per G&SR rules`);
    showIrToast('OPERATING SANCTION RECORDED', `Block ${recId} status set to [${action.toUpperCase()}]. Divisional audit log updated.`, action === 'Approved' ? 'success' : 'danger');
    renderPage(currentTab);
}

function handleOfficerActionForRec(recId, action) {
    openSanctionModal(recId, action);
}

function openPriorityModal(maintId) {
    const rawList = window.IR_WORKFLOW_STORE.getUnifiedTasks();
    const item = rawList.find(i => i.maintenance_id === maintId);
    if (!item) return;

    const res = window.IR_PRIORITY_SERVICE.evaluatePriority(item);
    const hist = window.IR_WORKFLOW_STORE.getHistoryForTask(maintId);

    const body = document.getElementById('priority-modal-body');
    if (!body) return;

    body.innerHTML = `
        <div class="flex justify-between items-center bg-[#0b1e38] text-white p-3 rounded border-b border-amber-600">
            <div>
                <span class="text-[10px] font-mono text-slate-300 block">${item.maintenance_id} • ${item.department} (${item.asset_id})</span>
                <h4 class="text-sm font-bold text-white">${item.defect_type} @ KM ${item.location_km.toFixed(3)}</h4>
            </div>
            <div class="text-right">
                <span class="text-[9px] text-slate-300 uppercase font-bold block">PRIORITY SCORE</span>
                <span class="text-2xl font-bold font-mono text-amber-400">${res.totalScore}<span class="text-xs text-slate-400 font-normal">/100</span></span>
                <span class="ir-badge ${res.priorityClass === 'Critical' ? 'ir-badge-critical' : 'ir-badge-high'} block mt-0.5">${res.priorityClass.toUpperCase()}</span>
            </div>
        </div>

        <div class="space-y-2 border border-slate-200 rounded p-3 bg-slate-50">
            <h5 class="font-bold text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
                <i class="fa-solid fa-list-check text-blue-900"></i> Deterministic Explainability & Scoring Breakdown:
            </h5>
            <div class="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded border border-slate-200">
                <div>Severity Base: <strong>${item.severity}</strong></div>
                <div>Overdue Duration: <strong>${item.overdue_days} days</strong></div>
                <div>Past Postponements: <strong>${item.postponement_count} times</strong></div>
                <div>Historical Recurrences: <strong>${hist.total} recorded</strong></div>
            </div>
            <ul class="space-y-1 text-slate-700 text-xs pl-4 list-disc leading-relaxed">
                ${res.bulletReasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
        </div>

        <div class="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button type="button" onclick="closePriorityModal()" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs">
                Close
            </button>
            <button type="button" onclick="closePriorityModal(); sendToPlanner('${item.maintenance_id}');" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded shadow-sm flex items-center gap-1">
                Dispatch to Smart Block Planner <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
        </div>
    `;

    document.getElementById('modal-priority-detail')?.classList.remove('hidden');
}

function closePriorityModal() {
    document.getElementById('modal-priority-detail')?.classList.add('hidden');
}

function openSanctionModal(recId, action = 'Approved') {
    pendingSanctionRecId = recId;
    const recs = window.IR_MOCK_DATA.blockRecommendations;
    const rec = recs.find(r => r.id === recId) || recs[0];
    const contentEl = document.getElementById('sanction-modal-content');
    if (!contentEl) return;

    const memoRef = `HWH/OPT/BLK/2026/09/${rec.id.replace('REC-BLK-', '')}`;

    contentEl.innerHTML = `
        <div class="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5 font-mono text-[11px]">
            <div class="flex justify-between items-center text-slate-700">
                <span>Sanction Memo Ref: <strong class="text-blue-950">${memoRef}</strong></span>
                <span class="ir-badge ${action === 'Approved' ? 'ir-badge-approved' : 'ir-badge-rejected'}">${action.toUpperCase()}</span>
            </div>
            <div class="text-slate-800">
                Corridor Section: <strong>${rec.group_name}</strong>
            </div>
            <div class="text-slate-600">
                Proposed Window: <strong class="text-slate-900">${rec.date} • ${rec.start_time} – ${rec.end_time} (${rec.duration_min} min)</strong>
            </div>
            <div class="text-slate-600">
                Contributing Departments: <strong class="text-blue-900">${rec.departments.join(', ')}</strong>
            </div>
        </div>

        <div class="space-y-2">
            <label class="block font-bold text-slate-800 uppercase text-[10px]">Operating Compliance Checklist (G&SR Mandatory Checks):</label>
            <div class="space-y-1.5 text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked class="rounded text-blue-900 focus:ring-0" />
                    <span>Caution Order (TSR 30 km/h) notified to Station Master (Bandel) & Section Controller</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked class="rounded text-blue-900 focus:ring-0" />
                    <span>Power Block Disconnection Memo requisitioned with Traction Power Controller (TPC/HWH)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked class="rounded text-blue-900 focus:ring-0" />
                    <span>Signal Disconnection Notice (Form T/351) signed by Divisional Signal Inspector</span>
                </label>
            </div>
        </div>

        <div>
            <label class="block font-bold text-slate-800 uppercase text-[10px] mb-1">Operating Officer (DOM) Endorsement Remarks:</label>
            <textarea id="sanction-remarks" rows="2" class="w-full border border-slate-300 rounded p-2 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-900" placeholder="e.g. Approved. Priority passage for 12301 Rajdhani on adjacent track. Section Controller alerted.">${action === 'Approved' ? 'Block granted in shadow window. Speed restriction 30 km/h on adjacent track. Mail/Express paths deconflicted.' : 'Sanction withheld due to excessive peak freight traffic.'}</textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" onclick="closeSanctionModal()" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs">
                Cancel
            </button>
            <button type="button" onclick="confirmOfficerSanction('${rec.id}', '${action}')" class="px-4 py-1.5 ${action === 'Approved' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-700 hover:bg-red-800'} text-white font-bold text-xs rounded shadow flex items-center gap-1.5">
                <i class="fa-solid ${action === 'Approved' ? 'fa-stamp' : 'fa-xmark'}"></i>
                <span>${action === 'Approved' ? 'Confirm & Transmit Official Sanction Memo' : 'Confirm Decline Decision'}</span>
            </button>
        </div>
    `;

    document.getElementById('modal-officer-sanction')?.classList.remove('hidden');
}

function closeSanctionModal() {
    document.getElementById('modal-officer-sanction')?.classList.add('hidden');
    pendingSanctionRecId = null;
}

function confirmOfficerSanction(recId, action) {
    const remarks = document.getElementById('sanction-remarks')?.value || '';
    window.IR_WORKFLOW_STORE.recordOfficerApproval(recId, action, 'DOM / Sr.DOM (Howrah)', remarks);
    closeSanctionModal();
    showIrToast('OPERATING SANCTION TRANSMITTED', `Line Block Order #${recId} [${action.toUpperCase()}]. Transmitted to Station Master & Control Office.`, action === 'Approved' ? 'success' : 'danger');
    renderPage(currentTab);
}

function simulateCsvUpload(e) {
    e.preventDefault();
    const src = document.getElementById('upload-source-system')?.value || 'TMS';
    
    // Check if new test records are already injected
    const existing = window.IR_MOCK_DATA.unifiedMaintenance.find(t => t.maintenance_id === 'UNIF-TMS-NEW-01');
    if (!existing) {
        window.IR_MOCK_DATA.unifiedMaintenance.push({
            maintenance_id: "UNIF-TMS-NEW-01",
            source_system: "TMS",
            source_record_id: "TMS-2026-981",
            department: "Engineering",
            asset_id: "TRK-019",
            track_id: "TRACK-DN-01",
            location_km: 33.450,
            raw_location_str: "KM 33.450",
            defect_type: "Rail Thermit Weld Fracture & Flaw",
            work_type: "Emergency Weld Replacement",
            severity: "Critical",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 90,
            historical_actual_duration_min: 90,
            overdue_days: 9,
            postponement_count: 1,
            maintenance_date: "16-09-2026",
            section: "Howrah - Burdwan Main Line"
        });
        window.IR_MOCK_DATA.unifiedMaintenance.push({
            maintenance_id: "UNIF-SMMS-NEW-02",
            source_system: "SMMS",
            source_record_id: "SMMS-2026-442",
            department: "S&T",
            asset_id: "SIG-018",
            track_id: "TRACK-UP-01",
            location_km: 71.100,
            raw_location_str: "KM 71.100",
            defect_type: "Track Circuit Relay Contact Resistance",
            work_type: "Inspection & Relay Tuning",
            severity: "High",
            status: "Pending",
            block_required: true,
            estimated_duration_min: 60,
            historical_actual_duration_min: 60,
            overdue_days: 5,
            postponement_count: 0,
            maintenance_date: "16-09-2026",
            section: "Howrah - Burdwan Main Line"
        });
    }

    closeCsvUploadModal();
    showIrToast('CRIS DATASET INGESTED', `Verified and integrated 2 permanent-way defect records from ${src}. Dynamic priority queue refreshed.`, 'success');
    renderPage(currentTab);
}

function simulateSync(srcCode) {
    showIrToast('INTERFACE STREAM SYNCED', `Real-time synchronization with ${srcCode === 'ALL' ? 'TMS / SMMS / TDMS / COA' : srcCode} completed. Latency: 38ms.`, 'info');
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
                    backgroundColor: ['#dc2626', '#d97706', '#ca8a04', '#16a34a'],
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                cutout: '72%'
            }
        });
    }, 50);
}
