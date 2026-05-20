// GET  /api/reviews — Public: returns all reviews with author info
// POST /api/reviews — Authenticated: submit a new review

import sql from '../../lib/db.js';
import { requireAuth, getUser, allowMethods } from '../../lib/middleware.js';

export default async function handler(req, res) {
  // ---------- GET ----------
  if (req.method === 'GET') {
    const reviews = await sql`
      SELECT
        r.id,
        r.text,
        r.rating,
        r.created_at,
        u.name        AS author_name,
        u.avatar_url  AS author_avatar
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at DESC
    `;
    return res.status(200).json(reviews);
  }

  // ---------- POST ----------
  if (req.method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;

    const { text, rating } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'Review must be at least 10 characters' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check: one review per user
    const existing = await sql`SELECT id FROM reviews WHERE user_id = ${user.id}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You have already submitted a review' });
    }

    const rows = await sql`
      INSERT INTO reviews (user_id, text, rating)
      VALUES (${user.id}, ${text.trim()}, ${numRating})
      RETURNING *
    `;

    return res.status(201).json(rows[0]);
  }

  allowMethods(req, res, ['GET', 'POST']);
}
