// JS/buku.js

function renderBooksSection() {
    const books = getRecordsByType('book');

    let rowsHtml = '';
    books.forEach((book, index) => {
        const kodeBuku = book.bookBarcode || book.id || '-';
        const judul = book.bookTitle || book.title || '-';
        const pengarang = book.bookAuthor || book.author || '-';
        const penerbit = book.bookPublisher || book.publisher || '-';
        const tahun = book.bookYear || book.year || '-';
        const kategori = book.bookCategory || book.category || '-';
        const rak = book.bookShelf || book.shelf || '-';
        const stok = book.bookStock !== undefined ? book.bookStock : (book.stock !== undefined ? book.stock : 1);

        const targetId = book.__backendId || kodeBuku;

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 text-center text-gray-500">${index + 1}</td>
                <td class="p-3 font-mono text-xs font-semibold text-blue-700">${kodeBuku}</td>
                <td class="p-3">
                    <div class="font-medium text-gray-800">${judul}</div>
                    <div class="text-xs text-gray-500">${pengarang} • ${penerbit} (${tahun})</div>
                </td>
                <td class="p-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">${kategori}</span>
                </td>
                <td class="p-3 text-center text-gray-600">${rak}</td>
                <td class="p-3 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${Number(stok) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${stok} eks
                    </span>
                </td>
                <td class="p-3 text-center whitespace-nowrap">
                    <button onclick="editBook('${targetId}')" class="text-blue-600 hover:text-blue-800 mx-1 font-medium text-xs bg-blue-50 px-2.5 py-1.5 rounded-lg">Edit</button>
                    <button onclick="deleteBook('${targetId}')" class="text-red-600 hover:text-red-800 mx-1 font-medium text-xs bg-red-50 px-2.5 py-1.5 rounded-lg">Hapus</button>
                </td>
            </tr>
        `;
    });

    if (books.length === 0) {
        rowsHtml = `<tr><td colspan="7" class="p-8 text-center text-gray-500">Belum ada data buku tersimpan.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Data Buku</h2>
                    <p class="text-gray-500 text-sm">Kelola katalog buku, stok eksemplar, dan lokasi rak perpustakaan.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button onclick="showImportBookModal()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                        <i data-lucide="file-up" class="w-4 h-4"></i> Import Excel
                    </button>
                    <button onclick="exportBooksExcel()" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                        <i data-lucide="download" class="w-4 h-4"></i> Export Excel
                    </button>
                    <button onclick="showAddBookModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Buku
                    </button>
                </div>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"></i>
                    <input type="text" onkeyup="filterTable(this.value, 'bookTableBody')" placeholder="Cari judul, pengarang, penerbit, kategori, atau barcode..." class="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th class="p-3 w-14 text-center">No</th>
                                <th class="p-3">Barcode / Kode</th>
                                <th class="p-3">Judul & Detail Buku</th>
                                <th class="p-3">Kategori</th>
                                <th class="p-3 text-center">Rak</th>
                                <th class="p-3 text-center">Stok</th>
                                <th class="p-3 w-36 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="bookTableBody" class="text-sm">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function showAddBookModal() {
    const formHtml = `
        <form onsubmit="saveBook(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Kode / Barcode Buku *</label>
                    <input type="text" id="bookBarcode" required placeholder="Contoh: BK-001" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                    <select id="bookCategory" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                        <option value="">Pilih Kategori...</option>
                        <option value="Pelajaran">Pelajaran</option>
                        <option value="Fiksi">Fiksi</option>
                        <option value="Non-Fiksi">Non-Fiksi</option>
                        <option value="Referensi">Referensi</option>
                        <option value="Agama">Agama</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul Buku *</label>
                <input type="text" id="bookTitle" required placeholder="Contoh: Laskar Pelangi" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Pengarang *</label>
                    <input type="text" id="bookAuthor" required placeholder="Nama pengarang" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
                    <input type="text" id="bookPublisher" placeholder="Nama penerbit" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
                    <input type="number" id="bookYear" placeholder="2024" min="1900" max="2100" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lokasi Rak</label>
                    <input type="text" id="bookShelf" placeholder="Rak A1" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                    <input type="number" id="bookStock" value="1" min="0" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">Simpan Buku</button>
            </div>
        </form>
    `;

    openModal("Tambah Buku Baru", formHtml, "max-w-lg");
}

async function saveBook(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;

    const newBook = {
        bookBarcode: document.getElementById('bookBarcode').value.trim(),
        bookTitle: document.getElementById('bookTitle').value.trim(),
        bookAuthor: document.getElementById('bookAuthor').value.trim(),
        bookPublisher: document.getElementById('bookPublisher').value.trim(),
        bookYear: document.getElementById('bookYear').value.trim(),
        bookCategory: document.getElementById('bookCategory').value,
        bookShelf: document.getElementById('bookShelf').value.trim(),
        bookStock: parseInt(document.getElementById('bookStock').value) || 0,
        type: 'book',
        timestamp: new Date().toISOString()
    };

    const result = await window.dataSdk.sendData('create', newBook);

    if (result && result.success) {
        appState.allRecords.push(newBook);
        closeModal();
        showToast("Buku berhasil disimpan ke Database!", "success");
        renderCurrentSection();
    } else {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        showToast("Gagal menyimpan data buku", "error");
    }
}

function editBook(backendId) {
    const book = appState.allRecords.find(b => b.__backendId === backendId || b.id === backendId || b.bookBarcode === backendId);

    if (!book) {
        showToast("Data buku tidak ditemukan!", "error");
        return;
    }

    const kodeBuku = book.bookBarcode || book.id || '';
    const judul = book.bookTitle || book.title || '';
    const pengarang = book.bookAuthor || book.author || '';
    const penerbit = book.bookPublisher || book.publisher || '';
    const tahun = book.bookYear || book.year || '';
    const kategori = book.bookCategory || book.category || '';
    const rak = book.bookShelf || book.shelf || '';
    const stok = book.bookStock !== undefined ? book.bookStock : (book.stock !== undefined ? book.stock : 1);

    const formHtml = `
        <form onsubmit="processUpdateBook(event, '${book.__backendId || kodeBuku}')" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Kode / Barcode Buku *</label>
                    <input type="text" id="editBookBarcode" value="${kodeBuku}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                    <select id="editBookCategory" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                        <option value="Pelajaran" ${kategori === 'Pelajaran' ? 'selected' : ''}>Pelajaran</option>
                        <option value="Fiksi" ${kategori === 'Fiksi' ? 'selected' : ''}>Fiksi</option>
                        <option value="Non-Fiksi" ${kategori === 'Non-Fiksi' ? 'selected' : ''}>Non-Fiksi</option>
                        <option value="Referensi" ${kategori === 'Referensi' ? 'selected' : ''}>Referensi</option>
                        <option value="Agama" ${kategori === 'Agama' ? 'selected' : ''}>Agama</option>
                        <option value="Lainnya" ${kategori === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul Buku *</label>
                <input type="text" id="editBookTitle" value="${judul}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Pengarang *</label>
                    <input type="text" id="editBookAuthor" value="${pengarang}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
                    <input type="text" id="editBookPublisher" value="${penerbit}" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
                    <input type="number" id="editBookYear" value="${tahun}" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lokasi Rak</label>
                    <input type="text" id="editBookShelf" value="${rak}" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                    <input type="number" id="editBookStock" value="${stok}" min="0" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">Update Buku</button>
            </div>
        </form>
    `;

    openModal("Edit Data Buku", formHtml, "max-w-lg");
}

async function processUpdateBook(event, backendId) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Mengupdate...";
    submitBtn.disabled = true;

    const existingBook = appState.allRecords.find(b => b.__backendId === backendId || b.bookBarcode === backendId) || {};

    const updatedPayload = {
        ...existingBook,
        __backendId: existingBook.__backendId || backendId,
        bookBarcode: document.getElementById('editBookBarcode').value.trim(),
        bookTitle: document.getElementById('editBookTitle').value.trim(),
        bookAuthor: document.getElementById('editBookAuthor').value.trim(),
        bookPublisher: document.getElementById('editBookPublisher').value.trim(),
        bookYear: document.getElementById('editBookYear').value.trim(),
        bookCategory: document.getElementById('editBookCategory').value,
        bookShelf: document.getElementById('editBookShelf').value.trim(),
        bookStock: parseInt(document.getElementById('editBookStock').value) || 0,
        type: 'book'
    };

    const result = await window.dataSdk.sendData('update', updatedPayload);

    if (result && result.success) {
        appState.allRecords = appState.allRecords.map(record =>
            (record.__backendId === backendId || record.bookBarcode === backendId) ? updatedPayload : record
        );

        closeModal();
        showToast("Buku berhasil diupdate!", "success");
        renderCurrentSection();
    } else {
        submitBtn.innerText = "Update Buku";
        submitBtn.disabled = false;
        showToast("Gagal mengupdate buku", "error");
    }
}

async function deleteBook(backendId) {
    if (confirm("Apakah Anda yakin ingin menghapus buku ini dari database?")) {
        const payload = { __backendId: backendId };
        const result = await window.dataSdk.sendData('delete', payload);

        if (result && result.success) {
            appState.allRecords = appState.allRecords.filter(record => record.__backendId !== backendId && record.bookBarcode !== backendId);
            showToast("Buku berhasil dihapus!", "success");
            renderCurrentSection();
        } else {
            showToast("Gagal menghapus buku", "error");
        }
    }
}

// --- FITUR IMPORT & EXPORT EXCEL BUKU ---

function downloadBookTemplate() {
    const sample = [
        {
            Barcode: "BK-001",
            Judul: "Laskar Pelangi",
            Pengarang: "Andrea Hirata",
            Penerbit: "Bentang Pustaka",
            Tahun: 2005,
            Kategori: "Fiksi",
            Rak: "A1",
            Stok: 5
        }
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Buku");
    XLSX.writeFile(wb, "Template_Import_Buku.xlsx");
}

function showImportBookModal() {
    const formHtml = `
        <div class="space-y-4">
            <div class="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs leading-relaxed">
                Pastikan file Excel memiliki kolom: <strong>Barcode, Judul, Pengarang, Penerbit, Tahun, Kategori, Rak, Stok</strong>.
                <button type="button" onclick="downloadBookTemplate()" class="underline font-semibold ml-1 text-blue-700 hover:text-blue-900">
                    Download Template Excel
                </button>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pilih File Excel (.xlsx / .xls)</label>
                <input type="file" id="importBookFile" accept=".xlsx, .xls" class="w-full p-2 border rounded-xl text-sm">
            </div>
            <div id="importBookProgress" class="hidden text-xs text-gray-600 font-medium"></div>
            <div class="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium">Batal</button>
                <button type="button" id="btnProcessImportBook" onclick="processImportBooks()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">Mulai Import</button>
            </div>
        </div>
    `;
    openModal("Import Data Buku dari Excel", formHtml);
}

async function processImportBooks() {
    const fileInput = document.getElementById('importBookFile');
    const progressEl = document.getElementById('importBookProgress');
    const btn = document.getElementById('btnProcessImportBook');

    if (!fileInput || !fileInput.files.length) {
        showToast("Pilih file Excel terlebih dahulu!", "error");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Memproses...";
    progressEl.classList.remove('hidden');
    progressEl.innerText = "Membaca file Excel...";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);

            if (rows.length === 0) {
                showToast("File Excel kosong!", "error");
                btn.disabled = false;
                btn.innerText = "Mulai Import";
                return;
            }

            let successCount = 0;
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                progressEl.innerText = `Mengunggah data ${i + 1} dari ${rows.length}...`;

                const newBook = {
                    bookBarcode: String(row.Barcode || row.Kode || row.bookBarcode || ('BK-' + Date.now() + '-' + i)),
                    bookTitle: String(row.Judul || row.Title || row.bookTitle || 'Tanpa Judul'),
                    bookAuthor: String(row.Pengarang || row.Author || row.bookAuthor || '-'),
                    bookPublisher: String(row.Penerbit || row.Publisher || row.bookPublisher || '-'),
                    bookYear: String(row.Tahun || row.Year || row.bookYear || ''),
                    bookCategory: String(row.Kategori || row.Category || row.bookCategory || 'Lainnya'),
                    bookShelf: String(row.Rak || row.Shelf || row.bookShelf || '-'),
                    bookStock: Number(row.Stok || row.Stock || row.bookStock || 1),
                    type: 'book',
                    timestamp: new Date().toISOString()
                };

                const res = await window.dataSdk.sendData('create', newBook);
                if (res && res.success) {
                    appState.allRecords.push(newBook);
                    successCount++;
                }
            }

            closeModal();
            showToast(`Berhasil mengimpor ${successCount} dari ${rows.length} buku!`, "success");
            renderCurrentSection();
        } catch (err) {
            console.error(err);
            showToast("Gagal membaca format file Excel.", "error");
            btn.disabled = false;
            btn.innerText = "Mulai Import";
        }
    };

    reader.readAsArrayBuffer(file);
}

function exportBooksExcel() {
    const books = getRecordsByType('book');
    if (books.length === 0) {
        showToast("Tidak ada data buku untuk diexport", "error");
        return;
    }

    const cleanData = books.map((b, i) => ({
        "No": i + 1,
        "Barcode": b.bookBarcode || b.id || '-',
        "Judul": b.bookTitle || b.title || '-',
        "Pengarang": b.bookAuthor || b.author || '-',
        "Penerbit": b.bookPublisher || b.publisher || '-',
        "Tahun": b.bookYear || b.year || '-',
        "Kategori": b.bookCategory || b.category || '-',
        "Rak": b.bookShelf || b.shelf || '-',
        "Stok": b.bookStock !== undefined ? b.bookStock : 1
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Buku");
    XLSX.writeFile(wb, "Katalog_Buku_Perpustakaan.xlsx");
    showToast("Data buku berhasil diexport!", "success");
}