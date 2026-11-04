# AI Viral Clipper

Ce pipeline découpe une longue vidéo (YouTube ou fichier local) en clips verticaux 9:16, sous-titrés mot à mot, prêts pour TikTok, Instagram Reels, YouTube Shorts et le statut WhatsApp.

```bash
python main.py
```

Cette commande télécharge la vidéo, la transcrit, repère les moments forts, puis découpe, recadre, sous-titre et exporte les clips.

## Installation

1. **Python 3.10 ou plus récent**, et **FFmpeg compilé avec libass** :
   - Ubuntu/Debian : `sudo apt install ffmpeg`
   - macOS : `brew install ffmpeg`
   - Windows : `winget install Gyan.FFmpeg`
2. Dépendances Python :

   ```bash
   pip install -r requirements.txt
   ```

3. Optionnel : copiez `.env.example` en `.env` et renseignez `ANTHROPIC_API_KEY`. Claude note alors chaque extrait et rédige les titres et les accroches. Sans clé, l'analyse se fait localement, de façon heuristique.

Au premier lancement, le modèle Whisper est téléchargé depuis huggingface.co (environ 500 Mo pour `small`).

## Pipeline

| Étape | Module | Ce qui se passe |
|---|---|---|
| 1. Téléchargement | `src/downloader.py` | yt-dlp télécharge en 1080p max. Le fichier est mis en cache dans `work/source/`. |
| 2. Transcription | `src/transcriber.py` | faster-whisper produit des horodatages mot à mot, avec un filtre VAD. Cache : `work/*.transcript.json`. |
| 3. Analyse | `src/ai_analyzer.py` | Chaque phrase reçoit un score selon les accroches, l'émotion, les conseils, le récit, les chiffres, les questions, l'énergie vocale et le débit. Claude note ensuite la pré-sélection (si une clé est configurée). |
| 4. Sélection | `src/clip_selector.py` | Les fenêtres commencent et finissent toujours sur une fin de phrase, durent entre 45 et 180 s, et ne démarrent jamais sur « et / mais / donc ». Les clips ne se chevauchent pas et les contenus trop similaires sont écartés. |
| 5. Recadrage | `src/smart_crop.py` | PySceneDetect découpe en plans et OpenCV suit le visage principal. Le cadre ne bouge qu'au changement de plan, ou si le locuteur se déplace nettement. |
| 6. Zooms | `src/dynamic_zoom.py` | Une poussée lente (+5 %) s'ajoute à des punch-ins (+8 %) sur les mots clés, espacés d'au moins 5 s. |
| 7. Sous-titres | `src/subtitle_generator.py` | Un SRT est produit, plus un ASS animé : mot courant en jaune avec un « pop », mots clés en vert, accroche en haut pendant 3,5 s, placement dans la zone de sécurité TikTok. |
| 8. Son | `src/sound_design.py` | Coupe-bas, débruitage, compression, puis deux passes de loudnorm à **−14 LUFS**. S'y ajoutent un whoosh d'ouverture discret, des impacts sur les punch-ins, et une musique atténuée sous la voix si un fichier est présent dans `assets/music/`. |
| 9. Rendu | `src/video_renderer.py` | Le master est encodé en H.264 High / AAC 192k, 1080×1920, 30 fps, avec faststart. Il est ensuite copié tel quel pour TikTok, Reels et Shorts, et redécoupé en segments de 60 s max (sur une fin de phrase) pour WhatsApp. Chaque fichier est vérifié par ffprobe puis par un décodage complet. |

## Sortie

```
output/
├── TikTok/clip_01.mp4 …
├── Reels/reel_01.mp4 …
├── Shorts/short_01.mp4 …
├── WhatsApp_Statut/statut_01.mp4 …   (numérotation continue, correspondance dans le rapport)
├── Sous_titres/clip_01.srt + clip_01.ass …
├── clips.json                          (sélection modifiable)
└── rapport_montage.txt                 (timestamps, scores, titres, contrôles)
```

## Modifier la sélection à la main

```bash
python main.py --analyze-only          # écrit output/clips.json sans rien rendre
# éditez start / end / title / hook dans output/clips.json
python main.py --clips output/clips.json
```

Les timestamps saisis à la main sont recalés automatiquement sur la frontière de phrase la plus proche.

## Interface graphique

```bash
python main.py --ui                    # http://127.0.0.1:7860
```

L'interface permet de coller un lien ou d'importer une vidéo, puis de cliquer sur **Analyser avec l'IA**. On peut ensuite modifier les timestamps et les titres dans le tableau, choisir le style de sous-titres, activer ou non les zooms, les effets sonores et Claude, sélectionner les formats, puis lancer **Générer tous les clips**. Un aperçu du rendu et le rapport s'affichent à la fin.

## Options

```
--source URL|fichier   --max-clips N         --whisper-model small|medium|large-v3
--language fr          --profiles TikTok,WhatsApp_Statut
--no-zoom  --no-sfx  --no-llm  --subtitle-style podcast|minimal
--transcript fichier.json  (réutilise une transcription existante)
--output dossier  -v (journal détaillé)
```

Tous les réglages sont dans `src/config.py`. On peut les surcharger avec un fichier `config.json` à la racine (mêmes clés) ou avec des variables `CLIPPER_*` (voir `.env.example`).

## Test sans réseau

```bash
python tests/make_fixture.py
python main.py --source tests/fixture/sample.mp4 --transcript tests/fixture/sample.transcript.json
```

La vidéo de test fait 7 minutes en 16:9. Elle contient un vrai visage dont la position change à chaque plan, plus une transcription synthétique, ce qui permet de valider le recadrage, les sous-titres, le son, les exports et les contrôles.

## Limites connues

- **Limites des plateformes.** WhatsApp limite aujourd'hui un statut vidéo à 60 s, et YouTube Shorts accepte jusqu'à 3 min. Ces limites changent : ajustez `whatsapp_max_seconds` et `clip_max_seconds` si besoin.
- **Détecteur de visage.** Le détecteur Haar d'OpenCV est rapide mais rate les visages de profil. Si personne n'est détecté, le cadre reste centré, ou garde sa position précédente dans le même plan.
- **Un seul locuteur suivi.** Sur un podcast à deux personnes filmées dans le même plan large, le cadre suit le plus grand visage, ce qui ne correspond pas toujours à la personne qui parle.
- **Le score est une estimation, pas une garantie.** Il repère des signaux (accroches, émotion, énergie…). Seule la publication et ses statistiques diront ce qui fonctionne vraiment.
- **Droits.** Republier une vidéo dont vous n'êtes pas l'auteur demande l'accord de son ayant droit.

## Licences des ressources

`assets/fonts/Inter-Black.otf` : police Inter, sous licence SIL Open Font License 1.1. Les effets sonores de `assets/sound_effects/` sont synthétisés par FFmpeg et libres de droits.
