"""Étapes 3-4 — détection des moments forts et choix des points de découpe.

Principe :
1. On reconstruit des PHRASES à partir des mots horodatés (fin = ponctuation forte
   ou pause > 0,8 s). Une coupe ne tombe jamais ailleurs qu'entre deux phrases.
2. Chaque phrase reçoit un score combinant :
   - intensité de la voix (énergie RMS relative)       → passages animés
   - débit de parole                                   → passages vivants
   - densité d'information (mots rares dans la vidéo)  → passages informatifs
   - marqueurs d'accroche (questions, exclamations, chiffres, mots-clés forts)
   - pénalités : hésitations, passages mal transcrits
3. On évalue toutes les fenêtres [phrase i … phrase j] de min_clip à max_clip
   secondes, en favorisant une ouverture forte (le « hook » des 3 premières secondes).
4. Sélection gloutonne des meilleures fenêtres sans chevauchement ni redite
   (similarité lexicale bornée).
"""
from __future__ import annotations

import math
import re
import wave
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from .config import Config

STOPWORDS = set("""
le la les l un une des de du d et ou à a au aux en dans pour par sur sous avec sans que qu qui quoi
dont où ce cet cette ces c se s sa son ses leur leurs lui nous vous ils elles il elle on je j tu me m
te t mon ma mes ton ta tes notre nos votre vos y ne n pas plus est sont été être ai as avons avez ont
avait était sera fait faire dit dire comme mais donc or ni car si tout tous toute toutes très bien
aussi alors là ici oui non quand même encore déjà peu beaucoup chose choses parce cela ça ceci
euh heu hum bon voilà ben bah hein enfin quoi genre bref
""".split())

FILLERS = {"euh", "heu", "hum", "bon", "voilà", "ben", "bah", "hein", "enfin", "bref"}

# Racines de mots qui accrochent dans un contenu politique/actualité (FR).
HOOK_STEMS = [
    "jamais", "toujours", "vérit", "problèm", "important", "grave", "scandal", "pourquoi",
    "comment", "secret", "peupl", "sénégal", "jeun", "argent", "milliard", "million",
    "corrupt", "élect", "présiden", "gouvern", "pouvoir", "opposition", "chang", "aveni",
    "ruptur", "combat", "promess", "réalit", "danger", "crise", "emploi", "chômag", "justic",
    "libert", "hont", "responsab", "solution", "nouve", "parti", "politi", "trahi", "mensong",
    "dénonc", "révolu", "souverain", "patriot", "pastef", "sonko", "diomaye", "macky",
]
HOOK_PHRASES = [
    "je vous dis", "je le dis", "il faut", "soyons clairs", "la question", "ce qui est grave",
    "la vérité", "personne ne", "je vous assure", "écoutez", "regardez", "le problème",
    "c'est inadmissible", "je refuse", "nous allons", "on ne peut pas",
]


def _norm(word: str) -> str:
    w = word.lower().strip(" .,;:!?«»\"'()[]…-–—")
    return w


def _tokens(text: str) -> list[str]:
    return [t for t in re.findall(r"[\wÀ-ÿ']+", text.lower()) if t]


@dataclass
class Sentence:
    start: float
    end: float
    words: list[dict]
    logprob: float
    terminal: bool          # se termine par . ? ! …
    forced: bool = False    # coupée de force (phrase trop longue) → pas un bon point de sortie
    score: float = 0.0
    reasons: list[str] = field(default_factory=list)

    @property
    def text(self) -> str:
        return " ".join(w["word"] for w in self.words).strip()

    @property
    def duration(self) -> float:
        return max(self.end - self.start, 0.01)

    @property
    def low_confidence(self) -> bool:
        return self.logprob < -1.0


# ---------------------------------------------------------------------------
# 1. Phrases
# ---------------------------------------------------------------------------

def build_sentences(transcript: dict, max_sentence: float = 25.0) -> list[Sentence]:
    words: list[dict] = []
    for seg in transcript["segments"]:
        lp = seg.get("avg_logprob", 0.0)
        seg_words = seg.get("words") or []
        if not seg_words:  # transcription sans horodatage par mot : on répartit
            toks = seg["text"].split()
            if not toks:
                continue
            step = (seg["end"] - seg["start"]) / len(toks)
            seg_words = [{"word": t, "start": seg["start"] + i * step,
                          "end": seg["start"] + (i + 1) * step} for i, t in enumerate(toks)]
        for w in seg_words:
            if w["end"] <= w["start"]:
                w = {**w, "end": w["start"] + 0.05}
            words.append({**w, "logprob": lp})

    sentences: list[Sentence] = []
    cur: list[dict] = []

    def flush(terminal: bool, forced: bool = False) -> None:
        if not cur:
            return
        lp = float(np.mean([w["logprob"] for w in cur]))
        sentences.append(Sentence(cur[0]["start"], cur[-1]["end"], list(cur), lp, terminal, forced))
        cur.clear()

    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        gap = (nxt["start"] - w["end"]) if nxt else 99
        ends = w["word"].rstrip().endswith((".", "?", "!", "…"))
        if ends or gap > 0.8:
            flush(terminal=ends or gap > 1.2)
        elif cur[-1]["end"] - cur[0]["start"] > max_sentence:
            # Phrase interminable : on coupe à la dernière virgule si possible.
            cut = max((k for k, cw in enumerate(cur[:-1]) if cw["word"].endswith((",", ";", ":"))),
                      default=None)
            if cut is not None and cut > 2:
                rest = cur[cut + 1:]
                del cur[cut + 1:]
                flush(terminal=False, forced=True)
                cur.extend(rest)
            else:
                flush(terminal=False, forced=True)
    flush(terminal=True)
    return sentences


# ---------------------------------------------------------------------------
# 2. Énergie audio
# ---------------------------------------------------------------------------

def audio_energy(wav_path: Path, hop: float = 0.25) -> tuple[np.ndarray, float]:
    """RMS en dB par tranche de `hop` secondes (lecture par blocs : peu de mémoire)."""
    with wave.open(str(wav_path), "rb") as w:
        sr = w.getframerate()
        hop_n = int(sr * hop)
        values: list[float] = []
        while True:
            raw = w.readframes(hop_n * 400)
            if not raw:
                break
            data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
            m = len(data) // hop_n
            if m == 0:
                break
            frames = data[: m * hop_n].reshape(m, hop_n)
            values.extend((20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-6)).tolist())
    return np.array(values, dtype=np.float32), hop


def _zscore(x: np.ndarray) -> np.ndarray:
    sd = x.std()
    return np.zeros_like(x) if sd < 1e-9 else np.clip((x - x.mean()) / sd, -2.5, 2.5)


# ---------------------------------------------------------------------------
# 3. Score des phrases
# ---------------------------------------------------------------------------

def score_sentences(sentences: list[Sentence], energy: np.ndarray | None, hop: float) -> None:
    if not sentences:
        return
    # Fréquence documentaire des mots pour mesurer l'information (IDF).
    df: dict[str, int] = {}
    toks_per = []
    for s in sentences:
        toks = {t for t in _tokens(s.text) if t not in STOPWORDS and len(t) > 2}
        toks_per.append(toks)
        for t in toks:
            df[t] = df.get(t, 0) + 1
    n = len(sentences)

    loud, rate, info, hook, filler = [], [], [], [], []
    for s, toks in zip(sentences, toks_per):
        if energy is not None and len(energy):
            a, b = int(s.start / hop), max(int(s.end / hop), int(s.start / hop) + 1)
            seg = energy[a:b]
            loud.append(float(np.percentile(seg, 75)) if len(seg) else float(energy.mean()))
        else:
            loud.append(0.0)
        rate.append(len(s.words) / s.duration)
        info.append(sum(math.log(n / df[t]) for t in toks) / max(len(_tokens(s.text)), 4))

        low = s.text.lower()
        h = 0.0
        if "?" in s.text:
            h += 1.0
        if "!" in s.text:
            h += 0.8
        if re.search(r"\d", s.text):
            h += 0.6
        h += 0.5 * sum(1 for t in _tokens(low) if any(t.startswith(st) for st in HOOK_STEMS))
        h += 1.0 * sum(1 for p in HOOK_PHRASES if p in low)
        hook.append(min(h, 4.0))
        fw = sum(1 for t in _tokens(low) if t in FILLERS)
        filler.append(fw / max(len(s.words), 1))

    z_loud, z_rate, z_info, z_hook = map(_zscore, map(np.array, (loud, rate, info, hook)))
    for k, s in enumerate(sentences):
        sc = 0.30 * z_loud[k] + 0.15 * z_rate[k] + 0.25 * z_info[k] + 0.30 * z_hook[k]
        sc -= 2.0 * filler[k]
        if len(s.words) < 4:
            sc -= 0.3
        if s.low_confidence:
            sc -= 1.5
        s.score = float(sc)
        if z_loud[k] > 1:
            s.reasons.append("voix intense")
        if z_hook[k] > 1:
            s.reasons.append("phrase d'accroche")
        if z_info[k] > 1:
            s.reasons.append("dense en information")
        if z_rate[k] > 1:
            s.reasons.append("débit rapide")


# ---------------------------------------------------------------------------
# 4. Fenêtres candidates et sélection
# ---------------------------------------------------------------------------

@dataclass
class ClipPlan:
    index: int
    start: float
    end: float
    score: float
    first_sentence: int
    last_sentence: int
    hook: str
    reasons: list[str]
    status_parts: list[tuple[float, float]] = field(default_factory=list)
    status_files: list[str] = field(default_factory=list)

    @property
    def duration(self) -> float:
        return self.end - self.start


def _content_set(sentences: list[Sentence], i: int, j: int) -> set[str]:
    out: set[str] = set()
    for s in sentences[i: j + 1]:
        out.update(t for t in _tokens(s.text) if t not in STOPWORDS and len(t) > 3)
    return out


def _bounds(sentences: list[Sentence], i: int, j: int, max_len: float) -> tuple[float, float]:
    """Bornes avec une petite marge, sans mordre sur la phrase voisine."""
    prev_end = sentences[i - 1].end if i > 0 else 0.0
    next_start = sentences[j + 1].start if j + 1 < len(sentences) else sentences[j].end + 1.0
    start = max(prev_end + 0.05, sentences[i].start - 0.25, 0.0)
    end = min(next_start - 0.05, sentences[j].end + 0.40)
    end = max(end, sentences[j].end)
    if end - start > max_len:  # la marge ne doit pas faire dépasser la limite
        start = max(start, end - max_len)
    return round(start, 3), round(end, 3)


def propose_clips(sentences: list[Sentence], cfg: Config) -> tuple[list[ClipPlan], list[ClipPlan]]:
    """Retourne (clips retenus triés chronologiquement, top des candidats pour le rapport)."""
    n = len(sentences)
    if n == 0:
        return [], []
    dur = np.array([s.duration for s in sentences])
    sc = np.array([s.score for s in sentences])
    S = np.concatenate([[0], np.cumsum(sc * dur)])
    D = np.concatenate([[0], np.cumsum(dur)])
    LC = np.concatenate([[0], np.cumsum([d if s.low_confidence else 0 for s, d in zip(sentences, dur)])])

    def start_ok(i: int) -> bool:
        return i == 0 or sentences[i - 1].terminal or sentences[i].start - sentences[i - 1].end >= 0.6

    def end_ok(j: int) -> bool:
        s = sentences[j]
        if s.forced:
            return False
        return j == n - 1 or s.terminal or sentences[j + 1].start - s.end >= 0.6

    candidates: list[ClipPlan] = []
    for i in range(n):
        if not start_ok(i) or sentences[i].low_confidence or len(sentences[i].words) < 3:
            continue
        for j in range(i, n):
            start, end = _bounds(sentences, i, j, cfg.max_clip)
            length = sentences[j].end - sentences[i].start
            if length > cfg.max_clip:
                break
            if length < cfg.min_clip or not end_ok(j):
                continue
            mean = (S[j + 1] - S[i]) / (D[j + 1] - D[i])
            opener = max(sentences[k].score for k in range(i, min(i + 2, j) + 1))
            low_frac = (LC[j + 1] - LC[i]) / (D[j + 1] - D[i])
            # léger bonus de longueur (≈ 90 s) : la moyenne seule favoriserait toujours
            # les fenêtres les plus courtes, souvent trop maigres pour tenir une idée.
            total = mean + 0.35 * opener + 0.20 * min(length / 90.0, 1.0) - 1.0 * low_frac
            if sentences[j].terminal:
                total += 0.05
            candidates.append(ClipPlan(0, start, end, float(total), i, j, "", []))

    candidates.sort(key=lambda c: c.score, reverse=True)
    chosen: list[ClipPlan] = []
    chosen_sets: list[set[str]] = []
    for c in candidates:
        if len(chosen) >= cfg.max_clips:
            break
        if any(c.start < o.end and o.start < c.end for o in chosen):
            continue
        cs = _content_set(sentences, c.first_sentence, c.last_sentence)
        if any(len(cs & o) / max(len(cs | o), 1) > cfg.max_text_overlap for o in chosen_sets):
            continue
        chosen.append(c)
        chosen_sets.append(cs)

    # Alternatives pour le rapport : meilleures fenêtres qui ne recoupent ni les clips
    # retenus ni les autres alternatives.
    alternatives: list[ClipPlan] = []
    for c in candidates:
        if len(alternatives) >= 8:
            break
        if any(c.start < o.end and o.start < c.end for o in chosen + alternatives):
            continue
        alternatives.append(c)

    for c in chosen + alternatives:
        _describe(c, sentences)
    chosen.sort(key=lambda c: c.start)
    for k, c in enumerate(chosen, 1):
        c.index = k
    return chosen, alternatives


def _describe(c: ClipPlan, sentences: list[Sentence]) -> None:
    span = sentences[c.first_sentence: c.last_sentence + 1]
    best = max(span, key=lambda s: s.score)
    c.hook = best.text[:160]
    reasons: dict[str, int] = {}
    for s in span:
        for r in s.reasons:
            reasons[r] = reasons.get(r, 0) + 1
    c.reasons = [f"{r} ×{k}" for r, k in sorted(reasons.items(), key=lambda x: -x[1])]


# ---------------------------------------------------------------------------
# 5. Découpage en statuts WhatsApp
# ---------------------------------------------------------------------------

def split_for_status(clip: ClipPlan, sentences: list[Sentence], cfg: Config) -> list[tuple[float, float]]:
    """Découpe un clip en morceaux ≤ status_max, de longueurs équilibrées, coupés de
    préférence entre deux phrases, sinon dans une pause entre deux mots."""
    if clip.duration <= cfg.status_max:
        return [(clip.start, clip.end)]

    # Points de coupe candidats : (temps, pénalité en secondes équivalentes)
    cands: list[tuple[float, float]] = []
    span = sentences[clip.first_sentence: clip.last_sentence + 1]
    for a, b in zip(span, span[1:]):
        cands.append(((a.end + b.start) / 2, 0.0 if a.terminal else 3.0))
    for s in span:
        for w1, w2 in zip(s.words, s.words[1:]):
            gap = w2["start"] - w1["end"]
            pen = 8.0 if gap >= 0.25 else 20.0
            if w1["word"].endswith((",", ";", ":")):
                pen -= 4.0
            cands.append(((w1["end"] + w2["start"]) / 2, pen))
    cands.sort()

    parts: list[tuple[float, float]] = []
    cur = clip.start
    while clip.end - cur > cfg.status_max:
        remaining = clip.end - cur
        k = math.ceil(remaining / cfg.status_max)
        ideal = cur + remaining / k
        best = None
        for t, pen in cands:
            seg = t - cur
            if seg < cfg.status_min or seg > cfg.status_max or clip.end - t < cfg.status_min:
                continue
            cost = abs(t - ideal) + pen
            if best is None or cost < best[0]:
                best = (cost, t)
        cut = best[1] if best else cur + cfg.status_max  # dernier recours : coupe nette
        parts.append((round(cur, 3), round(cut, 3)))
        cur = cut
    parts.append((round(cur, 3), round(clip.end, 3)))
    return parts


def plan_from_dict(d: dict) -> ClipPlan:
    c = ClipPlan(d["index"], d["start"], d["end"], d.get("score", 0.0), d.get("first_sentence", 0),
                 d.get("last_sentence", 0), d.get("hook", ""), d.get("reasons", []))
    c.status_parts = [tuple(p) for p in d.get("status_parts", [])]
    return c


def plan_to_dict(c: ClipPlan) -> dict:
    return {"index": c.index, "start": c.start, "end": c.end, "duration": round(c.duration, 2),
            "score": round(c.score, 3), "first_sentence": c.first_sentence,
            "last_sentence": c.last_sentence, "hook": c.hook, "reasons": c.reasons,
            "status_parts": [list(p) for p in c.status_parts]}


def fmt_ts(t: float) -> str:
    t = max(t, 0)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:05.2f}"
