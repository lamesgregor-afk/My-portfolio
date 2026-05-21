// Project detail modal

export function initModal() {
  const overlay = document.createElement('div');
  overlay.id        = 'work-modal-overlay';
  overlay.className = 'work-modal-overlay hidden';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'work-modal-title');

  overlay.innerHTML = `
    <div class="work-modal">
      <button class="work-modal-close" id="work-modal-close" aria-label="Close">&times;</button>
      <div class="work-modal-inner">
        <div class="work-modal-gallery" id="work-modal-gallery"></div>
        <div class="work-modal-content">
          <div class="work-modal-tags"  id="work-modal-tags"></div>
          <h2  class="work-modal-title" id="work-modal-title"></h2>
          <p   class="work-modal-desc"  id="work-modal-desc"></p>
          <div class="work-modal-links" id="work-modal-links"></div>
          <div class="work-modal-meta"  id="work-modal-meta"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('work-modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

export function openWorkModal(work) {
  const overlay = document.getElementById('work-modal-overlay');
  if (!overlay) return;

  // Gallery
  const gallery = document.getElementById('work-modal-gallery');
  gallery.innerHTML = (work.image_urls && work.image_urls.length)
    ? work.image_urls.map(url =>
        `<img class="work-modal-img" src="${esc(url)}" alt="${esc(work.title)}" loading="lazy" />`
      ).join('')
    : `<div class="work-modal-img-placeholder">🚀</div>`;

  // Tags
  document.getElementById('work-modal-tags').innerHTML =
    (work.technologies || []).map(t => `<span class="work-tag">${esc(t)}</span>`).join('');

  // Title + description
  document.getElementById('work-modal-title').textContent = work.title;
  document.getElementById('work-modal-desc').textContent  = work.description;

  // Links
  const links = [];
  if (work.live_url)   links.push(`<a href="${esc(work.live_url)}"   target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none">View live →</a>`);
  if (work.github_url) links.push(`<a href="${esc(work.github_url)}" target="_blank" rel="noopener" class="btn-outline" style="text-decoration:none">GitHub</a>`);
  document.getElementById('work-modal-links').innerHTML = links.join('');

  // View count
  document.getElementById('work-modal-meta').innerHTML = work.view_count
    ? `<span class="work-modal-views">👁 ${work.view_count} views</span>` : '';

  // Show modal
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.work-modal',
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0,  scale: 1, duration: 0.45, ease: 'power3.out' }
    );
  }

  // Increment view count (fire-and-forget)
  if (work.id) {
    fetch(`/api/works/${work.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'view' }),
    }).catch(() => {});
  }
}

function closeModal() {
  const overlay = document.getElementById('work-modal-overlay');
  if (!overlay || overlay.classList.contains('hidden')) return;

  if (typeof gsap !== 'undefined') {
    gsap.to('.work-modal', {
      opacity: 0, y: 30, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      },
    });
  } else {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function esc(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
