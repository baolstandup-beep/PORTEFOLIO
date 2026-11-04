"""Analyse du contenu : score de chaque phrase, mots-clés, titres, et notation IA.

Deux niveaux :
1. Heuristique locale (toujours active, gratuite, hors-ligne) : accroches,
   émotions, conseils, chiffres, questions, récit, énergie vocale.
2. Claude (optionnel, si ANTHROPIC_API_KEY est défini) : note sémantique du
   potentiel viral de chaque clip candidat + titre et accroche rédigés.
"""
from __future__ import annotations

import json
import os
import re
import wave
from pathlib import Path

import numpy as np

from .utils import log

# Lexiques bilingues (FR/EN). Racines volontairement courtes pour couvrir les flexions.
HOOK = r"secret|erreur|jamais|personne ne|vérit|pourquoi|comment|attention|incroyable|choqu|" \
       r"le plus|la plus|personne|voici|imagine|révél|scandal|interdit|arnaque|piège|" \
       r"never|mistake|truth|why|how|nobody|imagine|shocking|insane|biggest|worst|best"
EMOTION = r"peur|amour|mort|pleur|heureu|colère|rêve|fier|honte|souffr|douleur|joie|" \
          r"triste|famille|maman|papa|enfant|vie |fear|love|death|cry|happy|angry|dream|proud|pain"
ADVICE = r"il faut|conseil|astuce|étape|faites|ne faites pas|apprend|retenez|règle|méthode|" \
         r"solution|clé|you should|tip|step|learn|rule|method|key|lesson"
STORY = r"je me souviens|un jour|quand j'étais|à l'époque|histoire|i remember|one day|story|" \
        r"when i was"
MONEY = r"argent|million|milliard|euro|dollar|franc|cfa|riche|pauvre|business|money|rich|poor"
CONNECTORS = ("et ", "mais ", "donc ", "alors ", "parce ", "puis ", "ensuite ", "and ", "but ",
              "so ", "because ", "then ", "euh", "hum")
STOPWORDS = set("""le la les un une des de du et ou mais donc or ni car que qui quoi dont où ce cet
cette ces je tu il elle on nous vous ils elles me te se mon ton son ma ta sa mes tes ses notre votre
leur leurs à au aux en dans par pour sur avec sans sous est sont être avoir a ai as ont été fait
pas ne plus très tout tous bien comme si y c'est j'ai the a an and or but of to in on for with is
are was were be been it this that i you he she we they my your not do does did have has so just
like what""".split())

_PATTERNS = {name: re.compile(p, re.IGNORECASE) for name, p in
             {"hook": HOOK, "emotion": EMOTION, "advice": ADVICE, "story": STORY, "money": MONEY}.items()}
_NUMBER = re.compile(r"\d")
KEYWORD_RE = re.compile(f"({HOOK}|{EMOTION}|{MONEY})", re.IGNORECASE)


# ---------------------------------------------------------------- énergie
def audio_energy(wav: Path, hop: float = 0.25) -> tuple[np.ndarray, float]:
    """RMS (en dB, centré-réduit) par fenêtre de `hop` secondes."""
    with wave.open(str(wav), "rb") as wf:
        sr = wf.getframerate()
        data = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32)
    n = int(sr * hop)
    frames = data[: len(data) // n * n].reshape(-1, n) if len(data) >= n else data.reshape(1, -1)
    db = 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-6)
    z = (db - db.mean()) / (db.std() + 1e-6)
    return z, hop


def _span_energy(energy: np.ndarray, hop: float, start: float, end: float) -> float:
    a, b = int(start / hop), max(int(end / hop), int(start / hop) + 1)
    seg = energy[a:b]
    return float(seg.mean()) if len(seg) else 0.0


# ---------------------------------------------------------------- phrases
def score_sentences(sentences: list[dict], wav: Path | None) -> list[dict]:
    """Ajoute à chaque phrase : score, tags, énergie."""
    energy, hop = audio_energy(wav) if wav and wav.exists() else (np.zeros(1), 1.0)
    for s in sentences:
        text = s["text"]
        tags = [name for name, pat in _PATTERNS.items() if pat.search(text)]
        dur = max(s["end"] - s["start"], 0.1)
        rate = len(s["words"]) / dur  # mots/seconde : débit = dynamisme
        score = (
            1.6 * ("hook" in tags) + 1.2 * ("emotion" in tags) + 1.0 * ("advice" in tags)
            + 1.0 * ("story" in tags) + 0.8 * ("money" in tags)
            + 0.7 * bool(_NUMBER.search(text)) + 0.9 * text.rstrip().endswith("?")
            + 0.6 * float(np.clip(_span_energy(energy, hop, s["start"], s["end"]), -1.5, 2.0))
            + 0.3 * float(np.clip(rate - 2.5, -1, 1.5))
        )
        s["score"] = round(score, 3)
        s["tags"] = tags
    return sentences


def is_keyword(word: str) -> bool:
    """Mot à mettre en évidence dans les sous-titres et à souligner par un zoom."""
    w = word.strip(".,!?;:«»\"'…").lower()
    if not w or w in STOPWORDS:
        return False
    return bool(_NUMBER.search(w)) or bool(KEYWORD_RE.search(w))


def starts_cleanly(text: str) -> bool:
    return not text.lower().lstrip().startswith(CONNECTORS)


def fallback_title(sentences: list[dict], used: set[str] | None = None) -> str:
    """Titre heuristique : la phrase la plus "accrocheuse" du clip, raccourcie.

    `used` contient les titres déjà attribués, pour éviter deux clips au même titre.
    """
    used = used or set()
    ranked = sorted(sentences, key=lambda s: s["score"] + 0.5 * ("hook" in s["tags"]), reverse=True)
    title = ""
    for best in ranked:
        words = best["text"].split()
        title = " ".join(words[:10]).strip(" ,;:") + ("…" if len(words) > 10 else "")
        if title not in used:
            break
    return title


# ---------------------------------------------------------------- Claude
def llm_rank(candidates: list[dict], model: str, language: str | None) -> dict[int, dict]:
    """Note sémantique par Claude. Retourne {id: {"score", "title", "hook", "reason"}}.

    Toute erreur (réseau, quota, refus) est journalisée et renvoie {} : le
    pipeline continue alors avec le score heuristique seul.
    """
    try:
        import anthropic
    except ImportError:
        log.warning("Paquet 'anthropic' absent : analyse IA ignorée.")
        return {}

    lang = language or "fr"
    payload = [
        {"id": c["id"], "start": round(c["start"], 1), "end": round(c["end"], 1),
         "text": c["text"][:2500]}
        for c in candidates
    ]
    prompt = (
        "Tu es un monteur expert en contenus courts viraux (TikTok, Reels, Shorts).\n"
        "Voici des extraits candidats tirés de la transcription d'une longue vidéo. Pour chacun, "
        "évalue de 0 à 100 son potentiel viral en tant que clip autonome : force de l'accroche "
        "dans les 3 premières secondes, émotion, valeur informative ou conseil concret, histoire "
        "complète (début/fin clairs), compréhensible sans contexte. Pénalise les extraits qui "
        "dépendent de ce qui précède ou se répètent entre eux.\n"
        f"Rédige aussi un titre accrocheur (max 60 caractères, langue : {lang}), une accroche "
        "courte à afficher à l'écran (max 6 mots) et une raison en une phrase.\n\n"
        f"Extraits (JSON) :\n{json.dumps(payload, ensure_ascii=False)}"
    )
    schema = {
        "type": "object",
        "properties": {"clips": {"type": "array", "items": {
            "type": "object",
            "properties": {"id": {"type": "integer"}, "score": {"type": "integer"},
                           "title": {"type": "string"}, "hook": {"type": "string"},
                           "reason": {"type": "string"}},
            "required": ["id", "score", "title", "hook", "reason"],
            "additionalProperties": False}}},
        "required": ["clips"],
        "additionalProperties": False,
    }
    try:
        client = anthropic.Anthropic()
        response = client.beta.messages.create(
            model=model,
            max_tokens=16000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            output_config={"effort": "medium", "format": {"type": "json_schema", "schema": schema}},
            messages=[{"role": "user", "content": prompt}],
        )
        if response.stop_reason == "refusal":
            log.warning("Analyse IA refusée par le modèle : score heuristique utilisé.")
            return {}
        text = next(b.text for b in response.content if b.type == "text")
        clips = json.loads(text)["clips"]
        log.info("Analyse IA : %d extraits notés par %s.", len(clips), response.model)
        return {int(c["id"]): c for c in clips}
    except Exception as exc:  # noqa: BLE001 - l'IA est un bonus, jamais bloquante
        log.warning("Analyse IA indisponible (%s) : score heuristique utilisé.", exc)
        return {}


def llm_enabled() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY"))
