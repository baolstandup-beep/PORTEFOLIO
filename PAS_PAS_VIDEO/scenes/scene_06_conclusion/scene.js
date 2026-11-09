// SCÈNE 06 — ENGAGEMENT DU MOUVEMENT (50 → 60 s)
// Fond blanc lumineux, accents vert et bleu, animation élégante du logo, signature.
import { W, H, C, E, prog, lerp, pick, portrait, S, T, font, maskTitle, revealText, rule, logo, rgba } from '../../lib/kit.js';
import { springU, SPRING } from '../../lib/motion.js';

export const DUR = 10;
export const NAME = 'Conclusion';

export function draw(ctx, t, IMG) {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  // bandeaux de marque (vert / bleu) qui glissent : rappel de l'en-tête du communiqué
  const b = E.outExpo(prog(t, 0.1, 1.2));
  ctx.fillStyle = C.green; ctx.fillRect(0, 0, W * b, pick({ '16x9': 14, '9x16': 16 }));
  ctx.fillStyle = C.blue; ctx.fillRect(W * (1 - b), H - pick({ '16x9': 14, '9x16': 16 }), W, pick({ '16x9': 14, '9x16': 16 }));
  // halo doux
  const hg = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, W);
  hg.addColorStop(0, rgba('#E8F4EC', 1)); hg.addColorStop(1, rgba('#FFFFFF', 0));
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);

  // logo : révélation + ressort, puis remonte légèrement
  const d = pick({ '16x9': 400, '9x16': 400 });
  const lx = pick({ '16x9': W * 0.26, '9x16': W / 2 });
  const ly = pick({ '16x9': H * 0.48, '9x16': S.y + 260 });
  const s = springU(t, 0.4, SPRING.gentle);
  const rot = (1 - s) * -0.5;
  ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot); ctx.scale(0.85 + 0.15 * s, 0.85 + 0.15 * s); ctx.translate(-lx, -ly);
  ctx.shadowColor = 'rgba(16,40,30,0.18)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  if (s > 0.02) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx, ly, d / 2 * Math.min(1, s * 1.2), 0, Math.PI * 2); ctx.fill(); }
  ctx.shadowColor = 'transparent';
  logo(ctx, IMG.logo, lx, ly, d, Math.min(1, s * 1.2));
  ctx.restore();

  const x = pick({ '16x9': W * 0.43, '9x16': W / 2 });
  const align = portrait ? 'center' : 'left';
  const maxW = pick({ '16x9': 900, '9x16': S.w });
  let y = pick({ '16x9': H * 0.36, '9x16': ly + d / 2 + 110 });
  // bloc A : nom + plateforme (1.4 → 5.2)
  maskTitle(ctx, ['MOUVEMENT « PAS-PAS »'], { x, y, size: pick({ '16x9': 64, '9x16': 62 }), weight: 800, color: C.green, t, t0: 1.3, align, out: 5.0 });
  revealText(ctx, 'Plateforme d’Acteurs Sénégalais pour le Progrès et l’Ancrage Souverain', { x, y: y + 80, maxW, size: T.body - 4, weight: 600, color: C.blue, t, t0: 1.8, per: 0.06, align, out: 5.0 });
  // bloc B : engagement (5.4 → fin)
  revealText(ctx, '« Comprendre les réalités locales, accompagner les jeunes et construire des réponses adaptées. »', {
    x, y: y - 10, maxW, size: T.body, weight: 500, color: C.ink, accent: C.green, highlight: ['réalités', 'locales', 'jeunes', 'adaptées'], t, t0: 5.4, per: 0.07, align });
  const yE = pick({ '16x9': H * 0.69, '9x16': 1290 });
  rule(ctx, portrait ? x - 70 : x, yE - 70, 140, C.green, t, 7.2, 0.7, 6);
  maskTitle(ctx, ['ENSEMBLE,', 'POUR UN AVENIR MEILLEUR.'], { x, y: yE, size: pick({ '16x9': 52, '9x16': 58 }), weight: 800, color: C.blue, t, t0: 7.4, align, stagger: 0.15 });
  // référence du communiqué
  const fp = E.outCubic(prog(t, 8.2, 9.0));
  if (fp > 0) {
    ctx.globalAlpha = fp; ctx.font = font(pick({ '16x9': 24, '9x16': 28 }), 500); ctx.fillStyle = rgba(C.ink, 0.6);
    ctx.textAlign = portrait ? 'center' : 'left';
    ctx.fillText('Communiqué — Fait à Mbacké, le 9 novembre 2026', x, pick({ '16x9': H - 80, '9x16': 1460 }));
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }
}
