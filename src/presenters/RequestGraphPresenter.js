/**
 * RequestGraphPresenter - 신청서 그래프 프레젠터
 * 
 * MVP Architecture - Presenter Layer
 * 
 * 역할:
 * - View와 Model 사이의 중재자
 * - 비즈니스 로직 처리
 * - 데이터 변환 및 포맷팅
 * - 이벤트 처리 및 상태 관리
 */

class RequestGraphPresenter {
    constructor(graphDB, view) {
        this.db = graphDB;
        this.view = view;
        
        // 상태 관리
        this.state = {
            selectedNodeId: null,
            currentLayout: 'none',
            filters: {
                status: 'all',
                department: 'all',
                priority: 'all'
            },
            zoom: 1,
            panOffset: { x: 0, y: 0 }
        };
        
        // 이벤트 바인딩
        this._bindModelEvents();
    }

    // ===== 초기화 =====
    
    async initialize() {
        // 로컬 스토리지에서 데이터 로드
        this.loadFromStorage();
        
        // 샘플 데이터가 없으면 생성
        if (this.db.getNodesByType('request').length === 0) {
            await this.initializeSampleData();
        }
        
        // View 초기화
        if (this.view) {
            this.view.render(this.getViewData());
        }
    }
    
    _bindModelEvents() {
        // 노드 생성 이벤트
        this.db.on('nodeCreated', ({ type, id, node }) => {
            this._logActivity(id, 'NODE_CREATED', { type });
            this.view?.onNodeCreated(node);
        });
        
        // 노드 업데이트 이벤트
        this.db.on('nodeUpdated', ({ type, id, node, oldData }) => {
            // 상태 변경 로깅
            if (type === 'request' && oldData.status !== node.data.status) {
                this._logActivity(id, 'STATUS_CHANGED', {
                    from: oldData.status,
                    to: node.data.status
                });
            }
            this.view?.onNodeUpdated(node);
        });
        
        // 엣지 생성 이벤트
        this.db.on('edgeCreated', ({ edgeType, sourceId, targetId, edge }) => {
            if (edgeType === 'ASSIGNED_TO') {
                this._logActivity(sourceId, 'MEMBER_ASSIGNED', { memberId: targetId });
            }
            this.view?.onEdgeCreated(edge);
        });
        
        // 노드 삭제 이벤트
        this.db.on('nodeDeleted', ({ type, id }) => {
            this.view?.onNodeDeleted(id);
        });
    }
    
    _logActivity(nodeId, activityType, details) {
        try {
            this.db.logActivity(nodeId, activityType, details);
        } catch (e) {
            console.error('Failed to log activity:', e);
        }
    }

    // ===== 신청서 관리 =====
    
    createRequest(data) {
        const id = `req-${Date.now()}`;
        
        const requestData = {
            title: data.title,
            type: data.type,
            priority: data.priority || 'medium',
            department: data.department,
            description: data.description || '',
            deadline: data.deadline || null,
            status: 'pending',
            requesterId: data.requesterId || null,
            x: data.x || 100,
            y: data.y || 100
        };
        
        const node = this.db.createNode('request', id, requestData);
        
        // 요청자 연결
        if (data.requesterId) {
            this.db.createEdge('REQUESTED_BY', id, data.requesterId, {});
        }
        
        this.saveToStorage();
        return node;
    }
    
    updateRequest(id, data) {
        const oldNode = this.db.getNode('request', id);
        if (!oldNode) return null;
        
        // 완료 상태로 변경 시 완료 시간 기록
        if (data.status === 'completed' && oldNode.data.status !== 'completed') {
            data.completedAt = new Date().toISOString();
        }
        
        const node = this.db.updateNode('request', id, data);
        
        // 담당자 엣지 상태도 업데이트
        if (data.status) {
            const assignments = this.db.getOutgoingEdges(id, 'ASSIGNED_TO');
            assignments.forEach(edge => {
                edge.data.status = data.status;
            });
        }
        
        this.saveToStorage();
        return node;
    }
    
    deleteRequest(id, hard = false) {
        const result = this.db.deleteNode('request', id, hard);
        this.saveToStorage();
        return result;
    }
    
    getRequest(id) {
        return this.db.getNode('request', id);
    }
    
    getAllRequests() {
        return this.db.getNodesByType('request');
    }
    
    getFilteredRequests() {
        let requests = this.getAllRequests();
        
        if (this.state.filters.status !== 'all') {
            requests = requests.filter(r => r.data.status === this.state.filters.status);
        }
        
        if (this.state.filters.department !== 'all') {
            requests = requests.filter(r => r.data.department === this.state.filters.department);
        }
        
        if (this.state.filters.priority !== 'all') {
            requests = requests.filter(r => r.data.priority === this.state.filters.priority);
        }
        
        return requests;
    }

    // ===== 담당자 관리 =====
    
    createMember(data) {
        const id = `member-${Date.now()}`;
        
        const memberData = {
            name: data.name,
            department: data.department,
            team: data.team,
            position: data.position || '사원',
            email: data.email || '',
            x: data.x || 100,
            y: data.y || 500
        };
        
        const node = this.db.createNode('member', id, memberData);
        
        // 팀 소속 연결
        if (data.team) {
            const teamNode = this.db.getNode('team', data.team);
            if (teamNode) {
                this.db.createEdge('BELONGS_TO', id, data.team, {});
            }
        }
        
        this.saveToStorage();
        return node;
    }
    
    updateMember(id, data) {
        const node = this.db.updateNode('member', id, data);
        this.saveToStorage();
        return node;
    }
    
    deleteMember(id, hard = false) {
        const result = this.db.deleteNode('member', id, hard);
        this.saveToStorage();
        return result;
    }
    
    getMember(id) {
        return this.db.getNode('member', id);
    }
    
    getAllMembers() {
        return this.db.getNodesByType('member');
    }
    
    getMembersByDepartment(departmentId) {
        return this.db.findMembersByDepartment(departmentId);
    }
    
    getMembersByTeam(teamId) {
        return this.db.findMembersByTeam(teamId);
    }

    // ===== 담당자 배정 =====
    
    assignMemberToRequest(requestId, memberId) {
        const request = this.db.getNode('request', requestId);
        const member = this.db.getNode('member', memberId);
        
        if (!request || !member) {
            throw new Error('Request or member not found');
        }
        
        // 이미 배정되어 있는지 확인
        const existingEdge = this.db.getEdge('ASSIGNED_TO', requestId, memberId);
        if (existingEdge) {
            throw new Error('Already assigned');
        }
        
        const edge = this.db.createEdge('ASSIGNED_TO', requestId, memberId, {
            status: request.data.status,
            assignedAt: new Date().toISOString()
        });
        
        this.saveToStorage();
        return edge;
    }
    
    unassignMemberFromRequest(requestId, memberId) {
        const result = this.db.removeEdge('ASSIGNED_TO', requestId, memberId);
        
        if (result) {
            this._logActivity(requestId, 'MEMBER_UNASSIGNED', { memberId });
        }
        
        this.saveToStorage();
        return result;
    }
    
    getAssignedMembers(requestId) {
        const edges = this.db.getOutgoingEdges(requestId, 'ASSIGNED_TO');
        return edges.map(edge => ({
            member: this.db.getNode('member', edge.target),
            assignment: edge
        })).filter(item => item.member);
    }
    
    getMemberAssignments(memberId) {
        const edges = this.db.getIncomingEdges(memberId, 'ASSIGNED_TO');
        return edges.map(edge => ({
            request: this.db.getNode('request', edge.source),
            assignment: edge
        })).filter(item => item.request);
    }

    // ===== 평가 관리 =====
    
    evaluateRequest(requestId, evaluation) {
        const request = this.db.getNode('request', requestId);
        if (!request) return null;
        
        const evaluationData = {
            technical: evaluation.technical || 0,
            communication: evaluation.communication || 0,
            efficiency: evaluation.efficiency || 0,
            quality: evaluation.quality || 0,
            comment: evaluation.comment || '',
            evaluatedAt: new Date().toISOString(),
            evaluatedBy: evaluation.evaluatedBy || null
        };
        
        // 신청서에 평가 데이터 저장
        this.db.updateNode('request', requestId, { evaluation: evaluationData });
        
        // 평가 노드 생성 (히스토리용)
        const evalId = `eval-${Date.now()}`;
        this.db.createNode('evaluation', evalId, {
            requestId,
            ...evaluationData
        });
        this.db.createEdge('EVALUATED_BY', requestId, evalId, {});
        
        this._logActivity(requestId, 'EVALUATED', evaluationData);
        
        this.saveToStorage();
        return evaluationData;
    }
    
    getRequestEvaluationHistory(requestId) {
        const edges = this.db.getOutgoingEdges(requestId, 'EVALUATED_BY');
        return edges.map(edge => this.db.getNode('evaluation', edge.target))
            .filter(Boolean)
            .sort((a, b) => new Date(b.data.evaluatedAt) - new Date(a.data.evaluatedAt));
    }

    // ===== 노드 선택 및 상태 =====
    
    selectNode(nodeId) {
        this.state.selectedNodeId = nodeId;
        
        const node = this.db.getNodeById(nodeId);
        if (node) {
            this.view?.onNodeSelected(node);
        }
        
        return node;
    }
    
    deselectNode() {
        this.state.selectedNodeId = null;
        this.view?.onNodeDeselected();
    }
    
    getSelectedNode() {
        if (!this.state.selectedNodeId) return null;
        return this.db.getNodeById(this.state.selectedNodeId);
    }
    
    updateNodePosition(nodeId, x, y) {
        const node = this.db.getNodeById(nodeId);
        if (!node) return null;
        
        return this.db.updateNode(node.type, nodeId, { x, y });
    }

    // ===== 필터링 =====
    
    setFilter(filterType, value) {
        this.state.filters[filterType] = value;
        this.view?.onFiltersChanged(this.state.filters);
    }
    
    clearFilters() {
        this.state.filters = {
            status: 'all',
            department: 'all',
            priority: 'all'
        };
        this.view?.onFiltersChanged(this.state.filters);
    }

    // ===== 레이아웃 =====
    
    setLayout(layoutType) {
        this.state.currentLayout = layoutType;
        
        if (layoutType === 'none') {
            this.view?.onLayoutChanged(layoutType, null);
            return;
        }
        
        const positions = this._calculateLayout(layoutType);
        
        // 노드 위치 업데이트
        Object.entries(positions).forEach(([nodeId, pos]) => {
            const node = this.db.getNodeById(nodeId);
            if (node) {
                this.db.updateNode(node.type, nodeId, { x: pos.x, y: pos.y });
            }
        });
        
        this.saveToStorage();
        this.view?.onLayoutChanged(layoutType, positions);
    }
    
    _calculateLayout(layoutType) {
        const requests = this.getFilteredRequests();
        const members = this.getAllMembers();
        
        const canvasWidth = 1200;
        const canvasHeight = 800;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        const positions = {};
        
        switch (layoutType) {
            case 'hierarchical':
                return this._hierarchicalLayout(requests, members, centerX, centerY);
            case 'circular':
                return this._circularLayout(requests, members, centerX, centerY);
            case 'grid':
                return this._gridLayout(requests, members, centerX, centerY);
            case 'force':
                return this._forceDirectedLayout(requests, members, centerX, centerY);
            case 'department':
                return this._departmentLayout(requests, members, centerX, centerY);
            case 'status':
                return this._statusLayout(requests, members, centerX, centerY);
            default:
                return positions;
        }
    }
    
    _hierarchicalLayout(requests, members, centerX, centerY) {
        const positions = {};
        const requestWidth = 220;
        const memberWidth = 160;
        
        const reqTotalWidth = requests.length * requestWidth;
        const reqStartX = centerX - reqTotalWidth / 2;
        
        requests.forEach((req, index) => {
            positions[req.id] = {
                x: reqStartX + index * requestWidth + requestWidth / 2 - 100,
                y: 50
            };
        });
        
        const memTotalWidth = members.length * memberWidth;
        const memStartX = centerX - memTotalWidth / 2;
        
        members.forEach((member, index) => {
            positions[member.id] = {
                x: memStartX + index * memberWidth + memberWidth / 2 - 70,
                y: 300
            };
        });
        
        return positions;
    }
    
    _circularLayout(requests, members, centerX, centerY) {
        const positions = {};
        const outerRadius = Math.min(centerX, centerY) - 150;
        const innerRadius = outerRadius * 0.5;
        
        requests.forEach((req, index) => {
            const angle = (2 * Math.PI * index) / requests.length - Math.PI / 2;
            positions[req.id] = {
                x: centerX + outerRadius * Math.cos(angle) - 100,
                y: centerY + outerRadius * Math.sin(angle) - 60
            };
        });
        
        members.forEach((member, index) => {
            const angle = (2 * Math.PI * index) / members.length - Math.PI / 2;
            positions[member.id] = {
                x: centerX + innerRadius * Math.cos(angle) - 70,
                y: centerY + innerRadius * Math.sin(angle) - 60
            };
        });
        
        return positions;
    }
    
    _gridLayout(requests, members, centerX, centerY) {
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
    
    _forceDirectedLayout(requests, members, centerX, centerY) {
        const positions = {};
        const allNodes = [...requests, ...members];
        
        // 초기 위치 (원형)
        allNodes.forEach((node, index) => {
            const angle = (2 * Math.PI * index) / allNodes.length;
            const radius = 300;
            positions[node.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
        
        // Force-directed 시뮬레이션
        const iterations = 100;
        const repulsion = 50000;
        const attraction = 0.01;
        const damping = 0.9;
        
        const velocities = {};
        allNodes.forEach(node => {
            velocities[node.id] = { x: 0, y: 0 };
        });
        
        for (let i = 0; i < iterations; i++) {
            // 반발력
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
            
            // 인력 (연결된 노드)
            this.db.edges.ASSIGNED_TO.forEach(edge => {
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
            
            // 중심력
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
    
    _departmentLayout(requests, members, centerX, centerY) {
        const positions = {};
        const departments = this._getDepartments();
        
        const deptGroups = {};
        departments.forEach(dept => {
            deptGroups[dept.id] = {
                requests: requests.filter(r => r.data.department === dept.id),
                members: members.filter(m => m.data.department === dept.id)
            };
        });
        
        const activeDepts = Object.entries(deptGroups)
            .filter(([_, g]) => g.requests.length > 0 || g.members.length > 0);
        
        const angleStep = (2 * Math.PI) / activeDepts.length;
        const groupRadius = Math.min(centerX, centerY) - 200;
        
        activeDepts.forEach(([deptId, group], index) => {
            const angle = angleStep * index - Math.PI / 2;
            const groupCenterX = centerX + groupRadius * Math.cos(angle);
            const groupCenterY = centerY + groupRadius * Math.sin(angle);
            
            const allDeptNodes = [...group.requests, ...group.members];
            const localRadius = 80;
            
            allDeptNodes.forEach((node, nodeIndex) => {
                const localAngle = (2 * Math.PI * nodeIndex) / allDeptNodes.length;
                const offsetX = node.type === 'request' ? -100 : -70;
                
                positions[node.id] = {
                    x: groupCenterX + localRadius * Math.cos(localAngle) + offsetX,
                    y: groupCenterY + localRadius * Math.sin(localAngle) - 60
                };
            });
        });
        
        return positions;
    }
    
    _statusLayout(requests, members, centerX, centerY) {
        const positions = {};
        
        const statusGroups = {
            pending: { requests: [], members: new Set() },
            progress: { requests: [], members: new Set() },
            completed: { requests: [], members: new Set() }
        };
        
        requests.forEach(req => {
            statusGroups[req.data.status].requests.push(req);
            
            const assignedMembers = this.getAssignedMembers(req.id);
            assignedMembers.forEach(({ member }) => {
                statusGroups[req.data.status].members.add(member);
            });
        });
        
        // 미배정 담당자
        members.forEach(member => {
            const isAssigned = Object.values(statusGroups).some(g => g.members.has(member));
            if (!isAssigned) {
                statusGroups.pending.members.add(member);
            }
        });
        
        const columnWidth = (centerX * 2) / 3;
        const statusOrder = ['pending', 'progress', 'completed'];
        
        statusOrder.forEach((status, colIndex) => {
            const group = statusGroups[status];
            const colCenterX = columnWidth * colIndex + columnWidth / 2;
            
            group.requests.forEach((req, index) => {
                positions[req.id] = {
                    x: colCenterX - 100,
                    y: 80 + index * 150
                };
            });
            
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
    
    _getDepartments() {
        return [
            { id: 'dba', name: 'DBA팀' },
            { id: 'frontend', name: 'Frontend팀' },
            { id: 'backend', name: 'Backend팀' },
            { id: 'infra', name: 'Infra팀' },
            { id: 'qa', name: 'QA팀' },
            { id: 'security', name: '보안팀' }
        ];
    }

    // ===== 통계 및 분석 =====
    
    getRequestStats() {
        return this.db.getRequestStats();
    }
    
    getMemberStats(memberId = null) {
        return this.db.getMemberStats(memberId);
    }
    
    getDepartmentStats(departmentId = null) {
        return this.db.getDepartmentStats(departmentId);
    }
    
    getRequestTrend(startDate, endDate, groupBy = 'day') {
        return this.db.getRequestTrend(startDate, endDate, groupBy);
    }
    
    getSummaryStats() {
        return this.db.getSummaryStats();
    }
    
    getRecentActivities(limit = 20) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        return this.db.getActivitiesByDateRange(startDate, endDate).slice(0, limit);
    }

    // ===== View 데이터 =====
    
    getViewData() {
        return {
            requests: this.getFilteredRequests(),
            members: this.getAllMembers(),
            edges: Array.from(this.db.edges.ASSIGNED_TO.values()),
            departments: this._getDepartments(),
            filters: this.state.filters,
            currentLayout: this.state.currentLayout,
            selectedNodeId: this.state.selectedNodeId,
            stats: this.getSummaryStats()
        };
    }
    
    getNodeDetailData(nodeId) {
        const node = this.db.getNodeById(nodeId);
        if (!node) return null;
        
        if (node.type === 'request') {
            return {
                node,
                assignedMembers: this.getAssignedMembers(nodeId),
                evaluationHistory: this.getRequestEvaluationHistory(nodeId),
                activities: this.db.getActivitiesByNode(nodeId, 10)
            };
        } else if (node.type === 'member') {
            return {
                node,
                assignments: this.getMemberAssignments(nodeId),
                stats: this.getMemberStats(nodeId),
                activities: this.db.getActivitiesByNode(nodeId, 10)
            };
        }
        
        return { node };
    }

    // ===== 저장/로드 =====
    
    saveToStorage() {
        try {
            const data = this.db.toJSON();
            localStorage.setItem('graphDatabaseV2', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to storage:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('graphDatabaseV2');
            if (saved) {
                this.db.fromJSON(JSON.parse(saved));
                return true;
            }
        } catch (e) {
            console.error('Failed to load from storage:', e);
        }
        return false;
    }
    
    clearStorage() {
        localStorage.removeItem('graphDatabaseV2');
    }

    // ===== 샘플 데이터 =====
    
    async initializeSampleData() {
        // 부서 및 팀 생성
        const departments = this._getDepartments();
        const teams = [
            { id: 'dba-data', name: '데이터관리', department: 'dba' },
            { id: 'dba-perf', name: '성능최적화', department: 'dba' },
            { id: 'fe-web', name: '웹개발', department: 'frontend' },
            { id: 'fe-mobile', name: '모바일', department: 'frontend' },
            { id: 'be-api', name: 'API개발', department: 'backend' },
            { id: 'be-batch', name: '배치처리', department: 'backend' },
            { id: 'infra-cloud', name: '클라우드', department: 'infra' },
            { id: 'infra-network', name: '네트워크', department: 'infra' },
            { id: 'qa-auto', name: '자동화테스트', department: 'qa' },
            { id: 'qa-manual', name: '수동테스트', department: 'qa' },
            { id: 'sec-audit', name: '보안감사', department: 'security' },
            { id: 'sec-ops', name: '보안운영', department: 'security' }
        ];
        
        departments.forEach(dept => {
            this.db.createNode('department', dept.id, dept);
        });
        
        teams.forEach(team => {
            this.db.createNode('team', team.id, team);
            this.db.createEdge('PART_OF', team.id, team.department, {});
        });
        
        // 샘플 담당자 (25명)
        const sampleMembers = [
            { name: '김철수', department: 'dba', team: 'dba-data', position: '과장' },
            { name: '한지민', department: 'dba', team: 'dba-perf', position: '대리' },
            { name: '송태양', department: 'dba', team: 'dba-data', position: '사원' },
            { name: '임하늘', department: 'dba', team: 'dba-perf', position: '팀장' },
            { name: '이영희', department: 'frontend', team: 'fe-web', position: '대리' },
            { name: '윤서연', department: 'frontend', team: 'fe-mobile', position: '사원' },
            { name: '조예진', department: 'frontend', team: 'fe-web', position: '과장' },
            { name: '문지호', department: 'frontend', team: 'fe-mobile', position: '대리' },
            { name: '박민수', department: 'backend', team: 'be-api', position: '차장' },
            { name: '장현우', department: 'backend', team: 'be-batch', position: '팀장' },
            { name: '신동욱', department: 'backend', team: 'be-api', position: '대리' },
            { name: '권나연', department: 'backend', team: 'be-batch', position: '사원' },
            { name: '유재석', department: 'backend', team: 'be-api', position: '과장' },
            { name: '정수진', department: 'infra', team: 'infra-cloud', position: '주임' },
            { name: '오승훈', department: 'infra', team: 'infra-network', position: '과장' },
            { name: '배준형', department: 'infra', team: 'infra-cloud', position: '대리' },
            { name: '홍길동', department: 'infra', team: 'infra-network', position: '사원' },
            { name: '최동현', department: 'qa', team: 'qa-auto', position: '대리' },
            { name: '안소희', department: 'qa', team: 'qa-manual', position: '과장' },
            { name: '노지훈', department: 'qa', team: 'qa-auto', position: '사원' },
            { name: '서민지', department: 'qa', team: 'qa-manual', position: '주임' },
            { name: '강미래', department: 'security', team: 'sec-audit', position: '과장' },
            { name: '백승우', department: 'security', team: 'sec-ops', position: '대리' },
            { name: '차은우', department: 'security', team: 'sec-audit', position: '팀장' },
            { name: '고윤정', department: 'security', team: 'sec-ops', position: '사원' }
        ];
        
        const memberIds = [];
        const memberCols = 6;
        sampleMembers.forEach((member, index) => {
            const col = index % memberCols;
            const row = Math.floor(index / memberCols);
            const id = `member-${index + 1}`;
            
            this.db.createNode('member', id, {
                ...member,
                email: `${member.name.toLowerCase().replace(' ', '')}@company.com`,
                x: 60 + col * 180,
                y: 500 + row * 150
            });
            
            this.db.createEdge('BELONGS_TO', id, member.team, {});
            memberIds.push(id);
        });
        
        // 샘플 신청서 (20개)
        const sampleRequests = [
            { title: '월간 매출 데이터 추출', type: '데이터 추출', priority: 'high', department: 'dba', status: 'progress' },
            { title: 'DB 쿼리 최적화', type: '데이터 추출', priority: 'low', department: 'dba', status: 'completed' },
            { title: '고객 데이터 백업 요청', type: '데이터 추출', priority: 'urgent', department: 'dba', status: 'progress' },
            { title: '통계 테이블 인덱스 추가', type: '데이터 추출', priority: 'medium', department: 'dba', status: 'pending' },
            { title: '신규 대시보드 UI 개발', type: '화면 개발', priority: 'medium', department: 'frontend', status: 'progress' },
            { title: '모바일 앱 성능 개선', type: '화면 개발', priority: 'medium', department: 'frontend', status: 'pending' },
            { title: '회원가입 화면 리뉴얼', type: '화면 개발', priority: 'high', department: 'frontend', status: 'progress' },
            { title: '관리자 페이지 다크모드', type: '화면 개발', priority: 'low', department: 'frontend', status: 'completed' },
            { title: '결제 API 버그 수정', type: '버그 수정', priority: 'urgent', department: 'backend', status: 'pending' },
            { title: '회원 API 개발', type: 'API 개발', priority: 'medium', department: 'backend', status: 'progress' },
            { title: '알림 서비스 API 개발', type: 'API 개발', priority: 'high', department: 'backend', status: 'progress' },
            { title: '주문 처리 배치 수정', type: '버그 수정', priority: 'medium', department: 'backend', status: 'completed' },
            { title: '파일 업로드 API 개선', type: 'API 개발', priority: 'low', department: 'backend', status: 'pending' },
            { title: '서버 증설 요청', type: '인프라 요청', priority: 'high', department: 'infra', status: 'completed' },
            { title: 'CDN 설정 요청', type: '인프라 요청', priority: 'medium', department: 'infra', status: 'progress' },
            { title: 'SSL 인증서 갱신', type: '인프라 요청', priority: 'urgent', department: 'infra', status: 'progress' },
            { title: '회원 서비스 통합 테스트', type: '기타', priority: 'high', department: 'qa', status: 'progress' },
            { title: '결제 모듈 자동화 테스트', type: '기타', priority: 'medium', department: 'qa', status: 'pending' },
            { title: '보안 취약점 점검', type: '보안 점검', priority: 'high', department: 'security', status: 'progress' },
            { title: '개인정보 접근 로그 감사', type: '보안 점검', priority: 'medium', department: 'security', status: 'pending' }
        ];
        
        const requestIds = [];
        const cols = 5;
        sampleRequests.forEach((req, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const id = `req-${index + 1}`;
            
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
            
            this.db.createNode('request', id, {
                ...req,
                deadline: new Date(Date.now() + (7 + Math.random() * 21) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                x: 80 + col * 250,
                y: 60 + row * 180,
                createdAt: createdAt.toISOString(),
                completedAt: req.status === 'completed' ? new Date().toISOString() : null,
                evaluation: req.status === 'completed' ? {
                    technical: Math.floor(Math.random() * 30) + 70,
                    communication: Math.floor(Math.random() * 30) + 70,
                    efficiency: Math.floor(Math.random() * 30) + 70,
                    quality: Math.floor(Math.random() * 30) + 70
                } : null
            });
            requestIds.push(id);
        });
        
        // 샘플 배정 관계
        const assignments = [
            { req: 0, members: [0, 1] },
            { req: 1, members: [0, 2] },
            { req: 2, members: [3, 1] },
            { req: 3, members: [2] },
            { req: 4, members: [4, 5, 6] },
            { req: 5, members: [5, 7] },
            { req: 6, members: [4, 7] },
            { req: 7, members: [6] },
            { req: 8, members: [8, 12] },
            { req: 9, members: [8, 9, 10] },
            { req: 10, members: [10, 11] },
            { req: 11, members: [9, 11] },
            { req: 12, members: [12] },
            { req: 13, members: [13, 14] },
            { req: 14, members: [15, 13] },
            { req: 15, members: [14, 16] },
            { req: 16, members: [17, 18, 19] },
            { req: 17, members: [19, 20] },
            { req: 18, members: [21, 23] },
            { req: 19, members: [22, 24] }
        ];
        
        assignments.forEach(({ req, members }) => {
            const request = this.db.getNode('request', requestIds[req]);
            members.forEach(memberIdx => {
                this.db.createEdge('ASSIGNED_TO', requestIds[req], memberIds[memberIdx], {
                    status: request.data.status,
                    assignedAt: new Date().toISOString()
                });
            });
        });
        
        this.saveToStorage();
    }
    
    resetToSampleData() {
        // 모든 데이터 초기화
        Object.keys(this.db.nodes).forEach(type => {
            this.db.nodes[type] = new Map();
        });
        Object.keys(this.db.edges).forEach(type => {
            this.db.edges[type] = new Map();
        });
        this.db.adjacencyList = new Map();
        this.db._rebuildIndexes();
        
        this.clearStorage();
        this.initializeSampleData();
        
        this.state.selectedNodeId = null;
        this.state.currentLayout = 'none';
        this.clearFilters();
        
        this.view?.render(this.getViewData());
    }
}

// ES Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RequestGraphPresenter;
}


