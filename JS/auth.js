// JS/auth.js

const AUTH_SESSION_KEY = 'perpus_auth_session';
const AUTH_ATTEMPT_KEY = 'perpus_login_attempts';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // Sesi berlaku 8 jam
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // Kunci sementara 2 menit jika 5x salah

// 1. Cek apakah percobaan login sedang terkunci (Brute-Force Protection)
function checkLoginLockout() {
    const raw = localStorage.getItem(AUTH_ATTEMPT_KEY);
    if (!raw) return { locked: false, remainingSec: 0 };

    try {
        const data = JSON.parse(raw);
        if (data.lockedUntil && Date.now() < data.lockedUntil) {
            const remainingSec = Math.ceil((data.lockedUntil - Date.now()) / 1000);
            return { locked: true, remainingSec };
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
    const raw = localStorage.getItem(AUTH_ATTEMPT_KEY);
    let data = { count: 0, lockedUntil: null };
    if (raw) {
        try { data = JSON.parse(raw); } catch (e) {}
    }

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

// 2. Buat & simpan token sesi setelah berhasil login
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

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionPayload));
    // Sinkronkan juga ke key lama jika masih dipakai modul lain
    localStorage.setItem('loggedInUser', JSON.stringify(sessionPayload));
    window.loggedInUser = sessionPayload;
    resetLoginAttempts();
    return sessionPayload;
}

// 3. Ambil sesi aktif & verifikasi apakah masih valid
function getValidAuthSession() {
    const raw = localStorage.getItem(AUTH_SESSION_KEY) || localStorage.getItem('loggedInUser');
    if (!raw) return null;

    try {
        const session = JSON.parse(raw);
        if (!session || !session.username) return null;

        if (session.expiresAt && Date.now() > session.expiresAt) {
            clearAuthSession();
            return null;
        }
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
    window.loggedInUser = null;
}

// 4. Pelindung Halaman Utama (Panggil di awal index.html / main.js)
function requireAuth() {
    const session = getValidAuthSession();
    if (!session) {
        window.location.replace('login.html');
        return null;
    }
    return session;
}

// 5. Pelindung Halaman Login (Jika sudah login, langsung arahkan ke dashboard)
function redirectIfAuthenticated() {
    const session = getValidAuthSession();
    if (session) {
        window.location.replace('index.html');
    }
}

// 6. Pembagian Hak Akses Menu Berdasarkan Role
function canAccessMenu(menuKey) {
    const user = getValidAuthSession();
    if (!user) return false;
    const role = (user.role || '').toLowerCase();

    if (role === 'admin') return true;
    if (role === 'kasir' || role === 'kasir buku') {
        return ['dashboard', 'books', 'members', 'loans'].includes(menuKey);
    }
    // Default: pustakawan / petugas
    return !['users', 'settings'].includes(menuKey);
}

// 7. Logout Aman
function logout() {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        clearAuthSession();
        window.location.replace('login.html');
    }
}