// JS/api.js

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwnRb6cqYz0yJ1oDzIHqwLZiSU77KCc1BJ8az07iA9xbjbti5m13q9EaY-veLwkah5f/exec'; 

function getProcessLoadingLabel(action, payload) {
    const typeMap = {
        book: 'Data Buku',
        member: 'Data Anggota',
        loan: 'Transaksi Sirkulasi',
        visitor: 'Buku Tamu',
        user: 'Data Pengguna',
        setting: 'Pengaturan Sistem'
    };
    const entityName = (payload && payload.type && typeMap[payload.type]) ? typeMap[payload.type] : 'Data';

    if (action === 'create') return `Menyimpan ${entityName}...`;
    if (action === 'update') return `Memperbarui ${entityName}...`;
    if (action === 'delete') return `Menghapus ${entityName}...`;
    return `Memproses ${entityName}...`;
}

window.dataSdk = {
    // 1. Mengambil seluruh data dari GAS
    fetchAll: async function() {
        if (typeof showGlobalLoading === 'function') {
            showGlobalLoading('Memuat & menyinkronkan data...', 'Mengambil data terbaru dari server perpustakaan');
        }
        try {
            const response = await fetch(SCRIPT_URL);
            const result = await response.json();
            
            if (result.status === 'success' && result.data) {
                return result.data;
            } else if (Array.isArray(result)) {
                return result;
            }
            return [];
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            if (typeof showToast === 'function') {
                showToast("Gagal terhubung ke server", "error");
            }
            return [];
        } finally {
            if (typeof hideGlobalLoading === 'function') {
                hideGlobalLoading();
            }
        }
    },

    // 2. Mengirim data ke GAS (create / update / delete)
    sendData: async function(action, payload) {
        const loadingTitle = getProcessLoadingLabel(action, payload);
        if (typeof showGlobalLoading === 'function') {
            showGlobalLoading(loadingTitle, 'Sedang menyinkronkan ke Google Spreadsheet...');
        }

        try {
            if (action === 'create' && !payload.__backendId) {
                payload.__backendId = 'ID-' + Date.now();
            }

            // GAS membutuhkan request dikirim sebagai teks biasa untuk menghindari blokir CORS
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({
                    action: action,
                    payload: payload
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Gagal mengirim data:", error);
            if (typeof showToast === 'function') {
                showToast("Gagal menyimpan data ke server", "error");
            }
            return { success: false };
        } finally {
            if (typeof hideGlobalLoading === 'function') {
                hideGlobalLoading();
            }
        }
    }
};