"""Transcription mot à mot avec Whisper (faster-whisper, repli sur openai-whisper).

Format de sortie (mis en cache dans work/transcript.json) ::

    {"language": "fr", "segments": [
        {"start": 0.0, "end": 4.2, "text": "...",
         "words": [{"start": 0.0, "end": 0.3, "word": "Bonjour"}, ...]}]}
"""
from __future__ import annotations

import json
from pathlib import Path

from .utils import PipelineError, log, run


def extract_audio(video: Path, work_dir: Path) -> Path:
    wav = work_dir / f"{video.stem}.16k.wav"
    if not wav.exists():
        run(["ffmpeg", "-y", "-v", "error", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav],
            desc="extraction audio")
    return wav


def transcribe(video: Path, work_dir: Path, model_size: str = "small",
               language: str | None = None, device: str = "auto") -> dict:
    cache = work_dir / f"{video.stem}.transcript.json"
    if cache.exists():
        log.info("Transcription en cache : %s", cache.name)
        return json.loads(cache.read_text(encoding="utf-8"))

    wav = extract_audio(video, work_dir)
    try:
        result = _faster_whisper(wav, model_size, language, device)
    except ImportError:
        result = _openai_whisper(wav, model_size, language)

    if not result["segments"]:
        raise PipelineError("Whisper n'a détecté aucune parole dans la vidéo.")
    cache.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    return result


def _faster_whisper(wav: Path, model_size: str, language: str | None, device: str) -> dict:
    from faster_whisper import WhisperModel

    compute = "int8" if device in ("auto", "cpu") else "float16"
    log.info("Chargement du modèle Whisper '%s' (premier lancement = téléchargement)…", model_size)
    try:
        model = WhisperModel(model_size, device=device, compute_type=compute)
    except Exception as exc:
        raise PipelineError(
            f"Impossible de charger le modèle Whisper '{model_size}' ({exc}). "
            "Le premier lancement nécessite un accès à huggingface.co."
        ) from exc
    segments, info = model.transcribe(
        str(wav), language=language, word_timestamps=True, vad_filter=True, beam_size=5,
    )
    out = []
    for seg in segments:
        words = [{"start": w.start, "end": w.end, "word": w.word.strip()} for w in (seg.words or [])
                 if w.word.strip()]
        out.append({"start": seg.start, "end": seg.end, "text": seg.text.strip(), "words": words})
        log.info("  [%6.1fs] %s", seg.start, seg.text.strip()[:70])
    return {"language": info.language, "segments": out}


def _openai_whisper(wav: Path, model_size: str, language: str | None) -> dict:
    try:
        import whisper
    except ImportError as exc:
        raise PipelineError("Installez faster-whisper ou openai-whisper (requirements.txt).") from exc
    model = whisper.load_model(model_size)
    res = model.transcribe(str(wav), language=language, word_timestamps=True)
    out = []
    for seg in res["segments"]:
        words = [{"start": w["start"], "end": w["end"], "word": w["word"].strip()}
                 for w in seg.get("words", []) if w["word"].strip()]
        out.append({"start": seg["start"], "end": seg["end"], "text": seg["text"].strip(), "words": words})
    return {"language": res.get("language"), "segments": out}


def split_sentences(transcript: dict) -> list[dict]:
    """Regroupe les mots en phrases (ponctuation finale ou pause > 0,8 s).

    Les phrases sont les unités de découpe : un clip commence et finit toujours
    sur une frontière de phrase, jamais au milieu.
    """
    words = [w for seg in transcript["segments"] for w in seg["words"]]
    sentences, current = [], []
    for i, w in enumerate(words):
        current.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        gap = (nxt["start"] - w["end"]) if nxt else 99
        ends = w["word"].rstrip('"»”)').endswith((".", "!", "?", "…"))
        if ends or gap > 0.8 or len(current) >= 60:
            sentences.append({
                "start": current[0]["start"], "end": current[-1]["end"],
                "text": " ".join(x["word"] for x in current), "words": current,
            })
            current = []
    return sentences
