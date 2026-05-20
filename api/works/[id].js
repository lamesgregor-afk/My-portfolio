// GET    /api/works/:id — Public
// PUT    /api/works/:id — Admin only
// DELETE /api/works/:id — Admin only

import sql from '../../lib/db.js';
import { requireAdmin, allowMethods } from '../../lib/middleware.js';

export default async function handler(req, res) {
  const { id } = req.query;
  const numId = parseInt(id, 10);

  if (!numId || isNaN(numId)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  // ---------- GET ----------
  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM works WHERE id = ${numId} AND is_visible = TRUE`;
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(rows[0]);
  }

  // ---------- PUT ----------
  if (req.method === 'PUT') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const { title, description, technologies, image_urls, live_url, github_url, sort_order, is_visible } = req.body;

    const rows = await sql`
      UPDATE works SET
        title        = COALESCE(${title        ?? null}, title),
        description  = COALESCE(${description  ?? null}, description),
        technologies = COALESCE(${technologies ?? null}, technologies),
        image_urls   = COALESCE(${image_urls   ?? null}, image_urls),
        live_url     = COALESCE(${live_url     ?? null}, live_url),
        github_url   = COALESCE(${github_url   ?? null}, github_url),
        sort_order   = COALESCE(${sort_order   ?? null}, sort_order),
        is_visible   = COALESCE(${is_visible   ?? null}, is_visible),
        updated_at   = NOW()
      WHERE id = ${numId}
      RETURNING *
    `;

    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(rows[0]);
  }

  // ---------- DELETE ----------
  if (req.method === 'DELETE') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    await sql`DELETE FROM works WHERE id = ${numId}`;
    return res.status(200).json({ ok: true });
  }

  allowMethods(req, res, ['GET', 'PUT', 'DELETE']);
}
