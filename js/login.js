// ===== Login Authentication System =====

// 데모 계정 정보
const demoAccounts = {
    admin: {
        email: 'admin@taskflow.com',
        password: 'admin123',
        name: '관리자',
        role: 'admin',
        department: '경영지원',
        team: '시스템관리팀'
    },
    manager: {
        email: 'manager@taskflow.com',
        password: 'manager123',
        name: '김매니저',
        role: 'manager',
        department: '개발본부',
        team: 'Backend팀'
    },
    user: {
        email: 'user@taskflow.com',
        password: 'user123',
        name: '이사원',
        role: 'user',
        department: '개발본부',
        team: 'Frontend팀'
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 이미 로그인되어 있으면 SPA 앱으로 리다이렉트
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = 'app.html';
        return;
    }
    
    // 저장된 이메일이 있으면 자동 입력
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('rememberMe').checked = true;
    }
    
    // 테마 적용
    initTheme();
});

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

// 테마 초기화
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// 로그인 처리
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('loginError');
    const errorMessage = document.getElementById('errorMessage');
    
    // 에러 메시지 숨기기
    errorDiv.style.display = 'none';
    
    // 로딩 상태
    loginBtn.classList.add('loading');
    
    // 인증 시뮬레이션 (실제로는 서버 API 호출)
    setTimeout(() => {
        const user = authenticateUser(email, password);
        
        if (user) {
            // 로그인 성공
            loginSuccess(user, rememberMe);
        } else {
            // 로그인 실패
            loginBtn.classList.remove('loading');
            errorMessage.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.';
            errorDiv.style.display = 'flex';
        }
    }, 800); // 로딩 효과를 위한 딜레이
}

// 사용자 인증
function authenticateUser(email, password) {
    // 데모 계정 확인
    for (const key in demoAccounts) {
        const account = demoAccounts[key];
        if (account.email === email && account.password === password) {
            return {
                id: key,
                email: account.email,
                name: account.name,
                role: account.role,
                department: account.department,
                team: account.team,
                loginTime: new Date().toISOString()
            };
        }
    }
    
    // 등록된 사용자 확인 (로컬 스토리지에 저장된 사용자)
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
        return {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role || 'user',
            department: foundUser.department || '미지정',
            team: foundUser.team || '미지정',
            loginTime: new Date().toISOString()
        };
    }
    
    return null;
}

// 로그인 성공 처리
function loginSuccess(user, rememberMe) {
    // 사용자 정보 저장
    if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('savedEmail', user.email);
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.removeItem('savedEmail');
    }
    
    // 로그인 기록 저장
    saveLoginHistory(user);
    
    // SPA 앱으로 이동
    window.location.href = 'app.html';
}

// 로그인 기록 저장
function saveLoginHistory(user) {
    const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
    history.unshift({
        userId: user.id,
        email: user.email,
        name: user.name,
        loginTime: user.loginTime,
        userAgent: navigator.userAgent
    });
    
    // 최근 50개만 유지
    if (history.length > 50) {
        history.splice(50);
    }
    
    localStorage.setItem('loginHistory', JSON.stringify(history));
}

// 비밀번호 표시/숨김 토글
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeOpen = document.querySelector('.eye-open');
    const eyeClosed = document.querySelector('.eye-closed');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

// 데모 계정 자동 입력
function fillDemoAccount(type) {
    const account = demoAccounts[type];
    if (account) {
        document.getElementById('email').value = account.email;
        document.getElementById('password').value = account.password;
        
        // 입력 필드 애니메이션
        const inputs = document.querySelectorAll('.input-wrapper input');
        inputs.forEach(input => {
            input.classList.add('filled');
            setTimeout(() => input.classList.remove('filled'), 300);
        });
    }
}

// 소셜 로그인 (데모용)
function socialLogin(provider) {
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('loginError');
    const errorMessage = document.getElementById('errorMessage');
    
    // 로딩 상태
    loginBtn.classList.add('loading');
    
    setTimeout(() => {
        loginBtn.classList.remove('loading');
        
        // 데모에서는 소셜 로그인을 시뮬레이션
        const demoUser = {
            id: `${provider}-user-${Date.now()}`,
            email: `demo@${provider}.com`,
            name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} 사용자`,
            role: 'user',
            department: '미지정',
            team: '미지정',
            loginTime: new Date().toISOString(),
            provider: provider
        };
        
        loginSuccess(demoUser, false);
    }, 1000);
}

// 회원가입 모달 표시 (데모용)
function showSignupModal() {
    alert('회원가입 기능은 데모 버전에서는 지원되지 않습니다.\n\n데모 계정을 사용해주세요:\n- admin@taskflow.com / admin123\n- manager@taskflow.com / manager123\n- user@taskflow.com / user123');
}

// 로그아웃 함수 (다른 페이지에서 사용)
function logout() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// 전역으로 logout 함수 노출
window.logout = logout;
window.getCurrentUser = getCurrentUser;


