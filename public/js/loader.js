// Page loading screen

export function initLoader() {
  return new Promise(resolve => {
    const loader = document.getElementById('page-loader');
    if (!loader) { resolve(); return; }

    const name    = document.getElementById('loader-name');
    const tagline = document.getElementById('loader-tagline');
    const bar     = document.getElementById('loader-bar');

    // CSS-only animation — no GSAP dependency
    if (name)    { name.style.transition    = 'opacity 0.7s ease, transform 0.7s ease'; }
    if (tagline) { tagline.style.transition = 'opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s'; }
    if (bar)     { bar.style.transition     = 'transform 1s ease 0.3s'; }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (name)    { name.style.opacity    = '1'; name.style.transform    = 'translateY(0)'; }
        if (tagline) { tagline.style.opacity = '1'; tagline.style.transform = 'translateY(0)'; }
        if (bar)     { bar.style.transform   = 'scaleX(1)'; }
      });
    });

    // Hide loader after animation completes — always resolves
    const hideAt = 1600; // ms
    setTimeout(() => {
      loader.style.transition = 'opacity 0.6s ease';
      loader.style.opacity    = '0';
      loader.style.pointerEvents = 'none';
      setTimeout(() => {
        loader.style.display = 'none';
        resolve();
      }, 650);
    }, hideAt);
  });
}
