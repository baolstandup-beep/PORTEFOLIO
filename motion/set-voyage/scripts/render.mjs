// Rend toutes les vidéos (ou des images clés avec --stills) dans out/.
// Navigateur : REMOTION_BROWSER, sinon le Chromium headless de Playwright s'il existe.
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'out');
mkdirSync(out, {recursive: true});

const playwright = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = process.env.REMOTION_BROWSER ?? (existsSync(playwright) ? playwright : null);

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--only='))?.slice(7);

const JOBS = [
  {id: 'SetVoyage-16x9', file: 'set-voyage-16x9-1080p.mp4', codec: 'h264'},
  {id: 'SetVoyage-9x16', file: 'set-voyage-9x16-tiktok.mp4', codec: 'h264'},
  {id: 'SetVoyage-16x9-Alpha', file: 'set-voyage-16x9-alpha.webm', codec: 'vp9'},
  {id: 'SetVoyage-9x16-Alpha', file: 'set-voyage-9x16-alpha.webm', codec: 'vp9'},
  // ProRes 4444 avec alpha pour le montage (lourd, non versionné) : --prores
  ...(args.includes('--prores')
    ? [{id: 'SetVoyage-16x9-Alpha', file: 'set-voyage-16x9-alpha.mov', codec: 'prores'}]
    : []),
];

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const common = {serveUrl, browserExecutable, chromiumOptions: {gl: 'swangle'}};

if (args.includes('--stills')) {
  const frames = (args.find((a) => a.startsWith('--frames='))?.slice(9) ?? '0,20,45,70,90,108,125,145,165,200,230,299')
    .split(',')
    .map(Number);
  for (const id of ['SetVoyage-16x9', 'SetVoyage-9x16']) {
    if (only && id !== only) continue;
    const composition = await selectComposition({...common, id});
    for (const frame of frames) {
      const output = path.join(out, 'frames', `${id}-${String(frame).padStart(3, '0')}.png`);
      await renderStill({...common, composition, frame, output});
      console.log(output);
    }
  }
} else {
  for (const job of JOBS) {
    if (only && job.id !== only) continue;
    const alpha = job.id.endsWith('Alpha');
    const composition = await selectComposition({...common, id: job.id});
    const outputLocation = path.join(out, job.file);
    await renderMedia({
      ...common,
      composition,
      codec: job.codec,
      outputLocation,
      imageFormat: alpha ? 'png' : 'jpeg',
      jpegQuality: 95,
      ...(job.codec === 'h264' ? {crf: 16, pixelFormat: 'yuv420p', colorSpace: 'bt709', x264Preset: 'slow'} : {}),
      ...(job.codec === 'vp9' ? {crf: 24, pixelFormat: 'yuva420p'} : {}),
      ...(job.codec === 'prores' ? {proResProfile: '4444', pixelFormat: 'yuva444p10le'} : {}),
      onProgress: ({progress}) => process.stdout.write(`\r${job.file} ${Math.round(progress * 100)} %`),
    });
    console.log(`\n${outputLocation}`);
  }
}
