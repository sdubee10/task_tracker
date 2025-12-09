-- =====================================================
-- TaskFlow Sample Data
-- 샘플 데이터 삽입
-- =====================================================

-- =====================================================
-- 1. 부서 데이터
-- =====================================================
INSERT INTO departments (id, name, code, description) VALUES
(1, '경영지원본부', 'MGT', '경영 지원 및 관리 부서'),
(2, '개발본부', 'DEV', '소프트웨어 개발 부서'),
(3, '인프라본부', 'INFRA', 'IT 인프라 및 운영 부서'),
(4, '기획본부', 'PLAN', '서비스 기획 부서'),
(5, '품질관리본부', 'QA', '품질 관리 및 테스트 부서');

-- =====================================================
-- 2. 팀 데이터
-- =====================================================
INSERT INTO teams (id, department_id, name, code, description) VALUES
-- 경영지원본부
(1, 1, '시스템관리팀', 'MGT-SYS', '시스템 및 계정 관리'),
(2, 1, '인사팀', 'MGT-HR', '인사 및 채용 관리'),

-- 개발본부
(3, 2, 'Backend팀', 'DEV-BE', '서버 및 API 개발'),
(4, 2, 'Frontend팀', 'DEV-FE', 'UI/UX 및 프론트엔드 개발'),
(5, 2, 'DBA팀', 'DEV-DBA', '데이터베이스 관리 및 최적화'),
(6, 2, 'Mobile팀', 'DEV-MOB', '모바일 앱 개발'),

-- 인프라본부
(7, 3, 'DevOps팀', 'INFRA-OPS', 'CI/CD 및 배포 관리'),
(8, 3, '보안팀', 'INFRA-SEC', '보안 및 접근 관리'),
(9, 3, '네트워크팀', 'INFRA-NET', '네트워크 및 서버 관리'),

-- 기획본부
(10, 4, '서비스기획팀', 'PLAN-SVC', '서비스 기획 및 요구사항 정의'),
(11, 4, 'UX디자인팀', 'PLAN-UX', 'UX 리서치 및 디자인'),

-- 품질관리본부
(12, 5, 'QA팀', 'QA-TEST', '품질 테스트 및 검증'),
(13, 5, '자동화팀', 'QA-AUTO', '테스트 자동화');

-- =====================================================
-- 3. 사용자 데이터
-- 비밀번호: 각 역할 + '123' (예: admin123, manager123, user123)
-- 실제 운영에서는 bcrypt 등으로 해시 처리 필요
-- =====================================================
INSERT INTO users (id, team_id, email, password_hash, name, role, position, phone, is_active) VALUES
-- 관리자
(1, 1, 'admin@taskflow.com', '$2b$10$admin123hash', '시스템관리자', 'admin', '팀장', '010-1234-0001', TRUE),

-- 매니저들
(2, 3, 'manager@taskflow.com', '$2b$10$manager123hash', '김매니저', 'manager', '팀장', '010-1234-0002', TRUE),
(3, 4, 'fe.manager@taskflow.com', '$2b$10$manager123hash', '이프론트', 'manager', '팀장', '010-1234-0003', TRUE),
(4, 5, 'dba.manager@taskflow.com', '$2b$10$manager123hash', '박디비', 'manager', '팀장', '010-1234-0004', TRUE),
(5, 7, 'devops.manager@taskflow.com', '$2b$10$manager123hash', '최데옵스', 'manager', '팀장', '010-1234-0005', TRUE),
(6, 10, 'plan.manager@taskflow.com', '$2b$10$manager123hash', '정기획', 'manager', '팀장', '010-1234-0006', TRUE),

-- 일반 사용자들 - Backend팀
(7, 3, 'user@taskflow.com', '$2b$10$user123hash', '이사원', 'user', '사원', '010-1234-0007', TRUE),
(8, 3, 'be.dev1@taskflow.com', '$2b$10$user123hash', '강백엔드', 'user', '대리', '010-1234-0008', TRUE),
(9, 3, 'be.dev2@taskflow.com', '$2b$10$user123hash', '윤서버', 'user', '사원', '010-1234-0009', TRUE),

-- 일반 사용자들 - Frontend팀
(10, 4, 'fe.dev1@taskflow.com', '$2b$10$user123hash', '임프론트', 'user', '대리', '010-1234-0010', TRUE),
(11, 4, 'fe.dev2@taskflow.com', '$2b$10$user123hash', '한리액트', 'user', '사원', '010-1234-0011', TRUE),
(12, 4, 'fe.dev3@taskflow.com', '$2b$10$user123hash', '오뷰어', 'user', '사원', '010-1234-0012', TRUE),

-- 일반 사용자들 - DBA팀
(13, 5, 'dba.dev1@taskflow.com', '$2b$10$user123hash', '서디비', 'user', '대리', '010-1234-0013', TRUE),
(14, 5, 'dba.dev2@taskflow.com', '$2b$10$user123hash', '노쿼리', 'user', '사원', '010-1234-0014', TRUE),

-- 일반 사용자들 - DevOps팀
(15, 7, 'devops.dev1@taskflow.com', '$2b$10$user123hash', '문클라우드', 'user', '대리', '010-1234-0015', TRUE),
(16, 7, 'devops.dev2@taskflow.com', '$2b$10$user123hash', '배파이프', 'user', '사원', '010-1234-0016', TRUE),

-- 일반 사용자들 - 기획팀
(17, 10, 'plan.pm1@taskflow.com', '$2b$10$user123hash', '송기획', 'user', '대리', '010-1234-0017', TRUE),
(18, 10, 'plan.pm2@taskflow.com', '$2b$10$user123hash', '유피엠', 'user', '사원', '010-1234-0018', TRUE),

-- 일반 사용자들 - UX디자인팀
(19, 11, 'ux.design1@taskflow.com', '$2b$10$user123hash', '권디자인', 'user', '대리', '010-1234-0019', TRUE),
(20, 11, 'ux.design2@taskflow.com', '$2b$10$user123hash', '조유엑스', 'user', '사원', '010-1234-0020', TRUE),

-- 일반 사용자들 - QA팀
(21, 12, 'qa.test1@taskflow.com', '$2b$10$user123hash', '신테스트', 'user', '대리', '010-1234-0021', TRUE),
(22, 12, 'qa.test2@taskflow.com', '$2b$10$user123hash', '장품질', 'user', '사원', '010-1234-0022', TRUE),

-- 일반 사용자들 - 보안팀
(23, 8, 'sec.dev1@taskflow.com', '$2b$10$user123hash', '안보안', 'user', '대리', '010-1234-0023', TRUE),
(24, 8, 'sec.dev2@taskflow.com', '$2b$10$user123hash', '류방화벽', 'user', '사원', '010-1234-0024', TRUE),

-- 일반 사용자들 - Mobile팀
(25, 6, 'mob.dev1@taskflow.com', '$2b$10$user123hash', '김모바일', 'user', '대리', '010-1234-0025', TRUE);

-- =====================================================
-- 4. 신청서 템플릿 데이터
-- =====================================================
INSERT INTO form_templates (id, created_by, name, description, category, components, is_sample, is_active) VALUES
(1, 1, 'DB 스키마 변경 요청서', 'DB 테이블 생성, 수정, 삭제 요청', 'DBA', 
 '{"components":[{"type":"section-header","label":"요청 정보"},{"type":"text-input","label":"요청 제목","required":true},{"type":"textarea","label":"변경 내용 상세","required":true},{"type":"select","label":"변경 유형","options":["테이블 생성","컬럼 추가","인덱스 추가","테이블 삭제","기타"]},{"type":"priority-select","label":"우선순위"},{"type":"deadline-input","label":"희망 완료일"}]}',
 TRUE, TRUE),

(2, 1, 'API 개발 요청서', '신규 API 개발 또는 수정 요청', 'Backend',
 '{"components":[{"type":"section-header","label":"API 요청 정보"},{"type":"text-input","label":"API 명칭","required":true},{"type":"textarea","label":"기능 설명","required":true},{"type":"select","label":"HTTP Method","options":["GET","POST","PUT","DELETE","PATCH"]},{"type":"text-input","label":"엔드포인트 경로"},{"type":"textarea","label":"요청/응답 예시"},{"type":"priority-select","label":"우선순위"}]}',
 TRUE, TRUE),

(3, 1, 'UI 개발 요청서', '화면 개발 또는 수정 요청', 'Frontend',
 '{"components":[{"type":"section-header","label":"화면 개발 요청"},{"type":"text-input","label":"화면명","required":true},{"type":"textarea","label":"기능 설명","required":true},{"type":"select","label":"개발 유형","options":["신규 개발","기능 수정","버그 수정","디자인 변경"]},{"type":"image-upload","label":"디자인 시안"},{"type":"link-input","label":"피그마 링크"},{"type":"priority-select","label":"우선순위"}]}',
 TRUE, TRUE),

(4, 1, '서버 증설 요청서', '서버 리소스 증설 요청', 'Infra',
 '{"components":[{"type":"section-header","label":"서버 증설 요청"},{"type":"text-input","label":"서비스명","required":true},{"type":"select","label":"증설 유형","options":["CPU","메모리","스토리지","신규 서버"]},{"type":"number-input","label":"요청 수량"},{"type":"textarea","label":"증설 사유","required":true},{"type":"deadline-input","label":"희망 완료일"}]}',
 TRUE, TRUE),

(5, 1, '계정 생성 요청서', '시스템 계정 생성 요청', 'Common',
 '{"components":[{"type":"section-header","label":"계정 요청 정보"},{"type":"text-input","label":"사용자명","required":true},{"type":"email-input","label":"이메일","required":true},{"type":"select","label":"계정 유형","options":["일반 사용자","관리자","외부 협력사"]},{"type":"checkbox-group","label":"접근 권한","options":["개발 서버","운영 서버","DB 접근","VPN"]},{"type":"textarea","label":"요청 사유"}]}',
 TRUE, TRUE),

(6, 1, '배포 요청서', '서비스 배포 요청', 'DevOps',
 '{"components":[{"type":"section-header","label":"배포 요청"},{"type":"text-input","label":"서비스명","required":true},{"type":"select","label":"배포 환경","options":["개발","스테이징","운영"]},{"type":"text-input","label":"버전"},{"type":"textarea","label":"배포 내용","required":true},{"type":"checkbox-group","label":"배포 체크리스트","options":["코드 리뷰 완료","테스트 완료","롤백 계획 수립"]},{"type":"deadline-input","label":"배포 희망일"}]}',
 TRUE, TRUE),

(7, 1, '보안 점검 요청서', '보안 취약점 점검 요청', 'Security',
 '{"components":[{"type":"section-header","label":"보안 점검 요청"},{"type":"text-input","label":"점검 대상","required":true},{"type":"select","label":"점검 유형","options":["취약점 스캔","모의해킹","코드 보안 검토","인프라 점검"]},{"type":"textarea","label":"점검 범위","required":true},{"type":"deadline-input","label":"희망 완료일"}]}',
 TRUE, TRUE),

(8, 1, 'QA 테스트 요청서', '품질 테스트 요청', 'QA',
 '{"components":[{"type":"section-header","label":"테스트 요청"},{"type":"text-input","label":"테스트 대상","required":true},{"type":"select","label":"테스트 유형","options":["기능 테스트","회귀 테스트","성능 테스트","보안 테스트"]},{"type":"textarea","label":"테스트 범위","required":true},{"type":"link-input","label":"테스트 환경 URL"},{"type":"deadline-input","label":"희망 완료일"}]}',
 TRUE, TRUE);

-- =====================================================
-- 5. 신청서 데이터
-- =====================================================
INSERT INTO requests (id, template_id, requester_id, target_team_id, title, description, form_data, status, priority, due_date, created_at, submitted_at) VALUES
-- 진행중인 신청서들
(1, 1, 17, 5, '사용자 테이블 인덱스 추가 요청', '로그인 성능 개선을 위한 인덱스 추가 필요', 
 '{"요청 제목":"사용자 테이블 인덱스 추가","변경 내용 상세":"users 테이블의 email, last_login_at 컬럼에 복합 인덱스 추가 필요","변경 유형":"인덱스 추가","우선순위":"high"}',
 'in_progress', 'high', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

(2, 2, 6, 3, '결제 API v2 개발 요청', '신규 결제 시스템 연동을 위한 API 개발', 
 '{"API 명칭":"Payment API v2","기능 설명":"토스페이먼츠 연동 결제 API 개발","HTTP Method":"POST","엔드포인트 경로":"/api/v2/payments","우선순위":"urgent"}',
 'in_progress', 'urgent', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),

(3, 3, 18, 4, '마이페이지 리뉴얼', '마이페이지 UI/UX 개선 작업', 
 '{"화면명":"마이페이지","기능 설명":"프로필 편집, 알림 설정, 결제 내역 조회 화면 리뉴얼","개발 유형":"디자인 변경","우선순위":"medium"}',
 'in_progress', 'medium', DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- 대기중인 신청서들
(4, 4, 5, 7, 'API 서버 스케일 아웃', '트래픽 증가 대비 서버 증설', 
 '{"서비스명":"Main API Server","증설 유형":"신규 서버","요청 수량":"2","증설 사유":"블랙프라이데이 트래픽 대비"}',
 'pending', 'high', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

(5, 6, 2, 7, '신규 기능 운영 배포', 'v2.5.0 운영 환경 배포 요청', 
 '{"서비스명":"TaskFlow","배포 환경":"운영","버전":"v2.5.0","배포 내용":"신규 대시보드 기능, 버그 수정 포함"}',
 'pending', 'medium', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NOW(), NOW()),

-- 완료된 신청서들
(6, 5, 6, 1, '신규 입사자 계정 생성', '개발팀 신규 입사자 시스템 계정 생성', 
 '{"사용자명":"홍길동","이메일":"hong@taskflow.com","계정 유형":"일반 사용자","접근 권한":["개발 서버","VPN"]}',
 'completed', 'medium', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),

(7, 7, 23, 8, '연간 보안 점검', '2024년 1분기 정기 보안 점검', 
 '{"점검 대상":"전체 웹 서비스","점검 유형":"취약점 스캔","점검 범위":"외부 노출 서비스 전체"}',
 'completed', 'high', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),

(8, 8, 3, 12, '마이페이지 QA 테스트', '마이페이지 리뉴얼 QA 테스트 요청', 
 '{"테스트 대상":"마이페이지","테스트 유형":"기능 테스트","테스트 범위":"프로필 편집, 알림 설정, 결제 내역 조회"}',
 'review', 'medium', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 반려된 신청서
(9, 1, 18, 5, '로그 테이블 삭제 요청', '사용하지 않는 로그 테이블 삭제', 
 '{"요청 제목":"legacy_logs 테이블 삭제","변경 내용 상세":"더 이상 사용하지 않는 legacy_logs 테이블 삭제 요청","변경 유형":"테이블 삭제","우선순위":"low"}',
 'rejected', 'low', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- 임시저장 신청서
(10, 2, 17, 3, '알림 API 개발 요청 (임시저장)', '푸시 알림 발송 API', 
 '{"API 명칭":"Notification API","기능 설명":"푸시 알림 발송"}',
 'draft', 'medium', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), NULL);

-- 완료 시간 업데이트
UPDATE requests SET completed_at = DATE_SUB(NOW(), INTERVAL 5 DAY) WHERE id = 6;
UPDATE requests SET completed_at = DATE_SUB(NOW(), INTERVAL 12 DAY) WHERE id = 7;

-- =====================================================
-- 6. 신청서 담당자 배정 데이터
-- =====================================================
INSERT INTO request_assignees (request_id, user_id, role, status, assigned_at, started_at) VALUES
-- 신청서 1: DB 인덱스 추가
(1, 4, 'primary', 'in_progress', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 13, 'secondary', 'in_progress', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 신청서 2: 결제 API
(2, 2, 'reviewer', 'assigned', DATE_SUB(NOW(), INTERVAL 5 DAY), NULL),
(2, 8, 'primary', 'in_progress', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 9, 'secondary', 'in_progress', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- 신청서 3: 마이페이지 리뉴얼
(3, 3, 'reviewer', 'assigned', DATE_SUB(NOW(), INTERVAL 3 DAY), NULL),
(3, 10, 'primary', 'in_progress', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 11, 'secondary', 'in_progress', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- 신청서 4: 서버 증설 (대기중)
(4, 5, 'approver', 'assigned', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL),

-- 신청서 5: 배포 요청 (대기중)
(5, 15, 'primary', 'assigned', NOW(), NULL),

-- 신청서 6: 계정 생성 (완료)
(6, 1, 'primary', 'completed', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),

-- 신청서 7: 보안 점검 (완료)
(7, 23, 'primary', 'completed', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY)),
(7, 24, 'secondary', 'completed', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY)),

-- 신청서 8: QA 테스트 (검토중)
(8, 21, 'primary', 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(8, 22, 'secondary', 'assigned', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL);

-- 완료된 담당자 완료 시간 업데이트
UPDATE request_assignees SET completed_at = DATE_SUB(NOW(), INTERVAL 5 DAY) WHERE request_id = 6;
UPDATE request_assignees SET completed_at = DATE_SUB(NOW(), INTERVAL 12 DAY) WHERE request_id = 7;

-- =====================================================
-- 7. 신청서 평가 데이터
-- =====================================================
INSERT INTO request_evaluations (request_id, assignee_id, evaluator_id, technical_score, communication_score, efficiency_score, quality_score, overall_score, comment) VALUES
-- 완료된 신청서 평가
(6, 1, 6, 95, 90, 92, 95, 93, '신속하고 정확하게 처리해주셨습니다.'),
(7, 23, 5, 88, 85, 80, 90, 86, '꼼꼼한 점검 감사합니다. 일부 보고서 형식 개선 필요.'),
(7, 24, 5, 85, 88, 82, 85, 85, '협업이 잘 되었습니다.');

-- =====================================================
-- 8. 신청서 댓글 데이터
-- =====================================================
INSERT INTO request_comments (request_id, user_id, parent_id, content, is_internal, created_at) VALUES
-- 신청서 1 댓글
(1, 4, NULL, '인덱스 추가 작업 시작했습니다. 예상 완료 시간은 내일 오전입니다.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 17, NULL, '감사합니다. 완료되면 알려주세요.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 신청서 2 댓글
(2, 8, NULL, 'API 설계 검토 중입니다. 몇 가지 확인 사항이 있습니다.', FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 6, NULL, '네, 말씀해주세요.', FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 8, NULL, '결제 취소 API도 함께 필요한지 확인 부탁드립니다.', FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 6, NULL, '네, 결제 취소 API도 함께 개발 부탁드립니다.', FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- 신청서 9 반려 사유
(9, 4, NULL, '해당 테이블은 아직 배치 작업에서 참조하고 있습니다. 배치 작업 수정 후 재요청 부탁드립니다.', FALSE, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(9, 4, NULL, '[내부 메모] 배치팀에 해당 테이블 사용 여부 확인 필요', TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY));

-- =====================================================
-- 9. 신청서 변경 이력 데이터
-- =====================================================
INSERT INTO request_history (request_id, user_id, action, field_name, old_value, new_value, description) VALUES
-- 신청서 1 이력
(1, 17, 'created', NULL, NULL, NULL, '신청서 생성'),
(1, 17, 'submitted', 'status', '"draft"', '"submitted"', '신청서 제출'),
(1, 4, 'status_changed', 'status', '"submitted"', '"in_progress"', '작업 시작'),

-- 신청서 2 이력
(2, 6, 'created', NULL, NULL, NULL, '신청서 생성'),
(2, 6, 'submitted', 'status', '"draft"', '"submitted"', '신청서 제출'),
(2, 2, 'assigned', NULL, NULL, '{"user_id":8,"role":"primary"}', '담당자 배정'),
(2, 2, 'status_changed', 'status', '"submitted"', '"in_progress"', '작업 시작'),

-- 신청서 6 이력
(6, 6, 'created', NULL, NULL, NULL, '신청서 생성'),
(6, 6, 'submitted', 'status', '"draft"', '"submitted"', '신청서 제출'),
(6, 1, 'status_changed', 'status', '"submitted"', '"in_progress"', '작업 시작'),
(6, 1, 'status_changed', 'status', '"in_progress"', '"completed"', '작업 완료'),

-- 신청서 9 이력
(9, 18, 'created', NULL, NULL, NULL, '신청서 생성'),
(9, 18, 'submitted', 'status', '"draft"', '"submitted"', '신청서 제출'),
(9, 4, 'status_changed', 'status', '"submitted"', '"rejected"', '신청서 반려');

-- =====================================================
-- 10. 업무 데이터
-- =====================================================
INSERT INTO tasks (id, user_id, request_id, title, description, category, priority, status, estimated_minutes, actual_minutes, due_date, created_at) VALUES
-- 신청서 연관 업무
(1, 8, 2, '결제 API 설계', '토스페이먼츠 연동 API 설계 문서 작성', '개발', 'urgent', 'completed', 240, 200, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 8, 2, '결제 API 개발', '결제 요청/응답 API 개발', '개발', 'urgent', 'in_progress', 480, 300, DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 9, 2, '결제 API 테스트 코드 작성', '결제 API 단위 테스트 작성', '개발', 'high', 'todo', 180, 0, DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

(4, 10, 3, '마이페이지 컴포넌트 개발', '프로필 편집 컴포넌트 개발', '개발', 'medium', 'in_progress', 360, 180, DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 11, 3, '알림 설정 화면 개발', '알림 설정 UI 개발', '개발', 'medium', 'todo', 240, 0, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 일반 업무
(6, 7, NULL, '코드 리뷰', '팀원 PR 코드 리뷰', '리뷰', 'medium', 'completed', 60, 45, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 7, NULL, '기술 문서 작성', 'API 문서 업데이트', '문서', 'low', 'in_progress', 120, 60, DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 10, NULL, '디자인 시스템 정리', '공통 컴포넌트 스타일 가이드 정리', '문서', 'low', 'todo', 180, 0, DATE_ADD(CURDATE(), INTERVAL 14 DAY), NOW()),

(9, 21, 8, 'QA 테스트 케이스 작성', '마이페이지 테스트 케이스 작성', 'QA', 'medium', 'in_progress', 120, 60, DATE_ADD(CURDATE(), INTERVAL 2 DAY), NOW()),
(10, 22, 8, 'QA 테스트 실행', '마이페이지 기능 테스트 실행', 'QA', 'medium', 'todo', 240, 0, DATE_ADD(CURDATE(), INTERVAL 4 DAY), NOW());

-- 완료 시간 업데이트
UPDATE tasks SET completed_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE id = 1;
UPDATE tasks SET completed_at = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE id = 6;

-- =====================================================
-- 11. 업무 시간 기록 데이터
-- =====================================================
INSERT INTO task_time_logs (task_id, user_id, start_time, end_time, duration_minutes, note) VALUES
-- 결제 API 설계
(1, 8, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 3 HOUR, 180, '초기 설계'),
(1, 8, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 20 MINUTE, 20, '설계 리뷰 반영'),

-- 결제 API 개발
(2, 8, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 4 HOUR, 240, '기본 구조 개발'),
(2, 8, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR, 60, '에러 처리 추가'),

-- 마이페이지 컴포넌트
(4, 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 2 HOUR, 120, '프로필 폼 개발'),
(4, 10, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR, 60, '유효성 검사 추가'),

-- 코드 리뷰
(6, 7, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 45 MINUTE, 45, 'PR #123, #124 리뷰'),

-- 기술 문서
(7, 7, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR, 60, 'API 엔드포인트 문서화');

-- =====================================================
-- 12. 알림 데이터
-- =====================================================
INSERT INTO notifications (user_id, type, title, message, link, reference_type, reference_id, is_read, created_at) VALUES
-- 담당자 배정 알림
(8, 'assignment', '새로운 업무가 배정되었습니다', '결제 API v2 개발 요청이 배정되었습니다.', '/requests/2', 'request', 2, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(9, 'assignment', '새로운 업무가 배정되었습니다', '결제 API v2 개발 요청이 배정되었습니다.', '/requests/2', 'request', 2, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(10, 'assignment', '새로운 업무가 배정되었습니다', '마이페이지 리뉴얼이 배정되었습니다.', '/requests/3', 'request', 3, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- 댓글 알림
(17, 'comment', '새로운 댓글이 등록되었습니다', '박디비님이 댓글을 남겼습니다.', '/requests/1', 'request', 1, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 'comment', '새로운 댓글이 등록되었습니다', '강백엔드님이 댓글을 남겼습니다.', '/requests/2', 'request', 2, TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- 상태 변경 알림
(17, 'status_change', '신청서 상태가 변경되었습니다', 'DB 인덱스 추가 요청이 진행중으로 변경되었습니다.', '/requests/1', 'request', 1, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(18, 'status_change', '신청서가 반려되었습니다', '로그 테이블 삭제 요청이 반려되었습니다.', '/requests/9', 'request', 9, TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY)),

-- 마감일 알림
(8, 'deadline', '마감일이 다가옵니다', '결제 API 개발 마감일이 3일 남았습니다.', '/tasks/2', 'task', 2, FALSE, NOW());

-- =====================================================
-- 13. 로그인 기록 데이터
-- =====================================================
INSERT INTO login_history (user_id, ip_address, user_agent, login_at, is_success) VALUES
(1, '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', DATE_SUB(NOW(), INTERVAL 1 HOUR), TRUE),
(2, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 2 HOUR), TRUE),
(7, '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', DATE_SUB(NOW(), INTERVAL 30 MINUTE), TRUE),
(8, '192.168.1.103', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW(), TRUE),
(17, '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 3 HOUR), TRUE),
(17, '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 4 HOUR), FALSE);

-- 실패한 로그인 사유 업데이트
UPDATE login_history SET failure_reason = '비밀번호 불일치' WHERE is_success = FALSE;

-- =====================================================
-- 14. 시스템 설정 데이터
-- =====================================================
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', 'TaskFlow', '사이트 이름'),
('default_theme', 'dark', '기본 테마'),
('session_timeout', '30', '세션 타임아웃 (분)'),
('max_file_size', '10485760', '최대 파일 크기 (bytes)'),
('allowed_file_types', 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,zip', '허용 파일 확장자'),
('notification_email', 'noreply@taskflow.com', '알림 발송 이메일'),
('maintenance_mode', 'false', '유지보수 모드');


