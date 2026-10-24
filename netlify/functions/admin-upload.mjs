import { json, wrap, getAdmin, sameOrigin, uploadSignature } from '../lib/shared.mjs';

// Memberi tanda tangan sementara agar browser admin bisa upload langsung ke Cloudinary
export default wrap(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!(await getAdmin(req))) return json({ error: 'Belum login.' }, 401);
  if (!sameOrigin(req)) return json({ error: 'Forbidden' }, 403);
  return json(uploadSignature());
});

export const config = { path: '/api/admin/upload-signature' };
