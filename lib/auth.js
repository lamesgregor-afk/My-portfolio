import jwt from 'jsonwebtoken';

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d';
const COOKIE_NAME = 'portfolio_token';

/**
 * Create a signed JWT for a given user.
 * @param {{ id: number, email: string, name: string, is_admin: boolean }} user
 * @returns {string}
 */
export function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

/**
 * Verify and decode a JWT string.
 * @param {string} token
 * @returns {{ id, email, name, is_admin } | null}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract the JWT value from an HTTP cookie string.
 * @param {string} cookieHeader
 * @returns {string | null}
 */
export function getTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return match.split('=').slice(1).join('=').trim();
}

/**
 * Build a Set-Cookie header string that sets the JWT.
 * @param {string} token
 * @returns {string}
 */
export function buildSetCookie(token) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  return `${COOKIE_NAME}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax; Secure`;
}

/**
 * Build a Set-Cookie header that clears the JWT.
 * @returns {string}
 */
export function buildClearCookie() {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure`;
}
