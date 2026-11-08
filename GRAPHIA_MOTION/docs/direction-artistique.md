# Direction artistique — Film GRAPHIA 2026

## Principe

Le film ne crée pas une « peau publicitaire » nouvelle : il **prolonge l'identité du site officiel**
(graphia-2026.vercel.app). Tous les tokens viennent du code source du site (`graphia/src/app/globals.css`, bloc `@theme`).

Fil narratif visuel : **de la nuit vers la lumière** — « Un nouveau chapitre s'ouvre » (titre du site).
Le film commence dans le noir (le monde change), s'ouvre sur le vert et le papier blanc de la marque,
replonge dans la nuit le temps de la séquence IA (le futur), puis termine en pleine lumière sur le logo.

## Couleurs (reprises à l'identique)

| Token | Valeur | Origine | Usage dans le film |
|---|---|---|---|
| brand | `#078D43` | `--color-brand` | vert principal, iris, rideaux, bouton CANDIDATER |
| brand-dark | `#056A32` | `--color-brand-dark` | dégradés des rideaux et des cartes |
| brand-50 | `#E8F5EE` | `--color-brand-50` | halos doux, fonds clairs |
| ink | `#080808` | `--color-ink` | fonds de nuit (S01, S05, début S07), texte |
| sun | `#F5E500` | `--color-sun` | accents (« CHANGE. », « CRÉEZ. », %) |
| sun (logo) | `#FBEA04` | pavé « IA » du logo | étiquette « 2026 », barres |
| paper | `#FFFFFF` | `--color-paper` | fonds clairs (S02, S04, S06, S07) |
| mist | `#F5F5F5` | `--color-mist` | pastilles, adresse du site |
| brand-deep | `#03381B` | **extension** : vert brand-dark assombri | halo de nuit uniquement (le site n'a pas de mode sombre) |

Règle 60-30-10 : ~60 % fonds (noir ou papier), ~30 % vert, ~10 % jaune.

## Typographie

- **Poppins** (police unique du site, licence OFL, fichiers `@fontsource/poppins` identiques à ceux du site).
- Titres : 800–900, capitales, interlettrage −0,02 à −0,04 em (comme les chiffres « 100 % » du motion « Parcours IA » du site).
- Sur-titres : 600–700, capitales, interlettrage +0,16 à +0,24 em, en vert ou jaune (comme « GRAPHIA EN CHIFFRES »).
- Corps : 500–600.

## Logo

- Fichier officiel `public/logos/logo-graphia.png` (569 × 175, transparent). Ratio verrouillé (`LOGO_RATIO`), jamais déformé.
- Les lettres « RAPH » sont noires : le logo n'apparaît **que sur fond clair**. C'est la règle du composant `Logo light` du site (pavé blanc sur fond sombre).
- La source fait 569 px de large. Elle est affichée au maximum à 760 px (×1,34) pour rester nette. **Pour une diffusion TV ou 4K, demander le logo vectoriel (SVG/AI).**

## Images officielles utilisées

- `visuel-graphia.webp` (bannière d'accueil du site : main, barre d'outils, logos d'outils, minaret de la Grande Mosquée de Touba).
  Le film utilise une version **recadrée** (`visuel-graphia-crop.webp`) qui retire le logo (déjà animé à part)
  et le bouton « BIENTÔT ». Ce bouton contredirait l'appel « Candidatez maintenant ».
- `affiche-graphia-2026.webp` : référence de composition (le bandeau vert « 50 / 5 / 1 » a inspiré la scène 03). Elle n'est pas montrée telle quelle.

## Grammaire de mouvement

Les courbes d'accélération sont celles du CSS du site (`src/theme.ts → EASE`) :
`rise` (0.2, 0.7, 0.2, 1), `out` (0.16, 1, 0.3, 1), `mask` (0.7, 0, 0.2, 1), `back` (0.34, 1.56, 0.64, 1).

Motifs récurrents :
1. **Anneau du « g »** du logo : transition signature (iris S01→S02, retour en blanc S06→S07), filigrane S03.
2. **Rideau en lames** (`PanelWipe`), même effet que la révélation `mask` du site.
3. **Outils de création** : tracé à la plume, boîte de sélection à poignées, curseur, calques. Ils évoquent les logiciels sans en copier aucun.
4. **Parcours à nœuds** (S06) : même langage que l'animation « Parcours IA » du site.
5. **50 points = 50 places** : grille de la S03, rappelée en S07.

Interdits respectés :
- pas d'effet de lueur répété partout ;
- le glitch n'apparaît que 4 fois, chaque fois pendant quelques images, sur une transition ;
- un seul type d'animation par plan ;
- aucune interface de logiciel réel n'est imitée, et aucune fonction n'est attribuée à un logiciel existant ;
- les « visuels générés » de la S05 sont des compositions géométriques originales, présentées comme telles dans le code.

## Créativité africaine

- Motifs en losanges et bandes inspirés des textiles d'Afrique de l'Ouest (S05, tuiles 2 et 4).
- Minaret de Touba (visuel officiel).
- Musique afro-house / amapiano (log drum, kalimba pentatonique).
- Voix française à léger accent africain.
