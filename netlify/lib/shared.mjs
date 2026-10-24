import { neon } from '@neondatabase/serverless';
import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'node:crypto';

export const CATEGORIES = [
  'Sosial & Lingkungan',
  'Pemberdayaan Desa',
  'Pemuda & Olahraga',
  'Pendidikan',
  'Seni & Budaya',
  'Lainnya',
];

/* ---------- Umum ---------- */
let _sql;
export const getSql = () => (_sql ??= neon(process.env.DATABASE_URL));

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

export const wrap = (fn) => async (req, ctx) => {
  try {
    return await fn(req, ctx);
  } catch (e) {
    console.error(e);
    return json({ error: 'Terjadi kesalahan di server.' }, 500);
  }
};

// Tolak request tulis dari origin lain (perlindungan CSRF tambahan di atas SameSite=Strict)
export const sameOrigin = (req) => {
  const origin = req.headers.get('origin');
  return !origin || new URL(origin).host === new URL(req.url).host;
};

/* ---------- Sesi login ---------- */
const COOKIE = 'kt_session';
const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error('JWT_SECRET belum diisi / terlalu pendek');
  return new TextEncoder().encode(s);
};

export const signSession = (admin, seconds) =>
  new SignJWT({ u: admin.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(admin.id))
    .setIssuedAt()
    .setExpirationTime(`${seconds}s`)
    .sign(secret());

export const cookieHeader = (req, token, maxAge) => {
  const secure = new URL(req.url).protocol === 'https:';
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}${
    maxAge != null ? `; Max-Age=${maxAge}` : ''
  }`;
};

export async function getAdmin(req) {
  const m = (req.headers.get('cookie') || '').match(/(?:^|;\s*)kt_session=([^;]+)/);
  if (!m) return null;
  try {
    const { payload } = await jwtVerify(m[1], secret());
    return { id: payload.sub, username: payload.u };
  } catch {
    return null;
  }
}

/* ---------- Cloudinary ---------- */
const sha1 = (s) => createHash('sha1').update(s).digest('hex');
const cloud = () => ({
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET,
});

export function uploadSignature() {
  const c = cloud();
  if (!c.name || !c.key || !c.secret) throw new Error('Variabel CLOUDINARY_* belum diisi');
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'karang-taruna/aktivitas';
  return {
    cloudName: c.name,
    apiKey: c.key,
    timestamp,
    folder,
    signature: sha1(`folder=${folder}&timestamp=${timestamp}${c.secret}`),
  };
}

// Hapus gambar di Cloudinary (best effort, kegagalan tidak menghentikan proses)
export async function destroyImage(publicId) {
  const c = cloud();
  if (!publicId || !c.name) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: c.key,
    signature: sha1(`public_id=${publicId}&timestamp=${timestamp}${c.secret}`),
  });
  try {
    await fetch(`https://api.cloudinary.com/v1_1/${c.name}/image/destroy`, { method: 'POST', body });
  } catch (e) {
    console.error('Gagal hapus gambar Cloudinary', publicId, e);
  }
}

/* ---------- Validasi aktivitas ---------- */
export const slugify = (t) =>
  t.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'aktivitas';

const LOCAL_IMG = /^[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i; // gambar bawaan di repo
const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function validateActivity(b) {
  const errors = [];
  const title = str(b.title);
  const summary = str(b.summary);
  const description = typeof b.description === 'string' ? b.description.replace(/\r\n/g, '\n').trim() : '';
  const event_date = str(b.event_date) || null;
  const schedule_label = str(b.schedule_label).slice(0, 60) || null;

  if (title.length < 3 || title.length > 150) errors.push('Judul harus 3–150 karakter.');
  if (!CATEGORIES.includes(b.category)) errors.push('Kategori tidak valid.');
  if (summary.length < 1 || summary.length > 300) errors.push('Ringkasan wajib diisi (maks 300 karakter).');
  if (description.length > 10000) errors.push('Deskripsi terlalu panjang (maks 10.000 karakter).');
  if (event_date && !/^\d{4}-\d{2}-\d{2}$/.test(event_date)) errors.push('Format tanggal tidak valid.');

  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
  const images = [];
  if (!Array.isArray(b.images)) errors.push('Data gambar tidak valid.');
  else if (b.images.length > 12) errors.push('Maksimal 12 gambar per aktivitas.');
  else {
    for (const im of b.images) {
      const url = str(im?.url);
      if (!(url.startsWith(prefix) || LOCAL_IMG.test(url))) { errors.push('Ada gambar dengan URL tidak valid.'); break; }
      images.push({ url, public_id: str(im?.public_id) || null });
    }
  }
  return {
    errors,
    data: { title, category: b.category, summary, description, event_date, schedule_label, is_published: b.is_published !== false, images },
  };
}
