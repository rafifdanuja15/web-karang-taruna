/* Section "Aktivitas & Kegiatan" di index.html */
(async function () {
  const grid = document.getElementById('activities-grid');
  const moreBtn = document.getElementById('activities-more');
  if (!grid) return;
  const { esc, img, badge, api } = KT;
  const FIRST = 6;

  const card = (a) => `
    <a href="aktivitas.html?slug=${encodeURIComponent(a.slug)}" class="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col group">
      <div class="relative h-48 overflow-hidden bg-surface-container">
        <img src="${esc(img(a.cover, 600))}" alt="${esc(a.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <span class="absolute top-3 left-3 ${badge(a.category)} text-xs font-bold px-sm py-xs rounded-md shadow">${esc(a.category)}</span>
      </div>
      <div class="p-lg flex flex-col flex-grow justify-between gap-md">
        <div>
          <h3 class="text-primary font-bold text-xl mb-xs">${esc(a.title)}</h3>
          <p class="text-on-surface-variant text-sm leading-relaxed line-clamp-3">${esc(a.summary)}</p>
        </div>
        <div class="flex items-center justify-between text-xs text-outline pt-sm border-t border-outline-variant/30">
          <span class="flex items-center gap-xs"><span class="material-symbols-outlined text-base">calendar_today</span>${esc(a.event_date ? KT.date(a.event_date) : a.schedule_label || '')}</span>
          <span class="text-secondary font-bold group-hover:underline">Baca selengkapnya</span>
        </div>
      </div>
    </a>`;

  try {
    const { items } = await api('/api/activities?limit=50');
    if (!items.length) {
      grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">Belum ada aktivitas yang dipublikasikan.</p>';
      return;
    }
    grid.innerHTML = items.map((a, i) => card(a).replace('<a ', i >= FIRST ? '<a data-extra hidden ' : '<a ')).join('');
    if (items.length > FIRST && moreBtn) {
      moreBtn.hidden = false;
      moreBtn.addEventListener('click', () => {
        grid.querySelectorAll('[data-extra]').forEach((el) => el.removeAttribute('hidden'));
        moreBtn.hidden = true;
      });
    }
  } catch {
    grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">Aktivitas belum bisa dimuat. Muat ulang halaman beberapa saat lagi.</p>';
  }
})();
