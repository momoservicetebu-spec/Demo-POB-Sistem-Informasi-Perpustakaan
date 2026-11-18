// JS/smartboard_gamifikasi.js

const SMARTBOARD_QUIZ_BANK = [
    {
        category: 'Literasi',
        question: 'Siapakah penulis novel legendaris Indonesia "Laskar Pelangi"?',
        options: ['Andrea Hirata', 'Tere Liye', 'Pramoedya Ananta Toer', 'Dee Lestari'],
        answer: 0
    },
    {
        category: 'Numerasi',
        question: 'Jika sebuah perpustakaan memiliki 240 buku dan 35% di antaranya adalah buku sains, berapa jumlah buku sains tersebut?',
        options: ['74 buku', '84 buku', '92 buku', '96 buku'],
        answer: 1
    },
    {
        category: 'Literasi',
        question: 'Dalam standar klasifikasi Perpusnas (DDC), kode kelas 800 digunakan untuk kategori buku apa?',
        options: ['Agama', 'Ilmu Sosial', 'Kesusastraan & Fiksi', 'Sejarah & Geografi'],
        answer: 2
    },
    {
        category: 'Numerasi',
        question: 'Sebuah rak buku mampu menampung 45 buku. Jika ada 315 buku baru, berapa rak minimal yang dibutuhkan?',
        options: ['6 rak', '7 rak', '8 rak', '9 rak'],
        answer: 1
    },
    {
        category: 'Literasi',
        question: 'Istilah untuk ringkasan singkat isi buku yang biasanya terletak di sampul belakang disebut...',
        options: ['Bibliografi', 'Glosarium', 'Blurb / Sinopsis', 'Indeks'],
        answer: 2
    },
    {
        category: 'Numerasi',
        question: 'Denda keterlambatan buku adalah Rp 1.000/hari. Jika Rina meminjam 2 buku dan terlambat 4 hari, berapa total dendanya?',
        options: ['Rp 4.000', 'Rp 6.000', 'Rp 8.000', 'Rp 10.000'],
        answer: 2
    },
    {
        category: 'Literasi',
        question: 'Dalam standar Perpusnas (DDC), kelompok Ilmu Murni (Matematika, Fisika, Kimia, Biologi) berada pada kode...',
        options: ['300', '400', '500', '600'],
        answer: 2
    },
    {
        category: 'Numerasi',
        question: 'Pola bilangan: 3, 6, 12, 24, ... Angka selanjutnya yang tepat adalah...',
        options: ['36', '42', '48', '54'],
        answer: 2
    }
];

const SMARTBOARD_CHALLENGES = [
    { title: 'Tantangan Baca 15 Menit', desc: 'Pilih 1 buku dari Rak DDC 500 (Sains) atau 800 (Sastra), baca 5 halaman, lalu ceritakan intinya!', points: 25, color: 'from-blue-600 to-indigo-700' },
    { title: 'Detektif Nomor Panggil', desc: 'Temukan 1 buku dengan kode DDC 300 (Ilmu Sosial) di rak perpustakaan dalam waktu kurang dari 2 menit!', points: 20, color: 'from-emerald-600 to-teal-700' },
    { title: 'Review Kilat E-Book', desc: 'Buka 1 E-Book di Perpustakaan Digital dan tuliskan 1 kalimat hikmah atau fakta menarik dari buku tersebut!', points: 25, color: 'from-amber-500 to-orange-600' },
    { title: 'Misi Numerasi Cerdas', desc: 'Hitung jumlah total eksemplar buku pada 1 rak favoritmu dan laporkan hasilnya ke pustakawan!', points: 30, color: 'from-purple-600 to-pink-600' }
];

let sbState = {
    playerName: '',
    playerClass: '',
    activeTab: 'quiz', // 'quiz' | 'wheel' | 'ebooks'
    quizIndex: 0,
    quizScore: 0,
    quizAnswered: false,
    selectedOption: null,
    spunChallenge: null
};

function renderSmartBoardSection() {
    const members = getRecordsByType('member');
    const ebooks = getRecordsByType('ebook');
    const leaderboard = typeof calculateLiteracyNumeracyLeaderboard === 'function'
        ? calculateLiteracyNumeracyLeaderboard('all').slice(0, 5)
        : [];

    let memberDatalist = '';
    members.forEach(m => {
        const nama = m.memberName || m.name || '';
        const kelas = m.memberClass || m.role || '';
        if (nama) memberDatalist += `<option value="${nama}">${kelas}</option>`;
    });

    const isPlayerReady = Boolean(sbState.playerName.trim());

    // 1. Layar Registrasi Pemain di Smart Board (Jika siswa belum memilih namanya)
    if (!isPlayerReady) {
        return `
            <div id="smartboardArena" class="min-h-[82vh] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-xl">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <span class="px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wider uppercase">
                            🖥️ Smart Board 75" Interactive Zone
                        </span>
                    </div>
                    <button type="button" onclick="toggleSmartBoardFullscreen()"
                        class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-2 transition-all">
                        <span>⛶</span> Mode Layar Penuh TV
                    </button>
                </div>

                <div class="max-w-2xl mx-auto w-full text-center space-y-6 my-auto py-8">
                    <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                        Zona Literasi & Gamifikasi <span class="text-amber-400">Perpustakaan</span>
                    </h1>
                    <p class="text-blue-200 text-sm sm:text-lg">
                        Sentuh layar untuk bermain Kuis Literasi-Numerasi, Putar Roda Tantangan Baca, dan raih Poin Reward otomatis!
                    </p>

                    <form onsubmit="startSmartBoardSession(event)" class="bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 rounded-3xl text-left space-y-4 shadow-2xl">
                        <div>
                            <label class="block text-sm font-bold text-blue-100 mb-2">Masukkan Nama Siswa / Pengunjung *</label>
                            <input type="text" id="sbPlayerNameInput" list="sbMemberList" required
                                placeholder="Ketik atau pilih namamu di sini..."
                                class="w-full px-4 py-3.5 rounded-2xl bg-white text-gray-900 font-bold text-base sm:text-lg focus:ring-4 focus:ring-amber-400 focus:outline-none">
                            <datalist id="sbMemberList">${memberDatalist}</datalist>
                        </div>
                        <button type="submit"
                            class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-extrabold text-base sm:text-lg shadow-lg transition-transform active:scale-98">
                            🚀 Mulai Bermain & Check-In Otomatis
                        </button>
                    </form>
                </div>

                <!-- Mini Top 5 Papan Skor di Bawah -->
                <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p class="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5">🏆 Top 5 Peringkat Literasi & Numerasi Saat Ini</p>
                    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        ${leaderboard.length > 0 ? leaderboard.map((p, i) => `
                            <div class="bg-white/10 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                                <span class="truncate font-semibold"><strong class="text-amber-400">#${i + 1}</strong> ${p.name}</span>
                                <span class="font-bold text-emerald-300 ml-2">${p.totalPoints} pt</span>
                            </div>
                        `).join('') : `<p class="col-span-5 text-xs text-blue-200/70">Jadilah pemain pertama yang mencetak skor hari ini!</p>`}
                    </div>
                </div>
            </div>
        `;
    }

    // 2. Konten Tab Interaktif Saat Siswa Sudah Login di Smart Board
    let activeGameHtml = '';

    if (sbState.activeTab === 'quiz') {
        const q = SMARTBOARD_QUIZ_BANK[sbState.quizIndex % SMARTBOARD_QUIZ_BANK.length];
        const optionsHtml = q.options.map((opt, idx) => {
            let btnStyle = 'bg-white/10 hover:bg-white/20 border-white/20 text-white';
            if (sbState.quizAnswered) {
                if (idx === q.answer) {
                    btnStyle = 'bg-emerald-500 border-emerald-300 text-white font-extrabold';
                } else if (idx === sbState.selectedOption) {
                    btnStyle = 'bg-red-500/80 border-red-300 text-white';
                } else {
                    btnStyle = 'bg-white/5 border-white/10 text-white/50';
                }
            }
            return `
                <button type="button" onclick="answerSmartBoardQuiz(${idx})" ${sbState.quizAnswered ? 'disabled' : ''}
                    class="p-4 sm:p-5 rounded-2xl border-2 text-left text-base sm:text-lg font-semibold transition-all flex items-center gap-3 ${btnStyle}">
                    <span class="w-9 h-9 rounded-xl bg-black/25 flex items-center justify-center font-bold shrink-0">
                        ${['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span>${opt}</span>
                </button>
            `;
        }).join('');

        activeGameHtml = `
            <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 space-y-6">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="px-3.5 py-1 rounded-full text-xs font-bold uppercase ${q.category === 'Numerasi' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40' : 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'}">
                        Soal ${q.category} • +15 Poin Jika Benar
                    </span>
                    <span class="text-sm font-bold text-amber-300">Skor Sesi Ini: ${sbState.quizScore} Poin</span>
                </div>

                <h3 class="text-xl sm:text-3xl font-bold leading-snug text-white">
                    ${q.question}
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${optionsHtml}
                </div>

                ${sbState.quizAnswered ? `
                    <div class="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                        <p class="text-sm sm:text-base font-bold ${sbState.selectedOption === q.answer ? 'text-emerald-300' : 'text-amber-300'}">
                            ${sbState.selectedOption === q.answer
                                ? '🎉 Hebat! Jawabanmu benar (+15 Poin Reward ditambahkan!)'
                                : `💡 Jawaban yang tepat adalah: ${q.options[q.answer]}`}
                        </p>
                        <button type="button" onclick="nextSmartBoardQuiz()"
                            class="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg">
                            Soal Berikutnya ➔
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    } else if (sbState.activeTab === 'wheel') {
        const ch = sbState.spunChallenge;
        activeGameHtml = `
            <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-10 text-center space-y-6">
                <h3 class="text-2xl sm:text-3xl font-extrabold text-white">🎡 Roda Tantangan Literasi & Numerasi</h3>
                <p class="text-blue-200 text-sm sm:text-base max-w-xl mx-auto">
                    Putar roda untuk mendapatkan misi membaca acak di perpustakaan dan klaim bonus poin reward!
                </p>

                <div class="py-2">
                    <button type="button" onclick="spinSmartBoardChallenge()"
                        class="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 text-slate-950 font-extrabold text-lg sm:text-xl shadow-xl hover:scale-105 transition-transform">
                        🎲 Putar Tantangan Sekarang!
                    </button>
                </div>

                ${ch ? `
                    <div class="max-w-2xl mx-auto p-6 rounded-3xl bg-gradient-to-br ${ch.color} border border-white/30 text-left space-y-4 shadow-2xl">
                        <div class="flex items-center justify-between">
                            <span class="px-3 py-1 rounded-full bg-black/25 text-xs font-bold uppercase">Misi Terpilih</span>
                            <span class="px-3 py-1 rounded-full bg-amber-300 text-slate-950 text-xs font-extrabold">+${ch.points} Poin</span>
                        </div>
                        <h4 class="text-xl sm:text-2xl font-extrabold">${ch.title}</h4>
                        <p class="text-sm sm:text-base text-white/90 leading-relaxed">${ch.desc}</p>
                        <button type="button" onclick="claimSmartBoardChallengePoints(${ch.points}, '${ch.title.replace(/'/g, "\\'")}')"
                            class="w-full py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-amber-100 font-extrabold text-sm sm:text-base shadow-md">
                            ✅ Saya Sudah Selesaikan Misi Ini (+${ch.points} Poin)
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        // Tab Baca E-Book di Layar Besar Smart Board
        activeGameHtml = `
            <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-bold">📚 Koleksi E-Book Interaktif Layar Lebar</h3>
                    <span class="text-xs text-blue-200">Sentuh buku untuk membaca di layar 75"</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${ebooks.length > 0 ? ebooks.map(eb => {
                        const targetId = eb.__backendId || eb.id;
                        return `
                            <div class="bg-white/10 border border-white/15 rounded-2xl p-4 flex flex-col justify-between gap-3">
                                <div>
                                    <span class="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-xs font-bold">DDC ${eb.ebookDdcCode || '000'}</span>
                                    <h4 class="font-bold text-base mt-2 line-clamp-2">${eb.ebookTitle || eb.title}</h4>
                                    <p class="text-xs text-blue-200 mt-1">${eb.ebookAuthor || '-'}</p>
                                </div>
                                <button type="button" onclick="openDigitalBookReader('${targetId}')"
                                    class="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs">
                                    📖 Baca di Smart Board
                                </button>
                            </div>
                        `;
                    }).join('') : `<p class="col-span-3 text-sm text-blue-200 py-8 text-center">Belum ada koleksi e-book. Tambahkan melalui menu Perpustakaan Digital.</p>`}
                </div>
            </div>
        `;
    }

    return `
        <div id="smartboardArena" class="min-h-[82vh] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-5 sm:p-8 space-y-6 shadow-xl">
            <!-- Top Bar Pemain -->
            <div class="flex flex-wrap items-center justify-between gap-3 bg-white/10 border border-white/15 px-5 py-3.5 rounded-2xl">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-lg">
                        ${sbState.playerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-bold text-sm sm:text-base">${sbState.playerName} <span class="text-xs font-normal text-blue-200">(${sbState.playerClass})</span></p>
                        <p class="text-xs text-emerald-300">Sesi Aktif • Poin otomatis masuk ke Statistik Reward</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="toggleSmartBoardFullscreen()"
                        class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold">
                        ⛶ Fullscreen TV
                    </button>
                    <button type="button" onclick="exitSmartBoardSession()"
                        class="px-3.5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600 text-xs font-bold">
                        Ganti Pemain
                    </button>
                </div>
            </div>

            <!-- Navigasi Mode Permainan / Baca -->
            <div class="grid grid-cols-3 gap-3">
                <button type="button" onclick="switchSmartBoardTab('quiz')"
                    class="py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-base transition-all ${sbState.activeTab === 'quiz' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'}">
                    🧠 Kuis Literasi & Numerasi
                </button>
                <button type="button" onclick="switchSmartBoardTab('wheel')"
                    class="py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-base transition-all ${sbState.activeTab === 'wheel' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'}">
                    🎡 Roda Tantangan Baca
                </button>
                <button type="button" onclick="switchSmartBoardTab('ebooks')"
                    class="py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-base transition-all ${sbState.activeTab === 'ebooks' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'}">
                    📖 Baca E-Book Layar Lebar
                </button>
            </div>

            <!-- Area Utama -->
            ${activeGameHtml}
        </div>
    `;
}

async function startSmartBoardSession(event) {
    event.preventDefault();
    const rawName = document.getElementById('sbPlayerNameInput')?.value.trim();
    if (!rawName) return;

    const members = getRecordsByType('member');
    const matched = members.find(m => (m.memberName || m.name || '').trim().toLowerCase() === rawName.toLowerCase());

    sbState.playerName = matched ? (matched.memberName || matched.name) : rawName;
    sbState.playerClass = matched ? (matched.memberClass || matched.role || 'Pengunjung') : 'Pengunjung';
    sbState.quizScore = 0;
    sbState.quizAnswered = false;
    sbState.selectedOption = null;

    // Otomatis Check-In ke Buku Tamu dengan keterangan aktivitas membaca/gamifikasi Smart Board
    if (typeof autoCheckInVisitorReading === 'function') {
        await autoCheckInVisitorReading(sbState.playerName, 'Membaca & Gamifikasi Smart Board 75"');
    }

    showToast(`Selamat datang ${sbState.playerName}! Selamat bermain & membaca.`, "success");
    renderCurrentSection();
}

function exitSmartBoardSession() {
    sbState.playerName = '';
    sbState.playerClass = '';
    sbState.spunChallenge = null;
    renderCurrentSection();
}

function switchSmartBoardTab(tab) {
    sbState.activeTab = tab;
    renderCurrentSection();
}

async function answerSmartBoardQuiz(optionIdx) {
    if (sbState.quizAnswered) return;
    const q = SMARTBOARD_QUIZ_BANK[sbState.quizIndex % SMARTBOARD_QUIZ_BANK.length];
    sbState.quizAnswered = true;
    sbState.selectedOption = optionIdx;

    if (optionIdx === q.answer) {
        sbState.quizScore += 15;
        await recordGamificationActivity(`Kuis ${q.category} Smart Board (+15 pt)`);
    }
    renderCurrentSection();
}

function nextSmartBoardQuiz() {
    sbState.quizIndex += 1;
    sbState.quizAnswered = false;
    sbState.selectedOption = null;
    renderCurrentSection();
}

function spinSmartBoardChallenge() {
    const randomIdx = Math.floor(Math.random() * SMARTBOARD_CHALLENGES.length);
    sbState.spunChallenge = SMARTBOARD_CHALLENGES[randomIdx];
    renderCurrentSection();
}

async function claimSmartBoardChallengePoints(points, title) {
    await recordGamificationActivity(`Tantangan Smart Board: ${title} (+${points} pt)`);
    showToast(`Luar biasa! +${points} Poin Reward dicatat untuk ${sbState.playerName}!`, "success");
    sbState.spunChallenge = null;
    renderCurrentSection();
}

// Catat aktivitas gamifikasi ke Buku Tamu (dengan tag "Membaca") agar otomatis menambah skor di menu Statistik
async function recordGamificationActivity(activityNote) {
    if (!sbState.playerName) return;
    const now = new Date();
    const record = {
        type: 'visitor',
        visitorName: sbState.playerName,
        name: sbState.playerName,
        visitorClass: sbState.playerClass,
        institution: sbState.playerClass,
        visitorPurpose: 'Membaca Buku',
        purpose: 'Membaca Buku',
        visitorNotes: `[SmartBoard] ${activityNote}`,
        visitorCheckIn: now.toISOString(),
        visitDate: now.toISOString(),
        visitorCheckOut: now.toISOString(),
        checkOut: now.toISOString(),
        visitorStatus: 'selesai',
        status: 'Selesai'
    };

    if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
        const res = await window.dataSdk.sendData('create', record);
        if (res && res.__backendId) record.__backendId = res.__backendId;
    }
    appState.allRecords.push(record);
}

function toggleSmartBoardFullscreen() {
    const el = document.getElementById('smartboardArena') || document.documentElement;
    if (!document.fullscreenElement) {
        el.requestFullscreen?.().catch(() => {});
    } else {
        document.exitFullscreen?.().catch(() => {});
    }
}