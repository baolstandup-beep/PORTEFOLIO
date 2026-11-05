# Publicité POROKHANE SOOW — motion design (Remotion)

Vidéo verticale 9:16 · 1080×1920 · 30 fps · 20 s · MP4 H.264 + AAC
(TikTok, Instagram Reels, Facebook Reels, WhatsApp Status).

## Lancer

```bash
npm install
npm run studio        # prévisualisation interactive (http://localhost:3000)
npm run render        # export final → out/porokhane-soow-ad.mp4
```

Régénérer la musique et les effets sonores (Python 3 + numpy + scipy) :

```bash
npm run audio
```

> Si Remotion n'arrive pas à télécharger son navigateur, ajoutez
> `--browser-executable=/chemin/vers/chrome` à la commande de rendu.

## Scénario

| Temps | Scène | Fichier |
|---|---|---|
| 0–3 s | Intro : particules, gouttes, logo + « LE GOÛT AUTHENTIQUE » | `src/scenes/Intro.tsx` |
| 3–7 s | Citron Ananas : arrivée ressort, éclaboussure, citrons/ananas | `src/scenes/CitronAnanas.tsx` |
| 7–11 s | Bissap Blanc Ginger : entrée en arc de cercle, vortex, orbite 3D gingembre/bissap blanc | `src/scenes/BissapBlancGinger.tsx` |
| 11–15 s | Bissap : lumière rouge/violette, brume, pétales d'hibiscus | `src/scenes/Bissap.tsx` |
| 15–20 s | Packshot : 3 bouteilles sur podium, reflets, logo + « LE GOÛT QUI VOUS RASSEMBLE » | `src/scenes/Packshot.tsx` |

Les timings sont centralisés dans `src/theme.ts` (`SCENES`).

## Structure

```
public/
  bottles/   détourages PNG des 3 photos originales (pixels non retouchés)
  logo.png   logo extrait de l'étiquette originale
  audio/     music.wav (afrobeat 120 BPM) + sfx/*.wav
  fonts/     Anton + Montserrat (embarquées, rendu hors ligne)
raw/         les 3 photos sources
scripts/generate-audio.py   synthèse de la musique et des SFX
src/
  PorokhaneAd.tsx   montage : séquences, transitions, audio
  components/       Bottle, Particles, Droplets, Splash, FloatingField,
                    Fruits (SVG), Text, Logo, Transitions, useSceneCamera
  scenes/           une scène par fichier
```

## Limites connues (à lire avant diffusion)

- **Musique** : c'est une piste de synthèse libre de droits, propre mais de niveau maquette.
  Pour une campagne sponsorisée, remplacez `public/audio/music.wav` par une piste afrobeat
  sous licence (même nom de fichier, 20 s) — aucun code à modifier.
- **Photos** : les bouteilles proviennent de photos prises en boutique. Le haut transparent des
  bouteilles laisse voir un peu du rayon d'origine, et le bas est légèrement coupé sur 2 photos.
  Des photos studio sur fond uni (bouteilles entières) amélioreraient nettement le rendu.
- **Logo** : extrait d'une photo (~160 px de haut à l'origine, agrandi). Un fichier vectoriel
  (SVG/AI/PDF) du logo le rendrait parfaitement net.
