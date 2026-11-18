// JS/stok_opname.js

let opnamePhysicalCounts = {};
let opnameNotesMap = {};

// Hitung jumlah eksemplar buku yang sedang dipinjam aktif
function getActiveLoanedQtyByBarcode(barcode) {
    const cleanCode = String(barcode || '').trim().toLowerCase();
    if (!cleanCode) return 0;

    const loans = getRecordsByType('loan');
    return loans.reduce((sum, l) => {
        const st = (l.loanStatus || l.status || 'dipinjam').toLowerCase();
        const isReturned = st === 'dikembalikan' || st === 'returned';
        if (isReturned) return sum;

        const loanCode = String(l.loanBarcode || l.bookBarcode || '').trim().toLowerCase();
        if (loanCode === cleanCode) {
            return sum + Number(l.loanQuantity || l.quantity || 1);
        }
        return sum;
    }, 0);
}

function renderStockOpnameSection() {
    const books = getRecordsByType('book');
    const opnameHistory = [...getRecordsByType('stock_opname')].sort((a, b) =>
        new Date(b.opnameDate || b.timestamp || 0) - new Date(a.opnameDate || a.timestamp || 0)
    );

    let totalTitles = books.length;
    let matchedCount = 0;
    let discrepancyCount = 0;
    let rowsHtml = '';

    books.forEach((book, index) => {
        const kodeBuku = String(book.bookBarcode || book.id || '-').trim();
        const judul = book.bookTitle || book.title || '-';
        const rak = book.bookShelf || book.shelf || '-';
        const stokSistemRak = book.bookStock !== undefined ? Number(book.bookStock) : 1;
        const sedangDipinjam = getActiveLoanedQtyByBarcode(kodeBuku);
        const targetId = book.__backendId || kodeBuku;

        // Default fisik di rak = stok sistem (kecuali sudah diubah petugas saat sesi opname)
        if (opnamePhysicalCounts[targetId] === undefined) {
            opnamePhysicalCounts[targetId] = stokSistemRak;
        }

        const fisikRak = Number(opnamePhysicalCounts[targetId]);
        const selisih = fisikRak - stokSistemRak;
        const catatan = opnameNotesMap[targetId] || '';

        if (selisih === 0) {
            matchedCount++;
        } else {
            discrepancyCount++;
        }

        let statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Sesuai</span>`;
        if (selisih < 0) {
            statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Kurang ${Math.abs(selisih)}</span>`;
        } else if (selisih > 0) {
            statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Lebih +${selisih}</span>`;
        }

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50 transition-colors" data-barcode="${kodeBuku.toLowerCase()}">
                <td class="p-3 text-center text-gray-500">${index + 1}</td>
                <td class="p-3 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">${kodeBuku}</td>
                <td class="p-3">
                    <div class="font-medium text-gray-800">${judul}</div>
                    <div class="text-xs text-gray-400">Rak: ${rak}</div>
                </td>
                <td class="p-3 text-center font-semibold text-gray-700">${stokSistemRak}</td>
                <td class="p-3 text-center text-amber-600 font-medium">${sedangDipinjam}</td>
                <td class="p-3 text-center">
                    <div class="inline-flex items-center gap-1">
                        <button type="button" onclick="adjustOpnamePhysical('${targetId}', -1)"
                            class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs">-</button>
                        <input type="number" min="0" value="${fisikRak}"
                            onchange="setOpnamePhysical('${targetId}', this.value)"
                            class="w-16 text-center py-1 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <button type="button" onclick="adjustOpnamePhysical('${targetId}', 1)"
                            class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs">+</button>
                    </div>
                </td>
                <td class="p-3 text-center" id="opnameStatus_${targetId}">${statusBadge}</td>
                <td class="p-3">
                    <input type="text" value="${catatan}" placeholder="Ket. rusak / hilang..."
                        onchange="setOpnameNote('${targetId}', this.value)"
                        class="w-full min-w-[140px] px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </td>
            </tr>
        `;
    });

    if (books.length === 0) {
        rowsHtml = `<tr><td colspan="8" class="p-8 text-center text-gray-500">Belum ada data buku untuk dilakukan stok opname.</td></tr>`;
    }

    let historyRowsHtml = '';
    opnameHistory.slice(0, 10).forEach((h, i) => {
        historyRowsHtml += `
            <tr class="border-b hover:bg-gray-50 text-xs">
                <td class="p-3 text-center text-gray-500">${i + 1}</td>
                <td class="p-3 font-medium text-gray-800">${formatDateTimeShort ? formatDateTimeShort(h.opnameDate) : formatDate(h.opnameDate)}</td>
                <td class="p-3 text-gray-700">${h.auditorName || '-'}</td>
                <td class="p-3 text-center">${h.totalTitles || 0} judul</td>
                <td class="p-3 text-center text-emerald-600 font-semibold">${h.matchedTitles || 0} sesuai</td>
                <td class="p-3 text-center text-red-600 font-semibold">${h.discrepancyTitles || 0} selisih</td>
                <td class="p-3 text-gray-600">${h.summaryNote || '-'}</td>
            </tr>
        `;
    });

    if (opnameHistory.length === 0) {
        historyRowsHtml = `<tr><td colspan="7" class="p-6 text-center text-gray-400 text-xs">Belum ada riwayat berita acara stok opname tersimpan.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Stok Opname Berkala</h2>
                    <p class="text-gray-500 text-sm">Audit kesesuaian fisik buku di rak dengan data stok sistem perpustakaan.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" onclick="resetOpnameSession()"
                        class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors">
                        Reset Hitungan
                    </button>
                    <button type="button" onclick="exportStockOpnameExcel()"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors">
                        <i data-lucide="download" class="w-4 h-4"></i> Export Excel
                    </button>
                    <button type="button" onclick="printStockOpnameReport()"
                        class="bg-slate-700 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors">
                        <i data-lucide="printer" class="w-4 h-4"></i> Cetak Berita Acara
                    </button>
                    <button type="button" onclick="saveAndSyncStockOpname()"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-colors">
                        <i data-lucide="check-circle" class="w-4 h-4"></i> Simpan & Sinkronkan Stok
                    </button>
                </div>
            </div>

            <!-- Kartu Ringkasan Audit -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-xl shadow-xs border border-gray-100 border-l-4 border-l-blue-500">
                    <p class="text-xs font-medium text-gray-500">Total Judul Diaudit</p>
                    <p class="text-2xl font-bold text-gray-800 mt-1">${totalTitles}</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-xs border border-gray-100 border-l-4 border-l-emerald-500">
                    <p class="text-xs font-medium text-gray-500">Stok Fisik Sesuai</p>
                    <p class="text-2xl font-bold text-emerald-600 mt-1">${matchedCount}</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-xs border border-gray-100 border-l-4 border-l-red-500">
                    <p class="text-xs font-medium text-gray-500">Terdapat Selisih</p>
                    <p class="text-2xl font-bold text-red-600 mt-1">${discrepancyCount}</p>
                </div>
            </div>

            <!-- Bar Pencarian & Scan Cepat -->
            <div class="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex flex-col sm:flex-row gap-3">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-3 text-gray-400"></i>
                    <input type="text" id="opnameSearchInput" onkeyup="filterTable(this.value, 'opnameTableBody')"
                        placeholder="Cari barcode, judul buku, atau lokasi rak..."
                        class="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div class="flex gap-2">
                    <input type="text" id="quickScanOpnameInput" onkeydown="if(event.key==='Enter'){event.preventDefault();incrementBookByBarcode(this.value);this.value='';}"
                        placeholder="Scan barcode (+1 fisik)..."
                        class="px-3.5 py-2 border border-blue-200 bg-blue-50/40 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <!-- Tabel Lembar Kerja Stok Opname -->
            <div class="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th class="p-3 w-12 text-center">No</th>
                                <th class="p-3">Barcode</th>
                                <th class="p-3">Judul Buku & Rak</th>
                                <th class="p-3 text-center">Stok Sistem</th>
                                <th class="p-3 text-center">Dipinjam</th>
                                <th class="p-3 text-center">Fisik di Rak</th>
                                <th class="p-3 text-center">Status Selisih</th>
                                <th class="p-3">Keterangan Audit</th>
                            </tr>
                        </thead>
                        <tbody id="opnameTableBody" class="text-sm">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Riwayat Berita Acara Stok Opname -->
            <div class="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                <div class="px-5 py-3.5 border-b bg-gray-50/60 flex items-center justify-between">
                    <h3 class="font-bold text-gray-800 text-sm">Riwayat Pelaksanaan Stok Opname</h3>
                    <span class="text-xs text-gray-500">${opnameHistory.length} sesi tercatat</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-600 text-xs uppercase border-b">
                            <tr>
                                <th class="p-3 w-12 text-center">No</th>
                                <th class="p-3">Tanggal Audit</th>
                                <th class="p-3">Petugas</th>
                                <th class="p-3 text-center">Total Judul</th>
                                <th class="p-3 text-center">Sesuai</th>
                                <th class="p-3 text-center">Selisih</th>
                                <th class="p-3">Catatan</th>
                            </tr>
                        </thead>
                        <tbody>${historyRowsHtml}</tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function setOpnamePhysical(targetId, val) {
    opnamePhysicalCounts[targetId] = Math.max(0, parseInt(val) || 0);
    renderCurrentSection();
}

function adjustOpnamePhysical(targetId, delta) {
    const current = Number(opnamePhysicalCounts[targetId] || 0);
    opnamePhysicalCounts[targetId] = Math.max(0, current + delta);
    renderCurrentSection();
}

function setOpnameNote(targetId, text) {
    opnameNotesMap[targetId] = text.trim();
}

function incrementBookByBarcode(barcodeVal) {
    const clean = String(barcodeVal || '').trim().toLowerCase();
    if (!clean) return;

    const books = getRecordsByType('book');
    const matched = books.find(b =>
        String(b.bookBarcode || b.id || '').trim().toLowerCase() === clean
    );

    if (!matched) {
        showToast(`Barcode "${barcodeVal}" tidak ditemukan di katalog!`, "error");
        return;
    }

    const targetId = matched.__backendId || matched.bookBarcode || matched.id;
    opnamePhysicalCounts[targetId] = Number(opnamePhysicalCounts[targetId] || 0) + 1;
    showToast(`+1 fisik untuk "${matched.bookTitle || matched.title}" (Total: ${opnamePhysicalCounts[targetId]})`, "success");
    renderCurrentSection();
}

function resetOpnameSession() {
    if (!confirm("Reset semua angka hitungan fisik kembali ke stok sistem saat ini?")) return;
    opnamePhysicalCounts = {};
    opnameNotesMap = {};
    renderCurrentSection();
    showToast("Hitungan stok opname direset.", "success");
}

async function saveAndSyncStockOpname() {
    const books = getRecordsByType('book');
    if (books.length === 0) return;

    if (!confirm("Simpan hasil stok opname dan perbarui stok buku di sistem sesuai hasil hitung fisik?")) return;

    let updatedBooksCount = 0;
    let matchedTitles = 0;
    let discrepancyTitles = 0;

    for (const book of books) {
        const kodeBuku = String(book.bookBarcode || book.id || '-').trim();
        const targetId = book.__backendId || kodeBuku;
        const oldStock = book.bookStock !== undefined ? Number(book.bookStock) : 1;
        const physicalStock = opnamePhysicalCounts[targetId] !== undefined
            ? Number(opnamePhysicalCounts[targetId])
            : oldStock;

        if (physicalStock === oldStock) {
            matchedTitles++;
        } else {
            discrepancyTitles++;
            book.bookStock = physicalStock;
            if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
                await window.dataSdk.sendData('update', book);
            }
            updatedBooksCount++;
        }
    }

    const user = typeof getValidAuthSession === 'function' ? getValidAuthSession() : (window.loggedInUser || {});
    const auditorName = user?.fullName || user?.name || user?.username || 'Petugas Perpustakaan';

    const logRecord = {
        type: 'stock_opname',
        opnameDate: new Date().toISOString(),
        auditorName: auditorName,
        totalTitles: books.length,
        matchedTitles: matchedTitles,
        discrepancyTitles: discrepancyTitles,
        summaryNote: updatedBooksCount > 0
            ? `${updatedBooksCount} judul buku disesuaikan stoknya`
            : 'Semua stok fisik sesuai sistem'
    };

    if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
        const res = await window.dataSdk.sendData('create', logRecord);
        if (res && res.__backendId) logRecord.__backendId = res.__backendId;
    }
    appState.allRecords.push(logRecord);

    opnamePhysicalCounts = {};
    opnameNotesMap = {};
    showToast(`Stok opname selesai! ${updatedBooksCount} judul disesuaikan stoknya.`, "success");
    renderCurrentSection();
}

function exportStockOpnameExcel() {
    const books = getRecordsByType('book');
    if (books.length === 0) {
        showToast("Tidak ada data untuk diexport.", "error");
        return;
    }

    const rows = books.map((b, i) => {
        const kodeBuku = String(b.bookBarcode || b.id || '-').trim();
        const targetId = b.__backendId || kodeBuku;
        const stokSistem = b.bookStock !== undefined ? Number(b.bookStock) : 1;
        const fisikRak = opnamePhysicalCounts[targetId] !== undefined ? Number(opnamePhysicalCounts[targetId]) : stokSistem;
        const selisih = fisikRak - stokSistem;

        return {
            'No': i + 1,
            'Barcode': kodeBuku,
            'Judul Buku': b.bookTitle || b.title || '-',
            'Rak': b.bookShelf || b.shelf || '-',
            'Stok Sistem': stokSistem,
            'Sedang Dipinjam': getActiveLoanedQtyByBarcode(kodeBuku),
            'Fisik di Rak': fisikRak,
            'Selisih': selisih,
            'Status': selisih === 0 ? 'Sesuai' : (selisih < 0 ? `Kurang ${Math.abs(selisih)}` : `Lebih +${selisih}`),
            'Keterangan': opnameNotesMap[targetId] || '-'
        };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stok Opname");
    XLSX.writeFile(wb, `Stok_Opname_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast("File Excel Stok Opname berhasil diunduh!", "success");
}

function printStockOpnameReport() {
    const books = getRecordsByType('book');
    const libName = defaultConfig.libraryName || 'PerpusWeb';
    const user = typeof getValidAuthSession === 'function' ? getValidAuthSession() : (window.loggedInUser || {});
    const auditorName = user?.fullName || user?.name || user?.username || 'Petugas Perpustakaan';
    const dateNow = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const trHtml = books.map((b, i) => {
        const kodeBuku = String(b.bookBarcode || b.id || '-').trim();
        const targetId = b.__backendId || kodeBuku;
        const stokSistem = b.bookStock !== undefined ? Number(b.bookStock) : 1;
        const dipinjam = getActiveLoanedQtyByBarcode(kodeBuku);
        const fisikRak = opnamePhysicalCounts[targetId] !== undefined ? Number(opnamePhysicalCounts[targetId]) : stokSistem;
        const selisih = fisikRak - stokSistem;
        const ket = opnameNotesMap[targetId] || (selisih === 0 ? 'Sesuai' : '');

        return `
            <tr>
                <td style="text-align:center;">${i + 1}</td>
                <td>${kodeBuku}</td>
                <td>${b.bookTitle || b.title || '-'}</td>
                <td style="text-align:center;">${b.bookShelf || b.shelf || '-'}</td>
                <td style="text-align:center;">${stokSistem}</td>
                <td style="text-align:center;">${dipinjam}</td>
                <td style="text-align:center;">${fisikRak}</td>
                <td style="text-align:center;">${selisih > 0 ? '+' + selisih : selisih}</td>
                <td>${ket}</td>
            </tr>
        `;
    }).join('');

    const win = window.open('', '_blank', 'width=1000,height=700');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Berita Acara Stok Opname - ${libName}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
                .header { text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 12px; margin-bottom: 16px; }
                .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
                .header p { margin: 4px 0 0; font-size: 12px; color: #4b5563; }
                .meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; }
                th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
                th { background-color: #f3f4f6; }
                .sign { margin-top: 32px; display: flex; justify-content: space-between; font-size: 12px; }
                @media print { @page { size: landscape; margin: 12mm; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>BERITA ACARA STOK OPNAME KOLEKSI PERPUSTAKAAN</h1>
                <p>${libName}</p>
            </div>
            <div class="meta">
                <span>Petugas Pelaksana: <strong>${auditorName}</strong></span>
                <span>Tanggal Audit: <strong>${dateNow}</strong></span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="text-align:center;">No</th>
                        <th>Barcode</th>
                        <th>Judul Buku</th>
                        <th style="text-align:center;">Rak</th>
                        <th style="text-align:center;">Stok Sistem</th>
                        <th style="text-align:center;">Dipinjam</th>
                        <th style="text-align:center;">Fisik Rak</th>
                        <th style="text-align:center;">Selisih</th>
                        <th>Keterangan</th>
                    </tr>
                </thead>
                <tbody>${trHtml}</tbody>
            </table>
            <div class="sign">
                <div>Mengetahui,<br><strong>Kepala Perpustakaan</strong><br><br><br><br>( _______________________ )</div>
                <div>Martapura, ${dateNow}<br><strong>Petugas Stok Opname</strong><br><br><br><br>( ${auditorName} )</div>
            </div>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
    `);
    win.document.close();
}