// ===== Request Management Module =====

// 샘플 신청서 데이터 (실제로는 서버에서 가져옴)
const sampleRequests = [
    {
        id: 'REQ-2024-001',
        templateId: 'sample_dba_001',
        templateCategory: 'DBA',
        title: '2024년 1분기 매출 데이터 추출 요청',
        description: '분기 보고서 작성을 위한 매출 데이터 추출이 필요합니다. 일별 매출 합계, 상품 카테고리별 매출, 지역별 매출 현황 포함.',
        requester: { id: 12, name: '송기획', team: '서비스기획팀' },
        targetTeam: { id: 5, name: 'DBA팀' },
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        assignees: [
            { id: 4, name: '박디비', role: 'primary' },
            { id: 10, name: '서디비', role: 'secondary' }
        ]
    },
    {
        id: 'REQ-2024-002',
        templateId: 'sample_fe_001',
        templateCategory: 'Frontend',
        title: '이벤트 페이지 신규 개발',
        description: '연말 프로모션 이벤트 페이지 개발이 필요합니다. 이벤트 배너, 상품 할인 목록, 쿠폰 다운로드, 카운트다운 타이머 포함.',
        requester: { id: 6, name: '정기획', team: '서비스기획팀' },
        targetTeam: { id: 4, name: 'Frontend팀' },
        status: 'in_progress',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignees: [
            { id: 3, name: '이프론트', role: 'reviewer' },
            { id: 9, name: '임프론트', role: 'primary' }
        ]
    },
    {
        id: 'REQ-2024-003',
        templateId: 'sample_be_001',
        templateCategory: 'Backend',
        title: '결제 API v2 개발 요청',
        description: '토스페이먼츠 연동 결제 API 개발. 결제 요청, 승인, 취소 API 포함.',
        requester: { id: 12, name: '송기획', team: '서비스기획팀' },
        targetTeam: { id: 3, name: 'Backend팀' },
        status: 'in_progress',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        assignees: [
            { id: 2, name: '김매니저', role: 'reviewer' },
            { id: 8, name: '강백엔드', role: 'primary' }
        ]
    },
    {
        id: 'REQ-2024-004',
        templateId: 'sample_infra_001',
        templateCategory: 'Infra',
        title: 'API 서버 스케일 아웃',
        description: '트래픽 증가 대비 서버 증설 요청. 웹서버 2대 추가 필요.',
        requester: { id: 2, name: '김매니저', team: 'Backend팀' },
        targetTeam: { id: 7, name: 'DevOps팀' },
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        assignees: [
            { id: 5, name: '최데옵스', role: 'approver' }
        ]
    },
    {
        id: 'REQ-2024-005',
        templateId: 'sample_common_001',
        templateCategory: '공통',
        title: '주문 목록 화면 오류 신고',
        description: '주문 목록에서 검색 시 화면이 멈추는 현상. 특정 키워드 검색 시 발생.',
        requester: { id: 9, name: '임프론트', team: 'Frontend팀' },
        targetTeam: { id: 3, name: 'Backend팀' },
        status: 'submitted',
        priority: 'high',
        dueDate: null,
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        assignees: []
    },
    {
        id: 'REQ-2024-006',
        templateId: 'sample_qa_001',
        templateCategory: 'QA',
        title: '결제 API 테스트 요청',
        description: '결제 API v2 기능 테스트 요청. 기능 테스트, 성능 테스트 포함.',
        requester: { id: 8, name: '강백엔드', team: 'Backend팀' },
        targetTeam: { id: 10, name: 'QA팀' },
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        assignees: []
    },
    {
        id: 'REQ-2024-007',
        templateId: 'sample_dba_002',
        templateCategory: 'DBA',
        title: '회원 테이블 컬럼 추가',
        description: '마케팅 동의 컬럼 추가 필요. marketing_agree VARCHAR(1) DEFAULT N',
        requester: { id: 8, name: '강백엔드', team: 'Backend팀' },
        targetTeam: { id: 5, name: 'DBA팀' },
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignees: [
            { id: 4, name: '박디비', role: 'primary' }
        ]
    },
    {
        id: 'REQ-2024-008',
        templateId: 'sample_fe_002',
        templateCategory: 'Frontend',
        title: '마이페이지 UI 개선',
        description: '프로필 편집 화면 사용성 개선. 레이아웃 변경, 입력 폼 개선.',
        requester: { id: 12, name: '송기획', team: '서비스기획팀' },
        targetTeam: { id: 4, name: 'Frontend팀' },
        status: 'review',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        assignees: [
            { id: 9, name: '임프론트', role: 'primary' }
        ]
    },
    {
        id: 'REQ-2024-009',
        templateId: 'sample_infra_002',
        templateCategory: 'Infra',
        title: 'AWS 콘솔 접근 권한 요청',
        description: '개발 서버 관리를 위한 AWS 권한 필요. EC2, RDS 읽기/쓰기 권한.',
        requester: { id: 7, name: '이사원', team: 'Backend팀' },
        targetTeam: { id: 7, name: 'DevOps팀' },
        status: 'completed',
        priority: 'low',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        assignees: [
            { id: 11, name: '문클라우드', role: 'primary' }
        ]
    },
    {
        id: 'REQ-2024-010',
        templateId: 'sample_be_002',
        templateCategory: 'Backend',
        title: '일일 매출 집계 배치 개발',
        description: '매일 새벽 매출 데이터 자동 집계. 이메일 발송 포함.',
        requester: { id: 6, name: '정기획', team: '서비스기획팀' },
        targetTeam: { id: 3, name: 'Backend팀' },
        status: 'draft',
        priority: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: null,
        assignees: []
    }
];

// 상태별 이름
const statusNames = {
    draft: '임시저장',
    submitted: '제출됨',
    pending: '검토 대기',
    in_progress: '진행중',
    review: '검토중',
    completed: '완료',
    rejected: '반려',
    cancelled: '취소'
};

// 카테고리별 아이콘
const categoryIcons = {
    'DBA': '🗄️',
    'Frontend': '🎨',
    'Backend': '⚙️',
    'Infra': '🖥️',
    '공통': '📋',
    'QA': '🧪',
    '보안': '🔒',
    '기획': '📝'
};

// 로컬 스토리지에서 신청서 데이터 로드
function loadRequests() {
    const saved = localStorage.getItem('taskflowRequests');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load requests:', e);
        }
    }
    // 샘플 데이터로 초기화
    localStorage.setItem('taskflowRequests', JSON.stringify(sampleRequests));
    return sampleRequests;
}

// 신청서 목록 렌더링
function renderRequestsList(filterStatus = 'all') {
    const container = document.getElementById('requestsList');
    const emptyState = document.getElementById('requestsEmpty');
    
    if (!container) return;
    
    let requests = loadRequests();
    
    // 필터 적용
    if (filterStatus !== 'all') {
        requests = requests.filter(r => r.status === filterStatus);
    }
    
    // draft 상태는 본인 것만 표시
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    requests = requests.filter(r => {
        if (r.status === 'draft') {
            return currentUser && r.requester.id === currentUser.id;
        }
        return true;
    });
    
    // 최신순 정렬
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (requests.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // 통계 요약 렌더링
    const allRequests = loadRequests();
    const stats = {
        pending: allRequests.filter(r => r.status === 'pending' || r.status === 'submitted').length,
        progress: allRequests.filter(r => r.status === 'in_progress' || r.status === 'review').length,
        completed: allRequests.filter(r => r.status === 'completed').length,
        total: allRequests.filter(r => r.status !== 'draft').length
    };
    
    container.innerHTML = `
        <div class="request-stats-summary">
            <div class="request-stat">
                <div class="request-stat-icon pending">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                </div>
                <div class="request-stat-info">
                    <span class="request-stat-value">${stats.pending}</span>
                    <span class="request-stat-label">대기중</span>
                </div>
            </div>
            <div class="request-stat">
                <div class="request-stat-icon progress">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2v4"/>
                        <path d="M12 18v4"/>
                        <path d="M4.93 4.93l2.83 2.83"/>
                        <path d="M16.24 16.24l2.83 2.83"/>
                    </svg>
                </div>
                <div class="request-stat-info">
                    <span class="request-stat-value">${stats.progress}</span>
                    <span class="request-stat-label">진행중</span>
                </div>
            </div>
            <div class="request-stat">
                <div class="request-stat-icon completed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>
                <div class="request-stat-info">
                    <span class="request-stat-value">${stats.completed}</span>
                    <span class="request-stat-label">완료</span>
                </div>
            </div>
            <div class="request-stat">
                <div class="request-stat-icon total">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                    </svg>
                </div>
                <div class="request-stat-info">
                    <span class="request-stat-value">${stats.total}</span>
                    <span class="request-stat-label">전체</span>
                </div>
            </div>
        </div>
        ${requests.map(request => renderRequestItem(request)).join('')}
    `;
}

// 개별 신청서 아이템 렌더링
function renderRequestItem(request) {
    const icon = categoryIcons[request.templateCategory] || '📋';
    const categoryClass = request.templateCategory.toLowerCase().replace(/[^a-z]/g, '');
    const statusName = statusNames[request.status] || request.status;
    
    // 마감일 계산
    let dueText = '';
    let dueClass = '';
    if (request.dueDate) {
        const due = new Date(request.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0 && request.status !== 'completed') {
            dueText = `${Math.abs(diffDays)}일 지남`;
            dueClass = 'overdue';
        } else if (diffDays === 0) {
            dueText = '오늘 마감';
            dueClass = 'soon';
        } else if (diffDays <= 3) {
            dueText = `${diffDays}일 남음`;
            dueClass = 'soon';
        } else {
            dueText = formatDate(request.dueDate);
        }
    }
    
    // 담당자 렌더링
    let assigneesHtml = '';
    if (request.assignees && request.assignees.length > 0) {
        const displayAssignees = request.assignees.slice(0, 3);
        const moreCount = request.assignees.length - 3;
        
        assigneesHtml = `
            <div class="request-assignees">
                ${displayAssignees.map(a => `
                    <div class="assignee-avatar" title="${a.name}">${a.name.charAt(0)}</div>
                `).join('')}
                ${moreCount > 0 ? `<div class="assignee-more">+${moreCount}</div>` : ''}
            </div>
        `;
    }
    
    return `
        <div class="request-item ${request.priority}" onclick="openRequestDetail('${request.id}')">
            <div class="request-icon ${categoryClass}">${icon}</div>
            <div class="request-content">
                <div class="request-header">
                    <span class="request-title">${request.title}</span>
                    <span class="request-id">${request.id}</span>
                </div>
                <div class="request-meta">
                    <span class="request-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        ${request.requester.name}
                    </span>
                    <span class="request-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        ${request.targetTeam.name}
                    </span>
                    <span class="request-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${formatDate(request.createdAt)}
                    </span>
                </div>
                <p class="request-description">${request.description}</p>
                ${assigneesHtml}
            </div>
            <div class="request-status-area">
                <span class="request-status ${request.status}">
                    <span class="status-dot"></span>
                    ${statusName}
                </span>
                ${dueText ? `<span class="request-due ${dueClass}">${dueText}</span>` : ''}
            </div>
        </div>
    `;
}

// 날짜 포맷
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
        return `${diffMins}분 전`;
    } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
}

// 필터 변경 시
function filterRequests() {
    const filter = document.getElementById('requestStatusFilter');
    if (filter) {
        renderRequestsList(filter.value);
    }
}

// 신청서 상세 보기 (모달 또는 페이지 이동)
function openRequestDetail(requestId) {
    const requests = loadRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) {
        console.error('Request not found:', requestId);
        return;
    }
    
    // 신청서 관계 그래프 페이지로 이동 (해당 신청서 포커스)
    window.open(`request-graph.html?focus=${requestId}`, '_blank');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 대시보드에서 신청서 목록 렌더링
    if (document.getElementById('requestsList')) {
        renderRequestsList();
    }
});

// 전역 함수로 노출
window.renderRequestsList = renderRequestsList;
window.filterRequests = filterRequests;
window.openRequestDetail = openRequestDetail;


