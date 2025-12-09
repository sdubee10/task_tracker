// ===== State Management =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let timerHistory = JSON.parse(localStorage.getItem('timerHistory')) || [];
let timerInterval = null;
let timerSeconds = 0;
let isTimerRunning = false;

// ===== DOM Elements =====
const elements = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    views: document.querySelectorAll('.view'),
    
    // Dashboard
    completedTasks: document.getElementById('completedTasks'),
    pendingTasks: document.getElementById('pendingTasks'),
    totalTime: document.getElementById('totalTime'),
    efficiency: document.getElementById('efficiency'),
    recentTasksList: document.getElementById('recentTasksList'),
    recentEmpty: document.getElementById('recentEmpty'),
    weeklyChart: document.getElementById('weeklyChart'),
    
    // Tasks
    tasksList: document.getElementById('tasksList'),
    tasksEmpty: document.getElementById('tasksEmpty'),
    searchInput: document.getElementById('searchInput'),
    filterStatus: document.getElementById('filterStatus'),
    filterPriority: document.getElementById('filterPriority'),
    
    // Analytics
    weekTasks: document.getElementById('weekTasks'),
    weekCompleted: document.getElementById('weekCompleted'),
    weekTime: document.getElementById('weekTime'),
    avgTime: document.getElementById('avgTime'),
    categoryList: document.getElementById('categoryList'),
    timeDistribution: document.getElementById('timeDistribution'),
    highPriorityBar: document.getElementById('highPriorityBar'),
    mediumPriorityBar: document.getElementById('mediumPriorityBar'),
    lowPriorityBar: document.getElementById('lowPriorityBar'),
    highCount: document.getElementById('highCount'),
    mediumCount: document.getElementById('mediumCount'),
    lowCount: document.getElementById('lowCount'),
    
    // Timer
    timerHours: document.getElementById('timerHours'),
    timerMinutes: document.getElementById('timerMinutes'),
    timerSeconds: document.getElementById('timerSeconds'),
    timerTaskSelect: document.getElementById('timerTaskSelect'),
    timerStartBtn: document.getElementById('timerStartBtn'),
    timerHistoryList: document.getElementById('timerHistory'),
    historyEmpty: document.getElementById('historyEmpty'),
    
    // Modal
    taskModal: document.getElementById('taskModal'),
    taskForm: document.getElementById('taskForm'),
    modalTitle: document.getElementById('modalTitle'),
    taskId: document.getElementById('taskId'),
    taskTitle: document.getElementById('taskTitle'),
    taskDescription: document.getElementById('taskDescription'),
    taskCategory: document.getElementById('taskCategory'),
    taskPriority: document.getElementById('taskPriority'),
    taskEstimate: document.getElementById('taskEstimate'),
    taskDueDate: document.getElementById('taskDueDate'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer'),
    
    // Current Date
    currentDate: document.getElementById('currentDate')
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    updateCurrentDate();
    setupNavigation();
    setupFilters();
    renderAll();
    
    // Update date every minute
    setInterval(updateCurrentDate, 60000);
}

function updateCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    elements.currentDate.textContent = now.toLocaleDateString('ko-KR', options);
}

// ===== Navigation =====
function setupNavigation() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Skip if it's an external link
            if (item.classList.contains('external')) return;
            
            e.preventDefault();
            const view = item.dataset.view;
            if (view) {
                showView(view);
            }
        });
    });
}

function showView(viewName) {
    // Update nav items
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Update views
    elements.views.forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}-view`);
    });
    
    // Refresh data when switching views
    if (viewName === 'dashboard') {
        renderDashboard();
    } else if (viewName === 'tasks') {
        renderTasks();
    } else if (viewName === 'analytics') {
        renderAnalytics();
    } else if (viewName === 'timer') {
        renderTimer();
    }
}

// ===== Task Management =====
function openTaskModal(taskId = null) {
    elements.taskForm.reset();
    elements.taskId.value = '';
    
    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            elements.modalTitle.textContent = '업무 수정';
            elements.taskId.value = task.id;
            elements.taskTitle.value = task.title;
            elements.taskDescription.value = task.description || '';
            elements.taskCategory.value = task.category;
            elements.taskPriority.value = task.priority;
            elements.taskEstimate.value = task.estimatedTime || '';
            elements.taskDueDate.value = task.dueDate || '';
        }
    } else {
        elements.modalTitle.textContent = '새 업무 추가';
    }
    
    elements.taskModal.classList.add('active');
    elements.taskTitle.focus();
}

function closeTaskModal() {
    elements.taskModal.classList.remove('active');
}

function saveTask(e) {
    e.preventDefault();
    
    const taskData = {
        id: elements.taskId.value || generateId(),
        title: elements.taskTitle.value.trim(),
        description: elements.taskDescription.value.trim(),
        category: elements.taskCategory.value,
        priority: elements.taskPriority.value,
        estimatedTime: parseInt(elements.taskEstimate.value) || 0,
        dueDate: elements.taskDueDate.value,
        status: 'pending',
        actualTime: 0,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    const existingIndex = tasks.findIndex(t => t.id === taskData.id);
    
    if (existingIndex >= 0) {
        // Preserve existing status and times
        taskData.status = tasks[existingIndex].status;
        taskData.actualTime = tasks[existingIndex].actualTime;
        taskData.createdAt = tasks[existingIndex].createdAt;
        taskData.completedAt = tasks[existingIndex].completedAt;
        tasks[existingIndex] = taskData;
        showToast('업무가 수정되었습니다.', 'success');
    } else {
        tasks.unshift(taskData);
        showToast('새 업무가 추가되었습니다.', 'success');
    }
    
    saveTasks();
    closeTaskModal();
    renderAll();
}

function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        if (task.status === 'completed') {
            task.status = 'pending';
            task.completedAt = null;
        } else {
            task.status = 'completed';
            task.completedAt = new Date().toISOString();
        }
        saveTasks();
        renderAll();
    }
}

function startTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status === 'pending') {
        task.status = 'in-progress';
        saveTasks();
        renderAll();
        showToast(`"${task.title}" 업무를 시작합니다.`, 'info');
    }
}

function deleteTask(taskId) {
    if (confirm('이 업무를 삭제하시겠습니까?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderAll();
        showToast('업무가 삭제되었습니다.', 'success');
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== Filters =====
function setupFilters() {
    elements.searchInput.addEventListener('input', renderTasks);
    elements.filterStatus.addEventListener('change', renderTasks);
    elements.filterPriority.addEventListener('change', renderTasks);
}

function getFilteredTasks() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const statusFilter = elements.filterStatus.value;
    const priorityFilter = elements.filterPriority.value;
    
    return tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                             (task.description && task.description.toLowerCase().includes(searchTerm));
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });
}

// ===== Rendering =====
function renderAll() {
    renderDashboard();
    renderTasks();
    renderAnalytics();
    renderTimer();
}

function renderDashboard() {
    // Stats
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status !== 'completed').length;
    const totalMinutes = tasks.reduce((sum, t) => sum + (t.actualTime || 0), 0);
    const efficiencyValue = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    
    elements.completedTasks.textContent = completed;
    elements.pendingTasks.textContent = pending;
    elements.totalTime.textContent = formatTimeShort(totalMinutes);
    elements.efficiency.textContent = `${efficiencyValue}%`;
    
    // Recent Tasks
    const recentTasks = tasks.slice(0, 5);
    if (recentTasks.length > 0) {
        elements.recentEmpty.style.display = 'none';
        elements.recentTasksList.innerHTML = recentTasks.map(task => createTaskItem(task)).join('');
    } else {
        elements.recentEmpty.style.display = 'flex';
        elements.recentTasksList.innerHTML = '';
    }
    
    // Weekly Chart
    renderWeeklyChart();
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length > 0) {
        elements.tasksEmpty.style.display = 'none';
        elements.tasksList.innerHTML = filteredTasks.map(task => createTaskItem(task, true)).join('');
    } else {
        elements.tasksEmpty.style.display = 'flex';
        elements.tasksList.innerHTML = '';
    }
}

function createTaskItem(task, showActions = false) {
    const isCompleted = task.status === 'completed';
    const priorityLabels = { high: '높음', medium: '보통', low: '낮음' };
    
    return `
        <li class="task-item ${isCompleted ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-checkbox ${isCompleted ? 'checked' : ''}" onclick="toggleTaskStatus('${task.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-category">${task.category}</span>
                    <span class="task-priority">
                        <span class="priority-dot ${task.priority}"></span>
                        ${priorityLabels[task.priority]}
                    </span>
                    ${task.estimatedTime ? `<span>예상: ${task.estimatedTime}분</span>` : ''}
                </div>
            </div>
            ${task.actualTime > 0 ? `<span class="task-time">${formatTime(task.actualTime)}</span>` : ''}
            ${showActions ? `
                <div class="task-actions">
                    ${task.status === 'pending' ? `
                        <button class="task-action-btn" onclick="startTask('${task.id}')" title="시작">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                        </button>
                    ` : ''}
                    <button class="task-action-btn" onclick="openTaskModal('${task.id}')" title="수정">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="task-action-btn delete" onclick="deleteTask('${task.id}')" title="삭제">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            ` : ''}
        </li>
    `;
}

function renderWeeklyChart() {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const weekData = [];
    
    // Get data for last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTasks = tasks.filter(t => {
            const taskDate = new Date(t.completedAt || t.createdAt).toISOString().split('T')[0];
            return taskDate === dateStr && t.status === 'completed';
        });
        
        weekData.push({
            day: days[date.getDay()],
            count: dayTasks.length
        });
    }
    
    const maxCount = Math.max(...weekData.map(d => d.count), 1);
    
    elements.weeklyChart.innerHTML = weekData.map(data => `
        <div class="bar-item">
            <span class="bar-value">${data.count}</span>
            <div class="bar" style="height: ${(data.count / maxCount) * 150}px"></div>
            <span class="bar-label">${data.day}</span>
        </div>
    `).join('');
}

function renderAnalytics() {
    // Weekly summary
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekTasks = tasks.filter(t => new Date(t.createdAt) >= weekAgo);
    const weekCompleted = weekTasks.filter(t => t.status === 'completed');
    const weekTotalTime = weekTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0);
    const avgTaskTime = weekCompleted.length > 0 
        ? Math.round(weekTotalTime / weekCompleted.length) 
        : 0;
    
    elements.weekTasks.textContent = weekTasks.length;
    elements.weekCompleted.textContent = weekCompleted.length;
    elements.weekTime.textContent = formatTimeShort(weekTotalTime);
    elements.avgTime.textContent = `${avgTaskTime}m`;
    
    // Category breakdown
    renderCategoryBreakdown();
    
    // Time distribution
    renderTimeDistribution();
    
    // Priority stats
    renderPriorityStats();
}

function renderCategoryBreakdown() {
    const categories = {};
    const categoryColors = {
        '개발': '#ff6b35',
        '디자인': '#a78bfa',
        '기획': '#4ecdc4',
        '회의': '#fbbf24',
        '문서': '#34d399',
        '기타': '#6e6e73'
    };
    
    tasks.forEach(task => {
        categories[task.category] = (categories[task.category] || 0) + 1;
    });
    
    const total = tasks.length || 1;
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    
    if (sortedCategories.length > 0) {
        elements.categoryList.innerHTML = sortedCategories.map(([name, count]) => `
            <div class="category-item">
                <span class="category-color" style="background: ${categoryColors[name] || '#6e6e73'}"></span>
                <span class="category-name">${name}</span>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${(count / total) * 100}%; background: ${categoryColors[name] || '#6e6e73'}"></div>
                </div>
                <span class="category-count">${count}</span>
            </div>
        `).join('');
    } else {
        elements.categoryList.innerHTML = '<div class="empty-state small"><p>데이터가 없습니다</p></div>';
    }
}

function renderTimeDistribution() {
    // Create 24 hour slots
    const hourCounts = new Array(24).fill(0);
    
    tasks.forEach(task => {
        const hour = new Date(task.createdAt).getHours();
        hourCounts[hour]++;
    });
    
    const maxCount = Math.max(...hourCounts, 1);
    
    elements.timeDistribution.innerHTML = hourCounts.map((count, hour) => `
        <div class="time-bar ${count > 0 ? 'active' : ''}" 
             style="height: ${(count / maxCount) * 100}%"
             title="${hour}시: ${count}개"></div>
    `).join('');
}

function renderPriorityStats() {
    const priorityCounts = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
    };
    
    const total = tasks.length || 1;
    
    elements.highPriorityBar.style.width = `${(priorityCounts.high / total) * 100}%`;
    elements.mediumPriorityBar.style.width = `${(priorityCounts.medium / total) * 100}%`;
    elements.lowPriorityBar.style.width = `${(priorityCounts.low / total) * 100}%`;
    
    elements.highCount.textContent = priorityCounts.high;
    elements.mediumCount.textContent = priorityCounts.medium;
    elements.lowCount.textContent = priorityCounts.low;
}

// ===== Timer =====
function renderTimer() {
    // Populate task select
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    elements.timerTaskSelect.innerHTML = `
        <option value="">업무 선택...</option>
        ${incompleteTasks.map(task => `
            <option value="${task.id}">${escapeHtml(task.title)}</option>
        `).join('')}
    `;
    
    // Render history
    const todayHistory = getTodayHistory();
    if (todayHistory.length > 0) {
        elements.historyEmpty.style.display = 'none';
        elements.timerHistoryList.innerHTML = todayHistory.map(item => `
            <li class="history-item">
                <span class="history-task">${escapeHtml(item.taskTitle)}</span>
                <span class="history-time">${formatTime(item.duration)}</span>
            </li>
        `).join('');
    } else {
        elements.historyEmpty.style.display = 'flex';
        elements.timerHistoryList.innerHTML = '';
    }
}

function getTodayHistory() {
    const today = new Date().toISOString().split('T')[0];
    return timerHistory.filter(item => item.date === today);
}

function toggleTimer() {
    if (isTimerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    const selectedTaskId = elements.timerTaskSelect.value;
    
    if (!selectedTaskId) {
        showToast('업무를 선택해주세요.', 'error');
        return;
    }
    
    isTimerRunning = true;
    elements.timerStartBtn.classList.add('running');
    elements.timerStartBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
        </svg>
        일시정지
    `;
    
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (!isTimerRunning) return;
    
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    elements.timerStartBtn.classList.remove('running');
    elements.timerStartBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        시작
    `;
    
    // Save time to task
    const selectedTaskId = elements.timerTaskSelect.value;
    if (selectedTaskId && timerSeconds > 0) {
        const task = tasks.find(t => t.id === selectedTaskId);
        if (task) {
            const minutes = Math.ceil(timerSeconds / 60);
            task.actualTime = (task.actualTime || 0) + minutes;
            saveTasks();
            
            // Add to history
            timerHistory.push({
                taskId: selectedTaskId,
                taskTitle: task.title,
                duration: minutes,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('timerHistory', JSON.stringify(timerHistory));
            
            showToast(`${formatTime(minutes)} 기록되었습니다.`, 'success');
            renderAll();
        }
    }
}

function resetTimer() {
    if (isTimerRunning) {
        stopTimer();
    }
    timerSeconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    
    elements.timerHours.textContent = String(hours).padStart(2, '0');
    elements.timerMinutes.textContent = String(minutes).padStart(2, '0');
    elements.timerSeconds.textContent = String(seconds).padStart(2, '0');
}

// ===== Utilities =====
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

function formatTimeShort(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-message">${message}</span>`;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Close modal on outside click
elements.taskModal.addEventListener('click', (e) => {
    if (e.target === elements.taskModal) {
        closeTaskModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close modal
    if (e.key === 'Escape' && elements.taskModal.classList.contains('active')) {
        closeTaskModal();
    }
    
    // Ctrl/Cmd + N for new task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openTaskModal();
    }
});

