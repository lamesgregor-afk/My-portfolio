// POST /api/contact
// Sends a contact message via Resend email API.
// Setup: sign up at resend.com, get API key, add RESEND_API_KEY to Vercel env vars.

import { allowMethods } from '../../lib/middleware.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  const { name, email, message } = req.body;

  // Validate
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message is too short' });
  }

  // If no Resend key, log to console (useful during dev)
  if (!process.env.RESEND_API_KEY) {
    console.log('[Contact form]', { name, email, message });
    return res.status(200).json({ ok: true });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:     'Portfolio Contact <onboarding@resend.dev>',
        to:       [process.env.ADMIN_EMAIL || 'lamesgregor@gmail.com'],
        subject:  `Portfolio: new message from ${escHtml(name)}`,
        reply_to: email,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;color:#111">
            <h2 style="color:#6c63ff;margin-top:0">New message from your portfolio</h2>
            <p><strong>Name:</strong> ${escHtml(name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escHtml(email)}">${escHtml(email)}</a></p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="white-space:pre-wrap;line-height:1.7">${escHtml(message)}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="font-size:0.8rem;color:#888">Sent via liam-gregor.vercel.app contact form</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Resend error:', err);
      throw new Error(err.message || 'Email API error');
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ error: 'Failed to send. Please email me directly at lamesgregor@gmail.com' });
  }
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
