// Reviews section — fetch + render + submit

import { getUser, loginWithGoogle } from './auth.js';
import { showToast } from './app.js';

let selectedRating = 0;

export async function initReviews() {
  const reviews = await loadReviews();
  initReviewForm(reviews);
}

async function loadReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  try {
    const res = await fetch('/api/reviews');
    if (!res.ok) throw new Error();
    const reviews = await res.json();

    if (!reviews.length) {
      grid.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 40px 0;">No reviews yet. Be the first!</p>';
      return;
    }

    grid.innerHTML = reviews.map(reviewCardHTML).join('');
    return reviews;
  } catch {
    grid.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 40px 0;">Could not load reviews.</p>';
    return [];
  }
}

function reviewCardHTML(review) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < review.rating ? 'filled' : ''}">★</span>`
  ).join('');

  const avatar = review.author_avatar
    ? `<img class="review-author-avatar" src="${escHtml(review.author_avatar)}" alt="${escHtml(review.author_name)}">`
    : `<div class="review-author-avatar" style="background:var(--accent-glow);display:flex;align-items:center;justify-content:center;font-size:0.9rem;font-weight:700;color:var(--accent-soft)">${escHtml(review.author_name[0].toUpperCase())}</div>`;

  const date = new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

  return `
    <article class="review-card">
      <div class="review-stars">${stars}</div>
      <p class="review-text">${escHtml(review.text)}</p>
      <div class="review-author">
        ${avatar}
        <div>
          <div class="review-author-name">${escHtml(review.author_name)}</div>
          <div class="review-author-date">${date}</div>
        </div>
      </div>
    </article>
  `;
}

function initReviewForm(existingReviews) {
  const formArea = document.getElementById('review-form-area');
  if (!formArea) return;

  const user = getUser();

  if (!user) {
    formArea.innerHTML = `
      <div class="review-form-wrapper">
        <div class="review-login-prompt">
          Want to leave a review?
          <button onclick="window.loginWithGoogle()">Sign in with Google</button>
          — it only takes a second.
        </div>
      </div>
    `;
    window.loginWithGoogle = loginWithGoogle;
    return;
  }

  // Check if user already submitted a review
  const alreadyReviewed = Array.isArray(existingReviews) &&
    existingReviews.some(r => r.author_name === user.name);

  if (alreadyReviewed) {
    formArea.innerHTML = `
      <div class="review-form-wrapper" style="text-align:center;color:var(--text-secondary)">
        <p style="font-size:1.5rem;margin-bottom:12px">✅</p>
        <p>You've already submitted a review. Thank you, ${escHtml(user.name.split(' ')[0])}!</p>
      </div>
    `;
    return;
  }

  formArea.innerHTML = `
    <div class="review-form-wrapper">
      <h3 class="review-form-title">Leave a review</h3>
      <p class="review-form-subtitle">Share your experience working with Liam.</p>

      <div class="star-rating-input" id="star-input" role="group" aria-label="Rating">
        ${[1,2,3,4,5].map(n => `
          <button class="star-btn" data-value="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>
        `).join('')}
      </div>

      <form id="review-form" novalidate>
        <div class="form-field">
          <label for="review-text">Your review</label>
          <textarea id="review-text" name="text" placeholder="Tell others what it's like to work with Liam..." minlength="10" maxlength="600" required></textarea>
        </div>
        <button type="submit" class="btn-submit" id="review-submit-btn">Post review</button>
      </form>
    </div>
  `;

  // Star input
  const starBtns = formArea.querySelectorAll('.star-btn');
  starBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => highlightStars(parseInt(btn.dataset.value), starBtns));
    btn.addEventListener('mouseleave', () => highlightStars(selectedRating, starBtns));
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.value);
      highlightStars(selectedRating, starBtns);
    });
  });

  // Form submit
  const form = document.getElementById('review-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text  = document.getElementById('review-text').value.trim();
    const btn   = document.getElementById('review-submit-btn');

    if (!selectedRating) {
      showToast('Please select a star rating.', 'error');
      return;
    }

    if (text.length < 10) {
      showToast('Review must be at least 10 characters.', 'error');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Posting...';

    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, rating: selectedRating }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Could not submit review.', 'error');
        btn.disabled    = false;
        btn.textContent = 'Post review';
        return;
      }

      showToast('Review posted! Thank you.', 'success');
      formArea.innerHTML = `
        <div class="review-form-wrapper" style="text-align:center;color:var(--text-secondary)">
          <p style="font-size:2rem;margin-bottom:12px">🎉</p>
          <p>Thanks for your review, ${escHtml(user.name.split(' ')[0])}!</p>
        </div>
      `;
      // Reload reviews
      await loadReviews();
    } catch {
      showToast('Network error. Please try again.', 'error');
      btn.disabled    = false;
      btn.textContent = 'Post review';
    }
  });
}

function highlightStars(n, btns) {
  btns.forEach((btn, i) => btn.classList.toggle('active', i < n));
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
