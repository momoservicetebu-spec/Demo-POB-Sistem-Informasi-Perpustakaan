// JS/login.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Jika sudah login, langsung lempar ke dashboard
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Muat nama perpustakaan dari pengaturan jika sudah tersimpan
    const savedSettings = JSON.parse(localStorage.getItem('librarySettings') || '{}');
    if (savedSettings.libraryName) {
        const titleEl = document.getElementById('loginTitle');
        if (titleEl) titleEl.textContent = savedSettings.libraryName;
    }
});

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();
        const loginBtn = document.getElementById('loginBtn');
        const errorBox = document.getElementById('loginError');

        errorBox.classList.add('hidden');
        loginBtn.disabled = true;
        loginBtn.textContent = 'Memverifikasi akun...';

        try {
            // Ambil seluruh record dari Google Apps Script
            const records = await window.dataSdk.fetchAll();
            const users = records.filter(r => r.type === 'user');

            // Cari kecocokan user di database (mendukung properti username/userName dan password/userPassword)
            let matchedUser = users.find(u => {
                const dbUser = (u.username || u.userName || '').toString().trim();
                const dbPass = (u.password || u.userPassword || '').toString().trim();
                return dbUser.toLowerCase() === usernameInput.toLowerCase() && dbPass === passwordInput;
            });

            // Fallback akun default jika tabel user di database belum diisi sama sekali
            if (!matchedUser && users.length === 0 && usernameInput === 'admin' && passwordInput === '123456') {
                matchedUser = {
                    __backendId: 'DEFAULT_ADMIN',
                    username: 'admin',
                    fullName: 'Administrator Perpustakaan',
                    role: 'admin'
                };
            }

            if (matchedUser) {
                const sessionUser = {
                    id: matchedUser.__backendId || matchedUser.id || 'USER_1',
                    username: matchedUser.username || matchedUser.userName || usernameInput,
                    fullName: matchedUser.fullName || matchedUser.userFullName || matchedUser.name || usernameInput,
                    role: (matchedUser.role || matchedUser.userRole || 'petugas').toLowerCase()
                };

                localStorage.setItem('currentUser', JSON.stringify(sessionUser));
                window.location.href = 'index.html';
            } else {
                errorBox.textContent = 'Username atau password salah!';
                errorBox.classList.remove('hidden');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Masuk';
            }
        } catch (err) {
            console.error('Error saat login:', err);
            errorBox.textContent = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
            errorBox.classList.remove('hidden');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Masuk';
        }
    });
}