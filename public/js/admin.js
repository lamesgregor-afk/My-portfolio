// Admin panel — full logic

let currentUser = null;
let editingWorkId = null;

// ---- Boot ----
document.addEventListener('DOMContentLoaded', async () => {
  await checkAdminAccess();
});

async function checkAdminAccess() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('not logged in');
    const user = await res.json();
    if (!user.is_admin) throw new Error('not admin');
    currentUser = user;
  } catch {
    document.getElementById('admin-loading').classList.add('hidden');
    document.getElementById('admin-denied').classList.remove('hidden');
    return;
  }

  // Populate user info
  const avatar = document.getElementById('admin-user-avatar');
  const name   = document.getElementById('admin-user-name');
  if (avatar && currentUser.avatar_url) { avatar.src = currentUser.avatar_url; avatar.alt = currentUser.name; }
  if (name)   name.textContent = currentUser.name;

  // Show app
  document.getElementById('admin-loading').classList.add('hidden');
  document.getElementById('admin-app').classList.remove('hidden');

  // Init
  initTabs();
  initWorkModal();
  initLogout();
  await loadWorks();
};

// ---- Tabs ----
function initTabs() {
  const btns = document.querySelectorAll('.admin-nav-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      btns.forEach(b => { b.classList.remove('active'); b.removeAttribute('aria-current'); });
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'true');

      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      const targetTab = document.getElementById(`tab-${tab}`);
      if (targetTab) targetTab.classList.add('active');

      document.getElementById('admin-page-title').textContent =
        tab.charAt(0).toUpperCase() + tab.slice(1);

      if (tab === 'reviews') loadReviews();
    });
  });
}

// ---- Works ----
async function loadWorks() {
  const list = document.getElementById('admin-works-list');
  const count = document.getElementById('works-admin-count');
  list.innerHTML = '<div class="admin-loading"><div class="spinner"></div></div>';

  try {
    const res  = await fetch('/api/works');
    const works = await res.json();
    count.textContent = `${works.length} project${works.length !== 1 ? 's' : ''}`;

    if (!works.length) {
      list.innerHTML = '<div class="admin-empty"><p>📂</p><p>No projects yet. Add your first one!</p></div>';
      return;
    }

    list.innerHTML = works.map(workItemHTML).join('');

    list.querySelectorAll('.btn-edit-work').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });

    list.querySelectorAll('.btn-delete-work').forEach(btn => {
      btn.addEventListener('click', () => deleteWork(parseInt(btn.dataset.id)));
    });
  } catch {
    list.innerHTML = '<div class="admin-empty"><p>⚠️</p><p>Failed to load works.</p></div>';
  }
}

function workItemHTML(work) {
  const thumb = (work.image_urls && work.image_urls[0])
    ? `<img class="admin-work-thumb" src="${work.image_urls[0]}" alt="" />`
    : `<div class="admin-work-thumb">🚀</div>`;

  const tags = (work.technologies || []).slice(0,3).map(t =>
    `<span class="work-tag">${escHtml(t)}</span>`
  ).join('');

  return `
    <div class="admin-work-item" data-id="${work.id}">
      ${thumb}
      <div class="admin-work-info">
        <div class="admin-work-title">${escHtml(work.title)}</div>
        <div class="admin-work-tags">${tags}</div>
      </div>
      <div class="admin-work-actions">
        <button class="btn-icon btn-edit-work" data-id="${work.id}" title="Edit" aria-label="Edit ${escHtml(work.title)}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
        </button>
        <button class="btn-icon danger btn-delete-work" data-id="${work.id}" title="Delete" aria-label="Delete ${escHtml(work.title)}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
        </button>
      </div>
    </div>
  `;
}

async function deleteWork(id) {
  if (!confirm('Delete this project? This cannot be undone.')) return;
  try {
    const res = await fetch(`/api/works/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Project deleted.', 'success');
    await loadWorks();
  } catch {
    showToast('Failed to delete. Try again.', 'error');
  }
}

// ---- Work Modal ----
function initWorkModal() {
  const modal     = document.getElementById('work-modal');
  const btnAdd    = document.getElementById('btn-add-work');
  const btnClose  = document.getElementById('modal-close');
  const btnCancel = document.getElementById('btn-cancel-modal');
  const form      = document.getElementById('work-form');
  const imgInput  = document.getElementById('work-image-input');
  const imgPreview = document.getElementById('image-preview');
  const imgPlaceholder = document.getElementById('image-upload-placeholder');

  btnAdd.addEventListener('click', () => openAddModal());
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  // Close on overlay click
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Image preview
  imgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    imgPreview.src = url;
    imgPreview.classList.remove('hidden');
    imgPlaceholder.classList.add('hidden');
    // Upload immediately on select
    uploadImage(file);
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-work');
    btn.disabled    = true;
    btn.textContent = 'Saving…';

    const id          = document.getElementById('work-id').value;
    const title       = document.getElementById('work-title').value.trim();
    const description = document.getElementById('work-description').value.trim();
    const techRaw     = document.getElementById('work-technologies').value;
    const live_url    = document.getElementById('work-live-url').value.trim();
    const github_url  = document.getElementById('work-github-url').value.trim();
    const imageUrl    = document.getElementById('work-image-url').value;

    if (!title || !description) {
      showToast('Title and description are required.', 'error');
      btn.disabled = false; btn.textContent = 'Save work';
      return;
    }

    const technologies = techRaw.split(',').map(t => t.trim()).filter(Boolean);
    const image_urls   = imageUrl ? [imageUrl] : [];

    const payload = { title, description, technologies, image_urls, live_url: live_url || null, github_url: github_url || null };

    try {
      const url    = id ? `/api/works/${id}` : '/api/works';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }

      showToast(id ? 'Project updated.' : 'Project added.', 'success');
      closeModal();
      await loadWorks();
    } catch (err) {
      showToast(err.message || 'Failed to save. Try again.', 'error');
      btn.disabled = false; btn.textContent = 'Save work';
    }
  });
}

async function uploadImage(file) {
  const btn = document.getElementById('btn-save-work');
  btn.textContent = 'Uploading image…';
  btn.disabled = true;

  try {
    const res = await fetch('/api/works/upload', {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'x-filename': encodeURIComponent(file.name),
      },
      body: file,
    });
    const data = await res.json();
    document.getElementById('work-image-url').value = data.url;
  } catch {
    showToast('Image upload failed. You can still save without it.', 'error');
  } finally {
    btn.textContent = 'Save work';
    btn.disabled = false;
  }
}

function openAddModal() {
  editingWorkId = null;
  document.getElementById('modal-title').textContent  = 'Add work';
  document.getElementById('btn-save-work').textContent = 'Save work';
  document.getElementById('work-form').reset();
  document.getElementById('work-id').value = '';
  document.getElementById('work-image-url').value = '';
  document.getElementById('image-preview').classList.add('hidden');
  document.getElementById('image-upload-placeholder').classList.remove('hidden');
  document.getElementById('work-modal').classList.remove('hidden');
}

async function openEditModal(id) {
  editingWorkId = id;
  document.getElementById('modal-title').textContent  = 'Edit work';
  document.getElementById('btn-save-work').textContent = 'Update work';

  try {
    const res  = await fetch(`/api/works/${id}`);
    const work = await res.json();

    document.getElementById('work-id').value          = work.id;
    document.getElementById('work-title').value       = work.title;
    document.getElementById('work-description').value = work.description;
    document.getElementById('work-technologies').value = (work.technologies || []).join(', ');
    document.getElementById('work-live-url').value    = work.live_url || '';
    document.getElementById('work-github-url').value  = work.github_url || '';

    const imgUrl = work.image_urls && work.image_urls[0];
    if (imgUrl) {
      document.getElementById('work-image-url').value = imgUrl;
      document.getElementById('image-preview').src   = imgUrl;
      document.getElementById('image-preview').classList.remove('hidden');
      document.getElementById('image-upload-placeholder').classList.add('hidden');
    } else {
      document.getElementById('work-image-url').value = '';
      document.getElementById('image-preview').classList.add('hidden');
      document.getElementById('image-upload-placeholder').classList.remove('hidden');
    }

    document.getElementById('work-modal').classList.remove('hidden');
  } catch {
    showToast('Could not load project data.', 'error');
  }
}

function closeModal() {
  document.getElementById('work-modal').classList.add('hidden');
  editingWorkId = null;
}

// ---- Reviews ----
async function loadReviews() {
  const list  = document.getElementById('admin-reviews-list');
  const count = document.getElementById('reviews-admin-count');
  list.innerHTML = '<div class="admin-loading"><div class="spinner"></div></div>';

  try {
    const res     = await fetch('/api/reviews');
    const reviews = await res.json();
    count.textContent = `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;

    if (!reviews.length) {
      list.innerHTML = '<div class="admin-empty"><p>💬</p><p>No reviews yet.</p></div>';
      return;
    }

    list.innerHTML = reviews.map(reviewAdminHTML).join('');

    list.querySelectorAll('.btn-delete-review').forEach(btn => {
      btn.addEventListener('click', () => deleteReview(parseInt(btn.dataset.id)));
    });
  } catch {
    list.innerHTML = '<div class="admin-empty"><p>⚠️</p><p>Failed to load reviews.</p></div>';
  }
}

function reviewAdminHTML(review) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < review.rating ? 'filled' : ''}">★</span>`
  ).join('');

  const avatar = review.author_avatar
    ? `<img class="admin-review-avatar" src="${escHtml(review.author_avatar)}" alt="" />`
    : `<div class="admin-review-avatar" style="background:var(--accent-glow);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--accent-soft)">${escHtml(review.author_name[0])}</div>`;

  const date = new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return `
    <div class="admin-review-item">
      <div>
        <div class="admin-review-header">
          ${avatar}
          <span class="admin-review-author">${escHtml(review.author_name)}</span>
          <span class="admin-review-meta">${date}</span>
        </div>
        <div class="admin-review-rating review-stars">${stars}</div>
        <p class="admin-review-text">${escHtml(review.text)}</p>
      </div>
      <button class="btn-icon danger btn-delete-review" data-id="${review.id}" title="Delete review" aria-label="Delete review by ${escHtml(review.author_name)}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
      </button>
    </div>
  `;
}

async function deleteReview(id) {
  if (!confirm('Delete this review? This cannot be undone.')) return;
  try {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Review deleted.', 'success');
    await loadReviews();
  } catch {
    showToast('Failed to delete. Try again.', 'error');
  }
}

// ---- Logout ----
function initLogout() {
  document.getElementById('admin-logout-btn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  });
}

// ---- Utils ----
function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Inline toast for admin (no module import)
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span style="font-weight:600">${icons[type]}</span> ${message}`;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 4000);
}
