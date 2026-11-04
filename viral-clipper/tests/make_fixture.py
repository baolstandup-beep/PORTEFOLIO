"""Génère une vidéo de test 16:9 + une transcription mot à mot correspondante.

Utile pour tester tout le pipeline sans réseau (ni YouTube, ni modèle Whisper) :

    python tests/make_fixture.py
    python main.py --source tests/fixture/sample.mp4 --transcript tests/fixture/sample.transcript.json

La vidéo contient un vrai visage (image "astronaut" de scikit-image) qui change
de position à chaque plan, afin de vérifier le recadrage intelligent.
"""
from __future__ import annotations

import json
import random
import subprocess
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent / "fixture"
DURATION = 420  # 7 minutes
SCENES = [(0, 0.20, "0x1d3557"), (95, 0.75, "0x2a9d8f"), (200, 0.30, "0x6d597a"),
          (300, 0.70, "0x264653")]  # (début, position x du visage 0..1, couleur)

SENTENCES = [
    "Voici le secret que personne ne vous dit sur l'argent.",
    "Je me souviens du jour où j'ai tout perdu, 3 millions en une semaine.",
    "Pourquoi la plupart des gens échouent dès la première année ?",
    "La réponse est simple : ils ne connaissent pas la règle numéro 1.",
    "Il faut d'abord comprendre votre propre peur de l'échec.",
    "Et ensuite on a parlé d'autre chose pendant un moment.",
    "Donc voilà, c'était un peu long comme introduction.",
    "Mon conseil le plus important : épargnez 20 pour cent de chaque revenu.",
    "Ma famille m'a appris que le travail paie toujours sur le long terme.",
    "Attention, c'est l'erreur la plus fréquente chez les jeunes entrepreneurs.",
    "Un jour, un client m'a dit une phrase qui a changé ma vie.",
    "Il m'a dit : ne vends jamais ton temps, vends ta valeur.",
    "Alors on continue avec la suite du programme.",
    "Comment trouver sa première idée de business sans argent ?",
    "Étape une : observez les problèmes autour de vous chaque jour.",
    "Étape deux : parlez à dix personnes qui vivent ce problème.",
    "Étape trois : vendez avant même de construire le produit.",
    "C'est incroyable le nombre de gens qui font l'inverse.",
    "Bon, je bois un peu d'eau et on reprend.",
    "La vérité, c'est que la discipline bat la motivation à chaque fois.",
]


def build_transcript() -> dict:
    rng = random.Random(7)
    t, segments, k = 1.0, [], 0
    while t < DURATION - 6:
        text = SENTENCES[k % len(SENTENCES)]
        k += 1
        words, start = [], t
        for w in text.split():
            d = 0.18 + 0.045 * len(w) + rng.uniform(-0.04, 0.06)
            words.append({"start": round(t, 3), "end": round(t + d, 3), "word": w})
            t += d + rng.uniform(0.03, 0.09)
        segments.append({"start": start, "end": words[-1]["end"], "text": text, "words": words})
        t += rng.uniform(0.35, 1.1)
    return {"language": "fr", "segments": segments}


def _write_voice(path: Path, transcript: dict, sr: int = 48000) -> None:
    import wave
    import numpy as np
    rng = np.random.default_rng(3)
    t = np.arange(DURATION * sr) / sr
    env = np.full(t.shape, 0.02)
    for seg in transcript["segments"]:
        for w in seg["words"]:
            env[int(w["start"] * sr): int(w["end"] * sr)] = 1.0
    noise = np.convolve(rng.standard_normal(t.size), np.ones(8) / 8, mode="same")
    signal = 0.5 * noise * env * (0.6 + 0.4 * np.sin(2 * np.pi * 4.5 * t))
    pcm = (np.clip(signal, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(pcm.tobytes())


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    from skimage import data
    import imageio.v3 as iio
    face = OUT / "face.png"
    iio.imwrite(face, data.astronaut())

    transcript = build_transcript()
    (OUT / "sample.transcript.json").write_text(json.dumps(transcript, ensure_ascii=False), encoding="utf-8")

    # Arrière-plans par plan + visage positionné différemment dans chaque plan
    bg = []
    for i, (start, _, color) in enumerate(SCENES):
        end = SCENES[i + 1][0] if i + 1 < len(SCENES) else DURATION
        bg.append(f"color=c={color}:s=1920x1080:r=30:d={end - start}[b{i}]")
    graph = ";".join(bg) + ";" + "".join(f"[b{i}]" for i in range(len(SCENES)))
    graph += f"concat=n={len(SCENES)}:v=1:a=0[bg];[1:v]scale=640:640[f];"
    xs = [int(pos * 1920 - 320) for _, pos, _ in SCENES]
    x_expr = str(xs[-1])
    for i in range(len(SCENES) - 2, -1, -1):
        x_expr = f"if(lt(t,{SCENES[i + 1][0]}),{xs[i]},{x_expr})"
    graph += f"[bg][f]overlay=x='{x_expr}':y=180[v]"

    # Audio "voix" : bruit modulé à 4,5 Hz, présent uniquement pendant les mots
    wav = OUT / "voice.wav"
    _write_voice(wav, transcript)
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "nullsrc=s=16x16:d=1",
           "-loop", "1", "-i", str(face), "-i", str(wav),
           "-filter_complex", graph, "-map", "[v]", "-map", "2:a", "-t", str(DURATION),
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-shortest", str(OUT / "sample.mp4")]
    subprocess.run(cmd, check=True)
    print(f"OK : {OUT / 'sample.mp4'} et {OUT / 'sample.transcript.json'}")


if __name__ == "__main__":
    sys.exit(main())
