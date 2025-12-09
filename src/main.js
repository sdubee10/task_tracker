/**
 * Main Entry Point - MVP 구조 초기화
 * 
 * 이 파일은 Model, View, Presenter를 연결하고 애플리케이션을 초기화합니다.
 */

// ===== 전역 인스턴스 =====
let graphDB;
let presenter;
let view;

// ===== 초기화 =====
async function initializeApp() {
    try {
        // 1. Model 초기화
        graphDB = new GraphDatabase();
        
        // 2. View 초기화
        view = new RequestGraphView('graphCanvas');
        
        // 3. Presenter 초기화 (Model과 View 연결)
        presenter = new RequestGraphPresenter(graphDB, view);
        
        // 4. View에 Presenter 연결
        view.setPresenter(presenter);
        
        // 5. View 초기화
        view.init();
        
        // 6. Presenter 초기화 (데이터 로드 및 샘플 데이터 생성)
        await presenter.initialize();
        
        console.log('✅ Application initialized successfully');
        console.log('📊 Stats:', presenter.getSummaryStats());
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
    }
}

// ===== 전역 함수들 (HTML에서 호출) =====

// 테마
function toggleThemeDropdown() {
    view?.toggleThemeDropdown();
}

function setTheme(theme) {
    view?.setTheme(theme);
}

// 줌/팬
function zoomIn() {
    view?.zoomIn();
}

function zoomOut() {
    view?.zoomOut();
}

function resetView() {
    view?.resetView();
}

// 레이아웃
function selectLayout(layoutType) {
    view?.selectLayout(layoutType);
}

// 필터
function filterByStatus() {
    const value = document.getElementById('statusFilter')?.value;
    presenter?.setFilter('status', value);
    const data = presenter?.getViewData();
    if (data) view?.render(data);
}

function filterByDepartment() {
    const value = document.getElementById('departmentFilter')?.value;
    presenter?.setFilter('department', value);
    const data = presenter?.getViewData();
    if (data) view?.render(data);
}

// 모달
function openAddRequestModal() {
    view?.openAddRequestModal();
}

function openAddMemberModal() {
    view?.openAddMemberModal();
    updateTeamOptions();
}

function closeModal(modalId) {
    view?.closeModal(modalId);
}

function updateTeamOptions() {
    const deptId = document.getElementById('memberDepartment')?.value;
    const teamSelect = document.getElementById('memberTeam');
    
    if (!teamSelect) return;
    
    if (!deptId) {
        teamSelect.innerHTML = '<option value="">부서를 먼저 선택하세요</option>';
        return;
    }
    
    const teams = {
        dba: [{ id: 'dba-data', name: '데이터관리' }, { id: 'dba-perf', name: '성능최적화' }],
        frontend: [{ id: 'fe-web', name: '웹개발' }, { id: 'fe-mobile', name: '모바일' }],
        backend: [{ id: 'be-api', name: 'API개발' }, { id: 'be-batch', name: '배치처리' }],
        infra: [{ id: 'infra-cloud', name: '클라우드' }, { id: 'infra-network', name: '네트워크' }],
        qa: [{ id: 'qa-auto', name: '자동화테스트' }, { id: 'qa-manual', name: '수동테스트' }],
        security: [{ id: 'sec-audit', name: '보안감사' }, { id: 'sec-ops', name: '보안운영' }]
    };
    
    const deptTeams = teams[deptId] || [];
    teamSelect.innerHTML = deptTeams.map(t => 
        `<option value="${t.id}">${t.name}</option>`
    ).join('');
}

// 신청서 추가
function addRequest() {
    const title = document.getElementById('requestTitle')?.value;
    const type = document.getElementById('requestType')?.value;
    const priority = document.getElementById('requestPriority')?.value;
    const department = document.getElementById('requestDepartment')?.value;
    const description = document.getElementById('requestDescription')?.value;
    const deadline = document.getElementById('requestDeadline')?.value;
    
    if (!title || !type || !department) {
        view?.showToast('필수 항목을 입력해주세요', 'error');
        return;
    }
    
    const canvas = document.getElementById('graphCanvas');
    const rect = canvas?.getBoundingClientRect();
    
    presenter?.createRequest({
        title,
        type,
        priority,
        department,
        description,
        deadline,
        x: rect ? (rect.width / 2 - view.panOffset.x) / view.zoom - 100 : 100,
        y: rect ? (rect.height / 3 - view.panOffset.y) / view.zoom : 100
    });
    
    const data = presenter?.getViewData();
    if (data) view?.render(data);
    
    closeModal('addRequestModal');
    document.getElementById('addRequestForm')?.reset();
    view?.showToast('신청서가 추가되었습니다', 'success');
}

// 담당자 추가
function addMember() {
    const name = document.getElementById('memberName')?.value;
    const department = document.getElementById('memberDepartment')?.value;
    const team = document.getElementById('memberTeam')?.value;
    const position = document.getElementById('memberPosition')?.value;
    const email = document.getElementById('memberEmail')?.value;
    
    if (!name || !department || !team) {
        view?.showToast('필수 항목을 입력해주세요', 'error');
        return;
    }
    
    const canvas = document.getElementById('graphCanvas');
    const rect = canvas?.getBoundingClientRect();
    
    presenter?.createMember({
        name,
        department,
        team,
        position,
        email,
        x: rect ? (rect.width / 2 - view.panOffset.x) / view.zoom - 70 : 100,
        y: rect ? (rect.height * 2 / 3 - view.panOffset.y) / view.zoom : 500
    });
    
    const data = presenter?.getViewData();
    if (data) view?.render(data);
    
    closeModal('addMemberModal');
    document.getElementById('addMemberForm')?.reset();
    view?.showToast('담당자가 추가되었습니다', 'success');
}

// 평가 저장
function saveEvaluation() {
    view?.saveEvaluation();
}

// 데이터 초기화
function resetSampleData() {
    if (confirm('모든 데이터를 초기화하고 샘플 데이터로 다시 시작하시겠습니까?')) {
        presenter?.resetToSampleData();
        view?.showToast('샘플 데이터가 초기화되었습니다', 'success');
    }
}

// 부서 토글
function toggleAllDepartments() {
    const departments = ['dba', 'frontend', 'backend', 'infra', 'qa', 'security'];
    const allExpanded = document.querySelectorAll('.department-header.expanded').length === departments.length;
    
    departments.forEach(deptId => {
        const header = document.querySelector(`.department-item:has(#team-${deptId}) .department-header`);
        const teamList = document.getElementById(`team-${deptId}`);
        
        if (header && teamList) {
            if (allExpanded) {
                header.classList.remove('expanded');
                teamList.classList.remove('show');
            } else {
                header.classList.add('expanded');
                teamList.classList.add('show');
            }
        }
    });
}

// ===== 애플리케이션 시작 =====
document.addEventListener('DOMContentLoaded', initializeApp);


