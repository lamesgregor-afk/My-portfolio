// Google OAuth — client-side state management

let currentUser = null;

/**
 * Fetch the current user from the server and update UI.
 * Called on page load.
 */
export async function initAuth() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      currentUser = await res.json();
    } else {
      currentUser = null;
    }
  } catch {
    currentUser = null;
  }
  renderAuthUI();
  return currentUser;
}

/** Returns the cached current user (null if not logged in). */
export function getUser() {
  return currentUser;
}

/** Redirect to Google OAuth flow. */
export function loginWithGoogle() {
  window.location.href = '/api/auth/google';
}

/** Logout and refresh the page. */
export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  currentUser = null;
  window.location.reload();
}

/**
 * Update navbar auth section based on login state.
 */
function renderAuthUI() {
  const loginBtn  = document.getElementById('nav-login-btn');
  const userPanel = document.getElementById('nav-user-panel');
  const userName  = document.getElementById('nav-user-name');
  const userAvatar = document.getElementById('nav-user-avatar');
  const adminLink = document.getElementById('nav-admin-link');
  const logoutBtn = document.getElementById('nav-logout-btn');

  if (!loginBtn || !userPanel) return;

  if (currentUser) {
    loginBtn.classList.add('hidden');
    userPanel.classList.remove('hidden');
    if (userName)  userName.textContent = currentUser.name.split(' ')[0];
    if (userAvatar && currentUser.avatar_url) {
      userAvatar.src = currentUser.avatar_url;
      userAvatar.alt = currentUser.name;
    }
    if (adminLink) {
      adminLink.classList.toggle('hidden', !currentUser.is_admin);
    }
  } else {
    loginBtn.classList.remove('hidden');
    userPanel.classList.add('hidden');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', loginWithGoogle);
  }
}
