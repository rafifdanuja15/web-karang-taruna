import bcrypt from 'bcryptjs';
import { getSql, json, wrap, sameOrigin, signSession, cookieHeader, getAdmin } from '../lib/shared.mjs';

const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10); // supaya waktu respons sama walau username tidak ada
const MAX_ATTEMPTS = 5;

export default wrap(async (req, ctx) => {
  const action = new URL(req.url).pathname.split('/').pop();

  if (action === 'me') {
    const admin = await getAdmin(req);
    return admin ? json({ admin }) : json({ error: 'Belum login.' }, 401);
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);

  if (action === 'logout') return json({ ok: true }, 200, { 'set-cookie': cookieHeader(req, '', 0) });

  if (action === 'login') {
    const sql = getSql();
    const ip = ctx?.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown';

    const [{ n }] = await sql`select count(*)::int as n from login_attempts where ip = ${ip} and created_at > now() - interval '15 minutes'`;
    if (n >= MAX_ATTEMPTS) return json({ error: 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.' }, 429);

    const { username, password, remember } = await req.json().catch(() => ({}));
    const [admin] = username
      ? await sql`select id, username, password_hash from admins where lower(username) = lower(${String(username).trim()})`
      : [];
    const ok = await bcrypt.compare(String(password || ''), admin?.password_hash || DUMMY_HASH);

    if (!admin || !ok) {
      await sql`insert into login_attempts (ip) values (${ip})`;
      return json({ error: 'Username atau kata sandi salah.' }, 401);
    }
    await sql`delete from login_attempts where ip = ${ip} or created_at < now() - interval '1 day'`;

    const age = remember ? 30 * 86400 : 12 * 3600;
    const token = await signSession(admin, age);
    // "Ingat saya" = cookie bertahan 30 hari; tanpa itu cookie hilang saat browser ditutup
    return json({ ok: true, admin: { username: admin.username } }, 200, { 'set-cookie': cookieHeader(req, token, remember ? age : null) });
  }
  return json({ error: 'Not found' }, 404);
});

export const config = { path: ['/api/auth/login', '/api/auth/logout', '/api/auth/me'] };
