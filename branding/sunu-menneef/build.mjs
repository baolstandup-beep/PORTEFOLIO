// Génère les fichiers SVG vectorisés (texte converti en contours) de l'identité Suñu Meññeef.
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const OUT = process.argv[2] || './out';
fs.mkdirSync(OUT, { recursive: true });

const C = {
  foret: '#123D2B',
  feuille: '#2E9A4B',
  pousse: '#A9CF3D',
  soleil: '#F2A516',
  sable: '#F4EEDF',
  terre: '#7C4F2A',
  blanc: '#FFFFFF',
};

const fontDir = process.env.FONT_DIR || 'node_modules/@fontsource/bricolage-grotesque/files/';
const load = (w) => opentype.parse(fs.readFileSync(fontDir + `bricolage-grotesque-latin-${w}-normal.woff`).buffer);
const F800 = load(800);
const F500 = load(500);

const r = (n) => Math.round(n * 100) / 100;

// Feuille : deux courbes de Bézier entre la base A et la pointe B, flanc gauche plus bombé que le droit.
function leaf(ax, ay, bx, by, w, asym = 0.18) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  const w1 = w * (1 + asym), w2 = w * (1 - asym);
  const p = (t, off) => [ax + dx * t + nx * off, ay + dy * t + ny * off];
  const [c1x, c1y] = p(0.2, w1), [c2x, c2y] = p(0.75, w1 * 0.9);
  const [c3x, c3y] = p(0.75, -w2 * 0.9), [c4x, c4y] = p(0.2, -w2);
  return `M${r(ax)} ${r(ay)}C${r(c1x)} ${r(c1y)} ${r(c2x)} ${r(c2y)} ${r(bx)} ${r(by)}C${r(c3x)} ${r(c3y)} ${r(c4x)} ${r(c4y)} ${r(ax)} ${r(ay)}Z`;
}

// Symbole sur une grille de 120 : deux grandes feuilles (jambages du M), une pousse en V (le creux du M), le soleil-tête.
function symbol({ outer = C.foret, inner = C.feuille, sun = C.soleil } = {}) {
  const L = leaf(34, 108, 24, 12, 16, 0.2);
  const R = leaf(86, 108, 96, 12, -16, 0.2);
  const vl = leaf(60, 98, 41, 50, 11, 0.15);
  const vr = leaf(60, 98, 79, 50, -11, 0.15);
  return `<g><path fill="${outer}" d="${L}"/><path fill="${outer}" d="${R}"/><path fill="${inner}" d="${vl}"/><path fill="${inner}" d="${vr}"/><circle fill="${sun}" cx="60" cy="40" r="9.5"/></g>`;
}

// Tilde en forme de feuille couchée : une vague effilée aux deux bouts.
function tilde(cx, cy, wdt, th) {
  const h = wdt / 2;
  const a = th * 0.55;
  return `M${r(cx - h)} ${r(cy + a)}C${r(cx - h * 0.55)} ${r(cy - th * 1.15)} ${r(cx - h * 0.1)} ${r(cy - th * 0.2)} ${r(cx + h * 0.15)} ${r(cy - th * 0.05)}C${r(cx + h * 0.5)} ${r(cy + th * 0.2)} ${r(cx + h * 0.7)} ${r(cy - th * 0.6)} ${r(cx + h)} ${r(cy - a)}C${r(cx + h * 0.6)} ${r(cy + th * 1.15)} ${r(cx + h * 0.15)} ${r(cy + th * 0.25)} ${r(cx - h * 0.1)} ${r(cy + th * 0.1)}C${r(cx - h * 0.5)} ${r(cy - th * 0.1)} ${r(cx - h * 0.7)} ${r(cy + th * 0.6)} ${r(cx - h)} ${r(cy + a)}Z`;
}

// Écrit un mot glyphe par glyphe ; chaque « ñ » est composé d'un « n » et d'un tilde-feuille dessiné.
function word(font, text, x, y, size, tracking = 0) {
  const scale = size / font.unitsPerEm;
  const xh = (font.tables.os2.sxHeight || 500) * scale;
  let cx = x, d = '', tildes = '';
  for (const ch of text) {
    const isN = ch === 'ñ';
    const g = font.charToGlyph(isN ? 'n' : ch);
    d += g.getPath(cx, y, size).toPathData(2);
    if (isN) {
      const bb = g.getBoundingBox();
      const mid = cx + ((bb.x1 + bb.x2) / 2) * scale;
      const gw = (bb.x2 - bb.x1) * scale;
      tildes += tilde(mid, y - xh - size * 0.2, gw * 0.86, size * 0.072);
    }
    cx += g.advanceWidth * scale + tracking * size;
  }
  return { d: d + tildes, width: cx - x - tracking * size };
}

function wordmark({ top = C.feuille, bottom = C.foret, x = 0, y = 0, size = 100 } = {}) {
  const sTop = size * 0.5;
  const a = word(F500, 'Suñu', x, y + sTop * 0.78, sTop, -0.01);
  const b = word(F800, 'Meññeef', x - size * 0.02, y + sTop * 0.78 + size * 0.96, size, -0.012);
  return { svg: `<path fill="${top}" d="${a.d}"/><path fill="${bottom}" d="${b.d}"/>`, width: Math.max(a.width, b.width), height: sTop * 0.78 + size * 0.96 };
}

const wrap = (w, h, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" width="${r(w)}" height="${r(h)}">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}${body}</svg>\n`;

const files = {};

// Symbole seul
files['symbole.svg'] = wrap(120, 120, symbol());
files['symbole-mono-foret.svg'] = wrap(120, 120, symbol({ outer: C.foret, inner: C.foret, sun: C.foret }));
files['symbole-negatif.svg'] = wrap(120, 120, symbol({ outer: C.blanc, inner: C.pousse, sun: C.soleil }), C.foret);

// Logo horizontal : symbole 120 + espace + mot-symbole sur deux lignes, centré verticalement sur le symbole.
function horizontal(colors, bg) {
  const size = 62;
  const wm = wordmark({ ...colors.wm, x: 0, y: 0, size });
  const gap = 18;
  const offY = (120 - wm.height) / 2 - 4;
  const W = 120 + gap + wm.width + 4;
  const body = `${symbol(colors.sym)}<g transform="translate(${120 + gap} ${r(offY)})">${wm.svg}</g>`;
  return wrap(W, 120, body, bg);
}
files['logo-horizontal.svg'] = horizontal({ sym: {}, wm: {} });
files['logo-horizontal-mono.svg'] = horizontal({ sym: { outer: C.foret, inner: C.foret, sun: C.foret }, wm: { top: C.foret, bottom: C.foret } });
files['logo-horizontal-negatif.svg'] = horizontal({ sym: { outer: C.blanc, inner: C.pousse, sun: C.soleil }, wm: { top: C.pousse, bottom: C.blanc } }, C.foret);

// Logo vertical (emballages, enseignes carrées)
function stacked(colors, bg) {
  const size = 60;
  const wm = wordmark({ ...colors.wm, x: 0, y: 0, size });
  const W = Math.max(wm.width, 120) + 8;
  const body = `<g transform="translate(${r((W - 120) / 2)} 0)">${symbol(colors.sym)}</g><g transform="translate(${r((W - wm.width) / 2)} 136)">${wm.svg}</g>`;
  return wrap(W, 136 + wm.height + 8, body, bg);
}
files['logo-vertical.svg'] = stacked({ sym: {}, wm: {} });

// Mot-symbole seul
{
  const wm = wordmark({ size: 100 });
  files['mot-symbole.svg'] = wrap(wm.width + 6, wm.height + 10, wm.svg);
}

for (const [name, svg] of Object.entries(files)) fs.writeFileSync(path.join(OUT, name), svg);
fs.writeFileSync(path.join(OUT, 'inline.json'), JSON.stringify(files));
console.log(Object.keys(files).join('\n'));
