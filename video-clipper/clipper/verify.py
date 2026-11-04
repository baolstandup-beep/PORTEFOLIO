"""Vérifie que chaque fichier exporté est lisible et conforme (codec, taille, durée),
puis le décode intégralement pour détecter toute corruption."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path


def verify(path: Path, expected_dur: float, W: int, H: int) -> dict:
    res = {"file": path.name, "ok": False, "problems": [], "size_mb": 0.0, "duration": 0.0}
    if not path.exists() or path.stat().st_size == 0:
        res["problems"].append("fichier absent ou vide")
        return res
    res["size_mb"] = round(path.stat().st_size / 1e6, 2)
    p = subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams",
                        "-show_format", str(path)], capture_output=True)
    if p.returncode != 0:
        res["problems"].append("ffprobe ne peut pas lire le fichier")
        return res
    data = json.loads(p.stdout)
    v = next((s for s in data["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in data["streams"] if s["codec_type"] == "audio"), None)
    dur = float(data["format"].get("duration", 0))
    res["duration"] = round(dur, 2)
    if not v or v.get("codec_name") != "h264":
        res["problems"].append("vidéo non H.264")
    elif (int(v["width"]), int(v["height"])) != (W, H):
        res["problems"].append(f"résolution {v['width']}x{v['height']} au lieu de {W}x{H}")
    if a is None:
        res["problems"].append("pas de piste audio")
    elif a.get("codec_name") != "aac":
        res["problems"].append("audio non AAC")
    if abs(dur - expected_dur) > 0.6:
        res["problems"].append(f"durée {dur:.2f}s au lieu de {expected_dur:.2f}s")
    dec = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "null", "-"],
                         capture_output=True)
    errs = dec.stderr.decode("utf-8", "replace").strip()
    if dec.returncode != 0 or errs:
        res["problems"].append("erreurs de décodage : " + errs[:200])
    res["ok"] = not res["problems"]
    return res
