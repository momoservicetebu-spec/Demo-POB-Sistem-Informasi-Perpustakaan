// JS/login.js

document.addEventListener('DOMContentLoaded', () => {
    // Jika user sudah memiliki sesi login aktif, langsung arahkan ke index.html
    if (typeof redirectIfAuthenticated === 'function') {
        redirectIfAuthenticated();
    }

    // Tampilkan nama sekolah yang tersimpan di pengaturan lokal (jika ada)
    try {
        const saved = JSON.parse(localStorage.getItem('librarySettings') || '{}');
        const badgeEl = document.getElementById('loginSchoolBadge');
        const subEl = document.getElementById('loginLibSubtitle');
        if (badgeEl && (saved.kopSchoolName || saved.libraryName)) {
            badgeEl.textContent = saved.kopSchoolName || saved.libraryName;
        }
        if (subEl && saved.librarySubtitle) {
            subEl.textContent = saved.librarySubtitle;
        }
    } catch (e) {}
});

function togglePasswordVisibility() {
    const passInput = document.getElementById('loginPassword');
    const eyeIcon = document.getElementById('eyePasswordIcon');
    if (!passInput) return;

    const isPassword = passInput.type === 'password';
    passInput.type = isPassword ? 'text' : 'password';
    if (eyeIcon) {
        eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        if (window.lucide) lucide.createIcons();
    }
}

function showLoginAlert(message, isError = true) {
    const box = document.getElementById('loginAlertBox');
    const panel = document.getElementById('loginPanelCard');
    if (!box) return;

    box.textContent = message;
    box.classList.remove('hidden', 'bg-red-500/25', 'border-red-300/40', 'bg-emerald-500/25', 'border-emerald-300/40');

    if (isError) {
        box.classList.add('bg-red-500/25', 'border-red-300/40');
        if (panel) {
            panel.classList.remove('anim-shake');
            void panel.offsetWidth; // trigger reflow animasi getar
            panel.classList.add('anim-shake');
        }
    } else {
        box.classList.add('bg-emerald-500/25', 'border-emerald-300/40');
    }
}

function showLoginHelpInfo() {
    showLoginAlert('Hubungi Administrator Perpustakaan untuk pembuatan akun baru atau reset password.', false);
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    // Cek apakah akun sedang terkunci karena salah password berulang kali
    const lockState = checkLoginLockout();
    if (lockState.locked) {
        showLoginAlert(`Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${lockState.remainingSec} detik.`);
        return;
    }

    const usernameInput = document.getElementById('loginUsername').value.trim();
    const passwordInput = document.getElementById('loginPassword').value.trim();
    const btn = document.getElementById('btnLoginSubmit');

    if (!usernameInput || !passwordInput) {
        showLoginAlert('Username dan Password wajib diisi!');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'MEMVERIFIKASI...';

    try {
        let usersList = [];

        // Ambil daftar user dari server (Google Apps Script / dataSdk)
        if (window.dataSdk && typeof window.dataSdk.fetchAll === 'function') {
            const allData = await window.dataSdk.fetchAll();
            if (Array.isArray(allData)) {
                usersList = allData.filter(item => item.type === 'user');
            }
        }

        // Cocokkan username & password
        let matchedUser = usersList.find(u =>
            (u.username || u.userName || '').toLowerCase() === usernameInput.toLowerCase() &&
            String(u.password || u.userPassword || '') === passwordInput
        );

        // Fallback akun bawaan jika database user belum memiliki admin sama sekali
        if (!matchedUser && usersList.length === 0 && usernameInput.toLowerCase() === 'admin' && passwordInput === 'admin123') {
            matchedUser = {
                id: 'default-admin',
                username: 'admin',
                fullName: 'Administrator Sistem',
                role: 'admin',
                userStatus: 'aktif'
            };
        }

        if (!matchedUser) {
            const attempt = recordFailedLoginAttempt();
            const sisa = Math.max(0, MAX_LOGIN_ATTEMPTS - attempt.count);
            if (sisa === 0) {
                showLoginAlert('Akun dikunci sementara selama 2 menit karena 5x gagal login.');
            } else {
                showLoginAlert(`Username atau Password salah! (Sisa percobaan: ${sisa}x)`);
            }
            btn.disabled = false;
            btn.textContent = 'LOGIN';
            return;
        }

        // Cek apakah status akun dinonaktifkan oleh admin
        const statusAkun = (matchedUser.userStatus || matchedUser.status || 'aktif').toLowerCase();
        if (statusAkun === 'nonaktif') {
            showLoginAlert('Akun Anda sedang dinonaktifkan. Hubungi Administrator.');
            btn.disabled = false;
            btn.textContent = 'LOGIN';
            return;
        }

        // Berhasil login -> Simpan sesi & arahkan ke dashboard
        createAuthSession(matchedUser);
        showLoginAlert('Login berhasil! Mengalihkan ke dashboard...', false);

        setTimeout(() => {
            window.location.replace('index.html');
        }, 450);

    } catch (err) {
        console.error('Login error:', err);
        showLoginAlert('Gagal terhubung ke server autentikasi. Periksa koneksi internet Anda.');
        btn.disabled = false;
        btn.textContent = 'LOGIN';
    }
}