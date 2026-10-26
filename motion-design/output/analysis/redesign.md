# Version « redesign » 9:16 (vidéo principale)

Composition `TikTokVideo` (`src/compositions/TikTokRedesign.tsx`, configuration `src/config/redesign.ts`) : 990 images, 33,0 s, 1080 × 1920, sans voix off.

**Règle** : aucune donnée n'est modifiée. Chaque texte, chiffre et logo affiché est une image extraite du PSD ou une zone découpée dans une de ces images ; rien n'est retapé, aucune police n'est substituée. Seuls ajouts graphiques : le panneau vert des contacts et le liseré vert des cartes, dans le vert mesuré du PSD (#149444).

| Scène | Images | Contenu | Animation de chaque calque |
|---|---|---|---|
| S1 Accroche | 0–120 | « Conférence » / « de presse », logo, nom de la plateforme | titres qui montent de leur ligne de base, reflet sur le titre ; logo en zoom + fondu puis flottement lent ; nom révélé de gauche à droite ; colonne de motifs révélée de haut en bas au bord droit |
| S2 Rendez-vous | 120–300 | titre (remonte en tête), date, lieu, pupitre | logo et nom sortent vers le haut ; titre glisse et rétrécit ; pastille date déroulée depuis sa flèche + reflet ; lieu glisse vers le haut ; pupitre monte depuis le bas (bords coupés gardés hors cadre) |
| S3 Programme détaillé | 300–720 | pastille PROGRAMME + 9 cartes | chaque ligne du PSD est découpée en horaire et intitulé (+ intervenant), recomposés en carte verticale à 0,9 (texte ≈ 1,9× plus grand que sur l'affiche plein écran) ; horaire puis intitulé révélés de gauche à droite, liseré vert qui se déploie ; la liste défile et s'arrête toujours sur le haut d'une carte |
| S4 Contacts | 720–870 | logo, « Rejoignez-nous », adresse, site, téléphone, e-mail, réseaux | le bandeau vert est découpé en 6 zones empilées verticalement sur un panneau vert qui se déploie ; chaque zone entre à son tour |
| S5 Affiche | 870–990 | les 19 calques à leur place d'origine | chaque calque réapparaît à sa position exacte (zoom + fondu, colonne de haut en bas) ; la dernière image est l'affiche d'origine |

Zones découpées dans le bandeau (coordonnées document) : « Rejoignez-nous » (112, 2766, 656 × 132), adresse (790, 2820, 556 × 84), site (1342, 2820, 606 × 84), téléphone (44, 2908, 652 × 84), e-mail (790, 2908, 880 × 84), réseaux (1748, 2918, 252 × 64). Lignes du programme : horaire x 655–1115, intitulé x 1120–2145.

La variante précédente (caméra sur l'affiche, mise en page d'origine) reste disponible : composition `AfficheCamera`, `npm run render:affiche`. `npm run validate` contrôle cette variante.
