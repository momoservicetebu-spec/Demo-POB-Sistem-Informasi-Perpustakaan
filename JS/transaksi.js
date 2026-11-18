// JS/transaksi.js

function calculateFine(dueDateStr, returnDateStr = null) {
    if (!dueDateStr) return { daysLate: 0, fineAmount: 0 };
    const due = new Date(dueDateStr);
    const compareDate = returnDateStr ? new Date(returnDateStr) : new Date();

    due.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);

    const diffTime = compareDate - due;
    const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLate > 0) {
        const rate = Number(defaultConfig.finePerDay) || 1000;
        return { daysLate, fineAmount: daysLate * rate };
    }
    return { daysLate: 0, fineAmount: 0 };
}

function renderCirculationSection() {
    const transactions = getRecordsByType('loan');
    let rowsHtml = '';

    transactions.forEach((trans, index) => {
        const peminjam = trans.loanMember || trans.memberName || '-';
        const kodeBuku = trans.loanBarcode || '-';
        const judulBuku = trans.loanBookTitle || trans.bookTitle || '';
        const jumlahBuku = Number(trans.loanQuantity || trans.quantity || 1);

        const tglPinjam = trans.loanDate ? formatDate(trans.loanDate) : '-';
        const tglKembali = trans.loanDueDate ? formatDate(trans.loanDueDate) : '-';

        const statusRaw = (trans.loanStatus || trans.status || 'dipinjam').toLowerCase();
        const isReturned = statusRaw === 'dikembalikan' || statusRaw === 'returned';
        const targetId = trans.__backendId || trans.id || '';

        const { daysLate, fineAmount } = isReturned
            ? { daysLate: Number(trans.daysLate) || 0, fineAmount: Number(trans.fineAmount) || 0 }
            : calculateFine(trans.loanDueDate);

        let statusBadge = `<span class="bg-amber-100 text-amber-800 py-1 px-2.5 rounded-full text-xs font-medium">Dipinjam</span>`;
        if (isReturned) {
            statusBadge = `<span class="bg-emerald-100 text-emerald-800 py-1 px-2.5 rounded-full text-xs font-medium">Dikembalikan</span>`;
        } else if (daysLate > 0) {
            statusBadge = `<span class="bg-red-100 text-red-700 py-1 px-2.5 rounded-full text-xs font-medium">Terlambat ${daysLate} hr</span>`;
        }

        const fineDisplay = fineAmount > 0
            ? `<span class="text-red-600 font-semibold">${formatRupiah(fineAmount)}</span>`
            : `<span class="text-gray-400">Rp 0</span>`;

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 text-center text-gray-500">${index + 1}</td>
                <td class="p-3">
                    <div class="font-mono text-xs font-semibold text-blue-700">${kodeBuku}</div>
                    ${judulBuku && judulBuku !== kodeBuku ? `<div class="text-xs text-gray-600 mt-0.5">${judulBuku}</div>` : ''}
                </td>
                <td class="p-3 font-medium text-gray-800">${peminjam}</td>
                <td class="p-3 text-center font-medium text-gray-700">${jumlahBuku}</td>
                <td class="p-3 text-gray-600">${tglPinjam}</td>
                <td class="p-3 text-gray-600">${tglKembali}</td>
                <td class="p-3">${statusBadge}</td>
                <td class="p-3">${fineDisplay}</td>
                <td class="p-3 text-center whitespace-nowrap">
                    ${!isReturned
                        ? `<button onclick="processReturn('${targetId}')" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">Kembalikan</button>`
                        : `<span class="text-gray-400 text-xs">Selesai (${trans.returnDate ? formatDate(trans.returnDate) : '-'})</span>`}
                </td>
            </tr>
        `;
    });

    if (transactions.length === 0) {
        rowsHtml = `<tr><td colspan="9" class="p-8 text-center text-gray-500">Belum ada data sirkulasi peminjaman.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Sirkulasi & Peminjaman</h2>
                    <p class="text-gray-500 text-sm">Catat peminjaman, pengembalian buku, dan pantau denda keterlambatan.</p>
                </div>
                <button onclick="showBorrowModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i> Tambah Peminjaman
                </button>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"></i>
                    <input type="text" onkeyup="filterTable(this.value, 'loanTableBody')" placeholder="Cari barcode buku, nama peminjam, atau status..." class="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th class="p-3 w-14 text-center">No</th>
                                <th class="p-3">Barcode Buku</th>
                                <th class="p-3">Nama Peminjam</th>
                                <th class="p-3 text-center">Jumlah Buku</th>
                                <th class="p-3">Tgl. Pinjam</th>
                                <th class="p-3">Jatuh Tempo</th>
                                <th class="p-3">Status</th>
                                <th class="p-3">Denda</th>
                                <th class="p-3 w-36 text-center">Aksi</th>
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

// Helper untuk mendeteksi buku secara langsung saat barcode di-scan / diketik
function handleLoanBarcodePreview(val) {
    const previewEl = document.getElementById('loanBookPreview');
    if (!previewEl) return;

    const term = val.trim().toLowerCase();
    if (!term) {
        previewEl.classList.add('hidden');
        previewEl.innerHTML = '';
        return;
    }

    const books = getRecordsByType('book');
    const matched = books.find(b =>
        (b.bookBarcode || b.id || '').toString().toLowerCase() === term ||
        (b.bookTitle || b.title || '').toString().toLowerCase().includes(term)
    );

    if (matched) {
        const judul = matched.bookTitle || matched.title || '-';
        const stok = matched.bookStock !== undefined ? Number(matched.bookStock) : 1;
        previewEl.classList.remove('hidden');
        previewEl.className = `mt-1.5 text-xs px-3 py-1.5 rounded-lg ${stok > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`;
        previewEl.innerHTML = `Buku ditemukan: <strong>${judul}</strong> (Tersedia: ${stok} eks)`;
    } else {
        previewEl.classList.remove('hidden');
        previewEl.className = 'mt-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700';
        previewEl.innerHTML = 'Barcode belum terdaftar di katalog, akan tetap dicatat sebagai input manual.';
    }
}

// Helper menghitung ulang tanggal jatuh tempo jika Tanggal Pinjam diubah
function updateDueDateFromLoanDate() {
    const loanDateInput = document.getElementById('loanDate');
    const dueDateInput = document.getElementById('loanDueDate');
    if (!loanDateInput || !dueDateInput || !loanDateInput.value) return;

    const maxDays = Number(defaultConfig.maxLoanDays) || 7;
    const baseDate = new Date(loanDateInput.value);
    baseDate.setDate(baseDate.getDate() + maxDays);
    dueDateInput.value = baseDate.toISOString().split('T')[0];
}

function showBorrowModal() {
    const books = getRecordsByType('book');
    const members = getRecordsByType('member');

    // Datalist untuk Barcode / Judul Buku (bisa scan scanner, ketik manual, atau pilih dari saran)
    let bookDatalist = '';
    books.forEach(b => {
        const kode = b.bookBarcode || b.id || '';
        const judul = b.bookTitle || b.title || '';
        const stok = b.bookStock !== undefined ? b.bookStock : 1;
        if (kode) {
            bookDatalist += `<option value="${kode}">${judul} (Stok: ${stok})</option>`;
        }
    });

    // Datalist untuk Pencarian Nama Anggota
    let memberDatalist = '';
    members.forEach(m => {
        const nama = m.memberName || m.name || '';
        const kelas = m.memberClass || m.role || '';
        const kode = m.memberCode || '';
        if (nama) {
            memberDatalist += `<option value="${nama}">${kode ? kode + ' - ' : ''}${kelas}</option>`;
        }
    });

    // Format YYYY-MM-DD untuk input type="date"
    const today = new Date();
    const due = new Date();
    const maxDays = Number(defaultConfig.maxLoanDays) || 7;
    due.setDate(today.getDate() + maxDays);

    const todayStr = today.toISOString().split('T')[0];
    const dueStr = due.toISOString().split('T')[0];

    const formHtml = `
        <form onsubmit="saveLoan(event)" class="space-y-4">
            <!-- 1. Barcode Buku -->
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Barcode Buku <span class="text-red-500">*</span></label>
                <input type="text" id="loanBarcode" list="bookBarcodeList" oninput="handleLoanBarcodePreview(this.value)" required autofocus
                    placeholder="Scan atau input barcode buku"
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                <datalist id="bookBarcodeList">${bookDatalist}</datalist>
                <p class="text-xs text-gray-500 mt-1">Wajib - gunakan scanner atau input manual</p>
                <div id="loanBookPreview" class="hidden"></div>
            </div>

            <!-- 2. Nama Peminjam (Cari dari daftar) -->
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Nama Peminjam <span class="text-red-500">*</span></label>
                <input type="text" id="loanMember" list="memberNameList" required
                    placeholder="Ketik nama anggota untuk mencari..."
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                <datalist id="memberNameList">${memberDatalist}</datalist>
                <p class="text-xs text-gray-500 mt-1">Cari dan pilih nama anggota dari daftar</p>
            </div>

            <!-- 3. Jumlah Buku -->
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Jumlah Buku <span class="text-red-500">*</span></label>
                <input type="number" id="loanQuantity" value="1" min="1" max="50" required
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                <p class="text-xs text-gray-500 mt-1">Input jumlah buku yang dipinjam</p>
            </div>

            <!-- 4. Tanggal Pinjam & Jatuh Tempo (2 Kolom) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-800 mb-1.5">Tanggal Pinjam</label>
                    <input type="date" id="loanDate" value="${todayStr}" onchange="updateDueDateFromLoanDate()" required
                        class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-800 mb-1.5">Jatuh Tempo <span class="text-red-500">*</span></label>
                    <input type="date" id="loanDueDate" value="${dueStr}" required
                        class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                </div>
            </div>
            
            <!-- 5. Tombol Aksi Sesuai Desain Awal -->
            <div class="pt-4 flex items-center gap-3">
                <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm shadow-sm transition-colors">
                    Simpan Peminjaman
                </button>
                <button type="button" onclick="closeModal()" class="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
                    Batal
                </button>
            </div>
        </form>
    `;

    openModal("Tambah Peminjaman", formHtml, "max-w-lg");
}

async function saveLoan(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;

    const barcodeInput = document.getElementById('loanBarcode').value.trim();
    const peminjam = document.getElementById('loanMember').value.trim();
    const jumlahBuku = parseInt(document.getElementById('loanQuantity').value) || 1;
    const tglPinjamVal = document.getElementById('loanDate').value;
    const tglTenggatVal = document.getElementById('loanDueDate').value;

    // Cari kecocokan buku di katalog untuk mendapatkan judul & cek stok
    const bookRecord = appState.allRecords.find(b =>
        b.type === 'book' && (
            (b.bookBarcode || b.id || '').toString().toLowerCase() === barcodeInput.toLowerCase() ||
            (b.bookTitle || b.title || '').toString().toLowerCase() === barcodeInput.toLowerCase()
        )
    );

    if (bookRecord && bookRecord.bookStock !== undefined && Number(bookRecord.bookStock) < jumlahBuku) {
        showToast(`Stok buku tidak mencukupi! Tersisa ${bookRecord.bookStock} eksemplar.`, "error");
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }

    const kodeFinal = bookRecord ? (bookRecord.bookBarcode || barcodeInput) : barcodeInput;
    const judulFinal = bookRecord ? (bookRecord.bookTitle || bookRecord.title || barcodeInput) : barcodeInput;

    const newLoan = {
        loanBarcode: kodeFinal,
        loanBookTitle: judulFinal,
        loanMember: peminjam,
        loanQuantity: jumlahBuku,
        loanDate: tglPinjamVal ? new Date(tglPinjamVal).toISOString() : new Date().toISOString(),
        loanDueDate: tglTenggatVal ? new Date(tglTenggatVal).toISOString() : new Date().toISOString(),
        loanStatus: 'dipinjam',
        type: 'loan',
        timestamp: new Date().toISOString()
    };

    const result = await window.dataSdk.sendData('create', newLoan);

    if (result && result.success) {
        appState.allRecords.push(newLoan);

        // Kurangi stok buku sesuai jumlah yang dipinjam
        if (bookRecord && bookRecord.bookStock !== undefined) {
            bookRecord.bookStock = Math.max(0, Number(bookRecord.bookStock) - jumlahBuku);
            if (bookRecord.__backendId) {
                await window.dataSdk.sendData('update', bookRecord);
            }
        }

        closeModal();
        showToast("Peminjaman berhasil disimpan!", "success");
        renderCurrentSection();
    } else {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        showToast("Gagal mencatat peminjaman", "error");
    }
}

async function processReturn(backendId) {
    const loan = appState.allRecords.find(l => l.__backendId === backendId || l.id === backendId);

    if (!loan) {
        showToast("Data transaksi tidak ditemukan!", "error");
        return;
    }

    const { daysLate, fineAmount } = calculateFine(loan.loanDueDate);
    const qty = Number(loan.loanQuantity || loan.quantity || 1);

    const confirmMsg = fineAmount > 0
        ? `Buku (${qty} eks) terlambat ${daysLate} hari dengan total denda ${formatRupiah(fineAmount)}. Konfirmasi pengembalian?`
        : `Konfirmasi pengembalian ${qty} eksemplar buku ini?`;

    if (!confirm(confirmMsg)) return;

    const updatedLoan = {
        ...loan,
        __backendId: loan.__backendId || backendId,
        loanStatus: 'dikembalikan',
        status: 'Dikembalikan',
        returnDate: new Date().toISOString(),
        daysLate: daysLate,
        fineAmount: fineAmount
    };

    const result = await window.dataSdk.sendData('update', updatedLoan);

    if (result && result.success) {
        appState.allRecords = appState.allRecords.map(record =>
            (record.__backendId === backendId || record.id === backendId) ? updatedLoan : record
        );

        // Kembalikan stok buku sesuai jumlah yang dipinjam
        const kodeBuku = loan.loanBarcode;
        const bookRecord = appState.allRecords.find(b => b.type === 'book' && (b.bookBarcode === kodeBuku || b.id === kodeBuku));
        if (bookRecord && bookRecord.bookStock !== undefined) {
            bookRecord.bookStock = Number(bookRecord.bookStock) + qty;
            if (bookRecord.__backendId) {
                await window.dataSdk.sendData('update', bookRecord);
            }
        }

        showToast(fineAmount > 0 ? `Buku dikembalikan (Denda: ${formatRupiah(fineAmount)})` : "Buku berhasil dikembalikan!", "success");
        renderCurrentSection();
    } else {
        showToast("Gagal memproses pengembalian", "error");
    }
}