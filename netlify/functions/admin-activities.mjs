import { randomBytes, randomUUID } from 'node:crypto';
import { getSql, json, wrap, getAdmin, sameOrigin, validateActivity, slugify, destroyImage } from '../lib/shared.mjs';

const BASE = '/api/admin/activities';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default wrap(async (req) => {
  if (!(await getAdmin(req))) return json({ error: 'Belum login.' }, 401);
  if (req.method !== 'GET' && !sameOrigin(req)) return json({ error: 'Forbidden' }, 403);

  const sql = getSql();
  const id = new URL(req.url).pathname.slice(BASE.length).replace(/^\//, '') || null;
  if (id && !UUID.test(id)) return json({ error: 'ID tidak valid.' }, 400);

  const imageInserts = (actId, images) =>
    images.map((im, i) => sql`insert into activity_images (activity_id, url, public_id, sort_order) values (${actId}, ${im.url}, ${im.public_id}, ${i})`);

  /* ----- Baca ----- */
  if (req.method === 'GET') {
    if (!id) {
      const items = await sql`
        select a.id, a.slug, a.title, a.category, a.is_published,
               to_char(a.event_date, 'YYYY-MM-DD') as event_date,
               (select count(*)::int from activity_images i where i.activity_id = a.id) as image_count,
               (select url from activity_images i where i.activity_id = a.id order by i.sort_order limit 1) as cover
        from activities a
        order by a.created_at desc`;
      return json({ items });
    }
    const [item] = await sql`
      select id, slug, title, category, summary, description, schedule_label, is_published,
             to_char(event_date, 'YYYY-MM-DD') as event_date
      from activities where id = ${id}`;
    if (!item) return json({ error: 'Aktivitas tidak ditemukan.' }, 404);
    item.images = await sql`select url, public_id from activity_images where activity_id = ${id} order by sort_order`;
    return json({ item });
  }

  /* ----- Buat ----- */
  if (req.method === 'POST' && !id) {
    const { errors, data } = validateActivity(await req.json().catch(() => ({})));
    if (errors.length) return json({ error: errors.join(' ') }, 400);

    let slug = slugify(data.title);
    const [dup] = await sql`select 1 from activities where slug = ${slug}`;
    if (dup) slug += '-' + randomBytes(2).toString('hex');

    const newId = randomUUID();
    await sql.transaction([
      sql`insert into activities (id, slug, title, category, summary, description, event_date, schedule_label, is_published)
          values (${newId}, ${slug}, ${data.title}, ${data.category}, ${data.summary}, ${data.description}, ${data.event_date}, ${data.schedule_label}, ${data.is_published})`,
      ...imageInserts(newId, data.images),
    ]);
    return json({ ok: true, id: newId, slug }, 201);
  }

  /* ----- Ubah ----- */
  if (req.method === 'PUT' && id) {
    const { errors, data } = validateActivity(await req.json().catch(() => ({})));
    if (errors.length) return json({ error: errors.join(' ') }, 400);

    const [exists] = await sql`select id from activities where id = ${id}`;
    if (!exists) return json({ error: 'Aktivitas tidak ditemukan.' }, 404);
    const oldImages = await sql`select public_id from activity_images where activity_id = ${id}`;

    await sql.transaction([
      sql`update activities set title = ${data.title}, category = ${data.category}, summary = ${data.summary},
          description = ${data.description}, event_date = ${data.event_date}, schedule_label = ${data.schedule_label},
          is_published = ${data.is_published}, updated_at = now() where id = ${id}`,
      sql`delete from activity_images where activity_id = ${id}`,
      ...imageInserts(id, data.images),
    ]);

    const keep = new Set(data.images.map((i) => i.public_id).filter(Boolean));
    await Promise.all(oldImages.filter((i) => i.public_id && !keep.has(i.public_id)).map((i) => destroyImage(i.public_id)));
    return json({ ok: true });
  }

  /* ----- Hapus ----- */
  if (req.method === 'DELETE' && id) {
    const images = await sql`select public_id from activity_images where activity_id = ${id}`;
    const deleted = await sql`delete from activities where id = ${id} returning id`;
    if (!deleted.length) return json({ error: 'Aktivitas tidak ditemukan.' }, 404);
    await Promise.all(images.map((i) => destroyImage(i.public_id)));
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, 405);
});

export const config = { path: ['/api/admin/activities', '/api/admin/activities/*'] };
