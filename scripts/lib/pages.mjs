import { SITE, IMG, escape, picture, layout } from './html.mjs';

const lightbox = `<dialog class="lightbox" aria-labelledby="lightbox-title">
  <div class="lightbox__frame">
    <img class="lightbox__img" alt="">
    <div class="lightbox__bar">
      <p class="lightbox__title" id="lightbox-title"></p>
      <p class="lightbox__count" aria-live="polite"></p>
      <a class="lightbox__case" href="/#projets" hidden>Voir l'étude de cas <span aria-hidden="true">↗</span></a>
      <div class="lightbox__nav">
        <button type="button" data-lb="prev" aria-label="Image précédente">←</button>
        <button type="button" data-lb="next" aria-label="Image suivante">→</button>
        <button type="button" data-lb="close" autofocus>Fermer</button>
      </div>
    </div>
  </div>
</dialog>`;

const caseUrl = id => `/projets/${id}/`;

// ---------- Accueil ----------

// Projets phares : polaroïds scotchés, légende manuscrite, lien vers l'étude de cas.
function polaroid(c, i) {
  const img = c.images.find(x => x.w >= x.h) ?? c.images[0];
  return `      <li class="polaroid polaroid--${(i % 3) + 1}">
        <a href="${caseUrl(c.id)}">
          <span class="tape" aria-hidden="true"></span>
          <span class="polaroid__img">${picture(img, { alt: img.alt, sizes: '(min-width: 1000px) 360px, (min-width: 640px) 45vw, calc(100vw - 3rem)' })}</span>
          <span class="polaroid__caption"><span class="polaroid__name">${escape(c.name)}</span><span class="polaroid__cat">${escape(c.category)}${c.year ? `, ${escape(c.year)}` : ''}</span></span>
        </a>
      </li>`;
}

// Papiers déchirés de l'affiche : projets récents réels, reliés à leur étude de cas.
const scrap = (c, i) => `      <li class="scrap scrap--${i + 2}">
        <a href="${caseUrl(c.id)}">
          <span class="scrap__role">${escape(c.category)}</span>
          <span class="scrap__org">${escape(c.name)}${c.year && !c.name.includes(c.year) ? ` (${escape(c.year)})` : ''}</span>
          <span class="scrap__text">${escape(c.summary)}</span>
        </a>
      </li>`;

function archiveCard(p, i) {
  const img = { img: p.img, w: p.w, h: p.h, large: p.large };
  const full = `${IMG}/${p.img}-${p.large ? 1920 : 1280}.webp`;
  return `        <li class="work" data-cat="${p.cat.join(' ')}">
          <button type="button" class="work__open" data-full="${full}" data-title="${escape(p.title)}"${p.case ? ` data-case="${caseUrl(p.case)}"` : ''}>
            ${picture(img, { alt: p.alt, sizes: '(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw', loading: 'lazy' })}
            <span class="work__meta"><span class="work__name">${escape(p.name)}</span><span class="work__type">${escape(p.tag.split(' · ')[0])}</span></span>
          </button>
        </li>`;
}

const clientLogo = c => `      <li><img src="/assets/clients/${c.file}.webp" alt="${escape(c.name)}" width="${c.w}" height="${c.h}" loading="lazy" decoding="async"></li>`;

export function homePage({ template, cases, projects, clients }) {
  const byId = Object.fromEntries(cases.map(c => [c.id, c]));
  const featured = cases.filter(c => c.featured).sort((a, b) => a.featured - b.featured);
  const sticker = { img: 'cheikh-awa-balla-diop-sticker', w: 1280, h: 1726 };
  const count = cat => projects.filter(p => p.cat.includes(cat)).length;
  const scraps = ['ngs', 'setrans', 'khelcom', 'magal-ngabou'].map(id => byId[id]);

  const body = template
    .replace('{{STICKER}}', picture(sticker, { alt: 'Cheikh Awa Balla Diop, directeur artistique et graphiste', sizes: '(min-width: 1000px) 420px, 80vw', priority: true }))
    .replace('{{SCRAPS}}', scraps.map(scrap).join('\n'))
    .replace('{{FEATURED}}', featured.map(polaroid).join('\n'))
    .replace('{{ARCHIVE}}', projects.map(archiveCard).join('\n'))
    .replace('{{CLIENTS}}', clients.map(clientLogo).join('\n'))
    .replace('{{LIGHTBOX}}', lightbox)
    .replaceAll('{{WHATSAPP}}', escape(SITE.whatsapp))
    .replaceAll('{{COUNT_ALL}}', projects.length)
    .replaceAll('{{COUNT_PRINT}}', count('print'))
    .replaceAll('{{COUNT_DIGITAL}}', count('digital'));

  return layout({
    title: 'CABD, Cheikh Awa Balla Diop : directeur artistique et graphiste à Touba, Sénégal',
    description: 'Identités visuelles, univers de marque, packaging et campagnes conçus à Touba par Cheikh Awa Balla Diop, directeur artistique et fondateur de Baol Vision.',
    path: '/',
    body,
    bodyClass: 'page-home',
    preload: `  <link rel="preload" as="image" href="${IMG}/${sticker.img}-640.webp" imagesrcset="${IMG}/${sticker.img}-640.webp 640w, ${IMG}/${sticker.img}-960.webp 960w, ${IMG}/${sticker.img}-1280.webp 1280w" imagesizes="(min-width: 1000px) 420px, 80vw" fetchpriority="high">\n`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Person', '@id': `${SITE.url}/#person`, name: 'Cheikh Awa Balla Diop', jobTitle: 'Directeur artistique et graphiste', image: `${SITE.url}${IMG}/cheikh-awa-balla-diop-portrait-1280.webp`, url: `${SITE.url}/`, worksFor: { '@id': `${SITE.url}/#business` }, address: { '@type': 'PostalAddress', addressLocality: 'Touba', addressRegion: 'Diourbel', addressCountry: 'SN' }, sameAs: [SITE.behance] },
        { '@type': 'ProfessionalService', '@id': `${SITE.url}/#business`, name: 'Baol Vision', founder: { '@id': `${SITE.url}/#person` }, foundingDate: '2022', url: `${SITE.url}/`, email: SITE.email, telephone: SITE.phone, address: { '@type': 'PostalAddress', addressLocality: 'Touba', addressCountry: 'SN' }, areaServed: [{ '@type': 'City', name: 'Touba' }, { '@type': 'Country', name: 'Sénégal' }], knowsAbout: ['Direction artistique', 'Identité visuelle', 'Design graphique', 'Packaging', 'UI/UX', 'Motion design'] },
        { '@type': 'FAQPage', mainEntity: [
          { '@type': 'Question', name: 'Vous cherchez un graphiste à Touba ?', acceptedAnswer: { '@type': 'Answer', text: 'Je conçois affiches, brochures, packaging et contenus digitaux depuis Touba, avec un accompagnement direct de la définition du besoin à la livraison.' } },
          { '@type': 'Question', name: 'Travaillez-vous partout au Sénégal ?', acceptedAnswer: { '@type': 'Answer', text: "Oui. Les échanges, validations et livraisons se font à distance pour Dakar et toutes les régions du Sénégal, comme pour l'international." } },
          { '@type': 'Question', name: "Que comprend une identité visuelle ?", acceptedAnswer: { '@type': 'Answer', text: "Selon le projet : logo, palette, typographies, règles d'utilisation, applications de marque et fichiers prêts pour le print et le digital." } }
        ] }
      ]
    }
  });
}

// ---------- Études de cas ----------

const STORY = [
  ['description', 'Présentation du projet'],
  ['problem', 'Problématique créative'],
  ['direction', 'Direction artistique'],
  ['approach', 'Concept et choix graphiques'],
  ['deliverables', 'Livrables et applications'],
  ['result', 'Résultat']
];

export function casePage(c, index, cases) {
  const next = cases[(index + 1) % cases.length];
  const [cover, ...rest] = c.images;
  const story = STORY.filter(([key]) => c[key]).map(([key, label]) => `      <section class="story__block reveal">
        <h2>${label}</h2>
        <p>${escape(c[key])}</p>
      </section>`).join('\n');

  const gallery = rest.length ? `  <section class="case__gallery wrap" aria-labelledby="gallery-title">
    <h2 id="gallery-title" class="case__label">Applications et réalisations</h2>
    <ul class="gallery">
${rest.map((img, i) => `      <li class="gallery__item${img.w > img.h * 1.3 ? ' gallery__item--wide' : ''} reveal">
        <button type="button" class="work__open" data-full="${IMG}/${img.img}-${img.large ? 1920 : 1280}.webp" data-title="${escape(`${c.name}, visuel ${i + 2}`)}">
          ${picture(img, { alt: img.alt, sizes: '(min-width: 900px) 50vw, 100vw' })}
        </button>
      </li>`).join('\n')}
    </ul>
  </section>` : '';

  const body = `<main id="contenu" class="case" data-gallery>
  <header class="case__head wrap">
    <a class="link-arrow link-arrow--back" href="/#projets"><span aria-hidden="true">←</span> Tous les projets</a>
    <p class="eyebrow">${escape(c.category)}${c.year ? ` · ${escape(c.year)}` : ''}</p>
    <h1 class="case__title">${escape(c.name)}</h1>
    <p class="case__summary">${escape(c.summary)}</p>
    <dl class="case__meta">
      <div><dt>Client</dt><dd>${escape(c.client)}</dd></div>
      <div><dt>Contribution</dt><dd>${escape(c.role)}</dd></div>
      ${c.year ? `<div><dt>Année</dt><dd>${escape(c.year)}</dd></div>` : ''}
      <div><dt>Domaine</dt><dd>${escape(c.type)}</dd></div>
    </dl>
  </header>

  <figure class="case__cover wrap">
    <button type="button" class="work__open" data-full="${IMG}/${cover.img}-${cover.large ? 1920 : 1280}.webp" data-title="${escape(c.name)}">
      ${picture(cover, { alt: cover.alt, sizes: '(min-width: 1320px) 1240px, 100vw', priority: true })}
    </button>
  </figure>

  <div class="story wrap">
${story}
  </div>

${gallery}

  <nav class="case__next" aria-label="Projet suivant">
    <a class="wrap case__next-link" href="${caseUrl(next.id)}">
      <span class="eyebrow">Projet suivant</span>
      <span class="case__next-name">${escape(next.name)} <span aria-hidden="true">→</span></span>
      <span class="case__next-cat">${escape(next.category)}</span>
    </a>
  </nav>
</main>

${lightbox}`;

  return layout({
    title: `${c.name} : ${c.category.toLowerCase()} | CABD, Cheikh Awa Balla Diop`,
    description: `${c.summary}. ${c.role} pour ${c.client}${c.year ? `, ${c.year}` : ''}.`,
    path: caseUrl(c.id),
    image: `${IMG}/${cover.img}-1280.webp`,
    body,
    bodyClass: 'page-case',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: c.name,
      description: c.description ?? c.summary,
      creator: { '@type': 'Person', name: 'Cheikh Awa Balla Diop', url: `${SITE.url}/` },
      dateCreated: c.year,
      image: c.images.map(img => `${SITE.url}${IMG}/${img.img}-1280.webp`),
      url: `${SITE.url}${caseUrl(c.id)}`
    }
  });
}

// ---------- Pages légales ----------

export function textPage({ path, title, description, content }) {
  return layout({
    title: `${title} | CABD`,
    description,
    path,
    bodyClass: 'page-text',
    body: `<main id="contenu" class="text-page wrap">
${content}
</main>`
  });
}

export function sitemap(cases) {
  const urls = ['/', ...cases.map(c => caseUrl(c.id)), '/mentions-legales.html', '/confidentialite.html'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE.url}${u}</loc></url>`).join('\n')}
</urlset>
`;
}
