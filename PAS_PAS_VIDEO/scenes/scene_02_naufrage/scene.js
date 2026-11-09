// SCÈNE 02 — ANNONCE DU DRAME (6 → 14 s)
// Horizon de l'Atlantique au crépuscule, dunes de Lompoul à l'horizon, une pirogue isolée au loin.
// Titre : NAUFRAGE AU LARGE DE LOMPOUL / sous-titre.
import { W, H, C, E, prog, lerp, pick, portrait, S, T, font, seaHorizon, dunes, pirogueSide, maskTitle, revealText, rule, scrim, rgba } from '../../lib/kit.js';

export const DUR = 8;
export const NAME = 'Naufrage';

const LOOK = { skyTop: '#0A1826', skyBottom: '#3B4A57', seaTop: '#26394A', seaBottom: '#07131E', glint: '#B9CBD8',
  sun: { x: 0.30, y: 0.03, r: 26, color: '#E7D2B0', a: 0.35 } };

export function draw(ctx, t) {
  // caméra : lente montée (parallaxe horizon / premier plan)
  const hz = lerp(0.50, 0.46, E.inOutSine(prog(t, 0, DUR)));
  const z = 1.06 * (1.0 / 1.06) ** E.inOutSine(prog(t, 0, DUR));
  ctx.save(); ctx.translate(W / 2, H * hz); ctx.scale(z, z); ctx.translate(-W / 2, -H * hz);
  const hy = seaHorizon(ctx, t, LOOK, { horizon: hz, drift: 14 });
  dunes(ctx, hy, '#17232E', 0.52, 1.08, pick({ '16x9': 0.045, '9x16': 0.022 }), 5);
  dunes(ctx, hy, '#1E2B36', 0.70, 1.1, pick({ '16x9': 0.028, '9x16': 0.014 }), 9);
  ctx.restore();
  const bx = W * pick({ '16x9': 0.36, '9x16': 0.42 }) + t * 4;
  pirogueSide(ctx, bx, H * hz + pick({ '16x9': 30, '9x16': 26 }), pick({ '16x9': 120, '9x16': 110 }), '#0B141C', t, 0.95);

  // texte
  const base = pick({ '16x9': H * 0.66, '9x16': H * 0.60 });
  scrim(ctx, base - pick({ '16x9': 260, '9x16': 360 }), H, '#03080D', 0.62);
  const x = pick({ '16x9': S.x + 40, '9x16': S.x + 8 });
  const size = T.title;
  const lines = portrait ? ['NAUFRAGE', 'AU LARGE', 'DE LOMPOUL'] : ['NAUFRAGE AU LARGE', 'DE LOMPOUL'];
  const ty = base - (portrait ? size * 1.2 : size * 0.4);
  ctx.fillStyle = C.greenLight;
  maskTitle(ctx, ['DÉPARTEMENT DE KÉBÉMER'], { x, y: ty - size * 1.0, size: T.kicker, weight: 600, color: C.greenLight, t, t0: 0.6, track: 5 });
  maskTitle(ctx, lines, { x, y: ty, size, weight: 800, color: C.white, t, t0: 1.0, stagger: 0.2 });
  const after = ty + (lines.length - 1) * size * 1.08;
  rule(ctx, x, after + 44, pick({ '16x9': 180, '9x16': 160 }), C.green, t, 2.2, 0.9, 7);
  revealText(ctx, 'Un drame humain qui interpelle notre conscience collective.', {
    x, y: after + pick({ '16x9': 120, '9x16': 130 }), maxW: pick({ '16x9': 1100, '9x16': S.w - 20 }), size: T.lead - 8, weight: 400,
    color: rgba(C.white, 0.92), t, t0: 2.8, per: 0.09 });
}
