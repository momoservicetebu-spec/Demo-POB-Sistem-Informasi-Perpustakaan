// ==========================================
// 1. CONFIGURATION & STATE
// ==========================================
const defaultConfig = {
    primary_color: "#2563eb",
    secondary_color: "#f3f4f6",
    text_color: "#1f2937",
    success_color: "#10b981",
    danger_color: "#ef4444",
    app_title: "Dashboard Perpustakaan",
    school_name: "SMAN 1 BUMI AGUNG"
};

let appState = {
    // Mengambil data user dari Gatekeeper di index.html
    currentUser: window.loggedInUser || { name: 'Admin', role: 'Admin' }, 
    currentSection: 'dashboard',
    allRecords: [],
    isLoading: false,
    isSidebarCollapsed: false
};

// ==========================================
// 2. UTILITY FUNCTIONS
// ==========================================
function showToast(message, type = 'info') {
    // Implementasi sederhana notifikasi (Toast)
    alert(`[${type.toUpperCase()}] ${message}`);
}

function getRecordsByType(type) {
    return appState.allRecords.filter(record => record.type === type);
}

function filterTable(query, tbodyId) {
    const filter = query.toLowerCase();
    const rows = document.getElementById(tbodyId).getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].textContent.toLowerCase();
        rows[i].style.display = text.includes(filter) ? '' : 'none';
    }
}

function switchSection(section) {
    appState.currentSection = section;
    renderContent();
    renderSidebar(); // Re-render untuk update status 'active' di menu
}

// ==========================================
// 3. UI RENDERING FUNCTIONS
// ==========================================
function renderApp() {
    const appDiv = document.getElementById('app');
    if (!appDiv) return;

    appDiv.innerHTML = `
        <div class="flex h-screen bg-gray-50 overflow-hidden">
            <!-- Sidebar Container -->
            <div id="sidebar-container" class="bg-blue-800 text-white w-64 flex-shrink-0 transition-all duration-300"></div>
            
            <!-- Main Content Area -->
            <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header id="header-container" class="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center z-10"></header>
                <main id="main-content" class="flex-1 overflow-y-auto p-6 md:p-8"></main>
            </div>
        </div>
    `;

    renderSidebar();
    renderHeader();
    renderContent();
}

function renderSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'books', label: 'Koleksi Buku', icon: '📚' }
        // Tambahkan menu lain di sini (Anggota, Peminjaman, dll)
    ];

    const navHtml = navItems.map(item => `
        <a href="#" onclick="switchSection('${item.id}')" 
           class="flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${appState.currentSection === item.id ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700/50'}">
            <span>${item.icon}</span>
            <span>${item.label}</span>
        </a>
    `).join('');

    container.innerHTML = `
        <div class="p-6">
            <h1 class="text-xl font-bold mb-1 truncate" title="${defaultConfig.app_title}">${defaultConfig.app_title}</h1>
            <p class="text-blue-300 text-sm mb-8 truncate">${defaultConfig.school_name}</p>
            <nav class="flex flex-col">
                ${navHtml}
            </nav>
        </div>
    `;
}

function renderHeader() {
    const container = document.getElementById('header-container');
    if (!container) return;

    container.innerHTML = `
        <div class="flex items-center gap-4">
            <h2 class="text-xl font-semibold capitalize text-gray-800" id="header-title">
                ${appState.currentSection.replace('-', ' ')}
            </h2>
        </div>
        <div class="flex items-center gap-4">
            <div class="text-right hidden sm:block">
                <p class="text-sm font-semibold text-gray-800">${appState.currentUser.name}</p>
                <p class="text-xs text-gray-500">${appState.currentUser.role}</p>
            </div>
            <button onclick="logout()" class="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors">
                Logout
            </button>
        </div>
    `;
}

function renderContent() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Update Header Title
    const headerTitle = document.getElementById('header-title');
    if (headerTitle) headerTitle.textContent = appState.currentSection.replace('-', ' ');

    // Routing berdasarkan section yang dipilih
    if (appState.currentSection === 'dashboard') {
        mainContent.innerHTML = renderDashboardSection();
    } else if (appState.currentSection === 'books') {
        mainContent.innerHTML = renderBooksSection();
    } else {
        mainContent.innerHTML = `<div class="p-8 text-center text-gray-500">Halaman sedang dalam pengembangan.</div>`;
    }
}

// ==========================================
// 4. SECTION COMPONENTS
// ==========================================
function renderDashboardSection() {
    return `
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Selamat Datang, ${appState.currentUser.name}!</h1>
            <p class="text-gray-500">Berikut adalah ringkasan aktivitas perpustakaan Anda hari ini.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-gray-500 text-sm font-medium mb-1">Total Buku</h3>
                <p class="text-3xl font-bold text-blue-600">${getRecordsByType('book').length}</p>
            </div>
            <!-- Anda bisa menambahkan kartu statistik lainnya di sini -->
        </div>
    `;
}

function renderBooksSection() {
    const books = getRecordsByType('book');
    const isKasir = appState.currentUser.role === 'Kasir Buku';

    const tableRows = books.map(book => {
        const actionButtons = isKasir 
            ? '<span class="text-xs text-gray-400 italic">Hanya lihat</span>'
            : `<div class="flex gap-2">
                <button onclick="editBook('${book.__backendId}')" class="text-blue-600 hover:text-blue-800 text-lg md:text-base" title="Edit">✏️</button>
                <button onclick="deleteBook('${book.__backendId}')" class="text-red-600 hover:text-red-800 text-lg md:text-base" title="Hapus">🗑️</button>
            </div>`;

        return `
            <tr class="table-row border-t hover:bg-gray-50 transition-colors">
            <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-mono">${book.bookBarcode || '-'}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-semibold">${book.bookTitle || '-'}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">${book.bookAuthor || '-'}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">${book.bookCategory || '-'}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">${book.bookLocation || '-'}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">${book.bookYear || '-'}</td>
            <td class="px-4 md:px-6 py-3 md:py-4"><span class="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">${book.bookStock || 0}</span></td>
            <td class="px-4 md:px-6 py-3 md:py-4">${actionButtons}</td>
            </tr>
        `;
    }).join('');

    const emptyRow = '<tr><td colspan="8" class="px-4 py-12 text-center text-gray-500">Belum ada data buku. Tambahkan buku pertama Anda!</td></tr>';

    return `
        <div>
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div class="w-full sm:flex-1 max-w-md">
                    <input type="text" placeholder="🔍 Cari barcode, judul, atau penulis..." onkeyup="filterTable(this.value, 'booksTbody')" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow">
                </div>
                ${!isKasir ? `<button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">+ Tambah Buku</button>` : ''}
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-600">
                            <tr>
                                <th class="px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider">Barcode</th>
                                <th class="px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider">Judul Buku</th>
                                <th class="px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider">Penulis</th>
                                <th class="px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider">Kategori</th>
                                <th class="px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider">Lokasi Rak</th>
                                <th class="px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider">Tahun</th>
                                <th class="px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider">Stok</th>
                                <th class="px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="booksTbody">
                            ${tableRows || emptyRow}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// 5. CRUD PLACEHOLDERS (Diperbaiki)
// ==========================================
function editBook(id) {
    showToast(`Fungsi Edit Buku ID: ${id} dijalankan.`);
}

function deleteBook(id) {
    if(confirm('Yakin ingin menghapus buku ini?')) {
        showToast(`Fungsi Hapus Buku ID: ${id} dijalankan.`);
    }
}

// ==========================================
// 6. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Opsional: Masukkan data dummy jika diperlukan untuk testing sebelum SDK Backend siap
    appState.allRecords = [
        { type: 'book', __backendId: 'b1', bookBarcode: 'B001', bookTitle: 'Laskar Pelangi', bookAuthor: 'Andrea Hirata', bookCategory: 'Fiksi', bookLocation: 'Rak A1', bookYear: '2005', bookStock: 5 },
        { type: 'book', __backendId: 'b2', bookBarcode: 'B002', bookTitle: 'Bumi Manusia', bookAuthor: 'Pramoedya Ananta Toer', bookCategory: 'Fiksi Sejarah', bookLocation: 'Rak A2', bookYear: '1980', bookStock: 3 }
    ];

    // Mulai render UI
    renderApp();
});