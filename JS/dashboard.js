// JS/dashboard.js

// 1. Gambar Kerangka Utama (Sidebar, Header, Container Konten)
function renderDashboard() {
    return `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
        
        <!-- SIDEBAR (Menu Kiri) -->
        <aside class="w-64 bg-white border-r flex-shrink-0 hidden md:flex md:flex-col shadow-sm">
            <div class="p-6 border-b flex items-center gap-3">
                <i data-lucide="library" class="w-7 h-7 text-blue-600"></i>
                <h2 class="text-xl font-bold text-gray-800">PerpusWeb</h2>
            </div>
            <nav class="p-4 space-y-1 flex-1 overflow-y-auto">
                <button onclick="navigateTo('dashboard')" class="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <i data-lucide="layout-dashboard" class="w-5 h-5"></i> Dashboard
                </button>
                <button onclick="navigateTo('books')" class="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <i data-lucide="book" class="w-5 h-5"></i> Data Buku
                </button>
                <button onclick="navigateTo('members')" class="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <i data-lucide="users" class="w-5 h-5"></i> Data Anggota
                </button>
                <button onclick="navigateTo('loans')" class="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <i data-lucide="book-up" class="w-5 h-5"></i> Sirkulasi
                     </button>
                <button onclick="navigateTo('visitors')" class="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <i data-lucide="book-open" class="w-5 h-5"></i> Buku Tamu
                </button>
                <button onclick="navigateTo('settings')" class="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <i data-lucide="settings" class="w-5 h-5"></i> Pengaturan
                </button>
                <!-- Tambahkan menu transaksi, tamu, dll di sini nanti -->
            </nav>
        </aside>

        <!-- AREA KANAN (Header & Konten Utama) -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            <!-- HEADER -->
            <header class="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <h1 class="text-xl font-semibold text-gray-800 hidden sm:block">Sistem Perpustakaan</h1>
                <div class="flex items-center gap-4 ml-auto">
                    <div class="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                        <i data-lucide="user" class="w-4 h-4 text-gray-600"></i>
                        <span id="userNameDisplay" class="text-sm font-medium text-gray-700">Loading...</span>
                    </div>
                    <button onclick="logout()" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                        <span class="hidden sm:block text-sm font-medium">Keluar</span>
                    </button>
                </div>
            </header>

            <!-- KONTEN DINAMIS (Wajib ID mainContent) -->
            <main class="flex-1 overflow-auto p-4 md:p-6" id="mainContent">
                <!-- main.js akan menyuntikkan HTML halaman ke sini -->
            </main>
        </div>
    </div>
    `;
}

// 2. Gambar Halaman Beranda (Statistik)
function renderDashboardHome() {
    // Ambil data dari state untuk dihitung (fungsi getRecordsByType ada di script.js)
    const totalBuku = getRecordsByType('book').length;
    const totalAnggota = getRecordsByType('member').length;
    
    return `
        <div class="space-y-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p class="text-gray-500 mt-1">Ringkasan sistem perpustakaan Anda hari ini.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Card Total Buku -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-4 bg-blue-100 rounded-lg text-blue-600">
                        <i data-lucide="book" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Total Buku</p>
                        <p class="text-2xl font-bold text-gray-800">${totalBuku}</p>
                    </div>
                </div>
                
                <!-- Card Total Anggota -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-4 bg-green-100 rounded-lg text-green-600">
                        <i data-lucide="users" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Total Anggota</p>
                        <p class="text-2xl font-bold text-gray-800">${totalAnggota}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}