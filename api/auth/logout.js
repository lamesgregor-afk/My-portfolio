// POST /api/auth/logout
// Clears the JWT cookie.

import { buildClearCookie } from '../../lib/auth.js';
import { allowMethods } from '../../lib/middleware.js';

export default function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  res.setHeader('Set-Cookie', buildClearCookie());
  res.status(200).json({ ok: true });
}
