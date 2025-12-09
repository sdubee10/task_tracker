// ===== Templates Data =====
// 이 파일은 신청서 작성 페이지에서 사용하는 템플릿 데이터입니다.
// form-builder.js의 sampleTemplates와 동기화됩니다.

const sampleTemplates = [
    // ===== 1. DBA팀 - 데이터 추출 요청서 =====
    {
        id: 'sample_dba_001',
        name: '🗄️ [DBA] 데이터 추출 요청서',
        description: 'DBA팀에 특정 데이터 추출을 요청할 때 사용합니다.',
        category: 'DBA',
        formTitle: '데이터 추출 요청서',
        components: [
            { id: 'dba1_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'dba1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'dba1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['마케팅팀', '영업팀', '재무팀', '인사팀', '기획팀', '운영팀'], colSpan: 1 },
            { id: 'dba1_4', type: 'deadline-input', label: '희망 완료일', required: true, colSpan: 1 },
            { id: 'dba1_5', type: 'divider', colSpan: 'full' },
            { id: 'dba1_6', type: 'section-header', text: '📊 데이터 요청 내용', colSpan: 'full' },
            { id: 'dba1_7', type: 'text-input', label: '요청 제목', placeholder: '예: 2024년 1분기 매출 데이터 추출', required: true, colSpan: 'full' },
            { id: 'dba1_8', type: 'select', label: '데이터 용도', required: true, options: ['보고서 작성', '분석/통계', '감사 자료', '외부 제출용', '기타'], colSpan: 1 },
            { id: 'dba1_9', type: 'select', label: '데이터 형식', required: true, options: ['Excel (.xlsx)', 'CSV', 'PDF', '기타'], colSpan: 1 },
            { id: 'dba1_10', type: 'textarea', label: '필요한 데이터 설명', placeholder: '어떤 데이터가 필요한지 상세히 설명해주세요.', required: true, rows: 6, colSpan: 'full' },
            { id: 'dba1_11', type: 'date-input', label: '데이터 조회 시작일', required: true, colSpan: 1 },
            { id: 'dba1_12', type: 'date-input', label: '데이터 조회 종료일', required: true, colSpan: 1 },
            { id: 'dba1_13', type: 'priority-select', label: '우선순위', colSpan: 1 },
            { id: 'dba1_14', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '최종 승인', role: 'DBA팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 2. DBA팀 - 테이블/컬럼 변경 요청서 =====
    {
        id: 'sample_dba_002',
        name: '🗄️ [DBA] 테이블/컬럼 변경 요청서',
        description: 'DBA팀에 테이블 생성이나 컬럼 추가/변경을 요청합니다.',
        category: 'DBA',
        formTitle: '테이블/컬럼 변경 요청서',
        components: [
            { id: 'dba2_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'dba2_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'dba2_3', type: 'project-select', label: '관련 프로젝트', required: true, options: ['ERP 시스템', '그룹웨어', '홈페이지', 'CRM', '신규 프로젝트', '기타'], colSpan: 1 },
            { id: 'dba2_4', type: 'deadline-input', label: '희망 완료일', required: true, colSpan: 1 },
            { id: 'dba2_5', type: 'divider', colSpan: 'full' },
            { id: 'dba2_6', type: 'section-header', text: '🔧 변경 요청 내용', colSpan: 'full' },
            { id: 'dba2_7', type: 'text-input', label: '요청 제목', placeholder: '예: 회원 테이블에 마케팅 동의 컬럼 추가', required: true, colSpan: 'full' },
            { id: 'dba2_8', type: 'radio', label: '변경 유형', options: ['신규 테이블 생성', '컬럼 추가', '컬럼 변경', '컬럼 삭제', '인덱스 추가/변경'], required: true, colSpan: 'full' },
            { id: 'dba2_9', type: 'text-input', label: '대상 테이블명', placeholder: '변경하려는 테이블명을 입력하세요', required: true, colSpan: 'full' },
            { id: 'dba2_10', type: 'textarea', label: '변경 상세 내용', placeholder: '변경하려는 내용을 상세히 설명해주세요.', required: true, rows: 6, colSpan: 'full' },
            { id: 'dba2_11', type: 'textarea', label: '변경 사유', placeholder: '왜 이 변경이 필요한지 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'dba2_12', type: 'priority-select', label: '우선순위', colSpan: 1 },
            { id: 'dba2_13', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '개발팀장' }, { title: '2차 승인', role: 'DBA팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 3. Frontend팀 - 화면 개발 요청서 =====
    {
        id: 'sample_fe_001',
        name: '🎨 [Frontend] 화면 개발 요청서',
        description: 'Frontend팀에 새로운 화면 개발이나 수정을 요청합니다.',
        category: 'Frontend',
        formTitle: '화면 개발 요청서',
        components: [
            { id: 'fe1_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['마케팅팀', '영업팀', '기획팀', '운영팀', '고객지원팀'], colSpan: 1 },
            { id: 'fe1_4', type: 'project-select', label: '대상 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', '기타'], colSpan: 1 },
            { id: 'fe1_5', type: 'divider', colSpan: 'full' },
            { id: 'fe1_6', type: 'section-header', text: '🖼️ 화면 요청 내용', colSpan: 'full' },
            { id: 'fe1_7', type: 'text-input', label: '요청 제목', placeholder: '예: 이벤트 페이지 신규 개발', required: true, colSpan: 'full' },
            { id: 'fe1_8', type: 'radio', label: '요청 유형', options: ['신규 화면 개발', '기존 화면 수정', '디자인 변경', '오류 수정'], required: true, colSpan: 'full' },
            { id: 'fe1_9', type: 'textarea', label: '화면 설명', placeholder: '어떤 화면이 필요한지 상세히 설명해주세요.', required: true, rows: 6, colSpan: 'full' },
            { id: 'fe1_10', type: 'checkbox', label: '필요한 기능', options: ['목록 조회', '상세 보기', '등록/수정 폼', '삭제 기능', '검색 기능', '엑셀 다운로드'], colSpan: 'full' },
            { id: 'fe1_11', type: 'priority-select', label: '우선순위', required: true, colSpan: 1 },
            { id: 'fe1_12', type: 'deadline-input', label: '희망 완료일', required: true, colSpan: 1 },
            { id: 'fe1_13', type: 'file-upload', label: '디자인 시안/기획서', accept: '.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg', multiple: true, required: false, colSpan: 'full' },
            { id: 'fe1_14', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '최종 승인', role: 'Frontend팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 4. Frontend팀 - UI/UX 개선 요청서 =====
    {
        id: 'sample_fe_002',
        name: '🎨 [Frontend] UI/UX 개선 요청서',
        description: '기존 화면의 사용성 개선이나 디자인 변경을 요청합니다.',
        category: 'Frontend',
        formTitle: 'UI/UX 개선 요청서',
        components: [
            { id: 'fe2_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe2_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe2_3', type: 'project-select', label: '대상 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', '기타'], colSpan: 1 },
            { id: 'fe2_4', type: 'text-input', label: '개선 대상 화면 URL', placeholder: 'https://...', required: true, colSpan: 1 },
            { id: 'fe2_5', type: 'divider', colSpan: 'full' },
            { id: 'fe2_6', type: 'section-header', text: '🔍 현재 문제점', colSpan: 'full' },
            { id: 'fe2_7', type: 'text-input', label: '요청 제목', placeholder: '예: 주문 목록 화면 검색 기능 개선', required: true, colSpan: 'full' },
            { id: 'fe2_8', type: 'checkbox', label: '문제 유형', options: ['사용하기 어려움', '찾기 어려움', '느림/로딩 오래 걸림', '디자인 개선 필요', '모바일에서 불편'], colSpan: 'full' },
            { id: 'fe2_9', type: 'textarea', label: '현재 문제점 설명', placeholder: '현재 어떤 점이 불편하거나 문제인지 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'fe2_10', type: 'textarea', label: '원하는 개선 내용', placeholder: '어떻게 개선되면 좋을지 설명해주세요.', required: true, rows: 5, colSpan: 'full' },
            { id: 'fe2_11', type: 'image-upload', label: '문제 화면 캡처', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'fe2_12', type: 'priority-select', label: '긴급도', required: true, colSpan: 1 },
            { id: 'fe2_13', type: 'deadline-input', label: '희망 완료일', required: false, colSpan: 1 },
            { id: 'fe2_14', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '승인', role: 'Frontend팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 5. Backend팀 - API/기능 개발 요청서 =====
    {
        id: 'sample_be_001',
        name: '⚙️ [Backend] API/기능 개발 요청서',
        description: 'Backend팀에 새로운 API나 서버 기능 개발을 요청합니다.',
        category: 'Backend',
        formTitle: 'API/기능 개발 요청서',
        components: [
            { id: 'be1_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['기획팀', 'Frontend팀', '운영팀', '마케팅팀', '영업팀'], colSpan: 1 },
            { id: 'be1_4', type: 'project-select', label: '대상 시스템', required: true, options: ['홈페이지', '관리자 시스템', '모바일 앱', 'ERP', 'CRM', '기타'], colSpan: 1 },
            { id: 'be1_5', type: 'divider', colSpan: 'full' },
            { id: 'be1_6', type: 'section-header', text: '🔧 개발 요청 내용', colSpan: 'full' },
            { id: 'be1_7', type: 'text-input', label: '요청 제목', placeholder: '예: 회원 포인트 적립 API 개발', required: true, colSpan: 'full' },
            { id: 'be1_8', type: 'radio', label: '요청 유형', options: ['신규 기능 개발', '기존 기능 수정', '기능 삭제', '성능 개선', '버그 수정'], required: true, colSpan: 'full' },
            { id: 'be1_9', type: 'textarea', label: '기능 설명', placeholder: '필요한 기능을 상세히 설명해주세요.', required: true, rows: 6, colSpan: 'full' },
            { id: 'be1_10', type: 'textarea', label: '비즈니스 요구사항', placeholder: '왜 이 기능이 필요한지, 비즈니스적 배경을 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'be1_11', type: 'checkbox', label: '연관 시스템', options: ['회원 시스템', '주문 시스템', '결제 시스템', '재고 시스템', '알림 시스템', '외부 연동'], colSpan: 'full' },
            { id: 'be1_12', type: 'priority-select', label: '우선순위', required: true, colSpan: 1 },
            { id: 'be1_13', type: 'deadline-input', label: '희망 완료일', required: true, colSpan: 1 },
            { id: 'be1_14', type: 'file-upload', label: '기획서/요구사항 문서', accept: '.pdf,.doc,.docx,.xlsx,.ppt,.pptx', multiple: true, required: false, colSpan: 'full' },
            { id: 'be1_15', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '기술 검토', role: 'Backend팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 6. Backend팀 - 배치/자동화 작업 요청서 =====
    {
        id: 'sample_be_002',
        name: '⚙️ [Backend] 배치/자동화 작업 요청서',
        description: '정기적으로 실행되는 배치 작업이나 자동화 처리를 요청합니다.',
        category: 'Backend',
        formTitle: '배치/자동화 작업 요청서',
        components: [
            { id: 'be2_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be2_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be2_3', type: 'department-select', label: '요청 부서', required: true, departments: ['운영팀', '재무팀', '인사팀', '마케팅팀', '영업팀'], colSpan: 1 },
            { id: 'be2_4', type: 'deadline-input', label: '희망 완료일', required: true, colSpan: 1 },
            { id: 'be2_5', type: 'divider', colSpan: 'full' },
            { id: 'be2_6', type: 'section-header', text: '⏰ 배치 작업 내용', colSpan: 'full' },
            { id: 'be2_7', type: 'text-input', label: '요청 제목', placeholder: '예: 매일 새벽 매출 집계 자동화', required: true, colSpan: 'full' },
            { id: 'be2_8', type: 'radio', label: '실행 주기', options: ['매일', '매주', '매월', '특정 요일', '1회성'], required: true, colSpan: 1 },
            { id: 'be2_9', type: 'text-input', label: '실행 시간', placeholder: '예: 매일 새벽 3시', required: true, colSpan: 1 },
            { id: 'be2_10', type: 'textarea', label: '작업 내용 설명', placeholder: '자동으로 처리되어야 할 작업을 설명해주세요.', required: true, rows: 6, colSpan: 'full' },
            { id: 'be2_11', type: 'checkbox', label: '결과 알림 방법', options: ['이메일 발송', '슬랙/메신저 알림', '파일 생성', '알림 불필요'], colSpan: 'full' },
            { id: 'be2_12', type: 'email-input', label: '결과 수신 이메일', placeholder: 'example@company.com', required: false, colSpan: 'full' },
            { id: 'be2_13', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '최종 승인', role: 'Backend팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 7. Infra팀 - 서버/자원 신청서 =====
    {
        id: 'sample_infra_001',
        name: '🖥️ [Infra] 서버/자원 신청서',
        description: '새로운 서버, 스토리지 등 인프라 자원을 요청합니다.',
        category: 'Infra',
        formTitle: '서버/자원 신청서',
        components: [
            { id: 'infra1_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'infra1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'infra1_3', type: 'department-select', label: '요청 부서', required: true, departments: ['개발팀', 'DBA팀', 'Backend팀', 'Frontend팀', '운영팀'], colSpan: 1 },
            { id: 'infra1_4', type: 'project-select', label: '용도/프로젝트', required: true, options: ['신규 서비스', '기존 서비스 확장', '개발/테스트 환경', '백업/DR', '기타'], colSpan: 1 },
            { id: 'infra1_5', type: 'divider', colSpan: 'full' },
            { id: 'infra1_6', type: 'section-header', text: '🖥️ 자원 요청 내용', colSpan: 'full' },
            { id: 'infra1_7', type: 'text-input', label: '요청 제목', placeholder: '예: 신규 웹서버 2대 구축 요청', required: true, colSpan: 'full' },
            { id: 'infra1_8', type: 'checkbox', label: '필요한 자원 유형', options: ['서버 (VM/물리)', '스토리지', '데이터베이스', '로드밸런서', 'CDN', '도메인/SSL', '기타'], colSpan: 'full' },
            { id: 'infra1_9', type: 'radio', label: '환경 구분', options: ['운영 환경', '개발 환경', '테스트 환경', '스테이징 환경'], required: true, colSpan: 1 },
            { id: 'infra1_10', type: 'number-input', label: '필요 수량', placeholder: '1', required: true, min: 1, max: 100, colSpan: 1 },
            { id: 'infra1_11', type: 'textarea', label: '상세 스펙 요청', placeholder: '필요한 사양을 설명해주세요.\n예: CPU: 4코어, 메모리: 16GB, 디스크: 100GB SSD', required: true, rows: 5, colSpan: 'full' },
            { id: 'infra1_12', type: 'textarea', label: '용도 설명', placeholder: '이 자원을 어떤 용도로 사용할 예정인지 설명해주세요.', required: true, rows: 3, colSpan: 'full' },
            { id: 'infra1_13', type: 'deadline-input', label: '필요 시점', required: true, colSpan: 1 },
            { id: 'infra1_14', type: 'priority-select', label: '우선순위', colSpan: 1 },
            { id: 'infra1_15', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '인프라 검토', role: 'Infra팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 8. Infra팀 - 권한/계정 신청서 =====
    {
        id: 'sample_infra_002',
        name: '🖥️ [Infra] 권한/계정 신청서',
        description: '서버 접속 권한, 시스템 계정 등 접근 권한을 요청합니다.',
        category: 'Infra',
        formTitle: '권한/계정 신청서',
        components: [
            { id: 'infra2_1', type: 'section-header', text: '📌 신청자 정보', colSpan: 'full' },
            { id: 'infra2_2', type: 'requester-info', label: '신청자 정보', colSpan: 'full' },
            { id: 'infra2_3', type: 'department-select', label: '소속 부서', required: true, departments: ['개발팀', 'DBA팀', 'Backend팀', 'Frontend팀', '운영팀', '기획팀'], colSpan: 1 },
            { id: 'infra2_4', type: 'text-input', label: '직책/직급', placeholder: '예: 대리, 과장, 팀장', required: true, colSpan: 1 },
            { id: 'infra2_5', type: 'divider', colSpan: 'full' },
            { id: 'infra2_6', type: 'section-header', text: '🔐 권한 요청 내용', colSpan: 'full' },
            { id: 'infra2_7', type: 'text-input', label: '요청 제목', placeholder: '예: 운영 서버 SSH 접속 권한 요청', required: true, colSpan: 'full' },
            { id: 'infra2_8', type: 'checkbox', label: '신청 권한 유형', options: ['서버 SSH 접속', 'DB 접속 권한', 'VPN 계정', '클라우드 콘솔', '모니터링 시스템', 'CI/CD 시스템', '기타'], colSpan: 'full' },
            { id: 'infra2_9', type: 'text-input', label: '대상 서버/시스템명', placeholder: '예: web-server-01, db-master', required: true, colSpan: 'full' },
            { id: 'infra2_10', type: 'radio', label: '권한 수준', options: ['읽기 전용', '읽기/쓰기', '관리자'], required: true, colSpan: 1 },
            { id: 'infra2_11', type: 'radio', label: '사용 기간', options: ['상시', '1개월', '3개월', '6개월', '프로젝트 기간'], required: true, colSpan: 1 },
            { id: 'infra2_12', type: 'textarea', label: '권한 필요 사유', placeholder: '왜 이 권한이 필요한지 구체적으로 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'infra2_13', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '보안 검토', role: '보안담당자' }, { title: '최종 승인', role: 'Infra팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 9. 공통 - 버그/오류 신고서 =====
    {
        id: 'sample_common_001',
        name: '🐛 [공통] 버그/오류 신고서',
        description: '시스템 사용 중 발견한 버그나 오류를 신고합니다.',
        category: '공통',
        formTitle: '버그/오류 신고서',
        components: [
            { id: 'common1_1', type: 'section-header', text: '📌 신고자 정보', colSpan: 'full' },
            { id: 'common1_2', type: 'requester-info', label: '신고자 정보', colSpan: 'full' },
            { id: 'common1_3', type: 'department-select', label: '소속 부서', required: true, departments: ['마케팅팀', '영업팀', '재무팀', '인사팀', '기획팀', '운영팀', '고객지원팀'], colSpan: 1 },
            { id: 'common1_4', type: 'date-input', label: '발생 일시', required: true, colSpan: 1 },
            { id: 'common1_5', type: 'divider', colSpan: 'full' },
            { id: 'common1_6', type: 'section-header', text: '🐛 오류 내용', colSpan: 'full' },
            { id: 'common1_7', type: 'text-input', label: '오류 제목', placeholder: '예: 로그인 시 화면이 멈추는 현상', required: true, colSpan: 'full' },
            { id: 'common1_8', type: 'select', label: '발생 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', 'CRM', '기타'], colSpan: 1 },
            { id: 'common1_9', type: 'select', label: '오류 심각도', required: true, options: ['심각 (업무 불가)', '높음 (주요 기능 장애)', '보통 (일부 기능 장애)', '낮음 (불편하지만 사용 가능)'], colSpan: 1 },
            { id: 'common1_10', type: 'text-input', label: '오류 발생 URL/화면', placeholder: 'https://... 또는 화면명', required: true, colSpan: 'full' },
            { id: 'common1_11', type: 'textarea', label: '오류 상세 설명', placeholder: '어떤 오류가 발생했는지 자세히 설명해주세요.', required: true, rows: 5, colSpan: 'full' },
            { id: 'common1_12', type: 'textarea', label: '재현 방법', placeholder: '오류를 다시 발생시키는 방법을 단계별로 설명해주세요.', required: false, rows: 4, colSpan: 'full' },
            { id: 'common1_13', type: 'radio', label: '발생 빈도', options: ['항상 발생', '자주 발생', '가끔 발생', '1회만 발생'], required: true, colSpan: 1 },
            { id: 'common1_14', type: 'radio', label: '사용 브라우저/환경', options: ['Chrome', 'Edge', 'Safari', '모바일 앱', '기타'], required: true, colSpan: 1 },
            { id: 'common1_15', type: 'image-upload', label: '오류 화면 캡처', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'common1_16', type: 'approval-flow', label: '접수 확인', steps: [{ title: '접수', role: 'IT헬프데스크' }, { title: '담당 배정', role: '담당팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 10. 공통 - 기능 개선 제안서 =====
    {
        id: 'sample_common_002',
        name: '💡 [공통] 기능 개선 제안서',
        description: '시스템 사용 중 느낀 개선점이나 새로운 아이디어를 제안합니다.',
        category: '공통',
        formTitle: '기능 개선 제안서',
        components: [
            { id: 'common2_1', type: 'section-header', text: '📌 제안자 정보', colSpan: 'full' },
            { id: 'common2_2', type: 'requester-info', label: '제안자 정보', colSpan: 'full' },
            { id: 'common2_3', type: 'department-select', label: '소속 부서', required: true, departments: ['마케팅팀', '영업팀', '재무팀', '인사팀', '기획팀', '운영팀', '고객지원팀', '개발팀'], colSpan: 'full' },
            { id: 'common2_4', type: 'divider', colSpan: 'full' },
            { id: 'common2_5', type: 'section-header', text: '💡 개선 제안 내용', colSpan: 'full' },
            { id: 'common2_6', type: 'text-input', label: '제안 제목', placeholder: '예: 주문 목록 엑셀 다운로드 기능 추가', required: true, colSpan: 'full' },
            { id: 'common2_7', type: 'select', label: '대상 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', 'CRM', '기타'], colSpan: 1 },
            { id: 'common2_8', type: 'select', label: '제안 유형', required: true, options: ['신규 기능', '기능 개선', '사용성 개선', '성능 개선', '디자인 개선', '기타'], colSpan: 1 },
            { id: 'common2_9', type: 'textarea', label: '현재 불편한 점', placeholder: '현재 어떤 점이 불편하거나 아쉬운지 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'common2_10', type: 'textarea', label: '개선 제안 내용', placeholder: '어떻게 개선되면 좋을지 구체적으로 설명해주세요.', required: true, rows: 4, colSpan: 'full' },
            { id: 'common2_11', type: 'textarea', label: '기대 효과', placeholder: '이 개선이 이루어지면 어떤 효과가 있을지 설명해주세요.', required: false, rows: 3, colSpan: 'full' },
            { id: 'common2_12', type: 'image-upload', label: '참고 이미지', accept: 'image/*', multiple: true, required: false, colSpan: 1 },
            { id: 'common2_13', type: 'link-input', label: '참고 사이트', placeholder: 'https://...', required: false, colSpan: 1 },
            { id: 'common2_14', type: 'approval-flow', label: '검토 라인', steps: [{ title: '접수', role: 'IT헬프데스크' }, { title: '검토', role: '담당팀장' }], colSpan: 'full' }
        ]
    },
    // ===== 11-20: 추가 템플릿들 =====
    {
        id: 'sample_dba_003',
        name: '🗄️ [DBA] DB 성능 개선 요청서',
        description: '느린 쿼리, 시스템 지연 등 데이터베이스 성능 문제 개선을 요청합니다.',
        category: 'DBA',
        formTitle: 'DB 성능 개선 요청서',
        components: [
            { id: 'dba3_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'dba3_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'dba3_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'dba3_4', type: 'text-input', label: '문제 발생 화면/기능', required: true, colSpan: 'full' },
            { id: 'dba3_5', type: 'textarea', label: '현재 문제 상황', required: true, rows: 4, colSpan: 'full' },
            { id: 'dba3_6', type: 'priority-select', label: '긴급도', required: true, colSpan: 1 },
            { id: 'dba3_7', type: 'approval-flow', label: '결재 라인', steps: [{ title: '접수', role: 'DBA팀' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_fe_003',
        name: '🎨 [Frontend] 모바일 앱 기능 요청서',
        description: '모바일 앱의 새로운 기능 개발이나 화면 수정을 요청합니다.',
        category: 'Frontend',
        formTitle: '모바일 앱 기능 요청서',
        components: [
            { id: 'fe3_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe3_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe3_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'fe3_4', type: 'checkbox', label: '대상 플랫폼', options: ['iOS', 'Android', '둘 다'], colSpan: 1 },
            { id: 'fe3_5', type: 'textarea', label: '기능 설명', required: true, rows: 5, colSpan: 'full' },
            { id: 'fe3_6', type: 'priority-select', label: '우선순위', required: true, colSpan: 1 },
            { id: 'fe3_7', type: 'deadline-input', label: '희망 완료일', required: true, colSpan: 1 },
            { id: 'fe3_8', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '승인', role: 'Frontend팀장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_be_003',
        name: '⚙️ [Backend] 외부 시스템 연동 요청서',
        description: '외부 서비스나 시스템과의 연동을 요청합니다.',
        category: 'Backend',
        formTitle: '외부 시스템 연동 요청서',
        components: [
            { id: 'be3_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be3_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be3_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'be3_4', type: 'text-input', label: '연동 대상 서비스명', required: true, colSpan: 'full' },
            { id: 'be3_5', type: 'radio', label: '연동 방식', options: ['API 연동', '파일 연동', '웹훅', '기타'], required: true, colSpan: 'full' },
            { id: 'be3_6', type: 'textarea', label: '연동 목적 및 내용', required: true, rows: 5, colSpan: 'full' },
            { id: 'be3_7', type: 'deadline-input', label: '희망 완료일', required: true, colSpan: 1 },
            { id: 'be3_8', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '기술 검토', role: 'Backend팀장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_infra_003',
        name: '🖥️ [Infra] 도메인/SSL 인증서 요청서',
        description: '새로운 도메인 등록이나 SSL 인증서 발급/갱신을 요청합니다.',
        category: 'Infra',
        formTitle: '도메인/SSL 인증서 요청서',
        components: [
            { id: 'infra3_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'infra3_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'infra3_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'infra3_4', type: 'checkbox', label: '요청 유형', options: ['신규 도메인 등록', '서브도메인 추가', 'SSL 인증서 신규 발급', 'SSL 인증서 갱신'], colSpan: 'full' },
            { id: 'infra3_5', type: 'text-input', label: '도메인 주소', placeholder: 'example.company.com', required: true, colSpan: 'full' },
            { id: 'infra3_6', type: 'textarea', label: '용도 설명', required: true, rows: 3, colSpan: 'full' },
            { id: 'infra3_7', type: 'deadline-input', label: '필요 시점', required: true, colSpan: 1 },
            { id: 'infra3_8', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '승인', role: 'Infra팀장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_qa_001',
        name: '🧪 [QA] 테스트 요청서',
        description: '신규 기능이나 수정 사항에 대한 QA 테스트를 요청합니다.',
        category: 'QA',
        formTitle: '테스트 요청서',
        components: [
            { id: 'qa1_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'qa1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'qa1_3', type: 'text-input', label: '테스트 대상', required: true, colSpan: 'full' },
            { id: 'qa1_4', type: 'radio', label: '테스트 유형', options: ['신규 기능', '버그 수정', '기능 개선', '전체 회귀 테스트'], required: true, colSpan: 1 },
            { id: 'qa1_5', type: 'select', label: '대상 환경', required: true, options: ['개발 서버', '스테이징 서버', '운영 서버'], colSpan: 1 },
            { id: 'qa1_6', type: 'textarea', label: '변경/추가 내용', required: true, rows: 4, colSpan: 'full' },
            { id: 'qa1_7', type: 'checkbox', label: '테스트 범위', options: ['기능 테스트', 'UI 테스트', '성능 테스트', '보안 테스트', '호환성 테스트'], colSpan: 'full' },
            { id: 'qa1_8', type: 'deadline-input', label: '테스트 완료 희망일', required: true, colSpan: 1 },
            { id: 'qa1_9', type: 'approval-flow', label: '처리 라인', steps: [{ title: '접수', role: 'QA팀' }, { title: '테스트', role: 'QA담당자' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_security_001',
        name: '🔒 [보안] 보안 점검 요청서',
        description: '신규 서비스나 기능에 대한 보안 점검을 요청합니다.',
        category: '보안',
        formTitle: '보안 점검 요청서',
        components: [
            { id: 'sec1_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'sec1_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'sec1_3', type: 'text-input', label: '점검 대상', required: true, colSpan: 'full' },
            { id: 'sec1_4', type: 'radio', label: '점검 유형', options: ['신규 서비스 오픈 전', '정기 점검', '취약점 발견 후', '외부 감사 대응'], required: true, colSpan: 'full' },
            { id: 'sec1_5', type: 'checkbox', label: '점검 항목', options: ['웹 취약점 점검', 'API 보안 점검', '인증/권한 점검', '개인정보 처리 점검', '암호화 점검'], colSpan: 'full' },
            { id: 'sec1_6', type: 'textarea', label: '서비스 설명', required: true, rows: 4, colSpan: 'full' },
            { id: 'sec1_7', type: 'deadline-input', label: '점검 희망일', required: true, colSpan: 1 },
            { id: 'sec1_8', type: 'approval-flow', label: '결재 라인', steps: [{ title: '접수', role: '보안팀' }, { title: '점검', role: '보안담당자' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_plan_001',
        name: '📝 [기획] 요구사항 정의서',
        description: '새로운 기능이나 서비스에 대한 요구사항을 정의합니다.',
        category: '기획',
        formTitle: '요구사항 정의서',
        components: [
            { id: 'plan1_1', type: 'section-header', text: '📌 기본 정보', colSpan: 'full' },
            { id: 'plan1_2', type: 'requester-info', label: '작성자 정보', colSpan: 'full' },
            { id: 'plan1_3', type: 'project-select', label: '프로젝트', required: true, options: ['신규 프로젝트', '홈페이지 개편', 'ERP 고도화', '모바일 앱', 'CRM 구축', '기타'], colSpan: 1 },
            { id: 'plan1_4', type: 'text-input', label: '요구사항명', required: true, colSpan: 'full' },
            { id: 'plan1_5', type: 'select', label: '요구사항 유형', required: true, options: ['기능 요구사항', '비기능 요구사항', '인터페이스 요구사항', '데이터 요구사항', '보안 요구사항'], colSpan: 1 },
            { id: 'plan1_6', type: 'priority-select', label: '우선순위', required: true, colSpan: 1 },
            { id: 'plan1_7', type: 'textarea', label: '요구사항 설명', required: true, rows: 6, colSpan: 'full' },
            { id: 'plan1_8', type: 'textarea', label: '수용 기준', required: true, rows: 4, colSpan: 'full' },
            { id: 'plan1_9', type: 'approval-flow', label: '검토 라인', steps: [{ title: '검토', role: '기획팀장' }, { title: '승인', role: '개발팀장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_common_003',
        name: '❓ [공통] 시스템 사용 문의',
        description: '시스템 사용 방법이나 기능에 대한 문의를 등록합니다.',
        category: '공통',
        formTitle: '시스템 사용 문의',
        components: [
            { id: 'common3_1', type: 'section-header', text: '📌 문의자 정보', colSpan: 'full' },
            { id: 'common3_2', type: 'requester-info', label: '문의자 정보', colSpan: 'full' },
            { id: 'common3_3', type: 'text-input', label: '문의 제목', required: true, colSpan: 'full' },
            { id: 'common3_4', type: 'select', label: '문의 시스템', required: true, options: ['홈페이지', '관리자 페이지', '모바일 앱', '그룹웨어', 'ERP', 'CRM', '기타'], colSpan: 1 },
            { id: 'common3_5', type: 'select', label: '문의 유형', required: true, options: ['사용 방법 문의', '기능 문의', '권한 문의', '오류 문의', '기타'], colSpan: 1 },
            { id: 'common3_6', type: 'textarea', label: '문의 내용', required: true, rows: 5, colSpan: 'full' },
            { id: 'common3_7', type: 'image-upload', label: '화면 캡처', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'common3_8', type: 'approval-flow', label: '처리 라인', steps: [{ title: '접수/답변', role: 'IT헬프데스크' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_common_004',
        name: '📚 [공통] 교육/매뉴얼 요청서',
        description: '시스템 사용 교육이나 매뉴얼 제작을 요청합니다.',
        category: '공통',
        formTitle: '교육/매뉴얼 요청서',
        components: [
            { id: 'common4_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'common4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'common4_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'common4_4', type: 'radio', label: '요청 유형', options: ['집합 교육', '온라인 교육', '매뉴얼 제작', '동영상 제작', '1:1 교육'], required: true, colSpan: 'full' },
            { id: 'common4_5', type: 'select', label: '대상 시스템', required: true, options: ['ERP', '그룹웨어', '홈페이지 관리자', 'CRM', '전체 시스템', '기타'], colSpan: 1 },
            { id: 'common4_6', type: 'number-input', label: '교육 대상 인원', placeholder: '10', required: false, min: 1, max: 999, colSpan: 1 },
            { id: 'common4_7', type: 'textarea', label: '교육 내용/범위', required: true, rows: 4, colSpan: 'full' },
            { id: 'common4_8', type: 'deadline-input', label: '희망 일정', required: true, colSpan: 1 },
            { id: 'common4_9', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '일정 조율', role: 'IT헬프데스크' }], colSpan: 'full' }
        ]
    },
    // 21-30: 더 많은 템플릿 추가
    {
        id: 'sample_be_004',
        name: '⚙️ [Backend] 알림/메시지 발송 요청서',
        description: 'SMS, 카카오톡, 이메일 등 대량 메시지 발송을 요청합니다.',
        category: 'Backend',
        formTitle: '알림/메시지 발송 요청서',
        components: [
            { id: 'be4_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be4_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'be4_4', type: 'checkbox', label: '발송 채널', options: ['SMS', '카카오 알림톡', '이메일', '앱 푸시'], colSpan: 'full' },
            { id: 'be4_5', type: 'textarea', label: '메시지 내용', required: true, rows: 5, colSpan: 'full' },
            { id: 'be4_6', type: 'deadline-input', label: '발송 희망일시', required: true, colSpan: 1 },
            { id: 'be4_7', type: 'approval-flow', label: '결재 라인', steps: [{ title: '내용 검토', role: '팀장' }, { title: '발송 승인', role: '부서장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_infra_004',
        name: '🖥️ [Infra] 백업/복구 요청서',
        description: '데이터 백업 설정이나 장애 시 데이터 복구를 요청합니다.',
        category: 'Infra',
        formTitle: '백업/복구 요청서',
        components: [
            { id: 'infra4_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'infra4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'infra4_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'infra4_4', type: 'radio', label: '요청 유형', options: ['데이터 복구', '백업 설정 추가', '백업 주기 변경', '백업 확인/검증'], required: true, colSpan: 'full' },
            { id: 'infra4_5', type: 'text-input', label: '대상 시스템/서버', required: true, colSpan: 'full' },
            { id: 'infra4_6', type: 'textarea', label: '상세 요청 내용', required: true, rows: 5, colSpan: 'full' },
            { id: 'infra4_7', type: 'priority-select', label: '긴급도', required: true, colSpan: 1 },
            { id: 'infra4_8', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '최종 승인', role: 'Infra팀장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_fe_004',
        name: '🎨 [Frontend] 이메일 템플릿 제작 요청서',
        description: '마케팅 이메일, 뉴스레터 등의 HTML 템플릿 제작을 요청합니다.',
        category: 'Frontend',
        formTitle: '이메일 템플릿 제작 요청서',
        components: [
            { id: 'fe4_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe4_3', type: 'text-input', label: '이메일 제목', required: true, colSpan: 'full' },
            { id: 'fe4_4', type: 'select', label: '이메일 유형', required: true, options: ['프로모션/이벤트', '뉴스레터', '공지사항', '가입환영', '기타'], colSpan: 1 },
            { id: 'fe4_5', type: 'textarea', label: '이메일 내용', required: true, rows: 6, colSpan: 'full' },
            { id: 'fe4_6', type: 'image-upload', label: '사용할 이미지', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'fe4_7', type: 'deadline-input', label: '발송 예정일', required: true, colSpan: 1 },
            { id: 'fe4_8', type: 'approval-flow', label: '결재 라인', steps: [{ title: '내용 검토', role: '팀장' }, { title: '제작', role: 'Frontend팀' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_dba_004',
        name: '🗄️ [DBA] 데이터 정정 요청서',
        description: '잘못 입력된 데이터의 수정/삭제를 요청합니다.',
        category: 'DBA',
        formTitle: '데이터 정정 요청서',
        components: [
            { id: 'dba4_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'dba4_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'dba4_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'dba4_4', type: 'radio', label: '정정 유형', options: ['데이터 수정', '데이터 삭제', '데이터 복구', '대량 데이터 변경'], required: true, colSpan: 'full' },
            { id: 'dba4_5', type: 'text-input', label: '대상 테이블/화면', required: true, colSpan: 'full' },
            { id: 'dba4_6', type: 'textarea', label: '현재 데이터 (변경 전)', required: true, rows: 3, colSpan: 'full' },
            { id: 'dba4_7', type: 'textarea', label: '변경할 데이터 (변경 후)', required: true, rows: 3, colSpan: 'full' },
            { id: 'dba4_8', type: 'textarea', label: '정정 사유', required: true, rows: 2, colSpan: 'full' },
            { id: 'dba4_9', type: 'priority-select', label: '긴급도', required: true, colSpan: 1 },
            { id: 'dba4_10', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 승인', role: '팀장' }, { title: '2차 승인', role: '부서장' }, { title: '최종 처리', role: 'DBA팀장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_security_002',
        name: '🔒 [보안] 개인정보 처리 요청서',
        description: '개인정보 열람, 삭제, 정정 등 개인정보 관련 처리를 요청합니다.',
        category: '보안',
        formTitle: '개인정보 처리 요청서',
        components: [
            { id: 'sec2_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'sec2_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'sec2_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'sec2_4', type: 'radio', label: '처리 유형', options: ['개인정보 열람', '개인정보 정정', '개인정보 삭제', '처리정지 요청', '동의 철회'], required: true, colSpan: 'full' },
            { id: 'sec2_5', type: 'text-input', label: '대상자 정보', placeholder: '처리 대상자 식별 정보', required: true, colSpan: 'full' },
            { id: 'sec2_6', type: 'textarea', label: '요청 사유', required: true, rows: 4, colSpan: 'full' },
            { id: 'sec2_7', type: 'file-upload', label: '증빙 자료', accept: '*', multiple: true, required: false, colSpan: 'full' },
            { id: 'sec2_8', type: 'priority-select', label: '긴급도', required: true, colSpan: 1 },
            { id: 'sec2_9', type: 'approval-flow', label: '결재 라인', steps: [{ title: '1차 검토', role: '팀장' }, { title: '개인정보 검토', role: '개인정보보호담당자' }, { title: '최종 승인', role: '보안팀장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_be_005',
        name: '⚙️ [Backend] 보고서/통계 개발 요청서',
        description: '새로운 보고서나 통계 화면 개발을 요청합니다.',
        category: 'Backend',
        formTitle: '보고서/통계 개발 요청서',
        components: [
            { id: 'be5_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'be5_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'be5_3', type: 'text-input', label: '보고서명', required: true, colSpan: 'full' },
            { id: 'be5_4', type: 'select', label: '보고서 유형', required: true, options: ['매출/실적', '회원/고객', '상품/재고', '마케팅 성과', '운영 현황', '기타'], colSpan: 1 },
            { id: 'be5_5', type: 'radio', label: '갱신 주기', options: ['실시간', '일별', '주별', '월별', '수동'], required: true, colSpan: 1 },
            { id: 'be5_6', type: 'textarea', label: '필요한 항목/지표', required: true, rows: 5, colSpan: 'full' },
            { id: 'be5_7', type: 'checkbox', label: '출력 형식', options: ['화면 조회', '엑셀 다운로드', 'PDF 다운로드', '차트/그래프'], colSpan: 'full' },
            { id: 'be5_8', type: 'deadline-input', label: '희망 완료일', required: true, colSpan: 1 },
            { id: 'be5_9', type: 'approval-flow', label: '결재 라인', steps: [{ title: '요건 검토', role: '팀장' }, { title: '기술 검토', role: 'Backend팀장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_fe_005',
        name: '🎨 [Frontend] 랜딩페이지 제작 요청서',
        description: '이벤트, 프로모션, 캠페인용 랜딩페이지 제작을 요청합니다.',
        category: 'Frontend',
        formTitle: '랜딩페이지 제작 요청서',
        components: [
            { id: 'fe5_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'fe5_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'fe5_3', type: 'text-input', label: '페이지 제목', required: true, colSpan: 'full' },
            { id: 'fe5_4', type: 'select', label: '페이지 유형', required: true, options: ['이벤트/프로모션', '신제품 소개', '캠페인', '채용 공고', '설문조사', '기타'], colSpan: 1 },
            { id: 'fe5_5', type: 'date-input', label: '운영 종료일', required: false, colSpan: 1 },
            { id: 'fe5_6', type: 'textarea', label: '페이지 목적 및 내용', required: true, rows: 5, colSpan: 'full' },
            { id: 'fe5_7', type: 'checkbox', label: '필요한 기능', options: ['신청/등록 폼', '카운트다운 타이머', '공유하기 버튼', '동영상 삽입', '애니메이션 효과'], colSpan: 'full' },
            { id: 'fe5_8', type: 'image-upload', label: '디자인 시안', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'fe5_9', type: 'deadline-input', label: '오픈 예정일', required: true, colSpan: 1 },
            { id: 'fe5_10', type: 'priority-select', label: '우선순위', required: true, colSpan: 1 },
            { id: 'fe5_11', type: 'approval-flow', label: '결재 라인', steps: [{ title: '기획 검토', role: '팀장' }, { title: '개발', role: 'Frontend팀장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_infra_005',
        name: '🖥️ [Infra] 모니터링/알림 설정 요청서',
        description: '서버, 서비스 모니터링 및 장애 알림 설정을 요청합니다.',
        category: 'Infra',
        formTitle: '모니터링/알림 설정 요청서',
        components: [
            { id: 'infra5_1', type: 'section-header', text: '📌 요청자 정보', colSpan: 'full' },
            { id: 'infra5_2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
            { id: 'infra5_3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
            { id: 'infra5_4', type: 'checkbox', label: '모니터링 항목', options: ['서버 상태 (CPU/메모리)', '디스크 용량', '네트워크 트래픽', 'URL 헬스체크', '프로세스 상태', '로그 모니터링'], colSpan: 'full' },
            { id: 'infra5_5', type: 'text-input', label: '모니터링 대상', placeholder: '서버명, URL, IP 등', required: true, colSpan: 'full' },
            { id: 'infra5_6', type: 'textarea', label: '알림 조건', required: true, rows: 3, colSpan: 'full' },
            { id: 'infra5_7', type: 'checkbox', label: '알림 수단', options: ['이메일', 'SMS', '슬랙', '카카오톡'], colSpan: 'full' },
            { id: 'infra5_8', type: 'email-input', label: '알림 수신 이메일', required: false, colSpan: 'full' },
            { id: 'infra5_9', type: 'deadline-input', label: '희망 완료일', required: true, colSpan: 1 },
            { id: 'infra5_10', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '팀장' }, { title: '설정', role: 'Infra팀' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_plan_002',
        name: '📝 [기획] 프로젝트 기획서',
        description: '새로운 프로젝트에 대한 기획서를 작성합니다.',
        category: '기획',
        formTitle: '프로젝트 기획서',
        components: [
            { id: 'plan2_1', type: 'section-header', text: '📌 기본 정보', colSpan: 'full' },
            { id: 'plan2_2', type: 'requester-info', label: '작성자 정보', colSpan: 'full' },
            { id: 'plan2_3', type: 'text-input', label: '프로젝트명', required: true, colSpan: 'full' },
            { id: 'plan2_4', type: 'textarea', label: '프로젝트 개요', required: true, rows: 4, colSpan: 'full' },
            { id: 'plan2_5', type: 'textarea', label: '프로젝트 목표', required: true, rows: 3, colSpan: 'full' },
            { id: 'plan2_6', type: 'textarea', label: '기대 효과', required: true, rows: 3, colSpan: 'full' },
            { id: 'plan2_7', type: 'date-input', label: '시작 예정일', required: true, colSpan: 1 },
            { id: 'plan2_8', type: 'date-input', label: '완료 예정일', required: true, colSpan: 1 },
            { id: 'plan2_9', type: 'priority-select', label: '우선순위', required: true, colSpan: 1 },
            { id: 'plan2_10', type: 'file-upload', label: '상세 기획서', accept: '.pdf,.doc,.docx,.ppt,.pptx', multiple: true, required: false, colSpan: 'full' },
            { id: 'plan2_11', type: 'approval-flow', label: '결재 라인', steps: [{ title: '검토', role: '기획팀장' }, { title: '승인', role: 'IT부서장' }], colSpan: 'full' }
        ]
    },
    {
        id: 'sample_qa_002',
        name: '🧪 [QA] 버그 리포트',
        description: 'QA 테스트 중 발견된 버그를 상세히 보고합니다.',
        category: 'QA',
        formTitle: '버그 리포트',
        components: [
            { id: 'qa2_1', type: 'section-header', text: '📌 보고자 정보', colSpan: 'full' },
            { id: 'qa2_2', type: 'requester-info', label: '보고자 정보', colSpan: 'full' },
            { id: 'qa2_3', type: 'text-input', label: '버그 제목', required: true, colSpan: 'full' },
            { id: 'qa2_4', type: 'select', label: '심각도', required: true, options: ['Critical', 'Major', 'Minor', 'Trivial'], colSpan: 1 },
            { id: 'qa2_5', type: 'select', label: '우선순위', required: true, options: ['Immediate', 'High', 'Medium', 'Low'], colSpan: 1 },
            { id: 'qa2_6', type: 'text-input', label: '발견 위치 (URL/화면)', required: true, colSpan: 'full' },
            { id: 'qa2_7', type: 'textarea', label: '재현 단계', required: true, rows: 5, colSpan: 'full' },
            { id: 'qa2_8', type: 'textarea', label: '예상 결과', required: true, rows: 2, colSpan: 'full' },
            { id: 'qa2_9', type: 'textarea', label: '실제 결과', required: true, rows: 2, colSpan: 'full' },
            { id: 'qa2_10', type: 'image-upload', label: '버그 스크린샷', accept: 'image/*', multiple: true, required: false, colSpan: 'full' },
            { id: 'qa2_11', type: 'text-input', label: '테스트 환경', placeholder: 'OS, 브라우저 버전 등', required: true, colSpan: 'full' },
            { id: 'qa2_12', type: 'approval-flow', label: '처리 라인', steps: [{ title: '검토', role: 'QA팀장' }, { title: '수정', role: '개발팀' }], colSpan: 'full' }
        ]
    }
];

// 전역으로 노출
if (typeof window !== 'undefined') {
    window.sampleTemplates = sampleTemplates;
}

