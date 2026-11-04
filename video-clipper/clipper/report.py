"""Rapport de montage lisible (output/rapport_montage.txt)."""
from __future__ import annotations

from datetime import datetime
from pathlib import Path

from .analyzer import ClipPlan, fmt_ts
from .config import Config


def write_report(path: Path, cfg: Config, meta: dict, transcript: dict, clips: list[ClipPlan],
                 candidates: list[ClipPlan], framings: dict, checks: list[dict],
                 warnings: list[str]) -> Path:
    L: list[str] = []
    bar = "=" * 78
    L += [bar, "RAPPORT DE MONTAGE — découpage automatique TikTok / WhatsApp Statut", bar,
          f"Généré le      : {datetime.now():%Y-%m-%d %H:%M}",
          f"Source         : {meta.get('title') or cfg.source or cfg.url}",
          f"Chaîne         : {meta.get('channel', '—')}",
          f"URL            : {meta.get('url', cfg.url)}",
          f"Durée source   : {fmt_ts(transcript.get('duration') or 0)}",
          f"Transcription  : Whisper {transcript.get('model', '?')} — langue "
          f"{transcript.get('language', '?')} ({(transcript.get('language_probability') or 0):.0%})",
          f"Réglages       : clips {cfg.min_clip:.0f}–{cfg.max_clip:.0f} s, max {cfg.max_clips} clips, "
          f"statut ≤ {cfg.status_max:.0f} s, volume {cfg.loudness_target} LUFS", ""]

    segs = transcript.get("segments", [])
    if segs:
        low = sum(s["end"] - s["start"] for s in segs if s.get("avg_logprob", 0) < cfg.min_sub_logprob)
        tot = sum(s["end"] - s["start"] for s in segs) or 1
        if low / tot > 0.15:
            warnings.append(f"{low/tot:.0%} de la parole est mal transcrite (langue non française, "
                            "bruit ou chevauchements) : ces passages ne sont pas sous-titrés et "
                            "sont défavorisés dans la sélection.")

    L += ["-" * 78, f"CLIPS RETENUS ({len(clips)})", "-" * 78]
    for c in clips:
        fr = framings.get(c.index)
        L += [f"clip_{c.index:02d}.mp4   {fmt_ts(c.start)} → {fmt_ts(c.end)}   "
              f"({c.duration:.1f} s)   score {c.score:+.2f}",
              f"   Accroche  : « {c.hook} »",
              f"   Pourquoi  : {', '.join(c.reasons) or 'score global'}",
              f"   Cadrage   : {fr.mode if fr else '?'} — {fr.detail if fr else ''}",
              f"   Statuts   : " + ", ".join(
                  f"{name} ({b - a:.1f} s)" for name, (a, b) in
                  zip(c.status_files or [f"partie {k}" for k in range(1, len(c.status_parts) + 1)],
                      c.status_parts)), ""]

    others = candidates
    if others:
        L += ["-" * 78, "AUTRES DÉCOUPES PROPOSÉES (non rendues — score inférieur ou redite)", "-" * 78]
        for c in others:
            L.append(f"   {fmt_ts(c.start)} → {fmt_ts(c.end)}  ({c.duration:.0f} s)  "
                     f"score {c.score:+.2f}  « {c.hook[:70]} »")
        L.append("")

    if checks:
        ok = sum(1 for r in checks if r["ok"])
        L += ["-" * 78, f"VÉRIFICATION DES FICHIERS : {ok}/{len(checks)} conformes", "-" * 78]
        for r in checks:
            status = "OK " if r["ok"] else "ERR"
            L.append(f"   [{status}] {r['file']:<24} {r['duration']:7.2f} s  {r['size_mb']:6.1f} Mo"
                     + ("" if r["ok"] else "   → " + "; ".join(r["problems"])))
        L.append("")

    if warnings:
        L += ["-" * 78, "AVERTISSEMENTS", "-" * 78] + [f" ! {w}" for w in warnings] + [""]
    L += ["Pour ajuster : éditez output/plan.json puis relancez  python main.py --plan output/plan.json",
          bar]
    path.write_text("\n".join(L) + "\n", "utf-8")
    return path
