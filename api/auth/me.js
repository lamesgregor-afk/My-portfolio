// GET /api/auth/me
// Returns the currently logged-in user from the JWT cookie, or 401.

import { requireAuth, allowMethods } from '../../lib/middleware.js';

export default function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;

  const user = requireAuth(req, res);
  if (!user) return;

  res.status(200).json({
    id:        user.id,
    email:     user.email,
    name:      user.name,
    is_admin:  user.is_admin,
  });
}
