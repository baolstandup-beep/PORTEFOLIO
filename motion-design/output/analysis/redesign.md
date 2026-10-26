# Version « redesign » 9:16 (vidéo principale)

Composition `TikTokVideo` (`src/compositions/TikTokRedesign.tsx`, configuration `src/config/redesign.ts`) : 1041 images, 34,7 s, 1080 × 1920, sans voix off.

**Règle** : aucune donnée n'est modifiée. Chaque texte, chiffre et logo affiché est une image extraite du PSD ou une zone découpée dans une de ces images ; rien n'est retapé, aucune police n'est substituée. Ajouts graphiques sans texte, dans le vert (#149444) et le bleu (#2c74bc) mesurés du PSD : panneau vert des contacts, barre de progression à 9 points, trait sous l'horaire, frise verticale du récapitulatif.

| Scène | Images | Contenu | Animation de chaque calque |
|---|---|---|---|
| S0 Intro logo | 0–70 | logo PAS-PAS seul, au centre (1,7× ; le logo ne fait que 286 px dans le PSD) | le logo est affiché en deux couches masquées : l'emblème central (rayon < 104 px) apparaît en zoom, l'anneau de texte se dessine en balayage circulaire en tournant de −120° à 0° ; au repos les deux couches redonnent le logo exact ; onde verte, reflet, puis le logo monte à sa place de la scène 1 |
| S1 Accroche | 70–170 | « Conférence » / « de presse », logo (venu de l'intro), nom de la plateforme | titres qui montent de leur ligne de base, reflet sur le titre ; logo en flottement lent ; nom révélé de gauche à droite ; colonne de motifs révélée de haut en bas au bord droit |
| S2 Rendez-vous | 170–335 | titre (remonte en tête), jour, heure, lieu, pupitre | logo et nom sortent vers le haut ; titre glisse et rétrécit ; la pastille date est découpée en deux pastilles arrondies (« Samedi 31 Oct 2026 », « à partir 16h30 ») qui se déroulent l'une après l'autre, avec un léger zoom de tenue et un reflet sur l'heure ; lieu glisse vers le haut ; pupitre monte depuis le bas (bords coupés gardés hors cadre) |
| S3 Programme détaillé | 335–801 | pastille PROGRAMME, 9 plans vedettes, récapitulatif | **plans vedettes** (≈ 1 s chacun) : horaire découpé de la ligne et affiché à 1,7×, intitulé + intervenant jusqu'à 1,8× (largeur ≤ 920 px), trait vert/bleu qui se trace sous l'horaire, barre de 9 points qui avance ; **logo animé** sous les plans vedettes (taille native, net) : il se construit comme dans l'intro (emblème puis anneau), pulse légèrement à chaque nouveau point, reçoit un reflet tous les 3 points et s'efface avant le récapitulatif ; **récapitulatif** : les 9 lignes en cartes sur une frise verticale verte qui se dessine, arrivée de plus en plus rapide (intervalles 10 → 3 images), puis tenue |
| S4 Contacts | 801–941 | logo, « Rejoignez-nous », adresse, site, téléphone, e-mail, réseaux | le bandeau vert est découpé en 6 zones empilées verticalement sur un panneau vert qui se déploie ; chaque zone entre à son tour |
| S5 Affiche | 941–1041 | les 19 calques à leur place d'origine | chaque calque réapparaît à sa position exacte (zoom + fondu, colonne de haut en bas) ; la dernière image est l'affiche d'origine |

Zones découpées dans le bandeau (coordonnées document) : « Rejoignez-nous » (112, 2766, 656 × 132), adresse (790, 2820, 556 × 84), site (1342, 2820, 606 × 84), téléphone (44, 2908, 652 × 84), e-mail (790, 2908, 880 × 84), réseaux (1748, 2918, 252 × 64). Lignes du programme : horaire x 655–1115, intitulé x 1120–2145.

La variante précédente (caméra sur l'affiche, mise en page d'origine) reste disponible : composition `AfficheCamera`, `npm run render:affiche`. `npm run validate` contrôle cette variante.
