"""Recadrage 9:16 intelligent : suit le visage principal, plan par plan.

Principe (volontairement sobre, sans tremblement) :
* PySceneDetect découpe le clip en plans (changements de caméra).
* Dans chaque plan, OpenCV détecte les visages sur quelques images ; on retient
  la position médiane du plus grand visage par fenêtre de 4 s.
* La position du cadre ne change qu'au changement de plan ou si le locuteur se
  déplace nettement (> 12 % de la largeur) : pas de panoramique artificiel.
"""
from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np

from .utils import log

WINDOW = 4.0          # secondes par fenêtre d'analyse dans un plan long
SAMPLES = 5           # images analysées par fenêtre
HOLD_THRESHOLD = 0.12 # déplacement minimal (fraction de largeur de cadre) pour bouger


@dataclass
class CropPlan:
    mode: str                         # "crop" (source horizontale) ou "fit" (source verticale)
    crop_w: int = 0
    crop_h: int = 0
    keyframes: list[tuple[float, int]] | None = None   # (t relatif, x en pixels)
    faces_found: int = 0

    def x_expression(self) -> str:
        """Expression FFmpeg en escalier : x(t) constant par segment."""
        kf = self.keyframes or [(0.0, 0)]
        expr = str(kf[-1][1])
        for i in range(len(kf) - 2, -1, -1):
            expr = f"if(lt(t,{kf[i + 1][0]:.3f}),{kf[i][1]},{expr})"
        return expr


def detect_scenes(video: str, start: float, end: float) -> list[float]:
    """Retourne les instants de coupe (relatifs au début du clip)."""
    try:
        from scenedetect import ContentDetector, detect
        scenes = detect(video, ContentDetector(threshold=27.0), start_time=start, end_time=end)
        cuts = sorted({round(s[0].get_seconds() - start, 3) for s in scenes[1:]})
        return [c for c in cuts if 0.5 < c < end - start - 0.5]
    except Exception as exc:  # noqa: BLE001 - optionnel
        log.debug("Détection de plans indisponible (%s)", exc)
        return []


_CASCADE = None


def _faces(frame: np.ndarray) -> list[tuple[int, int, int, int]]:
    global _CASCADE
    if _CASCADE is None:
        _CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml")
    # Pas d'égalisation globale : elle dégrade la détection sur les fonds unis.
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    min_side = max(24, frame.shape[0] // 18)
    found = _CASCADE.detectMultiScale(gray, scaleFactor=1.08, minNeighbors=4, minSize=(min_side, min_side))
    return [tuple(map(int, f)) for f in found]


def plan_crop(video: str, start: float, end: float, src_w: int, src_h: int,
              out_w: int = 1080, out_h: int = 1920) -> CropPlan:
    target_ratio = out_w / out_h
    if src_w / src_h <= target_ratio * 1.15:
        return CropPlan(mode="fit")  # déjà vertical (ou presque) : pas de recadrage

    crop_h = src_h - src_h % 2
    crop_w = int(round(crop_h * target_ratio)) // 2 * 2
    max_x = src_w - crop_w
    center_x = max_x // 2

    duration = end - start
    cuts = [0.0] + detect_scenes(video, start, end) + [duration]
    cap = cv2.VideoCapture(video)
    scale = min(1.0, 960 / src_w)

    windows: list[tuple[float, float | None]] = []   # (t début, centre visage normalisé)
    faces_total = 0
    for a, b in zip(cuts[:-1], cuts[1:]):
        n_win = max(1, int(round((b - a) / WINDOW)))
        edges = np.linspace(a, b, n_win + 1)
        for wa, wb in zip(edges[:-1], edges[1:]):
            centers = []
            for t in np.linspace(wa + 0.1, wb - 0.1, SAMPLES):
                cap.set(cv2.CAP_PROP_POS_MSEC, (start + t) * 1000)
                ok, frame = cap.read()
                if not ok:
                    continue
                small = cv2.resize(frame, None, fx=scale, fy=scale)
                faces = _faces(small)
                if faces:
                    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
                    centers.append((x + w / 2) / small.shape[1])
            faces_total += len(centers)
            windows.append((float(wa), float(np.median(centers)) if centers else None))
        windows.append((float(b), "CUT"))  # marqueur de changement de plan
    cap.release()

    keyframes: list[tuple[float, int]] = []
    last_x: int | None = None
    force = True
    for t, c in windows:
        if c == "CUT":
            force = True
            continue
        x = center_x if c is None else int(np.clip(c * src_w - crop_w / 2, 0, max_x))
        if c is None and last_x is not None and not force:
            x = last_x  # pas de visage : on garde le cadre précédent
        if last_x is None or force or abs(x - last_x) > HOLD_THRESHOLD * crop_w:
            if t < duration:
                keyframes.append((round(t, 3), x // 2 * 2))
                last_x = x
        force = False

    # Fusion des images-clés identiques consécutives
    merged = []
    for t, x in keyframes:
        if not merged or merged[-1][1] != x:
            merged.append((t, x))
    merged[0] = (0.0, merged[0][1])
    log.info("    recadrage : %d plan(s), %d position(s), %d visage(s) détecté(s)",
             len(cuts) - 1, len(merged), faces_total)
    return CropPlan(mode="crop", crop_w=crop_w, crop_h=crop_h, keyframes=merged,
                    faces_found=faces_total)
