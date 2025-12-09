/**
 * TaskFlow Database Models
 * JavaScript 클래스 기반 데이터 모델 정의
 * 프론트엔드와 백엔드에서 공통으로 사용 가능
 */

// =====================================================
// 기본 모델 클래스
// =====================================================

class BaseModel {
    constructor(data = {}) {
        this.id = data.id || null;
        this.createdAt = data.created_at || data.createdAt || new Date().toISOString();
        this.updatedAt = data.updated_at || data.updatedAt || new Date().toISOString();
    }

    toJSON() {
        return { ...this };
    }

    static fromJSON(json) {
        return new this(json);
    }
}

// =====================================================
// 조직 관련 모델
// =====================================================

/**
 * 부서 모델
 */
class Department extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.name = data.name || '';
        this.code = data.code || '';
        this.description = data.description || '';
        this.parentId = data.parent_id || data.parentId || null;
        this.isActive = data.is_active ?? data.isActive ?? true;
    }
}

/**
 * 팀 모델
 */
class Team extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.departmentId = data.department_id || data.departmentId || null;
        this.name = data.name || '';
        this.code = data.code || '';
        this.description = data.description || '';
        this.isActive = data.is_active ?? data.isActive ?? true;
        
        // 관계 데이터
        this.department = data.department || null;
        this.members = data.members || [];
    }
}

/**
 * 사용자 모델
 */
class User extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.teamId = data.team_id || data.teamId || null;
        this.email = data.email || '';
        this.name = data.name || '';
        this.role = data.role || 'user'; // admin, manager, user
        this.position = data.position || '';
        this.phone = data.phone || '';
        this.avatarUrl = data.avatar_url || data.avatarUrl || '';
        this.isActive = data.is_active ?? data.isActive ?? true;
        this.lastLoginAt = data.last_login_at || data.lastLoginAt || null;
        
        // 관계 데이터
        this.team = data.team || null;
        this.department = data.department || null;
    }

    get fullTitle() {
        return this.position ? `${this.name} ${this.position}` : this.name;
    }

    get initials() {
        return this.name ? this.name.charAt(0) : '?';
    }

    static ROLES = {
        ADMIN: 'admin',
        MANAGER: 'manager',
        USER: 'user'
    };

    static getRoleName(role) {
        const roleNames = {
            admin: '관리자',
            manager: '매니저',
            user: '사용자'
        };
        return roleNames[role] || role;
    }
}

// =====================================================
// 신청서 관련 모델
// =====================================================

/**
 * 신청서 템플릿 모델
 */
class FormTemplate extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.createdBy = data.created_by || data.createdBy || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.category = data.category || '';
        this.components = data.components || [];
        this.isSample = data.is_sample ?? data.isSample ?? false;
        this.isActive = data.is_active ?? data.isActive ?? true;
        this.useCount = data.use_count || data.useCount || 0;
        
        // 관계 데이터
        this.creator = data.creator || null;
    }

    static CATEGORIES = [
        'DBA', 'Backend', 'Frontend', 'Infra', 'DevOps', 
        'Security', 'QA', 'Common', 'Planning'
    ];
}

/**
 * 신청서 모델
 */
class Request extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.templateId = data.template_id || data.templateId || null;
        this.requesterId = data.requester_id || data.requesterId || null;
        this.targetTeamId = data.target_team_id || data.targetTeamId || null;
        
        this.title = data.title || '';
        this.description = data.description || '';
        this.formData = data.form_data || data.formData || {};
        
        this.status = data.status || 'draft';
        this.priority = data.priority || 'medium';
        
        this.dueDate = data.due_date || data.dueDate || null;
        this.estimatedHours = data.estimated_hours || data.estimatedHours || null;
        this.actualHours = data.actual_hours || data.actualHours || null;
        
        this.submittedAt = data.submitted_at || data.submittedAt || null;
        this.startedAt = data.started_at || data.startedAt || null;
        this.completedAt = data.completed_at || data.completedAt || null;
        
        // 관계 데이터
        this.template = data.template || null;
        this.requester = data.requester || null;
        this.targetTeam = data.targetTeam || null;
        this.assignees = data.assignees || [];
        this.comments = data.comments || [];
        this.evaluations = data.evaluations || [];
        this.history = data.history || [];
        this.attachments = data.attachments || [];
    }

    get isOverdue() {
        if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
            return false;
        }
        return new Date(this.dueDate) < new Date();
    }

    get daysUntilDue() {
        if (!this.dueDate) return null;
        const diff = new Date(this.dueDate) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    static STATUS = {
        DRAFT: 'draft',
        SUBMITTED: 'submitted',
        PENDING: 'pending',
        IN_PROGRESS: 'in_progress',
        REVIEW: 'review',
        COMPLETED: 'completed',
        REJECTED: 'rejected',
        CANCELLED: 'cancelled'
    };

    static PRIORITY = {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        URGENT: 'urgent'
    };

    static getStatusName(status) {
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
        return statusNames[status] || status;
    }

    static getStatusColor(status) {
        const statusColors = {
            draft: '#6e6e73',
            submitted: '#007aff',
            pending: '#ff9500',
            in_progress: '#5856d6',
            review: '#af52de',
            completed: '#34c759',
            rejected: '#ff3b30',
            cancelled: '#8e8e93'
        };
        return statusColors[status] || '#6e6e73';
    }

    static getPriorityName(priority) {
        const priorityNames = {
            low: '낮음',
            medium: '보통',
            high: '높음',
            urgent: '긴급'
        };
        return priorityNames[priority] || priority;
    }

    static getPriorityColor(priority) {
        const priorityColors = {
            low: '#34c759',
            medium: '#007aff',
            high: '#ff9500',
            urgent: '#ff3b30'
        };
        return priorityColors[priority] || '#007aff';
    }
}

/**
 * 신청서 담당자 모델
 */
class RequestAssignee extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.requestId = data.request_id || data.requestId || null;
        this.userId = data.user_id || data.userId || null;
        this.role = data.role || 'primary'; // primary, secondary, reviewer, approver
        this.status = data.status || 'assigned'; // assigned, accepted, in_progress, completed, rejected
        this.assignedAt = data.assigned_at || data.assignedAt || new Date().toISOString();
        this.acceptedAt = data.accepted_at || data.acceptedAt || null;
        this.startedAt = data.started_at || data.startedAt || null;
        this.completedAt = data.completed_at || data.completedAt || null;
        this.note = data.note || '';
        
        // 관계 데이터
        this.user = data.user || null;
        this.request = data.request || null;
    }

    static ROLES = {
        PRIMARY: 'primary',
        SECONDARY: 'secondary',
        REVIEWER: 'reviewer',
        APPROVER: 'approver'
    };

    static STATUS = {
        ASSIGNED: 'assigned',
        ACCEPTED: 'accepted',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        REJECTED: 'rejected'
    };

    static getRoleName(role) {
        const roleNames = {
            primary: '주담당',
            secondary: '부담당',
            reviewer: '검토자',
            approver: '승인자'
        };
        return roleNames[role] || role;
    }
}

/**
 * 신청서 평가 모델
 */
class RequestEvaluation extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.requestId = data.request_id || data.requestId || null;
        this.assigneeId = data.assignee_id || data.assigneeId || null;
        this.evaluatorId = data.evaluator_id || data.evaluatorId || null;
        
        this.technicalScore = data.technical_score || data.technicalScore || 0;
        this.communicationScore = data.communication_score || data.communicationScore || 0;
        this.efficiencyScore = data.efficiency_score || data.efficiencyScore || 0;
        this.qualityScore = data.quality_score || data.qualityScore || 0;
        this.overallScore = data.overall_score || data.overallScore || 0;
        
        this.comment = data.comment || '';
        
        // 관계 데이터
        this.assignee = data.assignee || null;
        this.evaluator = data.evaluator || null;
        this.request = data.request || null;
    }

    calculateOverallScore() {
        const scores = [
            this.technicalScore,
            this.communicationScore,
            this.efficiencyScore,
            this.qualityScore
        ];
        this.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        return this.overallScore;
    }

    static SCORE_LABELS = {
        technical: '기술 역량',
        communication: '커뮤니케이션',
        efficiency: '효율성',
        quality: '품질'
    };
}

/**
 * 신청서 댓글 모델
 */
class RequestComment extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.requestId = data.request_id || data.requestId || null;
        this.userId = data.user_id || data.userId || null;
        this.parentId = data.parent_id || data.parentId || null;
        this.content = data.content || '';
        this.isInternal = data.is_internal ?? data.isInternal ?? false;
        
        // 관계 데이터
        this.user = data.user || null;
        this.replies = data.replies || [];
    }
}

/**
 * 신청서 변경 이력 모델
 */
class RequestHistory extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.requestId = data.request_id || data.requestId || null;
        this.userId = data.user_id || data.userId || null;
        this.action = data.action || '';
        this.fieldName = data.field_name || data.fieldName || null;
        this.oldValue = data.old_value || data.oldValue || null;
        this.newValue = data.new_value || data.newValue || null;
        this.description = data.description || '';
        
        // 관계 데이터
        this.user = data.user || null;
    }

    static ACTIONS = {
        CREATED: 'created',
        UPDATED: 'updated',
        SUBMITTED: 'submitted',
        STATUS_CHANGED: 'status_changed',
        ASSIGNED: 'assigned',
        COMMENTED: 'commented',
        EVALUATED: 'evaluated'
    };
}

// =====================================================
// 업무 관련 모델
// =====================================================

/**
 * 업무 모델
 */
class Task extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.userId = data.user_id || data.userId || null;
        this.requestId = data.request_id || data.requestId || null;
        
        this.title = data.title || '';
        this.description = data.description || '';
        this.category = data.category || '';
        this.priority = data.priority || 'medium';
        this.status = data.status || 'todo';
        
        this.estimatedMinutes = data.estimated_minutes || data.estimatedMinutes || 0;
        this.actualMinutes = data.actual_minutes || data.actualMinutes || 0;
        
        this.dueDate = data.due_date || data.dueDate || null;
        this.completedAt = data.completed_at || data.completedAt || null;
        
        // 관계 데이터
        this.user = data.user || null;
        this.request = data.request || null;
        this.timeLogs = data.timeLogs || [];
    }

    get progress() {
        if (this.estimatedMinutes === 0) return 0;
        return Math.min(100, Math.round((this.actualMinutes / this.estimatedMinutes) * 100));
    }

    static STATUS = {
        TODO: 'todo',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        ON_HOLD: 'on_hold'
    };

    static getStatusName(status) {
        const statusNames = {
            todo: '할 일',
            in_progress: '진행중',
            completed: '완료',
            on_hold: '보류'
        };
        return statusNames[status] || status;
    }
}

/**
 * 업무 시간 기록 모델
 */
class TaskTimeLog extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.taskId = data.task_id || data.taskId || null;
        this.userId = data.user_id || data.userId || null;
        this.startTime = data.start_time || data.startTime || null;
        this.endTime = data.end_time || data.endTime || null;
        this.durationMinutes = data.duration_minutes || data.durationMinutes || 0;
        this.note = data.note || '';
        
        // 관계 데이터
        this.task = data.task || null;
        this.user = data.user || null;
    }

    calculateDuration() {
        if (this.startTime && this.endTime) {
            const start = new Date(this.startTime);
            const end = new Date(this.endTime);
            this.durationMinutes = Math.round((end - start) / (1000 * 60));
        }
        return this.durationMinutes;
    }
}

// =====================================================
// 시스템 모델
// =====================================================

/**
 * 알림 모델
 */
class Notification extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.userId = data.user_id || data.userId || null;
        this.type = data.type || '';
        this.title = data.title || '';
        this.message = data.message || '';
        this.link = data.link || '';
        this.referenceType = data.reference_type || data.referenceType || null;
        this.referenceId = data.reference_id || data.referenceId || null;
        this.isRead = data.is_read ?? data.isRead ?? false;
        this.readAt = data.read_at || data.readAt || null;
    }

    static TYPES = {
        ASSIGNMENT: 'assignment',
        COMMENT: 'comment',
        STATUS_CHANGE: 'status_change',
        DEADLINE: 'deadline',
        EVALUATION: 'evaluation',
        SYSTEM: 'system'
    };
}

/**
 * 로그인 기록 모델
 */
class LoginHistory extends BaseModel {
    constructor(data = {}) {
        super(data);
        this.userId = data.user_id || data.userId || null;
        this.ipAddress = data.ip_address || data.ipAddress || '';
        this.userAgent = data.user_agent || data.userAgent || '';
        this.loginAt = data.login_at || data.loginAt || new Date().toISOString();
        this.logoutAt = data.logout_at || data.logoutAt || null;
        this.isSuccess = data.is_success ?? data.isSuccess ?? true;
        this.failureReason = data.failure_reason || data.failureReason || '';
    }
}

// =====================================================
// 내보내기
// =====================================================

// ES6 모듈 환경
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseModel,
        Department,
        Team,
        User,
        FormTemplate,
        Request,
        RequestAssignee,
        RequestEvaluation,
        RequestComment,
        RequestHistory,
        Task,
        TaskTimeLog,
        Notification,
        LoginHistory
    };
}

// 브라우저 환경
if (typeof window !== 'undefined') {
    window.Models = {
        BaseModel,
        Department,
        Team,
        User,
        FormTemplate,
        Request,
        RequestAssignee,
        RequestEvaluation,
        RequestComment,
        RequestHistory,
        Task,
        TaskTimeLog,
        Notification,
        LoginHistory
    };
}


