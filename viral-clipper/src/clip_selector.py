"""Sélection des meilleurs clips : fenêtres alignées sur les phrases, sans répétition."""
from __future__ import annotations

import json
import re
from pathlib import Path

from . import ai_analyzer as ai
from .config import Config
from .utils import log

_WORD = re.compile(r"\w{4,}", re.UNICODE)


def _content_words(text: str) -> set[str]:
    return {w.lower() for w in _WORD.findall(text) if w.lower() not in ai.STOPWORDS}


def _jaccard(a: set, b: set) -> float:
    return len(a & b) / max(len(a | b), 1)


def build_candidates(sentences: list[dict], cfg: Config) -> list[dict]:
    """Toutes les fenêtres [phrase i → phrase j] dont la durée respecte les limites."""
    cands = []
    n = len(sentences)
    for i in range(n):
        if not ai.starts_cleanly(sentences[i]["text"]):
            continue  # un clip ne démarre pas sur "et", "mais", "donc"…
        for j in range(i, n):
            dur = sentences[j]["end"] - sentences[i]["start"]
            if dur > cfg.clip_max_seconds:
                break
            if dur < cfg.clip_min_seconds:
                continue
            group = sentences[i: j + 1]
            mean = sum(s["score"] for s in group) / len(group)
            hook = max(s["score"] for s in group[:2])                 # 1res secondes
            tail = 0.4 * group[-1]["text"].rstrip().endswith((".", "!", "?"))
            closeness = 1 - abs(dur - cfg.clip_target_seconds) / cfg.clip_max_seconds
            score = 1.0 * mean + 0.6 * hook + 0.5 * closeness + tail
            cands.append({
                "start": group[0]["start"], "end": group[-1]["end"], "first": i, "last": j,
                "heuristic": round(score, 3),
                "text": " ".join(s["text"] for s in group),
            })
    return cands


def _greedy(cands: list[dict], key: str, cfg: Config) -> list[dict]:
    chosen = []
    for c in sorted(cands, key=lambda c: c[key], reverse=True):
        words = _content_words(c["text"])
        ok = True
        for p in chosen:
            overlap = max(0.0, min(c["end"], p["end"]) - max(c["start"], p["start"]))
            if overlap > cfg.max_overlap_ratio * (c["end"] - c["start"]):
                ok = False
                break
            if _jaccard(words, p["_words"]) > 0.45:   # contenu trop similaire = répétitif
                ok = False
                break
        if ok:
            c["_words"] = words
            chosen.append(c)
        if len(chosen) >= cfg.max_clips:
            break
    return chosen


def select_clips(sentences: list[dict], cfg: Config, language: str | None) -> list[dict]:
    cands = build_candidates(sentences, cfg)
    if not cands:
        # Vidéo plus courte que la durée minimale : un seul clip = toute la parole.
        cands = [{"start": sentences[0]["start"], "end": sentences[-1]["end"], "first": 0,
                  "last": len(sentences) - 1, "heuristic": 0.0,
                  "text": " ".join(s["text"] for s in sentences)}]
    log.info("%d fenêtres candidates analysées.", len(cands))

    # Pré-sélection diversifiée (3x le nombre final) envoyée à l'IA.
    pre_cfg = Config(**{**cfg.__dict__, "max_clips": cfg.max_clips * 3})
    shortlist = _greedy(cands, "heuristic", pre_cfg)
    for k, c in enumerate(shortlist):
        c["id"] = k

    ranks = ai.llm_rank(shortlist, cfg.llm_model, language) if cfg.llm_available else {}
    hmax = max(c["heuristic"] for c in shortlist) or 1.0
    for c in shortlist:
        r = ranks.get(c["id"])
        h_norm = 100 * c["heuristic"] / hmax
        c["final"] = round(0.65 * r["score"] + 0.35 * h_norm, 1) if r else round(h_norm, 1)
        group = sentences[c["first"]: c["last"] + 1]
        c["title"] = (r or {}).get("title") or ai.fallback_title(group)
        c["hook"] = (r or {}).get("hook") or c["title"]
        c["reason"] = (r or {}).get("reason") or _heuristic_reason(group)
        c["source"] = "IA + heuristique" if r else "heuristique"

    chosen = _greedy(shortlist, "final", cfg)
    chosen.sort(key=lambda c: c["start"])  # ordre chronologique pour la numérotation
    clips, used_titles = [], set()
    for n, c in enumerate(chosen, 1):
        if c["title"] in used_titles:
            c["title"] = ai.fallback_title(sentences[c["first"]: c["last"] + 1], used_titles)
            c["hook"] = c["title"]
        used_titles.add(c["title"])
        clips.append({
            "name": f"clip_{n:02d}", "start": round(c["start"], 3), "end": round(c["end"], 3),
            "score": c["final"], "title": c["title"], "hook": c["hook"], "reason": c["reason"],
            "source": c["source"], "text": c["text"],
        })
    return clips


def _heuristic_reason(group: list[dict]) -> str:
    tags = sorted({t for s in group for t in s["tags"]})
    labels = {"hook": "accroches", "emotion": "émotion", "advice": "conseils", "story": "récit",
              "money": "argent/chiffres"}
    return ("Contient : " + ", ".join(labels[t] for t in tags)) if tags else "Passage dense et dynamique"


def save_clips(clips: list[dict], path: Path) -> None:
    path.write_text(json.dumps(clips, ensure_ascii=False, indent=2), encoding="utf-8")


def load_clips(path: Path) -> list[dict]:
    """Recharge une sélection (éventuellement modifiée à la main) depuis clips.json."""
    clips = json.loads(path.read_text(encoding="utf-8"))
    for n, c in enumerate(clips, 1):
        c.setdefault("name", f"clip_{n:02d}")
        c.setdefault("title", c["name"])
        c.setdefault("hook", c["title"])
        c.setdefault("score", 0)
        c.setdefault("reason", "Sélection manuelle")
        c.setdefault("source", "manuel")
        c.setdefault("text", "")
    return clips
