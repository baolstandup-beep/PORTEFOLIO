"""Étape 1 — téléchargement de la vidéo source avec yt-dlp (mis en cache)."""
from __future__ import annotations

import json
from pathlib import Path

from .config import Config


def download(cfg: Config) -> tuple[Path, dict]:
    """Retourne (chemin de la vidéo, métadonnées). Ne retélécharge pas si déjà présente."""
    cfg.work_dir.mkdir(parents=True, exist_ok=True)
    target = cfg.work_dir / "source.mp4"
    meta_path = cfg.work_dir / "source.json"
    if target.exists() and target.stat().st_size > 0:
        meta = json.loads(meta_path.read_text("utf-8")) if meta_path.exists() else {}
        print(f"  ↳ vidéo déjà téléchargée : {target}")
        return target, meta

    import yt_dlp  # import tardif : inutile si --source est fourni

    opts = {
        # Meilleure qualité jusqu'à 1080p (au-delà, inutile pour du 1080x1920 recadré
        # sauf source 4K ; on garde 1080 pour la vitesse).
        "format": "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/bv*[height<=1080]+ba/b[height<=1080]/b",
        "merge_output_format": "mp4",
        "outtmpl": str(cfg.work_dir / "source.%(ext)s"),
        "noplaylist": True,
        "quiet": False,
        "no_warnings": False,
        "retries": 5,
        "fragment_retries": 5,
    }
    if cfg.cookies_from_browser:
        opts["cookiesfrombrowser"] = (cfg.cookies_from_browser,)

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(cfg.url, download=True)

    meta = {
        "title": info.get("title"),
        "channel": info.get("channel") or info.get("uploader"),
        "upload_date": info.get("upload_date"),
        "duration": info.get("duration"),
        "url": info.get("webpage_url") or cfg.url,
        "height": info.get("height"),
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), "utf-8")

    if not target.exists():  # yt-dlp a pu choisir une autre extension
        produced = sorted(cfg.work_dir.glob("source.*"), key=lambda p: p.stat().st_size, reverse=True)
        produced = [p for p in produced if p.suffix not in (".json", ".part", ".wav")]
        if not produced:
            raise RuntimeError("yt-dlp n'a produit aucun fichier.")
        produced[0].rename(target)
    return target, meta
