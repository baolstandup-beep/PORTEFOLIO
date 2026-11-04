"""Interface graphique (Gradio) : python main.py --ui  puis ouvrir http://127.0.0.1:7860

Flux : coller un lien YouTube ou importer une vidéo → « Analyser avec l'IA » →
ajuster les timestamps / titres dans le tableau → « Générer tous les clips ».
"""
from __future__ import annotations

import logging
from pathlib import Path

import gradio as gr

import main as pipeline
from src.config import Config
from src.utils import PipelineError, fmt_ts

COLUMNS = ["clip", "début (s)", "fin (s)", "score", "titre", "accroche"]
PROFILES = ["TikTok", "Reels", "Shorts", "WhatsApp_Statut"]


def _config(url, upload, zoom, sfx, use_llm, style, profiles, max_clips) -> Config:
    cfg = Config.load()
    source = upload or (url or "").strip() or cfg.source
    cfg.update({"source": source, "enable_zoom": zoom, "enable_sfx": sfx, "use_llm": use_llm,
                "subtitle_style": style, "max_clips": int(max_clips)})
    cfg.export_profiles = list(profiles) or PROFILES
    return cfg


def analyze(url, upload, zoom, sfx, use_llm, style, profiles, max_clips, progress=gr.Progress()):
    cfg = _config(url, upload, zoom, sfx, use_llm, style, profiles, max_clips)
    try:
        pipeline.preflight()
        source, src, _, sentences, clips = pipeline.analyze(cfg, progress=progress)
    except PipelineError as exc:
        raise gr.Error(str(exc)) from exc
    rows = [[c["name"], round(c["start"], 2), round(c["end"], 2), c["score"], c["title"], c["hook"]]
            for c in clips]
    state = {"source": str(source), "src": src, "sentences": sentences, "clips": clips}
    summary = (f"{len(clips)} moments forts détectés dans {Path(source).name} "
               f"({fmt_ts(src['duration'])}). Modifiez le tableau si besoin, puis générez.")
    preview = str(source)
    return rows, state, summary, preview


def generate(table, state, url, upload, zoom, sfx, use_llm, style, profiles, max_clips,
             progress=gr.Progress()):
    if not state:
        raise gr.Error("Lancez d'abord l'analyse.")
    cfg = _config(url, upload, zoom, sfx, use_llm, style, profiles, max_clips)
    rows = table.values.tolist() if hasattr(table, "values") else table
    by_name = {c["name"]: c for c in state["clips"]}
    clips = []
    for row in rows:
        if not row or not row[0]:
            continue
        base = by_name.get(row[0], {"text": "", "reason": "Ajout manuel", "source": "manuel"})
        clip = {**base, "name": row[0], "start": float(row[1]), "end": float(row[2]),
                "score": row[3], "title": row[4], "hook": row[5]}
        if clip["end"] - clip["start"] > cfg.clip_max_seconds:
            raise gr.Error(f"{row[0]} dépasse {cfg.clip_max_seconds:.0f} s.")
        pipeline.snap_to_sentences(clip, state["sentences"])
        clips.append(clip)
    try:
        res = pipeline.render(cfg, Path(state["source"]), state["src"], state["sentences"], clips,
                              progress=progress)
    except PipelineError as exc:
        raise gr.Error(str(exc)) from exc
    videos = [str(f) for r in res["results"] for f in r["files"] if f.parent.name != "WhatsApp_Statut"]
    first = next((v for v in videos if "/TikTok/" in v), videos[0] if videos else None)
    return first, res["report"].read_text(encoding="utf-8"), [str(res["report"])] + videos


def build() -> gr.Blocks:
    with gr.Blocks(title="AI Viral Clipper") as app:
        gr.Markdown("## AI Viral Clipper\nVidéo longue → clips 9:16 sous-titrés pour TikTok, "
                    "Reels, Shorts et WhatsApp.")
        state = gr.State()
        with gr.Row():
            with gr.Column(scale=2):
                url = gr.Textbox(label="Lien YouTube", value=Config().source)
                upload = gr.File(label="…ou vidéo locale", type="filepath",
                                 file_types=["video"])
            with gr.Column(scale=1):
                max_clips = gr.Slider(1, 12, value=6, step=1, label="Nombre de clips")
                style = gr.Radio(["podcast", "minimal"], value="podcast", label="Style des sous-titres")
                profiles = gr.CheckboxGroup(PROFILES, value=PROFILES, label="Formats d'export")
                with gr.Row():
                    zoom = gr.Checkbox(True, label="Zooms dynamiques")
                    sfx = gr.Checkbox(True, label="Effets sonores")
                    use_llm = gr.Checkbox(True, label="Analyse Claude")
        analyze_btn = gr.Button("Analyser avec l'IA", variant="primary")
        summary = gr.Markdown()
        table = gr.Dataframe(headers=COLUMNS, datatype=["str", "number", "number", "number", "str", "str"],
                             interactive=True, label="Meilleurs moments (timestamps modifiables)")
        source_preview = gr.Video(label="Vidéo source")
        gen_btn = gr.Button("Générer tous les clips", variant="primary")
        with gr.Row():
            clip_preview = gr.Video(label="Aperçu du premier clip")
            report = gr.Textbox(label="Rapport de montage", lines=18)
        files = gr.Files(label="Fichiers exportés")

        inputs = [url, upload, zoom, sfx, use_llm, style, profiles, max_clips]
        analyze_btn.click(analyze, inputs, [table, state, summary, source_preview])
        gen_btn.click(generate, [table, state, *inputs], [clip_preview, report, files])
    return app


def launch() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    build().queue().launch(server_name="127.0.0.1", server_port=7860)


if __name__ == "__main__":
    launch()
