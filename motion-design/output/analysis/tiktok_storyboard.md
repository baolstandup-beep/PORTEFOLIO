# Storyboard technique — TikTok 9:16

Images de référence : `output/analysis/planche-contact.png` (15 images extraites du rendu final, horodatées).
Repère : coordonnées « doc » = pixels du PSD (2317 × 3014) ; z = pixels écran par pixel doc.

## P1 — Accroche (0 → 90)
- **Première image** : fond blanc, halo vert très léger en haut à gauche ; « Conférence » déjà aux deux tiers sorti de sa ligne de masque, au centre-haut (y ≈ 900 px écran).
- **Évolution** : « Conférence » termine sa montée (img 16), « de presse » monte (4–34). Travelling avant imperceptible.
- **Moment fort** : img 46–80, un reflet blanc traverse « Conférence », découpé à la forme des lettres.
- **Dernière image** : le titre seul, posé, tenu ~1,5 s (R1 : information clé qui respire).

## P2 — Identité (90 → 225)
- **Première image** : identique à la fin de P1.
- **Évolution** : la caméra recule et glisse vers la gauche ; le logo apparaît par léger zoom (104–132), le nom de la plateforme se déroule de gauche à droite (118–148) ; le pupitre monte depuis le bas du cadre (130–178).
- **Moment fort** : le pupitre se pose sous le titre : la composition de l'affiche se reconstitue.
- **Dernière image** : bloc logo + plateforme + titre au centre, pupitre en bas à gauche.

## P3 — Le rendez-vous (225 → 507)
- **Première image** : fin de P2.
- **Évolution** : plongée sur le pupitre (insert vertical, micro en haut, z ≈ 1, img 263–280). Montée vers la date : la pastille bleue se déroule depuis sa flèche verte (283–313) pendant que la voix dit « Samedi 31 octobre 2026 ». Panoramique de lecture vers « à partir 16h30 » (350–390) synchronisé avec « à partir de 16 h 30 ». Descente vers l'encart lieu qui glisse en place (421–445) sur « au siège du PAS-PAS, à Mbacké ».
- **Moment fort** : « 31 » et « 16h30 » en gros plan, chacun au moment où il est prononcé.
- **Dernière image** : date + lieu cadrés, titre en haut (coupé), légère poussée de caméra.

## P4 — Le programme (507 → 837)
- **Première image** : fin de P3.
- **Évolution** : recadrage sur la liste ; la colonne décorative se révèle de haut en bas au bord droit ; la pastille PROGRAMME apparaît ; les lignes 1–4 tombent en cascade, puis 5, 6, 7 au moment où la voix les annonce, enfin 8 et 9. La caméra descend lentement avec la liste.
- **Moment fort** : la ligne « Déclaration politique officielle » arrive sur la phrase correspondante.
- **Dernière image** : la liste complète, caméra arrêtée.

## P5 — Plan final (837 → 1007)
- **Première image** : fin de P4.
- **Évolution** : recul vers l'affiche entière (837–907) ; le bandeau vert de contact monte depuis sa ligne de base (863–895), le pied du pupitre se complète derrière lui ; impact sourd à l'arrivée (893). Reflet sur le logo (937–971).
- **Moment fort** : l'affiche complète se forme, sur « Rejoignez-nous ! ».
- **Dernière image (1006)** : l'affiche d'origine à l'identique, pleine largeur, centrée, tenue 3,3 s ; musique en fondu.

## Implémentation Remotion
| Plan | Fichier | Éléments |
|---|---|---|
| P1 | `src/scenes/SceneIntro.tsx` | titre-conference, titre-de-presse |
| P2 | `src/scenes/SceneReveal.tsx` | logo-paspas, bandeau-plateforme, pupitre |
| P3 | `src/scenes/SceneInformation.tsx` | info-date, info-lieu |
| P4 | `src/scenes/SceneShowcase.tsx` | colonne-motifs, programme-titre, 9 lignes |
| P5 | `src/scenes/SceneOutro.tsx` | bandeau-contacts |
Caméra : `src/components/CameraMotion.tsx` ; préréglages : `src/components/Transitions.tsx` ; son : `src/components/Soundtrack.tsx`.
