"""Petits utilitaires autour de ffmpeg / ffprobe."""
from __future__ import annotations

import json
import shutil
import subprocess
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path


class FFmpegError(RuntimeError):
    pass


def run(cmd: list[str], cwd: Path | None = None, capture: bool = True) -> subprocess.CompletedProcess:
    """Lance une commande ; lève FFmpegError avec la fin de stderr en cas d'échec."""
    proc = subprocess.run(
        [str(c) for c in cmd],
        cwd=str(cwd) if cwd else None,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE,
    )
    if proc.returncode != 0:
        tail = proc.stderr.decode("utf-8", "replace")[-2500:]
        raise FFmpegError(f"Échec de : {' '.join(map(str, cmd[:6]))} …\n{tail}")
    return proc


def has_binary(name: str) -> bool:
    return shutil.which(name) is not None


def ffmpeg_filters() -> str:
    return run(["ffmpeg", "-hide_banner", "-filters"]).stdout.decode("utf-8", "replace")


@dataclass
class MediaInfo:
    width: int
    height: int
    fps: float
    duration: float
    has_audio: bool


def probe(path: Path) -> MediaInfo:
    out = run([
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_streams", "-show_format", str(path),
    ]).stdout
    data = json.loads(out)
    video = next((s for s in data["streams"] if s.get("codec_type") == "video"), None)
    if video is None:
        raise FFmpegError(f"Aucun flux vidéo dans {path}")
    fps = float(Fraction(video.get("avg_frame_rate") or video.get("r_frame_rate") or "30/1") or 30)
    if fps <= 0 or fps > 240:
        fps = 30.0
    duration = float(data["format"].get("duration") or video.get("duration") or 0)
    has_audio = any(s.get("codec_type") == "audio" for s in data["streams"])
    # Rotation (vidéos de téléphone) : on inverse largeur/hauteur si nécessaire.
    w, h = int(video["width"]), int(video["height"])
    rot = 0
    for side in video.get("side_data_list", []) or []:
        if "rotation" in side:
            rot = abs(int(side["rotation"]))
    if rot in (90, 270):
        w, h = h, w
    return MediaInfo(width=w, height=h, fps=fps, duration=duration, has_audio=has_audio)


def extract_audio(video: Path, wav: Path) -> Path:
    """Audio mono 16 kHz : format attendu par Whisper et par l'analyse d'énergie."""
    if wav.exists() and wav.stat().st_size > 0:
        return wav
    run(["ffmpeg", "-y", "-v", "error", "-i", video, "-vn", "-ac", "1", "-ar", "16000",
         "-c:a", "pcm_s16le", wav])
    return wav
