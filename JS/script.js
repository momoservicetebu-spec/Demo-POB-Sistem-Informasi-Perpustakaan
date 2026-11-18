// JS/script.js

// 1. Konfigurasi Default & Pembacaan LocalStorage
const savedSettingsLocal = JSON.parse(localStorage.getItem('librarySettings') || '{}');

const defaultConfig = {
    libraryName: savedSettingsLocal.libraryName || 'PerpusWeb',
    librarySubtitle: savedSettingsLocal.librarySubtitle || 'Sistem Informasi Perpustakaan',
    primaryColor: savedSettingsLocal.primaryColor || '#2563eb',
    finePerDay: Number(savedSettingsLocal.finePerDay) || 1000,
    maxLoanDays: Number(savedSettingsLocal.maxLoanDays) || 7
};

// Terapkan warna tema utama ke CSS Variable
document.documentElement.style.setProperty('--primary-color', defaultConfig.primaryColor);

// 2. Hak Akses Menu Berdasarkan Role (RBAC)
const menuPermissions = {
    admin: ['dashboard', 'books', 'members', 'loans', 'visitors', 'reports', 'users', 'settings'],
    petugas: ['dashboard', 'books', 'members', 'loans', 'visitors', 'reports'],
    pustakawan: ['dashboard', 'books', 'members', 'loans', 'visitors', 'reports'],
    pengunjung: ['dashboard', 'visitors']
};

function canAccessMenu(menuKey) {
    const user = window.loggedInUser || appState.currentUser;
    if (!user) return false;
    const role = (user.role || 'petugas').toLowerCase();
    const allowed = menuPermissions[role] || menuPermissions.petugas;
    return allowed.includes(menuKey);
}

// 3. State Global Aplikasi
let appState = {
    currentUser: window.loggedInUser || null,
    currentSection: 'dashboard',
    allRecords: []
};

// 4. Fungsi Utilitas Global
function getRecordsByType(type) {
    return appState.allRecords.filter(record => record.type === type);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : (type === 'warning' ? 'bg-amber-500' : 'bg-red-600');
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-5 py-3 rounded-xl shadow-lg z-50 text-sm font-medium transition-opacity duration-300`;
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka || 0);
}

// 5. Sistem Modal Global
function openModal(title, formContent, maxWidthClass = 'max-w-md') {
    const existingModal = document.getElementById('globalModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
    <div id="globalModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity">
        <div class="bg-white rounded-2xl shadow-xl w-full ${maxWidthClass} overflow-hidden transform transition-all">
            <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 class="text-lg font-bold text-gray-800">${title}</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-red-500 transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="p-6 max-h-[85vh] overflow-y-auto">
                ${formContent}
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) lucide.createIcons();
}

function closeModal() {
    const modal = document.getElementById('globalModal');
    if (modal) modal.remove();
}

// 6. Sistem Global Loading Overlay & Progress Bar (Untuk Semua Menu & Pemrosesan Data)
let activeLoadingCount = 0;

function showGlobalLoading(message = 'Memproses data...', subMessage = 'Mohon tunggu sebentar, jangan tutup halaman.') {
    activeLoadingCount++;

    let overlay = document.getElementById('globalProcessLoading');
    if (!overlay) {
        const html = `
        <div id="globalProcessLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 backdrop-blur-xs transition-opacity duration-200">
            <!-- Top Slim Animated Progress Bar -->
            <div class="fixed top-0 left-0 right-0 h-1 bg-indigo-100 overflow-hidden z-[10000]">
                <div class="h-full bg-gradient-to-r from-indigo-500 via-orange-400 to-indigo-600 animate-loading-bar"></div>
            </div>

            <!-- Kartu Spinner Tengah -->
            <div class="bg-white/95 border border-indigo-100 rounded-3xl shadow-2xl px-7 py-6 max-w-xs w-[88vw] text-center space-y-3.5 transform scale-100">
                <div class="relative w-14 h-14 mx-auto">
                    <div class="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                    <div class="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center text-indigo-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                    </div>
                </div>
                <div>
                    <p id="globalLoadingTitle" class="text-sm font-bold text-slate-800">${message}</p>
                    <p id="globalLoadingSub" class="text-[11px] text-slate-400 mt-1">${subMessage}</p>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    } else {
        const titleEl = document.getElementById('globalLoadingTitle');
        const subEl = document.getElementById('globalLoadingSub');
        if (titleEl) titleEl.textContent = message;
        if (subEl) subEl.textContent = subMessage;
        overlay.classList.remove('hidden');
    }
}

function hideGlobalLoading(force = false) {
    activeLoadingCount = force ? 0 : Math.max(0, activeLoadingCount - 1);
    if (activeLoadingCount === 0) {
        const overlay = document.getElementById('globalProcessLoading');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Helper pembungkus fungsi async agar otomatis menampilkan & menutup loading
async function runWithLoading(asyncFn, message = 'Memproses data...', subMessage = 'Sedang menyinkronkan dengan server...') {
    showGlobalLoading(message, subMessage);
    try {
        return await asyncFn();
    } finally {
        hideGlobalLoading();
    }
}