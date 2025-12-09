-- =====================================================
-- TaskFlow Graph Database Schema
-- 그래프 DB 형식의 유연한 신청서 데이터 저장
-- =====================================================

-- =====================================================
-- 1. 기본 조직 테이블 (변경 없음)
-- =====================================================

CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    position VARCHAR(50),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_team (team_id)
);

-- =====================================================
-- 2. 그래프 DB 핵심 테이블: 노드(Nodes)
-- =====================================================

-- 노드 테이블 (모든 엔티티의 기본)
CREATE TABLE nodes (
    id VARCHAR(50) PRIMARY KEY,
    node_type ENUM('template', 'request', 'component', 'field_value', 'attachment', 'comment', 'evaluation') NOT NULL,
    label VARCHAR(300) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    INDEX idx_nodes_type (node_type),
    INDEX idx_nodes_created (created_at),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 노드 속성 테이블 (Key-Value 형태로 유연한 속성 저장)
CREATE TABLE node_properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    node_id VARCHAR(50) NOT NULL,
    property_key VARCHAR(100) NOT NULL,
    property_value TEXT,
    property_type ENUM('string', 'number', 'boolean', 'date', 'datetime', 'json', 'array') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    UNIQUE KEY uk_node_property (node_id, property_key),
    INDEX idx_properties_key (property_key),
    INDEX idx_properties_node (node_id)
);

-- =====================================================
-- 3. 그래프 DB 핵심 테이블: 엣지(Edges/Relationships)
-- =====================================================

-- 관계 테이블 (노드 간의 연결)
CREATE TABLE edges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_node_id VARCHAR(50) NOT NULL,
    to_node_id VARCHAR(50) NOT NULL,
    edge_type VARCHAR(50) NOT NULL,  -- 'HAS_COMPONENT', 'SUBMITTED_BY', 'ASSIGNED_TO', 'BELONGS_TO', etc.
    edge_label VARCHAR(200),
    weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (to_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    INDEX idx_edges_from (from_node_id),
    INDEX idx_edges_to (to_node_id),
    INDEX idx_edges_type (edge_type),
    UNIQUE KEY uk_edge (from_node_id, to_node_id, edge_type)
);

-- 엣지 속성 테이블
CREATE TABLE edge_properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    edge_id INT NOT NULL,
    property_key VARCHAR(100) NOT NULL,
    property_value TEXT,
    property_type ENUM('string', 'number', 'boolean', 'date', 'datetime', 'json', 'array') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (edge_id) REFERENCES edges(id) ON DELETE CASCADE,
    UNIQUE KEY uk_edge_property (edge_id, property_key),
    INDEX idx_edge_properties_key (property_key)
);

-- =====================================================
-- 4. 신청서 템플릿 테이블 (빠른 조회용)
-- =====================================================

CREATE TABLE form_templates (
    id VARCHAR(50) PRIMARY KEY,  -- nodes 테이블의 id와 동일
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    form_title VARCHAR(200),
    is_sample BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    use_count INT DEFAULT 0,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_templates_category (category),
    INDEX idx_templates_active (is_active)
);

-- 템플릿 컴포넌트 테이블 (템플릿에 포함된 컴포넌트 정의)
CREATE TABLE template_components (
    id VARCHAR(50) PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL,
    component_type VARCHAR(50) NOT NULL,  -- text-input, textarea, select, checkbox, etc.
    component_order INT NOT NULL DEFAULT 0,
    label VARCHAR(200),
    placeholder VARCHAR(300),
    is_required BOOLEAN DEFAULT FALSE,
    col_span VARCHAR(10) DEFAULT '1',  -- '1', 'full'
    default_value TEXT,
    options JSON,  -- 선택 항목, 설정 등
    validation_rules JSON,  -- 유효성 검사 규칙
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE CASCADE,
    INDEX idx_components_template (template_id),
    INDEX idx_components_type (component_type)
);

-- =====================================================
-- 5. 신청서 테이블 (빠른 조회용)
-- =====================================================

CREATE TABLE requests (
    id VARCHAR(50) PRIMARY KEY,  -- nodes 테이블의 id와 동일
    template_id VARCHAR(50) NULL,
    requester_id INT NOT NULL,
    target_team_id INT NULL,
    
    title VARCHAR(300) NOT NULL,
    description TEXT,
    
    status ENUM('draft', 'submitted', 'pending', 'in_progress', 'review', 'completed', 'rejected', 'cancelled') DEFAULT 'draft',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    due_date DATE NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_team_id) REFERENCES teams(id) ON DELETE SET NULL,
    
    INDEX idx_requests_status (status),
    INDEX idx_requests_requester (requester_id),
    INDEX idx_requests_team (target_team_id),
    INDEX idx_requests_created (created_at)
);

-- 신청서 필드 값 테이블 (각 컴포넌트에 입력된 값)
CREATE TABLE request_field_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) NOT NULL,
    component_id VARCHAR(50) NOT NULL,  -- template_components의 id
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT,
    field_type VARCHAR(50),  -- text, number, date, file, array, json
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    INDEX idx_field_values_request (request_id),
    INDEX idx_field_values_component (component_id),
    INDEX idx_field_values_key (field_key)
);

-- =====================================================
-- 6. 신청서 담당자 및 평가
-- =====================================================

CREATE TABLE request_assignees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    role ENUM('primary', 'secondary', 'reviewer', 'approver') DEFAULT 'primary',
    status ENUM('assigned', 'accepted', 'in_progress', 'completed', 'rejected') DEFAULT 'assigned',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    note TEXT,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_request_assignee (request_id, user_id),
    INDEX idx_assignees_user (user_id)
);

CREATE TABLE request_evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) NOT NULL,
    assignee_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    technical_score INT DEFAULT 0,
    communication_score INT DEFAULT 0,
    efficiency_score INT DEFAULT 0,
    quality_score INT DEFAULT 0,
    overall_score INT DEFAULT 0,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 7. 신청서 댓글 및 이력
-- =====================================================

CREATE TABLE request_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    parent_id INT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES request_comments(id) ON DELETE CASCADE,
    INDEX idx_comments_request (request_id)
);

CREATE TABLE request_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) NOT NULL,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    field_name VARCHAR(100),
    old_value JSON,
    new_value JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_history_request (request_id),
    INDEX idx_history_action (action)
);

-- =====================================================
-- 8. 첨부파일 테이블
-- =====================================================

CREATE TABLE request_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) NOT NULL,
    field_id VARCHAR(50) NULL,  -- 어떤 필드에 첨부된 파일인지
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_attachments_request (request_id)
);

-- =====================================================
-- 9. 시스템 테이블
-- =====================================================

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    reference_type VARCHAR(50),
    reference_id VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read)
);

CREATE TABLE login_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP NULL,
    is_success BOOLEAN DEFAULT TRUE,
    failure_reason VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_login_user (user_id)
);

-- =====================================================
-- 10. 컴포넌트 타입 정의 테이블 (메타데이터)
-- =====================================================

CREATE TABLE component_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,  -- '기본 입력', '선택 항목', '업무 측정', '레이아웃', '평가' 등
    description TEXT,
    icon VARCHAR(50),
    default_config JSON,  -- 기본 설정값
    validation_schema JSON,  -- 유효성 검사 스키마
    render_template TEXT,  -- 렌더링 템플릿
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 11. 뷰 (Views)
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
    ft.category AS template_category,
    (SELECT COUNT(*) FROM request_assignees ra WHERE ra.request_id = r.id) AS assignee_count,
    (SELECT COUNT(*) FROM request_comments rc WHERE rc.request_id = r.id) AS comment_count,
    (SELECT COUNT(*) FROM request_field_values rfv WHERE rfv.request_id = r.id) AS field_count
FROM requests r
LEFT JOIN users u ON r.requester_id = u.id
LEFT JOIN teams t ON r.target_team_id = t.id
LEFT JOIN departments d ON t.department_id = d.id
LEFT JOIN form_templates ft ON r.template_id = ft.id;

-- 그래프 탐색 뷰 (노드와 연결된 엣지 정보)
CREATE OR REPLACE VIEW v_node_connections AS
SELECT 
    n.id AS node_id,
    n.node_type,
    n.label,
    e.edge_type,
    e.edge_label,
    n2.id AS connected_node_id,
    n2.node_type AS connected_node_type,
    n2.label AS connected_node_label,
    'outgoing' AS direction
FROM nodes n
JOIN edges e ON n.id = e.from_node_id
JOIN nodes n2 ON e.to_node_id = n2.id
UNION ALL
SELECT 
    n.id AS node_id,
    n.node_type,
    n.label,
    e.edge_type,
    e.edge_label,
    n2.id AS connected_node_id,
    n2.node_type AS connected_node_type,
    n2.label AS connected_node_label,
    'incoming' AS direction
FROM nodes n
JOIN edges e ON n.id = e.to_node_id
JOIN nodes n2 ON e.from_node_id = n2.id;

-- =====================================================
-- 12. 그래프 탐색 함수/프로시저
-- =====================================================

DELIMITER //

-- 특정 노드에서 연결된 모든 노드 조회
CREATE PROCEDURE get_connected_nodes(
    IN p_node_id VARCHAR(50),
    IN p_edge_type VARCHAR(50),
    IN p_direction VARCHAR(10)  -- 'outgoing', 'incoming', 'both'
)
BEGIN
    IF p_direction = 'outgoing' OR p_direction = 'both' THEN
        SELECT 
            n.id, n.node_type, n.label, e.edge_type, 'outgoing' AS direction
        FROM edges e
        JOIN nodes n ON e.to_node_id = n.id
        WHERE e.from_node_id = p_node_id
        AND (p_edge_type IS NULL OR e.edge_type = p_edge_type);
    END IF;
    
    IF p_direction = 'incoming' OR p_direction = 'both' THEN
        SELECT 
            n.id, n.node_type, n.label, e.edge_type, 'incoming' AS direction
        FROM edges e
        JOIN nodes n ON e.from_node_id = n.id
        WHERE e.to_node_id = p_node_id
        AND (p_edge_type IS NULL OR e.edge_type = p_edge_type);
    END IF;
END //

-- 신청서의 모든 필드 값 조회
CREATE PROCEDURE get_request_form_data(IN p_request_id VARCHAR(50))
BEGIN
    SELECT 
        tc.id AS component_id,
        tc.component_type,
        tc.label,
        tc.component_order,
        tc.is_required,
        rfv.field_value,
        rfv.field_type
    FROM template_components tc
    JOIN requests r ON r.template_id = tc.template_id
    LEFT JOIN request_field_values rfv ON rfv.request_id = r.id AND rfv.component_id = tc.id
    WHERE r.id = p_request_id
    ORDER BY tc.component_order;
END //

DELIMITER ;


