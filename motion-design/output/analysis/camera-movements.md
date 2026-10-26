# Mouvements de caméra

Caméra 2D définie par des clés `{frame, cx, cy, z}` dans `src/config/timeline.ts` (`CAMERA_KEYS`) :
`cx, cy` = point du document au centre de l'écran, `z` = pixels écran par pixel document.
Entre deux clés : courbe `inOut` = `bezier(0.65, 0, 0.35, 1)` (départ et arrivée à vitesse nulle) ou `linear` pour les dérives lentes ; le zoom est interpolé en logarithme (vitesse de zoom perçue constante). Les éléments sont redimensionnés par la mise en page, pas par un `scale` global : chaque image est rééchantillonnée une seule fois à sa taille finale (texte net).

**Contrainte du format** : l'affiche est presque aussi large que haute (0,77) ; pour qu'un élément large tienne en largeur, z ≤ 1080 / largeur. Titre 1494 px → z ≤ 0,72 ; liste du programme 1466 px → z ≤ 0,74 ; pastille date 1713 px → z ≤ 0,63 (d'où le plan large sur la date et le lieu).

| # | Images | Type | Départ (cx, cy, z) | Arrivée (cx, cy, z) | Courbe | Point focal | Justification |
|---|---|---|---|---|---|---|---|
| C1 | 0–90 | Dolly-in lent | 1232, 844, 0,600 | 1232, 844, 0,615 | linéaire | titre | donne vie à l'accroche sans distraire |
| C2 | 90–135 | Dolly-out + glissé | 1232, 844, 0,615 | 1104, 827, 0,500 | inOut | logo + plateforme | plan d'établissement, intègre l'organisateur |
| C3 | 135–225 | Dolly-in lent | 1104, 827, 0,500 | 1104, 822, 0,510 | linéaire | bloc titre | respiration |
| C4 | 225–263 | Plongée (travelling diagonal + zoom) | 1104, 822, 0,510 | 580, 1880, 1,150 | inOut | micro / pupitre | insert sur le sujet principal, aucun texte dans le champ |
| C5 | 263–280 | Tenue + poussée | 580, 1880, 1,150 | 580, 1874, 1,170 | linéaire | pupitre | respiration |
| C6 | 280–317 | Recul | 580, 1874, 1,170 | 1098, 1000, 0,550 | inOut | date + lieu | la pastille date se déroule pendant le recul |
| C7 | 317–507 | Dolly-in très lent | 1098, 1000, 0,550 | 1098, 992, 0,558 | linéaire | date, puis lieu | plan large : logo, plateforme, titre, date et lieu entiers |
| C8 | 507–552 | Recadrage | 1098, 992, 0,558 | 1400, 2530, 0,725 | inOut | PROGRAMME | entrée dans la liste |
| C9 | 552–837 | Tenue | 1400, 2530, 0,725 | 1400, 2533, 0,725 | linéaire | lignes en cours d'apparition | liste sur toute sa largeur ; date juste hors champ en haut, lieu entier |
| C10 | 837–907 | Dolly-out + recentrage | 1415, 2148, 0,675 | 1158,5, 1600, 0,4661 | inOut | affiche entière | révèle la composition d'origine |
| C11 | 907–1007 | Caméra fixe | 1158,5, 1600, 0,4661 | identique | — | affiche | 3,3 s de lecture, fin stable |

**Limites du cadre** : au plan final, l'affiche occupe exactement la largeur (1080 px) et la hauteur utile y 214–1619 px (contenu visible y 301–1619), soit à l'intérieur des marges TikTok haute (180) et basse (300). Les seuls éléments au contact des bords sont ceux qui sont en bord perdu dans le PSD (colonne, bandeau, pupitre).

**Bords perdus** : le pupitre est coupé à gauche (bord de page) et en bas (sous le bandeau) dans l'affiche. Les cadrages P2 et P3 gardent ces deux bords hors champ (vérifié par `scripts/check-framing.ts`). En P4, le pupitre est entièrement hors champ.

**Aucun texte coupé sur les plans tenus** (demande du client) : `scripts/check-framing.ts` vérifie chaque image où la caméra est quasi immobile ; il est lancé par `npm run validate`. Pendant les mouvements, des textes traversent forcément le bord du cadre. Contrepartie : le plan programme (z 0,725, imposé par la largeur de la liste) laisse le bas de l'écran vide, et l'encart lieu est collé au haut du cadre, dans la zone d'interface TikTok.

**Parallaxe** : `depth` sur le pupitre (0,1, pour le sortir du champ pendant le programme) et la colonne (0,06), halos de fond à −0,1. Le décalage est proportionnel à l'écart entre la caméra courante et la caméra finale : il est donc nul sur la dernière image, qui reste fidèle à l'affiche. Aucun tremblement de caméra (Q3).
