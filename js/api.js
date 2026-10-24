/* Helper bersama untuk halaman publik & admin */
(function () {
  const CATS = ['Sosial & Lingkungan', 'Pemberdayaan Desa', 'Pemuda & Olahraga', 'Pendidikan', 'Seni & Budaya', 'Lainnya'];
  const BADGE = {
    'Sosial & Lingkungan': 'bg-primary text-on-primary',
    'Pemberdayaan Desa': 'bg-secondary text-on-secondary',
    'Pemuda & Olahraga': 'bg-tertiary-container text-on-tertiary-container',
  };

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  async function api(path, { method = 'GET', body } = {}) {
    const res = await fetch(path, {
      method,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Terjadi kesalahan. Coba lagi.');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // Gambar Cloudinary dikecilkan & dioptimasi otomatis; gambar bawaan repo dipakai apa adanya
  const img = (url, w = 800) =>
    url && url.startsWith('https://res.cloudinary.com/')
      ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`)
      : url || 'logo.jpg';

  const date = (s) => {
    if (!s) return '';
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Deskripsi teks biasa -> HTML aman. Baris kosong = paragraf baru; awali "> " untuk kutipan.
  const paragraphs = (text) =>
    String(text || '')
      .split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
      .map((p) =>
        p.startsWith('>')
          ? `<blockquote class="border-l-4 border-secondary pl-md my-sm italic text-primary bg-surface-container-low p-md rounded-r-xl">${esc(p.replace(/^>\s?/gm, '')).replace(/\n/g, '<br>')}</blockquote>`
          : `<p>${esc(p).replace(/\n/g, '<br>')}</p>`
      ).join('');

  window.KT = { CATS, esc, api, img, date, paragraphs, badge: (c) => BADGE[c] || 'bg-primary-container text-on-primary' };
})();
