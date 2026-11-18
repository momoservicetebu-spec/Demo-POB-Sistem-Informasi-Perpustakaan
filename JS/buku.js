// JS/buku.js

// 1. Gambar Halaman Tabel Data Buku
function renderBooksSection() {
    // Ambil data khusus buku dari script.js
    const books = getRecordsByType('book');
    
    // Looping data buku untuk membentuk baris tabel (<tr>)
    let rowsHtml = '';
    books.forEach((book, index) => {
        rowsHtml += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 text-center">${index + 1}</td>
                <td class="p-3 font-medium">${book.id || '-'}</td>
                <td class="p-3">${book.title || '-'}</td>
                <td class="p-3">${book.author || '-'}</td>
                <td class="p-3">${book.category || '-'}</td>
                <td class="p-3 text-center">
                    <button onclick="editBook('${book.__backendId || book.id}')" class="text-blue-500 hover:text-blue-700 mx-1 font-medium">Edit</button>
                    <button onclick="deleteBook('${book.__backendId || book.id}')" class="text-red-500 hover:text-red-700 mx-1 font-medium">Hapus</button>                </td>
            </tr>
        `;
    });

    // Teks kosong jika data buku belum ada
    if (books.length === 0) {
        rowsHtml = `<tr><td colspan="6" class="p-6 text-center text-gray-500">Belum ada data buku tersimpan.</td></tr>`;
    }

    // Kembalikan seluruh struktur HTML Halaman Buku
    return `
        <div class="space-y-6">
            <!-- Header Halaman -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Data Buku</h2>
                    <p class="text-gray-500 text-sm">Kelola daftar buku perpustakaan.</p>
                </div>
                <button onclick="showAddBookModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i> Tambah Buku
                </button>
            </div>

            <!-- Fitur Pencarian (Memanggil fungsi filterTable dari script.js) -->
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"></i>
                    <input type="text" onkeyup="filterTable(this.value, 'bookTableBody')" placeholder="Cari judul, pengarang, atau kode buku..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <!-- Tabel Data -->
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

// 2. Fungsi Dummy untuk Aksi Tombol (Akan dihubungkan ke Modal/GAS nanti)
// Ganti bagian bawah JS/buku.js dengan kode ini:

function showAddBookModal() {
    const formHtml = `
        <form onsubmit="saveBook(event)" class="space-y-4">
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
                    <option value="Fiksi">Fiksi</option>
                    <option value="Non-Fiksi">Non-Fiksi</option>
                    <option value="Pelajaran">Buku Pelajaran</option>
                </select>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Simpan Buku</button>
            </div>
        </form>
    `;
    
    // Panggil fungsi pembuat modal dari script.js
    openModal("Tambah Buku Baru", formHtml);
}

// Update fungsi saveBook di JS/buku.js

async function saveBook(event) {
    event.preventDefault(); 
    
    // Ubah tombol jadi status loading agar user tidak klik 2x
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;
    
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const category = document.getElementById('bookCategory').value;
    
    const newBook = {
        id: 'B-' + Math.floor(Math.random() * 10000), // ID Tampilan
        title: title,
        author: author,
        category: category,
        type: 'book'
    };
    
    // KIRM KE GOOGLE APPS SCRIPT! (Action: 'create')
    const result = await window.dataSdk.sendData('create', newBook);
    
    if (result && result.success) {
        // Jika berhasil di server, baru simpan di memori lokal agar tabel langsung update
        appState.allRecords.push(newBook);
        closeModal();
        showToast("Buku berhasil disimpan ke Database!", "success");
        renderCurrentSection(); 
    } else {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

async function deleteBook(backendId) {
    if(confirm("Apakah Anda yakin ingin menghapus buku ini dari database?")) {
        // KIRM PERINTAH HAPUS KE GOOGLE APPS SCRIPT
        const payload = { __backendId: backendId };
        const result = await window.dataSdk.sendData('delete', payload);
        
        if (result && result.success) {
            appState.allRecords = appState.allRecords.filter(record => record.__backendId !== backendId);
            showToast("Buku berhasil dihapus!", "success");
            renderCurrentSection();
        }
    }
}

// Ganti fungsi editBook yang lama dengan ini:

function editBook(backendId) {
    // 1. Cari data buku yang ingin diedit dari state/memori
    // (Gunakan __backendId jika dari GAS, atau id lokal jika simulasi)
    const book = appState.allRecords.find(b => b.__backendId === backendId || b.id === backendId);
    
    if (!book) {
        showToast("Data buku tidak ditemukan!", "error");
        return;
    }

    // 2. Buat form HTML yang sudah terisi (pre-filled) dengan data lama
    const formHtml = `
        <form onsubmit="processUpdateBook(event, '${book.__backendId || book.id}')" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul Buku</label>
                <input type="text" id="editBookTitle" value="${book.title}" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pengarang</label>
                <input type="text" id="editBookAuthor" value="${book.author}" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select id="editBookCategory" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="Fiksi" ${book.category === 'Fiksi' ? 'selected' : ''}>Fiksi</option>
                    <option value="Non-Fiksi" ${book.category === 'Non-Fiksi' ? 'selected' : ''}>Non-Fiksi</option>
                    <option value="Pelajaran" ${book.category === 'Pelajaran' ? 'selected' : ''}>Buku Pelajaran</option>
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

// Fungsi untuk mengirim data update ke server
async function processUpdateBook(event, backendId) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Mengupdate...";
    submitBtn.disabled = true;
    
    // Ambil data baru dari form
    const updatedPayload = {
        __backendId: backendId, // ID ini penting agar GAS tahu baris mana yang diupdate
        id: backendId.replace('__backendId', ''), // Simpan ID tampilan jika perlu
        title: document.getElementById('editBookTitle').value,
        author: document.getElementById('editBookAuthor').value,
        category: document.getElementById('editBookCategory').value,
        type: 'book'
    };

    // KIRIM KE GOOGLE APPS SCRIPT! (Action: 'update')
    const result = await window.dataSdk.sendData('update', updatedPayload);
    
    if (result && result.success) {
        // Update data di memori lokal agar tabel langsung berubah
        appState.allRecords = appState.allRecords.map(record => 
            (record.__backendId === backendId || record.id === backendId) ? updatedPayload : record
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

function deleteBook(id) {
    if(confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
        // Filter out buku yang dihapus
        appState.allRecords = appState.allRecords.filter(record => record.id !== id);
        showToast("Buku berhasil dihapus!", "success");
        renderCurrentSection(); // Refresh tabel
    }
}

function editBook(id) {
    alert("Menyiapkan edit untuk buku kode: " + id);
}

function deleteBook(id) {
    if(confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
        alert("Buku terhapus (Simulasi): " + id);
    }
}