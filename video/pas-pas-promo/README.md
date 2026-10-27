# PAS-PAS OFFICIEL : vidéo de présentation de la chaîne

Projet Remotion (React) qui produit la vidéo promotionnelle de 35 s de la chaîne
[youtube.com/@PAS-PAS_OFFICIEL](https://www.youtube.com/@PAS-PAS_OFFICIEL/videos), en 16:9 (YouTube) et en 9:16 (Shorts).

| Livrable | Fichier |
| --- | --- |
| Vidéo 16:9, 1920×1080, 30 i/s, H.264 + AAC 48 kHz | `out/pas-pas-officiel-16x9.mp4` |
| Version Shorts 9:16, 1080×1920 | `out/pas-pas-officiel-9x16-shorts.mp4` |
| Sous-titres de la voix off | `out/sous-titres.srt` |
| Voix off (enregistrement source) | `assets/voiceover/voix-off.mp3` |
| Horodatage mot à mot de la voix | `assets/voiceover/words.json` |
| Projet source | `src/` (scènes, composants, timeline) |

## Identité visuelle

- **Logo** : extrait du manifeste officiel (`MANIFESTE_PAS-PAS.pdf`, image 3508 px avec transparence), recadré au carré
  sans retouche : `public/brand/logo.png`.
- **Couleurs** relevées sur ce logo (`src/theme.ts`) : vert `#34A44C` (pirogue, bandeau), bleu `#3C74C4` (nom, liseré),
  bleu ciel `#8CCDF2` (vagues). Sur le fond nuit bleutée, le bleu des mots mis en valeur est éclairci en `#7DB6F5`
  pour rester lisible. Seul le bouton S'ABONNER garde le rouge, par convention YouTube.

## Ce qui reste à fournir

Le proxy de l'environnement de production bloque les images de YouTube : les **miniatures officielles** n'ont pas pu être
téléchargées. Les cartes de la scène 3 affichent les vrais titres et durées sur un fond aux couleurs de la marque.

| Fichier à déposer | Effet |
| --- | --- |
| `public/thumbs/r0GEhHLY55s.jpg` | vraie miniature de « PAS-PAS (Plateforme d'Acteurs Sénégalais…) » |
| `public/thumbs/6HJ9nR0Eb_I.jpg` | vraie miniature de « Pas-Pas, une nouvelle dynamique politique… » |
| `public/thumbs/4PODQBLTWZc.jpg` | vraie miniature du Short « Conférence de presse PAS-PAS » |

Les fichiers sont détectés automatiquement (`src/brand.ts`) : les déposer puis relancer `npm run render`.
Source : `https://i.ytimg.com/vi/<id>/maxresdefault.jpg`.

La carte du Short annonce la conférence de presse du samedi 31 octobre 2026 : passé cette date, la remplacer dans `src/brand.ts`.

## Storyboard et découpage

30 images par seconde, 1 050 images. Les repères sont dans `src/timeline.json` : la vidéo **et** la bande-son les lisent,
donc un déplacement d'événement reste synchronisé partout.

| # | Temps | Images | Image | Texte à l'écran | Voix off | Son |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0–4 s | 0–119 | Fond sombre, particules à profondeur de champ, faisceaux volumétriques ; une ligne de lumière balaie l'écran et révèle une partie du logo ; travelling avant | ENVIE DE NE RIEN MANQUER ? | — | nappe grave, pulsation, montée |
| 2 | 4–9 s | 120–269 | Entrée 3D du logo (rotation, profondeur, mise au point), onde de choc, reflet spéculaire, halo de contour | BIENVENUE SUR / PAS-PAS OFFICIEL | « Bienvenue sur PAS-PAS OFFICIEL ! » (4,6 s) | impact, scintillement, arpèges |
| 3 | 9–17 s | 270–509 | Les 3 publications réelles en panneaux flottants, caméra en orbite | DÉCOUVREZ NOS VIDÉOS → DE NOUVEAUX CONTENUS À EXPLORER | « Tu veux découvrir… » (9,4 s), « Tu es au bon endroit ! » (12,75 s), « Rejoins notre communauté… » (14,3 s) | entrée du rythme, souffles par panneau |
| 4 | 17–24 s | 510–719 | En-tête de chaîne stylisé ; bouton rouge S'ABONNER avec rebond et halo ; clic du curseur à 19,8 s ; passage à ABONNÉ | ABONNE-TOI À LA CHAÎNE ! → C'EST GRATUIT ! | « Clique sur le bouton S'abonner, » (18,2 s) | « pop » du bouton, clic, carillon discret |
| 5 | 24–30 s | 720–899 | La caméra plonge dans la cloche du bouton ; médaillon ; clic à 25,8 s ; balancement amorti, ondes d'alerte | ACTIVE LA CLOCHE 🔔 / POUR NE RATER AUCUNE NOUVELLE VIDÉO | « puis active la cloche… » (24,3 s), « N'oublie pas de liker… » (27,85 s) | clic, double tintement de cloche |
| 6 | 30–35 s | 900–1049 | Retour du logo, recul de caméra, filet lumineux, dernier éclat à 33,7 s, logo tenu 1 s, fondu au noir sur les 10 dernières images | PAS-PAS OFFICIEL / ABONNE-TOI • ACTIVE LA CLOCHE • PARTAGE | « PAS-PAS OFFICIEL… abonne-toi et reste connecté ! » (30,5 s) | accord tenu, impact final |

Transitions : éclair lumineux bleuté centré sur chaque changement de scène (images 118, 268, 508, 718, 898), accompagné d'un souffle.

La scène 4 est une représentation stylisée : pas de logo YouTube, pas de compteur d'abonnés, rien de cliquable. La scène 5
montre le geste à faire, elle n'affirme pas que des notifications sont activées.

## Voix off

Texte intégral (voix « JOHN MALA », accent d'Afrique francophone, ElevenLabs v4) :

> Bienvenue sur PAS-PAS OFFICIEL !
> Tu veux découvrir nos vidéos et ne rien manquer de nos publications ? Tu es au bon endroit !
> Rejoins notre communauté dès maintenant.
> Clique sur le bouton S'abonner, puis active la cloche de notification pour être informé des nouvelles vidéos.
> N'oublie pas de liker et de partager autour de toi !
> PAS-PAS OFFICIEL… abonne-toi et reste connecté !

**Prononciation.** Écrit « PAS-PAS », le nom est lu « pa-pa » par la synthèse vocale (la transcription de contrôle donnait
« Papa Officiel »). L'enregistrement final a été généré avec la graphie phonétique « Pass-Pass » ; sa transcription donne
« Passe-Passe Officiel ». À faire valider par le mouvement : si le nom se prononce autrement, régénérer la voix avec la bonne graphie.

Le découpage phrase par phrase et le placement sont dans `src/voiceover.json` (`srcStart`/`srcEnd` dans l'enregistrement, `at`
dans la vidéo). Pour un enregistrement humain : lire le texte ci-dessus, remplacer `assets/voiceover/voix-off.mp3`, puis
corriger `srcStart`/`srcEnd` d'après le nouveau fichier.

## Musique et bruitages

Tout est synthétisé par `scripts/make-audio.mjs` : aucune musique ni aucun bruitage tiers, donc aucun droit à acquérir.
Musique originale à 100 BPM en la mineur (la m – fa – do – sol) : intro mystérieuse, montée à la révélation du logo, rythme
pendant la présentation, accord et impact de conclusion. Bruitages : souffles, impacts, « pop » du bouton, clics, cloche FM.

Mixage : la musique baisse d'environ 14 dB sous la voix (anticipation 80 ms, relâche 350 ms). Écart mesuré voix/musique
pendant la narration : 8 à 19 dB. Le mix est normalisé à -14 LUFS, crête vraie -1,5 dBTP (recommandation YouTube).

## Installation et génération

Prérequis : Node.js 20 ou plus et ffmpeg.

```bash
cd video/pas-pas-promo
npm install
npm run render          # bande-son, puis exports 16:9 et 9:16 finalisés
npm run check           # contrôle durée, résolution, codecs, sonie, décodage
```

Commandes séparées :

```bash
npm run audio           # public/audio/mix.wav, pistes séparées dans out/audio/, out/sous-titres.srt
npm run render:16x9     # out/pas-pas-officiel-16x9.mp4
npm run render:9x16     # out/pas-pas-officiel-9x16-shorts.mp4
npm run studio          # prévisualisation et réglages dans le navigateur
```

Sans accès au téléchargement de Chrome Headless Shell, indiquer un navigateur local :
`REMOTION_BROWSER_EXECUTABLE=/chemin/vers/chrome-headless-shell npm run render`.

Chaque export passe par `scripts/finalize.mjs` : réencodage H.264 High en yuv420p BT.709 plage vidéo, `faststart`, audio copié.

## Version verticale

Même composition, mêmes repères, mise en page adaptée par `useLayout()` (`src/theme.ts`) :

- zones de sécurité Shorts : 12 % en haut, 22 % en bas, 14 % à droite (colonne des boutons) ; les textes et l'en-tête
  de chaîne sont centrés dans la zone utile ;
- panneaux vidéo empilés en colonne au lieu d'une rangée ;
- en-tête de chaîne en colonne, bouton sous le nom ;
- signature finale sur trois lignes.

## Structure

```
src/timeline.json        scènes et événements (images), partagés vidéo / audio
src/voiceover.json       découpage et placement de la voix off
src/brand.ts             nom, vidéos réelles, détection du logo et des miniatures, polices
src/theme.ts             couleurs, zones de sécurité, unité de mise en page
src/components/          Atmosphere (fond, particules, transitions), Kinetic (typo), Logo (3D), ChannelCard, Ui (curseur, cloche)
src/scenes/              Hook, LogoReveal, Videos, Subscribe, Bell, Outro
scripts/make-audio.mjs   musique, bruitages, voix, ducking, normalisation, sous-titres
scripts/finalize.mjs     préparation des MP4 pour la mise en ligne
scripts/check.mjs        contrôle qualité des exports
```

## Licences

- Remotion : gratuit pour les particuliers et les structures de 3 personnes au plus ; au-delà, une licence entreprise est
  requise (remotion.pro). À vérifier selon la taille de l'organisation.
- Polices Montserrat et Inter : SIL Open Font License, fichiers inclus dans `public/fonts/`.
- Voix : générée avec le compte ElevenLabs de l'utilisateur ; usage commercial selon l'offre de ce compte.
- Musique et bruitages : créés pour ce projet, sans tiers.
