# Guide de production — documentation technique

## Pile technique (et pourquoi)

| Outil | Rôle | Choix |
|---|---|---|
| **Remotion 4** (React + TypeScript) | Composition, animation image par image, rendu MP4 | Rendu déterministe, chaque scène est un composant indépendant |
| **CSS / SVG** | Effets (flous de profondeur, masques, tracés, dégradés) | Pas de WebGL : rendu identique sur toute machine |
| **Python (numpy / scipy)** | Musique et effets sonores synthétisés, mixage, ducking | Bande-son 100 % originale, donc aucun droit à négocier |
| **FFmpeg** | Normalisation sonore (−14 LUFS, crête −1,5 dBTP), remux faststart, version WhatsApp | |
| **ElevenLabs** | Voix off | |
| **GSAP** | **Non installé, volontairement** : les fonctions `interpolate` / `Easing.bezier` de Remotion couvrent tous les besoins. GSAP aurait doublé le moteur d'animation sans rien apporter (consigne « pas de bibliothèques redondantes »). | |
| **Playwright** | Non nécessaire : les ressources ont été récupérées directement depuis le code source du site (dépôt `baolstandup-beep/PORTEFOLIO`, branche `claude/fervent-meitner-o9hth5`, dossier `graphia/`, déployé sur Vercel). C'est plus fiable qu'une capture d'écran. | |

## Arborescence

```
GRAPHIA_MOTION/
├── public/                  servi tel quel au moteur de rendu
│   ├── logos/               logo officiel (PNG 569×175, transparent)
│   ├── images/              visuel officiel + version recadrée, affiche officielle
│   ├── fonts/               Poppins 400→900 (OFL) — identique au site
│   ├── audio/vo/            prises de voix ElevenLabs
│   ├── audio/mix_*.wav      mixages finaux (générés, non versionnés)
│   └── videos/              motion « Parcours IA » du site (référence de style)
├── src/
│   ├── timeline.json        ★ SOURCE UNIQUE : scènes, repères, voix, SFX (lu aussi par Python)
│   ├── theme.ts             tokens couleur / police / courbes du site
│   ├── Root.tsx             compositions : 4 films + chaque scène seule (S01-H … S07-V)
│   ├── compositions/        GraphiaFilm : assemble automatiquement les scènes de timeline.json
│   ├── scenes/SceneXX_*/    une scène = un dossier = un composant indépendant
│   ├── components/          Logo, Particules, Grain, Plume, UI de création, Icônes
│   ├── typography/          Polices, typo cinétique, glitch
│   ├── animations/          compteurs, rouleau de chiffres
│   ├── transitions/         iris (anneau du « g »), rideau en lames, flash
│   ├── audio/               piste son
│   └── utils/               courbes, aléatoire déterministe, formats, timeline
├── scripts/
│   ├── build_audio.py       musique + SFX + voix → mix_long.wav / mix_short.wav (+ stems)
│   ├── render-all.mjs       rendu des 4 films dans out/
│   ├── export.sh            rangement des livrables dans exports/
│   ├── stills.mjs           images fixes de contrôle
│   └── sheet.py             planches contact
├── exports/                 livrables MP4 (+ audio_stems/ non versionné)
└── docs/                    storyboard, voix off, direction artistique, ce guide
```

## Commandes

Prérequis : Node 20+, Python 3 avec numpy et scipy, FFmpeg, un Chrome/Chromium headless.

```bash
cd GRAPHIA_MOTION && npm install
```

```bash
pip install numpy scipy && npm run audio
```

Prévisualiser et modifier dans le navigateur (Remotion Studio) :

```bash
npm run studio
```

Rendre les 4 films puis ranger les livrables :

```bash
REMOTION_CHROME=/chemin/vers/chrome-headless-shell node scripts/render-all.mjs && ./scripts/export.sh
```

Rendre une seule scène, par exemple pour la corriger :

```bash
npx remotion render src/index.ts S05-V out/S05-V.mp4
```

Sans `REMOTION_CHROME`, Remotion télécharge son propre navigateur.

## Modifier le film

- **Décaler un texte ou une phrase** : modifier `src/timeline.json`. Les `cues` sont en secondes depuis le début de la scène, les `vo[].at` et `sfx[].at` en secondes depuis le début du film. Ensuite, relancer `npm run audio` si la voix ou les SFX ont bougé.
- **Changer une couleur** : `src/theme.ts`.
- **Changer une scène** : son dossier `src/scenes/SceneXX_*`. Les autres scènes ne sont pas touchées. Chaque scène se prévisualise seule (`S03-H`, `S03-V`…).
- **Remplacer la musique** par une musique sous licence : utiliser les stems de `exports/audio_stems/` (voix seule, SFX seuls), ou remplacer la fonction `music()` de `build_audio.py` par le chargement d'un fichier.

## Spécifications de sortie

| Livrable | Fichier | Format |
|---|---|---|
| Film principal 60 s (16:9) | `exports/master/GRAPHIA2026_Film_60s_1920x1080.mp4` | 1920×1080 |
| Film principal 60 s (9:16) | `exports/master/GRAPHIA2026_Film_60s_1080x1920.mp4` | 1080×1920 |
| YouTube / présentation | `exports/youtube/…_60s_1920x1080.mp4` | 1920×1080 |
| TikTok | `exports/tiktok/…_60s_1080x1920.mp4` (+ 30 s) | 1080×1920 |
| Instagram Reels | `exports/instagram/…_60s_1080x1920.mp4` (+ 30 s) | 1080×1920 |
| Statut WhatsApp | `exports/whatsapp/…_30s_1080x1920.mp4` | 1080×1920, fichier allégé |
| Version courte 30 s | `exports/short/…_30s_1920x1080.mp4` et `…_1080x1920.mp4` | |

Tous les fichiers : H.264 (yuv420p), 30 i/s, AAC 48 kHz stéréo, −14 LUFS intégré, faststart.

**Note honnête** : TikTok, Reels et le 9:16 du master sont **le même montage vertical**. Les zones de sécurité ont été pensées pour couvrir les trois interfaces à la fois, donc un montage par plateforme n'apportait rien. Les fichiers sont dupliqués par dossier pour la commodité ; git ne les stocke qu'une fois.

## Contrôle qualité effectué

- Rendu image fixe de chaque scène dans les 2 formats, à plusieurs instants, avant tout rendu complet : débordements, chevauchements et zones de sécurité vérifiés.
- Rendus complets → planches contact (1 image / seconde) → relecture.
- Mesure sonore : −14 LUFS intégré, crête vraie ≤ −1,5 dBTP ; voix ≈ 8 dB au-dessus de la musique (ducking automatique).
- `ffprobe` sur chaque livrable : codec, résolution, fréquence d'images, fréquence d'échantillonnage, durée.

## Limites connues

- **Logo raster** (569 px) : net jusqu'à ×1,35, ce qui est respecté. Pour la 4K ou la TV, fournir le SVG.
- **Calage voix ↔ texte** : réglé par détection de silences, pas par une transcription au mot près (quota ElevenLabs épuisé pendant la production). Une écoute humaine est recommandée ; les corrections se font en une ligne dans `timeline.json`.
- **Pas de photos réelles de participants** : le site n'en contient pas. Plutôt qu'inventer des personnes (images générées présentées comme réelles), la scène 06 utilise des personnages géométriques. Dès que des photos des éditions ou des ateliers existent, elles peuvent remplacer les vignettes de `Scene06_Transformation`.
