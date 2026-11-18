// JS/pengaturan.js

// ==========================================
// 1. PENGATURAN SISTEM (SETTINGS)
// ==========================================

function renderSettingsSection() {
    const savedSettings = JSON.parse(localStorage.getItem('librarySettings') || '{}');
    const libName = savedSettings.libraryName || defaultConfig.libraryName || 'PerpusWeb';
    const libSub = savedSettings.librarySubtitle || defaultConfig.librarySubtitle || 'Sistem Informasi Perpustakaan';
    const primaryColor = savedSettings.primaryColor || defaultConfig.primaryColor || '#2563eb';
    const denda = savedSettings.finePerDay !== undefined ? savedSettings.finePerDay : (defaultConfig.finePerDay || 1000);
    const maksHari = savedSettings.maxLoanDays || defaultConfig.maxLoanDays || 7;

    return `
        <div class="space-y-6 max-w-4xl">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
                <p class="text-gray-500 text-sm">Atur identitas perpustakaan, tampilan tema, dan aturan sirkulasi peminjaman.</p>
            </div>

            <form onsubmit="saveSettings(event)" class="space-y-6">
                <!-- Identitas & Tampilan -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Identitas & Tampilan</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Perpustakaan</label>
                            <input type="text" id="settingLibName" value="${libName}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Subjudul / Instansi</label>
                            <input type="text" id="settingLibSub" value="${libSub}" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                        </div>
                    </div>
                    <div class="max-w-xs">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Warna Utama Tema</label>
                        <div class="flex items-center gap-3">
                            <input type="color" id="settingPrimaryColor" value="${primaryColor}" class="h-10 w-16 p-1 border rounded-lg cursor-pointer">
                            <span class="text-xs text-gray-500">Pilih warna aksen sidebar & tombol utama</span>
                        </div>
                    </div>
                </div>

                <!-- Aturan Peminjaman -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Aturan Peminjaman & Denda</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Maksimal Hari Pinjam</label>
                            <div class="relative">
                                <input type="number" id="settingMaxDays" value="${maksHari}" min="1" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                                <span class="absolute right-4 top-2.5 text-gray-500 text-sm">Hari</span>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Denda Keterlambatan</label>
                            <div class="relative">
                                <span class="absolute left-4 top-2.5 text-gray-500 text-sm">Rp</span>
                                <input type="number" id="settingFine" value="${denda}" min="0" step="500" required class="w-full pl-10 p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                                <span class="absolute right-4 top-2.5 text-gray-500 text-sm">/ Hari</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <button type="submit" id="btnSaveSettings" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors">
                        Simpan Semua Pengaturan
                    </button>
                </div>
            </form>
        </div>
    `;
}

async function saveSettings(event) {
    event.preventDefault();

    const btn = document.getElementById('btnSaveSettings');
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Menyimpan...";
    }

    const settings = {
        libraryName: document.getElementById('settingLibName').value.trim() || 'PerpusWeb',
        librarySubtitle: document.getElementById('settingLibSub').value.trim() || 'Sistem Informasi Perpustakaan',
        primaryColor: document.getElementById('settingPrimaryColor').value || '#2563eb',
        maxLoanDays: parseInt(document.getElementById('settingMaxDays').value) || 7,
        finePerDay: parseInt(document.getElementById('settingFine').value) || 0,
        type: 'setting'
    };

    // 1. Simpan ke localStorage & perbarui variabel global langsung
    localStorage.setItem('librarySettings', JSON.stringify(settings));
    Object.assign(defaultConfig, settings);
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);

    const sidebarTitle = document.getElementById('sidebarLibName');
    if (sidebarTitle) sidebarTitle.textContent = settings.libraryName;

    // 2. Sinkronkan ke Google Sheets jika API tersedia
    try {
        const existingSetting = appState.allRecords.find(r => r.type === 'setting');
        if (existingSetting && existingSetting.__backendId) {
            const payload = { ...existingSetting, ...settings };
            await window.dataSdk.sendData('update', payload);
        } else {
            const res = await window.dataSdk.sendData('create', settings);
            if (res && res.success) {
                appState.allRecords.push(settings);
            }
        }
    } catch (e) {
        console.warn("Pengaturan tersimpan lokal, gagal sinkron ke server:", e);
    }

    if (btn) {
        btn.disabled = false;
        btn.innerText = "Simpan Semua Pengaturan";
    }
    showToast("Pengaturan berhasil disimpan!", "success");
}

// ==========================================
// 2. MANAJEMEN USER (USERS & ROLES)
// ==========================================

function renderUsersSection() {
    const users = getRecordsByType('user');
    let rowsHtml = '';

    users.forEach((u, index) => {
        const username = u.username || u.userName || '-';
        const fullName = u.fullName || u.userFullName || u.name || '-';
        const role = (u.role || u.userRole || 'petugas').toLowerCase();
        const targetId = u.__backendId || u.id || username;

        const roleBadge = role === 'admin'
            ? `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">ADMIN</span>`
            : `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">${role.toUpperCase()}</span>`;

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 text-center text-gray-500">${index + 1}</td>
                <td class="p-3 font-medium text-gray-800">${fullName}</td>
                <td class="p-3 font-mono text-xs text-gray-600">${username}</td>
                <td class="p-3">${roleBadge}</td>
                <td class="p-3 text-center whitespace-nowrap">
                    <button onclick="editUser('${targetId}')" class="text-blue-600 hover:text-blue-800 mx-1 font-medium text-xs bg-blue-50 px-2.5 py-1.5 rounded-lg">Edit</button>
                    <button onclick="deleteUser('${targetId}')" class="text-red-600 hover:text-red-800 mx-1 font-medium text-xs bg-red-50 px-2.5 py-1.5 rounded-lg">Hapus</button>
                </td>
            </tr>
        `;
    });

    if (users.length === 0) {
        rowsHtml = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Belum ada data user di database. Tambahkan akun admin/petugas pertama Anda.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Manajemen User</h2>
                    <p class="text-gray-500 text-sm">Kelola akun login dan hak akses petugas perpustakaan.</p>
                </div>
                <button onclick="showAddUserModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
                    <i data-lucide="user-plus" class="w-4 h-4"></i> Tambah User
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider border-b">
                            <tr>
                                <th class="p-3 w-14 text-center">No</th>
                                <th class="p-3">Nama Lengkap</th>
                                <th class="p-3">Username</th>
                                <th class="p-3">Role / Hak Akses</th>
                                <th class="p-3 w-36 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function showAddUserModal() {
    const formHtml = `
        <form onsubmit="saveUser(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" id="userFullName" required placeholder="Contoh: Rina Kartika" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input type="text" id="userUsername" required placeholder="Username untuk login" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" id="userPassword" required placeholder="Minimal 4 karakter" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role / Hak Akses *</label>
                <select id="userRole" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                    <option value="petugas">Petugas (Sirkulasi, Buku, Anggota, Tamu, Laporan)</option>
                    <option value="admin">Admin (Akses Penuh termasuk Manajemen User & Pengaturan)</option>
                </select>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">Simpan User</button>
            </div>
        </form>
    `;
    openModal("Tambah User Baru", formHtml);
}

async function saveUser(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;

    const usernameVal = document.getElementById('userUsername').value.trim();

    // Cek duplikat username
    const exists = getRecordsByType('user').some(u => (u.username || u.userName || '').toLowerCase() === usernameVal.toLowerCase());
    if (exists) {
        showToast("Username sudah digunakan!", "error");
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        return;
    }

    const newUser = {
        fullName: document.getElementById('userFullName').value.trim(),
        username: usernameVal,
        password: document.getElementById('userPassword').value.trim(),
        role: document.getElementById('userRole').value,
        type: 'user',
        timestamp: new Date().toISOString()
    };

    const result = await window.dataSdk.sendData('create', newUser);

    if (result && result.success) {
        appState.allRecords.push(newUser);
        closeModal();
        showToast("User baru berhasil ditambahkan!", "success");
        renderCurrentSection();
    } else {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        showToast("Gagal menyimpan user", "error");
    }
}

function editUser(backendId) {
    const user = appState.allRecords.find(u => u.type === 'user' && (u.__backendId === backendId || u.id === backendId || u.username === backendId));
    if (!user) {
        showToast("Data user tidak ditemukan!", "error");
        return;
    }

    const fullName = user.fullName || user.userFullName || user.name || '';
    const username = user.username || user.userName || '';
    const password = user.password || user.userPassword || '';
    const role = (user.role || user.userRole || 'petugas').toLowerCase();

    const formHtml = `
        <form onsubmit="processUpdateUser(event, '${user.__backendId || username}')" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" id="editUserFullName" value="${fullName}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input type="text" id="editUserUsername" value="${username}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="text" id="editUserPassword" value="${password}" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role / Hak Akses *</label>
                <select id="editUserRole" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                    <option value="petugas" ${role === 'petugas' ? 'selected' : ''}>Petugas</option>
                    <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </div>
            
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm">Batal</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">Update User</button>
            </div>
        </form>
    `;
    openModal("Edit Data User", formHtml);
}

async function processUpdateUser(event, backendId) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Mengupdate...";
    submitBtn.disabled = true;

    const existingUser = appState.allRecords.find(u => u.type === 'user' && (u.__backendId === backendId || u.username === backendId)) || {};

    const updatedPayload = {
        ...existingUser,
        __backendId: existingUser.__backendId || backendId,
        fullName: document.getElementById('editUserFullName').value.trim(),
        username: document.getElementById('editUserUsername').value.trim(),
        password: document.getElementById('editUserPassword').value.trim(),
        role: document.getElementById('editUserRole').value,
        type: 'user'
    };

    const result = await window.dataSdk.sendData('update', updatedPayload);

    if (result && result.success) {
        appState.allRecords = appState.allRecords.map(record =>
            (record.type === 'user' && (record.__backendId === backendId || record.username === backendId)) ? updatedPayload : record
        );
        closeModal();
        showToast("Data user berhasil diupdate!", "success");
        renderCurrentSection();
    } else {
        submitBtn.innerText = "Update User";
        submitBtn.disabled = false;
        showToast("Gagal mengupdate user", "error");
    }
}

async function deleteUser(backendId) {
    const current = window.loggedInUser || {};
    if (current.id === backendId || current.username === backendId) {
        showToast("Anda tidak dapat menghapus akun yang sedang digunakan login!", "error");
        return;
    }

    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
        const payload = { __backendId: backendId };
        const result = await window.dataSdk.sendData('delete', payload);

        if (result && result.success) {
            appState.allRecords = appState.allRecords.filter(record => !(record.type === 'user' && (record.__backendId === backendId || record.username === backendId)));
            showToast("User berhasil dihapus!", "success");
            renderCurrentSection();
        } else {
            showToast("Gagal menghapus user", "error");
        }
    }
}