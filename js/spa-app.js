// ===== SPA Application =====
// Main application controller

class App {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
    }

    // Initialize the application
    async init() {
        const updateStatus = (msg) => {
            console.log(msg);
            const el = document.getElementById('debugStatus');
            if (el) el.textContent = '상태: ' + msg;
        };
        
        try {
            updateStatus('앱 초기화 시작');
            
            // Check authentication
            this.currentUser = getCurrentUser();
            updateStatus('사용자 확인: ' + (this.currentUser ? this.currentUser.name : '없음'));
            
            if (!this.currentUser) {
                updateStatus('로그인 페이지로 이동');
                window.location.href = 'login.html';
                return;
            }
            
            // Update user info in sidebar
            this.updateUserInfo();
            updateStatus('사용자 정보 업데이트 완료');
            
            // Register routes
            this.registerRoutes();
            updateStatus('라우트 등록 완료: ' + router.routes.size + '개');
            
            // Set up navigation guard
            router.setBeforeEach(async (to) => {
                console.log('beforeEach:', to.path);
                if (!isLoggedIn()) {
                    window.location.href = 'login.html';
                    return false;
                }
                this.showLoading();
                return true;
            });
            
            // Set up after navigation callback
            router.setAfterEach((to) => {
                console.log('afterEach:', to.path);
                const titles = {
                    '/dashboard': '대시보드',
                    '/requests': '신청서 목록',
                    '/request-form': '신청서 작성',
                    '/form-builder': '요청서 만들기',
                    '/analytics': '업무 분석',
                    '/graph': '신청서 관계'
                };
                document.title = `${titles[to.path] || 'TaskFlow'} - TaskFlow`;
            });
            
            // Generate sample data if empty
            this.initSampleData();
            updateStatus('샘플 데이터 초기화 완료');
            
            this.isInitialized = true;
            
            // Mark router as ready
            router.ready();
            updateStatus('라우터 준비 완료');
            
            // Navigate to dashboard or handle current route
            updateStatus('현재 해시: ' + (window.location.hash || '없음'));
            if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
                updateStatus('대시보드로 이동 중...');
                router.navigate('/dashboard', {}, true);
            } else {
                updateStatus('현재 라우트 처리 중...');
                router.handleRoute();
            }
            
            updateStatus('앱 초기화 완료');
        } catch (error) {
            updateStatus('오류 발생: ' + error.message);
            console.error('Init error:', error);
        }
    }

    // Register all routes
    registerRoutes() {
        router
            .register('/dashboard', async (params) => {
                await this.renderView('dashboard', params);
            })
            .register('/requests', async (params) => {
                await this.renderView('requests', params);
            })
            .register('/request-form', async (params) => {
                await this.renderView('requestForm', params);
            })
            .register('/request/:id', async (params) => {
                await this.renderView('requestDetail', params);
            })
            .register('/form-builder', async (params) => {
                await this.renderView('formBuilder', params);
            })
            .register('/analytics', async (params) => {
                await this.renderView('analytics', params);
            })
            .register('/graph', async (params) => {
                await this.renderView('graph', params);
            });
    }

    // Render a view
    async renderView(viewName, params) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        
        const view = Views[viewName];
        if (!view) {
            mainContent.innerHTML = `
                <div class="view-container">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <h3>페이지를 찾을 수 없습니다</h3>
                        <p>요청하신 페이지가 존재하지 않습니다.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        try {
            const html = await view.render(params);
            mainContent.innerHTML = html;
            
            // Call afterRender if exists
            if (view.afterRender) {
                setTimeout(() => view.afterRender(params), 100);
            }
        } catch (error) {
            console.error('View render error:', error);
            mainContent.innerHTML = `
                <div class="view-container">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        <h3>오류가 발생했습니다</h3>
                        <p>페이지를 로드하는 중 문제가 발생했습니다.</p>
                    </div>
                </div>
            `;
        }
    }

    // Show loading state
    showLoading() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="loading-view">
                    <div class="loading-spinner"></div>
                    <p>로딩 중...</p>
                </div>
            `;
        }
    }

    // Update user info in sidebar
    updateUserInfo() {
        if (!this.currentUser) return;
        
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName) userName.textContent = this.currentUser.name || '사용자';
        if (userRole) userRole.textContent = this.currentUser.team || this.currentUser.role || '';
        if (userAvatar) userAvatar.textContent = this.currentUser.name?.charAt(0) || '👤';
    }

    // Initialize sample data
    initSampleData() {
        const existingRequests = JSON.parse(localStorage.getItem('taskflowRequests') || '[]');
        
        // formData가 없는 기존 데이터가 있거나, 데이터가 없으면 새로 생성
        const hasFormData = existingRequests.some(r => r.formData && Object.keys(r.formData).length > 0);
        // 1년치 데이터가 있는지 확인
        const hasYearlyData = existingRequests.some(r => r.id && r.id.includes('YEARLY'));
        // 로그인 사용자용 평가 가능 신청서 확인
        const hasEvaluatableRequests = existingRequests.some(r => r.id && r.id.includes('EVAL'));
        
        if (existingRequests.length === 0 || !hasFormData) {
            console.log('Generating sample requests with full form data...');
            const sampleRequests = this.generateSampleRequests();
            // 1년치 업무 처리 데이터 추가
            const yearlyRequests = this.generateYearlyProcessedRequests();
            // 로그인 사용자용 평가 가능 신청서 추가
            const evaluatableRequests = this.generateEvaluatableRequests();
            const allRequests = [...yearlyRequests, ...evaluatableRequests, ...sampleRequests];
            localStorage.setItem('taskflowRequests', JSON.stringify(allRequests));
            console.log('Generated', allRequests.length, 'sample requests (including yearly and evaluatable data)');
        } else if (!hasYearlyData) {
            // 1년치 데이터만 없으면 추가
            console.log('Adding yearly processed requests...');
            const yearlyRequests = this.generateYearlyProcessedRequests();
            const evaluatableRequests = this.generateEvaluatableRequests();
            const allRequests = [...yearlyRequests, ...evaluatableRequests, ...existingRequests];
            localStorage.setItem('taskflowRequests', JSON.stringify(allRequests));
            console.log('Added', yearlyRequests.length, 'yearly requests and evaluatable requests');
        } else if (!hasEvaluatableRequests) {
            // 평가 가능 신청서가 없으면 추가
            console.log('Adding evaluatable requests for demo users...');
            const evaluatableRequests = this.generateEvaluatableRequests();
            const allRequests = [...evaluatableRequests, ...existingRequests];
            localStorage.setItem('taskflowRequests', JSON.stringify(allRequests));
            console.log('Added', evaluatableRequests.length, 'evaluatable requests');
        }
    }
    
    // 로그인 사용자용 평가 가능 신청서 생성 (데모 계정이 요청자인 완료된 신청서)
    generateEvaluatableRequests() {
        const now = new Date();
        
        // 데모 계정들 (로그인 가능한 사용자) - ID는 login.js의 authenticateUser와 일치해야 함
        const demoUsers = {
            admin: { id: 'admin', name: '관리자', email: 'admin@taskflow.com', team: '시스템관리팀', department: '경영지원' },
            manager: { id: 'manager', name: '김매니저', email: 'manager@taskflow.com', team: 'Backend팀', department: '개발본부' },
            user: { id: 'user', name: '이사원', email: 'user@taskflow.com', team: 'Frontend팀', department: '개발본부' }
        };
        
        // 담당자들
        const assignees = [
            { id: 'assign-1', name: '박민수', team: 'Backend팀', role: '팀장' },
            { id: 'assign-2', name: '이영희', team: 'Frontend팀', role: '팀장' },
            { id: 'assign-3', name: '최수진', team: 'Infra팀', role: '과장' },
            { id: 'assign-4', name: '정민호', team: 'QA팀', role: '대리' }
        ];
        
        const requests = [];
        
        // 각 데모 사용자별로 완료된 신청서 2-3개씩 생성
        Object.entries(demoUsers).forEach(([userType, user], userIdx) => {
            const userRequests = [
                {
                    title: `${user.name}님의 API 개발 요청`,
                    templateId: 'sample_be_001',
                    templateName: 'API 개발 요청서',
                    templateCategory: 'Backend',
                    description: 'REST API 신규 개발 요청입니다.',
                    assignee: assignees[0]
                },
                {
                    title: `${user.name}님의 화면 개발 요청`,
                    templateId: 'sample_fe_001',
                    templateName: '화면 개발 요청서',
                    templateCategory: 'Frontend',
                    description: '관리자 대시보드 화면 개발 요청입니다.',
                    assignee: assignees[1]
                },
                {
                    title: `${user.name}님의 서버 증설 요청`,
                    templateId: 'sample_infra_001',
                    templateName: '서버 증설 요청서',
                    templateCategory: 'Infra',
                    description: '서비스 확장을 위한 서버 증설 요청입니다.',
                    assignee: assignees[2]
                }
            ];
            
            userRequests.forEach((reqData, reqIdx) => {
                const createdDate = new Date(now.getTime() - (30 + userIdx * 10 + reqIdx * 5) * 24 * 60 * 60 * 1000);
                const completedDate = new Date(createdDate.getTime() + (3 + reqIdx) * 24 * 60 * 60 * 1000);
                
                requests.push({
                    id: `REQ-EVAL-${userType.toUpperCase()}-${String(reqIdx + 1).padStart(3, '0')}`,
                    title: reqData.title,
                    templateId: reqData.templateId,
                    templateName: reqData.templateName,
                    templateCategory: reqData.templateCategory,
                    status: 'completed',
                    priority: ['medium', 'high', 'urgent'][reqIdx % 3],
                    requester: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        team: user.team
                    },
                    assignees: [reqData.assignee],
                    targetTeam: { name: reqData.templateCategory + '팀' },
                    formData: {
                        title: reqData.title,
                        description: reqData.description,
                        priority: ['medium', 'high', 'urgent'][reqIdx % 3],
                        requesterName: user.name,
                        requesterTeam: user.team,
                        requesterEmail: user.email
                    },
                    createdAt: createdDate.toISOString(),
                    submittedAt: createdDate.toISOString(),
                    acceptedAt: new Date(createdDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                    completedAt: completedDate.toISOString(),
                    completedBy: reqData.assignee.name,
                    history: [
                        { type: 'submitted', action: '신청서 제출', timestamp: createdDate.toISOString(), user: user.name },
                        { type: 'accepted', action: '신청서 접수', timestamp: new Date(createdDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), user: reqData.assignee.name },
                        { type: 'completed', action: '처리 완료', timestamp: completedDate.toISOString(), user: reqData.assignee.name }
                    ]
                });
            });
        });
        
        return requests;
    }
    
    // 1년치 업무 처리 신청서 데이터 생성 (특정 팀/담당자 기준)
    generateYearlyProcessedRequests() {
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        
        // 특정 팀: Backend팀, Frontend팀 담당자들
        const targetAssignees = [
            { id: 'be-1', name: '박민수', team: 'Backend팀', position: '팀장', email: 'mspark@company.com' },
            { id: 'be-2', name: '유재석', team: 'Backend팀', position: '차장', email: 'jsyoo@company.com' },
            { id: 'be-3', name: '신동욱', team: 'Backend팀', position: '과장', email: 'dwshin@company.com' },
            { id: 'fe-1', name: '이영희', team: 'Frontend팀', position: '팀장', email: 'yhlee@company.com' },
            { id: 'fe-2', name: '조예진', team: 'Frontend팀', position: '과장', email: 'yjjo@company.com' },
            { id: 'fe-3', name: '김다은', team: 'Frontend팀', position: '대리', email: 'dekim@company.com' }
        ];
        
        // 요청자들
        const requesters = [
            { id: 'req-1', name: '김철수', team: '마케팅팀', email: 'cskim@company.com' },
            { id: 'req-2', name: '이수진', team: '영업팀', email: 'sjlee@company.com' },
            { id: 'req-3', name: '박지영', team: '기획팀', email: 'jypark@company.com' },
            { id: 'req-4', name: '최민호', team: '재무팀', email: 'mhchoi@company.com' },
            { id: 'req-5', name: '정하늘', team: '인사팀', email: 'hnjung@company.com' }
        ];
        
        // 1년치 업무 데이터 (월별로 다양하게)
        const yearlyTaskData = [
            // 1월 - 연초 계획 관련
            { month: 0, title: '2024년 신규 API 개발 요청', category: 'Backend', type: 'API 개발', priority: 'high', description: '2024년 신규 서비스를 위한 REST API 개발 요청입니다.' },
            { month: 0, title: '관리자 대시보드 리뉴얼', category: 'Frontend', type: '화면 개발', priority: 'high', description: '관리자 페이지 전면 리뉴얼 작업입니다.' },
            
            // 2월 - 기능 개선
            { month: 1, title: '결제 모듈 성능 개선', category: 'Backend', type: '성능 개선', priority: 'urgent', description: '결제 처리 속도 개선이 필요합니다.' },
            { month: 1, title: '모바일 반응형 개선', category: 'Frontend', type: 'UI/UX 개선', priority: 'medium', description: '모바일 환경에서의 사용성 개선 요청입니다.' },
            
            // 3월 - 신규 기능
            { month: 2, title: '회원 등급 시스템 API 개발', category: 'Backend', type: 'API 개발', priority: 'high', description: '회원 등급에 따른 혜택 시스템 API입니다.' },
            { month: 2, title: '마이페이지 포인트 화면 개발', category: 'Frontend', type: '화면 개발', priority: 'medium', description: '포인트 조회 및 사용 내역 화면입니다.' },
            
            // 4월 - 버그 수정
            { month: 3, title: '주문 취소 오류 긴급 수정', category: 'Backend', type: '버그 수정', priority: 'urgent', description: '주문 취소 시 환불 처리가 안되는 버그입니다.' },
            { month: 3, title: '장바구니 UI 버그 수정', category: 'Frontend', type: '버그 수정', priority: 'high', description: '장바구니 수량 변경 시 화면이 깨지는 현상입니다.' },
            
            // 5월 - 시스템 연동
            { month: 4, title: '외부 배송사 API 연동', category: 'Backend', type: '시스템 연동', priority: 'high', description: '신규 배송사 시스템 연동 작업입니다.' },
            { month: 4, title: '배송 추적 화면 개발', category: 'Frontend', type: '화면 개발', priority: 'medium', description: '실시간 배송 추적 화면 개발입니다.' },
            
            // 6월 - 상반기 마감
            { month: 5, title: '상반기 정산 배치 개발', category: 'Backend', type: '배치 작업', priority: 'high', description: '상반기 정산 자동화 배치 프로그램입니다.' },
            { month: 5, title: '정산 리포트 화면 개발', category: 'Frontend', type: '화면 개발', priority: 'medium', description: '정산 내역 조회 및 다운로드 화면입니다.' },
            
            // 7월 - 여름 프로모션
            { month: 6, title: '여름 프로모션 API 개발', category: 'Backend', type: 'API 개발', priority: 'urgent', description: '여름 시즌 할인 이벤트 API입니다.' },
            { month: 6, title: '이벤트 랜딩 페이지 개발', category: 'Frontend', type: '화면 개발', priority: 'high', description: '프로모션 전용 랜딩 페이지입니다.' },
            
            // 8월 - 성능 최적화
            { month: 7, title: '검색 API 성능 최적화', category: 'Backend', type: '성능 개선', priority: 'high', description: '상품 검색 속도 개선 작업입니다.' },
            { month: 7, title: '이미지 로딩 최적화', category: 'Frontend', type: '성능 개선', priority: 'medium', description: '이미지 lazy loading 적용입니다.' },
            
            // 9월 - 추석 대비
            { month: 8, title: '대량 주문 처리 API 개선', category: 'Backend', type: '성능 개선', priority: 'urgent', description: '추석 대비 주문 폭주 대응입니다.' },
            
            // 10월 - 가을 업데이트
            { month: 9, title: '신규 결제수단 연동', category: 'Backend', type: '시스템 연동', priority: 'high', description: '간편결제 추가 연동 작업입니다.' },
            
            // 11월 - 블랙프라이데이
            { month: 10, title: '블프 이벤트 API 개발', category: 'Backend', type: 'API 개발', priority: 'urgent', description: '블랙프라이데이 특가 이벤트 API입니다.' },
            { month: 10, title: '타임세일 화면 개발', category: 'Frontend', type: '화면 개발', priority: 'high', description: '시간 제한 특가 화면입니다.' },
            
            // 12월 - 연말 정산
            { month: 11, title: '연말 정산 배치 개발', category: 'Backend', type: '배치 작업', priority: 'high', description: '연말 정산 자동화 배치입니다.' },
            { month: 11, title: '연간 통계 대시보드 개발', category: 'Frontend', type: '화면 개발', priority: 'medium', description: '연간 실적 통계 대시보드입니다.' }
        ];
        
        const templates = typeof sampleTemplates !== 'undefined' ? sampleTemplates : [];
        const requests = [];
        
        yearlyTaskData.forEach((task, index) => {
            // 해당 월의 랜덤 날짜 생성 (1년 전 기준)
            const taskDate = new Date(oneYearAgo.getFullYear(), task.month, Math.floor(Math.random() * 28) + 1);
            
            // 카테고리에 맞는 담당자 선택
            const categoryAssignees = targetAssignees.filter(a => 
                (task.category === 'Backend' && a.team === 'Backend팀') ||
                (task.category === 'Frontend' && a.team === 'Frontend팀')
            );
            const assignee = categoryAssignees[Math.floor(Math.random() * categoryAssignees.length)];
            const requester = requesters[Math.floor(Math.random() * requesters.length)];
            
            // 템플릿 찾기
            const templatePrefix = task.category === 'Backend' ? 'sample_be' : 'sample_fe';
            const template = templates.find(t => t.id.startsWith(templatePrefix)) || templates[0];
            
            // 처리 완료 날짜 (요청일 + 3~14일)
            const processingDays = Math.floor(Math.random() * 11) + 3;
            const completedDate = new Date(taskDate.getTime() + processingDays * 24 * 60 * 60 * 1000);
            
            // formData 생성
            const formData = template ? this.generateFormDataForTemplate(template, requester, task.priority, completedDate) : {};
            
            const request = {
                id: `REQ-YEARLY-${String(index + 1).padStart(3, '0')}`,
                title: task.title,
                description: task.description,
                templateId: template?.id || 'sample_be_001',
                templateName: template?.formTitle || task.type,
                templateCategory: task.category,
                status: 'completed',
                priority: task.priority,
                dueDate: new Date(taskDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                requester: requester,
                targetTeam: { id: task.category.toLowerCase(), name: task.category + '팀' },
                createdAt: taskDate.toISOString(),
                submittedAt: taskDate.toISOString(),
                acceptedAt: new Date(taskDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: completedDate.toISOString(),
                assignees: [assignee],
                history: [
                    {
                        type: 'submitted',
                        action: '신청서 제출',
                        timestamp: taskDate.toISOString(),
                        user: requester.name
                    },
                    {
                        type: 'accepted',
                        action: '신청서 접수',
                        timestamp: new Date(taskDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                        user: assignee.name
                    },
                    {
                        type: 'assigned',
                        action: `담당자 배정: ${assignee.name}`,
                        timestamp: new Date(taskDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                        user: assignee.name
                    },
                    {
                        type: 'completed',
                        action: '처리 완료',
                        timestamp: completedDate.toISOString(),
                        user: assignee.name
                    }
                ],
                formData: formData,
                // 평가 데이터 추가
                evaluation: {
                    score: Math.floor(Math.random() * 20) + 80, // 80~100점
                    feedback: ['빠른 처리 감사합니다.', '요청사항이 잘 반영되었습니다.', '친절한 응대 감사합니다.', '기대 이상의 결과물입니다.'][Math.floor(Math.random() * 4)],
                    evaluatedAt: new Date(completedDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                    evaluatedBy: requester.name
                }
            };
            
            requests.push(request);
        });
        
        return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Generate sample requests with full form data
    generateSampleRequests() {
        const statuses = ['submitted', 'in_progress', 'completed', 'rejected'];
        const priorities = ['low', 'medium', 'high', 'urgent'];
        
        // 템플릿 ID와 매칭되는 샘플 데이터
        const sampleRequestData = [
            { templateId: 'sample_dba_001', title: '2024년 4분기 매출 데이터 추출' },
            { templateId: 'sample_dba_002', title: '회원 테이블 마케팅 동의 컬럼 추가' },
            { templateId: 'sample_dba_003', title: '주문 조회 쿼리 최적화 요청' },
            { templateId: 'sample_dba_004', title: '월간 정산 데이터 백업 요청' },
            { templateId: 'sample_fe_001', title: '경영진 대시보드 신규 개발' },
            { templateId: 'sample_fe_002', title: '주문 목록 화면 검색 기능 개선' },
            { templateId: 'sample_fe_003', title: '모바일 앱 반응형 개선' },
            { templateId: 'sample_fe_004', title: '공통 버튼 컴포넌트 개발' },
            { templateId: 'sample_be_001', title: '회원 관리 REST API 개발' },
            { templateId: 'sample_be_002', title: '정산 배치 프로그램 개발' },
            { templateId: 'sample_be_003', title: '주문 API 성능 개선' },
            { templateId: 'sample_be_004', title: '외부 결제사 연동 개발' },
            { templateId: 'sample_infra_001', title: 'API 서버 증설 요청' },
            { templateId: 'sample_infra_002', title: '신규 서비스 도메인 등록' },
            { templateId: 'sample_infra_003', title: 'APM 모니터링 설정 요청' },
            { templateId: 'sample_infra_004', title: '스테이징 환경 배포 요청' },
            { templateId: 'sample_qa_001', title: '회원 서비스 통합 테스트' },
            { templateId: 'sample_qa_002', title: '결제 모듈 버그 리포트' },
            { templateId: 'sample_qa_003', title: '메인 페이지 성능 테스트' },
            { templateId: 'sample_qa_004', title: '주문 프로세스 회귀 테스트' },
            { templateId: 'sample_sec_001', title: '4분기 보안 취약점 점검' },
            { templateId: 'sample_sec_002', title: '웹 애플리케이션 취약점 분석' },
            { templateId: 'sample_sec_003', title: 'DB 접근 권한 신청' },
            { templateId: 'sample_plan_001', title: '2025년 서비스 로드맵 수립' },
            { templateId: 'sample_plan_002', title: '신규 결제 수단 요구사항 분석' },
            { templateId: 'sample_plan_003', title: '프로젝트 일정 협의 - Q1' },
            { templateId: 'sample_common_001', title: '일반 업무 협조 요청' },
            { templateId: 'sample_common_002', title: '회의실 예약 - 12월 전략회의' },
            { templateId: 'sample_common_003', title: '비품 구매 요청' }
        ];
        
        const users = [
            { id: 'user1', name: '김철수', team: 'Frontend팀', email: 'cskim@company.com' },
            { id: 'user2', name: '이영희', team: 'Backend팀', email: 'yhlee@company.com' },
            { id: 'user3', name: '박지민', team: 'DBA팀', email: 'jmpark@company.com' },
            { id: 'user4', name: '최수진', team: 'Infra팀', email: 'sjchoi@company.com' },
            { id: 'user5', name: '정민호', team: 'QA팀', email: 'mhjung@company.com' },
            { id: 'user6', name: '강예린', team: '보안팀', email: 'yrkang@company.com' },
            { id: 'user7', name: '윤서연', team: '기획팀', email: 'syyoon@company.com' },
            { id: 'user8', name: '조현우', team: '마케팅팀', email: 'hwjo@company.com' },
            { id: 'user9', name: '한소희', team: '영업팀', email: 'shhan@company.com' },
            { id: 'user10', name: '임재현', team: '재무팀', email: 'jhlim@company.com' }
        ];
        
        const assignees = [
            { id: 'a1', name: '한지민', role: '담당자' },
            { id: 'a2', name: '송태양', role: '담당자' },
            { id: 'a3', name: '조예진', role: '담당자' },
            { id: 'a4', name: '신동욱', role: '담당자' },
            { id: 'a5', name: '권나연', role: '담당자' },
            { id: 'a6', name: '오승훈', role: '담당자' }
        ];
        
        const requests = [];
        const now = new Date();
        
        // 템플릿 가져오기
        const templates = typeof sampleTemplates !== 'undefined' ? sampleTemplates : [];
        
        for (let i = 0; i < sampleRequestData.length; i++) {
            const sampleData = sampleRequestData[i];
            const template = templates.find(t => t.id === sampleData.templateId);
            
            if (!template) continue;
            
            const daysAgo = Math.floor(Math.random() * 30);
            const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const user = users[Math.floor(Math.random() * users.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            const dueDate = new Date(now.getTime() + (Math.random() * 14 + 7) * 24 * 60 * 60 * 1000);
            
            // 템플릿 컴포넌트에 맞는 formData 생성
            const formData = this.generateFormDataForTemplate(template, user, priority, dueDate);
            
            const request = {
                id: `REQ-2024-${String(i + 1).padStart(4, '0')}`,
                title: sampleData.title,
                description: formData.description || template.description,
                templateId: template.id,
                templateName: template.formTitle || template.name,
                templateCategory: template.category,
                status: status,
                priority: priority,
                dueDate: dueDate.toISOString().split('T')[0],
                requester: user,
                targetTeam: { id: template.category.toLowerCase(), name: template.category + '팀' },
                createdAt: createdAt.toISOString(),
                submittedAt: createdAt.toISOString(),
                assignees: status === 'in_progress' || status === 'completed' ? 
                    [assignees[Math.floor(Math.random() * assignees.length)]] : [],
                history: [{
                    type: 'submitted',
                    action: '신청서 제출',
                    timestamp: createdAt.toISOString(),
                    user: user.name
                }],
                formData: formData
            };
            
            // 상태에 따른 이력 추가
            if (status === 'in_progress' || status === 'completed') {
                const acceptedAt = new Date(createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000);
                request.acceptedAt = acceptedAt.toISOString();
                request.history.push({
                    type: 'accepted',
                    action: '신청서 접수',
                    timestamp: acceptedAt.toISOString(),
                    user: request.assignees[0]?.name || '담당자'
                });
            }
            
            if (status === 'completed') {
                const completedAt = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
                request.completedAt = completedAt.toISOString();
                request.history.push({
                    type: 'completed',
                    action: '처리 완료',
                    timestamp: completedAt.toISOString(),
                    user: request.assignees[0]?.name || '담당자'
                });
            }
            
            if (status === 'rejected') {
                const rejectedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);
                request.rejectedAt = rejectedAt.toISOString();
                request.rejectReason = '요청 내용이 불충분합니다. 추가 정보를 제공해주세요.';
                request.history.push({
                    type: 'rejected',
                    action: '신청서 반려: 요청 내용이 불충분합니다.',
                    timestamp: rejectedAt.toISOString(),
                    user: '담당자'
                });
            }
            
            requests.push(request);
        }
        
        return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // 템플릿 컴포넌트에 맞는 임의 데이터 생성
    generateFormDataForTemplate(template, user, priority, dueDate) {
        const formData = {};
        let description = '';
        
        // 샘플 텍스트 데이터
        const sampleTexts = {
            title: [
                '긴급 처리 요청 건', '정기 업무 요청', '신규 기능 개발 요청',
                '시스템 개선 요청', '데이터 처리 요청', '서비스 점검 요청'
            ],
            description: [
                '상세 내용은 첨부 파일을 참고해주세요. 빠른 처리 부탁드립니다.',
                '해당 건은 고객사 요청으로 인해 긴급하게 처리가 필요합니다.',
                '기존 시스템의 성능 개선을 위한 요청입니다. 검토 부탁드립니다.',
                '신규 서비스 런칭을 위해 필요한 작업입니다.',
                '정기 점검 및 유지보수 관련 요청입니다.',
                '보안 강화를 위한 시스템 업데이트 요청입니다.'
            ],
            reason: [
                '비즈니스 요구사항 변경으로 인한 요청입니다.',
                '시스템 성능 개선이 필요합니다.',
                '고객 피드백 반영을 위한 요청입니다.',
                '법적 규정 준수를 위해 필요합니다.',
                '운영 효율성 향상을 위한 요청입니다.'
            ],
            tableName: ['TB_USER', 'TB_ORDER', 'TB_PRODUCT', 'TB_PAYMENT', 'TB_LOG', 'TB_MEMBER'],
            columnChange: [
                'VARCHAR(100) 타입의 marketing_agree 컬럼 추가',
                'INT 타입의 view_count 컬럼 추가',
                'DATETIME 타입의 last_login 컬럼 추가',
                'TEXT 타입의 description 컬럼 추가'
            ],
            apiEndpoint: ['/api/v1/users', '/api/v1/orders', '/api/v1/products', '/api/v1/auth'],
            screenName: ['메인 대시보드', '주문 목록', '회원 관리', '상품 관리', '설정'],
            serverSpec: ['AWS EC2 t3.large', 'AWS EC2 t3.xlarge', 'GCP n1-standard-4'],
            domain: ['api.example.com', 'admin.example.com', 'service.example.com'],
            testCase: ['로그인 기능 테스트', '결제 프로세스 테스트', '회원가입 테스트', 'API 응답 테스트'],
            bugDescription: [
                '특정 조건에서 에러가 발생합니다.',
                '데이터가 정상적으로 저장되지 않습니다.',
                '화면이 깨지는 현상이 있습니다.',
                '응답 속도가 느립니다.'
            ]
        };
        
        const departments = ['마케팅팀', '영업팀', '재무팀', '인사팀', '기획팀', '운영팀'];
        const projects = ['ERP 시스템', '그룹웨어', '홈페이지', 'CRM', '신규 프로젝트'];
        const dataFormats = ['Excel (.xlsx)', 'CSV', 'PDF'];
        const dataUsages = ['보고서 작성', '분석/통계', '감사 자료', '외부 제출용'];
        
        if (!template.components) return formData;
        
        template.components.forEach(component => {
            const id = component.id;
            const type = component.type;
            const label = component.label || '';
            
            // 컴포넌트 타입별 데이터 생성
            switch (type) {
                case 'text-input':
                    if (label.includes('제목')) {
                        formData[id] = { componentType: type, label, value: sampleTexts.title[Math.floor(Math.random() * sampleTexts.title.length)] };
                    } else if (label.includes('테이블') || label.includes('TABLE')) {
                        formData[id] = { componentType: type, label, value: sampleTexts.tableName[Math.floor(Math.random() * sampleTexts.tableName.length)] };
                    } else if (label.includes('API') || label.includes('엔드포인트')) {
                        formData[id] = { componentType: type, label, value: sampleTexts.apiEndpoint[Math.floor(Math.random() * sampleTexts.apiEndpoint.length)] };
                    } else if (label.includes('화면') || label.includes('페이지')) {
                        formData[id] = { componentType: type, label, value: sampleTexts.screenName[Math.floor(Math.random() * sampleTexts.screenName.length)] };
                    } else if (label.includes('도메인')) {
                        formData[id] = { componentType: type, label, value: sampleTexts.domain[Math.floor(Math.random() * sampleTexts.domain.length)] };
                    } else {
                        formData[id] = { componentType: type, label, value: '요청 내용 ' + Math.floor(Math.random() * 1000) };
                    }
                    break;
                    
                case 'textarea':
                    if (label.includes('설명') || label.includes('내용') || label.includes('상세')) {
                        const desc = sampleTexts.description[Math.floor(Math.random() * sampleTexts.description.length)];
                        formData[id] = { componentType: type, label, value: desc };
                        if (!description) description = desc;
                    } else if (label.includes('사유') || label.includes('이유')) {
                        formData[id] = { componentType: type, label, value: sampleTexts.reason[Math.floor(Math.random() * sampleTexts.reason.length)] };
                    } else if (label.includes('버그') || label.includes('오류') || label.includes('증상')) {
                        formData[id] = { componentType: type, label, value: sampleTexts.bugDescription[Math.floor(Math.random() * sampleTexts.bugDescription.length)] };
                    } else if (label.includes('변경')) {
                        formData[id] = { componentType: type, label, value: sampleTexts.columnChange[Math.floor(Math.random() * sampleTexts.columnChange.length)] };
                    } else {
                        formData[id] = { componentType: type, label, value: sampleTexts.description[Math.floor(Math.random() * sampleTexts.description.length)] };
                    }
                    break;
                    
                case 'number-input':
                    if (label.includes('수량') || label.includes('개수')) {
                        formData[id] = { componentType: type, label, value: Math.floor(Math.random() * 10) + 1 };
                    } else if (label.includes('금액') || label.includes('비용')) {
                        formData[id] = { componentType: type, label, value: (Math.floor(Math.random() * 100) + 1) * 10000 };
                    } else {
                        formData[id] = { componentType: type, label, value: Math.floor(Math.random() * 100) + 1 };
                    }
                    break;
                    
                case 'date-input':
                    const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
                    formData[id] = { componentType: type, label, value: randomDate.toISOString().split('T')[0] };
                    break;
                    
                case 'deadline-input':
                    formData[id] = { componentType: type, label, value: dueDate.toISOString().split('T')[0] };
                    break;
                    
                case 'email-input':
                    formData[id] = { componentType: type, label, value: user.email };
                    break;
                    
                case 'select':
                    if (component.options && component.options.length > 0) {
                        formData[id] = { componentType: type, label, value: component.options[Math.floor(Math.random() * component.options.length)] };
                    }
                    break;
                    
                case 'department-select':
                    const depts = component.departments || departments;
                    formData[id] = { componentType: type, label, value: depts[Math.floor(Math.random() * depts.length)] };
                    break;
                    
                case 'project-select':
                    const projs = component.options || projects;
                    formData[id] = { componentType: type, label, value: projs[Math.floor(Math.random() * projs.length)] };
                    break;
                    
                case 'checkbox':
                    if (component.options && component.options.length > 0) {
                        const selectedCount = Math.floor(Math.random() * component.options.length) + 1;
                        const shuffled = [...component.options].sort(() => 0.5 - Math.random());
                        formData[id] = { componentType: type, label, value: shuffled.slice(0, selectedCount) };
                    }
                    break;
                    
                case 'radio':
                    if (component.options && component.options.length > 0) {
                        formData[id] = { componentType: type, label, value: component.options[Math.floor(Math.random() * component.options.length)] };
                    }
                    break;
                    
                case 'rating':
                    formData[id] = { componentType: type, label, value: Math.floor(Math.random() * 5) + 1 };
                    break;
                    
                case 'priority-select':
                    formData[id] = { componentType: type, label, value: priority };
                    break;
                    
                case 'yes-no-select':
                    formData[id] = { componentType: type, label, value: Math.random() > 0.5 ? 'yes' : 'no' };
                    break;
                    
                case 'file-upload':
                case 'image-upload':
                    const fileNames = ['요청서_첨부.pdf', '스크린샷.png', '참고자료.xlsx', '설계문서.docx'];
                    formData[id] = { componentType: type, label, value: [fileNames[Math.floor(Math.random() * fileNames.length)]] };
                    break;
                    
                case 'link-input':
                    formData[id] = { componentType: type, label, value: 'https://docs.google.com/document/d/example' };
                    break;
            }
        });
        
        formData.description = description;
        return formData;
    }
}

// ===== Global Functions =====

// Navigate to a route (prevents default link behavior)
function navigateTo(path) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    console.log('Navigating to:', path);
    router.navigate(path);
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// Handle logout
function handleLogout() {
    logoutUser();
    window.location.href = 'login.html';
}

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; padding: 0 0 0 12px;">×</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show modal
function showModal({ title, content, actions = [] }) {
    const container = document.getElementById('modalContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="modal">
            ${title ? `
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="closeModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            ` : ''}
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length > 0 ? `
                <div class="modal-footer">
                    ${actions.map((action, i) => `
                        <button class="btn ${action.class || 'btn-secondary'}" onclick="modalActions[${i}]()">${action.label}</button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    // Store action handlers
    window.modalActions = actions.map(a => a.action);
    
    container.classList.add('show');
    
    // Close on backdrop click
    container.onclick = (e) => {
        if (e.target === container) {
            closeModal();
        }
    };
}

// Close modal
function closeModal() {
    const container = document.getElementById('modalContainer');
    if (container) {
        container.classList.remove('show');
    }
}

// ===== Initialize Application =====
console.log('spa-app.js loaded');
const app = new App();

// DOM이 이미 로드되었는지 확인
if (document.readyState === 'loading') {
    console.log('Waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired');
        app.init();
    });
} else {
    console.log('DOM already loaded, initializing immediately');
    app.init();
}

// Export for use
window.app = app;
window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.handleLogout = handleLogout;
window.showToast = showToast;
window.showModal = showModal;
window.closeModal = closeModal;

