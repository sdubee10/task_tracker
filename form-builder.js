// ===== Form Builder State =====
let formComponents = [];
let selectedComponentId = null;
let draggedComponent = null;
let draggedFromPalette = false;
let formTemplates = JSON.parse(localStorage.getItem('formTemplates')) || [];
let undoStack = [];
let redoStack = [];
const MAX_UNDO = 30;

// Resize state
let isResizing = false;
let resizeComponent = null;
let resizeHandle = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;

// ===== Theme Management =====
function initTheme() {
    const savedTheme = localStorage.getItem('formBuilderTheme') || 'dark';
    setTheme(savedTheme, false);
}

function setTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
        localStorage.setItem('formBuilderTheme', theme);
    }
    
    // Update active state in dropdown
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });
    
    // Close dropdown
    const dropdown = document.getElementById('themeDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

function toggleThemeDropdown() {
    const dropdown = document.getElementById('themeDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const themeSelector = e.target.closest('.theme-selector');
    if (!themeSelector) {
        const dropdown = document.getElementById('themeDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
});

// Component definitions
const componentDefinitions = {
    // ===== 기본 입력 (7개) =====
    'text-input': {
        type: 'text-input',
        label: '텍스트 입력',
        placeholder: '텍스트를 입력하세요',
        required: false,
        defaultValue: '',
        colSpan: 1
    },
    'textarea': {
        type: 'textarea',
        label: '텍스트 영역',
        placeholder: '내용을 입력하세요',
        required: false,
        rows: 4,
        defaultValue: '',
        colSpan: 'full'
    },
    'number-input': {
        type: 'number-input',
        label: '숫자 입력',
        placeholder: '0',
        required: false,
        min: 0,
        max: 9999,
        defaultValue: '',
        colSpan: 1
    },
    'date-input': {
        type: 'date-input',
        label: '날짜 선택',
        required: false,
        defaultValue: '',
        colSpan: 1
    },
    'select': {
        type: 'select',
        label: '선택 항목',
        required: false,
        options: ['옵션 1', '옵션 2', '옵션 3'],
        defaultValue: '',
        colSpan: 1
    },
    'email-input': {
        type: 'email-input',
        label: '이메일 입력',
        placeholder: 'example@email.com',
        required: false,
        defaultValue: '',
        colSpan: 1
    },
    'phone-input': {
        type: 'phone-input',
        label: '전화번호 입력',
        placeholder: '010-0000-0000',
        required: false,
        defaultValue: '',
        colSpan: 1
    },
    
    // ===== 선택 항목 (6개) =====
    'checkbox': {
        type: 'checkbox',
        label: '체크박스',
        options: ['항목 1', '항목 2', '항목 3'],
        required: false,
        colSpan: 1
    },
    'radio': {
        type: 'radio',
        label: '라디오 버튼',
        options: ['선택 1', '선택 2', '선택 3'],
        required: false,
        colSpan: 1
    },
    'rating': {
        type: 'rating',
        label: '별점 평가',
        maxStars: 5,
        required: false,
        defaultValue: 0,
        colSpan: 1
    },
    'slider': {
        type: 'slider',
        label: '슬라이더',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 50,
        colSpan: 1
    },
    'toggle-switch': {
        type: 'toggle-switch',
        label: '토글 스위치',
        defaultValue: false,
        onLabel: '예',
        offLabel: '아니오',
        colSpan: 1
    },
    'yes-no-select': {
        type: 'yes-no-select',
        label: '예/아니오 선택',
        required: false,
        defaultValue: '',
        colSpan: 1
    },
    
    // ===== 업무 측정 (7개) =====
    'time-estimate': {
        type: 'time-estimate',
        label: '예상 소요 시간',
        required: false,
        colSpan: 1
    },
    'priority-select': {
        type: 'priority-select',
        label: '우선순위',
        required: false,
        defaultValue: 'medium',
        colSpan: 1
    },
    'difficulty': {
        type: 'difficulty',
        label: '난이도',
        required: false,
        defaultValue: '',
        colSpan: 'full'
    },
    'progress': {
        type: 'progress',
        label: '진행률',
        defaultValue: 0,
        colSpan: 'full'
    },
    'deadline-input': {
        type: 'deadline-input',
        label: '마감일 설정',
        required: false,
        includeTime: true,
        colSpan: 1
    },
    'work-type-select': {
        type: 'work-type-select',
        label: '업무 유형',
        required: false,
        options: ['신규 개발', '기능 개선', '버그 수정', '유지보수', '기술 검토', '기타'],
        colSpan: 1
    },
    'impact-level': {
        type: 'impact-level',
        label: '영향도 평가',
        required: false,
        defaultValue: '',
        colSpan: 1
    },
    
    // ===== 평가 항목 (8개) =====
    'tech-skill-eval': {
        type: 'tech-skill-eval',
        label: '기술 역량 평가',
        skills: [
            { name: '프로그래밍 언어', level: 0 },
            { name: '프레임워크/라이브러리', level: 0 },
            { name: '데이터베이스', level: 0 },
            { name: '시스템 설계', level: 0 },
            { name: '코드 품질', level: 0 }
        ],
        colSpan: 'full'
    },
    'soft-skill-eval': {
        type: 'soft-skill-eval',
        label: '소프트 스킬 평가',
        skills: [
            { name: '커뮤니케이션', score: 0 },
            { name: '팀워크', score: 0 },
            { name: '문제 해결력', score: 0 },
            { name: '리더십', score: 0 },
            { name: '시간 관리', score: 0 }
        ],
        colSpan: 'full'
    },
    'performance-eval': {
        type: 'performance-eval',
        label: '성과 평가',
        metrics: [
            { name: '업무 완성도', score: 0 },
            { name: '목표 달성률', score: 0 },
            { name: '업무 효율성', score: 0 },
            { name: '품질 수준', score: 0 },
            { name: '기여도', score: 0 }
        ],
        colSpan: 'full'
    },
    'competency-matrix': {
        type: 'competency-matrix',
        label: '역량 매트릭스',
        competencies: [
            { name: '기술 역량', levels: [false, false, false, false, false] },
            { name: '업무 역량', levels: [false, false, false, false, false] },
            { name: '협업 역량', levels: [false, false, false, false, false] },
            { name: '성장 잠재력', levels: [false, false, false, false, false] }
        ],
        levelLabels: ['1', '2', '3', '4', '5'],
        colSpan: 'full'
    },
    'goal-achievement': {
        type: 'goal-achievement',
        label: '목표 달성도',
        goals: [
            { title: '주요 목표 1', percentage: 0 },
            { title: '주요 목표 2', percentage: 0 },
            { title: '주요 목표 3', percentage: 0 }
        ],
        colSpan: 'full'
    },
    'feedback-section': {
        type: 'feedback-section',
        label: '피드백 섹션',
        categories: [
            { type: 'strength', label: '강점', content: '' },
            { type: 'improvement', label: '개선 필요 사항', content: '' },
            { type: 'goal', label: '향후 목표', content: '' }
        ],
        colSpan: 'full'
    },
    'kpi-tracker': {
        type: 'kpi-tracker',
        label: 'KPI 추적',
        kpis: [
            { name: 'KPI 1', target: 100, current: 0, unit: '%' },
            { name: 'KPI 2', target: 100, current: 0, unit: '%' },
            { name: 'KPI 3', target: 100, current: 0, unit: '%' }
        ],
        colSpan: 'full'
    },
    'satisfaction-survey': {
        type: 'satisfaction-survey',
        label: '만족도 조사',
        questions: [
            { question: '업무 만족도', score: 0 },
            { question: '협업 만족도', score: 0 },
            { question: '성장 만족도', score: 0 }
        ],
        colSpan: 'full'
    },
    
    // ===== 정보 표시 (6개) =====
    'section-header': {
        type: 'section-header',
        label: '섹션 제목',
        text: '새 섹션',
        colSpan: 'full'
    },
    'divider': {
        type: 'divider',
        label: '구분선',
        colSpan: 'full'
    },
    'info-text': {
        type: 'info-text',
        label: '안내 텍스트',
        text: '안내 메시지를 입력하세요.',
        colSpan: 'full'
    },
    'file-upload': {
        type: 'file-upload',
        label: '파일 업로드',
        accept: '*',
        multiple: false,
        required: false,
        colSpan: 1
    },
    'image-upload': {
        type: 'image-upload',
        label: '이미지 업로드',
        accept: 'image/*',
        multiple: false,
        required: false,
        colSpan: 1
    },
    'link-input': {
        type: 'link-input',
        label: 'URL 링크',
        placeholder: 'https://...',
        required: false,
        colSpan: 1
    },
    
    // ===== 요청자 정보 (6개) =====
    'requester-info': {
        type: 'requester-info',
        label: '요청자 정보',
        colSpan: 'full'
    },
    'department-select': {
        type: 'department-select',
        label: '부서 선택',
        required: false,
        departments: ['개발팀', '기획팀', '디자인팀', '마케팅팀', '영업팀', '인사팀'],
        colSpan: 1
    },
    'approval-flow': {
        type: 'approval-flow',
        label: '결재 라인',
        steps: [
            { title: '1차 결재', role: '팀장' },
            { title: '2차 결재', role: '부서장' },
            { title: '최종 결재', role: '본부장' }
        ],
        colSpan: 'full'
    },
    'team-member-select': {
        type: 'team-member-select',
        label: '담당자 지정',
        required: false,
        multiple: true,
        colSpan: 1
    },
    'project-select': {
        type: 'project-select',
        label: '프로젝트 선택',
        required: false,
        options: ['프로젝트 A', '프로젝트 B', '프로젝트 C', '신규 프로젝트'],
        colSpan: 1
    },
    'cost-estimate': {
        type: 'cost-estimate',
        label: '비용 산정',
        required: false,
        currency: '원',
        colSpan: 1
    },

    // ===== 추가 신청서 컴포넌트 =====
    'date-range': {
        type: 'date-range',
        label: '기간 선택',
        required: false,
        colSpan: 'full'
    },
    'time-input': {
        type: 'time-input',
        label: '시간 입력',
        required: false,
        colSpan: 1
    },
    'address-input': {
        type: 'address-input',
        label: '주소 입력',
        required: false,
        colSpan: 'full'
    },
    'signature-pad': {
        type: 'signature-pad',
        label: '서명',
        required: false,
        colSpan: 'full'
    },
    'rich-text': {
        type: 'rich-text',
        label: '서식 있는 텍스트',
        required: false,
        colSpan: 'full'
    },
    'table-input': {
        type: 'table-input',
        label: '표 입력',
        columns: ['항목', '내용', '비고'],
        rows: 3,
        colSpan: 'full'
    },
    'budget-breakdown': {
        type: 'budget-breakdown',
        label: '예산 내역',
        items: [
            { category: '인건비', amount: 0 },
            { category: '장비/소프트웨어', amount: 0 },
            { category: '외주비', amount: 0 },
            { category: '기타', amount: 0 }
        ],
        colSpan: 'full'
    },
    'risk-assessment': {
        type: 'risk-assessment',
        label: '리스크 평가',
        risks: [
            { name: '일정 지연', probability: 0, impact: 0 },
            { name: '예산 초과', probability: 0, impact: 0 },
            { name: '품질 이슈', probability: 0, impact: 0 }
        ],
        colSpan: 'full'
    },
    'checklist': {
        type: 'checklist',
        label: '체크리스트',
        items: ['항목 1', '항목 2', '항목 3', '항목 4', '항목 5'],
        colSpan: 'full'
    },
    'multi-select': {
        type: 'multi-select',
        label: '다중 선택',
        options: ['옵션 1', '옵션 2', '옵션 3', '옵션 4', '옵션 5'],
        required: false,
        colSpan: 1
    },
    'status-select': {
        type: 'status-select',
        label: '상태 선택',
        options: ['대기', '진행중', '검토중', '완료', '보류', '취소'],
        required: false,
        colSpan: 1
    },
    'version-input': {
        type: 'version-input',
        label: '버전 정보',
        placeholder: '1.0.0',
        required: false,
        colSpan: 1
    },
    'environment-select': {
        type: 'environment-select',
        label: '환경 선택',
        options: ['개발', '스테이징', '운영', '전체'],
        required: false,
        colSpan: 1
    },

    // ===== 개발자 역량 평가 =====
    'code-quality-eval': {
        type: 'code-quality-eval',
        label: '코드 품질 평가',
        criteria: [
            { name: '가독성', score: 0, weight: 20 },
            { name: '유지보수성', score: 0, weight: 20 },
            { name: '테스트 커버리지', score: 0, weight: 20 },
            { name: '성능 최적화', score: 0, weight: 20 },
            { name: '보안 준수', score: 0, weight: 20 }
        ],
        colSpan: 'full'
    },
    'dev-skill-radar': {
        type: 'dev-skill-radar',
        label: '개발 역량 레이더',
        skills: [
            { name: 'Frontend', level: 0 },
            { name: 'Backend', level: 0 },
            { name: 'Database', level: 0 },
            { name: 'DevOps', level: 0 },
            { name: 'Architecture', level: 0 },
            { name: 'Security', level: 0 }
        ],
        colSpan: 'full'
    },
    'experience-level': {
        type: 'experience-level',
        label: '경험 수준',
        categories: [
            { name: '언어/프레임워크', items: [] },
            { name: '데이터베이스', items: [] },
            { name: '클라우드/인프라', items: [] },
            { name: '도구/방법론', items: [] }
        ],
        colSpan: 'full'
    },
    'contribution-tracker': {
        type: 'contribution-tracker',
        label: '기여도 추적',
        metrics: [
            { name: '코드 커밋', value: 0, unit: '건' },
            { name: '코드 리뷰', value: 0, unit: '건' },
            { name: '버그 수정', value: 0, unit: '건' },
            { name: '문서 작성', value: 0, unit: '건' },
            { name: '멘토링', value: 0, unit: '시간' }
        ],
        colSpan: 'full'
    },
    'problem-solving-eval': {
        type: 'problem-solving-eval',
        label: '문제 해결 능력 평가',
        criteria: [
            { name: '문제 분석력', score: 0 },
            { name: '해결책 도출', score: 0 },
            { name: '실행력', score: 0 },
            { name: '창의성', score: 0 },
            { name: '학습 능력', score: 0 }
        ],
        colSpan: 'full'
    },

    // ===== 요청자 역량 평가 =====
    'requirement-quality': {
        type: 'requirement-quality',
        label: '요구사항 품질 평가',
        criteria: [
            { name: '명확성', score: 0 },
            { name: '완전성', score: 0 },
            { name: '일관성', score: 0 },
            { name: '실현 가능성', score: 0 },
            { name: '우선순위 적절성', score: 0 }
        ],
        colSpan: 'full'
    },
    'communication-eval': {
        type: 'communication-eval',
        label: '커뮤니케이션 평가',
        aspects: [
            { name: '요구사항 전달력', score: 0 },
            { name: '피드백 적시성', score: 0 },
            { name: '협조도', score: 0 },
            { name: '의사결정 속도', score: 0 },
            { name: '변경 관리', score: 0 }
        ],
        colSpan: 'full'
    },
    'stakeholder-engagement': {
        type: 'stakeholder-engagement',
        label: '이해관계자 참여도',
        metrics: [
            { name: '회의 참석률', value: 0, unit: '%' },
            { name: '피드백 응답 시간', value: 0, unit: '일' },
            { name: '요구사항 변경 횟수', value: 0, unit: '회' },
            { name: '승인 처리 시간', value: 0, unit: '일' }
        ],
        colSpan: 'full'
    },
    'business-value-assessment': {
        type: 'business-value-assessment',
        label: '비즈니스 가치 평가',
        factors: [
            { name: '매출 기여도', score: 0, weight: 25 },
            { name: '비용 절감', score: 0, weight: 25 },
            { name: '고객 만족도', score: 0, weight: 25 },
            { name: '전략적 중요도', score: 0, weight: 25 }
        ],
        colSpan: 'full'
    },

    // ===== 프로젝트 성과 평가 =====
    'project-health': {
        type: 'project-health',
        label: '프로젝트 건강도',
        indicators: [
            { name: '일정 준수', status: 'green' },
            { name: '예산 준수', status: 'green' },
            { name: '품질 수준', status: 'green' },
            { name: '리스크 관리', status: 'green' },
            { name: '팀 사기', status: 'green' }
        ],
        colSpan: 'full'
    },
    'milestone-tracker': {
        type: 'milestone-tracker',
        label: '마일스톤 추적',
        milestones: [
            { name: '기획 완료', dueDate: '', status: 'pending' },
            { name: '개발 완료', dueDate: '', status: 'pending' },
            { name: 'QA 완료', dueDate: '', status: 'pending' },
            { name: '배포 완료', dueDate: '', status: 'pending' }
        ],
        colSpan: 'full'
    },
    'sprint-velocity': {
        type: 'sprint-velocity',
        label: '스프린트 속도',
        sprints: [
            { name: 'Sprint 1', planned: 0, completed: 0 },
            { name: 'Sprint 2', planned: 0, completed: 0 },
            { name: 'Sprint 3', planned: 0, completed: 0 }
        ],
        colSpan: 'full'
    },
    'defect-density': {
        type: 'defect-density',
        label: '결함 밀도',
        metrics: [
            { name: '심각', count: 0, color: '#ef4444' },
            { name: '높음', count: 0, color: '#f97316' },
            { name: '보통', count: 0, color: '#eab308' },
            { name: '낮음', count: 0, color: '#22c55e' }
        ],
        colSpan: 'full'
    },
    'delivery-metrics': {
        type: 'delivery-metrics',
        label: '배포 지표',
        metrics: [
            { name: '배포 빈도', value: 0, unit: '회/월' },
            { name: '리드 타임', value: 0, unit: '일' },
            { name: '변경 실패율', value: 0, unit: '%' },
            { name: '복구 시간', value: 0, unit: '시간' }
        ],
        colSpan: 'full'
    },
    'team-performance': {
        type: 'team-performance',
        label: '팀 성과 지표',
        metrics: [
            { name: '작업 완료율', value: 0, target: 100 },
            { name: '일정 준수율', value: 0, target: 100 },
            { name: '품질 점수', value: 0, target: 100 },
            { name: '고객 만족도', value: 0, target: 100 }
        ],
        colSpan: 'full'
    },
    'roi-calculator': {
        type: 'roi-calculator',
        label: 'ROI 계산',
        inputs: {
            investment: 0,
            benefit: 0,
            period: 12
        },
        colSpan: 'full'
    },
    'resource-utilization': {
        type: 'resource-utilization',
        label: '리소스 활용도',
        resources: [
            { name: '개발자', allocated: 0, utilized: 0 },
            { name: '디자이너', allocated: 0, utilized: 0 },
            { name: 'QA', allocated: 0, utilized: 0 },
            { name: 'PM', allocated: 0, utilized: 0 }
        ],
        colSpan: 'full'
    },
    'scope-change-log': {
        type: 'scope-change-log',
        label: '범위 변경 이력',
        changes: [],
        colSpan: 'full'
    },
    'lesson-learned': {
        type: 'lesson-learned',
        label: '교훈 기록',
        categories: [
            { type: 'success', label: '잘한 점', items: [] },
            { type: 'improve', label: '개선할 점', items: [] },
            { type: 'action', label: '향후 조치', items: [] }
        ],
        colSpan: 'full'
    }
};

// Sample templates for demonstration (10 templates for different teams)
const sampleTemplates = [
    // ===== 1. DBA팀 - 데이터 추출 요청서 =====
    {
        id: 'sample_dba_001',
        name: '🗄️ [DBA] 데이터 추출 요청서',
        description: 'DBA팀에 특정 데이터 추출을 요청할 때 사용합니다. 보고서 작성, 분석 등에 필요한 데이터를 요청하세요.',
        category: 'DBA',
        formTitle: '데이터 추출 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'dba1_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'dba1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'dba1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['마케팅팀', '영업팀', '재무팀', '인사팀', '기획팀', '운영팀'], colSpan: 1 },
            { id: 'dba1_4', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'dba1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'dba1_6', type: 'section-header', label: '섹션 제목', text: '📊 데이터 요청 내용', colSpan: 'full' },
            { id: 'dba1_7', type: 'text-input', label: '요청 제목', placeholder: '예: 2024년 1분기 매출 데이터 추출', required: true, colSpan: 'full' },
            { id: 'dba1_8', type: 'select', label: '데이터 용도', required: true, options: ['보고서 작성', '분석/통계', '감사 자료', '외부 제출용', '기타'], colSpan: 1 },
            { id: 'dba1_9', type: 'select', label: '데이터 형식', required: true, options: ['Excel (.xlsx)', 'CSV', 'PDF', '기타'], colSpan: 1 },
            { id: 'dba1_10', type: 'textarea', label: '필요한 데이터 설명', placeholder: '어떤 데이터가 필요한지 상세히 설명해주세요.\n\n예시:\n- 필요한 테이블/시스템명\n- 조회 기간\n- 필요한 컬럼(항목)\n- 조건(필터링)', required: true, rows: 6, colSpan: 'full' },
            { id: 'dba1_11', type: 'date-input', label: '데이터 조회 시작일', required: true, colSpan: 1 },
            { id: 'dba1_12', type: 'date-input', label: '데이터 조회 종료일', required: true, colSpan: 1 },
            { id: 'dba1_13', type: 'checkbox', label: '포함 항목 선택', options: ['고객 정보', '거래 내역', '상품 정보', '매출 데이터', '재고 현황'], colSpan: 'full' },
            { id: 'dba1_14', type: 'yes-no-select', label: '개인정보 포함 여부', required: true, colSpan: 1 },
            { id: 'dba1_15', type: 'yes-no-select', label: '정기 추출 필요 여부', required: false, colSpan: 1 },
            { id: 'dba1_16', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'dba1_17', type: 'section-header', label: '섹션 제목', text: '📎 첨부파일', colSpan: 'full' },
            { id: 'dba1_18', type: 'file-upload', label: '참고 자료 (양식 등)', accept: '.xlsx,.xls,.pdf,.doc,.docx', multiple: true, required: false, colSpan: 'full' },
            { id: 'dba1_19', type: 'textarea', label: '추가 요청사항', placeholder: '기타 요청사항이 있으면 입력해주세요.', required: false, rows: 2, colSpan: 'full' },
            { id: 'dba1_20', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '최종 승인', role: 'DBA팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 2. DBA팀 - 테이블/컬럼 추가 요청서 =====
    {
        id: 'sample_dba_002',
        name: '🗄️ [DBA] 테이블/컬럼 변경 요청서',
        description: 'DBA팀에 새로운 테이블 생성이나 기존 테이블에 컬럼 추가/변경을 요청할 때 사용합니다.',
        category: 'DBA',
        formTitle: '테이블/컬럼 변경 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'dba2_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'dba2_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'dba2_3', type: 'project-select', label: '관련 프로젝트', required: true, options: ['ERP 시스템', '그룹웨어', '홈페이지', 'CRM', '신규 프로젝트', '기타'], colSpan: 1 },
            { id: 'dba2_4', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'dba2_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'dba2_6', type: 'section-header', label: '섹션 제목', text: '🔧 변경 요청 내용', colSpan: 'full' },
            { id: 'dba2_7', type: 'text-input', label: '요청 제목', placeholder: '예: 회원 테이블에 마케팅 동의 컬럼 추가', required: true, colSpan: 'full' },
            { id: 'dba2_8', type: 'radio', label: '변경 유형', options: ['신규 테이블 생성', '컬럼 추가', '컬럼 변경', '컬럼 삭제', '인덱스 추가/변경'], required: true, colSpan: 'full' },
            { id: 'dba2_9', type: 'text-input', label: '대상 테이블명', placeholder: '변경하려는 테이블명을 입력하세요', required: true, colSpan: 'full' },
            { id: 'dba2_10', type: 'textarea', label: '변경 상세 내용', placeholder: '변경하려는 내용을 상세히 설명해주세요.\n\n예시:\n- 추가할 컬럼명: marketing_agree\n- 데이터 타입: VARCHAR(1)\n- 기본값: N\n- 설명: 마케팅 수신 동의 여부', required: true, rows: 6, colSpan: 'full' },
            { id: 'dba2_11', type: 'textarea', label: '변경 사유', placeholder: '왜 이 변경이 필요한지 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'dba2_12', type: 'impact-level', label: '영향도', required: true, colSpan: 'full' },
            { id: 'dba2_13', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'dba2_14', type: 'file-upload', label: '테이블 설계서/ERD', accept: '.xlsx,.xls,.pdf,.png,.jpg', multiple: true, required: false, colSpan: 'full' },
            { id: 'dba2_15', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '개발팀장' }, { title: '2차 승인', role: 'DBA팀장' }, { title: '최종 승인', role: 'IT부서장' }], colSpan: 'full' }
        ]
    },

    // ===== 3. Frontend팀 - 화면 개발 요청서 =====
    {
        id: 'sample_fe_001',
        name: '🎨 [Frontend] 화면 개발 요청서',
        description: 'Frontend팀에 새로운 화면 개발이나 기존 화면 수정을 요청할 때 사용합니다.',
        category: 'Frontend',
        formTitle: '화면 개발 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'fe1_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['마케팅팀', '영업팀', '기획팀', '운영팀', '고객지원팀'], colSpan: 1 },
            { id: 'fe1_4', type: 'project-select', label: '대상 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', '기타'], colSpan: 1 },
            { id: 'fe1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fe1_6', type: 'section-header', label: '섹션 제목', text: '🖼️ 화면 요청 내용', colSpan: 'full' },
            { id: 'fe1_7', type: 'text-input', label: '요청 제목', placeholder: '예: 이벤트 페이지 신규 개발', required: true, colSpan: 'full' },
            { id: 'fe1_8', type: 'radio', label: '요청 유형', options: ['신규 화면 개발', '기존 화면 수정', '디자인 변경', '오류 수정'], required: true, colSpan: 'full' },
            { id: 'fe1_9', type: 'text-input', label: '화면 URL (기존 화면 수정 시)', placeholder: 'https://...', required: false, colSpan: 'full' },
            { id: 'fe1_10', type: 'textarea', label: '화면 설명', placeholder: '어떤 화면이 필요한지 상세히 설명해주세요.\n\n예시:\n- 화면의 목적\n- 표시할 내용\n- 필요한 기능 (버튼, 입력폼 등)', required: true, rows: 6, colSpan: 'full' },
            { id: 'fe1_11', type: 'checkbox', label: '필요한 기능', options: ['목록 조회', '상세 보기', '등록/수정 폼', '삭제 기능', '검색 기능', '엑셀 다운로드', '인쇄 기능'], colSpan: 'full' },
            { id: 'fe1_12', type: 'radio', label: '반응형 필요 여부', options: ['PC만', 'PC + 모바일', '모바일만'], required: true, colSpan: 1 },
            { id: 'fe1_13', type: 'priority-select', label: '우선순위', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'fe1_14', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'fe1_15', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fe1_16', type: 'section-header', label: '섹션 제목', text: '📎 참고 자료', colSpan: 'full' },
            { id: 'fe1_17', type: 'info-text', label: '안내', text: '💡 디자인 시안이나 화면 기획서가 있으면 첨부해주세요. 참고할 사이트 URL도 도움이 됩니다.', colSpan: 'full' },
            { id: 'fe1_18', type: 'image-upload', label: '디자인 시안/화면 캡처', accept: 'image/*', multiple: true, required: false, colSpan: 1 },
            { id: 'fe1_19', type: 'file-upload', label: '기획서/요구사항 문서', accept: '.pdf,.doc,.docx,.ppt,.pptx,.xlsx', multiple: true, required: false, colSpan: 1 },
            { id: 'fe1_20', type: 'link-input', label: '참고 사이트 URL', placeholder: 'https://...', required: false, colSpan: 'full' },
            { id: 'fe1_21', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '최종 승인', role: 'Frontend팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 4. Frontend팀 - UI/UX 개선 요청서 =====
    {
        id: 'sample_fe_002',
        name: '🎨 [Frontend] UI/UX 개선 요청서',
        description: '기존 화면의 사용성 개선, 디자인 변경, 불편사항 개선을 요청할 때 사용합니다.',
        category: 'Frontend',
        formTitle: 'UI/UX 개선 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'fe2_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe2_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe2_3', type: 'project-select', label: '대상 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', '기타'], colSpan: 1 },
            { id: 'fe2_4', type: 'text-input', label: '개선 대상 화면 URL', placeholder: 'https://...', required: true, colSpan: 1 },
            { id: 'fe2_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fe2_6', type: 'section-header', label: '섹션 제목', text: '🔍 현재 문제점', colSpan: 'full' },
            { id: 'fe2_7', type: 'text-input', label: '요청 제목', placeholder: '예: 주문 목록 화면 검색 기능 개선', required: true, colSpan: 'full' },
            { id: 'fe2_8', type: 'checkbox', label: '문제 유형', options: ['사용하기 어려움', '찾기 어려움', '느림/로딩 오래 걸림', '디자인 개선 필요', '모바일에서 불편', '오류 발생'], colSpan: 'full' },
            { id: 'fe2_9', type: 'textarea', label: '현재 문제점 설명', placeholder: '현재 어떤 점이 불편하거나 문제인지 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'fe2_10', type: 'image-upload', label: '문제 화면 캡처', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'fe2_11', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fe2_12', type: 'section-header', label: '섹션 제목', text: '💡 개선 요청 내용', colSpan: 'full' },
            { id: 'fe2_13', type: 'textarea', label: '원하는 개선 내용', placeholder: '어떻게 개선되면 좋을지 설명해주세요.\n\n예시:\n- 검색 버튼을 더 눈에 띄게\n- 결과가 바로 보이도록\n- 모바일에서도 사용 가능하게', required: true, rows: 5, colSpan: 'full' },
            { id: 'fe2_14', type: 'link-input', label: '참고 사이트 (벤치마킹)', placeholder: 'https://...', required: false, colSpan: 'full' },
            { id: 'fe2_15', type: 'satisfaction-survey', label: '현재 화면 만족도', questions: [{ question: '사용 편의성', score: 0 }, { question: '디자인', score: 0 }, { question: '속도', score: 0 }], colSpan: 'full' },
            { id: 'fe2_16', type: 'priority-select', label: '긴급도', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'fe2_17', type: 'deadline-input', label: '희망 완료일', required: false, includeTime: false, colSpan: 1 },
            { id: 'fe2_18', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '승인', role: 'Frontend팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 5. Backend팀 - API 개발 요청서 =====
    {
        id: 'sample_be_001',
        name: '⚙️ [Backend] API/기능 개발 요청서',
        description: 'Backend팀에 새로운 API나 서버 기능 개발을 요청할 때 사용합니다.',
        category: 'Backend',
        formTitle: 'API/기능 개발 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'be1_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['기획팀', 'Frontend팀', '운영팀', '마케팅팀', '영업팀'], colSpan: 1 },
            { id: 'be1_4', type: 'project-select', label: '대상 시스템', required: true, options: ['홈페이지', '관리자 시스템', '모바일 앱', 'ERP', 'CRM', '기타'], colSpan: 1 },
            { id: 'be1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'be1_6', type: 'section-header', label: '섹션 제목', text: '🔧 개발 요청 내용', colSpan: 'full' },
            { id: 'be1_7', type: 'text-input', label: '요청 제목', placeholder: '예: 회원 포인트 적립 API 개발', required: true, colSpan: 'full' },
            { id: 'be1_8', type: 'radio', label: '요청 유형', options: ['신규 기능 개발', '기존 기능 수정', '기능 삭제', '성능 개선', '버그 수정'], required: true, colSpan: 'full' },
            { id: 'be1_9', type: 'textarea', label: '기능 설명', placeholder: '필요한 기능을 상세히 설명해주세요.\n\n예시:\n- 어떤 기능이 필요한지\n- 입력값과 결과값\n- 처리 로직 (가능하면)', required: true, rows: 6, colSpan: 'full' },
            { id: 'be1_10', type: 'textarea', label: '비즈니스 요구사항', placeholder: '왜 이 기능이 필요한지, 비즈니스적 배경을 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'be1_11', type: 'checkbox', label: '연관 시스템', options: ['회원 시스템', '주문 시스템', '결제 시스템', '재고 시스템', '알림 시스템', '외부 연동'], colSpan: 'full' },
            { id: 'be1_12', type: 'yes-no-select', label: '외부 시스템 연동 필요', required: true, colSpan: 1 },
            { id: 'be1_13', type: 'impact-level', label: '예상 영향도', required: true, colSpan: 'full' },
            { id: 'be1_14', type: 'priority-select', label: '우선순위', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'be1_15', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'be1_16', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'be1_17', type: 'section-header', label: '섹션 제목', text: '📎 참고 자료', colSpan: 'full' },
            { id: 'be1_18', type: 'file-upload', label: '기획서/요구사항 문서', accept: '.pdf,.doc,.docx,.xlsx,.ppt,.pptx', multiple: true, required: false, colSpan: 1 },
            { id: 'be1_19', type: 'file-upload', label: '기타 참고 자료', accept: '*', multiple: true, required: false, colSpan: 1 },
            { id: 'be1_20', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '기술 검토', role: 'Backend팀장' }, { title: '최종 승인', role: 'IT부서장' }], colSpan: 'full' }
        ]
    },

    // ===== 6. Backend팀 - 배치/스케줄러 요청서 =====
    {
        id: 'sample_be_002',
        name: '⚙️ [Backend] 배치/자동화 작업 요청서',
        description: '정기적으로 실행되는 배치 작업이나 자동화 처리를 요청할 때 사용합니다.',
        category: 'Backend',
        formTitle: '배치/자동화 작업 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'be2_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be2_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be2_3', type: 'department-select', label: '요청 부서', required: true, departments: ['운영팀', '재무팀', '인사팀', '마케팅팀', '영업팀'], colSpan: 1 },
            { id: 'be2_4', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'be2_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'be2_6', type: 'section-header', label: '섹션 제목', text: '⏰ 배치 작업 내용', colSpan: 'full' },
            { id: 'be2_7', type: 'text-input', label: '요청 제목', placeholder: '예: 매일 새벽 매출 집계 자동화', required: true, colSpan: 'full' },
            { id: 'be2_8', type: 'radio', label: '실행 주기', options: ['매일', '매주', '매월', '특정 요일', '1회성'], required: true, colSpan: 1 },
            { id: 'be2_9', type: 'text-input', label: '실행 시간', placeholder: '예: 매일 새벽 3시, 매주 월요일 오전 9시', required: true, colSpan: 1 },
            { id: 'be2_10', type: 'textarea', label: '작업 내용 설명', placeholder: '자동으로 처리되어야 할 작업을 설명해주세요.\n\n예시:\n- 어떤 데이터를 처리하는지\n- 처리 결과는 어떻게 되어야 하는지\n- 알림이 필요한지', required: true, rows: 6, colSpan: 'full' },
            { id: 'be2_11', type: 'checkbox', label: '결과 알림 방법', options: ['이메일 발송', '슬랙/메신저 알림', '파일 생성', '알림 불필요'], colSpan: 'full' },
            { id: 'be2_12', type: 'email-input', label: '결과 수신 이메일', placeholder: 'example@company.com', required: false, colSpan: 'full' },
            { id: 'be2_13', type: 'yes-no-select', label: '실패 시 재시도 필요', required: true, colSpan: 1 },
            { id: 'be2_14', type: 'yes-no-select', label: '실패 알림 필요', required: true, colSpan: 1 },
            { id: 'be2_15', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'be2_16', type: 'file-upload', label: '참고 자료', accept: '*', multiple: true, required: false, colSpan: 'full' },
            { id: 'be2_17', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '최종 승인', role: 'Backend팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 7. Backend팀 - 외부 연동 요청서 =====
    {
        id: 'sample_be_003',
        name: '⚙️ [Backend] 외부 시스템 연동 요청서',
        description: '외부 서비스나 시스템과의 연동(API, 파일 등)을 요청할 때 사용합니다.',
        category: 'Backend',
        formTitle: '외부 시스템 연동 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'be3_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be3_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be3_3', type: 'department-select', label: '요청 부서', required: true, departments: ['기획팀', '운영팀', '재무팀', '마케팅팀', '영업팀'], colSpan: 1 },
            { id: 'be3_4', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'be3_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'be3_6', type: 'section-header', label: '섹션 제목', text: '🔗 연동 요청 내용', colSpan: 'full' },
            { id: 'be3_7', type: 'text-input', label: '요청 제목', placeholder: '예: 카카오 알림톡 발송 연동', required: true, colSpan: 'full' },
            { id: 'be3_8', type: 'text-input', label: '연동 대상 서비스명', placeholder: '예: 카카오 알림톡, 네이버 페이, 택배사 API 등', required: true, colSpan: 'full' },
            { id: 'be3_9', type: 'radio', label: '연동 방식', options: ['API 연동', '파일 연동 (FTP 등)', '웹훅', '기타'], required: true, colSpan: 'full' },
            { id: 'be3_10', type: 'textarea', label: '연동 목적 및 내용', placeholder: '연동이 필요한 이유와 어떤 데이터를 주고받아야 하는지 설명해주세요.', required: true, rows: 5, colSpan: 'full' },
            { id: 'be3_11', type: 'radio', label: '데이터 방향', options: ['우리 → 외부 (데이터 전송)', '외부 → 우리 (데이터 수신)', '양방향'], required: true, colSpan: 'full' },
            { id: 'be3_12', type: 'yes-no-select', label: '외부 업체 계약 완료', required: true, colSpan: 1 },
            { id: 'be3_13', type: 'yes-no-select', label: 'API 문서 보유', required: true, colSpan: 1 },
            { id: 'be3_14', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'be3_15', type: 'section-header', label: '섹션 제목', text: '📎 연동 관련 자료', colSpan: 'full' },
            { id: 'be3_16', type: 'link-input', label: 'API 문서 URL', placeholder: 'https://...', required: false, colSpan: 'full' },
            { id: 'be3_17', type: 'file-upload', label: 'API 문서/연동 가이드', accept: '.pdf,.doc,.docx,.xlsx', multiple: true, required: false, colSpan: 1 },
            { id: 'be3_18', type: 'file-upload', label: '계약서/협약서', accept: '.pdf,.doc,.docx', multiple: true, required: false, colSpan: 1 },
            { id: 'be3_19', type: 'text-input', label: '외부 업체 담당자 연락처', placeholder: '이름, 연락처, 이메일', required: false, colSpan: 'full' },
            { id: 'be3_20', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '기술 검토', role: 'Backend팀장' }, { title: '최종 승인', role: 'IT부서장' }], colSpan: 'full' }
        ]
    },

    // ===== 8. Infra팀 - 서버/자원 요청서 =====
    {
        id: 'sample_infra_001',
        name: '🖥️ [Infra] 서버/자원 신청서',
        description: '새로운 서버, 스토리지, 네트워크 등 인프라 자원을 요청할 때 사용합니다.',
        category: 'Infra',
        formTitle: '서버/자원 신청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'infra1_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'infra1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'infra1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['개발팀', 'DBA팀', 'Backend팀', 'Frontend팀', '운영팀'], colSpan: 1 },
            { id: 'infra1_4', type: 'project-select', label: '용도/프로젝트', required: true, options: ['신규 서비스', '기존 서비스 확장', '개발/테스트 환경', '백업/DR', '기타'], colSpan: 1 },
            { id: 'infra1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'infra1_6', type: 'section-header', label: '섹션 제목', text: '🖥️ 자원 요청 내용', colSpan: 'full' },
            { id: 'infra1_7', type: 'text-input', label: '요청 제목', placeholder: '예: 신규 웹서버 2대 구축 요청', required: true, colSpan: 'full' },
            { id: 'infra1_8', type: 'checkbox', label: '필요한 자원 유형', options: ['서버 (VM/물리)', '스토리지', '데이터베이스', '로드밸런서', 'CDN', '도메인/SSL', '기타'], colSpan: 'full' },
            { id: 'infra1_9', type: 'radio', label: '환경 구분', options: ['운영 환경', '개발 환경', '테스트 환경', '스테이징 환경'], required: true, colSpan: 1 },
            { id: 'infra1_10', type: 'number-input', label: '필요 수량', placeholder: '1', required: true, min: 1, max: 100, colSpan: 1 },
            { id: 'infra1_11', type: 'textarea', label: '상세 스펙 요청', placeholder: '필요한 사양을 설명해주세요.\n\n예시:\n- CPU: 4코어 이상\n- 메모리: 16GB 이상\n- 디스크: 100GB SSD\n- OS: Ubuntu 22.04', required: true, rows: 5, colSpan: 'full' },
            { id: 'infra1_12', type: 'textarea', label: '용도 설명', placeholder: '이 자원을 어떤 용도로 사용할 예정인지 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'infra1_13', type: 'radio', label: '사용 기간', options: ['상시 운영', '1개월 이내', '3개월 이내', '6개월 이내', '1년 이내', '기타'], required: true, colSpan: 1 },
            { id: 'infra1_14', type: 'deadline-input', label: '필요 시점', required: true, includeTime: false, colSpan: 1 },
            { id: 'infra1_15', type: 'cost-estimate', label: '예상 월 비용 (알고 있다면)', required: false, currency: '원', colSpan: 'full' },
            { id: 'infra1_16', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'infra1_17', type: 'file-upload', label: '참고 자료 (아키텍처 등)', accept: '.pdf,.doc,.docx,.png,.jpg,.xlsx', multiple: true, required: false, colSpan: 'full' },
            { id: 'infra1_18', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '인프라 검토', role: 'Infra팀장' }, { title: '최종 승인', role: 'IT부서장' }], colSpan: 'full' }
        ]
    },

    // ===== 9. Infra팀 - 권한/계정 요청서 =====
    {
        id: 'sample_infra_002',
        name: '🖥️ [Infra] 권한/계정 신청서',
        description: '서버 접속 권한, 시스템 계정, VPN 등 접근 권한을 요청할 때 사용합니다.',
        category: 'Infra',
        formTitle: '권한/계정 신청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'infra2_1', type: 'section-header', label: '섹션 제목', text: '📌 신청자 정보', colSpan: 'full' },
            { id: 'infra2_2', type: 'requester-info', label: '신청자 정보', colSpan: 'full' },
            { id: 'infra2_3', type: 'department-select', label: '소속 부서', required: true, departments: ['개발팀', 'DBA팀', 'Backend팀', 'Frontend팀', '운영팀', '기획팀'], colSpan: 1 },
            { id: 'infra2_4', type: 'text-input', label: '직책/직급', placeholder: '예: 대리, 과장, 팀장', required: true, colSpan: 1 },
            { id: 'infra2_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'infra2_6', type: 'section-header', label: '섹션 제목', text: '🔐 권한 요청 내용', colSpan: 'full' },
            { id: 'infra2_7', type: 'text-input', label: '요청 제목', placeholder: '예: 운영 서버 SSH 접속 권한 요청', required: true, colSpan: 'full' },
            { id: 'infra2_8', type: 'checkbox', label: '신청 권한 유형', options: ['서버 SSH 접속', 'DB 접속 권한', 'VPN 계정', '클라우드 콘솔 (AWS/GCP 등)', '모니터링 시스템', 'CI/CD 시스템', '기타'], colSpan: 'full' },
            { id: 'infra2_9', type: 'text-input', label: '대상 서버/시스템명', placeholder: '예: web-server-01, db-master, AWS Console', required: true, colSpan: 'full' },
            { id: 'infra2_10', type: 'radio', label: '권한 수준', options: ['읽기 전용', '읽기/쓰기', '관리자'], required: true, colSpan: 1 },
            { id: 'infra2_11', type: 'radio', label: '사용 기간', options: ['상시', '1개월', '3개월', '6개월', '프로젝트 기간'], required: true, colSpan: 1 },
            { id: 'infra2_12', type: 'textarea', label: '권한 필요 사유', placeholder: '왜 이 권한이 필요한지 구체적으로 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'infra2_13', type: 'text-input', label: '접속 IP (고정 IP가 있는 경우)', placeholder: '예: 123.456.789.0', required: false, colSpan: 'full' },
            { id: 'infra2_14', type: 'info-text', label: '안내', text: '⚠️ 보안 정책에 따라 권한 부여 후에도 정기적인 검토가 진행됩니다.', colSpan: 'full' },
            { id: 'infra2_15', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'infra2_16', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '보안 검토', role: '보안담당자' }, { title: '최종 승인', role: 'Infra팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 10. 공통 - 버그/오류 신고서 =====
    {
        id: 'sample_common_001',
        name: '🐛 [공통] 버그/오류 신고서',
        description: '시스템 사용 중 발견한 버그나 오류를 신고할 때 사용합니다. 담당 팀에서 확인 후 처리합니다.',
        category: '공통',
        formTitle: '버그/오류 신고서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'common1_1', type: 'section-header', label: '섹션 제목', text: '📌 신고자 정보', colSpan: 'full' },
            { id: 'common1_2', type: 'requester-info', label: '신고자 정보', colSpan: 'full' },
            { id: 'common1_3', type: 'department-select', label: '소속 부서', required: true, departments: ['마케팅팀', '영업팀', '재무팀', '인사팀', '기획팀', '운영팀', '고객지원팀'], colSpan: 1 },
            { id: 'common1_4', type: 'date-input', label: '발생 일시', required: true, colSpan: 1 },
            { id: 'common1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'common1_6', type: 'section-header', label: '섹션 제목', text: '🐛 오류 내용', colSpan: 'full' },
            { id: 'common1_7', type: 'text-input', label: '오류 제목', placeholder: '예: 로그인 시 화면이 멈추는 현상', required: true, colSpan: 'full' },
            { id: 'common1_8', type: 'select', label: '발생 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', 'CRM', '기타'], colSpan: 1 },
            { id: 'common1_9', type: 'select', label: '오류 심각도', required: true, options: ['심각 (업무 불가)', '높음 (주요 기능 장애)', '보통 (일부 기능 장애)', '낮음 (불편하지만 사용 가능)'], colSpan: 1 },
            { id: 'common1_10', type: 'text-input', label: '오류 발생 URL/화면', placeholder: 'https://... 또는 화면명', required: true, colSpan: 'full' },
            { id: 'common1_11', type: 'textarea', label: '오류 상세 설명', placeholder: '어떤 오류가 발생했는지 자세히 설명해주세요.\n\n예시:\n- 어떤 작업을 하다가 발생했는지\n- 어떤 오류 메시지가 나왔는지\n- 얼마나 자주 발생하는지', required: true, rows: 5, colSpan: 'full' },
            { id: 'common1_12', type: 'textarea', label: '재현 방법', placeholder: '오류를 다시 발생시키는 방법을 단계별로 설명해주세요.\n\n예시:\n1. 로그인 페이지 접속\n2. 아이디/비밀번호 입력\n3. 로그인 버튼 클릭\n4. 오류 발생', required: false, rows: 4, colSpan: 'full' },
            { id: 'common1_13', type: 'radio', label: '발생 빈도', options: ['항상 발생', '자주 발생', '가끔 발생', '1회만 발생'], required: true, colSpan: 1 },
            { id: 'common1_14', type: 'radio', label: '사용 브라우저/환경', options: ['Chrome', 'Edge', 'Safari', '모바일 앱', '기타'], required: true, colSpan: 1 },
            { id: 'common1_15', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'common1_16', type: 'section-header', label: '섹션 제목', text: '📎 증빙 자료', colSpan: 'full' },
            { id: 'common1_17', type: 'info-text', label: '안내', text: '💡 오류 화면 캡처나 동영상이 있으면 원인 파악에 큰 도움이 됩니다.', colSpan: 'full' },
            { id: 'common1_18', type: 'image-upload', label: '오류 화면 캡처', accept: 'image/*', multiple: true, required: false, colSpan: 1 },
            { id: 'common1_19', type: 'file-upload', label: '기타 첨부파일', accept: '*', multiple: true, required: false, colSpan: 1 },
            { id: 'common1_20', type: 'textarea', label: '추가 정보', placeholder: '기타 참고할 정보가 있으면 입력해주세요.', required: false, rows: 2, colSpan: 'full' },
            { id: 'common1_21', type: 'approval-flow', label: '접수 확인', steps: [{ title: '접수', role: 'IT헬프데스크' }, { title: '담당 배정', role: '담당팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 11. DBA팀 - DB 성능 개선 요청서 =====
    {
        id: 'sample_dba_003',
        name: '🗄️ [DBA] DB 성능 개선 요청서',
        description: '느린 쿼리, 시스템 지연 등 데이터베이스 성능 문제 개선을 요청할 때 사용합니다.',
        category: 'DBA',
        formTitle: 'DB 성능 개선 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'dba3_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'dba3_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'dba3_3', type: 'project-select', label: '대상 시스템', required: true, options: ['ERP', '홈페이지', '관리자시스템', 'CRM', '그룹웨어', '기타'], colSpan: 1 },
            { id: 'dba3_4', type: 'priority-select', label: '긴급도', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'dba3_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'dba3_6', type: 'section-header', label: '섹션 제목', text: '⚡ 성능 문제 내용', colSpan: 'full' },
            { id: 'dba3_7', type: 'text-input', label: '요청 제목', placeholder: '예: 주문 조회 화면 로딩 시간 개선', required: true, colSpan: 'full' },
            { id: 'dba3_8', type: 'text-input', label: '문제 발생 화면/기능', placeholder: '예: 주문관리 > 주문목록 조회', required: true, colSpan: 'full' },
            { id: 'dba3_9', type: 'textarea', label: '현재 문제 상황', placeholder: '어떤 성능 문제가 있는지 설명해주세요.\n\n예시:\n- 현재 소요 시간\n- 언제부터 느려졌는지\n- 특정 조건에서만 느린지', required: true, rows: 4, colSpan: 'full' },
            { id: 'dba3_10', type: 'number-input', label: '현재 소요 시간(초)', placeholder: '10', required: false, min: 0, max: 9999, colSpan: 1 },
            { id: 'dba3_11', type: 'number-input', label: '희망 소요 시간(초)', placeholder: '3', required: false, min: 0, max: 9999, colSpan: 1 },
            { id: 'dba3_12', type: 'radio', label: '문제 발생 빈도', options: ['항상', '특정 시간대', '특정 조건', '간헐적'], required: true, colSpan: 'full' },
            { id: 'dba3_13', type: 'image-upload', label: '화면 캡처', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'dba3_14', type: 'approval-flow', label: '결재 라인', steps: [{ title: '접수', role: 'DBA팀' }, { title: '분석', role: 'DBA담당자' }], colSpan: 'full' }
        ]
    },

    // ===== 12. DBA팀 - 데이터 정정 요청서 =====
    {
        id: 'sample_dba_004',
        name: '🗄️ [DBA] 데이터 정정 요청서',
        description: '잘못 입력된 데이터의 수정/삭제를 요청할 때 사용합니다. 반드시 승인 후 처리됩니다.',
        category: 'DBA',
        formTitle: '데이터 정정 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'dba4_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'dba4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'dba4_3', type: 'department-select', label: '요청 부서', required: true, departments: ['운영팀', '고객지원팀', '재무팀', '영업팀', '마케팅팀'], colSpan: 1 },
            { id: 'dba4_4', type: 'priority-select', label: '긴급도', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'dba4_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'dba4_6', type: 'section-header', label: '섹션 제목', text: '✏️ 정정 요청 내용', colSpan: 'full' },
            { id: 'dba4_7', type: 'info-text', label: '안내', text: '⚠️ 데이터 정정은 복구가 어려울 수 있습니다. 정확한 정보를 입력해주세요.', colSpan: 'full' },
            { id: 'dba4_8', type: 'text-input', label: '요청 제목', placeholder: '예: 고객 연락처 정보 수정', required: true, colSpan: 'full' },
            { id: 'dba4_9', type: 'radio', label: '정정 유형', options: ['데이터 수정', '데이터 삭제', '데이터 복구', '대량 데이터 변경'], required: true, colSpan: 'full' },
            { id: 'dba4_10', type: 'text-input', label: '대상 테이블/화면', placeholder: '예: 고객정보, 주문내역', required: true, colSpan: 'full' },
            { id: 'dba4_11', type: 'textarea', label: '현재 데이터 (변경 전)', placeholder: '현재 잘못된 데이터 내용을 입력해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'dba4_12', type: 'textarea', label: '변경할 데이터 (변경 후)', placeholder: '정정되어야 할 올바른 데이터를 입력해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'dba4_13', type: 'textarea', label: '정정 사유', placeholder: '왜 데이터 정정이 필요한지 설명해주세요.', required: true, rows: 2, colSpan: 'full' },
            { id: 'dba4_14', type: 'file-upload', label: '증빙 자료', accept: '*', multiple: true, required: false, colSpan: 'full' },
            { id: 'dba4_15', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '2차 승인', role: '부서장' }, { title: '최종 처리', role: 'DBA팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 13. Frontend팀 - 모바일 앱 개발 요청서 =====
    {
        id: 'sample_fe_003',
        name: '🎨 [Frontend] 모바일 앱 기능 요청서',
        description: '모바일 앱의 새로운 기능 개발이나 화면 수정을 요청할 때 사용합니다.',
        category: 'Frontend',
        formTitle: '모바일 앱 기능 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'fe3_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe3_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe3_3', type: 'department-select', label: '요청 부서', required: true, departments: ['기획팀', '마케팅팀', '운영팀', '고객지원팀'], colSpan: 1 },
            { id: 'fe3_4', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'fe3_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fe3_6', type: 'section-header', label: '섹션 제목', text: '📱 앱 기능 요청', colSpan: 'full' },
            { id: 'fe3_7', type: 'text-input', label: '요청 제목', placeholder: '예: 푸시 알림 설정 화면 추가', required: true, colSpan: 'full' },
            { id: 'fe3_8', type: 'checkbox', label: '대상 플랫폼', options: ['iOS', 'Android', '둘 다'], colSpan: 1 },
            { id: 'fe3_9', type: 'radio', label: '요청 유형', options: ['신규 기능', '기존 기능 수정', '디자인 변경', '버그 수정'], required: true, colSpan: 1 },
            { id: 'fe3_10', type: 'textarea', label: '기능 설명', placeholder: '필요한 기능을 상세히 설명해주세요.\n\n예시:\n- 어떤 화면이 필요한지\n- 어떤 동작을 해야 하는지\n- 사용자 시나리오', required: true, rows: 5, colSpan: 'full' },
            { id: 'fe3_11', type: 'textarea', label: '기대 효과', placeholder: '이 기능이 추가되면 어떤 효과가 있을지 설명해주세요.', required: false, rows: 2, colSpan: 'full' },
            { id: 'fe3_12', type: 'priority-select', label: '우선순위', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'fe3_13', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fe3_14', type: 'image-upload', label: '참고 이미지/디자인', accept: 'image/*', multiple: true, required: false, colSpan: 1 },
            { id: 'fe3_15', type: 'file-upload', label: '기획서/요구사항', accept: '.pdf,.doc,.docx,.ppt,.pptx', multiple: true, required: false, colSpan: 1 },
            { id: 'fe3_16', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '승인', role: 'Frontend팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 14. Frontend팀 - 이메일/뉴스레터 템플릿 요청서 =====
    {
        id: 'sample_fe_004',
        name: '🎨 [Frontend] 이메일 템플릿 제작 요청서',
        description: '마케팅 이메일, 뉴스레터, 안내 메일 등의 HTML 템플릿 제작을 요청합니다.',
        category: 'Frontend',
        formTitle: '이메일 템플릿 제작 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'fe4_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe4_3', type: 'department-select', label: '요청 부서', required: true, departments: ['마케팅팀', '영업팀', '인사팀', '고객지원팀'], colSpan: 1 },
            { id: 'fe4_4', type: 'deadline-input', label: '발송 예정일', required: true, includeTime: false, colSpan: 1 },
            { id: 'fe4_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fe4_6', type: 'section-header', label: '섹션 제목', text: '✉️ 이메일 템플릿 요청', colSpan: 'full' },
            { id: 'fe4_7', type: 'text-input', label: '이메일 제목', placeholder: '예: 2024년 신년 프로모션 안내', required: true, colSpan: 'full' },
            { id: 'fe4_8', type: 'select', label: '이메일 유형', required: true, options: ['프로모션/이벤트', '뉴스레터', '공지사항', '가입환영', '비밀번호 재설정', '주문/배송 안내', '기타'], colSpan: 1 },
            { id: 'fe4_9', type: 'select', label: '발송 대상', required: true, options: ['전체 회원', '특정 회원 그룹', '임직원', '기타'], colSpan: 1 },
            { id: 'fe4_10', type: 'textarea', label: '이메일 내용', placeholder: '이메일에 들어갈 내용을 작성해주세요.', required: true, rows: 6, colSpan: 'full' },
            { id: 'fe4_11', type: 'textarea', label: '디자인 요청사항', placeholder: '원하는 디자인 스타일, 색상, 레이아웃 등을 설명해주세요.', required: false, rows: 3, colSpan: 'full' },
            { id: 'fe4_12', type: 'image-upload', label: '사용할 이미지', accept: 'image/*', multiple: true, required: false, colSpan: 1 },
            { id: 'fe4_13', type: 'file-upload', label: '참고 자료', accept: '*', multiple: true, required: false, colSpan: 1 },
            { id: 'fe4_14', type: 'link-input', label: '연결할 URL', placeholder: 'https://...', required: false, colSpan: 'full' },
            { id: 'fe4_15', type: 'approval-flow', label: '결재 라인', steps: [{ title: '내용 검토', role: '팀장' }, { title: '제작', role: 'Frontend팀' }], colSpan: 'full' }
        ]
    },

    // ===== 15. Frontend팀 - 랜딩페이지 제작 요청서 =====
    {
        id: 'sample_fe_005',
        name: '🎨 [Frontend] 랜딩페이지 제작 요청서',
        description: '이벤트, 프로모션, 캠페인용 랜딩페이지 제작을 요청합니다.',
        category: 'Frontend',
        formTitle: '랜딩페이지 제작 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'fe5_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe5_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe5_3', type: 'department-select', label: '요청 부서', required: true, departments: ['마케팅팀', '영업팀', '기획팀', '홍보팀'], colSpan: 1 },
            { id: 'fe5_4', type: 'deadline-input', label: '오픈 예정일', required: true, includeTime: false, colSpan: 1 },
            { id: 'fe5_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fe5_6', type: 'section-header', label: '섹션 제목', text: '🚀 랜딩페이지 요청', colSpan: 'full' },
            { id: 'fe5_7', type: 'text-input', label: '페이지 제목', placeholder: '예: 2024 여름 세일 이벤트', required: true, colSpan: 'full' },
            { id: 'fe5_8', type: 'select', label: '페이지 유형', required: true, options: ['이벤트/프로모션', '신제품 소개', '캠페인', '채용 공고', '설문조사', '기타'], colSpan: 1 },
            { id: 'fe5_9', type: 'date-input', label: '운영 종료일', required: false, colSpan: 1 },
            { id: 'fe5_10', type: 'textarea', label: '페이지 목적 및 내용', placeholder: '랜딩페이지의 목적과 포함될 내용을 설명해주세요.', required: true, rows: 5, colSpan: 'full' },
            { id: 'fe5_11', type: 'checkbox', label: '필요한 기능', options: ['신청/등록 폼', '카운트다운 타이머', '공유하기 버튼', '동영상 삽입', '애니메이션 효과', '팝업'], colSpan: 'full' },
            { id: 'fe5_12', type: 'radio', label: '반응형 필요', options: ['PC만', 'PC + 모바일', '모바일 우선'], required: true, colSpan: 1 },
            { id: 'fe5_13', type: 'priority-select', label: '우선순위', required: true, defaultValue: 'high', colSpan: 1 },
            { id: 'fe5_14', type: 'image-upload', label: '디자인 시안', accept: 'image/*', multiple: true, required: false, colSpan: 1 },
            { id: 'fe5_15', type: 'file-upload', label: '기획서/콘텐츠', accept: '*', multiple: true, required: false, colSpan: 1 },
            { id: 'fe5_16', type: 'link-input', label: '참고 사이트', placeholder: 'https://...', required: false, colSpan: 'full' },
            { id: 'fe5_17', type: 'approval-flow', label: '결재 라인', steps: [{ title: '기획 검토', role: '팀장' }, { title: '디자인 검토', role: '디자인팀' }, { title: '개발', role: 'Frontend팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 16. Backend팀 - 알림/메시지 발송 요청서 =====
    {
        id: 'sample_be_004',
        name: '⚙️ [Backend] 알림/메시지 발송 요청서',
        description: 'SMS, 카카오톡, 이메일 등 대량 메시지 발송을 요청합니다.',
        category: 'Backend',
        formTitle: '알림/메시지 발송 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'be4_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be4_3', type: 'department-select', label: '요청 부서', required: true, departments: ['마케팅팀', '운영팀', '고객지원팀', '인사팀'], colSpan: 1 },
            { id: 'be4_4', type: 'deadline-input', label: '발송 희망일시', required: true, includeTime: true, colSpan: 1 },
            { id: 'be4_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'be4_6', type: 'section-header', label: '섹션 제목', text: '📨 발송 요청 내용', colSpan: 'full' },
            { id: 'be4_7', type: 'text-input', label: '요청 제목', placeholder: '예: 시스템 점검 안내 SMS 발송', required: true, colSpan: 'full' },
            { id: 'be4_8', type: 'checkbox', label: '발송 채널', options: ['SMS', '카카오 알림톡', '카카오 친구톡', '이메일', '앱 푸시'], colSpan: 'full' },
            { id: 'be4_9', type: 'radio', label: '발송 대상', options: ['전체 회원', '특정 조건 회원', '직접 입력'], required: true, colSpan: 'full' },
            { id: 'be4_10', type: 'textarea', label: '발송 대상 조건', placeholder: '특정 조건인 경우 상세 조건을 입력해주세요.\n예: 최근 1개월 내 구매 고객, VIP 회원 등', required: false, rows: 2, colSpan: 'full' },
            { id: 'be4_11', type: 'textarea', label: '메시지 내용', placeholder: '발송할 메시지 내용을 입력해주세요.', required: true, rows: 5, colSpan: 'full' },
            { id: 'be4_12', type: 'number-input', label: '예상 발송 건수', placeholder: '1000', required: false, min: 1, max: 9999999, colSpan: 1 },
            { id: 'be4_13', type: 'yes-no-select', label: '테스트 발송 필요', required: true, colSpan: 1 },
            { id: 'be4_14', type: 'file-upload', label: '발송 대상 목록 (엑셀)', accept: '.xlsx,.xls,.csv', multiple: false, required: false, colSpan: 'full' },
            { id: 'be4_15', type: 'approval-flow', label: '결재 라인', steps: [{ title: '내용 검토', role: '팀장' }, { title: '발송 승인', role: '부서장' }, { title: '발송 처리', role: 'Backend팀' }], colSpan: 'full' }
        ]
    },

    // ===== 17. Backend팀 - 보고서/통계 개발 요청서 =====
    {
        id: 'sample_be_005',
        name: '⚙️ [Backend] 보고서/통계 개발 요청서',
        description: '새로운 보고서나 통계 화면 개발을 요청합니다.',
        category: 'Backend',
        formTitle: '보고서/통계 개발 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'be5_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be5_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be5_3', type: 'department-select', label: '요청 부서', required: true, departments: ['경영지원팀', '재무팀', '마케팅팀', '영업팀', '운영팀'], colSpan: 1 },
            { id: 'be5_4', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'be5_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'be5_6', type: 'section-header', label: '섹션 제목', text: '📊 보고서 요청 내용', colSpan: 'full' },
            { id: 'be5_7', type: 'text-input', label: '보고서명', placeholder: '예: 월별 매출 분석 보고서', required: true, colSpan: 'full' },
            { id: 'be5_8', type: 'select', label: '보고서 유형', required: true, options: ['매출/실적', '회원/고객', '상품/재고', '마케팅 성과', '운영 현황', '기타'], colSpan: 1 },
            { id: 'be5_9', type: 'radio', label: '갱신 주기', options: ['실시간', '일별', '주별', '월별', '수동'], required: true, colSpan: 1 },
            { id: 'be5_10', type: 'textarea', label: '필요한 항목/지표', placeholder: '보고서에 포함되어야 할 항목들을 나열해주세요.\n\n예시:\n- 일별 매출액\n- 상품별 판매량\n- 전월 대비 증감률', required: true, rows: 5, colSpan: 'full' },
            { id: 'be5_11', type: 'textarea', label: '조회 조건', placeholder: '필요한 검색/필터 조건을 설명해주세요.\n예: 기간, 부서, 상품 카테고리 등', required: false, rows: 3, colSpan: 'full' },
            { id: 'be5_12', type: 'checkbox', label: '출력 형식', options: ['화면 조회', '엑셀 다운로드', 'PDF 다운로드', '차트/그래프', '인쇄'], colSpan: 'full' },
            { id: 'be5_13', type: 'file-upload', label: '참고 자료/양식', accept: '*', multiple: true, required: false, colSpan: 'full' },
            { id: 'be5_14', type: 'approval-flow', label: '결재 라인', steps: [{ title: '요건 검토', role: '팀장' }, { title: '기술 검토', role: 'Backend팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 18. Backend팀 - 결제/정산 관련 요청서 =====
    {
        id: 'sample_be_006',
        name: '⚙️ [Backend] 결제/정산 기능 요청서',
        description: '결제, 환불, 정산 관련 기능 개발이나 수정을 요청합니다.',
        category: 'Backend',
        formTitle: '결제/정산 기능 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'be6_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be6_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be6_3', type: 'department-select', label: '요청 부서', required: true, departments: ['재무팀', '운영팀', '기획팀', '고객지원팀'], colSpan: 1 },
            { id: 'be6_4', type: 'priority-select', label: '긴급도', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'be6_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'be6_6', type: 'section-header', label: '섹션 제목', text: '💳 결제/정산 요청', colSpan: 'full' },
            { id: 'be6_7', type: 'info-text', label: '안내', text: '⚠️ 결제 관련 기능은 금전과 관련되므로 신중한 검토가 필요합니다.', colSpan: 'full' },
            { id: 'be6_8', type: 'text-input', label: '요청 제목', placeholder: '예: 부분 환불 기능 추가', required: true, colSpan: 'full' },
            { id: 'be6_9', type: 'radio', label: '요청 유형', options: ['결제 수단 추가', '결제 기능 수정', '환불 기능', '정산 기능', '정책 변경', '기타'], required: true, colSpan: 'full' },
            { id: 'be6_10', type: 'textarea', label: '상세 요청 내용', placeholder: '필요한 기능을 상세히 설명해주세요.', required: true, rows: 5, colSpan: 'full' },
            { id: 'be6_11', type: 'textarea', label: '비즈니스 배경', placeholder: '왜 이 기능이 필요한지 비즈니스 관점에서 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'be6_12', type: 'impact-level', label: '영향도', required: true, colSpan: 'full' },
            { id: 'be6_13', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'be6_14', type: 'file-upload', label: '참고 자료', accept: '*', multiple: true, required: false, colSpan: 1 },
            { id: 'be6_15', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '재무 검토', role: '재무팀장' }, { title: '기술 검토', role: 'Backend팀장' }, { title: '최종 승인', role: 'IT부서장' }], colSpan: 'full' }
        ]
    },

    // ===== 19. Infra팀 - 도메인/SSL 요청서 =====
    {
        id: 'sample_infra_003',
        name: '🖥️ [Infra] 도메인/SSL 인증서 요청서',
        description: '새로운 도메인 등록이나 SSL 인증서 발급/갱신을 요청합니다.',
        category: 'Infra',
        formTitle: '도메인/SSL 인증서 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'infra3_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'infra3_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'infra3_3', type: 'department-select', label: '요청 부서', required: true, departments: ['개발팀', '마케팅팀', '기획팀', '홍보팀'], colSpan: 1 },
            { id: 'infra3_4', type: 'deadline-input', label: '필요 시점', required: true, includeTime: false, colSpan: 1 },
            { id: 'infra3_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'infra3_6', type: 'section-header', label: '섹션 제목', text: '🌐 도메인/SSL 요청', colSpan: 'full' },
            { id: 'infra3_7', type: 'text-input', label: '요청 제목', placeholder: '예: 이벤트 페이지용 서브도메인 등록', required: true, colSpan: 'full' },
            { id: 'infra3_8', type: 'checkbox', label: '요청 유형', options: ['신규 도메인 등록', '서브도메인 추가', 'SSL 인증서 신규 발급', 'SSL 인증서 갱신', 'DNS 설정 변경'], colSpan: 'full' },
            { id: 'infra3_9', type: 'text-input', label: '도메인 주소', placeholder: '예: event.company.com', required: true, colSpan: 'full' },
            { id: 'infra3_10', type: 'textarea', label: '용도 설명', placeholder: '이 도메인을 어떤 용도로 사용할 예정인지 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'infra3_11', type: 'radio', label: 'SSL 인증서 유형', options: ['무료 (Let\'s Encrypt)', '유료 (단일 도메인)', '유료 (와일드카드)', '필요 없음'], required: true, colSpan: 'full' },
            { id: 'infra3_12', type: 'text-input', label: '연결할 서버 IP', placeholder: '예: 123.456.789.0', required: false, colSpan: 'full' },
            { id: 'infra3_13', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '승인', role: 'Infra팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 20. Infra팀 - 백업/복구 요청서 =====
    {
        id: 'sample_infra_004',
        name: '🖥️ [Infra] 백업/복구 요청서',
        description: '데이터 백업 설정이나 장애 시 데이터 복구를 요청합니다.',
        category: 'Infra',
        formTitle: '백업/복구 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'infra4_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'infra4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'infra4_3', type: 'department-select', label: '요청 부서', required: true, departments: ['개발팀', 'DBA팀', 'Backend팀', '운영팀'], colSpan: 1 },
            { id: 'infra4_4', type: 'priority-select', label: '긴급도', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'infra4_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'infra4_6', type: 'section-header', label: '섹션 제목', text: '💾 백업/복구 요청', colSpan: 'full' },
            { id: 'infra4_7', type: 'text-input', label: '요청 제목', placeholder: '예: 운영 DB 특정 시점 복구 요청', required: true, colSpan: 'full' },
            { id: 'infra4_8', type: 'radio', label: '요청 유형', options: ['데이터 복구', '백업 설정 추가', '백업 주기 변경', '백업 확인/검증', '기타'], required: true, colSpan: 'full' },
            { id: 'infra4_9', type: 'text-input', label: '대상 시스템/서버', placeholder: '예: 운영 DB 서버, 파일 서버', required: true, colSpan: 'full' },
            { id: 'infra4_10', type: 'textarea', label: '상세 요청 내용', placeholder: '복구가 필요한 경우:\n- 복구 시점\n- 복구 대상 데이터\n- 장애 발생 원인\n\n백업 설정인 경우:\n- 백업 대상\n- 백업 주기\n- 보관 기간', required: true, rows: 5, colSpan: 'full' },
            { id: 'infra4_11', type: 'date-input', label: '복구 기준 시점 (복구 시)', required: false, colSpan: 1 },
            { id: 'infra4_12', type: 'deadline-input', label: '완료 희망일', required: true, includeTime: false, colSpan: 1 },
            { id: 'infra4_13', type: 'textarea', label: '장애/문제 상황 설명', placeholder: '복구가 필요한 경우 어떤 문제가 발생했는지 설명해주세요.', required: false, rows: 3, colSpan: 'full' },
            { id: 'infra4_14', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '최종 승인', role: 'Infra팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 21. Infra팀 - 모니터링/알림 설정 요청서 =====
    {
        id: 'sample_infra_005',
        name: '🖥️ [Infra] 모니터링/알림 설정 요청서',
        description: '서버, 서비스 모니터링 및 장애 알림 설정을 요청합니다.',
        category: 'Infra',
        formTitle: '모니터링/알림 설정 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'infra5_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'infra5_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'infra5_3', type: 'department-select', label: '요청 부서', required: true, departments: ['개발팀', 'Backend팀', '운영팀', 'DBA팀'], colSpan: 1 },
            { id: 'infra5_4', type: 'deadline-input', label: '희망 완료일', required: true, includeTime: false, colSpan: 1 },
            { id: 'infra5_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'infra5_6', type: 'section-header', label: '섹션 제목', text: '📡 모니터링 요청', colSpan: 'full' },
            { id: 'infra5_7', type: 'text-input', label: '요청 제목', placeholder: '예: 신규 서비스 서버 모니터링 추가', required: true, colSpan: 'full' },
            { id: 'infra5_8', type: 'checkbox', label: '모니터링 항목', options: ['서버 상태 (CPU/메모리)', '디스크 용량', '네트워크 트래픽', 'URL 헬스체크', '프로세스 상태', '로그 모니터링', '커스텀 메트릭'], colSpan: 'full' },
            { id: 'infra5_9', type: 'text-input', label: '모니터링 대상', placeholder: '서버명, URL, IP 등', required: true, colSpan: 'full' },
            { id: 'infra5_10', type: 'textarea', label: '알림 조건', placeholder: '어떤 상황에서 알림을 받고 싶은지 설명해주세요.\n예: CPU 80% 이상, 디스크 90% 이상, 응답시간 3초 초과', required: true, rows: 3, colSpan: 'full' },
            { id: 'infra5_11', type: 'checkbox', label: '알림 수단', options: ['이메일', 'SMS', '슬랙', '카카오톡', '전화'], colSpan: 'full' },
            { id: 'infra5_12', type: 'email-input', label: '알림 수신 이메일', placeholder: 'example@company.com', required: false, colSpan: 1 },
            { id: 'infra5_13', type: 'phone-input', label: '알림 수신 연락처', placeholder: '010-0000-0000', required: false, colSpan: 1 },
            { id: 'infra5_14', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '설정', role: 'Infra팀' }], colSpan: 'full' }
        ]
    },

    // ===== 22. 공통 - 기능 개선 제안서 =====
    {
        id: 'sample_common_002',
        name: '💡 [공통] 기능 개선 제안서',
        description: '시스템 사용 중 느낀 개선점이나 새로운 아이디어를 제안합니다.',
        category: '공통',
        formTitle: '기능 개선 제안서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'common2_1', type: 'section-header', label: '섹션 제목', text: '📌 제안자 정보', colSpan: 'full' },
            { id: 'common2_2', type: 'requester-info', label: '제안자 정보', colSpan: 'full' },
            { id: 'common2_3', type: 'department-select', label: '소속 부서', required: true, departments: ['마케팅팀', '영업팀', '재무팀', '인사팀', '기획팀', '운영팀', '고객지원팀', '개발팀'], colSpan: 'full' },
            { id: 'common2_4', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'common2_5', type: 'section-header', label: '섹션 제목', text: '💡 개선 제안 내용', colSpan: 'full' },
            { id: 'common2_6', type: 'text-input', label: '제안 제목', placeholder: '예: 주문 목록 엑셀 다운로드 기능 추가', required: true, colSpan: 'full' },
            { id: 'common2_7', type: 'select', label: '대상 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', 'CRM', '기타'], colSpan: 1 },
            { id: 'common2_8', type: 'select', label: '제안 유형', required: true, options: ['신규 기능', '기능 개선', '사용성 개선', '성능 개선', '디자인 개선', '기타'], colSpan: 1 },
            { id: 'common2_9', type: 'textarea', label: '현재 불편한 점', placeholder: '현재 어떤 점이 불편하거나 아쉬운지 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'common2_10', type: 'textarea', label: '개선 제안 내용', placeholder: '어떻게 개선되면 좋을지 구체적으로 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'common2_11', type: 'textarea', label: '기대 효과', placeholder: '이 개선이 이루어지면 어떤 효과가 있을지 설명해주세요.\n예: 업무 시간 단축, 실수 방지, 고객 만족도 향상 등', required: false, rows: 3, colSpan: 'full' },
            { id: 'common2_12', type: 'image-upload', label: '참고 이미지', accept: 'image/*', multiple: true, required: false, colSpan: 1 },
            { id: 'common2_13', type: 'link-input', label: '참고 사이트', placeholder: 'https://...', required: false, colSpan: 1 },
            { id: 'common2_14', type: 'approval-flow', label: '검토 라인', steps: [{ title: '접수', role: 'IT헬프데스크' }, { title: '검토', role: '담당팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 23. 공통 - 시스템 문의/질문 =====
    {
        id: 'sample_common_003',
        name: '❓ [공통] 시스템 사용 문의',
        description: '시스템 사용 방법이나 기능에 대한 문의를 등록합니다.',
        category: '공통',
        formTitle: '시스템 사용 문의',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'common3_1', type: 'section-header', label: '섹션 제목', text: '📌 문의자 정보', colSpan: 'full' },
            { id: 'common3_2', type: 'requester-info', label: '문의자 정보', colSpan: 'full' },
            { id: 'common3_3', type: 'department-select', label: '소속 부서', required: true, departments: ['마케팅팀', '영업팀', '재무팀', '인사팀', '기획팀', '운영팀', '고객지원팀'], colSpan: 'full' },
            { id: 'common3_4', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'common3_5', type: 'section-header', label: '섹션 제목', text: '❓ 문의 내용', colSpan: 'full' },
            { id: 'common3_6', type: 'text-input', label: '문의 제목', placeholder: '예: 엑셀 업로드 방법 문의', required: true, colSpan: 'full' },
            { id: 'common3_7', type: 'select', label: '문의 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', 'CRM', '기타'], colSpan: 1 },
            { id: 'common3_8', type: 'select', label: '문의 유형', required: true, options: ['사용 방법 문의', '기능 문의', '권한 문의', '오류 문의', '기타'], colSpan: 1 },
            { id: 'common3_9', type: 'textarea', label: '문의 내용', placeholder: '궁금한 내용을 자세히 설명해주세요.', required: true, rows: 5, colSpan: 'full' },
            { id: 'common3_10', type: 'image-upload', label: '화면 캡처', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'common3_11', type: 'radio', label: '답변 희망 방법', options: ['이메일', '전화', '메신저', '상관없음'], required: true, colSpan: 'full' },
            { id: 'common3_12', type: 'approval-flow', label: '처리 라인', steps: [{ title: '접수/답변', role: 'IT헬프데스크' }], colSpan: 'full' }
        ]
    },

    // ===== 24. 공통 - 교육/매뉴얼 요청서 =====
    {
        id: 'sample_common_004',
        name: '📚 [공통] 교육/매뉴얼 요청서',
        description: '시스템 사용 교육이나 매뉴얼 제작을 요청합니다.',
        category: '공통',
        formTitle: '교육/매뉴얼 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'common4_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'common4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'common4_3', type: 'department-select', label: '요청 부서', required: true, departments: ['인사팀', '기획팀', '운영팀', '마케팅팀', '영업팀', '재무팀'], colSpan: 1 },
            { id: 'common4_4', type: 'deadline-input', label: '희망 일정', required: true, includeTime: false, colSpan: 1 },
            { id: 'common4_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'common4_6', type: 'section-header', label: '섹션 제목', text: '📚 교육/매뉴얼 요청', colSpan: 'full' },
            { id: 'common4_7', type: 'text-input', label: '요청 제목', placeholder: '예: 신규 입사자 ERP 사용 교육', required: true, colSpan: 'full' },
            { id: 'common4_8', type: 'radio', label: '요청 유형', options: ['집합 교육', '온라인 교육', '매뉴얼 제작', '동영상 제작', '1:1 교육'], required: true, colSpan: 'full' },
            { id: 'common4_9', type: 'select', label: '대상 시스템', required: true, options: ['ERP', '그룹웨어', '홈페이지 관리자', 'CRM', '전체 시스템', '기타'], colSpan: 1 },
            { id: 'common4_10', type: 'number-input', label: '교육 대상 인원', placeholder: '10', required: false, min: 1, max: 999, colSpan: 1 },
            { id: 'common4_11', type: 'textarea', label: '교육 내용/범위', placeholder: '어떤 내용의 교육이나 매뉴얼이 필요한지 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'common4_12', type: 'textarea', label: '교육 대상자 정보', placeholder: '교육 대상자의 특성을 설명해주세요.\n예: 신규 입사자, IT 비전공자, 특정 업무 담당자 등', required: false, rows: 2, colSpan: 'full' },
            { id: 'common4_13', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '일정 조율', role: 'IT헬프데스크' }], colSpan: 'full' }
        ]
    },

    // ===== 25. 보안팀 - 보안 점검 요청서 =====
    {
        id: 'sample_security_001',
        name: '🔒 [보안] 보안 점검 요청서',
        description: '신규 서비스나 기능에 대한 보안 점검을 요청합니다.',
        category: '보안',
        formTitle: '보안 점검 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'sec1_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'sec1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'sec1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['개발팀', 'Backend팀', 'Frontend팀', '기획팀'], colSpan: 1 },
            { id: 'sec1_4', type: 'deadline-input', label: '점검 희망일', required: true, includeTime: false, colSpan: 1 },
            { id: 'sec1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'sec1_6', type: 'section-header', label: '섹션 제목', text: '🔒 보안 점검 요청', colSpan: 'full' },
            { id: 'sec1_7', type: 'text-input', label: '점검 대상', placeholder: '예: 신규 결제 시스템, 회원가입 API', required: true, colSpan: 'full' },
            { id: 'sec1_8', type: 'radio', label: '점검 유형', options: ['신규 서비스 오픈 전', '정기 점검', '취약점 발견 후', '외부 감사 대응'], required: true, colSpan: 'full' },
            { id: 'sec1_9', type: 'checkbox', label: '점검 항목', options: ['웹 취약점 점검', 'API 보안 점검', '인증/권한 점검', '개인정보 처리 점검', '암호화 점검', '로그 점검'], colSpan: 'full' },
            { id: 'sec1_10', type: 'textarea', label: '서비스 설명', placeholder: '점검 대상 서비스/기능에 대해 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'sec1_11', type: 'link-input', label: '점검 대상 URL', placeholder: 'https://...', required: false, colSpan: 'full' },
            { id: 'sec1_12', type: 'file-upload', label: '관련 문서', accept: '*', multiple: true, required: false, colSpan: 'full' },
            { id: 'sec1_13', type: 'approval-flow', label: '결재 라인', steps: [{ title: '접수', role: '보안팀' }, { title: '점검', role: '보안담당자' }, { title: '결과 검토', role: '보안팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 26. 보안팀 - 개인정보 처리 요청서 =====
    {
        id: 'sample_security_002',
        name: '🔒 [보안] 개인정보 처리 요청서',
        description: '개인정보 열람, 삭제, 정정 등 개인정보 관련 처리를 요청합니다.',
        category: '보안',
        formTitle: '개인정보 처리 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'sec2_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'sec2_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'sec2_3', type: 'department-select', label: '요청 부서', required: true, departments: ['고객지원팀', '법무팀', '인사팀', '마케팅팀'], colSpan: 1 },
            { id: 'sec2_4', type: 'priority-select', label: '긴급도', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'sec2_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'sec2_6', type: 'section-header', label: '섹션 제목', text: '🔐 개인정보 처리 요청', colSpan: 'full' },
            { id: 'sec2_7', type: 'info-text', label: '안내', text: '⚠️ 개인정보 처리는 관련 법규에 따라 처리되며, 증빙 자료가 필요할 수 있습니다.', colSpan: 'full' },
            { id: 'sec2_8', type: 'text-input', label: '요청 제목', placeholder: '예: 고객 개인정보 삭제 요청', required: true, colSpan: 'full' },
            { id: 'sec2_9', type: 'radio', label: '처리 유형', options: ['개인정보 열람', '개인정보 정정', '개인정보 삭제', '처리정지 요청', '동의 철회'], required: true, colSpan: 'full' },
            { id: 'sec2_10', type: 'text-input', label: '대상자 정보', placeholder: '처리 대상자 식별 정보 (이름, ID 등)', required: true, colSpan: 'full' },
            { id: 'sec2_11', type: 'textarea', label: '요청 사유', placeholder: '개인정보 처리가 필요한 사유를 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'sec2_12', type: 'file-upload', label: '증빙 자료', accept: '*', multiple: true, required: false, colSpan: 'full' },
            { id: 'sec2_13', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '개인정보 검토', role: '개인정보보호담당자' }, { title: '최종 승인', role: '보안팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 27. QA팀 - 테스트 요청서 =====
    {
        id: 'sample_qa_001',
        name: '🧪 [QA] 테스트 요청서',
        description: '신규 기능이나 수정 사항에 대한 QA 테스트를 요청합니다.',
        category: 'QA',
        formTitle: '테스트 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'qa1_1', type: 'section-header', label: '섹션 제목', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'qa1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'qa1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['Backend팀', 'Frontend팀', '개발팀', '기획팀'], colSpan: 1 },
            { id: 'qa1_4', type: 'deadline-input', label: '테스트 완료 희망일', required: true, includeTime: false, colSpan: 1 },
            { id: 'qa1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'qa1_6', type: 'section-header', label: '섹션 제목', text: '🧪 테스트 요청 내용', colSpan: 'full' },
            { id: 'qa1_7', type: 'text-input', label: '테스트 대상', placeholder: '예: 회원가입 프로세스 개선', required: true, colSpan: 'full' },
            { id: 'qa1_8', type: 'radio', label: '테스트 유형', options: ['신규 기능', '버그 수정', '기능 개선', '전체 회귀 테스트'], required: true, colSpan: 1 },
            { id: 'qa1_9', type: 'select', label: '대상 환경', required: true, options: ['개발 서버', '스테이징 서버', '운영 서버'], colSpan: 1 },
            { id: 'qa1_10', type: 'textarea', label: '변경/추가 내용', placeholder: '테스트가 필요한 변경 사항을 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'qa1_11', type: 'textarea', label: '테스트 시나리오', placeholder: '주요 테스트 시나리오를 설명해주세요.', required: false, rows: 4, colSpan: 'full' },
            { id: 'qa1_12', type: 'checkbox', label: '테스트 범위', options: ['기능 테스트', 'UI 테스트', '성능 테스트', '보안 테스트', '호환성 테스트', '모바일 테스트'], colSpan: 'full' },
            { id: 'qa1_13', type: 'link-input', label: '테스트 URL', placeholder: 'https://...', required: false, colSpan: 'full' },
            { id: 'qa1_14', type: 'file-upload', label: '기획서/요구사항', accept: '*', multiple: true, required: false, colSpan: 'full' },
            { id: 'qa1_15', type: 'approval-flow', label: '처리 라인', steps: [{ title: '접수', role: 'QA팀' }, { title: '테스트', role: 'QA담당자' }, { title: '결과 검토', role: 'QA팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 28. 기획팀 - 요구사항 정의서 =====
    {
        id: 'sample_plan_001',
        name: '📋 [기획] 요구사항 정의서',
        description: '새로운 기능이나 서비스에 대한 요구사항을 정의합니다.',
        category: '기획',
        formTitle: '요구사항 정의서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'plan1_1', type: 'section-header', label: '섹션 제목', text: '📌 기본 정보', colSpan: 'full' },
            { id: 'plan1_2', type: 'requester-info', label: '작성자 정보', colSpan: 'full' },
            { id: 'plan1_3', type: 'project-select', label: '프로젝트', required: true, options: ['신규 프로젝트', '홈페이지 개편', 'ERP 고도화', '모바일 앱', 'CRM 구축', '기타'], colSpan: 1 },
            { id: 'plan1_4', type: 'text-input', label: '요구사항 ID', placeholder: 'REQ-2024-001', required: false, colSpan: 1 },
            { id: 'plan1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'plan1_6', type: 'section-header', label: '섹션 제목', text: '📝 요구사항 내용', colSpan: 'full' },
            { id: 'plan1_7', type: 'text-input', label: '요구사항명', placeholder: '예: 소셜 로그인 기능 추가', required: true, colSpan: 'full' },
            { id: 'plan1_8', type: 'select', label: '요구사항 유형', required: true, options: ['기능 요구사항', '비기능 요구사항', '인터페이스 요구사항', '데이터 요구사항', '보안 요구사항'], colSpan: 1 },
            { id: 'plan1_9', type: 'priority-select', label: '우선순위', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'plan1_10', type: 'textarea', label: '요구사항 설명', placeholder: '요구사항을 상세히 설명해주세요.', required: true, rows: 5, colSpan: 'full' },
            { id: 'plan1_11', type: 'textarea', label: '비즈니스 배경', placeholder: '이 요구사항이 필요한 비즈니스적 배경을 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'plan1_12', type: 'textarea', label: '수용 기준', placeholder: '이 요구사항이 완료되었다고 판단할 수 있는 기준을 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'plan1_13', type: 'impact-level', label: '영향도', required: true, colSpan: 'full' },
            { id: 'plan1_14', type: 'file-upload', label: '첨부 자료', accept: '*', multiple: true, required: false, colSpan: 'full' },
            { id: 'plan1_15', type: 'approval-flow', label: '검토 라인', steps: [{ title: '작성', role: '기획자' }, { title: '검토', role: '기획팀장' }, { title: '승인', role: 'PM' }], colSpan: 'full' }
        ]
    },

    // ===== 29. 운영팀 - 긴급 장애 보고서 =====
    {
        id: 'sample_ops_001',
        name: '🚨 [운영] 긴급 장애 보고서',
        description: '시스템 장애 발생 시 긴급 보고 및 대응을 요청합니다.',
        category: '운영',
        formTitle: '긴급 장애 보고서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'ops1_1', type: 'section-header', label: '섹션 제목', text: '🚨 장애 발생 정보', colSpan: 'full' },
            { id: 'ops1_2', type: 'info-text', label: '안내', text: '⚠️ 긴급 장애 발생 시 이 양식을 작성하면서 동시에 담당자에게 유선 연락해주세요.', colSpan: 'full' },
            { id: 'ops1_3', type: 'requester-info', label: '보고자 정보', colSpan: 'full' },
            { id: 'ops1_4', type: 'date-input', label: '장애 발생 시각', required: true, colSpan: 1 },
            { id: 'ops1_5', type: 'select', label: '장애 등급', required: true, options: ['긴급 (전체 서비스 중단)', '심각 (주요 기능 장애)', '보통 (일부 기능 장애)', '경미 (불편 수준)'], colSpan: 1 },
            { id: 'ops1_6', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'ops1_7', type: 'section-header', label: '섹션 제목', text: '📋 장애 내용', colSpan: 'full' },
            { id: 'ops1_8', type: 'text-input', label: '장애 제목', placeholder: '예: 홈페이지 전체 접속 불가', required: true, colSpan: 'full' },
            { id: 'ops1_9', type: 'select', label: '장애 시스템', required: true, options: ['홈페이지', '관리자 시스템', '모바일 앱', 'ERP', '그룹웨어', '결제 시스템', '전체', '기타'], colSpan: 1 },
            { id: 'ops1_10', type: 'radio', label: '영향 범위', options: ['전체 사용자', '일부 사용자', '내부 사용자만', '특정 기능만'], required: true, colSpan: 1 },
            { id: 'ops1_11', type: 'textarea', label: '장애 현상', placeholder: '어떤 장애가 발생했는지 상세히 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'ops1_12', type: 'textarea', label: '추정 원인', placeholder: '장애 원인으로 추정되는 내용이 있으면 입력해주세요.', required: false, rows: 2, colSpan: 'full' },
            { id: 'ops1_13', type: 'image-upload', label: '장애 화면 캡처', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'ops1_14', type: 'approval-flow', label: '대응 라인', steps: [{ title: '접수', role: '운영팀' }, { title: '원인 분석', role: '담당팀' }, { title: '조치', role: '담당자' }, { title: '완료 확인', role: '운영팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 30. 운영팀 - 정기 점검 신청서 =====
    {
        id: 'sample_ops_002',
        name: '🔧 [운영] 정기 점검 신청서',
        description: '시스템 정기 점검 일정을 신청하고 공지합니다.',
        category: '운영',
        formTitle: '정기 점검 신청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'ops2_1', type: 'section-header', label: '섹션 제목', text: '📌 신청자 정보', colSpan: 'full' },
            { id: 'ops2_2', type: 'requester-info', label: '신청자 정보', colSpan: 'full' },
            { id: 'ops2_3', type: 'department-select', label: '신청 부서', required: true, departments: ['Infra팀', 'DBA팀', 'Backend팀', '운영팀'], colSpan: 'full' },
            { id: 'ops2_4', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'ops2_5', type: 'section-header', label: '섹션 제목', text: '🔧 점검 정보', colSpan: 'full' },
            { id: 'ops2_6', type: 'text-input', label: '점검 제목', placeholder: '예: 2024년 1월 정기 서버 점검', required: true, colSpan: 'full' },
            { id: 'ops2_7', type: 'deadline-input', label: '점검 시작 일시', required: true, includeTime: true, colSpan: 1 },
            { id: 'ops2_8', type: 'deadline-input', label: '점검 종료 일시', required: true, includeTime: true, colSpan: 1 },
            { id: 'ops2_9', type: 'checkbox', label: '점검 대상 시스템', options: ['홈페이지', '관리자 시스템', '모바일 앱', 'ERP', '그룹웨어', '메일 서버', '전체'], colSpan: 'full' },
            { id: 'ops2_10', type: 'textarea', label: '점검 내용', placeholder: '어떤 점검 작업을 진행하는지 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'ops2_11', type: 'radio', label: '서비스 영향', options: ['서비스 중단', '서비스 지연 가능', '영향 없음'], required: true, colSpan: 'full' },
            { id: 'ops2_12', type: 'textarea', label: '사용자 공지 내용', placeholder: '사용자에게 공지할 내용을 작성해주세요.', required: false, rows: 3, colSpan: 'full' },
            { id: 'ops2_13', type: 'approval-flow', label: '승인 라인', steps: [{ title: '검토', role: '팀장' }, { title: '승인', role: 'IT부서장' }, { title: '공지', role: '운영팀' }], colSpan: 'full' }
        ]
    },

    // ===== 31. 프로젝트 착수 보고서 =====
    {
        id: 'sample_project_001',
        name: '🚀 [프로젝트] 착수 보고서',
        description: '신규 프로젝트 착수 시 작성하는 종합 보고서입니다.',
        category: '프로젝트',
        formTitle: '프로젝트 착수 보고서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'proj1_1', type: 'section-header', label: '섹션 제목', text: '📋 프로젝트 기본 정보', colSpan: 'full' },
            { id: 'proj1_2', type: 'text-input', label: '프로젝트명', placeholder: '프로젝트 명칭을 입력하세요', required: true, colSpan: 'full' },
            { id: 'proj1_3', type: 'project-select', label: '상위 프로젝트', required: false, options: ['신규 프로젝트', '기존 프로젝트 A', '기존 프로젝트 B'], colSpan: 1 },
            { id: 'proj1_4', type: 'version-input', label: '버전', placeholder: '1.0.0', required: false, colSpan: 1 },
            { id: 'proj1_5', type: 'date-range', label: '프로젝트 기간', required: true, colSpan: 'full' },
            { id: 'proj1_6', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'proj1_7', type: 'section-header', label: '섹션 제목', text: '🎯 프로젝트 목표', colSpan: 'full' },
            { id: 'proj1_8', type: 'textarea', label: '프로젝트 배경', placeholder: '프로젝트를 시작하게 된 배경을 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'proj1_9', type: 'goal-achievement', label: '주요 목표', goals: [{ title: '1차 목표', percentage: 0 }, { title: '2차 목표', percentage: 0 }, { title: '3차 목표', percentage: 0 }], colSpan: 'full' },
            { id: 'proj1_10', type: 'business-value-assessment', label: '비즈니스 가치 평가', factors: [{ name: '매출 기여도', score: 0, weight: 25 }, { name: '비용 절감', score: 0, weight: 25 }, { name: '고객 만족도', score: 0, weight: 25 }, { name: '전략적 중요도', score: 0, weight: 25 }], colSpan: 'full' },
            { id: 'proj1_11', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'proj1_12', type: 'section-header', label: '섹션 제목', text: '👥 프로젝트 팀', colSpan: 'full' },
            { id: 'proj1_13', type: 'team-member-select', label: 'PM', required: true, multiple: false, colSpan: 1 },
            { id: 'proj1_14', type: 'team-member-select', label: '개발팀', required: true, multiple: true, colSpan: 1 },
            { id: 'proj1_15', type: 'resource-utilization', label: '리소스 배분', resources: [{ name: '개발자', allocated: 0, utilized: 0 }, { name: '디자이너', allocated: 0, utilized: 0 }, { name: 'QA', allocated: 0, utilized: 0 }, { name: 'PM', allocated: 0, utilized: 0 }], colSpan: 'full' },
            { id: 'proj1_16', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'proj1_17', type: 'section-header', label: '섹션 제목', text: '💰 예산 계획', colSpan: 'full' },
            { id: 'proj1_18', type: 'budget-breakdown', label: '예산 내역', items: [{ category: '인건비', amount: 0 }, { category: '장비/소프트웨어', amount: 0 }, { category: '외주비', amount: 0 }, { category: '기타', amount: 0 }], colSpan: 'full' },
            { id: 'proj1_19', type: 'roi-calculator', label: 'ROI 예측', inputs: { investment: 0, benefit: 0, period: 12 }, colSpan: 'full' },
            { id: 'proj1_20', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'proj1_21', type: 'section-header', label: '섹션 제목', text: '⚠️ 리스크 관리', colSpan: 'full' },
            { id: 'proj1_22', type: 'risk-assessment', label: '리스크 평가', risks: [{ name: '일정 지연', probability: 0, impact: 0 }, { name: '예산 초과', probability: 0, impact: 0 }, { name: '품질 이슈', probability: 0, impact: 0 }, { name: '인력 이탈', probability: 0, impact: 0 }], colSpan: 'full' },
            { id: 'proj1_23', type: 'approval-flow', label: '승인 라인', steps: [{ title: '검토', role: 'PM' }, { title: '승인', role: '부서장' }, { title: '최종 승인', role: '본부장' }], colSpan: 'full' }
        ]
    },

    // ===== 32. 프로젝트 완료 보고서 =====
    {
        id: 'sample_project_002',
        name: '✅ [프로젝트] 완료 보고서',
        description: '프로젝트 완료 시 성과와 교훈을 정리하는 보고서입니다.',
        category: '프로젝트',
        formTitle: '프로젝트 완료 보고서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'proj2_1', type: 'section-header', label: '섹션 제목', text: '📋 프로젝트 개요', colSpan: 'full' },
            { id: 'proj2_2', type: 'project-select', label: '프로젝트명', required: true, options: ['프로젝트 A', '프로젝트 B', '프로젝트 C'], colSpan: 1 },
            { id: 'proj2_3', type: 'date-range', label: '실제 수행 기간', required: true, colSpan: 1 },
            { id: 'proj2_4', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'proj2_5', type: 'section-header', label: '섹션 제목', text: '📊 프로젝트 성과', colSpan: 'full' },
            { id: 'proj2_6', type: 'project-health', label: '프로젝트 건강도', indicators: [{ name: '일정 준수', status: 'green' }, { name: '예산 준수', status: 'green' }, { name: '품질 수준', status: 'green' }, { name: '고객 만족', status: 'green' }], colSpan: 'full' },
            { id: 'proj2_7', type: 'milestone-tracker', label: '마일스톤 달성', milestones: [{ name: '기획 완료', dueDate: '', status: 'completed' }, { name: '개발 완료', dueDate: '', status: 'completed' }, { name: 'QA 완료', dueDate: '', status: 'completed' }, { name: '배포 완료', dueDate: '', status: 'completed' }], colSpan: 'full' },
            { id: 'proj2_8', type: 'team-performance', label: '팀 성과 지표', metrics: [{ name: '작업 완료율', value: 0, target: 100 }, { name: '일정 준수율', value: 0, target: 100 }, { name: '품질 점수', value: 0, target: 100 }, { name: '고객 만족도', value: 0, target: 100 }], colSpan: 'full' },
            { id: 'proj2_9', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'proj2_10', type: 'section-header', label: '섹션 제목', text: '🐛 품질 분석', colSpan: 'full' },
            { id: 'proj2_11', type: 'defect-density', label: '결함 현황', metrics: [{ name: '심각', count: 0, color: '#ef4444' }, { name: '높음', count: 0, color: '#f97316' }, { name: '보통', count: 0, color: '#eab308' }, { name: '낮음', count: 0, color: '#22c55e' }], colSpan: 'full' },
            { id: 'proj2_12', type: 'delivery-metrics', label: '배포 지표', metrics: [{ name: '배포 횟수', value: 0, unit: '회' }, { name: '평균 리드타임', value: 0, unit: '일' }, { name: '롤백 횟수', value: 0, unit: '회' }, { name: '가동률', value: 0, unit: '%' }], colSpan: 'full' },
            { id: 'proj2_13', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'proj2_14', type: 'section-header', label: '섹션 제목', text: '💡 교훈 및 개선점', colSpan: 'full' },
            { id: 'proj2_15', type: 'lesson-learned', label: '프로젝트 교훈', categories: [{ type: 'success', label: '잘한 점', items: [] }, { type: 'improve', label: '개선할 점', items: [] }, { type: 'action', label: '향후 조치', items: [] }], colSpan: 'full' },
            { id: 'proj2_16', type: 'scope-change-log', label: '범위 변경 이력', changes: [], colSpan: 'full' },
            { id: 'proj2_17', type: 'signature-pad', label: 'PM 서명', required: true, colSpan: 1 },
            { id: 'proj2_18', type: 'signature-pad', label: '부서장 서명', required: true, colSpan: 1 }
        ]
    },

    // ===== 33. 개발자 역량 평가서 =====
    {
        id: 'sample_eval_001',
        name: '👨‍💻 [평가] 개발자 역량 평가서',
        description: '개발자의 기술 역량과 소프트 스킬을 종합 평가합니다.',
        category: '평가',
        formTitle: '개발자 역량 평가서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'eval1_1', type: 'section-header', label: '섹션 제목', text: '👤 평가 대상자 정보', colSpan: 'full' },
            { id: 'eval1_2', type: 'requester-info', label: '평가 대상자', colSpan: 'full' },
            { id: 'eval1_3', type: 'date-range', label: '평가 기간', required: true, colSpan: 'full' },
            { id: 'eval1_4', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'eval1_5', type: 'section-header', label: '섹션 제목', text: '💻 기술 역량', colSpan: 'full' },
            { id: 'eval1_6', type: 'dev-skill-radar', label: '개발 역량 레이더', skills: [{ name: 'Frontend', level: 0 }, { name: 'Backend', level: 0 }, { name: 'Database', level: 0 }, { name: 'DevOps', level: 0 }, { name: 'Architecture', level: 0 }, { name: 'Security', level: 0 }], colSpan: 'full' },
            { id: 'eval1_7', type: 'code-quality-eval', label: '코드 품질 평가', criteria: [{ name: '가독성', score: 0, weight: 20 }, { name: '유지보수성', score: 0, weight: 20 }, { name: '테스트 커버리지', score: 0, weight: 20 }, { name: '성능 최적화', score: 0, weight: 20 }, { name: '보안 준수', score: 0, weight: 20 }], colSpan: 'full' },
            { id: 'eval1_8', type: 'experience-level', label: '기술 경험', categories: [{ name: '언어/프레임워크', items: [] }, { name: '데이터베이스', items: [] }, { name: '클라우드/인프라', items: [] }, { name: '도구/방법론', items: [] }], colSpan: 'full' },
            { id: 'eval1_9', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'eval1_10', type: 'section-header', label: '섹션 제목', text: '🤝 소프트 스킬', colSpan: 'full' },
            { id: 'eval1_11', type: 'soft-skill-eval', label: '소프트 스킬 평가', skills: [{ name: '커뮤니케이션', score: 0 }, { name: '팀워크', score: 0 }, { name: '문제 해결력', score: 0 }, { name: '리더십', score: 0 }, { name: '시간 관리', score: 0 }], colSpan: 'full' },
            { id: 'eval1_12', type: 'problem-solving-eval', label: '문제 해결 능력', criteria: [{ name: '문제 분석력', score: 0 }, { name: '해결책 도출', score: 0 }, { name: '실행력', score: 0 }, { name: '창의성', score: 0 }, { name: '학습 능력', score: 0 }], colSpan: 'full' },
            { id: 'eval1_13', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'eval1_14', type: 'section-header', label: '섹션 제목', text: '📈 기여도', colSpan: 'full' },
            { id: 'eval1_15', type: 'contribution-tracker', label: '기여도 추적', metrics: [{ name: '코드 커밋', value: 0, unit: '건' }, { name: '코드 리뷰', value: 0, unit: '건' }, { name: '버그 수정', value: 0, unit: '건' }, { name: '문서 작성', value: 0, unit: '건' }, { name: '멘토링', value: 0, unit: '시간' }], colSpan: 'full' },
            { id: 'eval1_16', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'eval1_17', type: 'section-header', label: '섹션 제목', text: '💬 종합 피드백', colSpan: 'full' },
            { id: 'eval1_18', type: 'feedback-section', label: '피드백', categories: [{ type: 'strength', label: '강점', content: '' }, { type: 'improvement', label: '개선 필요 사항', content: '' }, { type: 'goal', label: '향후 목표', content: '' }], colSpan: 'full' },
            { id: 'eval1_19', type: 'performance-eval', label: '종합 성과 평가', metrics: [{ name: '업무 완성도', score: 0 }, { name: '목표 달성률', score: 0 }, { name: '업무 효율성', score: 0 }, { name: '품질 수준', score: 0 }, { name: '기여도', score: 0 }], colSpan: 'full' }
        ]
    },

    // ===== 34. 요청자 협업 평가서 =====
    {
        id: 'sample_eval_002',
        name: '📝 [평가] 요청자 협업 평가서',
        description: '개발 요청자의 협업 역량과 요구사항 품질을 평가합니다.',
        category: '평가',
        formTitle: '요청자 협업 평가서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'eval2_1', type: 'section-header', label: '섹션 제목', text: '👤 평가 대상 정보', colSpan: 'full' },
            { id: 'eval2_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'eval2_3', type: 'project-select', label: '관련 프로젝트', required: true, options: ['프로젝트 A', '프로젝트 B', '프로젝트 C'], colSpan: 1 },
            { id: 'eval2_4', type: 'date-range', label: '협업 기간', required: true, colSpan: 1 },
            { id: 'eval2_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'eval2_6', type: 'section-header', label: '섹션 제목', text: '📋 요구사항 품질', colSpan: 'full' },
            { id: 'eval2_7', type: 'requirement-quality', label: '요구사항 품질 평가', criteria: [{ name: '명확성', score: 0 }, { name: '완전성', score: 0 }, { name: '일관성', score: 0 }, { name: '실현 가능성', score: 0 }, { name: '우선순위 적절성', score: 0 }], colSpan: 'full' },
            { id: 'eval2_8', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'eval2_9', type: 'section-header', label: '섹션 제목', text: '💬 커뮤니케이션', colSpan: 'full' },
            { id: 'eval2_10', type: 'communication-eval', label: '커뮤니케이션 평가', aspects: [{ name: '요구사항 전달력', score: 0 }, { name: '피드백 적시성', score: 0 }, { name: '협조도', score: 0 }, { name: '의사결정 속도', score: 0 }, { name: '변경 관리', score: 0 }], colSpan: 'full' },
            { id: 'eval2_11', type: 'stakeholder-engagement', label: '참여도 지표', metrics: [{ name: '회의 참석률', value: 0, unit: '%' }, { name: '피드백 응답 시간', value: 0, unit: '일' }, { name: '요구사항 변경 횟수', value: 0, unit: '회' }, { name: '승인 처리 시간', value: 0, unit: '일' }], colSpan: 'full' },
            { id: 'eval2_12', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'eval2_13', type: 'section-header', label: '섹션 제목', text: '💰 비즈니스 가치', colSpan: 'full' },
            { id: 'eval2_14', type: 'business-value-assessment', label: '비즈니스 가치 평가', factors: [{ name: '매출 기여도', score: 0, weight: 25 }, { name: '비용 절감', score: 0, weight: 25 }, { name: '고객 만족도', score: 0, weight: 25 }, { name: '전략적 중요도', score: 0, weight: 25 }], colSpan: 'full' },
            { id: 'eval2_15', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'eval2_16', type: 'section-header', label: '섹션 제목', text: '💬 종합 의견', colSpan: 'full' },
            { id: 'eval2_17', type: 'satisfaction-survey', label: '협업 만족도', questions: [{ question: '요구사항 전달', score: 0 }, { question: '일정 협의', score: 0 }, { question: '피드백 품질', score: 0 }], colSpan: 'full' },
            { id: 'eval2_18', type: 'feedback-section', label: '종합 피드백', categories: [{ type: 'strength', label: '강점', content: '' }, { type: 'improvement', label: '개선 필요 사항', content: '' }, { type: 'goal', label: '향후 협업 방안', content: '' }], colSpan: 'full' }
        ]
    },

    // ===== 35. 스프린트 회고 보고서 =====
    {
        id: 'sample_agile_001',
        name: '🔄 [애자일] 스프린트 회고 보고서',
        description: '스프린트 완료 후 팀 회고를 정리하는 보고서입니다.',
        category: '애자일',
        formTitle: '스프린트 회고 보고서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'agile1_1', type: 'section-header', label: '섹션 제목', text: '📋 스프린트 정보', colSpan: 'full' },
            { id: 'agile1_2', type: 'text-input', label: '스프린트명', placeholder: 'Sprint 1', required: true, colSpan: 1 },
            { id: 'agile1_3', type: 'date-range', label: '스프린트 기간', required: true, colSpan: 1 },
            { id: 'agile1_4', type: 'team-member-select', label: '참여 팀원', required: true, multiple: true, colSpan: 'full' },
            { id: 'agile1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'agile1_6', type: 'section-header', label: '섹션 제목', text: '📊 스프린트 성과', colSpan: 'full' },
            { id: 'agile1_7', type: 'sprint-velocity', label: '스프린트 속도', sprints: [{ name: 'Sprint -2', planned: 0, completed: 0 }, { name: 'Sprint -1', planned: 0, completed: 0 }, { name: '이번 Sprint', planned: 0, completed: 0 }], colSpan: 'full' },
            { id: 'agile1_8', type: 'checklist', label: '스프린트 목표 달성', items: ['목표 1', '목표 2', '목표 3', '목표 4', '목표 5'], colSpan: 'full' },
            { id: 'agile1_9', type: 'defect-density', label: '발견된 버그', metrics: [{ name: '심각', count: 0, color: '#ef4444' }, { name: '높음', count: 0, color: '#f97316' }, { name: '보통', count: 0, color: '#eab308' }, { name: '낮음', count: 0, color: '#22c55e' }], colSpan: 'full' },
            { id: 'agile1_10', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'agile1_11', type: 'section-header', label: '섹션 제목', text: '💡 회고', colSpan: 'full' },
            { id: 'agile1_12', type: 'lesson-learned', label: '스프린트 회고', categories: [{ type: 'success', label: '잘한 점 (Keep)', items: [] }, { type: 'improve', label: '개선할 점 (Problem)', items: [] }, { type: 'action', label: '시도할 것 (Try)', items: [] }], colSpan: 'full' },
            { id: 'agile1_13', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'agile1_14', type: 'section-header', label: '섹션 제목', text: '🎯 다음 스프린트', colSpan: 'full' },
            { id: 'agile1_15', type: 'table-input', label: '다음 스프린트 계획', columns: ['우선순위', '작업 항목', '담당자', '예상 포인트'], rows: 5, colSpan: 'full' },
            { id: 'agile1_16', type: 'number-input', label: '목표 스토리 포인트', placeholder: '0', required: true, min: 0, max: 100, colSpan: 1 },
            { id: 'agile1_17', type: 'deadline-input', label: '다음 스프린트 시작일', required: true, includeTime: false, colSpan: 1 }
        ]
    },

    // ===== 36. 외주 개발 계약 요청서 =====
    {
        id: 'sample_contract_001',
        name: '📄 [계약] 외주 개발 계약 요청서',
        description: '외주 개발 업체와의 계약을 위한 요청서입니다.',
        category: '계약',
        formTitle: '외주 개발 계약 요청서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'cont1_1', type: 'section-header', label: '섹션 제목', text: '📌 요청 정보', colSpan: 'full' },
            { id: 'cont1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'cont1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['개발팀', '기획팀', '마케팅팀', '영업팀'], colSpan: 1 },
            { id: 'cont1_4', type: 'date-input', label: '요청일', required: true, colSpan: 1 },
            { id: 'cont1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'cont1_6', type: 'section-header', label: '섹션 제목', text: '🏢 외주 업체 정보', colSpan: 'full' },
            { id: 'cont1_7', type: 'text-input', label: '업체명', placeholder: '외주 업체명', required: true, colSpan: 1 },
            { id: 'cont1_8', type: 'text-input', label: '담당자', placeholder: '업체 담당자명', required: true, colSpan: 1 },
            { id: 'cont1_9', type: 'phone-input', label: '연락처', placeholder: '010-0000-0000', required: true, colSpan: 1 },
            { id: 'cont1_10', type: 'email-input', label: '이메일', placeholder: 'example@company.com', required: true, colSpan: 1 },
            { id: 'cont1_11', type: 'address-input', label: '업체 주소', required: false, colSpan: 'full' },
            { id: 'cont1_12', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'cont1_13', type: 'section-header', label: '섹션 제목', text: '📋 계약 내용', colSpan: 'full' },
            { id: 'cont1_14', type: 'text-input', label: '프로젝트명', placeholder: '외주 프로젝트명', required: true, colSpan: 'full' },
            { id: 'cont1_15', type: 'rich-text', label: '개발 범위', required: true, colSpan: 'full' },
            { id: 'cont1_16', type: 'date-range', label: '계약 기간', required: true, colSpan: 'full' },
            { id: 'cont1_17', type: 'budget-breakdown', label: '계약 금액', items: [{ category: '착수금', amount: 0 }, { category: '중도금', amount: 0 }, { category: '잔금', amount: 0 }, { category: '유지보수', amount: 0 }], colSpan: 'full' },
            { id: 'cont1_18', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'cont1_19', type: 'section-header', label: '섹션 제목', text: '📎 첨부 서류', colSpan: 'full' },
            { id: 'cont1_20', type: 'checklist', label: '제출 서류 확인', items: ['사업자등록증', '견적서', '포트폴리오', '개인정보처리위탁계약서', '보안서약서'], colSpan: 'full' },
            { id: 'cont1_21', type: 'file-upload', label: '첨부 파일', accept: '*', multiple: true, required: true, colSpan: 'full' },
            { id: 'cont1_22', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'cont1_23', type: 'section-header', label: '섹션 제목', text: '✍️ 서명', colSpan: 'full' },
            { id: 'cont1_24', type: 'signature-pad', label: '요청자 서명', required: true, colSpan: 1 },
            { id: 'cont1_25', type: 'signature-pad', label: '부서장 서명', required: true, colSpan: 1 },
            { id: 'cont1_26', type: 'approval-flow', label: '승인 라인', steps: [{ title: '검토', role: '팀장' }, { title: '법무 검토', role: '법무팀' }, { title: '최종 승인', role: '본부장' }], colSpan: 'full' }
        ]
    },

    // ===== 37. 기술 도입 검토서 =====
    {
        id: 'sample_tech_001',
        name: '🔬 [기술] 신기술 도입 검토서',
        description: '새로운 기술/도구 도입 시 검토하는 양식입니다.',
        category: '기술',
        formTitle: '신기술 도입 검토서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'tech1_1', type: 'section-header', label: '섹션 제목', text: '📌 검토 요청 정보', colSpan: 'full' },
            { id: 'tech1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'tech1_3', type: 'date-input', label: '요청일', required: true, colSpan: 1 },
            { id: 'tech1_4', type: 'priority-select', label: '긴급도', required: true, defaultValue: 'medium', colSpan: 1 },
            { id: 'tech1_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'tech1_6', type: 'section-header', label: '섹션 제목', text: '🔧 도입 기술 정보', colSpan: 'full' },
            { id: 'tech1_7', type: 'text-input', label: '기술/도구명', placeholder: '예: React 18, Kubernetes', required: true, colSpan: 1 },
            { id: 'tech1_8', type: 'version-input', label: '버전', placeholder: '1.0.0', required: false, colSpan: 1 },
            { id: 'tech1_9', type: 'select', label: '기술 분류', required: true, options: ['프레임워크', '라이브러리', '데이터베이스', '클라우드 서비스', '개발 도구', '모니터링', '보안', '기타'], colSpan: 1 },
            { id: 'tech1_10', type: 'link-input', label: '공식 문서 URL', placeholder: 'https://...', required: false, colSpan: 1 },
            { id: 'tech1_11', type: 'textarea', label: '도입 배경', placeholder: '왜 이 기술을 도입하려고 하는지 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'tech1_12', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'tech1_13', type: 'section-header', label: '섹션 제목', text: '📊 기술 평가', colSpan: 'full' },
            { id: 'tech1_14', type: 'competency-matrix', label: '기술 성숙도 평가', competencies: [{ name: '커뮤니티 활성도', levels: [false, false, false, false, false] }, { name: '문서화 수준', levels: [false, false, false, false, false] }, { name: '보안 안정성', levels: [false, false, false, false, false] }, { name: '학습 곡선', levels: [false, false, false, false, false] }], levelLabels: ['1', '2', '3', '4', '5'], colSpan: 'full' },
            { id: 'tech1_15', type: 'risk-assessment', label: '도입 리스크', risks: [{ name: '학습 비용', probability: 0, impact: 0 }, { name: '기존 시스템 호환성', probability: 0, impact: 0 }, { name: '유지보수 부담', probability: 0, impact: 0 }, { name: '벤더 종속성', probability: 0, impact: 0 }], colSpan: 'full' },
            { id: 'tech1_16', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'tech1_17', type: 'section-header', label: '섹션 제목', text: '💰 비용 분석', colSpan: 'full' },
            { id: 'tech1_18', type: 'budget-breakdown', label: '예상 비용', items: [{ category: '라이선스', amount: 0 }, { category: '교육', amount: 0 }, { category: '인프라', amount: 0 }, { category: '마이그레이션', amount: 0 }], colSpan: 'full' },
            { id: 'tech1_19', type: 'roi-calculator', label: 'ROI 분석', inputs: { investment: 0, benefit: 0, period: 12 }, colSpan: 'full' },
            { id: 'tech1_20', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'tech1_21', type: 'section-header', label: '섹션 제목', text: '🎯 적용 계획', colSpan: 'full' },
            { id: 'tech1_22', type: 'environment-select', label: '적용 환경', options: ['개발', '스테이징', '운영', '전체'], required: true, colSpan: 'full' },
            { id: 'tech1_23', type: 'milestone-tracker', label: '도입 일정', milestones: [{ name: 'PoC', dueDate: '', status: 'pending' }, { name: '파일럿', dueDate: '', status: 'pending' }, { name: '전체 적용', dueDate: '', status: 'pending' }], colSpan: 'full' },
            { id: 'tech1_24', type: 'approval-flow', label: '승인 라인', steps: [{ title: '기술 검토', role: 'Tech Lead' }, { title: '보안 검토', role: '보안팀' }, { title: '최종 승인', role: 'CTO' }], colSpan: 'full' }
        ]
    },

    // ===== 38. 릴리스 체크리스트 =====
    {
        id: 'sample_release_001',
        name: '🚀 [배포] 릴리스 체크리스트',
        description: '운영 배포 전 확인해야 할 체크리스트입니다.',
        category: '배포',
        formTitle: '릴리스 체크리스트',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'rel1_1', type: 'section-header', label: '섹션 제목', text: '📋 릴리스 정보', colSpan: 'full' },
            { id: 'rel1_2', type: 'project-select', label: '프로젝트', required: true, options: ['프로젝트 A', '프로젝트 B', '프로젝트 C'], colSpan: 1 },
            { id: 'rel1_3', type: 'version-input', label: '릴리스 버전', placeholder: '1.0.0', required: true, colSpan: 1 },
            { id: 'rel1_4', type: 'deadline-input', label: '배포 예정 일시', required: true, includeTime: true, colSpan: 1 },
            { id: 'rel1_5', type: 'environment-select', label: '배포 환경', options: ['개발', '스테이징', '운영', '전체'], required: true, colSpan: 1 },
            { id: 'rel1_6', type: 'team-member-select', label: '배포 담당자', required: true, multiple: false, colSpan: 1 },
            { id: 'rel1_7', type: 'status-select', label: '배포 상태', options: ['대기', '진행중', '검토중', '완료', '보류', '취소'], required: true, colSpan: 1 },
            { id: 'rel1_8', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'rel1_9', type: 'section-header', label: '섹션 제목', text: '✅ 배포 전 체크리스트', colSpan: 'full' },
            { id: 'rel1_10', type: 'checklist', label: '코드 검토', items: ['코드 리뷰 완료', 'PR 승인 완료', '컨플릭트 해결', '코딩 컨벤션 준수', '주석 및 문서화'], colSpan: 'full' },
            { id: 'rel1_11', type: 'checklist', label: '테스트', items: ['단위 테스트 통과', '통합 테스트 통과', 'E2E 테스트 통과', '성능 테스트 완료', '보안 테스트 완료'], colSpan: 'full' },
            { id: 'rel1_12', type: 'checklist', label: '배포 준비', items: ['환경 변수 확인', 'DB 마이그레이션 준비', '롤백 계획 수립', '모니터링 알림 설정', '관련 부서 공지'], colSpan: 'full' },
            { id: 'rel1_13', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'rel1_14', type: 'section-header', label: '섹션 제목', text: '📝 변경 사항', colSpan: 'full' },
            { id: 'rel1_15', type: 'table-input', label: '주요 변경 사항', columns: ['유형', '내용', '영향 범위', '담당자'], rows: 5, colSpan: 'full' },
            { id: 'rel1_16', type: 'scope-change-log', label: '범위 변경 이력', changes: [], colSpan: 'full' },
            { id: 'rel1_17', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'rel1_18', type: 'section-header', label: '섹션 제목', text: '⚠️ 롤백 계획', colSpan: 'full' },
            { id: 'rel1_19', type: 'textarea', label: '롤백 절차', placeholder: '문제 발생 시 롤백 절차를 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'rel1_20', type: 'time-estimate', label: '예상 롤백 소요 시간', required: false, colSpan: 1 },
            { id: 'rel1_21', type: 'team-member-select', label: '롤백 담당자', required: true, multiple: false, colSpan: 1 },
            { id: 'rel1_22', type: 'approval-flow', label: '승인 라인', steps: [{ title: 'QA 승인', role: 'QA Lead' }, { title: '기술 승인', role: 'Tech Lead' }, { title: '최종 승인', role: '부서장' }], colSpan: 'full' }
        ]
    },

    // ===== 39. 보안 취약점 보고서 =====
    {
        id: 'sample_security_002',
        name: '🔐 [보안] 취약점 보고서',
        description: '발견된 보안 취약점을 보고하고 조치 계획을 수립합니다.',
        category: '보안',
        formTitle: '보안 취약점 보고서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'sec2_1', type: 'section-header', label: '섹션 제목', text: '🚨 취약점 발견 정보', colSpan: 'full' },
            { id: 'sec2_2', type: 'requester-info', label: '보고자 정보', colSpan: 'full' },
            { id: 'sec2_3', type: 'date-input', label: '발견 일자', required: true, colSpan: 1 },
            { id: 'sec2_4', type: 'select', label: '발견 경로', required: true, options: ['정기 점검', '모의 해킹', '버그 바운티', '내부 발견', '외부 제보', '자동 스캔'], colSpan: 1 },
            { id: 'sec2_5', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'sec2_6', type: 'section-header', label: '섹션 제목', text: '🔍 취약점 상세', colSpan: 'full' },
            { id: 'sec2_7', type: 'text-input', label: '취약점명', placeholder: 'CVE-XXXX-XXXX 또는 취약점 이름', required: true, colSpan: 'full' },
            { id: 'sec2_8', type: 'select', label: '취약점 유형', required: true, options: ['SQL Injection', 'XSS', 'CSRF', '인증 우회', '권한 상승', '정보 노출', '서비스 거부', '기타'], colSpan: 1 },
            { id: 'sec2_9', type: 'impact-level', label: '심각도', required: true, defaultValue: '', colSpan: 1 },
            { id: 'sec2_10', type: 'textarea', label: '취약점 설명', placeholder: '취약점에 대해 상세히 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'sec2_11', type: 'rich-text', label: '재현 방법', required: true, colSpan: 'full' },
            { id: 'sec2_12', type: 'image-upload', label: '증빙 자료', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'sec2_13', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'sec2_14', type: 'section-header', label: '섹션 제목', text: '📊 영향 분석', colSpan: 'full' },
            { id: 'sec2_15', type: 'checkbox', label: '영향 받는 시스템', options: ['웹 서버', 'API 서버', '데이터베이스', '인증 시스템', '파일 서버', '관리자 시스템'], colSpan: 'full' },
            { id: 'sec2_16', type: 'risk-assessment', label: '리스크 평가', risks: [{ name: '데이터 유출', probability: 0, impact: 0 }, { name: '서비스 중단', probability: 0, impact: 0 }, { name: '권한 탈취', probability: 0, impact: 0 }], colSpan: 'full' },
            { id: 'sec2_17', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'sec2_18', type: 'section-header', label: '섹션 제목', text: '🛠️ 조치 계획', colSpan: 'full' },
            { id: 'sec2_19', type: 'textarea', label: '권장 조치 사항', placeholder: '취약점 해결을 위한 권장 조치 사항을 작성해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'sec2_20', type: 'milestone-tracker', label: '조치 일정', milestones: [{ name: '임시 조치', dueDate: '', status: 'pending' }, { name: '근본 조치', dueDate: '', status: 'pending' }, { name: '검증', dueDate: '', status: 'pending' }, { name: '완료', dueDate: '', status: 'pending' }], colSpan: 'full' },
            { id: 'sec2_21', type: 'team-member-select', label: '조치 담당자', required: true, multiple: true, colSpan: 'full' },
            { id: 'sec2_22', type: 'approval-flow', label: '보고 라인', steps: [{ title: '접수', role: '보안팀' }, { title: '분석', role: '보안 분석가' }, { title: '조치', role: '담당 개발팀' }, { title: '검증', role: '보안팀장' }], colSpan: 'full' }
        ]
    },

    // ===== 40. 고객 피드백 분석 보고서 =====
    {
        id: 'sample_feedback_001',
        name: '📣 [피드백] 고객 피드백 분석 보고서',
        description: '고객 피드백을 수집하고 분석하여 개선 방안을 도출합니다.',
        category: '피드백',
        formTitle: '고객 피드백 분석 보고서',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        components: [
            { id: 'fb1_1', type: 'section-header', label: '섹션 제목', text: '📋 분석 개요', colSpan: 'full' },
            { id: 'fb1_2', type: 'requester-info', label: '작성자 정보', colSpan: 'full' },
            { id: 'fb1_3', type: 'date-range', label: '분석 기간', required: true, colSpan: 'full' },
            { id: 'fb1_4', type: 'project-select', label: '대상 서비스', required: true, options: ['웹 서비스', '모바일 앱', '관리자 시스템', '전체'], colSpan: 1 },
            { id: 'fb1_5', type: 'number-input', label: '총 피드백 수', placeholder: '0', required: true, min: 0, max: 99999, colSpan: 1 },
            { id: 'fb1_6', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fb1_7', type: 'section-header', label: '섹션 제목', text: '📊 만족도 분석', colSpan: 'full' },
            { id: 'fb1_8', type: 'satisfaction-survey', label: '영역별 만족도', questions: [{ question: '전체 만족도', score: 0 }, { question: 'UI/UX', score: 0 }, { question: '성능', score: 0 }, { question: '기능', score: 0 }, { question: '고객 지원', score: 0 }], colSpan: 'full' },
            { id: 'fb1_9', type: 'kpi-tracker', label: 'NPS 추적', kpis: [{ name: '추천 고객', target: 100, current: 0, unit: '%' }, { name: '중립 고객', target: 100, current: 0, unit: '%' }, { name: '비추천 고객', target: 100, current: 0, unit: '%' }], colSpan: 'full' },
            { id: 'fb1_10', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fb1_11', type: 'section-header', label: '섹션 제목', text: '🔍 주요 피드백', colSpan: 'full' },
            { id: 'fb1_12', type: 'table-input', label: '긍정적 피드백 Top 5', columns: ['순위', '내용', '빈도', '관련 기능'], rows: 5, colSpan: 'full' },
            { id: 'fb1_13', type: 'table-input', label: '개선 요청 Top 5', columns: ['순위', '내용', '빈도', '긴급도'], rows: 5, colSpan: 'full' },
            { id: 'fb1_14', type: 'defect-density', label: '이슈 유형별 분포', metrics: [{ name: '버그', count: 0, color: '#ef4444' }, { name: 'UX 개선', count: 0, color: '#f97316' }, { name: '기능 요청', count: 0, color: '#3b82f6' }, { name: '성능', count: 0, color: '#8b5cf6' }], colSpan: 'full' },
            { id: 'fb1_15', type: 'divider', label: '구분선', colSpan: 'full' },
            { id: 'fb1_16', type: 'section-header', label: '섹션 제목', text: '🎯 개선 계획', colSpan: 'full' },
            { id: 'fb1_17', type: 'lesson-learned', label: '분석 결과', categories: [{ type: 'success', label: '강점', items: [] }, { type: 'improve', label: '개선 필요', items: [] }, { type: 'action', label: '조치 계획', items: [] }], colSpan: 'full' },
            { id: 'fb1_18', type: 'milestone-tracker', label: '개선 로드맵', milestones: [{ name: '단기 개선 (1개월)', dueDate: '', status: 'pending' }, { name: '중기 개선 (3개월)', dueDate: '', status: 'pending' }, { name: '장기 개선 (6개월)', dueDate: '', status: 'pending' }], colSpan: 'full' },
            { id: 'fb1_19', type: 'business-value-assessment', label: '개선 효과 예측', factors: [{ name: '고객 만족도 향상', score: 0, weight: 30 }, { name: '이탈률 감소', score: 0, weight: 30 }, { name: '매출 증가', score: 0, weight: 20 }, { name: '브랜드 가치', score: 0, weight: 20 }], colSpan: 'full' },
            { id: 'fb1_20', type: 'approval-flow', label: '보고 라인', steps: [{ title: '분석', role: 'CS팀' }, { title: '검토', role: '기획팀' }, { title: '승인', role: '서비스 담당자' }], colSpan: 'full' }
        ]
    }
];

// Grid columns
let gridColumns = 2;

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initFormBuilder();
});

function initFormBuilder() {
    // Only initialize if form builder page or view exists
    const formBuilderPage = document.body.classList.contains('form-builder-page');
    const formBuilderView = document.getElementById('form-builder-view');
    
    if (!formBuilderPage && !formBuilderView) return;
    
    // Initialize theme
    initTheme();
    
    // Render template showcase
    renderTemplateShowcase();
    
    // 기본 컴포넌트로 캔버스 초기화 (제목 + 결재라인)
    if (formComponents.length === 0) {
        initializeDefaultComponents();
        renderCanvas();
    }
    
    setupPaletteDragAndDrop();
    setupCanvasDragAndDrop();
    setupModalHandlers();
    setupPaletteSearch();
    setupKeyboardShortcuts();
    setupResizeHandlers();
    setupPanelTabs();
    setupGridColumnSelector();
}

// ===== Template Showcase =====
function renderTemplateShowcase() {
    const mainGrid = document.getElementById('mainTemplatesGrid');
    const subGrid = document.getElementById('subTemplatesGrid');
    
    if (!mainGrid || !subGrid) return;
    
    // 추천 템플릿 10개 (가로 1줄)
    const mainTemplates = sampleTemplates.slice(0, 10);
    // 기타 템플릿 (나머지 모두)
    const subTemplates = sampleTemplates.slice(10);
    
    // 카테고리별 아이콘 매핑
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
    
    // 카테고리 순서
    const categoryOrder = ['DBA', 'Frontend', 'Backend', 'Infra', '공통', 'QA', '보안', '기획'];
    
    // 추천 템플릿 렌더링
    mainGrid.innerHTML = mainTemplates.map(template => {
        const icon = categoryIcons[template.category] || '📄';
        const shortName = template.name.replace(/\[.*?\]\s*/, '').replace(/^[^\s]+\s*/, '');
        return `
            <div class="template-card" data-template-id="${template.id}" onclick="loadTemplateFromShowcase('${template.id}')">
                <span class="template-card-icon">${icon}</span>
                <span class="template-card-name">${shortName}</span>
                <span class="template-card-category">${template.category}</span>
            </div>
        `;
    }).join('');
    
    // 기타 템플릿을 카테고리별로 그룹화
    const groupedTemplates = {};
    subTemplates.forEach(template => {
        if (!groupedTemplates[template.category]) {
            groupedTemplates[template.category] = [];
        }
        groupedTemplates[template.category].push(template);
    });
    
    // 카테고리별로 정렬하여 렌더링
    let subGridHTML = '';
    categoryOrder.forEach(category => {
        if (groupedTemplates[category] && groupedTemplates[category].length > 0) {
            const icon = categoryIcons[category] || '📄';
            subGridHTML += `
                <div class="template-category-section">
                    <div class="template-category-header">
                        <span class="template-category-icon">${icon}</span>
                        <span class="template-category-name">${category}</span>
                        <span class="template-category-count">${groupedTemplates[category].length}개</span>
                    </div>
                    <div class="template-category-items">
                        ${groupedTemplates[category].map(template => {
                            const shortName = template.name.replace(/\[.*?\]\s*/, '').replace(/^[^\s]+\s*/, '');
                            return `
                                <div class="template-card" data-template-id="${template.id}" onclick="loadTemplateFromShowcase('${template.id}')">
                                    <span class="template-card-icon">${icon}</span>
                                    <span class="template-card-name">${shortName}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    subGrid.innerHTML = subGridHTML;
    
    // 개수 업데이트
    const mainCount = document.getElementById('mainTemplateCount');
    const subCount = document.getElementById('subTemplateCount');
    if (mainCount) mainCount.textContent = `${mainTemplates.length}개`;
    if (subCount) subCount.textContent = `${subTemplates.length}개`;
}

function toggleSubTemplates() {
    const subGrid = document.getElementById('subTemplatesGrid');
    const toggleBtn = document.querySelector('.toggle-templates-btn');
    const toggleText = document.getElementById('toggleSubText');
    
    if (!subGrid || !toggleBtn) return;
    
    const isCollapsed = subGrid.classList.contains('collapsed');
    
    if (isCollapsed) {
        subGrid.classList.remove('collapsed');
        toggleBtn.classList.add('expanded');
        if (toggleText) toggleText.textContent = '접기';
    } else {
        subGrid.classList.add('collapsed');
        toggleBtn.classList.remove('expanded');
        if (toggleText) toggleText.textContent = '펼치기';
    }
}

function loadTemplateFromShowcase(templateId) {
    const template = sampleTemplates.find(t => t.id === templateId);
    if (!template) {
        showToast('템플릿을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 기존 컴포넌트가 있으면 확인
    if (formComponents.length > 0) {
        if (!confirm('현재 작성 중인 내용이 있습니다. 템플릿을 불러오면 기존 내용이 사라집니다. 계속하시겠습니까?')) {
            return;
        }
    }
    
    // 템플릿 로드
    formComponents = template.components.map(comp => ({
        ...JSON.parse(JSON.stringify(comp)),
        id: generateId()
    }));
    
    // 폼 제목 설정
    const formTitleInput = document.getElementById('formTitle');
    if (formTitleInput) {
        formTitleInput.value = template.formTitle || template.name;
    }
    
    // 선택 표시 업데이트
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('active');
    });
    const selectedCard = document.querySelector(`.template-card[data-template-id="${templateId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // 캔버스 렌더링
    renderCanvas();
    selectedComponentId = null;
    renderPropertiesPanel();
    
    showToast(`'${template.formTitle || template.name}' 템플릿을 불러왔습니다.`, 'success');
}

function updateGridColumns() {
    const select = document.getElementById('gridColumns');
    if (select) {
        gridColumns = parseInt(select.value);
        const canvas = document.getElementById('formCanvas');
        if (canvas) {
            canvas.setAttribute('data-columns', gridColumns);
        }
        renderCanvas();
    }
}

function setupGridColumnSelector() {
    const select = document.getElementById('gridColumns');
    if (select) {
        select.value = gridColumns.toString();
    }
}

// ===== Palette Functions =====
function setupPaletteDragAndDrop() {
    const paletteItems = document.querySelectorAll('.palette-item');
    
    paletteItems.forEach(item => {
        item.addEventListener('dragstart', handlePaletteDragStart);
        item.addEventListener('dragend', handlePaletteDragEnd);
    });
}

function handlePaletteDragStart(e) {
    draggedFromPalette = true;
    draggedComponent = e.target.dataset.component;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', draggedComponent);
}

function handlePaletteDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedFromPalette = false;
    draggedComponent = null;
}

function togglePaletteSection(header) {
    const section = header.parentElement;
    section.classList.toggle('collapsed');
}

function setupPaletteSearch() {
    const searchInput = document.getElementById('paletteSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.palette-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.classList.toggle('hidden', !text.includes(query));
        });
    });
}

// ===== Canvas Drag and Drop =====
function setupCanvasDragAndDrop() {
    const canvas = document.getElementById('formCanvas');
    if (!canvas) return;
    
    canvas.addEventListener('dragover', handleCanvasDragOver);
    canvas.addEventListener('dragleave', handleCanvasDragLeave);
    canvas.addEventListener('drop', handleCanvasDrop);
    canvas.addEventListener('click', handleCanvasClick);
}

function handleCanvasDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedFromPalette ? 'copy' : 'move';
    
    const canvas = document.getElementById('formCanvas');
    canvas.classList.add('drag-over');
    
    const afterElement = getDragAfterElement(canvas, e.clientY);
    const indicator = document.querySelector('.drop-indicator');
    
    if (!indicator) {
        const newIndicator = document.createElement('div');
        newIndicator.className = 'drop-indicator';
        
        if (afterElement) {
            canvas.insertBefore(newIndicator, afterElement);
        } else {
            canvas.appendChild(newIndicator);
        }
    } else {
        if (afterElement) {
            canvas.insertBefore(indicator, afterElement);
        } else {
            canvas.appendChild(indicator);
        }
    }
}

function handleCanvasDragLeave(e) {
    const canvas = document.getElementById('formCanvas');
    if (!canvas.contains(e.relatedTarget)) {
        canvas.classList.remove('drag-over');
        removeDropIndicator();
    }
}

function handleCanvasDrop(e) {
    e.preventDefault();
    const canvas = document.getElementById('formCanvas');
    canvas.classList.remove('drag-over');
    removeDropIndicator();
    
    if (draggedFromPalette && draggedComponent) {
        const afterElement = getDragAfterElement(canvas, e.clientY);
        const newComponent = createComponent(draggedComponent);
        
        saveToUndoStack();
        
        if (afterElement) {
            const afterIndex = formComponents.findIndex(c => c.id === afterElement.dataset.id);
            formComponents.splice(afterIndex, 0, newComponent);
        } else {
            formComponents.push(newComponent);
        }
        
        renderCanvas();
        selectComponent(newComponent.id);
        showToast('컴포넌트가 추가되었습니다.', 'success');
    }
}

function handleCanvasClick(e) {
    const componentEl = e.target.closest('.canvas-component');
    
    if (componentEl) {
        selectComponent(componentEl.dataset.id);
    } else if (e.target.id === 'formCanvas' || e.target.classList.contains('canvas-placeholder')) {
        deselectComponent();
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.canvas-component:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function removeDropIndicator() {
    const indicator = document.querySelector('.drop-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// ===== Resize Handlers =====
function setupResizeHandlers() {
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
}

function handleResizeStart(e, componentId, handle) {
    e.preventDefault();
    e.stopPropagation();
    
    isResizing = true;
    resizeComponent = componentId;
    resizeHandle = handle;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    
    const component = formComponents.find(c => c.id === componentId);
    const element = document.querySelector(`[data-id="${componentId}"]`);
    
    if (component && element) {
        resizeStartWidth = component.colSpan === 'full' ? gridColumns : (component.colSpan || 1);
        resizeStartHeight = element.offsetHeight;
        element.classList.add('resizing');
    }
}

function handleResizeMove(e) {
    if (!isResizing) return;
    
    const component = formComponents.find(c => c.id === resizeComponent);
    const element = document.querySelector(`[data-id="${resizeComponent}"]`);
    
    if (!component || !element) return;
    
    const canvas = document.getElementById('formCanvas');
    const cellWidth = canvas.offsetWidth / gridColumns;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaY = e.clientY - resizeStartY;
    
    if (resizeHandle === 'e' || resizeHandle === 'se') {
        const newColSpan = Math.max(1, Math.min(gridColumns, Math.round(resizeStartWidth + deltaX / cellWidth)));
        component.colSpan = newColSpan >= gridColumns ? 'full' : newColSpan;
        element.setAttribute('data-col-span', component.colSpan);
        
        // Update size indicator
        const indicator = element.querySelector('.size-indicator');
        if (indicator) {
            indicator.textContent = component.colSpan === 'full' ? '전체' : `${component.colSpan}/${gridColumns}`;
        }
    }
    
    if (resizeHandle === 's' || resizeHandle === 'se') {
        const newHeight = Math.max(60, resizeStartHeight + deltaY);
        component.minHeight = newHeight;
        element.style.minHeight = `${newHeight}px`;
    }
}

function handleResizeEnd() {
    if (!isResizing) return;
    
    const element = document.querySelector(`[data-id="${resizeComponent}"]`);
    if (element) {
        element.classList.remove('resizing');
    }
    
    isResizing = false;
    resizeComponent = null;
    resizeHandle = null;
    
    renderCanvas();
    renderPropertiesPanel();
}

// ===== Component Management =====
function createComponent(type) {
    const definition = componentDefinitions[type];
    return {
        id: generateComponentId(),
        ...JSON.parse(JSON.stringify(definition))
    };
}

function generateComponentId() {
    return 'comp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function selectComponent(componentId) {
    selectedComponentId = componentId;
    
    document.querySelectorAll('.canvas-component').forEach(el => {
        el.classList.toggle('selected', el.dataset.id === componentId);
    });
    
    renderPropertiesPanel();
}

function deselectComponent() {
    selectedComponentId = null;
    document.querySelectorAll('.canvas-component').forEach(el => {
        el.classList.remove('selected');
    });
    renderPropertiesPanel();
}

function deleteComponent(componentId) {
    saveToUndoStack();
    formComponents = formComponents.filter(c => c.id !== componentId);
    
    if (selectedComponentId === componentId) {
        deselectComponent();
    }
    
    renderCanvas();
    showToast('컴포넌트가 삭제되었습니다.', 'info');
}

function duplicateComponent(componentId) {
    const component = formComponents.find(c => c.id === componentId);
    if (component) {
        saveToUndoStack();
        const newComponent = {
            ...JSON.parse(JSON.stringify(component)),
            id: generateComponentId()
        };
        
        const index = formComponents.findIndex(c => c.id === componentId);
        formComponents.splice(index + 1, 0, newComponent);
        
        renderCanvas();
        selectComponent(newComponent.id);
        showToast('컴포넌트가 복제되었습니다.', 'success');
    }
}

function moveComponent(componentId, direction) {
    const index = formComponents.findIndex(c => c.id === componentId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formComponents.length) return;
    
    saveToUndoStack();
    const temp = formComponents[index];
    formComponents[index] = formComponents[newIndex];
    formComponents[newIndex] = temp;
    
    renderCanvas();
    
    // Re-select component visually
    selectedComponentId = componentId;
    const componentEl = document.querySelector(`.canvas-component[data-id="${componentId}"]`);
    if (componentEl) {
        document.querySelectorAll('.canvas-component').forEach(el => el.classList.remove('selected'));
        componentEl.classList.add('selected');
    }
}

// ===== Canvas Rendering =====
function renderCanvas() {
    const canvas = document.getElementById('formCanvas');
    if (!canvas) return;
    
    // Ensure grid columns attribute is set
    canvas.setAttribute('data-columns', gridColumns);
    
    if (formComponents.length === 0) {
        canvas.innerHTML = `
            <div class="canvas-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M12 8v8M8 12h8"/>
                </svg>
                <p>컴포넌트를 여기에 드래그하여 요청서를 만드세요</p>
                <span class="canvas-hint">한 행에 여러 컴포넌트를 배치할 수 있습니다</span>
            </div>
        `;
        canvas.classList.remove('has-items');
    } else {
        // 컴포넌트들 + 하단 드롭 힌트 영역
        const componentsHtml = formComponents.map(comp => renderComponent(comp)).join('');
        const dropHintHtml = `
            <div class="canvas-drop-hint" 
                 ondragover="handleDropHintDragOver(event)" 
                 ondragleave="handleDropHintDragLeave(event)"
                 ondrop="handleDropHintDrop(event)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M12 8v8M8 12h8"/>
                </svg>
                <p>컴포넌트를 여기에 드롭하세요</p>
                <span class="hint-text">새 컴포넌트가 맨 아래에 추가됩니다</span>
            </div>
        `;
        canvas.innerHTML = componentsHtml + dropHintHtml;
        canvas.classList.add('has-items');
        
        setupComponentDragAndDrop();
        setupComponentResizeHandles();
    }
}

// 드롭 힌트 영역 드래그 오버 처리
function handleDropHintDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    
    const dropHint = event.currentTarget;
    dropHint.classList.add('drag-over');
}

// 드롭 힌트 영역 드래그 리브 처리
function handleDropHintDragLeave(event) {
    event.preventDefault();
    const dropHint = event.currentTarget;
    dropHint.classList.remove('drag-over');
}

// 드롭 힌트 영역에 드롭 처리
function handleDropHintDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const dropHint = event.currentTarget;
    dropHint.classList.remove('drag-over');
    
    const canvas = document.getElementById('formCanvas');
    canvas.classList.remove('drag-over');
    removeDropIndicator();
    
    // 팔레트에서 드래그한 컴포넌트인 경우
    if (draggedFromPalette && draggedComponent) {
        const newComponent = createComponent(draggedComponent);
        
        saveToUndoStack();
        
        // 맨 아래에 추가
        formComponents.push(newComponent);
        
        renderCanvas();
        selectComponent(newComponent.id);
        showToast('컴포넌트가 추가되었습니다.', 'success');
        
        // 드래그 상태 초기화
        draggedFromPalette = false;
        draggedComponent = null;
    }
}

// 전역으로 노출
window.handleDropHintDragOver = handleDropHintDragOver;
window.handleDropHintDragLeave = handleDropHintDragLeave;
window.handleDropHintDrop = handleDropHintDrop;

function renderComponent(component) {
    const isSelected = component.id === selectedComponentId;
    const colSpan = component.colSpan || 1;
    const heightStyle = component.minHeight ? `min-height: ${component.minHeight}px;` : '';
    const sizeLabel = colSpan === 'full' ? '전체' : `${colSpan}/${gridColumns}`;
    
    return `
        <div class="canvas-component ${isSelected ? 'selected' : ''}" 
             data-id="${component.id}" 
             data-col-span="${colSpan}"
             draggable="true"
             style="${heightStyle}">
            <div class="component-drag-handle">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5"/>
                    <circle cx="15" cy="6" r="1.5"/>
                    <circle cx="9" cy="12" r="1.5"/>
                    <circle cx="15" cy="12" r="1.5"/>
                    <circle cx="9" cy="18" r="1.5"/>
                    <circle cx="15" cy="18" r="1.5"/>
                </svg>
            </div>
            <div class="component-actions">
                <div class="col-span-controls">
                    ${[1, 2, 3, 4].filter(n => n <= gridColumns).map(n => `
                        <button class="col-span-btn ${colSpan === n ? 'active' : ''}" 
                                onclick="setComponentColSpan('${component.id}', ${n})" 
                                title="${n}열">${n}</button>
                    `).join('')}
                    <button class="col-span-btn ${colSpan === 'full' ? 'active' : ''}" 
                            onclick="setComponentColSpan('${component.id}', 'full')" 
                            title="전체">F</button>
                </div>
                <button class="component-action-btn" onclick="duplicateComponent('${component.id}')" title="복제">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
                <button class="component-action-btn delete" onclick="deleteComponent('${component.id}')" title="삭제">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
            <div class="resize-handle resize-e" data-handle="e"></div>
            <div class="resize-handle resize-s" data-handle="s"></div>
            <div class="resize-handle resize-se" data-handle="se"></div>
            <div class="size-indicator">${sizeLabel}</div>
            ${renderComponentContent(component)}
        </div>
    `;
}

function setComponentColSpan(componentId, colSpan) {
    const component = formComponents.find(c => c.id === componentId);
    if (component) {
        saveToUndoStack();
        component.colSpan = colSpan;
        renderCanvas();
        
        // Re-select component and update properties panel for col-span buttons
        selectedComponentId = componentId;
        const componentEl = document.querySelector(`.canvas-component[data-id="${componentId}"]`);
        if (componentEl) {
            document.querySelectorAll('.canvas-component').forEach(el => el.classList.remove('selected'));
            componentEl.classList.add('selected');
        }
        renderPropertiesPanel();
    }
}

function setupComponentResizeHandles() {
    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            const componentEl = e.target.closest('.canvas-component');
            if (componentEl) {
                handleResizeStart(e, componentEl.dataset.id, e.target.dataset.handle);
            }
        });
    });
}

function renderComponentContent(component) {
    switch (component.type) {
        case 'text-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <input type="text" class="component-input" placeholder="${escapeHtml(component.placeholder)}" disabled>
            `;
            
        case 'textarea':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <textarea class="component-input component-textarea" placeholder="${escapeHtml(component.placeholder)}" rows="${component.rows}" disabled></textarea>
            `;
            
        case 'number-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <input type="number" class="component-input" placeholder="${escapeHtml(component.placeholder)}" min="${component.min}" max="${component.max}" disabled>
            `;
            
        case 'date-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <input type="date" class="component-input" disabled>
            `;
            
        case 'select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <select class="component-input component-select" disabled>
                    <option value="">선택하세요</option>
                    ${component.options.map(opt => `<option>${escapeHtml(opt)}</option>`).join('')}
                </select>
            `;
            
        case 'checkbox':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-checkbox-group">
                    ${component.options.map(opt => `
                        <label class="checkbox-item">
                            <input type="checkbox" disabled>
                            <span>${escapeHtml(opt)}</span>
                        </label>
                    `).join('')}
                </div>
            `;
            
        case 'radio':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-radio-group">
                    ${component.options.map(opt => `
                        <label class="radio-item">
                            <input type="radio" name="${component.id}" disabled>
                            <span>${escapeHtml(opt)}</span>
                        </label>
                    `).join('')}
                </div>
            `;
            
        case 'rating':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-rating">
                    ${Array(component.maxStars).fill(0).map((_, i) => `
                        <svg class="rating-star ${i < component.defaultValue ? 'active' : ''}" viewBox="0 0 24 24" fill="${i < component.defaultValue ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    `).join('')}
                </div>
            `;
            
        case 'slider':
            return `
                <label class="component-label">${escapeHtml(component.label)}</label>
                <div class="component-slider-wrapper">
                    <input type="range" class="component-slider" min="${component.min}" max="${component.max}" step="${component.step}" value="${component.defaultValue}" disabled>
                    <span class="slider-value">${component.defaultValue}</span>
                </div>
            `;
            
        case 'time-estimate':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-time-estimate">
                    <div class="time-input-group">
                        <input type="number" class="component-input" placeholder="0" min="0" disabled>
                        <span>시간</span>
                    </div>
                    <div class="time-input-group">
                        <input type="number" class="component-input" placeholder="0" min="0" max="59" disabled>
                        <span>분</span>
                    </div>
                </div>
            `;
            
        case 'priority-select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-priority-select">
                    <div class="priority-option high ${component.defaultValue === 'high' ? 'selected' : ''}">높음</div>
                    <div class="priority-option medium ${component.defaultValue === 'medium' ? 'selected' : ''}">보통</div>
                    <div class="priority-option low ${component.defaultValue === 'low' ? 'selected' : ''}">낮음</div>
                </div>
            `;
            
        case 'difficulty':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-difficulty">
                    <div class="difficulty-option ${component.defaultValue === 'easy' ? 'selected' : ''}">
                        <div class="difficulty-level">⭐</div>
                        <div class="difficulty-label">쉬움</div>
                    </div>
                    <div class="difficulty-option ${component.defaultValue === 'normal' ? 'selected' : ''}">
                        <div class="difficulty-level">⭐⭐</div>
                        <div class="difficulty-label">보통</div>
                    </div>
                    <div class="difficulty-option ${component.defaultValue === 'hard' ? 'selected' : ''}">
                        <div class="difficulty-level">⭐⭐⭐</div>
                        <div class="difficulty-label">어려움</div>
                    </div>
                    <div class="difficulty-option ${component.defaultValue === 'expert' ? 'selected' : ''}">
                        <div class="difficulty-level">⭐⭐⭐⭐</div>
                        <div class="difficulty-label">전문가</div>
                    </div>
                </div>
            `;
            
        case 'progress':
            return `
                <label class="component-label">${escapeHtml(component.label)}</label>
                <div class="component-progress">
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar-fill" style="width: ${component.defaultValue}%"></div>
                    </div>
                    <div class="progress-labels">
                        <span>0%</span>
                        <span>${component.defaultValue}%</span>
                        <span>100%</span>
                    </div>
                </div>
            `;
            
        case 'section-header':
            return `<div class="component-section-header">${escapeHtml(component.text)}</div>`;
            
        case 'divider':
            return `<div class="component-divider"></div>`;
            
        case 'info-text':
            return `<div class="component-info-text">${escapeHtml(component.text)}</div>`;
            
        case 'file-upload':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-file-upload">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>파일을 드래그하거나 클릭하여 업로드</span>
                </div>
            `;
            
        case 'requester-info':
            return `
                <label class="component-label">${escapeHtml(component.label)}</label>
                <div class="component-requester-info">
                    <div>
                        <label class="component-label" style="font-size: 0.75rem;">이름</label>
                        <input type="text" class="component-input" placeholder="이름" disabled>
                    </div>
                    <div>
                        <label class="component-label" style="font-size: 0.75rem;">연락처</label>
                        <input type="text" class="component-input" placeholder="연락처" disabled>
                    </div>
                    <div>
                        <label class="component-label" style="font-size: 0.75rem;">이메일</label>
                        <input type="email" class="component-input" placeholder="이메일" disabled>
                    </div>
                    <div>
                        <label class="component-label" style="font-size: 0.75rem;">부서</label>
                        <input type="text" class="component-input" placeholder="부서" disabled>
                    </div>
                </div>
            `;
            
        case 'department-select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <select class="component-input component-select" disabled>
                    <option value="">부서를 선택하세요</option>
                    ${component.departments.map(dept => `<option>${escapeHtml(dept)}</option>`).join('')}
                </select>
            `;
            
        case 'approval-flow':
            return `
                <label class="component-label">${escapeHtml(component.label)}</label>
                <div class="component-approval-flow">
                    ${component.steps.map((step, i) => `
                        <div class="approval-step">
                            <div class="approval-step-number">${i + 1}</div>
                            <div class="approval-step-content">
                                <div class="approval-step-title">${escapeHtml(step.title)}</div>
                                <div class="approval-step-role">${escapeHtml(step.role)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
        // New Evaluation Components
        case 'tech-skill-eval':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.skills.map(skill => `
                            <div class="eval-item">
                                <span class="eval-item-label">${escapeHtml(skill.name)}</span>
                                <div class="eval-item-value">
                                    <div class="eval-level">
                                        <span class="eval-level-option beginner ${skill.level === 1 ? 'active' : ''}">초급</span>
                                        <span class="eval-level-option intermediate ${skill.level === 2 ? 'active' : ''}">중급</span>
                                        <span class="eval-level-option advanced ${skill.level === 3 ? 'active' : ''}">고급</span>
                                        <span class="eval-level-option expert ${skill.level === 4 ? 'active' : ''}">전문가</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
        case 'soft-skill-eval':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.skills.map(skill => `
                            <div class="eval-item">
                                <span class="eval-item-label">${escapeHtml(skill.name)}</span>
                                <div class="eval-item-value">
                                    <div class="eval-score">
                                        ${[1,2,3,4,5].map(n => `
                                            <span class="eval-score-btn ${skill.score === n ? 'active' : ''}">${n}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
        case 'performance-eval':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.metrics.map(metric => `
                            <div class="eval-item">
                                <span class="eval-item-label">${escapeHtml(metric.name)}</span>
                                <div class="eval-item-value">
                                    <div class="eval-score">
                                        ${[1,2,3,4,5].map(n => `
                                            <span class="eval-score-btn ${metric.score === n ? 'active' : ''}">${n}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
        case 'competency-matrix':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="competency-matrix">
                            <div class="matrix-row">
                                <div class="matrix-header"></div>
                                ${component.levelLabels.map(label => `
                                    <div class="matrix-header">${label}</div>
                                `).join('')}
                            </div>
                            ${component.competencies.map(comp => `
                                <div class="matrix-row">
                                    <div class="matrix-label">${escapeHtml(comp.name)}</div>
                                    ${comp.levels.map((active, i) => `
                                        <div class="matrix-cell ${active ? 'active' : ''}"></div>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
        case 'goal-achievement':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.goals.map(goal => `
                            <div class="goal-achievement-item">
                                <div class="goal-header">
                                    <span class="goal-title">${escapeHtml(goal.title)}</span>
                                    <span class="goal-percentage">${goal.percentage}%</span>
                                </div>
                                <div class="goal-bar">
                                    <div class="goal-fill" style="width: ${goal.percentage}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
        case 'feedback-section':
            return `
                <div class="feedback-section">
                    ${component.categories.map(cat => `
                        <div class="feedback-category">
                            <div class="feedback-category-label">
                                ${escapeHtml(cat.label)}
                                <span class="badge ${cat.type}">${cat.type === 'strength' ? '강점' : cat.type === 'improvement' ? '개선' : '목표'}</span>
                            </div>
                            <textarea class="feedback-textarea" placeholder="${escapeHtml(cat.label)}을(를) 입력하세요..." disabled></textarea>
                        </div>
                    `).join('')}
                </div>
            `;
        
        // New Components
        case 'email-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <input type="email" class="component-input" placeholder="${escapeHtml(component.placeholder)}" disabled>
            `;
            
        case 'phone-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <input type="tel" class="component-input" placeholder="${escapeHtml(component.placeholder)}" disabled>
            `;
            
        case 'toggle-switch':
            return `
                <label class="component-label">${escapeHtml(component.label)}</label>
                <div class="component-toggle-switch">
                    <span class="toggle-off-label">${escapeHtml(component.offLabel)}</span>
                    <label class="toggle-switch">
                        <input type="checkbox" ${component.defaultValue ? 'checked' : ''} disabled>
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-on-label">${escapeHtml(component.onLabel)}</span>
                </div>
            `;
            
        case 'yes-no-select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-yes-no">
                    <button class="yes-no-btn ${component.defaultValue === 'yes' ? 'selected' : ''}" disabled>예</button>
                    <button class="yes-no-btn ${component.defaultValue === 'no' ? 'selected' : ''}" disabled>아니오</button>
                </div>
            `;
            
        case 'deadline-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-deadline">
                    <input type="date" class="component-input" disabled>
                    ${component.includeTime ? '<input type="time" class="component-input" disabled>' : ''}
                </div>
            `;
            
        case 'work-type-select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <select class="component-input component-select" disabled>
                    <option value="">업무 유형 선택</option>
                    ${component.options.map(opt => `<option>${escapeHtml(opt)}</option>`).join('')}
                </select>
            `;
            
        case 'impact-level':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-impact-level">
                    <div class="impact-option low ${component.defaultValue === 'low' ? 'selected' : ''}">
                        <span class="impact-icon">📉</span>
                        <span>낮음</span>
                    </div>
                    <div class="impact-option medium ${component.defaultValue === 'medium' ? 'selected' : ''}">
                        <span class="impact-icon">📊</span>
                        <span>보통</span>
                    </div>
                    <div class="impact-option high ${component.defaultValue === 'high' ? 'selected' : ''}">
                        <span class="impact-icon">📈</span>
                        <span>높음</span>
                    </div>
                    <div class="impact-option critical ${component.defaultValue === 'critical' ? 'selected' : ''}">
                        <span class="impact-icon">⚠️</span>
                        <span>심각</span>
                    </div>
                </div>
            `;
            
        case 'kpi-tracker':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.kpis.map(kpi => `
                            <div class="kpi-item">
                                <div class="kpi-header">
                                    <span class="kpi-name">${escapeHtml(kpi.name)}</span>
                                    <span class="kpi-progress">${kpi.current}/${kpi.target}${kpi.unit}</span>
                                </div>
                                <div class="kpi-bar">
                                    <div class="kpi-fill" style="width: ${Math.min((kpi.current / kpi.target) * 100, 100)}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
        case 'satisfaction-survey':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.questions.map(q => `
                            <div class="survey-item">
                                <span class="survey-question">${escapeHtml(q.question)}</span>
                                <div class="survey-faces">
                                    <span class="face-btn ${q.score === 1 ? 'active' : ''}" title="매우 불만족">😞</span>
                                    <span class="face-btn ${q.score === 2 ? 'active' : ''}" title="불만족">🙁</span>
                                    <span class="face-btn ${q.score === 3 ? 'active' : ''}" title="보통">😐</span>
                                    <span class="face-btn ${q.score === 4 ? 'active' : ''}" title="만족">🙂</span>
                                    <span class="face-btn ${q.score === 5 ? 'active' : ''}" title="매우 만족">😊</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
        case 'image-upload':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-image-upload">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>이미지를 드래그하거나 클릭하여 업로드</span>
                </div>
            `;
            
        case 'link-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-link-input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                    </svg>
                    <input type="url" class="component-input" placeholder="${escapeHtml(component.placeholder)}" disabled>
                </div>
            `;
            
        case 'team-member-select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-team-member">
                    <div class="team-member-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input type="text" class="component-input" placeholder="담당자 검색..." disabled>
                    </div>
                    <div class="team-member-list">
                        <div class="team-member-placeholder">담당자를 검색하여 선택하세요</div>
                    </div>
                </div>
            `;
            
        case 'project-select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <select class="component-input component-select" disabled>
                    <option value="">프로젝트 선택</option>
                    ${component.options.map(opt => `<option>${escapeHtml(opt)}</option>`).join('')}
                </select>
            `;
            
        case 'cost-estimate':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-cost-estimate">
                    <input type="number" class="component-input" placeholder="0" disabled>
                    <span class="cost-currency">${escapeHtml(component.currency)}</span>
                </div>
            `;

        // ===== 추가 입력 컴포넌트 =====
        case 'date-range':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-date-range">
                    <div class="date-range-item">
                        <span class="date-label">시작일</span>
                        <input type="date" class="component-input" disabled>
                    </div>
                    <span class="date-range-separator">~</span>
                    <div class="date-range-item">
                        <span class="date-label">종료일</span>
                        <input type="date" class="component-input" disabled>
                    </div>
                </div>
            `;

        case 'time-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <input type="time" class="component-input" disabled>
            `;

        case 'address-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-address">
                    <div class="address-row">
                        <input type="text" class="component-input" placeholder="우편번호" disabled style="flex: 1;">
                        <button class="address-search-btn" disabled>주소 검색</button>
                    </div>
                    <input type="text" class="component-input" placeholder="기본 주소" disabled>
                    <input type="text" class="component-input" placeholder="상세 주소" disabled>
                </div>
            `;

        case 'signature-pad':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-signature">
                    <div class="signature-canvas">
                        <span class="signature-placeholder">서명을 입력하세요</span>
                    </div>
                    <div class="signature-actions">
                        <button class="signature-clear-btn" disabled>지우기</button>
                    </div>
                </div>
            `;

        case 'rich-text':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-rich-text">
                    <div class="rich-text-toolbar">
                        <button class="toolbar-btn" disabled><strong>B</strong></button>
                        <button class="toolbar-btn" disabled><em>I</em></button>
                        <button class="toolbar-btn" disabled><u>U</u></button>
                        <span class="toolbar-divider"></span>
                        <button class="toolbar-btn" disabled>📋</button>
                        <button class="toolbar-btn" disabled>🔗</button>
                    </div>
                    <div class="rich-text-content" contenteditable="false">
                        <p>서식 있는 텍스트를 입력하세요...</p>
                    </div>
                </div>
            `;

        case 'table-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}</label>
                <div class="component-table">
                    <table class="table-input-table">
                        <thead>
                            <tr>
                                ${component.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${Array(component.rows).fill(0).map(() => `
                                <tr>
                                    ${component.columns.map(() => `<td><input type="text" disabled></td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <button class="table-add-row-btn" disabled>+ 행 추가</button>
                </div>
            `;

        case 'budget-breakdown':
            return `
                <label class="component-label">${escapeHtml(component.label)}</label>
                <div class="component-budget">
                    <div class="budget-items">
                        ${component.items.map(item => `
                            <div class="budget-item">
                                <span class="budget-category">${escapeHtml(item.category)}</span>
                                <div class="budget-amount">
                                    <input type="number" class="component-input" value="${item.amount}" disabled>
                                    <span>원</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="budget-total">
                        <span>합계</span>
                        <span class="budget-total-amount">${component.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}원</span>
                    </div>
                </div>
            `;

        case 'risk-assessment':
            return `
                <label class="component-label">${escapeHtml(component.label)}</label>
                <div class="component-risk">
                    <div class="risk-header">
                        <span>리스크 항목</span>
                        <span>발생 확률</span>
                        <span>영향도</span>
                        <span>등급</span>
                    </div>
                    ${component.risks.map(risk => {
                        const level = (risk.probability + risk.impact) / 2;
                        const grade = level >= 7 ? 'critical' : level >= 5 ? 'high' : level >= 3 ? 'medium' : 'low';
                        return `
                            <div class="risk-item">
                                <span class="risk-name">${escapeHtml(risk.name)}</span>
                                <input type="range" min="1" max="10" value="${risk.probability}" disabled>
                                <input type="range" min="1" max="10" value="${risk.impact}" disabled>
                                <span class="risk-grade ${grade}">${grade === 'critical' ? '심각' : grade === 'high' ? '높음' : grade === 'medium' ? '보통' : '낮음'}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

        case 'checklist':
            return `
                <label class="component-label">${escapeHtml(component.label)}</label>
                <div class="component-checklist">
                    ${component.items.map((item, i) => `
                        <label class="checklist-item">
                            <input type="checkbox" disabled>
                            <span>${escapeHtml(item)}</span>
                        </label>
                    `).join('')}
                </div>
            `;

        case 'multi-select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-multi-select">
                    <div class="multi-select-input" disabled>
                        <span class="multi-select-placeholder">항목을 선택하세요</span>
                    </div>
                    <div class="multi-select-dropdown">
                        ${component.options.map(opt => `
                            <label class="multi-select-option">
                                <input type="checkbox" disabled>
                                <span>${escapeHtml(opt)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;

        case 'status-select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-status-select">
                    ${component.options.map(opt => {
                        const statusClass = opt === '완료' ? 'completed' : opt === '진행중' ? 'in-progress' : opt === '대기' ? 'pending' : opt === '보류' ? 'on-hold' : opt === '취소' ? 'cancelled' : 'review';
                        return `<span class="status-option ${statusClass}">${escapeHtml(opt)}</span>`;
                    }).join('')}
                </div>
            `;

        case 'version-input':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-version">
                    <input type="number" class="version-part" placeholder="1" min="0" disabled>
                    <span class="version-dot">.</span>
                    <input type="number" class="version-part" placeholder="0" min="0" disabled>
                    <span class="version-dot">.</span>
                    <input type="number" class="version-part" placeholder="0" min="0" disabled>
                </div>
            `;

        case 'environment-select':
            return `
                <label class="component-label">${escapeHtml(component.label)}${component.required ? '<span class="component-required">*</span>' : ''}</label>
                <div class="component-environment">
                    ${component.options.map(opt => {
                        const envClass = opt === '운영' ? 'prod' : opt === '스테이징' ? 'staging' : opt === '개발' ? 'dev' : 'all';
                        return `
                            <label class="env-option ${envClass}">
                                <input type="checkbox" disabled>
                                <span>${escapeHtml(opt)}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            `;

        // ===== 개발자 역량 평가 =====
        case 'code-quality-eval':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.criteria.map(criterion => `
                            <div class="eval-item">
                                <div class="eval-item-header">
                                    <span class="eval-item-label">${escapeHtml(criterion.name)}</span>
                                    <span class="eval-weight">(가중치: ${criterion.weight}%)</span>
                                </div>
                                <div class="eval-item-value">
                                    <div class="eval-score-bar">
                                        <div class="score-fill" style="width: ${criterion.score * 10}%"></div>
                                    </div>
                                    <span class="score-value">${criterion.score}/10</span>
                                </div>
                            </div>
                        `).join('')}
                        <div class="eval-total">
                            <span>총점</span>
                            <span class="total-score">${(component.criteria.reduce((sum, c) => sum + (c.score * c.weight / 100), 0) * 10).toFixed(1)}점</span>
                        </div>
                    </div>
                </div>
            `;

        case 'dev-skill-radar':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="skill-radar">
                            <div class="radar-chart-placeholder">
                                <svg viewBox="0 0 200 200" class="radar-svg">
                                    <polygon class="radar-bg" points="100,10 180,55 180,145 100,190 20,145 20,55"/>
                                    <polygon class="radar-grid" points="100,35 155,67.5 155,132.5 100,165 45,132.5 45,67.5"/>
                                    <polygon class="radar-grid" points="100,60 130,80 130,120 100,140 70,120 70,80"/>
                                </svg>
                            </div>
                            <div class="skill-list">
                                ${component.skills.map(skill => `
                                    <div class="skill-item">
                                        <span class="skill-name">${escapeHtml(skill.name)}</span>
                                        <div class="skill-level-bar">
                                            <div class="skill-fill" style="width: ${skill.level * 20}%"></div>
                                        </div>
                                        <span class="skill-level-value">${skill.level}/5</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;

        case 'experience-level':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.categories.map(cat => `
                            <div class="experience-category">
                                <div class="exp-category-header">${escapeHtml(cat.name)}</div>
                                <div class="exp-tags">
                                    <span class="exp-tag-placeholder">+ 기술 추가</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

        case 'contribution-tracker':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="contribution-grid">
                            ${component.metrics.map(metric => `
                                <div class="contribution-item">
                                    <div class="contribution-value">${metric.value}</div>
                                    <div class="contribution-label">${escapeHtml(metric.name)}</div>
                                    <div class="contribution-unit">${escapeHtml(metric.unit)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

        case 'problem-solving-eval':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.criteria.map(criterion => `
                            <div class="eval-item">
                                <span class="eval-item-label">${escapeHtml(criterion.name)}</span>
                                <div class="eval-item-value">
                                    <div class="eval-score">
                                        ${[1,2,3,4,5].map(n => `
                                            <span class="eval-score-btn ${criterion.score === n ? 'active' : ''}">${n}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

        // ===== 요청자 역량 평가 =====
        case 'requirement-quality':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.criteria.map(criterion => `
                            <div class="eval-item">
                                <span class="eval-item-label">${escapeHtml(criterion.name)}</span>
                                <div class="eval-item-value">
                                    <div class="quality-rating">
                                        ${['매우부족', '부족', '보통', '양호', '우수'].map((label, i) => `
                                            <span class="quality-option ${criterion.score === i + 1 ? 'active' : ''}" title="${label}">${i + 1}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

        case 'communication-eval':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.aspects.map(aspect => `
                            <div class="eval-item">
                                <span class="eval-item-label">${escapeHtml(aspect.name)}</span>
                                <div class="eval-item-value">
                                    <div class="comm-rating">
                                        <div class="comm-bar">
                                            <div class="comm-fill" style="width: ${aspect.score * 20}%"></div>
                                        </div>
                                        <span class="comm-score">${aspect.score}/5</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

        case 'stakeholder-engagement':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="engagement-metrics">
                            ${component.metrics.map(metric => `
                                <div class="engagement-item">
                                    <div class="engagement-label">${escapeHtml(metric.name)}</div>
                                    <div class="engagement-value">
                                        <input type="number" class="component-input" value="${metric.value}" disabled>
                                        <span class="engagement-unit">${escapeHtml(metric.unit)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

        case 'business-value-assessment':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.factors.map(factor => `
                            <div class="eval-item">
                                <div class="eval-item-header">
                                    <span class="eval-item-label">${escapeHtml(factor.name)}</span>
                                    <span class="eval-weight">(${factor.weight}%)</span>
                                </div>
                                <div class="eval-item-value">
                                    <div class="value-slider">
                                        <input type="range" min="0" max="100" value="${factor.score}" disabled>
                                        <span class="value-score">${factor.score}점</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        <div class="eval-total">
                            <span>가중 평균</span>
                            <span class="total-score">${(component.factors.reduce((sum, f) => sum + (f.score * f.weight / 100), 0)).toFixed(1)}점</span>
                        </div>
                    </div>
                </div>
            `;

        // ===== 프로젝트 성과 평가 =====
        case 'project-health':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="health-indicators">
                            ${component.indicators.map(ind => `
                                <div class="health-item">
                                    <span class="health-name">${escapeHtml(ind.name)}</span>
                                    <span class="health-status ${ind.status}">
                                        ${ind.status === 'green' ? '🟢 양호' : ind.status === 'yellow' ? '🟡 주의' : '🔴 위험'}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

        case 'milestone-tracker':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="milestone-timeline">
                            ${component.milestones.map((ms, i) => `
                                <div class="milestone-item ${ms.status}">
                                    <div class="milestone-marker">${i + 1}</div>
                                    <div class="milestone-content">
                                        <div class="milestone-name">${escapeHtml(ms.name)}</div>
                                        <div class="milestone-date">${ms.dueDate || '미정'}</div>
                                    </div>
                                    <div class="milestone-status-badge ${ms.status}">
                                        ${ms.status === 'completed' ? '완료' : ms.status === 'in-progress' ? '진행중' : '대기'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

        case 'sprint-velocity':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="velocity-chart">
                            ${component.sprints.map(sprint => `
                                <div class="velocity-item">
                                    <div class="velocity-label">${escapeHtml(sprint.name)}</div>
                                    <div class="velocity-bars">
                                        <div class="velocity-bar planned" style="height: ${sprint.planned * 3}px" title="계획: ${sprint.planned}"></div>
                                        <div class="velocity-bar completed" style="height: ${sprint.completed * 3}px" title="완료: ${sprint.completed}"></div>
                                    </div>
                                    <div class="velocity-values">
                                        <span class="planned">${sprint.planned}</span>
                                        <span class="completed">${sprint.completed}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="velocity-legend">
                            <span class="legend-item planned">계획</span>
                            <span class="legend-item completed">완료</span>
                        </div>
                    </div>
                </div>
            `;

        case 'defect-density':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="defect-summary">
                            ${component.metrics.map(metric => `
                                <div class="defect-item" style="border-left: 4px solid ${metric.color}">
                                    <span class="defect-severity">${escapeHtml(metric.name)}</span>
                                    <span class="defect-count">${metric.count}건</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="defect-total">
                            <span>총 결함</span>
                            <span>${component.metrics.reduce((sum, m) => sum + m.count, 0)}건</span>
                        </div>
                    </div>
                </div>
            `;

        case 'delivery-metrics':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="delivery-grid">
                            ${component.metrics.map(metric => `
                                <div class="delivery-item">
                                    <div class="delivery-value">${metric.value}</div>
                                    <div class="delivery-unit">${escapeHtml(metric.unit)}</div>
                                    <div class="delivery-label">${escapeHtml(metric.name)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

        case 'team-performance':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.metrics.map(metric => `
                            <div class="team-metric">
                                <div class="metric-header">
                                    <span class="metric-name">${escapeHtml(metric.name)}</span>
                                    <span class="metric-values">${metric.value}/${metric.target}</span>
                                </div>
                                <div class="metric-bar">
                                    <div class="metric-fill" style="width: ${Math.min((metric.value / metric.target) * 100, 100)}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

        case 'roi-calculator':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="roi-inputs">
                            <div class="roi-input-group">
                                <label>투자 비용</label>
                                <div class="roi-input-wrapper">
                                    <input type="number" class="component-input" value="${component.inputs.investment}" disabled>
                                    <span>원</span>
                                </div>
                            </div>
                            <div class="roi-input-group">
                                <label>예상 수익</label>
                                <div class="roi-input-wrapper">
                                    <input type="number" class="component-input" value="${component.inputs.benefit}" disabled>
                                    <span>원</span>
                                </div>
                            </div>
                            <div class="roi-input-group">
                                <label>기간</label>
                                <div class="roi-input-wrapper">
                                    <input type="number" class="component-input" value="${component.inputs.period}" disabled>
                                    <span>개월</span>
                                </div>
                            </div>
                        </div>
                        <div class="roi-result">
                            <span>예상 ROI</span>
                            <span class="roi-value">${component.inputs.investment > 0 ? (((component.inputs.benefit - component.inputs.investment) / component.inputs.investment) * 100).toFixed(1) : 0}%</span>
                        </div>
                    </div>
                </div>
            `;

        case 'resource-utilization':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.resources.map(resource => `
                            <div class="resource-item">
                                <span class="resource-name">${escapeHtml(resource.name)}</span>
                                <div class="resource-bar-wrapper">
                                    <div class="resource-bar">
                                        <div class="resource-allocated" style="width: 100%"></div>
                                        <div class="resource-utilized" style="width: ${resource.allocated > 0 ? (resource.utilized / resource.allocated) * 100 : 0}%"></div>
                                    </div>
                                    <span class="resource-values">${resource.utilized}/${resource.allocated}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

        case 'scope-change-log':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        <div class="scope-log">
                            ${component.changes.length > 0 ? component.changes.map(change => `
                                <div class="scope-item">
                                    <span class="scope-date">${change.date}</span>
                                    <span class="scope-description">${escapeHtml(change.description)}</span>
                                    <span class="scope-impact ${change.impact}">${change.impact}</span>
                                </div>
                            `).join('') : `
                                <div class="scope-empty">
                                    <span>범위 변경 이력이 없습니다</span>
                                    <button class="add-change-btn" disabled>+ 변경 추가</button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

        case 'lesson-learned':
            return `
                <div class="eval-section">
                    <div class="eval-header">${escapeHtml(component.label)}</div>
                    <div class="eval-body">
                        ${component.categories.map(cat => `
                            <div class="lesson-category ${cat.type}">
                                <div class="lesson-header">
                                    ${cat.type === 'success' ? '✅' : cat.type === 'improve' ? '🔧' : '🎯'} ${escapeHtml(cat.label)}
                                </div>
                                <div class="lesson-items">
                                    ${cat.items.length > 0 ? cat.items.map(item => `
                                        <div class="lesson-item">${escapeHtml(item)}</div>
                                    `).join('') : `
                                        <div class="lesson-placeholder">항목을 추가하세요</div>
                                    `}
                                </div>
                                <button class="add-lesson-btn" disabled>+ 추가</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
        default:
            return `<div>알 수 없는 컴포넌트</div>`;
    }
}

// ===== Component Drag and Drop (Reordering) =====
function setupComponentDragAndDrop() {
    const components = document.querySelectorAll('.canvas-component');
    
    components.forEach(comp => {
        comp.addEventListener('dragstart', handleComponentDragStart);
        comp.addEventListener('dragend', handleComponentDragEnd);
        comp.addEventListener('dragover', handleComponentDragOver);
        comp.addEventListener('drop', handleComponentDrop);
    });
}

function handleComponentDragStart(e) {
    if (isResizing) {
        e.preventDefault();
        return;
    }
    
    draggedFromPalette = false;
    draggedComponent = e.target.dataset.id;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedComponent);
}

function handleComponentDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedComponent = null;
    removeDropIndicator();
}

function handleComponentDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleComponentDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedFromPalette && draggedComponent) {
        const targetId = e.target.closest('.canvas-component')?.dataset.id;
        if (targetId && targetId !== draggedComponent) {
            saveToUndoStack();
            
            const draggedIndex = formComponents.findIndex(c => c.id === draggedComponent);
            const targetIndex = formComponents.findIndex(c => c.id === targetId);
            
            const [removed] = formComponents.splice(draggedIndex, 1);
            formComponents.splice(targetIndex, 0, removed);
            
            renderCanvas();
            
            // Re-select component visually without re-rendering properties
            selectedComponentId = draggedComponent;
            const componentEl = document.querySelector(`.canvas-component[data-id="${draggedComponent}"]`);
            if (componentEl) {
                document.querySelectorAll('.canvas-component').forEach(el => el.classList.remove('selected'));
                componentEl.classList.add('selected');
            }
        }
    }
}

// ===== Properties Panel =====
function setupPanelTabs() {
    const tabs = document.querySelectorAll('.panel-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderPropertiesPanel();
        });
    });
}

function renderPropertiesPanel() {
    const panel = document.getElementById('propertiesBody');
    if (!panel) return;
    
    const activeTab = document.querySelector('.panel-tab.active')?.dataset.tab || 'properties';
    
    if (!selectedComponentId) {
        panel.innerHTML = `
            <div class="empty-state small">
                <p>컴포넌트를 선택하면<br>속성을 편집할 수 있습니다</p>
            </div>
        `;
        return;
    }
    
    const component = formComponents.find(c => c.id === selectedComponentId);
    if (!component) return;
    
    if (activeTab === 'style') {
        panel.innerHTML = renderStyleProperties(component);
    } else {
        panel.innerHTML = renderPropertiesForComponent(component);
    }
    
    setupPropertyHandlers();
}

function renderStyleProperties(component) {
    const colSpan = component.colSpan || 1;
    return `
        <div class="property-group">
            <label class="property-label">열 너비</label>
            <div class="col-span-selector">
                ${[1, 2, 3, 4].filter(n => n <= gridColumns).map(n => `
                    <button class="col-span-option ${colSpan === n ? 'active' : ''}" 
                            onclick="setComponentColSpan('${component.id}', ${n})">${n}열</button>
                `).join('')}
                <button class="col-span-option ${colSpan === 'full' ? 'active' : ''}" 
                        onclick="setComponentColSpan('${component.id}', 'full')">전체</button>
            </div>
        </div>
        <div class="property-group">
            <label class="property-label">최소 높이 (px)</label>
            <input type="number" class="property-input" data-property="minHeight" value="${component.minHeight || 60}" min="60">
        </div>
        <div class="property-group">
            <label class="property-label">컴포넌트 유형</label>
            <input type="text" class="property-input" value="${getComponentTypeName(component.type)}" disabled>
        </div>
    `;
}

function renderPropertiesForComponent(component) {
    let html = `
        <div class="property-group">
            <label class="property-label">컴포넌트 유형</label>
            <input type="text" class="property-input" value="${getComponentTypeName(component.type)}" disabled>
        </div>
    `;
    
    if (component.label !== undefined) {
        html += `
            <div class="property-group">
                <label class="property-label">레이블</label>
                <input type="text" class="property-input" data-property="label" value="${escapeHtml(component.label)}">
            </div>
        `;
    }
    
    if (component.required !== undefined) {
        html += `
            <div class="property-group">
                <label class="property-checkbox">
                    <input type="checkbox" data-property="required" ${component.required ? 'checked' : ''}>
                    <span>필수 항목</span>
                </label>
            </div>
        `;
    }
    
    if (component.placeholder !== undefined) {
        html += `
            <div class="property-group">
                <label class="property-label">플레이스홀더</label>
                <input type="text" class="property-input" data-property="placeholder" value="${escapeHtml(component.placeholder)}">
            </div>
        `;
    }
    
    if (component.text !== undefined) {
        html += `
            <div class="property-group">
                <label class="property-label">텍스트</label>
                <textarea class="property-input" data-property="text" rows="3">${escapeHtml(component.text)}</textarea>
            </div>
        `;
    }
    
    if (component.options !== undefined) {
        html += `
            <div class="property-group">
                <label class="property-label">옵션</label>
                <div class="property-options" id="optionsList">
                    ${component.options.map((opt, i) => `
                        <div class="property-option-item">
                            <input type="text" value="${escapeHtml(opt)}" data-option-index="${i}">
                            <button onclick="removeOption(${i})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-option-btn" onclick="addOption()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    옵션 추가
                </button>
            </div>
        `;
    }
    
    if (component.rows !== undefined) {
        html += `
            <div class="property-group">
                <label class="property-label">줄 수</label>
                <input type="number" class="property-input" data-property="rows" value="${component.rows}" min="2" max="20">
            </div>
        `;
    }
    
    if (component.min !== undefined && component.max !== undefined) {
        html += `
            <div class="property-row">
                <div class="property-group">
                    <label class="property-label">최소값</label>
                    <input type="number" class="property-input" data-property="min" value="${component.min}">
                </div>
                <div class="property-group">
                    <label class="property-label">최대값</label>
                    <input type="number" class="property-input" data-property="max" value="${component.max}">
                </div>
            </div>
        `;
    }
    
    if (component.maxStars !== undefined) {
        html += `
            <div class="property-group">
                <label class="property-label">별 개수</label>
                <input type="number" class="property-input" data-property="maxStars" value="${component.maxStars}" min="3" max="10">
            </div>
        `;
    }
    
    return html;
}

function getComponentTypeName(type) {
    const names = {
        // 기본 입력
        'text-input': '텍스트 입력',
        'textarea': '텍스트 영역',
        'number-input': '숫자 입력',
        'date-input': '날짜 선택',
        'select': '드롭다운',
        'email-input': '이메일 입력',
        'phone-input': '전화번호 입력',
        // 선택 항목
        'checkbox': '체크박스',
        'radio': '라디오 버튼',
        'rating': '별점 평가',
        'slider': '슬라이더',
        'toggle-switch': '토글 스위치',
        'yes-no-select': '예/아니오',
        // 업무 측정
        'time-estimate': '예상 시간',
        'priority-select': '우선순위',
        'difficulty': '난이도',
        'progress': '진행률',
        'deadline-input': '마감일 설정',
        'work-type-select': '업무 유형',
        'impact-level': '영향도 평가',
        // 평가 항목
        'tech-skill-eval': '기술 역량 평가',
        'soft-skill-eval': '소프트 스킬 평가',
        'performance-eval': '성과 평가',
        'competency-matrix': '역량 매트릭스',
        'goal-achievement': '목표 달성도',
        'feedback-section': '피드백 섹션',
        'kpi-tracker': 'KPI 추적',
        'satisfaction-survey': '만족도 조사',
        // 정보 표시
        'section-header': '섹션 제목',
        'divider': '구분선',
        'info-text': '안내 텍스트',
        'file-upload': '파일 업로드',
        'image-upload': '이미지 업로드',
        'link-input': 'URL 링크',
        // 요청자 정보
        'requester-info': '요청자 정보',
        'department-select': '부서 선택',
        'approval-flow': '결재 라인',
        'team-member-select': '담당자 지정',
        'project-select': '프로젝트 선택',
        'cost-estimate': '비용 산정',
        // 추가 입력 컴포넌트
        'date-range': '기간 선택',
        'time-input': '시간 입력',
        'address-input': '주소 입력',
        'signature-pad': '서명',
        'rich-text': '서식 있는 텍스트',
        'table-input': '표 입력',
        'budget-breakdown': '예산 내역',
        'risk-assessment': '리스크 평가',
        'checklist': '체크리스트',
        'multi-select': '다중 선택',
        'status-select': '상태 선택',
        'version-input': '버전 정보',
        'environment-select': '환경 선택',
        // 개발자 역량 평가
        'code-quality-eval': '코드 품질 평가',
        'dev-skill-radar': '개발 역량 레이더',
        'experience-level': '경험 수준',
        'contribution-tracker': '기여도 추적',
        'problem-solving-eval': '문제 해결 능력 평가',
        // 요청자 역량 평가
        'requirement-quality': '요구사항 품질 평가',
        'communication-eval': '커뮤니케이션 평가',
        'stakeholder-engagement': '이해관계자 참여도',
        'business-value-assessment': '비즈니스 가치 평가',
        // 프로젝트 성과 평가
        'project-health': '프로젝트 건강도',
        'milestone-tracker': '마일스톤 추적',
        'sprint-velocity': '스프린트 속도',
        'defect-density': '결함 밀도',
        'delivery-metrics': '배포 지표',
        'team-performance': '팀 성과 지표',
        'roi-calculator': 'ROI 계산',
        'resource-utilization': '리소스 활용도',
        'scope-change-log': '범위 변경 이력',
        'lesson-learned': '교훈 기록'
    };
    return names[type] || type;
}

function setupPropertyHandlers() {
    const inputs = document.querySelectorAll('#propertiesBody [data-property]');
    
    inputs.forEach(input => {
        input.addEventListener('change', handlePropertyChange);
        input.addEventListener('input', handlePropertyChange);
    });
    
    const optionInputs = document.querySelectorAll('#propertiesBody [data-option-index]');
    optionInputs.forEach(input => {
        input.addEventListener('change', handleOptionChange);
        input.addEventListener('input', handleOptionChange);
    });
}

function handlePropertyChange(e) {
    const property = e.target.dataset.property;
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    if (['rows', 'min', 'max', 'maxStars', 'step', 'minHeight', 'colSpan'].includes(property)) {
        value = parseInt(value) || 0;
    }
    
    const component = formComponents.find(c => c.id === selectedComponentId);
    if (component) {
        component[property] = value;
        
        // Only update the canvas, don't re-render the properties panel to keep focus
        renderCanvas();
        
        // Re-select the component visually without re-rendering properties
        const componentEl = document.querySelector(`.canvas-component[data-id="${selectedComponentId}"]`);
        if (componentEl) {
            document.querySelectorAll('.canvas-component').forEach(el => el.classList.remove('selected'));
            componentEl.classList.add('selected');
        }
    }
}

function handleOptionChange(e) {
    const index = parseInt(e.target.dataset.optionIndex);
    const value = e.target.value;
    
    const component = formComponents.find(c => c.id === selectedComponentId);
    if (component && component.options) {
        component.options[index] = value;
        
        // Only update the canvas, don't re-render the properties panel to keep focus
        renderCanvas();
        
        // Re-select the component visually without re-rendering properties
        const componentEl = document.querySelector(`.canvas-component[data-id="${selectedComponentId}"]`);
        if (componentEl) {
            document.querySelectorAll('.canvas-component').forEach(el => el.classList.remove('selected'));
            componentEl.classList.add('selected');
        }
    }
}

function addOption() {
    const component = formComponents.find(c => c.id === selectedComponentId);
    if (component && component.options) {
        component.options.push(`옵션 ${component.options.length + 1}`);
        renderCanvas();
        renderPropertiesPanel();
    }
}

function removeOption(index) {
    const component = formComponents.find(c => c.id === selectedComponentId);
    if (component && component.options && component.options.length > 1) {
        component.options.splice(index, 1);
        renderCanvas();
        renderPropertiesPanel();
    }
}

// ===== Undo/Redo =====
function saveToUndoStack() {
    undoStack.push(JSON.stringify(formComponents));
    if (undoStack.length > MAX_UNDO) {
        undoStack.shift();
    }
    redoStack = [];
}

function undoCanvas() {
    if (undoStack.length > 0) {
        redoStack.push(JSON.stringify(formComponents));
        formComponents = JSON.parse(undoStack.pop());
        renderCanvas();
        deselectComponent();
        showToast('실행이 취소되었습니다.', 'info');
    } else {
        showToast('더 이상 취소할 작업이 없습니다.', 'info');
    }
}

function redoCanvas() {
    if (redoStack.length > 0) {
        undoStack.push(JSON.stringify(formComponents));
        formComponents = JSON.parse(redoStack.pop());
        renderCanvas();
        deselectComponent();
        showToast('다시 실행되었습니다.', 'info');
    } else {
        showToast('다시 실행할 작업이 없습니다.', 'info');
    }
}

function clearCanvas() {
    if (formComponents.length === 0) return;
    
    if (confirm('모든 컴포넌트를 삭제하시겠습니까? (기본 제목과 요청자 정보는 유지됩니다)')) {
        saveToUndoStack();
        // 기본 컴포넌트로 초기화
        initializeDefaultComponents();
        renderCanvas();
        deselectComponent();
        showToast('캔버스가 초기화되었습니다.', 'info');
    }
}

// 기본 컴포넌트 초기화 (제목 + 요청자 정보)
function initializeDefaultComponents() {
    formComponents = [
        // 상단 제목
        {
            id: generateId(),
            type: 'section-header',
            label: '섹션 제목',
            text: '📋 신청서 제목',
            colSpan: 'full'
        },
        // 요청자 정보
        {
            id: generateId(),
            type: 'requester-info',
            label: '요청자 정보',
            colSpan: 'full'
        }
    ];
}

// ===== Keyboard Shortcuts =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Z: Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undoCanvas();
        }
        
        // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            redoCanvas();
        }
        
        // Delete: Delete selected component
        if (e.key === 'Delete' && selectedComponentId) {
            deleteComponent(selectedComponentId);
        }
        
        // Escape: Deselect
        if (e.key === 'Escape') {
            deselectComponent();
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
        
        // Ctrl/Cmd + D: Duplicate
        if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedComponentId) {
            e.preventDefault();
            duplicateComponent(selectedComponentId);
        }
    });
}

// ===== Template Management =====
function openSaveTemplateModal() {
    if (formComponents.length === 0) {
        showToast('저장할 컴포넌트가 없습니다.', 'error');
        return;
    }
    
    const formTitle = document.getElementById('formTitle')?.value;
    const templateNameInput = document.getElementById('templateName');
    if (templateNameInput) {
        templateNameInput.value = formTitle || '';
    }
    document.getElementById('saveTemplateModal')?.classList.add('active');
}

function closeSaveTemplateModal() {
    document.getElementById('saveTemplateModal')?.classList.remove('active');
}

function saveTemplate(e) {
    e.preventDefault();
    
    const template = {
        id: generateComponentId(),
        name: document.getElementById('templateName').value,
        description: document.getElementById('templateDescription').value,
        category: document.getElementById('templateCategory').value,
        components: JSON.parse(JSON.stringify(formComponents)),
        formTitle: document.getElementById('formTitle')?.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    formTemplates.push(template);
    localStorage.setItem('formTemplates', JSON.stringify(formTemplates));
    
    closeSaveTemplateModal();
    showToast('템플릿이 저장되었습니다.', 'success');
}

function openTemplateListModal() {
    renderTemplateList();
    document.getElementById('templateListModal')?.classList.add('active');
}

function closeTemplateListModal() {
    document.getElementById('templateListModal')?.classList.remove('active');
}

function renderTemplateList() {
    const list = document.getElementById('templateList');
    if (!list) return;
    
    // Combine sample templates with user templates
    const allTemplates = [...sampleTemplates, ...formTemplates];
    
    if (allTemplates.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                </svg>
                <p>저장된 템플릿이 없습니다</p>
            </div>
        `;
        return;
    }
    
    // Group templates by category
    const categories = {};
    allTemplates.forEach(template => {
        const cat = template.category || '기타';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(template);
    });
    
    // Category order and colors
    const categoryOrder = ['DBA', 'Frontend', 'Backend', 'Infra', '보안', 'QA', '기획', '운영', '공통', '개발요청', '버그수정', '기능개선', '유지보수', '인사평가', '성과평가', '기타'];
    const categoryColors = {
        'DBA': '#6366f1',
        'Frontend': '#ec4899',
        'Backend': '#10b981',
        'Infra': '#f59e0b',
        '보안': '#ef4444',
        'QA': '#06b6d4',
        '기획': '#8b5cf6',
        '운영': '#f97316',
        '공통': '#64748b'
    };
    
    let html = '';
    
    // Sort categories
    const sortedCategories = Object.keys(categories).sort((a, b) => {
        const aIdx = categoryOrder.indexOf(a);
        const bIdx = categoryOrder.indexOf(b);
        if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
    });
    
    sortedCategories.forEach(category => {
        const templates = categories[category];
        const isSampleCategory = ['DBA', 'Frontend', 'Backend', 'Infra', '공통'].includes(category);
        const categoryColor = categoryColors[category] || 'var(--accent-primary)';
        
        html += `
            <div class="template-category-section">
                <div class="template-category-header" style="border-left-color: ${categoryColor}">
                    <span class="category-icon">${getCategoryIcon(category)}</span>
                    <span class="category-name">${category}</span>
                    <span class="category-count">${templates.length}개</span>
                </div>
                <div class="template-category-grid">
        `;
        
        templates.forEach(template => {
            const isSample = template.id.startsWith('sample_');
            html += `
                <div class="template-card ${isSample ? 'sample-template' : ''}" data-id="${template.id}">
                    ${isSample ? '<div class="sample-badge">📋 샘플</div>' : ''}
                    <div class="template-card-header">
                        <div>
                            <div class="template-card-title">${escapeHtml(template.name)}</div>
                        </div>
                    </div>
                    <div class="template-card-description">${escapeHtml(template.description || '설명 없음')}</div>
                    <div class="template-card-meta">
                        <span>컴포넌트 ${template.components.length}개</span>
                        <span>${isSample ? '기본 제공' : formatDate(template.createdAt)}</span>
                    </div>
                    <div class="template-card-actions">
                        <button class="btn-secondary" onclick="loadTemplate('${template.id}')">불러오기</button>
                        ${!isSample ? `<button class="btn-secondary" onclick="deleteTemplate('${template.id}')">삭제</button>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

function getCategoryIcon(category) {
    const icons = {
        'DBA': '🗄️',
        'Frontend': '🎨',
        'Backend': '⚙️',
        'Infra': '🖥️',
        '공통': '💬',
        '보안': '🔒',
        'QA': '🧪',
        '기획': '📋',
        '운영': '🔧',
        '개발요청': '💻',
        '버그수정': '🐛',
        '기능개선': '✨',
        '유지보수': '🔄',
        '인사평가': '👤',
        '성과평가': '📊',
        '프로젝트': '🚀',
        '평가': '⭐',
        '애자일': '🔄',
        '계약': '📄',
        '기술': '🔬',
        '배포': '🚀',
        '피드백': '📣',
        '기타': '📁'
    };
    return icons[category] || '📁';
}

function loadTemplate(templateId) {
    // Check sample templates first
    let template = sampleTemplates.find(t => t.id === templateId) || formTemplates.find(t => t.id === templateId);
    
    if (template) {
        if (formComponents.length > 0) {
            if (!confirm('현재 작업 중인 내용이 있습니다. 템플릿을 불러오시겠습니까?')) {
                return;
            }
        }
        
        saveToUndoStack();
        formComponents = JSON.parse(JSON.stringify(template.components));
        
        formComponents.forEach(comp => {
            comp.id = generateComponentId();
        });
        
        const formTitleInput = document.getElementById('formTitle');
        if (formTitleInput) {
            formTitleInput.value = template.formTitle || template.name;
        }
        
        renderCanvas();
        closeTemplateListModal();
        showToast('템플릿을 불러왔습니다.', 'success');
    }
}

function deleteTemplate(templateId) {
    if (confirm('이 템플릿을 삭제하시겠습니까?')) {
        formTemplates = formTemplates.filter(t => t.id !== templateId);
        localStorage.setItem('formTemplates', JSON.stringify(formTemplates));
        renderTemplateList();
        showToast('템플릿이 삭제되었습니다.', 'info');
    }
}

// ===== Preview =====
function previewForm() {
    if (formComponents.length === 0) {
        showToast('미리볼 컴포넌트가 없습니다.', 'error');
        return;
    }
    
    const formTitle = document.getElementById('formTitle')?.value;
    const previewTitle = document.getElementById('previewTitle');
    if (previewTitle) {
        previewTitle.textContent = formTitle || '요청서 미리보기';
    }
    
    const previewContainer = document.getElementById('previewForm');
    if (previewContainer) {
        previewContainer.style.display = 'grid';
        previewContainer.style.gridTemplateColumns = `repeat(${gridColumns}, 1fr)`;
        previewContainer.style.gap = '16px';
        
        previewContainer.innerHTML = formComponents.map(comp => {
            const colSpan = comp.colSpan || 1;
            const gridColumn = colSpan === 'full' ? '1 / -1' : `span ${colSpan}`;
            return `<div class="canvas-component" style="grid-column: ${gridColumn};">${renderComponentContent(comp)}</div>`;
        }).join('');
        
        previewContainer.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = false;
        });
        
        setupPreviewInteractions(previewContainer);
    }
    
    document.getElementById('previewModal')?.classList.add('active');
}

function setupPreviewInteractions(container) {
    // Rating stars
    container.querySelectorAll('.component-rating').forEach(rating => {
        const stars = rating.querySelectorAll('.rating-star');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                stars.forEach((s, i) => {
                    s.classList.toggle('active', i <= index);
                    s.setAttribute('fill', i <= index ? 'currentColor' : 'none');
                });
            });
        });
    });
    
    // Priority select
    container.querySelectorAll('.component-priority-select').forEach(priority => {
        const options = priority.querySelectorAll('.priority-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });
    });
    
    // Difficulty select
    container.querySelectorAll('.component-difficulty').forEach(difficulty => {
        const options = difficulty.querySelectorAll('.difficulty-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });
    });
    
    // Slider
    container.querySelectorAll('.component-slider').forEach(slider => {
        const valueDisplay = slider.parentElement.querySelector('.slider-value');
        slider.addEventListener('input', () => {
            if (valueDisplay) valueDisplay.textContent = slider.value;
        });
    });
    
    // Eval score buttons
    container.querySelectorAll('.eval-score-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.eval-score');
            parent.querySelectorAll('.eval-score-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Eval level options
    container.querySelectorAll('.eval-level-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const parent = opt.closest('.eval-level');
            parent.querySelectorAll('.eval-level-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        });
    });
    
    // Matrix cells
    container.querySelectorAll('.matrix-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            cell.classList.toggle('active');
        });
    });
}

function closePreviewModal() {
    document.getElementById('previewModal')?.classList.remove('active');
}

function submitPreviewForm() {
    showToast('요청서가 제출되었습니다. (데모)', 'success');
    closePreviewModal();
}

// ===== Modal Handlers =====
function setupModalHandlers() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
}

// ===== Utilities =====
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-message">${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 전역 노출 (다른 페이지에서 템플릿 접근용)
if (typeof window !== 'undefined') {
    window.sampleTemplates = sampleTemplates;
}
