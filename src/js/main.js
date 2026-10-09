import { initWorks } from './works.js';
import { initContactForm } from './contact.js';
import { track, initAnalytics } from './analytics.js';

initAnalytics();
initWorks(document.querySelector('#projets'));
initContactForm(document.querySelector('#contact-form'));

// Ferme le menu mobile (popover) après un choix.
const menu = document.getElementById('menu');
menu?.addEventListener('click', event => {
  if (event.target.closest('a') && menu.matches(':popover-open')) menu.hidePopover();
});

// Lien actif selon la section affichée.
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const spy = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    for (const link of navLinks) {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach(link => { const target = document.querySelector(link.hash); if (target) spy.observe(target); });

// Copie de l'e-mail : le lien mailto reste le comportement par défaut si la copie échoue.
document.addEventListener('click', async event => {
  const link = event.target.closest('[data-copy]');
  if (!link || !navigator.clipboard) return;
  event.preventDefault();
  const label = link.querySelector('span');
  const original = label.textContent;
  try {
    await navigator.clipboard.writeText(link.dataset.copy);
    label.textContent = 'Adresse copiée';
    track('email_copy');
    setTimeout(() => { label.textContent = original; }, 2000);
  } catch {
    location.href = link.href;
  }
});

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
