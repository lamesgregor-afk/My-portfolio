// Main entry point — initializes all modules

import { initAuth } from './auth.js';
import { initWorks } from './works.js';
import { initReviews } from './reviews.js';
import { initAnimations } from './animations.js';
import { initCursor } from './cursor.js';
import { initTheme } from './theme.js';
import { initContactForm } from './contact.js';
import { initModal } from './modal.js';
import { initLoader } from './loader.js';

// ---- Toast system ----
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

export function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span style="font-weight:600">${icons[type] || icons.info}</span> ${message}`;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, duration);
}

// ---- Navbar scroll effect ----
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Mobile menu toggle
  const toggle = document.querySelector('.nav-menu-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      document.body.classList.toggle('overflow-hidden');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        document.body.classList.remove('overflow-hidden');
      });
    });
  }
}

// ---- Check for auth errors in URL ----
function checkAuthError() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('auth') === 'error') {
    showToast('Sign-in failed. Please try again.', 'error');
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', async () => {
  // Theme first (no flash)
  initTheme();

  // Cursor
  initCursor();

  // Loading screen
  await initLoader();

  initNavbar();
  checkAuthError();

  // Modal
  initModal();

  // Auth must load before reviews
  await initAuth();

  // Load sections in parallel
  await Promise.all([
    initWorks(),
    initReviews(),
  ]);

  // Contact form
  initContactForm();

  // Animations last (after DOM content is present)
  initAnimations();
});
