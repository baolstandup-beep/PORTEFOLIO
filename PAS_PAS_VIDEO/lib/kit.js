// kit.js — bibliothèque graphique partagée par les 6 scènes (océan, pirogue, côte, silhouettes,
// typographie cinétique). Tout est fonction pure du temps : aucun état, aucun Math.random.
import * as M from './motion.js';

const { W, H, FORMAT, E, prog, lerp, clamp, hash01, noise1 } = M;
export { W, H, FORMAT, E, prog, lerp, clamp };

// ------------------------------------------------------------------ identité (tirée du logo + communiqué)
export const C = {
  green: '#0E8A3E',      // vert du cercle du logo
  greenLight: '#47C27A', // vert lisible sur fond sombre
  blue: '#24589B',       // bleu « PAS-PAS »
  blueLight: '#8DB8E8',  // bleu lisible sur fond sombre
  white: '#F5F7F6',
  paper: '#FFFFFF',
  night: '#06121F',
  deep: '#0B2236',
  ink: '#10202E',
};
export const F = 'Poppins';
export const font = (size, weight = 400) => `${weight} ${Math.round(size)}px ${F}`;
export const portrait = FORMAT.portrait;
export const pick = FORMAT.pick;
export const S = FORMAT.safe;

// échelle typographique (lisibilité smartphone validée sur planche demi-taille)
export const T = {
  kicker: pick({ '16x9': 30, '9x16': 34 }),
  body: pick({ '16x9': 46, '9x16': 54 }),
  lead: pick({ '16x9': 58, '9x16': 64 }),
  title: pick({ '16x9': 112, '9x16': 104 }),
};

export const rgba = (hex, a) => { const [r, g, b] = M.hexRgb(hex); return `rgba(${r},${g},${b},${a})`; };
export const mixHex = M.mix;

// ------------------------------------------------------------------ ciel + mer (vue d'horizon)
// look: { skyTop, skyBottom, seaTop, seaBottom, sun:{x,y,r,color,a}, glint } ; cam: { y (horizon 0..1), drift }
export function seaHorizon(ctx, t, look, cam = {}) {
  const hy = H * (cam.horizon ?? 0.52);
  let g = ctx.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, look.skyTop); g.addColorStop(1, look.skyBottom);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, hy + 2);
  if (look.sun) {
    const s = look.sun, sx = W * s.x, sy = hy - H * s.y;
    const rg = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 6);
    rg.addColorStop(0, rgba(s.color, s.a)); rg.addColorStop(0.18, rgba(s.color, s.a * 0.35)); rg.addColorStop(1, rgba(s.color, 0));
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, hy);
  }
  g = ctx.createLinearGradient(0, hy, 0, H);
  g.addColorStop(0, look.seaTop); g.addColorStop(1, look.seaBottom);
  ctx.fillStyle = g; ctx.fillRect(0, hy, W, H - hy);
  // houle : traits de lumière en perspective, denses près de l'horizon, larges au premier plan
  const drift = (cam.drift ?? 18) * t;
  const rows = 70;
  for (let i = 0; i < rows; i++) {
    const d = i / rows;                       // 0 horizon -> 1 premier plan
    const y = hy + (H - hy) * d * d;
    const per = 2 + Math.floor(d * 5);
    for (let k = 0; k < per; k++) {
      const seed = i * 17 + k;
      const base = hash01(seed, 4) * (W + 600) - 300;
      const speed = (0.3 + hash01(seed, 9)) * (0.4 + d);
      const x = ((base + drift * speed + noise1(t * 0.35 + seed, 2) * 30 * d) % (W + 600) + (W + 600)) % (W + 600) - 300;
      const len = (20 + hash01(seed, 5) * 140) * (0.25 + d * 1.8);
      const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + hash01(seed, 7)) + seed);
      ctx.fillStyle = rgba(look.glint, (0.05 + 0.16 * tw) * (0.35 + d * 0.65));
      ctx.fillRect(x, y, len, Math.max(1, d * 3.2));
    }
  }
  // reflet du soleil sur l'eau
  if (look.sun) {
    const sx = W * look.sun.x;
    for (let i = 0; i < 46; i++) {
      const d = i / 46, y = hy + (H - hy) * d * d * 0.9 + 2;
      const wob = noise1(t * 0.9 + i * 0.7, 11) * (14 + d * 60);
      const w = (12 + d * 160) * (0.4 + 0.6 * hash01(i, 21));
      ctx.fillStyle = rgba(look.sun.color, look.sun.a * 0.5 * (1 - d * 0.8) * (0.5 + 0.5 * Math.sin(t * 2 + i)));
      ctx.fillRect(sx - w / 2 + wob, y, w, 1 + d * 3);
    }
  }
  return hy;
}

// ------------------------------------------------------------------ mer vue du ciel (aérien)
export function seaAerial(ctx, t, { base = '#0A2A40', crest = '#9CC6E0', amp = 1 } = {}) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
  // marbrures de profondeur
  for (let i = 0; i < 9; i++) {
    const x = hash01(i, 31) * W, y = hash01(i, 32) * H, r = (0.25 + hash01(i, 33) * 0.4) * Math.max(W, H);
    const g = ctx.createRadialGradient(x + Math.sin(t * 0.07 + i) * 60, y, 0, x, y, r);
    g.addColorStop(0, rgba(i % 2 ? '#0F3D58' : '#061A2A', 0.55)); g.addColorStop(1, rgba('#061A2A', 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // crêtes de vagues : courbes ondulantes qui défilent lentement
  ctx.lineCap = 'round';
  const step = 30;
  for (let row = -2; row < H / step + 3; row++) {
    const y0 = row * step + ((t * 9) % step);
    for (let seg = 0; seg < 5; seg++) {
      const seed = row * 7 + seg;
      const x0 = hash01(seed, 41) * W * 1.2 - W * 0.1;
      const len = 60 + hash01(seed, 42) * 220;
      const a = 0.04 + 0.13 * (0.5 + 0.5 * Math.sin(t * 0.9 + seed * 1.3));
      ctx.strokeStyle = rgba(crest, a * amp);
      ctx.lineWidth = 1.2 + hash01(seed, 43) * 2;
      ctx.beginPath();
      for (let k = 0; k <= 8; k++) {
        const x = x0 + (k / 8) * len + t * 6;
        const y = y0 + Math.sin(k * 0.8 + t * 0.6 + seed) * 4;
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  }
}

// pirogue vue de dessus (coque effilée, bandes peintes vert/bleu désaturées) + sillage
export function pirogueTop(ctx, x, y, len, ang, t, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha *= alpha;
  const w = len * 0.13;
  // sillage
  for (let i = 0; i < 14; i++) {
    const d = i / 14, back = -len * 0.5 - d * len * 2.2;
    const spread = w * 0.6 + d * len * 0.55;
    ctx.strokeStyle = rgba('#CFE4F2', 0.16 * (1 - d));
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(back + Math.sin(t * 2 + i) * 3, -spread); ctx.quadraticCurveTo(back + len * 0.1, 0, back + Math.sin(t * 2 + i) * 3, spread);
    ctx.stroke();
  }
  const hull = () => {
    ctx.beginPath();
    ctx.moveTo(len * 0.56, 0);
    ctx.bezierCurveTo(len * 0.3, -w * 0.9, -len * 0.3, -w * 0.9, -len * 0.5, -w * 0.25);
    ctx.lineTo(-len * 0.5, w * 0.25);
    ctx.bezierCurveTo(-len * 0.3, w * 0.9, len * 0.3, w * 0.9, len * 0.56, 0);
    ctx.closePath();
  };
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  hull(); ctx.fillStyle = '#2C6A4B'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save(); hull(); ctx.clip();
  ctx.fillStyle = '#3B2B20'; ctx.fillRect(-len, -w * 0.55, len * 2, w * 1.1);   // fond en bois
  ctx.fillStyle = '#2E5E8E'; ctx.fillRect(-len, -w * 0.62, len * 2, w * 0.1); ctx.fillRect(-len, w * 0.52, len * 2, w * 0.1);
  for (let i = -4; i <= 4; i++) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(i * len * 0.1, -w * 0.5, 3, w); } // bancs
  ctx.restore();
  ctx.restore();
}

// pirogue de profil (silhouette, proue relevée caractéristique)
export function pirogueSide(ctx, x, y, len, color, t, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha;
  const bob = Math.sin(t * 1.3) * len * 0.012, roll = Math.sin(t * 0.9) * 0.02;
  ctx.translate(x, y + bob); ctx.rotate(roll);
  const h = len * 0.1;
  ctx.beginPath();
  ctx.moveTo(-len * 0.5, -h * 1.5);                       // poupe relevée
  ctx.quadraticCurveTo(-len * 0.44, h * 0.2, -len * 0.3, h * 0.45);
  ctx.lineTo(len * 0.3, h * 0.45);
  ctx.quadraticCurveTo(len * 0.48, h * 0.1, len * 0.6, -h * 2.4); // proue effilée
  ctx.lineTo(len * 0.54, -h * 2.2);
  ctx.quadraticCurveTo(len * 0.4, -h * 0.4, len * 0.2, -h * 0.35);
  ctx.lineTo(-len * 0.38, -h * 0.35);
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}

// côte de Lompoul : dunes basses à l'horizon
export function dunes(ctx, hy, color, from = 0.55, to = 1.05, height = 0.05, seed = 3) {
  ctx.beginPath(); ctx.moveTo(W * from, hy + 1);
  for (let i = 0; i <= 40; i++) {
    const p = i / 40, x = W * lerp(from, to, p);
    const env = Math.sin(Math.min(1, p * 1.6) * Math.PI / 2);
    const y = hy - H * height * env * (0.55 + 0.45 * (0.5 + 0.5 * noise1(p * 6, seed)));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W * to, hy + 1); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}

// silhouette humaine anonyme, debout (aucun visage, aucune représentation de victime)
export function figure(ctx, x, y, h, color, seed = 1, t = 0) {
  const sway = Math.sin(t * 0.8 + seed) * h * 0.006;
  const w = h * (0.2 + hash01(seed, 51) * 0.05);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x + sway, y - h * 0.9, h * 0.075, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5 + sway, y - h * 0.8);
  ctx.quadraticCurveTo(x + sway, y - h * 0.84, x + w * 0.5 + sway, y - h * 0.8);
  ctx.lineTo(x + w * 0.36, y);
  ctx.lineTo(x - w * 0.36, y);
  ctx.closePath(); ctx.fill();
}

// ------------------------------------------------------------------ typographie
export function wrap(ctx, str, f, maxW) {
  ctx.font = f;
  const words = str.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Révélation mot à mot : chaque mot monte de 0.35em et apparaît, en léger décalage.
// highlight: Set de mots (sans ponctuation) à colorer en accent.
export function revealText(ctx, str, { x, y, maxW, size, weight = 400, color, accent, highlight = [], t, t0, per = 0.07, dur = 0.7, align = 'left', lh = 1.32, out = 1e9, outDur = 0.6 }) {
  const f = font(size, weight);
  const lines = wrap(ctx, str, f, maxW);
  ctx.font = f; ctx.textBaseline = 'alphabetic';
  const hl = new Set(highlight.map((w) => w.toLowerCase()));
  const space = ctx.measureText(' ').width;
  const fade = 1 - E.inOutCubic(prog(t, out, out + outDur));
  let n = 0;
  lines.forEach((line, li) => {
    const lw = ctx.measureText(line).width;
    let cx = align === 'center' ? x - lw / 2 : x;
    const by = y + li * size * lh;
    for (const w of line.split(' ')) {
      const p = E.outQuint(prog(t, t0 + n * per, t0 + n * per + dur));
      const ww = ctx.measureText(w).width;
      if (p > 0) {
        const key = w.toLowerCase().replace(/[.,;:«»"'’!?]/g, '');
        ctx.globalAlpha = p * fade;
        ctx.fillStyle = hl.has(key) ? accent : color;
        ctx.fillText(w, cx, by + (1 - p) * size * 0.35);
      }
      cx += ww + space; n++;
    }
  });
  ctx.globalAlpha = 1;
  return { lines: lines.length, height: lines.length * size * lh, words: n, end: t0 + n * per + dur };
}

// Titre en masque : chaque ligne glisse de sous sa ligne de base (mask reveal).
export function maskTitle(ctx, lines, { x, y, size, weight = 800, color, t, t0, stagger = 0.18, dur = 0.9, align = 'left', lh = 1.08, track = 0, out = 1e9, outDur = 0.5 }) {
  const f = font(size, weight);
  ctx.font = f; ctx.textBaseline = 'alphabetic';
  if (track) ctx.letterSpacing = `${track}px`;
  lines.forEach((line, i) => {
    const p = E.outQuint(prog(t, t0 + i * stagger, t0 + i * stagger + dur));
    const q = E.inOutCubic(prog(t, out + i * 0.06, out + i * 0.06 + outDur));
    if (p <= 0 || q >= 1) return;
    const by = y + i * size * lh;
    const lw = ctx.measureText(line).width;
    const lx = align === 'center' ? x - lw / 2 : x;
    ctx.save();
    ctx.beginPath(); ctx.rect(lx - 20, by - size * 1.05, lw + 40 + track * line.length, size * 1.35); ctx.clip();
    ctx.fillStyle = color;
    ctx.fillText(line, lx, by + (1 - p) * size * 1.15 - q * size * 1.15);
    ctx.restore();
  });
  ctx.letterSpacing = '0px';
}

// filet d'accent qui se dessine (élément de marque : le trait vert sous le communiqué)
export function rule(ctx, x, y, w, color, t, t0, dur = 0.8, th = 6) {
  const p = E.outExpo(prog(t, t0, t0 + dur));
  if (p <= 0) return;
  ctx.fillStyle = color; ctx.fillRect(x, y, w * p, th);
}

// voile de lisibilité : dégradé sombre derrière le texte
export function scrim(ctx, y0, y1, color = '#000', a = 0.55) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, rgba(color, 0)); g.addColorStop(0.35, rgba(color, a)); g.addColorStop(1, rgba(color, a));
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
}

// logo PAS-PAS (image officielle, jamais redessinée) avec révélation circulaire
export function logo(ctx, img, cx, cy, d, p = 1, alpha = 1) {
  if (!img || p <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.beginPath(); ctx.arc(cx, cy, (d / 2) * 1.02 * p, 0, Math.PI * 2); ctx.clip();
  const ar = img.width / img.height;
  ctx.drawImage(img, cx - (d * ar) / 2, cy - d / 2, d * ar, d);
  ctx.restore();
}
