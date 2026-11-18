// JS/main.js

const currentUser = window.loggedInUser;

function renderCurrentSection() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    // Cek hak akses sebelum merender halaman
    if (!canAccessMenu(appState.currentSection)) {
        appState.currentSection = 'dashboard';
    }

    // Perbarui highlight menu aktif di sidebar
    const sidebarNav = document.getElementById('sidebarNav');
    if (sidebarNav && typeof renderSidebarNav === 'function') {
        sidebarNav.innerHTML = renderSidebarNav();
    }

    switch (appState.currentSection) {
        case 'dashboard': content.innerHTML = renderDashboardHome(); break;
        case 'books': content.innerHTML = renderBooksSection(); break;
        case 'members': content.innerHTML = renderMembersSection(); break;
        case 'loans': content.innerHTML = renderCirculationSection(); break;
        case 'visitors': content.innerHTML = renderVisitorsSection(); break;
        case 'reports': content.innerHTML = typeof renderReportsSection === 'function' ? renderReportsSection() : '<div class="p-6 text-gray-500">Modul Laporan siap diisi di Tahap 3.</div>'; break;
        case 'users': content.innerHTML = typeof renderUsersSection === 'function' ? renderUsersSection() : '<div class="p-6 text-gray-500">Modul Manajemen User siap diisi di Tahap 3.</div>'; break;
        case 'settings': content.innerHTML = renderSettingsSection(); break;
        default:
            content.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500">Halaman tidak ditemukan.</div>`;
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function navigateTo(section) {
    appState.currentSection = section;
    renderCurrentSection();
}

async function refreshDataFromServer() {
    if (window.dataSdk && typeof window.dataSdk.fetchAll === 'function') {
        const dataDariServer = await window.dataSdk.fetchAll();
        appState.allRecords = dataDariServer || [];

        // Sinkronkan pengaturan dari server jika ada record dengan type === 'setting'
        const serverSetting = appState.allRecords.find(r => r.type === 'setting');
        if (serverSetting) {
            defaultConfig.libraryName = serverSetting.libraryName || defaultConfig.libraryName;
            defaultConfig.librarySubtitle = serverSetting.librarySubtitle || defaultConfig.librarySubtitle;
            defaultConfig.primaryColor = serverSetting.primaryColor || defaultConfig.primaryColor;
            defaultConfig.finePerDay = Number(serverSetting.finePerDay) || defaultConfig.finePerDay;
            defaultConfig.maxLoanDays = Number(serverSetting.maxLoanDays) || defaultConfig.maxLoanDays;
            localStorage.setItem('librarySettings', JSON.stringify(defaultConfig));
            document.documentElement.style.setProperty('--primary-color', defaultConfig.primaryColor);
        }

        renderCurrentSection();
    }
}

async function initApp() {
    if (!currentUser) return;

    const appContainer = document.getElementById('app');
    appContainer.innerHTML = renderDashboard();

    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.innerText = currentUser.fullName || currentUser.name || currentUser.username;
    }

    const content = document.getElementById('mainContent');
    if (content) {
        content.innerHTML = `<div class="p-8 text-center text-gray-600">Memuat data dari server...</div>`;
    }

    try {
        await refreshDataFromServer();
    } catch (error) {
        console.error("Gagal memulai aplikasi:", error);
        if (content) {
            content.innerHTML = `<div class="p-8 text-center text-red-500">Gagal memuat data dari server.</div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', initApp);

function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}