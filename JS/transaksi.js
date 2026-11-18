// JS/transaksi.js

// 1. Gambar Halaman Tabel Peminjaman
function renderLoansSection() {
    // Ambil data peminjaman
    const loans = getRecordsByType('loan');
    
    let rowsHtml = '';
    loans.forEach((loan, index) => {
        // Tentukan warna status berdasarkan kondisi
        let statusBadge = '';
        if (loan.status === 'Dipinjam') {
            statusBadge = `<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Dipinjam</span>`;
        } else {
            statusBadge = `<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Dikembalikan</span>`;
        }

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 text-center">${index + 1}</td>
                <td class="p-3 font-medium">${loan.id || '-'}</td>
                <td class="p-3">${loan.memberName || '-'}</td>
                <td class="p-3">${loan.bookTitle || '-'}</td>
                <td class="p-3">${formatDate(loan.borrowDate)}</td>
                <td class="p-3">${statusBadge}</td>
                <td class="p-3 text-center">
                    ${loan.status === 'Dipinjam' ? `<button onclick="processReturn('${loan.id}')" class="text-indigo-600 hover:text-indigo-800 mx-1 font-medium bg-indigo-50 px-3 py-1 rounded">Kembalikan</button>` : '-'}
                </td>
            </tr>
        `;
    });

    if (loans.length === 0) {
        rowsHtml = `<tr><td colspan="7" class="p-6 text-center text-gray-500">Belum ada data transaksi peminjaman.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Sirkulasi Peminjaman</h2>
                    <p class="text-gray-500 text-sm">Catat peminjaman dan pengembalian buku.</p>
                </div>
                <button onclick="showAddLoanModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <i data-lucide="book-up" class="w-4 h-4"></i> Pinjamkan Buku
                </button>
            </div>

            <!-- Tabel Data -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-sm">
                            <tr>
                                <th class="p-3 w-16 text-center">No</th>
                                <th class="p-3">ID Transaksi</th>
                                <th class="p-3">Peminjam</th>
                                <th class="p-3">Buku</th>
                                <th class="p-3">Tgl Pinjam</th>
                                <th class="p-3">Status</th>
                                <th class="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="loanTableBody" class="text-sm">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// 2. Fungsi Dummy untuk Aksi Transaksi
function showAddLoanModal() {
    alert("Form Peminjaman Buku akan muncul di sini.");
}

function processReturn(id) {
    if(confirm("Proses pengembalian buku untuk transaksi: " + id + "?")) {
        alert("Buku berhasil dikembalikan (Simulasi).");
    }
}