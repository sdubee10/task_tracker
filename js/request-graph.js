// ===== Graph Database =====
// 그래프 DB 구조: 노드(Nodes)와 엣지(Edges)로 관계 관리
class GraphDB {
    constructor() {
        this.nodes = new Map();     // nodeId -> nodeData
        this.edges = new Map();     // edgeId -> edgeData
        this.adjacencyList = new Map(); // nodeId -> Set of connected nodeIds
    }

    // 노드 추가
    addNode(id, type, data) {
        this.nodes.set(id, { id, type, data });
        if (!this.adjacencyList.has(id)) {
            this.adjacencyList.set(id, new Set());
        }
        return this.nodes.get(id);
    }

    // 노드 가져오기
    getNode(id) {
        return this.nodes.get(id);
    }

    // 노드 업데이트
    updateNode(id, data) {
        const node = this.nodes.get(id);
        if (node) {
            node.data = { ...node.data, ...data };
            return node;
        }
        return null;
    }

    // 노드 삭제
    deleteNode(id) {
        // 연결된 엣지들 삭제
        const connections = this.adjacencyList.get(id);
        if (connections) {
            connections.forEach(connectedId => {
                this.removeEdge(id, connectedId);
            });
        }
        this.adjacencyList.delete(id);
        return this.nodes.delete(id);
    }

    // 엣지 추가 (관계 생성)
    addEdge(sourceId, targetId, data = {}) {
        const edgeId = `${sourceId}->${targetId}`;
        this.edges.set(edgeId, {
            id: edgeId,
            source: sourceId,
            target: targetId,
            data
        });
        
        if (!this.adjacencyList.has(sourceId)) {
            this.adjacencyList.set(sourceId, new Set());
        }
        if (!this.adjacencyList.has(targetId)) {
            this.adjacencyList.set(targetId, new Set());
        }
        
        this.adjacencyList.get(sourceId).add(targetId);
        this.adjacencyList.get(targetId).add(sourceId);
        
        return this.edges.get(edgeId);
    }

    // 엣지 가져오기
    getEdge(sourceId, targetId) {
        return this.edges.get(`${sourceId}->${targetId}`) || 
               this.edges.get(`${targetId}->${sourceId}`);
    }

    // 엣지 삭제
    removeEdge(sourceId, targetId) {
        this.edges.delete(`${sourceId}->${targetId}`);
        this.edges.delete(`${targetId}->${sourceId}`);
        
        const sourceAdj = this.adjacencyList.get(sourceId);
        const targetAdj = this.adjacencyList.get(targetId);
        
        if (sourceAdj) sourceAdj.delete(targetId);
        if (targetAdj) targetAdj.delete(sourceId);
    }

    // 특정 노드와 연결된 모든 노드 가져오기
    getConnectedNodes(nodeId) {
        const connections = this.adjacencyList.get(nodeId);
        if (!connections) return [];
        
        return Array.from(connections).map(id => this.nodes.get(id)).filter(Boolean);
    }

    // 특정 타입의 모든 노드 가져오기
    getNodesByType(type) {
        return Array.from(this.nodes.values()).filter(node => node.type === type);
    }

    // 모든 엣지 가져오기
    getAllEdges() {
        return Array.from(this.edges.values());
    }

    // 모든 노드 가져오기
    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    // JSON으로 내보내기
    toJSON() {
        return {
            nodes: Array.from(this.nodes.entries()),
            edges: Array.from(this.edges.entries())
        };
    }

    // JSON에서 복원
    fromJSON(json) {
        this.nodes = new Map(json.nodes);
        this.edges = new Map(json.edges);
        
        // adjacencyList 재구성
        this.adjacencyList = new Map();
        this.edges.forEach(edge => {
            if (!this.adjacencyList.has(edge.source)) {
                this.adjacencyList.set(edge.source, new Set());
            }
            if (!this.adjacencyList.has(edge.target)) {
                this.adjacencyList.set(edge.target, new Set());
            }
            this.adjacencyList.get(edge.source).add(edge.target);
            this.adjacencyList.get(edge.target).add(edge.source);
        });
    }
}

// ===== Global State =====
const graphDB = new GraphDB();
let selectedNode = null;
let isDragging = false;
let isConnecting = false;
let connectionSource = null;
let panOffset = { x: 0, y: 0 };
let zoom = 1;
let dragStart = { x: 0, y: 0 };
let nodeStart = { x: 0, y: 0 };

// 부서 및 팀 데이터
const departments = [
    {
        id: 'dba',
        name: 'DBA팀',
        icon: '🗄️',
        teams: [
            { id: 'dba-data', name: '데이터관리' },
            { id: 'dba-perf', name: '성능최적화' }
        ]
    },
    {
        id: 'frontend',
        name: 'Frontend팀',
        icon: '🎨',
        teams: [
            { id: 'fe-web', name: '웹개발' },
            { id: 'fe-mobile', name: '모바일' }
        ]
    },
    {
        id: 'backend',
        name: 'Backend팀',
        icon: '⚙️',
        teams: [
            { id: 'be-api', name: 'API개발' },
            { id: 'be-batch', name: '배치처리' }
        ]
    },
    {
        id: 'infra',
        name: 'Infra팀',
        icon: '🖥️',
        teams: [
            { id: 'infra-cloud', name: '클라우드' },
            { id: 'infra-network', name: '네트워크' }
        ]
    },
    {
        id: 'qa',
        name: 'QA팀',
        icon: '🔍',
        teams: [
            { id: 'qa-auto', name: '자동화테스트' },
            { id: 'qa-manual', name: '수동테스트' }
        ]
    },
    {
        id: 'security',
        name: '보안팀',
        icon: '🔒',
        teams: [
            { id: 'sec-audit', name: '보안감사' },
            { id: 'sec-ops', name: '보안운영' }
        ]
    },
    {
        id: 'planning',
        name: '기획팀',
        icon: '📝',
        teams: [
            { id: 'plan-service', name: '서비스기획' },
            { id: 'plan-product', name: '상품기획' }
        ]
    }
];

// 샘플 데이터 생성 - localStorage의 실제 신청서 데이터 사용
function initializeSampleData() {
    // ===== localStorage에서 실제 신청서 데이터 로드 =====
    const storedRequests = JSON.parse(localStorage.getItem('taskflowRequests') || '[]');
    console.log('Loading requests from localStorage:', storedRequests.length);
    
    // ===== 팀원 데이터 (각 팀별 6명, 다양한 직급) =====
    const sampleMembers = [
        // DBA팀 - 데이터관리 (6명)
        { id: 'member-dba-1', name: '김철수', department: 'dba', team: 'dba-data', position: '팀장', email: 'cskim@company.com' },
        { id: 'member-dba-2', name: '한지민', department: 'dba', team: 'dba-data', position: '과장', email: 'jmhan@company.com' },
        { id: 'member-dba-3', name: '송태양', department: 'dba', team: 'dba-data', position: '대리', email: 'tysong@company.com' },
        { id: 'member-dba-4', name: '임하늘', department: 'dba', team: 'dba-data', position: '주임', email: 'hnim@company.com' },
        { id: 'member-dba-5', name: '박서준', department: 'dba', team: 'dba-data', position: '사원', email: 'sjpark@company.com' },
        { id: 'member-dba-6', name: '최수아', department: 'dba', team: 'dba-data', position: '사원', email: 'sachoi@company.com' },
        // DBA팀 - 성능최적화 (6명)
        { id: 'member-dba-7', name: '정민호', department: 'dba', team: 'dba-perf', position: '차장', email: 'mhjung@company.com' },
        { id: 'member-dba-8', name: '강예린', department: 'dba', team: 'dba-perf', position: '과장', email: 'yrkang@company.com' },
        { id: 'member-dba-9', name: '윤성민', department: 'dba', team: 'dba-perf', position: '대리', email: 'smyoon@company.com' },
        { id: 'member-dba-10', name: '조아라', department: 'dba', team: 'dba-perf', position: '대리', email: 'arjo@company.com' },
        { id: 'member-dba-11', name: '신재현', department: 'dba', team: 'dba-perf', position: '주임', email: 'jhshin@company.com' },
        { id: 'member-dba-12', name: '오지영', department: 'dba', team: 'dba-perf', position: '사원', email: 'jyoh@company.com' },
        
        // Frontend팀 - 웹개발 (6명)
        { id: 'member-fe-1', name: '이영희', department: 'frontend', team: 'fe-web', position: '팀장', email: 'yhlee@company.com' },
        { id: 'member-fe-2', name: '조예진', department: 'frontend', team: 'fe-web', position: '과장', email: 'yjjo@company.com' },
        { id: 'member-fe-3', name: '김다은', department: 'frontend', team: 'fe-web', position: '대리', email: 'dekim@company.com' },
        { id: 'member-fe-4', name: '박준혁', department: 'frontend', team: 'fe-web', position: '대리', email: 'jhpark@company.com' },
        { id: 'member-fe-5', name: '최민지', department: 'frontend', team: 'fe-web', position: '주임', email: 'mjchoi@company.com' },
        { id: 'member-fe-6', name: '한소율', department: 'frontend', team: 'fe-web', position: '사원', email: 'syhan@company.com' },
        // Frontend팀 - 모바일 (6명)
        { id: 'member-fe-7', name: '윤서연', department: 'frontend', team: 'fe-mobile', position: '차장', email: 'syyoon@company.com' },
        { id: 'member-fe-8', name: '문지호', department: 'frontend', team: 'fe-mobile', position: '과장', email: 'jhmoon@company.com' },
        { id: 'member-fe-9', name: '배수진', department: 'frontend', team: 'fe-mobile', position: '대리', email: 'sjbae@company.com' },
        { id: 'member-fe-10', name: '이준서', department: 'frontend', team: 'fe-mobile', position: '대리', email: 'jslee@company.com' },
        { id: 'member-fe-11', name: '김하은', department: 'frontend', team: 'fe-mobile', position: '주임', email: 'hekim@company.com' },
        { id: 'member-fe-12', name: '정우진', department: 'frontend', team: 'fe-mobile', position: '사원', email: 'wjjung@company.com' },
        
        // Backend팀 - API개발 (6명)
        { id: 'member-be-1', name: '박민수', department: 'backend', team: 'be-api', position: '팀장', email: 'mspark@company.com' },
        { id: 'member-be-2', name: '유재석', department: 'backend', team: 'be-api', position: '차장', email: 'jsyoo@company.com' },
        { id: 'member-be-3', name: '신동욱', department: 'backend', team: 'be-api', position: '과장', email: 'dwshin@company.com' },
        { id: 'member-be-4', name: '김태희', department: 'backend', team: 'be-api', position: '대리', email: 'thkim@company.com' },
        { id: 'member-be-5', name: '이수현', department: 'backend', team: 'be-api', position: '주임', email: 'shlee@company.com' },
        { id: 'member-be-6', name: '최강민', department: 'backend', team: 'be-api', position: '사원', email: 'kmchoi@company.com' },
        // Backend팀 - 배치처리 (6명)
        { id: 'member-be-7', name: '장현우', department: 'backend', team: 'be-batch', position: '과장', email: 'hwjang@company.com' },
        { id: 'member-be-8', name: '권나연', department: 'backend', team: 'be-batch', position: '과장', email: 'nykwon@company.com' },
        { id: 'member-be-9', name: '오세훈', department: 'backend', team: 'be-batch', position: '대리', email: 'shoh@company.com' },
        { id: 'member-be-10', name: '임지수', department: 'backend', team: 'be-batch', position: '대리', email: 'jslim@company.com' },
        { id: 'member-be-11', name: '황민정', department: 'backend', team: 'be-batch', position: '주임', email: 'mjhwang@company.com' },
        { id: 'member-be-12', name: '송지원', department: 'backend', team: 'be-batch', position: '사원', email: 'jwsong@company.com' },
        
        // Infra팀 - 클라우드 (6명)
        { id: 'member-infra-1', name: '정수진', department: 'infra', team: 'infra-cloud', position: '팀장', email: 'sjjung@company.com' },
        { id: 'member-infra-2', name: '배준형', department: 'infra', team: 'infra-cloud', position: '과장', email: 'jhbae@company.com' },
        { id: 'member-infra-3', name: '김도현', department: 'infra', team: 'infra-cloud', position: '대리', email: 'dhkim@company.com' },
        { id: 'member-infra-4', name: '박지민', department: 'infra', team: 'infra-cloud', position: '대리', email: 'jmpark@company.com' },
        { id: 'member-infra-5', name: '이서윤', department: 'infra', team: 'infra-cloud', position: '주임', email: 'sylee@company.com' },
        { id: 'member-infra-6', name: '최준호', department: 'infra', team: 'infra-cloud', position: '사원', email: 'jhchoi@company.com' },
        // Infra팀 - 네트워크 (6명)
        { id: 'member-infra-7', name: '오승훈', department: 'infra', team: 'infra-network', position: '차장', email: 'shoh2@company.com' },
        { id: 'member-infra-8', name: '홍길동', department: 'infra', team: 'infra-network', position: '과장', email: 'gdhong@company.com' },
        { id: 'member-infra-9', name: '강민서', department: 'infra', team: 'infra-network', position: '대리', email: 'mskang@company.com' },
        { id: 'member-infra-10', name: '윤채원', department: 'infra', team: 'infra-network', position: '대리', email: 'cwyoon@company.com' },
        { id: 'member-infra-11', name: '조현준', department: 'infra', team: 'infra-network', position: '주임', email: 'hjjo@company.com' },
        { id: 'member-infra-12', name: '김예진', department: 'infra', team: 'infra-network', position: '사원', email: 'yjkim@company.com' },
        
        // QA팀 - 자동화테스트 (6명)
        { id: 'member-qa-1', name: '최동현', department: 'qa', team: 'qa-auto', position: '팀장', email: 'dhchoi@company.com' },
        { id: 'member-qa-2', name: '노지훈', department: 'qa', team: 'qa-auto', position: '과장', email: 'jhnoh@company.com' },
        { id: 'member-qa-3', name: '박소연', department: 'qa', team: 'qa-auto', position: '대리', email: 'sypark@company.com' },
        { id: 'member-qa-4', name: '이민재', department: 'qa', team: 'qa-auto', position: '대리', email: 'mjlee@company.com' },
        { id: 'member-qa-5', name: '김유진', department: 'qa', team: 'qa-auto', position: '주임', email: 'yjkim2@company.com' },
        { id: 'member-qa-6', name: '정하늘', department: 'qa', team: 'qa-auto', position: '사원', email: 'hnjung@company.com' },
        // QA팀 - 수동테스트 (6명)
        { id: 'member-qa-7', name: '안소희', department: 'qa', team: 'qa-manual', position: '차장', email: 'shan@company.com' },
        { id: 'member-qa-8', name: '서민지', department: 'qa', team: 'qa-manual', position: '과장', email: 'mjseo@company.com' },
        { id: 'member-qa-9', name: '한지우', department: 'qa', team: 'qa-manual', position: '대리', email: 'jwhan@company.com' },
        { id: 'member-qa-10', name: '이도윤', department: 'qa', team: 'qa-manual', position: '대리', email: 'dylee@company.com' },
        { id: 'member-qa-11', name: '박서현', department: 'qa', team: 'qa-manual', position: '주임', email: 'shpark@company.com' },
        { id: 'member-qa-12', name: '김나은', department: 'qa', team: 'qa-manual', position: '사원', email: 'nekim@company.com' },
        
        // 보안팀 - 보안감사 (6명)
        { id: 'member-sec-1', name: '차은우', department: 'security', team: 'sec-audit', position: '팀장', email: 'ewcha@company.com' },
        { id: 'member-sec-2', name: '강미래', department: 'security', team: 'sec-audit', position: '과장', email: 'mrkang@company.com' },
        { id: 'member-sec-3', name: '윤서준', department: 'security', team: 'sec-audit', position: '대리', email: 'sjyoon@company.com' },
        { id: 'member-sec-4', name: '조민아', department: 'security', team: 'sec-audit', position: '대리', email: 'majo@company.com' },
        { id: 'member-sec-5', name: '이준영', department: 'security', team: 'sec-audit', position: '주임', email: 'jylee@company.com' },
        { id: 'member-sec-6', name: '박하린', department: 'security', team: 'sec-audit', position: '사원', email: 'hrpark@company.com' },
        // 보안팀 - 보안운영 (6명)
        { id: 'member-sec-7', name: '백승우', department: 'security', team: 'sec-ops', position: '차장', email: 'swbaek@company.com' },
        { id: 'member-sec-8', name: '고윤정', department: 'security', team: 'sec-ops', position: '과장', email: 'yjko@company.com' },
        { id: 'member-sec-9', name: '신유나', department: 'security', team: 'sec-ops', position: '대리', email: 'ynshin@company.com' },
        { id: 'member-sec-10', name: '임재민', department: 'security', team: 'sec-ops', position: '대리', email: 'jmlim@company.com' },
        { id: 'member-sec-11', name: '황수빈', department: 'security', team: 'sec-ops', position: '주임', email: 'sbhwang@company.com' },
        { id: 'member-sec-12', name: '정다은', department: 'security', team: 'sec-ops', position: '사원', email: 'dejung@company.com' },
        
        // 기획팀 - 서비스기획 (6명)
        { id: 'member-plan-1', name: '류승완', department: 'planning', team: 'plan-service', position: '팀장', email: 'swryu@company.com' },
        { id: 'member-plan-2', name: '김소현', department: 'planning', team: 'plan-service', position: '과장', email: 'shkim@company.com' },
        { id: 'member-plan-3', name: '이정민', department: 'planning', team: 'plan-service', position: '대리', email: 'jmlee@company.com' },
        { id: 'member-plan-4', name: '박유진', department: 'planning', team: 'plan-service', position: '대리', email: 'yjpark@company.com' },
        { id: 'member-plan-5', name: '최서영', department: 'planning', team: 'plan-service', position: '주임', email: 'sychoi@company.com' },
        { id: 'member-plan-6', name: '한민수', department: 'planning', team: 'plan-service', position: '사원', email: 'mshan@company.com' },
        // 기획팀 - 상품기획 (6명)
        { id: 'member-plan-7', name: '오세진', department: 'planning', team: 'plan-product', position: '차장', email: 'sjoh@company.com' },
        { id: 'member-plan-8', name: '정하은', department: 'planning', team: 'plan-product', position: '과장', email: 'hejung@company.com' },
        { id: 'member-plan-9', name: '강도현', department: 'planning', team: 'plan-product', position: '대리', email: 'dhkang@company.com' },
        { id: 'member-plan-10', name: '윤지아', department: 'planning', team: 'plan-product', position: '대리', email: 'jayoon@company.com' },
        { id: 'member-plan-11', name: '조현서', department: 'planning', team: 'plan-product', position: '주임', email: 'hsjo@company.com' },
        { id: 'member-plan-12', name: '임수아', department: 'planning', team: 'plan-product', position: '사원', email: 'salim@company.com' }
    ];

    // ===== 실제 템플릿 기반 신청서 데이터 (40개) =====
    const sampleRequests = [
        // DBA팀 요청 (sample_dba_001 ~ sample_dba_004 기반)
        { id: 'req-dba-1', title: '2024년 4분기 매출 데이터 추출', type: '데이터 추출', priority: 'high', department: 'dba', status: 'progress', deadline: '2025-12-15', description: '마케팅팀 분석용 4분기 매출 데이터', templateId: 'sample_dba_001', category: 'DBA' },
        { id: 'req-dba-2', title: '고객 이탈률 분석 데이터', type: '데이터 추출', priority: 'medium', department: 'dba', status: 'completed', deadline: '2025-12-01', description: '고객 이탈 패턴 분석을 위한 데이터', templateId: 'sample_dba_001', category: 'DBA' },
        { id: 'req-dba-3', title: '회원 테이블 마케팅 동의 컬럼 추가', type: '테이블 변경', priority: 'urgent', department: 'dba', status: 'progress', deadline: '2025-12-12', description: '개인정보 동의 관련 컬럼 추가', templateId: 'sample_dba_002', category: 'DBA' },
        { id: 'req-dba-4', title: '주문 테이블 인덱스 최적화', type: '쿼리 최적화', priority: 'high', department: 'dba', status: 'pending', deadline: '2025-12-22', description: '주문 조회 성능 개선', templateId: 'sample_dba_003', category: 'DBA' },
        { id: 'req-dba-5', title: '월간 정산 데이터 백업', type: '백업/복구', priority: 'urgent', department: 'dba', status: 'progress', deadline: '2025-12-10', description: '12월 정산 전 데이터 백업', templateId: 'sample_dba_004', category: 'DBA' },
        { id: 'req-dba-6', title: '상품 카테고리 테이블 재설계', type: '테이블 변경', priority: 'medium', department: 'dba', status: 'pending', deadline: '2025-12-28', description: '카테고리 구조 변경에 따른 테이블 수정', templateId: 'sample_dba_002', category: 'DBA' },
        
        // Frontend팀 요청 (sample_fe_001 ~ sample_fe_004 기반)
        { id: 'req-fe-1', title: '경영진 대시보드 신규 개발', type: '화면 개발', priority: 'high', department: 'frontend', status: 'progress', deadline: '2025-12-20', description: '실시간 KPI 대시보드 개발', templateId: 'sample_fe_001', category: 'Frontend' },
        { id: 'req-fe-2', title: '주문 목록 화면 검색 기능 개선', type: 'UI/UX 개선', priority: 'medium', department: 'frontend', status: 'progress', deadline: '2025-12-18', description: '필터링 및 검색 UX 개선', templateId: 'sample_fe_002', category: 'Frontend' },
        { id: 'req-fe-3', title: '모바일 앱 반응형 개선', type: '반응형 작업', priority: 'high', department: 'frontend', status: 'pending', deadline: '2025-12-30', description: '태블릿 및 모바일 최적화', templateId: 'sample_fe_003', category: 'Frontend' },
        { id: 'req-fe-4', title: '공통 버튼 컴포넌트 개발', type: '컴포넌트 개발', priority: 'low', department: 'frontend', status: 'completed', deadline: '2025-12-05', description: '디자인 시스템 버튼 컴포넌트', templateId: 'sample_fe_004', category: 'Frontend' },
        { id: 'req-fe-5', title: '회원가입 화면 리뉴얼', type: '화면 개발', priority: 'high', department: 'frontend', status: 'progress', deadline: '2025-12-16', description: '회원가입 UX 전면 개편', templateId: 'sample_fe_001', category: 'Frontend' },
        { id: 'req-fe-6', title: '관리자 페이지 다크모드', type: 'UI/UX 개선', priority: 'low', department: 'frontend', status: 'completed', deadline: '2025-12-03', description: '다크모드 테마 지원', templateId: 'sample_fe_002', category: 'Frontend' },
        { id: 'req-fe-7', title: '상품 상세 페이지 개선', type: '화면 개발', priority: 'medium', department: 'frontend', status: 'pending', deadline: '2025-12-25', description: '상품 정보 표시 개선', templateId: 'sample_fe_001', category: 'Frontend' },
        
        // Backend팀 요청 (sample_be_001 ~ sample_be_004 기반)
        { id: 'req-be-1', title: '회원 관리 REST API 개발', type: 'API 개발', priority: 'high', department: 'backend', status: 'progress', deadline: '2025-12-25', description: '회원 CRUD API 개발', templateId: 'sample_be_001', category: 'Backend' },
        { id: 'req-be-2', title: '결제 실패 오류 긴급 수정', type: '버그 수정', priority: 'urgent', department: 'backend', status: 'progress', deadline: '2025-12-10', description: '결제 모듈 오류 수정', templateId: 'sample_be_001', category: 'Backend' },
        { id: 'req-be-3', title: '정산 배치 프로그램 개발', type: '배치 작업', priority: 'high', department: 'backend', status: 'pending', deadline: '2025-12-28', description: '월간 정산 자동화 배치', templateId: 'sample_be_002', category: 'Backend' },
        { id: 'req-be-4', title: '주문 API 성능 개선', type: '성능 개선', priority: 'medium', department: 'backend', status: 'completed', deadline: '2025-12-08', description: '주문 조회 API 응답 속도 개선', templateId: 'sample_be_003', category: 'Backend' },
        { id: 'req-be-5', title: '푸시 알림 API 개발', type: 'API 개발', priority: 'high', department: 'backend', status: 'progress', deadline: '2025-12-16', description: '모바일 푸시 알림 서비스', templateId: 'sample_be_001', category: 'Backend' },
        { id: 'req-be-6', title: '외부 결제사 연동', type: '시스템 연동', priority: 'urgent', department: 'backend', status: 'progress', deadline: '2025-12-14', description: '신규 PG사 연동 개발', templateId: 'sample_be_004', category: 'Backend' },
        { id: 'req-be-7', title: '파일 업로드 API 개선', type: 'API 개발', priority: 'low', department: 'backend', status: 'pending', deadline: '2025-12-30', description: '대용량 파일 업로드 지원', templateId: 'sample_be_001', category: 'Backend' },
        
        // Infra팀 요청 (sample_infra_001 ~ sample_infra_004 기반)
        { id: 'req-infra-1', title: 'API 서버 증설', type: '서버 증설', priority: 'high', department: 'infra', status: 'completed', deadline: '2025-12-05', description: '트래픽 증가 대비 서버 증설', templateId: 'sample_infra_001', category: 'Infra' },
        { id: 'req-infra-2', title: '신규 서비스 도메인 등록', type: '도메인 등록', priority: 'medium', department: 'infra', status: 'progress', deadline: '2025-12-19', description: '신규 마이크로서비스 도메인', templateId: 'sample_infra_002', category: 'Infra' },
        { id: 'req-infra-3', title: 'APM 모니터링 설정', type: '모니터링 설정', priority: 'high', department: 'infra', status: 'progress', deadline: '2025-12-17', description: '애플리케이션 성능 모니터링', templateId: 'sample_infra_003', category: 'Infra' },
        { id: 'req-infra-4', title: '스테이징 환경 배포', type: '배포 요청', priority: 'medium', department: 'infra', status: 'pending', deadline: '2025-12-23', description: '신규 기능 스테이징 배포', templateId: 'sample_infra_004', category: 'Infra' },
        { id: 'req-infra-5', title: 'SSL 인증서 갱신', type: '인프라 요청', priority: 'urgent', department: 'infra', status: 'progress', deadline: '2025-12-11', description: '만료 예정 SSL 인증서', templateId: 'sample_infra_001', category: 'Infra' },
        { id: 'req-infra-6', title: 'CDN 설정 요청', type: '인프라 요청', priority: 'medium', department: 'infra', status: 'pending', deadline: '2025-12-26', description: '정적 리소스 CDN 적용', templateId: 'sample_infra_001', category: 'Infra' },
        
        // QA팀 요청 (sample_qa_001 ~ sample_qa_004 기반)
        { id: 'req-qa-1', title: '회원 서비스 통합 테스트', type: '테스트 요청', priority: 'high', department: 'qa', status: 'progress', deadline: '2025-12-17', description: '신규 회원 API 통합 테스트', templateId: 'sample_qa_001', category: 'QA' },
        { id: 'req-qa-2', title: '결제 모듈 버그 리포트', type: '버그 리포트', priority: 'urgent', department: 'qa', status: 'progress', deadline: '2025-12-12', description: '결제 프로세스 오류 발견', templateId: 'sample_qa_002', category: 'QA' },
        { id: 'req-qa-3', title: '메인 페이지 성능 테스트', type: '성능 테스트', priority: 'medium', department: 'qa', status: 'pending', deadline: '2025-12-23', description: '메인 페이지 로딩 성능 측정', templateId: 'sample_qa_003', category: 'QA' },
        { id: 'req-qa-4', title: '주문 프로세스 회귀 테스트', type: '회귀 테스트', priority: 'high', department: 'qa', status: 'progress', deadline: '2025-12-15', description: '주문 기능 전체 회귀 테스트', templateId: 'sample_qa_004', category: 'QA' },
        { id: 'req-qa-5', title: '결제 자동화 테스트 스크립트', type: '테스트 요청', priority: 'medium', department: 'qa', status: 'pending', deadline: '2025-12-27', description: '결제 프로세스 자동화 테스트', templateId: 'sample_qa_001', category: 'QA' },
        
        // 보안팀 요청 (sample_sec_001 ~ sample_sec_003 기반)
        { id: 'req-sec-1', title: '4분기 보안 취약점 점검', type: '보안 점검', priority: 'high', department: 'security', status: 'progress', deadline: '2025-12-18', description: '분기별 보안 취약점 점검', templateId: 'sample_sec_001', category: '보안' },
        { id: 'req-sec-2', title: '웹 애플리케이션 취약점 분석', type: '취약점 분석', priority: 'urgent', department: 'security', status: 'progress', deadline: '2025-12-13', description: 'OWASP Top 10 기준 분석', templateId: 'sample_sec_002', category: '보안' },
        { id: 'req-sec-3', title: 'DB 접근 권한 신청', type: '권한 신청', priority: 'medium', department: 'security', status: 'pending', deadline: '2025-12-26', description: '신규 개발자 DB 접근 권한', templateId: 'sample_sec_003', category: '보안' },
        { id: 'req-sec-4', title: '개인정보 접근 로그 감사', type: '보안 점검', priority: 'high', department: 'security', status: 'pending', deadline: '2025-12-20', description: '개인정보 접근 이력 감사', templateId: 'sample_sec_001', category: '보안' },
        { id: 'req-sec-5', title: 'API 보안 점검', type: '취약점 분석', priority: 'medium', department: 'security', status: 'completed', deadline: '2025-12-06', description: 'REST API 보안 취약점 분석', templateId: 'sample_sec_002', category: '보안' },
        
        // 공통/기획팀 요청 (sample_common_001 ~ sample_plan_003 기반)
        { id: 'req-common-1', title: '회의실 예약 - 12월 전략회의', type: '회의실 예약', priority: 'low', department: 'planning', status: 'completed', deadline: '2025-12-09', description: '대회의실 12/15 오후 2시', templateId: 'sample_common_002', category: '공통' },
        { id: 'req-common-2', title: '신규 프로젝트 기획서 검토', type: '기획서 검토', priority: 'high', department: 'planning', status: 'progress', deadline: '2025-12-14', description: '2025년 신규 서비스 기획서', templateId: 'sample_plan_001', category: '기획' },
        { id: 'req-common-3', title: '요구사항 분석 - 모바일 앱', type: '요구사항 분석', priority: 'medium', department: 'planning', status: 'pending', deadline: '2025-12-24', description: '모바일 앱 v2.0 요구사항', templateId: 'sample_plan_002', category: '기획' },
        { id: 'req-plan-1', title: '2025년 서비스 로드맵 수립', type: '기획서 검토', priority: 'high', department: 'planning', status: 'progress', deadline: '2025-12-20', description: '연간 서비스 개선 계획', templateId: 'sample_plan_001', category: '기획' },
        { id: 'req-plan-2', title: '신규 결제 수단 요구사항', type: '요구사항 분석', priority: 'urgent', department: 'planning', status: 'progress', deadline: '2025-12-13', description: '간편결제 도입 요구사항', templateId: 'sample_plan_002', category: '기획' },
        { id: 'req-plan-3', title: '프로젝트 일정 협의 - Q1', type: '일정 협의', priority: 'medium', department: 'planning', status: 'pending', deadline: '2025-12-27', description: '1분기 개발 일정 조율', templateId: 'sample_plan_003', category: '기획' }
    ];

    // 노드 위치 설정
    const cols = 6;
    const requestStartX = 80;
    const requestStartY = 60;
    const requestGapX = 220;
    const requestGapY = 160;
    
    const memberStartX = 60;
    const memberStartY = 850;
    const memberGapX = 160;
    const memberGapY = 130;

    // ===== 실제 localStorage 데이터가 있으면 사용, 없으면 샘플 데이터 사용 =====
    const requestsToUse = storedRequests.length > 0 ? storedRequests.map(r => {
        // localStorage 데이터를 그래프용 형식으로 변환
        const category = r.templateCategory || r.category || '기타';
        const departmentMap = {
            'DBA': 'dba', 'Frontend': 'frontend', 'Backend': 'backend',
            'Infra': 'infra', 'QA': 'qa', '보안': 'security', '기획': 'planning', '공통': 'planning'
        };
        
        // 상태 변환
        let status = 'pending';
        if (r.status === 'completed') status = 'completed';
        else if (r.status === 'in_progress') status = 'progress';
        else if (r.status === 'submitted') status = 'pending';
        else if (r.status === 'rejected') status = 'completed';
        
        return {
            id: r.id,
            title: r.title || '신청서',
            type: r.templateTitle || category + ' 요청',
            priority: r.priority || 'medium',
            department: departmentMap[category] || 'planning',
            status: status,
            deadline: r.submittedAt ? new Date(new Date(r.submittedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
            description: r.description || '',
            templateId: r.templateId || '',
            category: category,
            requester: r.requester,
            assignees: r.assignees || [],
            createdAt: r.createdAt,
            submittedAt: r.submittedAt
        };
    }) : sampleRequests;

    console.log('Using requests:', requestsToUse.length, storedRequests.length > 0 ? '(from localStorage)' : '(sample data)');

    // 그래프 DB에 신청서 노드 추가
    requestsToUse.forEach((req, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        // 이미 평가 데이터가 있으면 사용, 없으면 생성
        const evaluation = req.evaluation || {
            technical: Math.floor(Math.random() * 30) + 70,
            communication: Math.floor(Math.random() * 30) + 70,
            efficiency: Math.floor(Math.random() * 30) + 70,
            quality: Math.floor(Math.random() * 30) + 70
        };
        
        graphDB.addNode(req.id, 'request', {
            ...req,
            x: requestStartX + col * requestGapX,
            y: requestStartY + row * requestGapY,
            evaluation: evaluation
        });
    });

    // 그래프 DB에 담당자 노드 추가
    const memberCols = 8;
    sampleMembers.forEach((member, index) => {
        const col = index % memberCols;
        const row = Math.floor(index / memberCols);
        graphDB.addNode(member.id, 'member', {
            ...member,
            x: memberStartX + col * memberGapX,
            y: memberStartY + row * memberGapY,
            stats: {
                inProgress: 0,
                completed: 0
            }
        });
    });
    
    // ===== 실제 데이터의 담당자 연결 생성 =====
    if (storedRequests.length > 0) {
        console.log('Creating connections from actual assignees...');
        requestsToUse.forEach(req => {
            if (req.assignees && req.assignees.length > 0) {
                req.assignees.forEach(assignee => {
                    // 담당자 이름으로 매칭되는 멤버 찾기
                    const matchedMember = sampleMembers.find(m => 
                        m.name === assignee.name || 
                        m.email === assignee.email
                    );
                    
                    if (matchedMember) {
                        const edgeStatus = req.status === 'completed' ? 'completed' : 
                                          req.status === 'progress' ? 'progress' : 'pending';
                        graphDB.addEdge(req.id, matchedMember.id, { status: edgeStatus });
                        
                        // 담당자 통계 업데이트
                        const memberNode = graphDB.getNode(matchedMember.id);
                        if (memberNode) {
                            if (edgeStatus === 'progress') {
                                memberNode.data.stats.inProgress++;
                            } else if (edgeStatus === 'completed') {
                                memberNode.data.stats.completed++;
                            }
                        }
                    }
                });
            }
        });
    }

    // ===== 담당자-신청서 관계 (실제 데이터가 없을 때만 샘플 연결 사용) =====
    if (storedRequests.length > 0) {
        console.log('Skipping sample connections - using actual data');
        return; // 실제 데이터가 있으면 샘플 연결 건너뛰기
    }
    
    const sampleConnections = [
        // DBA팀 요청 연결
        { request: 'req-dba-1', member: 'member-dba-1', status: 'progress' },
        { request: 'req-dba-1', member: 'member-dba-3', status: 'progress' },
        { request: 'req-dba-2', member: 'member-dba-2', status: 'completed' },
        { request: 'req-dba-2', member: 'member-dba-5', status: 'completed' },
        { request: 'req-dba-3', member: 'member-dba-7', status: 'progress' },
        { request: 'req-dba-3', member: 'member-dba-9', status: 'progress' },
        { request: 'req-dba-4', member: 'member-dba-8', status: 'pending' },
        { request: 'req-dba-4', member: 'member-dba-10', status: 'pending' },
        { request: 'req-dba-5', member: 'member-dba-1', status: 'progress' },
        { request: 'req-dba-5', member: 'member-dba-4', status: 'progress' },
        { request: 'req-dba-6', member: 'member-dba-6', status: 'pending' },
        { request: 'req-dba-6', member: 'member-dba-11', status: 'pending' },
        
        // Frontend팀 요청 연결
        { request: 'req-fe-1', member: 'member-fe-1', status: 'progress' },
        { request: 'req-fe-1', member: 'member-fe-3', status: 'progress' },
        { request: 'req-fe-1', member: 'member-fe-5', status: 'progress' },
        { request: 'req-fe-2', member: 'member-fe-2', status: 'progress' },
        { request: 'req-fe-2', member: 'member-fe-4', status: 'progress' },
        { request: 'req-fe-3', member: 'member-fe-7', status: 'pending' },
        { request: 'req-fe-3', member: 'member-fe-9', status: 'pending' },
        { request: 'req-fe-4', member: 'member-fe-2', status: 'completed' },
        { request: 'req-fe-4', member: 'member-fe-6', status: 'completed' },
        { request: 'req-fe-5', member: 'member-fe-1', status: 'progress' },
        { request: 'req-fe-5', member: 'member-fe-8', status: 'progress' },
        { request: 'req-fe-6', member: 'member-fe-10', status: 'completed' },
        { request: 'req-fe-6', member: 'member-fe-12', status: 'completed' },
        { request: 'req-fe-7', member: 'member-fe-11', status: 'pending' },
        
        // Backend팀 요청 연결
        { request: 'req-be-1', member: 'member-be-1', status: 'progress' },
        { request: 'req-be-1', member: 'member-be-3', status: 'progress' },
        { request: 'req-be-1', member: 'member-be-5', status: 'progress' },
        { request: 'req-be-2', member: 'member-be-2', status: 'progress' },
        { request: 'req-be-2', member: 'member-be-4', status: 'progress' },
        { request: 'req-be-3', member: 'member-be-7', status: 'pending' },
        { request: 'req-be-3', member: 'member-be-9', status: 'pending' },
        { request: 'req-be-4', member: 'member-be-8', status: 'completed' },
        { request: 'req-be-4', member: 'member-be-10', status: 'completed' },
        { request: 'req-be-5', member: 'member-be-1', status: 'progress' },
        { request: 'req-be-5', member: 'member-be-6', status: 'progress' },
        { request: 'req-be-6', member: 'member-be-2', status: 'progress' },
        { request: 'req-be-6', member: 'member-be-11', status: 'progress' },
        { request: 'req-be-7', member: 'member-be-12', status: 'pending' },
        
        // Infra팀 요청 연결
        { request: 'req-infra-1', member: 'member-infra-1', status: 'completed' },
        { request: 'req-infra-1', member: 'member-infra-3', status: 'completed' },
        { request: 'req-infra-2', member: 'member-infra-2', status: 'progress' },
        { request: 'req-infra-2', member: 'member-infra-5', status: 'progress' },
        { request: 'req-infra-3', member: 'member-infra-7', status: 'progress' },
        { request: 'req-infra-3', member: 'member-infra-9', status: 'progress' },
        { request: 'req-infra-4', member: 'member-infra-4', status: 'pending' },
        { request: 'req-infra-4', member: 'member-infra-6', status: 'pending' },
        { request: 'req-infra-5', member: 'member-infra-8', status: 'progress' },
        { request: 'req-infra-5', member: 'member-infra-10', status: 'progress' },
        { request: 'req-infra-6', member: 'member-infra-11', status: 'pending' },
        { request: 'req-infra-6', member: 'member-infra-12', status: 'pending' },
        
        // QA팀 요청 연결
        { request: 'req-qa-1', member: 'member-qa-1', status: 'progress' },
        { request: 'req-qa-1', member: 'member-qa-3', status: 'progress' },
        { request: 'req-qa-1', member: 'member-qa-5', status: 'progress' },
        { request: 'req-qa-2', member: 'member-qa-7', status: 'progress' },
        { request: 'req-qa-2', member: 'member-qa-9', status: 'progress' },
        { request: 'req-qa-3', member: 'member-qa-2', status: 'pending' },
        { request: 'req-qa-3', member: 'member-qa-4', status: 'pending' },
        { request: 'req-qa-4', member: 'member-qa-8', status: 'progress' },
        { request: 'req-qa-4', member: 'member-qa-10', status: 'progress' },
        { request: 'req-qa-5', member: 'member-qa-6', status: 'pending' },
        { request: 'req-qa-5', member: 'member-qa-11', status: 'pending' },
        
        // 보안팀 요청 연결
        { request: 'req-sec-1', member: 'member-sec-1', status: 'progress' },
        { request: 'req-sec-1', member: 'member-sec-3', status: 'progress' },
        { request: 'req-sec-2', member: 'member-sec-2', status: 'progress' },
        { request: 'req-sec-2', member: 'member-sec-5', status: 'progress' },
        { request: 'req-sec-3', member: 'member-sec-7', status: 'pending' },
        { request: 'req-sec-3', member: 'member-sec-9', status: 'pending' },
        { request: 'req-sec-4', member: 'member-sec-4', status: 'pending' },
        { request: 'req-sec-4', member: 'member-sec-6', status: 'pending' },
        { request: 'req-sec-5', member: 'member-sec-8', status: 'completed' },
        { request: 'req-sec-5', member: 'member-sec-10', status: 'completed' },
        
        // 공통/기획 요청 연결 (다양한 부서 담당자)
        { request: 'req-common-1', member: 'member-plan-1', status: 'completed' },
        { request: 'req-common-1', member: 'member-plan-5', status: 'completed' },
        { request: 'req-common-2', member: 'member-plan-1', status: 'progress' },
        { request: 'req-common-2', member: 'member-plan-3', status: 'progress' },
        { request: 'req-common-3', member: 'member-plan-7', status: 'pending' },
        { request: 'req-common-3', member: 'member-plan-9', status: 'pending' },
        { request: 'req-plan-1', member: 'member-plan-1', status: 'progress' },
        { request: 'req-plan-1', member: 'member-plan-2', status: 'progress' },
        { request: 'req-plan-1', member: 'member-plan-7', status: 'progress' },
        { request: 'req-plan-2', member: 'member-plan-8', status: 'progress' },
        { request: 'req-plan-2', member: 'member-plan-10', status: 'progress' },
        { request: 'req-plan-3', member: 'member-plan-4', status: 'pending' },
        { request: 'req-plan-3', member: 'member-plan-11', status: 'pending' },
        
        // 크로스 팀 협업 (복잡한 관계)
        { request: 'req-be-2', member: 'member-qa-7', status: 'progress' },  // QA가 백엔드 버그 수정 검증
        { request: 'req-fe-5', member: 'member-qa-1', status: 'progress' },  // QA가 프론트엔드 테스트
        { request: 'req-infra-5', member: 'member-sec-1', status: 'progress' }, // 보안팀 SSL 검토
        { request: 'req-be-6', member: 'member-sec-2', status: 'progress' },  // 보안팀 결제 연동 검토
        { request: 'req-plan-2', member: 'member-be-1', status: 'progress' },  // 백엔드 팀장 기획 검토
        { request: 'req-plan-2', member: 'member-fe-1', status: 'progress' },  // 프론트엔드 팀장 기획 검토
        { request: 'req-common-2', member: 'member-fe-1', status: 'progress' }, // 프론트엔드 팀장 기획서 검토
        { request: 'req-common-2', member: 'member-be-1', status: 'progress' }  // 백엔드 팀장 기획서 검토
    ];

    sampleConnections.forEach(conn => {
        graphDB.addEdge(conn.request, conn.member, { status: conn.status });
        
        // 담당자 통계 업데이트
        const member = graphDB.getNode(conn.member);
        if (member) {
            if (conn.status === 'progress') {
                member.data.stats.inProgress++;
            } else if (conn.status === 'completed') {
                member.data.stats.completed++;
            }
        }
    });
}

// ===== Initialization =====
function init() {
    console.log('Initializing Request Graph...');
    
    try {
        initTheme();
        
        // 항상 localStorage의 실제 신청서 데이터 기반으로 새로 생성
        console.log('Refreshing graph data from localStorage...');
        localStorage.removeItem('requestGraphData'); // 기존 그래프 데이터 삭제
        graphDB.nodes = new Map();
        graphDB.edges = new Map();
        graphDB.adjacencyList = new Map();
        initializeSampleData();
        saveToStorage();
        console.log('Graph data initialized. Node count:', graphDB.getAllNodes().length);
        
        renderDepartmentList();
        populateFilters();
        renderGraph();
        setupEventListeners();
        
        // localStorage 변경 감지 (다른 페이지에서 신청서 제출 시)
        window.addEventListener('storage', (e) => {
            if (e.key === 'taskflowRequests') {
                console.log('taskflowRequests changed, refreshing graph...');
                refreshGraphData();
            }
        });
        
        // focus 시 데이터 새로고침
        window.addEventListener('focus', () => {
            console.log('Window focused, checking for data updates...');
            refreshGraphData();
        });
        
        console.log('Request Graph initialized successfully!');
    } catch (error) {
        console.error('Initialization error:', error);
        // 에러 발생 시 데이터 초기화 후 재시도
        localStorage.removeItem('requestGraphData');
        graphDB.nodes = new Map();
        graphDB.edges = new Map();
        graphDB.adjacencyList = new Map();
        initializeSampleData();
        saveToStorage();
        renderDepartmentList();
        populateFilters();
        renderGraph();
        setupEventListeners();
    }
}

function loadFromStorage() {
    const saved = localStorage.getItem('requestGraphData');
    if (saved) {
        try {
            graphDB.fromJSON(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load graph data:', e);
        }
    }
}

function saveToStorage() {
    localStorage.setItem('requestGraphData', JSON.stringify(graphDB.toJSON()));
}

// ===== Theme Management =====
function initTheme() {
    const savedTheme = localStorage.getItem('graphTheme') || 'dark';
    setTheme(savedTheme, false);
}

function setTheme(theme, save = true) {
    document.body.setAttribute('data-theme', theme);
    if (save) {
        localStorage.setItem('graphTheme', theme);
    }
    
    // 테마 옵션 활성화 상태 업데이트
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === theme);
    });
    
    closeThemeDropdown();
}

function toggleThemeDropdown() {
    const dropdown = document.getElementById('themeDropdown');
    dropdown.classList.toggle('show');
}

function closeThemeDropdown() {
    const dropdown = document.getElementById('themeDropdown');
    dropdown.classList.remove('show');
}

// ===== Department Panel =====
function renderDepartmentList() {
    const container = document.getElementById('departmentList');
    const members = graphDB.getNodesByType('member');
    
    container.innerHTML = departments.map(dept => {
        const deptMembers = members.filter(m => m.data.department === dept.id);
        
        return `
            <div class="department-item">
                <div class="department-header" onclick="toggleDepartment('${dept.id}')">
                    <div class="department-info">
                        <div class="department-icon ${dept.id}">${dept.icon}</div>
                        <span class="department-name">${dept.name}</span>
                    </div>
                    <span class="department-count">${deptMembers.length}명</span>
                    <div class="department-toggle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </div>
                </div>
                <div class="team-list" id="team-${dept.id}">
                    ${dept.teams.map(team => {
                        const teamMembers = deptMembers.filter(m => m.data.team === team.id);
                        return `
                            <div class="team-item" onclick="filterByTeam('${team.id}')">
                                <div class="team-name">${team.name}</div>
                                <div class="team-members">
                                    ${teamMembers.map(m => {
                                        const connections = graphDB.getConnectedNodes(m.id);
                                        const inProgress = connections.filter(c => {
                                            const edge = graphDB.getEdge(m.id, c.id);
                                            return edge && edge.data.status === 'progress';
                                        }).length;
                                        const status = inProgress > 0 ? 'progress' : 'completed';
                                        return `
                                            <div class="member-chip" onclick="event.stopPropagation(); focusNode('${m.id}')">
                                                <span class="status-dot ${status}"></span>
                                                ${m.data.name}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function toggleDepartment(deptId) {
    const header = event.currentTarget;
    const teamList = document.getElementById(`team-${deptId}`);
    
    header.classList.toggle('expanded');
    teamList.classList.toggle('show');
}

function toggleAllDepartments() {
    const allExpanded = document.querySelectorAll('.department-header.expanded').length === departments.length;
    
    departments.forEach(dept => {
        const header = document.querySelector(`.department-item:has(#team-${dept.id}) .department-header`);
        const teamList = document.getElementById(`team-${dept.id}`);
        
        if (allExpanded) {
            header.classList.remove('expanded');
            teamList.classList.remove('show');
        } else {
            header.classList.add('expanded');
            teamList.classList.add('show');
        }
    });
}

// ===== Graph Rendering =====
function renderGraph() {
    renderNodes();
    renderConnections();
}

function renderNodes() {
    const container = document.getElementById('nodesLayer');
    const nodes = graphDB.getAllNodes();
    
    // 필터링
    const statusFilter = document.getElementById('statusFilter').value;
    const departmentFilter = document.getElementById('departmentFilter').value;
    
    let filteredNodes = nodes;
    
    if (statusFilter !== 'all') {
        filteredNodes = filteredNodes.filter(node => {
            if (node.type === 'request') {
                return node.data.status === statusFilter;
            }
            // 담당자는 연결된 신청서 상태로 필터링
            const connections = graphDB.getConnectedNodes(node.id);
            return connections.some(conn => {
                const edge = graphDB.getEdge(node.id, conn.id);
                return edge && edge.data.status === statusFilter;
            });
        });
    }
    
    if (departmentFilter !== 'all') {
        filteredNodes = filteredNodes.filter(node => node.data.department === departmentFilter);
    }
    
    container.innerHTML = filteredNodes.map(node => {
        if (node.type === 'request') {
            return renderRequestNode(node);
        } else {
            return renderMemberNode(node);
        }
    }).join('');
    
    // 노드 이벤트 바인딩
    container.querySelectorAll('.graph-node').forEach(nodeEl => {
        setupNodeEvents(nodeEl);
    });
}

function renderRequestNode(node) {
    const { id, data } = node;
    const typeClass = getTypeClass(data.type);
    
    return `
        <div class="graph-node request-node" 
             data-node-id="${id}" 
             style="left: ${data.x}px; top: ${data.y}px;">
            <div class="request-node-header">
                <span class="request-type-badge ${typeClass}">${data.type}</span>
                <span class="request-priority ${data.priority}"></span>
            </div>
            <div class="request-title">${data.title}</div>
            <div class="request-meta">
                <span class="request-department">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    ${getDepartmentName(data.department)}
                </span>
                <span class="request-status ${data.status}">${getStatusName(data.status)}</span>
            </div>
            <div class="request-connector left" data-connector="left"></div>
            <div class="request-connector right" data-connector="right"></div>
        </div>
    `;
}

function renderMemberNode(node) {
    const { id, data } = node;
    const initial = data.name.charAt(0);
    const connections = graphDB.getConnectedNodes(id);
    const inProgress = connections.filter(c => {
        const edge = graphDB.getEdge(id, c.id);
        return edge && edge.data.status === 'progress';
    }).length;
    const completed = connections.filter(c => {
        const edge = graphDB.getEdge(id, c.id);
        return edge && edge.data.status === 'completed';
    }).length;
    
    return `
        <div class="graph-node member-node" 
             data-node-id="${id}" 
             style="left: ${data.x}px; top: ${data.y}px;">
            <div class="member-avatar ${data.department}">${initial}</div>
            <div class="member-name">${data.name}</div>
            <div class="member-position">${data.position} · ${getDepartmentName(data.department)}</div>
            <div class="member-stats">
                <div class="member-stat">
                    <span class="member-stat-value">${inProgress}</span>
                    <span class="member-stat-label">진행</span>
                </div>
                <div class="member-stat">
                    <span class="member-stat-value">${completed}</span>
                    <span class="member-stat-label">완료</span>
                </div>
            </div>
            <div class="member-connector top" data-connector="top"></div>
        </div>
    `;
}

function renderConnections() {
    const svg = document.getElementById('connectionsLayer');
    const edges = graphDB.getAllEdges();
    
    // 필터링된 노드 ID 가져오기
    const visibleNodes = new Set(
        Array.from(document.querySelectorAll('.graph-node')).map(el => el.dataset.nodeId)
    );
    
    svg.innerHTML = edges.filter(edge => 
        visibleNodes.has(edge.source) && visibleNodes.has(edge.target)
    ).map(edge => {
        const sourceNode = document.querySelector(`[data-node-id="${edge.source}"]`);
        const targetNode = document.querySelector(`[data-node-id="${edge.target}"]`);
        
        if (!sourceNode || !targetNode) return '';
        
        const sourceRect = sourceNode.getBoundingClientRect();
        const targetRect = targetNode.getBoundingClientRect();
        const containerRect = svg.getBoundingClientRect();
        
        // 연결점 계산
        const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.bottom - containerRect.top;
        const targetX = targetRect.left - containerRect.left + targetRect.width / 2;
        const targetY = targetRect.top - containerRect.top;
        
        // 곡선 경로 생성
        const midY = (sourceY + targetY) / 2;
        const path = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
        
        return `
            <path class="connection-line ${edge.data.status}" 
                  d="${path}" 
                  data-edge-id="${edge.id}"/>
        `;
    }).join('');
}

// ===== Node Events =====
function setupNodeEvents(nodeEl) {
    const nodeId = nodeEl.dataset.nodeId;
    
    // 클릭 이벤트
    nodeEl.addEventListener('click', (e) => {
        if (!isDragging && !isConnecting) {
            selectNode(nodeId);
        }
    });
    
    // 드래그 이벤트
    nodeEl.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('request-connector') || 
            e.target.classList.contains('member-connector')) {
            startConnection(nodeId, e);
        } else {
            startDrag(nodeEl, e);
        }
    });
}

function startDrag(nodeEl, e) {
    isDragging = true;
    nodeEl.classList.add('dragging');
    
    const nodeId = nodeEl.dataset.nodeId;
    const node = graphDB.getNode(nodeId);
    
    dragStart = { x: e.clientX, y: e.clientY };
    nodeStart = { x: node.data.x, y: node.data.y };
    
    const onMouseMove = (e) => {
        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;
        
        const newX = nodeStart.x + dx;
        const newY = nodeStart.y + dy;
        
        nodeEl.style.left = `${newX}px`;
        nodeEl.style.top = `${newY}px`;
        
        graphDB.updateNode(nodeId, { x: newX, y: newY });
        renderConnections();
    };
    
    const onMouseUp = () => {
        isDragging = false;
        nodeEl.classList.remove('dragging');
        saveToStorage();
        
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// ===== Connection Drawing =====
function startConnection(nodeId, e) {
    isConnecting = true;
    connectionSource = nodeId;
    
    const svg = document.getElementById('connectionsLayer');
    const containerRect = svg.getBoundingClientRect();
    
    const startX = e.clientX - containerRect.left;
    const startY = e.clientY - containerRect.top;
    
    // 미리보기 선 생성
    const previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    previewLine.classList.add('connection-preview');
    previewLine.id = 'connectionPreview';
    svg.appendChild(previewLine);
    
    const onMouseMove = (e) => {
        const endX = e.clientX - containerRect.left;
        const endY = e.clientY - containerRect.top;
        const midY = (startY + endY) / 2;
        
        previewLine.setAttribute('d', 
            `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
        );
    };
    
    const onMouseUp = (e) => {
        isConnecting = false;
        previewLine.remove();
        
        // 대상 노드 찾기
        const targetEl = document.elementFromPoint(e.clientX, e.clientY);
        const targetNode = targetEl?.closest('.graph-node');
        
        if (targetNode && targetNode.dataset.nodeId !== connectionSource) {
            const targetId = targetNode.dataset.nodeId;
            const sourceNode = graphDB.getNode(connectionSource);
            const targetNodeData = graphDB.getNode(targetId);
            
            // 신청서-담당자 연결만 허용
            if ((sourceNode.type === 'request' && targetNodeData.type === 'member') ||
                (sourceNode.type === 'member' && targetNodeData.type === 'request')) {
                
                const existingEdge = graphDB.getEdge(connectionSource, targetId);
                if (!existingEdge) {
                    graphDB.addEdge(connectionSource, targetId, { status: 'progress' });
                    saveToStorage();
                    renderGraph();
                    renderDepartmentList();
                    showToast('연결이 생성되었습니다', 'success');
                } else {
                    showToast('이미 연결되어 있습니다', 'warning');
                }
            } else {
                showToast('신청서와 담당자만 연결할 수 있습니다', 'error');
            }
        }
        
        connectionSource = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// ===== Node Selection =====
function selectNode(nodeId) {
    // 이전 선택 해제
    document.querySelectorAll('.graph-node.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 새 노드 선택
    const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (nodeEl) {
        nodeEl.classList.add('selected');
    }
    
    selectedNode = graphDB.getNode(nodeId);
    renderDetailPanel();
}

function focusNode(nodeId) {
    const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (nodeEl) {
        const node = graphDB.getNode(nodeId);
        const canvas = document.getElementById('graphCanvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        // 노드를 캔버스 중앙으로 이동
        const targetX = canvasRect.width / 2 - 70;
        const targetY = canvasRect.height / 2 - 50;
        
        panOffset.x = targetX - node.data.x * zoom;
        panOffset.y = targetY - node.data.y * zoom;
        
        updateCanvasTransform();
        selectNode(nodeId);
    }
}

// ===== Detail Panel =====
function renderDetailPanel() {
    const content = document.getElementById('detailContent');
    
    if (!selectedNode) {
        content.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p>노드를 선택하면<br>상세 정보가 표시됩니다</p>
            </div>
        `;
        return;
    }
    
    if (selectedNode.type === 'request') {
        renderRequestDetail();
    } else {
        renderMemberDetail();
    }
}

function renderRequestDetail() {
    const content = document.getElementById('detailContent');
    const { data } = selectedNode;
    const connectedMembers = graphDB.getConnectedNodes(selectedNode.id)
        .filter(n => n.type === 'member');
    
    const avgScore = data.evaluation ? 
        Math.round((data.evaluation.technical + data.evaluation.communication + 
                   data.evaluation.efficiency + data.evaluation.quality) / 4) : 0;
    
    content.innerHTML = `
        <div class="detail-header">
            <div class="detail-avatar request">📋</div>
            <div class="detail-info">
                <h4>${data.title}</h4>
                <p>${data.type} · ${getDepartmentName(data.department)}</p>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">기본 정보</div>
            <div class="detail-item">
                <span class="detail-item-label">상태</span>
                <span class="detail-item-value">
                    <span class="request-status ${data.status}">${getStatusName(data.status)}</span>
                </span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">우선순위</span>
                <span class="detail-item-value">${getPriorityName(data.priority)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">마감일</span>
                <span class="detail-item-value">${data.deadline || '-'}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">담당자 (${connectedMembers.length}명)</div>
            <div class="assigned-members">
                ${connectedMembers.length > 0 ? connectedMembers.map(member => {
                    const edge = graphDB.getEdge(selectedNode.id, member.id);
                    return `
                        <div class="assigned-member" onclick="focusNode('${member.id}')">
                            <div class="assigned-member-avatar ${member.data.department}">
                                ${member.data.name.charAt(0)}
                            </div>
                            <div class="assigned-member-info">
                                <div class="assigned-member-name">${member.data.name}</div>
                                <div class="assigned-member-role">${member.data.position} · ${getDepartmentName(member.data.department)}</div>
                            </div>
                            <span class="assigned-member-status ${edge?.data.status}">${getStatusName(edge?.data.status)}</span>
                        </div>
                    `;
                }).join('') : '<p style="color: var(--text-muted); font-size: 0.85rem;">담당자가 배정되지 않았습니다</p>'}
            </div>
        </div>
        
        ${data.evaluation ? `
        <div class="detail-section">
            <div class="detail-section-title">평가 현황</div>
            <div class="evaluation-summary">
                <div class="eval-score-display">
                    <div class="eval-score-circle" style="--score: ${avgScore}">
                        <span class="eval-score-value">${avgScore}</span>
                    </div>
                </div>
                <div class="eval-metrics">
                    <div class="eval-metric">
                        <span class="eval-metric-label">기술력</span>
                        <span class="eval-metric-value">${data.evaluation.technical}</span>
                    </div>
                    <div class="eval-metric">
                        <span class="eval-metric-label">소통</span>
                        <span class="eval-metric-value">${data.evaluation.communication}</span>
                    </div>
                    <div class="eval-metric">
                        <span class="eval-metric-label">효율성</span>
                        <span class="eval-metric-value">${data.evaluation.efficiency}</span>
                    </div>
                    <div class="eval-metric">
                        <span class="eval-metric-label">품질</span>
                        <span class="eval-metric-value">${data.evaluation.quality}</span>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="detail-actions">
            <button class="btn-primary" onclick="openEvaluationModal()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                평가하기
            </button>
            <button class="btn-secondary" onclick="openAssignMemberModal()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                담당자 배정
            </button>
            <button class="btn-secondary" onclick="changeRequestStatus()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6"/>
                    <path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                상태 변경
            </button>
            <button class="btn-danger" onclick="deleteSelectedNode()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                삭제
            </button>
        </div>
    `;
}

// 담당자 배정 모달 열기
function openAssignMemberModal() {
    if (!selectedNode || selectedNode.type !== 'request') {
        showToast('신청서를 먼저 선택해주세요.', 'warning');
        return;
    }
    
    const members = graphDB.getNodesByType('member').filter(m => {
        const connectedRequests = graphDB.getConnectedNodes(m.id);
        return !connectedRequests.some(r => r.id === selectedNode.id);
    });
    
    if (members.length === 0) {
        showToast('배정 가능한 담당자가 없습니다.', 'warning');
        return;
    }
    
    showToast(`배정 가능한 담당자: ${members.length}명`, 'info');
}

function renderMemberDetail() {
    const content = document.getElementById('detailContent');
    const { data } = selectedNode;
    const connectedRequests = graphDB.getConnectedNodes(selectedNode.id)
        .filter(n => n.type === 'request');
    
    const inProgress = connectedRequests.filter(r => {
        const edge = graphDB.getEdge(selectedNode.id, r.id);
        return edge && edge.data.status === 'progress';
    });
    const completed = connectedRequests.filter(r => {
        const edge = graphDB.getEdge(selectedNode.id, r.id);
        return edge && edge.data.status === 'completed';
    });
    
    content.innerHTML = `
        <div class="detail-header">
            <div class="detail-avatar ${data.department}" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));">
                ${data.name.charAt(0)}
            </div>
            <div class="detail-info">
                <h4>${data.name}</h4>
                <p>${data.position} · ${getDepartmentName(data.department)}</p>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">기본 정보</div>
            <div class="detail-item">
                <span class="detail-item-label">부서</span>
                <span class="detail-item-value">${getDepartmentName(data.department)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">팀</span>
                <span class="detail-item-value">${getTeamName(data.team)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">이메일</span>
                <span class="detail-item-value">${data.email || '-'}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">업무 현황</div>
            <div class="evaluation-summary">
                <div class="eval-metrics">
                    <div class="eval-metric">
                        <span class="eval-metric-label">진행중</span>
                        <span class="eval-metric-value" style="color: #3b82f6;">${inProgress.length}</span>
                    </div>
                    <div class="eval-metric">
                        <span class="eval-metric-label">완료</span>
                        <span class="eval-metric-value" style="color: #22c55e;">${completed.length}</span>
                    </div>
                    <div class="eval-metric">
                        <span class="eval-metric-label">전체</span>
                        <span class="eval-metric-value">${connectedRequests.length}</span>
                    </div>
                    <div class="eval-metric">
                        <span class="eval-metric-label">완료율</span>
                        <span class="eval-metric-value">${connectedRequests.length > 0 ? Math.round(completed.length / connectedRequests.length * 100) : 0}%</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">담당 신청서</div>
            <div class="assigned-members">
                ${connectedRequests.length > 0 ? connectedRequests.map(req => {
                    const edge = graphDB.getEdge(selectedNode.id, req.id);
                    return `
                        <div class="assigned-member" onclick="focusNode('${req.id}')">
                            <div class="assigned-member-avatar" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));">
                                📋
                            </div>
                            <div class="assigned-member-info">
                                <div class="assigned-member-name">${req.data.title}</div>
                                <div class="assigned-member-role">${req.data.type}</div>
                            </div>
                            <span class="assigned-member-status ${edge?.data.status}">${getStatusName(edge?.data.status)}</span>
                        </div>
                    `;
                }).join('') : '<p style="color: var(--text-muted); font-size: 0.85rem;">담당 신청서가 없습니다</p>'}
            </div>
        </div>
        
        <div class="detail-actions">
            <button class="btn-primary" onclick="openAssignRequestModal('${selectedNode.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                신청서 배정
            </button>
            <button class="btn-secondary" onclick="viewMemberStats('${selectedNode.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                통계 보기
            </button>
            <button class="btn-danger" onclick="deleteSelectedNode()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                삭제
            </button>
        </div>
    `;
}

// 신청서 배정 모달 열기
function openAssignRequestModal(memberId) {
    const requests = graphDB.getNodesByType('request').filter(r => {
        const connectedMembers = graphDB.getConnectedNodes(r.id);
        return !connectedMembers.some(m => m.id === memberId);
    });
    
    if (requests.length === 0) {
        showToast('배정 가능한 신청서가 없습니다.', 'warning');
        return;
    }
    
    // 간단한 confirm으로 처리 (실제로는 모달 UI 사용)
    const requestList = requests.slice(0, 5).map(r => `- ${r.data.title}`).join('\n');
    showToast(`배정 가능한 신청서: ${requests.length}건`, 'info');
}

// 담당자 통계 보기
function viewMemberStats(memberId) {
    const member = graphDB.getNode(memberId);
    if (!member) return;
    
    const connectedRequests = graphDB.getConnectedNodes(memberId).filter(n => n.type === 'request');
    const completed = connectedRequests.filter(r => {
        const edge = graphDB.getEdge(memberId, r.id);
        return edge && edge.data.status === 'completed';
    });
    
    showToast(`${member.data.name}: 총 ${connectedRequests.length}건 중 ${completed.length}건 완료`, 'info');
}

function closeDetailPanel() {
    selectedNode = null;
    document.querySelectorAll('.graph-node.selected').forEach(el => {
        el.classList.remove('selected');
    });
    renderDetailPanel();
}

// ===== Zoom & Pan =====
function zoomIn() {
    zoom = Math.min(zoom + 0.1, 2);
    updateZoomLevel();
    updateCanvasTransform();
}

function zoomOut() {
    zoom = Math.max(zoom - 0.1, 0.5);
    updateZoomLevel();
    updateCanvasTransform();
}

function updateZoomLevel() {
    document.getElementById('zoomLevel').textContent = `${Math.round(zoom * 100)}%`;
}

function updateCanvasTransform() {
    const nodesLayer = document.getElementById('nodesLayer');
    nodesLayer.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`;
    renderConnections();
}

function resetView() {
    zoom = 1;
    panOffset = { x: 0, y: 0 };
    updateZoomLevel();
    updateCanvasTransform();
}

// 그래프 데이터 새로고침 (localStorage 변경 시)
function refreshGraphData() {
    const storedRequests = JSON.parse(localStorage.getItem('taskflowRequests') || '[]');
    const currentRequestNodes = graphDB.getNodesByType('request');
    
    // 신청서 수가 변경되었으면 새로고침
    if (storedRequests.length !== currentRequestNodes.length) {
        console.log('Request count changed, refreshing...');
        
        // 기존 데이터 초기화
        graphDB.nodes = new Map();
        graphDB.edges = new Map();
        graphDB.adjacencyList = new Map();
        
        // 새 데이터로 초기화
        initializeSampleData();
        saveToStorage();
        
        // 화면 갱신
        renderDepartmentList();
        populateFilters();
        renderGraph();
        
        showToast('신청서 데이터가 업데이트되었습니다.', 'info');
    }
}

function resetSampleData() {
    if (confirm('모든 데이터를 초기화하고 샘플 데이터로 다시 시작하시겠습니까?')) {
        console.log('Resetting sample data...');
        
        try {
            // 기존 데이터 초기화
            graphDB.nodes = new Map();
            graphDB.edges = new Map();
            graphDB.adjacencyList = new Map();
            
            // 로컬 스토리지 삭제
            localStorage.removeItem('requestGraphData');
            
            // 샘플 데이터 재생성
            initializeSampleData();
            saveToStorage();
            
            console.log('Sample data reset complete. Node count:', graphDB.getAllNodes().length);
            
            // 화면 갱신
            renderDepartmentList();
            renderGraph();
            renderDetailPanel();
            
            // 뷰 초기화
            resetView();
            
            // 레이아웃 탭 초기화
            document.querySelectorAll('.layout-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.layout === 'none');
            });
            currentLayout = 'none';
            
            showToast('샘플 데이터가 초기화되었습니다', 'success');
        } catch (error) {
            console.error('Reset sample data error:', error);
            showToast('데이터 초기화 중 오류가 발생했습니다', 'error');
        }
    }
}

// ===== Layout Algorithms =====
let isAnimating = false;

let currentLayout = 'none';

function selectLayout(layoutType) {
    // 탭 활성화 상태 업데이트
    document.querySelectorAll('.layout-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.layout === layoutType);
    });
    
    currentLayout = layoutType;
    
    if (layoutType === 'none') {
        showToast('자유 배치 모드입니다', 'info');
        return;
    }
    
    applyLayout(layoutType);
}

function applyLayout(layoutType) {
    if (isAnimating) return;
    
    const canvas = document.getElementById('graphCanvas');
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const requests = graphDB.getNodesByType('request');
    const members = graphDB.getNodesByType('member');
    
    let newPositions = {};
    
    switch (layoutType) {
        case 'hierarchical':
            newPositions = calculateHierarchicalLayout(requests, members, centerX, centerY);
            break;
        case 'circular':
            newPositions = calculateCircularLayout(requests, members, centerX, centerY);
            break;
        case 'grid':
            newPositions = calculateGridLayout(requests, members, centerX, centerY);
            break;
        case 'force':
            newPositions = calculateForceDirectedLayout(requests, members, centerX, centerY);
            break;
        case 'department':
            newPositions = calculateDepartmentLayout(requests, members, centerX, centerY);
            break;
        case 'status':
            newPositions = calculateStatusLayout(requests, members, centerX, centerY);
            break;
    }
    
    animateToPositions(newPositions);
    closeModal('layoutModal');
}

// 계층형 레이아웃 - 신청서를 위에, 담당자를 아래에 배치
function calculateHierarchicalLayout(requests, members, centerX, centerY) {
    const positions = {};
    const requestWidth = 220;
    const memberWidth = 160;
    const rowGap = 200;
    
    // 신청서 배치 (상단)
    const reqTotalWidth = requests.length * requestWidth;
    const reqStartX = centerX - reqTotalWidth / 2;
    
    requests.forEach((req, index) => {
        positions[req.id] = {
            x: reqStartX + index * requestWidth + requestWidth / 2 - 100,
            y: 50
        };
    });
    
    // 담당자 배치 (하단)
    const memTotalWidth = members.length * memberWidth;
    const memStartX = centerX - memTotalWidth / 2;
    
    members.forEach((member, index) => {
        positions[member.id] = {
            x: memStartX + index * memberWidth + memberWidth / 2 - 70,
            y: 50 + rowGap
        };
    });
    
    return positions;
}

// 원형 레이아웃 - 신청서를 외부 원에, 담당자를 내부 원에 배치
function calculateCircularLayout(requests, members, centerX, centerY) {
    const positions = {};
    const outerRadius = Math.min(centerX, centerY) - 150;
    const innerRadius = outerRadius * 0.5;
    
    // 신청서 배치 (외부 원)
    requests.forEach((req, index) => {
        const angle = (2 * Math.PI * index) / requests.length - Math.PI / 2;
        positions[req.id] = {
            x: centerX + outerRadius * Math.cos(angle) - 100,
            y: centerY + outerRadius * Math.sin(angle) - 60
        };
    });
    
    // 담당자 배치 (내부 원)
    members.forEach((member, index) => {
        const angle = (2 * Math.PI * index) / members.length - Math.PI / 2;
        positions[member.id] = {
            x: centerX + innerRadius * Math.cos(angle) - 70,
            y: centerY + innerRadius * Math.sin(angle) - 60
        };
    });
    
    return positions;
}

// 그리드 레이아웃 - 격자 형태로 배치
function calculateGridLayout(requests, members, centerX, centerY) {
    const positions = {};
    const allNodes = [...requests, ...members];
    const cols = Math.ceil(Math.sqrt(allNodes.length));
    const cellWidth = 250;
    const cellHeight = 180;
    
    const totalWidth = cols * cellWidth;
    const startX = centerX - totalWidth / 2;
    const rows = Math.ceil(allNodes.length / cols);
    const totalHeight = rows * cellHeight;
    const startY = centerY - totalHeight / 2;
    
    allNodes.forEach((node, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const offsetX = node.type === 'request' ? -100 : -70;
        
        positions[node.id] = {
            x: startX + col * cellWidth + cellWidth / 2 + offsetX,
            y: startY + row * cellHeight + cellHeight / 2 - 60
        };
    });
    
    return positions;
}

// Force-Directed 레이아웃 - 연결된 노드끼리 가깝게 배치
function calculateForceDirectedLayout(requests, members, centerX, centerY) {
    const positions = {};
    const allNodes = [...requests, ...members];
    
    // 초기 위치 설정 (원형)
    allNodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / allNodes.length;
        const radius = 300;
        positions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
    
    // Force-directed 시뮬레이션 (간소화된 버전)
    const iterations = 100;
    const repulsion = 50000;
    const attraction = 0.01;
    const damping = 0.9;
    
    const velocities = {};
    allNodes.forEach(node => {
        velocities[node.id] = { x: 0, y: 0 };
    });
    
    for (let i = 0; i < iterations; i++) {
        // 반발력 계산
        allNodes.forEach(nodeA => {
            allNodes.forEach(nodeB => {
                if (nodeA.id === nodeB.id) return;
                
                const dx = positions[nodeA.id].x - positions[nodeB.id].x;
                const dy = positions[nodeA.id].y - positions[nodeB.id].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                
                const force = repulsion / (dist * dist);
                velocities[nodeA.id].x += (dx / dist) * force;
                velocities[nodeA.id].y += (dy / dist) * force;
            });
        });
        
        // 인력 계산 (연결된 노드)
        graphDB.getAllEdges().forEach(edge => {
            const posA = positions[edge.source];
            const posB = positions[edge.target];
            if (!posA || !posB) return;
            
            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const force = dist * attraction;
            velocities[edge.source].x += (dx / dist) * force;
            velocities[edge.source].y += (dy / dist) * force;
            velocities[edge.target].x -= (dx / dist) * force;
            velocities[edge.target].y -= (dy / dist) * force;
        });
        
        // 중심으로 끌어당기는 힘
        allNodes.forEach(node => {
            const dx = centerX - positions[node.id].x;
            const dy = centerY - positions[node.id].y;
            velocities[node.id].x += dx * 0.001;
            velocities[node.id].y += dy * 0.001;
        });
        
        // 위치 업데이트
        allNodes.forEach(node => {
            velocities[node.id].x *= damping;
            velocities[node.id].y *= damping;
            positions[node.id].x += velocities[node.id].x;
            positions[node.id].y += velocities[node.id].y;
        });
    }
    
    // 노드 크기 보정
    allNodes.forEach(node => {
        const offsetX = node.type === 'request' ? -100 : -70;
        positions[node.id].x += offsetX;
        positions[node.id].y -= 60;
    });
    
    return positions;
}

// 부서별 레이아웃 - 부서별로 그룹화하여 배치
function calculateDepartmentLayout(requests, members, centerX, centerY) {
    const positions = {};
    
    // 부서별로 그룹화
    const deptGroups = {};
    departments.forEach(dept => {
        deptGroups[dept.id] = {
            requests: requests.filter(r => r.data.department === dept.id),
            members: members.filter(m => m.data.department === dept.id)
        };
    });
    
    const deptCount = Object.keys(deptGroups).filter(d => 
        deptGroups[d].requests.length > 0 || deptGroups[d].members.length > 0
    ).length;
    
    const angleStep = (2 * Math.PI) / deptCount;
    const groupRadius = Math.min(centerX, centerY) - 200;
    
    let deptIndex = 0;
    Object.entries(deptGroups).forEach(([deptId, group]) => {
        if (group.requests.length === 0 && group.members.length === 0) return;
        
        const angle = angleStep * deptIndex - Math.PI / 2;
        const groupCenterX = centerX + groupRadius * Math.cos(angle);
        const groupCenterY = centerY + groupRadius * Math.sin(angle);
        
        // 부서 내 노드 배치
        const allDeptNodes = [...group.requests, ...group.members];
        const localRadius = 80;
        
        allDeptNodes.forEach((node, index) => {
            const localAngle = (2 * Math.PI * index) / allDeptNodes.length;
            const offsetX = node.type === 'request' ? -100 : -70;
            
            positions[node.id] = {
                x: groupCenterX + localRadius * Math.cos(localAngle) + offsetX,
                y: groupCenterY + localRadius * Math.sin(localAngle) - 60
            };
        });
        
        deptIndex++;
    });
    
    return positions;
}

// 상태별 레이아웃 - 상태별로 열을 나눠 배치
function calculateStatusLayout(requests, members, centerX, centerY) {
    const positions = {};
    
    // 상태별 그룹화
    const statusGroups = {
        pending: { requests: [], members: new Set() },
        progress: { requests: [], members: new Set() },
        completed: { requests: [], members: new Set() }
    };
    
    requests.forEach(req => {
        statusGroups[req.data.status].requests.push(req);
        
        // 연결된 담당자 찾기
        const connectedMembers = graphDB.getConnectedNodes(req.id)
            .filter(n => n.type === 'member');
        connectedMembers.forEach(m => {
            statusGroups[req.data.status].members.add(m);
        });
    });
    
    // 연결 안된 담당자는 pending에 추가
    members.forEach(member => {
        const isAssigned = Object.values(statusGroups).some(g => g.members.has(member));
        if (!isAssigned) {
            statusGroups.pending.members.add(member);
        }
    });
    
    const columnWidth = (centerX * 2) / 3;
    const statusOrder = ['pending', 'progress', 'completed'];
    const statusLabels = { pending: '대기', progress: '진행중', completed: '완료' };
    
    statusOrder.forEach((status, colIndex) => {
        const group = statusGroups[status];
        const colCenterX = columnWidth * colIndex + columnWidth / 2;
        
        // 신청서 배치
        group.requests.forEach((req, index) => {
            positions[req.id] = {
                x: colCenterX - 100,
                y: 80 + index * 150
            };
        });
        
        // 담당자 배치
        const membersArray = Array.from(group.members);
        const memberStartY = Math.max(80, 80 + group.requests.length * 150 + 50);
        
        membersArray.forEach((member, index) => {
            positions[member.id] = {
                x: colCenterX - 70,
                y: memberStartY + index * 130
            };
        });
    });
    
    return positions;
}

// 애니메이션으로 위치 이동
function animateToPositions(newPositions) {
    isAnimating = true;
    const duration = 800;
    const startTime = performance.now();
    
    const startPositions = {};
    graphDB.getAllNodes().forEach(node => {
        startPositions[node.id] = { x: node.data.x, y: node.data.y };
    });
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        graphDB.getAllNodes().forEach(node => {
            if (newPositions[node.id]) {
                const startPos = startPositions[node.id];
                const endPos = newPositions[node.id];
                
                const newX = startPos.x + (endPos.x - startPos.x) * eased;
                const newY = startPos.y + (endPos.y - startPos.y) * eased;
                
                graphDB.updateNode(node.id, { x: newX, y: newY });
            }
        });
        
        renderGraph();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
            saveToStorage();
            showToast('레이아웃이 적용되었습니다', 'success');
        }
    }
    
    requestAnimationFrame(animate);
}

// ===== Canvas Pan =====
function setupEventListeners() {
    const canvas = document.getElementById('graphCanvas');
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.target === canvas || e.target.classList.contains('nodes-layer') || 
            e.target.classList.contains('connections-layer')) {
            isPanning = true;
            panStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
            canvas.style.cursor = 'grabbing';
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isPanning) {
            panOffset.x = e.clientX - panStart.x;
            panOffset.y = e.clientY - panStart.y;
            updateCanvasTransform();
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isPanning = false;
        canvas.style.cursor = 'grab';
    });
    
    canvas.addEventListener('mouseleave', () => {
        isPanning = false;
        canvas.style.cursor = 'grab';
    });
    
    // 마우스 휠 줌
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoom = Math.max(0.5, Math.min(2, zoom + delta));
        updateZoomLevel();
        updateCanvasTransform();
    });
    
    // 테마 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.theme-selector')) {
            closeThemeDropdown();
        }
    });
}

// ===== Filters =====
function populateFilters() {
    const deptFilter = document.getElementById('departmentFilter');
    const reqDeptSelect = document.getElementById('requestDepartment');
    const memberDeptSelect = document.getElementById('memberDepartment');
    
    const deptOptions = departments.map(d => 
        `<option value="${d.id}">${d.name}</option>`
    ).join('');
    
    deptFilter.innerHTML = `<option value="all">모든 부서</option>${deptOptions}`;
    reqDeptSelect.innerHTML = `<option value="">선택하세요</option>${deptOptions}`;
    memberDeptSelect.innerHTML = `<option value="">선택하세요</option>${deptOptions}`;
}

function filterByStatus() {
    renderGraph();
}

function filterByDepartment() {
    renderGraph();
}

function filterByTeam(teamId) {
    // 해당 팀 멤버들만 하이라이트
    const members = graphDB.getNodesByType('member').filter(m => m.data.team === teamId);
    
    document.querySelectorAll('.graph-node').forEach(el => {
        el.style.opacity = '0.3';
    });
    
    members.forEach(m => {
        const el = document.querySelector(`[data-node-id="${m.id}"]`);
        if (el) {
            el.style.opacity = '1';
            // 연결된 신청서도 표시
            const connections = graphDB.getConnectedNodes(m.id);
            connections.forEach(conn => {
                const connEl = document.querySelector(`[data-node-id="${conn.id}"]`);
                if (connEl) connEl.style.opacity = '1';
            });
        }
    });
    
    // 3초 후 리셋
    setTimeout(() => {
        document.querySelectorAll('.graph-node').forEach(el => {
            el.style.opacity = '1';
        });
    }, 3000);
}

// ===== Modals =====
function openAddRequestModal() {
    document.getElementById('addRequestModal').classList.add('show');
}

function openAddMemberModal() {
    document.getElementById('addMemberModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function updateTeamOptions() {
    const deptId = document.getElementById('memberDepartment').value;
    const teamSelect = document.getElementById('memberTeam');
    
    if (!deptId) {
        teamSelect.innerHTML = '<option value="">부서를 먼저 선택하세요</option>';
        return;
    }
    
    const dept = departments.find(d => d.id === deptId);
    if (dept) {
        teamSelect.innerHTML = dept.teams.map(t => 
            `<option value="${t.id}">${t.name}</option>`
        ).join('');
    }
}

// ===== CRUD Operations =====
function addRequest() {
    const title = document.getElementById('requestTitle').value;
    const type = document.getElementById('requestType').value;
    const priority = document.getElementById('requestPriority').value;
    const department = document.getElementById('requestDepartment').value;
    const description = document.getElementById('requestDescription').value;
    const deadline = document.getElementById('requestDeadline').value;
    
    if (!title || !type || !department) {
        showToast('필수 항목을 입력해주세요', 'error');
        return;
    }
    
    const id = `req-${Date.now()}`;
    const canvas = document.getElementById('graphCanvas');
    const rect = canvas.getBoundingClientRect();
    
    graphDB.addNode(id, 'request', {
        title,
        type,
        priority,
        department,
        description,
        deadline,
        status: 'pending',
        x: (rect.width / 2 - panOffset.x) / zoom,
        y: (rect.height / 3 - panOffset.y) / zoom,
        evaluation: null
    });
    
    saveToStorage();
    renderGraph();
    closeModal('addRequestModal');
    document.getElementById('addRequestForm').reset();
    showToast('신청서가 추가되었습니다', 'success');
}

function addMember() {
    const name = document.getElementById('memberName').value;
    const department = document.getElementById('memberDepartment').value;
    const team = document.getElementById('memberTeam').value;
    const position = document.getElementById('memberPosition').value;
    const email = document.getElementById('memberEmail').value;
    
    if (!name || !department || !team) {
        showToast('필수 항목을 입력해주세요', 'error');
        return;
    }
    
    const id = `member-${Date.now()}`;
    const canvas = document.getElementById('graphCanvas');
    const rect = canvas.getBoundingClientRect();
    
    graphDB.addNode(id, 'member', {
        name,
        department,
        team,
        position,
        email,
        x: (rect.width / 2 - panOffset.x) / zoom,
        y: (rect.height * 2 / 3 - panOffset.y) / zoom
    });
    
    saveToStorage();
    renderGraph();
    renderDepartmentList();
    closeModal('addMemberModal');
    document.getElementById('addMemberForm').reset();
    showToast('담당자가 추가되었습니다', 'success');
}

function deleteSelectedNode() {
    if (!selectedNode) return;
    
    if (confirm('정말 삭제하시겠습니까?')) {
        graphDB.deleteNode(selectedNode.id);
        selectedNode = null;
        saveToStorage();
        renderGraph();
        renderDepartmentList();
        renderDetailPanel();
        showToast('삭제되었습니다', 'success');
    }
}

function changeRequestStatus() {
    if (!selectedNode || selectedNode.type !== 'request') return;
    
    const statuses = ['pending', 'progress', 'completed'];
    const currentIndex = statuses.indexOf(selectedNode.data.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    graphDB.updateNode(selectedNode.id, { status: nextStatus });
    
    // 연결된 엣지 상태도 업데이트
    const edges = graphDB.getAllEdges().filter(e => 
        e.source === selectedNode.id || e.target === selectedNode.id
    );
    edges.forEach(edge => {
        edge.data.status = nextStatus;
    });
    
    saveToStorage();
    renderGraph();
    renderDepartmentList();
    renderDetailPanel();
    showToast(`상태가 '${getStatusName(nextStatus)}'로 변경되었습니다`, 'success');
}

// ===== Evaluation Modal =====
function openEvaluationModal() {
    if (!selectedNode || selectedNode.type !== 'request') return;
    
    const modal = document.getElementById('evaluationModal');
    const content = document.getElementById('evaluationContent');
    const { data } = selectedNode;
    
    const evaluation = data.evaluation || {
        technical: 50,
        communication: 50,
        efficiency: 50,
        quality: 50
    };
    
    content.innerHTML = `
        <div class="form-group">
            <label>기술력 평가</label>
            <input type="range" id="evalTechnical" min="0" max="100" value="${evaluation.technical}" 
                   oninput="document.getElementById('evalTechnicalValue').textContent = this.value">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                <span>0</span>
                <span id="evalTechnicalValue">${evaluation.technical}</span>
                <span>100</span>
            </div>
        </div>
        <div class="form-group">
            <label>소통 능력</label>
            <input type="range" id="evalCommunication" min="0" max="100" value="${evaluation.communication}"
                   oninput="document.getElementById('evalCommunicationValue').textContent = this.value">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                <span>0</span>
                <span id="evalCommunicationValue">${evaluation.communication}</span>
                <span>100</span>
            </div>
        </div>
        <div class="form-group">
            <label>업무 효율성</label>
            <input type="range" id="evalEfficiency" min="0" max="100" value="${evaluation.efficiency}"
                   oninput="document.getElementById('evalEfficiencyValue').textContent = this.value">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                <span>0</span>
                <span id="evalEfficiencyValue">${evaluation.efficiency}</span>
                <span>100</span>
            </div>
        </div>
        <div class="form-group">
            <label>결과물 품질</label>
            <input type="range" id="evalQuality" min="0" max="100" value="${evaluation.quality}"
                   oninput="document.getElementById('evalQualityValue').textContent = this.value">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                <span>0</span>
                <span id="evalQualityValue">${evaluation.quality}</span>
                <span>100</span>
            </div>
        </div>
        <div class="form-group">
            <label>평가 코멘트</label>
            <textarea id="evalComment" rows="3" placeholder="평가 내용을 입력하세요...">${data.evaluationComment || ''}</textarea>
        </div>
    `;
    
    modal.classList.add('show');
}

function saveEvaluation() {
    if (!selectedNode) return;
    
    const evaluation = {
        technical: parseInt(document.getElementById('evalTechnical').value),
        communication: parseInt(document.getElementById('evalCommunication').value),
        efficiency: parseInt(document.getElementById('evalEfficiency').value),
        quality: parseInt(document.getElementById('evalQuality').value)
    };
    const comment = document.getElementById('evalComment').value;
    
    graphDB.updateNode(selectedNode.id, { 
        evaluation,
        evaluationComment: comment
    });
    
    saveToStorage();
    renderDetailPanel();
    closeModal('evaluationModal');
    showToast('평가가 저장되었습니다', 'success');
}

// ===== Utility Functions =====
function getTypeClass(type) {
    const typeMap = {
        '데이터 추출': 'data',
        '화면 개발': 'ui',
        'API 개발': 'api',
        '버그 수정': 'bug',
        '인프라 요청': 'infra',
        '보안 점검': 'security',
        '기타': 'other'
    };
    return typeMap[type] || 'other';
}

function getDepartmentName(deptId) {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : deptId;
}

function getTeamName(teamId) {
    for (const dept of departments) {
        const team = dept.teams.find(t => t.id === teamId);
        if (team) return team.name;
    }
    return teamId;
}

function getStatusName(status) {
    const statusMap = {
        'pending': '대기',
        'progress': '진행중',
        'completed': '완료'
    };
    return statusMap[status] || status;
}

function getPriorityName(priority) {
    const priorityMap = {
        'low': '낮음',
        'medium': '보통',
        'high': '높음',
        'urgent': '긴급'
    };
    return priorityMap[priority] || priority;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', init);

