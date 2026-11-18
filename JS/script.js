// JS/script.js

// 1. Konfigurasi & State (Status Aplikasi)
const defaultConfig = { 
    finePerDay: 1000, 
    maxLoanDays: 7 
};

let appState = {
    currentUser: window.loggedInUser || null,
    currentSection: 'dashboard',
    allRecords: [], // Data dari backend akan masuk ke sini
};

// 2. Fungsi Utilitas (Dipakai di mana-mana)

// Memfilter data berdasarkan jenisnya (buku, anggota, transaksi, dll)
function getRecordsByType(type) { 
    return appState.allRecords.filter(record => record.type === type);
}

// Menampilkan notifikasi popup di pojok layar
function showToast(message, type = 'success') { 
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
    toast.innerText = message;
    
    document.body.appendChild(toast);
    
    // Hilangkan setelah 3 detik
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Memformat tanggal ke bahasa Indonesia
function formatDate(dateString) { 
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
        day: '2-digit', month: 'short', year: 'numeric' 
    });
}

// Fitur pencarian tabel (bisa dipakai di tabel buku maupun anggota)
function filterTable(query, tbodyId) { 
    const term = query.toLowerCase();
    const rows = document.querySelectorAll(`#${tbodyId} tr`);
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// 3. Routing (Navigasi Antar Halaman)
function navigateTo(section) {
    appState.currentSection = section;
    renderCurrentSection(); // Memanggil fungsi di main.js untuk ganti tampilan konten
}

// Tambahkan di baris paling bawah JS/script.js

// 4. Sistem Modal (Popup)
function openModal(title, formContent) {
    // Hapus modal lama jika masih ada yang menyangkut
    const existingModal = document.getElementById('globalModal');
    if (existingModal) existingModal.remove();

    // Buat struktur HTML Modal baru
    const modalHtml = `
    <div id="globalModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden transform transition-all">
            <!-- Header Modal -->
            <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 class="text-lg font-bold text-gray-800">${title}</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-red-500 transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <!-- Isi Konten/Formulir -->
            <div class="p-6">
                ${formContent}
            </div>
        </div>
    </div>
    `;
    
    // Suntikkan modal ke dalam body halaman
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Render ulang icon untuk tombol silang (x)
    if (window.lucide) lucide.createIcons();
}

function closeModal() {
    const modal = document.getElementById('globalModal');
    if (modal) modal.remove();
}