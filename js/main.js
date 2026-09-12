/**
 * MAIN — Point d'entrée
 */
import { initCursor }           from './cursor.js';
import { initNavbar }           from './nav.js';
import { initHeroAnimation, initMagneticButtons } from './animations.js';
import { initScrollAnimations, initParallax, initScrollProgress } from './scroll.js';
import { initForm }             from './form.js';
import { identity, contact, projects, skills, services, process } from './data.js';

/* ----------------------------------------------------------
   RENDER — projets
   ---------------------------------------------------------- */
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map((p, i) => `
    <a href="project.html?id=${p.id}"
       class="project-item reveal"
       style="transition-delay:${i * 0.06}s"
       data-cursor-hover>
      <div class="project-item__image">
        <img src="${p.image}" alt="${p.title}" loading="lazy" data-parallax="0.07">
      </div>
      <div class="project-item__content">
        <p class="project-item__number">0${i + 1} / 0${projects.length}</p>
        <h3 class="project-item__title">${p.title}</h3>
        <p class="project-item__subtitle">${p.subtitle}</p>
        <div class="project-item__tags">
          ${p.tags.map(t => `<span class="project-item__tag">${t}</span>`).join('')}
        </div>
        <p class="project-item__year">${p.year}</p>
        <span class="project-item__cta">
          Voir le projet <span class="arrow">→</span>
        </span>
      </div>
    </a>
  `).join('');
}

/* ----------------------------------------------------------
   RENDER — compétences
   ---------------------------------------------------------- */
function renderSkills() {
  const list = document.getElementById('skills-list');
  if (!list) return;

  const icons = ['🎨', '✏️', '🎬', '🤖'];

  list.innerHTML = skills.map((s, i) => `
    <div class="skill-item reveal" style="transition-delay:${i * 0.08}s" data-cursor-hover>
      <span class="skill-item__number">${s.number}</span>
      <span class="skill-item__name">${s.tool}</span>
      <div class="skill-item__abilities" aria-hidden="true">
        ${s.abilities.map(a => `<span class="skill-item__ability">${a}</span>`).join('')}
      </div>
      <div class="skill-item__icon" aria-hidden="true">${icons[i] || '⚡'}</div>
    </div>
  `).join('');
}

/* ----------------------------------------------------------
   RENDER — services
   ---------------------------------------------------------- */
function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  grid.innerHTML = services.map((s) => `
    <div class="service-card reveal" data-cursor-hover>
      <span class="service-card__number">${s.number}</span>
      <h3 class="service-card__title">${s.title}</h3>
      <ul class="service-card__list">
        ${s.items.map(item => `<li class="service-card__list-item">${item}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

/* ----------------------------------------------------------
   RENDER — processus
   ---------------------------------------------------------- */
function renderProcess() {
  const steps = document.getElementById('process-steps');
  if (!steps) return;

  steps.innerHTML = process.map((s, i) => `
    <div class="process-step reveal" style="transition-delay:${i * 0.1}s">
      <div class="process-step__indicator"></div>
      <p class="process-step__number">${s.number}</p>
      <h3 class="process-step__title">${s.title}</h3>
      <p class="process-step__desc">${s.description}</p>
    </div>
  `).join('');
}

/* ----------------------------------------------------------
   RENDER — réseaux sociaux
   ---------------------------------------------------------- */
function renderSocials() {
  const container = document.getElementById('socials-list');
  if (!container) return;

  const socialItems = [
    {
      icon: '📧',
      label: 'Email',
      value: contact.email || 'À renseigner dans data.js',
      href: contact.email ? `mailto:${contact.email}` : '#',
    },
    {
      icon: '💬',
      label: 'WhatsApp',
      value: contact.whatsapp || 'À renseigner dans data.js',
      href: contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g,'')}` : '#',
    },
    {
      icon: '📸',
      label: 'Instagram',
      value: contact.instagram ? '@' + contact.instagram.split('/').pop() : 'À renseigner dans data.js',
      href: contact.instagram || '#',
    },
    {
      icon: '🎨',
      label: 'Behance',
      value: contact.behance ? contact.behance.replace('https://','') : 'À renseigner dans data.js',
      href: contact.behance || '#',
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      value: contact.linkedin ? contact.linkedin.replace('https://','') : 'À renseigner dans data.js',
      href: contact.linkedin || '#',
    },
  ];

  container.innerHTML = socialItems.map((s) => `
    <a href="${s.href}"
       class="social-link"
       target="_blank"
       rel="noopener noreferrer"
       data-cursor-hover>
      <div class="social-link__icon">${s.icon}</div>
      <span class="social-link__label">${s.label}</span>
      <span class="social-link__value">${s.value}</span>
    </a>
  `).join('');
}

/* ----------------------------------------------------------
   UPDATE — données statiques de la page (identité)
   ---------------------------------------------------------- */
function applyIdentity() {
  document.querySelectorAll('[data-id="name"]').forEach(el => el.textContent = identity.name);
  document.querySelectorAll('[data-id="role"]').forEach(el => el.textContent = identity.role);
  document.querySelectorAll('[data-id="company"]').forEach(el => el.textContent = identity.company);
  document.querySelectorAll('[data-id="logo"]').forEach(el => el.textContent = identity.logo);

  // Dynamic year in footer
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Init
  applyIdentity();
  renderProjects();
  renderSkills();
  renderServices();
  renderProcess();
  renderSocials();

  // Modules
  initCursor();
  initNavbar();
  initHeroAnimation();
  initScrollAnimations();
  initParallax();
  initScrollProgress();
  initMagneticButtons();
  initForm();
});
