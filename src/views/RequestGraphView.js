/**
 * RequestGraphView - 신청서 그래프 뷰
 * 
 * MVP Architecture - View Layer
 * 
 * 역할:
 * - UI 렌더링
 * - 사용자 이벤트 처리
 * - Presenter에 이벤트 전달
 */

class RequestGraphView {
    constructor(containerId) {
        this.container = document.getElementById(containerId) || document.body;
        this.presenter = null;
        
        // DOM 요소 참조
        this.elements = {
            nodesLayer: null,
            connectionsLayer: null,
            departmentList: null,
            detailPanel: null,
            layoutTabs: null,
            zoomLevel: null,
            statusFilter: null,
            departmentFilter: null,
            toastContainer: null
        };
        
        // 상태
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.isConnecting = false;
        this.connectionSource = null;
    }

    // ===== 초기화 =====
    
    setPresenter(presenter) {
        this.presenter = presenter;
    }
    
    init() {
        this._cacheElements();
        this._bindEvents();
        this._initTheme();
    }
    
    _cacheElements() {
        this.elements.nodesLayer = document.getElementById('nodesLayer');
        this.elements.connectionsLayer = document.getElementById('connectionsLayer');
        this.elements.departmentList = document.getElementById('departmentList');
        this.elements.detailPanel = document.getElementById('detailPanel');
        this.elements.detailContent = document.getElementById('detailContent');
        this.elements.zoomLevel = document.getElementById('zoomLevel');
        this.elements.statusFilter = document.getElementById('statusFilter');
        this.elements.departmentFilter = document.getElementById('departmentFilter');
        this.elements.toastContainer = document.getElementById('toastContainer');
    }
    
    _bindEvents() {
        // 캔버스 이벤트
        const canvas = document.getElementById('graphCanvas');
        if (canvas) {
            this._bindCanvasEvents(canvas);
        }
        
        // 필터 이벤트
        if (this.elements.statusFilter) {
            this.elements.statusFilter.addEventListener('change', (e) => {
                this.presenter?.setFilter('status', e.target.value);
            });
        }
        
        if (this.elements.departmentFilter) {
            this.elements.departmentFilter.addEventListener('change', (e) => {
                this.presenter?.setFilter('department', e.target.value);
            });
        }
        
        // 테마 드롭다운 외부 클릭
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                this._closeThemeDropdown();
            }
        });
    }
    
    _bindCanvasEvents(canvas) {
        let isPanning = false;
        let panStart = { x: 0, y: 0 };
        
        canvas.addEventListener('mousedown', (e) => {
            if (e.target === canvas || 
                e.target.classList.contains('nodes-layer') || 
                e.target.classList.contains('connections-layer')) {
                isPanning = true;
                panStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
                canvas.style.cursor = 'grabbing';
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (isPanning) {
                this.panOffset.x = e.clientX - panStart.x;
                this.panOffset.y = e.clientY - panStart.y;
                this._updateCanvasTransform();
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isPanning = false;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('mouseleave', () => {
            isPanning = false;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoom = Math.max(0.5, Math.min(2, this.zoom + delta));
            this._updateZoomLevel();
            this._updateCanvasTransform();
        });
    }
    
    _initTheme() {
        const savedTheme = localStorage.getItem('graphTheme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        this._updateThemeOptions(savedTheme);
    }

    // ===== 렌더링 =====
    
    render(data) {
        this.renderNodes(data.requests, data.members);
        this.renderConnections(data.edges);
        this.renderDepartmentList(data.departments, data.members);
        this.renderFilters(data.departments);
        this._updateLayoutTabs(data.currentLayout);
    }
    
    renderNodes(requests, members) {
        if (!this.elements.nodesLayer) return;
        
        const requestsHtml = requests.map(req => this._renderRequestNode(req)).join('');
        const membersHtml = members.map(member => this._renderMemberNode(member)).join('');
        
        this.elements.nodesLayer.innerHTML = requestsHtml + membersHtml;
        
        // 노드 이벤트 바인딩
        this.elements.nodesLayer.querySelectorAll('.graph-node').forEach(nodeEl => {
            this._bindNodeEvents(nodeEl);
        });
    }
    
    _renderRequestNode(node) {
        const { id, data } = node;
        const typeClass = this._getTypeClass(data.type);
        
        return `
            <div class="graph-node request-node" 
                 data-node-id="${id}" 
                 data-node-type="request"
                 style="left: ${data.x}px; top: ${data.y}px;">
                <div class="request-node-header">
                    <span class="request-type-badge ${typeClass}">${data.type}</span>
                    <span class="request-priority ${data.priority}"></span>
                </div>
                <div class="request-title">${data.title}</div>
                <div class="request-meta">
                    <span class="request-department">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                        ${this._getDepartmentName(data.department)}
                    </span>
                    <span class="request-status ${data.status}">${this._getStatusName(data.status)}</span>
                </div>
                <div class="request-connector left" data-connector="left"></div>
                <div class="request-connector right" data-connector="right"></div>
            </div>
        `;
    }
    
    _renderMemberNode(node) {
        const { id, data } = node;
        const initial = data.name.charAt(0);
        
        // 담당 업무 수 계산
        const assignments = this.presenter?.getMemberAssignments(id) || [];
        const inProgress = assignments.filter(a => a.assignment.data.status === 'progress').length;
        const completed = assignments.filter(a => a.assignment.data.status === 'completed').length;
        
        return `
            <div class="graph-node member-node" 
                 data-node-id="${id}" 
                 data-node-type="member"
                 style="left: ${data.x}px; top: ${data.y}px;">
                <div class="member-avatar ${data.department}">${initial}</div>
                <div class="member-name">${data.name}</div>
                <div class="member-position">${data.position} · ${this._getDepartmentName(data.department)}</div>
                <div class="member-stats">
                    <div class="member-stat">
                        <span class="member-stat-value">${inProgress}</span>
                        <span class="member-stat-label">진행</span>
                    </div>
                    <div class="member-stat">
                        <span class="member-stat-value">${completed}</span>
                        <span class="member-stat-label">완료</span>
                    </div>
                </div>
                <div class="member-connector top" data-connector="top"></div>
            </div>
        `;
    }
    
    renderConnections(edges) {
        if (!this.elements.connectionsLayer) return;
        
        const visibleNodes = new Set(
            Array.from(document.querySelectorAll('.graph-node')).map(el => el.dataset.nodeId)
        );
        
        const pathsHtml = edges.filter(edge => 
            visibleNodes.has(edge.source) && visibleNodes.has(edge.target)
        ).map(edge => {
            const sourceNode = document.querySelector(`[data-node-id="${edge.source}"]`);
            const targetNode = document.querySelector(`[data-node-id="${edge.target}"]`);
            
            if (!sourceNode || !targetNode) return '';
            
            const sourceRect = sourceNode.getBoundingClientRect();
            const targetRect = targetNode.getBoundingClientRect();
            const containerRect = this.elements.connectionsLayer.getBoundingClientRect();
            
            const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
            const sourceY = sourceRect.bottom - containerRect.top;
            const targetX = targetRect.left - containerRect.left + targetRect.width / 2;
            const targetY = targetRect.top - containerRect.top;
            
            const midY = (sourceY + targetY) / 2;
            const path = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
            
            return `
                <path class="connection-line ${edge.data.status}" 
                      d="${path}" 
                      data-edge-id="${edge.id}"/>
            `;
        }).join('');
        
        this.elements.connectionsLayer.innerHTML = pathsHtml;
    }
    
    renderDepartmentList(departments, members) {
        if (!this.elements.departmentList) return;
        
        const html = departments.map(dept => {
            const deptMembers = members.filter(m => m.data.department === dept.id);
            
            return `
                <div class="department-item">
                    <div class="department-header" onclick="view.toggleDepartment('${dept.id}')">
                        <div class="department-info">
                            <div class="department-icon ${dept.id}">${this._getDepartmentIcon(dept.id)}</div>
                            <span class="department-name">${dept.name}</span>
                        </div>
                        <span class="department-count">${deptMembers.length}명</span>
                        <div class="department-toggle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </div>
                    </div>
                    <div class="team-list" id="team-${dept.id}">
                        ${this._renderTeamList(dept.id, deptMembers)}
                    </div>
                </div>
            `;
        }).join('');
        
        this.elements.departmentList.innerHTML = html;
    }
    
    _renderTeamList(deptId, members) {
        const teams = this._getTeamsByDepartment(deptId);
        
        return teams.map(team => {
            const teamMembers = members.filter(m => m.data.team === team.id);
            
            return `
                <div class="team-item">
                    <div class="team-name">${team.name}</div>
                    <div class="team-members">
                        ${teamMembers.map(m => {
                            const assignments = this.presenter?.getMemberAssignments(m.id) || [];
                            const inProgress = assignments.filter(a => a.assignment.data.status === 'progress').length;
                            const status = inProgress > 0 ? 'progress' : 'completed';
                            
                            return `
                                <div class="member-chip" onclick="view.focusNode('${m.id}')">
                                    <span class="status-dot ${status}"></span>
                                    ${m.data.name}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderFilters(departments) {
        if (this.elements.departmentFilter) {
            const options = departments.map(d => 
                `<option value="${d.id}">${d.name}</option>`
            ).join('');
            this.elements.departmentFilter.innerHTML = `<option value="all">모든 부서</option>${options}`;
        }
    }
    
    renderDetailPanel(nodeId) {
        if (!this.elements.detailContent) return;
        
        if (!nodeId) {
            this.elements.detailContent.innerHTML = this._renderEmptyDetail();
            return;
        }
        
        const detailData = this.presenter?.getNodeDetailData(nodeId);
        if (!detailData) {
            this.elements.detailContent.innerHTML = this._renderEmptyDetail();
            return;
        }
        
        if (detailData.node.type === 'request') {
            this.elements.detailContent.innerHTML = this._renderRequestDetail(detailData);
        } else if (detailData.node.type === 'member') {
            this.elements.detailContent.innerHTML = this._renderMemberDetail(detailData);
        }
    }
    
    _renderEmptyDetail() {
        return `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p>노드를 선택하면<br>상세 정보가 표시됩니다</p>
            </div>
        `;
    }
    
    _renderRequestDetail(detailData) {
        const { node, assignedMembers, activities } = detailData;
        const { data } = node;
        
        const avgScore = data.evaluation ? 
            Math.round((data.evaluation.technical + data.evaluation.communication + 
                       data.evaluation.efficiency + data.evaluation.quality) / 4) : 0;
        
        return `
            <div class="detail-header">
                <div class="detail-avatar request">📋</div>
                <div class="detail-info">
                    <h4>${data.title}</h4>
                    <p>${data.type} · ${this._getDepartmentName(data.department)}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-section-title">기본 정보</div>
                <div class="detail-item">
                    <span class="detail-item-label">상태</span>
                    <span class="detail-item-value">
                        <span class="request-status ${data.status}">${this._getStatusName(data.status)}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">우선순위</span>
                    <span class="detail-item-value">${this._getPriorityName(data.priority)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">마감일</span>
                    <span class="detail-item-value">${data.deadline || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">생성일</span>
                    <span class="detail-item-value">${new Date(data.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-section-title">담당자 (${assignedMembers.length}명)</div>
                <div class="assigned-members">
                    ${assignedMembers.length > 0 ? assignedMembers.map(({ member, assignment }) => `
                        <div class="assigned-member" onclick="view.focusNode('${member.id}')">
                            <div class="assigned-member-avatar ${member.data.department}">
                                ${member.data.name.charAt(0)}
                            </div>
                            <div class="assigned-member-info">
                                <div class="assigned-member-name">${member.data.name}</div>
                                <div class="assigned-member-role">${member.data.position} · ${this._getDepartmentName(member.data.department)}</div>
                            </div>
                            <span class="assigned-member-status ${assignment.data.status}">${this._getStatusName(assignment.data.status)}</span>
                        </div>
                    `).join('') : '<p style="color: var(--text-muted); font-size: 0.85rem;">담당자가 배정되지 않았습니다</p>'}
                </div>
            </div>
            
            ${data.evaluation ? `
            <div class="detail-section">
                <div class="detail-section-title">평가 현황</div>
                <div class="evaluation-summary">
                    <div class="eval-score-display">
                        <div class="eval-score-circle" style="--score: ${avgScore}">
                            <span class="eval-score-value">${avgScore}</span>
                        </div>
                    </div>
                    <div class="eval-metrics">
                        <div class="eval-metric">
                            <span class="eval-metric-label">기술력</span>
                            <span class="eval-metric-value">${data.evaluation.technical}</span>
                        </div>
                        <div class="eval-metric">
                            <span class="eval-metric-label">소통</span>
                            <span class="eval-metric-value">${data.evaluation.communication}</span>
                        </div>
                        <div class="eval-metric">
                            <span class="eval-metric-label">효율성</span>
                            <span class="eval-metric-value">${data.evaluation.efficiency}</span>
                        </div>
                        <div class="eval-metric">
                            <span class="eval-metric-label">품질</span>
                            <span class="eval-metric-value">${data.evaluation.quality}</span>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="detail-actions">
                <button class="btn-primary" onclick="view.openEvaluationModal('${node.id}')">
                    평가하기
                </button>
                <button class="btn-secondary" onclick="view.changeRequestStatus('${node.id}')">
                    상태 변경
                </button>
                <button class="btn-danger" onclick="view.deleteNode('${node.id}')">
                    삭제
                </button>
            </div>
        `;
    }
    
    _renderMemberDetail(detailData) {
        const { node, assignments, stats } = detailData;
        const { data } = node;
        
        const inProgress = assignments.filter(a => a.assignment.data.status === 'progress');
        const completed = assignments.filter(a => a.assignment.data.status === 'completed');
        
        return `
            <div class="detail-header">
                <div class="detail-avatar ${data.department}" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));">
                    ${data.name.charAt(0)}
                </div>
                <div class="detail-info">
                    <h4>${data.name}</h4>
                    <p>${data.position} · ${this._getDepartmentName(data.department)}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-section-title">기본 정보</div>
                <div class="detail-item">
                    <span class="detail-item-label">부서</span>
                    <span class="detail-item-value">${this._getDepartmentName(data.department)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">팀</span>
                    <span class="detail-item-value">${this._getTeamName(data.team)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">이메일</span>
                    <span class="detail-item-value">${data.email || '-'}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-section-title">업무 현황</div>
                <div class="evaluation-summary">
                    <div class="eval-metrics">
                        <div class="eval-metric">
                            <span class="eval-metric-label">진행중</span>
                            <span class="eval-metric-value" style="color: #3b82f6;">${inProgress.length}</span>
                        </div>
                        <div class="eval-metric">
                            <span class="eval-metric-label">완료</span>
                            <span class="eval-metric-value" style="color: #22c55e;">${completed.length}</span>
                        </div>
                        <div class="eval-metric">
                            <span class="eval-metric-label">전체</span>
                            <span class="eval-metric-value">${assignments.length}</span>
                        </div>
                        <div class="eval-metric">
                            <span class="eval-metric-label">완료율</span>
                            <span class="eval-metric-value">${assignments.length > 0 ? Math.round(completed.length / assignments.length * 100) : 0}%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${stats?.avgEvaluation ? `
            <div class="detail-section">
                <div class="detail-section-title">평균 평가</div>
                <div class="evaluation-summary">
                    <div class="eval-metrics">
                        <div class="eval-metric">
                            <span class="eval-metric-label">기술력</span>
                            <span class="eval-metric-value">${stats.avgEvaluation.technical}</span>
                        </div>
                        <div class="eval-metric">
                            <span class="eval-metric-label">소통</span>
                            <span class="eval-metric-value">${stats.avgEvaluation.communication}</span>
                        </div>
                        <div class="eval-metric">
                            <span class="eval-metric-label">효율성</span>
                            <span class="eval-metric-value">${stats.avgEvaluation.efficiency}</span>
                        </div>
                        <div class="eval-metric">
                            <span class="eval-metric-label">품질</span>
                            <span class="eval-metric-value">${stats.avgEvaluation.quality}</span>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="detail-section">
                <div class="detail-section-title">담당 신청서</div>
                <div class="assigned-members">
                    ${assignments.length > 0 ? assignments.map(({ request, assignment }) => `
                        <div class="assigned-member" onclick="view.focusNode('${request.id}')">
                            <div class="assigned-member-avatar" style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));">
                                📋
                            </div>
                            <div class="assigned-member-info">
                                <div class="assigned-member-name">${request.data.title}</div>
                                <div class="assigned-member-role">${request.data.type}</div>
                            </div>
                            <span class="assigned-member-status ${assignment.data.status}">${this._getStatusName(assignment.data.status)}</span>
                        </div>
                    `).join('') : '<p style="color: var(--text-muted); font-size: 0.85rem;">담당 신청서가 없습니다</p>'}
                </div>
            </div>
            
            <div class="detail-actions">
                <button class="btn-danger" onclick="view.deleteNode('${node.id}')">
                    삭제
                </button>
            </div>
        `;
    }

    // ===== 노드 이벤트 =====
    
    _bindNodeEvents(nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        
        // 클릭
        nodeEl.addEventListener('click', (e) => {
            if (!this.isDragging && !this.isConnecting) {
                this.selectNode(nodeId);
            }
        });
        
        // 드래그
        nodeEl.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('request-connector') || 
                e.target.classList.contains('member-connector')) {
                this._startConnection(nodeId, e);
            } else {
                this._startDrag(nodeEl, e);
            }
        });
    }
    
    _startDrag(nodeEl, e) {
        this.isDragging = true;
        nodeEl.classList.add('dragging');
        
        const nodeId = nodeEl.dataset.nodeId;
        const node = this.presenter?.db.getNodeById(nodeId);
        if (!node) return;
        
        const dragStart = { x: e.clientX, y: e.clientY };
        const nodeStart = { x: node.data.x, y: node.data.y };
        
        const onMouseMove = (e) => {
            const dx = (e.clientX - dragStart.x) / this.zoom;
            const dy = (e.clientY - dragStart.y) / this.zoom;
            
            const newX = nodeStart.x + dx;
            const newY = nodeStart.y + dy;
            
            nodeEl.style.left = `${newX}px`;
            nodeEl.style.top = `${newY}px`;
            
            this.presenter?.updateNodePosition(nodeId, newX, newY);
            this.renderConnections(Array.from(this.presenter?.db.edges.ASSIGNED_TO.values() || []));
        };
        
        const onMouseUp = () => {
            this.isDragging = false;
            nodeEl.classList.remove('dragging');
            this.presenter?.saveToStorage();
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    _startConnection(nodeId, e) {
        this.isConnecting = true;
        this.connectionSource = nodeId;
        
        const containerRect = this.elements.connectionsLayer.getBoundingClientRect();
        const startX = e.clientX - containerRect.left;
        const startY = e.clientY - containerRect.top;
        
        const previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        previewLine.classList.add('connection-preview');
        previewLine.id = 'connectionPreview';
        this.elements.connectionsLayer.appendChild(previewLine);
        
        const onMouseMove = (e) => {
            const endX = e.clientX - containerRect.left;
            const endY = e.clientY - containerRect.top;
            const midY = (startY + endY) / 2;
            
            previewLine.setAttribute('d', 
                `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
            );
        };
        
        const onMouseUp = (e) => {
            this.isConnecting = false;
            previewLine.remove();
            
            const targetEl = document.elementFromPoint(e.clientX, e.clientY);
            const targetNode = targetEl?.closest('.graph-node');
            
            if (targetNode && targetNode.dataset.nodeId !== this.connectionSource) {
                const targetId = targetNode.dataset.nodeId;
                
                try {
                    this.presenter?.assignMemberToRequest(this.connectionSource, targetId);
                    this.showToast('연결이 생성되었습니다', 'success');
                    
                    // 연결 다시 렌더링
                    this.renderConnections(Array.from(this.presenter?.db.edges.ASSIGNED_TO.values() || []));
                } catch (error) {
                    if (error.message === 'Already assigned') {
                        this.showToast('이미 연결되어 있습니다', 'warning');
                    } else {
                        // 역방향 시도
                        try {
                            this.presenter?.assignMemberToRequest(targetId, this.connectionSource);
                            this.showToast('연결이 생성되었습니다', 'success');
                            this.renderConnections(Array.from(this.presenter?.db.edges.ASSIGNED_TO.values() || []));
                        } catch {
                            this.showToast('신청서와 담당자만 연결할 수 있습니다', 'error');
                        }
                    }
                }
            }
            
            this.connectionSource = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // ===== 액션 =====
    
    selectNode(nodeId) {
        document.querySelectorAll('.graph-node.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeEl) {
            nodeEl.classList.add('selected');
        }
        
        this.presenter?.selectNode(nodeId);
        this.renderDetailPanel(nodeId);
    }
    
    focusNode(nodeId) {
        const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeEl) {
            const node = this.presenter?.db.getNodeById(nodeId);
            if (!node) return;
            
            const canvas = document.getElementById('graphCanvas');
            const canvasRect = canvas.getBoundingClientRect();
            
            const targetX = canvasRect.width / 2 - 70;
            const targetY = canvasRect.height / 2 - 50;
            
            this.panOffset.x = targetX - node.data.x * this.zoom;
            this.panOffset.y = targetY - node.data.y * this.zoom;
            
            this._updateCanvasTransform();
            this.selectNode(nodeId);
        }
    }
    
    toggleDepartment(deptId) {
        const header = event.currentTarget;
        const teamList = document.getElementById(`team-${deptId}`);
        
        header.classList.toggle('expanded');
        teamList.classList.toggle('show');
    }
    
    changeRequestStatus(nodeId) {
        const node = this.presenter?.db.getNode('request', nodeId);
        if (!node) return;
        
        const statuses = ['pending', 'progress', 'completed'];
        const currentIndex = statuses.indexOf(node.data.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        
        this.presenter?.updateRequest(nodeId, { status: nextStatus });
        
        const data = this.presenter?.getViewData();
        if (data) {
            this.render(data);
            this.renderDetailPanel(nodeId);
        }
        
        this.showToast(`상태가 '${this._getStatusName(nextStatus)}'로 변경되었습니다`, 'success');
    }
    
    deleteNode(nodeId) {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        
        const node = this.presenter?.db.getNodeById(nodeId);
        if (!node) return;
        
        if (node.type === 'request') {
            this.presenter?.deleteRequest(nodeId, true);
        } else if (node.type === 'member') {
            this.presenter?.deleteMember(nodeId, true);
        }
        
        this.presenter?.deselectNode();
        this.renderDetailPanel(null);
        
        const data = this.presenter?.getViewData();
        if (data) {
            this.render(data);
        }
        
        this.showToast('삭제되었습니다', 'success');
    }

    // ===== 레이아웃 =====
    
    selectLayout(layoutType) {
        this._updateLayoutTabs(layoutType);
        this.presenter?.setLayout(layoutType);
        
        if (layoutType !== 'none') {
            // 애니메이션 후 다시 렌더링
            setTimeout(() => {
                const data = this.presenter?.getViewData();
                if (data) {
                    this.render(data);
                }
            }, 850);
        }
    }
    
    _updateLayoutTabs(layoutType) {
        document.querySelectorAll('.layout-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.layout === layoutType);
        });
    }

    // ===== 줌/팬 =====
    
    zoomIn() {
        this.zoom = Math.min(this.zoom + 0.1, 2);
        this._updateZoomLevel();
        this._updateCanvasTransform();
    }
    
    zoomOut() {
        this.zoom = Math.max(this.zoom - 0.1, 0.5);
        this._updateZoomLevel();
        this._updateCanvasTransform();
    }
    
    resetView() {
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this._updateZoomLevel();
        this._updateCanvasTransform();
    }
    
    _updateZoomLevel() {
        if (this.elements.zoomLevel) {
            this.elements.zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }
    
    _updateCanvasTransform() {
        if (this.elements.nodesLayer) {
            this.elements.nodesLayer.style.transform = 
                `translate(${this.panOffset.x}px, ${this.panOffset.y}px) scale(${this.zoom})`;
        }
        this.renderConnections(Array.from(this.presenter?.db.edges.ASSIGNED_TO.values() || []));
    }

    // ===== 테마 =====
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('graphTheme', theme);
        this._updateThemeOptions(theme);
        this._closeThemeDropdown();
    }
    
    toggleThemeDropdown() {
        const dropdown = document.getElementById('themeDropdown');
        dropdown?.classList.toggle('show');
    }
    
    _closeThemeDropdown() {
        const dropdown = document.getElementById('themeDropdown');
        dropdown?.classList.remove('show');
    }
    
    _updateThemeOptions(theme) {
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === theme);
        });
    }

    // ===== 토스트 =====
    
    showToast(message, type = 'info') {
        if (!this.elements.toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        this.elements.toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== 모달 =====
    
    openAddRequestModal() {
        document.getElementById('addRequestModal')?.classList.add('show');
    }
    
    openAddMemberModal() {
        document.getElementById('addMemberModal')?.classList.add('show');
    }
    
    openEvaluationModal(requestId) {
        const node = this.presenter?.db.getNode('request', requestId);
        if (!node) return;
        
        const modal = document.getElementById('evaluationModal');
        const content = document.getElementById('evaluationContent');
        if (!modal || !content) return;
        
        const evaluation = node.data.evaluation || {
            technical: 50,
            communication: 50,
            efficiency: 50,
            quality: 50
        };
        
        content.innerHTML = `
            <input type="hidden" id="evaluationRequestId" value="${requestId}">
            <div class="form-group">
                <label>기술력 평가</label>
                <input type="range" id="evalTechnical" min="0" max="100" value="${evaluation.technical}" 
                       oninput="document.getElementById('evalTechnicalValue').textContent = this.value">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                    <span>0</span>
                    <span id="evalTechnicalValue">${evaluation.technical}</span>
                    <span>100</span>
                </div>
            </div>
            <div class="form-group">
                <label>소통 능력</label>
                <input type="range" id="evalCommunication" min="0" max="100" value="${evaluation.communication}"
                       oninput="document.getElementById('evalCommunicationValue').textContent = this.value">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                    <span>0</span>
                    <span id="evalCommunicationValue">${evaluation.communication}</span>
                    <span>100</span>
                </div>
            </div>
            <div class="form-group">
                <label>업무 효율성</label>
                <input type="range" id="evalEfficiency" min="0" max="100" value="${evaluation.efficiency}"
                       oninput="document.getElementById('evalEfficiencyValue').textContent = this.value">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                    <span>0</span>
                    <span id="evalEfficiencyValue">${evaluation.efficiency}</span>
                    <span>100</span>
                </div>
            </div>
            <div class="form-group">
                <label>결과물 품질</label>
                <input type="range" id="evalQuality" min="0" max="100" value="${evaluation.quality}"
                       oninput="document.getElementById('evalQualityValue').textContent = this.value">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                    <span>0</span>
                    <span id="evalQualityValue">${evaluation.quality}</span>
                    <span>100</span>
                </div>
            </div>
            <div class="form-group">
                <label>평가 코멘트</label>
                <textarea id="evalComment" rows="3" placeholder="평가 내용을 입력하세요...">${node.data.evaluationComment || ''}</textarea>
            </div>
        `;
        
        modal.classList.add('show');
    }
    
    closeModal(modalId) {
        document.getElementById(modalId)?.classList.remove('show');
    }
    
    saveEvaluation() {
        const requestId = document.getElementById('evaluationRequestId')?.value;
        if (!requestId) return;
        
        const evaluation = {
            technical: parseInt(document.getElementById('evalTechnical').value),
            communication: parseInt(document.getElementById('evalCommunication').value),
            efficiency: parseInt(document.getElementById('evalEfficiency').value),
            quality: parseInt(document.getElementById('evalQuality').value),
            comment: document.getElementById('evalComment').value
        };
        
        this.presenter?.evaluateRequest(requestId, evaluation);
        this.renderDetailPanel(requestId);
        this.closeModal('evaluationModal');
        this.showToast('평가가 저장되었습니다', 'success');
    }

    // ===== Presenter 콜백 =====
    
    onNodeCreated(node) {
        const data = this.presenter?.getViewData();
        if (data) this.render(data);
    }
    
    onNodeUpdated(node) {
        // 필요시 부분 업데이트
    }
    
    onNodeSelected(node) {
        this.renderDetailPanel(node.id);
    }
    
    onNodeDeselected() {
        this.renderDetailPanel(null);
    }
    
    onEdgeCreated(edge) {
        this.renderConnections(Array.from(this.presenter?.db.edges.ASSIGNED_TO.values() || []));
    }
    
    onNodeDeleted(nodeId) {
        const data = this.presenter?.getViewData();
        if (data) this.render(data);
    }
    
    onFiltersChanged(filters) {
        const data = this.presenter?.getViewData();
        if (data) this.render(data);
    }
    
    onLayoutChanged(layoutType, positions) {
        if (!positions) return;
        
        // 애니메이션으로 위치 이동
        const duration = 800;
        const startTime = performance.now();
        
        const startPositions = {};
        document.querySelectorAll('.graph-node').forEach(el => {
            startPositions[el.dataset.nodeId] = {
                x: parseFloat(el.style.left),
                y: parseFloat(el.style.top)
            };
        });
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            Object.entries(positions).forEach(([nodeId, endPos]) => {
                const el = document.querySelector(`[data-node-id="${nodeId}"]`);
                if (!el || !startPositions[nodeId]) return;
                
                const startPos = startPositions[nodeId];
                const newX = startPos.x + (endPos.x - startPos.x) * eased;
                const newY = startPos.y + (endPos.y - startPos.y) * eased;
                
                el.style.left = `${newX}px`;
                el.style.top = `${newY}px`;
            });
            
            this.renderConnections(Array.from(this.presenter?.db.edges.ASSIGNED_TO.values() || []));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // ===== 유틸리티 =====
    
    _getTypeClass(type) {
        const typeMap = {
            '데이터 추출': 'data',
            '화면 개발': 'ui',
            'API 개발': 'api',
            '버그 수정': 'bug',
            '인프라 요청': 'infra',
            '보안 점검': 'security',
            '기타': 'other'
        };
        return typeMap[type] || 'other';
    }
    
    _getDepartmentName(deptId) {
        const names = {
            dba: 'DBA팀',
            frontend: 'Frontend팀',
            backend: 'Backend팀',
            infra: 'Infra팀',
            qa: 'QA팀',
            security: '보안팀'
        };
        return names[deptId] || deptId;
    }
    
    _getDepartmentIcon(deptId) {
        const icons = {
            dba: '🗄️',
            frontend: '🎨',
            backend: '⚙️',
            infra: '🖥️',
            qa: '🔍',
            security: '🔒'
        };
        return icons[deptId] || '📁';
    }
    
    _getTeamName(teamId) {
        const teams = {
            'dba-data': '데이터관리',
            'dba-perf': '성능최적화',
            'fe-web': '웹개발',
            'fe-mobile': '모바일',
            'be-api': 'API개발',
            'be-batch': '배치처리',
            'infra-cloud': '클라우드',
            'infra-network': '네트워크',
            'qa-auto': '자동화테스트',
            'qa-manual': '수동테스트',
            'sec-audit': '보안감사',
            'sec-ops': '보안운영'
        };
        return teams[teamId] || teamId;
    }
    
    _getTeamsByDepartment(deptId) {
        const teamsByDept = {
            dba: [{ id: 'dba-data', name: '데이터관리' }, { id: 'dba-perf', name: '성능최적화' }],
            frontend: [{ id: 'fe-web', name: '웹개발' }, { id: 'fe-mobile', name: '모바일' }],
            backend: [{ id: 'be-api', name: 'API개발' }, { id: 'be-batch', name: '배치처리' }],
            infra: [{ id: 'infra-cloud', name: '클라우드' }, { id: 'infra-network', name: '네트워크' }],
            qa: [{ id: 'qa-auto', name: '자동화테스트' }, { id: 'qa-manual', name: '수동테스트' }],
            security: [{ id: 'sec-audit', name: '보안감사' }, { id: 'sec-ops', name: '보안운영' }]
        };
        return teamsByDept[deptId] || [];
    }
    
    _getStatusName(status) {
        const names = { pending: '대기', progress: '진행중', completed: '완료' };
        return names[status] || status;
    }
    
    _getPriorityName(priority) {
        const names = { low: '낮음', medium: '보통', high: '높음', urgent: '긴급' };
        return names[priority] || priority;
    }
}

// 전역 인스턴스
let view;

// ES Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RequestGraphView;
}


