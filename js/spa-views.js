// ===== SPA Views =====
// View components for the single page application

const Views = {
    // ===== Dashboard View =====
    dashboard: {
        render: async (params) => {
            const requests = Views.getRequests();
            const stats = Views.calculateStats(requests);
            const currentUser = Views.getCurrentUser();
            
            // 내가 담당해야 할 신청서 (내 부서로 온 요청)
            const myDeptRequests = requests.filter(r => 
                r.targetTeam?.name?.includes(currentUser?.department || '') ||
                r.templateCategory === currentUser?.department
            );
            
            return `
                <div class="view-container">
                    <div class="view-header">
                        <h1>📊 대시보드</h1>
                        <div class="view-header-actions">
                            <button class="btn btn-primary" onclick="router.navigate('/request-form')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                새 신청서
                            </button>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                            </div>
                            <div class="stat-content">
                                <span class="stat-label">총 신청서</span>
                                <span class="stat-value">${stats.total}</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon green">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                            </div>
                            <div class="stat-content">
                                <span class="stat-label">완료</span>
                                <span class="stat-value">${stats.completed}</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon yellow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div class="stat-content">
                                <span class="stat-label">처리 중</span>
                                <span class="stat-value">${stats.inProgress}</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon purple">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                </svg>
                            </div>
                            <div class="stat-content">
                                <span class="stat-label">대기</span>
                                <span class="stat-value">${stats.pending}</span>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-grid">
                        <div class="charts-grid">
                            <div class="chart-card">
                                <div class="chart-header">
                                    <h3>📈 카테고리별 분포</h3>
                                </div>
                                <div class="chart-body">
                                    <canvas id="categoryChart"></canvas>
                                </div>
                            </div>
                            <div class="chart-card">
                                <div class="chart-header">
                                    <h3>🔄 상태별 현황</h3>
                                </div>
                                <div class="chart-body">
                                    <canvas id="statusChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-card-header">
                            <h3>📥 접수 대기 신청서</h3>
                            <span class="badge badge-warning">${requests.filter(r => r.status === 'submitted').length}건</span>
                        </div>
                        <div class="section-card-body">
                            ${Views.renderPendingRequests(requests.filter(r => r.status === 'submitted').slice(0, 5))}
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-card-header">
                            <h3>📋 최근 신청서</h3>
                            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="router.navigate('/requests')">전체 보기</button>
                        </div>
                        <div class="section-card-body">
                            ${Views.renderRecentRequests(requests.slice(0, 5))}
                        </div>
                    </div>
                </div>
            `;
        },
        
        afterRender: () => {
            const requests = Views.getRequests();
            Views.renderDashboardCharts(requests);
        }
    },

    // ===== Requests List View =====
    requests: {
        currentFilter: 'all',
        currentSort: { field: 'createdAt', order: 'desc' },
        searchTerm: '',
        
        render: async (params) => {
            const requests = Views.getRequests();
            Views.requests.currentFilter = params.filter || 'all';
            
            return `
                <div class="view-container">
                    <div class="view-header">
                        <h1>📋 신청서 목록</h1>
                        <div class="view-header-actions">
                            <button class="btn btn-primary" onclick="router.navigate('/request-form')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                새 신청서
                            </button>
                        </div>
                    </div>

                    <div class="request-list-controls">
                        <div class="search-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="M21 21l-4.35-4.35"/>
                            </svg>
                            <input type="text" id="requestSearch" placeholder="신청서 ID, 제목, 요청자로 검색..." oninput="Views.handleSearch(this.value)">
                        </div>
                        
                        <div class="filter-controls">
                            <div class="filter-group">
                                <label>상태</label>
                                <select id="statusFilter" onchange="Views.handleStatusFilter(this.value)">
                                    <option value="all" ${Views.requests.currentFilter === 'all' ? 'selected' : ''}>전체</option>
                                    <option value="submitted" ${Views.requests.currentFilter === 'submitted' ? 'selected' : ''}>제출됨</option>
                                    <option value="in_progress" ${Views.requests.currentFilter === 'in_progress' ? 'selected' : ''}>처리 중</option>
                                    <option value="completed" ${Views.requests.currentFilter === 'completed' ? 'selected' : ''}>완료</option>
                                    <option value="rejected" ${Views.requests.currentFilter === 'rejected' ? 'selected' : ''}>반려</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>우선순위</label>
                                <select id="priorityFilter" onchange="Views.handlePriorityFilter(this.value)">
                                    <option value="all">전체</option>
                                    <option value="urgent">긴급</option>
                                    <option value="high">높음</option>
                                    <option value="medium">보통</option>
                                    <option value="low">낮음</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>카테고리</label>
                                <select id="categoryFilter" onchange="Views.handleCategoryFilter(this.value)">
                                    <option value="all">전체</option>
                                    <option value="DBA">DBA</option>
                                    <option value="Frontend">Frontend</option>
                                    <option value="Backend">Backend</option>
                                    <option value="Infra">Infra</option>
                                    <option value="QA">QA</option>
                                    <option value="보안">보안</option>
                                    <option value="기획">기획</option>
                                    <option value="공통">공통</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>처리 부서</label>
                                <select id="targetTeamFilter" onchange="Views.handleTargetTeamFilter(this.value)">
                                    <option value="all">전체</option>
                                    <option value="DBA">DBA팀</option>
                                    <option value="Frontend">Frontend팀</option>
                                    <option value="Backend">Backend팀</option>
                                    <option value="Infra">Infra팀</option>
                                    <option value="QA">QA팀</option>
                                    <option value="보안">보안팀</option>
                                    <option value="기획">기획팀</option>
                                    <option value="공통">공통</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>처리자</label>
                                <select id="assigneeFilter" onchange="Views.handleAssigneeFilter(this.value)">
                                    <option value="all">전체</option>
                                    ${Views.getAssigneeOptions(requests)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-card-body" id="requestsList">
                            ${Views.renderRequestTable(requests)}
                        </div>
                    </div>
                    
                    <div class="list-summary" id="listSummary">
                        총 <strong>${requests.length}</strong>건의 신청서
                    </div>
                </div>
            `;
        },
        
        afterRender: () => {
            Views.refreshRequestTable();
        }
    },

    // ===== Request Form View =====
    // 기존의 완전한 기능을 가진 request-form.html을 iframe으로 로드
    requestForm: {
        render: async (params) => {
            return `
                <div class="view-container" style="padding: 0; height: 100%; overflow: hidden;">
                    <iframe 
                        src="request-form.html" 
                        style="width: 100%; height: 100%; border: none;"
                        title="신청서 작성"
                    ></iframe>
                </div>
            `;
        }
    },

    // ===== Analytics View =====
    // 기존의 완전한 기능을 가진 analytics-dashboard.html을 iframe으로 로드
    analytics: {
        render: async (params) => {
            return `
                <div class="view-container" style="padding: 0; height: 100%; overflow: hidden;">
                    <iframe 
                        src="analytics-dashboard.html" 
                        style="width: 100%; height: 100%; border: none;"
                        title="업무 분석"
                    ></iframe>
                </div>
            `;
        }
    },

    // ===== Graph View =====
    // 기존의 완전한 기능을 가진 request-graph.html을 iframe으로 로드
    graph: {
        render: async (params) => {
            return `
                <div class="view-container" style="padding: 0; height: 100%; overflow: hidden;">
                    <iframe 
                        src="request-graph.html" 
                        style="width: 100%; height: 100%; border: none;"
                        title="신청서 관계 그래프"
                    ></iframe>
                </div>
            `;
        }
    },

    // ===== Form Builder View =====
    // 기존의 완전한 기능을 가진 form-builder.html을 iframe으로 로드
    formBuilder: {
        render: async (params) => {
            return `
                <div class="view-container" style="padding: 0; height: 100%; overflow: hidden;">
                    <iframe 
                        src="form-builder.html" 
                        style="width: 100%; height: 100%; border: none;"
                        title="요청서 빌더"
                    ></iframe>
                </div>
            `;
        }
    },

    // ===== Request Detail View =====
    requestDetail: {
        render: async (params) => {
            const requestId = params.id;
            const requests = Views.getRequests();
            const request = requests.find(r => r.id === requestId);
            const currentUser = Views.getCurrentUser();
            
            if (!request) {
                return `
                    <div class="view-container">
                        <div class="empty-state">
                            <h3>신청서를 찾을 수 없습니다</h3>
                            <button class="btn btn-primary" onclick="router.navigate('/requests')">목록으로</button>
                        </div>
                    </div>
                `;
            }
            
            const categoryIcons = {
                'DBA': '🗄️', 'Frontend': '🎨', 'Backend': '⚙️', 'Infra': '🖥️',
                '공통': '📋', 'QA': '🧪', '보안': '🔒', '기획': '📝'
            };
            
            const statusLabels = {
                submitted: '제출됨', in_progress: '처리 중', completed: '완료', rejected: '반려', draft: '임시저장'
            };
            
            const priorityLabels = {
                low: '낮음', medium: '보통', high: '높음', urgent: '긴급'
            };
            
            return `
                <div class="view-container">
                    <div class="view-header">
                        <div class="view-header-left">
                            <button class="btn btn-icon" onclick="router.navigate('/requests')" title="목록으로">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 12H5"/>
                                    <polyline points="12 19 5 12 12 5"/>
                                </svg>
                            </button>
                            <h1>${categoryIcons[request.templateCategory] || '📄'} ${request.title || '신청서'}</h1>
                        </div>
                        <div class="view-header-actions">
                            <span class="request-status-badge ${request.status}">${statusLabels[request.status] || request.status}</span>
                        </div>
                    </div>

                    <div class="request-detail-grid">
                        <div class="request-detail-main">
                            <div class="section-card">
                                <div class="section-card-header">
                                    <h3>📋 신청서 정보</h3>
                                </div>
                                <div class="section-card-body">
                                    <div class="detail-info-grid">
                                        <div class="detail-info-item">
                                            <label>신청서 ID</label>
                                            <span>${request.id}</span>
                                        </div>
                                        <div class="detail-info-item">
                                            <label>카테고리</label>
                                            <span>${request.templateCategory || '-'}</span>
                                        </div>
                                        <div class="detail-info-item">
                                            <label>우선순위</label>
                                            <span class="priority-badge ${request.priority}">${priorityLabels[request.priority] || '보통'}</span>
                                        </div>
                                        <div class="detail-info-item">
                                            <label>마감일</label>
                                            <span>${request.dueDate ? new Date(request.dueDate).toLocaleDateString('ko-KR') : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="section-card">
                                <div class="section-card-header">
                                    <h3>👤 요청자 정보</h3>
                                </div>
                                <div class="section-card-body">
                                    <div class="detail-info-grid">
                                        <div class="detail-info-item">
                                            <label>요청자</label>
                                            <span>${request.requester?.name || '-'}</span>
                                        </div>
                                        <div class="detail-info-item">
                                            <label>부서/팀</label>
                                            <span>${request.requester?.team || '-'}</span>
                                        </div>
                                        <div class="detail-info-item">
                                            <label>요청일</label>
                                            <span>${request.createdAt ? new Date(request.createdAt).toLocaleString('ko-KR') : '-'}</span>
                                        </div>
                                        <div class="detail-info-item">
                                            <label>제출일</label>
                                            <span>${request.submittedAt ? new Date(request.submittedAt).toLocaleString('ko-KR') : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="section-card">
                                <div class="section-card-header">
                                    <h3>📝 요청 내용</h3>
                                    <span class="template-name-badge">${request.templateName || request.templateCategory || '일반 요청서'}</span>
                                </div>
                                <div class="section-card-body">
                                    ${Views.renderFullFormDetails(request)}
                                </div>
                            </div>
                        </div>

                        <div class="request-detail-sidebar">
                            <div class="section-card">
                                <div class="section-card-header">
                                    <h3>⚡ 처리</h3>
                                </div>
                                <div class="section-card-body">
                                    <div class="action-buttons">
                                        ${request.status === 'submitted' ? `
                                            <button class="btn btn-primary btn-full" onclick="Views.acceptRequest('${request.id}')">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                                </svg>
                                                접수하기
                                            </button>
                                            <button class="btn btn-danger btn-full" onclick="Views.rejectRequest('${request.id}')">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                                </svg>
                                                반려하기
                                            </button>
                                        ` : ''}
                                        ${request.status === 'in_progress' ? `
                                            <button class="btn btn-success btn-full" onclick="Views.completeRequest('${request.id}')">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                                </svg>
                                                처리 완료
                                            </button>
                                        ` : ''}
                                        ${request.status === 'completed' ? `
                                            <div class="completed-info">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                                </svg>
                                                <span>처리 완료됨</span>
                                                ${request.completedAt ? `<small>${new Date(request.completedAt).toLocaleString('ko-KR')}</small>` : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>

                            <div class="section-card">
                                <div class="section-card-header">
                                    <h3>👥 담당자</h3>
                                    ${request.status !== 'completed' && request.status !== 'rejected' ? `
                                        <button class="btn btn-sm btn-secondary" onclick="Views.openAssignModal('${request.id}')">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                <circle cx="8.5" cy="7" r="4"/>
                                                <line x1="20" y1="8" x2="20" y2="14"/>
                                                <line x1="23" y1="11" x2="17" y2="11"/>
                                            </svg>
                                            담당자 지정
                                        </button>
                                    ` : ''}
                                </div>
                                <div class="section-card-body">
                                    ${request.assignees && request.assignees.length > 0 ? `
                                        <div class="assignee-list">
                                            ${request.assignees.map((a, idx) => `
                                                <div class="assignee-item">
                                                    <div class="assignee-avatar">${a.name?.charAt(0) || '?'}</div>
                                                    <div class="assignee-info">
                                                        <span class="assignee-name">${a.name}</span>
                                                        <span class="assignee-role">${a.team || a.role || '-'}</span>
                                                    </div>
                                                    ${request.status !== 'completed' && request.status !== 'rejected' ? `
                                                        <button class="btn-icon-sm btn-remove-assignee" onclick="Views.removeAssignee('${request.id}', ${idx})" title="담당자 제거">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                <line x1="18" y1="6" x2="6" y2="18"/>
                                                                <line x1="6" y1="6" x2="18" y2="18"/>
                                                            </svg>
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                        ${request.status !== 'completed' && request.status !== 'rejected' ? `
                                            <div class="assignee-actions">
                                                <button class="btn btn-outline btn-sm" onclick="Views.assignSelf('${request.id}')">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                        <circle cx="12" cy="7" r="4"/>
                                                    </svg>
                                                    내가 담당하기
                                                </button>
                                            </div>
                                        ` : ''}
                                    ` : `
                                        <div class="empty-assignee">
                                            <p>담당자가 배정되지 않았습니다</p>
                                            ${request.status !== 'completed' && request.status !== 'rejected' ? `
                                                <div class="assignee-actions">
                                                    <button class="btn btn-primary btn-sm" onclick="Views.assignSelf('${request.id}')">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                            <circle cx="12" cy="7" r="4"/>
                                                        </svg>
                                                        내가 담당하기
                                                    </button>
                                                    <button class="btn btn-secondary btn-sm" onclick="Views.openAssignModal('${request.id}')">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                            <circle cx="8.5" cy="7" r="4"/>
                                                            <line x1="20" y1="8" x2="20" y2="14"/>
                                                            <line x1="23" y1="11" x2="17" y2="11"/>
                                                        </svg>
                                                        다른 담당자 지정
                                                    </button>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `}
                                </div>
                            </div>

                            <div class="section-card">
                                <div class="section-card-header">
                                    <h3>📜 처리 이력</h3>
                                </div>
                                <div class="section-card-body">
                                    <div class="history-timeline">
                                        ${request.history && request.history.length > 0 ? 
                                            request.history.map(h => `
                                                <div class="history-item">
                                                    <div class="history-dot ${h.type}"></div>
                                                    <div class="history-content">
                                                        <span class="history-action">${h.action}</span>
                                                        <span class="history-time">${new Date(h.timestamp).toLocaleString('ko-KR')}</span>
                                                        ${h.user ? `<span class="history-user">${h.user}</span>` : ''}
                                                    </div>
                                                </div>
                                            `).join('') : `
                                            <div class="history-item">
                                                <div class="history-dot submitted"></div>
                                                <div class="history-content">
                                                    <span class="history-action">신청서 제출</span>
                                                    <span class="history-time">${request.submittedAt ? new Date(request.submittedAt).toLocaleString('ko-KR') : '-'}</span>
                                                    <span class="history-user">${request.requester?.name || '-'}</span>
                                                </div>
                                            </div>
                                        `}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // ===== Helper Functions =====
    getRequests: () => {
        return JSON.parse(localStorage.getItem('taskflowRequests') || '[]');
    },
    
    saveRequests: (requests) => {
        localStorage.setItem('taskflowRequests', JSON.stringify(requests));
    },
    
    getCurrentUser: () => {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    calculateStats: (requests) => {
        return {
            total: requests.length,
            completed: requests.filter(r => r.status === 'completed').length,
            inProgress: requests.filter(r => r.status === 'in_progress').length,
            pending: requests.filter(r => ['submitted', 'draft'].includes(r.status)).length
        };
    },
    
    // 신청서 접수
    acceptRequest: (requestId) => {
        const requests = Views.getRequests();
        const request = requests.find(r => r.id === requestId);
        const currentUser = Views.getCurrentUser();
        
        if (request) {
            request.status = 'in_progress';
            request.acceptedAt = new Date().toISOString();
            request.acceptedBy = currentUser?.name || '담당자';
            
            // 담당자 배정
            if (!request.assignees) request.assignees = [];
            if (currentUser && !request.assignees.find(a => a.id === currentUser.id)) {
                request.assignees.push({
                    id: currentUser.id,
                    name: currentUser.name,
                    role: currentUser.role || '담당자'
                });
            }
            
            // 이력 추가
            if (!request.history) request.history = [];
            request.history.push({
                type: 'accepted',
                action: '신청서 접수',
                timestamp: new Date().toISOString(),
                user: currentUser?.name || '담당자'
            });
            
            Views.saveRequests(requests);
            Views.showToast('신청서를 접수했습니다.', 'success');
            router.navigate(`/request/${requestId}`);
        }
    },
    
    // 신청서 반려
    rejectRequest: (requestId) => {
        const reason = prompt('반려 사유를 입력해주세요:');
        if (!reason) return;
        
        const requests = Views.getRequests();
        const request = requests.find(r => r.id === requestId);
        const currentUser = Views.getCurrentUser();
        
        if (request) {
            request.status = 'rejected';
            request.rejectedAt = new Date().toISOString();
            request.rejectedBy = currentUser?.name || '담당자';
            request.rejectReason = reason;
            
            // 이력 추가
            if (!request.history) request.history = [];
            request.history.push({
                type: 'rejected',
                action: `신청서 반려: ${reason}`,
                timestamp: new Date().toISOString(),
                user: currentUser?.name || '담당자'
            });
            
            Views.saveRequests(requests);
            Views.showToast('신청서를 반려했습니다.', 'warning');
            router.navigate(`/request/${requestId}`);
        }
    },
    
    // 신청서 처리 완료
    completeRequest: (requestId) => {
        const requests = Views.getRequests();
        const request = requests.find(r => r.id === requestId);
        const currentUser = Views.getCurrentUser();
        
        if (request) {
            request.status = 'completed';
            request.completedAt = new Date().toISOString();
            request.completedBy = currentUser?.name || '담당자';
            
            // 이력 추가
            if (!request.history) request.history = [];
            request.history.push({
                type: 'completed',
                action: '처리 완료',
                timestamp: new Date().toISOString(),
                user: currentUser?.name || '담당자'
            });
            
            Views.saveRequests(requests);
            Views.showToast('신청서 처리가 완료되었습니다.', 'success');
            router.navigate(`/request/${requestId}`);
        }
    },
    
    // 담당자 자신 배정
    assignSelf: (requestId) => {
        const requests = Views.getRequests();
        const request = requests.find(r => r.id === requestId);
        const currentUser = Views.getCurrentUser();
        
        if (request && currentUser) {
            if (!request.assignees) request.assignees = [];
            
            // 이미 배정되어 있는지 확인
            if (request.assignees.find(a => a.id === currentUser.id || a.name === currentUser.name)) {
                Views.showToast('이미 담당자로 배정되어 있습니다.', 'warning');
                return;
            }
            
            request.assignees.push({
                id: currentUser.id,
                name: currentUser.name,
                team: currentUser.team || '',
                role: currentUser.role || '담당자',
                email: currentUser.email || ''
            });
            
            // 상태가 submitted이면 in_progress로 변경
            if (request.status === 'submitted') {
                request.status = 'in_progress';
            }
            
            // 이력 추가
            if (!request.history) request.history = [];
            request.history.push({
                type: 'assigned',
                action: `담당자 배정: ${currentUser.name}`,
                timestamp: new Date().toISOString(),
                user: currentUser.name
            });
            
            Views.saveRequests(requests);
            Views.showToast('담당자로 배정되었습니다.', 'success');
            router.navigate(`/request/${requestId}`);
        } else {
            Views.showToast('로그인이 필요합니다.', 'error');
        }
    },
    
    // 담당자 제거
    removeAssignee: (requestId, assigneeIndex) => {
        const requests = Views.getRequests();
        const request = requests.find(r => r.id === requestId);
        const currentUser = Views.getCurrentUser();
        
        if (request && request.assignees && request.assignees[assigneeIndex]) {
            const removedAssignee = request.assignees[assigneeIndex];
            request.assignees.splice(assigneeIndex, 1);
            
            // 이력 추가
            if (!request.history) request.history = [];
            request.history.push({
                type: 'unassigned',
                action: `담당자 제거: ${removedAssignee.name}`,
                timestamp: new Date().toISOString(),
                user: currentUser?.name || 'System'
            });
            
            Views.saveRequests(requests);
            Views.showToast('담당자가 제거되었습니다.', 'info');
            router.navigate(`/request/${requestId}`);
        }
    },
    
    // 담당자 지정 모달 열기
    openAssignModal: (requestId) => {
        const request = Views.getRequests().find(r => r.id === requestId);
        if (!request) return;
        
        // 팀원 목록 (실제로는 서버에서 가져와야 함)
        const teamMembers = Views.getTeamMembers(request.targetTeam?.id || request.templateCategory);
        
        const modalHtml = `
            <div class="modal-overlay show" id="assignModal" onclick="Views.closeAssignModal(event)">
                <div class="modal modal-md" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>담당자 지정</h3>
                        <button class="btn-icon" onclick="Views.closeAssignModal()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="assign-modal-info">
                            <p><strong>${request.title}</strong></p>
                            <p class="text-muted">담당 부서: ${request.targetTeam?.name || request.templateCategory || '미지정'}</p>
                        </div>
                        
                        <div class="form-group">
                            <label>부서 선택</label>
                            <select id="assignDepartment" onchange="Views.updateTeamMemberList()">
                                <option value="">부서 선택</option>
                                <option value="dba">DBA팀</option>
                                <option value="frontend">Frontend팀</option>
                                <option value="backend">Backend팀</option>
                                <option value="infra">Infra팀</option>
                                <option value="qa">QA팀</option>
                                <option value="security">보안팀</option>
                                <option value="planning">기획팀</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>담당자 검색</label>
                            <input type="text" id="assigneeSearch" placeholder="이름으로 검색..." oninput="Views.filterAssigneeList()">
                        </div>
                        
                        <div class="assignee-select-list" id="assigneeSelectList">
                            ${Views.renderAssigneeSelectList(teamMembers, request.assignees || [])}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Views.closeAssignModal()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            취소
                        </button>
                        <button class="btn btn-primary" onclick="Views.confirmAssign('${requestId}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            담당자 지정
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 기존 모달 제거
        const existingModal = document.getElementById('assignModal');
        if (existingModal) existingModal.remove();
        
        // 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 현재 신청서의 카테고리에 맞는 부서 선택
        const categoryToDept = {
            'DBA': 'dba', 'Frontend': 'frontend', 'Backend': 'backend',
            'Infra': 'infra', 'QA': 'qa', '보안': 'security', '기획': 'planning'
        };
        const deptSelect = document.getElementById('assignDepartment');
        if (deptSelect && request.templateCategory) {
            deptSelect.value = categoryToDept[request.templateCategory] || '';
            Views.updateTeamMemberList();
        }
        
        // 현재 요청 ID 저장
        Views._currentAssignRequestId = requestId;
    },
    
    // 담당자 모달 닫기
    closeAssignModal: (event) => {
        if (event && event.target.id !== 'assignModal') return;
        const modal = document.getElementById('assignModal');
        if (modal) modal.remove();
        Views._currentAssignRequestId = null;
    },
    
    // 팀원 목록 가져오기
    getTeamMembers: (department) => {
        // 실제로는 서버에서 가져와야 하지만, 여기서는 샘플 데이터 사용
        const allMembers = [
            // DBA팀
            { id: 'member-dba-1', name: '김철수', department: 'dba', team: 'DBA팀 - 데이터관리', position: '팀장', email: 'cskim@company.com' },
            { id: 'member-dba-2', name: '한지민', department: 'dba', team: 'DBA팀 - 데이터관리', position: '과장', email: 'jmhan@company.com' },
            { id: 'member-dba-3', name: '송태양', department: 'dba', team: 'DBA팀 - 데이터관리', position: '대리', email: 'tysong@company.com' },
            { id: 'member-dba-4', name: '정민호', department: 'dba', team: 'DBA팀 - 성능최적화', position: '차장', email: 'mhjung@company.com' },
            { id: 'member-dba-5', name: '강예린', department: 'dba', team: 'DBA팀 - 성능최적화', position: '과장', email: 'yrkang@company.com' },
            // Frontend팀
            { id: 'member-fe-1', name: '이영희', department: 'frontend', team: 'Frontend팀 - 웹개발', position: '팀장', email: 'yhlee@company.com' },
            { id: 'member-fe-2', name: '조예진', department: 'frontend', team: 'Frontend팀 - 웹개발', position: '과장', email: 'yjjo@company.com' },
            { id: 'member-fe-3', name: '김다은', department: 'frontend', team: 'Frontend팀 - 웹개발', position: '대리', email: 'dekim@company.com' },
            { id: 'member-fe-4', name: '윤서연', department: 'frontend', team: 'Frontend팀 - 모바일', position: '차장', email: 'syyoon@company.com' },
            { id: 'member-fe-5', name: '문지호', department: 'frontend', team: 'Frontend팀 - 모바일', position: '과장', email: 'jhmoon@company.com' },
            // Backend팀
            { id: 'member-be-1', name: '박민수', department: 'backend', team: 'Backend팀 - API개발', position: '팀장', email: 'mspark@company.com' },
            { id: 'member-be-2', name: '유재석', department: 'backend', team: 'Backend팀 - API개발', position: '차장', email: 'jsyoo@company.com' },
            { id: 'member-be-3', name: '신동욱', department: 'backend', team: 'Backend팀 - API개발', position: '과장', email: 'dwshin@company.com' },
            { id: 'member-be-4', name: '장현우', department: 'backend', team: 'Backend팀 - 배치처리', position: '과장', email: 'hwjang@company.com' },
            { id: 'member-be-5', name: '권나연', department: 'backend', team: 'Backend팀 - 배치처리', position: '과장', email: 'nykwon@company.com' },
            // Infra팀
            { id: 'member-infra-1', name: '정수진', department: 'infra', team: 'Infra팀 - 클라우드', position: '팀장', email: 'sjjung@company.com' },
            { id: 'member-infra-2', name: '배준형', department: 'infra', team: 'Infra팀 - 클라우드', position: '과장', email: 'jhbae@company.com' },
            { id: 'member-infra-3', name: '오승훈', department: 'infra', team: 'Infra팀 - 네트워크', position: '차장', email: 'shoh2@company.com' },
            // QA팀
            { id: 'member-qa-1', name: '최동현', department: 'qa', team: 'QA팀 - 자동화테스트', position: '팀장', email: 'dhchoi@company.com' },
            { id: 'member-qa-2', name: '노지훈', department: 'qa', team: 'QA팀 - 자동화테스트', position: '과장', email: 'jhnoh@company.com' },
            { id: 'member-qa-3', name: '안소희', department: 'qa', team: 'QA팀 - 수동테스트', position: '차장', email: 'shan@company.com' },
            // 보안팀
            { id: 'member-sec-1', name: '차은우', department: 'security', team: '보안팀 - 보안감사', position: '팀장', email: 'ewcha@company.com' },
            { id: 'member-sec-2', name: '강미래', department: 'security', team: '보안팀 - 보안감사', position: '과장', email: 'mrkang@company.com' },
            { id: 'member-sec-3', name: '백승우', department: 'security', team: '보안팀 - 보안운영', position: '차장', email: 'swbaek@company.com' },
            // 기획팀
            { id: 'member-plan-1', name: '류승완', department: 'planning', team: '기획팀 - 서비스기획', position: '팀장', email: 'swryu@company.com' },
            { id: 'member-plan-2', name: '김소현', department: 'planning', team: '기획팀 - 서비스기획', position: '과장', email: 'shkim@company.com' },
            { id: 'member-plan-3', name: '오세진', department: 'planning', team: '기획팀 - 상품기획', position: '차장', email: 'sjoh@company.com' }
        ];
        
        if (!department) return allMembers;
        
        const deptMap = {
            'DBA': 'dba', 'Frontend': 'frontend', 'Backend': 'backend',
            'Infra': 'infra', 'QA': 'qa', '보안': 'security', '기획': 'planning'
        };
        const deptKey = deptMap[department] || department;
        
        return allMembers.filter(m => m.department === deptKey);
    },
    
    // 담당자 선택 목록 렌더링
    renderAssigneeSelectList: (members, currentAssignees) => {
        if (members.length === 0) {
            return '<p class="text-muted text-center">부서를 선택해주세요</p>';
        }
        
        const assignedIds = currentAssignees.map(a => a.id || a.name);
        
        return members.map(m => {
            const isAssigned = assignedIds.includes(m.id) || assignedIds.includes(m.name);
            return `
                <div class="assignee-select-item ${isAssigned ? 'assigned' : ''}" 
                     data-id="${m.id}" 
                     data-name="${m.name}"
                     data-team="${m.team}"
                     data-email="${m.email}"
                     onclick="Views.toggleAssigneeSelect(this)">
                    <div class="assignee-select-avatar">${m.name.charAt(0)}</div>
                    <div class="assignee-select-info">
                        <span class="assignee-select-name">${m.name}</span>
                        <span class="assignee-select-detail">${m.position} · ${m.team}</span>
                    </div>
                    <div class="assignee-select-check">
                        ${isAssigned ? `
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <span>배정됨</span>
                        ` : `
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 부서 변경 시 팀원 목록 업데이트
    updateTeamMemberList: () => {
        const deptSelect = document.getElementById('assignDepartment');
        const listContainer = document.getElementById('assigneeSelectList');
        const requestId = Views._currentAssignRequestId;
        
        if (!deptSelect || !listContainer || !requestId) return;
        
        const request = Views.getRequests().find(r => r.id === requestId);
        const members = Views.getTeamMembers(deptSelect.value);
        
        listContainer.innerHTML = Views.renderAssigneeSelectList(members, request?.assignees || []);
    },
    
    // 담당자 검색 필터
    filterAssigneeList: () => {
        const searchInput = document.getElementById('assigneeSearch');
        const items = document.querySelectorAll('.assignee-select-item');
        
        if (!searchInput) return;
        
        const term = searchInput.value.toLowerCase();
        
        items.forEach(item => {
            const name = item.dataset.name?.toLowerCase() || '';
            const team = item.dataset.team?.toLowerCase() || '';
            
            if (name.includes(term) || team.includes(term)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    },
    
    // 담당자 선택 토글
    toggleAssigneeSelect: (element) => {
        // 이미 배정된 사람은 토글 불가
        if (element.classList.contains('assigned')) {
            Views.showToast('이미 배정된 담당자입니다.', 'warning');
            return;
        }
        
        element.classList.toggle('selected');
        
        // 체크 아이콘 업데이트
        const checkDiv = element.querySelector('.assignee-select-check');
        if (element.classList.contains('selected')) {
            checkDiv.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>선택됨</span>
            `;
        } else {
            checkDiv.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            `;
        }
    },
    
    // 담당자 지정 확인
    confirmAssign: (requestId) => {
        const selectedItems = document.querySelectorAll('.assignee-select-item.selected');
        
        if (selectedItems.length === 0) {
            Views.showToast('담당자를 선택해주세요.', 'warning');
            return;
        }
        
        const requests = Views.getRequests();
        const request = requests.find(r => r.id === requestId);
        const currentUser = Views.getCurrentUser();
        
        if (!request) return;
        
        if (!request.assignees) request.assignees = [];
        if (!request.history) request.history = [];
        
        const newAssignees = [];
        selectedItems.forEach(item => {
            const assignee = {
                id: item.dataset.id,
                name: item.dataset.name,
                team: item.dataset.team,
                email: item.dataset.email
            };
            
            // 중복 체크
            if (!request.assignees.find(a => a.id === assignee.id || a.name === assignee.name)) {
                request.assignees.push(assignee);
                newAssignees.push(assignee.name);
            }
        });
        
        if (newAssignees.length > 0) {
            // 상태가 submitted이면 in_progress로 변경
            if (request.status === 'submitted') {
                request.status = 'in_progress';
            }
            
            // 이력 추가
            request.history.push({
                type: 'assigned',
                action: `담당자 배정: ${newAssignees.join(', ')}`,
                timestamp: new Date().toISOString(),
                user: currentUser?.name || 'System'
            });
            
            Views.saveRequests(requests);
            Views.closeAssignModal();
            Views.showToast(`${newAssignees.length}명의 담당자가 배정되었습니다.`, 'success');
            router.navigate(`/request/${requestId}`);
        } else {
            Views.showToast('선택한 담당자가 이미 배정되어 있습니다.', 'warning');
        }
    },
    
    // 토스트 메시지
    showToast: (message, type = 'info') => {
        const container = document.getElementById('toastContainer') || document.body;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#22c55e' : type === 'warning' ? '#eab308' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // 접수 대기 신청서 렌더링
    renderPendingRequests: (requests) => {
        if (requests.length === 0) {
            return `
                <div class="empty-state small">
                    <p>접수 대기 중인 신청서가 없습니다</p>
                </div>
            `;
        }
        
        const categoryIcons = {
            'DBA': '🗄️', 'Frontend': '🎨', 'Backend': '⚙️', 'Infra': '🖥️',
            '공통': '📋', 'QA': '🧪', '보안': '🔒', '기획': '📝'
        };
        
        const priorityColors = {
            low: '#22c55e', medium: '#eab308', high: '#f97316', urgent: '#ef4444'
        };
        
        return `
            <div class="pending-request-list">
                ${requests.map(r => `
                    <div class="pending-request-item" onclick="router.navigate('/request/${r.id}')">
                        <div class="pending-request-icon">${categoryIcons[r.templateCategory] || '📄'}</div>
                        <div class="pending-request-content">
                            <div class="pending-request-title">${r.title || '신청서'}</div>
                            <div class="pending-request-meta">
                                <span>${r.requester?.name || '-'}</span>
                                <span>→</span>
                                <span>${r.templateCategory || '-'}팀</span>
                            </div>
                        </div>
                        <div class="pending-request-priority" style="background: ${priorityColors[r.priority] || '#6b7280'}"></div>
                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); Views.acceptRequest('${r.id}')">접수</button>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    // 전체 폼 상세 렌더링 (템플릿 컴포넌트 기반)
    renderFullFormDetails: (request) => {
        const formData = request.formData || {};
        const templateId = request.templateId;
        
        // 템플릿 찾기
        let template = null;
        if (typeof sampleTemplates !== 'undefined') {
            template = sampleTemplates.find(t => t.id === templateId);
        }
        
        // 커스텀 템플릿에서도 찾기
        if (!template) {
            const customTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
            template = customTemplates.find(t => t.id === templateId);
        }
        
        // 템플릿이 없으면 기존 formData 기반으로 렌더링
        if (!template || !template.components) {
            return Views.renderFormDataDetails(formData);
        }
        
        // 컴포넌트 타입별 아이콘
        const componentIcons = {
            'section-header': '📌',
            'divider': '➖',
            'info-text': 'ℹ️',
            'requester-info': '👤',
            'text-input': '📝',
            'textarea': '📄',
            'number-input': '🔢',
            'date-input': '📅',
            'deadline-input': '⏰',
            'email-input': '📧',
            'select': '📋',
            'department-select': '🏢',
            'project-select': '📁',
            'checkbox': '☑️',
            'radio': '🔘',
            'rating': '⭐',
            'priority-select': '🚨',
            'yes-no-select': '✅',
            'file-upload': '📎',
            'image-upload': '🖼️',
            'link-input': '🔗',
            'approval-flow': '✍️'
        };
        
        const priorityLabels = { low: '낮음', medium: '보통', high: '높음', urgent: '긴급' };
        const priorityColors = { low: '#22c55e', medium: '#eab308', high: '#f97316', urgent: '#ef4444' };
        
        let html = '<div class="form-components-detail">';
        let currentSection = null;
        
        template.components.forEach(component => {
            const fieldData = formData[component.id] || {};
            const icon = componentIcons[component.type] || '📋';
            
            // 섹션 헤더
            if (component.type === 'section-header') {
                if (currentSection) {
                    html += '</div>'; // 이전 섹션 닫기
                }
                html += `
                    <div class="form-section">
                        <div class="form-section-title">
                            <span class="section-icon">${icon}</span>
                            ${component.text || component.label || '섹션'}
                        </div>
                `;
                currentSection = component;
                return;
            }
            
            // 구분선
            if (component.type === 'divider') {
                html += '<div class="form-divider-line"></div>';
                return;
            }
            
            // 정보 텍스트
            if (component.type === 'info-text') {
                html += `
                    <div class="form-info-box">
                        <span class="info-icon">ℹ️</span>
                        <span>${component.text || component.label}</span>
                    </div>
                `;
                return;
            }
            
            // 요청자 정보
            if (component.type === 'requester-info') {
                html += `
                    <div class="form-component-detail requester-detail">
                        <div class="component-header">
                            <span class="component-icon">${icon}</span>
                            <span class="component-label">${component.label || '요청자 정보'}</span>
                        </div>
                        <div class="requester-grid">
                            <div class="requester-field">
                                <label>이름</label>
                                <span>${request.requester?.name || '-'}</span>
                            </div>
                            <div class="requester-field">
                                <label>부서/팀</label>
                                <span>${request.requester?.team || '-'}</span>
                            </div>
                            <div class="requester-field">
                                <label>이메일</label>
                                <span>${request.requester?.email || '-'}</span>
                            </div>
                            <div class="requester-field">
                                <label>요청일</label>
                                <span>${request.createdAt ? new Date(request.createdAt).toLocaleDateString('ko-KR') : '-'}</span>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
            
            // 결재 라인
            if (component.type === 'approval-flow') {
                const steps = component.steps || [];
                html += `
                    <div class="form-component-detail approval-detail">
                        <div class="component-header">
                            <span class="component-icon">${icon}</span>
                            <span class="component-label">${component.label || '결재 라인'}</span>
                        </div>
                        <div class="approval-flow-display">
                            ${steps.map((step, i) => `
                                ${i > 0 ? '<div class="approval-arrow">→</div>' : ''}
                                <div class="approval-step-box">
                                    <div class="step-number">${i + 1}</div>
                                    <div class="step-info">
                                        <span class="step-title">${step.title}</span>
                                        <span class="step-role">${step.role}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                return;
            }
            
            // 일반 컴포넌트
            let value = fieldData.value;
            let displayValue = '-';
            let hasValue = value !== undefined && value !== null && value !== '';
            
            if (hasValue) {
                if (Array.isArray(value)) {
                    displayValue = value.length > 0 ? value.join(', ') : '-';
                    hasValue = value.length > 0;
                } else {
                    displayValue = value;
                }
                
                // 특별 처리
                if (component.type === 'priority-select') {
                    displayValue = `<span class="priority-value" style="background: ${priorityColors[value] || '#6b7280'}20; color: ${priorityColors[value] || '#6b7280'}">${priorityLabels[value] || value}</span>`;
                } else if (component.type === 'rating') {
                    const rating = parseInt(value) || 0;
                    displayValue = `<span class="rating-display">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>`;
                } else if (component.type === 'yes-no-select') {
                    displayValue = value === 'yes' ? '<span class="yes-value">예</span>' : '<span class="no-value">아니오</span>';
                } else if (component.type === 'date-input' || component.type === 'deadline-input') {
                    displayValue = new Date(value).toLocaleDateString('ko-KR');
                } else if (component.type === 'file-upload' || component.type === 'image-upload') {
                    if (Array.isArray(value)) {
                        displayValue = value.map(f => `<span class="file-badge">📎 ${f}</span>`).join(' ');
                    }
                } else if (component.type === 'link-input') {
                    displayValue = `<a href="${value}" target="_blank" class="link-value">${value}</a>`;
                }
            }
            
            const colSpanClass = component.colSpan === 'full' ? 'full-width' : '';
            const emptyClass = !hasValue ? 'empty-value' : '';
            
            html += `
                <div class="form-component-detail ${colSpanClass} ${emptyClass}">
                    <div class="component-header">
                        <span class="component-icon">${icon}</span>
                        <span class="component-label">${component.label || component.type}</span>
                        ${component.required ? '<span class="required-mark">*</span>' : ''}
                    </div>
                    <div class="component-value ${component.type}">
                        ${displayValue}
                    </div>
                </div>
            `;
        });
        
        if (currentSection) {
            html += '</div>'; // 마지막 섹션 닫기
        }
        
        html += '</div>';
        
        return html;
    },
    
    // 폼 데이터 상세 렌더링 (기존 - fallback용)
    renderFormDataDetails: (formData) => {
        if (!formData || Object.keys(formData).length === 0) {
            return '<p class="text-muted">입력된 데이터가 없습니다.</p>';
        }
        
        return `
            <div class="form-data-details">
                ${Object.entries(formData).map(([key, field]) => {
                    if (!field.value || (Array.isArray(field.value) && field.value.length === 0)) {
                        return '';
                    }
                    
                    let displayValue = field.value;
                    if (Array.isArray(field.value)) {
                        displayValue = field.value.join(', ');
                    }
                    
                    // 우선순위 특별 처리
                    if (field.componentType === 'priority-select') {
                        const priorityLabels = { low: '낮음', medium: '보통', high: '높음', urgent: '긴급' };
                        displayValue = priorityLabels[field.value] || field.value;
                    }
                    
                    // 별점 특별 처리
                    if (field.componentType === 'rating') {
                        displayValue = '★'.repeat(parseInt(field.value)) + '☆'.repeat(5 - parseInt(field.value));
                    }
                    
                    return `
                        <div class="form-data-item">
                            <label>${field.label || key}</label>
                            <span>${displayValue}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    // ===== 신청서 테이블 렌더링 =====
    renderRequestTable: (requests) => {
        const filtered = Views.getFilteredRequests(requests);
        const sorted = Views.getSortedRequests(filtered);
        
        if (sorted.length === 0) {
            return `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <h3>신청서가 없습니다</h3>
                    <p>조건에 맞는 신청서가 없습니다.</p>
                </div>
            `;
        }
        
        const statusLabels = {
            submitted: '제출됨', in_progress: '처리 중', completed: '완료', rejected: '반려', draft: '임시저장'
        };
        
        const priorityLabels = {
            low: '낮음', medium: '보통', high: '높음', urgent: '긴급'
        };
        
        const { field, order } = Views.requests.currentSort;
        const sortIcon = (f) => {
            if (field !== f) return '<span class="sort-icon">⇅</span>';
            return order === 'asc' ? '<span class="sort-icon active">↑</span>' : '<span class="sort-icon active">↓</span>';
        };
        
        return `
            <div class="request-table-container">
                <table class="request-table">
                    <thead>
                        <tr>
                            <th class="sortable" onclick="Views.handleSort('id')">
                                신청서 ID ${sortIcon('id')}
                            </th>
                            <th>제목</th>
                            <th class="sortable" onclick="Views.handleSort('priority')">
                                우선순위 ${sortIcon('priority')}
                            </th>
                            <th class="sortable" onclick="Views.handleSort('requester')">
                                요청자 ${sortIcon('requester')}
                            </th>
                            <th class="sortable" onclick="Views.handleSort('createdAt')">
                                요청일 ${sortIcon('createdAt')}
                            </th>
                            <th class="sortable" onclick="Views.handleSort('submittedAt')">
                                제출일 ${sortIcon('submittedAt')}
                            </th>
                            <th class="sortable" onclick="Views.handleSort('targetTeam')">
                                처리 부서 ${sortIcon('targetTeam')}
                            </th>
                            <th class="sortable" onclick="Views.handleSort('assignee')">
                                처리자 ${sortIcon('assignee')}
                            </th>
                            <th class="sortable" onclick="Views.handleSort('status')">
                                상태 ${sortIcon('status')}
                            </th>
                            <th>진행도</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sorted.map(r => {
                            const progress = Views.calculateProgress(r);
                            const targetTeamName = r.targetTeam?.name || r.templateCategory || '-';
                            const assigneeInfo = r.assignees && r.assignees.length > 0 
                                ? r.assignees.map(a => a.name).join(', ')
                                : '-';
                            return `
                                <tr onclick="router.navigate('/request/${r.id}')" class="clickable-row">
                                    <td class="request-id">${r.id}</td>
                                    <td class="request-title">
                                        <span class="title-text">${r.title || '신청서'}</span>
                                        <span class="category-badge">${r.templateCategory || '-'}</span>
                                    </td>
                                    <td>
                                        <span class="priority-badge ${r.priority}">${priorityLabels[r.priority] || '보통'}</span>
                                    </td>
                                    <td class="requester-cell">
                                        <div class="requester-info-compact">
                                            <span class="requester-name">${r.requester?.name || '-'}</span>
                                            <span class="requester-team">${r.requester?.team || ''}</span>
                                        </div>
                                    </td>
                                    <td class="date-cell">${r.createdAt ? new Date(r.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                                    <td class="date-cell">${r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('ko-KR') : '-'}</td>
                                    <td class="target-team-cell">
                                        <span class="team-badge">${targetTeamName}</span>
                                    </td>
                                    <td class="assignee-cell">
                                        ${r.assignees && r.assignees.length > 0 
                                            ? `<div class="assignee-info-compact">
                                                <span class="assignee-name">${r.assignees[0].name}</span>
                                                ${r.assignees.length > 1 ? `<span class="assignee-more">+${r.assignees.length - 1}</span>` : ''}
                                               </div>`
                                            : '<span class="no-assignee">미배정</span>'
                                        }
                                    </td>
                                    <td>
                                        <span class="status-badge ${r.status}">${statusLabels[r.status] || r.status}</span>
                                    </td>
                                    <td class="progress-cell">
                                        <div class="progress-bar-container">
                                            <div class="progress-bar" style="width: ${progress}%"></div>
                                        </div>
                                        <span class="progress-text">${progress}%</span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // 진행도 계산
    calculateProgress: (request) => {
        const statusProgress = {
            draft: 0,
            submitted: 25,
            in_progress: 50,
            completed: 100,
            rejected: 100
        };
        return statusProgress[request.status] || 0;
    },
    
    // 필터링된 신청서 가져오기
    getFilteredRequests: (requests) => {
        let filtered = [...requests];
        
        // 검색어 필터
        if (Views.requests.searchTerm) {
            const term = Views.requests.searchTerm.toLowerCase();
            filtered = filtered.filter(r => 
                r.id?.toLowerCase().includes(term) ||
                r.title?.toLowerCase().includes(term) ||
                r.requester?.name?.toLowerCase().includes(term)
            );
        }
        
        // 상태 필터
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }
        
        // 우선순위 필터
        const priorityFilter = document.getElementById('priorityFilter')?.value || 'all';
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(r => r.priority === priorityFilter);
        }
        
        // 카테고리 필터
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(r => r.templateCategory === categoryFilter);
        }
        
        // 처리 부서 필터
        const targetTeamFilter = document.getElementById('targetTeamFilter')?.value || 'all';
        if (targetTeamFilter !== 'all') {
            filtered = filtered.filter(r => {
                const targetTeam = r.targetTeam?.name || r.templateCategory || '';
                return targetTeam.includes(targetTeamFilter);
            });
        }
        
        // 처리자 필터
        const assigneeFilter = document.getElementById('assigneeFilter')?.value || 'all';
        if (assigneeFilter !== 'all') {
            filtered = filtered.filter(r => {
                if (!r.assignees || r.assignees.length === 0) return false;
                return r.assignees.some(a => {
                    const assigneeId = a.id || a.name || a.email;
                    return assigneeId === assigneeFilter;
                });
            });
        }
        
        return filtered;
    },
    
    // 정렬된 신청서 가져오기
    getSortedRequests: (requests) => {
        const { field, order } = Views.requests.currentSort;
        
        return [...requests].sort((a, b) => {
            let valueA, valueB;
            
            switch (field) {
                case 'id':
                    valueA = a.id || '';
                    valueB = b.id || '';
                    break;
                case 'priority':
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    valueA = priorityOrder[a.priority] || 0;
                    valueB = priorityOrder[b.priority] || 0;
                    break;
                case 'requester':
                    valueA = a.requester?.name || '';
                    valueB = b.requester?.name || '';
                    break;
                case 'createdAt':
                    valueA = new Date(a.createdAt || 0).getTime();
                    valueB = new Date(b.createdAt || 0).getTime();
                    break;
                case 'submittedAt':
                    valueA = new Date(a.submittedAt || 0).getTime();
                    valueB = new Date(b.submittedAt || 0).getTime();
                    break;
                case 'status':
                    const statusOrder = { submitted: 1, in_progress: 2, completed: 3, rejected: 4, draft: 0 };
                    valueA = statusOrder[a.status] || 0;
                    valueB = statusOrder[b.status] || 0;
                    break;
                case 'targetTeam':
                    valueA = a.targetTeam?.name || a.templateCategory || '';
                    valueB = b.targetTeam?.name || b.templateCategory || '';
                    break;
                case 'assignee':
                    valueA = a.assignees && a.assignees.length > 0 ? a.assignees[0].name : '';
                    valueB = b.assignees && b.assignees.length > 0 ? b.assignees[0].name : '';
                    break;
                default:
                    valueA = a[field] || '';
                    valueB = b[field] || '';
            }
            
            if (typeof valueA === 'string') {
                return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        });
    },
    
    // 테이블 새로고침
    refreshRequestTable: () => {
        const requests = Views.getRequests();
        const filtered = Views.getFilteredRequests(requests);
        
        const listEl = document.getElementById('requestsList');
        if (listEl) {
            listEl.innerHTML = Views.renderRequestTable(requests);
        }
        
        const summaryEl = document.getElementById('listSummary');
        if (summaryEl) {
            summaryEl.innerHTML = `총 <strong>${filtered.length}</strong>건의 신청서 (전체 ${requests.length}건)`;
        }
    },
    
    // 검색 핸들러
    handleSearch: (value) => {
        Views.requests.searchTerm = value;
        Views.refreshRequestTable();
    },
    
    // 상태 필터 핸들러
    handleStatusFilter: (value) => {
        Views.requests.currentFilter = value;
        Views.refreshRequestTable();
    },
    
    // 우선순위 필터 핸들러
    handlePriorityFilter: (value) => {
        Views.refreshRequestTable();
    },
    
    // 카테고리 필터 핸들러
    handleCategoryFilter: (value) => {
        Views.refreshRequestTable();
    },
    
    // 처리 부서 필터 핸들러
    handleTargetTeamFilter: (value) => {
        Views.refreshRequestTable();
    },
    
    // 처리자 필터 핸들러
    handleAssigneeFilter: (value) => {
        Views.refreshRequestTable();
    },
    
    // 처리자 옵션 생성
    getAssigneeOptions: (requests) => {
        const assigneesMap = new Map();
        
        requests.forEach(r => {
            if (r.assignees && r.assignees.length > 0) {
                r.assignees.forEach(a => {
                    const id = a.id || a.name || a.email;
                    if (id && !assigneesMap.has(id)) {
                        assigneesMap.set(id, {
                            id: id,
                            name: a.name || '알 수 없음',
                            team: a.team || ''
                        });
                    }
                });
            }
        });
        
        const assignees = Array.from(assigneesMap.values());
        
        if (assignees.length === 0) {
            return '<option value="none" disabled>처리자 없음</option>';
        }
        
        return assignees
            .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
            .map(a => `<option value="${a.id}">${a.name}${a.team ? ` (${a.team})` : ''}</option>`)
            .join('');
    },
    
    // 정렬 핸들러
    handleSort: (field) => {
        if (Views.requests.currentSort.field === field) {
            Views.requests.currentSort.order = Views.requests.currentSort.order === 'asc' ? 'desc' : 'asc';
        } else {
            Views.requests.currentSort.field = field;
            Views.requests.currentSort.order = 'desc';
        }
        Views.refreshRequestTable();
    },
    
    renderRecentRequests: (requests) => {
        if (requests.length === 0) {
            return `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <h3>신청서가 없습니다</h3>
                    <p>새 신청서를 작성해보세요.</p>
                </div>
            `;
        }
        
        const categoryIcons = {
            'DBA': '🗄️', 'Frontend': '🎨', 'Backend': '⚙️', 'Infra': '🖥️',
            '공통': '📋', 'QA': '🧪', '보안': '🔒', '기획': '📝'
        };
        
        const statusLabels = {
            submitted: '제출됨', in_progress: '처리 중', completed: '완료', rejected: '반려', draft: '임시저장'
        };
        
        return `
            <div class="request-list">
                ${requests.map(r => `
                    <div class="request-item" onclick="router.navigate('/request/${r.id}')">
                        <div class="request-item-icon">${categoryIcons[r.templateCategory] || '📄'}</div>
                        <div class="request-item-content">
                            <div class="request-item-title">${r.title || '신청서'}</div>
                            <div class="request-item-meta">
                                <span>${r.requester?.name || '-'}</span>
                                <span>${new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
                            </div>
                        </div>
                        <span class="request-item-status ${r.status}">${statusLabels[r.status] || r.status}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderRequestList: (requests, filter) => {
        let filtered = requests;
        if (filter && filter !== 'all') {
            filtered = requests.filter(r => r.status === filter);
        }
        
        return Views.renderRecentRequests(filtered);
    },
    
    filterRequests: (searchTerm) => {
        Views.handleSearch(searchTerm);
    },
    
    setRequestFilter: (filter) => {
        Views.handleStatusFilter(filter);
    },
    
    renderDashboardCharts: (requests) => {
        // Category chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            const categoryCount = {};
            requests.forEach(r => {
                const cat = r.templateCategory || '기타';
                categoryCount[cat] = (categoryCount[cat] || 0) + 1;
            });
            
            new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categoryCount),
                    datasets: [{
                        data: Object.values(categoryCount),
                        backgroundColor: ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: '#9ca3af' } }
                    }
                }
            });
        }
        
        // Status chart
        const statusCtx = document.getElementById('statusChart');
        if (statusCtx) {
            const statusCount = { submitted: 0, in_progress: 0, completed: 0, rejected: 0 };
            requests.forEach(r => {
                if (statusCount.hasOwnProperty(r.status)) {
                    statusCount[r.status]++;
                }
            });
            
            new Chart(statusCtx, {
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
                        legend: { position: 'right', labels: { color: '#9ca3af' } }
                    }
                }
            });
        }
    }
};

// Export for use
window.Views = Views;

