// SCÈNE 01 — INTRODUCTION (0 → 6 s)
// Vue aérienne lente de l'Atlantique de nuit, une pirogue de pêche au loin.
// Le logo PAS-PAS se révèle (masque circulaire), puis « MOUVEMENT « PAS-PAS » / COMMUNIQUÉ OFFICIEL ».
import { W, H, C, E, prog, lerp, pick, portrait, S, T, font, seaAerial, pirogueTop, maskTitle, rule, logo, rgba } from '../../lib/kit.js';

export const DUR = 6;
export const NAME = 'Introduction';

export function draw(ctx, t, IMG) {
  // caméra : lent travelling avant + légère rotation (log-space zoom = vitesse de dolly constante)
  const z = 1.0 * (1.14 / 1.0) ** E.inOutSine(prog(t, 0, DUR + 1));
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.rotate(-0.04 + t * 0.006); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  seaAerial(ctx, t, { base: '#081F31', crest: '#8FB6CF', amp: 0.9 });
  const len = pick({ '16x9': 200, '9x16': 190 });
  pirogueTop(ctx, W * pick({ '16x9': 0.70, '9x16': 0.66 }) + t * 7, H * pick({ '16x9': 0.70, '9x16': 0.78 }) - t * 3, len, -0.42, t);
  ctx.restore();
  // étalonnage nuit : voile bleu nuit, plus dense au centre pour le logo
  ctx.fillStyle = rgba(C.night, 0.22); ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, Math.max(W, H) * 0.55);
  g.addColorStop(0, rgba(C.night, 0.55)); g.addColorStop(1, rgba(C.night, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // logo : révélation circulaire + respiration d'échelle
  const d = pick({ '16x9': 330, '9x16': 440 });
  const cy = pick({ '16x9': H * 0.36, '9x16': H * 0.36 });
  const p = E.outQuint(prog(t, 0.6, 2.2));
  const s = 0.92 + 0.08 * E.outCubic(prog(t, 0.6, 3.2));
  ctx.save(); ctx.translate(W / 2, cy); ctx.scale(s, s); ctx.translate(-W / 2, -cy);
  // halo blanc discret
  const hg = ctx.createRadialGradient(W / 2, cy, d * 0.45, W / 2, cy, d * 0.85);
  hg.addColorStop(0, rgba('#FFFFFF', 0.14 * p)); hg.addColorStop(1, rgba('#FFFFFF', 0));
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
  logo(ctx, IMG.logo, W / 2, cy, d, p, E.outCubic(prog(t, 0.6, 1.6)));
  ctx.restore();

  const ty = cy + d / 2 + pick({ '16x9': 110, '9x16': 150 });
  maskTitle(ctx, ['MOUVEMENT « PAS-PAS »'], { x: W / 2, y: ty, size: pick({ '16x9': 64, '9x16': 66 }), weight: 700, color: C.white, t, t0: 2.0, align: 'center', track: 2 });
  rule(ctx, W / 2 - 60, ty + 34, 120, C.greenLight, t, 2.5, 0.8, 5);
  maskTitle(ctx, ['COMMUNIQUÉ OFFICIEL'], { x: W / 2, y: ty + pick({ '16x9': 90, '9x16': 100 }), size: T.kicker + 4, weight: 500, color: C.blueLight, t, t0: 2.7, align: 'center', track: 8 });
}
