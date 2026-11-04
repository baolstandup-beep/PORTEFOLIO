"""Rendu FFmpeg : un master 1080x1920 par clip, puis déclinaisons par plateforme.

TikTok, Reels et Shorts ont les mêmes spécifications (9:16, 1080x1920, H.264,
AAC, <= 180 s) : le master est rendu une seule fois puis copié, ce qui évite
trois réencodages et toute perte de qualité. WhatsApp reçoit des segments
<= 60 s coupés sur des fins de phrase.
"""
from __future__ import annotations

import shutil
from pathlib import Path

from . import dynamic_zoom, smart_crop, sound_design, subtitle_generator
from .ai_analyzer import is_keyword
from .utils import PipelineError, log, media_info, run

FONTS_DIR = Path(__file__).resolve().parent.parent / "assets" / "fonts"
PLATFORM_PREFIX = {"TikTok": "clip", "Reels": "reel", "Shorts": "short"}


def _video_codec_args(cfg, crf: int | None = None) -> list[str]:
    return [
        "-c:v", "libx264", "-preset", cfg.preset, "-crf", str(crf or cfg.crf),
        "-profile:v", "high", "-level:v", "4.2", "-pix_fmt", "yuv420p",
        "-r", str(cfg.fps), "-g", str(cfg.fps * 2),
        "-c:a", "aac", "-b:a", cfg.audio_bitrate, "-ar", "48000", "-ac", "2",
        "-movflags", "+faststart",
    ]


def render_master(source: Path, src: dict, clip: dict, sentences: list[dict], cfg,
                  work_dir: Path, subs_dir: Path) -> Path:
    start, end = clip["start"], clip["end"]
    # Petite marge pour ne pas couper le souffle du dernier mot.
    end = min(end + 0.25, src["duration"])
    duration = end - start
    name = clip["name"]
    clip_dir = work_dir / "render" / name
    clip_dir.mkdir(parents=True, exist_ok=True)

    # 1. Sous-titres
    words = subtitle_generator.clip_words(sentences, start, end)
    subtitle_generator.write_srt(words, subs_dir / f"{name}.srt")
    subtitle_generator.write_ass(words, clip_dir / "subs.ass", cfg, clip.get("hook"), duration)
    shutil.copy(clip_dir / "subs.ass", subs_dir / f"{name}.ass")

    # 2. Recadrage + zooms
    plan = smart_crop.plan_crop(str(source), start, end, src["width"], src["height"],
                                cfg.width, cfg.height)
    punch = dynamic_zoom.pick_punch_times([w["start"] for w in words if is_keyword(w["word"])],
                                          duration) if cfg.enable_zoom else []
    z = dynamic_zoom.zoom_expression(duration, punch, cfg.enable_zoom)
    W, H = cfg.width, cfg.height

    if plan.mode == "crop":
        base = (f"[0:v]crop={plan.crop_w}:{plan.crop_h}:'{plan.x_expression()}':0,"
                f"scale={W}:{H}:flags=lanczos,setsar=1")
    else:  # source verticale : remplissage avec un fond flouté
        base = (f"[0:v]split=2[bgs][fgs];"
                f"[bgs]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
                f"boxblur=30:2[bg];"
                f"[fgs]scale={W}:{H}:force_original_aspect_ratio=decrease:flags=lanczos[fg];"
                f"[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1")
    video = (
        f"{base},fps={cfg.fps},"
        f"scale=w='trunc({W}*({z})/2)*2':h='trunc({H}*({z})/2)*2':eval=frame:flags=bicubic,"
        f"crop={W}:{H}:'(iw-{W})/2':'(ih-{H})*0.42',"
        f"ass=subs.ass:fontsdir='{FONTS_DIR}',format=yuv420p[vout]"
    )

    # 3. Audio
    music = sound_design.find_music()
    extra_first = 1
    audio, sfx_inputs = sound_design.build_audio_graph(
        extra_first, punch, cfg, music_input=None)
    if music is not None:
        music_idx = extra_first + len(sfx_inputs)
        audio, sfx_inputs = sound_design.build_audio_graph(extra_first, punch, cfg, music_idx)

    graph = clip_dir / "graph.txt"
    graph.write_text(video + ";\n" + audio, encoding="utf-8")

    cmd = ["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{duration:.3f}",
           "-i", source.resolve()]
    for p in sfx_inputs:
        cmd += ["-i", p.resolve()]
    if music is not None:
        cmd += ["-stream_loop", "-1", "-i", music.resolve()]
    out = clip_dir / f"{name}.mp4"
    cmd += ["-filter_complex_script", "graph.txt", "-map", "[vout]", "-map", "[aout]",
            "-t", f"{duration:.3f}", *_video_codec_args(cfg), out.resolve()]
    log.info("    rendu FFmpeg (%.0f s, %d punch-in)…", duration, len(punch))
    run(cmd, desc=f"rendu de {name}", cwd=clip_dir)
    before = sound_design.finalize_loudness(out, cfg.target_lufs, cfg.audio_bitrate)
    log.info("    loudness : %.1f LUFS -> cible %.0f LUFS", before, cfg.target_lufs)
    clip["render"] = {"crop_mode": plan.mode, "faces": plan.faces_found,
                      "positions": len(plan.keyframes or []), "punch_ins": punch,
                      "duration": round(duration, 2)}
    return out


def export_platforms(master: Path, clip: dict, cfg, out_dir: Path) -> list[Path]:
    files = []
    num = clip["name"].split("_")[-1]
    for profile in cfg.export_profiles:
        if profile not in PLATFORM_PREFIX:
            continue
        dest_dir = out_dir / profile
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / f"{PLATFORM_PREFIX[profile]}_{num}.mp4"
        shutil.copy(master, dest)
        files.append(dest)
    return files


def whatsapp_cut_points(sentences: list[dict], start: float, end: float, limit: float) -> list[tuple[float, float]]:
    """Découpe [0, durée] en segments <= limit, coupés entre deux phrases."""
    duration = end - start
    bounds = sorted({round(s["end"] - start, 3) for s in sentences
                     if start < s["end"] < end and s["end"] - start < duration - 1})
    parts, a = [], 0.0
    while duration - a > limit:
        ok = [b for b in bounds if a + 8 <= b <= a + limit]   # segments d'au moins 8 s
        b = ok[-1] if ok else a + limit                         # repli : coupe franche
        # milieu du silence entre deux phrases pour une coupe propre
        nxt = [s["start"] - start for s in sentences if s["start"] - start >= b]
        if ok and nxt and nxt[0] - b < 1.0:
            b = (b + min(nxt)) / 2
        parts.append((a, round(b, 3)))
        a = round(b, 3)
    parts.append((a, duration))
    return parts


def export_whatsapp(master: Path, clip: dict, sentences: list[dict], cfg, out_dir: Path,
                    counter: list[int]) -> list[Path]:
    if "WhatsApp_Statut" not in cfg.export_profiles:
        return []
    dest_dir = out_dir / "WhatsApp_Statut"
    dest_dir.mkdir(parents=True, exist_ok=True)
    duration = media_info(master)["duration"]
    files = []
    for a, b in whatsapp_cut_points(sentences, clip["start"], clip["start"] + duration,
                                    cfg.whatsapp_max_seconds):
        counter[0] += 1
        dest = dest_dir / f"statut_{counter[0]:02d}.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-ss", f"{a:.3f}", "-i", master, "-t", f"{b - a:.3f}",
             "-af", "afade=t=in:d=0.05", *_video_codec_args(cfg, crf=cfg.crf + 1),
             "-maxrate", "8M", "-bufsize", "16M", dest],
            desc=f"segment WhatsApp {dest.name}")
        files.append(dest)
    return files


def verify(path: Path, cfg, max_duration: float | None, full_decode: bool) -> dict:
    """Contrôle : flux H.264 + AAC, 1080x1920, durée, et décodage intégral sans erreur."""
    info = media_info(path)
    problems = []
    if info["vcodec"] != "h264":
        problems.append(f"codec vidéo {info['vcodec']}")
    if info["acodec"] != "aac":
        problems.append(f"codec audio {info['acodec']}")
    if (info["width"], info["height"]) != (cfg.width, cfg.height):
        problems.append(f"résolution {info['width']}x{info['height']}")
    if max_duration and info["duration"] > max_duration + 0.5:
        problems.append(f"durée {info['duration']:.1f}s > {max_duration:.0f}s")
    if full_decode:
        proc = run(["ffmpeg", "-v", "error", "-i", path, "-f", "null", "-"], desc="décodage", capture=True)
        if proc.stderr.strip():
            problems.append("erreurs de décodage")
    info["ok"] = not problems
    info["problems"] = problems
    if problems:
        log.error("    %s : %s", path.name, ", ".join(problems))
    return info


def check_ffmpeg_features() -> None:
    proc = run(["ffmpeg", "-hide_banner", "-filters"], capture=True)
    missing = [f for f in ("ass", "loudnorm", "sidechaincompress") if f" {f} " not in proc.stdout]
    if missing:
        raise PipelineError(f"FFmpeg compilé sans : {', '.join(missing)} (libass requis).")
