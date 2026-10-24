# Website Karang Taruna Purabhakti + Admin Aktivitas

Website profil Karang Taruna Purabhakti, Pekon Purajaya. Pengurus bisa menambah/mengubah/menghapus aktivitas lewat halaman admin tanpa coding: cukup isi detail dan upload foto.

**Stack:** HTML statis + Tailwind CDN · Netlify Functions (backend) · [Neon](https://neon.tech) Postgres (data) · [Cloudinary](https://cloudinary.com) (foto).

## Struktur

```
index.html, aktivitas.html      Halaman publik (aktivitas diambil dari database)
login.html                      Login admin
admin.html, admin-edit.html     Daftar aktivitas & form tambah/edit
js/                             api.js (helper), home-activities.js, aktivitas-page.js, admin*.js
netlify/functions/              auth, activities (publik), admin-activities, admin-upload
netlify/lib/shared.mjs          Koneksi DB, sesi login, validasi, helper Cloudinary
db/schema.sql                   Skema tabel
scripts/setup.mjs               Membuat tabel + akun admin + 3 aktivitas awal
```

## Setup (sekali saja)

1. **Neon:** buat project, salin *connection string* (pilih **Pooled connection**) → `DATABASE_URL`.
2. **Cloudinary:** daftar paket Free, salin Cloud name, API Key, API Secret dari *Settings → API Keys*.
3. Salin `.env.example` menjadi `.env`, lalu isi semuanya. Buat `JWT_SECRET` dengan:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   Isi juga `ADMIN_USERNAME` dan `ADMIN_PASSWORD` (min. 8 karakter) untuk akun admin pertama.
4. Jalankan:
   ```bash
   npm install
   npm run db:setup      # buat tabel, akun admin, dan 3 aktivitas awal
   npx netlify-cli dev   # buka http://localhost:8888
   ```

Jalankan `npm run db:setup` lagi kapan pun untuk mengganti password admin (sesuai isi `.env`).

## Deploy ke Netlify

Drag & drop **tidak bisa** dipakai lagi (Functions butuh build). Gunakan deploy dari Git:

1. Push folder ini ke GitHub/GitLab (file `.env` otomatis diabaikan oleh `.gitignore`).
2. Netlify → *Add new site → Import an existing project*. Pengaturan build terbaca dari `netlify.toml`.
3. *Site configuration → Environment variables*: isi `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. Deploy. (`ADMIN_*` hanya dipakai di komputer lokal saat `db:setup`; database-nya sama dengan produksi.)

## Cara pakai admin

1. Buka `/login.html` (atau tombol **Login Admin** di website) dan masuk.
2. **Tambah aktivitas** → isi judul, kategori, tanggal, ringkasan, deskripsi → pilih foto (boleh banyak) → **Simpan aktivitas**.
3. Foto pertama jadi sampul. Gunakan panah untuk mengatur urutan atau **Jadikan sampul**.
4. Hilangkan centang **Tampilkan di website** untuk menyimpan sebagai draf.
5. Deskripsi: pisahkan paragraf dengan satu baris kosong; awali paragraf dengan `>` untuk kutipan.

Foto otomatis dikecilkan (maks 1600 px, WebP) di browser sebelum diunggah, dan Cloudinary mengoptimasinya saat ditampilkan.

## Keamanan & catatan

- Password disimpan sebagai hash bcrypt; sesi memakai cookie `HttpOnly` + `SameSite=Strict`; login dibatasi 5 percobaan gagal per 15 menit per IP.
- Semua endpoint admin memeriksa sesi di server. Halaman `admin.html` yang terbuka tanpa login tidak menampilkan data apa pun.
- Isi aktivitas selalu di-escape saat ditampilkan (tidak ada HTML mentah dari admin).
- Foto yang diunggah lalu tidak jadi disimpan (halaman ditutup sebelum klik Simpan) tertinggal di Cloudinary; bersihkan sesekali dari dashboard Cloudinary folder `karang-taruna/aktivitas`.
- Preview link (WhatsApp, Google) untuk halaman detail aktivitas memakai judul/gambar umum, karena halaman detail dirender di browser.
- Menambah akun admin lain: jalankan `db:setup` dengan `ADMIN_USERNAME` berbeda.
- Kategori diatur di `netlify/lib/shared.mjs` dan `js/api.js` (ubah di kedua file).
