// JS/pengaturan.js

// Gambar Halaman Pengaturan Sistem
function renderSettingsSection() {
    // Ambil data konfigurasi dari script.js
    const denda = defaultConfig.finePerDay || 1000;
    const maksHari = defaultConfig.maxLoanDays || 7;

    return `
        <div class="space-y-6 max-w-4xl">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
                <p class="text-gray-500 text-sm">Atur konfigurasi dasar perpustakaan.</p>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Aturan Peminjaman</h3>
                
                <form onsubmit="saveSettings(event)" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Maksimal Hari Pinjam</label>
                            <div class="relative">
                                <input type="number" id="settingMaxDays" value="${maksHari}" min="1" class="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <span class="absolute right-4 top-2.5 text-gray-500 text-sm">Hari</span>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Denda Keterlambatan</label>
                            <div class="relative">
                                <span class="absolute left-4 top-2.5 text-gray-500 text-sm">Rp</span>
                                <input type="number" id="settingFine" value="${denda}" min="0" step="500" class="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <span class="absolute right-4 top-2.5 text-gray-500 text-sm">/ Hari</span>
                            </div>
                        </div>
                    </div>

                    <div class="pt-4">
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// JS/pengaturan.js

function renderSettingsSection() {
    // Ambil data dari localStorage jika ada, jika tidak gunakan default
    const savedSettings = JSON.parse(localStorage.getItem('librarySettings')) || {};
    const denda = savedSettings.finePerDay || defaultConfig.finePerDay || 1000;
    const maksHari = savedSettings.maxLoanDays || defaultConfig.maxLoanDays || 7;

    return `
        <div class="space-y-6 max-w-4xl">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
                <p class="text-gray-500 text-sm">Atur konfigurasi dasar perpustakaan.</p>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Aturan Peminjaman</h3>
                
                <form onsubmit="saveSettings(event)" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Maksimal Hari Pinjam</label>
                            <div class="relative">
                                <input type="number" id="settingMaxDays" value="${maksHari}" min="1" class="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <span class="absolute right-4 top-2.5 text-gray-500 text-sm">Hari</span>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Denda Keterlambatan</label>
                            <div class="relative">
                                <span class="absolute left-4 top-2.5 text-gray-500 text-sm">Rp</span>
                                <input type="number" id="settingFine" value="${denda}" min="0" step="500" class="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <span class="absolute right-4 top-2.5 text-gray-500 text-sm">/ Hari</span>
                            </div>
                        </div>
                    </div>

                    <div class="pt-4">
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function saveSettings(event) {
    event.preventDefault(); 
    const newMaxDays = document.getElementById('settingMaxDays').value;
    const newFine = document.getElementById('settingFine').value;
    
    // Simpan ke localStorage agar awet
    const settings = {
        maxLoanDays: parseInt(newMaxDays),
        finePerDay: parseInt(newFine)
    };
    localStorage.setItem('librarySettings', JSON.stringify(settings));
    
    // Update juga di variabel global (jika digunakan oleh fungsi lain)
    defaultConfig.maxLoanDays = settings.maxLoanDays;
    defaultConfig.finePerDay = settings.finePerDay;
    
    showToast("Pengaturan berhasil disimpan!", "success");
}

function saveSettings(event) {
    event.preventDefault(); // Mencegah halaman reload
    const newMaxDays = document.getElementById('settingMaxDays').value;
    const newFine = document.getElementById('settingFine').value;
    
    // Update data di variabel global
    defaultConfig.maxLoanDays = parseInt(newMaxDays);
    defaultConfig.finePerDay = parseInt(newFine);
    
    showToast("Pengaturan berhasil disimpan!", "success"); // Menggunakan fungsi dari script.js
}