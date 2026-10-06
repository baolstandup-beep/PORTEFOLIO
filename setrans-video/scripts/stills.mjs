// Rend des images fixes de contrôle : node scripts/stills.mjs 90 330 840 ...
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const frames = process.argv.slice(2).map(Number);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: 'SetransFilm', browserExecutable });
for (const frame of frames) {
  const output = `out/stills/f${String(frame).padStart(4, '0')}.jpg`;
  await renderStill({ composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable, scale: 0.5 });
  console.log('ok', output);
}
