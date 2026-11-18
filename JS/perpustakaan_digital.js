// JS/perpustakaan_digital.js

let selectedDigitalDdcFilter = 'ALL';

// Ambil daftar kelas DDC Perpusnas (menggunakan konstanta dari JS/katalog_perpusnas.js jika sudah dimuat)
function getDigitalDdcClasses() {
    if (typeof PERPUSNAS_DDC_CLASSES !== 'undefined') {
        return PERPUSNAS_DDC_CLASSES;
    }
    return [
        { code: '000', name: 'Karya Umum, Komputer & Informasi', short: '000 - Karya Umum', color: 'bg-slate-100 text-slate-700 border-slate-200' },
        { code: '100', name: 'Filsafat & Psikologi', short: '100 - Filsafat & Psikologi', color: 'bg-purple-100 text-purple-700 border-purple-200' },
        { code: '200', name: 'Agama', short: '200 - Agama', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        { code: '300', name: 'Ilmu-Ilmu Sosial', short: '300 - Ilmu Sosial', color: 'bg-amber-100 text-amber-800 border-amber-200' },
        { code: '400', name: 'Bahasa', short: '400 - Bahasa', color: 'bg-sky-100 text-sky-700 border-sky-200' },
        { code: '500', name: 'Ilmu-Ilmu Murni (Matematika & IPA)', short: '500 - Sains & Matematika', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        { code: '600', name: 'Ilmu-Ilmu Terapan & Teknologi', short: '600 - Teknologi & Terapan', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
        { code: '700', name: 'Kesenian, Hiburan & Olahraga', short: '700 - Seni & Olahraga', color: 'bg-pink-100 text-pink-700 border-pink-200' },
        { code: '800', name: 'Kesusastraan & Fiksi', short: '800 - Sastra & Fiksi', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        { code: '900', name: 'Geografi & Sejarah', short: '900 - Geografi & Sejarah', color: 'bg-orange-100 text-orange-800 border-orange-200' }
    ];
}

function getDigitalBookDdcInfo(ebook) {
    const classes = getDigitalDdcClasses();
    const rawCode = String(ebook.ebookDdcCode || ebook.bookDdcCode || '000').trim();
    const prefix = rawCode.substring(0, 1) + '00';
    const matchedClass = classes.find(c => c.code === prefix) || classes[0];
    return {
        ddcCode: rawCode,
        ddcClass: matchedClass
    };
}

// Konversi otomatis link Google Drive /view menjadi /preview agar bisa dibaca langsung di dalam aplikasi
function formatDigitalPreviewUrl(rawUrl) {
    const url = String(rawUrl || '').trim();
    if (!url) return '';
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    return url;
}

function renderDigitalLibrarySection() {
    const ebooks = getRecordsByType('ebook');
    const classes = getDigitalDdcClasses();

    const enrichedEbooks = ebooks.map(eb => {
        const info = getDigitalBookDdcInfo(eb);
        return {
            ...eb,
            _ddcCode: info.ddcCode,
            _ddcClass: info.ddcClass
        };
    });

    const filteredEbooks = selectedDigitalDdcFilter === 'ALL'
        ? enrichedEbooks
        : enrichedEbooks.filter(e => e._ddcClass.code === selectedDigitalDdcFilter);

    // Filter Pill 10 Kelas DDC Perpusnas
    const ddcFilterButtonsHtml = [
        `<button type="button" onclick="filterDigitalLibraryByDdc('ALL')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedDigitalDdcFilter === 'ALL' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}">
            Semua (${ebooks.length})
        </button>`,
        ...classes.map(cls => {
            const count = enrichedEbooks.filter(e => e._ddcClass.code === cls.code).length;
            const active = selectedDigitalDdcFilter === cls.code;
            return `
                <button type="button" onclick="filterDigitalLibraryByDdc('${cls.code}')"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${active ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}">
                    ${cls.code} (${count})
                </button>
            `;
        })
    ].join('');

    // Kartu Grid Koleksi E-Book Digital
    let cardsHtml = '';
    filteredEbooks.forEach((eb, idx) => {
        const targetId = eb.__backendId || eb.id || `eb_${idx}`;
        const judul = eb.ebookTitle || eb.title || 'Tanpa Judul';
        const pengarang = eb.ebookAuthor || eb.author || '-';
        const penerbit = eb.ebookPublisher || eb.publisher || '-';
        const tahun = eb.ebookYear || eb.year || '-';
        const formatFile = eb.ebookFormat || 'PDF / E-Book';
        const readCount = Number(eb.ebookReadCount || 0);
        const coverUrl = eb.ebookCoverUrl || '';

        const coverBanner = coverUrl
            ? `<img src="${coverUrl}" alt="${judul}" class="w-full h-40 object-cover rounded-xl border border-gray-100">`
            : `<div class="w-full h-40 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 p-4 flex flex-col justify-between text-white">
                   <div class="flex items-center justify-between">
                       <span class="px-2 py-0.5 rounded-md bg-white/20 font-mono text-xs font-bold">DDC ${eb._ddcCode}</span>
                       <span class="text-[11px] bg-black/25 px-2 py-0.5 rounded-md">${formatFile}</span>
                   </div>
                   <p class="font-bold text-sm line-clamp-2 leading-snug">${judul}</p>
               </div>`;

        cardsHtml += `
            <div class="digital-book-card bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between gap-3"
                data-search="${(judul + ' ' + pengarang + ' ' + eb._ddcClass.short + ' ' + eb._ddcCode).toLowerCase()}">
                <div class="space-y-3">
                    ${coverBanner}
                    <div class="space-y-1">
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${eb._ddcClass.color}">
                            ${eb._ddcClass.short}
                        </span>
                        <h4 class="font-bold text-gray-800 text-sm line-clamp-2 leading-snug" title="${judul}">${judul}</h4>
                        <p class="text-xs text-gray-500">${pengarang} &bull; ${penerbit} (${tahun})</p>
                    </div>
                </div>

                <div class="pt-3 border-t border-gray-100 space-y-2">
                    <div class="flex items-center justify-between text-[11px] text-gray-400">
                        <span>Kode DDC: <strong class="text-gray-600 font-mono">${eb._ddcCode}</strong></span>
                        <span>Dibaca: <strong class="text-blue-600">${readCount}x</strong></span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="openDigitalBookReader('${targetId}')"
                            class="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
                            📖 Baca E-Book
                        </button>
                        <button type="button" onclick="showEditDigitalBookModal('${targetId}')" title="Edit E-Book"
                            class="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                            <i data-lucide="pencil" class="w-4 h-4"></i>
                        </button>
                        <button type="button" onclick="deleteDigitalBook('${targetId}')" title="Hapus E-Book"
                            class="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    if (filteredEbooks.length === 0) {
        cardsHtml = `
            <div class="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-2">
                <p class="text-gray-600 font-semibold text-sm">Belum ada koleksi buku digital pada kategori DDC ini.</p>
                <p class="text-xs text-gray-400">Klik tombol "+ Tambah Buku Digital" untuk menambahkan tautan PDF / Google Drive / Flipbook.</p>
            </div>
        `;
    }

    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Perpustakaan Digital (E-Book)</h2>
                    <p class="text-gray-500 text-sm">Koleksi buku elektronik terklasifikasi sesuai 10 kelas standar Perpusnas (DDC 000–900).</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" onclick="exportDigitalBooksExcel()"
                        class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs transition-colors">
                        <i data-lucide="download" class="w-4 h-4"></i> Export E-Book
                    </button>
                    <button type="button" onclick="showAddDigitalBookModal()"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors">
                        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Buku Digital
                    </button>
                </div>
            </div>

            <!-- Filter Kategori DDC Perpusnas -->
            <div class="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 space-y-3">
                <div class="flex flex-wrap gap-1.5">
                    ${ddcFilterButtonsHtml}
                </div>
                <div class="relative">
                    <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-3 text-gray-400"></i>
                    <input type="text" onkeyup="filterDigitalBookCards(this.value)"
                        placeholder="Cari judul e-book, pengarang, atau nomor DDC Perpusnas..."
                        class="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <!-- Grid Rak Buku Digital -->
            <div id="digitalBooksGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                ${cardsHtml}
            </div>
        </div>
    `;
}

function filterDigitalLibraryByDdc(code) {
    selectedDigitalDdcFilter = code;
    renderCurrentSection();
}

function filterDigitalBookCards(keyword) {
    const term = String(keyword || '').trim().toLowerCase();
    document.querySelectorAll('.digital-book-card').forEach(card => {
        const text = card.getAttribute('data-search') || '';
        card.style.display = text.includes(term) ? '' : 'none';
    });
}

function showAddDigitalBookModal() {
    const classes = getDigitalDdcClasses();
    const ddcOptions = classes.map(c =>
        `<option value="${c.code}">${c.code} - ${c.name}</option>`
    ).join('');

    const formHtml = `
        <form onsubmit="saveDigitalBook(event)" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Kelas Utama Perpusnas (DDC) *</label>
                    <select id="ebookDdcMain" onchange="document.getElementById('ebookDdcCode').value = this.value" required
                        class="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        ${ddcOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Nomor DDC Spesifik *</label>
                    <input type="text" id="ebookDdcCode" value="000" required placeholder="Contoh: 510 atau 813"
                        class="w-full p-2.5 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Judul Buku Digital *</label>
                <input type="text" id="ebookTitle" required placeholder="Contoh: Modul Matematika Kelas X"
                    class="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Pengarang *</label>
                    <input type="text" id="ebookAuthor" required placeholder="Nama pengarang"
                        class="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Penerbit & Tahun</label>
                    <div class="flex gap-2">
                        <input type="text" id="ebookPublisher" placeholder="Penerbit"
                            class="w-2/3 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <input type="number" id="ebookYear" placeholder="2026"
                            class="w-1/3 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Link File E-Book (Google Drive / PDF / Flipbook) *</label>
                <input type="url" id="ebookFileUrl" required placeholder="https://drive.google.com/file/d/..."
                    class="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <p class="text-[11px] text-gray-400 mt-1">Pastikan akses link Google Drive disetel ke "Siapa saja yang memiliki link"</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Format Digital</label>
                    <select id="ebookFormat" class="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="PDF">PDF</option>
                        <option value="Flipbook">Flipbook Interaktif</option>
                        <option value="EPUB">EPUB</option>
                        <option value="Modul Web">Modul Web / Video</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">URL Gambar Sampul (Opsional)</label>
                    <input type="url" id="ebookCoverUrl" placeholder="https://..."
                        class="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <div class="pt-3 border-t flex justify-end gap-2">
                <button type="button" onclick="closeModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">Simpan E-Book</button>
            </div>
        </form>
    `;

    openModal("Tambah Koleksi Buku Digital (Standar Perpusnas)", formHtml, "max-w-lg");
}

async function saveDigitalBook(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    const ddcCode = document.getElementById('ebookDdcCode').value.trim();
    const classes = getDigitalDdcClasses();
    const prefix = ddcCode.substring(0, 1) + '00';
    const matchedClass = classes.find(c => c.code === prefix) || classes[0];

    const newEbook = {
        type: 'ebook',
        ebookDdcCode: ddcCode,
        ebookCategory: matchedClass.short,
        ebookTitle: document.getElementById('ebookTitle').value.trim(),
        ebookAuthor: document.getElementById('ebookAuthor').value.trim(),
        ebookPublisher: document.getElementById('ebookPublisher').value.trim(),
        ebookYear: document.getElementById('ebookYear').value.trim(),
        ebookFileUrl: document.getElementById('ebookFileUrl').value.trim(),
        ebookFormat: document.getElementById('ebookFormat').value,
        ebookCoverUrl: document.getElementById('ebookCoverUrl').value.trim(),
        ebookReadCount: 0,
        timestamp: new Date().toISOString()
    };

    const res = await window.dataSdk.sendData('create', newEbook);
    if (res && res.success) {
        if (res.__backendId) newEbook.__backendId = res.__backendId;
        if (res.id) newEbook.id = res.id;
        appState.allRecords.push(newEbook);
        closeModal();
        showToast("Koleksi buku digital berhasil ditambahkan!", "success");
        renderCurrentSection();
    } else {
        btn.disabled = false;
        btn.innerText = "Simpan E-Book";
        showToast("Gagal menyimpan buku digital", "error");
    }
}

function showEditDigitalBookModal(backendId) {
    const eb = appState.allRecords.find(r => r.type === 'ebook' && (r.__backendId === backendId || r.id === backendId));
    if (!eb) return;

    const classes = getDigitalDdcClasses();
    const info = getDigitalBookDdcInfo(eb);
    const ddcOptions = classes.map(c =>
        `<option value="${c.code}" ${c.code === info.ddcClass.code ? 'selected' : ''}>${c.code} - ${c.name}</option>`
    ).join('');

    const formHtml = `
        <form onsubmit="updateDigitalBook(event, '${backendId}')" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Kelas Utama Perpusnas (DDC)</label>
                    <select onchange="document.getElementById('editEbookDdcCode').value = this.value"
                        class="w-full p-2.5 border rounded-xl text-sm">
                        ${ddcOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Nomor DDC Spesifik *</label>
                    <input type="text" id="editEbookDdcCode" value="${info.ddcCode}" required
                        class="w-full p-2.5 border rounded-xl font-mono text-sm">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Judul Buku Digital *</label>
                <input type="text" id="editEbookTitle" value="${eb.ebookTitle || eb.title || ''}" required
                    class="w-full p-2.5 border rounded-xl text-sm">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Pengarang *</label>
                    <input type="text" id="editEbookAuthor" value="${eb.ebookAuthor || eb.author || ''}" required
                        class="w-full p-2.5 border rounded-xl text-sm">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Penerbit & Tahun</label>
                    <div class="flex gap-2">
                        <input type="text" id="editEbookPublisher" value="${eb.ebookPublisher || ''}" class="w-2/3 p-2.5 border rounded-xl text-sm">
                        <input type="number" id="editEbookYear" value="${eb.ebookYear || ''}" class="w-1/3 p-2.5 border rounded-xl text-sm">
                    </div>
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Link File E-Book *</label>
                <input type="url" id="editEbookFileUrl" value="${eb.ebookFileUrl || ''}" required
                    class="w-full p-2.5 border rounded-xl text-sm">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">URL Gambar Sampul</label>
                <input type="url" id="editEbookCoverUrl" value="${eb.ebookCoverUrl || ''}"
                    class="w-full p-2.5 border rounded-xl text-sm">
            </div>
            <div class="pt-3 border-t flex justify-end gap-2">
                <button type="button" onclick="closeModal()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">Update E-Book</button>
            </div>
        </form>
    `;

    openModal("Edit Buku Digital", formHtml, "max-w-lg");
}

async function updateDigitalBook(event, backendId) {
    event.preventDefault();
    const eb = appState.allRecords.find(r => r.type === 'ebook' && (r.__backendId === backendId || r.id === backendId));
    if (!eb) return;

    const ddcCode = document.getElementById('editEbookDdcCode').value.trim();
    const classes = getDigitalDdcClasses();
    const prefix = ddcCode.substring(0, 1) + '00';
    const matchedClass = classes.find(c => c.code === prefix) || classes[0];

    const updated = {
        ...eb,
        ebookDdcCode: ddcCode,
        ebookCategory: matchedClass.short,
        ebookTitle: document.getElementById('editEbookTitle').value.trim(),
        ebookAuthor: document.getElementById('editEbookAuthor').value.trim(),
        ebookPublisher: document.getElementById('editEbookPublisher').value.trim(),
        ebookYear: document.getElementById('editEbookYear').value.trim(),
        ebookFileUrl: document.getElementById('editEbookFileUrl').value.trim(),
        ebookCoverUrl: document.getElementById('editEbookCoverUrl').value.trim()
    };

    closeModal();
    await window.dataSdk.sendData('update', updated);
    appState.allRecords = appState.allRecords.map(r => (r === eb ? updated : r));
    showToast("Data e-book berhasil diperbarui!", "success");
    renderCurrentSection();
}

async function deleteDigitalBook(backendId) {
    const eb = appState.allRecords.find(r => r.type === 'ebook' && (r.__backendId === backendId || r.id === backendId));
    if (!eb || !confirm(`Hapus e-book "${eb.ebookTitle || eb.title}"?`)) return;

    const res = await window.dataSdk.sendData('delete', eb);
    if (res && res.success !== false) {
        appState.allRecords = appState.allRecords.filter(r => r !== eb);
        showToast("E-book berhasil dihapus!", "success");
        renderCurrentSection();
    }
}

// Buka E-Book Reader + Catat Otomatis ke Buku Tamu & Statistik Literasi
async function openDigitalBookReader(backendId) {
    const eb = appState.allRecords.find(r => r.type === 'ebook' && (r.__backendId === backendId || r.id === backendId));
    if (!eb) return;

    const judul = eb.ebookTitle || eb.title || 'E-Book';
    const rawUrl = eb.ebookFileUrl || '';
    const embedUrl = formatDigitalPreviewUrl(rawUrl);

    // Tambah counter pembaca
    eb.ebookReadCount = Number(eb.ebookReadCount || 0) + 1;
    if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
        window.dataSdk.sendData('update', eb);
    }

    // Otomatis catat ke Buku Tamu jika user yang login bukan akun admin umum
    const user = typeof getValidAuthSession === 'function' ? getValidAuthSession() : (window.loggedInUser || {});
    const readerName = user?.fullName || user?.name || '';
    if (readerName && typeof autoCheckInVisitorReading === 'function') {
        autoCheckInVisitorReading(readerName, `[E-Book] ${judul}`);
    }

    const readerHtml = `
        <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-xl border text-xs">
                <span class="text-gray-600">Pengarang: <strong>${eb.ebookAuthor || '-'}</strong> &bull; DDC: <strong>${eb.ebookDdcCode || '000'}</strong></span>
                <a href="${rawUrl}" target="_blank" rel="noopener noreferrer"
                    class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                    Buka di Tab Baru ↗
                </a>
            </div>
            <div class="w-full h-[70vh] rounded-xl overflow-hidden border bg-gray-900">
                <iframe src="${embedUrl}" class="w-full h-full border-0" allow="autoplay"></iframe>
            </div>
        </div>
    `;

    openModal(`Membaca E-Book: ${judul}`, readerHtml, "max-w-4xl");
}

function exportDigitalBooksExcel() {
    const ebooks = getRecordsByType('ebook');
    if (ebooks.length === 0) {
        showToast("Belum ada data buku digital untuk diexport.", "error");
        return;
    }

    const rows = ebooks.map((eb, i) => {
        const info = getDigitalBookDdcInfo(eb);
        return {
            'No': i + 1,
            'Kode DDC': info.ddcCode,
            'Kelas Utama Perpusnas': info.ddcClass.short,
            'Judul E-Book': eb.ebookTitle || eb.title || '-',
            'Pengarang': eb.ebookAuthor || eb.author || '-',
            'Penerbit': eb.ebookPublisher || '-',
            'Tahun': eb.ebookYear || '-',
            'Format': eb.ebookFormat || 'PDF',
            'Total Dibaca': Number(eb.ebookReadCount || 0),
            'Link File': eb.ebookFileUrl || '-'
        };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Perpustakaan Digital");
    XLSX.writeFile(wb, "Koleksi_Perpustakaan_Digital_DDC.xlsx");
    showToast("Data Perpustakaan Digital berhasil diexport!", "success");
}