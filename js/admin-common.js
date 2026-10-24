/* Dipakai admin.html & admin-edit.html: cek login, logout, toast */
(function () {
  KT.toast = function (msg, type = 'ok') {
    const box = document.getElementById('toast');
    box.textContent = msg;
    box.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-lg py-sm rounded-full shadow-lg text-sm font-bold ' +
      (type === 'error' ? 'bg-error text-on-error' : 'bg-primary text-on-primary');
    clearTimeout(box._t);
    box._t = setTimeout(() => box.classList.add('hidden'), 4000);
  };

  // Mengembalikan data admin; jika belum login, arahkan ke halaman login
  KT.guard = async function () {
    try {
      const { admin } = await KT.api('/api/auth/me');
      document.getElementById('who').textContent = admin.username;
      document.getElementById('logout').addEventListener('click', async () => {
        await KT.api('/api/auth/logout', { method: 'POST' }).catch(() => {});
        location.href = 'login.html';
      });
      const flash = sessionStorage.getItem('kt_toast');
      if (flash) { sessionStorage.removeItem('kt_toast'); KT.toast(flash); }
      return admin;
    } catch {
      location.replace('login.html');
      return null;
    }
  };
})();
