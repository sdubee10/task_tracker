-- =====================================================
-- TaskFlow Graph DB Sample Data
-- 그래프 DB 형식 샘플 데이터
-- =====================================================

-- =====================================================
-- 1. 부서 및 팀 데이터
-- =====================================================
INSERT INTO departments (id, name, code, description) VALUES
(1, '경영지원본부', 'MGT', '경영 지원 및 관리'),
(2, '개발본부', 'DEV', '소프트웨어 개발'),
(3, '인프라본부', 'INFRA', 'IT 인프라 및 운영'),
(4, '기획본부', 'PLAN', '서비스 기획'),
(5, '품질관리본부', 'QA', '품질 관리 및 테스트');

INSERT INTO teams (id, department_id, name, code) VALUES
(1, 1, '시스템관리팀', 'MGT-SYS'),
(2, 1, '인사팀', 'MGT-HR'),
(3, 2, 'Backend팀', 'DEV-BE'),
(4, 2, 'Frontend팀', 'DEV-FE'),
(5, 2, 'DBA팀', 'DEV-DBA'),
(6, 2, 'Mobile팀', 'DEV-MOB'),
(7, 3, 'DevOps팀', 'INFRA-OPS'),
(8, 3, '보안팀', 'INFRA-SEC'),
(9, 4, '서비스기획팀', 'PLAN-SVC'),
(10, 5, 'QA팀', 'QA-TEST');

-- =====================================================
-- 2. 사용자 데이터
-- =====================================================
INSERT INTO users (id, team_id, email, password_hash, name, role, position) VALUES
(1, 1, 'admin@taskflow.com', '$2b$10$admin123hash', '시스템관리자', 'admin', '팀장'),
(2, 3, 'manager@taskflow.com', '$2b$10$manager123hash', '김매니저', 'manager', '팀장'),
(3, 4, 'fe.manager@taskflow.com', '$2b$10$manager123hash', '이프론트', 'manager', '팀장'),
(4, 5, 'dba.manager@taskflow.com', '$2b$10$manager123hash', '박디비', 'manager', '팀장'),
(5, 7, 'devops.manager@taskflow.com', '$2b$10$manager123hash', '최데옵스', 'manager', '팀장'),
(6, 9, 'plan.manager@taskflow.com', '$2b$10$manager123hash', '정기획', 'manager', '팀장'),
(7, 3, 'user@taskflow.com', '$2b$10$user123hash', '이사원', 'user', '사원'),
(8, 3, 'be.dev1@taskflow.com', '$2b$10$user123hash', '강백엔드', 'user', '대리'),
(9, 4, 'fe.dev1@taskflow.com', '$2b$10$user123hash', '임프론트', 'user', '대리'),
(10, 5, 'dba.dev1@taskflow.com', '$2b$10$user123hash', '서디비', 'user', '대리'),
(11, 7, 'devops.dev1@taskflow.com', '$2b$10$user123hash', '문클라우드', 'user', '대리'),
(12, 9, 'plan.pm1@taskflow.com', '$2b$10$user123hash', '송기획', 'user', '대리'),
(13, 10, 'qa.test1@taskflow.com', '$2b$10$user123hash', '신테스트', 'user', '대리'),
(14, 8, 'sec.dev1@taskflow.com', '$2b$10$user123hash', '안보안', 'user', '대리');

-- =====================================================
-- 3. 컴포넌트 타입 정의
-- =====================================================
INSERT INTO component_types (id, name, category, description, display_order) VALUES
-- 기본 입력
('text-input', '텍스트 입력', '기본 입력', '한 줄 텍스트 입력', 1),
('textarea', '텍스트 영역', '기본 입력', '여러 줄 텍스트 입력', 2),
('number-input', '숫자 입력', '기본 입력', '숫자 입력', 3),
('date-input', '날짜 선택', '기본 입력', '날짜 선택', 4),
('select', '선택 항목', '기본 입력', '드롭다운 선택', 5),
('email-input', '이메일 입력', '기본 입력', '이메일 입력', 6),
('phone-input', '전화번호 입력', '기본 입력', '전화번호 입력', 7),

-- 선택 항목
('checkbox', '체크박스', '선택 항목', '다중 선택', 10),
('radio', '라디오 버튼', '선택 항목', '단일 선택', 11),
('rating', '별점 평가', '선택 항목', '별점 평가', 12),
('slider', '슬라이더', '선택 항목', '범위 선택', 13),
('toggle-switch', '토글 스위치', '선택 항목', '켜기/끄기', 14),
('yes-no-select', '예/아니오', '선택 항목', '예/아니오 선택', 15),

-- 업무 측정
('time-estimate', '예상 소요 시간', '업무 측정', '시간 추정', 20),
('priority-select', '우선순위', '업무 측정', '우선순위 선택', 21),
('difficulty', '난이도', '업무 측정', '난이도 선택', 22),
('progress', '진행률', '업무 측정', '진행률 표시', 23),
('deadline-input', '마감일', '업무 측정', '마감일 선택', 24),
('impact-level', '영향도', '업무 측정', '영향도 선택', 25),

-- 레이아웃
('section-header', '섹션 제목', '레이아웃', '섹션 구분 제목', 30),
('divider', '구분선', '레이아웃', '구분선', 31),
('info-text', '안내 텍스트', '레이아웃', '안내 문구', 32),

-- 파일/링크
('file-upload', '파일 업로드', '파일/링크', '파일 업로드', 40),
('image-upload', '이미지 업로드', '파일/링크', '이미지 업로드', 41),
('link-input', '링크 입력', '파일/링크', 'URL 입력', 42),

-- 조직/프로젝트
('requester-info', '요청자 정보', '조직/프로젝트', '요청자 자동 입력', 50),
('department-select', '부서 선택', '조직/프로젝트', '부서 선택', 51),
('project-select', '프로젝트 선택', '조직/프로젝트', '프로젝트 선택', 52),
('team-member-select', '팀원 선택', '조직/프로젝트', '팀원 선택', 53),

-- 평가
('satisfaction-survey', '만족도 조사', '평가', '만족도 평가', 60),
('approval-flow', '결재 라인', '평가', '승인 프로세스', 61),
('kpi-tracker', 'KPI 추적', '평가', 'KPI 지표', 62);

-- =====================================================
-- 4. 신청서 템플릿 데이터 (30개 중 주요 10개)
-- =====================================================
INSERT INTO form_templates (id, name, description, category, form_title, is_sample, created_by) VALUES
('sample_dba_001', '🗄️ [DBA] 데이터 추출 요청서', 'DBA팀에 특정 데이터 추출을 요청할 때 사용합니다.', 'DBA', '데이터 추출 요청서', TRUE, 1),
('sample_dba_002', '🗄️ [DBA] 테이블/컬럼 변경 요청서', 'DBA팀에 테이블 생성이나 컬럼 추가/변경을 요청합니다.', 'DBA', '테이블/컬럼 변경 요청서', TRUE, 1),
('sample_fe_001', '🎨 [Frontend] 화면 개발 요청서', 'Frontend팀에 새로운 화면 개발이나 수정을 요청합니다.', 'Frontend', '화면 개발 요청서', TRUE, 1),
('sample_fe_002', '🎨 [Frontend] UI/UX 개선 요청서', '기존 화면의 사용성 개선, 디자인 변경을 요청합니다.', 'Frontend', 'UI/UX 개선 요청서', TRUE, 1),
('sample_be_001', '⚙️ [Backend] API/기능 개발 요청서', 'Backend팀에 새로운 API나 서버 기능 개발을 요청합니다.', 'Backend', 'API/기능 개발 요청서', TRUE, 1),
('sample_be_002', '⚙️ [Backend] 배치/자동화 작업 요청서', '정기적으로 실행되는 배치 작업이나 자동화 처리를 요청합니다.', 'Backend', '배치/자동화 작업 요청서', TRUE, 1),
('sample_infra_001', '🖥️ [Infra] 서버/자원 신청서', '새로운 서버, 스토리지 등 인프라 자원을 요청합니다.', 'Infra', '서버/자원 신청서', TRUE, 1),
('sample_infra_002', '🖥️ [Infra] 권한/계정 신청서', '서버 접속 권한, 시스템 계정 등을 요청합니다.', 'Infra', '권한/계정 신청서', TRUE, 1),
('sample_common_001', '🐛 [공통] 버그/오류 신고서', '시스템 사용 중 발견한 버그나 오류를 신고합니다.', '공통', '버그/오류 신고서', TRUE, 1),
('sample_qa_001', '🧪 [QA] 테스트 요청서', '신규 기능이나 수정 사항에 대한 QA 테스트를 요청합니다.', 'QA', '테스트 요청서', TRUE, 1);

-- =====================================================
-- 5. 템플릿 컴포넌트 데이터 (sample_dba_001 예시)
-- =====================================================
INSERT INTO template_components (id, template_id, component_type, component_order, label, placeholder, is_required, col_span, options) VALUES
-- DBA 데이터 추출 요청서 컴포넌트
('dba1_1', 'sample_dba_001', 'section-header', 1, '섹션 제목', NULL, FALSE, 'full', '{"text": "📌 요청자 정보"}'),
('dba1_2', 'sample_dba_001', 'requester-info', 2, '요청자 정보', NULL, FALSE, 'full', NULL),
('dba1_3', 'sample_dba_001', 'department-select', 3, '요청 부서', NULL, TRUE, '1', '{"departments": ["마케팅팀", "영업팀", "재무팀", "인사팀", "기획팀", "운영팀"]}'),
('dba1_4', 'sample_dba_001', 'deadline-input', 4, '희망 완료일', NULL, TRUE, '1', '{"includeTime": false}'),
('dba1_5', 'sample_dba_001', 'divider', 5, '구분선', NULL, FALSE, 'full', NULL),
('dba1_6', 'sample_dba_001', 'section-header', 6, '섹션 제목', NULL, FALSE, 'full', '{"text": "📊 데이터 요청 내용"}'),
('dba1_7', 'sample_dba_001', 'text-input', 7, '요청 제목', '예: 2024년 1분기 매출 데이터 추출', TRUE, 'full', NULL),
('dba1_8', 'sample_dba_001', 'select', 8, '데이터 용도', NULL, TRUE, '1', '{"options": ["보고서 작성", "분석/통계", "감사 자료", "외부 제출용", "기타"]}'),
('dba1_9', 'sample_dba_001', 'select', 9, '데이터 형식', NULL, TRUE, '1', '{"options": ["Excel (.xlsx)", "CSV", "PDF", "기타"]}'),
('dba1_10', 'sample_dba_001', 'textarea', 10, '필요한 데이터 설명', '어떤 데이터가 필요한지 상세히 설명해주세요.', TRUE, 'full', '{"rows": 6}'),
('dba1_11', 'sample_dba_001', 'date-input', 11, '데이터 조회 시작일', NULL, TRUE, '1', NULL),
('dba1_12', 'sample_dba_001', 'date-input', 12, '데이터 조회 종료일', NULL, TRUE, '1', NULL),
('dba1_13', 'sample_dba_001', 'checkbox', 13, '포함 항목 선택', NULL, FALSE, 'full', '{"options": ["고객 정보", "거래 내역", "상품 정보", "매출 데이터", "재고 현황"]}'),
('dba1_14', 'sample_dba_001', 'yes-no-select', 14, '개인정보 포함 여부', NULL, TRUE, '1', NULL),
('dba1_15', 'sample_dba_001', 'yes-no-select', 15, '정기 추출 필요 여부', NULL, FALSE, '1', NULL),
('dba1_16', 'sample_dba_001', 'divider', 16, '구분선', NULL, FALSE, 'full', NULL),
('dba1_17', 'sample_dba_001', 'section-header', 17, '섹션 제목', NULL, FALSE, 'full', '{"text": "📎 첨부파일"}'),
('dba1_18', 'sample_dba_001', 'file-upload', 18, '참고 자료 (양식 등)', NULL, FALSE, 'full', '{"accept": ".xlsx,.xls,.pdf,.doc,.docx", "multiple": true}'),
('dba1_19', 'sample_dba_001', 'textarea', 19, '추가 요청사항', '기타 요청사항이 있으면 입력해주세요.', FALSE, 'full', '{"rows": 2}'),
('dba1_20', 'sample_dba_001', 'approval-flow', 20, '결재 라인', NULL, FALSE, 'full', '{"steps": [{"title": "1차 승인", "role": "팀장"}, {"title": "최종 승인", "role": "DBA팀장"}]}');

-- Frontend 화면 개발 요청서 컴포넌트
INSERT INTO template_components (id, template_id, component_type, component_order, label, placeholder, is_required, col_span, options) VALUES
('fe1_1', 'sample_fe_001', 'section-header', 1, '섹션 제목', NULL, FALSE, 'full', '{"text": "📌 요청자 정보"}'),
('fe1_2', 'sample_fe_001', 'requester-info', 2, '요청자 정보', NULL, FALSE, 'full', NULL),
('fe1_3', 'sample_fe_001', 'department-select', 3, '요청 부서', NULL, TRUE, '1', '{"departments": ["마케팅팀", "영업팀", "기획팀", "운영팀", "고객지원팀"]}'),
('fe1_4', 'sample_fe_001', 'project-select', 4, '대상 시스템', NULL, TRUE, '1', '{"options": ["홈페이지", "관리자 페이지", "모바일 앱", "그룹웨어", "ERP", "기타"]}'),
('fe1_5', 'sample_fe_001', 'divider', 5, '구분선', NULL, FALSE, 'full', NULL),
('fe1_6', 'sample_fe_001', 'section-header', 6, '섹션 제목', NULL, FALSE, 'full', '{"text": "🖼️ 화면 요청 내용"}'),
('fe1_7', 'sample_fe_001', 'text-input', 7, '요청 제목', '예: 이벤트 페이지 신규 개발', TRUE, 'full', NULL),
('fe1_8', 'sample_fe_001', 'radio', 8, '요청 유형', NULL, TRUE, 'full', '{"options": ["신규 화면 개발", "기존 화면 수정", "디자인 변경", "오류 수정"]}'),
('fe1_9', 'sample_fe_001', 'text-input', 9, '화면 URL (기존 화면 수정 시)', 'https://...', FALSE, 'full', NULL),
('fe1_10', 'sample_fe_001', 'textarea', 10, '화면 설명', '어떤 화면이 필요한지 상세히 설명해주세요.', TRUE, 'full', '{"rows": 6}'),
('fe1_11', 'sample_fe_001', 'checkbox', 11, '필요한 기능', NULL, FALSE, 'full', '{"options": ["목록 조회", "상세 보기", "등록/수정 폼", "삭제 기능", "검색 기능", "엑셀 다운로드", "인쇄 기능"]}'),
('fe1_12', 'sample_fe_001', 'radio', 12, '반응형 필요 여부', NULL, TRUE, '1', '{"options": ["PC만", "PC + 모바일", "모바일만"]}'),
('fe1_13', 'sample_fe_001', 'priority-select', 13, '우선순위', NULL, TRUE, '1', '{"defaultValue": "medium"}'),
('fe1_14', 'sample_fe_001', 'deadline-input', 14, '희망 완료일', NULL, TRUE, '1', '{"includeTime": false}'),
('fe1_15', 'sample_fe_001', 'divider', 15, '구분선', NULL, FALSE, 'full', NULL),
('fe1_16', 'sample_fe_001', 'section-header', 16, '섹션 제목', NULL, FALSE, 'full', '{"text": "📎 참고 자료"}'),
('fe1_17', 'sample_fe_001', 'image-upload', 17, '디자인 시안/화면 캡처', NULL, FALSE, '1', '{"accept": "image/*", "multiple": true}'),
('fe1_18', 'sample_fe_001', 'file-upload', 18, '기획서/요구사항 문서', NULL, FALSE, '1', '{"accept": ".pdf,.doc,.docx,.ppt,.pptx,.xlsx", "multiple": true}'),
('fe1_19', 'sample_fe_001', 'link-input', 19, '참고 사이트 URL', 'https://...', FALSE, 'full', NULL),
('fe1_20', 'sample_fe_001', 'approval-flow', 20, '결재 라인', NULL, FALSE, 'full', '{"steps": [{"title": "1차 검토", "role": "팀장"}, {"title": "최종 승인", "role": "Frontend팀장"}]}');

-- =====================================================
-- 6. 그래프 노드 데이터 (템플릿 노드)
-- =====================================================
INSERT INTO nodes (id, node_type, label, created_by) VALUES
('sample_dba_001', 'template', '🗄️ [DBA] 데이터 추출 요청서', 1),
('sample_dba_002', 'template', '🗄️ [DBA] 테이블/컬럼 변경 요청서', 1),
('sample_fe_001', 'template', '🎨 [Frontend] 화면 개발 요청서', 1),
('sample_fe_002', 'template', '🎨 [Frontend] UI/UX 개선 요청서', 1),
('sample_be_001', 'template', '⚙️ [Backend] API/기능 개발 요청서', 1),
('sample_be_002', 'template', '⚙️ [Backend] 배치/자동화 작업 요청서', 1),
('sample_infra_001', 'template', '🖥️ [Infra] 서버/자원 신청서', 1),
('sample_infra_002', 'template', '🖥️ [Infra] 권한/계정 신청서', 1),
('sample_common_001', 'template', '🐛 [공통] 버그/오류 신고서', 1),
('sample_qa_001', 'template', '🧪 [QA] 테스트 요청서', 1);

-- =====================================================
-- 7. 샘플 신청서 데이터
-- =====================================================
INSERT INTO requests (id, template_id, requester_id, target_team_id, title, description, status, priority, due_date, submitted_at) VALUES
('REQ-2024-001', 'sample_dba_001', 12, 5, '2024년 1분기 매출 데이터 추출 요청', '분기 보고서 작성을 위한 매출 데이터 추출이 필요합니다.', 'in_progress', 'high', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('REQ-2024-002', 'sample_fe_001', 6, 4, '이벤트 페이지 신규 개발', '연말 프로모션 이벤트 페이지 개발이 필요합니다.', 'in_progress', 'urgent', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('REQ-2024-003', 'sample_be_001', 12, 3, '결제 API v2 개발 요청', '토스페이먼츠 연동 결제 API 개발', 'in_progress', 'urgent', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('REQ-2024-004', 'sample_infra_001', 2, 7, 'API 서버 스케일 아웃', '트래픽 증가 대비 서버 증설 요청', 'pending', 'high', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('REQ-2024-005', 'sample_common_001', 9, 3, '주문 목록 화면 오류 신고', '주문 목록에서 검색 시 화면이 멈추는 현상', 'submitted', 'high', NULL, NOW()),
('REQ-2024-006', 'sample_qa_001', 8, 10, '결제 API 테스트 요청', '결제 API v2 기능 테스트 요청', 'pending', 'medium', DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('REQ-2024-007', 'sample_dba_002', 8, 5, '회원 테이블 컬럼 추가', '마케팅 동의 컬럼 추가 필요', 'completed', 'medium', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('REQ-2024-008', 'sample_fe_002', 12, 4, '마이페이지 UI 개선', '프로필 편집 화면 사용성 개선', 'review', 'medium', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
('REQ-2024-009', 'sample_infra_002', 7, 7, 'AWS 콘솔 접근 권한 요청', '개발 서버 관리를 위한 AWS 권한 필요', 'completed', 'low', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
('REQ-2024-010', 'sample_be_002', 6, 3, '일일 매출 집계 배치 개발', '매일 새벽 매출 데이터 자동 집계', 'draft', 'medium', DATE_ADD(CURDATE(), INTERVAL 14 DAY), NULL);

-- 완료 시간 업데이트
UPDATE requests SET completed_at = DATE_SUB(NOW(), INTERVAL 5 DAY) WHERE id = 'REQ-2024-007';
UPDATE requests SET completed_at = DATE_SUB(NOW(), INTERVAL 3 DAY) WHERE id = 'REQ-2024-009';

-- 그래프 노드 (신청서)
INSERT INTO nodes (id, node_type, label, created_by) VALUES
('REQ-2024-001', 'request', '2024년 1분기 매출 데이터 추출 요청', 12),
('REQ-2024-002', 'request', '이벤트 페이지 신규 개발', 6),
('REQ-2024-003', 'request', '결제 API v2 개발 요청', 12),
('REQ-2024-004', 'request', 'API 서버 스케일 아웃', 2),
('REQ-2024-005', 'request', '주문 목록 화면 오류 신고', 9),
('REQ-2024-006', 'request', '결제 API 테스트 요청', 8),
('REQ-2024-007', 'request', '회원 테이블 컬럼 추가', 8),
('REQ-2024-008', 'request', '마이페이지 UI 개선', 12),
('REQ-2024-009', 'request', 'AWS 콘솔 접근 권한 요청', 7),
('REQ-2024-010', 'request', '일일 매출 집계 배치 개발', 6);

-- =====================================================
-- 8. 신청서 필드 값 (REQ-2024-001 예시)
-- =====================================================
INSERT INTO request_field_values (request_id, component_id, field_key, field_value, field_type) VALUES
('REQ-2024-001', 'dba1_3', 'department', '기획팀', 'string'),
('REQ-2024-001', 'dba1_4', 'deadline', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'date'),
('REQ-2024-001', 'dba1_7', 'title', '2024년 1분기 매출 데이터 추출', 'string'),
('REQ-2024-001', 'dba1_8', 'purpose', '보고서 작성', 'string'),
('REQ-2024-001', 'dba1_9', 'format', 'Excel (.xlsx)', 'string'),
('REQ-2024-001', 'dba1_10', 'description', '2024년 1월~3월 전체 매출 데이터가 필요합니다.\n- 일별 매출 합계\n- 상품 카테고리별 매출\n- 지역별 매출 현황', 'string'),
('REQ-2024-001', 'dba1_11', 'start_date', '2024-01-01', 'date'),
('REQ-2024-001', 'dba1_12', 'end_date', '2024-03-31', 'date'),
('REQ-2024-001', 'dba1_13', 'items', '["거래 내역", "매출 데이터"]', 'array'),
('REQ-2024-001', 'dba1_14', 'has_personal_info', 'no', 'string'),
('REQ-2024-001', 'dba1_15', 'is_recurring', 'no', 'string'),
('REQ-2024-001', 'dba1_19', 'additional_notes', '가능하면 피벗 테이블 형태로 부탁드립니다.', 'string');

-- REQ-2024-002 필드 값
INSERT INTO request_field_values (request_id, component_id, field_key, field_value, field_type) VALUES
('REQ-2024-002', 'fe1_3', 'department', '마케팅팀', 'string'),
('REQ-2024-002', 'fe1_4', 'system', '홈페이지', 'string'),
('REQ-2024-002', 'fe1_7', 'title', '연말 프로모션 이벤트 페이지', 'string'),
('REQ-2024-002', 'fe1_8', 'request_type', '신규 화면 개발', 'string'),
('REQ-2024-002', 'fe1_10', 'description', '연말 프로모션 이벤트 페이지 개발이 필요합니다.\n\n- 이벤트 배너 영역\n- 상품 할인 목록\n- 쿠폰 다운로드 버튼\n- 카운트다운 타이머', 'string'),
('REQ-2024-002', 'fe1_11', 'features', '["목록 조회", "검색 기능"]', 'array'),
('REQ-2024-002', 'fe1_12', 'responsive', 'PC + 모바일', 'string'),
('REQ-2024-002', 'fe1_13', 'priority', 'urgent', 'string'),
('REQ-2024-002', 'fe1_14', 'deadline', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'date'),
('REQ-2024-002', 'fe1_19', 'reference_url', 'https://example.com/event-sample', 'string');

-- =====================================================
-- 9. 그래프 엣지 (관계)
-- =====================================================
INSERT INTO edges (from_node_id, to_node_id, edge_type, edge_label) VALUES
-- 신청서 -> 템플릿 관계
('REQ-2024-001', 'sample_dba_001', 'USES_TEMPLATE', '데이터 추출 요청서 사용'),
('REQ-2024-002', 'sample_fe_001', 'USES_TEMPLATE', '화면 개발 요청서 사용'),
('REQ-2024-003', 'sample_be_001', 'USES_TEMPLATE', 'API 개발 요청서 사용'),
('REQ-2024-004', 'sample_infra_001', 'USES_TEMPLATE', '서버 신청서 사용'),
('REQ-2024-005', 'sample_common_001', 'USES_TEMPLATE', '버그 신고서 사용'),
('REQ-2024-006', 'sample_qa_001', 'USES_TEMPLATE', '테스트 요청서 사용'),
('REQ-2024-007', 'sample_dba_002', 'USES_TEMPLATE', '테이블 변경 요청서 사용'),
('REQ-2024-008', 'sample_fe_002', 'USES_TEMPLATE', 'UI/UX 개선 요청서 사용'),
('REQ-2024-009', 'sample_infra_002', 'USES_TEMPLATE', '권한 신청서 사용'),
('REQ-2024-010', 'sample_be_002', 'USES_TEMPLATE', '배치 요청서 사용');

-- =====================================================
-- 10. 담당자 배정
-- =====================================================
INSERT INTO request_assignees (request_id, user_id, role, status, started_at) VALUES
('REQ-2024-001', 4, 'primary', 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('REQ-2024-001', 10, 'secondary', 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('REQ-2024-002', 3, 'reviewer', 'assigned', NULL),
('REQ-2024-002', 9, 'primary', 'in_progress', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('REQ-2024-003', 2, 'reviewer', 'assigned', NULL),
('REQ-2024-003', 8, 'primary', 'in_progress', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('REQ-2024-004', 5, 'approver', 'assigned', NULL),
('REQ-2024-007', 4, 'primary', 'completed', DATE_SUB(NOW(), INTERVAL 8 DAY)),
('REQ-2024-008', 9, 'primary', 'in_progress', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('REQ-2024-009', 11, 'primary', 'completed', DATE_SUB(NOW(), INTERVAL 6 DAY));

-- 완료된 담당자 완료 시간 업데이트
UPDATE request_assignees SET completed_at = DATE_SUB(NOW(), INTERVAL 5 DAY) WHERE request_id = 'REQ-2024-007';
UPDATE request_assignees SET completed_at = DATE_SUB(NOW(), INTERVAL 3 DAY) WHERE request_id = 'REQ-2024-009';

-- =====================================================
-- 11. 평가 데이터
-- =====================================================
INSERT INTO request_evaluations (request_id, assignee_id, evaluator_id, technical_score, communication_score, efficiency_score, quality_score, overall_score, comment) VALUES
('REQ-2024-007', 4, 8, 92, 88, 90, 95, 91, '신속하고 정확하게 처리해주셨습니다.'),
('REQ-2024-009', 11, 7, 85, 90, 88, 85, 87, '빠른 처리 감사합니다.');

-- =====================================================
-- 12. 댓글 데이터
-- =====================================================
INSERT INTO request_comments (request_id, user_id, content, created_at) VALUES
('REQ-2024-001', 4, '데이터 추출 작업 시작했습니다. 내일 오전까지 완료 예정입니다.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('REQ-2024-001', 12, '감사합니다. 완료되면 알려주세요.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('REQ-2024-002', 9, '디자인 시안 검토 중입니다. 몇 가지 확인 사항이 있습니다.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('REQ-2024-002', 6, '네, 말씀해주세요.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('REQ-2024-003', 8, 'API 설계 문서 작성 완료했습니다. 리뷰 부탁드립니다.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('REQ-2024-005', 9, '재현 방법대로 테스트해보니 동일하게 오류가 발생합니다. 확인 부탁드립니다.', NOW());

-- =====================================================
-- 13. 알림 데이터
-- =====================================================
INSERT INTO notifications (user_id, type, title, message, link, reference_type, reference_id, is_read) VALUES
(4, 'assignment', '새로운 업무가 배정되었습니다', '데이터 추출 요청이 배정되었습니다.', '/requests/REQ-2024-001', 'request', 'REQ-2024-001', TRUE),
(9, 'assignment', '새로운 업무가 배정되었습니다', '이벤트 페이지 개발이 배정되었습니다.', '/requests/REQ-2024-002', 'request', 'REQ-2024-002', TRUE),
(8, 'assignment', '새로운 업무가 배정되었습니다', '결제 API 개발이 배정되었습니다.', '/requests/REQ-2024-003', 'request', 'REQ-2024-003', FALSE),
(12, 'comment', '새로운 댓글이 등록되었습니다', '박디비님이 댓글을 남겼습니다.', '/requests/REQ-2024-001', 'request', 'REQ-2024-001', FALSE),
(6, 'comment', '새로운 댓글이 등록되었습니다', '임프론트님이 댓글을 남겼습니다.', '/requests/REQ-2024-002', 'request', 'REQ-2024-002', TRUE);


