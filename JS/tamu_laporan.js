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

// Helper Otomatis Check-In saat peminjaman buku disimpan
async function autoCheckInVisitorFromLoan(peminjam, judulBuku = '', nowIso = new Date().toISOString()) {
    const cleanName = String(peminjam || '').trim();
    if (!cleanName) return false;

    const alreadyActive = appState.allRecords.some(v => {
        if (v.type !== 'visitor') return false;
        const vName = (v.visitorName || v.name || '').trim().toLowerCase();
        const st = (v.visitorStatus || v.status || '').toLowerCase();
        const isOut = Boolean(v.visitorCheckOut || v.checkOut) || st === 'selesai' || st === 'checked_out';
        return vName === cleanName.toLowerCase() && !isOut;
    });

    if (alreadyActive) return false;

    const memberRecord = appState.allRecords.find(m =>
        m.type === 'member' &&
        (m.memberName || m.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    );
    const kelasVal = memberRecord ? (memberRecord.memberClass || memberRecord.role || '-') : '-';
    const dt = new Date(nowIso);
    const timeString = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newVisitor = {
        visitorName: cleanName,
        name: cleanName,
        visitorClass: kelasVal,
        institution: kelasVal,
        visitorPurpose: 'Meminjam Buku',
        purpose: 'Meminjam Buku',
        visitorNotes: judulBuku ? `Otomatis saat meminjam: ${judulBuku}` : 'Otomatis dari transaksi peminjaman',
        visitorCheckIn: nowIso,
        visitDate: nowIso,
        timeIn: timeString,
        visitorCheckOut: '',
        visitorStatus: 'sedang_berkunjung',
        type: 'visitor'
    };

    const visResult = await window.dataSdk.sendData('create', newVisitor);
    if (visResult && visResult.success) {
        if (visResult.__backendId) newVisitor.__backendId = visResult.__backendId;
        if (visResult.id) newVisitor.id = visResult.id;
        appState.allRecords.push(newVisitor);
        return true;
    }
    return false;
}

// Helper Otomatis Check-Out saat buku dikembalikan
async function autoCheckOutVisitorFromReturn(peminjam, nowIso = new Date().toISOString()) {
    const cleanName = String(peminjam || '').trim().toLowerCase();
    if (!cleanName) return false;

    const activeVisitor = appState.allRecords.find(v => {
        if (v.type !== 'visitor') return false;
        const vName = (v.visitorName || v.name || '').trim().toLowerCase();
        const st = (v.visitorStatus || v.status || '').toLowerCase();
        const isOut = Boolean(v.visitorCheckOut || v.checkOut) || st === 'selesai' || st === 'checked_out';
        return vName === cleanName && !isOut;
    });

    if (!activeVisitor) return false;

    const updatedVisitor = {
        ...activeVisitor,
        visitorCheckOut: nowIso,
        checkOut: nowIso,
        visitorStatus: 'selesai',
        status: 'Selesai'
    };

    const visResult = await window.dataSdk.sendData('update', updatedVisitor);
    if (visResult && visResult.success !== false) {
        appState.allRecords = appState.allRecords.map(record =>
            record === activeVisitor ? updatedVisitor : record
        );
        return true;
    }
    return false;
}

function renderVisitorsSection() {
    const visitors = getRecordsByType('visitor');
    const todayStr = new Date().toISOString().split('T')[0];

    let todayCount = 0;
    let activeCount = 0;
    let activeCardsHtml = '';
    let rowsHtml = '';

    visitors.forEach((visitor, idx) => {
        const nama = visitor.visitorName || visitor.name || '-';
        const kelas = visitor.visitorClass || visitor.institution || visitor.role || '-';
        const keperluan = visitor.visitorPurpose || visitor.purpose || '-';
        const catatan = visitor.visitorNotes || visitor.notes || '';
        const checkInRaw = visitor.visitorCheckIn || visitor.visitDate || visitor.date || '';
        const checkOutRaw = visitor.visitorCheckOut || visitor.checkOut || '';

        if (checkInRaw.startsWith(todayStr)) {
            todayCount++;
        }

        const statusRaw = (visitor.visitorStatus || visitor.status || '').toLowerCase();
        const isCheckedOut = Boolean(checkOutRaw) || statusRaw === 'selesai' || statusRaw === 'checked_out';
        const targetId = visitor.__backendId || visitor.id || `temp_${idx}`;

        const checkInDisplay = checkInRaw ? formatDateTimeShort(checkInRaw) : '-';
        const checkOutDisplay = isCheckedOut ? (checkOutRaw ? formatDateTimeShort(checkOutRaw) : 'Selesai') : '-';
        const durasiDisplay = calculateVisitDuration(checkInRaw, isCheckedOut ? checkOutRaw : null);

        if (!isCheckedOut) {
            activeCount++;
            const jamMasuk = checkInRaw
                ? new Date(checkInRaw).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                : '-';

            activeCardsHtml += `
                <div class="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between gap-3">
                    <div class="space-y-1">
                        <div class="flex items-start justify-between gap-2">
                            <h4 class="font-bold text-gray-800 text-sm leading-snug">${nama}</h4>
                            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 inline-flex items-center gap-1 flex-shrink-0">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Aktif
                            </span>
                        </div>
                        <p class="text-xs text-gray-500">${kelas}</p>
                        <div class="pt-1.5 space-y-0.5 text-xs text-gray-600">
                            <p><span class="font-semibold text-gray-700">Keperluan:</span> ${keperluan}</p>
                            <p><span class="font-semibold text-gray-700">Check-in:</span> ${jamMasuk}</p>
                            <p><span class="font-semibold text-gray-700">Durasi:</span> ${durasiDisplay}</p>
                        </div>
                    </div>
                    <button onclick="processVisitorCheckOut('${targetId}', '${nama.replace(/'/g, "\\'")}')"
                        class="w-full py-2 px-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-2xs transition-colors">
                        ✓ Check-Out
                    </button>
                </div>
            `;
        }

        const statusBadge = isCheckedOut
            ? `<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Selesai</span>`
            : `<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 inline-flex items-center gap-1.5">
                   <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Aktif
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
                            ? `<button onclick="processVisitorCheckOut('${targetId}', '${nama.replace(/'/g, "\\'")}')" title="Check-Out" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors">✓ Check-Out</button>`
                            : ''}
                        <button onclick="deleteVisitor('${targetId}')" title="Hapus" class="bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors">Hapus</button>
                    </div>
                </td>
            </tr>
        `;
    });

    if (visitors.length === 0) {
        rowsHtml = `<tr><td colspan="8" class="p-10 text-center text-gray-500">Belum ada data kunjungan. Check-in pengunjung pertama Anda!</td></tr>`;
    }

    const activeSectionHtml = activeCount > 0 ? `
        <div class="bg-emerald-50/75 border border-emerald-200 rounded-2xl p-5 space-y-4">
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-500 shadow-xs"></span>
                <h3 class="font-bold text-emerald-800 text-sm">Pengunjung Aktif Saat Ini (${activeCount})</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                ${activeCardsHtml}
            </div>
        </div>
    ` : '';

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Buku Tamu Perpustakaan</h2>
                    <p class="text-gray-500 text-sm">Pencatatan kunjungan dan aktivitas pengunjung</p>
                </div>
                <button onclick="showAddVisitorModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i> Check-In Pengunjung
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
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

            <!-- PANEL PENGUNJUNG AKTIF SAAT INI -->
            ${activeSectionHtml}

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
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1">Nama Pengunjung <span class="text-red-500">*</span></label>
                <input type="text" id="visitorName" list="visitorMemberList" oninput="autofillVisitorClass(this.value)" required autofocus
                    placeholder="Ketik nama atau pilih dari anggota..."
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                <datalist id="visitorMemberList">${memberDatalist}</datalist>
                <p class="text-xs text-gray-500 mt-1">Pilih dari anggota atau ketik nama manual</p>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1">Kelas <span class="text-red-500">*</span></label>
                <input type="text" id="visitorInst" required
                    placeholder="X IPA 1, XI IPS 2, dll"
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1">Keperluan <span class="text-red-500">*</span></label>
                <select id="visitorPurpose" required
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                    <option value="Membaca Buku" selected>Membaca Buku</option>
                    <option value="Meminjam Buku">Meminjam Buku</option>
                    <option value="Mengembalikan Buku">Mengembalikan Buku</option>
                    <option value="Mengerjakan Tugas">Mengerjakan Tugas</option>
                    <option value="Diskusi / Belajar Kelompok">Diskusi / Belajar Kelompok</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1">Catatan (Opsional)</label>
                <textarea id="visitorNotes" rows="3"
                    placeholder="Catatan tambahan..."
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm"></textarea>
            </div>

            <div class="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 leading-relaxed">
                <strong>Check-In otomatis:</strong> Waktu check-in akan dicatat saat tombol "Check-In" diklik.
            </div>
            
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
        if (result.__backendId) newVisitor.__backendId = result.__backendId;
        if (result.id) newVisitor.id = result.id;
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

async function processVisitorCheckOut(backendId, fallbackName = '') {
    let visitor = appState.allRecords.find(v =>
        v.type === 'visitor' && (v.__backendId === backendId || v.id === backendId)
    );

    if (!visitor && fallbackName) {
        visitor = appState.allRecords.find(v => {
            if (v.type !== 'visitor') return false;
            const vName = (v.visitorName || v.name || '').trim().toLowerCase();
            const st = (v.visitorStatus || v.status || '').toLowerCase();
            const isOut = Boolean(v.visitorCheckOut || v.checkOut) || st === 'selesai' || st === 'checked_out';
            return vName === fallbackName.trim().toLowerCase() && !isOut;
        });
    }

    if (!visitor) {
        showToast("Data kunjungan tidak ditemukan!", "error");
        return;
    }

    const nowIso = new Date().toISOString();
    const updatedVisitor = {
        ...visitor,
        visitorCheckOut: nowIso,
        checkOut: nowIso,
        visitorStatus: 'selesai',
        status: 'Selesai'
    };

    const result = await window.dataSdk.sendData('update', updatedVisitor);
    if (result && result.success !== false) {
        appState.allRecords = appState.allRecords.map(record =>
            record === visitor ? updatedVisitor : record
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
// 2. MODUL LAPORAN & EXPORT DATA (SESUAI DESAIN LAMA)
// ==========================================

function isWithinDateRange(dateStr, startStr, endStr) {
    if (!startStr && !endStr) return true;
    if (!dateStr) return false;

    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return false;
    dt.setHours(0, 0, 0, 0);

    if (startStr) {
        const start = new Date(startStr);
        start.setHours(0, 0, 0, 0);
        if (dt < start) return false;
    }
    if (endStr) {
        const end = new Date(endStr);
        end.setHours(23, 59, 59, 999);
        if (dt > end) return false;
    }
    return true;
}

function getFilteredReportDataset(reportType, startDate, endDate) {
    if (reportType === 'books') {
        const books = getRecordsByType('book').filter(b => isWithinDateRange(b.timestamp, startDate, endDate));
        return {
            title: 'Laporan Koleksi Buku',
            filename: 'Laporan_Koleksi_Buku',
            columns: ['No', 'Barcode', 'Judul Buku', 'Pengarang', 'Penerbit', 'Tahun', 'Kategori', 'Rak', 'Stok'],
            rows: books.map((b, i) => ({
                'No': i + 1,
                'Barcode': b.bookBarcode || b.id || '-',
                'Judul Buku': b.bookTitle || b.title || '-',
                'Pengarang': b.bookAuthor || b.author || '-',
                'Penerbit': b.bookPublisher || b.publisher || '-',
                'Tahun': b.bookYear || b.year || '-',
                'Kategori': b.bookCategory || b.category || '-',
                'Rak': b.bookShelf || b.shelf || '-',
                'Stok': b.bookStock !== undefined ? Number(b.bookStock) : 1
            }))
        };
    }

    if (reportType === 'members') {
        const members = getRecordsByType('member').filter(m => isWithinDateRange(m.timestamp, startDate, endDate));
        return {
            title: 'Laporan Data Anggota',
            filename: 'Laporan_Data_Anggota',
            columns: ['No', 'ID Anggota', 'Nama Lengkap', 'Kelas / Peran', 'No. Telepon', 'Alamat'],
            rows: members.map((m, i) => {
                const code = m.memberCode || (m.__backendId ? m.__backendId.replace(/^ID[-_]/, '') : (m.id || '-'));
                return {
                    'No': i + 1,
                    'ID Anggota': code,
                    'Nama Lengkap': m.memberName || m.name || '-',
                    'Kelas / Peran': m.memberClass || m.role || '-',
                    'No. Telepon': m.memberPhone || m.phone || '-',
                    'Alamat': m.memberAddress || m.address || '-'
                };
            })
        };
    }

    if (reportType === 'visitors') {
        const visitors = getRecordsByType('visitor').filter(v =>
            isWithinDateRange(v.visitorCheckIn || v.visitDate || v.date, startDate, endDate)
        );
        return {
            title: 'Laporan Buku Tamu',
            filename: 'Laporan_Buku_Tamu',
            columns: ['No', 'Nama Pengunjung', 'Kelas', 'Keperluan', 'Check-In', 'Check-Out', 'Status'],
            rows: visitors.map((v, i) => {
                const checkInRaw = v.visitorCheckIn || v.visitDate || v.date || '';
                const checkOutRaw = v.visitorCheckOut || v.checkOut || '';
                const isDone = Boolean(checkOutRaw) || (v.visitorStatus || v.status || '').toLowerCase() === 'selesai';
                return {
                    'No': i + 1,
                    'Nama Pengunjung': v.visitorName || v.name || '-',
                    'Kelas': v.visitorClass || v.institution || '-',
                    'Keperluan': v.visitorPurpose || v.purpose || '-',
                    'Check-In': checkInRaw ? formatDateTimeShort(checkInRaw) : '-',
                    'Check-Out': isDone ? (checkOutRaw ? formatDateTimeShort(checkOutRaw) : 'Selesai') : '-',
                    'Status': isDone ? 'Selesai' : 'Sedang Berkunjung'
                };
            })
        };
    }

    if (reportType === 'overdue') {
        const loans = getRecordsByType('loan').filter(l => {
            const st = (l.loanStatus || l.status || 'dipinjam').toLowerCase();
            const isReturned = st === 'dikembalikan' || st === 'returned';
            const fineInfo = typeof calculateFine === 'function' ? calculateFine(l.loanDueDate) : { daysLate: 0, fineAmount: 0 };
            const hasOverdue = !isReturned && fineInfo.daysLate > 0;
            return hasOverdue && isWithinDateRange(l.loanDate, startDate, endDate);
        });

        return {
            title: 'Laporan Keterlambatan & Denda Belum Lunas',
            filename: 'Laporan_Keterlambatan_Denda',
            columns: ['No', 'Barcode Buku', 'Judul Buku', 'Nama Peminjam', 'Tgl Pinjam', 'Jatuh Tempo', 'Terlambat (Hari)', 'Denda (Rp)'],
            rows: loans.map((l, i) => {
                const fineInfo = typeof calculateFine === 'function' ? calculateFine(l.loanDueDate) : { daysLate: 0, fineAmount: 0 };
                return {
                    'No': i + 1,
                    'Barcode Buku': l.loanBarcode || '-',
                    'Judul Buku': l.loanBookTitle || l.bookTitle || '-',
                    'Nama Peminjam': l.loanMember || l.memberName || '-',
                    'Tgl Pinjam': formatDate(l.loanDate),
                    'Jatuh Tempo': formatDate(l.loanDueDate),
                    'Terlambat (Hari)': fineInfo.daysLate,
                    'Denda (Rp)': fineInfo.fineAmount
                };
            })
        };
    }

    // Default: 'loans' (Laporan Sirkulasi Peminjaman)
    const loans = getRecordsByType('loan').filter(l => isWithinDateRange(l.loanDate, startDate, endDate));
    return {
        title: 'Laporan Sirkulasi Peminjaman',
        filename: 'Laporan_Sirkulasi_Peminjaman',
        columns: ['No', 'Barcode Buku', 'Judul Buku', 'Nama Peminjam', 'Jumlah', 'Tgl Pinjam', 'Jatuh Tempo', 'Status', 'Denda (Rp)'],
        rows: loans.map((l, i) => {
            const st = (l.loanStatus || l.status || 'dipinjam').toLowerCase();
            const isReturned = st === 'dikembalikan' || st === 'returned';
            const denda = isReturned
                ? (Number(l.fineAmount) || 0)
                : (typeof calculateFine === 'function' ? calculateFine(l.loanDueDate).fineAmount : 0);
            return {
                'No': i + 1,
                'Barcode Buku': l.loanBarcode || '-',
                'Judul Buku': l.loanBookTitle || l.bookTitle || '-',
                'Nama Peminjam': l.loanMember || l.memberName || '-',
                'Jumlah': Number(l.loanQuantity || l.quantity || 1),
                'Tgl Pinjam': formatDate(l.loanDate),
                'Jatuh Tempo': formatDate(l.loanDueDate),
                'Status': isReturned ? 'Dikembalikan' : 'Dipinjam',
                'Denda (Rp)': denda
            };
        })
    };
}

function renderReportsSection() {
    const books = getRecordsByType('book');
    const members = getRecordsByType('member');
    const loans = getRecordsByType('loan');

    let dipinjamCount = 0;
    let dikembalikanCount = 0;
    let dendaBelumLunasCount = 0;

    loans.forEach(l => {
        const st = (l.loanStatus || l.status || 'dipinjam').toLowerCase();
        const isReturned = st === 'dikembalikan' || st === 'returned';
        if (isReturned) {
            dikembalikanCount++;
        } else {
            dipinjamCount++;
            if (typeof calculateFine === 'function' && calculateFine(l.loanDueDate).fineAmount > 0) {
                dendaBelumLunasCount++;
            }
        }
    });

    return `
        <div class="space-y-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Laporan & Export Data</h2>
            </div>

            <!-- 2 KARTU SEJAJAR SESUAI DESAIN LAMA -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <!-- Kartu Kiri: Export Laporan -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                    <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
                        <span>📊</span> Export Laporan
                    </h3>

                    <div>
                        <label class="block text-xs font-semibold text-gray-700 mb-1.5">Pilih Jenis Laporan</label>
                        <select id="reportTypeSelect" onchange="updateReportPreview()" class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                            <option value="books">Laporan Koleksi Buku</option>
                            <option value="members">Laporan Data Anggota</option>
                            <option value="loans">Laporan Sirkulasi Peminjaman</option>
                            <option value="overdue">Laporan Keterlambatan & Denda</option>
                            <option value="visitors">Laporan Buku Tamu</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-gray-700 mb-1.5">Filter Tanggal</label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <input type="date" id="reportStartDate" onchange="updateReportPreview()" class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <span class="text-[11px] text-gray-400 mt-1 block">Dari tanggal</span>
                            </div>
                            <div>
                                <input type="date" id="reportEndDate" onchange="updateReportPreview()" class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <span class="text-[11px] text-gray-400 mt-1 block">Sampai tanggal</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3 pt-1">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button type="button" onclick="downloadSelectedReportExcel()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-colors">
                                <span>📊</span> Download Excel
                            </button>
                            <button type="button" onclick="downloadSelectedReportPDF()" class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-colors">
                                <span>📄</span> Download PDF
                            </button>
                        </div>
                        <button type="button" onclick="copyReportToClipboard()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-colors">
                            <span>📋</span> Copy untuk Google Sheets
                        </button>
                    </div>
                </div>

                <!-- Kartu Kanan: Ringkasan Data -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                    <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
                        <span>📈</span> Ringkasan Data
                    </h3>

                    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 text-center">
                            <p class="text-xl font-bold text-blue-600">${books.length}</p>
                            <p class="text-[11px] text-gray-500 mt-1 leading-tight">Total<br>Buku</p>
                        </div>
                        <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 text-center">
                            <p class="text-xl font-bold text-emerald-600">${members.length}</p>
                            <p class="text-[11px] text-gray-500 mt-1 leading-tight">Total<br>Anggota</p>
                        </div>
                        <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 text-center">
                            <p class="text-xl font-bold text-amber-500">${dipinjamCount}</p>
                            <p class="text-[11px] text-gray-500 mt-1 leading-tight">Dipinjam</p>
                        </div>
                        <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 text-center">
                            <p class="text-xl font-bold text-blue-600">${dikembalikanCount}</p>
                            <p class="text-[11px] text-gray-500 mt-1 leading-tight">Dikembalikan</p>
                        </div>
                        <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 text-center col-span-2 sm:col-span-1">
                            <p class="text-xl font-bold text-red-500">${dendaBelumLunasCount}</p>
                            <p class="text-[11px] text-gray-500 mt-1 leading-tight">Denda<br>Belum<br>Lunas</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PRATINJAU DATA LAPORAN -->
            <div id="reportPreviewContainer" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                ${buildReportPreviewHtml('books', '', '')}
            </div>
        </div>
    `;
}

function buildReportPreviewHtml(reportType, startDate, endDate) {
    const dataset = getFilteredReportDataset(reportType, startDate, endDate);

    const headHtml = dataset.columns.map(col => `<th class="p-3 text-left whitespace-nowrap">${col}</th>`).join('');
    let bodyHtml = '';

    if (dataset.rows.length === 0) {
        bodyHtml = `<tr><td colspan="${dataset.columns.length}" class="p-8 text-center text-gray-500">Tidak ada data untuk laporan ini pada rentang tanggal yang dipilih.</td></tr>`;
    } else {
        dataset.rows.forEach(row => {
            const cells = dataset.columns.map(col => `<td class="p-3 text-gray-700 whitespace-nowrap">${row[col] !== undefined ? row[col] : '-'}</td>`).join('');
            bodyHtml += `<tr class="border-b hover:bg-gray-50">${cells}</tr>`;
        });
    }

    return `
        <div class="px-5 py-3.5 border-b flex items-center justify-between bg-gray-50/60">
            <h4 class="font-bold text-gray-800 text-sm">Pratinjau: ${dataset.title}</h4>
            <span class="text-xs text-gray-500 font-medium">${dataset.rows.length} baris data</span>
        </div>
        <div class="overflow-x-auto max-h-96">
            <table class="w-full text-left border-collapse text-xs">
                <thead class="bg-gray-50 text-gray-600 uppercase border-b sticky top-0">
                    <tr>${headHtml}</tr>
                </thead>
                <tbody>${bodyHtml}</tbody>
            </table>
        </div>
    `;
}

function updateReportPreview() {
    const type = document.getElementById('reportTypeSelect')?.value || 'books';
    const start = document.getElementById('reportStartDate')?.value || '';
    const end = document.getElementById('reportEndDate')?.value || '';
    const container = document.getElementById('reportPreviewContainer');
    if (container) {
        container.innerHTML = buildReportPreviewHtml(type, start, end);
    }
}

function downloadSelectedReportExcel() {
    const type = document.getElementById('reportTypeSelect')?.value || 'books';
    const start = document.getElementById('reportStartDate')?.value || '';
    const end = document.getElementById('reportEndDate')?.value || '';
    const dataset = getFilteredReportDataset(type, start, end);

    if (dataset.rows.length === 0) {
        showToast("Tidak ada data untuk diunduh!", "error");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(dataset.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, dataset.title.substring(0, 31));
    XLSX.writeFile(wb, `${dataset.filename}.xlsx`);
    showToast(`${dataset.title} berhasil diunduh (Excel)!`, "success");
}

function downloadSelectedReportPDF() {
    const type = document.getElementById('reportTypeSelect')?.value || 'books';
    const start = document.getElementById('reportStartDate')?.value || '';
    const end = document.getElementById('reportEndDate')?.value || '';
    const dataset = getFilteredReportDataset(type, start, end);

    if (dataset.rows.length === 0) {
        showToast("Tidak ada data untuk dicetak ke PDF!", "error");
        return;
    }

    const libName = defaultConfig.libraryName || 'PerpusWeb';
    const libSub = defaultConfig.librarySubtitle || 'Sistem Informasi Perpustakaan';
    const periodText = (start || end) ? `Periode: ${start || 'Awal'} s/d ${end || 'Sekarang'}` : 'Semua Periode';

    const thHtml = dataset.columns.map(c => `<th>${c}</th>`).join('');
    const trHtml = dataset.rows.map(r => {
        const tds = dataset.columns.map(c => `<td>${r[c] !== undefined ? r[c] : '-'}</td>`).join('');
        return `<tr>${tds}</tr>`;
    }).join('');

    const printWin = window.open('', '_blank', 'width=1000,height=700');
    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${dataset.title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
                .header { text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 12px; margin-bottom: 18px; }
                .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
                .header p { margin: 4px 0 0; font-size: 12px; color: #4b5563; }
                .meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; }
                th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
                th { background-color: #f3f4f6; font-weight: bold; }
                @media print { @page { size: landscape; margin: 12mm; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${libName} — ${dataset.title}</h1>
                <p>${libSub}</p>
            </div>
            <div class="meta">
                <span>${periodText}</span>
                <span>Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <table>
                <thead><tr>${thHtml}</tr></thead>
                <tbody>${trHtml}</tbody>
            </table>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
    `);
    printWin.document.close();
}

async function copyReportToClipboard() {
    const type = document.getElementById('reportTypeSelect')?.value || 'books';
    const start = document.getElementById('reportStartDate')?.value || '';
    const end = document.getElementById('reportEndDate')?.value || '';
    const dataset = getFilteredReportDataset(type, start, end);

    if (dataset.rows.length === 0) {
        showToast("Tidak ada data untuk disalin!", "error");
        return;
    }

    // Format Tab-Separated Values (TSV) agar langsung rapi saat di-Paste (Ctrl+V) ke Google Sheets / Excel
    const headerLine = dataset.columns.join('\t');
    const dataLines = dataset.rows.map(row =>
        dataset.columns.map(col => String(row[col] ?? '').replace(/[\t\n\r]+/g, ' ')).join('\t')
    );
    const tsvContent = [headerLine, ...dataLines].join('\n');

    try {
        await navigator.clipboard.writeText(tsvContent);
        showToast("Data berhasil disalin! Silakan Paste (Ctrl+V) di Google Sheets.", "success");
    } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = tsvContent;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast("Data berhasil disalin! Silakan Paste (Ctrl+V) di Google Sheets.", "success");
    }
}

// Helper Otomatis Check-In saat pengunjung membaca buku di tempat
async function autoCheckInVisitorReading(namaPembaca, judulBuku = '') {
    const cleanName = String(namaPembaca || '').trim();
    if (!cleanName) return false;

    const alreadyActive = appState.allRecords.some(v => {
        if (v.type !== 'visitor') return false;
        const vName = (v.visitorName || v.name || '').trim().toLowerCase();
        const st = (v.visitorStatus || v.status || '').toLowerCase();
        const isOut = Boolean(v.visitorCheckOut || v.checkOut) || st === 'selesai' || st === 'checked_out';
        return vName === cleanName.toLowerCase() && !isOut;
    });

    if (alreadyActive) return false;

    const now = new Date();
    const nowIso = now.toISOString();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const memberRecord = appState.allRecords.find(m =>
        m.type === 'member' &&
        (m.memberName || m.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    );
    const kelasVal = memberRecord ? (memberRecord.memberClass || memberRecord.role || '-') : '-';

    const newVisitor = {
        visitorName: cleanName,
        name: cleanName,
        visitorClass: kelasVal,
        institution: kelasVal,
        visitorPurpose: 'Membaca Buku',
        purpose: 'Membaca Buku',
        visitorNotes: judulBuku ? `Membaca di tempat: ${judulBuku}` : 'Membaca buku di perpustakaan',
        visitorCheckIn: nowIso,
        visitDate: nowIso,
        timeIn: timeString,
        visitorCheckOut: '',
        visitorStatus: 'sedang_berkunjung',
        type: 'visitor'
    };

    const visResult = await window.dataSdk.sendData('create', newVisitor);
    if (visResult && visResult.success) {
        if (visResult.__backendId) newVisitor.__backendId = visResult.__backendId;
        if (visResult.id) newVisitor.id = visResult.id;
        appState.allRecords.push(newVisitor);
        return true;
    }
    return false;
}