// Membuat tabel, akun admin, dan (jika tabel aktivitas kosong) 3 aktivitas awal.
// Aman dijalankan berulang: `npm run db:setup`. Menjalankan ulang akan mereset password admin sesuai .env.
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';

const { DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error('Isi DATABASE_URL, ADMIN_USERNAME, dan ADMIN_PASSWORD di file .env');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 8) {
  console.error('ADMIN_PASSWORD minimal 8 karakter');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
  .split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
for (const stmt of schema.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) {
  await sql.query(stmt);
}
console.log('✔ Tabel siap');

const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
await sql.query(
  `insert into admins (username, password_hash) values ($1, $2)
   on conflict (username) do update set password_hash = excluded.password_hash`,
  [ADMIN_USERNAME.trim(), hash]
);
console.log(`✔ Akun admin "${ADMIN_USERNAME.trim()}" siap`);

const [{ n }] = await sql`select count(*)::int as n from activities`;
if (n === 0) {
  const seeds = [
    {
      slug: 'gotong-royong-kebersihan-pekon',
      title: 'Gotong Royong Kebersihan Pekon',
      category: 'Sosial & Lingkungan',
      summary: 'Aksi kerja bakti pemuda bersama masyarakat dalam menjaga kelestarian, kebersihan lingkungan pemukiman, dan fasilitas umum pekon.',
      description: [
        'Karang Taruna Purabhakti Pekon Purajaya kembali menggelar aksi gotong royong kebersihan lingkungan dan pembersihan saluran air utama di sepanjang jalur protokol desa. Kegiatan rutin ini dilaksanakan dalam rangka menjaga kebersihan lingkungan serta mengantisipasi potensi banjir saat musim penghujan.',
        'Sebanyak 30 anggota pemuda terdata bersama masyarakat dari 6 Pemangku bahu-membahu membersihkan rumput liar, sampah plastik, serta merapikan pepohonan di tepi jalan. Diharapkan aksi ini menjadi pemicu kesadaran kolektif dalam mewujudkan Pekon Purajaya yang asri, bersih, dan sehat.',
        '> Semangat gotong royong adalah warisan utama yang harus terus dirawat oleh generasi muda Pekon Purajaya demi kemajuan desa tercinta.',
        'Selain pembersihan fasilitas umum, kegiatan juga dilanjutkan dengan penanaman puluhan bibit pohon pelindung di area sekitar pemukiman untuk mendukung program penghijauan desa secara berkelanjutan.',
      ].join('\n\n'),
      event_date: '2026-10-18',
      schedule_label: 'Rutin Bulanan',
      images: ['home-1.jpg', 'home-2.jpeg', 'home-3.jpg'],
    },
    {
      slug: 'pengembangan-potensi-lokal-wisata',
      title: 'Pengembangan Potensi Lokal & Wisata',
      category: 'Pemberdayaan Desa',
      summary: 'Pemetaan serta promosi destinasi wisata lokal dan UMKM Pekon Purajaya untuk menggerakkan roda perekonomian pemuda dan warga.',
      description: 'Pemetaan serta promosi destinasi wisata lokal dan UMKM Pekon Purajaya untuk menggerakkan roda perekonomian pemuda dan warga.',
      event_date: null,
      schedule_label: 'Program Berkelanjutan',
      images: ['home-2.jpeg'],
    },
    {
      slug: 'turnamen-olahraga-seni-budaya',
      title: 'Turnamen Olahraga & Seni Budaya',
      category: 'Pemuda & Olahraga',
      summary: 'Penyelenggaraan kompetisi olahraga antarpemangku serta pentas seni budaya untuk mempererat keakraban antar pemuda desa.',
      description: 'Penyelenggaraan kompetisi olahraga antarpemangku serta pentas seni budaya untuk mempererat keakraban antar pemuda desa.',
      event_date: null,
      schedule_label: 'Peringatan Hari Besar',
      images: ['home-3.jpg'],
    },
  ];
  for (const s of seeds) {
    const [row] = await sql.query(
      `insert into activities (slug, title, category, summary, description, event_date, schedule_label, is_published)
       values ($1,$2,$3,$4,$5,$6,$7,true) returning id`,
      [s.slug, s.title, s.category, s.summary, s.description, s.event_date, s.schedule_label]
    );
    for (const [i, url] of s.images.entries()) {
      await sql.query(`insert into activity_images (activity_id, url, sort_order) values ($1,$2,$3)`, [row.id, url, i]);
    }
  }
  console.log('✔ 3 aktivitas awal dimasukkan');
}
console.log('Selesai.');
