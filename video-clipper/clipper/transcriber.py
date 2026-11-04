"""Étape 2 — transcription avec Whisper (faster-whisper, horodatage au mot).

Format JSON produit (et accepté via --transcript) :
{
  "language": "fr", "language_probability": 0.98, "duration": 4289.1,
  "segments": [
    {"start": 0.0, "end": 4.2, "text": "...", "avg_logprob": -0.21, "no_speech_prob": 0.01,
     "words": [{"word": "Bonjour", "start": 0.0, "end": 0.4, "probability": 0.97}, ...]}
  ]
}
"""
from __future__ import annotations

import json
import time
from pathlib import Path

from .config import Config


def load_transcript(path: Path) -> dict:
    data = json.loads(Path(path).read_text("utf-8"))
    if "segments" not in data:
        raise ValueError(f"{path} n'est pas une transcription valide (clé 'segments' absente).")
    return data


def transcribe(audio: Path, cfg: Config) -> dict:
    cache = cfg.work_dir / f"transcript_{cfg.whisper_model}_{cfg.language or 'auto'}.json"
    if cfg.transcript:
        print(f"  ↳ transcription fournie : {cfg.transcript}")
        return load_transcript(cfg.transcript)
    if cache.exists():
        print(f"  ↳ transcription en cache : {cache}")
        return load_transcript(cache)

    from faster_whisper import WhisperModel

    print(f"  ↳ chargement du modèle Whisper « {cfg.whisper_model} » …")
    model = WhisperModel(cfg.whisper_model, device="auto", compute_type="default")
    t0 = time.time()
    segments, info = model.transcribe(
        str(audio),
        language=cfg.language,
        word_timestamps=True,
        vad_filter=True,                    # ignore silences / musique
        beam_size=5,
        condition_on_previous_text=False,   # limite les hallucinations en boucle
    )
    out_segments = []
    for seg in segments:
        words = [
            {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3),
             "probability": round(w.probability, 3)}
            for w in (seg.words or []) if w.word.strip()
        ]
        out_segments.append({
            "start": round(seg.start, 3), "end": round(seg.end, 3), "text": seg.text.strip(),
            "avg_logprob": round(seg.avg_logprob, 3), "no_speech_prob": round(seg.no_speech_prob, 3),
            "words": words,
        })
        pct = 100 * seg.end / max(info.duration, 1)
        print(f"\r  ↳ transcription {pct:5.1f} %  ({seg.end/60:5.1f} / {info.duration/60:.1f} min)",
              end="", flush=True)
    print(f"\n  ↳ terminé en {(time.time()-t0)/60:.1f} min — langue : {info.language} "
          f"({info.language_probability:.0%})")
    data = {
        "language": info.language,
        "language_probability": info.language_probability,
        "duration": info.duration,
        "model": cfg.whisper_model,
        "segments": out_segments,
    }
    cache.write_text(json.dumps(data, ensure_ascii=False, indent=1), "utf-8")
    return data
