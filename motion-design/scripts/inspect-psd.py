"""Inspecte le PSD source et écrit un rapport JSON brut + une prévisualisation.

Usage : python3 scripts/inspect-psd.py "Sans titre - 4.psd"
Sorties : output/analysis/psd-structure.json, output/analysis/preview.png
"""
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageCms
from psd_tools import PSDImage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output" / "analysis"


def layer_info(layer, depth=0):
    info = {
        "name": layer.name,
        "kind": layer.kind,
        "depth": depth,
        "visible": layer.visible,
        "bbox": list(layer.bbox),
        "opacity": layer.opacity,
        "blend_mode": str(layer.blend_mode),
        "has_mask": layer.has_mask(),
        "has_effects": layer.has_effects(),
        "is_group": layer.is_group(),
    }
    if layer.kind == "type":
        info["text"] = layer.text
    if layer.is_group():
        info["children"] = [layer_info(c, depth + 1) for c in layer]
    return info


def main(psd_path):
    psd = PSDImage.open(psd_path)
    icc = psd.image_resources.get_data(1039)
    profile = None
    if icc:
        profile = ImageCms.getProfileDescription(ImageCms.ImageCmsProfile(io.BytesIO(icc))).strip()

    res = psd.image_resources.get_data(1005)
    # Valeurs en virgule fixe 16.16 (pixels par pouce si unit == 1).
    ppi = (round(res.horizontal / 65536, 2), round(res.vertical / 65536, 2)) if res else None
    alpha_names = psd.image_resources.get_data(1045)

    layers = [layer_info(l) for l in psd]
    composite = psd.composite()
    alpha = composite.getchannel("A")
    hist = alpha.histogram()
    total = psd.width * psd.height

    report = {
        "file": Path(psd_path).name,
        "width": psd.width,
        "height": psd.height,
        "color_mode": str(psd.color_mode),
        "depth_bits": psd.depth,
        "psd_version": psd.version,
        "icc_profile": profile,
        "resolution_ppi": ppi,
        "saved_alpha_channels": [str(n) for n in alpha_names] if alpha_names else [],
        "layer_count": sum(1 for _ in psd.descendants()),
        "layers": layers,
        "composite_alpha": {
            "transparent_px_ratio": round(hist[0] / total, 4),
            "opaque_px_ratio": round(hist[255] / total, 4),
            "partial_px_ratio": round(1 - (hist[0] + hist[255]) / total, 4),
        },
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "psd-structure.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))

    # Prévisualisation sur fond blanc (le fond du PSD est transparent).
    bg = Image.new("RGBA", composite.size, (255, 255, 255, 255))
    bg.alpha_composite(composite)
    bg.convert("RGB").save(OUT / "preview.png", optimize=True)
    print(json.dumps({k: v for k, v in report.items() if k != "layers"}, indent=2, ensure_ascii=False))
    print("calques :", [(l["name"], l["kind"], l["bbox"]) for l in layers])


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "Sans titre - 4.psd"))
