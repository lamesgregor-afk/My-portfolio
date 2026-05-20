// GET  /api/works — Public: returns all visible works
// POST /api/works — Admin only: create a new work

import sql from '../../lib/db.js';
import { requireAdmin, allowMethods } from '../../lib/middleware.js';

export default async function handler(req, res) {
  // ---------- GET ----------
  if (req.method === 'GET') {
    const works = await sql`
      SELECT id, title, description, technologies, image_urls, live_url, github_url, sort_order, created_at
      FROM works
      WHERE is_visible = TRUE
      ORDER BY sort_order ASC, created_at DESC
    `;
    return res.status(200).json(works);
  }

  // ---------- POST ----------
  if (req.method === 'POST') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const { title, description, technologies, image_urls, live_url, github_url, sort_order } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    const rows = await sql`
      INSERT INTO works (title, description, technologies, image_urls, live_url, github_url, sort_order)
      VALUES (
        ${title},
        ${description},
        ${technologies || []},
        ${image_urls   || []},
        ${live_url     || null},
        ${github_url   || null},
        ${sort_order   ?? 0}
      )
      RETURNING *
    `;

    return res.status(201).json(rows[0]);
  }

  allowMethods(req, res, ['GET', 'POST']);
}
