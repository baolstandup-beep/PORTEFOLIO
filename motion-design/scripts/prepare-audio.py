"""Génère la voix off française (Piper TTS, local) et mesure chaque réplique.

1. Synthétise chaque réplique de src/config/voiceover.json avec Piper.
2. Normalise (filtre passe-haut, compression douce, loudnorm -16 LUFS), 48 kHz mono.
3. Écrit public/assets/audio/voice/<id>.wav et src/config/voiceover.generated.json
   (durée de chaque réplique en images à 30 i/s).
4. Si src/config/voiceover.timing.json existe (écrit par `npm run validate`),
   assemble la piste complète output/tiktok/voix_off.wav calée sur la timeline.

Les prises sont mises en cache : une réplique n'est régénérée que si son texte
(ou la vitesse) change, ou avec --force. Piper n'est pas déterministe, le cache
garantit que la timeline reste calée sur les fichiers existants.

Modèle : tools/piper/fr-siwis-medium.onnx. Téléchargé si absent depuis
https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-fr-siwis-medium.tar.gz
Prérequis : pip install piper-tts ; ffmpeg dans le PATH.
"""
import hashlib
import json
import subprocess
import sys
import tarfile
import urllib.request
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = ROOT / "src" / "config"
VOICE_DIR = ROOT / "public" / "assets" / "audio" / "voice"
MODEL_DIR = ROOT / "tools" / "piper"
MODEL = MODEL_DIR / "fr-siwis-medium.onnx"
MODEL_URL = "https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-fr-siwis-medium.tar.gz"
FPS = 30


def ensure_model():
    if MODEL.exists():
        return
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    archive = MODEL_DIR / "voice.tar.gz"
    print("téléchargement du modèle Piper…")
    urllib.request.urlretrieve(MODEL_URL, archive)
    with tarfile.open(archive) as tar:
        tar.extractall(MODEL_DIR, filter="data")
    archive.unlink()


def run(cmd, **kw):
    subprocess.run(cmd, check=True, **kw)


def wav_seconds(path):
    with wave.open(str(path)) as w:
        return w.getnframes() / w.getframerate()


def synth(cue, length_scale):
    raw = VOICE_DIR / f"{cue['id']}.raw.wav"
    out = VOICE_DIR / f"{cue['id']}.wav"
    run([sys.executable, "-m", "piper", "-m", str(MODEL), "-f", str(raw),
         "--length-scale", str(length_scale), "--sentence-silence", "0.25"],
        input=cue["spoken"].encode("utf-8"), stderr=subprocess.DEVNULL)
    # Nettoyage : coupe le silence de tête/queue, passe-haut, compression douce, loudnorm.
    af = ("silenceremove=start_periods=1:start_threshold=-45dB,"
          "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
          "highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=120,"
          "loudnorm=I=-16:TP=-1.5:LRA=7,apad=pad_dur=0.08")
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", af,
         "-ar", "48000", "-ac", "1", str(out)])
    raw.unlink()
    return out


def assemble_full_track(cues, timing, total_frames):
    """Piste voix off unique calée sur la timeline (silence entre les répliques)."""
    out = ROOT / "output" / "tiktok" / "voix_off.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    inputs, filters = [], []
    for i, cue in enumerate(cues):
        inputs += ["-i", str(VOICE_DIR / f"{cue['id']}.wav")]
        delay_ms = round(timing[cue["id"]] / FPS * 1000)
        filters.append(f"[{i}]adelay={delay_ms}[a{i}]")
    mix = "".join(f"[a{i}]" for i in range(len(cues)))
    filters.append(f"{mix}amix=inputs={len(cues)}:normalize=0,apad,atrim=0:{total_frames / FPS}[out]")
    run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters),
         "-map", "[out]", "-ar", "48000", "-ac", "1", str(out)])
    (ROOT / "output" / "audio").mkdir(parents=True, exist_ok=True)
    run(["cp", str(out), str(ROOT / "output" / "audio" / "voix-off.wav")])
    print(f"piste complète : {out.relative_to(ROOT)}")


def main():
    force = "--force" in sys.argv
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    spec = json.loads((CFG / "voiceover.json").read_text())
    gen_file = CFG / "voiceover.generated.json"
    previous = json.loads(gen_file.read_text()) if gen_file.exists() else {}
    durations = {}
    for cue in spec["cues"]:
        key = hashlib.sha1(f"{cue['spoken']}|{spec.get('lengthScale', 1.0)}".encode()).hexdigest()[:12]
        path = VOICE_DIR / f"{cue['id']}.wav"
        cached = not force and path.exists() and previous.get(cue["id"], {}).get("hash") == key
        if not cached:
            ensure_model()
            synth(cue, spec.get("lengthScale", 1.0))
        sec = wav_seconds(path)
        durations[cue["id"]] = {"seconds": round(sec, 3), "frames": int(-(-sec * FPS // 1)), "hash": key}
        print(f"{cue['id']}: {sec:.2f}s {'(cache)' if cached else '(généré)'} « {cue['text']} »")
    gen_file.write_text(json.dumps(durations, indent=2))

    # Script lisible (livrable).
    script = ["VOIX OFF — Conférence de presse PAS-PAS (script final)", ""]
    for cue in spec["cues"]:
        flag = "  [À VALIDER]" if cue.get("needsValidation") else ""
        script.append(f"[{cue['shot']}] {cue['text']}{flag}")
        if cue.get("note"):
            script.append(f"      note : {cue['note']}")
    script += ["", f"Voix : {spec['voice']}"]
    text = "\n".join(script) + "\n"
    for p in (ROOT / "output" / "tiktok" / "voix_off.txt", ROOT / "output" / "audio" / "voix-off.txt"):
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)

    timing_file = CFG / "voiceover.timing.json"
    if timing_file.exists():
        timing = json.loads(timing_file.read_text())
        assemble_full_track(spec["cues"], timing["starts"], timing["totalFrames"])
    else:
        print("voiceover.timing.json absent : lancer `npm run validate` puis relancer ce script "
              "pour assembler output/tiktok/voix_off.wav")


if __name__ == "__main__":
    main()
