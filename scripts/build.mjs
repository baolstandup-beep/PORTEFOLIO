// Build sans dépendance : injecte les données dans src/index.html et assemble le site dans dist/.
// Usage : node scripts/build.mjs
//   SITE_URL   URL publique, pour canonical / Open Graph (défaut : https://cabd-portfolio.vercel.app)
//   ASSET_BASE préfixe des images (vide par défaut ; utile pour pointer vers un autre hébergement)
import { readFile, writeFile, cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
const path = p => fileURLToPath(new URL(p, root));

const SITE_URL = (process.env.SITE_URL ?? 'https://cabd-portfolio.vercel.app').replace(/\/$/, '');
const ASSET = (process.env.ASSET_BASE ?? '').replace(/\/$/, '');
const IMG = '/assets/images/optimized';

const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const readJson = async p => JSON.parse(await readFile(path(p), 'utf8'));

const projects = await readJson('data/projects.json');
const clients = await readJson('data/clients.json');
const cases = await readJson('data/cases.json');

// Chaque fichier référencé doit exister dans public/, sinon le build échoue au lieu de publier une image cassée.
const referenced = new Set();
const asset = file => { referenced.add(file); return `${ASSET}${file}`; };

const arrow = '<svg class="icon card__arrow" aria-hidden="true"><use href="#i-arrow"/></svg>';

const projectCard = (p, i) => {
  const type = p.tag.split(' · ')[0];
  const small = asset(`${IMG}/${p.img}-640.webp`);
  const medium = asset(`${IMG}/${p.img}-1280.webp`);
  const full = p.large ? asset(`${IMG}/${p.img}-1920.webp`) : medium;
  const loading = i < 4 ? 'eager' : 'lazy';
  return `        <li class="work" data-cat="${p.cat.join(' ')}">
          <button type="button" class="card work__open" data-full="${full}" data-title="${escape(p.title)}"${p.case ? ` data-case="/project.html?id=${escape(p.case)}"` : ''}>
            <img src="${small}" srcset="${small} 640w, ${medium} 1280w" sizes="(min-width: 700px) 300px, 50vw" width="${p.w}" height="${p.h}" alt="${escape(p.alt)}" loading="${loading}" decoding="async">
            ${arrow}
            <span class="card__text"><span class="card__name">${escape(p.name)}</span><span class="card__desc">${escape(type)}</span></span>
          </button>
        </li>`;
};

const caseCard = c => `            <li><a class="card" href="/project.html?id=${escape(c.id)}">
              <img src="${asset(`${IMG}/${c.img}-640.webp`)}" width="${c.w}" height="${c.h}" alt="" loading="lazy" decoding="async">
              ${arrow}
              <span class="card__text"><span class="card__name">${escape(c.name)}</span><span class="card__desc">${escape(c.summary)}</span></span>
            </a></li>`;

const clientLogo = c =>
  `        <li><img src="${asset(`/assets/clients/${c.file}.webp`)}" alt="${escape(c.name)}" width="${c.w}" height="${c.h}" loading="lazy" decoding="async"></li>`;

const count = cat => projects.filter(p => p.cat.includes(cat)).length;

let html = await readFile(path('src/index.html'), 'utf8');
html = html
  .replace('{{PROJECTS}}', projects.map(projectCard).join('\n'))
  .replace('{{CLIENTS}}', clients.map(clientLogo).join('\n'))
  .replace('{{CASES}}', cases.map(caseCard).join('\n'))
  .replaceAll('{{COUNT_ALL}}', projects.length)
  .replaceAll('{{COUNT_PRINT}}', count('print'))
  .replaceAll('{{COUNT_DIGITAL}}', count('digital'))
  .replaceAll('{{SITE_URL}}', SITE_URL)
  .replaceAll('{{ASSET}}', ASSET);

const leftover = html.match(/\{\{\w+\}\}/);
if (leftover) throw new Error(`Variable de gabarit non remplacée : ${leftover[0]}`);

for (const [, file] of html.matchAll(/(?:src|href)="(\/(?:assets|fonts)\/[^"?#]+)"/g)) referenced.add(file);
const missing = [...referenced].filter(file => !existsSync(path(`public${file}`)));
if (missing.length) throw new Error(`Fichiers introuvables dans public/ :\n  ${missing.join('\n  ')}`);

await rm(path('dist'), { recursive: true, force: true });
await mkdir(path('dist'), { recursive: true });
// public/ est copié tel quel : images, polices, APK, pages légales, études de cas.
await cp(path('public'), path('dist'), { recursive: true });
await cp(path('src/css'), path('dist/css'), { recursive: true });
await cp(path('src/js'), path('dist/js'), { recursive: true });
await cp(path('src/favicon.svg'), path('dist/favicon.svg'));
await writeFile(path('dist/index.html'), html);
console.log(`dist/index.html : ${projects.length} projets, ${clients.length} logos, ${referenced.size} fichiers vérifiés, ${(html.length / 1024).toFixed(1)} Ko`);
