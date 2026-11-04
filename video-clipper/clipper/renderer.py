"""Étapes 5, 6, 8, 9 — découpe, recadrage, incrustation des sous-titres, traitement audio,
encodage H.264/AAC. Tout est fait en UN seul encodage depuis la source (pas de perte
de génération) ; la normalisation du volume est en deux passes (EBU R128).
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

from .config import Config
from .ffmpeg_utils import MediaInfo, run
from .reframe import Framing, video_filter

# Nettoyage de la voix : coupe des graves parasites (souffle, vent, ronflette),
# réduction de bruit douce, adoucissement des sifflantes.
VOICE_CHAIN = "highpass=f=75,lowpass=f=15000,afftdn=nf=-28:tn=1,deesser=i=0.3"


def _measure_loudness(src: Path, start: float, dur: float, cfg: Config) -> dict | None:
    af = f"{VOICE_CHAIN},loudnorm=I={cfg.loudness_target}:TP=-1.5:LRA=11:print_format=json"
    proc = run(["ffmpeg", "-hide_banner", "-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", src,
                "-vn", "-af", af, "-f", "null", "-"])
    txt = proc.stderr.decode("utf-8", "replace")
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", txt, re.S)
    if not m:
        return None
    data = json.loads(m.group(0))
    if data.get("input_i") in ("-inf", None) or float(data["input_i"]) < -70:
        return None   # silence : rien à normaliser
    return data


def audio_filter(src: Path, start: float, dur: float, cfg: Config) -> str:
    meas = _measure_loudness(src, start, dur, cfg)
    if meas:
        norm = (f"loudnorm=I={cfg.loudness_target}:TP=-1.5:LRA=11:"
                f"measured_I={meas['input_i']}:measured_TP={meas['input_tp']}:"
                f"measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}:"
                f"offset={meas['target_offset']}:linear=true")
    else:
        norm = f"loudnorm=I={cfg.loudness_target}:TP=-1.5:LRA=11"
    fade_out = max(dur - 0.25, 0)
    return (f"[0:a]{VOICE_CHAIN},{norm},aresample=48000,"
            f"afade=t=in:st=0:d=0.08,afade=t=out:st={fade_out:.3f}:d=0.25[a]")


def render(src: Path, info: MediaInfo, start: float, end: float, framing: Framing,
           ass_file: Path, out: Path, cfg: Config, *, crf: int, maxrate: str | None,
           fade_in: float, fade_out: float) -> Path:
    dur = end - start
    W, H = cfg.width, cfg.height
    work = ass_file.parent
    fps = info.fps if info.fps <= 60 else 30.0

    vf = video_filter(framing, info, W, H)
    # sous-titres puis fondus, appliqués après le recadrage
    fonts = Path(__file__).resolve().parent.parent / "fonts"
    fontsdir = f":fontsdir={os.path.relpath(fonts, work)}" if fonts.is_dir() else ""
    post = [f"ass={ass_file.name}{fontsdir}"]
    if fade_in > 0:
        post.append(f"fade=t=in:st=0:d={fade_in}")
    if fade_out > 0:
        post.append(f"fade=t=out:st={max(dur - fade_out, 0):.3f}:d={fade_out}")
    post.append("format=yuv420p")
    graph = vf.replace("[v]", "[vr]") + f";[vr]{','.join(post)}[v]"
    if info.has_audio:
        graph += ";" + audio_filter(src, start, dur, cfg)

    script = work / f"{out.stem}.filter.txt"
    script.write_text(graph, "utf-8")

    cmd = ["ffmpeg", "-y", "-hide_banner", "-v", "error",
           "-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", src.resolve(),
           "-filter_complex_script", script.name,
           "-map", "[v]"]
    if info.has_audio:
        cmd += ["-map", "[a]", "-c:a", "aac", "-b:a", "192k", "-ac", "2"]
    cmd += ["-c:v", "libx264", "-preset", cfg.preset, "-crf", str(crf),
            "-profile:v", "high", "-level:v", "4.2", "-pix_fmt", "yuv420p",
            "-r", f"{fps:.3f}", "-g", str(int(round(fps * 2))),
            "-movflags", "+faststart", "-metadata", "comment=video-clipper"]
    if maxrate:
        cmd += ["-maxrate", maxrate, "-bufsize", f"{int(maxrate.rstrip('Mk')) * 2}{maxrate[-1]}"]
    cmd.append(out.resolve())
    run(cmd, cwd=work)   # cwd = dossier du .ass : évite les soucis d'échappement de chemins (Windows)
    return out
