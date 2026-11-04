#!/usr/bin/env python3
"""AI Viral Video Clipper — transforme une vidéo longue en clips verticaux prêts à publier.

Usage minimal :
    python main.py

Options utiles :
    python main.py --source video.mp4          # fichier local au lieu de YouTube
    python main.py --analyze-only              # propose les clips (output/clips.json) sans rendu
    python main.py --clips output/clips.json   # rend une sélection (éventuellement modifiée à la main)
    python main.py --ui                        # interface graphique (Gradio)
"""
from __future__ import annotations

import argparse
import logging
import sys
import time
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from src import clip_selector, transcriber, video_renderer  # noqa: E402
from src import ai_analyzer as ai  # noqa: E402
from src.config import Config  # noqa: E402
from src.downloader import fetch_source  # noqa: E402
from src.utils import PipelineError, fmt_ts, log, media_info, require_binary  # noqa: E402


def parse_args(argv=None):
    p = argparse.ArgumentParser(description="Découpe automatique d'une vidéo en clips viraux 9:16.")
    p.add_argument("--source", help="URL YouTube ou fichier vidéo local")
    p.add_argument("--clips", type=Path, help="clips.json à rendre (sélection manuelle)")
    p.add_argument("--transcript", type=Path, help="transcription JSON existante (saute Whisper)")
    p.add_argument("--analyze-only", action="store_true", help="analyse sans rendu")
    p.add_argument("--max-clips", type=int)
    p.add_argument("--whisper-model", help="tiny|base|small|medium|large-v3")
    p.add_argument("--language", help="langue de la vidéo (ex. fr) ; auto par défaut")
    p.add_argument("--profiles", help="ex. TikTok,Reels,Shorts,WhatsApp_Statut")
    p.add_argument("--output", type=Path, help="dossier de sortie (défaut : output/)")
    p.add_argument("--no-zoom", action="store_true")
    p.add_argument("--no-sfx", action="store_true")
    p.add_argument("--no-llm", action="store_true", help="n'utilise pas Claude pour la sélection")
    p.add_argument("--subtitle-style", choices=["podcast", "minimal"])
    p.add_argument("--ui", action="store_true", help="lance l'interface graphique")
    p.add_argument("-v", "--verbose", action="store_true")
    return p.parse_args(argv)


def build_config(args) -> Config:
    cfg = Config.load()
    cfg.update({
        "source": args.source, "max_clips": args.max_clips, "whisper_model": args.whisper_model,
        "whisper_language": args.language, "profiles": None, "output_dir": args.output,
        "subtitle_style": args.subtitle_style,
    })
    if args.profiles:
        cfg.update({"export_profiles": args.profiles})
    if args.no_zoom:
        cfg.enable_zoom = False
    if args.no_sfx:
        cfg.enable_sfx = False
    if args.no_llm:
        cfg.use_llm = False
    return cfg


def preflight() -> None:
    for binary in ("ffmpeg", "ffprobe"):
        require_binary(binary)
    video_renderer.check_ffmpeg_features()


def snap_to_sentences(clip: dict, sentences: list[dict]) -> None:
    """Aligne des timestamps saisis à la main sur les frontières de phrases les plus proches."""
    starts = [s["start"] for s in sentences]
    ends = [s["end"] for s in sentences]
    clip["start"] = min(starts, key=lambda t: abs(t - clip["start"]))
    clip["end"] = min((e for e in ends if e > clip["start"]), key=lambda t: abs(t - clip["end"]),
                      default=clip["end"])


def analyze(cfg: Config, transcript_file: Path | None = None, progress=None):
    """Étapes 1 à 4 : téléchargement, transcription, analyse, sélection."""
    def step(frac, msg):
        log.info(msg)
        if progress:
            progress(frac, desc=msg)

    cfg.work_dir.mkdir(parents=True, exist_ok=True)
    step(0.02, "1/6 Récupération de la vidéo…")
    source = fetch_source(cfg.source, cfg.work_dir)
    src = media_info(source)
    log.info("    %s — %dx%d, %.0f fps, %s", source.name, src["width"], src["height"], src["fps"],
             fmt_ts(src["duration"]))

    step(0.10, "2/6 Transcription Whisper (mot à mot)…")
    if transcript_file:
        import json
        transcript = json.loads(transcript_file.read_text(encoding="utf-8"))
    else:
        transcript = transcriber.transcribe(source, cfg.work_dir, cfg.whisper_model,
                                            cfg.whisper_language, cfg.whisper_device)
    sentences = transcriber.split_sentences(transcript)
    log.info("    %d phrases, langue : %s", len(sentences), transcript.get("language"))

    step(0.30, "3/6 Analyse des moments forts (contenu + énergie vocale)…")
    wav = transcriber.extract_audio(source, cfg.work_dir)
    ai.score_sentences(sentences, wav)
    if cfg.llm_available:
        log.info("    analyse sémantique avec %s activée", cfg.llm_model)
    else:
        log.info("    analyse heuristique (définissez ANTHROPIC_API_KEY pour l'analyse IA)")

    step(0.40, "4/6 Sélection des meilleurs extraits…")
    clips = clip_selector.select_clips(sentences, cfg, transcript.get("language"))
    return source, src, transcript, sentences, clips


def render(cfg: Config, source: Path, src: dict, sentences: list[dict], clips: list[dict],
           progress=None) -> dict:
    """Étapes 5 et 6 : rendu, exports, vérification, rapport."""
    out = cfg.output_dir
    subs_dir = out / "Sous_titres"
    subs_dir.mkdir(parents=True, exist_ok=True)
    counter = [0]
    results = []
    for k, clip in enumerate(clips, 1):
        msg = f"5/6 Montage {clip['name']} ({k}/{len(clips)}) : {clip['title']}"
        log.info(msg)
        if progress:
            progress(0.45 + 0.5 * (k - 1) / len(clips), desc=msg)
        master = video_renderer.render_master(source, src, clip, sentences, cfg, cfg.work_dir, subs_dir)
        platform_files = video_renderer.export_platforms(master, clip, cfg, out)
        wa_files = video_renderer.export_whatsapp(master, clip, sentences, cfg, out, counter)
        log.info("    vérification des fichiers…")
        master_check = video_renderer.verify(master, cfg, cfg.clip_max_seconds + 1, full_decode=True)
        checks = {}
        for f in platform_files:
            same = f.stat().st_size == master.stat().st_size
            checks[f] = {**master_check, "ok": master_check["ok"] and same}
        for f in wa_files:
            checks[f] = video_renderer.verify(f, cfg, cfg.whatsapp_max_seconds, full_decode=True)
        results.append({"clip": clip, "files": checks})

    log.info("6/6 Rapport de montage…")
    report = write_report(cfg, source, src, clips, results)
    clip_selector.save_clips(clips, out / "clips.json")
    return {"results": results, "report": report}


def write_report(cfg, source, src, clips, results) -> Path:
    out = cfg.output_dir / "rapport_montage.txt"
    lines = [
        "RAPPORT DE MONTAGE — AI Viral Video Clipper",
        "=" * 60,
        f"Date            : {datetime.now():%Y-%m-%d %H:%M}",
        f"Source          : {cfg.source}",
        f"Fichier         : {source.name} ({src['width']}x{src['height']}, {src['fps']:.2f} fps, "
        f"{fmt_ts(src['duration'])})",
        f"Sélection       : {'Claude ' + cfg.llm_model + ' + heuristique' if cfg.llm_available else 'heuristique locale'}",
        f"Options         : zoom={'oui' if cfg.enable_zoom else 'non'}, sfx={'oui' if cfg.enable_sfx else 'non'}, "
        f"sous-titres={cfg.subtitle_style}, WhatsApp<= {cfg.whatsapp_max_seconds:.0f}s",
        "",
    ]
    total_ok = 0
    total = 0
    for r in results:
        c = r["clip"]
        rd = c.get("render", {})
        lines += [
            f"{c['name'].upper()} — score {c['score']}/100 ({c['source']})",
            f"  Titre      : {c['title']}",
            f"  Accroche   : {c['hook']}",
            f"  Timestamps : {fmt_ts(c['start'])} → {fmt_ts(c['end'])} ({c['end'] - c['start']:.1f} s)",
            f"  Pourquoi   : {c['reason']}",
            f"  Recadrage  : {rd.get('crop_mode')} — {rd.get('positions')} position(s), "
            f"{rd.get('faces')} visage(s) détecté(s) ; punch-ins à {rd.get('punch_ins')}",
            "  Fichiers   :",
        ]
        for f, chk in r["files"].items():
            total += 1
            total_ok += chk["ok"]
            status = "OK" if chk["ok"] else "ERREUR " + ", ".join(chk["problems"])
            lines.append(f"    - {f.relative_to(cfg.output_dir)}  {chk['duration']:.1f}s  "
                         f"{chk['size_mb']:.1f} Mo  [{status}]")
        lines.append(f"  Extrait    : {c['text'][:300]}{'…' if len(c['text']) > 300 else ''}")
        lines.append("")
    lines.append(f"Vérification : {total_ok}/{total} fichiers lisibles et conformes "
                 f"(H.264/AAC, {cfg.width}x{cfg.height}, durée, décodage complet).")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return out


def main(argv=None) -> int:
    args = parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,
                        format="%(message)s")
    if args.ui:
        from ui import launch
        launch()
        return 0
    cfg = build_config(args)
    t0 = time.time()
    try:
        preflight()
        source, src, transcript, sentences, clips = analyze(cfg, args.transcript)
        if args.clips:
            clips = clip_selector.load_clips(args.clips)
            for c in clips:
                snap_to_sentences(c, sentences)
            log.info("Sélection manuelle chargée : %d clip(s).", len(clips))
        cfg.output_dir.mkdir(parents=True, exist_ok=True)
        clip_selector.save_clips(clips, cfg.output_dir / "clips.json")
        for c in clips:
            log.info("  %s  %s → %s  score %5.1f  « %s »", c["name"], fmt_ts(c["start"]),
                     fmt_ts(c["end"]), c["score"], c["title"])
        if args.analyze_only:
            log.info("Analyse terminée. Modifiez %s puis lancez : python main.py --clips %s",
                     cfg.output_dir / "clips.json", cfg.output_dir / "clips.json")
            return 0
        res = render(cfg, source, src, sentences, clips)
    except PipelineError as exc:
        log.error("\nERREUR : %s", exc)
        return 1
    except KeyboardInterrupt:
        log.error("Interrompu.")
        return 130
    bad = sum(not chk["ok"] for r in res["results"] for chk in r["files"].values())
    log.info("\nTerminé en %.0f s. Rapport : %s", time.time() - t0, res["report"])
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
