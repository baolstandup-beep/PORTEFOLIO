import { initWorks } from './works.js';
import { initContactForm } from './contact.js';
import { track, initAnalytics } from './analytics.js';

initAnalytics();
initWorks(document.querySelector('#realisations'));
initContactForm(document.querySelector('#contact-form'));

// Barre flottante : met en avant la section affichée.
const navLinks = [...document.querySelectorAll('.dock a[href^="#"]')];
const setActive = id => {
  for (const link of navLinks) {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
};
const sections = navLinks.map(link => document.querySelector(link.hash)).filter(Boolean);
// La section active est la dernière dont le haut a dépassé 40 % de la hauteur d'écran.
let ticking = false;
const update = () => {
  const line = innerHeight * 0.4;
  const current = sections.filter(section => section.getBoundingClientRect().top <= line).pop() ?? sections[0];
  setActive(current.id);
  ticking = false;
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
update();

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
