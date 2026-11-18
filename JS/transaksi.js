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
    const transactions = [...getRecordsByType('loan')].sort((a, b) => {
        const timeA = new Date(a.timestamp || a.loanDate || 0).getTime();
        const timeB = new Date(b.timestamp || b.loanDate || 0).getTime();
        return timeB - timeA;
    });
    const allBooks = getRecordsByType('book');
    let rowsHtml = '';

    transactions.forEach((trans, index) => {
        const peminjam = trans.loanMember || trans.memberName || '-';
        const kodeBuku = String(trans.loanBarcode || trans.bookBarcode || '-').trim();

        // Cari judul buku dari transaksi, atau cocokkan otomatis via barcode di katalog buku
        const matchedBook = allBooks.find(b =>
            String(b.bookBarcode || b.barcode || '').trim() === kodeBuku
        );
        const judulBuku = (trans.loanBookTitle && trans.loanBookTitle !== kodeBuku)
            ? trans.loanBookTitle
            : (trans.bookTitle && trans.bookTitle !== kodeBuku)
                ? trans.bookTitle
                : (matchedBook ? (matchedBook.bookTitle || matchedBook.title || '-') : '-');

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
            const condNote = trans.bookCondition && trans.bookCondition !== 'Baik' ? ` (${trans.bookCondition})` : '';
            statusBadge = `<span class="bg-emerald-100 text-emerald-800 py-1 px-2.5 rounded-full text-xs font-medium">Dikembalikan${condNote}</span>`;
        } else if (daysLate > 0) {
            statusBadge = `<span class="bg-red-100 text-red-700 py-1 px-2.5 rounded-full text-xs font-medium">Terlambat ${daysLate} hr</span>`;
        }

        const fineDisplay = fineAmount > 0
            ? `<span class="text-red-600 font-semibold">${formatRupiah(fineAmount)}</span>`
            : `<span class="text-gray-400">Rp 0</span>`;

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-center text-gray-500">${index + 1}</td>
                <td class="px-4 py-3 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">${kodeBuku}</td>
                <td class="px-4 py-3 font-medium text-gray-800">${peminjam}</td>
                <td class="px-4 py-3 text-gray-700 font-medium max-w-xs">
                    <div class="line-clamp-2" title="${judulBuku}">${judulBuku}</div>
                </td>
                <td class="px-4 py-3 text-center font-medium text-gray-700">${jumlahBuku}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">${tglPinjam}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">${tglKembali}</td>
                <td class="px-4 py-3 text-center">${statusBadge}</td>
                <td class="px-4 py-3 text-right whitespace-nowrap">${fineDisplay}</td>
                <td class="px-4 py-3 text-center whitespace-nowrap">
                    <div class="inline-flex items-center justify-center gap-1.5">
                        <button onclick="showEditLoanModal('${targetId}')" title="Edit Peminjaman"
                            class="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                            <i data-lucide="pencil" class="w-4 h-4"></i>
                        </button>
                        ${!isReturned
                            ? `<button onclick="showReturnConfirmModal('${targetId}')" title="Konfirmasi Pengembalian"
                                class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                                <i data-lucide="book-check" class="w-4 h-4"></i>
                               </button>`
                            : `<span title="Selesai (${trans.returnDate ? formatDate(trans.returnDate) : '-'})"
                                class="p-1.5 rounded-lg bg-gray-100 text-emerald-600 cursor-default">
                                <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                               </span>`}
                        <button onclick="deleteLoanTransaction('${targetId}')" title="Hapus Transaksi"
                            class="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    if (transactions.length === 0) {
        rowsHtml = `<tr><td colspan="10" class="p-8 text-center text-gray-500">Belum ada data sirkulasi peminjaman.</td></tr>`;
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
                    <input type="text" onkeyup="filterTable(this.value, 'loanTableBody')" placeholder="Cari barcode buku, nama peminjam, nama buku, atau status..." class="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th class="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">NO</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">BARCODE BUKU</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">NAMA PEMINJAM</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">NAMA BUKU</th>
                                <th class="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">JUMLAH BUKU</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">TGL. PINJAM</th>
                                <th class="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">JATUH TEMPO</th>
                                <th class="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">STATUS</th>
                                <th class="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">DENDA</th>
                                <th class="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">AKSI</th>
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

    let bookDatalist = '';
    books.forEach(b => {
        const kode = b.bookBarcode || b.id || '';
        const judul = b.bookTitle || b.title || '';
        const stok = b.bookStock !== undefined ? b.bookStock : 1;
        if (kode) {
            bookDatalist += `<option value="${kode}">${judul} (Stok: ${stok})</option>`;
        }
    });

    let memberDatalist = '';
    members.forEach(m => {
        const nama = m.memberName || m.name || '';
        const kelas = m.memberClass || m.role || '';
        const kode = m.memberCode || '';
        if (nama) {
            memberDatalist += `<option value="${nama}">${kode ? kode + ' - ' : ''}${kelas}</option>`;
        }
    });

    const today = new Date();
    const due = new Date();
    const maxDays = Number(defaultConfig.maxLoanDays) || 7;
    due.setDate(today.getDate() + maxDays);

    const todayStr = today.toISOString().split('T')[0];
    const dueStr = due.toISOString().split('T')[0];

    const formHtml = `
        <form onsubmit="saveLoan(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Barcode Buku <span class="text-red-500">*</span></label>
                <input type="text" id="loanBarcode" list="bookBarcodeList" oninput="handleLoanBarcodePreview(this.value)" required autofocus
                    placeholder="Scan atau input barcode buku"
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                <datalist id="bookBarcodeList">${bookDatalist}</datalist>
                <p class="text-xs text-gray-500 mt-1">Wajib - gunakan scanner atau input manual</p>
                <div id="loanBookPreview" class="hidden"></div>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Nama Peminjam <span class="text-red-500">*</span></label>
                <input type="text" id="loanMember" list="memberNameList" required
                    placeholder="Ketik nama anggota untuk mencari..."
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                <datalist id="memberNameList">${memberDatalist}</datalist>
                <p class="text-xs text-gray-500 mt-1">Cari dan pilih nama anggota dari daftar</p>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Jumlah Buku <span class="text-red-500">*</span></label>
                <input type="number" id="loanQuantity" value="1" min="1" max="50" required
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm">
                <p class="text-xs text-gray-500 mt-1">Input jumlah buku yang dipinjam</p>
            </div>

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
        if (result.__backendId) newLoan.__backendId = result.__backendId;
        if (result.id) newLoan.id = result.id;
        appState.allRecords.push(newLoan);

        if (bookRecord && bookRecord.bookStock !== undefined) {
            bookRecord.bookStock = Math.max(0, Number(bookRecord.bookStock) - jumlahBuku);
            if (bookRecord.__backendId) {
                await window.dataSdk.sendData('update', bookRecord);
            }
        }

        // Otomatis Check-In ke Buku Tamu
        const autoCheckedIn = typeof autoCheckInVisitorFromLoan === 'function'
            ? await autoCheckInVisitorFromLoan(peminjam, judulFinal, newLoan.timestamp)
            : false;

        closeModal();
        showToast(
            autoCheckedIn
                ? "Peminjaman disimpan & Otomatis Check-In ke Buku Tamu!"
                : "Peminjaman berhasil disimpan!",
            "success"
        );
        renderCurrentSection();
    }
}
// =========================================================================
// FITUR EDIT DATA PEMINJAMAN
// =========================================================================
function showEditLoanModal(backendId) {
    const trans = appState.allRecords.find(l => l.__backendId === backendId || l.id === backendId);
    if (!trans) {
        showToast("Data transaksi tidak ditemukan!", "error");
        return;
    }

    const books = getRecordsByType('book');
    const members = getRecordsByType('member');

    const kodeBuku = trans.loanBarcode || trans.bookBarcode || '';
    const matchedBook = books.find(b => String(b.bookBarcode || b.id || '').trim() === String(kodeBuku).trim());
    const judulBuku = trans.loanBookTitle || trans.bookTitle || (matchedBook ? (matchedBook.bookTitle || matchedBook.title || '') : '');
    const peminjam = trans.loanMember || trans.memberName || '';
    const jumlahBuku = Number(trans.loanQuantity || trans.quantity || 1);

    const tglPinjamStr = trans.loanDate ? new Date(trans.loanDate).toISOString().split('T')[0] : '';
    const jatuhTempoStr = trans.loanDueDate ? new Date(trans.loanDueDate).toISOString().split('T')[0] : '';

    let memberDatalist = '';
    members.forEach(m => {
        const nama = m.memberName || m.name || '';
        const kelas = m.memberClass || m.role || '';
        if (nama) memberDatalist += `<option value="${nama}">${kelas}</option>`;
    });

    const formHtml = `
        <form onsubmit="handleEditLoanSubmit(event, '${backendId}')" class="space-y-4">
            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Barcode Buku <span class="text-red-500">*</span></label>
                <input type="text" id="editLoanBarcode" value="${kodeBuku}" required
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Nama / Judul Buku</label>
                <input type="text" id="editLoanBookTitle" value="${judulBuku}"
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1.5">Nama Peminjam <span class="text-red-500">*</span></label>
                <input type="text" id="editLoanMember" list="editMemberList" value="${peminjam}" required
                    class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <datalist id="editMemberList">${memberDatalist}</datalist>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label class="block text-sm font-semibold text-gray-800 mb-1.5">Jumlah Buku <span class="text-red-500">*</span></label>
                    <input type="number" id="editLoanQuantity" value="${jumlahBuku}" min="1" max="50" required
                        class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-800 mb-1.5">Tgl. Pinjam</label>
                    <input type="date" id="editLoanDate" value="${tglPinjamStr}" required
                        class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-800 mb-1.5">Jatuh Tempo</label>
                    <input type="date" id="editLoanDueDate" value="${jatuhTempoStr}" required
                        class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <div class="pt-4 flex items-center gap-3 border-t">
                <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm shadow-sm transition-colors">
                    Simpan Perubahan
                </button>
                <button type="button" onclick="closeModal()" class="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
                    Batal
                </button>
            </div>
        </form>
    `;

    openModal("Edit Data Peminjaman", formHtml, "max-w-lg");
}

async function handleEditLoanSubmit(event, backendId) {
    event.preventDefault();
    const trans = appState.allRecords.find(l => l.__backendId === backendId || l.id === backendId);
    if (!trans) return;

    const oldQty = Number(trans.loanQuantity || trans.quantity || 1);
    const newQty = parseInt(document.getElementById('editLoanQuantity').value) || 1;
    const newBarcode = document.getElementById('editLoanBarcode').value.trim();
    const newTitle = document.getElementById('editLoanBookTitle').value.trim();
    const newMember = document.getElementById('editLoanMember').value.trim();
    const newLoanDateVal = document.getElementById('editLoanDate').value;
    const newDueDateVal = document.getElementById('editLoanDueDate').value;

    const statusRaw = (trans.loanStatus || trans.status || 'dipinjam').toLowerCase();
    const isReturned = statusRaw === 'dikembalikan' || statusRaw === 'returned';

    const updatedLoan = {
        ...trans,
        __backendId: trans.__backendId || backendId,
        loanBarcode: newBarcode,
        loanBookTitle: newTitle,
        loanMember: newMember,
        loanQuantity: newQty,
        loanDate: newLoanDateVal ? new Date(newLoanDateVal).toISOString() : trans.loanDate,
        loanDueDate: newDueDateVal ? new Date(newDueDateVal).toISOString() : trans.loanDueDate
    };

    closeModal();
    const result = await window.dataSdk.sendData('update', updatedLoan);

    if (result && result.success !== false) {
        appState.allRecords = appState.allRecords.map(record =>
            (record.__backendId === backendId || record.id === backendId) ? updatedLoan : record
        );

        // Kembalikan stok buku sesuai jumlah yang dipinjam (kecuali jika kondisi 'Hilang')
        if (condition !== 'Hilang') {
            const kodeBuku = loan.loanBarcode;
            const bookRecord = appState.allRecords.find(b => b.type === 'book' && (b.bookBarcode === kodeBuku || b.id === kodeBuku));
            if (bookRecord && bookRecord.bookStock !== undefined) {
                bookRecord.bookStock = Number(bookRecord.bookStock) + qty;
                if (bookRecord.__backendId) {
                    await window.dataSdk.sendData('update', bookRecord);
                }
            }
        }

        // Otomatis Check-Out dari Buku Tamu
        const peminjamName = loan.loanMember || loan.memberName || '';
        const autoCheckedOut = typeof autoCheckOutVisitorFromReturn === 'function'
            ? await autoCheckOutVisitorFromReturn(peminjamName, updatedLoan.returnDate)
            : false;

        const baseMsg = fineAmount > 0
            ? `Buku dikembalikan (${condition}) • Denda: ${formatRupiah(fineAmount)}`
            : `Buku berhasil dikembalikan (Kondisi: ${condition})!`;

        showToast(
            autoCheckedOut
                ? `${baseMsg} & Otomatis Check-Out Buku Tamu!`
                : baseMsg,
            "success"
        );
        renderCurrentSection();
    }
}

// =========================================================================
// FITUR FORM KONFIRMASI PENGEMBALIAN (SESUAI APLIKASI LAMA)
// =========================================================================
function showReturnConfirmModal(backendId) {
    const loan = appState.allRecords.find(l => l.__backendId === backendId || l.id === backendId);
    if (!loan) {
        showToast("Data transaksi tidak ditemukan!", "error");
        return;
    }

    const peminjam = loan.loanMember || loan.memberName || '-';
    const kodeBuku = loan.loanBarcode || loan.bookBarcode || '-';
    const qty = Number(loan.loanQuantity || loan.quantity || 1);
    const tglPinjam = loan.loanDate ? formatDate(loan.loanDate) : '-';
    const jatuhTempo = loan.loanDueDate ? formatDate(loan.loanDueDate) : '-';

    const { daysLate, fineAmount } = calculateFine(loan.loanDueDate);

    const statusBanner = daysLate > 0
        ? `<div class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
               Terlambat ${daysLate} hari &bull; Denda: ${formatRupiah(fineAmount)}
           </div>`
        : `<div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
               Tepat waktu &#10003;
           </div>`;

    const modalHtml = `
        <form onsubmit="processReturn(event, '${backendId}')" class="space-y-4">
            <div class="space-y-2 text-sm text-gray-800">
                <p><span class="font-bold">Peminjam:</span> ${peminjam}</p>
                <p><span class="font-bold">Barcode:</span> <span class="font-mono">${kodeBuku}</span></p>
                <p><span class="font-bold">Jumlah Buku:</span> ${qty}</p>
                <p><span class="font-bold">Tanggal Pinjam:</span> ${tglPinjam}</p>
                <p><span class="font-bold">Jatuh Tempo:</span> ${jatuhTempo}</p>
            </div>

            ${statusBanner}

            <div class="pt-2 border-t border-gray-100">
                <label for="returnBookCondition" class="block text-xs font-bold text-gray-700 mb-1.5">
                    Kondisi Buku Saat Dikembalikan
                </label>
                <select id="returnBookCondition"
                    class="w-full px-3.5 py-2.5 border-2 border-blue-500 rounded-xl text-sm font-medium text-gray-800 bg-white focus:outline-none">
                    <option value="Baik" selected>Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Hilang">Hilang</option>
                </select>
            </div>

            <div class="pt-2 flex items-center gap-3">
                <button type="submit"
                    class="flex-1 bg-[#0bb57d] hover:bg-[#099c6b] text-white py-2.5 px-4 rounded-xl font-semibold text-sm shadow-sm transition-colors">
                    Konfirmasi Pengembalian
                </button>
                <button type="button" onclick="closeModal()"
                    class="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
                    Batal
                </button>
            </div>
        </form>
    `;

    openModal("Konfirmasi Pengembalian", modalHtml, "max-w-md");
}

async function processReturn(event, backendId) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    const loan = appState.allRecords.find(l => l.__backendId === backendId || l.id === backendId);
    if (!loan) {
        showToast("Data transaksi tidak ditemukan!", "error");
        return;
    }

    const condition = document.getElementById('returnBookCondition')?.value || 'Baik';
    const { daysLate, fineAmount } = calculateFine(loan.loanDueDate);
    const qty = Number(loan.loanQuantity || loan.quantity || 1);

    const updatedLoan = {
        ...loan,
        __backendId: loan.__backendId || backendId,
        loanStatus: 'dikembalikan',
        status: 'Dikembalikan',
        returnDate: new Date().toISOString(),
        daysLate: daysLate,
        fineAmount: fineAmount,
        bookCondition: condition
    };

    closeModal();
    const result = await window.dataSdk.sendData('update', updatedLoan);

    if (result && result.success !== false) {
        appState.allRecords = appState.allRecords.map(record =>
            (record.__backendId === backendId || record.id === backendId) ? updatedLoan : record
        );

        // Kembalikan stok buku sesuai jumlah yang dipinjam (kecuali jika kondisi 'Hilang')
        if (condition !== 'Hilang') {
            const kodeBuku = loan.loanBarcode;
            const bookRecord = appState.allRecords.find(b => b.type === 'book' && (b.bookBarcode === kodeBuku || b.id === kodeBuku));
            if (bookRecord && bookRecord.bookStock !== undefined) {
                bookRecord.bookStock = Number(bookRecord.bookStock) + qty;
                if (bookRecord.__backendId) {
                    await window.dataSdk.sendData('update', bookRecord);
                }
            }
        }

        showToast(
            fineAmount > 0
                ? `Buku dikembalikan (${condition}) • Denda: ${formatRupiah(fineAmount)}`
                : `Buku berhasil dikembalikan (Kondisi: ${condition})!`,
            "success"
        );
        renderCurrentSection();
    } else {
        showToast("Gagal memproses pengembalian", "error");
    }
}

// =========================================================================
// FITUR HAPUS TRANSAKSI PEMINJAMAN
// =========================================================================
async function deleteLoanTransaction(backendId) {
    const trans = appState.allRecords.find(l => l.__backendId === backendId || l.id === backendId);
    if (!trans) {
        showToast("Data transaksi tidak ditemukan!", "error");
        return;
    }

    const peminjam = trans.loanMember || trans.memberName || 'peminjam ini';
    if (!confirm(`Hapus data peminjaman atas nama "${peminjam}"?`)) return;

    const statusRaw = (trans.loanStatus || trans.status || 'dipinjam').toLowerCase();
    const isReturned = statusRaw === 'dikembalikan' || statusRaw === 'returned';
    const qty = Number(trans.loanQuantity || trans.quantity || 1);

    const result = await window.dataSdk.sendData('delete', trans);

    if (result && result.success !== false) {
        appState.allRecords = appState.allRecords.filter(r => (r.__backendId || r.id) !== backendId);

        // Jika transaksi yang dihapus masih berstatus dipinjam, kembalikan stok ke katalog
        if (!isReturned) {
            const kodeBuku = trans.loanBarcode;
            const bookRecord = appState.allRecords.find(b => b.type === 'book' && (b.bookBarcode === kodeBuku || b.id === kodeBuku));
            if (bookRecord && bookRecord.bookStock !== undefined) {
                bookRecord.bookStock = Number(bookRecord.bookStock) + qty;
                if (bookRecord.__backendId) {
                    await window.dataSdk.sendData('update', bookRecord);
                }
            }
        }

        showToast("Data peminjaman berhasil dihapus!", "success");
        renderCurrentSection();
    } else {
        showToast("Gagal menghapus data peminjaman", "error");
    }
}