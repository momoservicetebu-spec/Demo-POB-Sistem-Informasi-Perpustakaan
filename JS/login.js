// login.js

// 1. Cek jika sudah login, langsung arahkan ke halaman utama
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'index.html';
    }
});

// 2. Tangani proses submit form login
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ambil nilai input
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        
        // TODO: Ganti bagian ini dengan logika API/SDK Anda yang sebenarnya
        // Simulasi verifikasi login sederhana
        if (usernameInput === 'admin' && passwordInput === '123456') {
            
            // Data user yang didapat dari database/backend
            const userData = { 
                id: 1, 
                username: usernameInput,
                name: "Admin Perpus", 
                role: "Admin" 
            };
            
            // Simpan sesi ke localStorage
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Alihkan ke halaman utama
            window.location.href = 'index.html';
            
        } else {
            alert('Username atau password salah!');
        }
    });
}