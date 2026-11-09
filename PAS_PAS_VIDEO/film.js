// COMPOSITION FINALE — timeline de montage qui assemble les 6 scènes.
// Chaque scène vit dans scenes/<dossier>/scene.js et se modifie indépendamment (temps local 0..DUR).
// Les transitions sont gérées ici : la scène sortante et l'entrante sont peintes dans deux tampons
// puis composées (fondu, fondu au noir, volet lumineux, masque circulaire).
import * as M from './lib/motion.js';
import { C, rgba } from './lib/kit.js';
import * as S1 from './scenes/scene_01_intro/scene.js';
import * as S2 from './scenes/scene_02_naufrage/scene.js';
import * as S3 from './scenes/scene_03_hommage/scene.js';
import * as S4 from './scenes/scene_04_solidarite/scene.js';
import * as S5 from './scenes/scene_05_prevention/scene.js';
import * as S6 from './scenes/scene_06_conclusion/scene.js';

const { W, H, E, prog, hash01 } = M;

// [module, transition vers la scène suivante, durée de la transition en s]
const TIMELINE = [
  [S1, 'dissolve', 1.2],
  [S2, 'dissolve', 1.4],
  [S3, 'dip', 1.2],
  [S4, 'light', 1.2],
  [S5, 'iris', 1.0],
  [S6, null, 0],
];
// début de chaque scène sur la timeline (s) : 0, 6, 14, 27, 39, 50
const STARTS = []; { let a = 0; for (const [m] of TIMELINE) { STARTS.push(a); a += m.DUR; } }
export const TOTAL = STARTS[STARTS.length - 1] + TIMELINE[TIMELINE.length - 1][0].DUR;

// Accents sonores synchronisés à l'image (lus par sound_design/score.py via out/.../hits.json)
const HITS = [
  [0.0, 'ouverture océan', 'swell'],
  [0.7, 'logo révélé', 'bell'],
  [6.0, 'titre naufrage', 'low'],
  [14.0, 'hommage', 'bell'],
  [21.6, 'solidarité', 'bell'],
  [27.0, 'mobilisation', 'low'],
  [39.0, 'prévention : la lumière revient', 'rise'],
  [50.0, 'logo final', 'bell'],
  [57.4, 'ensemble', 'bell'],
];

let A, B, actx, bctx;
const paint = (ctx, i, tl, IMG) => {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  TIMELINE[i][0].draw(ctx, tl, IMG);
  ctx.restore();
};

function compose(ctx, t, IMG) {
  // scène active
  let i = 0; while (i < TIMELINE.length - 1 && t >= STARTS[i + 1]) i++;
  const tl = t - STARTS[i];
  // transition sortante en cours ? (centrée sur la coupe : la moitié avant, la moitié après)
  const prev = i > 0 ? TIMELINE[i - 1] : null;
  const half = prev ? prev[2] / 2 : 0;
  if (prev && tl < half) return transition(ctx, prev[1], (tl + half) / prev[2], i - 1, prev[0].DUR + tl, i, tl, IMG);
  const cur = TIMELINE[i];
  if (cur[1] && tl > cur[0].DUR - cur[2] / 2) return transition(ctx, cur[1], (tl - (cur[0].DUR - cur[2] / 2)) / cur[2], i, tl, i + 1, tl - cur[0].DUR, IMG);
  paint(ctx, i, tl, IMG);
}

function transition(ctx, kind, p, ia, ta, ib, tb, IMG) {
  // temps local de la scène sortante (ta) et entrante (tb, peut être négatif : l'entrante est « pré-roulée »)
  paint(actx, ia, ta, IMG);
  paint(bctx, ib, Math.max(tb, -2), IMG);
  const e = E.inOutCubic(Math.min(1, Math.max(0, p)));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (kind === 'dissolve') {
    ctx.globalAlpha = 1; ctx.drawImage(A, 0, 0); ctx.globalAlpha = e; ctx.drawImage(B, 0, 0);
  } else if (kind === 'dip') {
    // fondu au noir, respiration de recueillement
    if (p < 0.5) { ctx.drawImage(A, 0, 0); ctx.fillStyle = rgba('#000000', E.inOutCubic(p * 2)); ctx.fillRect(0, 0, W, H); }
    else { ctx.drawImage(B, 0, 0); ctx.fillStyle = rgba('#000000', 1 - E.inOutCubic((p - 0.5) * 2)); ctx.fillRect(0, 0, W, H); }
  } else if (kind === 'light') {
    // volet lumineux diagonal : la nuit laisse place à l'aube
    ctx.drawImage(A, 0, 0);
    const x = -W * 0.4 + e * W * 1.8;
    ctx.save(); ctx.beginPath(); ctx.moveTo(x - W * 0.3, 0); ctx.lineTo(-W, 0); ctx.lineTo(-W, H); ctx.lineTo(x - W * 0.6, H); ctx.closePath(); ctx.clip();
    ctx.drawImage(B, 0, 0); ctx.restore();
    const g = ctx.createLinearGradient(x - W * 0.45, 0, x - W * 0.15, 0);
    g.addColorStop(0, rgba('#F6E7C8', 0)); g.addColorStop(0.5, rgba('#F6E7C8', 0.35 * Math.sin(Math.PI * e))); g.addColorStop(1, rgba('#F6E7C8', 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else if (kind === 'iris') {
    // masque circulaire blanc depuis le centre (annonce le logo)
    ctx.drawImage(A, 0, 0);
    const r = Math.hypot(W, H) * 0.6 * E.inOutCubic(p);
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H * 0.4, r, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
  }
  ctx.restore();
}

// grain argentique + vignette (étalonnage commun), après le flou de bouger
let GRAIN = [];
function post(ctx, u, t) {
  const g = GRAIN[Math.floor(t * 30) % GRAIN.length];
  ctx.globalAlpha = t > 50.5 ? 0.025 : 0.06; ctx.drawImage(g, 0, 0, W, H); ctx.globalAlpha = 1;
  const va = 1 - prog(t, 49.4, 50.4);
  if (va > 0) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${0.45 * va})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  // fondu d'ouverture et de fermeture
  const fin = 1 - E.outCubic(prog(t, 0, 0.8));
  if (fin > 0) { ctx.fillStyle = `rgba(0,0,0,${fin})`; ctx.fillRect(0, 0, W, H); }
}

M.film({
  fonts: ['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '700 40px Poppins', '800 40px Poppins'],
  images: { logo: 'assets/logo/logo_pas_pas_cercle.png' },
  hits: HITS.map(([s, l, k]) => [s, l, k]),
  samples: 4,
  init() {
    A = document.createElement('canvas'); A.width = W; A.height = H; actx = A.getContext('2d');
    B = document.createElement('canvas'); B.width = W; B.height = H; bctx = B.getContext('2d');
    // 6 tuiles de grain, graine fixe (déterministe)
    for (let k = 0; k < 6; k++) {
      const c = document.createElement('canvas'); c.width = 480; c.height = 480 * H / W | 0;
      const x = c.getContext('2d'); const im = x.createImageData(c.width, c.height);
      const rnd = M.mulberry32(1000 + k);
      for (let i = 0; i < im.data.length; i += 4) { const v = rnd() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      x.putImageData(im, 0, 0); GRAIN.push(c);
    }
  },
  draw(ctx, u, t, IMG) { compose(ctx, Math.min(t, TOTAL - 0.001), IMG); },
  post,
});
