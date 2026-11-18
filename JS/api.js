// JS/api.js

// GANTI DENGAN URL DEPLOYMENT GOOGLE APPS SCRIPT ANDA
const SCRIPT_URL = 'MASUKKAN_URL_WEB_APP_GAS_ANDA_DI_SINI'; 

window.dataSdk = {
    // 1. Mengambil seluruh data dari GAS (Memanggil doGet)
    fetchAll: async function() {
        try {
            const response = await fetch(SCRIPT_URL);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            showToast("Gagal terhubung ke server", "error");
            return [];
        }
    },

    // 2. Mengirim data ke GAS (Memanggil doPost: create / update / delete)
    sendData: async function(action, payload) {
        try {
            // Berikan ID unik untuk backend jika belum ada
            if (action === 'create' && !payload.__backendId) {
                payload.__backendId = 'ID-' + Date.now();
            }

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                // Mode no-cors kadang diperlukan tergantung setup GAS, 
                // tapi coba tanpa no-cors dulu agar bisa baca balikan {success: true}
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