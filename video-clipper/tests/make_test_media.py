"""Fabrique une vidéo de test (plusieurs plans, audio à volume variable) et une
transcription factice au format Whisper. Sert uniquement à tester le pipeline
sans réseau : ce n'est PAS une analyse de la vraie vidéo."""
from __future__ import annotations

import json
import random
import subprocess
import sys
from pathlib import Path

PHRASES = [
    "Bonjour à tous et merci de nous recevoir.",
    "Euh bon voilà, on va commencer tranquillement.",
    "La vérité, c'est que la jeunesse sénégalaise attend un vrai changement !",
    "Pourquoi personne ne parle du chômage des jeunes ?",
    "Nous avons recensé plus de 300 000 diplômés sans emploi en 2025.",
    "Il faut une rupture avec les anciennes pratiques politiques.",
    "Je vous dis clairement que la corruption est le premier problème.",
    "Notre parti propose une solution concrète pour l'avenir.",
    "Bon, euh, voilà, c'est un peu ça quoi.",
    "Le gouvernement doit rendre des comptes au peuple.",
    "Ce qui est grave, c'est le silence de l'opposition sur la justice.",
    "Les élections de demain seront décisives pour le pays.",
    "On parle de milliards de francs qui disparaissent chaque année !",
    "Comment expliquer cela aux familles qui souffrent ?",
    "Nous allons nous battre pour la souveraineté économique.",
    "Merci, on fait une petite pause et on revient.",
]


def main(out_dir: Path, duration: int = 420) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    video = out_dir / "test_source.mp4"
    q = duration // 4
    # 4 plans visuellement différents → changements de plan détectables
    src = [f"testsrc2=s=1280x720:r=25:d={q}", f"smptebars=s=1280x720:r=25:d={q}",
           f"mandelbrot=s=1280x720:r=25,trim=duration={q}", f"testsrc=s=1280x720:r=25:d={duration-3*q}"]
    inputs = []
    for s in src:
        inputs += ["-f", "lavfi", "-i", s]
    # audio : « voix » à volume variable (sinus modulé + bruit léger)
    inputs += ["-f", "lavfi", "-i",
               f"aevalsrc='0.3*sin(2*PI*220*t)*(0.4+0.6*abs(sin(t/7)))+0.02*(random(0)-0.5)':s=48000:d={duration}"]
    fc = "".join(f"[{i}:v]setsar=1,format=yuv420p[v{i}];" for i in range(4))
    fc += "[v0][v1][v2][v3]concat=n=4:v=1:a=0[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", fc, "-map", "[v]",
                    "-map", "4:a", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
                    "-c:a", "aac", "-shortest", str(video)], check=True)

    rnd = random.Random(42)
    segs, t = [], 0.5
    while t < duration - 6:
        text = rnd.choice(PHRASES)
        words, wt = [], t
        for w in text.split():
            d = 0.22 + 0.04 * len(w.strip(".,!?"))
            words.append({"word": w, "start": round(wt, 3), "end": round(wt + d, 3), "probability": 0.9})
            wt += d + 0.06
        lp = -0.3 if rnd.random() > 0.1 else -1.4    # ~10 % de passages « mal transcrits »
        segs.append({"start": words[0]["start"], "end": words[-1]["end"], "text": text,
                     "avg_logprob": lp, "no_speech_prob": 0.01, "words": words})
        t = wt + rnd.choice([0.3, 0.5, 0.9, 1.4])
    (out_dir / "test_transcript.json").write_text(json.dumps(
        {"language": "fr", "language_probability": 1.0, "duration": duration, "model": "factice",
         "segments": segs}, ensure_ascii=False, indent=1), "utf-8")
    print(video, out_dir / "test_transcript.json")


if __name__ == "__main__":
    main(Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "_media")
