/* admin.html: daftar aktivitas */
(async function () {
  if (!(await KT.guard())) return;
  const { api, esc, img, date, badge, toast } = KT;
  const list = document.getElementById('list');

  const row = (a) => `
    <div class="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-md flex flex-col sm:flex-row sm:items-center gap-md" data-id="${esc(a.id)}">
      <img src="${esc(img(a.cover, 200))}" alt="" class="w-full sm:w-24 h-32 sm:h-20 rounded-xl object-cover bg-surface-container shrink-0">
      <div class="flex-grow min-w-0">
        <div class="flex items-center gap-sm flex-wrap mb-xs">
          <span class="${badge(a.category)} text-xs font-bold px-sm py-xs rounded-md">${esc(a.category)}</span>
          <span class="text-xs font-bold px-sm py-xs rounded-md ${a.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container-high text-on-surface-variant'}">${a.is_published ? 'Terbit' : 'Draf'}</span>
        </div>
        <h3 class="text-primary font-bold truncate">${esc(a.title)}</h3>
        <p class="text-xs text-outline">${esc(a.event_date ? date(a.event_date) : 'Tanggal belum diisi')} · ${a.image_count} gambar</p>
      </div>
      <div class="flex gap-sm shrink-0">
        ${a.is_published ? `<a href="aktivitas.html?slug=${encodeURIComponent(a.slug)}" target="_blank" class="px-md py-sm rounded-full text-sm font-bold text-on-surface-variant border border-outline-variant hover:bg-surface-container">Lihat</a>` : ''}
        <a href="admin-edit.html?id=${encodeURIComponent(a.id)}" class="px-md py-sm rounded-full text-sm font-bold bg-primary text-on-primary hover:bg-primary-container">Edit</a>
        <button type="button" data-del="${esc(a.id)}" data-title="${esc(a.title)}" class="px-md py-sm rounded-full text-sm font-bold text-error border border-error/30 hover:bg-error-container">Hapus</button>
      </div>
    </div>`;

  async function load() {
    try {
      const { items } = await api('/api/admin/activities');
      list.innerHTML = items.length
        ? items.map(row).join('')
        : `<div class="text-center py-xxl flex flex-col items-center gap-md border-2 border-dashed border-outline-variant rounded-2xl">
             <span class="material-symbols-outlined text-5xl text-outline">add_photo_alternate</span>
             <p class="text-on-surface-variant">Belum ada aktivitas. Tambahkan yang pertama.</p>
             <a href="admin-edit.html" class="bg-secondary text-on-secondary px-lg py-sm rounded-full font-bold">Tambah aktivitas</a></div>`;
    } catch (e) {
      if (e.status === 401) return location.replace('login.html');
      list.innerHTML = `<p class="text-center text-error">${esc(e.message)}</p>`;
    }
  }

  list.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    if (!confirm(`Hapus "${btn.dataset.title}"?\nSemua gambarnya ikut terhapus dan tidak bisa dikembalikan.`)) return;
    btn.disabled = true;
    try {
      await api(`/api/admin/activities/${btn.dataset.del}`, { method: 'DELETE' });
      toast('Aktivitas dihapus.');
      load();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
  load();
})();
