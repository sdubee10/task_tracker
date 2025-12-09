// ===== Request Form Page Logic =====

// 상태 관리
let currentStep = 1;
let selectedTemplate = null;
let formData = {};
let currentUser = null;

// 템플릿 데이터 (form-builder.js의 sampleTemplates 참조)
let templates = [];

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
    initRequestForm();
});

function initRequestForm() {
    // 현재 사용자 정보 로드
    loadCurrentUser();
    
    // 템플릿 로드
    loadTemplates();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // URL 파라미터로 템플릿 선택
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    if (templateId) {
        selectTemplateById(templateId);
    }
    
    // localStorage 변경 감지 (다른 iframe에서 템플릿 저장 시)
    window.addEventListener('storage', (e) => {
        if (e.key === 'formTemplates') {
            console.log('formTemplates changed, reloading templates...');
            loadTemplates();
        }
    });
    
    // 페이지가 포커스를 받을 때마다 템플릿 새로고침 (iframe 간 동기화)
    window.addEventListener('focus', () => {
        loadTemplates();
    });
}

function loadCurrentUser() {
    currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (currentUser) {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.querySelector('.user-name').textContent = currentUser.name || '사용자';
            userInfo.querySelector('.user-team').textContent = currentUser.team || '';
        }
    }
}

function loadTemplates() {
    // 기본 템플릿 로드
    if (typeof sampleTemplates !== 'undefined') {
        templates = [...sampleTemplates];
    } else {
        templates = getDefaultTemplates();
    }
    
    // 사용자가 요청서 빌더에서 만든 커스텀 템플릿 로드
    const customTemplatesRaw = localStorage.getItem('formTemplates');
    console.log('=== Loading Templates ===');
    console.log('Raw formTemplates:', customTemplatesRaw);
    
    if (customTemplatesRaw) {
        try {
            const customTemplates = JSON.parse(customTemplatesRaw);
            console.log('Parsed customTemplates:', customTemplates);
            console.log('Custom templates count:', customTemplates.length);
            
            if (Array.isArray(customTemplates) && customTemplates.length > 0) {
                // 커스텀 템플릿에 '사용자 정의' 표시 추가
                customTemplates.forEach(t => {
                    t.isCustom = true;
                    if (!t.category) t.category = '사용자 정의';
                });
                templates = [...customTemplates, ...templates];
                console.log('Total templates after merge:', templates.length);
            }
        } catch (e) {
            console.error('Error parsing formTemplates:', e);
        }
    } else {
        console.log('No custom templates found in localStorage');
    }
    
    renderTemplateGrid();
}

// 새로고침 버튼용 함수
function refreshTemplates() {
    const rawData = localStorage.getItem('formTemplates');
    alert('localStorage formTemplates:\n' + (rawData ? rawData.substring(0, 200) + '...' : 'NULL'));
    
    loadTemplates();
    
    const customCount = templates.filter(t => t.isCustom).length;
    alert('로드 결과:\n- 커스텀 템플릿: ' + customCount + '개\n- 전체 템플릿: ' + templates.length + '개');
}

function getDefaultTemplates() {
    // 기본 템플릿 (fallback)
    return [
        {
            id: 'default_001',
            name: '📋 일반 요청서',
            description: '일반적인 업무 요청에 사용합니다.',
            category: '공통',
            formTitle: '일반 요청서',
            components: [
                { id: 'c1', type: 'section-header', text: '📋 요청 정보', colSpan: 'full' },
                { id: 'c2', type: 'requester-info', label: '요청자 정보', colSpan: 'full' },
                { id: 'c3', type: 'text-input', label: '요청 제목', required: true, colSpan: 'full' },
                { id: 'c4', type: 'textarea', label: '요청 내용', required: true, colSpan: 'full' },
                { id: 'c5', type: 'priority-select', label: '우선순위', colSpan: 1 },
                { id: 'c6', type: 'deadline-input', label: '희망 완료일', colSpan: 1 }
            ]
        }
    ];
}

function setupEventListeners() {
    // 템플릿 검색
    const searchInput = document.getElementById('templateSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterTemplates(e.target.value);
        });
    }
    
    // 카테고리 탭
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterTemplatesByCategory(tab.dataset.category);
        });
    });
}

// ===== 템플릿 선택 (Step 1) =====

function renderTemplateGrid(filteredTemplates = null) {
    const grid = document.getElementById('templateGrid');
    if (!grid) return;
    
    const templatesToRender = filteredTemplates || templates;
    
    const categoryIcons = {
        'DBA': '🗄️',
        'Frontend': '🎨',
        'Backend': '⚙️',
        'Infra': '🖥️',
        '공통': '📋',
        'QA': '🧪',
        '보안': '🔒',
        '기획': '📝',
        '기타': '📁',
        '사용자 정의': '✨'
    };
    
    grid.innerHTML = templatesToRender.map(template => {
        const icon = template.isCustom ? '✨' : (categoryIcons[template.category] || '📄');
        const componentCount = template.components ? template.components.length : 0;
        const customBadge = template.isCustom ? '<span class="custom-badge">내 템플릿</span>' : '';
        
        return `
            <div class="template-select-card ${template.isCustom ? 'custom-template' : ''}" data-template-id="${template.id}" onclick="selectTemplate('${template.id}')">
                <div class="template-select-header">
                    <div class="template-select-icon">${icon}</div>
                    <div class="template-select-info">
                        <h3>${template.formTitle || template.name} ${customBadge}</h3>
                        <span class="template-select-category">${template.category}</span>
                    </div>
                </div>
                <p class="template-select-description">${template.description || ''}</p>
                <div class="template-select-footer">
                    <span class="template-component-count">${componentCount}개 항목</span>
                    <button class="template-select-btn">선택</button>
                </div>
            </div>
        `;
    }).join('');
}

function filterTemplates(searchTerm) {
    const term = searchTerm.toLowerCase();
    const filtered = templates.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
    );
    renderTemplateGrid(filtered);
}

function filterTemplatesByCategory(category) {
    if (category === 'all') {
        renderTemplateGrid();
    } else if (category === 'custom') {
        // 사용자가 만든 커스텀 템플릿만 필터링
        const filtered = templates.filter(t => t.isCustom === true);
        renderTemplateGrid(filtered);
    } else {
        // 해당 카테고리의 템플릿 필터링 (기본 템플릿 + 커스텀 템플릿 모두)
        const filtered = templates.filter(t => t.category === category);
        renderTemplateGrid(filtered);
    }
}

function selectTemplate(templateId) {
    selectedTemplate = templates.find(t => t.id === templateId);
    
    if (!selectedTemplate) {
        showToast('템플릿을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 선택 표시
    document.querySelectorAll('.template-select-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`.template-select-card[data-template-id="${templateId}"]`)?.classList.add('selected');
    
    // Step 2로 이동
    goToStep(2);
}

function selectTemplateById(templateId) {
    selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
        goToStep(2);
    }
}

// ===== 신청서 작성 (Step 2) =====

function renderForm() {
    if (!selectedTemplate) return;
    
    const form = document.getElementById('requestForm');
    const formTitle = document.getElementById('formTitle');
    const formDescription = document.getElementById('formDescription');
    
    if (formTitle) {
        formTitle.textContent = `📝 ${selectedTemplate.formTitle || selectedTemplate.name}`;
    }
    if (formDescription) {
        formDescription.textContent = selectedTemplate.description || '선택한 템플릿에 맞게 내용을 작성해주세요';
    }
    
    if (!form) return;
    
    form.innerHTML = selectedTemplate.components.map(component => {
        return renderFormComponent(component);
    }).join('');
    
    // 이벤트 리스너 설정
    setupFormEventListeners();
}

function renderFormComponent(component) {
    const colClass = component.colSpan === 'full' ? 'col-full' : '';
    const requiredMark = component.required ? '<span class="required">*</span>' : '';
    
    switch (component.type) {
        case 'section-header':
            return `
                <div class="form-section-header ${colClass}">
                    <h3>${component.text || component.label}</h3>
                </div>
            `;
        
        case 'divider':
            return `<div class="form-divider ${colClass}"></div>`;
        
        case 'info-text':
            return `
                <div class="form-info-text ${colClass}">
                    ${component.text || component.label}
                </div>
            `;
        
        case 'requester-info':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <div class="requester-info-display">
                        <div class="requester-info-item">
                            <label>이름</label>
                            <span>${currentUser?.name || '-'}</span>
                        </div>
                        <div class="requester-info-item">
                            <label>부서/팀</label>
                            <span>${currentUser?.team || '-'}</span>
                        </div>
                        <div class="requester-info-item">
                            <label>이메일</label>
                            <span>${currentUser?.email || '-'}</span>
                        </div>
                        <div class="requester-info-item">
                            <label>요청일</label>
                            <span>${new Date().toLocaleDateString('ko-KR')}</span>
                        </div>
                    </div>
                </div>
            `;
        
        case 'text-input':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <input type="text" 
                           name="${component.id}" 
                           placeholder="${component.placeholder || ''}"
                           ${component.required ? 'required' : ''}>
                </div>
            `;
        
        case 'textarea':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <textarea name="${component.id}" 
                              placeholder="${component.placeholder || ''}"
                              rows="${component.rows || 4}"
                              ${component.required ? 'required' : ''}></textarea>
                </div>
            `;
        
        case 'number-input':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <input type="number" 
                           name="${component.id}" 
                           placeholder="${component.placeholder || ''}"
                           min="${component.min || ''}"
                           max="${component.max || ''}"
                           ${component.required ? 'required' : ''}>
                </div>
            `;
        
        case 'date-input':
        case 'deadline-input':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <input type="date" 
                           name="${component.id}"
                           ${component.required ? 'required' : ''}>
                </div>
            `;
        
        case 'email-input':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <input type="email" 
                           name="${component.id}" 
                           placeholder="${component.placeholder || 'example@email.com'}"
                           ${component.required ? 'required' : ''}>
                </div>
            `;
        
        case 'select':
        case 'department-select':
        case 'project-select':
            const options = component.options || component.departments || ['옵션 1', '옵션 2', '옵션 3'];
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <select name="${component.id}" ${component.required ? 'required' : ''}>
                        <option value="">선택하세요</option>
                        ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
            `;
        
        case 'checkbox':
            const checkOptions = component.options || ['항목 1', '항목 2', '항목 3'];
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <div class="checkbox-group">
                        ${checkOptions.map((opt, i) => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="${component.id}" value="${opt}">
                                <span>${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        
        case 'radio':
            const radioOptions = component.options || ['선택 1', '선택 2', '선택 3'];
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <div class="radio-group">
                        ${radioOptions.map((opt, i) => `
                            <label class="radio-item">
                                <input type="radio" name="${component.id}" value="${opt}" ${component.required && i === 0 ? '' : ''}>
                                <span>${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        
        case 'rating':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <div class="rating-stars" data-name="${component.id}">
                        ${[1, 2, 3, 4, 5].map(i => `
                            <span class="rating-star" data-value="${i}" onclick="setRating('${component.id}', ${i})">★</span>
                        `).join('')}
                    </div>
                    <input type="hidden" name="${component.id}" value="0">
                </div>
            `;
        
        case 'priority-select':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <div class="priority-options">
                        <div class="priority-option low" data-value="low" onclick="setPriority('${component.id}', 'low')">
                            <span>낮음</span>
                        </div>
                        <div class="priority-option medium" data-value="medium" onclick="setPriority('${component.id}', 'medium')">
                            <span>보통</span>
                        </div>
                        <div class="priority-option high" data-value="high" onclick="setPriority('${component.id}', 'high')">
                            <span>높음</span>
                        </div>
                        <div class="priority-option urgent" data-value="urgent" onclick="setPriority('${component.id}', 'urgent')">
                            <span>긴급</span>
                        </div>
                    </div>
                    <input type="hidden" name="${component.id}" value="medium">
                </div>
            `;
        
        case 'yes-no-select':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <div class="radio-group">
                        <label class="radio-item">
                            <input type="radio" name="${component.id}" value="yes">
                            <span>예</span>
                        </label>
                        <label class="radio-item">
                            <input type="radio" name="${component.id}" value="no">
                            <span>아니오</span>
                        </label>
                    </div>
                </div>
            `;
        
        case 'file-upload':
        case 'image-upload':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <div class="file-upload-area" onclick="document.getElementById('file_${component.id}').click()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <p>클릭하여 파일 선택 또는 드래그 앤 드롭</p>
                    </div>
                    <input type="file" id="file_${component.id}" name="${component.id}" 
                           accept="${component.accept || '*'}" 
                           ${component.multiple ? 'multiple' : ''} 
                           style="display: none;"
                           onchange="handleFileSelect(this, '${component.id}')">
                    <div class="uploaded-files" id="files_${component.id}"></div>
                </div>
            `;
        
        case 'link-input':
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label} ${requiredMark}</div>
                    <input type="url" 
                           name="${component.id}" 
                           placeholder="${component.placeholder || 'https://'}"
                           ${component.required ? 'required' : ''}>
                </div>
            `;
        
        case 'approval-flow':
            const steps = component.steps || [{ title: '1차 승인', role: '팀장' }, { title: '최종 승인', role: '부서장' }];
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label}</div>
                    <div class="approval-flow-display">
                        ${steps.map((step, i) => `
                            ${i > 0 ? `
                                <div class="approval-arrow">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 12h14"/>
                                        <polyline points="12 5 19 12 12 19"/>
                                    </svg>
                                </div>
                            ` : ''}
                            <div class="approval-step">
                                <div class="approval-step-icon">${i + 1}</div>
                                <span class="approval-step-title">${step.title}</span>
                                <span class="approval-step-role">${step.role}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        
        default:
            return `
                <div class="form-component ${colClass}" data-component-id="${component.id}">
                    <div class="form-component-label">${component.label || component.type} ${requiredMark}</div>
                    <input type="text" name="${component.id}" placeholder="입력하세요">
                </div>
            `;
    }
}

function setupFormEventListeners() {
    // 폼 입력 변경 감지
    const form = document.getElementById('requestForm');
    if (form) {
        form.addEventListener('input', (e) => {
            collectFormData();
        });
        form.addEventListener('change', (e) => {
            collectFormData();
        });
    }
}

function setRating(componentId, value) {
    const stars = document.querySelectorAll(`.rating-stars[data-name="${componentId}"] .rating-star`);
    stars.forEach((star, i) => {
        star.classList.toggle('active', i < value);
    });
    
    const input = document.querySelector(`input[name="${componentId}"]`);
    if (input) input.value = value;
    
    collectFormData();
}

function setPriority(componentId, value) {
    const container = document.querySelector(`input[name="${componentId}"]`).closest('.form-component');
    container.querySelectorAll('.priority-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === value);
    });
    
    const input = document.querySelector(`input[name="${componentId}"]`);
    if (input) input.value = value;
    
    collectFormData();
}

function handleFileSelect(input, componentId) {
    const filesContainer = document.getElementById(`files_${componentId}`);
    if (!filesContainer) return;
    
    filesContainer.innerHTML = Array.from(input.files).map(file => `
        <div class="uploaded-file">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>${file.name}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">(${formatFileSize(file.size)})</span>
        </div>
    `).join('');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function collectFormData() {
    const form = document.getElementById('requestForm');
    if (!form) return;
    
    formData = {
        templateId: selectedTemplate?.id,
        templateName: selectedTemplate?.formTitle || selectedTemplate?.name,
        category: selectedTemplate?.category,
        fieldValues: {}
    };
    
    // 모든 입력값 수집
    const formElements = form.querySelectorAll('input, select, textarea');
    formElements.forEach(el => {
        if (!el.name) return;
        
        const componentEl = el.closest('.form-component');
        const componentId = componentEl?.dataset.componentId || el.name;
        const component = selectedTemplate?.components.find(c => c.id === componentId);
        
        if (el.type === 'checkbox') {
            if (!formData.fieldValues[el.name]) {
                formData.fieldValues[el.name] = {
                    componentType: component?.type || 'checkbox',
                    label: component?.label || el.name,
                    value: []
                };
            }
            if (el.checked) {
                formData.fieldValues[el.name].value.push(el.value);
            }
        } else if (el.type === 'radio') {
            if (el.checked) {
                formData.fieldValues[el.name] = {
                    componentType: component?.type || 'radio',
                    label: component?.label || el.name,
                    value: el.value
                };
            }
        } else if (el.type === 'file') {
            if (el.files.length > 0) {
                formData.fieldValues[el.name] = {
                    componentType: component?.type || 'file',
                    label: component?.label || el.name,
                    value: Array.from(el.files).map(f => f.name)
                };
            }
        } else {
            formData.fieldValues[el.name] = {
                componentType: component?.type || 'text',
                label: component?.label || el.name,
                value: el.value
            };
        }
    });
    
    return formData;
}

// ===== 검토 및 제출 (Step 3) =====

function renderReviewSummary() {
    const container = document.getElementById('reviewSummary');
    if (!container) return;
    
    collectFormData();
    
    let html = `
        <div class="review-section">
            <div class="review-section-title">📋 신청서 정보</div>
            <div class="review-item">
                <span class="review-label">템플릿</span>
                <span class="review-value">${formData.templateName || '-'}</span>
            </div>
            <div class="review-item">
                <span class="review-label">카테고리</span>
                <span class="review-value">${formData.category || '-'}</span>
            </div>
            <div class="review-item">
                <span class="review-label">요청자</span>
                <span class="review-value">${currentUser?.name || '-'} (${currentUser?.team || '-'})</span>
            </div>
            <div class="review-item">
                <span class="review-label">요청일</span>
                <span class="review-value">${new Date().toLocaleDateString('ko-KR')}</span>
            </div>
        </div>
        
        <div class="review-section">
            <div class="review-section-title">📝 입력 내용</div>
    `;
    
    // 입력값 표시
    Object.entries(formData.fieldValues).forEach(([key, field]) => {
        if (!field.value || (Array.isArray(field.value) && field.value.length === 0)) return;
        
        let displayValue = field.value;
        if (Array.isArray(field.value)) {
            displayValue = field.value.join(', ');
        }
        
        html += `
            <div class="review-item">
                <span class="review-label">${field.label}</span>
                <span class="review-value">${displayValue || '-'}</span>
            </div>
        `;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
}

// ===== 단계 이동 =====

function goToStep(step) {
    // 유효성 검사
    if (step === 2 && !selectedTemplate) {
        showToast('템플릿을 선택해주세요.', 'warning');
        return;
    }
    
    if (step === 3) {
        // 필수 입력 검사
        const form = document.getElementById('requestForm');
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }
    }
    
    currentStep = step;
    
    // 단계 표시 업데이트
    document.querySelectorAll('.step').forEach((stepEl, i) => {
        stepEl.classList.remove('active', 'completed');
        if (i + 1 < step) {
            stepEl.classList.add('completed');
        } else if (i + 1 === step) {
            stepEl.classList.add('active');
        }
    });
    
    // 컨텐츠 표시
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`step${step}Content`)?.classList.add('active');
    
    // 단계별 초기화
    if (step === 2) {
        renderForm();
    } else if (step === 3) {
        renderReviewSummary();
    }
    
    // 스크롤 상단으로
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 저장 및 제출 =====

function saveDraft() {
    collectFormData();
    
    // 그래프 DB에 임시저장
    const draftNode = graphDB.createNode('request', {
        ...formData,
        requesterId: currentUser?.id,
        requesterName: currentUser?.name,
        requesterTeam: currentUser?.team,
        status: 'draft',
        priority: formData.fieldValues['priority']?.value || 'medium',
        createdAt: new Date().toISOString()
    });
    
    // 로컬 스토리지에도 저장
    const drafts = JSON.parse(localStorage.getItem('requestDrafts') || '[]');
    drafts.push({
        id: draftNode.id,
        templateId: selectedTemplate?.id,
        templateName: selectedTemplate?.formTitle,
        savedAt: new Date().toISOString()
    });
    localStorage.setItem('requestDrafts', JSON.stringify(drafts));
    
    showToast('임시저장되었습니다.', 'success');
}

function submitRequest() {
    collectFormData();
    
    // 요청 ID 생성
    const requestId = `REQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // 제목 찾기
    let title = selectedTemplate?.formTitle || '신청서';
    for (const [key, field] of Object.entries(formData.fieldValues)) {
        if (field.label?.includes('제목') && field.value) {
            title = field.value;
            break;
        }
    }
    
    // 설명 찾기
    let description = '';
    for (const [key, field] of Object.entries(formData.fieldValues)) {
        if (field.componentType === 'textarea' && field.value) {
            description = field.value;
            break;
        }
    }
    
    // 마감일 찾기
    let dueDate = null;
    for (const [key, field] of Object.entries(formData.fieldValues)) {
        if ((field.componentType === 'deadline-input' || field.componentType === 'date-input') && field.value) {
            dueDate = field.value;
            break;
        }
    }
    
    // 우선순위 찾기
    let priority = 'medium';
    for (const [key, field] of Object.entries(formData.fieldValues)) {
        if (field.componentType === 'priority-select' && field.value) {
            priority = field.value;
            break;
        }
    }
    
    // 신청서 데이터 생성
    const requestData = {
        id: requestId,
        templateId: selectedTemplate?.id,
        templateName: selectedTemplate?.formTitle || selectedTemplate?.name,
        templateCategory: selectedTemplate?.category,
        title: title,
        description: description,
        requester: { 
            id: currentUser?.id, 
            name: currentUser?.name, 
            team: currentUser?.team,
            email: currentUser?.email
        },
        targetTeam: { 
            id: selectedTemplate?.category?.toLowerCase(),
            name: selectedTemplate?.category + '팀' 
        },
        status: 'submitted',
        priority: priority,
        dueDate: dueDate,
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        assignees: [],
        history: [{
            type: 'submitted',
            action: '신청서 제출',
            timestamp: new Date().toISOString(),
            user: currentUser?.name || '요청자'
        }],
        // 전체 폼 데이터 저장 (나중에 상세 보기용)
        formData: formData.fieldValues
    };
    
    // localStorage에 저장
    const existingRequests = JSON.parse(localStorage.getItem('taskflowRequests') || '[]');
    existingRequests.unshift(requestData);
    localStorage.setItem('taskflowRequests', JSON.stringify(existingRequests));
    
    // 성공 모달 표시
    const modalEl = document.getElementById('submitSuccessModal');
    const requestIdEl = document.getElementById('submittedRequestId');
    
    if (requestIdEl) {
        requestIdEl.textContent = requestId;
    }
    
    if (modalEl) {
        modalEl.classList.add('show');
        // 모달이 열릴 때 배경 스크롤 방지
        document.body.style.overflow = 'hidden';
    }
    
    // 토스트 알림도 표시
    showToast('🎉 신청서가 성공적으로 제출되었습니다!', 'success');
    
    console.log('Request submitted:', requestData);
}

function createNewRequest() {
    // 상태 초기화
    currentStep = 1;
    selectedTemplate = null;
    formData = {};
    
    // 모달 닫기
    const modalEl = document.getElementById('submitSuccessModal');
    if (modalEl) {
        modalEl.classList.remove('show');
    }
    
    // 배경 스크롤 다시 활성화
    document.body.style.overflow = '';
    
    // Step 1로 이동
    goToStep(1);
    
    // 토스트 알림
    showToast('새 신청서를 작성합니다.', 'info');
}

// ===== 유틸리티 =====

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 대시보드로 이동
function goToDashboard() {
    // 모달 닫기
    document.getElementById('submitSuccessModal').classList.remove('show');
    
    // 부모 창이 있으면 (iframe 내에서 실행 중이면) 부모 창의 라우터 사용
    if (window.parent && window.parent !== window && window.parent.router) {
        window.parent.router.navigate('/requests');
    } else {
        // 단독 페이지면 직접 이동
        window.location.href = 'app.html#/requests';
    }
}

// 전역 함수 노출
window.selectTemplate = selectTemplate;
window.goToStep = goToStep;
window.saveDraft = saveDraft;
window.submitRequest = submitRequest;
window.createNewRequest = createNewRequest;
window.goToDashboard = goToDashboard;
window.setRating = setRating;
window.setPriority = setPriority;
window.handleFileSelect = handleFileSelect;
window.refreshTemplates = refreshTemplates;
window.filterTemplatesByCategory = filterTemplatesByCategory;
window.filterTemplates = filterTemplates;

