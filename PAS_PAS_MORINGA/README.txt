PAS-PAS — JUS DE MORINGA — FILM DE PRÉSENTATION (30 s)
=====================================================

Contenu du dossier
------------------
PAS_PAS_MORINGA.blend            Projet Blender modifiable (Blender 4.2 LTS ou plus récent, testé en 5.2.3 LTS).
PAS_PAS_MORINGA_FINAL.mp4        Film final : H.264, 1920x1080, 25 i/s, 750 images, 30,0 s, AAC 48 kHz stéréo.
PAS_PAS_MORINGA_PREVIEW_lowres.mp4  Prévisualisation basse résolution (validation du montage et des mouvements).
assets/                          Ressources utilisées par le .blend (chemins relatifs) :
  pas_pas_banner_reference.png     Bannière officielle extraite du PSD fourni (CMJN FOGRA39 -> sRGB via le profil ICC intégré).
  mockup_reference_composite.png   Aperçu du mockup PSD d'origine (référence de forme de la bouteille).
  logo_badge.png                   Logo rond, découpé tel quel dans la bannière (aucune retouche du dessin).
  wordmark_blue.png / _white.png   Lettrage «PAS-PAS» d'origine, détouré (fond blanc retiré).
  label_moringa.png                Étiquette enveloppante de démonstration (voir « Choix et limites »).
  fonts/                           Police Inter (SIL Open Font License, voir OFL-Inter.txt).
  audio/pas_pas_score.wav          Musique originale synthétisée (48 kHz / 24 bits, ~ -16 LUFS).
scripts/                         Pipeline complet, rejouable :
  01_prepare_assets.py   logo, wordmark, étiquette  (Pillow + numpy)
  02_build_scene.py      construit TOUTE la scène et sauvegarde le .blend
  03_render.py           rendu Cycles en deux passes (beauty / overlay), reprise automatique
  04_audio.py            génère la bande-son
  05_composite.py        assemble, étalonne (bloom, vignettage, grain) et encode le MP4

Ouvrir le projet
----------------
1. Garder le dossier entier (le .blend lit assets/ en chemins relatifs).
2. Ouvrir PAS_PAS_MORINGA.blend dans Blender. Caméra : CAM_MAIN (montée sur CAM_RIG, vise CAM_TARGET).
3. Collections : PRODUCT, PRODUCT_LABEL, MORINGA_LEAVES, PEDESTAL, CAMERAS, STUDIO_LIGHTS,
   ATMOSPHERE, PARTICLES, TYPOGRAPHY, FINAL_BRANDING.
   (LL_RIM_RECEIVERS est une collection technique de « light linking », hors scène.)
4. Moteur : Cycles. Espace couleur : « Khronos PBR Neutral » (préserve les couleurs de marque).

Découpage (25 i/s)
------------------
S1   1-100   (0-4 s)    Le mystère : particules, feuilles, faisceau qui révèle la silhouette.
S2 101-225   (4-9 s)    Révélation sur le podium, contours vert/bleu, feuilles en orbite.
S3 226-400   (9-16 s)   Orbite 360° : gros plan bouchon (dos), puis étiquette.
S4 401-575   (16-23 s)  Retour face : «PAS-PAS», JUS DE MORINGA, « La fraîcheur au naturel. »
S5 576-750   (23-30 s)  Plan héroïque centré, feuilles qui se posent, PRÉSENTATION OFFICIELLE,
                        fondu au noir puis logo PAS-PAS (images 700-750).

Relancer le rendu
-----------------
Avec le module Python « bpy » (pip install bpy) ou avec Blender en ligne de commande :

  python3 scripts/03_render.py --pass beauty  --frames 1-726 --samples 48
  python3 scripts/03_render.py --pass overlay --frames 430-750
  python3 scripts/05_composite.py

ou :  blender -b PAS_PAS_MORINGA.blend -P scripts/03_render.py -- --pass beauty --frames 1-726

- Passe beauty   : le film 3D (sans textes). Les images 727-750 sont entièrement couvertes par le
                   fondu au noir : inutile de les rendre (le compositeur met du noir).
- Passe overlay  : TYPOGRAPHY + FINAL_BRANDING seuls, fond transparent, 1920x1080 natif, sans flou.
                   Les textes et le logo restent parfaitement nets, et une correction de texte ne
                   demande que de relancer cette passe (quelques secondes par image), pas la 3D.
- Une image déjà rendue est sautée : un rendu interrompu reprend où il s'était arrêté.
- Après une modification dans le .blend, relancez seulement les passes concernées.
  Si vous modifiez 02_build_scene.py, relancez-le : il régénère le .blend (vos retouches manuelles
  dans le .blend seraient alors écrasées).

Réglages utilisés pour la version livrée (machine : 4 cœurs CPU, sans GPU)
----------------------------------------------------------------------------
- Beauty rendu en 1280x720, 10 échantillons + débruiteur OpenImageDenoise, puis agrandi en 1080p
  (Lanczos) par 05_composite.py. Coût mesuré : 30 à 40 s par image sur cette machine.
- Overlay (textes + logo) rendu en 1920x1080 natif.
- Recommandé pour une version « master » sur une machine avec GPU (Cycles > Préférences > CUDA/OptiX/
  Metal) : --res 1920x1080 --samples 64. Rien d'autre à changer.

Choix et limites — à lire avant diffusion
------------------------------------------
1. BOUTEILLE DE DÉMONSTRATION. Le PSD fourni est un mockup de bouteille d'EAU 500 ml en PET (bouchon
   bleu). La bouteille 3D est un modèle procédural inspiré de ce mockup ; elle ne reproduit pas un
   conditionnement réel de jus. Remplacez les objets de la collection PRODUCT (et l'étiquette) par le
   vrai contenant dès que vous avez un modèle 3D ou un plan coté.
2. ÉTIQUETTE ADAPTÉE. L'étiquette du PSD est la bannière « Plateforme d'acteurs sénégalais… / Nous vous
   remercions de votre présence » : ce n'est pas une étiquette produit. L'étiquette de démonstration
   réutilise UNIQUEMENT des éléments de cette bannière (frises de points, logo rond, lettrage «PAS-PAS»,
   vert #189641 et bleu #2376BB) plus le texte « JUS DE MORINGA ». Aucune mention de volume,
   d'ingrédient, de certification ou de bienfait n'a été inventée. À faire valider, ou à remplacer par
   l'étiquette officielle (assets/label_moringa.png, 3200x1000, le centre de l'image fait face caméra).
3. SIGNATURE. « La fraîcheur au naturel. » est une proposition créative, pas une signature officielle.
   Pour la changer : objet TXT_S4_SIGNATURE (collection TYPOGRAPHY), puis relancer la passe overlay.
4. COULEUR DU JUS. Vert olive naturel, légèrement trouble, choisi à l'œil : aucune référence de jus
   réel n'était fournie.
5. LUMIÈRE VOLUMÉTRIQUE. Les faisceaux sont simulés (cônes émissifs additifs, collection ATMOSPHERE)
   au lieu d'un vrai volume Cycles, pour tenir le temps de rendu sur CPU.
6. AUDIO. Musique 100 % originale, synthétisée par 04_audio.py (aucun échantillon, aucun droit
   tiers). Elle a été vérifiée par mesure (sonie, crêtes, spectrogramme) mais PAS écoutée par un
   humain pendant la fabrication : faites une écoute de contrôle sur le système de la salle.
7. Le logo n'est ni redessiné ni recoloré : c'est le découpage pixel de la bannière officielle
   (1588x567 px). Pour une projection sur grand écran, fournir le logo vectoriel améliorerait la
   netteté du plan final.
