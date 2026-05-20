// GSAP + ScrollTrigger animations
// Requires: gsap and ScrollTrigger loaded via CDN before this file

export function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // ----- HERO -----
  // Floating orbs parallax
  gsap.to('.hero-orb-1', {
    y: -80,
    x: 40,
    scrollTrigger: { trigger: '#hero', scrub: 1.5 },
  });
  gsap.to('.hero-orb-2', {
    y: -60,
    x: -30,
    scrollTrigger: { trigger: '#hero', scrub: 2 },
  });

  // Badge fade in
  gsap.from('.hero-badge', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.2,
  });

  // Title lines stagger
  gsap.from('.hero-title-line', {
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.15,
    delay: 0.4,
  });

  // Description
  gsap.from('.hero-desc', {
    opacity: 0,
    y: 30,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.85,
  });

  // CTA buttons
  gsap.from('.hero-cta > *', {
    opacity: 0,
    y: 20,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 1.05,
  });

  // Scroll hint pulse
  gsap.to('.hero-scroll-line', {
    scaleY: 0,
    transformOrigin: 'top center',
    duration: 1,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: -1,
  });

  // ----- ABOUT -----
  const aboutTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#about',
      start: 'top 75%',
    },
  });

  aboutTl
    .from('.about-text .section-label', { opacity: 0, y: 20, duration: 0.6 })
    .from('.about-text .section-title', { opacity: 0, y: 30, duration: 0.7 }, '-=0.3')
    .from('.about-body', { opacity: 0, y: 25, duration: 0.7 }, '-=0.4')
    .from('.skill-tag', {
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      stagger: 0.06,
      ease: 'back.out(1.5)',
    }, '-=0.3');

  gsap.from('.about-photo-wrap', {
    opacity: 0,
    x: 60,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 70%',
    },
  });

  gsap.from('.about-glow-card', {
    opacity: 0,
    scale: 0.85,
    duration: 0.8,
    ease: 'back.out(1.7)',
    delay: 0.4,
    scrollTrigger: {
      trigger: '#about',
      start: 'top 70%',
    },
  });

  // ----- WORKS -----
  gsap.from('.works-header', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    scrollTrigger: { trigger: '#works', start: 'top 80%' },
  });

  // Work cards — batch stagger on scroll
  ScrollTrigger.batch('.work-card', {
    onEnter: batch => gsap.from(batch, {
      opacity: 0,
      scale: 0.88,
      y: 40,
      duration: 0.65,
      stagger: 0.1,
      ease: 'power3.out',
    }),
    start: 'top 88%',
    once: true,
  });

  // ----- REVIEWS -----
  gsap.from('.reviews-header', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    scrollTrigger: { trigger: '#reviews', start: 'top 80%' },
  });

  ScrollTrigger.batch('.review-card', {
    onEnter: batch => gsap.from(batch, {
      opacity: 0,
      x: (i) => (i % 2 === 0 ? -40 : 40),
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
    }),
    start: 'top 88%',
    once: true,
  });

  gsap.from('.review-form-wrapper', {
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.review-form-wrapper',
      start: 'top 85%',
    },
  });

  // ----- CONTACT -----
  gsap.from('.contact-inner .section-label', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    scrollTrigger: { trigger: '#contact', start: 'top 80%' },
  });

  gsap.from('.contact-inner .section-title', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    scrollTrigger: { trigger: '#contact', start: 'top 80%' },
    delay: 0.15,
  });

  gsap.from('.contact-email', {
    opacity: 0,
    scale: 0.94,
    duration: 0.6,
    ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '#contact', start: 'top 75%' },
    delay: 0.3,
  });

  gsap.from('.social-link', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.08,
    ease: 'back.out(1.7)',
    scrollTrigger: { trigger: '.contact-socials', start: 'top 88%' },
  });
}
