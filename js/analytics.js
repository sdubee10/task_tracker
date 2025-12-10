// ===== Analytics Dashboard Logic =====

// 상태 관리
let currentView = 'overview';
let dateRange = '30d';
let charts = {};
let analyticsData = null;

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
    initAnalytics();
});

function initAnalytics() {
    // 실제 신청서 데이터 로드
    loadRealData();
    
    // 초기 뷰 로드
    loadOverviewData();
    
    // 사용자 목록 로드
    loadUserList();
    loadAssigneeList();
    
    // 팀 통계 로드
    loadTeamStats();
    
    // 클릭 외부 닫기
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.date-range-picker')) {
            document.getElementById('datePicker')?.classList.remove('show');
        }
    });
    
    // localStorage 변경 감지 (다른 페이지에서 신청서 제출 시)
    window.addEventListener('storage', (e) => {
        if (e.key === 'taskflowRequests') {
            loadRealData();
            if (currentView === 'overview') {
                loadOverviewData();
            }
            loadTeamStats();
        }
    });
    
    // focus 시 데이터 새로고침
    window.addEventListener('focus', () => {
        loadRealData();
        if (currentView === 'overview') {
            loadOverviewData();
        }
        loadTeamStats();
    });
}

// ===== 실제 데이터 로드 =====
function loadRealData() {
    // localStorage에서 실제 신청서 데이터 로드
    const storedRequests = JSON.parse(localStorage.getItem('taskflowRequests') || '[]');
    
    // 요청자 목록 추출
    const usersMap = new Map();
    const assigneesMap = new Map();
    
    storedRequests.forEach(r => {
        // 요청자 정보 추출
        if (r.requester) {
            const userId = r.requester.id || r.requester.email || r.requester.name;
            if (!usersMap.has(userId)) {
                usersMap.set(userId, {
                    id: userId,
                    name: r.requester.name || '알 수 없음',
                    team: r.requester.team || r.requesterTeam || '미지정',
                    email: r.requester.email || r.requesterEmail || ''
                });
            }
        }
        
        // 담당자 정보 추출
        if (r.assignees && r.assignees.length > 0) {
            r.assignees.forEach(a => {
                const assigneeId = a.id || a.email || a.name;
                if (!assigneesMap.has(assigneeId)) {
                    assigneesMap.set(assigneeId, {
                        id: assigneeId,
                        name: a.name || '알 수 없음',
                        team: a.team || '미지정',
                        role: a.role || a.position || '담당자'
                    });
                }
            });
        }
    });
    
    // 카테고리 목록 추출
    const categoriesSet = new Set();
    storedRequests.forEach(r => {
        const category = r.templateCategory || r.category || '기타';
        categoriesSet.add(category);
    });
    
    // 요청서 데이터 정규화
    const normalizedRequests = storedRequests.map(r => {
        // 상태 정규화
        let status = r.status || 'submitted';
        if (status === 'draft') status = 'submitted';
        
        // 우선순위 정규화
        let priority = r.priority || 'medium';
        if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
            priority = 'medium';
        }
        
        // 카테고리 정규화
        const category = r.templateCategory || r.category || '기타';
        
        // 담당자 정보
        const assignee = r.assignees && r.assignees.length > 0 ? r.assignees[0] : null;
        
        // 완료일 계산
        let completedAt = null;
        if (r.status === 'completed' && r.history) {
            const completeEvent = r.history.find(h => h.type === 'completed');
            if (completeEvent) {
                completedAt = completeEvent.timestamp;
            }
        }
        
        // 평가 정보 (history에서 추출하거나 기본값)
        let evaluation = null;
        if (r.status === 'completed') {
            // 실제 평가 데이터가 있으면 사용
            if (r.evaluation) {
                evaluation = r.evaluation;
            } else {
                // 완료된 건에 대해 임의 평가 생성 (데모용)
                evaluation = {
                    technical: Math.floor(Math.random() * 2) + 4,
                    communication: Math.floor(Math.random() * 2) + 4,
                    efficiency: Math.floor(Math.random() * 2) + 3,
                    quality: Math.floor(Math.random() * 2) + 4
                };
            }
        }
        
        return {
            id: r.id,
            title: r.title || r.templateTitle || '제목 없음',
            category: category,
            status: status,
            priority: priority,
            requester: r.requester || { id: 'unknown', name: '알 수 없음', team: '미지정' },
            assignee: assignee,
            createdAt: r.createdAt || r.submittedAt || new Date().toISOString(),
            completedAt: completedAt,
            evaluation: evaluation,
            targetTeam: r.targetTeam
        };
    });
    
    analyticsData = {
        requests: normalizedRequests,
        users: Array.from(usersMap.values()),
        assignees: Array.from(assigneesMap.values()),
        categories: Array.from(categoriesSet)
    };
    
    // 사용자/담당자가 없으면 기본값 추가
    if (analyticsData.users.length === 0) {
        analyticsData.users = [
            { id: 'default', name: '데이터 없음', team: '-' }
        ];
    }
    
    if (analyticsData.assignees.length === 0) {
        analyticsData.assignees = [
            { id: 'default', name: '데이터 없음', team: '-', role: '-' }
        ];
    }
    
    console.log('Analytics data loaded:', {
        requests: analyticsData.requests.length,
        users: analyticsData.users.length,
        assignees: analyticsData.assignees.length,
        categories: analyticsData.categories
    });
}

// ===== 뷰 전환 =====
function switchView(view) {
    currentView = view;
    
    // 탭 업데이트
    document.querySelectorAll('.analysis-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
    });
    
    // 뷰 업데이트
    document.querySelectorAll('.analytics-view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`${view}View`)?.classList.add('active');
    
    // 뷰별 데이터 로드
    switch (view) {
        case 'overview':
            loadOverviewData();
            break;
        case 'workload':
            loadUserList();
            break;
        case 'performance':
            loadAssigneeList();
            break;
        case 'team':
            loadTeamStats();
            break;
    }
}

// ===== 날짜 범위 =====
function toggleDatePicker() {
    document.getElementById('datePicker')?.classList.toggle('show');
}

function setDateRange(range) {
    dateRange = range;
    
    // 버튼 업데이트
    document.querySelectorAll('.date-picker-dropdown button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 텍스트 업데이트
    const rangeTexts = {
        '7d': '최근 7일',
        '30d': '최근 30일',
        '90d': '최근 90일',
        'year': '올해'
    };
    document.getElementById('dateRangeText').textContent = rangeTexts[range];
    
    // 드롭다운 닫기
    document.getElementById('datePicker')?.classList.remove('show');
    
    // 데이터 새로고침
    if (currentView === 'overview') {
        loadOverviewData();
    }
}

function refreshData() {
    loadRealData();
    loadOverviewData();
    loadTeamStats();
    showToast('데이터가 새로고침되었습니다.', 'success');
}

// ===== 전체 현황 (Overview) =====
function loadOverviewData() {
    if (!analyticsData || !analyticsData.requests) {
        console.warn('No analytics data available');
        return;
    }
    
    const filteredRequests = filterRequestsByDateRange(analyticsData.requests);
    
    // 요약 카드 업데이트
    updateSummaryCards(filteredRequests);
    
    // 차트 업데이트
    renderDailyTrendChart(filteredRequests);
    renderCategoryChart(filteredRequests);
    renderPriorityChart(filteredRequests);
    renderStatusChart(filteredRequests);
    
    // 최근 신청서 목록
    renderRecentRequests(filteredRequests);
}

function filterRequestsByDateRange(requests) {
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
        case '7d':
            startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }
    
    return requests.filter(r => new Date(r.createdAt) >= startDate);
}

function updateSummaryCards(requests) {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const pending = requests.filter(r => ['submitted', 'in_progress'].includes(r.status)).length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    
    // 평균 처리 시간 계산
    const completedWithTime = requests.filter(r => r.status === 'completed' && r.completedAt);
    let avgTime = 0;
    if (completedWithTime.length > 0) {
        const totalTime = completedWithTime.reduce((sum, r) => {
            return sum + (new Date(r.completedAt) - new Date(r.createdAt));
        }, 0);
        avgTime = Math.round(totalTime / completedWithTime.length / (24 * 60 * 60 * 1000) * 10) / 10;
    }
    
    // 완료율 계산
    const completionRate = total > 0 ? Math.round(completed / total * 100) : 0;
    
    document.getElementById('totalRequests').textContent = total;
    document.getElementById('completedRequests').textContent = completed;
    document.getElementById('pendingRequests').textContent = pending;
    document.getElementById('avgProcessingTime').textContent = avgTime > 0 ? `${avgTime}일` : '-';
    
    // 변화율 및 추가 정보
    document.getElementById('requestsChange').textContent = `완료율 ${completionRate}%`;
    document.getElementById('completedChange').textContent = rejected > 0 ? `반려 ${rejected}건` : '반려 없음';
    document.getElementById('pendingChange').textContent = `${pending}건 대기`;
    document.getElementById('timeChange').textContent = completedWithTime.length > 0 ? `${completedWithTime.length}건 기준` : '데이터 없음';
}

function renderDailyTrendChart(requests) {
    const ctx = document.getElementById('dailyTrendChart');
    if (!ctx) return;
    
    // 기존 차트 제거
    if (charts.dailyTrend) {
        charts.dailyTrend.destroy();
    }
    
    // 일별 데이터 집계
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const dailyData = {};
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split('T')[0];
        dailyData[key] = { submitted: 0, completed: 0 };
    }
    
    requests.forEach(r => {
        const key = r.createdAt.split('T')[0];
        if (dailyData[key]) {
            dailyData[key].submitted++;
        }
        if (r.completedAt) {
            const completedKey = r.completedAt.split('T')[0];
            if (dailyData[completedKey]) {
                dailyData[completedKey].completed++;
            }
        }
    });
    
    const labels = Object.keys(dailyData).map(d => {
        const date = new Date(d);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    charts.dailyTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: '신청',
                    data: Object.values(dailyData).map(d => d.submitted),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: '완료',
                    data: Object.values(dailyData).map(d => d.completed),
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') }
                }
            },
            scales: {
                x: {
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') },
                    grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }
                },
                y: {
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') },
                    grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }
                }
            }
        }
    });
}

function renderCategoryChart(requests) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    if (charts.category) {
        charts.category.destroy();
    }
    
    // 카테고리별 집계
    const categoryCount = {};
    requests.forEach(r => {
        const cat = r.category || '기타';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    // 데이터가 없으면 빈 차트 표시
    if (Object.keys(categoryCount).length === 0) {
        categoryCount['데이터 없음'] = 1;
    }
    
    const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];
    
    charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryCount),
            datasets: [{
                data: Object.values(categoryCount),
                backgroundColor: colors.slice(0, Object.keys(categoryCount).length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                        padding: 12
                    }
                }
            }
        }
    });
}

function renderPriorityChart(requests) {
    const ctx = document.getElementById('priorityChart');
    if (!ctx) return;
    
    if (charts.priority) {
        charts.priority.destroy();
    }
    
    const priorityCount = { low: 0, medium: 0, high: 0, urgent: 0 };
    requests.forEach(r => {
        const p = r.priority || 'medium';
        priorityCount[p] = (priorityCount[p] || 0) + 1;
    });
    
    charts.priority = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['낮음', '보통', '높음', '긴급'],
            datasets: [{
                label: '건수',
                data: [priorityCount.low, priorityCount.medium, priorityCount.high, priorityCount.urgent],
                backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#ef4444'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') },
                    grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }
                }
            }
        }
    });
}

function renderStatusChart(requests) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    if (charts.status) {
        charts.status.destroy();
    }
    
    const statusCount = { submitted: 0, in_progress: 0, completed: 0, rejected: 0 };
    requests.forEach(r => {
        const s = r.status || 'submitted';
        statusCount[s] = (statusCount[s] || 0) + 1;
    });
    
    charts.status = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['제출됨', '처리 중', '완료', '반려'],
            datasets: [{
                data: [statusCount.submitted, statusCount.in_progress, statusCount.completed, statusCount.rejected],
                backgroundColor: ['#3b82f6', '#eab308', '#22c55e', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                        padding: 12
                    }
                }
            }
        }
    });
}

function renderRecentRequests(requests) {
    const container = document.getElementById('recentRequestsTable');
    if (!container) return;
    
    // 최신순으로 정렬하여 상위 10개
    const recent = [...requests]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
    
    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📋 표시할 신청서가 없습니다.</p>
                <p class="text-muted">신청서를 작성하면 여기에 표시됩니다.</p>
            </div>
        `;
        return;
    }
    
    const statusLabels = {
        submitted: '제출됨',
        in_progress: '처리 중',
        completed: '완료',
        rejected: '반려'
    };
    
    const priorityLabels = {
        low: '낮음',
        medium: '보통',
        high: '높음',
        urgent: '긴급'
    };
    
    container.innerHTML = recent.map(r => `
        <div class="request-row">
            <span class="request-row-id">${r.id}</span>
            <span class="request-row-title">${r.title}</span>
            <span class="request-row-category">${r.category}</span>
            <span class="request-row-requester">${r.requester?.name || '알 수 없음'}</span>
            <span class="request-row-status ${r.status}">${statusLabels[r.status] || r.status}</span>
            <span class="request-row-priority ${r.priority}">${priorityLabels[r.priority] || r.priority}</span>
            <span class="request-row-date">${new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
        </div>
    `).join('');
}

// ===== 업무량 분석 (Workload) =====
function loadUserList() {
    const select = document.getElementById('userSelect');
    if (!select || !analyticsData) return;
    
    if (analyticsData.users.length === 0 || (analyticsData.users.length === 1 && analyticsData.users[0].id === 'default')) {
        select.innerHTML = '<option value="">요청자 데이터 없음</option>';
        renderDepartmentMemberNodes(); // 빈 상태에서도 노드 표시
        return;
    }
    
    select.innerHTML = '<option value="">사용자 선택</option>' +
        analyticsData.users.map(u => `<option value="${u.id}">${u.name} (${u.team})</option>`).join('');
    
    // 초기 상태: 부서별 인원 노드 표시
    renderDepartmentMemberNodes();
}

// 현재 선택된 부서
let selectedDepartment = null;

// 부서 아이콘 매핑
const deptIcons = {
    'DBA팀': '🗄️', 'Frontend팀': '🎨', 'Backend팀': '⚙️', 'Infra팀': '🖥️',
    'QA팀': '🧪', '보안팀': '🔒', '기획팀': '📝', '마케팅팀': '📣',
    '영업팀': '💼', '재무팀': '💰', '인사팀': '👥', '운영팀': '🔧',
    '미지정': '📋'
};

// 부서 색상 매핑
const deptColors = {
    'DBA팀': '#ef4444', 'Frontend팀': '#3b82f6', 'Backend팀': '#22c55e', 'Infra팀': '#f97316',
    'QA팀': '#8b5cf6', '보안팀': '#ec4899', '기획팀': '#06b6d4', '마케팅팀': '#eab308',
    '영업팀': '#14b8a6', '재무팀': '#6366f1', '인사팀': '#f43f5e', '운영팀': '#84cc16',
    '미지정': '#6b7280'
};

// 부서별 인원 노드 표시
function renderDepartmentMemberNodes() {
    const container = document.getElementById('workloadContent');
    if (!container || !analyticsData) return;
    
    // 담당자와 요청자를 합쳐서 모든 인원 수집
    const allMembers = new Map();
    
    // 담당자 추가
    analyticsData.assignees.forEach(a => {
        if (a.id !== 'default') {
            allMembers.set(a.id, {
                id: a.id,
                name: a.name,
                team: a.team || '미지정',
                role: a.role || '담당자',
                type: 'assignee'
            });
        }
    });
    
    // 요청자 추가 (담당자와 중복되지 않는 경우만)
    analyticsData.users.forEach(u => {
        if (u.id !== 'default' && !allMembers.has(u.id)) {
            allMembers.set(u.id, {
                id: u.id,
                name: u.name,
                team: u.team || '미지정',
                role: '요청자',
                type: 'requester'
            });
        }
    });
    
    // 부서별로 그룹화
    const departments = {};
    allMembers.forEach(member => {
        const dept = member.team || '미지정';
        if (!departments[dept]) {
            departments[dept] = [];
        }
        departments[dept].push(member);
    });
    
    // 부서별 통계 계산
    const deptStats = {};
    Object.keys(departments).forEach(dept => {
        const members = departments[dept];
        let totalProcessed = 0;
        let totalCompleted = 0;
        
        members.forEach(m => {
            const assignedRequests = analyticsData.requests.filter(r => {
                if (!r.assignee) return false;
                const aId = r.assignee.id || r.assignee.email || r.assignee.name;
                return aId === m.id || r.assignee.name === m.name;
            });
            totalProcessed += assignedRequests.length;
            totalCompleted += assignedRequests.filter(r => r.status === 'completed').length;
        });
        
        deptStats[dept] = {
            memberCount: members.length,
            totalProcessed,
            totalCompleted,
            completionRate: totalProcessed > 0 ? Math.round(totalCompleted / totalProcessed * 100) : 0
        };
    });
    
    if (Object.keys(departments).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>표시할 인원 데이터가 없습니다.</p>
                <p class="text-muted">신청서가 등록되면 인원 정보가 표시됩니다.</p>
            </div>
        `;
        return;
    }
    
    // 부서 목록 정렬 (인원 수 기준)
    const sortedDepts = Object.entries(deptStats)
        .sort((a, b) => b[1].memberCount - a[1].memberCount)
        .map(([dept]) => dept);
    
    container.innerHTML = `
        <div class="dept-nodes-container">
            <div class="dept-nodes-header">
                <h3>🏢 부서별 인원 현황</h3>
                <p class="text-muted">부서를 선택하면 해당 팀의 인원을 확인할 수 있습니다.</p>
            </div>
            
            <!-- 부서 카테고리 그리드 (한 줄에 6개) -->
            <div class="dept-category-grid">
                ${sortedDepts.map(dept => {
                    const stats = deptStats[dept];
                    const isSelected = selectedDepartment === dept;
                    return `
                        <div class="dept-category-card ${isSelected ? 'selected' : ''}" 
                             onclick="selectDepartment('${dept}')"
                             style="--dept-color: ${deptColors[dept] || '#6b7280'}">
                            <div class="dept-category-icon">${deptIcons[dept] || '📁'}</div>
                            <div class="dept-category-info">
                                <span class="dept-category-name">${dept}</span>
                                <span class="dept-category-stats">${stats.memberCount}명 · ${stats.totalProcessed}건</span>
                            </div>
                            ${isSelected ? '<div class="dept-selected-indicator">✓</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <!-- 선택된 팀의 인원 노드 영역 -->
            <div class="team-members-section" id="teamMembersSection">
                ${selectedDepartment ? renderTeamMembers(departments[selectedDepartment], selectedDepartment) : `
                    <div class="select-team-prompt">
                        <div class="prompt-icon">👆</div>
                        <p>위에서 부서를 선택해주세요</p>
                        <p class="text-muted">선택한 부서의 인원 목록이 여기에 표시됩니다.</p>
                    </div>
                `}
            </div>
        </div>
    `;
    
    // 전역에 departments 저장 (팀 선택 시 사용)
    window._departmentsData = departments;
}

// 부서 선택
function selectDepartment(dept) {
    selectedDepartment = selectedDepartment === dept ? null : dept;
    renderDepartmentMemberNodes();
}

// 팀 멤버 렌더링
function renderTeamMembers(members, dept) {
    if (!members || members.length === 0) {
        return `
            <div class="no-members">
                <p>해당 팀에 인원이 없습니다.</p>
            </div>
        `;
    }
    
    return `
        <div class="team-members-header" style="--dept-color: ${deptColors[dept] || '#6b7280'}">
            <div class="team-header-info">
                <span class="team-icon">${deptIcons[dept] || '📁'}</span>
                <h4>${dept}</h4>
                <span class="team-member-count">${members.length}명</span>
            </div>
            <button class="btn-close-team" onclick="selectDepartment(null)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="team-members-grid">
            ${members.map(m => {
                // 해당 멤버의 처리 통계
                const memberRequests = analyticsData.requests.filter(r => {
                    if (m.type === 'assignee' && r.assignee) {
                        const aId = r.assignee.id || r.assignee.email || r.assignee.name;
                        return aId === m.id || r.assignee.name === m.name;
                    }
                    return false;
                });
                const completed = memberRequests.filter(r => r.status === 'completed').length;
                const total = memberRequests.length;
                const rate = total > 0 ? Math.round(completed / total * 100) : 0;
                
                // 평균 처리 시간 계산
                const completedWithTime = memberRequests.filter(r => r.status === 'completed' && r.completedAt);
                let avgDays = 0;
                if (completedWithTime.length > 0) {
                    const totalDays = completedWithTime.reduce((sum, r) => {
                        return sum + (new Date(r.completedAt) - new Date(r.createdAt)) / (24 * 60 * 60 * 1000);
                    }, 0);
                    avgDays = Math.round(totalDays / completedWithTime.length * 10) / 10;
                }
                
                return `
                    <div class="member-node-card ${m.type}" 
                         onclick="selectMemberForAnalysis('${m.id}', '${m.type}')"
                         style="--dept-color: ${deptColors[dept] || '#6b7280'}">
                        <div class="member-node-avatar">${m.name.charAt(0)}</div>
                        <div class="member-node-content">
                            <div class="member-node-header">
                                <span class="member-node-name">${m.name}</span>
                                <span class="member-node-role">${m.role}</span>
                            </div>
                            <div class="member-node-stats">
                                <div class="stat-item">
                                    <span class="stat-value">${total}</span>
                                    <span class="stat-label">처리</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${completed}</span>
                                    <span class="stat-label">완료</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${rate}%</span>
                                    <span class="stat-label">완료율</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${avgDays > 0 ? avgDays + '일' : '-'}</span>
                                    <span class="stat-label">평균</span>
                                </div>
                            </div>
                            <div class="member-node-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${rate}%"></div>
                                </div>
                            </div>
                        </div>
                        <div class="member-node-action">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 멤버 선택 시 분석 페이지로 이동
function selectMemberForAnalysis(memberId, memberType) {
    if (memberType === 'assignee') {
        // 역량 평가 탭으로 이동하고 해당 담당자 선택
        switchView('performance');
        setTimeout(() => {
            const select = document.getElementById('assigneeSelect');
            if (select) {
                select.value = memberId;
                loadAssigneePerformance();
            }
        }, 100);
    } else {
        // 업무량 분석에서 해당 사용자 선택
        const select = document.getElementById('userSelect');
        if (select) {
            select.value = memberId;
            loadUserWorkload();
        }
    }
}

function loadUserWorkload() {
    const userId = document.getElementById('userSelect').value;
    if (!userId || !analyticsData) return;
    
    const user = analyticsData.users.find(u => u.id === userId);
    const userRequests = analyticsData.requests.filter(r => {
        const reqId = r.requester?.id || r.requester?.email || r.requester?.name;
        return reqId === userId;
    });
    
    const container = document.getElementById('workloadContent');
    if (!container) return;
    
    if (userRequests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📋 ${user?.name || '선택한 사용자'}의 신청서가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    // 통계 계산
    const total = userRequests.length;
    const completed = userRequests.filter(r => r.status === 'completed').length;
    const pending = userRequests.filter(r => ['submitted', 'in_progress'].includes(r.status)).length;
    const rejected = userRequests.filter(r => r.status === 'rejected').length;
    const completionRate = total > 0 ? Math.round(completed / total * 100) : 0;
    
    // 카테고리별 집계
    const byCategory = {};
    userRequests.forEach(r => {
        const cat = r.category || '기타';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    
    // 월별 집계
    const byMonth = {};
    userRequests.forEach(r => {
        const month = r.createdAt.substring(0, 7);
        byMonth[month] = (byMonth[month] || 0) + 1;
    });
    
    container.innerHTML = `
        <div class="workload-user-info">
            <h4>👤 ${user?.name || '사용자'}</h4>
            <span class="user-team">${user?.team || '팀 미지정'}</span>
        </div>
        
        <div class="workload-stats">
            <div class="workload-stat">
                <div class="workload-stat-value">${total}</div>
                <div class="workload-stat-label">총 신청서</div>
            </div>
            <div class="workload-stat">
                <div class="workload-stat-value">${completed}</div>
                <div class="workload-stat-label">완료됨</div>
            </div>
            <div class="workload-stat">
                <div class="workload-stat-value">${pending}</div>
                <div class="workload-stat-label">진행 중</div>
            </div>
            <div class="workload-stat">
                <div class="workload-stat-value">${rejected}</div>
                <div class="workload-stat-label">반려됨</div>
            </div>
            <div class="workload-stat">
                <div class="workload-stat-value">${completionRate}%</div>
                <div class="workload-stat-label">완료율</div>
            </div>
        </div>
        
        <div class="workload-charts">
            <div class="workload-chart">
                <h4>📊 카테고리별 신청</h4>
                <div class="workload-chart-body">
                    <canvas id="userCategoryChart"></canvas>
                </div>
            </div>
            <div class="workload-chart">
                <h4>📈 월별 신청 추이</h4>
                <div class="workload-chart-body">
                    <canvas id="userMonthlyChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="workload-recent">
            <h4>📋 최근 신청서</h4>
            <div class="workload-request-list">
                ${userRequests.slice(0, 5).map(r => `
                    <div class="workload-request-item">
                        <span class="request-title">${r.title}</span>
                        <span class="request-status ${r.status}">${getStatusLabel(r.status)}</span>
                        <span class="request-date">${new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 차트 렌더링
    setTimeout(() => {
        renderUserCategoryChart(byCategory);
        renderUserMonthlyChart(byMonth);
    }, 100);
}

function getStatusLabel(status) {
    const labels = {
        submitted: '제출됨',
        in_progress: '처리 중',
        completed: '완료',
        rejected: '반려'
    };
    return labels[status] || status;
}

function renderUserCategoryChart(data) {
    const ctx = document.getElementById('userCategoryChart');
    if (!ctx) return;
    
    const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: colors.slice(0, Object.keys(data).length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') }
                }
            }
        }
    });
}

function renderUserMonthlyChart(data) {
    const ctx = document.getElementById('userMonthlyChart');
    if (!ctx) return;
    
    // 월별 데이터 정렬
    const sortedMonths = Object.keys(data).sort();
    const sortedData = sortedMonths.map(m => data[m]);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMonths.map(m => m.substring(5)),
            datasets: [{
                label: '신청 건수',
                data: sortedData,
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') },
                    grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }
                }
            }
        }
    });
}

// ===== 역량 평가 (Performance) =====
function loadAssigneeList() {
    const select = document.getElementById('assigneeSelect');
    if (!select || !analyticsData) return;
    
    if (analyticsData.assignees.length === 0 || (analyticsData.assignees.length === 1 && analyticsData.assignees[0].id === 'default')) {
        select.innerHTML = '<option value="">담당자 데이터 없음</option>';
        return;
    }
    
    select.innerHTML = '<option value="">담당자 선택</option>' +
        analyticsData.assignees.map(a => `<option value="${a.id}">${a.name} (${a.team})</option>`).join('');
}

function loadAssigneePerformance() {
    const assigneeId = document.getElementById('assigneeSelect').value;
    if (!assigneeId || !analyticsData) return;
    
    const assignee = analyticsData.assignees.find(a => a.id === assigneeId);
    const assignedRequests = analyticsData.requests.filter(r => {
        if (!r.assignee) return false;
        const aId = r.assignee.id || r.assignee.email || r.assignee.name;
        return aId === assigneeId;
    });
    
    const container = document.getElementById('performanceContent');
    if (!container) return;
    
    if (assignedRequests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📋 ${assignee?.name || '선택한 담당자'}의 처리 내역이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    // 고급 분석 UI 렌더링
    renderAdvancedAssigneeAnalysis(assigneeId);
    return; // 기존 로직 대신 고급 분석 사용
    
    // 통계 계산
    const total = assignedRequests.length;
    const completed = assignedRequests.filter(r => r.status === 'completed').length;
    const inProgress = assignedRequests.filter(r => r.status === 'in_progress').length;
    
    // 평균 평가 점수
    const evaluations = assignedRequests.filter(r => r.evaluation).map(r => r.evaluation);
    const avgScores = {
        technical: 0,
        communication: 0,
        efficiency: 0,
        quality: 0
    };
    
    if (evaluations.length > 0) {
        Object.keys(avgScores).forEach(key => {
            avgScores[key] = Math.round(evaluations.reduce((sum, e) => sum + (e[key] || 0), 0) / evaluations.length * 10) / 10;
        });
    }
    
    // 평균 처리 시간
    const completedWithTime = assignedRequests.filter(r => r.status === 'completed' && r.completedAt);
    let avgProcessingTime = 0;
    if (completedWithTime.length > 0) {
        const totalTime = completedWithTime.reduce((sum, r) => {
            return sum + (new Date(r.completedAt) - new Date(r.createdAt));
        }, 0);
        avgProcessingTime = Math.round(totalTime / completedWithTime.length / (24 * 60 * 60 * 1000) * 10) / 10;
    }
    
    container.innerHTML = `
        <div class="performance-assignee-info">
            <h4>👤 ${assignee?.name || '담당자'}</h4>
            <span class="assignee-team">${assignee?.team || '팀 미지정'} - ${assignee?.role || '담당자'}</span>
        </div>
        
        <div class="performance-stats">
            <div class="performance-stat">
                <div class="performance-stat-value">${total}</div>
                <div class="performance-stat-label">총 처리</div>
            </div>
            <div class="performance-stat">
                <div class="performance-stat-value">${completed}</div>
                <div class="performance-stat-label">완료</div>
            </div>
            <div class="performance-stat">
                <div class="performance-stat-value">${inProgress}</div>
                <div class="performance-stat-label">진행 중</div>
            </div>
            <div class="performance-stat">
                <div class="performance-stat-value">${avgProcessingTime > 0 ? avgProcessingTime + '일' : '-'}</div>
                <div class="performance-stat-label">평균 처리시간</div>
            </div>
        </div>
        
        ${evaluations.length > 0 ? `
            <div class="performance-scores">
                <h4>📊 역량 평가 점수</h4>
                <div class="score-grid">
                    <div class="score-item">
                        <span class="score-label">기술력</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${avgScores.technical * 20}%"></div>
                        </div>
                        <span class="score-value">${avgScores.technical}/5</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">커뮤니케이션</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${avgScores.communication * 20}%"></div>
                        </div>
                        <span class="score-value">${avgScores.communication}/5</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">효율성</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${avgScores.efficiency * 20}%"></div>
                        </div>
                        <span class="score-value">${avgScores.efficiency}/5</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">품질</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${avgScores.quality * 20}%"></div>
                        </div>
                        <span class="score-value">${avgScores.quality}/5</span>
                    </div>
                </div>
            </div>
            
            <div class="radar-chart-container">
                <canvas id="performanceRadarChart"></canvas>
            </div>
        ` : `
            <div class="no-evaluation">
                <p>📊 평가 데이터가 없습니다.</p>
                <p class="text-muted">완료된 신청서에 대한 평가가 등록되면 여기에 표시됩니다.</p>
            </div>
        `}
    `;
    
    // 레이더 차트 렌더링
    if (evaluations.length > 0) {
        setTimeout(() => {
            renderPerformanceRadarChart(avgScores);
        }, 100);
    }
}

function renderPerformanceRadarChart(scores) {
    const ctx = document.getElementById('performanceRadarChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['기술력', '커뮤니케이션', '효율성', '품질'],
            datasets: [{
                label: '역량 점수',
                data: [scores.technical, scores.communication, scores.efficiency, scores.quality],
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: '#8b5cf6',
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        color: getComputedStyle(document.body).getPropertyValue('--text-muted')
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-color')
                    },
                    pointLabels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        font: { size: 12 }
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ===== 팀별 통계 (Team) =====
function loadTeamStats() {
    const container = document.getElementById('teamStatsGrid');
    if (!container || !analyticsData) return;
    
    const teams = [
        { id: 'DBA', name: 'DBA팀', icon: '🗄️' },
        { id: 'Frontend', name: 'Frontend팀', icon: '🎨' },
        { id: 'Backend', name: 'Backend팀', icon: '⚙️' },
        { id: 'Infra', name: 'Infra팀', icon: '🖥️' },
        { id: 'QA', name: 'QA팀', icon: '🧪' },
        { id: '보안', name: '보안팀', icon: '🔒' },
        { id: '기획', name: '기획팀', icon: '📝' },
        { id: '공통', name: '공통', icon: '📋' },
        { id: '기타', name: '기타', icon: '📁' }
    ];
    
    // 각 팀별 통계 계산
    const teamStats = teams.map(team => {
        const teamRequests = analyticsData.requests.filter(r => {
            const cat = r.category || '기타';
            return cat === team.id || cat.toLowerCase() === team.id.toLowerCase();
        });
        
        const total = teamRequests.length;
        const completed = teamRequests.filter(r => r.status === 'completed').length;
        const inProgress = teamRequests.filter(r => r.status === 'in_progress').length;
        const pending = teamRequests.filter(r => r.status === 'submitted').length;
        const rejected = teamRequests.filter(r => r.status === 'rejected').length;
        const completionRate = total > 0 ? Math.round(completed / total * 100) : 0;
        
        return {
            ...team,
            total,
            completed,
            inProgress,
            pending,
            rejected,
            completionRate
        };
    });
    
    // 데이터가 있는 팀만 필터링 (또는 모두 표시)
    const teamsWithData = teamStats.filter(t => t.total > 0);
    const teamsToShow = teamsWithData.length > 0 ? teamsWithData : teamStats;
    
    if (teamsToShow.every(t => t.total === 0)) {
        container.innerHTML = `
            <div class="empty-state full-width">
                <p>📊 표시할 팀별 통계가 없습니다.</p>
                <p class="text-muted">신청서가 등록되면 팀별 통계가 표시됩니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = teamsToShow.map(team => `
        <div class="team-stat-card ${team.total === 0 ? 'no-data' : ''}">
            <div class="team-stat-header">
                <div class="team-icon">${team.icon}</div>
                <span class="team-name">${team.name}</span>
                ${team.total > 0 ? `<span class="team-total-badge">${team.total}건</span>` : ''}
            </div>
            <div class="team-stat-body">
                ${team.total > 0 ? `
                    <div class="team-stat-row">
                        <span>완료</span>
                        <span class="stat-completed">${team.completed}건</span>
                    </div>
                    <div class="team-stat-row">
                        <span>진행 중</span>
                        <span class="stat-progress">${team.inProgress}건</span>
                    </div>
                    <div class="team-stat-row">
                        <span>대기</span>
                        <span class="stat-pending">${team.pending}건</span>
                    </div>
                    ${team.rejected > 0 ? `
                        <div class="team-stat-row">
                            <span>반려</span>
                            <span class="stat-rejected">${team.rejected}건</span>
                        </div>
                    ` : ''}
                    <div class="team-progress-bar">
                        <div class="team-progress-label">
                            <span>완료율</span>
                            <span>${team.completionRate}%</span>
                        </div>
                        <div class="team-progress-track">
                            <div class="team-progress-fill" style="width: ${team.completionRate}%"></div>
                        </div>
                    </div>
                ` : `
                    <div class="no-data-message">
                        <p>데이터 없음</p>
                    </div>
                `}
            </div>
        </div>
    `).join('');
    
    // 그래프 DB 기반 분석 로드
    loadGraphAnalysis();
}

// ===== 그래프 DB 기반 분석 =====
function loadGraphAnalysis() {
    loadDeptProcessingAnalysis();
    loadTopAssigneesAnalysis();
    loadCategoryProcessingAnalysis();
    loadDeptCategoryMatrix();
}

// 부서별 업무 처리량 분석
function loadDeptProcessingAnalysis() {
    const container = document.getElementById('deptProcessingAnalysis');
    if (!container || !analyticsData) return;
    
    const requests = analyticsData.requests || [];
    
    // 부서별 통계 집계
    const deptStats = {};
    const departments = [
        { id: 'DBA', name: 'DBA팀', icon: '🗄️' },
        { id: 'Frontend', name: 'Frontend팀', icon: '🎨' },
        { id: 'Backend', name: 'Backend팀', icon: '⚙️' },
        { id: 'Infra', name: 'Infra팀', icon: '🖥️' },
        { id: 'QA', name: 'QA팀', icon: '🧪' },
        { id: '보안', name: '보안팀', icon: '🔒' },
        { id: '기획', name: '기획팀', icon: '📝' },
        { id: '공통', name: '공통', icon: '📋' }
    ];
    
    departments.forEach(dept => {
        deptStats[dept.id] = { ...dept, total: 0, completed: 0, inProgress: 0 };
    });
    
    requests.forEach(r => {
        const category = r.category || '기타';
        if (deptStats[category]) {
            deptStats[category].total++;
            if (r.status === 'completed') deptStats[category].completed++;
            else if (r.status === 'in_progress') deptStats[category].inProgress++;
        }
    });
    
    // 정렬 (처리량 기준)
    const sortedDepts = Object.values(deptStats)
        .filter(d => d.total > 0)
        .sort((a, b) => b.total - a.total);
    
    if (sortedDepts.length === 0) {
        container.innerHTML = `
            <div class="analysis-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18 17V9"/>
                    <path d="M13 17V5"/>
                    <path d="M8 17v-3"/>
                </svg>
                <p>분석할 데이터가 없습니다</p>
            </div>
        `;
        return;
    }
    
    const maxTotal = Math.max(...sortedDepts.map(d => d.total));
    
    container.innerHTML = sortedDepts.map(dept => `
        <div class="dept-processing-item">
            <div class="dept-processing-icon">${dept.icon}</div>
            <div class="dept-processing-info">
                <div class="dept-processing-name">${dept.name}</div>
                <div class="dept-processing-bar">
                    <div class="dept-processing-fill" style="width: ${(dept.total / maxTotal) * 100}%"></div>
                </div>
            </div>
            <div class="dept-processing-stats">
                <div class="dept-processing-count">${dept.total}</div>
                <div class="dept-processing-label">건 (완료 ${dept.completed})</div>
            </div>
        </div>
    `).join('');
}

// 담당자별 처리 순위 (Top 10)
function loadTopAssigneesAnalysis() {
    const container = document.getElementById('topAssigneesAnalysis');
    if (!container || !analyticsData) return;
    
    const requests = analyticsData.requests || [];
    
    // 담당자별 통계 집계
    const assigneeStats = {};
    
    requests.forEach(r => {
        if (r.assignees && r.assignees.length > 0) {
            r.assignees.forEach(assignee => {
                const key = assignee.id || assignee.name || assignee.email;
                if (!assigneeStats[key]) {
                    assigneeStats[key] = {
                        id: key,
                        name: assignee.name || '알 수 없음',
                        team: assignee.team || '미지정',
                        completed: 0,
                        inProgress: 0,
                        total: 0
                    };
                }
                assigneeStats[key].total++;
                if (r.status === 'completed') assigneeStats[key].completed++;
                else if (r.status === 'in_progress') assigneeStats[key].inProgress++;
            });
        }
    });
    
    // 완료 건수 기준 정렬 후 상위 10명
    const topAssignees = Object.values(assigneeStats)
        .sort((a, b) => b.completed - a.completed || b.total - a.total)
        .slice(0, 10);
    
    if (topAssignees.length === 0) {
        container.innerHTML = `
            <div class="analysis-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p>담당자 데이터가 없습니다</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = topAssignees.map((assignee, index) => `
        <div class="assignee-rank-item">
            <div class="assignee-rank-position ${index < 3 ? 'top-' + (index + 1) : ''}">${index + 1}</div>
            <div class="assignee-rank-info">
                <div class="assignee-rank-name">${assignee.name}</div>
                <div class="assignee-rank-team">${assignee.team}</div>
            </div>
            <div class="assignee-rank-stats">
                <div class="assignee-stat">
                    <div class="assignee-stat-value completed">${assignee.completed}</div>
                    <div class="assignee-stat-label">완료</div>
                </div>
                <div class="assignee-stat">
                    <div class="assignee-stat-value in-progress">${assignee.inProgress}</div>
                    <div class="assignee-stat-label">진행중</div>
                </div>
                <div class="assignee-stat">
                    <div class="assignee-stat-value">${assignee.total}</div>
                    <div class="assignee-stat-label">전체</div>
                </div>
            </div>
        </div>
    `).join('');
}

// 업무 유형별 처리 현황
function loadCategoryProcessingAnalysis() {
    const container = document.getElementById('categoryProcessingAnalysis');
    if (!container || !analyticsData) return;
    
    const requests = analyticsData.requests || [];
    
    // 카테고리별 통계
    const categoryStats = {};
    const categoryIcons = {
        'DBA': '🗄️', 'Frontend': '🎨', 'Backend': '⚙️', 'Infra': '🖥️',
        'QA': '🧪', '보안': '🔒', '기획': '📝', '공통': '📋', '기타': '📁'
    };
    
    requests.forEach(r => {
        const category = r.category || '기타';
        if (!categoryStats[category]) {
            categoryStats[category] = {
                name: category,
                icon: categoryIcons[category] || '📁',
                total: 0,
                completed: 0,
                avgDays: 0,
                totalDays: 0,
                completedCount: 0
            };
        }
        categoryStats[category].total++;
        if (r.status === 'completed') {
            categoryStats[category].completed++;
            if (r.completedAt && r.createdAt) {
                const days = (new Date(r.completedAt) - new Date(r.createdAt)) / (24 * 60 * 60 * 1000);
                categoryStats[category].totalDays += days;
                categoryStats[category].completedCount++;
            }
        }
    });
    
    // 평균 처리일 계산
    Object.values(categoryStats).forEach(cat => {
        cat.avgDays = cat.completedCount > 0 ? Math.round(cat.totalDays / cat.completedCount * 10) / 10 : 0;
        cat.completionRate = cat.total > 0 ? Math.round(cat.completed / cat.total * 100) : 0;
    });
    
    const sortedCategories = Object.values(categoryStats)
        .filter(c => c.total > 0)
        .sort((a, b) => b.total - a.total);
    
    if (sortedCategories.length === 0) {
        container.innerHTML = `
            <div class="analysis-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <p>카테고리 데이터가 없습니다</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = sortedCategories.map(cat => `
        <div class="category-processing-item">
            <div class="category-processing-icon">${cat.icon}</div>
            <div class="category-processing-info">
                <div class="category-processing-name">${cat.name}</div>
                <div class="category-processing-detail">
                    완료율 ${cat.completionRate}% · 평균 ${cat.avgDays}일
                </div>
            </div>
            <div class="category-processing-count">${cat.total}건</div>
        </div>
    `).join('');
}

// 부서-카테고리 처리 매트릭스
function loadDeptCategoryMatrix() {
    const container = document.getElementById('deptCategoryMatrix');
    if (!container || !analyticsData) return;
    
    const requests = analyticsData.requests || [];
    
    // 담당자의 팀별로 어떤 카테고리 업무를 처리했는지 매트릭스 생성
    const matrix = {};
    const teams = new Set();
    const categories = new Set();
    
    requests.forEach(r => {
        const category = r.category || '기타';
        categories.add(category);
        
        if (r.assignees && r.assignees.length > 0) {
            r.assignees.forEach(assignee => {
                const team = assignee.team || '미지정';
                teams.add(team);
                
                if (!matrix[team]) matrix[team] = {};
                if (!matrix[team][category]) matrix[team][category] = { total: 0, completed: 0 };
                
                matrix[team][category].total++;
                if (r.status === 'completed') matrix[team][category].completed++;
            });
        }
    });
    
    const teamList = Array.from(teams).sort();
    const categoryList = Array.from(categories).sort();
    
    if (teamList.length === 0 || categoryList.length === 0) {
        container.innerHTML = `
            <div class="analysis-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                <p>매트릭스 데이터가 없습니다</p>
            </div>
        `;
        return;
    }
    
    // 팀별/카테고리별 합계 계산
    const teamTotals = {};
    const categoryTotals = {};
    let grandTotal = 0;
    
    teamList.forEach(team => {
        teamTotals[team] = 0;
        categoryList.forEach(cat => {
            const count = matrix[team]?.[cat]?.total || 0;
            teamTotals[team] += count;
            categoryTotals[cat] = (categoryTotals[cat] || 0) + count;
            grandTotal += count;
        });
    });
    
    // 최대값 계산 (색상 강도용)
    let maxValue = 0;
    teamList.forEach(team => {
        categoryList.forEach(cat => {
            const count = matrix[team]?.[cat]?.total || 0;
            if (count > maxValue) maxValue = count;
        });
    });
    
    container.innerHTML = `
        <div class="matrix-container">
            <table class="matrix-table">
                <thead>
                    <tr>
                        <th>팀 / 카테고리</th>
                        ${categoryList.map(cat => `<th>${cat}</th>`).join('')}
                        <th class="matrix-total">합계</th>
                    </tr>
                </thead>
                <tbody>
                    ${teamList.map(team => `
                        <tr>
                            <td>${team}</td>
                            ${categoryList.map(cat => {
                                const count = matrix[team]?.[cat]?.total || 0;
                                const valueClass = count === 0 ? 'zero' : 
                                                   count >= maxValue * 0.7 ? 'high' : 
                                                   count >= maxValue * 0.3 ? 'medium' : '';
                                return `<td class="matrix-cell">
                                    <span class="matrix-cell-value ${valueClass}">${count}</span>
                                </td>`;
                            }).join('')}
                            <td class="matrix-total">${teamTotals[team]}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td class="matrix-total">합계</td>
                        ${categoryList.map(cat => `<td class="matrix-total">${categoryTotals[cat] || 0}</td>`).join('')}
                        <td class="matrix-total">${grandTotal}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// ===== 고급 분석 기능 =====

// 주별/월별/분기별 분석 데이터 생성
function generatePeriodAnalysis() {
    if (!analyticsData || !analyticsData.requests) return null;
    
    const requests = analyticsData.requests;
    const now = new Date();
    
    // 주별 분석 (최근 12주)
    const weeklyData = {};
    for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (i * 7));
        const weekKey = `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getDate() + weekStart.getDay()) / 7).toString().padStart(2, '0')}`;
        weeklyData[weekKey] = { submitted: 0, completed: 0, avgProcessingDays: 0, totalProcessingDays: 0, completedCount: 0 };
    }
    
    // 월별 분석 (최근 12개월)
    const monthlyData = {};
    for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = { submitted: 0, completed: 0, avgProcessingDays: 0, totalProcessingDays: 0, completedCount: 0 };
    }
    
    // 분기별 분석 (최근 4분기)
    const quarterlyData = {};
    for (let i = 3; i >= 0; i--) {
        const quarterMonth = now.getMonth() - (i * 3);
        const quarterYear = now.getFullYear() + Math.floor(quarterMonth / 12);
        const quarter = Math.floor(((quarterMonth % 12) + 12) % 12 / 3) + 1;
        const quarterKey = `${quarterYear}-Q${quarter}`;
        quarterlyData[quarterKey] = { submitted: 0, completed: 0, avgProcessingDays: 0, totalProcessingDays: 0, completedCount: 0 };
    }
    
    requests.forEach(r => {
        const createdAt = new Date(r.createdAt);
        const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        const quarter = Math.floor(createdAt.getMonth() / 3) + 1;
        const quarterKey = `${createdAt.getFullYear()}-Q${quarter}`;
        
        // 월별
        if (monthlyData[monthKey]) {
            monthlyData[monthKey].submitted++;
            if (r.status === 'completed' && r.completedAt) {
                monthlyData[monthKey].completed++;
                const days = (new Date(r.completedAt) - createdAt) / (24 * 60 * 60 * 1000);
                monthlyData[monthKey].totalProcessingDays += days;
                monthlyData[monthKey].completedCount++;
            }
        }
        
        // 분기별
        if (quarterlyData[quarterKey]) {
            quarterlyData[quarterKey].submitted++;
            if (r.status === 'completed' && r.completedAt) {
                quarterlyData[quarterKey].completed++;
                const days = (new Date(r.completedAt) - createdAt) / (24 * 60 * 60 * 1000);
                quarterlyData[quarterKey].totalProcessingDays += days;
                quarterlyData[quarterKey].completedCount++;
            }
        }
    });
    
    // 평균 처리일 계산
    Object.values(monthlyData).forEach(m => {
        m.avgProcessingDays = m.completedCount > 0 ? Math.round(m.totalProcessingDays / m.completedCount * 10) / 10 : 0;
        m.completionRate = m.submitted > 0 ? Math.round(m.completed / m.submitted * 100) : 0;
    });
    
    Object.values(quarterlyData).forEach(q => {
        q.avgProcessingDays = q.completedCount > 0 ? Math.round(q.totalProcessingDays / q.completedCount * 10) / 10 : 0;
        q.completionRate = q.submitted > 0 ? Math.round(q.completed / q.submitted * 100) : 0;
    });
    
    return { weekly: weeklyData, monthly: monthlyData, quarterly: quarterlyData };
}

// 담당자별 종합 역량 분석
function generateAssigneeAnalysis(assigneeId) {
    if (!analyticsData || !analyticsData.requests) return null;
    
    const assignee = analyticsData.assignees.find(a => a.id === assigneeId);
    const assignedRequests = analyticsData.requests.filter(r => {
        if (!r.assignee) return false;
        const aId = r.assignee.id || r.assignee.email || r.assignee.name;
        return aId === assigneeId;
    });
    
    if (assignedRequests.length === 0) return null;
    
    // 기본 통계
    const total = assignedRequests.length;
    const completed = assignedRequests.filter(r => r.status === 'completed').length;
    const inProgress = assignedRequests.filter(r => r.status === 'in_progress').length;
    const rejected = assignedRequests.filter(r => r.status === 'rejected').length;
    
    // 우선순위별 처리 현황
    const byPriority = { urgent: 0, high: 0, medium: 0, low: 0 };
    const completedByPriority = { urgent: 0, high: 0, medium: 0, low: 0 };
    assignedRequests.forEach(r => {
        const p = r.priority || 'medium';
        byPriority[p]++;
        if (r.status === 'completed') completedByPriority[p]++;
    });
    
    // 카테고리별 처리 현황
    const byCategory = {};
    assignedRequests.forEach(r => {
        const cat = r.category || '기타';
        if (!byCategory[cat]) byCategory[cat] = { total: 0, completed: 0 };
        byCategory[cat].total++;
        if (r.status === 'completed') byCategory[cat].completed++;
    });
    
    // 처리 시간 분석
    const completedWithTime = assignedRequests.filter(r => r.status === 'completed' && r.completedAt);
    const processingTimes = completedWithTime.map(r => 
        (new Date(r.completedAt) - new Date(r.createdAt)) / (24 * 60 * 60 * 1000)
    );
    
    const avgProcessingTime = processingTimes.length > 0 ? 
        Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length * 10) / 10 : 0;
    const minProcessingTime = processingTimes.length > 0 ? Math.round(Math.min(...processingTimes) * 10) / 10 : 0;
    const maxProcessingTime = processingTimes.length > 0 ? Math.round(Math.max(...processingTimes) * 10) / 10 : 0;
    
    // 월별 처리 추이
    const monthlyTrend = {};
    assignedRequests.forEach(r => {
        const month = r.createdAt.substring(0, 7);
        if (!monthlyTrend[month]) monthlyTrend[month] = { assigned: 0, completed: 0 };
        monthlyTrend[month].assigned++;
        if (r.status === 'completed') monthlyTrend[month].completed++;
    });
    
    // 평가 점수 분석 (요청자가 제출한 평가 데이터 활용)
    const evaluations = assignedRequests.filter(r => r.evaluation).map(r => r.evaluation);
    let avgScores = null;
    let scoreDistribution = null;
    let evaluationDetails = [];
    
    if (evaluations.length > 0) {
        // 정량적 평가 평균
        const quantitativeAvg = {
            speed: 0, accuracy: 0, completeness: 0, communication: 0
        };
        // 기술적 평가 평균
        const technicalAvg = {
            techLevel: 0, problemSolving: 0, documentation: 0
        };
        // 기술 태그 빈도
        const techTagsFrequency = {};
        // 추천 빈도
        const recommendationCount = {
            highly_recommend: 0, recommend: 0, neutral: 0, not_recommend: 0
        };
        
        evaluations.forEach(e => {
            // 정량적 평가
            if (e.quantitative) {
                quantitativeAvg.speed += e.quantitative.speed || 0;
                quantitativeAvg.accuracy += e.quantitative.accuracy || 0;
                quantitativeAvg.completeness += e.quantitative.completeness || 0;
                quantitativeAvg.communication += e.quantitative.communication || 0;
            }
            // 기술적 평가
            if (e.technical) {
                technicalAvg.techLevel += e.technical.techLevel || 0;
                technicalAvg.problemSolving += e.technical.problemSolving || 0;
                technicalAvg.documentation += e.technical.documentation || 0;
                // 기술 태그
                (e.technical.techTags || []).forEach(tag => {
                    techTagsFrequency[tag] = (techTagsFrequency[tag] || 0) + 1;
                });
            }
            // 추천
            if (e.qualitative?.recommendation) {
                recommendationCount[e.qualitative.recommendation]++;
            }
            
            // 평가 상세 내역
            evaluationDetails.push({
                evaluatedAt: e.evaluatedAt,
                evaluatedBy: e.evaluatedBy?.name,
                totalScore: e.totalScore,
                grade: e.grade,
                strengths: e.qualitative?.strengths,
                improvements: e.qualitative?.improvements,
                overallComment: e.qualitative?.overallComment,
                recommendation: e.qualitative?.recommendation
            });
        });
        
        const count = evaluations.length;
        avgScores = {
            // 정량적 평균 (5점 만점)
            speed: Math.round(quantitativeAvg.speed / count * 10) / 10,
            accuracy: Math.round(quantitativeAvg.accuracy / count * 10) / 10,
            completeness: Math.round(quantitativeAvg.completeness / count * 10) / 10,
            communication: Math.round(quantitativeAvg.communication / count * 10) / 10,
            // 기술적 평균 (10점 만점)
            techLevel: Math.round(technicalAvg.techLevel / count * 10) / 10,
            problemSolving: Math.round(technicalAvg.problemSolving / count * 10) / 10,
            documentation: Math.round(technicalAvg.documentation / count * 10) / 10,
            // 기술 태그
            techTags: Object.entries(techTagsFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([tag, freq]) => ({ tag, frequency: freq })),
            // 추천 비율
            recommendation: recommendationCount,
            recommendationRate: Math.round((recommendationCount.highly_recommend + recommendationCount.recommend) / count * 100)
        };
        
        // 종합 평균 계산
        avgScores.quantitativeOverall = Math.round(
            (avgScores.speed + avgScores.accuracy + avgScores.completeness + avgScores.communication) / 4 * 10
        ) / 10;
        avgScores.technicalOverall = Math.round(
            (avgScores.techLevel + avgScores.problemSolving + avgScores.documentation) / 3 * 10
        ) / 10;
        avgScores.overall = Math.round(
            (avgScores.quantitativeOverall / 5 * 50 + avgScores.technicalOverall / 10 * 50) * 10
        ) / 10;
        
        // 등급 분포
        scoreDistribution = { S: 0, A: 0, B: 0, C: 0, D: 0 };
        evaluations.forEach(e => {
            if (e.grade && scoreDistribution.hasOwnProperty(e.grade)) {
                scoreDistribution[e.grade]++;
            }
        });
    }
    
    // 정성적 평가 생성
    const qualitativeAssessment = generateQualitativeAssessment({
        completionRate: total > 0 ? completed / total * 100 : 0,
        avgProcessingTime,
        avgScores,
        urgentCompletionRate: byPriority.urgent > 0 ? completedByPriority.urgent / byPriority.urgent * 100 : 100,
        total
    });
    
    return {
        assignee,
        summary: { total, completed, inProgress, rejected },
        byPriority,
        completedByPriority,
        byCategory,
        processingTime: { avg: avgProcessingTime, min: minProcessingTime, max: maxProcessingTime },
        monthlyTrend,
        avgScores,
        scoreDistribution,
        evaluationDetails,
        evaluationCount: evaluations.length,
        qualitativeAssessment
    };
}

// 정성적 평가 생성
function generateQualitativeAssessment(metrics) {
    const assessments = [];
    const strengths = [];
    const improvements = [];
    
    // 완료율 평가
    if (metrics.completionRate >= 90) {
        strengths.push('뛰어난 업무 완료율을 보여주고 있습니다.');
        assessments.push({ category: '업무 완료', grade: 'A', comment: '매우 우수' });
    } else if (metrics.completionRate >= 70) {
        assessments.push({ category: '업무 완료', grade: 'B', comment: '양호' });
    } else if (metrics.completionRate >= 50) {
        improvements.push('업무 완료율을 높이기 위한 시간 관리가 필요합니다.');
        assessments.push({ category: '업무 완료', grade: 'C', comment: '보통' });
    } else {
        improvements.push('업무 완료율이 낮습니다. 업무 우선순위 조정이 필요합니다.');
        assessments.push({ category: '업무 완료', grade: 'D', comment: '개선 필요' });
    }
    
    // 처리 속도 평가
    if (metrics.avgProcessingTime > 0) {
        if (metrics.avgProcessingTime <= 3) {
            strengths.push('신속한 업무 처리 능력을 보유하고 있습니다.');
            assessments.push({ category: '처리 속도', grade: 'A', comment: '매우 빠름' });
        } else if (metrics.avgProcessingTime <= 5) {
            assessments.push({ category: '처리 속도', grade: 'B', comment: '빠름' });
        } else if (metrics.avgProcessingTime <= 7) {
            assessments.push({ category: '처리 속도', grade: 'C', comment: '보통' });
        } else {
            improvements.push('업무 처리 속도 개선이 필요합니다.');
            assessments.push({ category: '처리 속도', grade: 'D', comment: '개선 필요' });
        }
    }
    
    // 긴급 업무 처리 평가
    if (metrics.urgentCompletionRate >= 95) {
        strengths.push('긴급 업무에 대한 대응력이 뛰어납니다.');
        assessments.push({ category: '긴급 대응', grade: 'A', comment: '우수' });
    } else if (metrics.urgentCompletionRate >= 80) {
        assessments.push({ category: '긴급 대응', grade: 'B', comment: '양호' });
    } else {
        improvements.push('긴급 업무 처리율을 높여야 합니다.');
        assessments.push({ category: '긴급 대응', grade: 'C', comment: '보통' });
    }
    
    // 역량 점수 평가
    if (metrics.avgScores) {
        if (metrics.avgScores.overall >= 4.5) {
            strengths.push('전반적인 업무 역량이 매우 우수합니다.');
            assessments.push({ category: '종합 역량', grade: 'A', comment: '매우 우수' });
        } else if (metrics.avgScores.overall >= 4.0) {
            assessments.push({ category: '종합 역량', grade: 'B', comment: '우수' });
        } else if (metrics.avgScores.overall >= 3.5) {
            assessments.push({ category: '종합 역량', grade: 'C', comment: '양호' });
        } else {
            improvements.push('역량 개발을 위한 교육이 필요합니다.');
            assessments.push({ category: '종합 역량', grade: 'D', comment: '개선 필요' });
        }
        
        // 개별 역량 평가
        if (metrics.avgScores.technical >= 4.5) strengths.push('기술적 전문성이 뛰어납니다.');
        if (metrics.avgScores.communication >= 4.5) strengths.push('커뮤니케이션 능력이 우수합니다.');
        if (metrics.avgScores.efficiency >= 4.5) strengths.push('업무 효율성이 높습니다.');
        if (metrics.avgScores.quality >= 4.5) strengths.push('업무 품질이 우수합니다.');
        
        if (metrics.avgScores.technical < 3.5) improvements.push('기술 역량 강화가 필요합니다.');
        if (metrics.avgScores.communication < 3.5) improvements.push('커뮤니케이션 스킬 향상이 필요합니다.');
        if (metrics.avgScores.efficiency < 3.5) improvements.push('업무 효율성 개선이 필요합니다.');
        if (metrics.avgScores.quality < 3.5) improvements.push('업무 품질 향상에 집중해야 합니다.');
    }
    
    // 업무량 평가
    if (metrics.total >= 20) {
        strengths.push('많은 업무량을 소화하고 있습니다.');
    } else if (metrics.total >= 10) {
        assessments.push({ category: '업무량', grade: 'B', comment: '적정' });
    }
    
    // 종합 등급 산출
    const gradePoints = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    const avgGrade = assessments.reduce((sum, a) => sum + gradePoints[a.grade], 0) / assessments.length;
    let overallGrade = 'C';
    if (avgGrade >= 3.5) overallGrade = 'A';
    else if (avgGrade >= 2.5) overallGrade = 'B';
    else if (avgGrade >= 1.5) overallGrade = 'C';
    else overallGrade = 'D';
    
    return {
        overallGrade,
        assessments,
        strengths,
        improvements,
        summary: generateOverallSummary(overallGrade, strengths, improvements)
    };
}

// 종합 평가 요약 생성
function generateOverallSummary(grade, strengths, improvements) {
    const gradeDescriptions = {
        'A': '매우 우수한 업무 수행 능력을 보여주고 있습니다. 현재 수준을 유지하며 후배 양성에도 기여할 수 있습니다.',
        'B': '전반적으로 양호한 업무 성과를 보이고 있습니다. 일부 영역에서 추가 성장 가능성이 있습니다.',
        'C': '기본적인 업무 수행은 가능하나, 여러 영역에서 개선이 필요합니다.',
        'D': '업무 역량 향상을 위한 집중적인 관리와 교육이 필요합니다.'
    };
    
    return gradeDescriptions[grade] || '';
}

// 고급 담당자 분석 UI 렌더링
function renderAdvancedAssigneeAnalysis(assigneeId) {
    const analysis = generateAssigneeAnalysis(assigneeId);
    if (!analysis) return;
    
    const container = document.getElementById('performanceContent');
    if (!container) return;
    
    const qa = analysis.qualitativeAssessment;
    
    container.innerHTML = `
        <div class="advanced-analysis">
            <!-- 담당자 정보 헤더 -->
            <div class="analysis-header">
                <div class="assignee-profile">
                    <div class="assignee-avatar-lg">${analysis.assignee?.name?.charAt(0) || '?'}</div>
                    <div class="assignee-details">
                        <h3>${analysis.assignee?.name || '담당자'}</h3>
                        <p>${analysis.assignee?.team || '팀 미지정'} · ${analysis.assignee?.role || '담당자'}</p>
                    </div>
                </div>
                <div class="overall-grade grade-${qa.overallGrade}">
                    <span class="grade-label">종합 등급</span>
                    <span class="grade-value">${qa.overallGrade}</span>
                </div>
            </div>
            
            <!-- 정량적 지표 -->
            <div class="metrics-section">
                <h4>📊 정량적 지표</h4>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${analysis.summary.total}</div>
                        <div class="metric-label">총 처리 건수</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${analysis.summary.completed}</div>
                        <div class="metric-label">완료</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Math.round(analysis.summary.completed / analysis.summary.total * 100)}%</div>
                        <div class="metric-label">완료율</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${analysis.processingTime.avg}일</div>
                        <div class="metric-label">평균 처리시간</div>
                    </div>
                </div>
            </div>
            
            <!-- 우선순위별 처리 현황 -->
            <div class="priority-section">
                <h4>🎯 우선순위별 처리 현황</h4>
                <div class="priority-bars">
                    ${['urgent', 'high', 'medium', 'low'].map(p => {
                        const total = analysis.byPriority[p];
                        const completed = analysis.completedByPriority[p];
                        const rate = total > 0 ? Math.round(completed / total * 100) : 0;
                        const labels = { urgent: '긴급', high: '높음', medium: '보통', low: '낮음' };
                        return `
                            <div class="priority-bar-item">
                                <div class="priority-bar-label">
                                    <span class="priority-badge ${p}">${labels[p]}</span>
                                    <span>${completed}/${total}건 (${rate}%)</span>
                                </div>
                                <div class="priority-bar-track">
                                    <div class="priority-bar-fill ${p}" style="width: ${rate}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- 요청자 평가 점수 (새로운 평가 시스템) -->
            ${analysis.avgScores && analysis.evaluationCount > 0 ? `
                <div class="scores-section requester-evaluation">
                    <h4>⭐ 요청자 평가 결과 (${analysis.evaluationCount}건)</h4>
                    
                    <!-- 종합 점수 요약 -->
                    <div class="evaluation-summary-box">
                        <div class="overall-score-circle">
                            <span class="score-number">${analysis.avgScores.overall}</span>
                            <span class="score-label">종합 점수</span>
                        </div>
                        <div class="score-breakdown">
                            <div class="breakdown-item">
                                <span class="breakdown-label">정량적 평가</span>
                                <span class="breakdown-value">${analysis.avgScores.quantitativeOverall}/5</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">기술적 평가</span>
                                <span class="breakdown-value">${analysis.avgScores.technicalOverall}/10</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="breakdown-label">재의뢰 의향</span>
                                <span class="breakdown-value positive">${analysis.avgScores.recommendationRate}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="scores-container">
                        <!-- 정량적 평가 상세 -->
                        <div class="scores-group">
                            <h5>📊 정량적 평가 (5점 만점)</h5>
                            <div class="score-detail-item">
                                <span class="score-detail-label">처리 속도</span>
                                <div class="score-detail-bar">
                                    <div class="score-detail-fill quantitative" style="width: ${analysis.avgScores.speed * 20}%"></div>
                                </div>
                                <span class="score-detail-value">${analysis.avgScores.speed}</span>
                            </div>
                            <div class="score-detail-item">
                                <span class="score-detail-label">정확성</span>
                                <div class="score-detail-bar">
                                    <div class="score-detail-fill quantitative" style="width: ${analysis.avgScores.accuracy * 20}%"></div>
                                </div>
                                <span class="score-detail-value">${analysis.avgScores.accuracy}</span>
                            </div>
                            <div class="score-detail-item">
                                <span class="score-detail-label">완성도</span>
                                <div class="score-detail-bar">
                                    <div class="score-detail-fill quantitative" style="width: ${analysis.avgScores.completeness * 20}%"></div>
                                </div>
                                <span class="score-detail-value">${analysis.avgScores.completeness}</span>
                            </div>
                            <div class="score-detail-item">
                                <span class="score-detail-label">커뮤니케이션</span>
                                <div class="score-detail-bar">
                                    <div class="score-detail-fill quantitative" style="width: ${analysis.avgScores.communication * 20}%"></div>
                                </div>
                                <span class="score-detail-value">${analysis.avgScores.communication}</span>
                            </div>
                        </div>
                        
                        <!-- 기술적 평가 상세 -->
                        <div class="scores-group">
                            <h5>🔧 기술적 평가 (10점 만점)</h5>
                            <div class="score-detail-item">
                                <span class="score-detail-label">기술 수준</span>
                                <div class="score-detail-bar">
                                    <div class="score-detail-fill technical" style="width: ${analysis.avgScores.techLevel * 10}%"></div>
                                </div>
                                <span class="score-detail-value">${analysis.avgScores.techLevel}</span>
                            </div>
                            <div class="score-detail-item">
                                <span class="score-detail-label">문제 해결</span>
                                <div class="score-detail-bar">
                                    <div class="score-detail-fill technical" style="width: ${analysis.avgScores.problemSolving * 10}%"></div>
                                </div>
                                <span class="score-detail-value">${analysis.avgScores.problemSolving}</span>
                            </div>
                            <div class="score-detail-item">
                                <span class="score-detail-label">문서화</span>
                                <div class="score-detail-bar">
                                    <div class="score-detail-fill technical" style="width: ${analysis.avgScores.documentation * 10}%"></div>
                                </div>
                                <span class="score-detail-value">${analysis.avgScores.documentation}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 기술 태그 -->
                    ${analysis.avgScores.techTags?.length > 0 ? `
                        <div class="tech-tags-section">
                            <h5>🏷️ 주요 기술 역량</h5>
                            <div class="tech-tags-list">
                                ${analysis.avgScores.techTags.map(t => `
                                    <span class="tech-tag-badge">
                                        ${t.tag}
                                        <span class="tag-count">${t.frequency}</span>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- 등급 분포 -->
                    ${analysis.scoreDistribution ? `
                        <div class="grade-distribution-section">
                            <h5>📈 평가 등급 분포</h5>
                            <div class="grade-distribution">
                                ${['S', 'A', 'B', 'C', 'D'].map(grade => `
                                    <div class="grade-bar-item">
                                        <span class="grade-label grade-${grade}">${grade}</span>
                                        <div class="grade-bar-track">
                                            <div class="grade-bar-fill grade-${grade}" style="width: ${analysis.evaluationCount > 0 ? (analysis.scoreDistribution[grade] / analysis.evaluationCount * 100) : 0}%"></div>
                                        </div>
                                        <span class="grade-count">${analysis.scoreDistribution[grade]}건</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- 최근 평가 내역 -->
                    ${analysis.evaluationDetails?.length > 0 ? `
                        <div class="recent-evaluations-section">
                            <h5>📝 최근 평가 내역</h5>
                            <div class="evaluation-list">
                                ${analysis.evaluationDetails.slice(0, 5).map(e => `
                                    <div class="evaluation-item">
                                        <div class="evaluation-item-header">
                                            <span class="evaluation-grade grade-${e.grade}">${e.grade}</span>
                                            <span class="evaluation-score">${e.totalScore}점</span>
                                            <span class="evaluation-date">${new Date(e.evaluatedAt).toLocaleDateString('ko-KR')}</span>
                                            <span class="evaluation-by">${e.evaluatedBy || '-'}</span>
                                        </div>
                                        ${e.overallComment ? `
                                            <p class="evaluation-comment">"${e.overallComment}"</p>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            ` : analysis.avgScores ? `
                <div class="scores-section">
                    <h4>⭐ 역량 평가 점수</h4>
                    <div class="no-evaluation-notice">
                        <p>아직 요청자 평가가 없습니다.</p>
                        <p class="text-muted">완료된 신청서에 대해 요청자가 평가를 제출하면 여기에 표시됩니다.</p>
                    </div>
                </div>
            ` : ''}
            
            <!-- 정성적 평가 -->
            <div class="qualitative-section">
                <h4>📝 정성적 평가</h4>
                
                <div class="assessment-grid">
                    ${qa.assessments.map(a => `
                        <div class="assessment-item grade-${a.grade}">
                            <span class="assessment-category">${a.category}</span>
                            <span class="assessment-grade">${a.grade}</span>
                            <span class="assessment-comment">${a.comment}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${qa.strengths.length > 0 ? `
                    <div class="strengths-box">
                        <h5>💪 강점</h5>
                        <ul>
                            ${qa.strengths.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${qa.improvements.length > 0 ? `
                    <div class="improvements-box">
                        <h5>📈 개선 필요 사항</h5>
                        <ul>
                            ${qa.improvements.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="summary-box">
                    <h5>📋 종합 평가</h5>
                    <p>${qa.summary}</p>
                </div>
            </div>
            
            <!-- 월별 추이 차트 -->
            <div class="trend-section">
                <h4>📈 월별 업무 처리 추이</h4>
                <div class="trend-chart-container">
                    <canvas id="monthlyTrendChart"></canvas>
                </div>
            </div>
            
            <!-- 카테고리별 처리 현황 -->
            <div class="category-section">
                <h4>📁 카테고리별 처리 현황</h4>
                <div class="category-list">
                    ${Object.entries(analysis.byCategory).map(([cat, data]) => `
                        <div class="category-item">
                            <span class="category-name">${cat}</span>
                            <div class="category-bar-container">
                                <div class="category-bar" style="width: ${data.total > 0 ? (data.completed / data.total * 100) : 0}%"></div>
                            </div>
                            <span class="category-stats">${data.completed}/${data.total}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    // 차트 렌더링
    setTimeout(() => {
        if (analysis.avgScores) {
            renderAdvancedRadarChart(analysis.avgScores);
        }
        renderMonthlyTrendChart(analysis.monthlyTrend);
    }, 100);
}

function renderAdvancedRadarChart(scores) {
    const ctx = document.getElementById('advancedRadarChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['기술력', '커뮤니케이션', '효율성', '품질'],
            datasets: [{
                label: '역량 점수',
                data: [scores.technical, scores.communication, scores.efficiency, scores.quality],
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: '#8b5cf6',
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#8b5cf6',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 1, color: getComputedStyle(document.body).getPropertyValue('--text-muted') },
                    grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') },
                    pointLabels: { color: getComputedStyle(document.body).getPropertyValue('--text-primary'), font: { size: 12, weight: '500' } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderMonthlyTrendChart(data) {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx) return;
    
    const sortedMonths = Object.keys(data).sort();
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMonths.map(m => m.substring(5) + '월'),
            datasets: [
                {
                    label: '배정',
                    data: sortedMonths.map(m => data[m].assigned),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                },
                {
                    label: '완료',
                    data: sortedMonths.map(m => data[m].completed),
                    backgroundColor: '#22c55e',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') } }
            },
            scales: {
                x: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') }, grid: { display: false } },
                y: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-muted') }, grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') } }
            }
        }
    });
}

// 부서별 종합 분석
function generateDepartmentAnalysis(departmentId) {
    if (!analyticsData || !analyticsData.requests) return null;
    
    const deptRequests = analyticsData.requests.filter(r => {
        const cat = r.category || '기타';
        return cat === departmentId || cat.toLowerCase() === departmentId.toLowerCase();
    });
    
    if (deptRequests.length === 0) return null;
    
    // 담당자별 성과 집계
    const assigneePerformance = {};
    deptRequests.forEach(r => {
        if (r.assignee) {
            const aId = r.assignee.id || r.assignee.name;
            if (!assigneePerformance[aId]) {
                assigneePerformance[aId] = {
                    name: r.assignee.name,
                    total: 0,
                    completed: 0,
                    totalProcessingDays: 0
                };
            }
            assigneePerformance[aId].total++;
            if (r.status === 'completed') {
                assigneePerformance[aId].completed++;
                if (r.completedAt) {
                    assigneePerformance[aId].totalProcessingDays += 
                        (new Date(r.completedAt) - new Date(r.createdAt)) / (24 * 60 * 60 * 1000);
                }
            }
        }
    });
    
    // 성과 순위 계산
    const rankedAssignees = Object.entries(assigneePerformance)
        .map(([id, data]) => ({
            id,
            ...data,
            completionRate: data.total > 0 ? Math.round(data.completed / data.total * 100) : 0,
            avgProcessingDays: data.completed > 0 ? Math.round(data.totalProcessingDays / data.completed * 10) / 10 : 0
        }))
        .sort((a, b) => b.completed - a.completed);
    
    return {
        departmentId,
        totalRequests: deptRequests.length,
        completed: deptRequests.filter(r => r.status === 'completed').length,
        rankedAssignees,
        topPerformer: rankedAssignees[0] || null
    };
}

// ===== 유틸리티 =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 전역 함수 노출
window.switchView = switchView;
window.toggleDatePicker = toggleDatePicker;
window.setDateRange = setDateRange;
window.refreshData = refreshData;
window.loadUserWorkload = loadUserWorkload;
window.loadAssigneePerformance = loadAssigneePerformance;
window.renderAdvancedAssigneeAnalysis = renderAdvancedAssigneeAnalysis;
window.generatePeriodAnalysis = generatePeriodAnalysis;
window.generateDepartmentAnalysis = generateDepartmentAnalysis;
window.renderDepartmentMemberNodes = renderDepartmentMemberNodes;
window.selectMemberForAnalysis = selectMemberForAnalysis;
window.selectDepartment = selectDepartment;

