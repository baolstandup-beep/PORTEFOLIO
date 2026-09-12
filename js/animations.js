/**
 * HERO ANIMATIONS — entrée cinématographique au chargement
 */
export function initHeroAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Instantly show everything
    document.querySelectorAll('.hero__name-inner').forEach((el) => {
      el.classList.add('is-visible');
    });
    document.querySelectorAll('.hero__reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const nameLines = document.querySelectorAll('.hero__name-inner');
  const revealEls = document.querySelectorAll('.hero__reveal');

  // Stagger name lines
  nameLines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 200 + i * 150);
  });

  // Stagger other elements after name is done
  revealEls.forEach((el, i) => {
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 700 + i * 120);
  });
}

/**
 * MAGNETIC BUTTONS — effet magnétique subtil sur les boutons CTA
 */
export function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const btns = document.querySelectorAll('.btn-primary, .navbar__cta, .form__submit');

  btns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect   = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}
