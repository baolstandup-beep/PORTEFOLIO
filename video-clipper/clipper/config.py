"""Paramètres du pipeline. Tout est modifiable en ligne de commande (voir main.py)."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

DEFAULT_URL = "https://www.youtube.com/watch?v=ze95vrn-Xs8"


@dataclass
class Config:
    # --- Source -----------------------------------------------------------
    url: str = DEFAULT_URL
    source: Path | None = None          # fichier local : saute le téléchargement
    cookies_from_browser: str | None = None  # ex. "chrome" si YouTube exige une connexion

    # --- Dossiers ---------------------------------------------------------
    work_dir: Path = Path("work")       # cache : vidéo, audio, transcription
    output_dir: Path = Path("output")

    # --- Transcription (Whisper) -------------------------------------------
    whisper_model: str = "small"        # tiny | base | small | medium | large-v3
    language: str | None = "fr"         # None = détection automatique
    transcript: Path | None = None      # réutiliser une transcription JSON existante
    min_sub_logprob: float = -1.0       # en dessous : passage jugé mal transcrit (pas de sous-titre)

    # --- Découpage ----------------------------------------------------------
    max_clip: float = 180.0             # durée max d'un clip TikTok (secondes)
    min_clip: float = 45.0              # durée min d'un clip TikTok
    max_clips: int = 8                  # nombre max de clips retenus
    max_text_overlap: float = 0.35      # similarité lexicale max entre deux clips (anti-répétition)
    status_max: float = 60.0            # limite d'un statut WhatsApp (secondes)
    status_min: float = 8.0             # évite les morceaux de statut ridiculement courts

    # --- Rendu ----------------------------------------------------------------
    width: int = 1080
    height: int = 1920
    layout: str = "auto"                # auto | crop | blur
    crf_tiktok: int = 18
    crf_status: int = 21
    status_maxrate: str = "5M"          # plafonne la taille des statuts
    preset: str = "medium"              # x264 : ultrafast … veryslow
    loudness_target: float = -14.0      # LUFS (standard des plateformes sociales)
    font: str = "Montserrat"            # repli automatique si absente
    font_size: int = 74
    uppercase: bool = False

    # --- Contrôle du flux ------------------------------------------------------
    dry_run: bool = False               # propose les découpes sans rendre
    plan: Path | None = None            # rendre à partir d'un plan.json édité à la main
    skip_verify: bool = False
