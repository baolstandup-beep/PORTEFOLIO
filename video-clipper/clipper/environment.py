"""Vérifie les outils nécessaires et installe les dépendances Python manquantes."""
from __future__ import annotations

import importlib.util
import platform
import subprocess
import sys
from pathlib import Path

from .ffmpeg_utils import ffmpeg_filters, has_binary

PY_DEPS = {  # module importé → paquet pip
    "yt_dlp": "yt-dlp",
    "faster_whisper": "faster-whisper",
    "cv2": "opencv-python-headless",
    "numpy": "numpy",
}

FFMPEG_HELP = {
    "Windows": "winget install Gyan.FFmpeg   (ou choco install ffmpeg)",
    "Darwin": "brew install ffmpeg",
    "Linux": "sudo apt install ffmpeg   (ou l'équivalent de votre distribution)",
}


def _opencv_major() -> int:
    """Version d'OpenCV installée, sans l'importer (un import figerait la version en mémoire)."""
    from importlib.metadata import PackageNotFoundError, version
    for dist in ("opencv-python-headless", "opencv-python", "opencv-contrib-python"):
        try:
            return int(version(dist).split(".")[0])
        except PackageNotFoundError:
            continue
    return 0


def check(need_download: bool, need_whisper: bool) -> list[str]:
    """Retourne la liste des avertissements ; lève SystemExit si un outil bloquant manque."""
    warnings: list[str] = []
    print(f"  Python {platform.python_version()} — {platform.system()}")
    if sys.version_info < (3, 10):
        raise SystemExit("Python 3.10 ou plus récent est requis.")

    for tool in ("ffmpeg", "ffprobe"):
        if not has_binary(tool):
            raise SystemExit(f"{tool} introuvable. Installez-le : "
                             f"{FFMPEG_HELP.get(platform.system(), 'https://ffmpeg.org/download.html')}")
    filters = ffmpeg_filters()
    for f in ("ass", "loudnorm", "afftdn", "boxblur"):
        if f" {f} " not in filters:
            raise SystemExit(f"Votre ffmpeg n'a pas le filtre « {f} » (compilé sans libass ?). "
                             "Installez une version complète de ffmpeg.")
    print("  ffmpeg / ffprobe : OK (libass, loudnorm, afftdn présents)")

    needed = dict(PY_DEPS)
    if not need_download:
        needed.pop("yt_dlp")
    if not need_whisper:
        needed.pop("faster_whisper")
    missing = [pkg for mod, pkg in needed.items() if importlib.util.find_spec(mod) is None]
    if "cv2" in needed and "opencv-python-headless" not in missing and _opencv_major() >= 5:
        missing.append("opencv-python-headless<5")   # OpenCV 5 : détecteur Haar retiré
    missing = [m if m != "opencv-python-headless" else "opencv-python-headless<5" for m in missing]
    if missing:
        print(f"  Installation des paquets manquants : {', '.join(missing)}")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--quiet", *missing])
    print("  Dépendances Python : OK")

    if need_download:
        # yt-dlp vieillit vite face aux changements de YouTube : on tente une mise à jour.
        r = subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "--upgrade", "yt-dlp"],
                           capture_output=True)
        if r.returncode != 0:
            warnings.append("Mise à jour de yt-dlp impossible (hors ligne ?).")
    return warnings


def fonts_hint() -> str | None:
    fonts = Path(__file__).resolve().parent.parent / "fonts"
    if not fonts.is_dir() or not any(fonts.glob("*.[ot]tf")):
        return ("Police Montserrat absente du dossier fonts/ : une police de repli sera utilisée. "
                "Pour le rendu prévu, déposez Montserrat-ExtraBold.ttf dans fonts/ "
                "(https://fonts.google.com/specimen/Montserrat).")
    return None
