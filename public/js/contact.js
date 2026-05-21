// Contact form — sends message via /api/contact
import { showToast } from './app.js';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = document.getElementById('contact-name')?.value.trim();
    const email   = document.getElementById('contact-email-field')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();
    const btn     = document.getElementById('contact-submit-btn');

    if (!name || !email || !message) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (message.length < 10) {
      showToast('Message is too short (min 10 characters).', 'error');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Sending…';

    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to send. Try again.', 'error');
        return;
      }

      showToast("Message sent! I'll get back to you soon.", 'success');
      form.reset();
    } catch {
      showToast('Network error. Please try again later.', 'error');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Send message';
    }
  });
}
