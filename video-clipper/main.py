#!/usr/bin/env python3
"""Découpage automatique d'une vidéo longue en clips TikTok et statuts WhatsApp.

Usage le plus simple :
    python main.py

Exemples :
    python main.py --url "https://www.youtube.com/watch?v=XXXX"
    python main.py --source ma_video.mp4             # fichier local, pas de téléchargement
    python main.py --dry-run                         # propose les découpes sans rendre
    python main.py --plan output/plan.json           # rend un plan corrigé à la main
    python main.py --model medium --max-clips 5
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from clipper.config import DEFAULT_URL, Config
from clipper.ffmpeg_utils import FFmpegError


def parse_args(argv: list[str]) -> Config:
    d = Config()
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--url", default=DEFAULT_URL, help="vidéo YouTube à traiter")
    p.add_argument("--source", type=Path, help="vidéo locale (saute le téléchargement)")
    p.add_argument("--cookies-from-browser", help="ex. chrome, firefox : si YouTube demande une connexion")
    p.add_argument("--output", type=Path, default=d.output_dir)
    p.add_argument("--work", type=Path, default=d.work_dir, help="dossier de cache")
    p.add_argument("--model", default=d.whisper_model, help="modèle Whisper (tiny…large-v3)")
    p.add_argument("--language", default=d.language, help="code langue, ou 'auto'")
    p.add_argument("--transcript", type=Path, help="transcription JSON existante")
    p.add_argument("--max-clip", type=float, default=d.max_clip, help="durée max d'un clip (s)")
    p.add_argument("--min-clip", type=float, default=d.min_clip, help="durée min d'un clip (s)")
    p.add_argument("--max-clips", type=int, default=d.max_clips)
    p.add_argument("--status-max", type=float, default=d.status_max, help="limite statut WhatsApp (s)")
    p.add_argument("--layout", choices=["auto", "crop", "blur"], default=d.layout)
    p.add_argument("--preset", default=d.preset, help="preset x264 (ultrafast…veryslow)")
    p.add_argument("--font", default=d.font)
    p.add_argument("--uppercase", action="store_true", help="sous-titres en majuscules")
    p.add_argument("--dry-run", action="store_true", help="propose les découpes sans rendre")
    p.add_argument("--plan", type=Path, help="rendre à partir d'un plan.json")
    p.add_argument("--skip-verify", action="store_true")
    a = p.parse_args(argv)
    if a.min_clip >= a.max_clip:
        p.error("--min-clip doit être inférieur à --max-clip")
    return Config(
        url=a.url, source=a.source, cookies_from_browser=a.cookies_from_browser,
        output_dir=a.output, work_dir=a.work, whisper_model=a.model,
        language=None if a.language in (None, "auto") else a.language, transcript=a.transcript,
        max_clip=a.max_clip, min_clip=a.min_clip, max_clips=a.max_clips, status_max=a.status_max,
        status_min=min(d.status_min, a.status_max / 3), layout=a.layout, preset=a.preset,
        font=a.font, uppercase=a.uppercase, dry_run=a.dry_run, plan=a.plan, skip_verify=a.skip_verify,
    )


def main(argv: list[str] | None = None) -> int:
    cfg = parse_args(sys.argv[1:] if argv is None else argv)
    from clipper.pipeline import run
    try:
        return run(cfg)
    except FFmpegError as e:
        print(f"\nErreur ffmpeg :\n{e}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("\nInterrompu. Relancez : les étapes déjà faites (téléchargement, transcription) "
              "sont en cache dans work/.", file=sys.stderr)
        return 130
    except Exception as e:  # message clair pour les erreurs de téléchargement, réseau, etc.
        name = type(e).__name__
        if "DownloadError" in name or "yt_dlp" in type(e).__module__:
            print(f"\nTéléchargement impossible : {e}\n"
                  "Pistes : mettez yt-dlp à jour, ajoutez --cookies-from-browser chrome, "
                  "ou téléchargez la vidéo vous-même et utilisez --source fichier.mp4", file=sys.stderr)
            return 3
        raise


if __name__ == "__main__":
    sys.exit(main())
