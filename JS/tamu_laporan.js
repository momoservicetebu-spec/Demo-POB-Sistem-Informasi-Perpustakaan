// JS/tamu_laporan.js

// 1. Gambar Halaman Tabel Pengunjung (Buku Tamu)
function renderVisitorsSection() {
    const visitors = getRecordsByType('visitor');
    
    let rowsHtml = '';
    visitors.forEach((visitor, index) => {
        rowsHtml += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 text-center">${index + 1}</td>
                <td class="p-3 font-medium">${visitor.name || '-'}</td>
                <td class="p-3">${visitor.institution || '-'}</td>
                <td class="p-3">${visitor.purpose || '-'}</td>
                <td class="p-3">${formatDate(visitor.visitDate)}</td>
                <td class="p-3 text-center">
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">${visitor.timeIn || '-'}</span>
                </td>
            </tr>
        `;
    });

    if (visitors.length === 0) {
        rowsHtml = `<tr><td colspan="6" class="p-6 text-center text-gray-500">Belum ada data pengunjung hari ini.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Buku Tamu</h2>
                    <p class="text-gray-500 text-sm">Catatan daftar hadir pengunjung perpustakaan.</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="exportVisitorsCSV()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Export CSV
                    </button>
                    <button onclick="showAddVisitorModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <i data-lucide="user-check" class="w-4 h-4"></i> Isi Buku Tamu
                    </button>
                </div>
            </div>

            <!-- Tabel Data -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-sm">
                            <tr>
                                <th class="p-3 w-16 text-center">No</th>
                                <th class="p-3">Nama Pengunjung</th>
                                <th class="p-3">Instansi/Kelas</th>
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

// JS/tamu_laporan.js

function renderVisitorsSection() {
    const visitors = getRecordsByType('visitor');
    
    let rowsHtml = '';
    visitors.forEach((visitor, index) => {
        rowsHtml += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 text-center">${index + 1}</td>
                <td class="p-3 font-medium">${visitor.name || '-'}</td>
                <td class="p-3">${visitor.institution || '-'}</td>
                <td class="p-3">${visitor.purpose || '-'}</td>
                <td class="p-3">${formatDate(visitor.visitDate)}</td>
                <td class="p-3 text-center">
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">${visitor.timeIn || '-'}</span>
                </td>
            </tr>
        `;
    });

    if (visitors.length === 0) {
        rowsHtml = `<tr><td colspan="6" class="p-6 text-center text-gray-500">Belum ada data pengunjung.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Buku Tamu</h2>
                    <p class="text-gray-500 text-sm">Catatan daftar hadir pengunjung perpustakaan.</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="exportVisitorsCSV()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Export Data
                    </button>
                    <button onclick="showAddVisitorModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <i data-lucide="user-check" class="w-4 h-4"></i> Isi Buku Tamu
                    </button>
                </div>
            </div>

            <!-- Tabel Data -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-sm">
                            <tr>
                                <th class="p-3 w-16 text-center">No</th>
                                <th class="p-3">Nama Pengunjung</th>
                                <th class="p-3">Instansi/Kelas</th>
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

// FUNGSI MENAMPILKAN FORM BUKU TAMU
function showAddVisitorModal() {
    const formHtml = `
        <form onsubmit="saveVisitor(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" id="visitorName" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Instansi / Kelas</label>
                <input type="text" id="visitorInst" placeholder="Contoh: Kelas 10A / Umum" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Keperluan</label>
                <select id="visitorPurpose" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="Membaca Buku">Membaca Buku</option>
                    <option value="Meminjam Buku">Meminjam Buku</option>
                    <option value="Mengerjakan Tugas">Mengerjakan Tugas</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Simpan Kehadiran</button>
            </div>
        </form>
    `;
    openModal("Isi Buku Tamu", formHtml);
}

// FUNGSI MENYIMPAN PENGUNJUNG KE DATABASE
async function saveVisitor(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    const newVisitor = {
        name: document.getElementById('visitorName').value,
        institution: document.getElementById('visitorInst').value,
        purpose: document.getElementById('visitorPurpose').value,
        visitDate: now.toISOString(),
        timeIn: timeString,
        type: 'visitor' // Penting untuk filter
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

// FUNGSI EXPORT DATA KE EXCEL/CSV MENGGUNAKAN SHEET.JS
function exportVisitorsCSV() {
    const visitors = getRecordsByType('visitor');
    if (visitors.length === 0) {
        showToast("Tidak ada data untuk diexport", "error");
        return;
    }

    // Bersihkan data sebelum diexport
    const cleanData = visitors.map((v, i) => ({
        "No": i + 1,
        "Nama": v.name,
        "Instansi/Kelas": v.institution,
        "Keperluan": v.purpose,
        "Tanggal Kunjungan": formatDate(v.visitDate),
        "Jam Masuk": v.timeIn
    }));

    // Buat worksheet dan workbook
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buku Tamu");

    // Download file
    XLSX.writeFile(wb, "Laporan_Buku_Tamu.xlsx");
    showToast("File berhasil diunduh!", "success");
}
