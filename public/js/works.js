// Works section — fetch from API, render cards, filter by tag

let allWorks = [];
let activeFilter = 'All';

export async function initWorks() {
  const grid = document.getElementById('works-grid');
  if (!grid) return;

  showLoading(grid);

  try {
    const res = await fetch('/api/works');
    if (!res.ok) throw new Error('Failed to fetch works');
    allWorks = await res.json();
  } catch {
    grid.innerHTML = '<div class="works-empty">Could not load projects. Try again later.</div>';
    return;
  }

  buildFilters();
  renderWorks('All');
}

function buildFilters() {
  const container = document.getElementById('works-filters');
  if (!container) return;

  // Collect unique tags
  const tags = ['All'];
  allWorks.forEach(w => {
    (w.technologies || []).forEach(t => {
      if (!tags.includes(t)) tags.push(t);
    });
  });

  container.innerHTML = tags.map(tag => `
    <button class="filter-btn ${tag === activeFilter ? 'active' : ''}"
            data-tag="${tag}">
      ${tag}
    </button>
  `).join('');

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWorks(btn.dataset.tag);
    });
  });
}

function renderWorks(filter) {
  activeFilter = filter;
  const grid = document.getElementById('works-grid');
  if (!grid) return;

  const filtered = filter === 'All'
    ? allWorks
    : allWorks.filter(w => (w.technologies || []).includes(filter));

  if (!filtered.length) {
    grid.innerHTML = '<div class="works-empty">No projects found for this filter.</div>';
    return;
  }

  grid.innerHTML = filtered.map(work => cardHTML(work)).join('');

  // Re-trigger GSAP batch animations for newly rendered cards
  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
}

function cardHTML(work) {
  const imageHTML = (work.image_urls && work.image_urls[0])
    ? `<img class="work-card-image" src="${work.image_urls[0]}" alt="${escHtml(work.title)}" loading="lazy">`
    : `<div class="work-card-image-placeholder">🚀</div>`;

  const tags = (work.technologies || [])
    .slice(0, 4)
    .map(t => `<span class="work-tag">${escHtml(t)}</span>`)
    .join('');

  const liveLink = work.live_url
    ? `<a class="work-link" href="${work.live_url}" target="_blank" rel="noopener">
         ${iconExternal()} Live
       </a>`
    : '';

  const ghLink = work.github_url
    ? `<a class="work-link" href="${work.github_url}" target="_blank" rel="noopener">
         ${iconGithub()} GitHub
       </a>`
    : '';

  return `
    <article class="work-card">
      ${imageHTML}
      <div class="work-card-body">
        <div class="work-card-tags">${tags}</div>
        <h3 class="work-card-title">${escHtml(work.title)}</h3>
        <p class="work-card-desc">${escHtml(work.description)}</p>
      </div>
      ${(liveLink || ghLink) ? `<div class="work-card-footer">${liveLink}${ghLink}</div>` : ''}
    </article>
  `;
}

function showLoading(grid) {
  grid.innerHTML = `
    <div class="works-loading">
      <div class="spinner"></div>
    </div>
  `;
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function iconExternal() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>`;
}

function iconGithub() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"/></svg>`;
}
