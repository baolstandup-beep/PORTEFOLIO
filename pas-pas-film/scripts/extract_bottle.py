"""Extrait la bouteille PAS-PAS de source/jus.pdf en PNG transparents pour Remotion.

Le PDF est un export Photoshop aplati : une seule image CMYK (mockup incliné sur fond gris),
sans calques. On procède donc ainsi :
  1. rendu sRGB fidèle de la page avec poppler (pdftoppm) ;
  2. silhouette de la bouteille (contours + saturation, remplissage, plus grande composante) ;
  3. plaque de fond reconstituée par convolution normalisée autour de la silhouette ;
  4. démixage alpha du plastique transparent contre cette plaque (reflets et réfractions gardés) ;
  5. étiquette et bouchon forcés opaques avec leurs pixels d'origine (aucun pixel redessiné) ;
  6. rotation rigide pour redresser la bouteille (aucune déformation), recadrage serré.

Usage : python3 scripts/extract_bottle.py [dossier_de_controle]
Dépendances : poppler-utils, numpy, pillow, scipy.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'source' / 'jus.pdf'
OUT = ROOT / 'public' / 'assets'
DEBUG = Path(sys.argv[1]) if len(sys.argv) > 1 else None


def render_page() -> np.ndarray:
    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp) / 'page'
        subprocess.run(['pdftoppm', '-png', '-r', '72', '-singlefile', str(SOURCE), str(base)], check=True)
        return np.asarray(Image.open(f'{base}.png').convert('RGB')).astype(np.float32) / 255


def largest(mask: np.ndarray) -> np.ndarray:
    lab, n = ndi.label(mask)
    if n == 0:
        return mask
    sizes = ndi.sum(mask, lab, range(1, n + 1))
    return lab == (np.argmax(sizes) + 1)


def disk(r: int) -> np.ndarray:
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


im = render_page()
H, W, _ = im.shape
gray = im.mean(2)
sat = im.max(2) - im.min(2)

# 2. Silhouette grossière : tout ce qui a des contours ou de la couleur, refermé et rempli.
smooth = ndi.gaussian_filter(gray, 1.5)
grad = np.hypot(ndi.sobel(smooth, 0), ndi.sobel(smooth, 1))
rough = (grad > 0.04) | (sat > 0.12)
rough = ndi.binary_closing(rough, structure=np.ones((3, 3)), iterations=25)
rough = largest(ndi.binary_opening(ndi.binary_fill_holes(rough), iterations=8))

# 3. Plaque de fond : on moyenne les pixels hors bouteille et on comble l'intérieur (ombre comprise).
# Deux échelles : fine près des bords (suit l'ombre portée), large au cœur de la bouteille.
outside = ~ndi.binary_dilation(rough, structure=disk(6))


def fill(sigma: float):
    w = ndi.gaussian_filter(outside.astype(np.float32), sigma)
    p = np.stack([ndi.gaussian_filter(im[..., c] * outside, sigma) for c in range(3)], -1)
    return p / np.maximum(w, 1e-4)[..., None], w


plate_fine, w_fine = fill(18)
plate_wide, _ = fill(90)
k = np.clip((w_fine - 0.02) / 0.15, 0, 1)[..., None]
plate = np.where(outside[..., None], im, plate_fine * k + plate_wide * (1 - k))

# Silhouette fine : écart à la plaque, bornée à la silhouette grossière élargie.
diff = np.abs(im - plate).max(2)
fine = ndi.binary_closing((diff > 0.035) | (grad > 0.05), structure=disk(4), iterations=2)
fine = ndi.binary_fill_holes(fine) & ndi.binary_dilation(rough, structure=disk(12))
fine = largest(ndi.binary_opening(fine, structure=disk(3)))
fine = ndi.binary_fill_holes(ndi.binary_closing(fine, structure=disk(9)))

# Le fichier d'origine contient un aplat blanc rectangulaire cerné d'un trait sombre (reste de
# retouche) qui dépasse sous le culot, dans la zone SEAM ci-dessous (pixels de la page source).
# On n'y retire que les pixels clairs et sans texture (le fond) et le liseré ; le reste est intact.
SEAM = (slice(2880, 3020), slice(930, 1345))  # (lignes, colonnes)
mean7 = ndi.uniform_filter(gray, 7)
std7 = np.sqrt(np.maximum(ndi.uniform_filter(gray * gray, 7) - mean7 ** 2, 0))
zone = np.zeros_like(fine)
zone[SEAM] = True
flat_white = (gray > 0.8) & (std7 < 0.02) & zone & fine
cleaned = fine & ~(ndi.binary_dilation(flat_white, structure=disk(5)) & zone)
opened = ndi.binary_opening(cleaned, structure=disk(7))
fine = ndi.binary_fill_holes(largest(np.where(zone, opened, cleaned)))
silhouette = np.clip(ndi.gaussian_filter(fine.astype(np.float32), 1.2) * 1.15 - 0.075, 0, 1)

# 4. Démixage : c = a*f + (1-a)*b avec f dans [0,1], on prend le plus petit alpha admissible.
b = np.clip(plate, 0.02, 0.98)
a_up = (im - b) / (1 - b)
a_down = (b - im) / b
alpha_glass = np.clip(np.maximum(a_up, a_down).max(2), 0, 1)
alpha_glass = np.clip(alpha_glass * 1.35, 0, 1)  # le plastique garde un peu de corps sur fond sombre
fg_glass = np.clip((im - (1 - alpha_glass[..., None]) * b) / np.maximum(alpha_glass[..., None], 1e-3), 0, 1)

# 5. Zones opaques.
# Bouchon : bleu saturé dans le haut de la bouteille.
ys_all = np.nonzero(fine)[0]
top = ys_all.min()
cap = (sat > 0.18) & (im[..., 2] > im[..., 0]) & fine
cap[top + 420:] = False
cap = ndi.binary_fill_holes(ndi.binary_closing(cap, structure=disk(6), iterations=2))
cap = largest(cap)

# Étiquette : bande entre la frise du haut et celle du bas. On repère les pixels colorés de la
# moitié basse (frises, logo, textes), puis, colonne par colonne dans le repère de la bouteille,
# l'enveloppe haute et basse, lissée par un polynôme.
label_ink = (sat > 0.22) & fine & ~ndi.binary_dilation(cap, structure=disk(40))
ys, xs = np.nonzero(fine)
cx, cy = xs.mean(), ys.mean()
cov = np.cov(np.vstack([xs - cx, ys - cy]))
_, vecs = np.linalg.eigh(cov)
axis = vecs[:, 1] if vecs[1, 1] > 0 else -vecs[:, 1]          # vers le bas de la bouteille
perp = np.array([axis[1], -axis[0]])
tilt_deg = float(np.degrees(np.arctan2(axis[0], axis[1])))

yy, xx = np.mgrid[0:H, 0:W]
u = (xx - cx) * perp[0] + (yy - cy) * perp[1]        # travers de la bouteille
v = (xx - cx) * axis[0] + (yy - cy) * axis[1]        # le long de la bouteille
iu, iv = u[label_ink], v[label_ink]
bins = np.round(iu / 8).astype(int)
tops, bots, centers = [], [], []
for k in np.unique(bins):
    sel = bins == k
    if sel.sum() < 15:
        continue
    centers.append(k * 8)
    tops.append(iv[sel].min())
    bots.append(iv[sel].max())
centers, tops, bots = map(np.array, (centers, tops, bots))
# Enveloppes : on ne garde que les colonnes proches de l'extrême (les frises), pas les trous entre motifs.
keep_t = tops <= ndi.minimum_filter1d(tops, 9) + 6
keep_b = bots >= ndi.maximum_filter1d(bots, 9) - 6
pt = np.polyfit(centers[keep_t], tops[keep_t], 2)
pb = np.polyfit(centers[keep_b], bots[keep_b], 2)
margin = 6
label = (v >= np.polyval(pt, u) - margin) & (v <= np.polyval(pb, u) + margin) & fine
label = ndi.binary_erosion(label, structure=disk(2)) | (label & label_ink)

opaque = ndi.gaussian_filter((cap | label).astype(np.float32), 1.0)
alpha = np.maximum(alpha_glass, opaque) * silhouette
rgb = fg_glass * (1 - opaque[..., None]) + im * opaque[..., None]

# 6. Redressement et recadrage.
rgba = np.dstack([rgb, alpha])
img = Image.fromarray((np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')
premult = img.convert('RGBa').rotate(-tilt_deg, resample=Image.BICUBIC, expand=True)
img = premult.convert('RGBA')
bbox = img.getchannel('A').point(lambda p: 255 if p > 6 else 0).getbbox()
pad = 24
img = img.crop((bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad))

OUT.mkdir(parents=True, exist_ok=True)
img.save(OUT / 'bottle.png', optimize=True)
(ROOT / 'src' / 'bottle-meta.json').write_text(f'{{"width": {img.size[0]}, "height": {img.size[1]}, "padding": {pad}, "tiltCorrectedDeg": {tilt_deg:.2f}}}\n')

# Silhouette pleine (pour la scène 1) et liseré de contour (lumière de découpe).
sil = Image.fromarray((silhouette * 255).astype(np.uint8), 'L').rotate(-tilt_deg, resample=Image.BICUBIC, expand=True)
sil = sil.crop((bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad))
sil_np = np.asarray(sil).astype(np.float32) / 255
rim = np.clip(sil_np - ndi.grey_erosion(sil_np, footprint=disk(10)), 0, 1)
rim = np.clip(ndi.gaussian_filter(rim, 3) * 1.6, 0, 1)
white = np.ones_like(sil_np)
Image.fromarray((np.dstack([white, white, white, sil_np]) * 255).astype(np.uint8), 'RGBA').save(OUT / 'bottle-silhouette.png', optimize=True)
Image.fromarray((np.dstack([white, white, white, rim]) * 255).astype(np.uint8), 'RGBA').save(OUT / 'bottle-rim.png', optimize=True)

print(f'Inclinaison corrigée : {tilt_deg:.2f}°  |  bouteille.png {img.size[0]}x{img.size[1]}')

if DEBUG:
    DEBUG.mkdir(parents=True, exist_ok=True)
    for name, bg in {'dark': (8, 10, 18), 'grey': (128, 128, 128)}.items():
        canvas = Image.new('RGBA', img.size, bg + (255,))
        canvas.alpha_composite(img)
        canvas.convert('RGB').resize((img.size[0] // 3, img.size[1] // 3)).save(DEBUG / f'check-{name}.png')
    Image.fromarray(((cap | label) * 255).astype(np.uint8)).resize((W // 4, H // 4)).save(DEBUG / 'opaque.png')
