/**
 * GraphDatabase - 그래프 데이터베이스 모델
 * 
 * MVP Architecture - Model Layer
 * 
 * 노드 타입:
 * - request: 신청서 노드
 * - member: 담당자 노드
 * - department: 부서 노드
 * - team: 팀 노드
 * - evaluation: 평가 노드
 * - activity: 활동 로그 노드
 * 
 * 엣지 타입:
 * - ASSIGNED_TO: 신청서 -> 담당자 (담당 배정)
 * - BELONGS_TO: 담당자 -> 팀 (소속)
 * - PART_OF: 팀 -> 부서 (소속)
 * - EVALUATED_BY: 신청서 -> 평가 (평가 연결)
 * - LOGGED: 신청서/담당자 -> 활동 (활동 기록)
 * - REQUESTED_BY: 신청서 -> 담당자 (요청자)
 */

class GraphDatabase {
    constructor() {
        // 노드 저장소 (타입별로 분리)
        this.nodes = {
            request: new Map(),
            member: new Map(),
            department: new Map(),
            team: new Map(),
            evaluation: new Map(),
            activity: new Map()
        };
        
        // 엣지 저장소 (타입별로 분리)
        this.edges = {
            ASSIGNED_TO: new Map(),
            BELONGS_TO: new Map(),
            PART_OF: new Map(),
            EVALUATED_BY: new Map(),
            LOGGED: new Map(),
            REQUESTED_BY: new Map()
        };
        
        // 인접 리스트 (빠른 관계 조회용)
        this.adjacencyList = new Map();
        
        // 인덱스 (빠른 검색용)
        this.indexes = {
            requestByStatus: new Map(),      // status -> Set<requestId>
            requestByDepartment: new Map(),  // departmentId -> Set<requestId>
            requestByPriority: new Map(),    // priority -> Set<requestId>
            memberByDepartment: new Map(),   // departmentId -> Set<memberId>
            memberByTeam: new Map(),         // teamId -> Set<memberId>
            activityByDate: new Map(),       // dateString -> Set<activityId>
            activityByType: new Map()        // activityType -> Set<activityId>
        };
        
        // 통계 캐시
        this.statsCache = {
            lastUpdated: null,
            data: null
        };
        
        // 이벤트 리스너
        this.listeners = new Map();
    }

    // ===== 노드 CRUD =====
    
    /**
     * 노드 생성
     * @param {string} type - 노드 타입
     * @param {string} id - 노드 ID
     * @param {object} data - 노드 데이터
     * @returns {object} 생성된 노드
     */
    createNode(type, id, data) {
        if (!this.nodes[type]) {
            throw new Error(`Unknown node type: ${type}`);
        }
        
        const node = {
            id,
            type,
            data: {
                ...data,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            metadata: {
                version: 1,
                deleted: false
            }
        };
        
        this.nodes[type].set(id, node);
        
        if (!this.adjacencyList.has(id)) {
            this.adjacencyList.set(id, { incoming: new Set(), outgoing: new Set() });
        }
        
        // 인덱스 업데이트
        this._updateIndexesOnCreate(type, id, data);
        
        // 통계 캐시 무효화
        this._invalidateStatsCache();
        
        // 이벤트 발행
        this._emit('nodeCreated', { type, id, node });
        
        return node;
    }
    
    /**
     * 노드 조회
     */
    getNode(type, id) {
        if (!this.nodes[type]) return null;
        const node = this.nodes[type].get(id);
        return node && !node.metadata.deleted ? node : null;
    }
    
    /**
     * ID로 노드 조회 (타입 자동 탐색)
     */
    getNodeById(id) {
        for (const type of Object.keys(this.nodes)) {
            const node = this.nodes[type].get(id);
            if (node && !node.metadata.deleted) return node;
        }
        return null;
    }
    
    /**
     * 노드 업데이트
     */
    updateNode(type, id, data) {
        const node = this.getNode(type, id);
        if (!node) return null;
        
        const oldData = { ...node.data };
        node.data = {
            ...node.data,
            ...data,
            updatedAt: new Date().toISOString()
        };
        node.metadata.version++;
        
        // 인덱스 업데이트
        this._updateIndexesOnUpdate(type, id, oldData, node.data);
        
        // 통계 캐시 무효화
        this._invalidateStatsCache();
        
        // 이벤트 발행
        this._emit('nodeUpdated', { type, id, node, oldData });
        
        return node;
    }
    
    /**
     * 노드 삭제 (소프트 삭제)
     */
    deleteNode(type, id, hard = false) {
        const node = this.getNode(type, id);
        if (!node) return false;
        
        if (hard) {
            // 하드 삭제: 완전히 제거
            this.nodes[type].delete(id);
            
            // 연결된 엣지 삭제
            const adj = this.adjacencyList.get(id);
            if (adj) {
                adj.incoming.forEach(edgeId => this._removeEdgeById(edgeId));
                adj.outgoing.forEach(edgeId => this._removeEdgeById(edgeId));
            }
            this.adjacencyList.delete(id);
        } else {
            // 소프트 삭제: 삭제 표시만
            node.metadata.deleted = true;
            node.metadata.deletedAt = new Date().toISOString();
        }
        
        // 인덱스 업데이트
        this._updateIndexesOnDelete(type, id, node.data);
        
        // 통계 캐시 무효화
        this._invalidateStatsCache();
        
        // 이벤트 발행
        this._emit('nodeDeleted', { type, id, hard });
        
        return true;
    }
    
    /**
     * 타입별 모든 노드 조회
     */
    getNodesByType(type) {
        if (!this.nodes[type]) return [];
        return Array.from(this.nodes[type].values())
            .filter(node => !node.metadata.deleted);
    }

    // ===== 엣지 CRUD =====
    
    /**
     * 엣지 생성 (관계 생성)
     */
    createEdge(edgeType, sourceId, targetId, data = {}) {
        if (!this.edges[edgeType]) {
            throw new Error(`Unknown edge type: ${edgeType}`);
        }
        
        const edgeId = `${edgeType}:${sourceId}->${targetId}`;
        
        const edge = {
            id: edgeId,
            type: edgeType,
            source: sourceId,
            target: targetId,
            data: {
                ...data,
                createdAt: new Date().toISOString()
            }
        };
        
        this.edges[edgeType].set(edgeId, edge);
        
        // 인접 리스트 업데이트
        if (!this.adjacencyList.has(sourceId)) {
            this.adjacencyList.set(sourceId, { incoming: new Set(), outgoing: new Set() });
        }
        if (!this.adjacencyList.has(targetId)) {
            this.adjacencyList.set(targetId, { incoming: new Set(), outgoing: new Set() });
        }
        
        this.adjacencyList.get(sourceId).outgoing.add(edgeId);
        this.adjacencyList.get(targetId).incoming.add(edgeId);
        
        // 통계 캐시 무효화
        this._invalidateStatsCache();
        
        // 이벤트 발행
        this._emit('edgeCreated', { edgeType, sourceId, targetId, edge });
        
        return edge;
    }
    
    /**
     * 엣지 조회
     */
    getEdge(edgeType, sourceId, targetId) {
        const edgeId = `${edgeType}:${sourceId}->${targetId}`;
        return this.edges[edgeType]?.get(edgeId) || null;
    }
    
    /**
     * 엣지 삭제
     */
    removeEdge(edgeType, sourceId, targetId) {
        const edgeId = `${edgeType}:${sourceId}->${targetId}`;
        return this._removeEdgeById(edgeId);
    }
    
    _removeEdgeById(edgeId) {
        for (const edgeType of Object.keys(this.edges)) {
            const edge = this.edges[edgeType].get(edgeId);
            if (edge) {
                this.edges[edgeType].delete(edgeId);
                
                const sourceAdj = this.adjacencyList.get(edge.source);
                const targetAdj = this.adjacencyList.get(edge.target);
                
                if (sourceAdj) sourceAdj.outgoing.delete(edgeId);
                if (targetAdj) targetAdj.incoming.delete(edgeId);
                
                this._emit('edgeRemoved', { edgeType, edge });
                return true;
            }
        }
        return false;
    }

    // ===== 관계 조회 쿼리 =====
    
    /**
     * 특정 노드에서 나가는 관계 조회
     */
    getOutgoingEdges(nodeId, edgeType = null) {
        const adj = this.adjacencyList.get(nodeId);
        if (!adj) return [];
        
        const edges = [];
        adj.outgoing.forEach(edgeId => {
            for (const type of Object.keys(this.edges)) {
                if (edgeType && type !== edgeType) continue;
                const edge = this.edges[type].get(edgeId);
                if (edge) edges.push(edge);
            }
        });
        return edges;
    }
    
    /**
     * 특정 노드로 들어오는 관계 조회
     */
    getIncomingEdges(nodeId, edgeType = null) {
        const adj = this.adjacencyList.get(nodeId);
        if (!adj) return [];
        
        const edges = [];
        adj.incoming.forEach(edgeId => {
            for (const type of Object.keys(this.edges)) {
                if (edgeType && type !== edgeType) continue;
                const edge = this.edges[type].get(edgeId);
                if (edge) edges.push(edge);
            }
        });
        return edges;
    }
    
    /**
     * 연결된 노드들 조회
     */
    getConnectedNodes(nodeId, direction = 'both', edgeType = null) {
        const nodes = [];
        
        if (direction === 'outgoing' || direction === 'both') {
            this.getOutgoingEdges(nodeId, edgeType).forEach(edge => {
                const node = this.getNodeById(edge.target);
                if (node) nodes.push({ node, edge, direction: 'outgoing' });
            });
        }
        
        if (direction === 'incoming' || direction === 'both') {
            this.getIncomingEdges(nodeId, edgeType).forEach(edge => {
                const node = this.getNodeById(edge.source);
                if (node) nodes.push({ node, edge, direction: 'incoming' });
            });
        }
        
        return nodes;
    }
    
    /**
     * 경로 탐색 (BFS)
     */
    findPath(startId, endId, maxDepth = 10) {
        const visited = new Set();
        const queue = [[startId]];
        
        while (queue.length > 0) {
            const path = queue.shift();
            const currentId = path[path.length - 1];
            
            if (currentId === endId) {
                return path.map(id => this.getNodeById(id));
            }
            
            if (path.length > maxDepth) continue;
            if (visited.has(currentId)) continue;
            
            visited.add(currentId);
            
            const connected = this.getConnectedNodes(currentId);
            connected.forEach(({ node }) => {
                if (!visited.has(node.id)) {
                    queue.push([...path, node.id]);
                }
            });
        }
        
        return null;
    }

    // ===== 분석용 쿼리 메서드 =====
    
    /**
     * 신청서 통계 조회
     */
    getRequestStats() {
        const requests = this.getNodesByType('request');
        
        const stats = {
            total: requests.length,
            byStatus: { pending: 0, progress: 0, completed: 0 },
            byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
            byDepartment: {},
            byType: {},
            avgProcessingTime: 0,
            completionRate: 0
        };
        
        let totalProcessingTime = 0;
        let completedWithTime = 0;
        
        requests.forEach(req => {
            // 상태별
            stats.byStatus[req.data.status] = (stats.byStatus[req.data.status] || 0) + 1;
            
            // 우선순위별
            stats.byPriority[req.data.priority] = (stats.byPriority[req.data.priority] || 0) + 1;
            
            // 부서별
            stats.byDepartment[req.data.department] = (stats.byDepartment[req.data.department] || 0) + 1;
            
            // 유형별
            stats.byType[req.data.type] = (stats.byType[req.data.type] || 0) + 1;
            
            // 처리 시간 계산
            if (req.data.status === 'completed' && req.data.completedAt) {
                const created = new Date(req.data.createdAt);
                const completed = new Date(req.data.completedAt);
                totalProcessingTime += (completed - created) / (1000 * 60 * 60 * 24); // 일 단위
                completedWithTime++;
            }
        });
        
        stats.avgProcessingTime = completedWithTime > 0 
            ? (totalProcessingTime / completedWithTime).toFixed(1) 
            : 0;
        stats.completionRate = stats.total > 0 
            ? ((stats.byStatus.completed / stats.total) * 100).toFixed(1) 
            : 0;
        
        return stats;
    }
    
    /**
     * 담당자 통계 조회
     */
    getMemberStats(memberId = null) {
        if (memberId) {
            return this._getMemberIndividualStats(memberId);
        }
        
        const members = this.getNodesByType('member');
        const stats = {
            total: members.length,
            byDepartment: {},
            byPosition: {},
            topPerformers: [],
            workloadDistribution: []
        };
        
        const memberWorkloads = [];
        
        members.forEach(member => {
            // 부서별
            stats.byDepartment[member.data.department] = 
                (stats.byDepartment[member.data.department] || 0) + 1;
            
            // 직급별
            stats.byPosition[member.data.position] = 
                (stats.byPosition[member.data.position] || 0) + 1;
            
            // 업무량 계산
            const assignments = this.getIncomingEdges(member.id, 'ASSIGNED_TO');
            const completed = assignments.filter(e => e.data.status === 'completed').length;
            const inProgress = assignments.filter(e => e.data.status === 'progress').length;
            
            memberWorkloads.push({
                member,
                total: assignments.length,
                completed,
                inProgress,
                completionRate: assignments.length > 0 
                    ? (completed / assignments.length * 100).toFixed(1) 
                    : 0
            });
        });
        
        // 상위 성과자
        stats.topPerformers = memberWorkloads
            .sort((a, b) => b.completed - a.completed)
            .slice(0, 5)
            .map(w => ({
                id: w.member.id,
                name: w.member.data.name,
                completed: w.completed,
                completionRate: w.completionRate
            }));
        
        // 업무량 분포
        stats.workloadDistribution = memberWorkloads.map(w => ({
            id: w.member.id,
            name: w.member.data.name,
            department: w.member.data.department,
            workload: w.total,
            inProgress: w.inProgress
        }));
        
        return stats;
    }
    
    _getMemberIndividualStats(memberId) {
        const member = this.getNode('member', memberId);
        if (!member) return null;
        
        const assignments = this.getIncomingEdges(memberId, 'ASSIGNED_TO');
        const evaluations = [];
        
        assignments.forEach(edge => {
            const request = this.getNodeById(edge.source);
            if (request?.data.evaluation) {
                evaluations.push(request.data.evaluation);
            }
        });
        
        const avgEvaluation = evaluations.length > 0 ? {
            technical: (evaluations.reduce((sum, e) => sum + e.technical, 0) / evaluations.length).toFixed(1),
            communication: (evaluations.reduce((sum, e) => sum + e.communication, 0) / evaluations.length).toFixed(1),
            efficiency: (evaluations.reduce((sum, e) => sum + e.efficiency, 0) / evaluations.length).toFixed(1),
            quality: (evaluations.reduce((sum, e) => sum + e.quality, 0) / evaluations.length).toFixed(1)
        } : null;
        
        return {
            member: member.data,
            assignments: {
                total: assignments.length,
                pending: assignments.filter(e => e.data.status === 'pending').length,
                progress: assignments.filter(e => e.data.status === 'progress').length,
                completed: assignments.filter(e => e.data.status === 'completed').length
            },
            avgEvaluation,
            recentActivities: this.getActivitiesByNode(memberId, 10)
        };
    }
    
    /**
     * 부서별 통계 조회
     */
    getDepartmentStats(departmentId = null) {
        const departments = this.getNodesByType('department');
        
        if (departmentId) {
            const dept = this.getNode('department', departmentId);
            if (!dept) return null;
            
            const teams = this.getConnectedNodes(departmentId, 'incoming', 'PART_OF')
                .map(({ node }) => node);
            
            let memberCount = 0;
            let requestCount = 0;
            
            teams.forEach(team => {
                const members = this.getConnectedNodes(team.id, 'incoming', 'BELONGS_TO');
                memberCount += members.length;
            });
            
            const requests = this.getNodesByType('request')
                .filter(r => r.data.department === departmentId);
            requestCount = requests.length;
            
            return {
                department: dept.data,
                teams: teams.length,
                members: memberCount,
                requests: {
                    total: requestCount,
                    pending: requests.filter(r => r.data.status === 'pending').length,
                    progress: requests.filter(r => r.data.status === 'progress').length,
                    completed: requests.filter(r => r.data.status === 'completed').length
                }
            };
        }
        
        return departments.map(dept => this.getDepartmentStats(dept.id));
    }
    
    /**
     * 기간별 신청서 추이
     */
    getRequestTrend(startDate, endDate, groupBy = 'day') {
        const requests = this.getNodesByType('request');
        const trend = new Map();
        
        requests.forEach(req => {
            const date = new Date(req.data.createdAt);
            if (date < startDate || date > endDate) return;
            
            let key;
            switch (groupBy) {
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split('T')[0];
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
            }
            
            if (!trend.has(key)) {
                trend.set(key, { created: 0, completed: 0 });
            }
            trend.get(key).created++;
            
            if (req.data.status === 'completed' && req.data.completedAt) {
                const completedDate = new Date(req.data.completedAt);
                let completedKey;
                switch (groupBy) {
                    case 'day':
                        completedKey = completedDate.toISOString().split('T')[0];
                        break;
                    case 'week':
                        const wkStart = new Date(completedDate);
                        wkStart.setDate(completedDate.getDate() - completedDate.getDay());
                        completedKey = wkStart.toISOString().split('T')[0];
                        break;
                    case 'month':
                        completedKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
                        break;
                }
                if (!trend.has(completedKey)) {
                    trend.set(completedKey, { created: 0, completed: 0 });
                }
                trend.get(completedKey).completed++;
            }
        });
        
        return Array.from(trend.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, data]) => ({ date, ...data }));
    }

    // ===== 활동 로그 =====
    
    /**
     * 활동 기록
     */
    logActivity(nodeId, activityType, details = {}) {
        const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const activity = this.createNode('activity', activityId, {
            nodeId,
            activityType,
            details,
            timestamp: new Date().toISOString()
        });
        
        // 활동과 노드 연결
        this.createEdge('LOGGED', nodeId, activityId, {});
        
        // 인덱스 업데이트
        const dateKey = new Date().toISOString().split('T')[0];
        if (!this.indexes.activityByDate.has(dateKey)) {
            this.indexes.activityByDate.set(dateKey, new Set());
        }
        this.indexes.activityByDate.get(dateKey).add(activityId);
        
        if (!this.indexes.activityByType.has(activityType)) {
            this.indexes.activityByType.set(activityType, new Set());
        }
        this.indexes.activityByType.get(activityType).add(activityId);
        
        return activity;
    }
    
    /**
     * 노드별 활동 조회
     */
    getActivitiesByNode(nodeId, limit = 50) {
        const edges = this.getOutgoingEdges(nodeId, 'LOGGED');
        return edges
            .map(edge => this.getNode('activity', edge.target))
            .filter(Boolean)
            .sort((a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp))
            .slice(0, limit);
    }
    
    /**
     * 기간별 활동 조회
     */
    getActivitiesByDateRange(startDate, endDate) {
        const activities = [];
        const current = new Date(startDate);
        
        while (current <= endDate) {
            const dateKey = current.toISOString().split('T')[0];
            const activityIds = this.indexes.activityByDate.get(dateKey);
            
            if (activityIds) {
                activityIds.forEach(id => {
                    const activity = this.getNode('activity', id);
                    if (activity) activities.push(activity);
                });
            }
            
            current.setDate(current.getDate() + 1);
        }
        
        return activities.sort((a, b) => 
            new Date(b.data.timestamp) - new Date(a.data.timestamp)
        );
    }

    // ===== 인덱스 관리 =====
    
    _updateIndexesOnCreate(type, id, data) {
        if (type === 'request') {
            // 상태 인덱스
            if (!this.indexes.requestByStatus.has(data.status)) {
                this.indexes.requestByStatus.set(data.status, new Set());
            }
            this.indexes.requestByStatus.get(data.status).add(id);
            
            // 부서 인덱스
            if (!this.indexes.requestByDepartment.has(data.department)) {
                this.indexes.requestByDepartment.set(data.department, new Set());
            }
            this.indexes.requestByDepartment.get(data.department).add(id);
            
            // 우선순위 인덱스
            if (!this.indexes.requestByPriority.has(data.priority)) {
                this.indexes.requestByPriority.set(data.priority, new Set());
            }
            this.indexes.requestByPriority.get(data.priority).add(id);
        }
        
        if (type === 'member') {
            // 부서 인덱스
            if (!this.indexes.memberByDepartment.has(data.department)) {
                this.indexes.memberByDepartment.set(data.department, new Set());
            }
            this.indexes.memberByDepartment.get(data.department).add(id);
            
            // 팀 인덱스
            if (!this.indexes.memberByTeam.has(data.team)) {
                this.indexes.memberByTeam.set(data.team, new Set());
            }
            this.indexes.memberByTeam.get(data.team).add(id);
        }
    }
    
    _updateIndexesOnUpdate(type, id, oldData, newData) {
        if (type === 'request') {
            // 상태 변경
            if (oldData.status !== newData.status) {
                this.indexes.requestByStatus.get(oldData.status)?.delete(id);
                if (!this.indexes.requestByStatus.has(newData.status)) {
                    this.indexes.requestByStatus.set(newData.status, new Set());
                }
                this.indexes.requestByStatus.get(newData.status).add(id);
            }
            
            // 우선순위 변경
            if (oldData.priority !== newData.priority) {
                this.indexes.requestByPriority.get(oldData.priority)?.delete(id);
                if (!this.indexes.requestByPriority.has(newData.priority)) {
                    this.indexes.requestByPriority.set(newData.priority, new Set());
                }
                this.indexes.requestByPriority.get(newData.priority).add(id);
            }
        }
    }
    
    _updateIndexesOnDelete(type, id, data) {
        if (type === 'request') {
            this.indexes.requestByStatus.get(data.status)?.delete(id);
            this.indexes.requestByDepartment.get(data.department)?.delete(id);
            this.indexes.requestByPriority.get(data.priority)?.delete(id);
        }
        
        if (type === 'member') {
            this.indexes.memberByDepartment.get(data.department)?.delete(id);
            this.indexes.memberByTeam.get(data.team)?.delete(id);
        }
    }
    
    _invalidateStatsCache() {
        this.statsCache.lastUpdated = null;
        this.statsCache.data = null;
    }

    // ===== 이벤트 시스템 =====
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.listeners.get(event).delete(callback);
    }
    
    _emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error(`Error in event listener for ${event}:`, e);
                }
            });
        }
    }

    // ===== 직렬화/역직렬화 =====
    
    toJSON() {
        const serializeMap = (map) => {
            const obj = {};
            map.forEach((value, key) => {
                if (value instanceof Map) {
                    obj[key] = serializeMap(value);
                } else if (value instanceof Set) {
                    obj[key] = Array.from(value);
                } else {
                    obj[key] = value;
                }
            });
            return obj;
        };
        
        return {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            nodes: {
                request: serializeMap(this.nodes.request),
                member: serializeMap(this.nodes.member),
                department: serializeMap(this.nodes.department),
                team: serializeMap(this.nodes.team),
                evaluation: serializeMap(this.nodes.evaluation),
                activity: serializeMap(this.nodes.activity)
            },
            edges: {
                ASSIGNED_TO: serializeMap(this.edges.ASSIGNED_TO),
                BELONGS_TO: serializeMap(this.edges.BELONGS_TO),
                PART_OF: serializeMap(this.edges.PART_OF),
                EVALUATED_BY: serializeMap(this.edges.EVALUATED_BY),
                LOGGED: serializeMap(this.edges.LOGGED),
                REQUESTED_BY: serializeMap(this.edges.REQUESTED_BY)
            }
        };
    }
    
    fromJSON(json) {
        const deserializeToMap = (obj) => {
            const map = new Map();
            Object.entries(obj).forEach(([key, value]) => {
                map.set(key, value);
            });
            return map;
        };
        
        // 노드 복원
        Object.keys(this.nodes).forEach(type => {
            if (json.nodes[type]) {
                this.nodes[type] = deserializeToMap(json.nodes[type]);
            }
        });
        
        // 엣지 복원
        Object.keys(this.edges).forEach(type => {
            if (json.edges[type]) {
                this.edges[type] = deserializeToMap(json.edges[type]);
            }
        });
        
        // 인접 리스트 재구성
        this._rebuildAdjacencyList();
        
        // 인덱스 재구성
        this._rebuildIndexes();
    }
    
    _rebuildAdjacencyList() {
        this.adjacencyList = new Map();
        
        // 모든 노드에 대해 인접 리스트 초기화
        Object.values(this.nodes).forEach(nodeMap => {
            nodeMap.forEach((node, id) => {
                if (!this.adjacencyList.has(id)) {
                    this.adjacencyList.set(id, { incoming: new Set(), outgoing: new Set() });
                }
            });
        });
        
        // 모든 엣지에 대해 인접 리스트 업데이트
        Object.values(this.edges).forEach(edgeMap => {
            edgeMap.forEach(edge => {
                if (!this.adjacencyList.has(edge.source)) {
                    this.adjacencyList.set(edge.source, { incoming: new Set(), outgoing: new Set() });
                }
                if (!this.adjacencyList.has(edge.target)) {
                    this.adjacencyList.set(edge.target, { incoming: new Set(), outgoing: new Set() });
                }
                
                this.adjacencyList.get(edge.source).outgoing.add(edge.id);
                this.adjacencyList.get(edge.target).incoming.add(edge.id);
            });
        });
    }
    
    _rebuildIndexes() {
        // 인덱스 초기화
        Object.keys(this.indexes).forEach(key => {
            this.indexes[key] = new Map();
        });
        
        // 신청서 인덱스 재구성
        this.nodes.request.forEach((node, id) => {
            if (!node.metadata.deleted) {
                this._updateIndexesOnCreate('request', id, node.data);
            }
        });
        
        // 담당자 인덱스 재구성
        this.nodes.member.forEach((node, id) => {
            if (!node.metadata.deleted) {
                this._updateIndexesOnCreate('member', id, node.data);
            }
        });
        
        // 활동 인덱스 재구성
        this.nodes.activity.forEach((node, id) => {
            if (!node.metadata.deleted) {
                const dateKey = node.data.timestamp.split('T')[0];
                if (!this.indexes.activityByDate.has(dateKey)) {
                    this.indexes.activityByDate.set(dateKey, new Set());
                }
                this.indexes.activityByDate.get(dateKey).add(id);
                
                if (!this.indexes.activityByType.has(node.data.activityType)) {
                    this.indexes.activityByType.set(node.data.activityType, new Set());
                }
                this.indexes.activityByType.get(node.data.activityType).add(id);
            }
        });
    }

    // ===== 유틸리티 =====
    
    /**
     * 인덱스를 사용한 빠른 조회
     */
    findRequestsByStatus(status) {
        const ids = this.indexes.requestByStatus.get(status);
        if (!ids) return [];
        return Array.from(ids).map(id => this.getNode('request', id)).filter(Boolean);
    }
    
    findRequestsByDepartment(departmentId) {
        const ids = this.indexes.requestByDepartment.get(departmentId);
        if (!ids) return [];
        return Array.from(ids).map(id => this.getNode('request', id)).filter(Boolean);
    }
    
    findMembersByDepartment(departmentId) {
        const ids = this.indexes.memberByDepartment.get(departmentId);
        if (!ids) return [];
        return Array.from(ids).map(id => this.getNode('member', id)).filter(Boolean);
    }
    
    findMembersByTeam(teamId) {
        const ids = this.indexes.memberByTeam.get(teamId);
        if (!ids) return [];
        return Array.from(ids).map(id => this.getNode('member', id)).filter(Boolean);
    }
    
    /**
     * 전체 통계 요약
     */
    getSummaryStats() {
        if (this.statsCache.lastUpdated && 
            Date.now() - this.statsCache.lastUpdated < 60000) {
            return this.statsCache.data;
        }
        
        const stats = {
            nodes: {
                requests: this.getNodesByType('request').length,
                members: this.getNodesByType('member').length,
                departments: this.getNodesByType('department').length,
                teams: this.getNodesByType('team').length,
                activities: this.getNodesByType('activity').length
            },
            edges: {
                assignments: this.edges.ASSIGNED_TO.size,
                belongings: this.edges.BELONGS_TO.size,
                evaluations: this.edges.EVALUATED_BY.size
            },
            requestStats: this.getRequestStats(),
            lastUpdated: new Date().toISOString()
        };
        
        this.statsCache.data = stats;
        this.statsCache.lastUpdated = Date.now();
        
        return stats;
    }
}

// ES Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GraphDatabase;
}


