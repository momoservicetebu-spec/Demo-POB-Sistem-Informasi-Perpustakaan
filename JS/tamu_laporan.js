// JS/tamu_laporan.js

// ==========================================
// 1. MODUL BUKU TAMU (VISITORS)
// ==========================================

function renderVisitorsSection() {
    const visitors = getRecordsByType('visitor');

    let rowsHtml = '';
    visitors.forEach((visitor, index) => {
        const nama = visitor.visitorName || visitor.name || '-';
        const instansi = visitor.visitorClass || visitor.institution || visitor.role || '-';
        const keperluan = visitor.visitorPurpose || visitor.purpose || '-';
        const rawDate = visitor.visitorCheckIn || visitor.visitDate || visitor.date || '';

        let tanggal = '-';
        let jam = visitor.timeIn || '-';

        if (rawDate) {
            const dt = new Date(rawDate);
            if (!isNaN(dt.getTime())) {
                tanggal = formatDate(rawDate);
                if (!visitor.timeIn) {
                    jam = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                }
            }
        }

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 text-center text-gray-500">${index + 1}</td>
                <td class="p-3 font-medium text-gray-800">${nama}</td>
                <td class="p-3 text-gray-600">${instansi}</td>
                <td class="p-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">${keperluan}</span>
                </td>
                <td class="p-3 text-gray-600">${tanggal}</td>
                <td class="p-3 text-center">
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono font-medium">${jam}</span>
                </td>
            </tr>
        `;
    });

    if (visitors.length === 0) {
        rowsHtml = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Belum ada data pengunjung.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Buku Tamu</h2>
                    <p class="text-gray-500 text-sm">Catatan daftar hadir pengunjung perpustakaan.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button onclick="exportVisitorsCSV()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Export Excel
                    </button>
                    <button onclick="showAddVisitorModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                        <i data-lucide="user-check" class="w-4 h-4"></i> Isi Buku Tamu
                    </button>
                </div>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"></i>
                    <input type="text" onkeyup="filterTable(this.value, 'visitorTableBody')" placeholder="Cari nama pengunjung, kelas/instansi, atau keperluan..." class="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th class="p-3 w-14 text-center">No</th>
                                <th class="p-3">Nama Pengunjung</th>
                                <th class="p-3">Kelas / Instansi</th>
                                <th class="p-3">Keperluan</th>
                                <th class="p-3">Tanggal</th>
                                <th class="p-3 text-center">Jam Masuk</th>
                            </tr>
                        </thead>
                        <tbody id="visitorTableBody" class="text-sm">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function showAddVisitorModal() {
    const formHtml = `
        <form onsubmit="saveVisitor(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" id="visitorName" required placeholder="Masukkan nama pengunjung" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kelas / Instansi *</label>
                <input type="text" id="visitorInst" placeholder="Contoh: Kelas X IPA 1 / Guru / Umum" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Keperluan *</label>
                <select id="visitorPurpose" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                    <option value="Membaca Buku">Membaca Buku</option>
                    <option value="Meminjam Buku">Meminjam Buku</option>
                    <option value="Mengembalikan Buku">Mengembalikan Buku</option>
                    <option value="Mengerjakan Tugas">Mengerjakan Tugas</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">Simpan Kehadiran</button>
            </div>
        </form>
    `;
    openModal("Isi Buku Tamu", formHtml);
}

async function saveVisitor(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const nameVal = document.getElementById('visitorName').value.trim();
    const instVal = document.getElementById('visitorInst').value.trim();
    const purposeVal = document.getElementById('visitorPurpose').value;

    const newVisitor = {
        visitorName: nameVal,
        name: nameVal,
        visitorClass: instVal,
        institution: instVal,
        visitorPurpose: purposeVal,
        purpose: purposeVal,
        visitorCheckIn: now.toISOString(),
        visitDate: now.toISOString(),
        timeIn: timeString,
        type: 'visitor'
    };

    const result = await window.dataSdk.sendData('create', newVisitor);

    if (result && result.success) {
        appState.allRecords.push(newVisitor);
        closeModal();
        showToast("Kehadiran berhasil dicatat!", "success");
        renderCurrentSection();
    } else {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        showToast("Gagal mencatat kehadiran", "error");
    }
}

function exportVisitorsCSV() {
    const visitors = getRecordsByType('visitor');
    if (visitors.length === 0) {
        showToast("Tidak ada data pengunjung untuk diexport", "error");
        return;
    }

    const cleanData = visitors.map((v, i) => {
        const rawDate = v.visitorCheckIn || v.visitDate || v.date || '';
        return {
            "No": i + 1,
            "Nama": v.visitorName || v.name || '-',
            "Kelas / Instansi": v.visitorClass || v.institution || '-',
            "Keperluan": v.visitorPurpose || v.purpose || '-',
            "Tanggal Kunjungan": formatDate(rawDate),
            "Jam Masuk": v.timeIn || '-'
        };
    });

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buku Tamu");
    XLSX.writeFile(wb, "Laporan_Buku_Tamu.xlsx");
    showToast("Laporan Buku Tamu berhasil diunduh!", "success");
}

// ==========================================
// 2. MODUL LAPORAN PERPUSTAKAAN (REPORTS)
// ==========================================

function renderReportsSection() {
    const books = getRecordsByType('book');
    const members = getRecordsByType('member');
    const loans = getRecordsByType('loan');
    const visitors = getRecordsByType('visitor');

    const totalEksemplar = books.reduce((sum, b) => sum + (b.bookStock !== undefined ? Number(b.bookStock) : 1), 0);

    let totalDendaTerkumpul = 0;
    let totalPotensiDenda = 0;
    let aktifCount = 0;
    let selesaiCount = 0;

    loans.forEach(l => {
        const st = (l.loanStatus || l.status || '').toLowerCase();
        const isReturned = st === 'dikembalikan' || st === 'returned';
        if (isReturned) {
            selesaiCount++;
            totalDendaTerkumpul += Number(l.fineAmount) || 0;
        } else {
            aktifCount++;
            if (typeof calculateFine === 'function') {
                totalPotensiDenda += calculateFine(l.loanDueDate).fineAmount;
            }
        }
    });

    let loanRows = '';
    loans.forEach((l, i) => {
        const st = (l.loanStatus || l.status || 'dipinjam').toLowerCase();
        const isReturned = st === 'dikembalikan' || st === 'returned';
        const denda = isReturned
            ? (Number(l.fineAmount) || 0)
            : (typeof calculateFine === 'function' ? calculateFine(l.loanDueDate).fineAmount : 0);

        loanRows += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 text-center text-gray-500">${i + 1}</td>
                <td class="p-3 font-medium text-gray-800">${l.loanMember || l.memberName || '-'}</td>
                <td class="p-3 text-gray-700">${l.loanBookTitle || l.loanBarcode || '-'}</td>
                <td class="p-3 text-gray-600">${formatDate(l.loanDate)}</td>
                <td class="p-3 text-gray-600">${formatDate(l.loanDueDate)}</td>
                <td class="p-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium ${isReturned ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                        ${isReturned ? 'Dikembalikan' : 'Dipinjam'}
                    </span>
                </td>
                <td class="p-3 font-medium ${denda > 0 ? 'text-red-600' : 'text-gray-500'}">${formatRupiah(denda)}</td>
            </tr>
        `;
    });

    if (loans.length === 0) {
        loanRows = `<tr><td colspan="7" class="p-6 text-center text-gray-500">Belum ada riwayat transaksi peminjaman.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Laporan & Rekapitulasi</h2>
                    <p class="text-gray-500 text-sm">Ringkasan statistik koleksi, sirkulasi peminjaman, denda, dan kunjungan.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button onclick="exportLoansExcel()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Export Laporan Sirkulasi
                    </button>
                    <button onclick="window.print()" class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
                        <i data-lucide="printer" class="w-4 h-4"></i> Cetak Halaman
                    </button>
                </div>
            </div>

            <!-- Ringkasan Kartu Laporan -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p class="text-xs font-medium text-gray-500 uppercase">Koleksi Buku</p>
                    <p class="text-2xl font-bold text-gray-800 mt-1">${books.length} Judul</p>
                    <p class="text-xs text-blue-600 mt-1">Total ${totalEksemplar} eksemplar</p>
                </div>
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p class="text-xs font-medium text-gray-500 uppercase">Total Sirkulasi</p>
                    <p class="text-2xl font-bold text-gray-800 mt-1">${loans.length} Transaksi</p>
                    <p class="text-xs text-gray-500 mt-1">${aktifCount} aktif • ${selesaiCount} selesai</p>
                </div>
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p class="text-xs font-medium text-gray-500 uppercase">Denda Terkumpul</p>
                    <p class="text-2xl font-bold text-emerald-600 mt-1">${formatRupiah(totalDendaTerkumpul)}</p>
                    <p class="text-xs text-amber-600 mt-1">Berjalan: ${formatRupiah(totalPotensiDenda)}</p>
                </div>
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p class="text-xs font-medium text-gray-500 uppercase">Anggota & Kunjungan</p>
                    <p class="text-2xl font-bold text-gray-800 mt-1">${members.length} Anggota</p>
                    <p class="text-xs text-purple-600 mt-1">${visitors.length} total kunjungan tamu</p>
                </div>
            </div>

            <!-- Tabel Rekap Sirkulasi -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-5 py-4 border-b flex items-center justify-between">
                    <h3 class="font-semibold text-gray-800">Riwayat Lengkap Peminjaman & Pengembalian</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th class="p-3 w-14 text-center">No</th>
                                <th class="p-3">Peminjam</th>
                                <th class="p-3">Buku</th>
                                <th class="p-3">Tgl Pinjam</th>
                                <th class="p-3">Tenggat</th>
                                <th class="p-3">Status</th>
                                <th class="p-3">Denda</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            ${loanRows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function exportLoansExcel() {
    const loans = getRecordsByType('loan');
    if (loans.length === 0) {
        showToast("Tidak ada data sirkulasi untuk diexport", "error");
        return;
    }

    const cleanData = loans.map((l, i) => {
        const st = (l.loanStatus || l.status || 'dipinjam').toLowerCase();
        const isReturned = st === 'dikembalikan' || st === 'returned';
        const denda = isReturned
            ? (Number(l.fineAmount) || 0)
            : (typeof calculateFine === 'function' ? calculateFine(l.loanDueDate).fineAmount : 0);

        return {
            "No": i + 1,
            "Peminjam": l.loanMember || l.memberName || '-',
            "Kode Buku": l.loanBarcode || '-',
            "Judul Buku": l.loanBookTitle || l.bookTitle || '-',
            "Tanggal Pinjam": formatDate(l.loanDate),
            "Tenggat Kembali": formatDate(l.loanDueDate),
            "Tanggal Dikembalikan": l.returnDate ? formatDate(l.returnDate) : '-',
            "Status": isReturned ? 'Dikembalikan' : 'Dipinjam',
            "Denda (Rp)": denda
        };
    });

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Sirkulasi");
    XLSX.writeFile(wb, "Laporan_Sirkulasi_Perpustakaan.xlsx");
    showToast("Laporan Sirkulasi berhasil diunduh!", "success");
}