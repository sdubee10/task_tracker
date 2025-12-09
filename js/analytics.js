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
        return;
    }
    
    select.innerHTML = '<option value="">사용자 선택</option>' +
        analyticsData.users.map(u => `<option value="${u.id}">${u.name} (${u.team})</option>`).join('');
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

