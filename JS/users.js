// JS/users.js

function renderUsersSection() {
    const users = getRecordsByType('user');
    const currentUser = window.loggedInUser || {};

    let adminCount = 0;
    let pustakawanCount = 0;
    let kasirCount = 0;

    users.forEach(u => {
        const r = (u.role || u.userRole || '').toLowerCase();
        if (r === 'admin') {
            adminCount++;
        } else if (r === 'kasir' || r === 'kasir buku') {
            kasirCount++;
        } else {
            pustakawanCount++;
        }
    });

    let rowsHtml = '';

    users.forEach((u) => {
        const username = u.username || u.userName || '-';
        const fullName = u.fullName || u.userFullName || u.name || '-';
        const roleRaw = (u.role || u.userRole || 'pustakawan').toLowerCase();
        const targetId = u.__backendId || u.id || username;
        const createdAt = u.timestamp || u.createdAt || '';
        const tglDibuat = createdAt ? formatDate(createdAt) : '-';

        const isActive = (u.userStatus || u.status || 'aktif').toLowerCase() !== 'nonaktif';
        const isCurrentUser =
            (currentUser.username && currentUser.username.toLowerCase() === username.toLowerCase()) ||
            (currentUser.id && currentUser.id === targetId);

        let roleBadge = '';
        if (roleRaw === 'admin') {
            roleBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">👑 Admin</span>`;
        } else if (roleRaw === 'kasir' || roleRaw === 'kasir buku') {
            roleBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">💳 Kasir Buku</span>`;
        } else {
            roleBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">📚 Pustakawan</span>`;
        }

        const statusBadge = isActive
            ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">✓ Aktif</span>`
            : `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Nonaktif</span>`;

        const rowBg = isCurrentUser ? 'bg-blue-50/40' : 'hover:bg-gray-50';

        rowsHtml += `
            <tr class="border-b ${rowBg} transition-colors">
                <td class="p-3.5 font-mono text-xs font-semibold text-gray-800">
                    <div class="flex items-center gap-2">
                        <span>${username}</span>
                        ${isCurrentUser ? `<span class="px-2 py-0.5 text-[10px] font-sans font-semibold bg-blue-100 text-blue-700 rounded">Anda</span>` : ''}
                    </div>
                </td>
                <td class="p-3.5 font-medium text-gray-800">${fullName}</td>
                <td class="p-3.5">${roleBadge}</td>
                <td class="p-3.5 text-gray-600 text-xs">${tglDibuat}</td>
                <td class="p-3.5">${statusBadge}</td>
                <td class="p-3.5 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                        <button onclick="editUser('${targetId}')" title="Edit User" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            <i data-lucide="pencil" class="w-4 h-4"></i>
                        </button>
                        <button onclick="showResetPasswordModal('${targetId}')" title="Reset Password" class="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                            <i data-lucide="key-round" class="w-4 h-4"></i>
                        </button>
                        ${!isCurrentUser
                            ? `<button onclick="deleteUser('${targetId}')" title="Hapus User" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                   <i data-lucide="trash-2" class="w-4 h-4"></i>
                               </button>`
                            : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    if (users.length === 0) {
        rowsHtml = `<tr><td colspan="6" class="p-8 text-center text-gray-500">Belum ada data user. Klik tombol "+ Tambah User" untuk menambahkan akun.</td></tr>`;
    }

    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Manajemen User</h2>
                    <p class="text-gray-500 text-sm">Kelola akun pengguna dan hak akses sistem</p>
                </div>
                <button onclick="showAddUserModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors">
                    <i data-lucide="plus" class="w-4 h-4"></i> Tambah User
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium text-gray-500">Total User</p>
                        <p class="text-3xl font-bold text-gray-800 mt-1">${users.length}</p>
                    </div>
                    <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <i data-lucide="users" class="w-6 h-6"></i>
                    </div>
                </div>

                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium text-gray-500">Admin</p>
                        <p class="text-3xl font-bold text-gray-800 mt-1">${adminCount}</p>
                    </div>
                    <div class="p-3 bg-amber-50 text-amber-500 rounded-xl">
                        <i data-lucide="crown" class="w-6 h-6"></i>
                    </div>
                </div>

                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500 flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium text-gray-500">Pustakawan</p>
                        <p class="text-3xl font-bold text-gray-800 mt-1">${pustakawanCount}</p>
                    </div>
                    <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <i data-lucide="library" class="w-6 h-6"></i>
                    </div>
                </div>

                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium text-gray-500">Kasir Buku</p>
                        <p class="text-3xl font-bold text-gray-800 mt-1">${kasirCount}</p>
                    </div>
                    <div class="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <i data-lucide="credit-card" class="w-6 h-6"></i>
                    </div>
                </div>
            </div>

            <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-4">
                <h3 class="font-bold text-blue-800 text-sm flex items-center gap-2">
                    <i data-lucide="info" class="w-4 h-4 text-blue-600"></i> Informasi Role & Hak Akses
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                    <div>
                        <p class="font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">👑 Admin</p>
                        <ul class="list-disc list-inside space-y-1 text-gray-600">
                            <li>Akses penuh ke semua menu</li>
                            <li>Manajemen user (tambah, edit, hapus)</li>
                            <li>Manajemen kategori buku</li>
                            <li>Pengaturan sistem</li>
                        </ul>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">📚 Pustakawan</p>
                        <ul class="list-disc list-inside space-y-1 text-gray-600">
                            <li>Kelola (tambah/edit) koleksi buku</li>
                            <li>Kelola data anggota</li>
                            <li>Proses peminjaman & pengembalian</li>
                        </ul>
                    </div>
                    <div>
                        <p class="font-bold text-indigo-700 mb-1.5 flex items-center gap-1.5">💳 Kasir Buku</p>
                        <ul class="list-disc list-inside space-y-1 text-gray-600">
                            <li>Hanya memproses Peminjaman & Pengembalian</li>
                            <li>Melihat data buku & anggota (tanpa akses edit/tambah)</li>
                            <li>Tidak dapat mengakses menu pengaturan & user</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-600 text-xs font-semibold border-b">
                            <tr>
                                <th class="p-3.5">Username</th>
                                <th class="p-3.5">Nama Lengkap</th>
                                <th class="p-3.5">Role</th>
                                <th class="p-3.5">Tgl. Dibuat</th>
                                <th class="p-3.5">Status</th>
                                <th class="p-3.5">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-2.5">
                <h3 class="font-bold text-amber-800 text-sm flex items-center gap-2">
                    <i data-lucide="lock" class="w-4 h-4 text-amber-600"></i> Tips Keamanan
                </h3>
                <ul class="list-disc list-inside space-y-1 text-xs text-gray-700">
                    <li>Gunakan username yang unik dan mudah diingat</li>
                    <li>Buat password yang kuat (minimal 8 karakter, kombinasi huruf, angka, dan simbol)</li>
                    <li>Jangan bagikan password kepada orang lain</li>
                    <li>Ganti password secara berkala (minimal 3 bulan sekali)</li>
                    <li>Logout setelah selesai menggunakan sistem</li>
                    <li>Berikan role sesuai kebutuhan (principle of least privilege)</li>
                    <li>Hapus akun user yang sudah tidak aktif</li>
                </ul>
            </div>
        </div>
    `;
}

function showAddUserModal() {
    const formHtml = `
        <form onsubmit="saveUser(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input type="text" id="userFullName" required placeholder="Contoh: Valian Topanika" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input type="text" id="userUsername" required placeholder="Username untuk login" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" id="userPassword" required placeholder="Minimal 6 karakter" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role / Hak Akses *</label>
                <select id="userRole" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                    <option value="pustakawan">Pustakawan</option>
                    <option value="kasir">Kasir Buku</option>
                    <option value="admin">Admin</option>
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
        userStatus: 'aktif',
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
    const role = (user.role || user.userRole || 'pustakawan').toLowerCase();
    const status = (user.userStatus || user.status || 'aktif').toLowerCase();

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
                <label class="block text-sm font-medium text-gray-700 mb-1">Role / Hak Akses *</label>
                <select id="editUserRole" required class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                    <option value="pustakawan" ${role === 'pustakawan' || role === 'petugas' ? 'selected' : ''}>Pustakawan</option>
                    <option value="kasir" ${role === 'kasir' || role === 'kasir buku' ? 'selected' : ''}>Kasir Buku</option>
                    <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status Akun</label>
                <select id="editUserStatus" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                    <option value="aktif" ${status !== 'nonaktif' ? 'selected' : ''}>Aktif</option>
                    <option value="nonaktif" ${status === 'nonaktif' ? 'selected' : ''}>Nonaktif</option>
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
        role: document.getElementById('editUserRole').value,
        userStatus: document.getElementById('editUserStatus').value,
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

function showResetPasswordModal(backendId) {
    const user = appState.allRecords.find(u => u.type === 'user' && (u.__backendId === backendId || u.id === backendId || u.username === backendId));
    if (!user) {
        showToast("Data user tidak ditemukan!", "error");
        return;
    }

    const username = user.username || user.userName || '-';
    const formHtml = `
        <form onsubmit="processResetPassword(event, '${user.__backendId || username}')" class="space-y-4">
            <p class="text-sm text-gray-600">Masukkan password baru untuk akun <strong class="text-gray-800">${username}</strong>.</p>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru *</label>
                <input type="password" id="resetNewPassword" required placeholder="Minimal 6 karakter" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru *</label>
                <input type="password" id="resetConfirmPassword" required placeholder="Ketik ulang password baru" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
            </div>
            <div class="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm">Batal</button>
                <button type="submit" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium text-sm">Simpan Password</button>
            </div>
        </form>
    `;
    openModal("Reset Password User", formHtml, "max-w-md");
}

async function processResetPassword(event, backendId) {
    event.preventDefault();
    const newPass = document.getElementById('resetNewPassword').value.trim();
    const confirmPass = document.getElementById('resetConfirmPassword').value.trim();

    if (newPass !== confirmPass) {
        showToast("Konfirmasi password tidak cocok!", "error");
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;

    const existingUser = appState.allRecords.find(u => u.type === 'user' && (u.__backendId === backendId || u.username === backendId)) || {};
    const updatedPayload = {
        ...existingUser,
        __backendId: existingUser.__backendId || backendId,
        password: newPass,
        type: 'user'
    };

    const result = await window.dataSdk.sendData('update', updatedPayload);
    if (result && result.success) {
        appState.allRecords = appState.allRecords.map(record =>
            (record.type === 'user' && (record.__backendId === backendId || record.username === backendId)) ? updatedPayload : record
        );
        closeModal();
        showToast("Password berhasil direset!", "success");
    } else {
        submitBtn.innerText = "Simpan Password";
        submitBtn.disabled = false;
        showToast("Gagal mereset password", "error");
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