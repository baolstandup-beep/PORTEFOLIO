# Mouvements de caméra

Caméra 2D définie par des clés `{frame, cx, cy, z}` dans `src/config/timeline.ts` (`CAMERA_KEYS`) :
`cx, cy` = point du document au centre de l'écran, `z` = pixels écran par pixel document.
Entre deux clés : courbe `inOut` = `bezier(0.65, 0, 0.35, 1)` (départ et arrivée à vitesse nulle) ou `linear` pour les dérives lentes ; le zoom est interpolé en logarithme (vitesse de zoom perçue constante). Les éléments sont redimensionnés par la mise en page, pas par un `scale` global : chaque image est rééchantillonnée une seule fois à sa taille finale (texte net).

**Contrainte du format** : l'affiche est presque aussi large que haute (0,77) ; pour qu'un élément large tienne en largeur, z ≤ 1080 / largeur. Titre 1494 px → z ≤ 0,72 ; liste du programme 1466 px → z ≤ 0,74 ; pastille date 1713 px → z ≤ 0,63 (d'où le panoramique de lecture à z 0,95).

| # | Images | Type | Départ (cx, cy, z) | Arrivée (cx, cy, z) | Courbe | Point focal | Justification |
|---|---|---|---|---|---|---|---|
| C1 | 0–90 | Dolly-in lent | 1232, 844, 0,600 | 1232, 844, 0,615 | linéaire | titre | donne vie à l'accroche sans distraire |
| C2 | 90–135 | Dolly-out + glissé | 1232, 844, 0,615 | 1096, 827, 0,500 | inOut | logo + plateforme | plan d'établissement, intègre l'organisateur |
| C3 | 135–225 | Dolly-in lent | 1096, 827, 0,500 | 1098, 822, 0,510 | linéaire | bloc titre | respiration pendant la voix |
| C4 | 225–263 | Plongée (travelling diagonal + zoom) | 1098, 822, 0,510 | 610, 1760, 0,980 | inOut | micro / pupitre | insert sur le sujet principal |
| C5 | 263–280 | Tenue + poussée | 610, 1760, 0,980 | 610, 1752, 1,000 | linéaire | pupitre | moment de respiration |
| C6 | 280–317 | Panoramique vertical + recadrage | 610, 1752, 1,000 | 900, 1150, 0,950 | inOut | « Samedi 31 » | suit la pastille qui se déroule |
| C7 | 317–350 | Dérive | 900, 1150, 0,950 | 935, 1150, 0,955 | linéaire | « Oct 2026 » | lecture |
| C8 | 350–390 | Panoramique horizontal de lecture | 935, 1150, 0,955 | 1530, 1150, 0,950 | inOut | « 16h30 » | synchronisé avec « à partir de 16 h 30 » |
| C9 | 390–437 | Recadrage descendant | 1530, 1150, 0,950 | 1408, 1290, 0,800 | inOut | encart lieu | synchronisé avec « au siège… » |
| C10 | 437–507 | Dolly-in lent | 1408, 1290, 0,800 | 1405, 1295, 0,815 | linéaire | lieu | tenue |
| C11 | 507–552 | Recadrage | 1405, 1295, 0,815 | 1415, 1760, 0,660 | inOut | PROGRAMME | entrée dans la liste |
| C12 | 552–807 | Panoramique vertical lent | 1415, 1760, 0,660 | 1415, 2140, 0,675 | inOut | lignes en cours d'apparition | accompagne la lecture |
| C13 | 807–837 | Arrêt | 1415, 2140, 0,675 | 1415, 2148, 0,675 | linéaire | liste | stabilisation avant le recul |
| C14 | 837–907 | Dolly-out + recentrage | 1415, 2148, 0,675 | 1158,5, 1600, 0,4661 | inOut | affiche entière | révèle la composition d'origine |
| C15 | 907–1007 | Caméra fixe | 1158,5, 1600, 0,4661 | identique | — | affiche | 3,3 s de lecture, fin stable |

**Limites du cadre** : au plan final, l'affiche occupe exactement la largeur (1080 px) et la hauteur utile y 214–1619 px (contenu visible y 301–1619), soit à l'intérieur des marges TikTok haute (180) et basse (300). Les seuls éléments au contact des bords sont ceux qui sont en bord perdu dans le PSD (colonne, bandeau, pupitre).

**Bords perdus** : le pupitre est coupé à gauche (bord de page) et en bas (sous le bandeau) dans l'affiche. Les cadrages P2 et P3 gardent ces deux bords hors champ (vérifié numériquement image par image de 130 à 507 : bord gauche ≤ −1,9 px, bas ≥ 1938 px). En P4, une amorce de ~25 px du pupitre reste visible au bord gauche.

**Recadrages volontaires** : dans les plans de détail (date img 280–390, lieu 390–507) et dans le plan programme (507–837), le cadre coupe des textes voisins (titre, début de la pastille date, nom de la plateforme). C'est voulu : l'élément visé est entier et lisible ; ces textes sont montrés entiers en P1, P2 et P5.

**Parallaxe** : `depth` sur le pupitre (0,05) et la colonne (0,06), halos de fond à −0,1. Le décalage est proportionnel à l'écart entre la caméra courante et la caméra finale : il est donc nul sur la dernière image, qui reste fidèle à l'affiche. Aucun tremblement de caméra (Q3).
