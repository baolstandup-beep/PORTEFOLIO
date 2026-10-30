# SET-VOYAGE : animation du logo (Remotion)

Animation de 10 s du logo SET-VOYAGE, en 16:9 (1920 × 1080) et 9:16 TikTok (1080 × 1920), à 30 i/s, avec une version sur fond transparent.

## Livrables (`out/`)

| Fichier | Format |
| --- | --- |
| `set-voyage-16x9-1080p.mp4` | 1920 × 1080, H.264, yuv420p, 30 i/s, 10 s |
| `set-voyage-9x16-tiktok.mp4` | 1080 × 1920, H.264, yuv420p, 30 i/s, 10 s |
| `set-voyage-16x9-alpha.webm` | 1920 × 1080, VP9 avec couche alpha |
| `set-voyage-9x16-alpha.webm` | 1080 × 1920, VP9 avec couche alpha |
| `index.html` | page de prévisualisation des quatre vidéos |

Les MP4 n'ont pas de piste audio : sur TikTok, ajoutez le son depuis l'application (bibliothèque sous licence).

## Principe : le logo n'est jamais redessiné

`scripts/extract_layers.py` découpe le JPG original (`public/assets/source/SET VOYAGE.jpg`) en calques RGBA de la même taille que le logo :

- `globe`, `dome` (arcs bleus), `plane-logo` (l'avion tel qu'il est dans le logo), `plane-blue` (même silhouette, en bleu plein, pour le vol), `set`, `voyage`, `slogan`, et `full-mask` (masque du reflet).
- Chaque pixel est démélangé en part d'encre bleue, grise et de fond blanc. Les bords restent ceux de l'original et le fond devient transparent.
- Le dôme bleu est un cercle (ajusté à moins de 0,7 px près). Il sert à séparer l'avion : dans le logo, l'avion est une réserve blanche à l'intérieur du dôme et un aplat bleu à l'extérieur.
- Empilés à la même position, les calques reconstituent le logo d'origine (écart moyen inférieur à 3/255).

Les animations ne font que déplacer, masquer ou faire apparaître ces calques. Elles n'en modifient jamais la forme, les couleurs ni le texte.

## Scénario

| Temps | Scène | Fichier |
| --- | --- | --- |
| 0 à 2 s | Halo bleu, une ligne lumineuse trace l'arc du dôme, le globe se construit en balayage | `src/Scenes/Intro.tsx` |
| 1 à 3,5 s | Les arcs bleus se remplissent en balayage | `src/Scenes/Intro.tsx` |
| 2 à 4 s | L'avion bleu entre par le bas à droite avec une traînée lumineuse, s'incline puis se pose à sa place exacte | `src/Scenes/Airplane.tsx` |
| 4 à 6 s | SET lettre par lettre (ressort et flou), puis VOYAGE en révélation avec un front lumineux | `src/Scenes/LogoReveal.tsx` |
| 6 à 8 s | Le slogan apparaît mot par mot en fondu et légère remontée, balayage lumineux sur le logo | `src/Scenes/LogoReveal.tsx`, `src/Scenes/Final.tsx` |
| 8 à 10 s | Légère poussée, second reflet, logo stable | `src/Scenes/Final.tsx`, `src/LogoAnimation.tsx` |

Tous les temps sont réglés dans l'objet `T` de `src/layout.ts`, en images (30 = 1 s).

## Structure

```
public/assets/logo.png           logo original (PNG du JPG fourni)
public/assets/source/            fichier source fourni
public/assets/layers/            calques générés par extract_layers.py
scripts/extract_layers.py        découpe du logo en calques + src/layout.json
scripts/render.mjs               rendu des vidéos et des images clés
src/Root.tsx                     compositions : 16x9, 9x16 et leurs versions -Alpha
src/Composition.tsx              fond, échelle et cadrage selon le format
src/LogoAnimation.tsx            repère du logo, inclinaison 3D, ombre, poussée finale
src/Scenes/                      Intro, Airplane, LogoReveal, Final
src/layout.ts                    couleurs, minutage, courbes
```

## Lancer et modifier

Prérequis : Node 20 ou plus, Python 3 avec Pillow et NumPy (seulement pour régénérer les calques).

```bash
npm install
```

Ouvrir le studio Remotion (prévisualisation interactive, timeline) :

```bash
npm run studio
```

Rendre les quatre vidéos dans `out/` (environ 8 minutes) :

```bash
npm run render
```

Rendre une seule composition :

```bash
node scripts/render.mjs --only=SetVoyage-9x16
```

Ajouter un ProRes 4444 avec alpha pour le montage (fichier lourd, non versionné) :

```bash
node scripts/render.mjs --only=SetVoyage-16x9-Alpha --prores
```

Rendre des images clés pour vérifier une modification :

```bash
npm run stills
```

Régénérer les calques après avoir remplacé le logo source :

```bash
npm run layers
```

Pour utiliser un autre navigateur que le Chromium installé, définissez `REMOTION_BROWSER` avec le chemin de l'exécutable.

## Limites connues

- La source est un JPG de 1370 px de large. En 16:9, le logo est affiché à environ 1,4 fois sa taille, et l'avion à presque 2 fois au début de son vol : les bords sont un peu moins nets qu'avec un vecteur. Avec le fichier vectoriel (AI, SVG ou PDF), relancez `npm run layers` sur un export PNG à 3000 px pour un rendu net.
- En 9:16, le logo occupe 88 % de la largeur et se place à 45 % de la hauteur, hors des zones masquées par l'interface TikTok.
