// ===== Graph Database for Request Management =====
// 노드 기반의 신청서 데이터 저장 및 관리

class GraphDatabase {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.nodeIndex = {
            byType: new Map(),
            byUser: new Map(),
            byTemplate: new Map(),
            byStatus: new Map(),
            byDate: new Map()
        };
        this.load();
    }

    // ===== 노드 관리 =====
    
    // 노드 생성
    createNode(type, data) {
        const id = this.generateNodeId(type);
        const node = {
            id,
            type,
            data,
            properties: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.nodes.set(id, node);
        this.indexNode(node);
        this.save();
        
        return node;
    }

    // 노드 조회
    getNode(id) {
        return this.nodes.get(id);
    }

    // 노드 업데이트
    updateNode(id, updates) {
        const node = this.nodes.get(id);
        if (!node) return null;
        
        // 기존 인덱스 제거
        this.removeFromIndex(node);
        
        // 업데이트 적용
        Object.assign(node.data, updates);
        node.updatedAt = new Date().toISOString();
        
        // 새 인덱스 추가
        this.indexNode(node);
        this.save();
        
        return node;
    }

    // 노드 삭제
    deleteNode(id) {
        const node = this.nodes.get(id);
        if (!node) return false;
        
        // 연결된 엣지 삭제
        this.edges.forEach((edge, edgeId) => {
            if (edge.from === id || edge.to === id) {
                this.edges.delete(edgeId);
            }
        });
        
        // 인덱스에서 제거
        this.removeFromIndex(node);
        
        // 노드 삭제
        this.nodes.delete(id);
        this.save();
        
        return true;
    }

    // ===== 엣지(관계) 관리 =====
    
    // 엣지 생성
    createEdge(fromId, toId, type, properties = {}) {
        const id = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const edge = {
            id,
            from: fromId,
            to: toId,
            type,
            properties,
            createdAt: new Date().toISOString()
        };
        
        this.edges.set(id, edge);
        this.save();
        
        return edge;
    }

    // 특정 노드의 연결된 엣지 조회
    getEdges(nodeId, direction = 'both') {
        const result = [];
        this.edges.forEach(edge => {
            if (direction === 'both' && (edge.from === nodeId || edge.to === nodeId)) {
                result.push(edge);
            } else if (direction === 'outgoing' && edge.from === nodeId) {
                result.push(edge);
            } else if (direction === 'incoming' && edge.to === nodeId) {
                result.push(edge);
            }
        });
        return result;
    }

    // 특정 타입의 엣지로 연결된 노드 조회
    getConnectedNodes(nodeId, edgeType, direction = 'both') {
        const edges = this.getEdges(nodeId, direction);
        const connectedNodes = [];
        
        edges.forEach(edge => {
            if (edgeType && edge.type !== edgeType) return;
            
            const connectedId = edge.from === nodeId ? edge.to : edge.from;
            const node = this.getNode(connectedId);
            if (node) {
                connectedNodes.push({ node, edge });
            }
        });
        
        return connectedNodes;
    }

    // ===== 인덱싱 =====
    
    indexNode(node) {
        // 타입별 인덱스
        if (!this.nodeIndex.byType.has(node.type)) {
            this.nodeIndex.byType.set(node.type, new Set());
        }
        this.nodeIndex.byType.get(node.type).add(node.id);
        
        // 사용자별 인덱스
        if (node.data.requesterId) {
            if (!this.nodeIndex.byUser.has(node.data.requesterId)) {
                this.nodeIndex.byUser.set(node.data.requesterId, new Set());
            }
            this.nodeIndex.byUser.get(node.data.requesterId).add(node.id);
        }
        
        // 템플릿별 인덱스
        if (node.data.templateId) {
            if (!this.nodeIndex.byTemplate.has(node.data.templateId)) {
                this.nodeIndex.byTemplate.set(node.data.templateId, new Set());
            }
            this.nodeIndex.byTemplate.get(node.data.templateId).add(node.id);
        }
        
        // 상태별 인덱스
        if (node.data.status) {
            if (!this.nodeIndex.byStatus.has(node.data.status)) {
                this.nodeIndex.byStatus.set(node.data.status, new Set());
            }
            this.nodeIndex.byStatus.get(node.data.status).add(node.id);
        }
    }

    removeFromIndex(node) {
        // 타입별 인덱스에서 제거
        if (this.nodeIndex.byType.has(node.type)) {
            this.nodeIndex.byType.get(node.type).delete(node.id);
        }
        
        // 사용자별 인덱스에서 제거
        if (node.data.requesterId && this.nodeIndex.byUser.has(node.data.requesterId)) {
            this.nodeIndex.byUser.get(node.data.requesterId).delete(node.id);
        }
        
        // 템플릿별 인덱스에서 제거
        if (node.data.templateId && this.nodeIndex.byTemplate.has(node.data.templateId)) {
            this.nodeIndex.byTemplate.get(node.data.templateId).delete(node.id);
        }
        
        // 상태별 인덱스에서 제거
        if (node.data.status && this.nodeIndex.byStatus.has(node.data.status)) {
            this.nodeIndex.byStatus.get(node.data.status).delete(node.id);
        }
    }

    // ===== 쿼리 메서드 =====
    
    // 타입별 노드 조회
    getNodesByType(type) {
        const ids = this.nodeIndex.byType.get(type);
        if (!ids) return [];
        return Array.from(ids).map(id => this.getNode(id)).filter(Boolean);
    }

    // 사용자별 신청서 조회
    getRequestsByUser(userId) {
        const ids = this.nodeIndex.byUser.get(userId);
        if (!ids) return [];
        return Array.from(ids).map(id => this.getNode(id)).filter(Boolean);
    }

    // 상태별 신청서 조회
    getRequestsByStatus(status) {
        const ids = this.nodeIndex.byStatus.get(status);
        if (!ids) return [];
        return Array.from(ids).map(id => this.getNode(id)).filter(Boolean);
    }

    // 템플릿별 신청서 조회
    getRequestsByTemplate(templateId) {
        const ids = this.nodeIndex.byTemplate.get(templateId);
        if (!ids) return [];
        return Array.from(ids).map(id => this.getNode(id)).filter(Boolean);
    }

    // 모든 신청서 조회
    getAllRequests() {
        return this.getNodesByType('request');
    }

    // ===== 분석 메서드 =====
    
    // 사용자별 업무량 분석
    analyzeUserWorkload(userId) {
        const requests = this.getRequestsByUser(userId);
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        
        const analysis = {
            total: requests.length,
            byStatus: {},
            byPriority: {},
            byTemplate: {},
            recentRequests: [],
            completedThisMonth: 0,
            avgCompletionTime: 0
        };
        
        let totalCompletionTime = 0;
        let completedCount = 0;
        
        requests.forEach(req => {
            // 상태별 집계
            const status = req.data.status || 'unknown';
            analysis.byStatus[status] = (analysis.byStatus[status] || 0) + 1;
            
            // 우선순위별 집계
            const priority = req.data.priority || 'medium';
            analysis.byPriority[priority] = (analysis.byPriority[priority] || 0) + 1;
            
            // 템플릿별 집계
            const templateId = req.data.templateId || 'unknown';
            analysis.byTemplate[templateId] = (analysis.byTemplate[templateId] || 0) + 1;
            
            // 최근 30일 신청서
            const createdAt = new Date(req.createdAt);
            if (createdAt >= thirtyDaysAgo) {
                analysis.recentRequests.push(req);
                
                if (req.data.status === 'completed' && req.data.completedAt) {
                    analysis.completedThisMonth++;
                    const completionTime = new Date(req.data.completedAt) - createdAt;
                    totalCompletionTime += completionTime;
                    completedCount++;
                }
            }
        });
        
        // 평균 완료 시간 계산 (일 단위)
        if (completedCount > 0) {
            analysis.avgCompletionTime = Math.round(totalCompletionTime / completedCount / (24 * 60 * 60 * 1000) * 10) / 10;
        }
        
        return analysis;
    }

    // 담당자별 처리량 분석
    analyzeAssigneePerformance(assigneeId) {
        const allRequests = this.getAllRequests();
        const assignedRequests = allRequests.filter(req => 
            req.data.assignees && req.data.assignees.some(a => a.id === assigneeId)
        );
        
        const analysis = {
            totalAssigned: assignedRequests.length,
            completed: 0,
            inProgress: 0,
            pending: 0,
            avgProcessingTime: 0,
            byCategory: {},
            evaluationScores: {
                technical: [],
                communication: [],
                efficiency: [],
                quality: []
            }
        };
        
        let totalProcessingTime = 0;
        let processedCount = 0;
        
        assignedRequests.forEach(req => {
            // 상태별 집계
            if (req.data.status === 'completed') {
                analysis.completed++;
                if (req.data.completedAt && req.data.assignedAt) {
                    const processingTime = new Date(req.data.completedAt) - new Date(req.data.assignedAt);
                    totalProcessingTime += processingTime;
                    processedCount++;
                }
            } else if (req.data.status === 'in_progress') {
                analysis.inProgress++;
            } else {
                analysis.pending++;
            }
            
            // 카테고리별 집계
            const category = req.data.category || 'unknown';
            analysis.byCategory[category] = (analysis.byCategory[category] || 0) + 1;
            
            // 평가 점수 수집
            if (req.data.evaluation) {
                const evalData = req.data.evaluation;
                if (evalData.technical) analysis.evaluationScores.technical.push(evalData.technical);
                if (evalData.communication) analysis.evaluationScores.communication.push(evalData.communication);
                if (evalData.efficiency) analysis.evaluationScores.efficiency.push(evalData.efficiency);
                if (evalData.quality) analysis.evaluationScores.quality.push(evalData.quality);
            }
        });
        
        // 평균 처리 시간 계산 (일 단위)
        if (processedCount > 0) {
            analysis.avgProcessingTime = Math.round(totalProcessingTime / processedCount / (24 * 60 * 60 * 1000) * 10) / 10;
        }
        
        // 평가 점수 평균 계산
        Object.keys(analysis.evaluationScores).forEach(key => {
            const scores = analysis.evaluationScores[key];
            if (scores.length > 0) {
                analysis.evaluationScores[key] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            } else {
                analysis.evaluationScores[key] = 0;
            }
        });
        
        return analysis;
    }

    // 컴포넌트별 데이터 분석 (평가 컴포넌트 등)
    analyzeComponentData(componentType) {
        const allRequests = this.getAllRequests();
        const componentData = [];
        
        allRequests.forEach(req => {
            if (req.data.fieldValues) {
                Object.entries(req.data.fieldValues).forEach(([fieldId, value]) => {
                    if (value.componentType === componentType) {
                        componentData.push({
                            requestId: req.id,
                            requesterId: req.data.requesterId,
                            value: value.value,
                            createdAt: req.createdAt
                        });
                    }
                });
            }
        });
        
        return componentData;
    }

    // 팀별 통계
    getTeamStatistics(teamId) {
        const allRequests = this.getAllRequests();
        const teamRequests = allRequests.filter(req => req.data.targetTeamId === teamId);
        
        return {
            totalReceived: teamRequests.length,
            completed: teamRequests.filter(r => r.data.status === 'completed').length,
            inProgress: teamRequests.filter(r => r.data.status === 'in_progress').length,
            pending: teamRequests.filter(r => ['submitted', 'pending'].includes(r.data.status)).length,
            byPriority: {
                urgent: teamRequests.filter(r => r.data.priority === 'urgent').length,
                high: teamRequests.filter(r => r.data.priority === 'high').length,
                medium: teamRequests.filter(r => r.data.priority === 'medium').length,
                low: teamRequests.filter(r => r.data.priority === 'low').length
            }
        };
    }

    // ===== 유틸리티 =====
    
    generateNodeId(type) {
        const prefix = type.toUpperCase().substring(0, 3);
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}-${timestamp}-${random}`;
    }

    // 저장
    save() {
        const data = {
            nodes: Array.from(this.nodes.entries()),
            edges: Array.from(this.edges.entries())
        };
        localStorage.setItem('graphDB', JSON.stringify(data));
    }

    // 로드
    load() {
        const saved = localStorage.getItem('graphDB');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.nodes = new Map(data.nodes);
                this.edges = new Map(data.edges);
                
                // 인덱스 재구축
                this.rebuildIndex();
            } catch (e) {
                console.error('Failed to load graph database:', e);
            }
        }
    }

    rebuildIndex() {
        // 인덱스 초기화
        this.nodeIndex = {
            byType: new Map(),
            byUser: new Map(),
            byTemplate: new Map(),
            byStatus: new Map(),
            byDate: new Map()
        };
        
        // 모든 노드 재인덱싱
        this.nodes.forEach(node => this.indexNode(node));
    }

    // 데이터 초기화
    clear() {
        this.nodes.clear();
        this.edges.clear();
        this.rebuildIndex();
        this.save();
    }

    // 통계 요약
    getSummary() {
        return {
            totalNodes: this.nodes.size,
            totalEdges: this.edges.size,
            nodesByType: Object.fromEntries(
                Array.from(this.nodeIndex.byType.entries()).map(([type, ids]) => [type, ids.size])
            ),
            requestsByStatus: Object.fromEntries(
                Array.from(this.nodeIndex.byStatus.entries()).map(([status, ids]) => [status, ids.size])
            )
        };
    }
}

// 전역 인스턴스 생성
const graphDB = new GraphDatabase();

// 전역으로 노출
window.graphDB = graphDB;

