// Prépare les images à partir des originaux. À lancer après l'ajout d'un projet ou d'un logo :
//   npm i --no-save sharp@0.34.4 && node scripts/optimize-images.mjs
// - logos clients : WebP 400 px de large → public/assets/clients/*.webp, dimensions dans data/clients.json
// - projets : WebP 1920 px pour la visionneuse quand l'original est plus grand que 1280 px
// - toutes les images : variante 960 px pour les téléphones
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('..', import.meta.url);
const path = p => fileURLToPath(new URL(p, root));
const kb = bytes => `${Math.round(bytes / 1024)} Ko`;

// Logos clients
const clients = JSON.parse(await readFile(path('data/clients.json'), 'utf8'));
for (const client of clients) {
  const source = path(`public/assets/clients/${client.file}.jpg`);
  const target = path(`public/assets/clients/${client.file}.webp`);
  const info = await sharp(source).resize({ width: 400, withoutEnlargement: true }).webp({ quality: 82 }).toFile(target);
  Object.assign(client, { w: info.width, h: info.height });
  console.log(`logo ${client.file} : ${kb((await stat(source)).size)} → ${kb(info.size)}`);
}
await writeFile(path('data/clients.json'), `${JSON.stringify(clients, null, 2)}\n`);

// Variantes intermédiaires 960 px (téléphones à haute densité), pour toute image 1280 assez large
for (const file of (await readdir(path('public/assets/images/optimized'))).filter(f => f.endsWith('-1280.webp'))) {
  const source = path(`public/assets/images/optimized/${file}`);
  const target = source.replace('-1280.webp', '-960.webp');
  if (existsSync(target) || (await sharp(source).metadata()).width <= 1000) continue;
  await sharp(source).resize({ width: 960 }).webp({ quality: 78 }).toFile(target);
  console.log(`variante 960 : ${file.replace('-1280.webp', '')}`);
}

// Grandes versions des projets
const originals = await readdir(path('public/assets/images'));
const projects = JSON.parse(await readFile(path('data/projects.json'), 'utf8'));
for (const project of projects) {
  const original = originals.find(f => f.replace(/\.(jpe?g|png|avif|webp)$/i, '') === project.img);
  delete project.large;
  if (!original) continue;
  const source = path(`public/assets/images/${original}`);
  const { width } = await sharp(source).metadata();
  if (width <= 1280) continue;
  const target = path(`public/assets/images/optimized/${project.img}-1920.webp`);
  if (!existsSync(target)) {
    const info = await sharp(source).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80 }).toFile(target);
    console.log(`grand format ${project.img} : ${info.width} px, ${kb(info.size)}`);
  }
  project.large = true;
}
await writeFile(path('data/projects.json'), `${JSON.stringify(projects, null, 2)}\n`);
