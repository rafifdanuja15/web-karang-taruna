import { getSql, json, wrap } from '../lib/shared.mjs';

// Endpoint publik: hanya aktivitas yang sudah diterbitkan
export default wrap(async (req) => {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const sql = getSql();
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/activities\/?/, '').split('/').filter(Boolean);

  if (!parts.length) {
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 50);
    const items = await sql`
      select a.slug, a.title, a.category, a.summary, a.schedule_label,
             to_char(a.event_date, 'YYYY-MM-DD') as event_date,
             (select url from activity_images i where i.activity_id = a.id order by i.sort_order limit 1) as cover
      from activities a
      where a.is_published
      order by coalesce(a.event_date, a.created_at::date) desc, a.created_at desc
      limit ${limit}`;
    return json({ items });
  }

  const slug = decodeURIComponent(parts[0]);
  const [item] = await sql`
    select id, slug, title, category, summary, description, schedule_label,
           to_char(event_date, 'YYYY-MM-DD') as event_date,
           to_char(updated_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD') as updated_at
    from activities where slug = ${slug} and is_published`;
  if (!item) return json({ error: 'Aktivitas tidak ditemukan.' }, 404);

  const images = await sql`select url from activity_images where activity_id = ${item.id} order by sort_order`;
  const others = await sql`
    select a.slug, a.title, a.category,
           (select url from activity_images i where i.activity_id = a.id order by i.sort_order limit 1) as cover
    from activities a
    where a.is_published and a.id <> ${item.id}
    order by coalesce(a.event_date, a.created_at::date) desc, a.created_at desc
    limit 3`;
  delete item.id;
  return json({ item: { ...item, images: images.map((i) => i.url) }, others });
});

export const config = { path: ['/api/activities', '/api/activities/*'] };
