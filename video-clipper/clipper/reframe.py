"""Étape 6 — recadrage intelligent 16:9 → 9:16.

1. Détection des changements de plan (filtre `scene` de ffmpeg).
2. Détection des visages (OpenCV, 2 images/s) dans chaque plan.
3. Décision :
   - plan avec un seul visage dominant → recadrage centré sur ce visage ;
   - si une part importante du clip montre plusieurs personnes éloignées (plan large
     d'interview) ou aucun visage → mise en page « fond flouté » : l'image entière
     est conservée au centre, rien n'est coupé ni déformé.
Le recadrage change de position à chaque changement de plan (expression ffmpeg).
"""
from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from .ffmpeg_utils import MediaInfo, run

SAMPLE_FPS = 2.0
ANALYSIS_W = 640


@dataclass
class Framing:
    mode: str                          # "crop" | "blur" | "fit"
    shots: list[tuple[float, float]] = field(default_factory=list)  # (début relatif, centre x 0..1)
    detail: str = ""

    def shifted(self, offset: float) -> "Framing":
        """Même cadrage pour un sous-intervalle commençant `offset` s plus tard."""
        if self.mode != "crop":
            return self
        current = [x for t, x in self.shots if t <= offset][-1:] or [self.shots[0][1]]
        later = [(t - offset, x) for t, x in self.shots if t > offset]
        return Framing(self.mode, [(0.0, current[0])] + later, self.detail)


def detect_scenes(src: Path, start: float, dur: float, threshold: float = 0.32) -> list[float]:
    proc = run(["ffmpeg", "-hide_banner", "-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", src,
                "-an", "-vf", f"scale=320:-2,select='gt(scene,{threshold})',showinfo",
                "-f", "null", "-"])
    times = [float(m) for m in re.findall(r"pts_time:([\d.]+)", proc.stderr.decode("utf-8", "replace"))]
    return sorted(t for t in times if 0.3 < t < dur - 0.3)


def _sample_frames(src: Path, start: float, dur: float, info: MediaInfo) -> tuple[np.ndarray, int, int]:
    w = ANALYSIS_W
    h = int(round(w * info.height / info.width / 2)) * 2
    proc = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", str(src), "-an",
         "-vf", f"fps={SAMPLE_FPS},scale={w}:{h},format=gray", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    buf = np.frombuffer(proc.stdout, dtype=np.uint8)
    n = len(buf) // (w * h)
    return buf[: n * w * h].reshape(n, h, w), w, h


def analyze(src: Path, start: float, end: float, info: MediaInfo, layout: str = "auto") -> Framing:
    target_ratio = 9 / 16
    src_ratio = info.width / info.height
    if src_ratio <= target_ratio * 1.15:
        return Framing("fit", detail="source déjà verticale")
    if layout == "blur":
        return Framing("blur", detail="forcé (--layout blur)")

    import cv2

    if not hasattr(cv2, "CascadeClassifier"):
        return Framing("blur", detail="détecteur de visages indisponible (installez opencv < 5)")

    dur = end - start
    cuts = detect_scenes(src, start, dur)
    frames, w, h = _sample_frames(src, start, dur, info)
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    crop_frac = (info.height * target_ratio) / info.width   # largeur du recadrage / largeur source

    bounds = [0.0] + cuts + [dur]
    shots: list[tuple[float, float]] = []
    bad_time = 0.0
    for a, b in zip(bounds, bounds[1:]):
        idx = [k for k in range(len(frames)) if a <= k / SAMPLE_FPS < b]
        xs, multi, seen = [], 0, 0
        for k in idx:
            faces = cascade.detectMultiScale(frames[k], scaleFactor=1.1, minNeighbors=6,
                                             minSize=(h // 12, h // 12))
            if len(faces) == 0:
                continue
            seen += 1
            faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
            big = faces[0]
            xs.append((big[0] + big[2] / 2) / w)
            others = [f for f in faces[1:] if f[2] >= 0.5 * big[2]]
            if others:
                spread = max(abs((f[0] + f[2] / 2) / w - xs[-1]) for f in others)
                if spread > crop_frac * 0.7:
                    multi += 1
        n = max(len(idx), 1)
        if seen / n < 0.3 or multi / n > 0.5:
            bad_time += b - a
            shots.append((a, 0.5))
        else:
            shots.append((a, float(np.median(xs))))

    bad_share = bad_time / max(dur, 0.01)
    detail = f"{len(bounds)-1} plan(s), {bad_share:.0%} sans sujet unique"
    if layout == "crop" or bad_share <= 0.35:
        # fusionne les plans consécutifs de même cadrage
        merged: list[tuple[float, float]] = []
        for t, x in shots:
            if merged and abs(merged[-1][1] - x) < 0.03:
                continue
            merged.append((t, x))
        return Framing("crop", merged, detail)
    return Framing("blur", detail=detail)


def video_filter(framing: Framing, info: MediaInfo, W: int, H: int) -> str:
    """Chaîne de filtres ffmpeg [0:v] → [v] au format W×H."""
    if framing.mode == "crop":
        cw = int(round(info.height * W / H / 2)) * 2
        cw = min(cw, info.width - info.width % 2)

        def px(x: float) -> int:
            return int(min(max(x * info.width - cw / 2, 0), info.width - cw))

        # construit if(lt(t,T1),X0,if(lt(t,T2),X1,...,Xn))
        expr = str(px(framing.shots[-1][1]))
        for k in range(len(framing.shots) - 2, -1, -1):
            t_next = framing.shots[k + 1][0]
            expr = f"if(lt(t\\,{t_next:.3f})\\,{px(framing.shots[k][1])}\\,{expr})"
        return (f"[0:v]crop=w={cw}:h={info.height - info.height % 2}:x={expr}:y=0,"
                f"scale={W}:{H}:flags=lanczos,setsar=1[v]")
    if framing.mode == "fit":
        return (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=decrease:flags=lanczos,"
                f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1[v]")
    # blur : fond = image agrandie + floutée ; devant = image entière, non déformée
    return (f"[0:v]split=2[bg][fg];"
            f"[bg]scale={W // 4}:{H // 4}:force_original_aspect_ratio=increase,crop={W // 4}:{H // 4},"
            f"boxblur=10:2,eq=brightness=-0.12:saturation=1.1,scale={W}:{H}[bgb];"
            f"[fg]scale={W}:-2:flags=lanczos[fgs];"
            f"[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1[v]")


def subtitle_margin(framing: Framing, info: MediaInfo, W: int, H: int) -> int:
    """Position verticale des sous-titres (distance au bas, en px)."""
    if framing.mode == "blur":
        fg_h = W * info.height / info.width
        bottom_of_fg = (H + fg_h) / 2
        return int(max(H - bottom_of_fg - 230, 420))   # juste sous l'image
    return 560   # tiers inférieur, au-dessus de l'interface TikTok
