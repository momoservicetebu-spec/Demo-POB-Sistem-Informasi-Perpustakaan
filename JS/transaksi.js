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
                ${loan.status === 'Dipinjam' ? `<button onclick="processReturn('${loan.__backendId || loan.id}')" class="text-indigo-600 hover:text-indigo-800 mx-1 font-medium bg-indigo-50 px-3 py-1 rounded">Kembalikan</button>` : '-'}                </td>
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

// JS/transaksi.js (Lanjutan)

// 1. FUNGSI MEMBUKA FORM PEMINJAMAN BUKU
function showAddLoanModal() {
    // Ambil data buku dan anggota dari memori untuk dijadikan pilihan Dropdown
    const books = getRecordsByType('book');
    const members = getRecordsByType('member');

    // Buat tag <option> untuk dropdown buku
    let bookOptions = '<option value="">-- Pilih Buku --</option>';
    books.forEach(b => {
        bookOptions += `<option value="${b.title}">${b.id} - ${b.title}</option>`;
    });

    // Buat tag <option> untuk dropdown anggota
    let memberOptions = '<option value="">-- Pilih Anggota --</option>';
    members.forEach(m => {
        memberOptions += `<option value="${m.name}">${m.id} - ${m.name}</option>`;
    });

    const formHtml = `
        <form onsubmit="saveLoan(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Anggota (Peminjam)</label>
                <select id="loanMember" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    ${memberOptions}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Buku</label>
                <select id="loanBook" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    ${bookOptions}
                </select>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Simpan Pinjaman</button>
            </div>
        </form>
    `;
    
    openModal("Catat Peminjaman Buku", formHtml);
}

// 2. FUNGSI MENYIMPAN TRANSAKSI KE DATABASE
async function saveLoan(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;
    
    const memberName = document.getElementById('loanMember').value;
    const bookTitle = document.getElementById('loanBook').value;
    const borrowDate = new Date().toISOString(); // Catat waktu dan tanggal saat ini
    
    const newLoan = {
        id: 'TRX-' + Math.floor(Math.random() * 10000), // ID Transaksi
        memberName: memberName,
        bookTitle: bookTitle,
        borrowDate: borrowDate,
        status: 'Dipinjam', // Status awal pasti 'Dipinjam'
        type: 'loan' // Penting untuk filter
    };
    
    // KIRIM KE GOOGLE APPS SCRIPT
    const result = await window.dataSdk.sendData('create', newLoan);
    
    if (result && result.success) {
        appState.allRecords.push(newLoan);
        closeModal();
        showToast("Peminjaman berhasil dicatat!", "success");
        renderCurrentSection(); 
    } else {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        showToast("Gagal mencatat peminjaman", "error");
    }
}

// 3. FUNGSI MEMPROSES PENGEMBALIAN BUKU
async function processReturn(backendId) {
    if(confirm("Apakah Anda yakin buku ini sudah dikembalikan oleh peminjam?")) {
        
        // Cari data transaksi lama di memori
        const loan = appState.allRecords.find(l => l.__backendId === backendId || l.id === backendId);
        
        if (!loan) {
            showToast("Data transaksi tidak ditemukan!", "error");
            return;
        }

        // Siapkan data pembaruan (Ubah status dan tambah tanggal kembali)
        const updatedLoan = {
            ...loan, // Ambil semua data lama (nama peminjam, judul buku, dll)
            __backendId: loan.__backendId || backendId, // Pastikan ID backend terbawa
            status: 'Dikembalikan', // Ubah status
            returnDate: new Date().toISOString() // Catat tanggal dikembalikan
        };

        // KIRIM UPDATE KE GOOGLE APPS SCRIPT
        const result = await window.dataSdk.sendData('update', updatedLoan);
        
        if (result && result.success) {
            // Update data di memori agar tabel langsung berubah
            appState.allRecords = appState.allRecords.map(record => 
                (record.__backendId === backendId || record.id === backendId) ? updatedLoan : record
            );
            
            showToast("Buku berhasil dikembalikan!", "success");
            renderCurrentSection();
        } else {
            showToast("Gagal memproses pengembalian", "error");
        }
    }
}

function processReturn(id) {
    if(confirm("Proses pengembalian buku untuk transaksi: " + id + "?")) {
        alert("Buku berhasil dikembalikan (Simulasi).");
    }
}