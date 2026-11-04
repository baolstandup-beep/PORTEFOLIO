"""Sous-titres : SRT classique + ASS animé mot par mot (style podcast).

* SRT : lignes de 42 caractères max, coupées aux fins de phrase.
* ASS : groupes de 2-3 mots en MAJUSCULES, le mot prononcé est surligné en
  jaune avec un léger "pop", les mots clés sont en vert. Placé au-dessus de la
  zone d'interface TikTok (boutons à droite, légende en bas).
"""
from __future__ import annotations

from pathlib import Path

from .ai_analyzer import is_keyword
from .utils import ass_ts, srt_ts

YELLOW = "&H0000E5FF&"   # ASS = &HBBGGRR
GREEN = "&H0055FF55&"


def clip_words(sentences: list[dict], start: float, end: float) -> list[dict]:
    """Mots du clip avec temps relatifs au début du clip."""
    words = []
    for s in sentences:
        for w in s["words"]:
            if w["start"] >= start - 0.05 and w["end"] <= end + 0.05:
                words.append({"start": max(0.0, w["start"] - start), "end": w["end"] - start,
                              "word": w["word"], "eos": w is s["words"][-1]})
    return words


def _chunks(words: list[dict], max_words: int, max_chars: int) -> list[list[dict]]:
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words or len(" ".join(x["word"] for x in cur + [w])) > max_chars
                    or w["start"] - cur[-1]["end"] > 0.7):
            out.append(cur)
            cur = []
        cur.append(w)
        if w["eos"]:
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


def write_srt(words: list[dict], path: Path) -> None:
    lines = []
    chunks = _chunks(words, max_words=8, max_chars=42)
    for i, ch in enumerate(chunks, 1):
        text = " ".join(w["word"] for w in ch)
        end = ch[-1]["end"] + 0.15
        if i < len(chunks):
            end = min(end, chunks[i][0]["start"])   # jamais de chevauchement
        lines += [str(i), f"{srt_ts(ch[0]['start'])} --> {srt_ts(end)}", text, ""]
    path.write_text("\n".join(lines), encoding="utf-8")


def _esc(text: str) -> str:
    return text.replace("\\", "").replace("{", "(").replace("}", ")")


def write_ass(words: list[dict], path: Path, cfg, hook: str | None, duration: float) -> None:
    w, h = cfg.width, cfg.height
    podcast = cfg.subtitle_style == "podcast"
    size = 86 if podcast else 64
    margin_v = int(h * 0.27)    # au-dessus de la légende et des boutons TikTok
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,{cfg.font_name},{size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,-1,0,0,0,100,100,1,0,1,{7 if podcast else 5},3,2,90,90,{margin_v},1
Style: Hook,{cfg.font_name},68,&H00101010,&H00FFFFFF,&H00FFFFFF,&H00000000,-1,0,0,0,100,100,0,0,3,18,0,8,90,90,{int(h * 0.13)},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    if hook and cfg.enable_hook_title:
        hook_words = hook.split()
        short = " ".join(hook_words[:7]) + ("…" if len(hook_words) > 7 else "")
        text = _esc(short.upper())
        events.append(f"Dialogue: 1,{ass_ts(0)},{ass_ts(min(3.5, duration))},Hook,,0,0,0,,"
                      f"{{\\fad(150,300)\\fscx92\\fscy92\\t(0,180,\\fscx100\\fscy100)}}{text}")

    chunks = _chunks(words, max_words=3 if podcast else 6, max_chars=22 if podcast else 40)
    for ci, ch in enumerate(chunks):
        nxt_start = chunks[ci + 1][0]["start"] if ci + 1 < len(chunks) else duration
        chunk_end = min(ch[-1]["end"] + 0.35, nxt_start)
        if nxt_start - ch[-1]["end"] < 0.5:
            chunk_end = nxt_start          # évite le clignotement entre deux groupes
        for k, cur in enumerate(ch):
            t0 = cur["start"] if k else ch[0]["start"]
            t1 = ch[k + 1]["start"] if k + 1 < len(ch) else chunk_end
            if t1 - t0 < 0.02:
                continue
            parts = []
            for j, word in enumerate(ch):
                txt = _esc(word["word"].upper() if podcast else word["word"])
                if j == k:
                    parts.append(f"{{\\c{YELLOW}\\fscx112\\fscy112\\t(0,90,\\fscx100\\fscy100)}}{txt}{{\\r}}")
                elif is_keyword(word["word"]):
                    parts.append(f"{{\\c{GREEN}}}{txt}{{\\r}}")
                else:
                    parts.append(txt)
            intro = "{\\fad(70,0)\\fscx90\\fscy90\\t(0,100,\\fscx100\\fscy100)}" if k == 0 else ""
            events.append(f"Dialogue: 0,{ass_ts(t0)},{ass_ts(t1)},Caption,,0,0,0,,{intro}{' '.join(parts)}")
    path.write_text(header + "\n".join(events) + "\n", encoding="utf-8")
