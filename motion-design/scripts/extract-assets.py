"""Découpe le calque unique (aplati mais transparent) du PSD en éléments animables.

Le PSD ne contient qu'un calque pixel. Son fond est transparent : chaque bloc
graphique est donc une île de pixels opaques. On regroupe ces îles (composantes
connexes de l'alpha, après dilatation) et on les affecte à des éléments nommés
selon des zones mesurées sur le document. Aucun pixel n'est redessiné, sauf une
bande de 37 px du pupitre cachée sous la pastille « Rejoignez-nous » (voir
PODIUM_PATCH) : elle est reconstruite par prolongement vertical et reste
invisible dans la composition finale.

Usage : python3 scripts/extract-assets.py ["Sans titre - 4.psd"]
Sorties : public/assets/<catégorie>/*.png, src/config/assets.generated.json,
          output/analysis/planche-calques.png, output/analysis/verification-recomposition.png
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from psd_tools import PSDImage
from scipy import ndimage as nd

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "public" / "assets"
ANALYSIS = ROOT / "output" / "analysis"

ALPHA_MIN = 8          # alpha au-dessous duquel un pixel est considéré vide pour la segmentation
DILATE = 12            # rapproche les lettres d'un même bloc de texte
DUST_DIST = 40         # pixels quasi invisibles plus loin que ça d'un bloc = poussière, écartés
DECOR_X = 2140         # tout ce qui commence à droite de cette abscisse = colonne décorative
TITLE_SPLIT_Y = 764    # ligne vide entre « Conférence » et « de presse »
DATE_SPLIT_Y = 1207    # ligne vide entre la pastille date et l'encart lieu
FOOTER_BAR_Y = 2803    # haut du bandeau vert de contact
PILL = (100, 2766, 776, FOOTER_BAR_Y)  # pastille « Rejoignez-nous » qui chevauche le pupitre
PODIUM_PATCH_X = (100, 566)            # largeur du pupitre sous la pastille

# Ordre d'affichage = ordre de cette liste (le pupitre passe sous le bandeau).
ROW_STARTS = [1577, 1681, 1784, 1941, 2095, 2251, 2406, 2511, 2667, 2750]

ELEMENTS = [
    # id, catégorie, rôle
    ("colonne-motifs", "decorative", "Colonne de motifs (cercles verts/bleus) en bord droit"),
    ("pupitre", "illustrations", "Illustration principale : pupitre et micro"),
    ("logo-paspas", "logos", "Logo PAS-PAS"),
    ("bandeau-plateforme", "typography", "Nom complet de la plateforme"),
    ("titre-conference", "typography", "Titre ligne 1 : « Conférence »"),
    ("titre-de-presse", "typography", "Titre ligne 2 : « de presse »"),
    ("info-date", "typography", "Pastille date et heure"),
    ("info-lieu", "typography", "Encart lieu (siège de PAS-PAS)"),
    ("programme-titre", "typography", "Pastille « PROGRAMME »"),
] + [
    (f"programme-ligne-{i + 1:02d}", "typography", f"Programme, ligne {i + 1}") for i in range(9)
] + [
    ("bandeau-contacts", "overlays", "Bandeau vert : Rejoignez-nous, adresse, site, téléphone, e-mail, réseaux"),
]


def classify(box, big):
    """Associe une composante connexe à un élément d'après sa boîte (y0, x0, y1, x1)."""
    y0, x0, y1, x1 = box
    cy = (y0 + y1) / 2
    if x0 >= DECOR_X:
        return "colonne-motifs"
    if big:
        return None  # traité à part (pupitre + bandeau)
    if y1 <= 560 and x1 <= 500:
        return "logo-paspas"
    if y1 <= 420:
        return "bandeau-plateforme"
    if y0 >= 470 and y1 <= 1030:
        return "titre"  # découpé ensuite par TITLE_SPLIT_Y
    if y0 >= 1020 and y1 <= 1360:
        return "info"  # découpé ensuite par DATE_SPLIT_Y
    if 1380 <= y0 < 1577 and y1 <= 1580:
        return "programme-titre"
    for i in range(9):
        if ROW_STARTS[i] - 5 <= cy < ROW_STARTS[i + 1] - 5:
            return f"programme-ligne-{i + 1:02d}"
    raise ValueError(f"composante non classée : {box}")


def main(psd_path):
    psd = PSDImage.open(psd_path)
    comp = np.array(psd.composite().convert("RGBA"))
    H, W = comp.shape[:2]
    alpha = comp[..., 3]
    solid = alpha > ALPHA_MIN

    lab, n = nd.label(nd.binary_dilation(solid, iterations=DILATE))
    sizes = nd.sum(np.ones_like(lab), lab, index=range(1, n + 1))
    big_id = int(np.argmax(sizes)) + 1
    # Les pixels très faiblement opaques (ombres, anticrénelage) proches d'une île
    # y sont rattachés. Ceux qui sont isolés loin de tout bloc (« poussière »,
    # opacité ≤ ALPHA_MIN) sont écartés : sinon ils gonflent la boîte d'un élément.
    dist, (iy, ix) = nd.distance_transform_edt(lab == 0, return_indices=True)
    nearest = lab[iy, ix]
    dust = (alpha > 0) & (alpha <= ALPHA_MIN) & (dist > DUST_DIST)
    # Pour les coupes horizontales (titre, date/lieu), un pixel faible suit le
    # pixel visible le plus proche : l'ombre de la pastille date reste à la date.
    _, (sy, _sx) = nd.distance_transform_edt(~solid, return_indices=True)
    near_y = sy

    masks = {e[0]: np.zeros((H, W), bool) for e in ELEMENTS}
    yy = np.arange(H)[:, None]
    xx = np.arange(W)[None, :]

    for i, sl in enumerate(nd.find_objects(lab), start=1):
        region = (nearest == i) & ~dust
        box = (sl[0].start, sl[1].start, sl[0].stop, sl[1].stop)
        name = classify(box, i == big_id)
        if name is None:
            pill = (yy >= PILL[1]) & (yy < PILL[3]) & (xx >= PILL[0]) & (xx < PILL[2])
            footer = region & ((yy >= FOOTER_BAR_Y) | pill)
            masks["bandeau-contacts"] |= footer
            masks["pupitre"] |= region & ~footer
        elif name == "titre":
            masks["titre-conference"] |= region & (near_y < TITLE_SPLIT_Y)
            masks["titre-de-presse"] |= region & (near_y >= TITLE_SPLIT_Y)
        elif name == "info":
            masks["info-date"] |= region & (near_y < DATE_SPLIT_Y)
            masks["info-lieu"] |= region & (near_y >= DATE_SPLIT_Y)
        else:
            masks[name] |= region

    # Contrôle : chaque pixel visible appartient à exactement un élément.
    stack = np.stack([m & (alpha > 0) for m in masks.values()])
    counts = stack.sum(0)
    assert counts.max() <= 1, "chevauchement entre éléments"
    orphans = int(((alpha > 0) & (counts == 0) & ~dust).sum())

    config = []
    layers = {}
    for z, (eid, cat, role) in enumerate(ELEMENTS):
        rgba = comp.copy()
        rgba[~masks[eid]] = 0
        if eid == "pupitre":
            # Bande du pupitre masquée par la pastille : prolongement vertical de la ligne au-dessus.
            x0, x1 = PODIUM_PATCH_X
            src = np.broadcast_to(rgba[PILL[1] - 1, x0:x1], (PILL[3] - PILL[1], x1 - x0, 4))
            # Uniquement là où la pastille est pleinement opaque : ailleurs l'original
            # était transparent, donc il n'y avait pas de pupitre dessous.
            covered = alpha[PILL[1]:PILL[3], x0:x1] == 255
            band = rgba[PILL[1]:PILL[3], x0:x1]
            band[covered] = src[covered]
        ys, xs = np.where(rgba[..., 3] > 0)
        top, left, bottom, right = int(ys.min()), int(xs.min()), int(ys.max()) + 1, int(xs.max()) + 1
        crop = Image.fromarray(rgba[top:bottom, left:right])
        (ASSETS / cat).mkdir(parents=True, exist_ok=True)
        rel = f"assets/{cat}/{eid}.png"
        crop.save(ROOT / "public" / rel, optimize=True)
        layers[eid] = (crop, left, top)
        # Boîte des pixels réellement visibles (sert au contrôle de cadrage).
        vy, vx = np.where(rgba[..., 3] > ALPHA_MIN)
        config.append({
            "id": eid, "category": cat, "role": role, "src": rel,
            "x": left, "y": top, "width": right - left, "height": bottom - top,
            "visible": {"x": int(vx.min()), "y": int(vy.min()),
                        "width": int(vx.max()) + 1 - int(vx.min()), "height": int(vy.max()) + 1 - int(vy.min())},
            "zIndex": z, "opacity": 1,
        })

    meta = {
        "source": Path(psd_path).name, "docWidth": W, "docHeight": H,
        "orphanPixels": orphans, "dustPixelsRemoved": int(dust.sum()), "elements": config,
        "notes": [
            "Coordonnées en pixels du document PSD (origine en haut à gauche).",
            "pupitre : bande y 2766-2803 / x 100-566 reconstruite par prolongement vertical, uniquement sous les pixels opaques de la pastille (invisible dans la composition finale).",
        ],
    }
    (ROOT / "src" / "config" / "assets.generated.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False))

    # Vérification : recomposer tous les éléments et comparer au composite d'origine.
    rebuilt = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for eid, (img, x, y) in layers.items():
        rebuilt.alpha_composite(img, (x, y))
    # Comparaison en prémultiplié (la couleur d'un pixel totalement transparent ne compte pas).
    def premul(a):
        a = a.astype(int)
        return np.concatenate([a[..., :3] * a[..., 3:] // 255, a[..., 3:]], axis=2)
    diff = np.abs(premul(np.array(rebuilt)) - premul(comp))
    max_diff = int(diff.max())
    white = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    white.alpha_composite(rebuilt)
    white.convert("RGB").resize((W // 3, H // 3), Image.LANCZOS).save(ANALYSIS / "verification-recomposition.png")

    # Planche des éléments extraits, sur damier pour montrer la transparence.
    thumb = 360
    cols = 5
    rows = (len(layers) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb, rows * (thumb + 40)), (245, 245, 245))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=18)
    for k, (eid, (img, _, _)) in enumerate(layers.items()):
        cx, cy = (k % cols) * thumb, (k // cols) * (thumb + 40)
        checker = Image.new("RGB", (thumb - 20, thumb - 20), (255, 255, 255))
        cd = ImageDraw.Draw(checker)
        for a in range(0, thumb, 20):
            for b in range(0, thumb, 20):
                if (a // 20 + b // 20) % 2:
                    cd.rectangle([a, b, a + 19, b + 19], fill=(225, 225, 225))
        t = img.copy()
        t.thumbnail((thumb - 30, thumb - 30), Image.LANCZOS)
        checker.paste(t, ((checker.width - t.width) // 2, (checker.height - t.height) // 2), t)
        sheet.paste(checker, (cx + 10, cy + 10))
        draw.text((cx + 12, cy + thumb - 6), eid, fill=(30, 30, 30), font=font)
    sheet.save(ANALYSIS / "planche-calques.png", optimize=True)

    print(f"{len(config)} éléments, pixels orphelins : {orphans}")
    print(f"poussière écartée : {int(dust.sum())} px, opacité max {int(alpha[dust].max()) if dust.any() else 0}/255")
    print(f"écart max recomposition vs original : {max_diff} (≤ opacité max de la poussière)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "Sans titre - 4.psd"))
