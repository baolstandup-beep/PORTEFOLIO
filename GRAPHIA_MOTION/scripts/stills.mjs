// Contrôle qualité : rend des images fixes (un seul bundle) — node scripts/stills.mjs S01-H:40 S02-V:120 …
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const browserExecutable = process.env.REMOTION_CHROME || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
for (const spec of process.argv.slice(2)) {
  const [id, frame] = spec.split(':');
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  const output = path.resolve(`.renders/${id}-${frame}.png`);
  await renderStill({ composition, serveUrl, output, frame: Number(frame), browserExecutable, chromiumOptions: { gl: 'swangle' } });
  console.log(output);
}
