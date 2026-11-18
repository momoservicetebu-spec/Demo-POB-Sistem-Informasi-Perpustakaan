// JS/dashboard.js

// State untuk sidebar dinamis (slim / expanded) & bulan kalender dashboard
window.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
window.dashboardCalDate = new Date();

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }
}

function toggleDesktopSidebar() {
    window.sidebarCollapsed = !window.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', window.sidebarCollapsed);

    const sidebar = document.getElementById('sidebar');
    const brandHeader = document.getElementById('sidebarBrandHeader');
    const brandText = document.getElementById('sidebarBrandText');
    const footerBadge = document.getElementById('sidebarRoleFooter');
    const labels = document.querySelectorAll('.sidebar-label');
    const toggleBtn = document.getElementById('sidebarCollapseBtn');
    const toggleIcon = document.getElementById('sidebarCollapseIcon');

    if (sidebar) {
        sidebar.classList.toggle('md:w-72', !window.sidebarCollapsed);
        sidebar.classList.toggle('md:w-20', window.sidebarCollapsed);
    }

    if (brandHeader) {
        brandHeader.classList.toggle('md:flex-col', window.sidebarCollapsed);
        brandHeader.classList.toggle('md:gap-2.5', window.sidebarCollapsed);
        brandHeader.classList.toggle('justify-between', !window.sidebarCollapsed);
    }

    if (brandText) brandText.classList.toggle('md:hidden', window.sidebarCollapsed);
    if (footerBadge) footerBadge.classList.toggle('md:hidden', window.sidebarCollapsed);
    labels.forEach(el => el.classList.toggle('md:hidden', window.sidebarCollapsed));

    if (toggleBtn) {
        toggleBtn.classList.toggle('md:w-10', window.sidebarCollapsed);
        toggleBtn.classList.toggle('md:justify-center', window.sidebarCollapsed);
    }

    if (toggleIcon) {
        toggleIcon.setAttribute('data-lucide', window.sidebarCollapsed ? 'chevrons-right' : 'chevrons-left');
        if (window.lucide) lucide.createIcons();
    }
}
function renderSidebarNav() {
    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: 'home' },
        { key: 'books', label: 'Data Buku', icon: 'book-open' },
        { key: 'members', label: 'Data Anggota', icon: 'users' },
        { key: 'loans', label: 'Sirkulasi', icon: 'arrow-left-right' },
        { key: 'visitors', label: 'Buku Tamu', icon: 'clipboard-check' },
        { key: 'reports', label: 'Laporan', icon: 'bar-chart-3' },
        { key: 'users', label: 'Manajemen User', icon: 'shield-check' },
        { key: 'settings', label: 'Pengaturan', icon: 'settings' }
    ];

    const isSlim = window.sidebarCollapsed;

    return menuItems
        .filter(item => canAccessMenu(item.key))
        .map(item => {
            const isActive = appState.currentSection === item.key;
            // Gaya tab aktif menyatu dengan area konten seperti inspirasi desain
            const activeClass = isActive
                ? 'bg-[#f4f6fc] text-indigo-700 font-semibold shadow-sm rounded-l-2xl rounded-r-none -mr-3 pr-6'
                : 'text-indigo-100/85 hover:bg-white/10 hover:text-white rounded-xl';

            return `
                <button data-menu="${item.key}" title="${item.label}"
                    onclick="navigateTo('${item.key}'); if(window.innerWidth < 768) toggleMobileSidebar();" 
                    class="sidebar-item flex items-center ${isSlim ? 'md:justify-center' : ''} gap-3.5 w-full text-left px-3.5 py-3 transition-all duration-200 ${activeClass}">
                    <i data-lucide="${item.icon}" class="w-5 h-5 flex-shrink-0"></i>
                    <span class="sidebar-label truncate text-sm ${isSlim ? 'md:hidden' : ''}">${item.label}</span>
                </button>
            `;
        }).join('');
}

function renderDashboard() {
    const user = window.loggedInUser || {};
    const roleLabel = (user.role || 'petugas').toUpperCase();
    const isSlim = window.sidebarCollapsed;

    return `
    <div class="flex h-screen bg-[#e9eef8] p-0 md:p-3 overflow-hidden relative">
        
        <!-- OVERLAY MOBILE -->
        <div id="sidebarOverlay" onclick="toggleMobileSidebar()" class="fixed inset-0 bg-black bg-opacity-40 z-20 hidden md:hidden"></div>

        <!-- SHELL UTAMA ROUNDED -->
        <div class="flex-1 flex bg-[#f4f6fc] md:rounded-3xl shadow-xl overflow-hidden border border-white/80">

        <!-- SIDEBAR DINAMIS BERWARNA INDIGO -->
            <aside id="sidebar" class="fixed md:static inset-y-0 left-0 z-30 w-72 ${isSlim ? 'md:w-20' : 'md:w-72'} bg-gradient-to-b from-[#43489e] to-[#343882] text-white flex-shrink-0 flex flex-col transition-all duration-300">
                
                <!-- Profil / Logo Sekolah di Atas Sidebar -->
                <div id="sidebarBrandHeader" class="p-4 border-b border-white/10 flex items-center ${isSlim ? 'md:flex-col md:gap-2.5' : 'justify-between'} gap-2">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-full bg-white p-1.5 flex items-center justify-center flex-shrink-0 shadow">
                            <div class="w-full h-full rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                <i data-lucide="library" class="w-5 h-5"></i>
                            </div>
                        </div>
                        <div id="sidebarBrandText" class="min-w-0 ${isSlim ? 'md:hidden' : ''}">
                            <h2 id="sidebarLibName" class="text-sm font-bold text-white leading-snug break-words">${defaultConfig.libraryName}</h2>
                            <p class="text-[11px] text-indigo-200 leading-tight mt-0.5">${defaultConfig.librarySubtitle}</p>
                        </div>
                    </div>

                    <!-- Tombol Collapse Desktop & Close Mobile -->
                    <button id="sidebarCollapseBtn" onclick="toggleDesktopSidebar()" title="Perkecil / Perlebar Menu"
                        class="hidden md:flex items-center justify-center ${isSlim ? 'md:w-10' : ''} p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white flex-shrink-0 transition-colors">
                        <i id="sidebarCollapseIcon" data-lucide="${isSlim ? 'chevrons-right' : 'chevrons-left'}" class="w-4 h-4"></i>
                    </button>
                    <button onclick="toggleMobileSidebar()" class="md:hidden text-indigo-100 hover:text-white flex-shrink-0">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <!-- Menu Navigasi Dinamis -->
                <nav id="sidebarNav" class="pl-3 pr-3 py-4 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden">
                    ${renderSidebarNav()}
                </nav>

                <!-- Footer Sidebar: Role & Tombol Keluar -->
                <div class="p-3 border-t border-white/10 space-y-2">
                    <div id="sidebarRoleFooter" class="px-2 py-1.5 rounded-xl bg-white/10 text-[11px] text-indigo-100 flex items-center justify-between ${isSlim ? 'md:hidden' : ''}">
                        <span>Akses:</span>
                        <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-bold">${roleLabel}</span>
                    </div>
                    <button onclick="logout()" title="Keluar" class="w-full flex items-center ${isSlim ? 'md:justify-center' : ''} gap-3 px-3 py-2.5 rounded-xl text-indigo-100 hover:bg-red-500/20 hover:text-red-200 transition-colors text-sm font-medium">
                        <i data-lucide="log-out" class="w-5 h-5 flex-shrink-0"></i>
                        <span class="sidebar-label ${isSlim ? 'md:hidden' : ''}">Keluar</span>
                    </button>
                </div>
            </aside>

            <!-- AREA KONTEN KANAN -->
            <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f6fc]">
                
                <!-- HEADER RINGKAS -->
                <header class="bg-white/80 backdrop-blur-md border-b border-indigo-100/60 px-4 md:px-6 py-3 flex items-center justify-between z-10">
                    <div class="flex items-center gap-3">
                        <button onclick="toggleMobileSidebar()" class="md:hidden p-2 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                            <i data-lucide="menu" class="w-5 h-5"></i>
                        </button>
                        <div>
                            <h1 class="text-base md:text-lg font-bold text-slate-800 leading-tight">${defaultConfig.librarySubtitle}</h1>
                            <p class="text-[11px] text-slate-400 hidden sm:block">Dashboard Operasional & Sirkulasi Digital</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2.5 ml-auto">
                        <button onclick="refreshDataFromServer()" title="Sinkronkan Data" class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        </button>
                        <div class="flex items-center gap-2 bg-white border border-indigo-100 px-3 py-1.5 rounded-full shadow-xs">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span id="userNameDisplay" class="text-xs font-semibold text-slate-700">Loading...</span>
                        </div>
                    </div>
                </header>

                <!-- KONTEN DINAMIS -->
                <main class="flex-1 overflow-auto p-4 md:p-6" id="mainContent">
                </main>

                <!-- FOOTER -->
                <footer class="bg-white/70 border-t border-indigo-100/60 px-4 md:px-6 py-2.5 text-center text-[11px] text-slate-500 flex-shrink-0">
                    © 2026 Point OF Book (POB) Transaksi Buku Digital SMKN 1 BARADATU Dikembangkan Oleh Guntoro/Danish ShoOp untuk kemajuan pendidikan Indonesia | Versi 1.1.0
                </footer>
            </div>

        </div>
    </div>
    `;
}

// Helper Kalender Interaktif pada Dashboard
function changeDashboardCalMonth(delta) {
    window.dashboardCalDate.setMonth(window.dashboardCalDate.getMonth() + delta);
    const calContainer = document.getElementById('dashboardCalendarWidget');
    if (calContainer) {
        calContainer.innerHTML = buildDashboardCalendarHtml();
    }
}

function buildDashboardCalendarHtml() {
    const viewDate = window.dashboardCalDate || new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Kumpulkan tanggal jatuh tempo pinjaman aktif di bulan ini
    const loans = getRecordsByType('loan');
    const dueDaysSet = new Set();
    loans.forEach(l => {
        const st = (l.loanStatus || l.status || '').toLowerCase();
        if (st !== 'dikembalikan' && st !== 'returned' && l.loanDueDate) {
            const d = new Date(l.loanDueDate);
            if (d.getFullYear() === year && d.getMonth() === month) {
                dueDaysSet.add(d.getDate());
            }
        }
    });

    let cells = '';
    for (let i = 0; i < firstDay; i++) {
        cells += `<div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isCurrentMonth && today.getDate() === day;
        const hasDue = dueDaysSet.has(day);

        let cls = 'text-slate-600 hover:bg-indigo-50';
        if (isToday) {
            cls = 'bg-indigo-600 text-white font-bold shadow-xs';
        } else if (hasDue) {
            cls = 'border border-orange-400 text-orange-600 font-semibold bg-orange-50/70';
        }

        cells += `
            <div title="${hasDue ? 'Ada jadwal jatuh tempo buku' : ''}" class="w-7 h-7 mx-auto flex items-center justify-center rounded-full text-xs cursor-default transition-colors ${cls}">
                ${day}
            </div>
        `;
    }

    return `
        <div class="flex items-center justify-between mb-3">
            <button type="button" onclick="changeDashboardCalMonth(-1)" class="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
            </button>
            <span class="text-sm font-bold text-indigo-700">${monthNames[month]} ${year}</span>
            <button type="button" onclick="changeDashboardCalMonth(1)" class="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1.5">
            <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
        </div>
        <div class="grid grid-cols-7 gap-y-1 text-center">
            ${cells}
        </div>
        <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-indigo-600"></span> Hari ini</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full border border-orange-400 bg-orange-100"></span> Jatuh tempo</span>
        </div>
    `;
}

function handleQuickDashboardSearch(event) {
    event.preventDefault();
    const keyword = document.getElementById('dashboardQuickSearchInput')?.value.trim();
    navigateTo('books');
    setTimeout(() => {
        const searchBox = document.querySelector('#mainContent input[type="text"]');
        if (searchBox && keyword) {
            searchBox.value = keyword;
            searchBox.dispatchEvent(new Event('keyup'));
        }
    }, 100);
}

function renderDashboardHome() {
    const books = getRecordsByType('book');
    const members = getRecordsByType('member');
    const loans = getRecordsByType('loan');
    const visitors = getRecordsByType('visitor');

    const totalEksemplar = books.reduce((sum, b) => sum + (b.bookStock !== undefined ? Number(b.bookStock) : 1), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeLoans = loans.filter(l => {
        const st = (l.loanStatus || l.status || '').toLowerCase();
        return st !== 'dikembalikan' && st !== 'returned';
    });

    const returnedLoansCount = loans.length - activeLoans.length;

    const overdueLoans = activeLoans.filter(l => {
        if (!l.loanDueDate) return false;
        const due = new Date(l.loanDueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    });

    // Persentase ketersediaan buku di rak
    const totalSemuaBuku = totalEksemplar + activeLoans.length;
    const availablePercent = totalSemuaBuku > 0 ? Math.round((totalEksemplar / totalSemuaBuku) * 100) : 100;
    const strokeDash = `${availablePercent}, 100`;

    // Persentase rasio pengembalian untuk Donut Chart
    const returnedPercent = loans.length > 0 ? Math.round((returnedLoansCount / loans.length) * 100) : 100;
    const activePercent = 100 - returnedPercent;

    // Hitung 4 kategori buku teratas untuk horizontal progress bar
    const categoryMap = {};
    books.forEach(b => {
        const cat = b.bookCategory || b.category || 'Umum';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const catBarsHtml = topCategories.length > 0
        ? topCategories.map(([catName, count], idx) => {
            const pct = Math.min(100, Math.round((count / books.length) * 100));
            const barColor = idx === 1 ? 'bg-orange-400' : 'bg-indigo-500';
            return `
                <div>
                    <div class="flex justify-between text-[11px] mb-1">
                        <span class="font-medium text-slate-600 truncate">${catName}</span>
                        <span class="text-slate-400">${count} judul</span>
                    </div>
                    <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full ${barColor} rounded-full" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('')
        : `<p class="text-xs text-slate-400 py-4 text-center">Belum ada data kategori buku.</p>`;

    // Data 7 hari terakhir untuk grafik batang harian
    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const isoPrefix = d.toISOString().split('T')[0];
        const loanCnt = loans.filter(l => (l.loanDate || '').startsWith(isoPrefix)).length;
        const visCnt = visitors.filter(v => (v.visitorCheckIn || v.visitDate || '').startsWith(isoPrefix)).length;
        last7Days.push({
            label: dayLabels[d.getDay()],
            loans: loanCnt,
            visitors: visCnt
        });
    }
    const maxDaily = Math.max(1, ...last7Days.map(d => Math.max(d.loans, d.visitors)));

    const dailyBarsHtml = last7Days.map(d => {
        const hVis = Math.max(12, Math.round((d.visitors / maxDaily) * 100));
        const hLoan = Math.max(12, Math.round((d.loans / maxDaily) * 100));
        return `
            <div class="flex-1 flex flex-col items-center gap-1.5">
                <div class="w-full h-24 flex items-end justify-center gap-1">
                    <div title="Pengunjung: ${d.visitors}" class="w-2.5 bg-orange-400 rounded-t-md transition-all" style="height: ${hVis}%"></div>
                    <div title="Pinjaman: ${d.loans}" class="w-2.5 bg-indigo-200 rounded-t-md transition-all" style="height: ${hLoan}%"></div>
                </div>
                <span class="text-[10px] font-medium text-slate-400">${d.label}</span>
            </div>
        `;
    }).join('');

    return `
        <div class="space-y-5">
            <!-- BARIS ATAS: 4 KARTU BENTO GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
                
                <!-- KOLOM 1 (3 col): Koleksi Buku & Sedang Dipinjam -->
                <div class="xl:col-span-3 bg-white p-5 rounded-3xl shadow-xs border border-indigo-50 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-bold text-slate-700">Koleksi & Sirkulasi</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-600">Live</span>
                        </div>
                        <div class="py-2">
                            <div class="flex items-center gap-2">
                                <span class="text-indigo-600 font-bold text-xl">↑</span>
                                <span class="text-3xl font-extrabold text-slate-800">${totalEksemplar}</span>
                            </div>
                            <p class="text-xs text-slate-400 mt-1">Total eksemplar tersedia dari ${books.length} judul koleksi buku.</p>
                        </div>
                    </div>

                    <div class="border-t border-slate-100 pt-3 mt-2">
                        <div class="flex items-center gap-2">
                            <span class="text-orange-500 font-bold text-xl">↓</span>
                            <span class="text-3xl font-extrabold text-slate-800">${activeLoans.length}</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1">
                            Buku sedang dipinjam (${overdueLoans.length} melewati jatuh tempo).
                        </p>
                    </div>
                </div>

                <!-- KOLOM 2 (3 col): Kalender Jatuh Tempo -->
                <div id="dashboardCalendarWidget" class="xl:col-span-3 bg-white p-5 rounded-3xl shadow-xs border border-indigo-50">
                    ${buildDashboardCalendarHtml()}
                </div>

                <!-- KOLOM 3 (3 col): Kategori Terbanyak & Ketersediaan Buku -->
                <div class="xl:col-span-3 space-y-5">
                    <!-- Progress Kategori -->
                    <div class="bg-white p-5 rounded-3xl shadow-xs border border-indigo-50 space-y-3">
                        <h3 class="text-xs font-bold text-slate-700">Kategori Koleksi Terbanyak</h3>
                        <div class="space-y-2.5">
                            ${catBarsHtml}
                        </div>
                    </div>

                    <!-- Radial Progress Ketersediaan -->
                    <div class="bg-white p-5 rounded-3xl shadow-xs border border-indigo-50 text-center">
                        <h3 class="text-xs font-bold text-slate-700 text-left">Ketersediaan Buku di Rak</h3>
                        <p class="text-[11px] text-slate-400 text-left mb-3">Persentase stok siap dipinjam</p>
                        <div class="relative w-28 h-28 mx-auto">
                            <svg viewBox="0 0 36 36" class="w-28 h-28 -rotate-90">
                                <path class="text-indigo-100" stroke-width="3.2" stroke="currentColor" fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="text-indigo-600" stroke-dasharray="${strokeDash}" stroke-width="3.2" stroke-linecap="round" stroke="currentColor" fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-xl font-extrabold text-slate-800">${availablePercent}%</span>
                            </div>
                        </div>
                        <button onclick="navigateTo('loans')" class="mt-3 w-full py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors">
                            Kelola Sirkulasi
                        </button>
                    </div>
                </div>

                <!-- KOLOM 4 (3 col): Search Cepat, Ringkasan Anggota & Donut Rasio -->
                <div class="xl:col-span-3 space-y-5">
                    <!-- Search Bar Pill -->
                    <form onsubmit="handleQuickDashboardSearch(event)" class="bg-white p-1.5 rounded-full shadow-xs border border-indigo-50 flex items-center">
                        <input type="text" id="dashboardQuickSearchInput" placeholder="Cari judul buku / barcode..." class="flex-1 bg-transparent px-4 py-1.5 text-xs text-slate-700 focus:outline-none">
                        <button type="submit" class="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center flex-shrink-0 transition-colors">
                            <i data-lucide="search" class="w-3.5 h-3.5"></i>
                        </button>
                    </form>

                    <!-- Kartu Anggota & Pengunjung -->
                    <div class="bg-white p-5 rounded-3xl shadow-xs border border-indigo-50 space-y-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xs font-bold text-slate-700">Anggota & Pengunjung</h3>
                                <p class="text-[11px] text-slate-400">Partisipasi aktif perpustakaan</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3 pt-1">
                            <div class="p-3 rounded-2xl bg-indigo-50/70">
                                <p class="text-[11px] text-indigo-600 font-medium">Total Anggota</p>
                                <p class="text-2xl font-extrabold text-slate-800 mt-0.5">${members.length}</p>
                            </div>
                            <div class="p-3 rounded-2xl bg-orange-50/70">
                                <p class="text-[11px] text-orange-600 font-medium">Buku Tamu</p>
                                <p class="text-2xl font-extrabold text-slate-800 mt-0.5">${visitors.length}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Donut Chart Rasio Pengembalian -->
                    <div class="bg-white p-5 rounded-3xl shadow-xs border border-indigo-50">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-xs font-bold text-slate-700">Rasio Sirkulasi</h3>
                            <span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500">Total ${loans.length}</span>
                        </div>
                        <div class="flex items-center justify-around gap-3">
                            <div class="relative w-24 h-24 flex-shrink-0">
                                <svg viewBox="0 0 36 36" class="w-24 h-24 -rotate-90">
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" stroke-width="5" />
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#4f46e5" stroke-width="5"
                                        stroke-dasharray="${returnedPercent * 0.88} 100" />
                                </svg>
                            </div>
                            <div class="space-y-2 text-xs">
                                <div>
                                    <p class="text-lg font-extrabold text-orange-500 leading-none">${returnedPercent}%</p>
                                    <p class="text-[11px] text-slate-400">Dikembalikan</p>
                                </div>
                                <div>
                                    <p class="text-lg font-extrabold text-indigo-600 leading-none">${activePercent}%</p>
                                    <p class="text-[11px] text-slate-400">Dipinjam</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- BARIS BAWAH: GRAFIK AKTIVITAS HARIAN & AKSES CEPAT -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <!-- Grafik Batang 7 Hari Terakhir -->
                <div class="lg:col-span-7 bg-white p-5 rounded-3xl shadow-xs border border-indigo-50">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-sm font-bold text-slate-800">Aktivitas Kunjungan & Peminjaman (7 Hari Terakhir)</h3>
                            <p class="text-xs text-slate-400">Perbandingan harian buku tamu dan transaksi peminjaman</p>
                        </div>
                        <div class="flex items-center gap-3 text-[11px]">
                            <span class="flex items-center gap-1.5 text-slate-600"><span class="w-2.5 h-2.5 rounded-xs bg-orange-400"></span> Pengunjung</span>
                            <span class="flex items-center gap-1.5 text-slate-600"><span class="w-2.5 h-2.5 rounded-xs bg-indigo-200"></span> Pinjaman</span>
                        </div>
                    </div>
                    <div class="flex items-end gap-2 pt-2">
                        ${dailyBarsHtml}
                    </div>
                </div>

                <!-- Menu Pintasan Cepat -->
                <div class="lg:col-span-5 bg-white p-5 rounded-3xl shadow-xs border border-indigo-50 flex flex-col justify-between">
                    <div>
                        <h3 class="text-sm font-bold text-slate-800">Pintasan Operasional Cepat</h3>
                        <p class="text-xs text-slate-400 mb-4">Akses fitur utama hanya dengan sekali klik</p>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="navigateTo('loans'); setTimeout(() => showBorrowModal(), 120);" class="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-left transition-colors">
                            <i data-lucide="plus-circle" class="w-5 h-5 mb-1.5"></i>
                            <p class="text-xs font-bold">Catat Pinjaman</p>
                            <p class="text-[10px] text-indigo-500">Scan barcode buku</p>
                        </button>
                        <button onclick="navigateTo('visitors'); setTimeout(() => showAddVisitorModal(), 120);" class="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-left transition-colors">
                            <i data-lucide="user-plus" class="w-5 h-5 mb-1.5"></i>
                            <p class="text-xs font-bold">Check-In Tamu</p>
                            <p class="text-[10px] text-orange-500">Buku tamu digital</p>
                        </button>
                        <button onclick="navigateTo('books')" class="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-left transition-colors">
                            <i data-lucide="book" class="w-5 h-5 mb-1.5 text-indigo-600"></i>
                            <p class="text-xs font-bold">Katalog Buku</p>
                            <p class="text-[10px] text-slate-400">Kelola stok & rak</p>
                        </button>
                        <button onclick="navigateTo('reports')" class="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-left transition-colors">
                            <i data-lucide="file-spreadsheet" class="w-5 h-5 mb-1.5 text-emerald-600"></i>
                            <p class="text-xs font-bold">Cetak Laporan</p>
                            <p class="text-[10px] text-slate-400">Excel, PDF & Sheets</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}