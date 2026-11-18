// Configuration
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
    currentUser: null,
    currentSection: 'dashboard',
    allRecords: [],
    isLoading: false,
    isSidebarCollapsed: false
};

// ... (Masukkan fungsi-fungsi utilitas lain seperti toggleDesktopSidebar, showToast, dll dari sumber asli di sini) ...

// Section: Books Management (Diperbarui dengan kolom Lokasi Rak)
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
        <tr class="table-row border-t">
        <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-mono">${book.bookBarcode}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-semibold">${book.bookTitle}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">${book.bookAuthor}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">${book.bookCategory}</td>
        
        <!-- KOLOM BARU: Lokasi Rak -->
        <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">${book.bookLocation || '-'}</td>
        
        <td class="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">${book.bookYear}</td>
        <td class="px-4 md:px-6 py-3 md:py-4"><span class="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold" style="background: ${window.elementSdk?.config?.success_color || defaultConfig.success_color}20; color: ${window.elementSdk?.config?.success_color || defaultConfig.success_color};">${book.bookStock}</span></td>
        <td class="px-4 md:px-6 py-3 md:py-4">
            ${actionButtons}
        </td>
        </tr>
    `;
    }).join('');

    const emptyRow = '<tr><td colspan="8" class="px-4 md:px-6 py-8 md:py-12 text-center text-gray-500 text-sm md:text-base">Belum ada data buku. Tambahkan buku pertama Anda!</td></tr>';

    return `
    <div>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 class="text-2xl md:text-3xl font-bold" style="color: ${window.elementSdk?.config?.text_color || defaultConfig.text_color};">Koleksi Buku</h1>
        <div class="w-full sm:flex-1 max-w-md">
            <input type="text" placeholder="🔍 Cari barcode, judul, atau penulis..." onkeyup="filterTable(this.value, 'booksTbody')" class="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
        </div>
        </div>

        <div class="bg-white rounded-xl shadow overflow-hidden">
        <div class="overflow-x-auto table-responsive">
            <table class="w-full">
            <thead style="background: ${window.elementSdk?.config?.secondary_color || defaultConfig.secondary_color};">
                <tr>
                <th class="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold" style="color: ${window.elementSdk?.config?.text_color || defaultConfig.text_color};">Barcode</th>
                <th class="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold" style="color: ${window.elementSdk?.config?.text_color || defaultConfig.text_color};">Judul Buku</th>
                <th class="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold" style="color: ${window.elementSdk?.config?.text_color || defaultConfig.text_color};">Penulis</th>
                <th class="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold" style="color: ${window.elementSdk?.config?.text_color || defaultConfig.text_color};">Kategori</th>
                
                <!-- HEADER KOLOM BARU -->
                <th class="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold" style="color: ${window.elementSdk?.config?.text_color || defaultConfig.text_color};">Lokasi Rak</th>
                
                <th class="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold" style="color: ${window.elementSdk?.config?.text_color || defaultConfig.text_color};">Tahun</th>
                <th class="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold" style="color: ${window.elementSdk?.config?.text_color || defaultConfig.text_color};">Stok</th>
                <th class="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold" style="color: ${window.elementSdk?.config?.text_color || defaultConfig.text_color};">Aksi</th>
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

// Catatan Perbaikan Script yang Terpotong (di bagian paling bawah script index_2.html asli)
async function renameCategory(oldName, btnElement) {
    const newName = document.getElementById('newCategoryNameRename').value.trim();
    if (!newName) return showToast('Masukkan nama kategori baru', 'error');
    if (newName === oldName) return showToast('Nama kategori sama dengan sebelumnya', 'info');

    btnElement.innerHTML = '<div class="loading-spinner mx-auto"></div>';
    btnElement.disabled = true;

    const allBooks = getRecordsByType('book');
    const booksToUpdate = allBooks.filter(b => (b.bookCategory || 'Tidak Berkategori') === oldName);
    
    // (Lanjutkan dengan logika API backend untuk update kategori secara massal)
}

// ... (Lanjutkan seluruh sisa kode JavaScript lainnya di sini)