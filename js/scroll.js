/**
 * SCROLL ANIMATIONS — Intersection Observer
 */

let observer = null;

export function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = document.querySelectorAll(
    '.reveal, .reveal-clip, .process-step'
  );

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });

  elements.forEach((el) => observer.observe(el));
}

/**
 * PARALLAX — léger effet sur les images de projets
 */
export function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const images = document.querySelectorAll('[data-parallax]');
  if (!images.length) return;

  const handleScroll = () => {
    images.forEach((img) => {
      const rect   = img.closest('.project-item__image').getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const speed  = parseFloat(img.dataset.parallax || '0.08');
      img.style.transform = `scale(1.06) translateY(${center * speed}px)`;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * SCROLL PROGRESS BAR
 */
export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }, { passive: true });
}
