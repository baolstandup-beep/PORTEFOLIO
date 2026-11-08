# GRAPHIA_MOTION — Film promotionnel GRAPHIA 2026

Film de motion design pour **GRAPHIA 2026**, bootcamp infographie & IA à Touba et Mbacké (https://graphia-2026.vercel.app/).
Il est construit en code avec Remotion, aux couleurs, typographie et courbes de mouvement du site officiel.

## Livrables (`exports/`)

| Version | Fichier |
|---|---|
| Film 60 s — 16:9 (master, YouTube, présentation) | `master/GRAPHIA2026_Film_60s_1920x1080.mp4` · `youtube/…` |
| Film 60 s — 9:16 | `master/GRAPHIA2026_Film_60s_1080x1920.mp4` |
| TikTok | `tiktok/GRAPHIA2026_TikTok_60s_1080x1920.mp4` (+ 30 s) |
| Instagram Reels | `instagram/GRAPHIA2026_Reels_60s_1080x1920.mp4` (+ 30 s) |
| Statut WhatsApp | `whatsapp/GRAPHIA2026_WhatsApp-Statut_30s_1080x1920.mp4` |
| Version courte 30 s | `short/GRAPHIA2026_Court_30s_1920x1080.mp4` · `short/…_1080x1920.mp4` |

Spécifications : MP4 H.264, 30 i/s, AAC 48 kHz, −14 LUFS.

## Documentation

- [Storyboard détaillé](docs/storyboard.md) : plans, caméra, textes, voix et sons, seconde par seconde.
- [Voix off](docs/voiceover.md) : scripts 60 s et 30 s, placement dans le montage.
- [Direction artistique](docs/direction-artistique.md) : tokens, typographie, grammaire de mouvement.
- [Guide de production](docs/production-guide.md) : architecture, commandes, modification, limites.

## En bref

```bash
npm install && npm run audio && npm run studio
```

Chaque scène (`src/scenes/Scene01_Hook` … `Scene07_CTA`) est un composant indépendant, prévisualisable seul.
Le montage complet est décrit dans **un seul fichier**, `src/timeline.json`, partagé par l'image et le son.
