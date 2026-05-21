// Smooth glowing cursor follower — desktop only

export function initCursor() {
  // Skip on touch/mobile devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const follower = document.createElement('div');
  follower.className = 'cursor-follower';
  document.body.appendChild(follower);

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  document.body.classList.add('custom-cursor');

  let mx = 0, my = 0, fx = 0, fy = 0, initialized = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    // Dot snaps instantly
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';

    if (!initialized) {
      fx = mx; fy = my;
      follower.style.opacity = '1';
      dot.style.opacity      = '1';
      initialized = true;
    }
  });

  // Smooth follower with lerp
  function tick() {
    fx += (mx - fx) * 0.1;
    fy += (my - fy) * 0.1;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(tick);
  }
  tick();

  // Scale on interactive elements
  const targets = 'a, button, .work-card, .skill-tag, .filter-btn, .social-link, .contact-email, .review-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(targets)) follower.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(targets)) follower.classList.remove('cursor-hover');
  });

  // Fade when leaving window
  document.addEventListener('mouseleave', () => {
    follower.style.opacity = '0';
    dot.style.opacity      = '0';
  });
  document.addEventListener('mouseenter', () => {
    follower.style.opacity = '1';
    dot.style.opacity      = '1';
  });
}
