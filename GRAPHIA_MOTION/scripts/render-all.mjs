// Rendu des films : node scripts/render-all.mjs [GRAPHIA-60-H GRAPHIA-60-V GRAPHIA-30-H GRAPHIA-30-V]
// Sortie brute dans out/, puis scripts/export.sh range les livrables dans exports/.
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const browserExecutable = process.env.REMOTION_CHROME || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['GRAPHIA-60-H', 'GRAPHIA-60-V', 'GRAPHIA-30-H', 'GRAPHIA-30-V'];
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  const outputLocation = path.resolve(`out/${id}.mp4`);
  const t0 = Date.now();
  let last = -1;
  await renderMedia({
    composition, serveUrl, outputLocation, browserExecutable,
    codec: 'h264', crf: 17, pixelFormat: 'yuv420p', x264Preset: 'medium',
    audioCodec: 'aac', audioBitrate: '256k',
    imageFormat: 'jpeg', jpegQuality: 95, concurrency: 4,
    chromiumOptions: { gl: 'swangle' },
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 10);
      if (p !== last) { last = p; process.stdout.write(`${id} ${p * 10}%\n`); }
    },
  });
  console.log(`${id} terminé en ${((Date.now() - t0) / 1000).toFixed(0)} s → ${outputLocation}`);
}
