// GET /api/auth/callback
// Google redirects here with ?code=...
// Exchanges code for tokens, upserts user in DB, sets JWT cookie.

import sql from '../../lib/db.js';
import { createToken, buildSetCookie } from '../../lib/auth.js';

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/?auth=error');
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
        grant_type:    'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error('No access token returned');

    // 2. Fetch user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile.email) throw new Error('No email in profile');

    // 3. Upsert user in database
    const isAdmin = profile.email === process.env.ADMIN_EMAIL;

    let rows;
    try {
      rows = await sql`
        INSERT INTO users (google_id, email, name, avatar_url, is_admin)
        VALUES (${profile.id}, ${profile.email}, ${profile.name || 'User'}, ${profile.picture || null}, ${isAdmin})
        ON CONFLICT (google_id) DO UPDATE
          SET name       = EXCLUDED.name,
              avatar_url = EXCLUDED.avatar_url,
              is_admin   = ${isAdmin}
        RETURNING id, email, name, avatar_url, is_admin
      `;
    } catch (dbErr) {
      console.error('Database error:', dbErr);
      throw dbErr;
    }

    const user = rows[0];

    // 4. Sign JWT and set cookie
    const token = createToken(user);
    res.setHeader('Set-Cookie', buildSetCookie(token));

    // 5. Redirect — always use the canonical domain
    const base = process.env.NEXT_PUBLIC_URL || `https://${req.headers.host}`;
    res.redirect(user.is_admin ? `${base}/admin` : `${base}/`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect('/?auth=error');
  }
}
