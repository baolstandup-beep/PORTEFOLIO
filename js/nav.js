/**
 * NAVBAR — sticky + menu mobile
 */
export function initNavbar() {
  const navbar  = document.querySelector('.navbar');
  const menuBtn = document.querySelector('.navbar__menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (!navbar) return;

  // Sticky scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    navbar.classList.toggle('scrolled', current > 60);
    lastScroll = current;
  }, { passive: true });

  // Mobile menu toggle
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      menuBtn.classList.toggle('is-open', !isOpen);
      mobileMenu.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on link click
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        menuBtn.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }
}
