// ===== Simple Authentication Check =====
// 이 스크립트는 모든 보호된 페이지에서 사용됩니다.

(function() {
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
    
    // 인증 체크
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        window.location.href = 'login.html';
        return;
    }
    
    // 전역으로 노출
    window.getCurrentUser = getCurrentUser;
})();

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}


