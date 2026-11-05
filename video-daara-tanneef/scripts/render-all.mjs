// Rendu complet : master avec musique, version sans musique, puis déclinaisons plateformes.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const browserExecutable =
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const out = path.resolve('out');
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});

const jobs = [
  {id: 'DaaraTanneef', file: 'daara-tanneef_master_1080x1920.mp4', withMusic: true},
  {id: 'DaaraTanneefSansMusique', file: 'daara-tanneef_sans-musique_1080x1920.mp4', withMusic: false},
];
for (const j of jobs) {
  const inputProps = {withMusic: j.withMusic};
  const composition = await selectComposition({serveUrl, id: j.id, inputProps, browserExecutable});
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    crf: 16,
    pixelFormat: 'yuv420p',
    audioCodec: 'aac',
    audioBitrate: '256k',
    muted: !j.withMusic,
    outputLocation: path.join(out, j.file),
    inputProps,
    browserExecutable,
    concurrency: 4,
    onProgress: ({progress}) => {
      const p = Math.floor(progress * 10);
      if (p !== last) {
        last = p;
        console.log(j.id, `${p * 10}%`);
      }
    },
  });
}

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {stdio: 'inherit'});
const master = path.join(out, jobs[0].file);

// Version sans musique : piste audio silencieuse (certaines plateformes refusent une vidéo sans piste audio)
const silent = path.join(out, jobs[1].file);
const tmp = path.join(out, 'tmp-silent.mp4');
ff(['-i', silent, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', tmp]);
fs.renameSync(tmp, silent);

// Instagram Reels / TikTok / Facebook Reels : 1080x1920, H.264 High 4.1, ~8 Mb/s, AAC 48 kHz, faststart
ff(['-i', master, '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.1', '-preset', 'slow', '-crf', '19',
  '-maxrate', '8M', '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-r', '30', '-g', '60',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart',
  path.join(out, 'daara-tanneef_reseaux-sociaux_instagram-tiktok-facebook.mp4')]);

// WhatsApp (statut + envoi) : 720x1280, H.264 Main, < 16 Mo, AAC 128k
ff(['-i', master, '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-profile:v', 'main', '-level', '3.1',
  '-preset', 'slow', '-b:v', '2200k', '-maxrate', '2600k', '-bufsize', '5M', '-pix_fmt', 'yuv420p', '-r', '30',
  '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-movflags', '+faststart',
  path.join(out, 'daara-tanneef_whatsapp_720x1280.mp4')]);

console.log('Terminé :', fs.readdirSync(out).join(', '));
