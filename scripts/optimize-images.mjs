// Prépare les images à partir des originaux. À lancer après l'ajout d'un projet ou d'un logo :
//   npm i --no-save sharp@0.34.4 && node scripts/optimize-images.mjs
// - logos clients : WebP 400 px de large → public/assets/clients/*.webp, dimensions dans data/clients.json
// - projets : WebP 1920 px pour la visionneuse quand l'original est plus grand que 1280 px
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
