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