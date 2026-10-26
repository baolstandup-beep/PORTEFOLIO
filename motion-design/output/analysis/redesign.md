# Version « redesign » 9:16 (vidéo principale)

Composition `TikTokVideo` (`src/compositions/TikTokRedesign.tsx`, configuration `src/config/redesign.ts`) : 1034 images, 34,5 s, 1080 × 1920, sans voix off.

**Règle** : aucune donnée n'est modifiée. Chaque texte, chiffre et logo affiché est une image extraite du PSD ou une zone découpée dans une de ces images ; rien n'est retapé, aucune police n'est substituée. Ajouts graphiques sans texte, dans le vert (#149444) et le bleu (#2c74bc) mesurés du PSD : panneau vert des contacts, barre de progression à 9 points, trait sous l'horaire, frise verticale du récapitulatif.

| Scène | Images | Contenu | Animation de chaque calque |
|---|---|---|---|
| S1 Accroche | 0–120 | « Conférence » / « de presse », logo, nom de la plateforme | titres qui montent de leur ligne de base, reflet sur le titre ; logo en zoom + fondu puis flottement lent ; nom révélé de gauche à droite ; colonne de motifs révélée de haut en bas au bord droit |
| S2 Rendez-vous | 120–300 | titre (remonte en tête), jour, heure, lieu, pupitre | logo et nom sortent vers le haut ; titre glisse et rétrécit ; la pastille date est découpée en deux pastilles arrondies (« Samedi 31 Oct 2026 », « à partir 16h30 ») qui se déroulent l'une après l'autre, avec un léger zoom de tenue et un reflet sur l'heure ; lieu glisse vers le haut ; pupitre monte depuis le bas (bords coupés gardés hors cadre) |
| S3 Programme détaillé | 300–784 | pastille PROGRAMME, 9 plans vedettes, récapitulatif | **plans vedettes** (1,1 s chacun) : horaire découpé de la ligne et affiché à 1,7×, intitulé + intervenant jusqu'à 1,8× (largeur ≤ 920 px), trait vert/bleu qui se trace sous l'horaire, barre de 9 points qui avance ; **récapitulatif** : les 9 lignes en cartes sur une frise verticale verte qui se dessine, arrivée de plus en plus rapide (intervalles 10 → 3 images), puis tenue |
| S4 Contacts | 784–934 | logo, « Rejoignez-nous », adresse, site, téléphone, e-mail, réseaux | le bandeau vert est découpé en 6 zones empilées verticalement sur un panneau vert qui se déploie ; chaque zone entre à son tour |
| S5 Affiche | 934–1034 | les 19 calques à leur place d'origine | chaque calque réapparaît à sa position exacte (zoom + fondu, colonne de haut en bas) ; la dernière image est l'affiche d'origine |

Zones découpées dans le bandeau (coordonnées document) : « Rejoignez-nous » (112, 2766, 656 × 132), adresse (790, 2820, 556 × 84), site (1342, 2820, 606 × 84), téléphone (44, 2908, 652 × 84), e-mail (790, 2908, 880 × 84), réseaux (1748, 2918, 252 × 64). Lignes du programme : horaire x 655–1115, intitulé x 1120–2145.

La variante précédente (caméra sur l'affiche, mise en page d'origine) reste disponible : composition `AfficheCamera`, `npm run render:affiche`. `npm run validate` contrôle cette variante.
