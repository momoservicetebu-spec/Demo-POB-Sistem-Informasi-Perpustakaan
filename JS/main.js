// JS/main.js

// 1. Ambil data user dari variabel global
const currentUser = window.loggedInUser;

// 2. Fungsi Navigasi & Rendering Konten Tengah
function renderCurrentSection() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    switch(appState.currentSection) {
        case 'dashboard': content.innerHTML = renderDashboardHome(); break;
        case 'books': content.innerHTML = renderBooksSection(); break;
        case 'members': content.innerHTML = renderMembersSection(); break;
        case 'loans': content.innerHTML = renderCirculationSection(); break; // <-- Sudah disesuaikan
        case 'visitors': content.innerHTML = renderVisitorsSection(); break;
        case 'settings': content.innerHTML = renderSettingsSection(); break;
        default:
            content.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500">Halaman sedang dikembangkan.</div>`;
    }
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

function navigateTo(section) {
    appState.currentSection = section;
    renderCurrentSection();
}

// 3. Fungsi untuk menyegarkan data dari server secara diam-diam
async function refreshDataFromServer() {
    if (window.dataSdk && typeof window.dataSdk.fetchAll === 'function') {
        const dataDariServer = await window.dataSdk.fetchAll();
        appState.allRecords = dataDariServer || [];
        renderCurrentSection();
    }
}

// 4. Inisialisasi Aplikasi Utama
async function initApp() {
    if (!currentUser) return;

    const appContainer = document.getElementById('app');
    
    // A. Gambar Kerangka Dasar (Sidebar & Header)
    appContainer.innerHTML = renderDashboard(); 

    // B. Tampilkan nama user
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.innerText = currentUser.fullName || currentUser.name || currentUser.username;
    }

    // C. Tampilkan status loading di konten utama
    const content = document.getElementById('mainContent');
    if (content) {
        content.innerHTML = `<div class="p-8 text-center text-gray-600">Memuat data dari server...</div>`;
    }

    // D. Hubungkan dan muat data dari Google Apps Script melalui api.js
    try {
        await refreshDataFromServer();
    } catch (error) {
        console.error("Gagal memulai aplikasi:", error);
        if (content) {
            content.innerHTML = `<div class="p-8 text-center text-red-500">Gagal memuat data dari server.</div>`;
        }
    }
}

// Jalankan aplikasi saat dokumen siap
document.addEventListener('DOMContentLoaded', initApp);

// 5. Fungsi Logout
function logout() {
    const confirmLogout = confirm('Apakah Anda yakin ingin keluar?');
    if (confirmLogout) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}