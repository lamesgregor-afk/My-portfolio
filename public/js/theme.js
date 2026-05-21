// Dark / light theme toggle with localStorage persistence

const KEY = 'lg-theme';

export function initTheme() {
  // Theme is pre-applied by inline script in <head> to prevent flash.
  // Here we just wire up the toggle button.
  const current = document.documentElement.dataset.theme || 'dark';
  updateButton(current);

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = (document.documentElement.dataset.theme || 'dark') === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(KEY, next);
    updateButton(next);
  });
}

function updateButton(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  if (theme === 'light') {
    btn.innerHTML  = moonIcon();
    btn.title      = 'Switch to dark mode';
    btn.setAttribute('aria-label', 'Switch to dark mode');
  } else {
    btn.innerHTML  = sunIcon();
    btn.title      = 'Switch to light mode';
    btn.setAttribute('aria-label', 'Switch to light mode');
  }
}

function sunIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591 1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>`;
}

function moonIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>`;
}
