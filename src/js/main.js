import { initArchive, initLightbox } from './works.js';
import { initContactForm } from './contact.js';
import { track, initAnalytics } from './analytics.js';

const root = document.documentElement;
root.classList.add('js');

initAnalytics();
initArchive(document.querySelector('#archive'));
initLightbox();
initContactForm(document.querySelector('#contact-form'));

// En-tête : filet visible dès qu'on a quitté le haut de page.
const onScroll = () => root.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Menu mobile : se ferme après le choix d'une section.
const menu = document.getElementById('menu');
menu?.addEventListener('click', event => {
  if (event.target.closest('a') && menu.matches(':popover-open')) menu.hidePopover();
});

// Navigation : lien actif selon la section affichée (accueil) ou « Projets » sur une étude de cas.
const navLinks = [...document.querySelectorAll('.site-nav [data-section]')];
const setActive = id => navLinks.forEach(link => {
  if (link.dataset.section === id) link.setAttribute('aria-current', 'true');
  else link.removeAttribute('aria-current');
});
if (document.body.classList.contains('page-case')) setActive('projets');
const sections = navLinks.map(link => document.getElementById(link.dataset.section)).filter(Boolean);
if (sections.length) {
  let ticking = false;
  const update = () => {
    const line = innerHeight * 0.35;
    // La section active est celle dont le haut est le plus proche au-dessus de la ligne de lecture,
    // quel que soit l'ordre des liens dans le menu.
    let current = null;
    let best = -Infinity;
    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      if (top <= line && top > best) { best = top; current = section; }
    }
    setActive(current?.id ?? null);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

// Apparition progressive des blocs marqués .reveal (désactivée par le CSS si le mouvement est réduit).
const reveal = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-visible');
    reveal.unobserve(entry.target);
  }
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

// Témoignages : les flèches font défiler le carrousel d'une carte.
const carousel = document.querySelector('.testimonials__track');
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => {
  const card = carousel.querySelector('li');
  const step = card ? card.getBoundingClientRect().width + 16 : carousel.clientWidth * 0.8;
  carousel.scrollBy({ left: step * Number(button.dataset.scroll), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}));

// Copie de l'e-mail : le lien mailto reste le comportement par défaut si la copie échoue.
document.addEventListener('click', async event => {
  const link = event.target.closest('[data-copy]');
  if (!link || !navigator.clipboard) return;
  event.preventDefault();
  const original = link.textContent;
  try {
    await navigator.clipboard.writeText(link.dataset.copy);
    link.textContent = 'Adresse copiée';
    track('email_copy');
    setTimeout(() => { link.textContent = original; }, 2000);
  } catch {
    location.href = link.href;
  }
});

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
