// Exporte le kit de livraison à partir des SVG existants, sans les modifier.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const SRC = '/home/user/PORTEFOLIO/branding/sunu-menneef/svg';
const OUT = '/home/user/PORTEFOLIO/branding/sunu-menneef/kit';
const read = (n) => fs.readFileSync(path.join(SRC, n), 'utf8');
const vb = (s) => s.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
const FORET = '#123D2B';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  async function shot(svg, w, h, file, { bg = 'transparent', pad = 0 } = {}) {
    await p.setViewportSize({ width: w, height: h });
    const inner = svg.replace(/ width="[\d.]+" height="[\d.]+"/, '').replace('<svg ', `<svg style="width:100%;height:100%;display:block" `);
    await p.setContent(`<html><body style="margin:0;background:${bg}"><div style="width:${w}px;height:${h}px;box-sizing:border-box;padding:${pad}px">${inner}</div></body></html>`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await p.screenshot({ path: file, omitBackground: bg === 'transparent' });
  }
  // Logos en PNG transparent, trois largeurs
  for (const n of ['logo-horizontal', 'logo-horizontal-mono', 'logo-horizontal-negatif', 'logo-vertical', 'mot-symbole']) {
    const s = read(n + '.svg'); const [w, h] = vb(s);
    for (const W of [600, 1200, 2400]) await shot(s, W, Math.round(W * h / w), `${OUT}/png/${n}-${W}.png`);
  }
  for (const n of ['symbole', 'symbole-mono-foret', 'symbole-negatif'])
    for (const W of [256, 512, 1024]) await shot(read(n + '.svg'), W, W, `${OUT}/png/${n}-${W}.png`);
  // Favicons
  const sym = read('symbole.svg');
  for (const W of [16, 32, 48, 180, 192, 512]) await shot(sym, W, W, `${OUT}/favicon/favicon-${W}.png`);
  fs.copyFileSync(path.join(SRC, 'symbole.svg'), `${OUT}/favicon/favicon.svg`);
  // Apple touch icon : fond plein, marge
  await shot(sym, 180, 180, `${OUT}/favicon/apple-touch-icon.png`, { bg: '#FFFFFF', pad: 22 });
  // Avatars réseaux sociaux (cercle recadré par les plateformes : marge de 22 %)
  const neg = read('symbole-negatif.svg').replace(/<rect[^>]*\/>/, '');
  await shot(neg, 1080, 1080, `${OUT}/avatar/avatar-foret-1080.png`, { bg: FORET, pad: 240 });
  await shot(sym, 1080, 1080, `${OUT}/avatar/avatar-blanc-1080.png`, { bg: '#FFFFFF', pad: 240 });
  await shot(neg, 400, 400, `${OUT}/avatar/avatar-foret-400.png`, { bg: FORET, pad: 89 });
  await b.close();
})();
