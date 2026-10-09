// Build sans dépendance : génère l'accueil, les études de cas, les pages légales et le sitemap dans dist/.
// Usage : node scripts/build.mjs   (SITE_URL pour changer le domaine des URLs canoniques)
import { readFile, writeFile, cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { homePage, casePage, textPage, sitemap } from './lib/pages.mjs';

const root = new URL('..', import.meta.url);
const path = p => fileURLToPath(new URL(p, root));
const readJson = async p => JSON.parse(await readFile(path(p), 'utf8'));
const read = p => readFile(path(p), 'utf8');

const [cases, projects, clients, template] = await Promise.all([
  readJson('data/case-studies.json'),
  readJson('data/projects.json'),
  readJson('data/clients.json'),
  read('src/home.html')
]);

const pages = new Map();
pages.set('index.html', homePage({ template, cases, projects, clients }));
cases.forEach((c, i) => pages.set(`projets/${c.id}/index.html`, casePage(c, i, cases)));
pages.set('mentions-legales.html', textPage({
  path: '/mentions-legales.html',
  title: 'Mentions légales',
  description: 'Éditeur, hébergement et propriété intellectuelle du portfolio de Cheikh Awa Balla Diop.',
  content: await read('src/content/mentions-legales.html')
}));
pages.set('confidentialite.html', textPage({
  path: '/confidentialite.html',
  title: 'Politique de confidentialité',
  description: 'Données collectées par le formulaire de contact, usage, durée de conservation et droits.',
  content: await read('src/content/confidentialite.html')
}));

// Contrôles : aucune variable de gabarit oubliée, aucun fichier ni lien interne manquant.
const ids = new Set(cases.map(c => c.id));
const problems = [];
for (const [file, html] of pages) {
  const leftover = html.match(/\{\{\w+\}\}/);
  if (leftover) problems.push(`${file} : variable non remplacée ${leftover[0]}`);
  for (const [, ref] of html.matchAll(/(?:src|href|data-full)="(\/(?:assets|fonts|downloads)\/[^"?#]+)"/g)) {
    if (!existsSync(path(`public${ref}`))) problems.push(`${file} : fichier introuvable ${ref}`);
  }
  for (const [, ref] of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of ref.split(',')) {
      const url = part.trim().split(' ')[0];
      if (!existsSync(path(`public${url}`))) problems.push(`${file} : image introuvable ${url}`);
    }
  }
  for (const [, id] of html.matchAll(/href="\/projets\/([^/"]+)\/"/g)) {
    if (!ids.has(id)) problems.push(`${file} : étude de cas inexistante /projets/${id}/`);
  }
}
if (problems.length) throw new Error(`Build interrompu :\n  ${[...new Set(problems)].join('\n  ')}`);

await rm(path('dist'), { recursive: true, force: true });
await mkdir(path('dist'), { recursive: true });
await cp(path('public'), path('dist'), { recursive: true });
await cp(path('src/css'), path('dist/css'), { recursive: true });
await cp(path('src/js'), path('dist/js'), { recursive: true });
await cp(path('src/favicon.svg'), path('dist/favicon.svg'));
for (const [file, html] of pages) {
  await mkdir(path(`dist/${file}`).replace(/[^/]+$/, ''), { recursive: true });
  await writeFile(path(`dist/${file}`), html);
}
await writeFile(path('dist/sitemap.xml'), sitemap(cases));

const kb = s => `${(s.length / 1024).toFixed(1)} Ko`;
console.log(`${pages.size} pages générées (accueil ${kb(pages.get('index.html'))}, ${cases.length} études de cas), sitemap à jour.`);
