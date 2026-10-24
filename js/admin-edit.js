/* admin-edit.html: tambah / edit aktivitas + upload gambar ke Cloudinary */
(async function () {
  if (!(await KT.guard())) return;
  const { api, esc, img, toast } = KT;
  const $ = (id) => document.getElementById(id);
  const id = new URLSearchParams(location.search).get('id');
  const MAX_IMAGES = 12;
  let images = []; // { url, public_id, preview?, uploading?, failed? }

  $('category').innerHTML = KT.CATS.map((c) => `<option>${esc(c)}</option>`).join('');
  const count = () => ($('summary-count').textContent = `${$('summary').value.length}/300`);
  $('summary').addEventListener('input', count);

  if (id) {
    $('page-title').textContent = 'Edit aktivitas';
    try {
      const { item } = await api(`/api/admin/activities/${id}`);
      for (const k of ['title', 'category', 'summary', 'description', 'event_date', 'schedule_label']) $(k).value = item[k] ?? '';
      $('is_published').checked = item.is_published;
      images = item.images.map((i) => ({ url: i.url, public_id: i.public_id }));
    } catch (e) {
      sessionStorage.setItem('kt_toast', e.message);
      return (location.href = 'admin.html');
    }
  }
  count();

  /* ----- Galeri ----- */
  function render() {
    $('count').textContent = `${images.length}/${MAX_IMAGES}`;
    $('gallery').innerHTML = images.map((im, i) => {
      const src = im.preview || img(im.url, 300);
      const btn = 'w-8 h-8 rounded-full bg-white/90 text-primary flex items-center justify-center shadow hover:bg-white disabled:opacity-30';
      return `<div class="relative aspect-square rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-secondary' : 'border-outline-variant/50'} bg-surface-container">
        <img src="${esc(src)}" alt="Foto ${i + 1}" class="w-full h-full object-cover ${im.uploading || im.failed ? 'opacity-40' : ''}">
        ${i === 0 ? '<span class="absolute top-2 left-2 bg-secondary text-on-secondary text-xs font-bold px-sm py-xs rounded-md">Sampul</span>' : ''}
        ${im.uploading ? '<span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">Mengunggah…</span>' : ''}
        ${im.failed ? '<span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-error">Gagal</span>' : ''}
        <div class="absolute bottom-2 inset-x-2 flex justify-between gap-1">
          <button type="button" class="${btn}" data-act="left" data-i="${i}" title="Geser ke kiri" ${i === 0 ? 'disabled' : ''}><span class="material-symbols-outlined text-lg">chevron_left</span></button>
          ${i > 0 && im.url ? `<button type="button" class="${btn} !w-auto px-sm text-xs font-bold" data-act="cover" data-i="${i}">Jadikan sampul</button>` : ''}
          <button type="button" class="${btn}" data-act="right" data-i="${i}" title="Geser ke kanan" ${i === images.length - 1 ? 'disabled' : ''}><span class="material-symbols-outlined text-lg">chevron_right</span></button>
        </div>
        <button type="button" class="${btn} absolute top-2 right-2 !text-error" data-act="del" data-i="${i}" title="Hapus gambar"><span class="material-symbols-outlined text-lg">close</span></button>
      </div>`;
    }).join('');
  }
  $('gallery').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const i = +b.dataset.i, act = b.dataset.act;
    if (act === 'del') images.splice(i, 1);
    if (act === 'cover') images.unshift(images.splice(i, 1)[0]);
    if (act === 'left' && i > 0) [images[i - 1], images[i]] = [images[i], images[i - 1]];
    if (act === 'right' && i < images.length - 1) [images[i + 1], images[i]] = [images[i], images[i + 1]];
    render();
  });

  /* ----- Upload ----- */
  async function compress(file) {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const toBlob = (type) => new Promise((r) => c.toBlob(r, type, 0.85));
    let blob = await toBlob('image/webp');
    if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg');
    return blob;
  }

  async function upload(file, item) {
    try {
      const blob = await compress(file);
      const sig = await api('/api/admin/upload-signature', { method: 'POST' });
      const fd = new FormData();
      fd.append('file', blob, blob.type === 'image/webp' ? 'foto.webp' : 'foto.jpg');
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', sig.timestamp);
      fd.append('folder', sig.folder);
      fd.append('signature', sig.signature);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Upload ditolak');
      item.url = data.secure_url;
      item.public_id = data.public_id;
      delete item.preview;
    } catch (e) {
      item.failed = true;
      toast(`Gagal mengunggah gambar: ${e.message}`, 'error');
    }
    item.uploading = false;
    render();
  }

  $('files').addEventListener('change', (e) => {
    for (const f of e.target.files) {
      if (images.length >= MAX_IMAGES) { toast(`Maksimal ${MAX_IMAGES} gambar.`, 'error'); break; }
      if (!f.type.startsWith('image/')) { toast(`${f.name} bukan file gambar.`, 'error'); continue; }
      if (f.size > 25 * 1024 * 1024) { toast(`${f.name} terlalu besar (maks 25 MB).`, 'error'); continue; }
      const item = { uploading: true, preview: URL.createObjectURL(f) };
      images.push(item);
      upload(f, item);
    }
    e.target.value = '';
    render();
  });

  /* ----- Simpan ----- */
  $('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (images.some((i) => i.uploading)) return toast('Tunggu sampai semua gambar selesai diunggah.', 'error');
    const ready = images.filter((i) => i.url);
    if (!ready.length && !confirm('Aktivitas ini belum punya gambar. Tetap simpan?')) return;

    const body = { is_published: $('is_published').checked, images: ready.map((i) => ({ url: i.url, public_id: i.public_id || null })) };
    for (const k of ['title', 'category', 'summary', 'description', 'event_date', 'schedule_label']) body[k] = $(k).value;

    $('save').disabled = true;
    $('save').textContent = 'Menyimpan…';
    try {
      await api(id ? `/api/admin/activities/${id}` : '/api/admin/activities', { method: id ? 'PUT' : 'POST', body });
      sessionStorage.setItem('kt_toast', 'Aktivitas disimpan.');
      location.href = 'admin.html';
    } catch (err) {
      if (err.status === 401) return location.replace('login.html');
      toast(err.message, 'error');
      $('save').disabled = false;
      $('save').textContent = 'Simpan aktivitas';
    }
  });
  render();
})();
