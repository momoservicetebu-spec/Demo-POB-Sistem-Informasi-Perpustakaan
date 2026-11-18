// JS/smartboard_gamifikasi.js

// =========================================================================
// 1. BANK SOAL BERBURU BUKU OFFLINE (DDC 000 - 900) + PEMBAHASAN LENGKAP
// =========================================================================
const DEFAULT_SMARTBOARD_QUIZ_BANK = [
    {
        ddcCode: '000',
        domain: 'Numerasi',
        question: 'Dalam sistem bilangan biner komputer, bilangan desimal 13 ditulis sebagai...',
        options: ['1011', '1101', '1110', '1001'],
        answer: 1,
        bookClue: 'Cari di Rak 000 (Informatika / Komputer Dasar) bab Sistem Bilangan.',
        explanation: '13 dibagi 2 bersisa 1 (LSB), 6 dibagi 2 bersisa 0, 3 dibagi 2 bersisa 1, dan 1 dibagi 2 bersisa 1 (MSB). Dibaca dari bawah ke atas menjadi 1101 (8 + 4 + 0 + 1 = 13).'
    },
    {
        ddcCode: '000',
        domain: 'Literasi',
        question: 'Karya referensi berisi ringkasan informasi berbagai cabang ilmu pengetahuan yang disusun alfabetis disebut...',
        options: ['Ensiklopedia', 'Almanak', 'Direktori', 'Indeks'],
        answer: 0,
        bookClue: 'Periksa koleksi referensi di Rak 000 (Karya Umum / Ensiklopedia).',
        explanation: 'Ensiklopedia adalah karya rujukan yang menyajikan uraian ringkas dan komprehensif tentang berbagai cabang ilmu pengetahuan yang disusun secara sistematis (umumnya alfabetis).'
    },
    {
        ddcCode: '100',
        domain: 'Literasi',
        question: 'Cabang filsafat yang mempelajari prinsip-prinsip penalaran yang lurus dan valid disebut...',
        options: ['Estetika', 'Logika', 'Metafisika', 'Epistemologi'],
        answer: 1,
        bookClue: 'Cari di Rak 100 (Filsafat & Psikologi) topik Pengantar Logika.',
        explanation: 'Logika berasal dari kata Yunani "logos" yang berarti pikiran/nalar, yaitu cabang filsafat yang mengkaji aturan penarikan kesimpulan yang sahih dan bebas dari sesat pikir.'
    },
    {
        ddcCode: '100',
        domain: 'Literasi',
        question: 'Kecerdasan seseorang dalam mengenali, mengelola emosi diri, dan berempati kepada orang lain disebut...',
        options: ['IQ (Intelligence Quotient)', 'EQ (Emotional Quotient)', 'SQ (Spiritual Quotient)', 'AQ (Adversity Quotient)'],
        answer: 1,
        bookClue: 'Temukan di Rak 100 (Psikologi Remaja / Pengembangan Diri).',
        explanation: 'Emotional Quotient (EQ) atau kecerdasan emosional mencakup kesadaran diri, pengendalian emosi, motivasi diri, empati, dan keterampilan sosial.'
    },
    {
        ddcCode: '200',
        domain: 'Numerasi',
        question: 'Jika tabungan emas senilai 100 gram telah mencapai nisab dan haul (1 tahun), berapa persen zakat mal yang wajib dikeluarkan?',
        options: ['1,5%', '2,5%', '5%', '10%'],
        answer: 1,
        bookClue: 'Buka buku Pendidikan Agama Islam / Fiqih di Rak 200 bab Zakat Mal.',
        explanation: 'Nisab zakat emas adalah 85 gram dengan haul 1 tahun hijriah, dan kadar zakat mal yang wajib dikeluarkan sebesar 2,5% (atau 1/40) dari total harta simpanan.'
    },
    {
        ddcCode: '200',
        domain: 'Literasi',
        question: 'Sikap saling menghormati dan menghargai perbedaan keyakinan antarumat beragama disebut...',
        options: ['Fanatisme', 'Toleransi (Tasamuh)', 'Etnosentrisme', 'Eksklusivisme'],
        answer: 1,
        bookClue: 'Cari di Rak 200 (Pendidikan Agama & Budi Pekerti).',
        explanation: 'Toleransi (tasamuh) adalah sikap lapang dada dan saling menghormati perbedaan keyakinan, pendapat, maupun budaya demi terciptanya kerukunan hidup.'
    },
    {
        ddcCode: '300',
        domain: 'Numerasi',
        question: 'Harga barang naik dari Rp 20.000 menjadi Rp 25.000 dan permintaan turun dari 100 unit menjadi 80 unit. Koefisien elastisitas permintaannya adalah...',
        options: ['0,5', '0,8', '1,0', '1,25'],
        answer: 1,
        bookClue: 'Periksa buku Ekonomi di Rak 300 bab Elastisitas Permintaan.',
        explanation: 'Persentase perubahan jumlah diminta (%ΔQ) = |-20 / 100| = 20%. Persentase perubahan harga (%ΔP) = |5.000 / 20.000| = 25%. Koefisien Ed = 20% ÷ 25% = 0,8 (Inelastis).'
    },
    {
        ddcCode: '300',
        domain: 'Literasi',
        question: 'Lembaga negara yang berwenang menguji undang-undang terhadap UUD Negara Republik Indonesia Tahun 1945 adalah...',
        options: ['Mahkamah Agung', 'Mahkamah Konstitusi (MK)', 'Komisi Yudisial', 'DPD'],
        answer: 1,
        bookClue: 'Cari di buku PPKn / Hukum Tata Negara di Rak 300.',
        explanation: 'Berdasarkan Pasal 24C ayat (1) UUD 1945, Mahkamah Konstitusi (MK) berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk menguji UU terhadap UUD.'
    },
    {
        ddcCode: '400',
        domain: 'Literasi',
        question: 'Manakah penulisan kata baku yang sesuai dengan Kamus Besar Bahasa Indonesia (KBBI) dan EYD V?',
        options: ['Apotik & Aktifitas', 'Apotek & Aktivitas', 'Apotek & Aktifitas', 'Apotik & Aktivitas'],
        answer: 1,
        bookClue: 'Cek KBBI atau buku Bahasa Indonesia di Rak 400.',
        explanation: 'Bentuk baku dalam KBBI adalah "apotek" (bukan apotik) dan "aktivitas" (serapan dari bahasa Inggris "activity" yang akhiran -ity diserap menjadi -itas).'
    },
    {
        ddcCode: '400',
        domain: 'Literasi',
        question: 'In English grammar, which tense describes an action that started in the past and continues up to the present?',
        options: ['Simple Past', 'Present Continuous', 'Present Perfect Tense', 'Past Future'],
        answer: 2,
        bookClue: 'Cari buku English Grammar di Rak 400.',
        explanation: 'Present Perfect Tense (Subject + has/have + V3) digunakan untuk menyatakan tindakan atau keadaan yang dimulai di masa lampau dan masih berlanjut hingga sekarang.'
    },
    {
        ddcCode: '500',
        domain: 'Numerasi',
        question: 'Sebuah segitiga siku-siku memiliki sisi siku-siku 9 cm dan 12 cm. Panjang sisi miring (hipotenusa) segitiga tersebut adalah...',
        options: ['14 cm', '15 cm', '18 cm', '21 cm'],
        answer: 1,
        bookClue: 'Buka buku Matematika di Rak 500 bab Teorema Pythagoras.',
        explanation: 'Berdasarkan Teorema Pythagoras: c = √(a² + b²) = √(9² + 12²) = √(81 + 144) = √225 = 15 cm (merupakan kelipatan triple Pythagoras 3-4-5 dikali 3).'
    },
    {
        ddcCode: '500',
        domain: 'Numerasi',
        question: 'Benda bermassa 4 kg didorong dengan gaya total 20 Newton. Percepatan benda tersebut menurut Hukum II Newton adalah...',
        options: ['2 m/s²', '4 m/s²', '5 m/s²', '80 m/s²'],
        answer: 2,
        bookClue: 'Cari buku Fisika di Rak 500 bab Hukum Newton tentang Gerak.',
        explanation: 'Rumus Hukum II Newton: F = m × a, sehingga percepatan a = F / m = 20 N / 4 kg = 5 m/s².'
    },
    {
        ddcCode: '500',
        domain: 'Literasi',
        question: 'Organel sel tumbuhan yang berfungsi sebagai tempat berlangsungnya proses fotosintesis adalah...',
        options: ['Mitokondria', 'Ribosom', 'Kloroplas', 'Lisosom'],
        answer: 2,
        bookClue: 'Periksa buku Biologi di Rak 500 bab Struktur Sel.',
        explanation: 'Kloroplas mengandung pigmen hijau daun (klorofil) yang menangkap energi cahaya matahari untuk mengubah air dan karbon dioksida menjadi glukosa dan oksigen.'
    },
    {
        ddcCode: '600',
        domain: 'Numerasi',
        question: 'Wirausaha memproduksi 50 bungkus keripik dengan biaya Rp 350.000. Jika dijual Rp 9.000/bungkus dan habis terjual, keuntungannya adalah...',
        options: ['Rp 50.000', 'Rp 100.000', 'Rp 150.000', 'Rp 450.000'],
        answer: 1,
        bookClue: 'Buka buku Prakarya & Kewirausahaan (PKWU) di Rak 600.',
        explanation: 'Total penerimaan (TR) = 50 × Rp 9.000 = Rp 450.000. Laba bersih = Total Penerimaan - Total Biaya = Rp 450.000 - Rp 350.000 = Rp 100.000.'
    },
    {
        ddcCode: '700',
        domain: 'Literasi',
        question: 'Teknik melukis dengan cat air yang disapukan tipis sehingga menghasilkan warna transparan disebut teknik...',
        options: ['Plakat', 'Aquarel', 'Pointilis', 'Arsir'],
        answer: 1,
        bookClue: 'Periksa buku Seni Budaya (Seni Rupa) di Rak 700.',
        explanation: 'Teknik aquarel menggunakan sapuan cat air yang tipis dan encer sehingga sifat warna tampak tembus pandang (transparan), kebalikan dari teknik plakat yang tebal dan menutup.'
    },
    {
        ddcCode: '800',
        domain: 'Literasi',
        question: 'Novel sejarah tetralogi Pulau Buru berjudul "Bumi Manusia" ditulis oleh sastrawan Indonesia bernama...',
        options: ['Chairil Anwar', 'Pramoedya Ananta Toer', 'Mochtar Lubis', 'Ahmad Tohari'],
        answer: 1,
        bookClue: 'Temukan di Rak 800 (Koleksi Novel Sastra Indonesia).',
        explanation: '"Bumi Manusia" (terbit 1980) adalah buku pertama dari Tetralogi Buru karya Pramoedya Ananta Toer yang berlatar kebangkitan nasional Hindia Belanda awal abad ke-20.'
    },
    {
        ddcCode: '900',
        domain: 'Numerasi',
        question: 'Pada peta berskala 1 : 500.000, jarak Kota A dan Kota B adalah 6 cm. Jarak sebenarnya kedua kota tersebut adalah...',
        options: ['3 km', '30 km', '300 km', '3.000 km'],
        answer: 1,
        bookClue: 'Buka buku Geografi atau Atlas di Rak 900 bab Skala Peta.',
        explanation: 'Jarak sebenarnya = Jarak peta × Penyebut skala = 6 cm × 500.000 = 3.000.000 cm. Karena 1 km = 100.000 cm, maka 3.000.000 ÷ 100.000 = 30 km.'
    },
    {
        ddcCode: '900',
        domain: 'Literasi',
        question: 'Peristiwa pengamanan Soekarno dan Moh. Hatta oleh golongan muda pada 16 Agustus 1945 sebelum Proklamasi disebut peristiwa...',
        options: ['Bandung Lautan Api', 'Rengasdengklok', 'Sumpah Pemuda', 'Agresi Militer I'],
        answer: 1,
        bookClue: 'Cari buku Sejarah Indonesia di Rak 900 bab Proklamasi Kemerdekaan.',
        explanation: 'Peristiwa Rengasdengklok terjadi pada 16 Agustus 1945 ketika golongan muda membawa Soekarno dan Moh. Hatta ke Rengasdengklok, Karawang agar tidak terpengaruh Jepang dan segera memproklamasikan kemerdekaan.'
    }
];

// =========================================================================
// 2. BANK SOAL LATIHAN TKA (TES KEMAMPUAN AKADEMIK) & AN (ASESMEN NASIONAL)
// =========================================================================
const DEFAULT_TKA_AN_BANK = [
    {
        examType: 'AN_LITERASI',
        badge: 'AN • AKM Literasi Membaca',
        stimulus: 'Data Kementerian Lingkungan Hidup menunjukkan bahwa 60% sampah plastik kemasan sekali pakai di sekolah berasal dari botol minuman dan bungkus makanan ringan kantin. Program "Bawa Tumbler & Wadah Sendiri" di SMAN 1 berhasil menekan timbulan sampah plastik hingga 45% dalam satu semester, sekaligus menghemat biaya kebersihan sekolah sebesar Rp 1.200.000 per bulan.',
        question: 'Berdasarkan teks informasi tersebut, manakah simpulan evaluatif yang paling tepat mengenai dampak program "Bawa Tumbler & Wadah Sendiri"?',
        options: [
            'Program tersebut menghilangkan 100% sampah plastik di kantin sekolah.',
            'Program tersebut memberikan dampak ganda berupa pengurangan limbah plastik dan efisiensi anggaran kebersihan sekolah.',
            'Biaya kebersihan sekolah meningkat karena siswa harus mencuci wadah sendiri.',
            'Sampah plastik di sekolah seluruhnya berasal dari luar lingkungan sekolah.'
        ],
        answer: 1,
        explanation: 'Teks secara eksplisit menyebutkan dua dampak positif sekaligus: menekan timbulan sampah plastik hingga 45% (dampak lingkungan) dan menghemat biaya kebersihan Rp 1.200.000/bulan (dampak efisiensi anggaran).'
    },
    {
        examType: 'AN_LITERASI',
        badge: 'AN • AKM Literasi Membaca',
        stimulus: 'Perhatikan kutipan cerpen berikut:\n"Di sudut perpustakaan yang temaram, Raka masih membolak-balik halaman ensiklopedia tua itu. Hujan di luar semakin deras, namun matanya berbinar setiap kali menemukan peta jalur rempah Nusantara. Baginya, setiap lembar kertas usang adalah jendela waktu yang membawanya berlayar melintasi samudra tanpa harus beranjak dari kursi kayu."',
        question: 'Makna ungkapan "jendela waktu yang membawanya berlayar melintasi samudra" pada kutipan teks sastra di atas adalah...',
        options: [
            'Raka bermimpi menjadi nakhoda kapal layar di masa depan.',
            'Buku memberikan wawasan luas dan pengalaman imajinatif tentang sejarah masa lalu kepada pembacanya.',
            'Perpustakaan tersebut terletak tepat di tepi pelabuhan tua.',
            'Raka sedang menunggu hujan reda agar bisa pulang naik kapal.'
        ],
        answer: 1,
        explanation: 'Ungkapan tersebut merupakan majas metafora yang menggambarkan kekuatan membaca buku sejarah/ensiklopedia dalam memperluas wawasan dan imajinasi pembaca tentang masa lampau.'
    },
    {
        examType: 'AN_LITERASI',
        badge: 'AN • AKM Literasi Membaca',
        stimulus: 'Sebuah infografis literasi digital menyatakan: "Sebelum membagikan berita di media sosial, lakukan verifikasi 3 langkah: (1) Periksa kredibilitas sumber media, (2) Bandingkan dengan minimal dua media arus utama terverifikasi, dan (3) Cek tanggal publikasi agar tidak menyebarkan berita lama sebagai peristiwa baru."',
        question: 'Seseorang menerima pesan berantai tentang penutupan jalan akibat banjir tanpa mencantumkan tanggal kejadian, lalu langsung meneruskannya ke grup kelas. Langkah verifikasi manakah yang diabaikan orang tersebut?',
        options: [
            'Hanya langkah ke-1 saja',
            'Langkah ke-1, ke-2, dan ke-3 sekaligus karena langsung meneruskan pesan tanpa pengecekan',
            'Hanya langkah ke-2 saja',
            'Tidak ada langkah yang diabaikan karena info banjir bersifat darurat'
        ],
        answer: 1,
        explanation: 'Karena pesan langsung diteruskan tanpa mengecek sumber media (1), tanpa membandingkan dengan media terverifikasi (2), dan tanpa memeriksa tanggal kejadian (3), ketiga langkah literasi digital tersebut diabaikan.'
    },
    {
        examType: 'AN_LITERASI',
        badge: 'AN • AKM Literasi Membaca',
        stimulus: 'Artikel ilmiah populer menjelaskan bahwa tidur cukup (7–9 jam bagi remaja) berperan krusial dalam proses konsolidasi memori di hipokampus otak. Siswa yang begadang sebelum ujian cenderung mengalami penurunan konsentrasi hingga 30% dibandingkan siswa yang tidur teratur.',
        question: 'Jika seorang siswa ingin meningkatkan daya ingatnya terhadap materi pelajaran yang baru dibaca di perpustakaan, strategi paling efektif berdasarkan bacaan adalah...',
        options: [
            'Membaca materi yang sama berulang-ulang hingga dini hari tanpa tidur.',
            'Mengombinasikan sesi membaca fokus di siang/sore hari dengan tidur malam yang cukup selama 7–9 jam.',
            'Minum kopi pekat agar mata tetap terjaga sepanjang malam.',
            'Hanya belajar 10 menit sebelum ujian dimulai.'
        ],
        answer: 1,
        explanation: 'Konsolidasi memori (pemindahan informasi ke ingatan jangka panjang) terjadi optimal saat tidur cukup 7–9 jam.'
    },
    {
        examType: 'AN_NUMERASI',
        badge: 'AN • AKM Numerasi',
        stimulus: 'Sebuah perpustakaan sekolah mencatat kunjungan siswa selama 4 hari berturut-turut: Senin = 48 siswa, Selasa = 62 siswa, Rabu = 55 siswa, dan Kamis = 75 siswa. Kepala perpustakaan menargetkan rata-rata kunjungan selama 5 hari (Senin–Jumat) minimal mencapai 64 siswa per hari.',
        question: 'Berapa jumlah minimal pengunjung pada hari Jumat agar target rata-rata 64 siswa per hari selama 5 hari tercapai?',
        options: ['70 siswa', '75 siswa', '80 siswa', '85 siswa'],
        answer: 2,
        explanation: 'Total kunjungan 5 hari yang dibutuhkan = 5 × 64 = 320 siswa. Jumlah kunjungan Senin–Kamis = 48 + 62 + 55 + 75 = 240 siswa. Maka kunjungan minimal hari Jumat = 320 - 240 = 80 siswa.'
    },
    {
        examType: 'AN_NUMERASI',
        badge: 'AN • AKM Numerasi',
        stimulus: 'Ruang baca utama perpustakaan berbentuk persegi panjang dengan ukuran panjang 12 meter dan lebar 8 meter. Lantai ruangan tersebut akan dipasangi keramik granit berbentuk persegi dengan ukuran sisi 40 cm × 40 cm.',
        question: 'Berapa jumlah minimal keping keramik granit yang dibutuhkan untuk menutup seluruh lantai ruang baca tersebut?',
        options: ['480 keping', '540 keping', '600 keping', '720 keping'],
        answer: 2,
        explanation: 'Luas lantai = 12 m × 8 m = 96 m² = 960.000 cm². Luas 1 keramik = 40 cm × 40 cm = 1.600 cm². Jumlah keramik = 960.000 ÷ 1.600 = 600 keping.'
    },
    {
        examType: 'AN_NUMERASI',
        badge: 'AN • AKM Numerasi',
        stimulus: 'Dalam sebuah kotak hadiah "Gebyar Literasi" terdapat 6 voucher buku fiksi, 9 voucher buku sains, dan 5 voucher alat tulis. Seorang siswa pemenang kuis diminta mengambil 1 voucher secara acak dengan mata tertutup.',
        question: 'Berapa peluang siswa tersebut mendapatkan voucher buku sains?',
        options: ['0,25 (25%)', '0,30 (30%)', '0,45 (45%)', '0,50 (50%)'],
        answer: 2,
        explanation: 'Total seluruh voucher = 6 + 9 + 5 = 20 voucher. Peluang terambil voucher buku sains = 9 / 20 = 0,45 atau 45%.'
    },
    {
        examType: 'AN_NUMERASI',
        badge: 'AN • AKM Numerasi',
        stimulus: 'Harga normal sebuah paket buku persiapan TKA adalah Rp 180.000. Toko buku memberikan diskon 20%, kemudian karena membeli menggunakan kartu pelajar sekolah diberikan potongan tambahan sebesar Rp 14.000 dari harga setelah diskon.',
        question: 'Berapa rupiah uang yang harus dibayarkan siswa untuk membeli paket buku tersebut?',
        options: ['Rp 126.000', 'Rp 130.000', 'Rp 134.000', 'Rp 144.000'],
        answer: 1,
        explanation: 'Diskon 20% = 20% × Rp 180.000 = Rp 36.000. Harga setelah diskon = Rp 180.000 - Rp 36.000 = Rp 144.000. Potongan tambahan kartu pelajar = Rp 144.000 - Rp 14.000 = Rp 130.000.'
    },
    {
        examType: 'TKA_PENALARAN',
        badge: 'TKA • Penalaran Umum & Kuantitatif',
        stimulus: 'Premis 1: Semua anggota klub literasi sekolah wajib meresensi minimal satu buku setiap bulan.\nPremis 2: Sebagian siswa kelas XI IPA adalah anggota klub literasi sekolah.',
        question: 'Berdasarkan kedua premis tersebut, simpulan yang paling sah secara logika adalah...',
        options: [
            'Semua siswa kelas XI IPA wajib meresensi buku setiap bulan.',
            'Sebagian siswa kelas XI IPA wajib meresensi minimal satu buku setiap bulan.',
            'Tidak ada siswa kelas XI IPA yang menjadi anggota klub literasi.',
            'Semua siswa yang meresensi buku adalah siswa kelas XI IPA.'
        ],
        answer: 1,
        explanation: 'Dengan aturan silogisme partikular (Semua A adalah B; Sebagian C adalah A), maka kesimpulan yang valid adalah: Sebagian C adalah B (Sebagian siswa kelas XI IPA wajib meresensi minimal satu buku setiap bulan).'
    },
    {
        examType: 'TKA_PENALARAN',
        badge: 'TKA • Penalaran Umum & Kuantitatif',
        stimulus: 'Perhatikan barisan bilangan pola bertingkat berikut:\n2, 5, 10, 17, 26, 37, ...',
        question: 'Dua bilangan berikutnya yang tepat untuk melanjutkan pola barisan di atas adalah...',
        options: ['48 dan 61', '50 dan 65', '49 dan 64', '50 dan 63'],
        answer: 1,
        explanation: 'Selisih antar suku membentuk pola bilangan ganjil berurutan: +3, +5, +7, +9, +11. Maka suku berikutnya: 37 + 13 = 50, dan 50 + 15 = 65.'
    },
    {
        examType: 'TKA_PENALARAN',
        badge: 'TKA • Penalaran Umum & Kuantitatif',
        stimulus: 'Lima siswa (Andi, Budi, Citra, Dina, Eka) duduk berderet dalam satu baris meja baca. Citra duduk tepat di tengah. Andi duduk di ujung paling kiri. Budi duduk di sebelah kanan Citra, tetapi tidak di ujung paling kanan.',
        question: 'Siapakah yang duduk di kursi ujung paling kanan?',
        options: ['Budi', 'Dina atau Eka', 'Andi', 'Citra'],
        answer: 1,
        explanation: 'Urutan kursi 1–5: Kursi 1 = Andi (ujung kiri), Kursi 3 = Citra (tengah), Kursi 4 = Budi (sebelah kanan Citra namun bukan ujung kanan). Maka Kursi 5 (ujung kanan) ditempati oleh Dina atau Eka.'
    },
    {
        examType: 'TKA_PENALARAN',
        badge: 'TKA • Penalaran Umum & Kuantitatif',
        stimulus: 'Diketahui x adalah bilangan bulat positif. Nilai P = 3x + 5 dan nilai Q = 2x + 9.',
        question: 'Manakah pernyataan yang paling tepat mengenai hubungan kuantitatif antara P dan Q?',
        options: [
            'P selalu lebih besar daripada Q',
            'Q selalu lebih besar daripada P',
            'P sama dengan Q untuk semua nilai x',
            'Informasi yang diberikan tidak cukup untuk memutuskan salah satu dari tiga pilihan di atas'
        ],
        answer: 3,
        explanation: 'Jika x = 1, P = 8 dan Q = 11 (P < Q). Jika x = 4, P = 17 dan Q = 17 (P = Q). Jika x = 5, P = 20 dan Q = 19 (P > Q). Karena nilainya bergantung pada x, hubungan tidak dapat ditentukan secara tunggal.'
    },
    {
        examType: 'TKA_AKADEMIK',
        badge: 'TKA • Penalaran Akademik (Saintek & Soshum)',
        stimulus: 'Ketika bank sentral menaikkan suku bunga acuan (BI-Rate) untuk menekan laju inflasi yang tinggi, masyarakat cenderung menunda konsumsi dan lebih memilih menabung di perbankan. Di sisi lain, biaya pinjaman modal kerja bagi sektor industri menjadi lebih mahal.',
        question: 'Dampak jangka pendek yang paling mungkin terjadi pada kurva permintaan agregat dan pertumbuhan ekonomi akibat kebijakan moneter kontraktif tersebut adalah...',
        options: [
            'Permintaan agregat meningkat tajam dan inflasi makin tinggi.',
            'Permintaan agregat melambat sehingga laju inflasi terkendali, namun ekspansi investasi sektor riil tertahan.',
            'Nilai tukar mata uang domestik melemah drastis.',
            'Jumlah uang beredar di masyarakat bertambah dua kali lipat.'
        ],
        answer: 1,
        explanation: 'Kenaikan suku bunga acuan merupakan kebijakan moneter kontraktif yang mengurangi jumlah uang beredar, menekan konsumsi dan investasi (permintaan agregat melambat) untuk meredam inflasi.'
    },
    {
        examType: 'TKA_AKADEMIK',
        badge: 'TKA • Penalaran Akademik (Saintek & Soshum)',
        stimulus: 'Dalam ekosistem danau air tawar, limbah pupuk pertanian yang mengandung nitrat dan fosfat tinggi mengalir masuk ke perairan sehingga memicu ledakan populasi alga (algal bloom) di permukaan air.',
        question: 'Mengapa peristiwa eutrofikasi (ledakan populasi alga) tersebut pada akhirnya menyebabkan kematian massal ikan-ikan di dasar danau?',
        options: [
            'Alga memakan seluruh plankton dan ikan kecil secara langsung.',
            'Lapisan alga menghalangi cahaya matahari dan proses penguraian alga mati oleh bakteri menguras oksigen terlarut (DO) di dalam air.',
            'Suhu air danau membeku akibat tertutup daun alga.',
            'Kadar garam air danau berubah menjadi seperti air laut.'
        ],
        answer: 1,
        explanation: 'Eutrofikasi menghalangi penetrasi cahaya matahari ke dasar perairan dan saat alga mati, bakteri dekomposer menyerap oksigen terlarut secara masif (hipoksia), menyebabkan ikan mati lemas.'
    }
];

const SMARTBOARD_CHALLENGES = [
    { title: 'Berburu Buku Rak 500 (Sains)', desc: 'Ambil 1 buku Sains/Matematika di Rak 500, catat 1 rumus atau fakta uniknya, lalu tunjukkan ke petugas!', points: 25, color: 'from-blue-600 to-indigo-700' },
    { title: 'Detektif Klasifikasi DDC', desc: 'Temukan 1 buku berkode DDC 300 (Ilmu Sosial) atau 900 (Sejarah) di rak fisik dalam waktu kurang dari 2 menit!', points: 20, color: 'from-emerald-600 to-teal-700' },
    { title: 'Bedah Sinopsis Sastra (Rak 800)', desc: 'Pilih 1 buku fiksi/sastra di Rak 800, baca bagian sinopsisnya, lalu ceritakan intinya dalam 2 kalimat!', points: 25, color: 'from-amber-500 to-orange-600' },
    { title: 'Audit Numerasi Rak Favorit', desc: 'Pilih satu baris rak buku, hitung jumlah judul dan total eksemplarnya secara cepat!', points: 30, color: 'from-purple-600 to-pink-600' }
];

let sbState = {
    playerName: '',
    playerClass: '',
    activeTab: 'tka_an', // 'tka_an' | 'quiz' | 'wheel' | 'ebooks'
    selectedDdcFilter: 'ALL',
    selectedTkaFilter: 'ALL',
    quizDeck: [],
    deckPointer: 0,
    tkaDeck: [],
    tkaPointer: 0,
    quizScore: 0,
    answeredCount: 0,
    quizAnswered: false,
    selectedOption: null,
    showOfflineHint: false,
    spunChallenge: null
};

// =========================================================================
// HELPER BANK SOAL & PENGACAKAN
// =========================================================================
function getAllSmartBoardQuestions() {
    const uploaded = getRecordsByType('quiz_bank').map(q => ({
        __backendId: q.__backendId || q.id,
        isCustom: true,
        ddcCode: String(q.quizDdcCode || '000').trim(),
        domain: q.quizDomain || 'Literasi',
        question: q.quizQuestion || '',
        options: [q.quizOptionA || '', q.quizOptionB || '', q.quizOptionC || '', q.quizOptionD || ''],
        answer: Number(q.quizAnswerIndex || 0),
        bookClue: q.quizBookClue || `Cari referensi di rak kategori DDC ${q.quizDdcCode || '000'}.`,
        explanation: q.quizExplanation || q.quizBookClue || 'Jawaban dapat diverifikasi pada buku referensi sesuai kode DDC terkait.'
    })).filter(q => q.question && q.options[0]);

    return [...uploaded, ...DEFAULT_SMARTBOARD_QUIZ_BANK];
}

function getAllTkaAnQuestions() {
    const uploaded = getRecordsByType('tka_an_bank').map(q => ({
        __backendId: q.__backendId || q.id,
        isCustom: true,
        examType: q.tkaExamType || 'AN_LITERASI',
        badge: q.tkaBadge || 'TKA / AN • Soal Sekolah',
        stimulus: q.tkaStimulus || '',
        question: q.tkaQuestion || '',
        options: [q.tkaOptionA || '', q.tkaOptionB || '', q.tkaOptionC || '', q.tkaOptionD || ''],
        answer: Number(q.tkaAnswerIndex || 0),
        explanation: q.tkaExplanation || 'Pembahasan sesuai konsep dasar materi dan analisis bacaan.'
    })).filter(q => q.question && q.options[0]);

    return [...uploaded, ...DEFAULT_TKA_AN_BANK];
}

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function rebuildShuffledQuizDeck(ddcFilter = sbState.selectedDdcFilter) {
    sbState.selectedDdcFilter = ddcFilter;
    const allQuestions = getAllSmartBoardQuestions();
    const filtered = ddcFilter === 'ALL'
        ? allQuestions
        : allQuestions.filter(q => String(q.ddcCode).startsWith(ddcFilter.substring(0, 1)));

    sbState.quizDeck = shuffleArray(filtered.length > 0 ? filtered : allQuestions);
    sbState.deckPointer = 0;
    sbState.quizAnswered = false;
    sbState.selectedOption = null;
    sbState.showOfflineHint = false;
}

function rebuildShuffledTkaDeck(examFilter = sbState.selectedTkaFilter) {
    sbState.selectedTkaFilter = examFilter;
    const allTka = getAllTkaAnQuestions();
    const filtered = examFilter === 'ALL'
        ? allTka
        : allTka.filter(q => q.examType === examFilter);

    sbState.tkaDeck = shuffleArray(filtered.length > 0 ? filtered : allTka);
    sbState.tkaPointer = 0;
    sbState.quizAnswered = false;
    sbState.selectedOption = null;
}

function findMatchingOfflineBooksForClue(ddcCode) {
    const prefix = String(ddcCode || '000').substring(0, 1) + '00';
    const books = getRecordsByType('book');
    return books.filter(b => {
        if (typeof resolveBookDdc === 'function') {
            return resolveBookDdc(b).ddcClass.code === prefix;
        }
        return String(b.bookDdcCode || '').startsWith(prefix.substring(0, 1));
    }).slice(0, 4);
}

// =========================================================================
// RENDER UTAMA ZONA SMART BOARD 75"
// =========================================================================
function renderSmartBoardSection() {
    const members = getRecordsByType('member');
    const ebooks = getRecordsByType('ebook');
    const allBookQuestions = getAllSmartBoardQuestions();
    const allTkaQuestions = getAllTkaAnQuestions();
    const totalBankSoal = allBookQuestions.length + allTkaQuestions.length;

    const classes = typeof getDigitalDdcClasses === 'function'
        ? getDigitalDdcClasses()
        : [
            { code: '000', short: '000 - Karya Umum' },
            { code: '100', short: '100 - Filsafat & Psikologi' },
            { code: '200', short: '200 - Agama' },
            { code: '300', short: '300 - Ilmu Sosial' },
            { code: '400', short: '400 - Bahasa' },
            { code: '500', short: '500 - Sains & Matematika' },
            { code: '600', short: '600 - Teknologi & Terapan' },
            { code: '700', short: '700 - Seni & Olahraga' },
            { code: '800', short: '800 - Sastra & Fiksi' },
            { code: '900', short: '900 - Geografi & Sejarah' }
        ];

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

    // 1. Layar Awal Smart Board 75"
    if (!isPlayerReady) {
        return `
            <div id="smartboardArena" class="min-h-[82vh] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-xl">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-2.5">
                        <span class="px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wider uppercase">
                            🖥️ Smart Board 75" Interactive Zone
                        </span>
                        <span class="px-3 py-1.5 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
                            🎯 ${allTkaQuestions.length} Soal TKA & AN • 📚 ${allBookQuestions.length} Soal Buku DDC
                        </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button type="button" onclick="showManageTkaAnBankModal()"
                            class="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all">
                            <span>🎯</span> Upload Bank Soal TKA & AN
                        </button>
                        <button type="button" onclick="showManageQuizBankModal()"
                            class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all">
                            <span>📚</span> Upload Soal Buku DDC
                        </button>
                        <button type="button" onclick="toggleSmartBoardFullscreen()"
                            class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all">
                            <span>⛶</span> Layar Penuh TV
                        </button>
                    </div>
                </div>

                <div class="max-w-2xl mx-auto w-full text-center space-y-6 my-auto py-8">
                    <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                        Zona Latihan <span class="text-amber-400">TKA, AN</span> & Literasi Buku
                    </h1>
                    <p class="text-blue-200 text-sm sm:text-lg">
                        Asah kemampuan <strong>Tes Kemampuan Akademik (TKA)</strong>, <strong>Asesmen Nasional (AKM Literasi & Numerasi)</strong>, lengkap dengan <strong>pembahasan jawaban</strong> & berburu buku fisik!
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
                            🚀 Mulai Latihan TKA / AN & Gamifikasi
                        </button>
                    </form>
                </div>

                <!-- Mini Top 5 Papan Skor -->
                <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p class="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5">🏆 Top 5 Peringkat Literasi, Numerasi & TKA Saat Ini</p>
                    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        ${leaderboard.length > 0 ? leaderboard.map((p, i) => `
                            <div class="bg-white/10 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                                <span class="truncate font-semibold"><strong class="text-amber-400">#${i + 1}</strong> ${p.name}</span>
                                <span class="font-bold text-emerald-300 ml-2">${p.totalPoints} pt</span>
                            </div>
                        `).join('') : `<p class="col-span-5 text-xs text-blue-200/70">Jadilah siswa pertama yang mencetak skor latihan hari ini!</p>`}
                    </div>
                </div>
            </div>
        `;
    }

    if (sbState.tkaDeck.length === 0) rebuildShuffledTkaDeck(sbState.selectedTkaFilter);
    if (sbState.quizDeck.length === 0) rebuildShuffledQuizDeck(sbState.selectedDdcFilter);

    // 2. Konten Tab Interaktif
    let activeGameHtml = '';

    if (sbState.activeTab === 'tka_an') {
        const q = sbState.tkaDeck[sbState.tkaPointer % sbState.tkaDeck.length];
        const tkaClusters = [
            { key: 'ALL', label: `Semua Materi (${allTkaQuestions.length})` },
            { key: 'AN_LITERASI', label: `AN • AKM Literasi (${allTkaQuestions.filter(x => x.examType === 'AN_LITERASI').length})` },
            { key: 'AN_NUMERASI', label: `AN • AKM Numerasi (${allTkaQuestions.filter(x => x.examType === 'AN_NUMERASI').length})` },
            { key: 'TKA_PENALARAN', label: `TKA • Penalaran Umum (${allTkaQuestions.filter(x => x.examType === 'TKA_PENALARAN').length})` },
            { key: 'TKA_AKADEMIK', label: `TKA • Saintek & Soshum (${allTkaQuestions.filter(x => x.examType === 'TKA_AKADEMIK').length})` }
        ];

        const tkaFilterChipsHtml = tkaClusters.map(c => `
            <button type="button" onclick="changeSmartBoardTkaFilter('${c.key}')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${sbState.selectedTkaFilter === c.key ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-white/10 text-white border-white/15 hover:bg-white/20'}">
                ${c.label}
            </button>
        `).join('');

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
                <button type="button" onclick="answerSmartBoardTka(${idx})" ${sbState.quizAnswered ? 'disabled' : ''}
                    class="p-4 sm:p-5 rounded-2xl border-2 text-left text-sm sm:text-base font-semibold transition-all flex items-start gap-3 ${btnStyle}">
                    <span class="w-8 h-8 rounded-xl bg-black/25 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        ${['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span class="leading-snug">${opt}</span>
                </button>
            `;
        }).join('');

        activeGameHtml = `
            <div class="space-y-4">
                <div class="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-wrap items-center gap-2">
                    <span class="text-xs font-bold text-amber-300 mr-1">Fokus Latihan:</span>
                    ${tkaFilterChipsHtml}
                </div>

                <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 space-y-5">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span class="px-3.5 py-1 rounded-full text-xs font-extrabold bg-indigo-500/40 text-indigo-100 border border-indigo-300/30">
                            🎯 ${q.badge} • +20 Poin Reward
                        </span>
                        <span class="text-xs sm:text-sm font-bold text-amber-300">
                            Soal #${sbState.answeredCount + 1} • Skor Sesi: ${sbState.quizScore} Poin
                        </span>
                    </div>

                    ${q.stimulus ? `
                        <div class="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border-l-4 border-l-amber-400 text-blue-50 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                            <span class="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">Bacaan / Data Stimulus:</span>
                            ${q.stimulus}
                        </div>
                    ` : ''}

                    <h3 class="text-lg sm:text-2xl font-bold leading-snug text-white">
                        ${q.question}
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        ${optionsHtml}
                    </div>

                    ${sbState.quizAnswered ? `
                        <div class="pt-4 border-t border-white/15 space-y-4">
                            <div class="p-4 sm:p-5 rounded-2xl ${sbState.selectedOption === q.answer ? 'bg-emerald-950/80 border border-emerald-400/50' : 'bg-amber-950/70 border border-amber-400/50'} space-y-2">
                                <p class="text-sm sm:text-base font-extrabold ${sbState.selectedOption === q.answer ? 'text-emerald-300' : 'text-amber-300'}">
                                    ${sbState.selectedOption === q.answer
                                        ? '🎉 Analisis Tepat! +20 Poin Reward ditambahkan!'
                                        : `💡 Kunci Jawaban Benar: ${['A', 'B', 'C', 'D'][q.answer]}. ${q.options[q.answer]}`}
                                </p>
                                <div class="p-3.5 rounded-xl bg-black/30 text-xs sm:text-sm text-blue-50 leading-relaxed">
                                    <span class="block text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1">📖 Pembahasan Lengkap:</span>
                                    ${q.explanation}
                                </div>
                            </div>
                            <div class="flex justify-end">
                                <button type="button" onclick="nextSmartBoardTka()"
                                    class="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg">
                                    Soal TKA / AN Berikutnya ➔
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } else if (sbState.activeTab === 'quiz') {
        const q = sbState.quizDeck[sbState.deckPointer % sbState.quizDeck.length];
        const prefix = String(q.ddcCode || '000').substring(0, 1) + '00';
        const ddcInfo = classes.find(c => c.code === prefix) || classes[0];
        const matchingBooks = findMatchingOfflineBooksForClue(q.ddcCode);

        const filterChipsHtml = [
            `<button type="button" onclick="changeSmartBoardDdcFilter('ALL')"
                class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${sbState.selectedDdcFilter === 'ALL' ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-white/10 text-white border-white/15 hover:bg-white/20'}">
                Semua DDC (${allBookQuestions.length})
            </button>`,
            ...classes.map(c => {
                const count = allBookQuestions.filter(item => String(item.ddcCode).startsWith(c.code.substring(0, 1))).length;
                const active = sbState.selectedDdcFilter === c.code;
                return `
                    <button type="button" onclick="changeSmartBoardDdcFilter('${c.code}')"
                        class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-white/10 text-white border-white/15 hover:bg-white/20'}">
                        ${c.code} (${count})
                    </button>
                `;
            })
        ].join('');

        const optionsHtml = q.options.map((opt, idx) => {
            let btnStyle = 'bg-white/10 hover:bg-white/20 border-white/20 text-white';
            if (sbState.quizAnswered) {
                if (idx === q.answer) btnStyle = 'bg-emerald-500 border-emerald-300 text-white font-extrabold';
                else if (idx === sbState.selectedOption) btnStyle = 'bg-red-500/80 border-red-300 text-white';
                else btnStyle = 'bg-white/5 border-white/10 text-white/50';
            }
            return `
                <button type="button" onclick="answerSmartBoardQuiz(${idx})" ${sbState.quizAnswered ? 'disabled' : ''}
                    class="p-4 sm:p-5 rounded-2xl border-2 text-left text-base sm:text-lg font-semibold transition-all flex items-center gap-3 ${btnStyle}">
                    <span class="w-9 h-9 rounded-xl bg-black/25 flex items-center justify-center font-bold shrink-0">${['A', 'B', 'C', 'D'][idx]}</span>
                    <span>${opt}</span>
                </button>
            `;
        }).join('');

        const offlineBooksListHtml = matchingBooks.length > 0
            ? matchingBooks.map(b => `
                <div class="px-3 py-2 rounded-xl bg-black/25 border border-white/10 text-xs flex items-center justify-between gap-2">
                    <div>
                        <p class="font-bold text-amber-200">${b.bookTitle || b.title}</p>
                        <p class="text-blue-200/80 text-[11px]">Pengarang: ${b.bookAuthor || '-'} &bull; Barcode: ${b.bookBarcode || '-'}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold shrink-0">Rak: ${b.bookShelf || prefix}</span>
                </div>
            `).join('')
            : `<p class="text-xs text-blue-200/80">Silakan menuju area rak koleksi label <strong>${ddcInfo.short}</strong> di perpustakaan.</p>`;

        activeGameHtml = `
            <div class="space-y-4">
                <div class="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-wrap items-center gap-1.5">
                    <span class="text-xs font-bold text-amber-300 mr-1">Kategori Buku:</span>
                    ${filterChipsHtml}
                </div>

                <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">📚 ${ddcInfo.short}</span>
                            <span class="px-3 py-1 rounded-full text-xs font-bold ${q.domain === 'Numerasi' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-indigo-500/30 text-indigo-200'}">${q.domain} • +15 Poin</span>
                        </div>
                        <div class="text-xs sm:text-sm font-bold text-amber-300">Soal #${sbState.answeredCount + 1} • Skor Sesi: ${sbState.quizScore} Poin</div>
                    </div>

                    <h3 class="text-xl sm:text-3xl font-bold leading-snug text-white">${q.question}</h3>

                    <div class="bg-blue-950/70 border border-blue-400/30 rounded-2xl p-4 space-y-3">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <p class="text-xs sm:text-sm text-blue-100 font-semibold">🧭 Petunjuk Buku Fisik: <span class="text-amber-300">${q.bookClue}</span></p>
                            <button type="button" onclick="toggleOfflineBookHint()"
                                class="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold shrink-0">
                                ${sbState.showOfflineHint ? 'Sembunyikan Buku Rak' : '🔍 Lihat Buku Offline di Rak'}
                            </button>
                        </div>
                        ${sbState.showOfflineHint ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-white/10">${offlineBooksListHtml}</div>` : ''}
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${optionsHtml}</div>

                    ${sbState.quizAnswered ? `
                        <div class="pt-4 border-t border-white/15 space-y-4">
                            <div class="p-4 sm:p-5 rounded-2xl ${sbState.selectedOption === q.answer ? 'bg-emerald-950/80 border border-emerald-400/50' : 'bg-amber-950/70 border border-amber-400/50'} space-y-2">
                                <p class="text-sm sm:text-base font-extrabold ${sbState.selectedOption === q.answer ? 'text-emerald-300' : 'text-amber-300'}">
                                    ${sbState.selectedOption === q.answer
                                        ? '🎉 Benar! +15 Poin Reward ditambahkan!'
                                        : `💡 Kunci Jawaban Benar: ${['A', 'B', 'C', 'D'][q.answer]}. ${q.options[q.answer]}`}
                                </p>
                                <div class="p-3.5 rounded-xl bg-black/30 text-xs sm:text-sm text-blue-50 leading-relaxed">
                                    <span class="block text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1">📖 Pembahasan & Referensi Buku:</span>
                                    ${q.explanation}
                                </div>
                            </div>
                            <div class="flex justify-end">
                                <button type="button" onclick="nextSmartBoardQuiz()" class="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg">Acak Soal Berikutnya ➔</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } else if (sbState.activeTab === 'wheel') {
        const ch = sbState.spunChallenge;
        activeGameHtml = `
            <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-10 text-center space-y-6">
                <h3 class="text-2xl sm:text-3xl font-extrabold text-white">🎡 Roda Misi Berburu Buku Perpustakaan</h3>
                <p class="text-blue-200 text-sm sm:text-base max-w-xl mx-auto">Putar roda untuk mendapatkan misi mencari & membaca buku fisik di rak perpustakaan!</p>
                <div class="py-2">
                    <button type="button" onclick="spinSmartBoardChallenge()"
                        class="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 text-slate-950 font-extrabold text-lg sm:text-xl shadow-xl hover:scale-105 transition-transform">
                        🎲 Putar Misi Sekarang!
                    </button>
                </div>
                ${ch ? `
                    <div class="max-w-2xl mx-auto p-6 rounded-3xl bg-gradient-to-br ${ch.color} border border-white/30 text-left space-y-4 shadow-2xl">
                        <div class="flex items-center justify-between">
                            <span class="px-3 py-1 rounded-full bg-black/25 text-xs font-bold uppercase">Misi Buku Fisik</span>
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
        activeGameHtml = `
            <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-bold">📚 Koleksi E-Book Interaktif Layar 75"</h3>
                    <span class="text-xs text-blue-200">Sentuh buku untuk membaca layar penuh</span>
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
        <div id="smartboardArena" class="min-h-[82vh] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-5 sm:p-8 space-y-5 shadow-xl">
            <div class="flex flex-wrap items-center justify-between gap-3 bg-white/10 border border-white/15 px-5 py-3.5 rounded-2xl">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-lg">
                        ${sbState.playerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-bold text-sm sm:text-base">${sbState.playerName} <span class="text-xs font-normal text-blue-200">(${sbState.playerClass})</span></p>
                        <p class="text-xs text-emerald-300">Bank Soal Aktif: ${totalBankSoal} Soal • Poin otomatis masuk ke Statistik Reward</p>
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <button type="button" onclick="showManageTkaAnBankModal()"
                        class="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs font-bold">
                        🎯 Upload TKA & AN
                    </button>
                    <button type="button" onclick="showManageQuizBankModal()"
                        class="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold">
                        📚 Upload Soal DDC
                    </button>
                    <button type="button" onclick="toggleSmartBoardFullscreen()"
                        class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold">
                        ⛶ Fullscreen TV
                    </button>
                    <button type="button" onclick="exitSmartBoardSession()"
                        class="px-3 py-2 rounded-xl bg-red-500/80 hover:bg-red-600 text-xs font-bold">
                        Ganti Pemain
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <button type="button" onclick="switchSmartBoardTab('tka_an')"
                    class="py-3.5 px-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all ${sbState.activeTab === 'tka_an' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'}">
                    🎯 Latihan TKA & AN
                </button>
                <button type="button" onclick="switchSmartBoardTab('quiz')"
                    class="py-3.5 px-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all ${sbState.activeTab === 'quiz' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'}">
                    🧠 Kuis Berburu Buku DDC
                </button>
                <button type="button" onclick="switchSmartBoardTab('wheel')"
                    class="py-3.5 px-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all ${sbState.activeTab === 'wheel' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'}">
                    🎡 Roda Misi Rak Buku
                </button>
                <button type="button" onclick="switchSmartBoardTab('ebooks')"
                    class="py-3.5 px-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all ${sbState.activeTab === 'ebooks' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'}">
                    📖 Baca E-Book Layar 75"
                </button>
            </div>

            ${activeGameHtml}
        </div>
    `;
}

// =========================================================================
// HANDLER SESI & PERMAINAN
// =========================================================================
async function startSmartBoardSession(event) {
    event.preventDefault();
    const rawName = document.getElementById('sbPlayerNameInput')?.value.trim();
    if (!rawName) return;

    const members = getRecordsByType('member');
    const matched = members.find(m => (m.memberName || m.name || '').trim().toLowerCase() === rawName.toLowerCase());

    sbState.playerName = matched ? (matched.memberName || matched.name) : rawName;
    sbState.playerClass = matched ? (matched.memberClass || matched.role || 'Pengunjung') : 'Pengunjung';
    sbState.quizScore = 0;
    sbState.answeredCount = 0;
    rebuildShuffledTkaDeck('ALL');
    rebuildShuffledQuizDeck('ALL');

    if (typeof autoCheckInVisitorReading === 'function') {
        await autoCheckInVisitorReading(sbState.playerName, 'Latihan TKA/AN & Gamifikasi Smart Board 75"');
    }

    showToast(`Selamat datang ${sbState.playerName}! Selamat berlatih TKA, AN & literasi buku.`, "success");
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
    sbState.quizAnswered = false;
    sbState.selectedOption = null;
    renderCurrentSection();
}

function changeSmartBoardTkaFilter(examType) {
    rebuildShuffledTkaDeck(examType);
    renderCurrentSection();
}

function changeSmartBoardDdcFilter(ddcCode) {
    rebuildShuffledQuizDeck(ddcCode);
    renderCurrentSection();
}

function toggleOfflineBookHint() {
    sbState.showOfflineHint = !sbState.showOfflineHint;
    renderCurrentSection();
}

async function answerSmartBoardTka(optionIdx) {
    if (sbState.quizAnswered) return;
    const q = sbState.tkaDeck[sbState.tkaPointer % sbState.tkaDeck.length];
    sbState.quizAnswered = true;
    sbState.selectedOption = optionIdx;
    sbState.answeredCount += 1;

    if (optionIdx === q.answer) {
        sbState.quizScore += 20;
        await recordGamificationActivity(`Latihan ${q.badge} Smart Board (+20 pt)`);
    }
    renderCurrentSection();
}

function nextSmartBoardTka() {
    sbState.tkaPointer += 1;
    if (sbState.tkaPointer >= sbState.tkaDeck.length) {
        rebuildShuffledTkaDeck(sbState.selectedTkaFilter);
    } else {
        sbState.quizAnswered = false;
        sbState.selectedOption = null;
    }
    renderCurrentSection();
}

async function answerSmartBoardQuiz(optionIdx) {
    if (sbState.quizAnswered) return;
    const q = sbState.quizDeck[sbState.deckPointer % sbState.quizDeck.length];
    sbState.quizAnswered = true;
    sbState.selectedOption = optionIdx;
    sbState.answeredCount += 1;

    if (optionIdx === q.answer) {
        sbState.quizScore += 15;
        await recordGamificationActivity(`Kuis DDC ${q.ddcCode} (${q.domain}) Smart Board (+15 pt)`);
    }
    renderCurrentSection();
}

function nextSmartBoardQuiz() {
    sbState.deckPointer += 1;
    if (sbState.deckPointer >= sbState.quizDeck.length) {
        rebuildShuffledQuizDeck(sbState.selectedDdcFilter);
    } else {
        sbState.quizAnswered = false;
        sbState.selectedOption = null;
        sbState.showOfflineHint = false;
    }
    renderCurrentSection();
}

function spinSmartBoardChallenge() {
    const randomIdx = Math.floor(Math.random() * SMARTBOARD_CHALLENGES.length);
    sbState.spunChallenge = SMARTBOARD_CHALLENGES[randomIdx];
    renderCurrentSection();
}

async function claimSmartBoardChallengePoints(points, title) {
    await recordGamificationActivity(`Misi Buku Smart Board: ${title} (+${points} pt)`);
    showToast(`Hebat! +${points} Poin Reward dicatat untuk ${sbState.playerName}!`, "success");
    sbState.spunChallenge = null;
    renderCurrentSection();
}

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

// =========================================================================
// 3. UPLOAD & KELOLA BANK SOAL TKA & AN (EXCEL + INPUT MANUAL + PEMBAHASAN)
// =========================================================================
function showManageTkaAnBankModal() {
    const customTka = getRecordsByType('tka_an_bank');
    const totalTka = getAllTkaAnQuestions().length;

    const rowsHtml = customTka.slice(0, 30).map((q, i) => `
        <tr class="border-b hover:bg-gray-50 text-xs">
            <td class="p-2.5 text-center text-gray-500">${i + 1}</td>
            <td class="p-2.5 font-bold text-indigo-700 whitespace-nowrap">${q.tkaExamType || 'AN_LITERASI'}</td>
            <td class="p-2.5 text-gray-800">
                <div class="line-clamp-1 font-semibold">${q.tkaQuestion}</div>
                <div class="text-[11px] text-emerald-700 line-clamp-1">Pembahasan: ${q.tkaExplanation || '-'}</div>
            </td>
            <td class="p-2.5 text-center">
                <button type="button" onclick="deleteCustomTkaQuestion('${q.__backendId || q.id}')"
                    class="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-semibold">Hapus</button>
            </td>
        </tr>
    `).join('');

    const html = `
        <div class="space-y-4">
            <div class="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-950 space-y-2">
                <p><strong>Total Bank Soal TKA & AN: ${totalTka} soal HOTS</strong> (${DEFAULT_TKA_AN_BANK.length} soal bawaan + ${customTka.length} soal unggahan sekolah).</p>
                <div class="flex flex-wrap items-center gap-2 pt-1">
                    <button type="button" onclick="downloadTkaAnTemplateExcel()"
                        class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">
                        📥 Download Template Excel TKA & AN
                    </button>
                    <label class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer">
                        📤 Upload File Excel TKA & AN (.xlsx)
                        <input type="file" accept=".xlsx,.xls" onchange="handleImportTkaAnExcel(event)" class="hidden">
                    </label>
                </div>
            </div>

            <form onsubmit="saveSingleTkaAnQuestion(event)" class="p-3.5 border rounded-xl bg-gray-50/70 space-y-2.5">
                <p class="text-xs font-bold text-gray-800">+ Tambah 1 Soal Latihan TKA / AN Baru</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select id="newTkaExamType" class="p-2 border rounded-lg text-xs bg-white font-semibold">
                        <option value="AN_LITERASI">AN • AKM Literasi Membaca</option>
                        <option value="AN_NUMERASI">AN • AKM Numerasi</option>
                        <option value="TKA_PENALARAN">TKA • Penalaran Umum & Kuantitatif</option>
                        <option value="TKA_AKADEMIK">TKA • Penalaran Saintek & Soshum</option>
                    </select>
                    <select id="newTkaAnswer" class="p-2 border rounded-lg text-xs bg-white font-semibold">
                        <option value="0">Kunci Jawaban: A</option>
                        <option value="1">Kunci Jawaban: B</option>
                        <option value="2">Kunci Jawaban: C</option>
                        <option value="3">Kunci Jawaban: D</option>
                    </select>
                </div>
                <textarea id="newTkaStimulus" rows="2" placeholder="Teks Bacaan / Data Stimulus Soal..."
                    class="w-full p-2 border rounded-lg text-xs bg-white"></textarea>
                <input type="text" id="newTkaQuestion" required placeholder="Tulis pertanyaan HOTS..."
                    class="w-full p-2 border rounded-lg text-xs bg-white">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input type="text" id="newTkaOptA" required placeholder="Opsi A" class="p-2 border rounded-lg text-xs bg-white">
                    <input type="text" id="newTkaOptB" required placeholder="Opsi B" class="p-2 border rounded-lg text-xs bg-white">
                    <input type="text" id="newTkaOptC" required placeholder="Opsi C" class="p-2 border rounded-lg text-xs bg-white">
                    <input type="text" id="newTkaOptD" required placeholder="Opsi D" class="p-2 border rounded-lg text-xs bg-white">
                </div>
                <textarea id="newTkaExplanation" rows="2" required placeholder="Tulis pembahasan lengkap langkah penyelesaian / alasan kunci jawaban..."
                    class="w-full p-2 border rounded-lg text-xs bg-white"></textarea>
                <div class="flex justify-end">
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold">
                        Simpan Soal & Pembahasan
                    </button>
                </div>
            </form>

            <div class="max-h-48 overflow-y-auto border rounded-xl">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-100 text-gray-600 text-[11px] uppercase border-b sticky top-0">
                        <tr>
                            <th class="p-2.5 text-center w-10">No</th>
                            <th class="p-2.5 w-32">Klaster</th>
                            <th class="p-2.5">Pertanyaan & Pembahasan</th>
                            <th class="p-2.5 text-center w-20">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml || `<tr><td colspan="4" class="p-4 text-center text-xs text-gray-400">Belum ada soal TKA/AN tambahan yang diunggah.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    openModal("Bank Soal Latihan TKA & Asesmen Nasional (AN)", html, "max-w-3xl");
}

function downloadTkaAnTemplateExcel() {
    const sampleRows = [
        {
            'Jenis_Tes': 'AN_LITERASI',
            'Teks_Stimulus': 'Grafik produksi padi nasional menunjukkan peningkatan 4,2% pada musim tanam pertama berkat irigasi modern.',
            'Pertanyaan': 'Faktor utama yang mendorong kenaikan produksi padi berdasarkan bacaan adalah...',
            'Opsi_A': 'Penerapan sistem irigasi modern',
            'Opsi_B': 'Penurunan luas lahan pertanian',
            'Opsi_C': 'Impor beras dari luar negeri',
            'Opsi_D': 'Perubahan musim kemarau panjang',
            'Kunci_Jawaban': 'A',
            'Pembahasan': 'Pada kalimat pertama teks dijelaskan secara langsung bahwa peningkatan 4,2% terjadi berkat penerapan irigasi modern.'
        }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template TKA dan AN");
    XLSX.writeFile(wb, "Template_Bank_Soal_TKA_dan_AN.xlsx");
    showToast("Template Excel TKA & AN berhasil diunduh!", "success");
}

async function handleImportTkaAnExcel(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);

            if (!rows || rows.length === 0) {
                showToast("File Excel kosong.", "error");
                return;
            }

            const keyMap = { A: 0, B: 1, C: 2, D: 3 };
            const badgeMap = {
                AN_LITERASI: 'AN • AKM Literasi Membaca',
                AN_NUMERASI: 'AN • AKM Numerasi',
                TKA_PENALARAN: 'TKA • Penalaran Umum & Kuantitatif',
                TKA_AKADEMIK: 'TKA • Penalaran Saintek & Soshum'
            };
            let importedCount = 0;

            for (const row of rows) {
                const question = String(row['Pertanyaan'] || row['pertanyaan'] || '').trim();
                const optA = String(row['Opsi_A'] || row['opsi_a'] || '').trim();
                const optB = String(row['Opsi_B'] || row['opsi_b'] || '').trim();
                if (!question || !optA || !optB) continue;

                const rawType = String(row['Jenis_Tes'] || 'AN_LITERASI').trim().toUpperCase();
                const examType = badgeMap[rawType] ? rawType : 'AN_LITERASI';
                const rawKey = String(row['Kunci_Jawaban'] || 'A').trim().toUpperCase();

                const newTka = {
                    type: 'tka_an_bank',
                    tkaExamType: examType,
                    tkaBadge: badgeMap[examType],
                    tkaStimulus: String(row['Teks_Stimulus'] || '').trim(),
                    tkaQuestion: question,
                    tkaOptionA: optA,
                    tkaOptionB: optB,
                    tkaOptionC: String(row['Opsi_C'] || '-').trim(),
                    tkaOptionD: String(row['Opsi_D'] || '-').trim(),
                    tkaAnswerIndex: keyMap[rawKey] !== undefined ? keyMap[rawKey] : 0,
                    tkaExplanation: String(row['Pembahasan'] || 'Jawaban sesuai analisis bacaan/perhitungan.').trim(),
                    timestamp: new Date().toISOString()
                };

                if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
                    const res = await window.dataSdk.sendData('create', newTka);
                    if (res && res.__backendId) newTka.__backendId = res.__backendId;
                }
                appState.allRecords.push(newTka);
                importedCount++;
            }

            rebuildShuffledTkaDeck(sbState.selectedTkaFilter);
            showToast(`Berhasil mengunggah ${importedCount} soal TKA & AN beserta pembahasannya!`, "success");
            showManageTkaAnBankModal();
            renderCurrentSection();
        } catch (err) {
            console.error(err);
            showToast("Gagal membaca file Excel TKA & AN.", "error");
        }
    };
    reader.readAsArrayBuffer(file);
}

async function saveSingleTkaAnQuestion(event) {
    event.preventDefault();
    const examType = document.getElementById('newTkaExamType').value;
    const badgeMap = {
        AN_LITERASI: 'AN • AKM Literasi Membaca',
        AN_NUMERASI: 'AN • AKM Numerasi',
        TKA_PENALARAN: 'TKA • Penalaran Umum & Kuantitatif',
        TKA_AKADEMIK: 'TKA • Penalaran Saintek & Soshum'
    };

    const newTka = {
        type: 'tka_an_bank',
        tkaExamType: examType,
        tkaBadge: badgeMap[examType] || 'TKA & AN',
        tkaStimulus: document.getElementById('newTkaStimulus').value.trim(),
        tkaQuestion: document.getElementById('newTkaQuestion').value.trim(),
        tkaOptionA: document.getElementById('newTkaOptA').value.trim(),
        tkaOptionB: document.getElementById('newTkaOptB').value.trim(),
        tkaOptionC: document.getElementById('newTkaOptC').value.trim(),
        tkaOptionD: document.getElementById('newTkaOptD').value.trim(),
        tkaAnswerIndex: Number(document.getElementById('newTkaAnswer').value),
        tkaExplanation: document.getElementById('newTkaExplanation').value.trim(),
        timestamp: new Date().toISOString()
    };

    if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
        const res = await window.dataSdk.sendData('create', newTka);
        if (res && res.__backendId) newTka.__backendId = res.__backendId;
    }
    appState.allRecords.push(newTka);
    rebuildShuffledTkaDeck(sbState.selectedTkaFilter);
    showToast("Soal TKA & AN berhasil ditambahkan!", "success");
    showManageTkaAnBankModal();
    renderCurrentSection();
}

async function deleteCustomTkaQuestion(backendId) {
    const q = appState.allRecords.find(r => r.type === 'tka_an_bank' && (r.__backendId === backendId || r.id === backendId));
    if (!q || !confirm("Hapus soal TKA/AN ini?")) return;

    if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
        await window.dataSdk.sendData('delete', q);
    }
    appState.allRecords = appState.allRecords.filter(r => r !== q);
    rebuildShuffledTkaDeck(sbState.selectedTkaFilter);
    showToast("Soal TKA/AN dihapus.", "success");
    showManageTkaAnBankModal();
    renderCurrentSection();
}

// =========================================================================
// 4. UPLOAD & KELOLA BANK SOAL BUKU DDC (EXCEL + INPUT MANUAL + PEMBAHASAN)
// =========================================================================
function showManageQuizBankModal() {
    const customQuestions = getRecordsByType('quiz_bank');
    const totalAll = getAllSmartBoardQuestions().length;

    const listRows = customQuestions.slice(0, 30).map((q, i) => `
        <tr class="border-b hover:bg-gray-50 text-xs">
            <td class="p-2.5 text-center text-gray-500">${i + 1}</td>
            <td class="p-2.5 font-mono font-bold text-blue-700">${q.quizDdcCode || '000'}</td>
            <td class="p-2.5 text-gray-800">
                <div class="font-semibold line-clamp-1">${q.quizQuestion}</div>
                <div class="text-[11px] text-emerald-700 line-clamp-1">Pembahasan: ${q.quizExplanation || '-'}</div>
            </td>
            <td class="p-2.5 text-gray-600">${q.quizBookClue || '-'}</td>
            <td class="p-2.5 text-center">
                <button type="button" onclick="deleteCustomQuizQuestion('${q.__backendId || q.id}')"
                    class="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-semibold">Hapus</button>
            </td>
        </tr>
    `).join('');

    const html = `
        <div class="space-y-4">
            <div class="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-2">
                <p><strong>Total Bank Soal Buku DDC: ${totalAll} soal</strong> (${DEFAULT_SMARTBOARD_QUIZ_BANK.length} soal bawaan + ${customQuestions.length} soal unggahan sekolah).</p>
                <div class="flex flex-wrap items-center gap-2 pt-1">
                    <button type="button" onclick="downloadQuizBankTemplateExcel()"
                        class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">
                        📥 Download Template Excel Soal DDC
                    </button>
                    <label class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer">
                        📤 Upload File Excel (.xlsx)
                        <input type="file" accept=".xlsx,.xls" onchange="handleImportQuizBankExcel(event)" class="hidden">
                    </label>
                </div>
            </div>

            <form onsubmit="saveSingleQuizQuestion(event)" class="p-3.5 border rounded-xl bg-gray-50/70 space-y-2.5">
                <p class="text-xs font-bold text-gray-800">+ Tambah Soal Berburu Buku Satuan (DDC 000–900)</p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <select id="newQuizDdc" class="p-2 border rounded-lg text-xs bg-white">
                        <option value="000">000 - Karya Umum & Komputer</option>
                        <option value="100">100 - Filsafat & Psikologi</option>
                        <option value="200">200 - Agama</option>
                        <option value="300">300 - Ilmu Sosial & Ekonomi</option>
                        <option value="400">400 - Bahasa</option>
                        <option value="500" selected>500 - Sains & Matematika</option>
                        <option value="600">600 - Teknologi & Terapan</option>
                        <option value="700">700 - Seni & Olahraga</option>
                        <option value="800">800 - Sastra & Fiksi</option>
                        <option value="900">900 - Geografi & Sejarah</option>
                    </select>
                    <select id="newQuizDomain" class="p-2 border rounded-lg text-xs bg-white">
                        <option value="Literasi">Ranah: Literasi</option>
                        <option value="Numerasi">Ranah: Numerasi</option>
                    </select>
                    <select id="newQuizAnswer" class="p-2 border rounded-lg text-xs bg-white">
                        <option value="0">Kunci Jawaban: A</option>
                        <option value="1">Kunci Jawaban: B</option>
                        <option value="2">Kunci Jawaban: C</option>
                        <option value="3">Kunci Jawaban: D</option>
                    </select>
                </div>
                <input type="text" id="newQuizQuestion" required placeholder="Tulis pertanyaan soal..."
                    class="w-full p-2 border rounded-lg text-xs bg-white">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input type="text" id="newQuizOptA" required placeholder="Opsi A" class="p-2 border rounded-lg text-xs bg-white">
                    <input type="text" id="newQuizOptB" required placeholder="Opsi B" class="p-2 border rounded-lg text-xs bg-white">
                    <input type="text" id="newQuizOptC" required placeholder="Opsi C" class="p-2 border rounded-lg text-xs bg-white">
                    <input type="text" id="newQuizOptD" required placeholder="Opsi D" class="p-2 border rounded-lg text-xs bg-white">
                </div>
                <input type="text" id="newQuizClue" required placeholder="Petunjuk Buku Offline (misal: Buka Buku Biologi Kelas XI di Rak 500)"
                    class="w-full p-2 border rounded-lg text-xs bg-white">
                <textarea id="newQuizExplanation" rows="2" required placeholder="Tulis pembahasan lengkap jawaban & referensi halaman/bab buku..."
                    class="w-full p-2 border rounded-lg text-xs bg-white"></textarea>
                <div class="flex justify-end">
                    <button type="submit" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold">
                        Simpan Soal & Pembahasan
                    </button>
                </div>
            </form>

            <div class="max-h-48 overflow-y-auto border rounded-xl">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-100 text-gray-600 text-[11px] uppercase border-b sticky top-0">
                        <tr>
                            <th class="p-2.5 text-center w-10">No</th>
                            <th class="p-2.5 w-16">DDC</th>
                            <th class="p-2.5">Pertanyaan & Pembahasan</th>
                            <th class="p-2.5">Petunjuk Buku</th>
                            <th class="p-2.5 text-center w-20">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${listRows || `<tr><td colspan="5" class="p-4 text-center text-xs text-gray-400">Belum ada soal tambahan yang diunggah.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    openModal("Upload & Kelola Bank Soal Buku DDC", html, "max-w-3xl");
}

function downloadQuizBankTemplateExcel() {
    const sampleRows = [
        {
            'Kode_DDC': '500',
            'Ranah': 'Numerasi',
            'Pertanyaan': 'Berapa jumlah kromosom normal pada sel tubuh manusia?',
            'Opsi_A': '23 buah',
            'Opsi_B': '44 buah',
            'Opsi_C': '46 buah',
            'Opsi_D': '48 buah',
            'Kunci_Jawaban': 'C',
            'Petunjuk_Buku_Offline': 'Cari di Buku Biologi SMA Kelas XII di Rak 500 bab Genetika.',
            'Pembahasan': 'Sel somatik (sel tubuh) manusia bersifat diploid (2n) yang terdiri atas 23 pasang atau total 46 buah kromosom.'
        }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Soal DDC");
    XLSX.writeFile(wb, "Template_Bank_Soal_Buku_DDC.xlsx");
    showToast("Template Excel Soal DDC berhasil diunduh!", "success");
}

async function handleImportQuizBankExcel(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);

            if (!rows || rows.length === 0) {
                showToast("File Excel kosong.", "error");
                return;
            }

            const keyMap = { A: 0, B: 1, C: 2, D: 3 };
            let importedCount = 0;

            for (const row of rows) {
                const question = String(row['Pertanyaan'] || row['pertanyaan'] || '').trim();
                const optA = String(row['Opsi_A'] || row['opsi_a'] || '').trim();
                const optB = String(row['Opsi_B'] || row['opsi_b'] || '').trim();
                if (!question || !optA || !optB) continue;

                const rawKey = String(row['Kunci_Jawaban'] || 'A').trim().toUpperCase();
                const clueText = String(row['Petunjuk_Buku_Offline'] || 'Cari jawaban di rak buku sesuai kode DDC.').trim();
                const newQuiz = {
                    type: 'quiz_bank',
                    quizDdcCode: String(row['Kode_DDC'] || '000').trim(),
                    quizDomain: String(row['Ranah'] || 'Literasi').trim(),
                    quizQuestion: question,
                    quizOptionA: optA,
                    quizOptionB: optB,
                    quizOptionC: String(row['Opsi_C'] || '-').trim(),
                    quizOptionD: String(row['Opsi_D'] || '-').trim(),
                    quizAnswerIndex: keyMap[rawKey] !== undefined ? keyMap[rawKey] : 0,
                    quizBookClue: clueText,
                    quizExplanation: String(row['Pembahasan'] || clueText).trim(),
                    timestamp: new Date().toISOString()
                };

                if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
                    const res = await window.dataSdk.sendData('create', newQuiz);
                    if (res && res.__backendId) newQuiz.__backendId = res.__backendId;
                }
                appState.allRecords.push(newQuiz);
                importedCount++;
            }

            rebuildShuffledQuizDeck(sbState.selectedDdcFilter);
            showToast(`Berhasil mengunggah ${importedCount} soal DDC beserta pembahasannya!`, "success");
            showManageQuizBankModal();
            renderCurrentSection();
        } catch (err) {
            console.error(err);
            showToast("Gagal membaca file Excel.", "error");
        }
    };
    reader.readAsArrayBuffer(file);
}

async function saveSingleQuizQuestion(event) {
    event.preventDefault();
    const newQuiz = {
        type: 'quiz_bank',
        quizDdcCode: document.getElementById('newQuizDdc').value,
        quizDomain: document.getElementById('newQuizDomain').value,
        quizQuestion: document.getElementById('newQuizQuestion').value.trim(),
        quizOptionA: document.getElementById('newQuizOptA').value.trim(),
        quizOptionB: document.getElementById('newQuizOptB').value.trim(),
        quizOptionC: document.getElementById('newQuizOptC').value.trim(),
        quizOptionD: document.getElementById('newQuizOptD').value.trim(),
        quizAnswerIndex: Number(document.getElementById('newQuizAnswer').value),
        quizBookClue: document.getElementById('newQuizClue').value.trim(),
        quizExplanation: document.getElementById('newQuizExplanation').value.trim(),
        timestamp: new Date().toISOString()
    };

    if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
        const res = await window.dataSdk.sendData('create', newQuiz);
        if (res && res.__backendId) newQuiz.__backendId = res.__backendId;
    }
    appState.allRecords.push(newQuiz);
    rebuildShuffledQuizDeck(sbState.selectedDdcFilter);
    showToast("Soal DDC & pembahasannya berhasil ditambahkan!", "success");
    showManageQuizBankModal();
    renderCurrentSection();
}

async function deleteCustomQuizQuestion(backendId) {
    const q = appState.allRecords.find(r => r.type === 'quiz_bank' && (r.__backendId === backendId || r.id === backendId));
    if (!q || !confirm("Hapus soal ini?")) return;

    if (window.dataSdk && typeof window.dataSdk.sendData === 'function') {
        await window.dataSdk.sendData('delete', q);
    }
    appState.allRecords = appState.allRecords.filter(r => r !== q);
    rebuildShuffledQuizDeck(sbState.selectedDdcFilter);
    showToast("Soal dihapus.", "success");
    showManageQuizBankModal();
    renderCurrentSection();
}