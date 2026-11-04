"""Orchestration complète : télécharger → transcrire → analyser → découper → rendre → vérifier."""
from __future__ import annotations

import json
import shutil
import time
from pathlib import Path

from . import analyzer, environment, reframe, renderer, subtitles, transcriber
from .config import Config
from .ffmpeg_utils import extract_audio, probe
from .report import write_report
from .verify import verify


def _step(n: int, title: str) -> None:
    print(f"\n[{n}/7] {title}")


def run(cfg: Config) -> int:
    t0 = time.time()
    cfg.work_dir.mkdir(parents=True, exist_ok=True)

    _step(1, "Vérification de l'environnement")
    warnings = environment.check(need_download=cfg.source is None,
                                 need_whisper=cfg.transcript is None)
    if hint := environment.fonts_hint():
        warnings.append(hint)

    _step(2, "Récupération de la vidéo source")
    if cfg.source:
        src, meta = Path(cfg.source), {"title": Path(cfg.source).name, "url": str(cfg.source)}
        if not src.exists():
            raise SystemExit(f"Fichier introuvable : {src}")
    else:
        from .downloader import download
        src, meta = download(cfg)
    info = probe(src)
    print(f"  ↳ {src.name} : {info.width}x{info.height}, {info.fps:.2f} i/s, {info.duration/60:.1f} min")
    if info.height < 1080:
        warnings.append(f"Source en {info.height}p : les clips 1080x1920 seront agrandis "
                        "(qualité limitée par la source).")
    if not info.has_audio:
        raise SystemExit("La vidéo source n'a pas de piste audio.")

    _step(3, "Transcription de la parole (Whisper)")
    wav = extract_audio(src, cfg.work_dir / "audio_16k.wav")
    transcript = transcriber.transcribe(wav, cfg)
    transcript.setdefault("duration", info.duration)

    _step(4, "Détection des moments forts")
    sentences = analyzer.build_sentences(transcript)
    energy, hop = analyzer.audio_energy(wav)
    analyzer.score_sentences(sentences, energy, hop)
    print(f"  ↳ {len(sentences)} phrases analysées")

    out = cfg.output_dir
    if cfg.plan:
        data = json.loads(Path(cfg.plan).read_text("utf-8"))
        clips = [analyzer.plan_from_dict(d) for d in data["clips"]]
        candidates = []
        for c in clips:  # resynchronise les indices de phrases si les temps ont été édités
            idx = [k for k, s in enumerate(sentences)
                   if s.start >= c.start - 0.3 and s.end <= c.end + 0.5]
            if idx:
                c.first_sentence, c.last_sentence = idx[0], idx[-1]
        print(f"  ↳ plan chargé depuis {cfg.plan} ({len(clips)} clips)")
    else:
        clips, candidates = analyzer.propose_clips(sentences, cfg)
    if not clips:
        raise SystemExit("Aucun passage exploitable trouvé (transcription vide ou réglages trop stricts).")
    for c in clips:
        if c.duration > cfg.max_clip + 0.01:
            raise SystemExit(f"Le clip {c.index} dépasse {cfg.max_clip} s ({c.duration:.1f} s).")
        c.status_parts = analyzer.split_for_status(c, sentences, cfg)
        print(f"  ↳ clip {c.index:02d} : {analyzer.fmt_ts(c.start)} → {analyzer.fmt_ts(c.end)} "
              f"({c.duration:5.1f} s, score {c.score:+.2f}, {len(c.status_parts)} statut(s))")
        print(f"       « {c.hook[:90]} »")

    # Dossiers de sortie (on repart de zéro pour ne pas mélanger deux exécutions)
    for sub in ("TikTok", "WhatsApp_Statut", "Sous_titres"):
        d = out / sub
        if d.exists():
            shutil.rmtree(d)
        d.mkdir(parents=True)
    (out / "plan.json").write_text(json.dumps(
        {"source": str(src), "clips": [analyzer.plan_to_dict(c) for c in clips]},
        ensure_ascii=False, indent=2), "utf-8")

    if cfg.dry_run:
        write_report(out / "rapport_montage.txt", cfg, meta, transcript, clips, candidates, {}, [],
                     warnings + ["Mode --dry-run : aucune vidéo rendue."])
        print(f"\nPropositions écrites dans {out/'plan.json'} et {out/'rapport_montage.txt'}")
        return 0

    _step(5, "Recadrage 9:16 et rendu TikTok")
    tmp = cfg.work_dir / "render"
    tmp.mkdir(exist_ok=True)
    framings: dict[int, reframe.Framing] = {}
    checks: list[dict] = []
    for c in clips:
        name = f"clip_{c.index:02d}"
        fr = reframe.analyze(src, c.start, c.end, info, cfg.layout)
        framings[c.index] = fr
        margin = reframe.subtitle_margin(fr, info, cfg.width, cfg.height)
        words = subtitles.collect_words(transcript, c.start, c.end, cfg.min_sub_logprob)
        cues = subtitles.build_cues(words)
        subtitles.write_srt(cues, out / "Sous_titres" / f"{name}.srt")
        ass = subtitles.write_ass(cues, tmp / f"{name}.ass", cfg, margin)
        print(f"  ↳ {name} : cadrage {fr.mode} ({fr.detail}), {len(cues)} sous-titres … ", end="", flush=True)
        t = time.time()
        dst = out / "TikTok" / f"{name}.mp4"
        renderer.render(src, info, c.start, c.end, fr, ass, dst, cfg, crf=cfg.crf_tiktok,
                        maxrate=None, fade_in=0.2, fade_out=0.35)
        print(f"{time.time()-t:.0f} s")
        if not cfg.skip_verify:
            checks.append(verify(dst, c.duration, cfg.width, cfg.height))

    _step(6, "Découpage et rendu des statuts WhatsApp")
    k = 0
    for c in clips:
        fr = framings[c.index]
        n = len(c.status_parts)
        for p, (a, b) in enumerate(c.status_parts, 1):
            k += 1
            name = f"statut_{k:02d}"
            c.status_files.append(f"{name}.mp4")
            pf = fr.shifted(a - c.start)
            margin = reframe.subtitle_margin(pf, info, cfg.width, cfg.height)
            cues = subtitles.build_cues(subtitles.collect_words(transcript, a, b, cfg.min_sub_logprob))
            ass = subtitles.write_ass(cues, tmp / f"{name}.ass", cfg, margin,
                                      badge=f"{p}/{n}" if n > 1 else None)
            print(f"  ↳ {name} (clip {c.index:02d}, partie {p}/{n}, {b-a:.1f} s) … ", end="", flush=True)
            t = time.time()
            dst = out / "WhatsApp_Statut" / f"{name}.mp4"
            renderer.render(src, info, a, b, pf, ass, dst, cfg, crf=cfg.crf_status,
                            maxrate=cfg.status_maxrate, fade_in=0.15 if p == 1 else 0,
                            fade_out=0.3 if p == n else 0)
            print(f"{time.time()-t:.0f} s")
            if not cfg.skip_verify:
                checks.append(verify(dst, b - a, cfg.width, cfg.height))

    _step(7, "Vérification et rapport")
    bad = [r for r in checks if not r["ok"]]
    for r in bad:
        print(f"  ✗ {r['file']} : {'; '.join(r['problems'])}")
    print(f"  ↳ {len(checks) - len(bad)}/{len(checks)} fichiers conformes")
    (out / "plan.json").write_text(json.dumps(
        {"source": str(src), "clips": [analyzer.plan_to_dict(c) for c in clips]},
        ensure_ascii=False, indent=2), "utf-8")
    rep = write_report(out / "rapport_montage.txt", cfg, meta, transcript, clips, candidates,
                       framings, checks, warnings)
    print(f"\nTerminé en {(time.time()-t0)/60:.1f} min → {out.resolve()}")
    print(f"Rapport : {rep}")
    for w in warnings:
        print(f"  ! {w}")
    return 1 if bad else 0
