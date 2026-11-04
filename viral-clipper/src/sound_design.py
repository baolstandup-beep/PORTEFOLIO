"""Traitement audio : voix plus claire, volume normalisé, effets sonores discrets.

Les effets (whoosh, impact) sont synthétisés avec FFmpeg au premier lancement
dans assets/sound_effects/ ; remplacez-les par vos propres fichiers WAV/MP3 du
même nom si vous le souhaitez. Une musique de fond est ajoutée seulement si un
fichier audio est présent dans assets/music/ (atténuée automatiquement sous la voix).
"""
from __future__ import annotations

from pathlib import Path

import json
import re

from .utils import log, run

SFX_DIR = Path(__file__).resolve().parent.parent / "assets" / "sound_effects"
MUSIC_DIR = SFX_DIR.parent / "music"

_SYNTH = {
    "whoosh.wav": "anoisesrc=d=0.7:c=pink:a=0.5,highpass=f=300,lowpass=f=5000,"
                  "afade=t=in:d=0.35:curve=exp,afade=t=out:st=0.35:d=0.35:curve=exp",
    "impact.wav": "sine=f=58:d=0.45,volume=1.6,afade=t=out:st=0.01:d=0.44:curve=exp",
}


def ensure_sfx() -> dict[str, Path]:
    SFX_DIR.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, graph in _SYNTH.items():
        path = SFX_DIR / name
        if not path.exists():
            run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", graph, "-ar", "48000",
                 "-ac", "2", path], desc=f"synthèse {name}")
        paths[name.split(".")[0]] = path
    return paths


def find_music() -> Path | None:
    if not MUSIC_DIR.exists():
        return None
    for ext in ("*.mp3", "*.wav", "*.m4a", "*.ogg"):
        files = sorted(MUSIC_DIR.glob(ext))
        if files:
            return files[0]
    return None


def voice_chain(target_lufs: float) -> str:
    """Nettoyage de la voix : coupe-bas, débruitage léger, compression, loudness EBU R128."""
    return (
        "highpass=f=80,afftdn=nf=-25,"
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,"
        f"loudnorm=I={target_lufs}:TP=-1.5:LRA=11,aresample=48000"
    )


def build_audio_graph(first_sfx_input: int, punch_times: list[float], cfg,
                      music_input: int | None) -> tuple[str, list[Path]]:
    """Construit la partie audio du filtergraph. Retourne (graphe, entrées supplémentaires).

    `first_sfx_input` est l'index FFmpeg de la première entrée ajoutée ici.
    La sortie du graphe est le label [aout].
    """
    parts = [f"[0:a]{voice_chain(cfg.target_lufs)},asplit=2[voice][vsc]"]
    inputs: list[Path] = []
    mix = ["[voice]"]
    idx = first_sfx_input

    if cfg.enable_sfx:
        sfx = ensure_sfx()
        inputs.append(sfx["whoosh"])
        parts.append(f"[{idx}:a]volume=0.30,aresample=48000[wh]")
        mix.append("[wh]")
        idx += 1
        if punch_times:
            inputs.append(sfx["impact"])
            n = len(punch_times)
            parts.append(f"[{idx}:a]volume=0.22,aresample=48000,asplit={n}" +
                         "".join(f"[im{k}s]" for k in range(n)))
            for k, t in enumerate(punch_times):
                ms = int(t * 1000)
                parts.append(f"[im{k}s]adelay={ms}|{ms}[im{k}]")
                mix.append(f"[im{k}]")
            idx += 1

    if music_input is not None:
        parts.append(f"[{music_input}:a]volume={cfg.music_volume},aresample=48000[mus]")
        parts.append("[mus][vsc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck]")
        mix.append("[duck]")
    else:
        parts.append("[vsc]anullsink")

    if len(mix) == 1:
        parts.append("[voice]alimiter=limit=0.95[aout]")
    else:
        parts.append("".join(mix) + f"amix=inputs={len(mix)}:duration=first:normalize=0,"
                     "alimiter=limit=0.95[aout]")
    return ";\n".join(parts), inputs


def finalize_loudness(video: Path, target_lufs: float, bitrate: str) -> float:
    """Seconde passe loudnorm (mesure puis correction linéaire) sur le fichier final.

    La vidéo est copiée telle quelle (-c:v copy) ; seul l'audio est réencodé.
    Retourne la loudness intégrée mesurée avant correction.
    """
    proc = run(["ffmpeg", "-hide_banner", "-i", video, "-vn", "-af",
                f"loudnorm=I={target_lufs}:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
               desc="mesure loudness", capture=True)
    m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", proc.stderr).group(0))
    measured = float(m["input_i"])
    if abs(measured - target_lufs) <= 0.5:
        return measured
    if measured < target_lufs - 20:
        # Quasi-silence : amplifier reviendrait à monter le bruit de fond de +20 dB ou plus.
        log.warning("    audio très faible (%.1f LUFS) : correction de volume ignorée", measured)
        return measured
    tmp = video.with_suffix(".loud.mp4")
    af = (f"loudnorm=I={target_lufs}:TP=-1.5:LRA=11:measured_I={m['input_i']}:"
          f"measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
          f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
          "aresample=48000")
    run(["ffmpeg", "-y", "-v", "error", "-i", video, "-c:v", "copy", "-af", af, "-c:a", "aac",
         "-b:a", bitrate, "-movflags", "+faststart", tmp], desc="correction loudness")
    tmp.replace(video)
    return measured
