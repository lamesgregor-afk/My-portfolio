import { verifyToken, getTokenFromCookieHeader } from './auth.js';

/**
 * Get the authenticated user from a request.
 * Returns null if not authenticated.
 * @param {import('@vercel/node').VercelRequest} req
 */
export function getUser(req) {
  const token = getTokenFromCookieHeader(req.headers.cookie || '');
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Require a logged-in user. Sends 401 and returns false if not authenticated.
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 * @returns {{ id, email, name, is_admin } | false}
 */
export function requireAuth(req, res) {
  const user = getUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }
  return user;
}

/**
 * Require admin privileges. Sends 401/403 and returns false otherwise.
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 * @returns {{ id, email, name, is_admin } | false}
 */
export function requireAdmin(req, res) {
  const user = getUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }
  if (!user.is_admin) {
    res.status(403).json({ error: 'Admin access required' });
    return false;
  }
  return user;
}

/**
 * Allow only specific HTTP methods. Sends 405 otherwise.
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 * @param {string[]} methods
 * @returns {boolean}
 */
export function allowMethods(req, res, methods) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '));
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return false;
  }
  return true;
}
