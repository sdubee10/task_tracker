-- =====================================================
-- TaskFlow Database Schema
-- 업무 측정 및 신청서 관리 시스템
-- =====================================================

-- 데이터베이스 생성 (MySQL/MariaDB)
-- CREATE DATABASE IF NOT EXISTS taskflow DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE taskflow;

-- =====================================================
-- 1. 조직 관련 테이블
-- =====================================================

-- 부서 테이블
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '부서명',
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '부서 코드',
    description TEXT COMMENT '부서 설명',
    parent_id INT NULL COMMENT '상위 부서 ID',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
) COMMENT '부서 정보';

-- 팀 테이블
CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL COMMENT '소속 부서 ID',
    name VARCHAR(100) NOT NULL COMMENT '팀명',
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '팀 코드',
    description TEXT COMMENT '팀 설명',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) COMMENT '팀 정보';

-- 사용자 테이블
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT NULL COMMENT '소속 팀 ID',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '이메일 (로그인 ID)',
    password_hash VARCHAR(255) NOT NULL COMMENT '비밀번호 해시',
    name VARCHAR(100) NOT NULL COMMENT '이름',
    role ENUM('admin', 'manager', 'user') DEFAULT 'user' COMMENT '역할',
    position VARCHAR(50) COMMENT '직책/직급',
    phone VARCHAR(20) COMMENT '연락처',
    avatar_url VARCHAR(500) COMMENT '프로필 이미지 URL',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL COMMENT '마지막 로그인 시간',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_team (team_id),
    INDEX idx_users_role (role)
) COMMENT '사용자 정보';

-- =====================================================
-- 2. 신청서 양식 관련 테이블
-- =====================================================

-- 신청서 템플릿 테이블
CREATE TABLE form_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    created_by INT NULL COMMENT '생성자 ID',
    name VARCHAR(200) NOT NULL COMMENT '템플릿명',
    description TEXT COMMENT '템플릿 설명',
    category VARCHAR(50) NOT NULL COMMENT '카테고리 (DBA, Frontend, Backend, Infra 등)',
    components JSON NOT NULL COMMENT '컴포넌트 구성 (JSON)',
    is_sample BOOLEAN DEFAULT FALSE COMMENT '샘플 템플릿 여부',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 여부',
    use_count INT DEFAULT 0 COMMENT '사용 횟수',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_templates_category (category),
    INDEX idx_templates_active (is_active)
) COMMENT '신청서 양식 템플릿';

-- =====================================================
-- 3. 신청서 관련 테이블
-- =====================================================

-- 신청서 테이블
CREATE TABLE requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT NULL COMMENT '사용된 템플릿 ID',
    requester_id INT NOT NULL COMMENT '요청자 ID',
    target_team_id INT NULL COMMENT '대상 팀 ID',
    
    -- 기본 정보
    title VARCHAR(300) NOT NULL COMMENT '신청서 제목',
    description TEXT COMMENT '신청서 설명',
    form_data JSON COMMENT '신청서 입력 데이터 (JSON)',
    
    -- 상태 및 우선순위
    status ENUM('draft', 'submitted', 'pending', 'in_progress', 'review', 'completed', 'rejected', 'cancelled') 
        DEFAULT 'draft' COMMENT '상태',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '우선순위',
    
    -- 일정
    due_date DATE NULL COMMENT '희망 완료일',
    estimated_hours DECIMAL(5,1) NULL COMMENT '예상 소요 시간',
    actual_hours DECIMAL(5,1) NULL COMMENT '실제 소요 시간',
    
    -- 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL COMMENT '제출 시간',
    started_at TIMESTAMP NULL COMMENT '작업 시작 시간',
    completed_at TIMESTAMP NULL COMMENT '완료 시간',
    
    FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_team_id) REFERENCES teams(id) ON DELETE SET NULL,
    
    INDEX idx_requests_status (status),
    INDEX idx_requests_requester (requester_id),
    INDEX idx_requests_target_team (target_team_id),
    INDEX idx_requests_priority (priority),
    INDEX idx_requests_due_date (due_date),
    INDEX idx_requests_created (created_at)
) COMMENT '신청서';

-- 신청서 담당자 배정 테이블
CREATE TABLE request_assignees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL COMMENT '신청서 ID',
    user_id INT NOT NULL COMMENT '담당자 ID',
    role ENUM('primary', 'secondary', 'reviewer', 'approver') DEFAULT 'primary' COMMENT '담당 역할',
    status ENUM('assigned', 'accepted', 'in_progress', 'completed', 'rejected') DEFAULT 'assigned' COMMENT '처리 상태',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '배정 시간',
    accepted_at TIMESTAMP NULL COMMENT '수락 시간',
    started_at TIMESTAMP NULL COMMENT '작업 시작 시간',
    completed_at TIMESTAMP NULL COMMENT '완료 시간',
    note TEXT COMMENT '메모',
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_request_assignee (request_id, user_id),
    INDEX idx_assignees_user (user_id),
    INDEX idx_assignees_status (status)
) COMMENT '신청서 담당자 배정';

-- 신청서 평가 테이블
CREATE TABLE request_evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL COMMENT '신청서 ID',
    assignee_id INT NOT NULL COMMENT '피평가자(담당자) ID',
    evaluator_id INT NOT NULL COMMENT '평가자 ID',
    
    -- 평가 점수 (0-100)
    technical_score INT DEFAULT 0 COMMENT '기술 역량 점수',
    communication_score INT DEFAULT 0 COMMENT '커뮤니케이션 점수',
    efficiency_score INT DEFAULT 0 COMMENT '효율성 점수',
    quality_score INT DEFAULT 0 COMMENT '품질 점수',
    overall_score INT DEFAULT 0 COMMENT '종합 점수',
    
    comment TEXT COMMENT '평가 코멘트',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_evaluation (request_id, assignee_id, evaluator_id),
    INDEX idx_evaluations_assignee (assignee_id),
    INDEX idx_evaluations_evaluator (evaluator_id)
) COMMENT '신청서 처리 평가';

-- 신청서 댓글 테이블
CREATE TABLE request_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL COMMENT '신청서 ID',
    user_id INT NOT NULL COMMENT '작성자 ID',
    parent_id INT NULL COMMENT '상위 댓글 ID (답글인 경우)',
    content TEXT NOT NULL COMMENT '댓글 내용',
    is_internal BOOLEAN DEFAULT FALSE COMMENT '내부 메모 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES request_comments(id) ON DELETE CASCADE,
    
    INDEX idx_comments_request (request_id),
    INDEX idx_comments_user (user_id)
) COMMENT '신청서 댓글';

-- 신청서 변경 이력 테이블
CREATE TABLE request_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL COMMENT '신청서 ID',
    user_id INT NULL COMMENT '변경자 ID',
    action VARCHAR(50) NOT NULL COMMENT '액션 (created, updated, status_changed, assigned 등)',
    field_name VARCHAR(100) NULL COMMENT '변경된 필드명',
    old_value JSON NULL COMMENT '이전 값',
    new_value JSON NULL COMMENT '새 값',
    description TEXT COMMENT '변경 설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_history_request (request_id),
    INDEX idx_history_action (action),
    INDEX idx_history_created (created_at)
) COMMENT '신청서 변경 이력';

-- 신청서 첨부파일 테이블
CREATE TABLE request_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL COMMENT '신청서 ID',
    user_id INT NOT NULL COMMENT '업로더 ID',
    file_name VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '저장 경로',
    file_size INT NOT NULL COMMENT '파일 크기 (bytes)',
    mime_type VARCHAR(100) COMMENT 'MIME 타입',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_attachments_request (request_id)
) COMMENT '신청서 첨부파일';

-- =====================================================
-- 4. 업무 관련 테이블
-- =====================================================

-- 업무 테이블
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '담당자 ID',
    request_id INT NULL COMMENT '연관 신청서 ID',
    
    title VARCHAR(300) NOT NULL COMMENT '업무 제목',
    description TEXT COMMENT '업무 설명',
    category VARCHAR(50) COMMENT '카테고리',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '우선순위',
    status ENUM('todo', 'in_progress', 'completed', 'on_hold') DEFAULT 'todo' COMMENT '상태',
    
    estimated_minutes INT DEFAULT 0 COMMENT '예상 소요 시간 (분)',
    actual_minutes INT DEFAULT 0 COMMENT '실제 소요 시간 (분)',
    
    due_date DATE NULL COMMENT '마감일',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL COMMENT '완료 시간',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL,
    
    INDEX idx_tasks_user (user_id),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_due_date (due_date)
) COMMENT '업무 목록';

-- 업무 시간 기록 테이블
CREATE TABLE task_time_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL COMMENT '업무 ID',
    user_id INT NOT NULL COMMENT '사용자 ID',
    start_time TIMESTAMP NOT NULL COMMENT '시작 시간',
    end_time TIMESTAMP NULL COMMENT '종료 시간',
    duration_minutes INT DEFAULT 0 COMMENT '소요 시간 (분)',
    note TEXT COMMENT '메모',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_time_logs_task (task_id),
    INDEX idx_time_logs_user (user_id),
    INDEX idx_time_logs_start (start_time)
) COMMENT '업무 시간 기록';

-- =====================================================
-- 5. 시스템 테이블
-- =====================================================

-- 알림 테이블
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '수신자 ID',
    type VARCHAR(50) NOT NULL COMMENT '알림 유형',
    title VARCHAR(200) NOT NULL COMMENT '알림 제목',
    message TEXT COMMENT '알림 내용',
    link VARCHAR(500) COMMENT '연결 링크',
    reference_type VARCHAR(50) COMMENT '참조 타입 (request, task 등)',
    reference_id INT COMMENT '참조 ID',
    is_read BOOLEAN DEFAULT FALSE COMMENT '읽음 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL COMMENT '읽은 시간',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at)
) COMMENT '알림';

-- 로그인 기록 테이블
CREATE TABLE login_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '사용자 ID',
    ip_address VARCHAR(45) COMMENT 'IP 주소',
    user_agent TEXT COMMENT 'User Agent',
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '로그인 시간',
    logout_at TIMESTAMP NULL COMMENT '로그아웃 시간',
    is_success BOOLEAN DEFAULT TRUE COMMENT '성공 여부',
    failure_reason VARCHAR(100) COMMENT '실패 사유',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_login_user (user_id),
    INDEX idx_login_time (login_at)
) COMMENT '로그인 기록';

-- 시스템 설정 테이블
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT '설정 키',
    setting_value TEXT COMMENT '설정 값',
    description TEXT COMMENT '설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '시스템 설정';

-- =====================================================
-- 6. 뷰 (Views)
-- =====================================================

-- 신청서 요약 뷰
CREATE OR REPLACE VIEW v_request_summary AS
SELECT 
    r.id,
    r.title,
    r.status,
    r.priority,
    r.due_date,
    r.created_at,
    r.submitted_at,
    r.completed_at,
    u.name AS requester_name,
    u.email AS requester_email,
    t.name AS target_team_name,
    d.name AS target_department_name,
    ft.name AS template_name,
    (SELECT COUNT(*) FROM request_assignees ra WHERE ra.request_id = r.id) AS assignee_count,
    (SELECT COUNT(*) FROM request_comments rc WHERE rc.request_id = r.id) AS comment_count
FROM requests r
LEFT JOIN users u ON r.requester_id = u.id
LEFT JOIN teams t ON r.target_team_id = t.id
LEFT JOIN departments d ON t.department_id = d.id
LEFT JOIN form_templates ft ON r.template_id = ft.id;

-- 사용자별 업무 통계 뷰
CREATE OR REPLACE VIEW v_user_task_stats AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email,
    t.name AS team_name,
    d.name AS department_name,
    COUNT(DISTINCT tk.id) AS total_tasks,
    COUNT(DISTINCT CASE WHEN tk.status = 'completed' THEN tk.id END) AS completed_tasks,
    COUNT(DISTINCT CASE WHEN tk.status = 'in_progress' THEN tk.id END) AS in_progress_tasks,
    COUNT(DISTINCT ra.id) AS assigned_requests,
    COUNT(DISTINCT CASE WHEN ra.status = 'completed' THEN ra.id END) AS completed_requests,
    COALESCE(AVG(re.overall_score), 0) AS avg_evaluation_score
FROM users u
LEFT JOIN teams t ON u.team_id = t.id
LEFT JOIN departments d ON t.department_id = d.id
LEFT JOIN tasks tk ON u.id = tk.user_id
LEFT JOIN request_assignees ra ON u.id = ra.user_id
LEFT JOIN request_evaluations re ON u.id = re.assignee_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email, t.name, d.name;

-- 팀별 신청서 현황 뷰
CREATE OR REPLACE VIEW v_team_request_stats AS
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    d.name AS department_name,
    COUNT(DISTINCT r.id) AS total_requests,
    COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN r.id END) AS pending_requests,
    COUNT(DISTINCT CASE WHEN r.status = 'in_progress' THEN r.id END) AS in_progress_requests,
    COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) AS completed_requests,
    COUNT(DISTINCT CASE WHEN r.status = 'rejected' THEN r.id END) AS rejected_requests,
    AVG(TIMESTAMPDIFF(HOUR, r.submitted_at, r.completed_at)) AS avg_completion_hours
FROM teams t
LEFT JOIN departments d ON t.department_id = d.id
LEFT JOIN requests r ON t.id = r.target_team_id
GROUP BY t.id, t.name, d.name;


