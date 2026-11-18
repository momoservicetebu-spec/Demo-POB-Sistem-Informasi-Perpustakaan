// JS/tamu_laporan.js

// ==========================================
// 1. MODUL BUKU TAMU (CHECK-IN & CHECK-OUT)
// ==========================================

function calculateVisitDuration(checkInStr, checkOutStr = null) {
    if (!checkInStr) return '-';
    const start = new Date(checkInStr);
    if (isNaN(start.getTime())) return '-';

    const end = checkOutStr ? new Date(checkOutStr) : new Date();
    if (isNaN(end.getTime())) return '-';

    const diffMs = Math.max(0, end - start);
    const totalMinutes = Math.floor(diffMs / 60000);

    if (totalMinutes < 1) return '< 1 menit';
    if (totalMinutes < 60) return `${totalMinutes} menit`;

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours} jam ${mins} mnt` : `${hours} jam`;
}

function formatDateTimeShort(dateStr) {
    if (!dateStr) return '-';
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return dateStr;
    return dt.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderVisitorsSection() {
    const visitors = getRecordsByType('visitor');
    const todayStr = new Date().toISOString().split('T')[0];

    let todayCount = 0;
    let activeCount = 0;

    visitors.forEach(v => {
        const rawCheckIn = v.visitorCheckIn || v.visitDate || v.date || '';
        if (rawCheckIn.startsWith(todayStr)) {
            todayCount++;
        }
        const statusRaw = (v.visitorStatus || v.status || '').toLowerCase();
        const hasCheckedOut = Boolean(v.visitorCheckOut || v.checkOut) || statusRaw === 'selesai' || statusRaw === 'checked_out';
        if (!hasCheckedOut) {
            activeCount++;
        }
    });

    let rowsHtml = '';
    visitors.forEach((visitor) => {
        const nama = visitor.visitorName || visitor.name || '-';
        const kelas = visitor.visitorClass || visitor.institution || visitor.role || '-';
        const keperluan = visitor.visitorPurpose || visitor.purpose || '-';
        const catatan = visitor.visitorNotes || visitor.notes || '';
        const checkInRaw = visitor.visitorCheckIn || visitor.visitDate || visitor.date || '';
        const checkOutRaw = visitor.visitorCheckOut || visitor.checkOut || '';

        const statusRaw = (visitor.visitorStatus || visitor.status || '').toLowerCase();
        const isCheckedOut = Boolean(checkOutRaw) || statusRaw === 'selesai' || statusRaw === 'checked_out';
        const targetId = visitor.__backendId || visitor.id || '';

        const checkInDisplay = checkInRaw ? formatDateTimeShort(checkInRaw) : '-';
        const checkOutDisplay = isCheckedOut ? (checkOutRaw ? formatDateTimeShort(checkOutRaw) : 'Selesai') : '-';
        const durasiDisplay = calculateVisitDuration(checkInRaw, isCheckedOut ? checkOutRaw : null);

        const statusBadge = isCheckedOut
            ? `<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Selesai</span>`
            : `<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 inline-flex items-center gap-1.5">
                   <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sedang Berkunjung
               </span>`;

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3.5">
                    <div class="font-medium text-gray-800">${nama}</div>
                    ${catatan ? `<div class="text-xs text-gray-400 mt-0.5 italic">"${catatan}"</div>` : ''}
                </td>
                <td class="p-3.5 text-gray-600">${kelas}</td>
                <td class="p-3.5">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">${keperluan}</span>
                </td>
                <td class="p-3.5 text-gray-600 text-xs font-mono">${checkInDisplay}</td>
                <td class="p-3.5 text-gray-600 text-xs font-mono">${checkOutDisplay}</td>
                <td class="p-3.5 text-gray-700 text-xs font-medium">${durasiDisplay}</td>
                <td class="p-3.5">${statusBadge}</td>
                <td class="p-3.5 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                        ${!isCheckedOut
                            ? `<button onclick="processVisitorCheckOut('${targetId}')" class="bg-amber-50 text-amber-700 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors">Check-Out</button>`
                            : ''}
                        <button onclick="deleteVisitor('${targetId}')" class="bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors">Hapus</button>
                    </div>
                </td>
            </tr>
        `;
    });

    if (visitors.length === 0) {
        rowsHtml = `<tr><td colspan="8" class="p-10 text-center text-gray-500">Belum ada data kunjungan. Check-in pengunjung pertama Anda!</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Buku Tamu Perpustakaan</h2>
                    <p class="text-gray-500 text-sm">Pencatatan kunjungan dan aktivitas pengunjung</p>
                </div>
                <button onclick="showAddVisitorModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i> Check-In Pengunjung
                </button>
            </div>

            <!-- 3 Kartu Statistik Sesuai Desain Awal -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <!-- Kunjungan Hari Ini -->
                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium text-gray-500">Kunjungan Hari Ini</p>
                        <p class="text-3xl font-bold text-gray-800 my-1">${todayCount}</p>
                        <p class="text-xs text-gray-400">pengunjung</p>
                    </div>
                    <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <i data-lucide="users" class="w-7 h-7"></i>
                    </div>
                </div>

                <!-- Sedang Berkunjung -->
                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500 flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium text-gray-500">Sedang Berkunjung</p>
                        <p class="text-3xl font-bold text-gray-800 my-1">${activeCount}</p>
                        <p class="text-xs text-gray-400">aktif sekarang</p>
                    </div>
                    <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <i data-lucide="user-check" class="w-7 h-7"></i>
                    </div>
                </div>

                <!-- Total Kunjungan -->
                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500 flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium text-gray-500">Total Kunjungan</p>
                        <p class="text-3xl font-bold text-gray-800 my-1">${visitors.length}</p>
                        <p class="text-xs text-gray-400">seluruh waktu</p>
                    </div>
                    <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <i data-lucide="bar-chart-2" class="w-7 h-7"></i>
                    </div>
                </div>
            </div>

            <!-- Kartu Tabel Riwayat Kunjungan -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-5 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div class="flex items-center gap-2">
                        <i data-lucide="clipboard-list" class="w-5 h-5 text-blue-600"></i>
                        <h3 class="font-bold text-gray-800">Riwayat Kunjungan</h3>
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <input type="text" onkeyup="filterTable(this.value, 'visitorTableBody')" placeholder="Cari nama / kelas..." class="px-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1 sm:w-52">
                        <button onclick="exportVisitorsCSV()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors whitespace-nowrap">
                            <i data-lucide="download" class="w-3.5 h-3.5"></i> Export CSV
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-600 text-xs font-semibold border-b">
                            <tr>
                                <th class="p-3.5">Nama</th>
                                <th class="p-3.5">Kelas</th>
                                <th class="p-3.5">Keperluan</th>
                                <th class="p-3.5">Check-In</th>
                                <th class="p-3.5">Check-Out</th>
                                <th class="p-3.5">Durasi</th>
                                <th class="p-3.5">Status</th>
                                <th class="p-3.5">Aksi</th>
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

// Helper otomatis mengisi kelas ketika nama anggota dipilih dari daftar
function autofillVisitorClass(nameVal) {
    const classInput = document.getElementById('visitorInst');
    if (!classInput || !nameVal) return;

    const members = getRecordsByType('member');
    const matched = members.find(m =>
        (m.memberName || m.name || '').toLowerCase() === nameVal.trim().toLowerCase()
    );

    if (matched) {
        const kelas = matched.memberClass || matched.role || '';
        if (kelas) classInput.value = kelas;
    }
}

function showAddVisitorModal() {
    const members = getRecordsByType('member');
    let memberDatalist = '';
    members.forEach(m => {
        const nama = m.memberName || m.name || '';
        const kelas = m.memberClass || m.role || '';
        if (nama) {
            memberDatalist += `<option value="${nama}">${kelas}</option>`;
        }
    });

    const formHtml = `
        <form onsubmit="saveVisitor(event)" class="space-y-4">
            <!-- 1. Nama Pengunjung -->
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1">Nama Pengunjung <span class="text-red-500">*</span></label>
                <input type="text" id="visitorName" list="visitorMemberList" oninput="autofillVisitorClass(this.value)" required autofocus
                    placeholder="Ketik nama atau pilih dari anggota..."
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                <datalist id="visitorMemberList">${memberDatalist}</datalist>
                <p class="text-xs text-gray-500 mt-1">Pilih dari anggota atau ketik nama manual</p>
            </div>

            <!-- 2. Kelas -->
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1">Kelas <span class="text-red-500">*</span></label>
                <input type="text" id="visitorInst" required
                    placeholder="X IPA 1, XI IPS 2, dll"
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
            </div>

            <!-- 3. Keperluan -->
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1">Keperluan <span class="text-red-500">*</span></label>
                <select id="visitorPurpose" required
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                    <option value="">-- Pilih Keperluan --</option>
                    <option value="Membaca Buku">Membaca Buku</option>
                    <option value="Meminjam Buku">Meminjam Buku</option>
                    <option value="Mengembalikan Buku">Mengembalikan Buku</option>
                    <option value="Mengerjakan Tugas">Mengerjakan Tugas</option>
                    <option value="Diskusi / Belajar Kelompok">Diskusi / Belajar Kelompok</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>

            <!-- 4. Catatan (Opsional) -->
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1">Catatan (Opsional)</label>
                <textarea id="visitorNotes" rows="3"
                    placeholder="Catatan tambahan..."
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm"></textarea>
            </div>

            <!-- Kotak Info Check-In Otomatis -->
            <div class="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 leading-relaxed">
                <strong>Check-In otomatis:</strong> Waktu check-in akan dicatat saat tombol "Check-In" diklik.
            </div>
            
            <!-- Tombol Aksi -->
            <div class="pt-2 flex items-center gap-3">
                <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm shadow-sm transition-colors">
                    ✓ Check-In Sekarang
                </button>
                <button type="button" onclick="closeModal()" class="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
                    Batal
                </button>
            </div>
        </form>
    `;
    openModal("Check-In Pengunjung", formHtml, "max-w-md");
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
    const notesVal = document.getElementById('visitorNotes').value.trim();

    const newVisitor = {
        visitorName: nameVal,
        name: nameVal,
        visitorClass: instVal,
        institution: instVal,
        visitorPurpose: purposeVal,
        purpose: purposeVal,
        visitorNotes: notesVal,
        visitorCheckIn: now.toISOString(),
        visitDate: now.toISOString(),
        timeIn: timeString,
        visitorCheckOut: '',
        visitorStatus: 'sedang_berkunjung',
        type: 'visitor'
    };

    const result = await window.dataSdk.sendData('create', newVisitor);

    if (result && result.success) {
        appState.allRecords.push(newVisitor);
        closeModal();
        showToast("Pengunjung berhasil Check-In!", "success");
        renderCurrentSection();
    } else {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        showToast("Gagal mencatat Check-In pengunjung", "error");
    }
}

async function processVisitorCheckOut(backendId) {
    const visitor = appState.allRecords.find(v => v.type === 'visitor' && (v.__backendId === backendId || v.id === backendId));
    if (!visitor) {
        showToast("Data kunjungan tidak ditemukan!", "error");
        return;
    }

    const nowIso = new Date().toISOString();
    const updatedVisitor = {
        ...visitor,
        __backendId: visitor.__backendId || backendId,
        visitorCheckOut: nowIso,
        checkOut: nowIso,
        visitorStatus: 'selesai',
        status: 'Selesai'
    };

    const result = await window.dataSdk.sendData('update', updatedVisitor);
    if (result && result.success) {
        appState.allRecords = appState.allRecords.map(record =>
            (record.type === 'visitor' && (record.__backendId === backendId || record.id === backendId)) ? updatedVisitor : record
        );
        showToast("Pengunjung berhasil Check-Out!", "success");
        renderCurrentSection();
    } else {
        showToast("Gagal memproses Check-Out", "error");
    }
}

async function deleteVisitor(backendId) {
    if (!confirm("Apakah Anda yakin ingin menghapus riwayat kunjungan ini?")) return;

    const payload = { __backendId: backendId };
    const result = await window.dataSdk.sendData('delete', payload);

    if (result && result.success) {
        appState.allRecords = appState.allRecords.filter(record =>
            !(record.type === 'visitor' && (record.__backendId === backendId || record.id === backendId))
        );
        showToast("Data kunjungan berhasil dihapus!", "success");
        renderCurrentSection();
    } else {
        showToast("Gagal menghapus data kunjungan", "error");
    }
}

function exportVisitorsCSV() {
    const visitors = getRecordsByType('visitor');
    if (visitors.length === 0) {
        showToast("Tidak ada data pengunjung untuk diexport", "error");
        return;
    }

    const cleanData = visitors.map((v, i) => {
        const checkInRaw = v.visitorCheckIn || v.visitDate || v.date || '';
        const checkOutRaw = v.visitorCheckOut || v.checkOut || '';
        const isDone = Boolean(checkOutRaw) || (v.visitorStatus || v.status || '').toLowerCase() === 'selesai';

        return {
            "No": i + 1,
            "Nama": v.visitorName || v.name || '-',
            "Kelas": v.visitorClass || v.institution || '-',
            "Keperluan": v.visitorPurpose || v.purpose || '-',
            "Catatan": v.visitorNotes || v.notes || '-',
            "Check-In": checkInRaw ? formatDateTimeShort(checkInRaw) : '-',
            "Check-Out": isDone ? (checkOutRaw ? formatDateTimeShort(checkOutRaw) : 'Selesai') : '-',
            "Durasi": calculateVisitDuration(checkInRaw, isDone ? checkOutRaw : null),
            "Status": isDone ? 'Selesai' : 'Sedang Berkunjung'
        };
    });

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Kunjungan");
    XLSX.writeFile(wb, "Riwayat_Kunjungan_Perpustakaan.csv", { bookType: "csv" });
    showToast("File CSV Riwayat Kunjungan berhasil diunduh!", "success");
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
            "Jumlah Buku": Number(l.loanQuantity || 1),
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