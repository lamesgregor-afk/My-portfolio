// Page loading screen — plays once on first visit, then fades away

export function initLoader() {
  return new Promise(resolve => {
    const loader = document.getElementById('page-loader');
    if (!loader) { resolve(); return; }

    // Fallback without GSAP
    if (typeof gsap === 'undefined') {
      setTimeout(() => {
        loader.style.transition = 'opacity 0.6s';
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; resolve(); }, 650);
      }, 900);
      return;
    }

    gsap.timeline({
      onComplete: () => {
        loader.style.display = 'none';
        resolve();
      }
    })
    .to('#loader-name',    { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 0.2)
    .to('#loader-tagline', { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.65)
    .to('#loader-bar',     { scaleX: 1,  duration: 1.1,  ease: 'power2.inOut'    }, 0.4)
    .to(loader,            { opacity: 0, duration: 0.65, ease: 'power2.inOut'    }, 2.1);
  });
}
