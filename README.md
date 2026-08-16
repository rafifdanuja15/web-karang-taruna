# Website Profil Karang Taruna Purabhakti

Website profil resmi Karang Taruna Purabhakti, Pekon Purajaya — berisi profil organisasi, struktur pengurus, dan kontak. Dibangun sebagai single-page static site dari desain [Google Stitch](https://stitch.withgoogle.com/), siap di-deploy ke Netlify tanpa proses build.

## Struktur Proyek

```
.
├── index.html                       # Halaman utama (satu file, semua section)
├── netlify.toml                     # Konfigurasi deploy Netlify
├── DESIGN.md                        # Design tokens (warna & tipografi) hasil ekspor Stitch
├── logo.jpg                         # Logo organisasi
├── home-1.jpg / home-2.jpeg / home-3.jpg   # Gambar slider hero
├── ketua-rian-andrianti.png
├── wakil-ketua-ahmad-riski.png
├── sekretaris-awang-nugraha.png
├── bendahara-ahsanul-khatam.png
├── penasihat-samsu-kendar.png       # Foto pengurus (untuk section Struktur Organisasi)
├── wa.png / gmail.png / ig.png      # Ikon kontak
└── .gitignore
```

## Tech Stack

- HTML5 statis (single page, section: Beranda, Profil, Struktur, Kontak)
- [Tailwind CSS via CDN](https://tailwindcss.com/) (dikonfigurasi inline dengan design tokens kustom)
- Google Fonts: Hanken Grotesk & Material Symbols Outlined
- Vanilla JavaScript untuk slider hero, menu mobile, dan highlight navigasi aktif saat scroll

Tidak ada proses build (bundler/npm) — semua sudah jadi HTML/CSS/JS statis, cukup di-serve apa adanya.

## Menjalankan secara Lokal

Karena tidak ada dependency, cukup buka `index.html` langsung di browser, atau jalankan local server sederhana agar path relatif berjalan konsisten:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Deploy ke Netlify

### Opsi 1 — Drag & Drop (paling cepat)
1. Buka [app.netlify.com/drop](https://app.netlify.com/drop)
2. Seret seluruh folder proyek ini ke halaman tersebut
3. Situs langsung online dengan URL acak dari Netlify (bisa diganti nama di **Site settings > Domain management**)

### Opsi 2 — Deploy dari Git (disarankan untuk update berkelanjutan)
1. Push folder ini ke repository GitHub/GitLab/Bitbucket
2. Di Netlify dashboard, klik **Add new site > Import an existing project**
3. Hubungkan ke repository tersebut
4. Build settings akan otomatis terbaca dari `netlify.toml`:
   - **Build command:** (kosong, tidak diperlukan)
   - **Publish directory:** `.`
5. Klik **Deploy site**

### Opsi 3 — Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Kustomisasi

- **Warna & tipografi**: diatur di blok `tailwind.config` pada `<head>` `index.html`, mengikuti token dari `DESIGN.md`.
- **Konten teks** (profil, statistik, nama pengurus): edit langsung di section terkait pada `index.html` (`#profil`, `#struktur`).
- **Kontak**: nomor WhatsApp, email, dan Instagram ada di section `#kontak` — ganti link `href` sesuai kebutuhan.
- **Gambar**: ganti file dengan nama yang sama, atau ganti nama file lalu perbarui atribut `src` yang sesuai di `index.html`.

## Catatan

- Nama file gambar sudah dirapikan (tanpa spasi/koma) agar aman digunakan sebagai URL di semua hosting statis, termasuk Netlify.
- Repo asli dari hasil ekspor Google Stitch terhubung ke `github.com/rafifdanuja15/web-karang-taruna`.
