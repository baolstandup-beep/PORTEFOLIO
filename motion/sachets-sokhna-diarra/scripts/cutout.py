"""Détoure les sachets (fond uni) et extrait le logo blanc du sachet vert."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]

def cutout(path, dst):
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    h, w, _ = im.shape
    corners = np.concatenate([im[:40, :40].reshape(-1, 3), im[:40, -40:].reshape(-1, 3),
                              im[-40:, :40].reshape(-1, 3), im[-40:, -40:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    d = np.linalg.norm(im - bg, axis=2)
    near = d < 38
    # remplissage depuis les coins + le trou de la poignée : le vert du logo,
    # proche du fond mais enfermé dans le sachet, n'est pas touché
    m = Image.fromarray((near * 255).astype(np.uint8)).copy()
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (int(w * 0.48), int(h * 0.22))]
    for x, y in seeds:
        if m.getpixel((x, y)) == 255:
            ImageDraw.floodfill(m, (x, y), 128)
    bgmask = np.asarray(m) == 128
    alpha = np.where(bgmask, 0.0, 1.0)
    # bord doux : rampe sur la distance couleur, uniquement près de la frontière
    bm = Image.fromarray((bgmask * 255).astype(np.uint8))
    edge = (np.asarray(bm.filter(ImageFilter.MaxFilter(7))) > 0) & (np.asarray(bm.filter(ImageFilter.MinFilter(7))) == 0)
    ramp = np.clip((d - 14) / 40, 0, 1)
    alpha = np.where(edge, ramp, alpha)
    a = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    # décontamination : on retire la teinte du fond sur les bords
    af = np.asarray(a).astype(np.float32)[..., None] / 255
    rgb = np.where(af > 0.02, (im - bg * (1 - af)) / np.maximum(af, 0.02), im)
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    img = Image.fromarray(np.dstack([rgb, np.asarray(a)]), "RGBA")
    img = img.crop(img.getbbox())
    img.save(dst, optimize=True)
    print(dst, img.size, "bg", bg.round())

def logo(path, dst):
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    crop = im[540:1200, 400:1060]
    mn = crop.min(axis=2)
    alpha = np.clip((mn - 150) / 60, 0, 1)
    rgba = np.dstack([np.full(mn.shape + (3,), 255, np.float32), alpha * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    img = img.crop(img.getbbox())
    img.save(dst, optimize=True)
    print(dst, img.size)

cutout(f"{src}/1.jpg", f"{out}/sachet-blanc.png")
cutout(f"{src}/2.jpg", f"{out}/sachet-vert.png")
cutout(f"{src}/3.jpg", f"{out}/sachet-orange.png")
logo(f"{src}/2.jpg", f"{out}/logo-blanc.png")
