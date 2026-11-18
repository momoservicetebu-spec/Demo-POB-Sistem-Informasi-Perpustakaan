// JS/api.js

// URL dari index.html Anda sebelumnya
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwnRb6cqYz0yJ1oDzIHqwLZiSU77KCc1BJ8az07iA9xbjbti5m13q9EaY-veLwkah5f/exec'; 

window.dataSdk = {
    // 1. Mengambil seluruh data dari GAS
    fetchAll: async function() {
        try {
            const response = await fetch(SCRIPT_URL);
            const result = await response.json();
            
            // GAS biasanya mengembalikan data di dalam properti 'data'
            if (result.status === 'success' && result.data) {
                return result.data;
            } else if (Array.isArray(result)) {
                return result;
            }
            return [];
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            showToast("Gagal terhubung ke server", "error");
            return [];
        }
    },

    // 2. Mengirim data ke GAS (create / update / delete)
    sendData: async function(action, payload) {
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
            showToast("Gagal menyimpan data ke server", "error");
            return { success: false };
        }
    }
};