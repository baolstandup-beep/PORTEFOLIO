# Revue indépendante : vidéo motion design « Conférence de presse PAS-PAS » (TikTok 9:16)

- **Date de la revue :** 2026-10-26. Le relecteur n'a pas participé à la fabrication.
- **Fichier examiné :** `output/motion_design_final.mp4` (MD5 `f52a4053…`, identique à `output/tiktok/motion_design_tiktok.mp4`). Version sans musique : `output/tiktok/motion_design_tiktok_sans_musique.mp4`.
- **Convention :** « img N » désigne l'image N, numérotée à partir de 0, à 30 i/s (t = N / 30 s).
- **Images extraites :** `out/review/` (54 PNG pleine résolution `fNNNN.png`), versions avec repères de sécurité dans `out/review/guides/`, planches dans `out/review/sheets/`, carte de différences `out/review/diff_final_vs_preview.png` et `out/review/diff_474_475.png`.
- **Repères de sécurité tracés :** y = 180, y = 1620 (soit 1920 − 300), x = 80 et x = 1000.

---

## 1. Caractéristiques techniques mesurées

| Mesure | Valeur | Outil |
|---|---|---|
| Vidéo | H.264 High, niveau 4.0, yuv420p, BT.709, 1080×1920, 30/1 i/s (CFR), 1007 images | ffprobe |
| Durée | vidéo 33,567 s ; audio 33,579 s ; conteneur 33,579 s | ffprobe |
| Audio | AAC LC, 48 kHz, stéréo, ≈ 317 kb/s | ffprobe |
| Débit total | ≈ 3,06 Mb/s (12,86 Mo) | ffprobe |
| Images clés (I) | 244, 494, 744, 994 | ffprobe pict_type |
| Décodage complet | 0 erreur (`ffmpeg -v error -f null`) | ffmpeg |
| Images noires | aucune (blackdetect d = 0,03 s, pix_th = 0,10) | ffmpeg |
| Images figées | une seule séquence : 30,23 s → fin (img 907–1006), conforme au plan fixe final prévu. Aucune autre séquence > 0,5 s. Pas de doublon exact d'image en cours de mouvement. | freezedetect + diff image à image |
| Loudness intégrée (finale) | **−16,8 LUFS**, LRA 3,2 LU, true peak **−1,1 dBTP** | ebur128 |
| Loudness (sans musique) | −16,6 LUFS, true peak −1,1 dBTP | ebur128 |
| Voix seule (`voix_off.wav`) | −16,7 LUFS, true peak −1,5 dBTP (PCM 48 kHz mono, 33,567 s) | ebur128 |
| Calage voix | décalage 0 ms entre `voix_off.wav` et la piste du MP4 final (corrélation à 8 kHz) | numpy |
| Version sans musique | flux vidéo **identique image par image** (MD5 du flux décodé `0db450d0…` pour les deux fichiers) | ffmpeg -f md5 |

### Rapport voix / musique

Méthode : la musique est estimée par soustraction (finale − sans musique). Les effets sonores (SFX) sont estimés par soustraction (sans musique − voix).

- Musique seule : −28,8 LUFS intégrés, crête −10,2 dBFS. Elle est donc **≈ 12 LU sous la voix** en loudness intégrée.
- Niveau RMS de la musique **pendant la voix** : −32,6 dB (img 93–219), −32,1 dB (img 573–693), −32,2 dB (img 909–969). Dans les mêmes fenêtres, la voix est entre −15,9 et −18,1 dB. L'écart est donc de **≈ 14 à 16 dB**.
- Niveau RMS de la musique **dans une pause de voix** (7,4–9,5 s) : −24,3 dB. La musique est atténuée d'environ 8 dB sous la voix (ducking).
- Fin : le niveau descend à −41,5 dB à 33,4 s, puis à −50,9 dB sur les 50 dernières ms. Le fondu de sortie ne finit pas par une coupure franche.
- SFX : environ −22,6 LUFS intégrés, estimés par soustraction. Leur audibilité réelle **n'a pas été écoutée**.

---

## 2. Tableau de conformité

| # | Critère | Statut | Preuve |
|---|---|---|---|
| 1 | Format 1080×1920 | ✓ | ffprobe |
| 2 | 30 i/s | ✓ | r_frame_rate = avg_frame_rate = 30/1 ; 1007 images |
| 3 | H.264 / AAC | ✓ | h264 High + aac LC |
| 4 | Durée 25–35 s | ✓ | 33,57 s |
| 5 | Décodage sans erreur | ✓ | 0 message d'erreur |
| 6 | Pas d'images noires | ✓ | blackdetect : aucune détection |
| 7 | Pas d'images figées anormales | ✓ | seul gel : img 907–1006 (plan final voulu) |
| 8 | Couleurs fidèles au design | ✓ | Img 1006 contre preview.png : écart médian RVB (−1, −2, −1) sur les aplats colorés, 95e centile ≤ 4. Vert affiche (21,150,65) contre vidéo (20,149,65). Bleu affiche (43,117,186) contre vidéo (38,114,187). |
| 9 | Textes fidèles / aucune info inventée à l'écran | ✓ | La carte `diff_final_vs_preview.png` ne montre que des liserés d'anticrénelage. Aucun élément manquant ni ajouté. Les 9 lignes du programme, l'adresse et les contacts sont identiques. |
| 10 | Proportions / aucune déformation, logo non déformé | ✓ | Img 1006 alignée sur l'affiche à l'échelle 0,4661 (1080/2317), décalage y = 214, écart moyen 5,2/255. Logo rond aux img 118, 135 et 1006 (`sheets/logo_crops.png`). |
| 11 | Fond de l'affiche | ✗ (mineur) | Le fond blanc d'origine (255,255,255) est remplacé par un dégradé à halos : moyenne (251,6 ; 253 ; 252,7), jusqu'à (237,247,240) en haut à gauche, img 1006. Ce choix est documenté dans le storyboard (« halo vert très léger »), mais il s'écarte de l'affiche. |
| 12 | Voix off fidèle aux infos de l'affiche | ✓ avec réserve | Date, heure, lieu, 4 points du programme et URL concordent avec l'affiche. « vous donne rendez-vous » est une formulation ajoutée, sans info nouvelle. Le script garde **4 mentions « [À VALIDER] »** non levées (P2, P3, P4, P5). |
| 13 | Voix synchronisée avec l'écran | ✓ | Voir §3 : chaque réplique commence quand l'élément correspondant est à l'écran (écart ≤ 6 img). |
| 14 | Musique sous la voix | ✓ | La musique est 14–16 dB sous la voix pendant la parole, avec ducking ≈ 8 dB. |
| 15 | Loudness adaptée aux réseaux | ✓ avec remarque | −16,8 LUFS / −1,1 dBTP. Le true peak est conforme (≤ −1). La loudness est ≈ 2–3 LU sous la pratique courante sur les plateformes (≈ −14 LUFS). Aucune exigence chiffrée du client sur ce point. |
| 16 | Zones de sécurité, plan final | ✓ avec réserve | Le contenu de l'affiche va de y 301 à y 1612, dans les marges 180/300. Au bord gauche, le texte « 00221 78 832 59 59 » commence à x ≈ 68 (icône téléphone à x ≈ 25) et le logo à x ≈ 63, tous deux à moins de 80 px (img 1006). |
| 17 | Zones de sécurité, plans intermédiaires | ✗ | « Conférence » va de x ≈ 60 à 1020 (img 12–89). Il atteint x ≈ 1062 à l'img 224, sous la colonne d'icônes TikTok à droite. Le nom de la plateforme est en partie au-dessus de y = 180 (img 420–506 : y ≈ 145–235). « institutionnelle » se termine à x ≈ 1020 (img 765). |
| 18 | Pas de texte coupé involontairement | ✗ | Img 420–836 (≈ 14 s) : « onférence », « di 31 Oct 2026 » ou « medi 31… » et « OUR LE PROGRÈS » sont coupés à gauche. Seule la coupe du **titre** est déclarée voulue dans le shot list (P3). Voir D2. |
| 19 | Pas d'artefact de bord sur les PNG | ✗ | Img 248–293 : le bas du calque pupitre est coupé net et visible à y ≈ 1730–1888, et son bord gauche est coupé droit à x ≈ 30 (img 263). Voir D1. |
| 20 | Pas de transitions brutales involontaires | ✓ | Plan-séquence sans coupe. Les écarts image à image montent et descendent de façon continue (montée vers la date img 284–317, pic 28,8 à l'img 300 ; recul final 840–907, pic 28,3 à l'img 870). |
| 21 | Mouvements fluides | ✓ avec réserve | Courbes en cloche régulières. Micro-saccade d'environ 1 px sur toute l'image à l'img 475 (écart 1,14 contre 0,18–0,2 autour, `diff_474_475.png`). Départ un peu sec à l'img 284 (1,4 → 5,4). |
| 22 | Textes lisibles sur téléphone | ✗ partiel | Titre, date, heure et « PROGRAMME » : grands. Lignes du programme : ≈ 25 px de haut à l'img 765 (P4) et 17 px de capitale à l'img 1006. « Secrétaire administratif » : 20 px (img 1006). Plateforme : 22 px (img 1006). La règle esthétique Q11 demande ≥ 32 px pour le texte auxiliaire. |
| 23 | Fin stable et lisible | ✓ | Caméra fixe img 907–1006 (3,3 s). Seul le reflet du logo bouge (img 937–971). L'img 1006 reproduit l'affiche d'origine. |
| 24 | Cohérence avec le shot list | ✓ avec écarts | Ordre et timing respectés à ± 4 img (§3). Écart : l'« amorce du pupitre au bord gauche » annoncée en P4 n'apparaît pas aux img 552–836. |
| 25 | Deux versions (avec / sans musique) issues de la même timeline | ✓ | Flux vidéo identiques (MD5). |
| 26 | Qualité de prononciation (PAS-PAS, Mbacké, URL) | non vérifiable | Pas d'écoute possible. |
| 27 | Audibilité et justesse des SFX | non vérifiable | Seule la présence est mesurée (≈ −22,6 LUFS par soustraction). |

---

## 3. Cohérence shot list ↔ rendu, et synchronisation voix / écran

Les répliques ont été situées avec `silencedetect` sur `voix_off.wav` (−35 dB, 0,12 s). Les intervalles de parole sont convertis en numéros d'image.

| Réplique (script) | Parole mesurée | Prévu (shot list) | Ce qu'on voit à l'écran | Verdict |
|---|---|---|---|---|
| vo-01 « Conférence de presse. » | 0,40–1,52 s (img 12–46) | 12–49 | « Conférence » visible dès l'img 0 ; « de presse » entièrement sorti à l'img 12 | ✓ |
| vo-02 « La Plateforme… vous donne rendez-vous. » | 3,07–7,35 s (img 92–220) | 92–224 | Logo à partir de l'img ≈ 104–118 ; nom de la plateforme en cours de révélation à l'img 118, complet à l'img 135 ; pupitre img 130–178 | ✓ |
| vo-03a « Samedi 31 octobre 2026, » | 9,57–12,23 s (img 287–367) | 287 | Révélation de la pastille date img 283–313 ; date entière visible img 313–350 | ✓ |
| vo-03b « à partir de 16 h 30, » | 12,83–14,25 s (img 385–427) | 385 | Panoramique vers l'heure img 351–390 ; « 16h30 » à l'écran aux img 390 et 420 | ✓ |
| vo-03c « au siège du PAS-PAS, à Mbacké. » | 14,57–16,48 s (img 437–494) | 437 | Encart lieu apparu entre les img 421 et 445 ; lisible à l'img 437 | ✓ |
| vo-04a « Au programme : » | 18,03–18,74 s (img 541–562) | 541 | « PROGRAMME » visible à l'img 552 | ✓ |
| vo-04b/c « doctrine… », « le progrès… » | bloc continu 19,10–23,23 s (img 573–697). La limite entre les deux répliques n'est pas mesurable par les silences. | 573 / 637 | Ligne « Doctrine » visible à l'img 608. Ligne « Le progrès » en cours de révélation à l'img 640. | ✓ probable. Le calage exact de vo-04c est **non vérifiable** sans écoute. |
| vo-04d « une déclaration politique officielle, » | 23,53–25,41 s (img 706–762) | 706 | Ligne « Déclaration » absente à l'img 700, présente à l'img 765 (révélation prévue à l'img 700) | ✓ |
| vo-04e « puis les questions de la presse. » | 25,70–27,45 s (img 771–823) | 771 | Ligne « Questions… » présente à l'img 807 (révélation prévue à l'img 765) | ✓ |
| vo-05 « Rejoignez-nous ! … www.pas-pas.org. » | 28,30–32,39 s (img 849–971) | 849–974 | Bandeau contacts en entrée à l'img 870, en place à l'img 895 ; URL « www.pas-pas.org » visible | ✓ |

### Mouvements de caméra : prévu et mesuré

Le mouvement est mesuré par l'écart moyen entre deux images successives.

| Mouvement | Prévu | Mesuré |
|---|---|---|
| P2, recul | 90–135 | 95–135 |
| P3, plongée | 225–263 | 226–263 |
| P3, montée vers la date | 280–317 | 283–317, départ sec à l'img 284 |
| P3, panoramique G→D | 350–390 | 351–390 |
| P3, descente vers le lieu | 390–437 | 394–437 |
| P4, recadrage | 507–552 | 508–552 |
| P4, panoramique vertical | 552–807 | ≈ 579–790 |
| P5, recul | 837–907 | 840–907 |
| P5, reflet du logo | 937–971 | variation faible détectée aux img 947–950 |

Les plans P1 (img 25–50) et P2 (img 160–224) sont quasi statiques. C'est conforme aux travellings très lents annoncés (0,64 → 0,664 et 0,56 → 0,572).

---

## 4. Défauts classés

### Bloquant

**D1. Bord du calque « pupitre » visible (img 248–293, 7,8–9,8 s).**
- Pendant l'insert serré sur le pupitre, le bas du calque s'arrête net sur fond clair. Sa limite inférieure passe de y ≈ 1888 (img 248) à y ≈ 1730 (img 262–264), puis revient à y ≈ 1886 (img 293).
- Le bord gauche du calque est lui aussi coupé droit à x ≈ 30 (img 263, 283).
- Sur l'affiche, ce bas est caché par le bandeau contacts et le bord gauche est un bord perdu. Ici, le pupitre « flotte », coupé.
- Le défaut dure 46 images, dont environ 20 de tenue quasi fixe (img 263–283).
- Une partie se trouve dans la zone basse de 300 px que l'interface TikTok peut couvrir. Elle reste visible au-dessus de la légende.
- Preuves : `out/review/f0263.png`, `out/review/sheets/sheet_pupitre.png`.

### À corriger

**D2. Textes coupés par le cadre sans intention déclarée (img 420–836).**
- La pastille date est lue tronquée : « di 31 Oct 2026 » (img 437–506) puis « medi 31 Oct 2026 » (img 530–836).
- Le nom de la plateforme est amputé : « OUR LE PROGRÈS… » (img 437–506).
- Le titre est coupé : « onférence » (img 420–506).
- Le shot list ne déclare comme voulue que la coupe du titre. La coupe de la date dure environ 13 s, ce qui contredit « pas de texte coupé involontairement ».
- Preuve : `out/review/guides/f0480.png`.

**D3. Taille des textes « à lire ».**
- Lignes du programme : ≈ 25 px de haut en P4 (img 765), 17 px de capitale en P5 (img 1006).
- Rôles (« Secrétaire administratif », etc.) : ≈ 20 px.
- Contacts et URL du plan final : ≈ 20–22 px de hauteur d'œil.
- La règle Q11 (aesthetic-rules) demande ≥ 32 px pour le texte auxiliaire et désigne l'URL de fin comme « la ligne qui ne doit pas être la plus petite ».
- Cette limite est imposée par la mise en page d'origine, ce que le shot list reconnaît. Aucun plan rapproché des contacts n'existe pendant que la voix les cite (img 849–971).

**D4. Débordement des marges latérales et haute dans les plans intermédiaires.**
- « Conférence » : x ≈ 60–1020 (img 12–89) et jusqu'à x ≈ 1062 (img 224), donc sous les boutons TikTok à droite.
- Nom de la plateforme : au-dessus de y = 180 (img 420–506).
- « institutionnelle » : se termine à x ≈ 1020 (img 765).
- Plan final : numéro de téléphone à x ≈ 68 et logo à x ≈ 63, sous les 80 px.
- Preuves : `out/review/guides/f0224.png`, `guides/f1006.png`.

**D5. Script voix off pas encore validé.** Quatre répliques portent encore « [À VALIDER] » dans `output/tiktok/voix_off.txt` :
- P2 : formulation ajoutée « vous donne rendez-vous » ;
- P3 : prononciation de « PAS-PAS » et de « Mbacké » ;
- P4 : résumé de la ligne « Questions » ;
- P5 : lecture de l'URL.

### Mineur

- **D6.** Le fond de l'affiche est teinté par des halos (vert en haut à gauche, bleu en bas à droite) au lieu du blanc pur, y compris sur l'image finale (img 1006, écart jusqu'à −18 sur R). Ce choix est visible sur la carte de différences.
- **D7.** Micro-saccade d'environ 1 px sur toute l'image à l'img 475, pendant le travelling lent du plan lieu (`out/review/diff_474_475.png`).
- **D8.** Le départ de la montée vers la date à l'img 284 est un peu sec (écart 1,4 → 5,4 en une image), alors que les autres mouvements démarrent progressivement.
- **D9.** Composition : la moitié basse de l'écran reste vide aux img 437–552 (y ≈ 1000–1920) et le tiers bas aux img 608–836 (y ≈ 1330–1920). Le pupitre « en amorce au bord gauche » annoncé en P4 n'est pas visible (img 552–836) ; c'est un écart avec le shot list.
- **D10.** Le logo entre par le bord gauche et y est coupé pendant le recul (img 118). C'est transitoire.
- **D11.** Le reflet sur le logo (img 937–971) est à peine perceptible (écart moyen ≈ 1,2 sur la zone du logo).
- **D12.** Loudness à −16,8 LUFS, environ 2–3 LU sous la pratique courante sur les plateformes. Aucune exigence du client n'est enfreinte.

---

## 5. Points non vérifiables

- **Prononciation et intelligibilité de la voix de synthèse** (Piper, « fr-siwis-medium ») : « PAS-PAS », « Mbacké », « 16 h 30 », lecture de « www.pas-pas.org ». Aucune écoute possible.
- **Limite exacte entre vo-04b et vo-04c** : la parole est continue de 19,10 à 23,23 s, sans silence ≥ 0,12 s à −35 dB entre les deux répliques.
- **Audibilité, timbre et calage fin des SFX** : seule leur présence globale est mesurée, et le calage n'est pas contrôlé à l'oreille.
- **Caractère et qualité de la musique** : non écoutés. Seuls les niveaux sont mesurés.
- **Lisibilité réelle sur un téléphone physique et recouvrement par l'interface TikTok** : estimés uniquement avec les repères 180/300/80 px.
- **Fidélité aux calques PSD d'origine** : la comparaison porte sur `preview.png` (affiche aplatie), pas sur le PSD.

---

## 6. Méthode (commandes principales)

- `ffprobe -show_streams -show_format` ; `ffmpeg -v error -i … -f null -` ; `blackdetect=d=0.03:pix_th=0.10`, `freezedetect=n=0.001:d=0.5`.
- `silencedetect=n=-35dB:d=0.12` et `n=-40dB:d=0.25` sur `voix_off.wav` ; `ebur128=peak=true` sur les trois fichiers.
- Musique estimée par `amix` (finale + sans musique × −1), puis `astats` par fenêtre de temps.
- Extraction avec `select=eq(n\,N)` pour 54 images (0, 12, 46, 63, 89, 90, 104, 118, 135, 160, 178, 224, 225, 240, 245, 250, 256, 263, 270, 283, 290, 296, 300, 313, 350, 370, 390, 420, 437, 445, 473–476, 480, 506, 507, 530, 552, 580, 608, 640, 700, 765, 807, 836, 837, 870, 895, 907, 937, 955, 990, 1006).
- Écart moyen image à image sur une version en niveaux de gris 270×480. Alignement de l'img 1006 sur `preview.png` par recherche du décalage vertical (minimum de l'écart absolu moyen à y = 214).

---

## Suite donnée à la revue (ajoutée par l'auteur de la vidéo après la revue)

| Constat | Décision | Vérification |
|---|---|---|
| D1 bloquant : bords du pupitre visibles (img 248–293) | **Corrigé** : insert recadré (cx 610, cy 1760 → 1752, z 0,98 → 1,0), cadrage P2 ajusté | Contrôle numérique des bords sur les images 130–507 : bord gauche ≤ −1,9 px, bas ≥ 1938 px (hors cadre) ; planche visuelle des images 248, 265, 293 refaite |
| D2 textes coupés aux images 420–836 | **Conservé, documenté** : recadrages volontaires de plans de détail et du plan programme ; l'élément visé est entier, les textes coupés sont montrés entiers en P1, P2 et P5 | `camera-movements.md`, `tiktok_shot_list.md` mis à jour |
| D3 textes du programme et des contacts < 32 px | **Non corrigeable sans modifier la mise en page** (agrandir ces lignes déformerait le design) ; limitation déclarée dans le README | — |
| D4 marges 80/180 px | **Partiellement corrigé** : P1 passé à z 0,60 (titre à 90 px des bords) ; P2 : logo à ~60 px (identique au plan final, mise en page d'origine) ; plans de détail : voir D2 ; téléphone à ~68 px au plan final = mise en page d'origine en pleine largeur | `validate-project.py` |
| D5 mentions « [À VALIDER] » | **Conservé volontairement** : ce sont les passages que le client doit valider (formulation ajoutée, prononciations) | — |
| Mineurs (micro-saccade ~1 px img 475, départ sec img 284) | Non traités | — |
| Amorce du pupitre en P4 | Doc corrigée (amorce d'environ 25 px) | — |

Rendu final refait après ces corrections : 1080×1920, 30 i/s, 1007 images, décodage sans erreur, 0 image noire, −16,8 LUFS, crête −1,1 dBFS.
