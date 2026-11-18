// JS/anggota.js

function renderMembersSection() {
    const members = getRecordsByType('member');
    let rowsHtml = '';

    members.forEach((member, index) => {
        const nama = member.memberName || member.name || '-';
        const kelas = member.memberClass || member.role || '-';
        const kontak = member.memberPhone || member.phone || member.contact || '-';
        const targetId = member.__backendId || member.id || '';
        const displayId = member.memberCode || targetId.replace(/^ID[-_]/, '');

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 text-center text-gray-500">${index + 1}</td>
                <td class="p-3 font-mono text-xs font-semibold text-blue-700">${displayId}</td>
                <td class="p-3 font-medium text-gray-800">${nama}</td>
                <td class="p-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">${kelas}</span>
                </td>
                <td class="p-3 text-gray-600">${kontak}</td>
                <td class="p-3 text-center whitespace-nowrap">
                    <button onclick="cetakKartu('${targetId}')" title="Cetak Kartu Anggota" class="text-emerald-600 hover:text-emerald-800 mx-1 font-medium text-xs bg-emerald-50 px-2.5 py-1.5 rounded-lg">Kartu</button>
                    <button onclick="editMember('${targetId}')" class="text-blue-600 hover:text-blue-800 mx-1 font-medium text-xs bg-blue-50 px-2.5 py-1.5 rounded-lg">Edit</button>
                    <button onclick="deleteMember('${targetId}')" class="text-red-600 hover:text-red-800 mx-1 font-medium text-xs bg-red-50 px-2.5 py-1.5 rounded-lg">Hapus</button>
                </td>
            </tr>
        `;
    });

    if (members.length === 0) {
        rowsHtml = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Belum ada data anggota.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Data Anggota</h2>
                    <p class="text-gray-500 text-sm">Kelola daftar anggota perpustakaan dan cetak kartu anggota.</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button onclick="cetakSemuaKartu()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                        <i data-lucide="printer" class="w-4 h-4"></i> Cetak Semua Kartu
                    </button>
                    <button onclick="showImportMemberModal()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                        <i data-lucide="file-up" class="w-4 h-4"></i> Import Excel
                    </button>
                    <button onclick="showAddMemberModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
                        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Anggota
                    </button>
                </div>
            </div>

            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div class="relative flex-1">
                    <i data-lucide="search" class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"></i>
                    <input type="text" onkeyup="filterTable(this.value, 'memberTableBody')" placeholder="Cari nama anggota, ID, kelas/jabatan, atau nomor HP..." class="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th class="p-3 w-14 text-center">No</th>
                                <th class="p-3">ID Anggota</th>
                                <th class="p-3">Nama Lengkap</th>
                                <th class="p-3">Kelas / Peran</th>
                                <th class="p-3">Kontak / WA</th>
                                <th class="p-3 w-44 text-center">Aksi</th>
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

function showAddMemberModal() {
    const formHtml = `
        <form onsubmit="saveMember(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ID / NIS / NIP Anggota (Opsional)</label>
                <input type="text" id="memberCode" placeholder="Kosongkan untuk otomatis" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" id="memberName" required placeholder="Contoh: Budi Santoso" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kelas / Peran *</label>
                <input type="text" id="memberClass" required placeholder="Contoh: X IPA 1 / Guru / Umum" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon / WA *</label>
                <input type="tel" id="memberPhone" required placeholder="Contoh: 08123456789" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat (Opsional)</label>
                <input type="text" id="memberAddress" placeholder="Alamat singkat" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">Simpan Anggota</button>
            </div>
        </form>
    `;

    openModal("Tambah Anggota Baru", formHtml);
}

async function saveMember(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;

    const codeInput = document.getElementById('memberCode').value.trim();
    const generatedCode = codeInput || ('A-' + Math.floor(1000 + Math.random() * 9000));

    const newMember = {
        id: generatedCode,
        memberCode: generatedCode,
        memberName: document.getElementById('memberName').value.trim(),
        memberClass: document.getElementById('memberClass').value.trim(),
        memberPhone: document.getElementById('memberPhone').value.trim(),
        memberAddress: document.getElementById('memberAddress').value.trim(),
        type: 'member',
        timestamp: new Date().toISOString()
    };

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

function editMember(backendId) {
    const member = appState.allRecords.find(m => m.__backendId === backendId || m.id === backendId);

    if (!member) {
        showToast("Data anggota tidak ditemukan!", "error");
        return;
    }

    const nama = member.memberName || member.name || '';
    const kelas = member.memberClass || member.role || '';
    const kontak = member.memberPhone || member.phone || member.contact || '';
    const alamat = member.memberAddress || '';
    const kode = member.memberCode || member.id || '';

    const formHtml = `
        <form onsubmit="processUpdateMember(event, '${member.__backendId || member.id}')" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ID / NIS / NIP Anggota</label>
                <input type="text" id="editMemberCode" value="${kode}" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" id="editMemberName" value="${nama}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kelas / Peran *</label>
                <input type="text" id="editMemberClass" value="${kelas}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon / WA *</label>
                <input type="tel" id="editMemberPhone" value="${kontak}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <input type="text" id="editMemberAddress" value="${alamat}" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">Update Anggota</button>
            </div>
        </form>
    `;

    openModal("Edit Data Anggota", formHtml);
}

async function processUpdateMember(event, backendId) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Mengupdate...";
    submitBtn.disabled = true;

    const existingMember = appState.allRecords.find(m => m.__backendId === backendId || m.id === backendId) || {};
    const codeVal = document.getElementById('editMemberCode').value.trim();

    const updatedPayload = {
        ...existingMember,
        __backendId: existingMember.__backendId || backendId,
        id: codeVal || existingMember.id || backendId,
        memberCode: codeVal,
        memberName: document.getElementById('editMemberName').value.trim(),
        memberClass: document.getElementById('editMemberClass').value.trim(),
        memberPhone: document.getElementById('editMemberPhone').value.trim(),
        memberAddress: document.getElementById('editMemberAddress').value.trim(),
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

async function deleteMember(backendId) {
    if (confirm("Apakah Anda yakin ingin menghapus anggota ini dari database?")) {
        const payload = { __backendId: backendId };
        const result = await window.dataSdk.sendData('delete', payload);

        if (result && result.success) {
            appState.allRecords = appState.allRecords.filter(record => record.__backendId !== backendId && record.id !== backendId);
            showToast("Anggota berhasil dihapus!", "success");
            renderCurrentSection();
        } else {
            showToast("Gagal menghapus data", "error");
        }
    }
}

// --- FITUR IMPORT EXCEL ANGGOTA ---

function downloadMemberTemplate() {
    const sample = [
        {
            ID: "A-1001",
            Nama: "Siti Aminah",
            Kelas: "XI IPS 2",
            Telepon: "081298765432",
            Alamat: "Jl. Merdeka No. 10"
        }
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Anggota");
    XLSX.writeFile(wb, "Template_Import_Anggota.xlsx");
}

function showImportMemberModal() {
    const formHtml = `
        <div class="space-y-4">
            <div class="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs leading-relaxed">
                Pastikan file Excel memiliki kolom: <strong>ID, Nama, Kelas, Telepon, Alamat</strong>.
                <button type="button" onclick="downloadMemberTemplate()" class="underline font-semibold ml-1 text-blue-700 hover:text-blue-900">
                    Download Template Excel
                </button>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pilih File Excel (.xlsx / .xls)</label>
                <input type="file" id="importMemberFile" accept=".xlsx, .xls" class="w-full p-2 border rounded-xl text-sm">
            </div>
            <div id="importMemberProgress" class="hidden text-xs text-gray-600 font-medium"></div>
            <div class="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium">Batal</button>
                <button type="button" id="btnProcessImportMember" onclick="processImportMembers()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">Mulai Import</button>
            </div>
        </div>
    `;
    openModal("Import Data Anggota dari Excel", formHtml);
}

async function processImportMembers() {
    const fileInput = document.getElementById('importMemberFile');
    const progressEl = document.getElementById('importMemberProgress');
    const btn = document.getElementById('btnProcessImportMember');

    if (!fileInput || !fileInput.files.length) {
        showToast("Pilih file Excel terlebih dahulu!", "error");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Memproses...";
    progressEl.classList.remove('hidden');

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);

            if (rows.length === 0) {
                showToast("File Excel kosong!", "error");
                btn.disabled = false;
                btn.innerText = "Mulai Import";
                return;
            }

            let successCount = 0;
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                progressEl.innerText = `Mengunggah data ${i + 1} dari ${rows.length}...`;

                const codeVal = String(row.ID || row.NIS || ('A-' + (1000 + i)));
                const newMember = {
                    id: codeVal,
                    memberCode: codeVal,
                    memberName: String(row.Nama || row.Name || 'Tanpa Nama'),
                    memberClass: String(row.Kelas || row.Peran || row.Class || '-'),
                    memberPhone: String(row.Telepon || row.HP || row.Phone || '-'),
                    memberAddress: String(row.Alamat || row.Address || ''),
                    type: 'member',
                    timestamp: new Date().toISOString()
                };

                const res = await window.dataSdk.sendData('create', newMember);
                if (res && res.success) {
                    appState.allRecords.push(newMember);
                    successCount++;
                }
            }

            closeModal();
            showToast(`Berhasil mengimpor ${successCount} dari ${rows.length} anggota!`, "success");
            renderCurrentSection();
        } catch (err) {
            console.error(err);
            showToast("Gagal membaca format file Excel.", "error");
            btn.disabled = false;
            btn.innerText = "Mulai Import";
        }
    };

    reader.readAsArrayBuffer(file);
}