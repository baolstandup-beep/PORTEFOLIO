# Vidéo institutionnelle — Mouvement « PAS-PAS »
## Communiqué : Naufrage au large de Lompoul (Fait à Mbacké, le 9 novembre 2026)

Vidéo motion design de 60 s, 30 i/s, H.264, déclinée en 9:16 (TikTok, Reels, Statut WhatsApp) et 16:9.
Tout est **généré par du code** : chaque image est une fonction pure du temps, rendue de façon
déterministe (Chromium headless + ffmpeg). Aucune banque d'images, aucune photo de victime ou de
secouriste réelle, aucune image IA photoréaliste : la mer, la pirogue, la côte de Lompoul et les
silhouettes anonymes sont dessinées et volontairement symboliques.

### Livrables
| Fichier | Usage |
|---|---|
| `exports/tiktok/PAS-PAS_naufrage_Lompoul_TikTok_1080x1920.mp4` | TikTok |
| `exports/instagram/PAS-PAS_naufrage_Lompoul_Reels_1080x1920.mp4` | Instagram Reels |
| `exports/whatsapp/PAS-PAS_naufrage_Lompoul_Status_1080x1920.mp4` | Statut WhatsApp (fichier allégé) |
| `exports/horizontal/PAS-PAS_naufrage_Lompoul_1920x1080.mp4` | YouTube, Facebook, écrans |
| `assets/audio/bande_son_master.flac` | bande-son masterisée (-14 LUFS, -1 dBTP) |
| `sound_design/music.wav` | musique originale |
| `voice_over/` | version actuelle **sans voix off** ; script prêt si une voix est ajoutée plus tard |

### Architecture (équivalent d'un projet After Effects)
```
PAS_PAS_VIDEO/
  index.html              prévisualisation (navigateur) : espace = lecture, ←/→ = image par image
  film.js                 COMPOSITION FINALE : timeline de montage + transitions + étalonnage (grain, vignette)
  film.json, beats.json   durée, formats, grille temporelle (1 temps = 1 s)
  lib/kit.js              bibliothèque partagée : couleurs, typo, océan, pirogue, dunes, silhouettes, animations de texte
  lib/motion.js           moteur : ressorts, easing, flou de bouger, bruit déterministe
  scenes/scene_01_intro/        0 → 6 s    vue aérienne de nuit, révélation du logo
  scenes/scene_02_naufrage/     6 → 14 s   horizon, dunes de Lompoul, titre
  scenes/scene_03_hommage/     14 → 27 s   mer calme à l'aube, hommage puis solidarité
  scenes/scene_04_solidarite/  27 → 39 s   rivage de nuit, riverains, faisceaux de recherche
  scenes/scene_05_prevention/  39 → 50 s   « Comprendre pour prévenir », réseau des acteurs
  scenes/scene_06_conclusion/  50 → 60 s   fond blanc, logo, engagement, signature
  sound_design/score.py   musique originale synthétisée (océan, nappes, piano, cloches)
  build.sh                mixage (voix + ducking + mastering) et 4 exports
  assets/                 logo officiel (+ version détourée), communiqué source, police Poppins (OFL)
  exports/                vidéos finales
```
Chaque scène est un module indépendant (`DUR`, `draw(ctx, t)` en temps local) : on la modifie sans
toucher aux autres. L'ordre, les durées et les transitions se règlent dans `TIMELINE` (`film.js`).

### Prévisualiser / modifier / ré-exporter
```bash
cd PORTEFOLIO && python3 -m http.server 8000      # puis http://localhost:8000/PAS_PAS_VIDEO/?format=9x16
```
```bash
SK=<chemin du skill motion-reel>
node $SK/scripts/render.mjs --film PAS_PAS_VIDEO --format 9x16 --video-only --fps 30   # puis --format 16x9
uv run PAS_PAS_VIDEO/sound_design/score.py      # si la musique change
PAS_PAS_VIDEO/build.sh                           # mixage + exports
```

### Fidélité au communiqué
- Aucun chiffre sur les victimes. Le communiqué parle d'**un rescapé** recensé : la vidéo écrit
  « au rescapé » et non « aux survivants ».
- Les phrases citées entre guillemets sont celles du communiqué (scènes 03 et 04). La phrase de la
  scène 06 « Comprendre les réalités locales… » et « Ensemble, pour un avenir meilleur » viennent du brief.
- Typographie : Poppins (famille du logo et du communiqué), licence SIL OFL (`assets/fonts/OFL-LICENSE.txt`).
