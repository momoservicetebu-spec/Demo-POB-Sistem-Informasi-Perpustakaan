// JS/buku.js

function renderBooksSection() {
    const books = getRecordsByType('book');
    
    let rowsHtml = '';
    books.forEach((book, index) => {
        // Menggabungkan pembacaan format data lama dan baru
        const kodeBuku = book.bookBarcode || book.id || '-';
        const judul = book.bookTitle || book.title || '-';
        const pengarang = book.bookAuthor || book.author || '-';
        const kategori = book.bookCategory || book.category || '-';
        
        // Memprioritaskan ID backend asli dari Google Sheets
        const targetId = book.__backendId || kodeBuku;

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 text-center">${index + 1}</td>
                <td class="p-3 font-medium">${kodeBuku}</td>
                <td class="p-3">${judul}</td>
                <td class="p-3">${pengarang}</td>
                <td class="p-3">${kategori}</td>
                <td class="p-3 text-center">
                    <button onclick="editBook('${targetId}')" class="text-blue-500 hover:text-blue-700 mx-1 font-medium">Edit</button>
                    <button onclick="deleteBook('${targetId}')" class="text-red-500 hover:text-red-700 mx-1 font-medium">Hapus</button>
                </td>
            </tr>
        `;
    });

    if (books.length === 0) {
        rowsHtml = `<tr><td colspan="6" class="p-6 text-center text-gray-500">Belum ada data buku tersimpan.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Data Buku</h2>
                    <p class="text-gray-500 text-sm">Kelola daftar buku perpustakaan.</p>
                </div>
                <button onclick="showAddBookModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i> Tambah Buku
                </button>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"></i>
                    <input type="text" onkeyup="filterTable(this.value, 'bookTableBody')" placeholder="Cari judul, pengarang, atau kode buku..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-sm">
                            <tr>
                                <th class="p-3 w-16 text-center">No</th>
                                <th class="p-3">Kode Buku</th>
                                <th class="p-3">Judul</th>
                                <th class="p-3">Pengarang</th>
                                <th class="p-3">Kategori</th>
                                <th class="p-3 w-32 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="bookTableBody" class="text-sm">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function showAddBookModal() {
    const formHtml = `
        <form onsubmit="saveBook(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kode / Barcode Buku</label>
                <input type="text" id="bookBarcode" required placeholder="Contoh: 978623..." class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
                <input type="text" id="bookTitle" required placeholder="Contoh: Laskar Pelangi" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pengarang</label>
                <input type="text" id="bookAuthor" required placeholder="Contoh: Andrea Hirata" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select id="bookCategory" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Pilih Kategori...</option>
                    <option value="Pelajaran">Pelajaran</option>
                    <option value="Fiksi">Fiksi</option>
                    <option value="Non-Fiksi">Non-Fiksi</option>
                </select>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Simpan Buku</button>
            </div>
        </form>
    `;
    
    openModal("Tambah Buku Baru", formHtml);
}

async function saveBook(event) {
    event.preventDefault(); 
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;
    
    // Menyimpan data menggunakan format label database Anda
    const newBook = {
        bookBarcode: document.getElementById('bookBarcode').value,
        bookTitle: document.getElementById('bookTitle').value,
        bookAuthor: document.getElementById('bookAuthor').value,
        bookCategory: document.getElementById('bookCategory').value,
        type: 'book',
        timestamp: new Date().toISOString()
    };
    
    const result = await window.dataSdk.sendData('create', newBook);
    
    if (result && result.success) {
        appState.allRecords.push(newBook);
        closeModal();
        showToast("Buku berhasil disimpan ke Database!", "success");
        renderCurrentSection(); 
    } else {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        showToast("Gagal menyimpan data", "error");
    }
}

function editBook(backendId) {
    const book = appState.allRecords.find(b => b.__backendId === backendId || b.id === backendId || b.bookBarcode === backendId);
    
    if (!book) {
        showToast("Data buku tidak ditemukan!", "error");
        return;
    }

    const kodeBuku = book.bookBarcode || book.id || '';
    const judul = book.bookTitle || book.title || '';
    const pengarang = book.bookAuthor || book.author || '';
    const kategori = book.bookCategory || book.category || '';

    const formHtml = `
        <form onsubmit="processUpdateBook(event, '${book.__backendId}')" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kode / Barcode Buku</label>
                <input type="text" id="editBookBarcode" value="${kodeBuku}" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
                <input type="text" id="editBookTitle" value="${judul}" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pengarang</label>
                <input type="text" id="editBookAuthor" value="${pengarang}" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select id="editBookCategory" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="Pelajaran" ${kategori === 'Pelajaran' ? 'selected' : ''}>Pelajaran</option>
                    <option value="Fiksi" ${kategori === 'Fiksi' ? 'selected' : ''}>Fiksi</option>
                    <option value="Non-Fiksi" ${kategori === 'Non-Fiksi' ? 'selected' : ''}>Non-Fiksi</option>
                </select>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Update Buku</button>
            </div>
        </form>
    `;
    
    openModal("Edit Data Buku", formHtml);
}

async function processUpdateBook(event, backendId) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Mengupdate...";
    submitBtn.disabled = true;
    
    // Ambil rekam jejak lama agar data lain (seperti tahun/penerbit) tidak hilang
    const existingBook = appState.allRecords.find(b => b.__backendId === backendId);
    
    const updatedPayload = {
        ...existingBook, 
        __backendId: backendId,
        bookBarcode: document.getElementById('editBookBarcode').value,
        bookTitle: document.getElementById('editBookTitle').value,
        bookAuthor: document.getElementById('editBookAuthor').value,
        bookCategory: document.getElementById('editBookCategory').value,
        type: 'book'
    };

    const result = await window.dataSdk.sendData('update', updatedPayload);
    
    if (result && result.success) {
        appState.allRecords = appState.allRecords.map(record => 
            record.__backendId === backendId ? updatedPayload : record
        );
        
        closeModal();
        showToast("Buku berhasil diupdate!", "success");
        renderCurrentSection(); 
    } else {
        submitBtn.innerText = "Update Buku";
        submitBtn.disabled = false;
        showToast("Gagal mengupdate buku", "error");
    }
}

async function deleteBook(backendId) {
    if(confirm("Apakah Anda yakin ingin menghapus buku ini dari database?")) {
        const payload = { __backendId: backendId };
        const result = await window.dataSdk.sendData('delete', payload);
        
        if (result && result.success) {
            appState.allRecords = appState.allRecords.filter(record => record.__backendId !== backendId);
            showToast("Buku berhasil dihapus!", "success");
            renderCurrentSection();
        } else {
            showToast("Gagal menghapus buku", "error");
        }
    }
}