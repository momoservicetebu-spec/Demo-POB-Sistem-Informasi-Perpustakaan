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
        const judulBuku = trans.loanBookTitle || trans.bookTitle || kodeBuku;

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
                <td class="p-3 font-medium text-gray-800">${peminjam}</td>
                <td class="p-3">
                    <div class="font-medium text-gray-800">${judulBuku}</div>
                    ${judulBuku !== kodeBuku ? `<div class="text-xs font-mono text-gray-400">${kodeBuku}</div>` : ''}
                </td>
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
        rowsHtml = `<tr><td colspan="8" class="p-8 text-center text-gray-500">Belum ada data sirkulasi peminjaman.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Sirkulasi & Peminjaman</h2>
                    <p class="text-gray-500 text-sm">Catat peminjaman, pengembalian buku, dan pantau denda keterlambatan.</p>
                </div>
                <button onclick="showBorrowModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
                    <i data-lucide="arrow-right-left" class="w-4 h-4"></i> Catat Peminjaman
                </button>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"></i>
                    <input type="text" onkeyup="filterTable(this.value, 'loanTableBody')" placeholder="Cari nama peminjam, judul buku, atau status..." class="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

function showBorrowModal() {
    const books = getRecordsByType('book');
    const members = getRecordsByType('member');

    let bookOptions = '<option value="">-- Pilih Buku --</option>';
    books.forEach(b => {
        const kode = b.bookBarcode || b.id || '-';
        const judul = b.bookTitle || b.title || 'Tanpa Judul';
        const stok = b.bookStock !== undefined ? Number(b.bookStock) : 1;
        const disabledAttr = stok <= 0 ? 'disabled' : '';
        const stokLabel = stok <= 0 ? '(Stok Habis)' : `(Stok: ${stok})`;
        bookOptions += `<option value="${kode}" data-title="${judul}" ${disabledAttr}>${kode} - ${judul} ${stokLabel}</option>`;
    });

    let memberOptions = '<option value="">-- Pilih Anggota --</option>';
    members.forEach(m => {
        const idAnggota = m.memberCode || (m.__backendId ? m.__backendId.replace(/^ID[-_]/, '') : (m.id || '-'));
        const nama = m.memberName || m.name || 'Tanpa Nama';
        const kelas = m.memberClass || m.role || '';
        memberOptions += `<option value="${nama}">${idAnggota} - ${nama}${kelas ? ' (' + kelas + ')' : ''}</option>`;
    });

    const maxDays = Number(defaultConfig.maxLoanDays) || 7;

    const formHtml = `
        <form onsubmit="saveLoan(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Anggota (Peminjam) *</label>
                <select id="loanMember" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                    ${memberOptions}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Buku *</label>
                <select id="loanBook" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                    ${bookOptions}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Durasi Peminjaman (Hari)</label>
                <input type="number" id="loanDuration" value="${maxDays}" min="1" max="60" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                <p class="text-xs text-gray-400 mt-1">Denda keterlambatan: ${formatRupiah(defaultConfig.finePerDay)} / hari</p>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">Simpan Pinjaman</button>
            </div>
        </form>
    `;

    openModal("Catat Peminjaman Buku", formHtml);
}

async function saveLoan(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;

    const peminjam = document.getElementById('loanMember').value;
    const bookSelect = document.getElementById('loanBook');
    const kodeBuku = bookSelect.value;
    const selectedOption = bookSelect.options[bookSelect.selectedIndex];
    const judulBuku = selectedOption ? (selectedOption.getAttribute('data-title') || kodeBuku) : kodeBuku;
    const durasi = parseInt(document.getElementById('loanDuration').value) || Number(defaultConfig.maxLoanDays) || 7;

    const tglPinjam = new Date();
    const tglTenggat = new Date();
    tglTenggat.setDate(tglPinjam.getDate() + durasi);

    const newLoan = {
        loanMember: peminjam,
        loanBarcode: kodeBuku,
        loanBookTitle: judulBuku,
        loanDate: tglPinjam.toISOString(),
        loanDueDate: tglTenggat.toISOString(),
        loanStatus: 'dipinjam',
        type: 'loan',
        timestamp: new Date().toISOString()
    };

    const result = await window.dataSdk.sendData('create', newLoan);

    if (result && result.success) {
        appState.allRecords.push(newLoan);

        // Kurangi stok buku di state & backend jika tersedia
        const bookRecord = appState.allRecords.find(b => b.type === 'book' && (b.bookBarcode === kodeBuku || b.id === kodeBuku));
        if (bookRecord && bookRecord.bookStock !== undefined && Number(bookRecord.bookStock) > 0) {
            bookRecord.bookStock = Number(bookRecord.bookStock) - 1;
            if (bookRecord.__backendId) {
                await window.dataSdk.sendData('update', bookRecord);
            }
        }

        closeModal();
        showToast("Peminjaman berhasil dicatat!", "success");
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
    const confirmMsg = fineAmount > 0
        ? `Buku ini terlambat ${daysLate} hari dengan total denda ${formatRupiah(fineAmount)}. Konfirmasi pengembalian?`
        : "Apakah Anda yakin buku ini sudah dikembalikan oleh peminjam?";

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

        // Kembalikan stok buku (+1)
        const kodeBuku = loan.loanBarcode;
        const bookRecord = appState.allRecords.find(b => b.type === 'book' && (b.bookBarcode === kodeBuku || b.id === kodeBuku));
        if (bookRecord && bookRecord.bookStock !== undefined) {
            bookRecord.bookStock = Number(bookRecord.bookStock) + 1;
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