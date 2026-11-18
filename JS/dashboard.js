// JS/dashboard.js

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }
}

function renderSidebarNav() {
    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
        { key: 'books', label: 'Data Buku', icon: 'book' },
        { key: 'members', label: 'Data Anggota', icon: 'users' },
        { key: 'loans', label: 'Sirkulasi', icon: 'arrow-right-left' },
        { key: 'visitors', label: 'Buku Tamu', icon: 'book-open' },
        { key: 'reports', label: 'Laporan', icon: 'bar-chart-3' },
        { key: 'users', label: 'Manajemen User', icon: 'shield-check' },
        { key: 'settings', label: 'Pengaturan', icon: 'settings' }
    ];

    return menuItems
        .filter(item => canAccessMenu(item.key))
        .map(item => {
            const isActive = appState.currentSection === item.key;
            const activeClass = isActive ? 'active bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600';
            return `
                <button data-menu="${item.key}" onclick="navigateTo('${item.key}'); if(window.innerWidth < 768) toggleMobileSidebar();" 
                    class="sidebar-item flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${activeClass}">
                    <i data-lucide="${item.icon}" class="menu-icon w-5 h-5"></i>
                    <span>${item.label}</span>
                </button>
            `;
        }).join('');
}

function renderDashboard() {
    const user = window.loggedInUser || {};
    const roleLabel = (user.role || 'petugas').toUpperCase();

    return `
    <div class="flex h-screen bg-gray-50 overflow-hidden relative">
        
        <!-- OVERLAY MOBILE -->
        <div id="sidebarOverlay" onclick="toggleMobileSidebar()" class="fixed inset-0 bg-black bg-opacity-40 z-20 hidden md:hidden"></div>

        <!-- SIDEBAR -->
        <aside id="sidebar" class="glass-sidebar fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r flex-shrink-0 flex flex-col shadow-sm transform -translate-x-full md:translate-x-0 transition-transform duration-300">
            <div class="p-5 border-b flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-xl text-white" style="background-color: var(--primary-color, #2563eb);">
                        <i data-lucide="library" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 id="sidebarLibName" class="text-lg font-bold text-gray-800 leading-tight">${defaultConfig.libraryName}</h2>
                        <p class="text-[11px] text-gray-400 truncate max-w-[140px]">${defaultConfig.librarySubtitle}</p>
                    </div>
                </div>
                <button onclick="toggleMobileSidebar()" class="md:hidden text-gray-500 hover:text-gray-800">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <nav id="sidebarNav" class="p-4 space-y-1.5 flex-1 overflow-y-auto">
                ${renderSidebarNav()}
            </nav>

            <div class="p-4 border-t bg-gray-50/70">
                <div class="text-xs text-gray-500 flex items-center justify-between">
                    <span>Hak Akses:</span>
                    <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">${roleLabel}</span>
                </div>
            </div>
        </aside>

        <!-- AREA KANAN -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            <!-- HEADER -->
            <header class="bg-white border-b px-4 md:px-6 py-3.5 flex items-center justify-between shadow-sm z-10">
                <div class="flex items-center gap-3">
                    <button onclick="toggleMobileSidebar()" class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                        <i data-lucide="menu" class="w-5 h-5"></i>
                    </button>
                    <h1 class="text-lg md:text-xl font-semibold text-gray-800">${defaultConfig.librarySubtitle}</h1>
                </div>

                <div class="flex items-center gap-3 ml-auto">
                    <button onclick="refreshDataFromServer()" title="Sinkronkan Data" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                    </button>
                    <div class="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                        <i data-lucide="user" class="w-4 h-4 text-gray-600"></i>
                        <span id="userNameDisplay" class="text-sm font-medium text-gray-700">Loading...</span>
                    </div>
                    <button onclick="logout()" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                        <span class="hidden sm:block text-sm font-medium">Keluar</span>
                    </button>
                </div>
            </header>

            <!-- KONTEN DINAMIS -->
            <main class="flex-1 overflow-auto p-4 md:p-6" id="mainContent">
            </main>
        </div>
    </div>
    `;
}

function renderDashboardHome() {
    const books = getRecordsByType('book');
    const members = getRecordsByType('member');
    const loans = getRecordsByType('loan');
    const visitors = getRecordsByType('visitor');

    // Hitung peminjaman aktif & terlambat
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeLoans = loans.filter(l => {
        const st = (l.loanStatus || l.status || '').toLowerCase();
        return st !== 'dikembalikan' && st !== 'returned';
    });

    const overdueLoans = activeLoans.filter(l => {
        if (!l.loanDueDate) return false;
        const due = new Date(l.loanDueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    });

    // Hitung pengunjung hari ini
    const todayStr = new Date().toISOString().split('T')[0];
    const todayVisitors = visitors.filter(v => {
        const rawDate = v.visitorCheckIn || v.visitDate || v.date || '';
        return rawDate.startsWith(todayStr);
    });

    return `
        <div class="space-y-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p class="text-gray-500 mt-1">Ringkasan operasional perpustakaan hari ini.</p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <!-- Total Buku -->
                <div class="card bg-white p-5 flex items-center gap-4">
                    <div class="p-3.5 bg-blue-100 rounded-xl text-blue-600">
                        <i data-lucide="book" class="w-7 h-7"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Total Judul Buku</p>
                        <p class="text-2xl font-bold text-gray-800">${books.length}</p>
                    </div>
                </div>
                
                <!-- Total Anggota -->
                <div class="card bg-white p-5 flex items-center gap-4">
                    <div class="p-3.5 bg-emerald-100 rounded-xl text-emerald-600">
                        <i data-lucide="users" class="w-7 h-7"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Total Anggota</p>
                        <p class="text-2xl font-bold text-gray-800">${members.length}</p>
                    </div>
                </div>

                <!-- Peminjaman Aktif -->
                <div class="card bg-white p-5 flex items-center gap-4">
                    <div class="p-3.5 bg-amber-100 rounded-xl text-amber-600">
                        <i data-lucide="book-up" class="w-7 h-7"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Sedang Dipinjam</p>
                        <p class="text-2xl font-bold text-gray-800">${activeLoans.length}</p>
                        ${overdueLoans.length > 0 ? `<p class="text-xs text-red-600 font-medium mt-0.5">${overdueLoans.length} terlambat</p>` : ''}
                    </div>
                </div>

                <!-- Pengunjung Hari Ini -->
                <div class="card bg-white p-5 flex items-center gap-4">
                    <div class="p-3.5 bg-purple-100 rounded-xl text-purple-600">
                        <i data-lucide="user-check" class="w-7 h-7"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Pengunjung Hari Ini</p>
                        <p class="text-2xl font-bold text-gray-800">${todayVisitors.length}</p>
                        <p class="text-xs text-gray-400 mt-0.5">Total: ${visitors.length} kunjungan</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}