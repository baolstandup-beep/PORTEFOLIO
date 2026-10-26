# Rapport d'analyse du PSD

Fichier analysé : `Sans titre - 4.psd` (le brief annonçait `Sans titre55555 - 4.psd` ; le seul PSD fourni porte ce nom-là, c'est lui qui a été utilisé).
Outils : `psd-tools` 1.x, Pillow, SciPy. Scripts : `scripts/inspect-psd.py` (structure brute → `psd-structure.json`, `preview.png`) et `scripts/extract-assets.py` (découpe).

## 1. Caractéristiques techniques

| Propriété | Valeur |
|---|---|
| Dimensions | 2317 × 3014 px (portrait, ratio 0,769) |
| Résolution | 150 ppi |
| Mode / profondeur | RVB, 8 bits par couche |
| Profil colorimétrique | sRGB IEC61966-2.1 (incorporé) |
| Nombre de calques | **1** calque pixel, « Sans titre - 4 », boîte (9, 186) → (2317, 3014) |
| Groupes | aucun |
| Calques masqués | aucun |
| Textes modifiables | **aucun** (tous les textes sont pixellisés) |
| Objets dynamiques | aucun |
| Masques de fusion / effets de calque | aucun |
| Couches enregistrées | « Transparency » seulement |
| Transparence | 65,8 % de pixels totalement transparents, 21,6 % opaques, 12,6 % partiels (anticrénelage, ombres) |

**Limitation principale : le document est aplati.** Il n'existe ni calque séparé, ni texte éditable, ni objet dynamique. En revanche, ce calque unique n'a **pas de fond** : l'affiche est posée sur de la transparence (le blanc vu à l'écran est l'absence de pixel). Chaque bloc graphique forme donc une île de pixels séparée des autres, ce qui permet une découpe propre sans détourage manuel.

## 2. Contenu réellement présent (relevé visuel)

- **Logo** circulaire « PAS-PAS » (pirogue verte, vagues, texte en couronne « Plateforme d'acteurs sénégalais / pour le progrès et l'ancrage souverain »), en haut à gauche.
- **Nom de la plateforme** en vert : « PLATEFORME D'ACTEURS SÉNÉGALAIS / POUR LE PROGRÈS ET L'ANCRAGE SOUVERAIN ».
- **Titre** : « Conférence » (vert, italique gras) / « de presse » (bleu).
- **Pastille date** bleue, précédée d'une flèche verte : « Samedi **31** Oct 2026 · à partir **16h30** ».
- **Encart lieu** : « SIÈGE DE PAS-PAS (Mbacké, route de l'Héliport de Touba, près de la Route Iba GUEYE) ».
- **Pastille « PROGRAMME »** verte et **9 lignes** horaire + intitulé (+ intervenant pour 6 d'entre elles) :
  16 h 00–16 h 25 Accueil et installation · 16 h 30–16 h 35 Lancement protocolaire · 16 h 35–16 h 48 Ouverture et présentation institutionnelle (Secrétaire administratif) · 16 h 50–17 h 05 Doctrine et vision politique (Chargé de communication) · 17 h 07–17 h 18 Le progrès à travers les réalités vécues (Chargée des Femmes) · 17 h 20–17 h 40 Déclaration politique officielle (Coordonnateur) · 17 h 42–18 h 12 Questions et réponses avec la presse · 18 h 15–18 h 18 Mot de clôture (Coordonnateur) · 18 h 20–18 h 30 Photo collective et fin de rencontre.
- **Illustration principale** : pupitre vert/bleu/blanc avec micro, à gauche (sujet principal ; aucun personnage).
- **Colonne décorative** de cercles verts et bleus en bord droit (bord perdu).
- **Bandeau vert de contact** : « Rejoignez-nous » · Mbacké Khéwar · www.pas-pas.org · 00221 78 832 59 59 · paspas042026@gmail.com · 4 pictogrammes de réseaux sociaux (bord perdu à gauche et en bas).

Couleurs mesurées : vert `#149444`, bleu `#2c74bc`, fond blanc.
Particularités conservées telles quelles : double espace dans « Chargé  de communication », « Oct » abrégé.

## 3. Découpe en éléments animables

Méthode : composantes connexes de l'alpha (seuil 8/255, dilatation 12 px pour grouper les lettres d'un bloc), affectées à des éléments nommés par zones mesurées ; les pixels très faibles (ombres) sont rattachés à l'île la plus proche. Deux lignes de coupe horizontales passent dans des bandes entièrement vides (titre y = 764, date/lieu y = 1207).

19 éléments PNG transparents, dans `public/assets/<catégorie>/`, positions dans `src/config/assets.generated.json` :

| Élément | Catégorie | x, y | L × H |
|---|---|---|---|
| colonne-motifs | decorative | 2154, 186 | 163 × 2828 |
| pupitre | illustrations | 9, 1146 | 666 × 1657 |
| logo-paspas | logos | 138, 241 | 286 × 288 |
| bandeau-plateforme | typography | 724, 276 | 1111 × 114 |
| titre-conference | typography | 485, 490 | 1494 × 265 |
| titre-de-presse | typography | 918, 773 | 992 × 240 |
| info-date | typography | 345, 1039 | 1713 × 164 |
| info-lieu | typography | 800, 1211 | 1216 × 135 |
| programme-titre | typography | 943, 1395 | 925 × 170 |
| programme-ligne-01 … 09 | typography | 671, 1589 … 2678 | 848–1454 × 41–102 |
| bandeau-contacts | overlays | 9, 2766 | 2046 × 239 |

**Contrôle d'intégrité** : la recomposition des 19 éléments est comparée pixel à pixel (en prémultiplié) au composite d'origine : **écart maximal 0**, 0 pixel orphelin, aucun chevauchement (`verification-recomposition.png`). Planche : `planche-calques.png`.

### Ce qui n'a pas pu être séparé

- **Le pied du pupitre sous la pastille « Rejoignez-nous »** (bande y 2766–2803, x 100–566) n'existe pas dans le fichier : la pastille le recouvrait avant l'aplatissement. La bande est reconstruite par prolongement vertical de la ligne de pixels du dessus, **uniquement sous les pixels opaques de la pastille** ; dans la vidéo elle est en plus masquée tant que le bandeau n'est pas arrivé, puis libérée derrière lui. Elle n'est donc jamais visible.
- **À l'intérieur d'un bloc, rien n'est séparable sans détourage** : le micro fait partie du pupitre, l'icône calendrier fait partie de la pastille date, l'horaire et l'intitulé d'une ligne de programme forment une seule image, les lettres d'un mot ne sont pas isolées. Je n'ai pas découpé lettre par lettre : sur du texte pixellisé, cela aurait dégradé l'anticrénelage pour un gain d'animation discutable.
- **Pas de vraie profondeur** : tout l'affiche est sur un seul plan. La parallaxe utilisée est une parallaxe simulée (décalage de quelques pixels entre éléments pendant les mouvements de caméra, nul sur le plan final).
- Aucun texte n'étant éditable, la typographie d'origine (non identifiée par nom de police) est conservée **par l'image** : aucune police n'est nécessaire au rendu, et rien n'est retapé.

## 4. Possibilités d'animation retenues

- Caméra 2D sur le document complet (zoom 0,47 à 1,0, recadrages verticaux, panoramique de lecture sur la pastille date).
- Révélations par masque (titres qui montent depuis leur ligne de base, pastilles qui se déroulent, lignes de programme qui glissent), zoom léger (logo, PROGRAMME), révélation verticale (colonne).
- Un reflet lumineux découpé à la forme exacte du titre, puis du logo (un seul par plan).
- Fin sur la composition d'origine, identique à l'affiche (vérifié : voir README, § Contrôles).
