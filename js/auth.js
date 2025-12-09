// ===== Authentication Module =====

// 현재 로그인된 사용자 가져오기
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// 로그인 여부 확인
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// 사용자 로그인
function loginUser(user, remember = false) {
    const userData = {
        ...user,
        loginTime: new Date().toISOString()
    };
    
    if (remember) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
    }
    
    return userData;
}

// 로그아웃 함수
function logoutUser() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
}

// 로그아웃 (확인 포함)
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        logoutUser();
        window.location.href = 'login.html';
    }
}

// 사용자 정보 표시
function displayUserInfo(user) {
    if (!user) return;
    
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) {
        userNameEl.textContent = user.name || user.email;
    }
    
    if (userRoleEl) {
        const roleNames = {
            admin: '관리자',
            manager: '매니저',
            user: '사용자'
        };
        userRoleEl.textContent = user.team || roleNames[user.role] || user.role;
    }
    
    if (userAvatarEl) {
        const initial = user.name ? user.name.charAt(0) : '👤';
        userAvatarEl.textContent = initial;
        
        const roleColors = {
            admin: 'linear-gradient(135deg, #ff6b35, #f7c948)',
            manager: 'linear-gradient(135deg, #667eea, #764ba2)',
            user: 'linear-gradient(135deg, #4facfe, #00f2fe)'
        };
        userAvatarEl.style.background = roleColors[user.role] || roleColors.user;
    }
}

// 세션 만료 체크 (30분)
function checkSessionExpiry() {
    const currentUser = getCurrentUser();
    
    if (currentUser && currentUser.loginTime) {
        const loginTime = new Date(currentUser.loginTime);
        const now = new Date();
        const diffMinutes = (now - loginTime) / (1000 * 60);
        
        // 30분 경과 시 세션 만료 (localStorage 사용자는 제외)
        if (diffMinutes > 30 && sessionStorage.getItem('currentUser')) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            logoutUser();
            window.location.href = 'login.html';
        }
    }
}

// 5분마다 세션 체크
setInterval(checkSessionExpiry, 5 * 60 * 1000);

// 전역으로 노출
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.logout = logout;
window.displayUserInfo = displayUserInfo;
