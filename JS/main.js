// JS/main.js

// Lindungi halaman utama: wajib memiliki sesi login valid dari JS/auth.js
const currentUser = typeof requireAuth === 'function' ? requireAuth() : window.loggedInUser;

function renderCurrentSection() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    // Cek hak akses sebelum merender halaman
    if (typeof canAccessMenu === 'function' && !canAccessMenu(appState.currentSection)) {
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
        case 'catalog_ddc': content.innerHTML = renderCatalogDdcSection(); break;
        case 'members': content.innerHTML = renderMembersSection(); break;
        case 'loans': content.innerHTML = renderCirculationSection(); break;
        case 'visitors': content.innerHTML = renderVisitorsSection(); break;
        case 'reports': content.innerHTML = typeof renderReportsSection === 'function' ? renderReportsSection() : '<div class="p-6 text-gray-500">Modul Laporan siap diisi di Tahap 3.</div>'; break;
        case 'statistics': content.innerHTML = typeof renderStatisticsSection === 'function' ? renderStatisticsSection() : '<div class="p-6 text-gray-500">Modul Statistik belum dimuat.</div>'; break;
        case 'stock_opname': content.innerHTML = typeof renderStockOpnameSection === 'function' ? renderStockOpnameSection() : '<div class="p-6 text-gray-500">Modul Stok Opname siap diisi di Tahap 3.</div>'; break;
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
    const sectionTitles = {
        dashboard: 'Membuka Dashboard...',
        books: 'Memuat Katalog Data Buku...',
        catalog_ddc: 'Memuat Katalog Perpusnas...',
        members: 'Memuat Data Anggota...',
        loans: 'Memuat Sirkulasi Peminjaman...',
        visitors: 'Memuat Buku Tamu...',
        reports: 'Menyiapkan Laporan & Statistik...',
        stock_opname: 'Memuat Stok Opname...',
        statistics: 'Memuat Statistik & Reward Literasi...',
        users: 'Memuat Manajemen User...',
        settings: 'Membuka Pengaturan Sistem...'
    };

    if (typeof showGlobalLoading === 'function') {
        showGlobalLoading(sectionTitles[section] || 'Memuat halaman...', 'Menyiapkan tampilan modul...');
    }

    appState.currentSection = section;

    setTimeout(() => {
        try {
            renderCurrentSection();
        } finally {
            if (typeof hideGlobalLoading === 'function') {
                hideGlobalLoading();
            }
        }
    }, 180);
}

async function refreshDataFromServer() {
    if (window.dataSdk && typeof window.dataSdk.fetchAll === 'function') {
        const dataDariServer = await window.dataSdk.fetchAll();
        appState.allRecords = dataDariServer || [];

        // Sinkronkan pengaturan & kop sekolah dari server jika ada record dengan type === 'setting'
        const serverSetting = appState.allRecords.find(r => r.type === 'setting');
        if (serverSetting) {
            defaultConfig.libraryName = serverSetting.libraryName || defaultConfig.libraryName;
            defaultConfig.librarySubtitle = serverSetting.librarySubtitle || defaultConfig.librarySubtitle;
            defaultConfig.primaryColor = serverSetting.primaryColor || defaultConfig.primaryColor;
            defaultConfig.kopHeader1 = serverSetting.kopHeader1 || defaultConfig.kopHeader1;
            defaultConfig.kopSchoolName = serverSetting.kopSchoolName || defaultConfig.kopSchoolName;
            defaultConfig.kopAddress = serverSetting.kopAddress || defaultConfig.kopAddress;
            defaultConfig.kopContact = serverSetting.kopContact || defaultConfig.kopContact;
            defaultConfig.kopLogoLeft = serverSetting.kopLogoLeft || defaultConfig.kopLogoLeft;
            defaultConfig.kopLogoRight = serverSetting.kopLogoRight || defaultConfig.kopLogoRight;
            defaultConfig.finePerDay = Number(serverSetting.finePerDay) || defaultConfig.finePerDay;
            defaultConfig.maxLoanDays = Number(serverSetting.maxLoanDays) || defaultConfig.maxLoanDays;

            localStorage.setItem('librarySettings', JSON.stringify(defaultConfig));
            document.documentElement.style.setProperty('--primary-color', defaultConfig.primaryColor);

            const sidebarTitle = document.getElementById('sidebarLibName');
            if (sidebarTitle) sidebarTitle.textContent = defaultConfig.libraryName;
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

    if (typeof showGlobalLoading === 'function') {
        showGlobalLoading('Menyiapkan PerpusWeb...', 'Menghubungkan ke server & memuat data...');
    }

    try {
        await refreshDataFromServer();
    } catch (error) {
        console.error("Gagal memulai aplikasi:", error);
        const content = document.getElementById('mainContent');
        if (content) {
            content.innerHTML = `<div class="p-8 text-center text-red-500">Gagal memuat data dari server.</div>`;
        }
    } finally {
        if (typeof hideGlobalLoading === 'function') {
            hideGlobalLoading(true);
        }
    }
}

document.addEventListener('DOMContentLoaded', initApp);