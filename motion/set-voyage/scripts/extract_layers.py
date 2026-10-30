"""Découpe le logo original SET-VOYAGE en calques RGBA superposables.

Aucun élément n'est redessiné : chaque calque garde la géométrie exacte des
pixels du JPG source. On résout seulement, pour chaque pixel, la part d'encre
bleue et d'encre grise mélangée au fond blanc (démélange linéaire), ce qui
donne des bords propres et un canal alpha utilisable sur fond transparent.

Tous les calques ont la taille du logo source : empilés à la même position,
ils reconstituent le logo à l'identique.

Usage : python3 scripts/extract_layers.py
"""

import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/assets/source/SET VOYAGE.jpg"
OUT = ROOT / "public/assets/layers"

# Encres mesurées sur le logo (médianes des aplats).
BLUE = np.array([25, 63, 136], float)
GRAY = np.array([89, 84, 81], float)
WHITE = np.array([255, 255, 255], float)

# Bandes horizontales du logo source (en pixels).
EMBLEM_BOTTOM = 290  # globe + arcs + avion
TEXT_BOTTOM = 436  # SET-VOYAGE
SLOGAN_BOTTOM = 500  # VOYAGE - TOURISME - BILLETTERIE

# Zone de l'avion (x0, y0, x1, y1).
PLANE_BOX = (612, 50, 872, 196)


def unmix(rgb):
    """Part d'encre bleue et grise de chaque pixel (moindres carrés)."""
    d = rgb - WHITE
    u, v = BLUE - WHITE, GRAY - WHITE
    uu, uv, vv = u @ u, u @ v, v @ v
    du, dv = d @ u, d @ v
    det = uu * vv - uv * uv
    a_blue = (du * vv - dv * uv) / det
    a_gray = (dv * uu - du * uv) / det
    a_blue, a_gray = np.clip(a_blue, 0, 1), np.clip(a_gray, 0, 1)
    total = a_blue + a_gray
    over = total > 1
    a_blue[over] /= total[over]
    a_gray[over] /= total[over]
    return a_blue, a_gray


def fit_circle(points):
    """Cercle des moindres carrés (méthode de Kåsa)."""
    x, y = points[:, 0].astype(float), points[:, 1].astype(float)
    A = np.column_stack([x, y, np.ones_like(x)])
    b = x * x + y * y
    cx2, cy2, c = np.linalg.lstsq(A, b, rcond=None)[0]
    cx, cy = cx2 / 2, cy2 / 2
    return cx, cy, np.sqrt(c + cx * cx + cy * cy)


def components(mask):
    """Composantes 8-connexes d'un masque booléen."""
    labels = np.zeros(mask.shape, int)
    sizes = [0]
    h, w = mask.shape
    for sy, sx in zip(*np.nonzero(mask)):
        if labels[sy, sx]:
            continue
        n = len(sizes)
        labels[sy, sx] = n
        queue, size = deque([(sy, sx)]), 0
        while queue:
            y, x = queue.popleft()
            size += 1
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not labels[yy, xx]:
                        labels[yy, xx] = n
                        queue.append((yy, xx))
        sizes.append(size)
    return labels, sizes


def dilate(mask, steps=1):
    for _ in range(steps):
        m = mask.copy()
        m[1:] |= mask[:-1]
        m[:-1] |= mask[1:]
        m[:, 1:] |= mask[:, :-1]
        m[:, :-1] |= mask[:, 1:]
        mask = m
    return mask


def save(alpha, color, name):
    h, w = alpha.shape
    img = np.zeros((h, w, 4), np.uint8)
    img[..., :3] = color if np.ndim(color) == 1 else color
    img[..., 3] = np.round(np.clip(alpha, 0, 1) * 255)
    Image.fromarray(img, "RGBA").save(OUT / f"{name}.png", optimize=True)


def runs(profile, min_gap):
    """Segments de colonnes non vides séparés d'au moins min_gap colonnes vides."""
    cols = np.nonzero(profile)[0]
    segments, start, prev = [], cols[0], cols[0]
    for c in cols[1:]:
        if c - prev > min_gap:
            segments.append([int(start), int(prev) + 1])
            start = c
        prev = c
    segments.append([int(start), int(prev) + 1])
    return segments


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rgb = np.array(Image.open(SOURCE).convert("RGB"), float)
    h, w, _ = rgb.shape
    a_blue, a_gray = unmix(rgb)
    # Le bruit JPEG du fond donne de faibles valeurs : on le coupe.
    for a in (a_blue, a_gray):
        a[a < 0.06] = 0
    a_white = 1 - a_blue - a_gray
    ys = np.arange(h)[:, None] * np.ones((1, w))
    xs = np.ones((h, 1)) * np.arange(w)[None, :]

    emblem = ys < EMBLEM_BOTTOM
    text = (ys >= EMBLEM_BOTTOM) & (ys < TEXT_BOTTOM)
    slogan = (ys >= TEXT_BOTTOM) & (ys < SLOGAN_BOTTOM)

    # Dôme bleu : cercle ajusté sur son bord, hors zone de l'avion.
    x0, y0, x1, y1 = PLANE_BOX
    edge = []
    solid = (a_blue > 0.5) & emblem
    for y in list(range(36, y0)) + list(range(y1 + 1, 276)):
        cols = np.nonzero(solid[y])[0]
        if len(cols):
            edge.append((cols.max(), y))
    for x in range(560, x0):
        rows = np.nonzero(solid[:, x])[0]
        if len(rows):
            edge.append((x, rows.min()))
    cx, cy, radius = fit_circle(np.array(edge))
    dist = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2)
    inside = dist <= radius - 0.5

    # Avion : réserve blanche dans le dôme, aplat bleu hors du dôme.
    box = np.zeros((h, w), bool)
    box[y0:y1, x0:x1] = True
    plane_alpha = np.where(inside, a_white, a_blue) * box
    # Le liseré anticrénelé du bord du dôme relierait tout : on l'écarte de la graine,
    # ainsi que la pointe de l'arc blanc qui touche l'empennage (x < 648, y > 110).
    ring = (dist > radius - 2) & (dist < radius + 1.5)
    seed = (plane_alpha > 0.5) & ~ring & ~((xs < 648) & (ys > 110))
    labels, sizes = components(seed[y0:y1, x0:x1])
    # Les blancs qui touchent le bord gauche ou bas de la zone sont les arcs, pas l'avion.
    arcs = set(labels[:, 0]) | set(labels[-1, :])
    keep = [i for i, s in enumerate(sizes) if i and s > 5 and i not in arcs]
    core = np.zeros((h, w), bool)
    core[y0:y1, x0:x1] = np.isin(labels, keep)
    # Le liseré écarté de la graine est réintégré là où il traverse l'avion.
    plane_mask = dilate(core, 2) | (ring & dilate(core, 3))
    # Hors du dôme, à droite, toute l'encre bleue de la zone appartient à l'avion.
    beyond = box & ~inside & (xs > cx)
    logo_alpha = np.where(beyond, a_blue, plane_alpha * plane_mask)
    plane_alpha = plane_alpha * plane_mask

    # Calques de l'emblème. Sous l'avion, le dôme est rebouché en bleu plein pour
    # que la réserve n'apparaisse qu'à l'atterrissage.
    # Le gris isolé au bord des aplats bleus n'est que du bruit JPEG : seul le
    # gris attaché aux tracés pleins du globe va au calque globe, le reste au dôme.
    strokes = (a_gray > 0.5) & emblem & ~plane_mask
    labels, sizes = components(strokes)
    big = [i for i, s in enumerate(sizes) if i and s > 200]
    globe_zone = dilate(np.isin(labels, big), 2)
    globe = a_gray * emblem * globe_zone
    dome = np.clip(a_blue + a_gray * ~globe_zone, 0, 1) * emblem
    dome[beyond | ((xs > cx) & (dist > radius + 1.5))] = 0
    dome[plane_mask & (dist < radius - 1)] = 1
    edge_fill = plane_mask & ring & inside
    dome[edge_fill] = np.maximum(dome, plane_alpha + a_blue)[edge_fill]
    plane_rgb = np.zeros((h, w, 3))
    plane_rgb[:] = BLUE
    plane_rgb[inside] = WHITE
    save(globe, GRAY, "globe")
    save(dome, BLUE, "dome")
    save(logo_alpha, plane_rgb, "plane-logo")
    # Version en vol : silhouette bleue pleine, le liseré du bord du dôme refermé.
    solid_plane = plane_alpha.copy()
    near = np.zeros_like(solid_plane)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            near = np.maximum(near, np.roll(np.roll(plane_alpha, dy, 0), dx, 1))
    seam = ring & plane_mask
    solid_plane[seam] = np.where(near[seam] > 0.5, 1, near[seam])
    save(np.clip((solid_plane - 0.12) / 0.76, 0, 1), BLUE, "plane-blue")

    # Logotype et slogan.
    # Le trait d'union est bleu : la coupure SET- / VOYAGE passe à x = 510.
    ink = np.clip(a_blue + a_gray, 0, 1)
    set_alpha = ink * text * (xs < 510)
    voyage_alpha = ink * text * (xs >= 510)
    slogan_alpha = ink * slogan
    save(set_alpha, BLUE, "set")
    save(voyage_alpha, GRAY, "voyage")
    save(slogan_alpha, GRAY, "slogan")

    # Union de toutes les encres : masque du reflet lumineux.
    full = np.clip(a_blue + a_gray, 0, 1) * (ys < SLOGAN_BOTTOM)
    full = np.maximum(full, plane_alpha)
    save(full, WHITE, "full-mask")

    py, px = np.nonzero(core)
    meta = {
        "width": w,
        "height": h,
        "dome": {"cx": round(cx, 1), "cy": round(cy, 1), "r": round(radius, 1)},
        "plane": {
            "box": [int(px.min()), int(py.min()), int(px.max()) + 1, int(py.max()) + 1],
            "center": [round(px.mean(), 1), round(py.mean(), 1)],
        },
        "set": runs((set_alpha > 0.4).any(0), 4),
        "voyage": runs((voyage_alpha > 0.4).any(0), 4),
        "sloganWords": runs((slogan_alpha > 0.4).any(0), 14),
        "bands": {
            "text": [int(np.nonzero((set_alpha + voyage_alpha).any(1))[0].min()),
                     int(np.nonzero((set_alpha + voyage_alpha).any(1))[0].max()) + 1],
            "slogan": [int(np.nonzero(slogan_alpha.any(1))[0].min()),
                       int(np.nonzero(slogan_alpha.any(1))[0].max()) + 1],
        },
    }
    (ROOT / "src/layout.json").write_text(json.dumps(meta, indent=2) + "\n")
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
