"""Configuration centrale du pipeline.

Les valeurs par défaut conviennent à la plupart des vidéos. Elles peuvent être
surchargées par un fichier ``config.json`` à la racine du projet (mêmes clés)
puis par des variables d'environnement (voir ``.env.example``).
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field, fields
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _load_dotenv(path: Path) -> None:
    """Charge un .env minimaliste (KEY=VALUE) sans dépendance externe."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@dataclass
class Config:
    # --- Source ---------------------------------------------------------
    source: str = "https://www.youtube.com/watch?v=ze95vrn-Xs8"
    work_dir: Path = ROOT / "work"
    output_dir: Path = ROOT / "output"

    # --- Transcription --------------------------------------------------
    whisper_model: str = "small"          # tiny | base | small | medium | large-v3
    whisper_language: str | None = None   # None = détection automatique
    whisper_device: str = "auto"          # auto | cpu | cuda

    # --- Sélection des clips -------------------------------------------
    max_clips: int = 6
    clip_min_seconds: float = 45.0
    clip_max_seconds: float = 180.0       # TikTok / Reels / Shorts : 3 min max
    clip_target_seconds: float = 90.0     # durée "idéale" favorisée par le score
    max_overlap_ratio: float = 0.0        # 0 = aucun chevauchement entre clips
    use_llm: bool = True                  # utilise Claude si ANTHROPIC_API_KEY est défini
    llm_model: str = "claude-opus-5-5"

    # --- WhatsApp -------------------------------------------------------
    whatsapp_max_seconds: float = 60.0    # limite actuelle d'un statut vidéo

    # --- Montage --------------------------------------------------------
    width: int = 1080
    height: int = 1920
    fps: int = 30
    enable_zoom: bool = True
    enable_sfx: bool = True
    enable_hook_title: bool = True
    subtitle_style: str = "podcast"       # podcast | minimal
    font_name: str = "Inter Black"
    music_volume: float = 0.12            # utilisé seulement si assets/music contient un fichier

    # --- Encodage -------------------------------------------------------
    crf: int = 18
    preset: str = "medium"
    audio_bitrate: str = "192k"
    target_lufs: float = -14.0

    # --- Profils exportés (TikTok/Reels/Shorts partagent le même master) --
    export_profiles: list[str] = field(
        default_factory=lambda: ["TikTok", "Reels", "Shorts", "WhatsApp_Statut"]
    )

    @classmethod
    def load(cls, config_file: Path | None = None) -> "Config":
        _load_dotenv(ROOT / ".env")
        cfg = cls()
        config_file = config_file or ROOT / "config.json"
        if config_file.exists():
            data = json.loads(config_file.read_text(encoding="utf-8"))
            cfg.update(data)
        env_map = {f.name: f"CLIPPER_{f.name.upper()}" for f in fields(cls)}
        env_values = {k: os.environ[v] for k, v in env_map.items() if v in os.environ}
        cfg.update(env_values)
        return cfg

    def update(self, data: dict) -> None:
        types = {f.name: f.type for f in fields(self)}
        for key, value in data.items():
            if key not in types or value is None:
                continue
            current = getattr(self, key)
            if isinstance(current, bool):
                value = value if isinstance(value, bool) else str(value).lower() in ("1", "true", "yes", "oui")
            elif isinstance(current, int):
                value = int(value)
            elif isinstance(current, float):
                value = float(value)
            elif isinstance(current, Path):
                value = Path(value)
            elif isinstance(current, list) and isinstance(value, str):
                value = [v.strip() for v in value.split(",") if v.strip()]
            setattr(self, key, value)

    @property
    def llm_available(self) -> bool:
        return self.use_llm and bool(os.environ.get("ANTHROPIC_API_KEY"))
