// JS/cetakkartu.js

// 1. Fungsi Cetak 1 Anggota (Berdasarkan ID)
function cetakKartu(memberId) {
  const members = getRecordsByType('member');
  const member = members.find(m => m.__backendId === memberId || m.id === memberId);
  
  if (!member) {
    showToast('Data anggota tidak ditemukan!', 'error');
    return;
  }

  const nama = member.memberName || member.name || 'Anggota';
  generatePrintWindow([member], `Cetak Kartu Anggota - ${nama}`);
}

// 2. Fungsi Cetak SEMUA Anggota
function cetakSemuaKartu() {
  const members = getRecordsByType('member');
  
  if (!members || members.length === 0) {
    showToast('Belum ada data anggota yang bisa dicetak!', 'error');
    return;
  }

  generatePrintWindow(members, 'Cetak Semua Kartu Anggota');
}

// 3. Fungsi Inti untuk Generate HTML dan Membuka Print Window
function generatePrintWindow(membersArray, title) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('Pop-up diblokir browser. Izinkan pop-up untuk mencetak kartu.', 'warning');
    return;
  }

  const libName = (typeof defaultConfig !== 'undefined' && defaultConfig.libraryName) ? defaultConfig.libraryName.toUpperCase() : 'PERPUSTAKAAN';
  
  let cardsHtml = '';
  membersArray.forEach(member => {
    const nama = member.memberName || member.name || '-';
    const kelas = member.memberClass || member.role || '-';
    const telepon = member.memberPhone || member.phone || member.contact || '-';
    const tglDaftar = typeof formatDate === 'function' ? formatDate(member.timestamp) : (member.timestamp || '-');
    const rawId = member.memberCode || member.__backendId || member.id || 'MEMBER';
    const shortId = rawId.toString().replace(/^ID[-_]/, '').substring(0, 12).toUpperCase();

    cardsHtml += `
      <div class="member-card">
        <div class="card-header">
          <h2>KARTU ANGGOTA ${libName}</h2>
          <p>Kartu ini harap dibawa saat meminjam buku</p>
        </div>
        <div class="card-content">
          <div><strong>Nama Lengkap</strong> : ${nama}</div>
          <div><strong>Kelas / Peran</strong> : ${kelas}</div>
          <div><strong>No. Telepon</strong> : ${telepon}</div>
          <div><strong>Tgl. Daftar</strong> : ${tglDaftar}</div>
        </div>
        <div class="card-footer">
          ID: ${shortId}
        </div>
      </div>
    `;
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link rel="stylesheet" href="CSS/style.css">
    </head>
    <body class="print-body">
      <div class="cards-wrapper">
        ${cardsHtml}
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
          }, 800);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}