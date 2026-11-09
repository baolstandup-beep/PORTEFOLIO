// SCÈNE 03 — HOMMAGE ET SOLIDARITÉ (14 → 27 s)
// Mer calme, aube désaturée, lumière douce. Recueillement : texte d'hommage puis solidarité.
// Fidélité au communiqué : « au rescapé recensé à ce jour » (singulier) — on n'écrit pas « aux survivants ».
import { W, H, C, E, prog, lerp, pick, portrait, S, T, font, seaHorizon, dunes, maskTitle, revealText, rule, scrim, rgba } from '../../lib/kit.js';

export const DUR = 13;
export const NAME = 'Hommage';

const LOOK = { skyTop: '#2B3B4C', skyBottom: '#A9A79C', seaTop: '#6E7A80', seaBottom: '#1A2833', glint: '#F1E6D2',
  sun: { x: 0.5, y: 0.012, r: 34, color: '#F4E3C4', a: 0.55 } };

export function draw(ctx, t) {
  const hz = pick({ '16x9': 0.56, '9x16': 0.50 });
  const z = 1.0 * (1.08 / 1.0) ** E.inOutSine(prog(t, 0, DUR));
  ctx.save(); ctx.translate(W / 2, H * hz); ctx.scale(z, z); ctx.translate(-W / 2, -H * hz);
  const hy = seaHorizon(ctx, t * 0.7, LOOK, { horizon: hz, drift: 6 });
  dunes(ctx, hy, '#5D6466', -0.05, 0.4, pick({ '16x9': 0.02, '9x16': 0.012 }), 13);
  ctx.restore();
  // étalonnage : désaturation chaude + voile
  ctx.fillStyle = rgba('#0E1A24', 0.30); ctx.fillRect(0, 0, W, H);

  const x = pick({ '16x9': W / 2, '9x16': W / 2 });
  const maxW = pick({ '16x9': 1380, '9x16': S.w - 10 });
  // Partie A : hommage (0.4 → 7.4 s)
  const outA = 7.0;
  scrim(ctx, pick({ '16x9': H * 0.08, '9x16': H * 0.10 }), pick({ '16x9': H * 0.62, '9x16': H * 0.64 }), '#0A141C', 0.0);
  const yA = pick({ '16x9': H * 0.25, '9x16': H * 0.22 });
  maskTitle(ctx, ['HOMMAGE'], { x, y: yA - 40, size: T.kicker, weight: 600, color: C.white, t, t0: 0.3, align: 'center', track: 10, out: outA });
  revealText(ctx, '« Le Mouvement PAS-PAS s’incline devant la mémoire des victimes et présente ses sincères condoléances aux familles endeuillées. »', {
    x, y: yA + T.lead * 1.3, maxW, size: T.lead, weight: 500, color: C.white, accent: '#FFF4DA', highlight: ['victimes', 'familles', 'endeuillées'],
    t, t0: 0.7, per: 0.13, dur: 0.9, align: 'center', lh: 1.34, out: outA, outDur: 0.7 });

  // Partie B : solidarité (7.6 → 13 s)
  const yB = pick({ '16x9': H * 0.25, '9x16': H * 0.24 });
  maskTitle(ctx, ['SOLIDARITÉ'], { x, y: yB, size: T.title, weight: 800, color: C.white, t, t0: 7.6, align: 'center', out: 12.4 });
  rule(ctx, x - 70, yB + 42, 140, C.green, t, 8.0, 0.8, 6);
  revealText(ctx, 'au rescapé, aux proches qui attendent encore des nouvelles et aux populations de Léona et de Thiéppe.', {
    x, y: yB + pick({ '16x9': 130, '9x16': 150 }), maxW: pick({ '16x9': 1300, '9x16': S.w - 10 }), size: T.lead - 4, weight: 500,
    color: C.white, accent: '#FFF4DA', highlight: ['léona', 'thiéppe', 'rescapé'], t, t0: 8.3, per: 0.11, align: 'center', out: 12.4 });
}
