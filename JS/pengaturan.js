// JS/pengaturan.js

function renderSettingsSection() {
    const savedSettings = JSON.parse(localStorage.getItem('librarySettings') || '{}');
    const libName = savedSettings.libraryName || defaultConfig.libraryName || 'PerpusWeb';
    const libSub = savedSettings.librarySubtitle || defaultConfig.librarySubtitle || 'Sistem Informasi Perpustakaan';
    const primaryColor = savedSettings.primaryColor || defaultConfig.primaryColor || '#2563eb';
    const denda = savedSettings.finePerDay !== undefined ? savedSettings.finePerDay : (defaultConfig.finePerDay || 1000);
    const maksHari = savedSettings.maxLoanDays || defaultConfig.maxLoanDays || 7;

    // Data Kop Sekolah
    const kopHeader1 = savedSettings.kopHeader1 || defaultConfig.kopHeader1 || 'PEMERINTAH PROVINSI LAMPUNG\nDINAS PENDIDIKAN DAN KEBUDAYAAN';
    const kopSchoolName = savedSettings.kopSchoolName || defaultConfig.kopSchoolName || 'SMKN 1 BARADATU';
    const kopAddress = savedSettings.kopAddress || defaultConfig.kopAddress || 'Jl. Pendidikan No. 1, Baradatu, Kab. Way Kanan, Lampung';
    const kopContact = savedSettings.kopContact || defaultConfig.kopContact || 'Website: www.sekolah.sch.id | Email: perpus@sekolah.sch.id';

    return `
        <div class="space-y-6 max-w-4xl">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
                <p class="text-gray-500 text-sm">Atur identitas perpustakaan, kop surat sekolah, aturan sirkulasi, serta backup & restore data.</p>
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

                <!-- PENGATURAN KOP SEKOLAH -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div class="flex items-center justify-between border-b pb-2">
                        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span>🏫</span> Pengaturan Kop Sekolah (Cetak Laporan & Kartu)
                        </h3>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Header Instansi / Dinas / Yayasan (Baris Atas)</label>
                            <textarea id="settingKopHeader1" rows="2" placeholder="Contoh: PEMERINTAH PROVINSI LAMPUNG&#10;DINAS PENDIDIKAN DAN KEBUDAYAAN" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">${kopHeader1}</textarea>
                            <p class="text-[11px] text-gray-400 mt-1">Gunakan Enter jika ingin membagi menjadi 2 baris pada kop surat.</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah / Lembaga *</label>
                            <input type="text" id="settingKopSchoolName" value="${kopSchoolName}" required placeholder="Contoh: SMK NEGERI 1 BARADATU" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-semibold">
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap Sekolah</label>
                                <input type="text" id="settingKopAddress" value="${kopAddress}" placeholder="Jl. Raya..." class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Kontak / Website / NPSN</label>
                                <input type="text" id="settingKopContact" value="${kopContact}" placeholder="Telp / Email / Website" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                            </div>
                        </div>

                        <!-- Pratinjau Kop Sekolah -->
                        <div class="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300">
                            <p class="text-[11px] font-semibold text-gray-400 uppercase mb-2">Pratinjau Tampilan Kop Cetak:</p>
                            <div class="bg-white p-4 rounded-lg border text-center space-y-0.5">
                                <p class="text-xs font-semibold text-gray-700 whitespace-pre-line uppercase">${kopHeader1}</p>
                                <p class="text-base font-bold text-gray-900 uppercase">${kopSchoolName}</p>
                                <p class="text-xs text-gray-600">${kopAddress}</p>
                                <p class="text-[11px] text-gray-500">${kopContact}</p>
                                <div class="border-b-2 border-gray-800 pt-2"></div>
                            </div>
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
                    <p class="text-xs text-amber-600 flex items-center gap-1.5 pt-1">
                        <span>⚠️</span> Pengaturan denda saat ini diatur di ${formatRupiah(denda)}/hari
                    </p>
                </div>

                <div>
                    <button type="submit" id="btnSaveSettings" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors">
                        Simpan Semua Pengaturan
                    </button>
                </div>
            </form>

            <!-- PANEL BACKUP, EXPORT & IMPORT DATA -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
                <div>
                    <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>💾</span> Backup, Export & Import Data
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">Kelola data sistem secara massal dari sini.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button type="button" onclick="exportAllDataCSV()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-colors">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Export Semua Data (CSV)
                    </button>
                    <button type="button" onclick="backupAllDataJSON()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-colors">
                        <i data-lucide="hard-drive-download" class="w-4 h-4"></i> Backup Aman (JSON)
                    </button>
                </div>

                <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div>
                        <h4 class="font-bold text-emerald-800 text-sm flex items-center gap-2">
                            <i data-lucide="book-plus" class="w-4 h-4"></i> Impor Data Buku dari Excel / CSV
                        </h4>
                        <p class="text-xs text-emerald-700 mt-0.5">Tambahkan banyak buku sekaligus ke Koleksi Buku.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="file" id="settingsImportBookInput" accept=".xlsx,.xls,.csv" class="hidden" onchange="handleDirectImportBooks(this)">
                        <button type="button" onclick="document.getElementById('settingsImportBookInput').click()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                            <i data-lucide="upload" class="w-4 h-4"></i> Pilih File Excel / CSV
                        </button>
                        <button type="button" onclick="downloadBookTemplate()" class="w-full bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                            <i data-lucide="file-down" class="w-4 h-4"></i> Unduh Template Buku
                        </button>
                    </div>
                    <div id="settingsBookImportStatus" class="hidden text-xs font-medium text-emerald-800"></div>
                </div>

                <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                    <div>
                        <h4 class="font-bold text-blue-800 text-sm flex items-center gap-2">
                            <i data-lucide="users" class="w-4 h-4"></i> Impor Data Anggota dari Excel / CSV
                        </h4>
                        <p class="text-xs text-blue-700 mt-0.5">Daftarkan banyak anggota (siswa) sekaligus.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="file" id="settingsImportMemberInput" accept=".xlsx,.xls,.csv" class="hidden" onchange="handleDirectImportMembers(this)">
                        <button type="button" onclick="document.getElementById('settingsImportMemberInput').click()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                            <i data-lucide="upload" class="w-4 h-4"></i> Pilih File Excel / CSV
                        </button>
                        <button type="button" onclick="downloadMemberTemplate()" class="w-full bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                            <i data-lucide="file-down" class="w-4 h-4"></i> Unduh Template Anggota
                        </button>
                    </div>
                    <div id="settingsMemberImportStatus" class="hidden text-xs font-medium text-blue-800"></div>
                </div>

                <div class="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <i data-lucide="refresh-ccw" class="w-4 h-4 text-blue-600"></i> Restore setelah pembaruan
                        </h4>
                        <p class="text-xs text-gray-500 mt-0.5">Pilih file backup JSON. Data akan ditambahkan ke Database.</p>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-gray-200">
                        <input type="file" id="restoreJsonInput" accept=".json" onchange="handleRestoreJSON(this)" class="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-xs file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer">
                    </div>
                    <div id="restoreJsonStatus" class="hidden text-xs font-medium text-blue-700"></div>
                </div>
            </div>
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
        kopHeader1: document.getElementById('settingKopHeader1').value.trim(),
        kopSchoolName: document.getElementById('settingKopSchoolName').value.trim() || 'SMKN 1 BARADATU',
        kopAddress: document.getElementById('settingKopAddress').value.trim(),
        kopContact: document.getElementById('settingKopContact').value.trim(),
        maxLoanDays: parseInt(document.getElementById('settingMaxDays').value) || 7,
        finePerDay: parseInt(document.getElementById('settingFine').value) || 0,
        type: 'setting'
    };

    localStorage.setItem('librarySettings', JSON.stringify(settings));
    Object.assign(defaultConfig, settings);
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);

    const sidebarTitle = document.getElementById('sidebarLibName');
    if (sidebarTitle) sidebarTitle.textContent = settings.libraryName;

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
    showToast("Pengaturan & Kop Sekolah berhasil disimpan!", "success");
    renderCurrentSection();
}

// --- FUNGSI BACKUP, EXPORT, IMPORT & RESTORE ---

function exportAllDataCSV() {
    if (!appState.allRecords || appState.allRecords.length === 0) {
        showToast("Belum ada data di sistem untuk diexport.", "error");
        return;
    }
    const ws = XLSX.utils.json_to_sheet(appState.allRecords);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Semua Data");
    const dateTag = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Export_Semua_Data_Perpus_${dateTag}.csv`, { bookType: "csv" });
    showToast("Semua data berhasil diexport ke CSV!", "success");
}

function backupAllDataJSON() {
    if (!appState.allRecords || appState.allRecords.length === 0) {
        showToast("Belum ada data untuk dibackup.", "error");
        return;
    }
    const backupPayload = {
        appName: defaultConfig.libraryName || "PerpusWeb",
        exportedAt: new Date().toISOString(),
        totalRecords: appState.allRecords.length,
        records: appState.allRecords
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateTag = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `Backup_Perpus_${dateTag}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("File Backup JSON berhasil diunduh!", "success");
}

function handleDirectImportBooks(inputEl) {
    if (!inputEl.files || !inputEl.files.length) return;
    const statusEl = document.getElementById('settingsBookImportStatus');
    if (statusEl) {
        statusEl.classList.remove('hidden');
        statusEl.textContent = "Membaca file buku...";
    }

    const file = inputEl.files[0];
    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            if (rows.length === 0) {
                showToast("File Excel / CSV buku kosong!", "error");
                if (statusEl) statusEl.classList.add('hidden');
                inputEl.value = '';
                return;
            }

            let successCount = 0;
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (statusEl) statusEl.textContent = `Mengimpor buku ${i + 1} dari ${rows.length}...`;

                const newBook = {
                    bookBarcode: String(row.Barcode || row.Kode || row.bookBarcode || ('BK-' + Date.now() + '-' + i)),
                    bookTitle: String(row.Judul || row.Title || row.bookTitle || 'Tanpa Judul'),
                    bookAuthor: String(row.Pengarang || row.Author || row.bookAuthor || '-'),
                    bookPublisher: String(row.Penerbit || row.Publisher || row.bookPublisher || '-'),
                    bookYear: String(row.Tahun || row.Year || row.bookYear || ''),
                    bookCategory: String(row.Kategori || row.Category || row.bookCategory || 'Lainnya'),
                    bookShelf: String(row.Rak || row.Shelf || row.bookShelf || '-'),
                    bookStock: Number(row.Stok || row.Stock || row.bookStock || 1),
                    type: 'book',
                    timestamp: new Date().toISOString()
                };

                const res = await window.dataSdk.sendData('create', newBook);
                if (res && res.success) {
                    appState.allRecords.push(newBook);
                    successCount++;
                }
            }

            if (statusEl) statusEl.textContent = `Selesai: ${successCount} dari ${rows.length} buku berhasil ditambahkan.`;
            showToast(`Berhasil mengimpor ${successCount} buku!`, "success");
        } catch (err) {
            console.error(err);
            showToast("Gagal memproses file buku.", "error");
            if (statusEl) statusEl.classList.add('hidden');
        }
        inputEl.value = '';
    };
    reader.readAsArrayBuffer(file);
}

function handleDirectImportMembers(inputEl) {
    if (!inputEl.files || !inputEl.files.length) return;
    const statusEl = document.getElementById('settingsMemberImportStatus');
    if (statusEl) {
        statusEl.classList.remove('hidden');
        statusEl.textContent = "Membaca file anggota...";
    }

    const file = inputEl.files[0];
    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            if (rows.length === 0) {
                showToast("File Excel / CSV anggota kosong!", "error");
                if (statusEl) statusEl.classList.add('hidden');
                inputEl.value = '';
                return;
            }

            let successCount = 0;
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (statusEl) statusEl.textContent = `Mengimpor anggota ${i + 1} dari ${rows.length}...`;

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

            if (statusEl) statusEl.textContent = `Selesai: ${successCount} dari ${rows.length} anggota berhasil ditambahkan.`;
            showToast(`Berhasil mengimpor ${successCount} anggota!`, "success");
        } catch (err) {
            console.error(err);
            showToast("Gagal memproses file anggota.", "error");
            if (statusEl) statusEl.classList.add('hidden');
        }
        inputEl.value = '';
    };
    reader.readAsArrayBuffer(file);
}

function handleRestoreJSON(inputEl) {
    if (!inputEl.files || !inputEl.files.length) return;
    const statusEl = document.getElementById('restoreJsonStatus');
    const file = inputEl.files[0];

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const parsed = JSON.parse(e.target.result);
            const recordsToRestore = Array.isArray(parsed) ? parsed : (parsed.records || []);

            if (!Array.isArray(recordsToRestore) || recordsToRestore.length === 0) {
                showToast("Format JSON tidak valid atau kosong!", "error");
                inputEl.value = '';
                return;
            }

            if (!confirm(`Ditemukan ${recordsToRestore.length} data dalam file backup. Tambahkan ke database sekarang?`)) {
                inputEl.value = '';
                return;
            }

            if (statusEl) {
                statusEl.classList.remove('hidden');
                statusEl.textContent = `Memulihkan 0 dari ${recordsToRestore.length} data...`;
            }

            let restoredCount = 0;
            for (let i = 0; i < recordsToRestore.length; i++) {
                const item = { ...recordsToRestore[i] };
                delete item.__backendId;
                if (!item.type) continue;

                if (statusEl) {
                    statusEl.textContent = `Memulihkan data ${i + 1} dari ${recordsToRestore.length}...`;
                }

                const res = await window.dataSdk.sendData('create', item);
                if (res && res.success) {
                    appState.allRecords.push(item);
                    restoredCount++;
                }
            }

            if (statusEl) {
                statusEl.textContent = `Restore selesai: ${restoredCount} dari ${recordsToRestore.length} data berhasil ditambahkan.`;
            }
            showToast(`Restore berhasil! ${restoredCount} data ditambahkan.`, "success");
        } catch (err) {
            console.error(err);
            showToast("File JSON rusak atau tidak dapat dibaca.", "error");
        }
        inputEl.value = '';
    };
    reader.readAsText(file);
}

// JS/pengaturan.js

// Helper kompresi & konversi gambar logo ke Base64 agar ringan disimpan
function handleKopLogoUpload(inputEl, side) {
    if (!inputEl.files || !inputEl.files.length) return;
    const file = inputEl.files[0];

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const maxDim = 220; // Ukuran optimal untuk cetak kop surat
            let w = img.width;
            let h = img.height;

            if (w > maxDim || h > maxDim) {
                if (w > h) {
                    h = Math.round((h * maxDim) / w);
                    w = maxDim;
                } else {
                    w = Math.round((w * maxDim) / h);
                    h = maxDim;
                }
            }

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            const dataUrl = canvas.toDataURL('image/png');
            const hiddenInput = document.getElementById(side === 'left' ? 'settingKopLogoLeft' : 'settingKopLogoRight');
            if (hiddenInput) hiddenInput.value = dataUrl;

            updateKopPreviewLive();
            showToast(`Logo ${side === 'left' ? 'Kiri (Provinsi)' : 'Kanan (Sekolah)'} berhasil dimuat!`, 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function clearKopLogo(side) {
    const hiddenInput = document.getElementById(side === 'left' ? 'settingKopLogoLeft' : 'settingKopLogoRight');
    const fileInput = document.getElementById(side === 'left' ? 'fileKopLogoLeft' : 'fileKopLogoRight');
    if (hiddenInput) hiddenInput.value = '';
    if (fileInput) fileInput.value = '';
    updateKopPreviewLive();
}

function updateKopPreviewLive() {
    const header1 = document.getElementById('settingKopHeader1')?.value || '';
    const schoolName = document.getElementById('settingKopSchoolName')?.value || '';
    const address = document.getElementById('settingKopAddress')?.value || '';
    const contact = document.getElementById('settingKopContact')?.value || '';
    const logoLeft = document.getElementById('settingKopLogoLeft')?.value || '';
    const logoRight = document.getElementById('settingKopLogoRight')?.value || '';

    const prevHeader1 = document.getElementById('previewKopHeader1');
    const prevSchool = document.getElementById('previewKopSchool');
    const prevAddress = document.getElementById('previewKopAddress');
    const prevContact = document.getElementById('previewKopContact');
    const prevLeftBox = document.getElementById('previewKopLogoLeftBox');
    const prevRightBox = document.getElementById('previewKopLogoRightBox');

    if (prevHeader1) prevHeader1.textContent = header1;
    if (prevSchool) prevSchool.textContent = schoolName;
    if (prevAddress) prevAddress.textContent = address;
    if (prevContact) prevContact.textContent = contact;

    if (prevLeftBox) {
        prevLeftBox.innerHTML = logoLeft
            ? `<img src="${logoLeft}" alt="Logo Provinsi" class="w-16 h-16 object-contain mx-auto">`
            : `<div class="w-14 h-14 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-[10px] text-gray-400 text-center leading-tight">Logo<br>Provinsi</div>`;
    }

    if (prevRightBox) {
        prevRightBox.innerHTML = logoRight
            ? `<img src="${logoRight}" alt="Logo Sekolah" class="w-16 h-16 object-contain mx-auto">`
            : `<div class="w-14 h-14 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-[10px] text-gray-400 text-center leading-tight">Logo<br>Sekolah</div>`;
    }
}

function renderSettingsSection() {
    const savedSettings = JSON.parse(localStorage.getItem('librarySettings') || '{}');
    const libName = savedSettings.libraryName || defaultConfig.libraryName || 'PerpusWeb';
    const libSub = savedSettings.librarySubtitle || defaultConfig.librarySubtitle || 'Sistem Informasi Perpustakaan';
    const primaryColor = savedSettings.primaryColor || defaultConfig.primaryColor || '#2563eb';
    const denda = savedSettings.finePerDay !== undefined ? savedSettings.finePerDay : (defaultConfig.finePerDay || 1000);
    const maksHari = savedSettings.maxLoanDays || defaultConfig.maxLoanDays || 7;

    // Data Kop Sekolah & Logo Kiri/Kanan
    const kopHeader1 = savedSettings.kopHeader1 || defaultConfig.kopHeader1 || 'PEMERINTAH PROVINSI LAMPUNG\nDINAS PENDIDIKAN DAN KEBUDAYAAN';
    const kopSchoolName = savedSettings.kopSchoolName || defaultConfig.kopSchoolName || 'SMKN 1 BARADATU';
    const kopAddress = savedSettings.kopAddress || defaultConfig.kopAddress || 'Jl. Pendidikan No. 1, Baradatu, Kab. Way Kanan, Lampung';
    const kopContact = savedSettings.kopContact || defaultConfig.kopContact || 'Website: www.sekolah.sch.id | Email: perpus@sekolah.sch.id';
    const kopLogoLeft = savedSettings.kopLogoLeft || defaultConfig.kopLogoLeft || '';
    const kopLogoRight = savedSettings.kopLogoRight || defaultConfig.kopLogoRight || '';

    return `
        <div class="space-y-6 max-w-4xl">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
                <p class="text-gray-500 text-sm">Atur identitas perpustakaan, kop surat sekolah, aturan sirkulasi, serta backup & restore data.</p>
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

                <!-- PENGATURAN KOP SEKOLAH & LOGO KIRI / KANAN -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
                    <div class="border-b pb-2">
                        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span>🏫</span> Pengaturan Kop Sekolah (Cetak Laporan & Kartu)
                        </h3>
                    </div>

                    <!-- Input Upload Logo Kiri (Provinsi) & Logo Kanan (Sekolah) -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Logo Kiri: Provinsi -->
                        <div class="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2.5">
                            <div class="flex items-center justify-between">
                                <label class="block text-sm font-semibold text-gray-800">Logo Kiri (Provinsi / Dinas)</label>
                                <button type="button" onclick="clearKopLogo('left')" class="text-xs text-red-600 hover:underline">Hapus Logo</button>
                            </div>
                            <input type="file" id="fileKopLogoLeft" accept="image/*" onchange="handleKopLogoUpload(this, 'left')"
                                class="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-xs file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-100 cursor-pointer">
                            <input type="hidden" id="settingKopLogoLeft" value="${kopLogoLeft}">
                            <p class="text-[11px] text-gray-400">Format PNG transparan / JPG disarankan.</p>
                        </div>

                        <!-- Logo Kanan: Sekolah -->
                        <div class="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2.5">
                            <div class="flex items-center justify-between">
                                <label class="block text-sm font-semibold text-gray-800">Logo Kanan (Sekolah)</label>
                                <button type="button" onclick="clearKopLogo('right')" class="text-xs text-red-600 hover:underline">Hapus Logo</button>
                            </div>
                            <input type="file" id="fileKopLogoRight" accept="image/*" onchange="handleKopLogoUpload(this, 'right')"
                                class="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-xs file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-100 cursor-pointer">
                            <input type="hidden" id="settingKopLogoRight" value="${kopLogoRight}">
                            <p class="text-[11px] text-gray-400">Format PNG transparan / JPG disarankan.</p>
                        </div>
                    </div>

                    <!-- Teks Kop Surat -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Header Instansi / Dinas / Yayasan (Baris Atas)</label>
                            <textarea id="settingKopHeader1" rows="2" oninput="updateKopPreviewLive()" placeholder="Contoh: PEMERINTAH PROVINSI LAMPUNG&#10;DINAS PENDIDIKAN DAN KEBUDAYAAN" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">${kopHeader1}</textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah / Lembaga *</label>
                            <input type="text" id="settingKopSchoolName" value="${kopSchoolName}" oninput="updateKopPreviewLive()" required placeholder="Contoh: SMK NEGERI 1 BARADATU" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-semibold">
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap Sekolah</label>
                                <input type="text" id="settingKopAddress" value="${kopAddress}" oninput="updateKopPreviewLive()" placeholder="Jl. Raya..." class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Kontak / Website / NPSN</label>
                                <input type="text" id="settingKopContact" value="${kopContact}" oninput="updateKopPreviewLive()" placeholder="Telp / Email / Website" class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
                            </div>
                        </div>

                        <!-- Pratinjau Kop Sekolah dengan Logo Kiri & Kanan -->
                        <div class="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300">
                            <p class="text-[11px] font-semibold text-gray-400 uppercase mb-2">Pratinjau Tampilan Kop Cetak:</p>
                            <div class="bg-white p-4 rounded-lg border">
                                <div class="flex items-center justify-between gap-4">
                                    <!-- Kolom Logo Kiri -->
                                    <div id="previewKopLogoLeftBox" class="w-16 flex-shrink-0 flex items-center justify-center">
                                        ${kopLogoLeft
                                            ? `<img src="${kopLogoLeft}" alt="Logo Provinsi" class="w-16 h-16 object-contain mx-auto">`
                                            : `<div class="w-14 h-14 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-[10px] text-gray-400 text-center leading-tight">Logo<br>Provinsi</div>`}
                                    </div>

                                    <!-- Kolom Teks Tengah -->
                                    <div class="flex-1 text-center space-y-0.5">
                                        <p id="previewKopHeader1" class="text-xs font-semibold text-gray-700 whitespace-pre-line uppercase">${kopHeader1}</p>
                                        <p id="previewKopSchool" class="text-base font-bold text-gray-900 uppercase">${kopSchoolName}</p>
                                        <p id="previewKopAddress" class="text-xs text-gray-600">${kopAddress}</p>
                                        <p id="previewKopContact" class="text-[11px] text-gray-500">${kopContact}</p>
                                    </div>

                                    <!-- Kolom Logo Kanan -->
                                    <div id="previewKopLogoRightBox" class="w-16 flex-shrink-0 flex items-center justify-center">
                                        ${kopLogoRight
                                            ? `<img src="${kopLogoRight}" alt="Logo Sekolah" class="w-16 h-16 object-contain mx-auto">`
                                            : `<div class="w-14 h-14 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-[10px] text-gray-400 text-center leading-tight">Logo<br>Sekolah</div>`}
                                    </div>
                                </div>
                                <div class="border-b-2 border-gray-800 pt-3"></div>
                            </div>
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
                    <p class="text-xs text-amber-600 flex items-center gap-1.5 pt-1">
                        <span>⚠️</span> Pengaturan denda saat ini diatur di ${formatRupiah(denda)}/hari
                    </p>
                </div>

                <div>
                    <button type="submit" id="btnSaveSettings" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors">
                        Simpan Semua Pengaturan
                    </button>
                </div>
            </form>

            <!-- PANEL BACKUP, EXPORT & IMPORT DATA -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
                <div>
                    <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>💾</span> Backup, Export & Import Data
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">Kelola data sistem secara massal dari sini.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button type="button" onclick="exportAllDataCSV()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-colors">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Export Semua Data (CSV)
                    </button>
                    <button type="button" onclick="backupAllDataJSON()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-colors">
                        <i data-lucide="hard-drive-download" class="w-4 h-4"></i> Backup Aman (JSON)
                    </button>
                </div>

                <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div>
                        <h4 class="font-bold text-emerald-800 text-sm flex items-center gap-2">
                            <i data-lucide="book-plus" class="w-4 h-4"></i> Impor Data Buku dari Excel / CSV
                        </h4>
                        <p class="text-xs text-emerald-700 mt-0.5">Tambahkan banyak buku sekaligus ke Koleksi Buku.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="file" id="settingsImportBookInput" accept=".xlsx,.xls,.csv" class="hidden" onchange="handleDirectImportBooks(this)">
                        <button type="button" onclick="document.getElementById('settingsImportBookInput').click()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                            <i data-lucide="upload" class="w-4 h-4"></i> Pilih File Excel / CSV
                        </button>
                        <button type="button" onclick="downloadBookTemplate()" class="w-full bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                            <i data-lucide="file-down" class="w-4 h-4"></i> Unduh Template Buku
                        </button>
                    </div>
                    <div id="settingsBookImportStatus" class="hidden text-xs font-medium text-emerald-800"></div>
                </div>

                <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                    <div>
                        <h4 class="font-bold text-blue-800 text-sm flex items-center gap-2">
                            <i data-lucide="users" class="w-4 h-4"></i> Impor Data Anggota dari Excel / CSV
                        </h4>
                        <p class="text-xs text-blue-700 mt-0.5">Daftarkan banyak anggota (siswa) sekaligus.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="file" id="settingsImportMemberInput" accept=".xlsx,.xls,.csv" class="hidden" onchange="handleDirectImportMembers(this)">
                        <button type="button" onclick="document.getElementById('settingsImportMemberInput').click()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                            <i data-lucide="upload" class="w-4 h-4"></i> Pilih File Excel / CSV
                        </button>
                        <button type="button" onclick="downloadMemberTemplate()" class="w-full bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                            <i data-lucide="file-down" class="w-4 h-4"></i> Unduh Template Anggota
                        </button>
                    </div>
                    <div id="settingsMemberImportStatus" class="hidden text-xs font-medium text-blue-800"></div>
                </div>

                <div class="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <i data-lucide="refresh-ccw" class="w-4 h-4 text-blue-600"></i> Restore setelah pembaruan
                        </h4>
                        <p class="text-xs text-gray-500 mt-0.5">Pilih file backup JSON. Data akan ditambahkan ke Database.</p>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-gray-200">
                        <input type="file" id="restoreJsonInput" accept=".json" onchange="handleRestoreJSON(this)" class="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-xs file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer">
                    </div>
                    <div id="restoreJsonStatus" class="hidden text-xs font-medium text-blue-700"></div>
                </div>
            </div>
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
        kopHeader1: document.getElementById('settingKopHeader1').value.trim(),
        kopSchoolName: document.getElementById('settingKopSchoolName').value.trim() || 'SMKN 1 BARADATU',
        kopAddress: document.getElementById('settingKopAddress').value.trim(),
        kopContact: document.getElementById('settingKopContact').value.trim(),
        kopLogoLeft: document.getElementById('settingKopLogoLeft').value || '',
        kopLogoRight: document.getElementById('settingKopLogoRight').value || '',
        maxLoanDays: parseInt(document.getElementById('settingMaxDays').value) || 7,
        finePerDay: parseInt(document.getElementById('settingFine').value) || 0,
        type: 'setting'
    };

    localStorage.setItem('librarySettings', JSON.stringify(settings));
    Object.assign(defaultConfig, settings);
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);

    const sidebarTitle = document.getElementById('sidebarLibName');
    if (sidebarTitle) sidebarTitle.textContent = settings.libraryName;

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
    showToast("Pengaturan & Logo Kop Sekolah berhasil disimpan!", "success");
    renderCurrentSection();
}

// --- FUNGSI BACKUP, EXPORT, IMPORT & RESTORE ---

function exportAllDataCSV() {
    if (!appState.allRecords || appState.allRecords.length === 0) {
        showToast("Belum ada data di sistem untuk diexport.", "error");
        return;
    }
    const ws = XLSX.utils.json_to_sheet(appState.allRecords);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Semua Data");
    const dateTag = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Export_Semua_Data_Perpus_${dateTag}.csv`, { bookType: "csv" });
    showToast("Semua data berhasil diexport ke CSV!", "success");
}

function backupAllDataJSON() {
    if (!appState.allRecords || appState.allRecords.length === 0) {
        showToast("Belum ada data untuk dibackup.", "error");
        return;
    }
    const backupPayload = {
        appName: defaultConfig.libraryName || "PerpusWeb",
        exportedAt: new Date().toISOString(),
        totalRecords: appState.allRecords.length,
        records: appState.allRecords
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateTag = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `Backup_Perpus_${dateTag}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("File Backup JSON berhasil diunduh!", "success");
}

function handleDirectImportBooks(inputEl) {
    if (!inputEl.files || !inputEl.files.length) return;
    const statusEl = document.getElementById('settingsBookImportStatus');
    if (statusEl) {
        statusEl.classList.remove('hidden');
        statusEl.textContent = "Membaca file buku...";
    }

    const file = inputEl.files[0];
    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            if (rows.length === 0) {
                showToast("File Excel / CSV buku kosong!", "error");
                if (statusEl) statusEl.classList.add('hidden');
                inputEl.value = '';
                return;
            }

            let successCount = 0;
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (statusEl) statusEl.textContent = `Mengimpor buku ${i + 1} dari ${rows.length}...`;

                const newBook = {
                    bookBarcode: String(row.Barcode || row.Kode || row.bookBarcode || ('BK-' + Date.now() + '-' + i)),
                    bookTitle: String(row.Judul || row.Title || row.bookTitle || 'Tanpa Judul'),
                    bookAuthor: String(row.Pengarang || row.Author || row.bookAuthor || '-'),
                    bookPublisher: String(row.Penerbit || row.Publisher || row.bookPublisher || '-'),
                    bookYear: String(row.Tahun || row.Year || row.bookYear || ''),
                    bookCategory: String(row.Kategori || row.Category || row.bookCategory || 'Lainnya'),
                    bookShelf: String(row.Rak || row.Shelf || row.bookShelf || '-'),
                    bookStock: Number(row.Stok || row.Stock || row.bookStock || 1),
                    type: 'book',
                    timestamp: new Date().toISOString()
                };

                const res = await window.dataSdk.sendData('create', newBook);
                if (res && res.success) {
                    appState.allRecords.push(newBook);
                    successCount++;
                }
            }

            if (statusEl) statusEl.textContent = `Selesai: ${successCount} dari ${rows.length} buku berhasil ditambahkan.`;
            showToast(`Berhasil mengimpor ${successCount} buku!`, "success");
        } catch (err) {
            console.error(err);
            showToast("Gagal memproses file buku.", "error");
            if (statusEl) statusEl.classList.add('hidden');
        }
        inputEl.value = '';
    };
    reader.readAsArrayBuffer(file);
}

function handleDirectImportMembers(inputEl) {
    if (!inputEl.files || !inputEl.files.length) return;
    const statusEl = document.getElementById('settingsMemberImportStatus');
    if (statusEl) {
        statusEl.classList.remove('hidden');
        statusEl.textContent = "Membaca file anggota...";
    }

    const file = inputEl.files[0];
    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            if (rows.length === 0) {
                showToast("File Excel / CSV anggota kosong!", "error");
                if (statusEl) statusEl.classList.add('hidden');
                inputEl.value = '';
                return;
            }

            let successCount = 0;
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (statusEl) statusEl.textContent = `Mengimpor anggota ${i + 1} dari ${rows.length}...`;

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

            if (statusEl) statusEl.textContent = `Selesai: ${successCount} dari ${rows.length} anggota berhasil ditambahkan.`;
            showToast(`Berhasil mengimpor ${successCount} anggota!`, "success");
        } catch (err) {
            console.error(err);
            showToast("Gagal memproses file anggota.", "error");
            if (statusEl) statusEl.classList.add('hidden');
        }
        inputEl.value = '';
    };
    reader.readAsArrayBuffer(file);
}

function handleRestoreJSON(inputEl) {
    if (!inputEl.files || !inputEl.files.length) return;
    const statusEl = document.getElementById('restoreJsonStatus');
    const file = inputEl.files[0];

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const parsed = JSON.parse(e.target.result);
            const recordsToRestore = Array.isArray(parsed) ? parsed : (parsed.records || []);

            if (!Array.isArray(recordsToRestore) || recordsToRestore.length === 0) {
                showToast("Format JSON tidak valid atau kosong!", "error");
                inputEl.value = '';
                return;
            }

            if (!confirm(`Ditemukan ${recordsToRestore.length} data dalam file backup. Tambahkan ke database sekarang?`)) {
                inputEl.value = '';
                return;
            }

            if (statusEl) {
                statusEl.classList.remove('hidden');
                statusEl.textContent = `Memulihkan 0 dari ${recordsToRestore.length} data...`;
            }

            let restoredCount = 0;
            for (let i = 0; i < recordsToRestore.length; i++) {
                const item = { ...recordsToRestore[i] };
                delete item.__backendId;
                if (!item.type) continue;

                if (statusEl) {
                    statusEl.textContent = `Memulihkan data ${i + 1} dari ${recordsToRestore.length}...`;
                }

                const res = await window.dataSdk.sendData('create', item);
                if (res && res.success) {
                    appState.allRecords.push(item);
                    restoredCount++;
                }
            }

            if (statusEl) {
                statusEl.textContent = `Restore selesai: ${restoredCount} dari ${recordsToRestore.length} data berhasil ditambahkan.`;
            }
            showToast(`Restore berhasil! ${restoredCount} data ditambahkan.`, "success");
        } catch (err) {
            console.error(err);
            showToast("File JSON rusak atau tidak dapat dibaca.", "error");
        }
        inputEl.value = '';
    };
    reader.readAsText(file);
}