// SCÈNE 05 — PRÉVENTION ET RESPONSABILITÉ (39 → 50 s)
// La lumière revient. Réseau d'acteurs : chacun dans son rôle, reliés autour de la prévention.
// (Représentation graphique et non photographique : on n'invente pas de « jeunes » ni de réunion fictive.)
import { W, H, C, E, prog, lerp, pick, portrait, S, T, font, maskTitle, revealText, rule, rgba, figure } from '../../lib/kit.js';
import { springU, SPRING, hash01 } from '../../lib/motion.js';

export const DUR = 11;
export const NAME = 'Prévention';

const ACTORS = ['Pouvoirs publics', 'Collectivités territoriales', 'Acteurs économiques', 'Acteurs associatifs', 'Familles', 'Les jeunes eux-mêmes'];

export function draw(ctx, t) {
  // fond : aube qui s'éclaircit (nuit -> bleu doux)
  const k = E.inOutSine(prog(t, 0, 6));
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, lerpHex('#0B1E30', '#1D4F7E', k)); g.addColorStop(1, lerpHex('#081521', '#0F3A4A', k));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const lg = ctx.createRadialGradient(W / 2, H * 1.05, 0, W / 2, H * 1.05, H * 0.9);
  lg.addColorStop(0, rgba('#F2D9A8', 0.30 * k)); lg.addColorStop(1, rgba('#F2D9A8', 0));
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);

  const x = W / 2;
  const yT = pick({ '16x9': H * 0.17, '9x16': S.y + 90 });
  maskTitle(ctx, ['COMPRENDRE', 'POUR PRÉVENIR.'], { x, y: yT, size: pick({ '16x9': 96, '9x16': 100 }), weight: 800, color: C.white, t, t0: 0.3, align: 'center', stagger: 0.22 });
  rule(ctx, x - 70, yT + pick({ '16x9': 140, '9x16': 150 }), 140, C.greenLight, t, 1.2, 0.8, 6);
  revealText(ctx, 'La prévention engage chacun dans son rôle :', { x, y: yT + pick({ '16x9': 215, '9x16': 235 }), maxW: S.w, size: T.body, weight: 500, color: rgba(C.white, 0.92), t, t0: 1.6, per: 0.08, align: 'center' });

  // réseau
  const cx = W / 2, cy = pick({ '16x9': H * 0.70, '9x16': H * 0.63 });
  const rx = pick({ '16x9': 640, '9x16': 300 }), ry = pick({ '16x9': 215, '9x16': 400 });
  const pts = ACTORS.map((_, i) => {
    const a = -Math.PI / 2 + (portrait ? i : i + 0.5) * (Math.PI * 2 / ACTORS.length);
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });
  const t0 = 3.0;
  // liens entre voisins puis vers le centre (on dessine les traits progressivement)
  ctx.lineWidth = 2.5;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const pr = E.inOutCubic(prog(t, t0 + 0.6 + i * 0.25, t0 + 1.4 + i * 0.25));
    if (pr > 0) { ctx.strokeStyle = rgba(C.blueLight, 0.35); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(lerp(p[0], q[0], pr), lerp(p[1], q[1], pr)); ctx.stroke(); }
    const pc = E.inOutCubic(prog(t, t0 + 0.3 + i * 0.25, t0 + 1.1 + i * 0.25));
    if (pc > 0) { ctx.strokeStyle = rgba(C.greenLight, 0.55); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(lerp(cx, p[0], pc), lerp(cy, p[1], pc)); ctx.stroke(); }
  });
  // nœud central : la jeunesse au cœur (silhouettes)
  const cs = springU(t, t0, SPRING.gentle);
  const R = pick({ '16x9': 95, '9x16': 110 }) * cs;
  if (R > 0) {
    ctx.fillStyle = rgba(C.green, 0.95); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba('#FFFFFF', 0.25 + 0.2 * Math.sin(t * 2)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R + 12 + 6 * Math.sin(t * 1.5), 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    for (let i = 0; i < 3; i++) figure(ctx, cx + (i - 1) * R * 0.48, cy + R * 0.62, R * (i === 1 ? 1.15 : 0.95), rgba('#FFFFFF', 0.9), i + 4, t);
    ctx.restore();
  }
  // étiquettes
  pts.forEach((p, i) => {
    const s = springU(t, t0 + 0.5 + i * 0.25, SPRING.snappy);
    if (s <= 0) return;
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(p[0], p[1], 11 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.greenLight; ctx.beginPath(); ctx.arc(p[0], p[1], 5 * s, 0, Math.PI * 2); ctx.fill();
    const size = pick({ '16x9': 38, '9x16': 42 });
    const words = ACTORS[i].split(' ');
    const lines = portrait && words.length > 1 ? [words[0], words.slice(1).join(' ')] : [ACTORS[i]];
    const above = p[1] < cy;
    ctx.font = font(size, 600); ctx.textAlign = 'center'; ctx.globalAlpha = Math.min(1, s);
    lines.forEach((ln, j) => {
      const ly = above ? p[1] - 30 - (lines.length - 1 - j) * size * 1.15 : p[1] + 30 + size + j * size * 1.15;
      ctx.fillStyle = C.white; ctx.fillText(ln, p[0], ly + (1 - s) * 20);
    });
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  });
}

function lerpHex(a, b, k) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
}
