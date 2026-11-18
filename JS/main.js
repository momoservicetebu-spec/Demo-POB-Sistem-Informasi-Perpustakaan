// main.js

// 1. Penjaga Keamanan: Cek apakah user sudah login sebelum render konten
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    
    // Jika tidak ada data sesi, tendang kembali ke halaman login
    if (!savedUser) {
        window.location.href = 'login.html';
        return null;
    }
    
    return JSON.parse(savedUser);
}

// Jalankan pengecekan auth dan simpan data user
const currentUser = checkAuth();

// 2. Inisialisasi Halaman (Jalankan setelah HTML selesai dimuat)
document.addEventListener('DOMContentLoaded', () => {
    // Jika auth gagal, hentikan eksekusi script selanjutnya
    if (!currentUser) return; 

    // Tampilkan nama user di header dashboard
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.innerText = currentUser.name;
    }

    // Tampilkan role atau info lain (opsional)
    console.log("Login sebagai:", currentUser.role);
    
    // TODO: Panggil fungsi untuk me-render tabel buku, anggota, dll di sini
    // renderDashboard(); 
});

// 3. Fungsi Logout
function logout() {
    const confirmLogout = confirm('Apakah Anda yakin ingin keluar?');
    if (confirmLogout) {
        // Hapus data sesi dari localStorage
        localStorage.removeItem('currentUser');
        
        // Alihkan kembali ke halaman login
        window.location.href = 'login.html';
    }
}