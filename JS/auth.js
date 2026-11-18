// JS/auth.js

const AUTH_SESSION_KEY = 'perpus_auth_session';
const AUTH_ATTEMPT_KEY = 'perpus_login_attempts';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 jam
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 menit

function checkLoginLockout() {
    const raw = localStorage.getItem(AUTH_ATTEMPT_KEY);
    if (!raw) return { locked: false, remainingSec: 0 };

    try {
        const data = JSON.parse(raw);
        if (data.lockedUntil && Date.now() < data.lockedUntil) {
            return { locked: true, remainingSec: Math.ceil((data.lockedUntil - Date.now()) / 1000) };
        }
        if (data.lockedUntil && Date.now() >= data.lockedUntil) {
            localStorage.removeItem(AUTH_ATTEMPT_KEY);
        }
    } catch (e) {
        localStorage.removeItem(AUTH_ATTEMPT_KEY);
    }
    return { locked: false, remainingSec: 0 };
}

function recordFailedLoginAttempt() {
    let data = { count: 0, lockedUntil: null };
    try {
        const raw = localStorage.getItem(AUTH_ATTEMPT_KEY);
        if (raw) data = JSON.parse(raw);
    } catch (e) {}

    data.count = (data.count || 0) + 1;
    if (data.count >= MAX_LOGIN_ATTEMPTS) {
        data.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
    localStorage.setItem(AUTH_ATTEMPT_KEY, JSON.stringify(data));
    return data;
}

function resetLoginAttempts() {
    localStorage.removeItem(AUTH_ATTEMPT_KEY);
}

// Buat sesi & sinkronkan ke semua key lama agar JS/script.js tidak me-redirect balik
function createAuthSession(userObj) {
    const sessionPayload = {
        id: userObj.__backendId || userObj.id || userObj.username,
        username: userObj.username,
        fullName: userObj.fullName || userObj.name || userObj.username,
        role: (userObj.role || 'pustakawan').toLowerCase(),
        token: btoa(`${userObj.username}:${Date.now()}:${Math.random().toString(36).slice(2)}`),
        loginAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS
    };

    const jsonStr = JSON.stringify(sessionPayload);
    localStorage.setItem(AUTH_SESSION_KEY, jsonStr);
    localStorage.setItem('loggedInUser', jsonStr);
    localStorage.setItem('currentUser', jsonStr);
    window.loggedInUser = sessionPayload;
    resetLoginAttempts();
    return sessionPayload;
}

// Ambil sesi HANYA jika memiliki token resmi & belum kadaluarsa
function getValidAuthSession() {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;

    try {
        const session = JSON.parse(raw);
        if (!session || !session.username || !session.token) {
            clearAuthSession();
            return null;
        }
        if (session.expiresAt && Date.now() > session.expiresAt) {
            clearAuthSession();
            return null;
        }

        // Pastikan key lama ikut terisi
        localStorage.setItem('loggedInUser', raw);
        localStorage.setItem('currentUser', raw);
        window.loggedInUser = session;
        return session;
    } catch (e) {
        clearAuthSession();
        return null;
    }
}

function clearAuthSession() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('currentUser');
    window.loggedInUser = null;
}

// Pelindung halaman utama (index.html)
function requireAuth() {
    const isLoginPage = window.location.pathname.toLowerCase().includes('login.html');
    if (isLoginPage) return null;

    const session = getValidAuthSession();
    if (!session) {
        clearAuthSession();
        window.location.replace('login.html');
        return null;
    }
    return session;
}

// Pelindung halaman login (login.html)
function redirectIfAuthenticated() {
    const isLoginPage = window.location.pathname.toLowerCase().includes('login.html');
    if (!isLoginPage) return;

    const session = getValidAuthSession();
    if (session && session.token) {
        window.location.replace('index.html');
    } else {
        // Bersihkan sisa sesi lama yang rusak agar tidak memicu loop
        clearAuthSession();
    }
}

function canAccessMenu(menuKey) {
    const user = getValidAuthSession();
    if (!user) return false;
    const role = (user.role || '').toLowerCase();

    if (role === 'admin') return true;
    if (role === 'kasir' || role === 'kasir buku') {
        return ['dashboard', 'books', 'members', 'loans', 'statistics'].includes(menuKey);
    }
    return !['users', 'settings'].includes(menuKey);
}

function logout() {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        clearAuthSession();
        window.location.replace('login.html');
    }
}