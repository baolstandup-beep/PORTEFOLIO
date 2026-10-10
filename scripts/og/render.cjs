// Génère l'image de partage de l'accueil (1200 × 630) à partir de scripts/og/accueil.html.
// Usage : npm i --no-save puppeteer-core@23.11.1 sharp@0.34.4 && node scripts/og/render.cjs
// CHROME_PATH permet d'indiquer un autre navigateur que Google Chrome sur macOS.
const path = require('node:path');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const source = path.join(__dirname, 'accueil.html');
const target = path.join(__dirname, '../../public/og/accueil.jpg');

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.goto(`file://${source}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  await browser.close();
  // JPEG : plus léger que le PNG et accepté partout (WhatsApp, Facebook, LinkedIn, X)
  const info = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(target);
  console.log(`public/og/accueil.jpg : ${info.width} × ${info.height}, ${Math.round(info.size / 1024)} Ko`);
})();
