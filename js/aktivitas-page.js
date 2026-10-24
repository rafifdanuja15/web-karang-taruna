/* Halaman detail aktivitas: aktivitas.html?slug=... */
(async function () {
  const root = document.getElementById('content');
  const crumb = document.getElementById('crumb-title');
  const { esc, img, badge, api, date, paragraphs } = KT;
  const slug = new URLSearchParams(location.search).get('slug');

  const fail = (msg) => {
    root.innerHTML = `<div class="text-center py-xxl flex flex-col items-center gap-md">
      <span class="material-symbols-outlined text-5xl text-outline">search_off</span>
      <p class="text-on-surface-variant">${esc(msg)}</p>
      <a href="index.html#aktivitas" class="bg-primary text-on-primary px-lg py-sm rounded-full font-bold">Lihat semua aktivitas</a></div>`;
  };
  if (!slug) return fail('Aktivitas tidak ditemukan.');

  let data;
  try {
    data = await api(`/api/activities/${encodeURIComponent(slug)}`);
  } catch (e) {
    return fail(e.status === 404 ? 'Aktivitas tidak ditemukan atau belum dipublikasikan.' : 'Aktivitas belum bisa dimuat. Coba lagi nanti.');
  }
  const a = data.item;
  document.title = `${a.title} - Karang Taruna Purabhakti`;
  crumb.textContent = a.title;

  const imgs = a.images.length ? a.images : [''];
  const thumbs = imgs.length > 1
    ? `<div class="grid grid-cols-4 gap-sm">${imgs.map((u, i) => `
        <button type="button" data-i="${i}" class="thumb h-20 rounded-xl overflow-hidden border-2 ${i ? 'border-transparent opacity-80' : 'border-primary'} hover:opacity-100 focus:outline-none focus-visible:ring-2 ring-primary transition-all">
          <img src="${esc(img(u, 240))}" alt="Foto ${i + 1}" loading="lazy" class="w-full h-full object-cover"></button>`).join('')}</div>` : '';

  const others = data.others.length ? `
    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-md">
      <h3 class="text-primary font-bold text-lg border-b border-outline-variant/30 pb-sm flex items-center gap-xs"><span class="material-symbols-outlined text-secondary">grid_view</span><span>Aktivitas Lainnya</span></h3>
      <div class="flex flex-col gap-md">${data.others.map((o, i) => `
        <a href="aktivitas.html?slug=${encodeURIComponent(o.slug)}" class="flex items-center gap-md group ${i ? 'border-t border-outline-variant/20 pt-md' : ''}">
          <img src="${esc(img(o.cover, 160))}" alt="" loading="lazy" class="w-16 h-16 rounded-xl object-cover shrink-0">
          <div class="flex flex-col"><span class="text-xs text-secondary font-bold">${esc(o.category)}</span>
          <h4 class="text-primary text-sm font-bold group-hover:text-secondary transition-colors line-clamp-2">${esc(o.title)}</h4></div></a>`).join('')}</div>
    </div>` : '';

  const when = a.event_date ? date(a.event_date) : a.schedule_label;

  root.innerHTML = `
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-xl items-start">
    <article class="lg:col-span-2 flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <div class="flex items-center gap-sm flex-wrap">
          <span class="${badge(a.category)} text-xs font-bold px-md py-xs rounded-full">${esc(a.category)}</span>
          ${when ? `<span class="text-xs text-outline flex items-center gap-xs"><span class="material-symbols-outlined text-base">event</span>${esc(when)}</span>` : ''}
        </div>
        <h1 class="text-primary text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">${esc(a.title)}</h1>
      </div>
      <div class="flex flex-col gap-sm">
        <div class="w-full h-72 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden shadow-md border border-outline-variant/40 bg-surface-container">
          <img id="main-image" src="${esc(img(imgs[0], 1200))}" alt="${esc(a.title)}" class="w-full h-full object-cover">
        </div>
        ${thumbs}
      </div>
      <div class="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-md text-on-surface-variant leading-relaxed text-base md:text-lg">
        <h2 class="text-primary text-xl font-bold flex items-center gap-xs"><span class="material-symbols-outlined text-secondary">description</span><span>Deskripsi Kegiatan</span></h2>
        ${paragraphs(a.description) || `<p>${esc(a.summary)}</p>`}
      </div>
    </article>
    <aside class="flex flex-col gap-lg">
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-md">
        <h3 class="text-primary font-bold text-lg border-b border-outline-variant/30 pb-sm flex items-center gap-xs"><span class="material-symbols-outlined text-secondary">group</span><span>Penanggung Jawab</span></h3>
        <div class="flex items-center gap-md">
          <img src="ketua-rian-andrianti.png" alt="Ketua Karang Taruna" class="w-14 h-14 rounded-full object-cover border-2 border-secondary shrink-0">
          <div class="flex flex-col"><span class="text-primary font-bold">Rian Andrianti</span><span class="text-xs text-secondary font-semibold uppercase">Ketua Karang Taruna</span></div>
        </div>
        <a href="index.html#kontak" class="w-full bg-secondary text-on-secondary text-center py-sm rounded-full text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-xs"><span class="material-symbols-outlined text-base">mail</span><span>Hubungi Pengurus</span></a>
      </div>
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-md">
        <h3 class="text-primary font-bold text-lg border-b border-outline-variant/30 pb-sm flex items-center gap-xs"><span class="material-symbols-outlined text-secondary">share</span><span>Bagikan Aktivitas</span></h3>
        <div class="grid grid-cols-2 gap-sm">
          <a href="https://wa.me/?text=${encodeURIComponent(a.title + ' - ' + location.href)}" target="_blank" rel="noopener" class="bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-xs hover:opacity-90"><span class="material-symbols-outlined text-base">chat</span><span>WhatsApp</span></a>
          <button id="copy-btn" type="button" class="bg-surface-container border border-outline-variant text-primary p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-xs hover:bg-surface-container-high"><span class="material-symbols-outlined text-base">link</span><span id="copy-text">Salin Tautan</span></button>
        </div>
      </div>
      ${others}
    </aside>
  </div>`;

  const main = document.getElementById('main-image');
  root.querySelectorAll('.thumb').forEach((b) =>
    b.addEventListener('click', () => {
      main.src = img(imgs[b.dataset.i], 1200);
      root.querySelectorAll('.thumb').forEach((t) => {
        const on = t === b;
        t.classList.toggle('border-primary', on);
        t.classList.toggle('border-transparent', !on);
        t.classList.toggle('opacity-80', !on);
      });
    })
  );
  document.getElementById('copy-btn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); } catch { return; }
    const t = document.getElementById('copy-text');
    t.textContent = 'Tersalin!';
    setTimeout(() => (t.textContent = 'Salin Tautan'), 2000);
  });
})();
