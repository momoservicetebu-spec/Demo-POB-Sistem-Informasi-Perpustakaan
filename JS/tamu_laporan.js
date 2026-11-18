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

function showAddVisitorModal() {
    alert("Form Isi Buku Tamu akan muncul di sini.");
}

function exportVisitorsCSV() {
    alert("Fitur Export CSV akan dihubungkan dengan library xlsx.");
}