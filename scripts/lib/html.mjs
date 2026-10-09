// Briques HTML partagées par toutes les pages générées.

export const SITE = {
  url: (process.env.SITE_URL ?? 'https://cabd-portfolio.vercel.app').replace(/\/$/, ''),
  name: 'CABD',
  email: 'contact.baolvision@gmail.com',
  phone: '+221773033196',
  phoneLabel: '+221 77 303 31 96',
  behance: 'https://www.behance.net/cheikhdiop16',
  whatsapp: 'https://wa.me/221773033196?text=' + encodeURIComponent('Bonjour Cheikh Awa Balla, je découvre votre portfolio et je souhaite démarrer un projet.')
};

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const IMG = '/assets/images/optimized';
const publicDir = fileURLToPath(new URL('../../public', import.meta.url));
const has = file => existsSync(`${publicDir}${file}`);

export const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Image responsive à partir des variantes WebP 640 / 1280 (et 1920 si disponible).
export function picture(img, { alt = '', sizes = '100vw', loading = 'lazy', priority = false, className = '' } = {}) {
  const base = `${IMG}/${img.img}`;
  // Variantes disponibles : 640, 960 (si l'original est assez large), 1280 et 1920 pour les grands formats.
  const srcset = [`${base}-640.webp 640w`];
  if (has(`${base}-960.webp`)) srcset.push(`${base}-960.webp 960w`);
  srcset.push(`${base}-1280.webp 1280w`);
  if (img.large) srcset.push(`${base}-1920.webp 1920w`);
  return `<img${className ? ` class="${className}"` : ''} src="${base}-1280.webp" srcset="${srcset.join(', ')}" sizes="${sizes}" width="${img.w}" height="${img.h}" alt="${escape(alt)}" loading="${priority ? 'eager' : loading}" decoding="async"${priority ? ' fetchpriority="high"' : ''}>`;
}

const NAV = [
  ['/#projets', 'Projets', 'projets'],
  ['/#expertise', 'Expertise', 'expertise'],
  ['/#a-propos', 'À propos', 'a-propos'],
  ['/#contact', 'Contact', 'contact']
];

export function header() {
  return `<a class="skip-link" href="#contenu">Aller au contenu</a>
<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="brand" href="/"><strong>CABD</strong><span>/ Creative Direction</span></a>
    <button class="menu-button" type="button" popovertarget="menu"><span class="menu-button__bars" aria-hidden="true"></span>Menu</button>
    <nav id="menu" class="site-nav" popover aria-label="Navigation principale">
      <button class="site-nav__close" type="button" popovertarget="menu" popovertargetaction="hide">Fermer</button>
      <ul>
${NAV.map(([href, label, id]) => `        <li><a href="${href}" data-section="${id}">${label}</a></li>`).join('\n')}
      </ul>
      <a class="button button--dark" href="${SITE.whatsapp}" data-track="whatsapp_header">Démarrer un projet <span aria-hidden="true">↗</span></a>
    </nav>
  </div>
</header>`;
}

export function footer() {
  return `<footer class="site-footer">
  <div class="wrap site-footer__inner">
    <div class="site-footer__id">
      <p class="site-footer__brand">CABD</p>
      <p>Directeur artistique et designer graphique<br>Touba, Sénégal</p>
    </div>
    <nav aria-label="Liens de pied de page">
      <ul>
${NAV.map(([href, label]) => `        <li><a href="${href}">${label}</a></li>`).join('\n')}
      </ul>
      <ul>
        <li><a href="${SITE.behance}" rel="me">Behance</a></li>
        <li><a href="https://wa.me/221773033196">WhatsApp</a></li>
        <li><a href="/downloads/CABD-Portfolio-v1.0.1.apk" download>Application Android</a></li>
      </ul>
      <ul>
        <li><a href="/mentions-legales.html">Mentions légales</a></li>
        <li><a href="/confidentialite.html">Confidentialité</a></li>
      </ul>
    </nav>
    <p class="site-footer__copy">© <span data-year>2026</span> Cheikh Awa Balla Diop, Baol Vision. Tous droits réservés.</p>
  </div>
</footer>`;
}

// Document complet : chaque page fournit son titre, sa description, son URL et son contenu.
export function layout({ title, description, path, body, image, jsonLd, preload = '', bodyClass = '' }) {
  const url = `${SITE.url}${path}`;
  const ogImage = `${SITE.url}${image ?? `${IMG}/project-salixate-1280.webp`}`;
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fr_SN">
  <meta property="og:site_name" content="CABD, Cheikh Awa Balla Diop">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#f6f3ed">
  <meta name="color-scheme" content="light">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/cormorant-garamond-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
${preload}  <link rel="stylesheet" href="/css/styles.css">
  <script type="module" src="/js/main.js"></script>
${jsonLd ? `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n` : ''}</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${header()}
${body}
${footer()}
</body>
</html>
`;
}
