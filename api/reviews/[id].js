// DELETE /api/reviews/:id — Admin only

import sql from '../../lib/db.js';
import { requireAdmin, allowMethods } from '../../lib/middleware.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['DELETE'])) return;

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  const numId = parseInt(id, 10);

  if (!numId || isNaN(numId)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  await sql`DELETE FROM reviews WHERE id = ${numId}`;
  res.status(200).json({ ok: true });
}
