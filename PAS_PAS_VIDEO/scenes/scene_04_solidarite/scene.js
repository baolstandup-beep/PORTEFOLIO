// SCÈNE 04 — MOBILISATION (27 → 39 s)
// Rivage de nuit : riverains (silhouettes anonymes) sur la plage, faisceaux de recherche balayant la mer,
// une embarcation de secours éclairée. Aucune scène choquante, aucune victime représentée.
import { W, H, C, E, prog, lerp, pick, portrait, S, T, font, seaHorizon, pirogueSide, figure, maskTitle, revealText, rule, scrim, rgba } from '../../lib/kit.js';
import { hash01 } from '../../lib/motion.js';

export const DUR = 12;
export const NAME = 'Mobilisation';

const LOOK = { skyTop: '#040B13', skyBottom: '#15283A', seaTop: '#132838', seaBottom: '#050C13', glint: '#9FC0D8' };

export function draw(ctx, t) {
  const hz = pick({ '16x9': 0.40, '9x16': 0.36 });
  const pan = lerp(30, -30, E.inOutSine(prog(t, 0, DUR)));     // panoramique latéral lent
  ctx.save(); ctx.translate(pan, 0);
  const hy = seaHorizon(ctx, t, LOOK, { horizon: hz, drift: 20 });
  // faisceaux de recherche depuis la plage
  const beams = [[0.18, 0.9, 0.0], [0.62, 0.85, 1.7], [0.86, 0.95, 3.1]];
  ctx.globalCompositeOperation = 'lighter';
  for (const [bx, sp, ph] of beams) {
    const ox = W * bx, oy = H * pick({ '16x9': 0.80, '9x16': 0.74 });
    const a = -Math.PI / 2 + Math.sin(t * 0.35 * sp + ph) * 0.55;
    const L = H * 0.9, spread = 0.07;
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, L);
    g.addColorStop(0, rgba('#E8F1F8', 0.22)); g.addColorStop(1, rgba('#E8F1F8', 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(a - spread) * L, oy + Math.sin(a - spread) * L);
    ctx.lineTo(ox + Math.cos(a + spread) * L, oy + Math.sin(a + spread) * L);
    ctx.closePath(); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // embarcation de secours au loin avec feu
  const rx = W * 0.55 + t * 10, ry = hy + pick({ '16x9': 60, '9x16': 70 });
  pirogueSide(ctx, rx, ry, pick({ '16x9': 130, '9x16': 120 }), '#0A1018', t);
  const blink = 0.6 + 0.4 * Math.sin(t * 3.2);
  const lg = ctx.createRadialGradient(rx + 30, ry - 22, 0, rx + 30, ry - 22, 40);
  lg.addColorStop(0, rgba('#FFE9B8', 0.9 * blink)); lg.addColorStop(1, rgba('#FFE9B8', 0));
  ctx.fillStyle = lg; ctx.fillRect(rx - 20, ry - 70, 100, 100);
  // plage
  const by = H * pick({ '16x9': 0.80, '9x16': 0.74 });
  const sg = ctx.createLinearGradient(0, by - 20, 0, H);
  sg.addColorStop(0, '#1B2026'); sg.addColorStop(1, '#0B0E12');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.moveTo(-60, by); ctx.quadraticCurveTo(W / 2, by - 30, W + 60, by + 10); ctx.lineTo(W + 60, H); ctx.lineTo(-60, H); ctx.fill();
  // écume du rivage
  ctx.strokeStyle = rgba('#C9DCE8', 0.25 + 0.1 * Math.sin(t * 1.4)); ctx.lineWidth = 2;
  ctx.beginPath(); for (let i = 0; i <= 30; i++) { const x = -60 + (W + 120) * i / 30; const y = by - 8 + Math.sin(i * 0.9 + t * 1.2) * 4 - 15 * Math.sin(i / 30 * Math.PI); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  // riverains debout, de dos, face à la mer
  const n = pick({ '16x9': 14, '9x16': 9 });
  for (let i = 0; i < n; i++) {
    const fx = W * (0.05 + 0.9 * (i + hash01(i, 61) * 0.6) / n);
    const fh = pick({ '16x9': 110, '9x16': 120 }) * (0.85 + hash01(i, 62) * 0.35);
    figure(ctx, fx, by + 18 + hash01(i, 63) * 40, fh, '#05070A', i, t);
  }
  ctx.restore();

  // texte (haut de cadre, sur ciel nocturne)
  const x = pick({ '16x9': S.x + 40, '9x16': S.x + 8 });
  const maxW = pick({ '16x9': 1250, '9x16': S.w - 10 });
  const y0 = pick({ '16x9': H * 0.14, '9x16': S.y + 40 });
  maskTitle(ctx, ['MOBILISATION'], { x, y: y0, size: T.kicker, weight: 600, color: C.greenLight, t, t0: 0.3, track: 10 });
  const a = revealText(ctx, 'Le Mouvement salue la mobilisation des riverains et des équipes de secours.', {
    x, y: y0 + T.lead * 1.35, maxW, size: T.lead, weight: 600, color: C.white, accent: C.greenLight, highlight: ['riverains', 'secours'], t, t0: 0.6, per: 0.1, out: 5.6 });
  revealText(ctx, 'La poursuite des recherches, l’identification des victimes et l’information régulière des familles doivent rester prioritaires.', {
    x, y: y0 + T.lead * 1.35, maxW, size: T.lead - 6, weight: 500, color: C.white, accent: C.blueLight,
    highlight: ['recherches', 'identification', 'information', 'prioritaires'], t, t0: 6.2, per: 0.1, out: 11.4 });
}
