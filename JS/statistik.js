// JS/statistik.js

// Klasifikasi otomatis apakah buku masuk ranah Numerasi atau Literasi
function detectBookDomain(book) {
    if (!book) return 'literasi';
    const text = `${book.bookCategory || book.category || ''} ${book.bookTitle || book.title || ''}`.toLowerCase();
    const numerasiKeywords = [
        'matematika', 'fisika', 'kimia', 'biologi', 'ekonomi', 'akuntansi',
        'informatika', 'koding', 'statistika', 'aljabar', 'geometri', 'ipa',
        'sains', 'teknologi', 'numerasi', 'logika', 'komputer', 'kalkulus'
    ];
    return numerasiKeywords.some(kw => text.includes(kw)) ? 'numerasi' : 'literasi';
}

// Hitung Poin & Peringkat Reward Literasi & Numerasi per Pengunjung/Anggota
function calculateLiteracyNumeracyLeaderboard(periodFilter = 'all') {
    const visitors = getRecordsByType('visitor');
    const loans = getRecordsByType('loan');
    const books = getRecordsByType('book');
    const members = getRecordsByType('member');

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isMatchPeriod = (dateStr) => {
        if (periodFilter === 'all') return true;
        if (!dateStr) return false;
        const dt = new Date(dateStr);
        if (isNaN(dt.getTime())) return false;
        if (periodFilter === 'month') {
            return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear;
        }
        if (periodFilter === 'year') {
            return dt.getFullYear() === currentYear;
        }
        return true;
    };

    const scoreMap = {};

    const ensurePerson = (rawName, fallbackClass = '') => {
        const cleanName = String(rawName || '').trim();
        if (!cleanName || cleanName === '-') return null;
        const key = cleanName.toLowerCase();

        if (!scoreMap[key]) {
            const matchedMember = members.find(m =>
                (m.memberName || m.name || '').trim().toLowerCase() === key
            );
            scoreMap[key] = {
                name: matchedMember ? (matchedMember.memberName || matchedMember.name) : cleanName,
                kelas: matchedMember ? (matchedMember.memberClass || matchedMember.role || fallbackClass || '-') : (fallbackClass || '-'),
                visitCount: 0,
                readCount: 0,
                literasiBooks: 0,
                numerasiBooks: 0,
                totalPoints: 0
            };
        } else if (scoreMap[key].kelas === '-' && fallbackClass) {
            scoreMap[key].kelas = fallbackClass;
        }
        return scoreMap[key];
    };

    // 1. Hitung Poin dari Buku Tamu (Kunjungan = +5 poin, Membaca Buku di tempat = +10 poin ekstra)
    visitors.forEach(v => {
        const checkInRaw = v.visitorCheckIn || v.visitDate || v.date || '';
        if (!isMatchPeriod(checkInRaw)) return;

        const person = ensurePerson(v.visitorName || v.name, v.visitorClass || v.institution);
        if (!person) return;

        person.visitCount += 1;
        person.totalPoints += 5;

        const purpose = (v.visitorPurpose || v.purpose || '').toLowerCase();
        const notes = (v.visitorNotes || v.notes || '').toLowerCase();
        if (purpose.includes('membaca') || notes.includes('membaca')) {
            person.readCount += 1;
            person.totalPoints += 10;
        }
    });

    // 2. Hitung Poin dari Sirkulasi Peminjaman (Setiap buku = +15 poin & dikelompokkan Literasi / Numerasi)
    loans.forEach(l => {
        if (!isMatchPeriod(l.loanDate || l.timestamp)) return;

        const person = ensurePerson(l.loanMember || l.memberName);
        if (!person) return;

        const kodeBuku = String(l.loanBarcode || l.bookBarcode || '').trim();
        const matchedBook = books.find(b =>
            String(b.bookBarcode || b.barcode || b.id || '').trim() === kodeBuku
        ) || { bookTitle: l.loanBookTitle || l.bookTitle || '' };

        const qty = Number(l.loanQuantity || l.quantity || 1);
        const domain = detectBookDomain(matchedBook);

        if (domain === 'numerasi') {
            person.numerasiBooks += qty;
        } else {
            person.literasiBooks += qty;
        }
        person.totalPoints += (qty * 15);
    });

    // Urutkan berdasarkan total poin tertinggi
    return Object.values(scoreMap)
        .filter(p => p.totalPoints > 0)
        .sort((a, b) => b.totalPoints - a.totalPoints || (b.literasiBooks + b.numerasiBooks) - (a.literasiBooks + a.numerasiBooks));
}

function renderStatisticsSection(periodFilter = 'all') {
    const books = getRecordsByType('book');
    const members = getRecordsByType('member');
    const loans = getRecordsByType('loan');

    // Hitung total stok eksemplar
    const totalStock = books.reduce((sum, b) => sum + (b.bookStock !== undefined ? Number(b.bookStock) : 1), 0);

    // Hitung status peminjaman & keterlambatan
    let activeLoans = 0;
    let returnedLoans = 0;
    let overdueLoans = 0;
    const activeBorrowersSet = new Set();

    loans.forEach(l => {
        const st = (l.loanStatus || l.status || 'dipinjam').toLowerCase();
        const isReturned = st === 'dikembalikan' || st === 'returned';
        if (isReturned) {
            returnedLoans++;
        } else {
            activeLoans++;
            const name = (l.loanMember || l.memberName || '').trim().toLowerCase();
            if (name) activeBorrowersSet.add(name);
            if (typeof calculateFine === 'function' && calculateFine(l.loanDueDate).daysLate > 0) {
                overdueLoans++;
            }
        }
    });

    const returnRate = loans.length > 0 ? Math.round((returnedLoans / loans.length) * 100) : 0;

    // Tren 6 Bulan Terakhir
    const now = new Date();
    const monthsData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        const count = loans.filter(l => {
            if (!l.loanDate) return false;
            const ld = new Date(l.loanDate);
            return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
        }).length;
        monthsData.push({ label, count });
    }
    const maxMonthCount = Math.max(1, ...monthsData.map(m => m.count));
    const total6Months = monthsData.reduce((s, m) => s + m.count, 0);
    const avg6Months = Math.round(total6Months / 6);
    const peak6Months = Math.max(...monthsData.map(m => m.count));

    const trendBarsHtml = monthsData.map(m => {
        const pct = Math.round((m.count / maxMonthCount) * 100);
        return `
            <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-medium">
                    <span class="text-gray-600">${m.label}</span>
                    <span class="text-blue-600 font-semibold">${m.count} peminjaman</span>
                </div>
                <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-600 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');

    // Top 5 Kategori Buku
    const categoryMap = {};
    books.forEach(b => {
        const cat = (b.bookCategory || b.category || 'Umum').trim();
        if (!categoryMap[cat]) categoryMap[cat] = { titles: 0, stock: 0 };
        categoryMap[cat].titles += 1;
        categoryMap[cat].stock += (b.bookStock !== undefined ? Number(b.bookStock) : 1);
    });
    const topCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1].titles - a[1].titles)
        .slice(0, 5);
    const maxCatTitles = topCategories.length > 0 ? Math.max(1, topCategories[0][1].titles) : 1;

    const topCatHtml = topCategories.length > 0 ? topCategories.map(([cat, info], idx) => {
        const pct = Math.round((info.titles / maxCatTitles) * 100);
        return `
            <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-medium">
                    <span><strong class="text-amber-500">#${idx + 1}</strong> <span class="text-gray-700">${cat}</span></span>
                    <span class="text-blue-600 font-semibold">${info.titles} judul | ${info.stock} stok</span>
                </div>
                <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-600 rounded-full" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('') : `<p class="text-xs text-gray-400 text-center py-8">Belum ada data kategori buku.</p>`;

    // Data Reward Literasi & Numerasi
    const leaderboard = calculateLiteracyNumeracyLeaderboard(periodFilter);
    const top3 = leaderboard.slice(0, 3);

    const podiumBadges = [
        { rank: '🥇 Juara 1 • Duta Literasi & Numerasi', bg: 'bg-amber-50/90 border-amber-200', badge: 'bg-amber-500 text-white' },
        { rank: '🥈 Juara 2 • Penggerak Baca Aktif', bg: 'bg-slate-50 border-slate-200', badge: 'bg-slate-600 text-white' },
        { rank: '🥉 Juara 3 • Sahabat Perpustakaan', bg: 'bg-orange-50/70 border-orange-200', badge: 'bg-orange-500 text-white' }
    ];

    const podiumHtml = top3.length > 0 ? top3.map((item, idx) => {
        const style = podiumBadges[idx];
        return `
            <div class="p-4 rounded-2xl border ${style.bg} flex flex-col justify-between gap-3">
                <div class="space-y-1.5">
                    <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${style.badge}">${style.rank}</span>
                    <h4 class="font-bold text-gray-800 text-base">${item.name}</h4>
                    <p class="text-xs text-gray-500">${item.kelas}</p>
                </div>
                <div class="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 text-center text-xs">
                    <div>
                        <p class="font-bold text-indigo-600">${item.literasiBooks}</p>
                        <p class="text-[10px] text-gray-500">Literasi</p>
                    </div>
                    <div>
                        <p class="font-bold text-emerald-600">${item.numerasiBooks}</p>
                        <p class="text-[10px] text-gray-500">Numerasi</p>
                    </div>
                    <div>
                        <p class="font-bold text-amber-600">${item.totalPoints} pt</p>
                        <p class="text-[10px] text-gray-500">Total Poin</p>
                    </div>
                </div>
                <button onclick="printRewardCertificate('${item.name.replace(/'/g, "\\'")}', '${item.kelas.replace(/'/g, "\\'")}', ${idx + 1}, ${item.totalPoints}, ${item.literasiBooks}, ${item.numerasiBooks}, ${item.visitCount})"
                    class="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold transition-colors">
                    🏅 Cetak Piagam Reward
                </button>
            </div>
        `;
    }).join('') : `<div class="col-span-3 text-center py-6 text-xs text-gray-400">Belum ada aktivitas kunjungan atau peminjaman pada periode ini.</div>`;

    const leaderboardRowsHtml = leaderboard.length > 0 ? leaderboard.slice(0, 15).map((item, idx) => `
        <tr class="border-b hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-center font-bold text-gray-600">${idx + 1}</td>
            <td class="px-4 py-3 font-semibold text-gray-800">${item.name}</td>
            <td class="px-4 py-3 text-gray-600">${item.kelas}</td>
            <td class="px-4 py-3 text-center text-gray-700">${item.visitCount}x</td>
            <td class="px-4 py-3 text-center text-gray-700">${item.readCount}x</td>
            <td class="px-4 py-3 text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">${item.literasiBooks} buku</span>
            </td>
            <td class="px-4 py-3 text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">${item.numerasiBooks} buku</span>
            </td>
            <td class="px-4 py-3 text-right font-bold text-blue-600">${item.totalPoints} Poin</td>
            <td class="px-4 py-3 text-center">
                <button onclick="printRewardCertificate('${item.name.replace(/'/g, "\\'")}', '${item.kelas.replace(/'/g, "\\'")}', ${idx + 1}, ${item.totalPoints}, ${item.literasiBooks}, ${item.numerasiBooks}, ${item.visitCount})"
                    class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition-colors">
                    Piagam
                </button>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="9" class="p-8 text-center text-gray-500">Belum ada data aktivitas pengunjung untuk dihitung poinnya.</td></tr>`;

    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Statistik Perpustakaan</h2>
                    <p class="text-gray-500 text-sm">Analisis, insights data perpustakaan & pemeringkatan reward literasi-numerasi</p>
                </div>
                <button onclick="exportStatisticsExcel()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors">
                    <i data-lucide="download" class="w-4 h-4"></i> Export Statistik
                </button>
            </div>

            <!-- 4 Kartu Ringkasan Atas -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div class="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 border-t-4 border-t-blue-500 flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-medium text-gray-500">Total Koleksi</p>
                            <p class="text-3xl font-bold text-gray-800 my-1">${books.length}</p>
                            <p class="text-xs text-gray-400">Judul buku</p>
                        </div>
                        <div class="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><i data-lucide="library" class="w-6 h-6"></i></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-4 pt-2.5 border-t border-gray-50">Total Stok: <strong>${totalStock}</strong></p>
                </div>

                <div class="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 border-t-4 border-t-emerald-500 flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-medium text-gray-500">Total Anggota</p>
                            <p class="text-3xl font-bold text-gray-800 my-1">${members.length}</p>
                            <p class="text-xs text-gray-400">Anggota aktif</p>
                        </div>
                        <div class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><i data-lucide="users" class="w-6 h-6"></i></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-4 pt-2.5 border-t border-gray-50">Peminjam aktif: <strong>${activeBorrowersSet.size}</strong></p>
                </div>

                <div class="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 border-t-4 border-t-amber-500 flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-medium text-gray-500">Total Peminjaman</p>
                            <p class="text-3xl font-bold text-gray-800 my-1">${loans.length}</p>
                            <p class="text-xs text-gray-400">Semua transaksi</p>
                        </div>
                        <div class="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><i data-lucide="arrow-left-right" class="w-6 h-6"></i></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-4 pt-2.5 border-t border-gray-50">Aktif: <strong>${activeLoans}</strong> | Selesai: <strong>${returnedLoans}</strong></p>
                </div>

                <div class="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 border-t-4 border-t-red-500 flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-medium text-gray-500">Tingkat Keterlambatan</p>
                            <p class="text-3xl font-bold text-gray-800 my-1">${overdueLoans}</p>
                            <p class="text-xs text-gray-400">Peminjaman terlambat</p>
                        </div>
                        <div class="p-2.5 bg-red-50 text-red-600 rounded-xl"><i data-lucide="clock-alert" class="w-6 h-6"></i></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-4 pt-2.5 border-t border-gray-50">Return rate: <strong>${returnRate}%</strong></p>
                </div>
            </div>

            <!-- Tren 6 Bulan & Top 5 Kategori -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-5">
                    <h3 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span>📈</span> Tren Peminjaman 6 Bulan Terakhir
                    </h3>
                    <div class="space-y-3.5">${trendBarsHtml}</div>
                    <div class="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                        <div>
                            <p class="text-base font-bold text-blue-600">${total6Months}</p>
                            <p class="text-[11px] text-gray-400">Total</p>
                        </div>
                        <div>
                            <p class="text-base font-bold text-emerald-600">${avg6Months}</p>
                            <p class="text-[11px] text-gray-400">Rata-rata/bulan</p>
                        </div>
                        <div>
                            <p class="text-base font-bold text-amber-500">${peak6Months}</p>
                            <p class="text-[11px] text-gray-400">Puncak</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-5">
                    <h3 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span>🏷️</span> Top 5 Kategori Buku
                    </h3>
                    <div class="space-y-4">${topCatHtml}</div>
                </div>
            </div>

            <!-- REWARD PENGUNJUNG TERAKTIF LITERASI & NUMERASI -->
            <div class="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-5">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
                            <span>🏆</span> Peringkat Reward Pengunjung Paling Aktif (Literasi & Numerasi)
                        </h3>
                        <p class="text-xs text-gray-500 mt-0.5">
                            Bobot Penilaian: Kunjungan (+5 pt) • Baca di Tempat (+10 pt) • Pinjam Buku Literasi/Numerasi (+15 pt/buku)
                        </p>
                    </div>
                    <select id="rewardPeriodSelect" onchange="changeRewardPeriod(this.value)"
                        class="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="all" ${periodFilter === 'all' ? 'selected' : ''}>Semua Waktu</option>
                        <option value="month" ${periodFilter === 'month' ? 'selected' : ''}>Bulan Ini</option>
                        <option value="year" ${periodFilter === 'year' ? 'selected' : ''}>Tahun Ini</option>
                    </select>
                </div>

                <!-- Podium Top 3 Kandidat Reward -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${podiumHtml}
                </div>

                <!-- Tabel Klasemen Lengkap -->
                <div class="overflow-x-auto border rounded-xl">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead class="bg-gray-50 text-gray-600 uppercase border-b">
                            <tr>
                                <th class="px-4 py-3 text-center w-14">Rank</th>
                                <th class="px-4 py-3">Nama Pengunjung / Siswa</th>
                                <th class="px-4 py-3">Kelas / Status</th>
                                <th class="px-4 py-3 text-center">Kunjungan</th>
                                <th class="px-4 py-3 text-center">Baca di Tempat</th>
                                <th class="px-4 py-3 text-center">Buku Literasi</th>
                                <th class="px-4 py-3 text-center">Buku Numerasi</th>
                                <th class="px-4 py-3 text-right">Total Poin</th>
                                <th class="px-4 py-3 text-center">Reward</th>
                            </tr>
                        </thead>
                        <tbody>${leaderboardRowsHtml}</tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function changeRewardPeriod(periodVal) {
    const container = document.getElementById('mainContent') || document.querySelector('main');
    if (container) {
        container.innerHTML = renderStatisticsSection(periodVal);
        if (window.lucide) lucide.createIcons();
    }
}

function exportStatisticsExcel() {
    const period = document.getElementById('rewardPeriodSelect')?.value || 'all';
    const leaderboard = calculateLiteracyNumeracyLeaderboard(period);

    if (leaderboard.length === 0) {
        showToast("Belum ada data statistik reward untuk diexport.", "error");
        return;
    }

    const rows = leaderboard.map((item, idx) => ({
        'Peringkat': idx + 1,
        'Nama Pengunjung': item.name,
        'Kelas': item.kelas,
        'Jumlah Kunjungan': item.visitCount,
        'Baca di Tempat': item.readCount,
        'Buku Literasi': item.literasiBooks,
        'Buku Numerasi': item.numerasiBooks,
        'Total Poin': item.totalPoints
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reward Literasi Numerasi");
    XLSX.writeFile(wb, "Statistik_Reward_Literasi_Numerasi.xlsx");
    showToast("Data Statistik & Reward berhasil diunduh!", "success");
}

function printRewardCertificate(nama, kelas, rank, points, litCount, numCount, visitCount) {
    const libName = defaultConfig.libraryName || 'PERPUSTAKAAN SEKOLAH';
    const dateNow = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const win = window.open('', '_blank', 'width=900,height=650');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Piagam Penghargaan - ${nama}</title>
            <style>
                body { font-family: 'Georgia', serif; margin: 0; padding: 30px; background: #f8fafc; }
                .cert { border: 10px double #1e3a8a; background: #fff; padding: 45px 50px; text-align: center; max-width: 780px; margin: auto; }
                .sub { font-size: 13px; letter-spacing: 3px; color: #b45309; font-weight: bold; text-transform: uppercase; }
                h1 { font-size: 32px; color: #1e3a8a; margin: 10px 0 6px; letter-spacing: 2px; }
                .given { font-size: 14px; color: #475569; margin-top: 22px; }
                .name { font-size: 28px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #cbd5e1; display: inline-block; padding: 6px 28px; margin: 10px 0 4px; }
                .kelas { font-size: 14px; color: #64748b; margin-bottom: 20px; }
                .desc { font-size: 15px; line-height: 1.7; color: #334155; max-width: 620px; margin: 0 auto 24px; }
                .stats { display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 24px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 13px; color: #1e40af; font-weight: bold; }
                .footer { margin-top: 40px; display: flex; justify-content: space-between; font-family: Arial, sans-serif; font-size: 12px; color: #475569; }
                @media print { body { background: #fff; padding: 0; } }
            </style>
        </head>
        <body>
            <div class="cert">
                <div class="sub">${libName}</div>
                <h1>PIAGAM PENGHARGAAN</h1>
                <div class="given">Diberikan dengan bangga kepada:</div>
                <div class="name">${nama}</div>
                <div class="kelas">${kelas}</div>
                <p class="desc">
                    Atas dedikasi dan keaktifannya sebagai <strong>Peringkat #${rank} Pengunjung Teraktif</strong> dalam program penguatan
                    <strong>Budaya Literasi dan Numerasi</strong> di perpustakaan.
                </p>
                <div class="stats">
                    Total Skor: ${points} Poin &bull; ${visitCount}x Kunjungan &bull; ${litCount} Buku Literasi &bull; ${numCount} Buku Numerasi
                </div>
                <div class="footer">
                    <div>Dicetak melalui Sistem Informasi Perpustakaan</div>
                    <div>${dateNow}<br><br><br><strong>Kepala Perpustakaan</strong></div>
                </div>
            </div>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
    `);
    win.document.close();
}