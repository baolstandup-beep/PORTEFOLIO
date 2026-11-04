"""Étapes 7-8 — sous-titres SRT (livrable) et ASS animés (incrustés).

Style « réseaux sociaux » : 1 à 2 lignes courtes, gros caractères gras, contour noir,
le mot prononcé s'allume en jaune avec un léger zoom (effet karaoké).
Les passages jugés mal transcrits (avg_logprob trop bas) ne sont pas sous-titrés :
mieux vaut pas de sous-titre qu'un sous-titre faux.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .config import Config


@dataclass
class Cue:
    start: float
    end: float
    words: list[dict]   # temps relatifs au début du clip

    @property
    def text(self) -> str:
        return " ".join(w["word"] for w in self.words)


def collect_words(transcript: dict, start: float, end: float, min_logprob: float) -> list[dict]:
    out = []
    for seg in transcript["segments"]:
        if seg["end"] < start or seg["start"] > end:
            continue
        if seg.get("avg_logprob", 0) < min_logprob or seg.get("no_speech_prob", 0) > 0.8:
            continue
        for w in seg.get("words") or []:
            mid = (w["start"] + w["end"]) / 2
            if start <= mid <= end:
                out.append({"word": w["word"], "start": max(w["start"] - start, 0.0),
                            "end": min(w["end"] - start, end - start)})
    return out


def build_cues(words: list[dict], max_words: int = 6, max_chars: int = 30,
               max_dur: float = 3.2, max_gap: float = 0.6) -> list[Cue]:
    cues: list[Cue] = []
    cur: list[dict] = []
    for i, w in enumerate(words):
        if cur:
            gap = w["start"] - cur[-1]["end"]
            chars = len(" ".join(x["word"] for x in cur + [w]))
            if (len(cur) >= max_words or chars > max_chars or gap > max_gap
                    or w["end"] - cur[0]["start"] > max_dur):
                cues.append(Cue(cur[0]["start"], cur[-1]["end"], cur))
                cur = []
        cur.append(w)
        if w["word"].endswith((".", "?", "!", "…", ",")) and len(cur) >= 2:
            cues.append(Cue(cur[0]["start"], cur[-1]["end"], cur))
            cur = []
    if cur:
        cues.append(Cue(cur[0]["start"], cur[-1]["end"], cur))
    # Chaque sous-titre reste affiché jusqu'au suivant (max +0,5 s) : lecture plus confortable.
    for a, b in zip(cues, cues[1:]):
        a.end = min(max(a.end, b.start - 0.02), a.end + 0.5) if b.start - a.end < 0.5 else a.end + 0.3
    if cues:
        cues[-1].end += 0.3
    return cues


def _srt_ts(t: float) -> str:
    ms = int(round(max(t, 0) * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def write_srt(cues: list[Cue], path: Path) -> Path:
    lines = []
    for k, c in enumerate(cues, 1):
        lines += [str(k), f"{_srt_ts(c.start)} --> {_srt_ts(c.end)}", c.text, ""]
    path.write_text("\n".join(lines), "utf-8")
    return path


def _ass_ts(t: float) -> str:
    cs = int(round(max(t, 0) * 100))
    h, cs = divmod(cs, 360_000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"


def _esc(text: str) -> str:
    return text.replace("\\", "/").replace("{", "(").replace("}", ")").replace("\n", " ")


def write_ass(cues: list[Cue], path: Path, cfg: Config, margin_v: int, badge: str | None = None) -> Path:
    """`margin_v` = distance du bas de l'image (px) ; `badge` = ex. « 2/3 » en haut à droite."""
    fs = cfg.font_size
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {cfg.width}
PlayResY: {cfg.height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,{cfg.font},{fs},&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,5,2,2,90,90,{margin_v},1
Style: Badge,{cfg.font},44,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,-1,0,0,0,100,100,0,0,3,10,0,9,60,60,140,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    hi = r"{\c&H0000E5FF&\fscx112\fscy112}"   # jaune/orangé + zoom léger
    lo = r"{\c&H00FFFFFF&\fscx100\fscy100}"
    for c in cues:
        words = [_esc(w["word"].upper() if cfg.uppercase else w["word"]) for w in c.words]
        for k, w in enumerate(c.words):
            st = w["start"] if k else c.start
            en = c.words[k + 1]["start"] if k + 1 < len(c.words) else c.end
            if en - st < 0.02:
                continue
            parts = [(hi + t + lo) if i == k else t for i, t in enumerate(words)]
            events.append(f"Dialogue: 0,{_ass_ts(st)},{_ass_ts(en)},Main,,0,0,0,,{' '.join(parts)}")
    if badge:
        events.append(f"Dialogue: 1,{_ass_ts(0)},{_ass_ts(99999)},Badge,,0,0,0,,{_esc(badge)}")
    path.write_text(header + "\n".join(events) + "\n", "utf-8")
    return path
