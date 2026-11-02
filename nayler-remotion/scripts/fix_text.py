"""Corrige « Coordinateur » -> « Coordonnateur » sur le badge de Bassirou Sene.

1. efface l'ancien mot (interpolation horizontale du fond gris clair du badge) ;
2. réécrit le mot en Inter Regular, calibré sur la hauteur, la graisse, la
   couleur et le centrage de l'original (sur-échantillonnage x4 pour l'anticrénelage).
Entrée : public/flyer-original.jpg  ->  Sortie : public/flyer.png
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC, DST = "public/flyer-original.jpg", "public/flyer.png"
OLD, NEW = "Coordinateur", "Coordonnateur"
# Boîte du texte d'origine (mesurée) : x 643-814, y 730-748 (ligne de base 748)
X0, X1, Y0, Y1 = 638, 821, 727, 752
TEXT_LEFT, TEXT_RIGHT, TEXT_TOP, BASELINE = 643, 814, 730, 748
FONT = "/usr/share/fonts/opentype/inter/Inter-Regular.otf"
SS = 4  # sur-échantillonnage

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)

# couleur du texte : moyenne des pixels les plus sombres de l'ancien mot
zone = a[TEXT_TOP:BASELINE + 1, TEXT_LEFT:TEXT_RIGHT + 1].reshape(-1, 3)
lum = zone.mean(axis=1)
ink = zone[lum <= np.percentile(lum, 4)].mean(axis=0)

# 1. effacement
out = a.copy()
for y in range(Y0, Y1):
    left = a[y, X0 - 3:X0].mean(axis=0)
    right = a[y, X1:X1 + 3].mean(axis=0)
    w = np.linspace(0, 1, X1 - X0)[:, None]
    out[y, X0:X1] = left * (1 - w) + right * w
clean = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

# 2. calibrage de la police sur l'ancien mot (hauteur 'd' -> ligne de base, largeur)
target_h = BASELINE - TEXT_TOP + 1
target_w = TEXT_RIGHT - TEXT_LEFT + 1
size = 10
while True:
    f = ImageFont.truetype(FONT, size * SS)
    l, t, r, b = f.getbbox(OLD)
    if (b - t) / SS >= target_h:
        break
    size += 0.25
font = ImageFont.truetype(FONT, size * SS)
l, t, r, b = font.getbbox(OLD)
x_scale = target_w / ((r - l) / SS)  # approche horizontale de la typo d'origine

nl, nt, nr, nb = font.getbbox(NEW)
W, H = nr - nl + 8 * SS, nb - nt + 8 * SS
mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(mask).text((4 * SS - nl, 4 * SS - nt), NEW, font=font, fill=255)
new_w = int(round(W / SS * x_scale))
mask = mask.resize((new_w, round(H / SS)), Image.LANCZOS)
mask = mask.filter(ImageFilter.GaussianBlur(0.25))  # douceur identique à la photo JPEG

# centrage horizontal sur l'ancien mot, ligne de base identique
cx = (TEXT_LEFT + TEXT_RIGHT) / 2
px = int(round(cx - new_w / 2))
py = TEXT_TOP - 4
ink_layer = Image.new("RGB", mask.size, tuple(int(c) for c in ink))
clean.paste(ink_layer, (px, py), mask)
clean.save(DST)
print(f"police {size}px, échelle x {x_scale:.3f}, encre {ink.round()}, largeur {new_w}px -> {DST}")
