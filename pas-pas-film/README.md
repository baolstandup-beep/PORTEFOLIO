# PAS-PAS — film de lancement (conférence de presse)

Spot motion design de 30 s construit avec React, TypeScript et Remotion 4, à partir de la bouteille
originale fournie (`source/jus.pdf`). 1920 × 1080, 25 i/s, H.264, audio stéréo original.

| Livrable | Fichier |
| --- | --- |
| Vidéo principale Full HD avec musique | `out/pas-pas-conference-presse.mp4` |
| Version sans audio (écrans de fond) | `out/pas-pas-conference-presse-sans-audio.mp4` |
| Version 4K (3840 × 2160) | `out/pas-pas-conference-presse-4k.mp4` — trop lourde pour le dépôt, à régénérer avec `npm run render:4k` |

## Ce qu'il faut savoir sur la source

- Le fichier reçu est un **PDF Photoshop aplati** (PDF/X-1, une seule image CMYK de 2172 × 3362), pas un PSD à calques.
  La bouteille y est photographiée inclinée de 17° sur un fond gris, avec son ombre.
- La bouteille est **transparente, liquide incolore**. L'étiquette ne mentionne ni saveur ni ingrédient :
  le film n'en montre aucun (pas de fruits, pas de liquide coloré).
- Le fichier contient un **reste de retouche** : un aplat blanc rectangulaire qui dépasse sous le culot.
  Il est retiré du détourage (zone `SEAM` dans `scripts/extract_bottle.py`) ; la bouteille elle-même n'est pas retouchée.
- Une copie intacte de la source est conservée dans `source/jus.pdf` (SHA-256 `5eef836c…6460e`).

### Extraction de la bouteille (`scripts/extract_bottle.py`)

1. Rendu sRGB fidèle de la page par poppler (`pdftoppm`), qui gère correctement le CMYK Adobe.
2. Silhouette par contours et saturation, puis plaque de fond reconstituée autour du produit.
3. **Démixage alpha** du plastique : pour chaque pixel, l'alpha minimal qui explique sa couleur devant le fond.
   Les reflets et réfractions d'origine sont conservés ; le gris du décor disparaît.
4. **Étiquette et bouchon forcés opaques avec leurs pixels d'origine** (le fond de l'étiquette est presque du même gris
   que le décor, un démixage seul l'aurait rendue translucide).
5. **Rotation rigide** de 17° pour poser la bouteille droite sur le socle. Aucune déformation, aucun étirement.

Sorties : `public/assets/bottle.png` (produit), `bottle-silhouette.png` (ombre chinoise de la scène 1),
`bottle-rim.png` (liseré de contre-jour), `src/bottle-meta.json` (dimensions).

## Installation

Prérequis : Node.js ≥ 20. Pour régénérer les ressources (facultatif, elles sont fournies) : Python 3 avec
`numpy`, `pillow`, `scipy`, et `poppler-utils`.

```bash
cd pas-pas-film
```

```bash
npm install
```

## Prévisualiser

```bash
npm run studio
```

Ouvre Remotion Studio : timeline, scènes nommées, lecture avec le son.

## Rendre

```bash
npm run render
```

```bash
npm run render:silent
```

```bash
npm run render:4k
```

```bash
npm run render:preview
```

`render` : Full HD avec audio. `render:silent` : sans piste audio. `render:4k` : 3840 × 2160 (≈ 4 fois plus long).
`render:preview` : demi-résolution, rapide, pour vérifier une modification.

**Navigateur de rendu.** Remotion télécharge son propre Chrome headless au premier rendu. Si le réseau le bloque,
indiquez un Chromium ou Chrome déjà installé :

```bash
REMOTION_BROWSER=/chemin/vers/chrome-headless-shell npm run render
```

### Régénérer les ressources

```bash
npm run assets
```

Ré-extrait la bouteille depuis `source/jus.pdf` et recompose la musique (`public/assets/score.wav`).

## Modifier sans toucher aux scènes

| Quoi | Où |
| --- | --- |
| Textes (titre, accroche, mention finale), affichage de l'accroche | `src/config.ts` → `text` |
| Date et lieu de l'événement (vides tant qu'ils ne sont pas validés) | `src/config.ts` → `text.eventDate`, `text.eventPlace` |
| Couleurs de fond et d'accent | `src/config.ts` → `colors` |
| Intensité des lumières (faisceau, halo, liseré, reflets) | `src/config.ts` → `lights` |
| Vitesse / ampleur des mouvements | `src/config.ts` → `motion` |
| Particules, gouttelettes, éclats, reflet | `src/config.ts` → `effects` |
| Musique activée ou non, volume | `src/config.ts` → `audio` |
| Chemins des ressources | `src/config.ts` → `assets` |
| Résolution | `src/config.ts` → `resolution`, `resolution4k` |
| Durée, cadence, découpage des scènes, repères musicaux | `src/timeline.json` (lu aussi par le générateur de musique) |
| Mouvements de caméra et de lumière | `src/camera.ts` (une piste unique, interpolée sans à-coups) |

L'accroche « Une nouvelle expérience de fraîcheur » et la ligne « Le début d'une nouvelle aventure. » sont des
**propositions créatives**, pas des messages officiels : à valider, ou à désactiver (`showTagline`, `showEndLine`).
Après une modification de `timeline.json`, relancer `node scripts/generate-score.mjs` pour recaler la musique.

## Architecture

```
src/
  index.ts, Root.tsx        compositions PasPasFilm (1080p) et PasPasFilm4K
  PasPasFilm.tsx            enchaînement des 5 scènes, audio, attente des polices et des masques
  config.ts, timeline.json  réglages et minutage
  camera.ts                 piste caméra / lumière (continuité entre scènes)
  layout.ts                 plateau : position du produit et du socle
  scenes/Opening.tsx        1 · mystère (0–4 s)
  scenes/Reveal.tsx         2 · révélation (4–9 s)
  scenes/Hero.tsx           3 · mise en valeur (9–16 s)
  scenes/BrandReveal.tsx    4 · marque (16–23 s)
  scenes/EndCard.tsx        5 · tableau final (23–30 s)
  components/ProductBottle  produit, révélation, reflets spéculaires, liseré, reflet sur le socle
  components/LightEffects   fond, halo, faisceau volumétrique, brume, vignettage, éclats
  components/Particles      particules déterministes sur 3 profondeurs
  components/Droplets       condensation, uniquement hors étiquette
  components/Podium, Stage, Typography
scripts/
  extract_bottle.py         extraction de la bouteille
  generate-score.mjs        musique originale synthétisée (aucun échantillon, aucun droit tiers)
```

Chaque image est une fonction pure de son numéro (`useCurrentFrame`) : aucune minuterie, aucun hasard au rendu
(générateurs pseudo-aléatoires à graine fixe).

## Contrôle qualité réalisé

- `npm run typecheck` : aucune erreur.
- Composition chargée et rendue par Remotion 4.0.539 (Chromium headless local).
- Planches contact de 27 images couvrant les 5 scènes et leurs raccords, puis images Full HD inspectées
  (dont la dernière image et un gros plan sur l'étiquette).
- Bouteille jamais coupée par le cadre (bouchon compris au plus serré), jamais déformée, étiquette lisible.
- Nom de marque placé au-dessus du produit : derrière la bouteille, le trait d'union de « PAS-PAS » était masqué.
- Fichier final : H.264 High, 1920 × 1080, 25 i/s, **750 images**, 30,00 s, yuv420p BT.709 (plage TV).
- Audio : AAC 48 kHz stéréo, **−15,4 LUFS** intégré, crête −1 dBFS. Accents vérifiés dans le MP4 :
  +17 dB à 4,00 s (dévoilement) et à 23,00 s (finale), silence en fin de film.
- Tableau final immobile de l'image 644 à 749 : **4,2 s** de lecture et de prise de vue.

## Limites connues

- **Pas de vraie 3D.** Une seule vue du produit existe : la rotation est simulée par la caméra (parallaxe, travelling)
  et par le déplacement des reflets, sans jamais tourner l'image du produit.
- **Étiquette partiellement visible** : le texte de droite (« PLATEFOR… », « Yéeg leen… ») est coupé par la courbure,
  exactement comme dans la photo d'origine. Rien n'a été complété ni réécrit.
- **Coin inférieur gauche du culot** : quelques pixels rognés lors du retrait de l'aplat blanc, visibles seulement
  en gros plan sur le socle.
- **Musique synthétisée** par programme : propre et libre de droits, mais moins riche qu'une composition produite
  en studio. Remplacer `public/assets/score.wav` par une piste sous licence suffit (même nom, même durée).
- Aucune date, aucun lieu, aucun slogan officiel n'a été ajouté : ils attendent votre validation.
