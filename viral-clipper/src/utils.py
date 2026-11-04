"""Fonctions utilitaires : appels FFmpeg/FFprobe, journalisation, formats de temps."""
from __future__ import annotations

import json
import logging
import shutil
import subprocess
from pathlib import Path

log = logging.getLogger("clipper")


class PipelineError(RuntimeError):
    """Erreur explicite affichée à l'utilisateur sans trace Python."""


def require_binary(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise PipelineError(
            f"'{name}' est introuvable. Installez-le (ex. 'sudo apt install ffmpeg' "
            f"ou 'winget install ffmpeg') puis relancez."
        )
    return path


def run(cmd: list[str], desc: str = "", capture: bool = False,
        cwd: Path | None = None) -> subprocess.CompletedProcess:
    """Exécute une commande ; lève PipelineError avec la fin du log en cas d'échec."""
    log.debug("$ %s", " ".join(map(str, cmd)))
    proc = subprocess.run(
        [str(c) for c in cmd],
        stdout=subprocess.PIPE if capture else subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
        cwd=cwd,
    )
    if proc.returncode != 0:
        tail = "\n".join(proc.stderr.strip().splitlines()[-15:])
        raise PipelineError(f"Échec : {desc or cmd[0]}\n{tail}")
    return proc


def ffprobe(path: Path) -> dict:
    proc = run(
        ["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path],
        desc=f"ffprobe {path.name}",
        capture=True,
    )
    return json.loads(proc.stdout)


def media_info(path: Path) -> dict:
    """Résumé utile : durée, taille, fps, codecs."""
    data = ffprobe(path)
    video = next((s for s in data["streams"] if s["codec_type"] == "video"), None)
    audio = next((s for s in data["streams"] if s["codec_type"] == "audio"), None)
    fps = 30.0
    if video and video.get("avg_frame_rate", "0/0") != "0/0":
        num, den = video["avg_frame_rate"].split("/")
        fps = float(num) / float(den) if float(den) else 30.0
    return {
        "duration": float(data["format"].get("duration", 0.0)),
        "width": int(video["width"]) if video else 0,
        "height": int(video["height"]) if video else 0,
        "fps": fps,
        "vcodec": video["codec_name"] if video else None,
        "acodec": audio["codec_name"] if audio else None,
        "size_mb": int(data["format"].get("size", 0)) / 1e6,
    }


def fmt_ts(seconds: float) -> str:
    """12.5 -> '00:00:12.500'"""
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"


def srt_ts(seconds: float) -> str:
    return fmt_ts(max(0.0, seconds)).replace(".", ",")


def ass_ts(seconds: float) -> str:
    cs = int(round(max(0.0, seconds) * 100))
    h, cs = divmod(cs, 360_000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"
