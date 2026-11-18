// JS/katalog_perpusnas.js

// Standar 10 Kelas Utama Klasifikasi Perpusnas (Dewey Decimal Classification / DDC)
const PERPUSNAS_DDC_CLASSES = [
    {
        code: '000',
        name: 'Karya Umum, Komputer & Informasi',
        short: '000 - Karya Umum',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        keywords: ['komputer', 'informatika', 'koding', 'pemrograman', 'ensiklopedia', 'jurnal', 'perpustakaan', 'data', 'internet', 'tik']
    },
    {
        code: '100',
        name: 'Filsafat & Psikologi',
        short: '100 - Filsafat & Psikologi',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        keywords: ['filsafat', 'psikologi', 'etika', 'logika', 'kepribadian', 'motivasi', 'bimbingan konseling', 'bk']
    },
    {
        code: '200',
        name: 'Agama',
        short: '200 - Agama',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        keywords: ['agama', 'islam', 'pai', 'quran', 'hadits', 'fiqih', 'akidah', 'akhlak', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu']
    },
    {
        code: '300',
        name: 'Ilmu-Ilmu Sosial',
        short: '300 - Ilmu Sosial',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        keywords: ['ekonomi', 'sosiologi', 'pkn', 'pancasila', 'kewarganegaraan', 'hukum', 'politik', 'pendidikan', 'akuntansi', 'perdagangan', 'sosial']
    },
    {
        code: '400',
        name: 'Bahasa',
        short: '400 - Bahasa',
        color: 'bg-sky-100 text-sky-700 border-sky-200',
        keywords: ['bahasa', 'indonesia', 'inggris', 'arab', 'jepang', 'jerman', 'kamus', 'tata bahasa', 'linguistik', 'english']
    },
    {
        code: '500',
        name: 'Ilmu-Ilmu Murni (Matematika & IPA)',
        short: '500 - Sains & Matematika',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        keywords: ['matematika', 'fisika', 'kimia', 'biologi', 'ipa', 'sains', 'astronomi', 'geologi', 'aljabar', 'geometri', 'statistika']
    },
    {
        code: '600',
        name: 'Ilmu-Ilmu Terapan & Teknologi',
        short: '600 - Teknologi & Terapan',
        color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        keywords: ['teknologi', 'pertanian', 'kesehatan', 'kedokteran', 'teknik', 'rekayasa', 'manajemen', 'bisnis', 'tata boga', 'otomotif', 'pjok', 'penjas']
    },
    {
        code: '700',
        name: 'Kesenian, Hiburan & Olahraga',
        short: '700 - Seni & Olahraga',
        color: 'bg-pink-100 text-pink-700 border-pink-200',
        keywords: ['seni', 'budaya', 'musik', 'lukis', 'tari', 'teater', 'desain', 'fotografi', 'olahraga', 'prakarya', 'kriya']
    },
    {
        code: '800',
        name: 'Kesusastraan & Fiksi',
        short: '800 - Sastra & Fiksi',
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        keywords: ['fiksi', 'novel', 'cerpen', 'puisi', 'sastra', 'drama', 'antologi', 'dongeng', 'roman', 'laskar']
    },
    {
        code: '900',
        name: 'Geografi & Sejarah',
        short: '900 - Geografi & Sejarah',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        keywords: ['sejarah', 'geografi', 'atlas', 'peta', 'biografi', 'pahlawan', 'ips', 'peradaban', 'wisata']
    }
];

let selectedDdcFilter = 'ALL';

// Deteksi Kelas DDC otomatis jika buku belum diberi nomor DDC manual
function resolveBookDdc(book) {
    if (book.bookDdcCode) {
        const prefix = String(book.bookDdcCode).trim().substring(0, 1) + '00';
        const found = PERPUSNAS_DDC_CLASSES.find(c => c.code === prefix) || PERPUSNAS_DDC_CLASSES[0];
        return {
            ddcCode: String(book.bookDdcCode).trim(),
            ddcClass: found
        };
    }

    const searchBlob = `${book.bookCategory || book.category || ''} ${book.bookTitle || book.title || ''}`.toLowerCase();
    for (const cls of PERPUSNAS_DDC_CLASSES) {
        if (cls.keywords.some(kw => searchBlob.includes(kw))) {
            return {
                ddcCode: cls.code,
                ddcClass: cls
            };
        }
    }

    return {
        ddcCode: '000',
        ddcClass: PERPUSNAS_DDC_CLASSES[0]
    };
}

// Bangun Nomor Panggil (Call Number) Standar Perpusnas:
// Baris 1: Nomor Klasifikasi DDC (mis. 510 / 813)
// Baris 2: 3 huruf kapital pertama nama pengarang (mis. AND)
// Baris 3: 1 huruf kecil pertama judul buku (mis. l)
function buildPerpusnasCallNumber(book, ddcCode) {
    if (book.bookCallNumber && String(book.bookCallNumber).trim()) {
        return String(book.bookCallNumber).trim();
    }

    const authorRaw = String(book.bookAuthor || book.author || 'ANO').replace(/[^a-zA-Z]/g, '');
    const authorCode = (authorRaw.substring(0, 3) || 'ANO').toUpperCase();

    const titleRaw = String(book.bookTitle || book.title || 'a').replace(/[^a-zA-Z]/g, '');
    const titleCode = (titleRaw.substring(0, 1) || 'a').toLowerCase();

    return `${ddcCode} / ${authorCode} / ${titleCode}`;
}

function renderCatalogPerpusnasSection() {
    const books = getRecordsByType('book');

    // Hitung jumlah judul & eksemplar per kelas DDC (000 - 900)
    const classCounts = {};
    PERPUSNAS_DDC_CLASSES.forEach(c => {
        classCounts[c.code] = { titles: 0, copies: 0 };
    });

    const enrichedBooks = books.map(book => {
        const { ddcCode, ddcClass } = resolveBookDdc(book);
        const callNumber = buildPerpusnasCallNumber(book, ddcCode);
        const stock = book.bookStock !== undefined ? Number(book.bookStock) : 1;

        if (classCounts[ddcClass.code]) {
            classCounts[ddcClass.code].titles += 1;
            classCounts[ddcClass.code].copies += stock;
        }

        return {
            ...book,
            _ddcCode: ddcCode,
            _ddcClass: ddcClass,
            _callNumber: callNumber,
            _stock: stock
        };
    });

    const filteredBooks = selectedDdcFilter === 'ALL'
        ? enrichedBooks
        : enrichedBooks.filter(b => b._ddcClass.code === selectedDdcFilter);

    // Kartu Grid 10 Kelas DDC Perpusnas
    const ddcCardsHtml = PERPUSNAS_DDC_CLASSES.map(cls => {
        const stat = classCounts[cls.code];
        const isActive = selectedDdcFilter === cls.code;
        return `
            <button type="button" onclick="filterCatalogByDdc('${cls.code}')"
                class="text-left p-3.5 rounded-xl border transition-all ${isActive ? 'ring-2 ring-blue-600 bg-blue-50/60 border-blue-400' : 'bg-white hover:bg-gray-50 border-gray-200'}">
                <div class="flex items-center justify-between gap-1">
                    <span class="px-2 py-0.5 rounded-md text-xs font-bold border ${cls.color}">${cls.code}</span>
                    <span class="text-xs font-bold text-gray-700">${stat.titles} jdl</span>
                </div>
                <p class="text-xs font-semibold text-gray-800 mt-2 line-clamp-1" title="${cls.name}">${cls.name}</p>
                <p class="text-[11px] text-gray-400 mt-0.5">${stat.copies} eksemplar</p>
            </button>
        `;
    }).join('');

    let rowsHtml = '';
    filteredBooks.forEach((book, idx) => {
        const kodeBuku = book.bookBarcode || book.id || '-';
        const judul = book.bookTitle || book.title || '-';
        const pengarang = book.bookAuthor || book.author || '-';
        const penerbit = book.bookPublisher || book.publisher || '-';
        const tahun = book.bookYear || book.year || '-';
        const rak = book.bookShelf || book.shelf || '-';
        const targetId = book.__backendId || kodeBuku;

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 text-center text-gray-500">${idx + 1}</td>
                <td class="p-3 whitespace-nowrap">
                    <div class="inline-block px-2.5 py-1 rounded-lg bg-slate-800 text-white font-mono text-xs font-bold tracking-wide">
                        ${book._callNumber}
                    </div>
                    <div class="text-[11px] text-gray-400 font-mono mt-1">Barcode: ${kodeBuku}</div>
                </td>
                <td class="p-3">
                    <div class="font-semibold text-gray-800">${judul}</div>
                    <div class="text-xs text-gray-500">${pengarang} &bull; ${penerbit} (${tahun})</div>
                </td>
                <td class="p-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${book._ddcClass.color}">
                        ${book._ddcClass.short}
                    </span>
                </td>
                <td class="p-3 text-center text-gray-600 font-medium">${rak}</td>
                <td class="p-3 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${book._stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">
                        ${book._stock} eks
                    </span>
                </td>
                <td class="p-3 text-center whitespace-nowrap">
                    <div class="inline-flex items-center gap-1.5">
                        <button type="button" onclick="showEditCatalogDdcModal('${targetId}')"
                            class="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors">
                            Atur DDC
                        </button>
                        <button type="button" onclick="printSingleBookSpineLabel('${targetId}')"
                            class="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition-colors">
                            Label Punggung
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    if (filteredBooks.length === 0) {
        rowsHtml = `<tr><td colspan="7" class="p-8 text-center text-gray-500">Tidak ada koleksi buku pada kelas klasifikasi DDC ini.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Katalog Standar Perpusnas (DDC)</h2>
                    <p class="text-gray-500 text-sm">Pengelompokan 10 kelas utama Dewey Decimal Classification (000–900) & nomor panggil buku.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" onclick="showPerpusnasDdcGuideModal()"
                        class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors">
                        📖 Pedoman DDC Perpusnas
                    </button>
                    <button type="button" onclick="printAllSpineLabels()"
                        class="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors">
                        <i data-lucide="tag" class="w-4 h-4"></i> Cetak Semua Label Punggung
                    </button>
                    <button type="button" onclick="exportPerpusnasCatalogExcel()"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors">
                        <i data-lucide="download" class="w-4 h-4"></i> Export Katalog DDC
                    </button>
                </div>
            </div>

            <!-- Filter 10 Kelas DDC Perpusnas -->
            <div class="space-y-2.5">
                <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500">Klasifikasi 10 Kelas Utama Perpusnas</h3>
                    ${selectedDdcFilter !== 'ALL'
                        ? `<button type="button" onclick="filterCatalogByDdc('ALL')" class="text-xs font-semibold text-blue-600 hover:underline">Tampilkan Semua Kelas (${books.length})</button>`
                        : `<span class="text-xs text-gray-400">Klik kartu kelas untuk menyaring buku</span>`}
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    ${ddcCardsHtml}
                </div>
            </div>

            <!-- Pencarian Katalog -->
            <div class="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                <div class="relative">
                    <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-3 text-gray-400"></i>
                    <input type="text" onkeyup="filterTable(this.value, 'catalogPerpusnasTableBody')"
                        placeholder="Cari nomor panggil, nomor DDC, judul buku, pengarang, atau rak..."
                        class="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <!-- Tabel Katalog Standar Perpusnas -->
            <div class="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th class="p-3 w-12 text-center">No</th>
                                <th class="p-3">Nomor Panggil (Call Number)</th>
                                <th class="p-3">Deskripsi Bibliografi Buku</th>
                                <th class="p-3">Kelas DDC Perpusnas</th>
                                <th class="p-3 text-center">Lokasi Rak</th>
                                <th class="p-3 text-center">Stok</th>
                                <th class="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="catalogPerpusnasTableBody" class="text-sm">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function filterCatalogByDdc(code) {
    selectedDdcFilter = (selectedDdcFilter === code) ? 'ALL' : code;
    renderCurrentSection();
}

function showPerpusnasDdcGuideModal() {
    const listHtml = PERPUSNAS_DDC_CLASSES.map(c => `
        <div class="p-2.5 rounded-xl border ${c.color} flex items-start gap-3">
            <span class="font-mono font-bold text-sm px-2 py-0.5 bg-white/80 rounded-md">${c.code}</span>
            <div>
                <p class="font-bold text-xs">${c.name}</p>
                <p class="text-[11px] opacity-80 mt-0.5">Cakupan: ${c.keywords.slice(0, 6).join(', ')}</p>
            </div>
        </div>
    `).join('');

    const html = `
        <div class="space-y-4">
            <div class="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>Aturan Nomor Panggil Standar Perpusnas:</strong><br>
                1. <strong>Nomor Klasifikasi DDC</strong> (3 digit utama/spesifik, misal <code>510</code> untuk Matematika atau <code>813</code> untuk Fiksi Indonesia)<br>
                2. <strong>3 Huruf Pertama Nama Pengarang</strong> (huruf kapital, misal <code>AND</code> untuk Andrea Hirata)<br>
                3. <strong>1 Huruf Pertama Judul Buku</strong> (huruf kecil, misal <code>l</code> untuk Laskar Pelangi)
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                ${listHtml}
            </div>
            <div class="pt-3 border-t flex justify-end">
                <button type="button" onclick="closeModal()" class="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">Tutup</button>
            </div>
        </div>
    `;
    openModal("Pedoman Klasifikasi & Katalog Standar Perpusnas", html, "max-w-2xl");
}

function showEditCatalogDdcModal(backendId) {
    const book = appState.allRecords.find(b => b.type === 'book' && (b.__backendId === backendId || b.id === backendId || b.bookBarcode === backendId));
    if (!book) {
        showToast("Data buku tidak ditemukan!", "error");
        return;
    }

    const { ddcCode, ddcClass } = resolveBookDdc(book);
    const callNumber = buildPerpusnasCallNumber(book, ddcCode);

    const optionsHtml = PERPUSNAS_DDC_CLASSES.map(c =>
        `<option value="${c.code}" ${c.code === ddcClass.code ? 'selected' : ''}>${c.code} - ${c.name}</option>`
    ).join('');

    const formHtml = `
        <form onsubmit="saveCatalogDdcClassification(event, '${backendId}')" class="space-y-4">
            <div class="p-3 bg-gray-50 border rounded-xl text-xs">
                <p class="font-bold text-gray-800">${book.bookTitle || book.title || '-'}</p>
                <p class="text-gray-500 mt-0.5">Pengarang: ${book.bookAuthor || book.author || '-'}</p>
            </div>

            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Kelas Utama Perpusnas (000–900)</label>
                <select id="ddcMainClassSelect" onchange="document.getElementById('ddcSpecificCodeInput').value = this.value"
                    class="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    ${optionsHtml}
                </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Nomor DDC Spesifik *</label>
                    <input type="text" id="ddcSpecificCodeInput" value="${ddcCode}" required placeholder="Contoh: 510 atau 297.1"
                        class="w-full px-3 py-2.5 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Lokasi Rak</label>
                    <input type="text" id="ddcShelfInput" value="${book.bookShelf || book.shelf || ''}" placeholder="Contoh: Rak 500-A"
                        class="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Nomor Panggil (Call Number) Standar</label>
                <input type="text" id="ddcCallNumberInput" value="${callNumber}" required
                    class="w-full px-3 py-2.5 border rounded-xl font-mono text-sm bg-blue-50/40 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <p class="text-[11px] text-gray-400 mt-1">Format: Nomor DDC / 3 Huruf Pengarang / 1 Huruf Judul</p>
            </div>

            <div class="pt-3 border-t flex justify-end gap-2">
                <button type="button" onclick="closeModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">Simpan Klasifikasi</button>
            </div>
        </form>
    `;

    openModal("Atur Klasifikasi DDC Perpusnas", formHtml, "max-w-md");
}

async function saveCatalogDdcClassification(event, backendId) {
    event.preventDefault();
    const book = appState.allRecords.find(b => b.type === 'book' && (b.__backendId === backendId || b.id === backendId || b.bookBarcode === backendId));
    if (!book) return;

    const ddcCode = document.getElementById('ddcSpecificCodeInput').value.trim();
    const shelf = document.getElementById('ddcShelfInput').value.trim();
    const callNumber = document.getElementById('ddcCallNumberInput').value.trim();
    const prefix = ddcCode.substring(0, 1) + '00';
    const matchedClass = PERPUSNAS_DDC_CLASSES.find(c => c.code === prefix);

    const updatedBook = {
        ...book,
        bookDdcCode: ddcCode,
        bookCallNumber: callNumber,
        bookShelf: shelf || book.bookShelf,
        bookCategory: matchedClass ? matchedClass.short : (book.bookCategory || 'Umum')
    };

    closeModal();
    if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
        await window.dataSdk.sendData('update', updatedBook);
    }

    appState.allRecords = appState.allRecords.map(r => (r === book ? updatedBook : r));
    showToast("Klasifikasi DDC & Nomor Panggil berhasil disimpan!", "success");
    renderCurrentSection();
}

function printSingleBookSpineLabel(backendId) {
    const book = appState.allRecords.find(b => b.type === 'book' && (b.__backendId === backendId || b.id === backendId || b.bookBarcode === backendId));
    if (!book) return;
    openSpineLabelPrintWindow([book]);
}

function printAllSpineLabels() {
    const books = getRecordsByType('book');
    if (books.length === 0) {
        showToast("Belum ada data buku untuk dicetak labelnya.", "error");
        return;
    }
    openSpineLabelPrintWindow(books);
}

function openSpineLabelPrintWindow(bookList) {
    const libName = defaultConfig.libraryName || 'PERPUSTAKAAN SEKOLAH';
    const labelsHtml = bookList.map(book => {
        const { ddcCode } = resolveBookDdc(book);
        const callNumber = buildPerpusnasCallNumber(book, ddcCode);
        const parts = callNumber.split('/').map(s => s.trim());
        const kodeBuku = book.bookBarcode || book.id || '-';
        const judul = book.bookTitle || book.title || '-';

        return `
            <div class="label-box">
                <div class="lib-head">${libName}</div>
                <div class="call-line"><strong>${parts[0] || ddcCode}</strong></div>
                <div class="call-line">${parts[1] || 'ANO'}</div>
                <div class="call-line">${parts[2] || 'a'}</div>
                <div class="book-meta">${kodeBuku} &bull; ${judul.substring(0, 26)}</div>
            </div>
        `;
    }).join('');

    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Label Punggung Buku - Standar Perpusnas</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 16px; }
                .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                .label-box { border: 1.5px solid #1e293b; border-radius: 6px; padding: 8px; text-align: center; page-break-inside: avoid; }
                .lib-head { font-size: 9px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px; color: #0f172a; }
                .call-line { font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.35; color: #0f172a; }
                .book-meta { font-size: 8px; color: #64748b; margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 4px; }
            </style>
        </head>
        <body>
            <div class="grid">${labelsHtml}</div>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
    `);
    win.document.close();
}

function exportPerpusnasCatalogExcel() {
    const books = getRecordsByType('book');
    if (books.length === 0) {
        showToast("Tidak ada data katalog untuk diexport.", "error");
        return;
    }

    const rows = books.map((b, i) => {
        const { ddcCode, ddcClass } = resolveBookDdc(b);
        return {
            'No': i + 1,
            'Nomor Panggil': buildPerpusnasCallNumber(b, ddcCode),
            'Kode DDC': ddcCode,
            'Kelas Utama Perpusnas': ddcClass.short,
            'Barcode': b.bookBarcode || b.id || '-',
            'Judul Buku': b.bookTitle || b.title || '-',
            'Pengarang': b.bookAuthor || b.author || '-',
            'Penerbit': b.bookPublisher || b.publisher || '-',
            'Tahun': b.bookYear || b.year || '-',
            'Lokasi Rak': b.bookShelf || b.shelf || '-',
            'Stok': b.bookStock !== undefined ? Number(b.bookStock) : 1
        };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Katalog Standar Perpusnas");
    XLSX.writeFile(wb, "Katalog_Standar_Perpusnas_DDC.xlsx");
    showToast("Katalog Standar Perpusnas berhasil diexport!", "success");
}