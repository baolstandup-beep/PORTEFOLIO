# Motion design « Conférence de presse PAS-PAS »

Vidéo verticale TikTok/Reels (1080 × 1920, 30 i/s, H.264 + AAC, BT.709, 33,57 s) générée avec **Remotion** (React + TypeScript) à partir du PSD `Sans titre - 4.psd`.

## Livrables

| Fichier | Contenu |
|---|---|
| `output/motion_design_final.mp4` | vidéo finale (= `output/tiktok/motion_design_tiktok.mp4`) |
| `output/tiktok/preview_tiktok.mp4`, `output/previews/motion_design_preview.mp4` | prévisualisation demi-résolution |
| `output/tiktok/voix_off.txt`, `output/audio/voix-off.txt` | script de la voix off **non utilisée** dans la version livrée (option, voir ci-dessous) |
| `output/tiktok/voix_off.wav`, `output/audio/voix-off.wav` | piste voix off Piper (option non utilisée) |
| `output/analysis/rapport_psd.md` | analyse du PSD, découpe, limites |
| `output/analysis/tiktok_shot_list.md`, `tiktok_storyboard.md`, `camera-movements.md` | préproduction (les fichiers `shot-list.md`, `storyboard.md`, `storyboard-shotcraft.md` y renvoient) |
| `output/analysis/video-shotcraft.md` | ce qui a été repris du skill Video Shotcraft, et ce qui ne l'a pas été |
| `output/analysis/revue-independante.md` | contrôle qualité par un relecteur indépendant |
| `output/analysis/preview.png`, `planche-calques.png`, `planche-contact.png`, `verification-recomposition.png` | images de contrôle |
| `public/assets/…` | les 19 éléments PNG transparents extraits, l'audio (`public/assets/audio/ATTRIBUTION.md`) |

## Prérequis

- Node.js ≥ 18 (testé 22.22), npm
- Python 3 (testé 3.13) avec `pip install psd-tools scipy pillow numpy piper-tts`
- FFmpeg / ffprobe dans le PATH (testé 6.1)
- Remotion télécharge son navigateur au premier rendu ; dans l'environnement de travail d'origine, `remotion.config.ts` utilise le Chromium local s'il existe.

## Commandes (vérifiées, sauf `npm run dev` qui ouvre une interface interactive)

```bash
npm install
npm run extract     # PSD → public/assets/** + src/config/assets.generated.json + images de contrôle
npm run audio       # voix off (Piper, local) → public/assets/audio/voice/*.wav + durées
npm run validate    # contrôles de cohérence + calage de la piste voix_off.wav
npm run audio       # 2e passage : assemble output/tiktok/voix_off.wav avec les débuts calculés
npm run dev         # Remotion Studio (aperçu interactif)
npm run preview     # rendu demi-résolution → output/tiktok/preview_tiktok.mp4 (+ copie dans output/previews/)
npm run render      # rendu final → output/tiktok/motion_design_tiktok.mp4 (+ copie output/motion_design_final.mp4)
npm run render:voix   # variante AVEC voix off (Piper) → output/tiktok/motion_design_tiktok_avec_voix.mp4
npm run typecheck
```

Le modèle de voix (70 Mo) n'est pas versionné : `npm run audio` le télécharge dans `tools/piper/` s'il manque. Les prises de voix sont mises en cache (Piper n'est pas déterministe) ; `python3 scripts/prepare-audio.py --force` les régénère toutes — relancer alors `npm run validate`, car les durées changent.

## Architecture

```
scripts/inspect-psd.py      structure du PSD, preview
scripts/extract-assets.py   découpe du calque unique en 19 éléments (vérifie la recomposition au pixel près)
scripts/prepare-audio.py    voix off Piper, normalisation -16 LUFS, piste complète
scripts/validate-project.py ressources, plans contigus, voix sans chevauchement, cadre et zones de sécurité
scripts/dump-timeline.ts    timeline résolue en JSON (pour la validation)
src/config/timeline.ts      SOURCE UNIQUE : plans, clés de caméra, apparitions, reflets, voix, musique, effets sonores
src/config/voiceover.json   texte de la voix off (affiché et prononcé)
src/config/video.ts         format, dimensions du document, couleurs
src/config/safeZones.ts     marges d'interface TikTok
src/config/assets.ts        accès typé aux éléments extraits
src/components/CameraMotion.tsx  caméra 2D (interpolation des clés, parallaxe, conversion doc → écran)
src/components/Transitions.tsx   courbes et préréglages d'apparition (rise, wipeRight, wipeDown, scaleIn, slideUp, rowIn)
src/components/Layer.tsx         un élément du PSD placé et animé
src/components/LightSweep.tsx    reflet lumineux découpé à la forme d'un élément
src/components/Background.tsx    fond blanc + halos discrets
src/components/Soundtrack.tsx    voix, musique avec ducking, effets
src/scenes/Scene*.tsx            éléments de chaque plan (P1 à P5)
src/compositions/TikTokVideo.tsx composition 1080×1920
```

Il n'y a qu'une composition : l'affiche étant en portrait (0,77), le cadrage 9:16 pleine largeur est le plus lisible. Une version carrée ou 16:9 réduirait l'affiche entière à ~830 px ou ~460 px de large au plan final ; je ne l'ai pas produite.

## Modifier la vidéo

- **Durée d'un plan** : `chain([...])` dans `timeline.ts`. Tout ce qui suit est décalé automatiquement (les événements sont exprimés en `SHOTS.Px.from + décalage`).
- **Cadrage** : `CAMERA_KEYS` (centre `cx, cy` en pixels du PSD, zoom `z`). Plan final : `FINAL_CAMERA`.
- **Animation d'un élément** : `REVEALS` (instant `at`, `duration`, `preset`, `depth` de parallaxe).
- **Voix off** : **désactivée par défaut** à la demande du client (`voice: false` dans `src/Root.tsx`) ; musique alors à 0,5 sans baisse. Pour la réactiver : `voice: true` ou `npm run render:voix`. Pour changer le texte : modifier `text` / `spoken` dans `voiceover.json`, puis `npm run audio && npm run validate && npm run audio`. Ajuster `VO_START` si une réplique déborde (la validation le signale).
- **Musique** : remplacer `public/assets/audio/music/house-vibez.mp3` et `MUSIC.src` ; volumes et ducking dans `MUSIC`.
- **Effets sonores** : table `SFX` (une ligne commentée par action).
- **Zones de sécurité** : `src/config/safeZones.ts` et `SAFE` dans `validate-project.py`.

## Contrôles effectués

- Recomposition des éléments extraits = composite PSD (écart max 0).
- Dernière image comparée à l'affiche : seuls les contours diffèrent (rééchantillonnage sous-pixel) et le blanc porte le halo de fond (≤ ~9 %) ; aucun élément absent ou déplacé.
- `ffprobe` : 1080×1920, 30/1, 1007 images, H.264 High yuv420p BT.709, AAC 48 kHz stéréo, 33,57 s ; décodage complet sans erreur ; 0 image noire (blackdetect).
- Audio (version livrée, sans voix off) : −17,4 LUFS intégré, crête −0,8 dBFS.

## Limites connues

- PSD aplati (1 calque, aucun texte éditable) : animation par blocs, pas de lettre à lettre, parallaxe simulée.
- (Option voix off, non livrée) Voix de synthèse locale Piper (qualité « medium », 22 kHz) : intelligible mais moins naturelle qu'une voix studio ; le modèle ne gère pas le tilde nasal de son phonémiseur, les nasales (« conférence », « trente ») peuvent sonner approximatives. Prononciations de « PAS-PAS », « Mbacké » et de l'adresse web non vérifiées à l'oreille.
- Texte des lignes du programme petit sur téléphone (≈ 20–28 px), contrainte de la mise en page d'origine.
- Au plan final, le logo est à 64 px du bord gauche (mise en page d'origine) et les bords perdus touchent le cadre.
