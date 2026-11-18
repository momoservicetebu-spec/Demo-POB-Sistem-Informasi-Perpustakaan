// JS/anggota.js

// 1. Gambar Halaman Tabel Data Anggota
function renderMembersSection() {
    // Ambil data khusus anggota dari script.js
    const members = getRecordsByType('member');
    
    // Looping data anggota untuk membentuk baris tabel
    let rowsHtml = '';
    members.forEach((member, index) => {
        rowsHtml += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 text-center">${index + 1}</td>
                <td class="p-3 font-medium">${member.id || '-'}</td>
                <td class="p-3">${member.name || '-'}</td>
                <td class="p-3">${member.phone || '-'}</td>
                <td class="p-3">
                    <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Aktif</span>
                </td>
                <td class="p-3 text-center">
                // Cari kode ini di dalam renderMembersSection() dan ubah menjadi seperti ini:
                <button onclick="editMember('${member.__backendId || member.id}')" class="text-blue-500 hover:text-blue-700 mx-1 font-medium">Edit</button>
                <button onclick="deleteMember('${member.__backendId || member.id}')" class="text-red-500 hover:text-red-700 mx-1 font-medium">Hapus</button>                </td>
            </tr>
        `;
    });

    if (members.length === 0) {
        rowsHtml = `<tr><td colspan="6" class="p-6 text-center text-gray-500">Belum ada data anggota tersimpan.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <!-- Header Halaman -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Data Anggota</h2>
                    <p class="text-gray-500 text-sm">Kelola daftar anggota perpustakaan.</p>
                </div>
                <button onclick="showAddMemberModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <i data-lucide="user-plus" class="w-4 h-4"></i> Tambah Anggota
                </button>
            </div>

            <!-- Fitur Pencarian -->
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"></i>
                    <input type="text" onkeyup="filterTable(this.value, 'memberTableBody')" placeholder="Cari nama, ID, atau nomor telepon..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            </div>

            <!-- Tabel Data -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-sm">
                            <tr>
                                <th class="p-3 w-16 text-center">No</th>
                                <th class="p-3">ID Anggota</th>
                                <th class="p-3">Nama Lengkap</th>
                                <th class="p-3">No. Telepon</th>
                                <th class="p-3">Status</th>
                                <th class="p-3 w-32 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="memberTableBody" class="text-sm">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// 2. Fungsi Dummy untuk Aksi Tombol Anggota
// Ganti bagian bawah JS/anggota.js dengan kode ini:

function showAddMemberModal() {
    const formHtml = `
        <form onsubmit="saveMember(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" id="memberName" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon/WA</label>
                <input type="tel" id="memberPhone" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Simpan Anggota</button>
            </div>
        </form>
    `;
    
    openModal("Tambah Anggota Baru", formHtml);
}

// 1. FUNGSI SIMPAN ANGGOTA BARU KE DATABASE
async function saveMember(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;
    
    const name = document.getElementById('memberName').value;
    const phone = document.getElementById('memberPhone').value;
    
    const newMember = {
        id: 'A-' + Math.floor(Math.random() * 10000), // ID Tampilan
        name: name,
        phone: phone,
        type: 'member' // Wajib ada untuk filter data
    };
    
    // KIRIM KE GOOGLE APPS SCRIPT
    const result = await window.dataSdk.sendData('create', newMember);
    
    if (result && result.success) {
        appState.allRecords.push(newMember);
        closeModal();
        showToast("Anggota berhasil ditambahkan!", "success");
        renderCurrentSection(); 
    } else {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        showToast("Gagal menyimpan anggota", "error");
    }
}

// 2. FUNGSI MEMBUKA FORM EDIT ANGGOTA
function editMember(backendId) {
    const member = appState.allRecords.find(m => m.__backendId === backendId || m.id === backendId);
    
    if (!member) {
        showToast("Data anggota tidak ditemukan!", "error");
        return;
    }

    const formHtml = `
        <form onsubmit="processUpdateMember(event, '${member.__backendId || member.id}')" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" id="editMemberName" value="${member.name}" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon/WA</label>
                <input type="tel" id="editMemberPhone" value="${member.phone}" required class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Update Anggota</button>
            </div>
        </form>
    `;
    
    openModal("Edit Data Anggota", formHtml);
}

// 3. FUNGSI MENGIRIM DATA UPDATE KE DATABASE
async function processUpdateMember(event, backendId) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Mengupdate...";
    submitBtn.disabled = true;
    
    const updatedPayload = {
        __backendId: backendId,
        id: backendId.replace('__backendId', ''), // Fallback id
        name: document.getElementById('editMemberName').value,
        phone: document.getElementById('editMemberPhone').value,
        type: 'member'
    };

    const result = await window.dataSdk.sendData('update', updatedPayload);
    
    if (result && result.success) {
        appState.allRecords = appState.allRecords.map(record => 
            (record.__backendId === backendId || record.id === backendId) ? updatedPayload : record
        );
        
        closeModal();
        showToast("Anggota berhasil diupdate!", "success");
        renderCurrentSection(); 
    } else {
        submitBtn.innerText = "Update Anggota";
        submitBtn.disabled = false;
        showToast("Gagal mengupdate anggota", "error");
    }
}

// 4. FUNGSI MENGHAPUS ANGGOTA DARI DATABASE
async function deleteMember(backendId) {
    if(confirm("Apakah Anda yakin ingin menghapus anggota ini dari database?")) {
        const payload = { __backendId: backendId };
        const result = await window.dataSdk.sendData('delete', payload);
        
        if (result && result.success) {
            appState.allRecords = appState.allRecords.filter(record => record.__backendId !== backendId);
            showToast("Anggota berhasil dihapus!", "success");
            renderCurrentSection();
        } else {
            showToast("Gagal menghapus data", "error");
        }
    }
}

