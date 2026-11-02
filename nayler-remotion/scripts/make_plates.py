"""Crée la « clean plate » du bandeau MARDI / 20H00.

Les zones de texte et d'icônes sont remplacées, ligne par ligne, par une
interpolation linéaire entre les pixels verts situés à leurs bords : le
dégradé du bandeau étant lisse, on obtient un fond vierge sur lequel les
éléments ORIGINAUX (découpés dans le flyer) viennent se révéler.
Aucun pixel du flyer n'est généré par IA.
"""
import numpy as np
from PIL import Image, ImageFilter

src = Image.open("public/flyer.png").convert("RGB")
a = np.asarray(src).astype(np.float32)

# Bandeau (coordonnées flyer 960x1280) — miroir de src/regions.ts
BX, BY, BW, BH = 88, 1032, 790, 140
# Zones à effacer : (x0, x1, y0, y1)
ZONES = [(118, 448, 1052, 1152), (498, 856, 1046, 1158)]

out = a.copy()
for x0, x1, y0, y1 in ZONES:
    for y in range(y0, y1):
        left = a[y, x0 - 4 : x0].mean(axis=0)
        right = a[y, x1 : x1 + 4].mean(axis=0)
        w = np.linspace(0, 1, x1 - x0)[:, None]
        out[y, x0:x1] = left * (1 - w) + right * w

plate = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
# lissage vertical léger des zones reconstruites pour supprimer le banding
soft = plate.filter(ImageFilter.GaussianBlur(3))
mask = Image.new("L", plate.size, 0)
m = np.zeros((plate.size[1], plate.size[0]), np.uint8)
for x0, x1, y0, y1 in ZONES:
    m[y0:y1, x0:x1] = 255
mask = Image.fromarray(m).filter(ImageFilter.GaussianBlur(2))
plate = Image.composite(soft, plate, mask)

plate.crop((BX, BY, BX + BW, BY + BH)).save("public/plates/banner-clean.png")
print("écrit public/plates/banner-clean.png")
