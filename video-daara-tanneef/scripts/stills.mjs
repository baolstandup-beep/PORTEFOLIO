import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
const browserExecutable =
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'DaaraTanneefSansMusique', browserExecutable, inputProps: {withMusic: false}});
for (const fr of frames) {
  await renderStill({composition, serveUrl, frame: Number(fr), output: `${outDir}/f${fr}.jpg`, browserExecutable, imageFormat: 'jpeg', scale: 0.5, inputProps: {withMusic: false}});
  console.log('ok', fr);
}
