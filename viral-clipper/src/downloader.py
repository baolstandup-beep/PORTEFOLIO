"""Récupération de la vidéo source (URL YouTube via yt-dlp, ou fichier local)."""
from __future__ import annotations

from pathlib import Path

from .utils import PipelineError, log


def fetch_source(source: str, work_dir: Path) -> Path:
    """Retourne le chemin d'un fichier vidéo local, en téléchargeant si nécessaire.

    Le téléchargement est mis en cache : relancer le pipeline ne retélécharge pas.
    """
    local = Path(source).expanduser()
    if local.exists():
        log.info("Source locale : %s", local)
        return local.resolve()

    if not source.startswith(("http://", "https://")):
        raise PipelineError(f"Source introuvable : {source}")

    try:
        import yt_dlp
    except ImportError as exc:  # pragma: no cover
        raise PipelineError("yt-dlp n'est pas installé : pip install -r requirements.txt") from exc

    dl_dir = work_dir / "source"
    dl_dir.mkdir(parents=True, exist_ok=True)
    opts = {
        # Meilleure qualité jusqu'à 1080p (au-delà, inutile pour du 1080x1920 recadré).
        "format": "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/bv*[height<=1080]+ba/b[height<=1080]/b",
        "merge_output_format": "mp4",
        "outtmpl": str(dl_dir / "%(id)s.%(ext)s"),
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "retries": 5,
    }
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(source, download=False)
            target = dl_dir / f"{info['id']}.mp4"
            if target.exists() and target.stat().st_size > 0:
                log.info("Vidéo déjà téléchargée : %s", target.name)
                return target
            log.info("Téléchargement : %s (%s s)", info.get("title"), info.get("duration"))
            ydl.download([source])
    except yt_dlp.utils.DownloadError as exc:
        raise PipelineError(
            f"Téléchargement impossible : {str(exc).splitlines()[0][:300]}\n"
            "Vérifiez la connexion, mettez à jour yt-dlp (pip install -U yt-dlp) "
            "ou fournissez un fichier local avec --source chemin/video.mp4."
        ) from exc
    if not target.exists():
        candidates = sorted(dl_dir.glob(f"{info['id']}.*"))
        if not candidates:
            raise PipelineError("yt-dlp n'a produit aucun fichier.")
        target = candidates[0]
    (dl_dir / f"{info['id']}.title.txt").write_text(info.get("title", ""), encoding="utf-8")
    return target
