# Voix off — script d'enregistrement (optionnel)

> Choix validé : la vidéo est diffusée **sans voix off** (musique + textes à l'écran).
> Ce script sert uniquement si une voix est ajoutée plus tard. L'essai de la scène 01 est archivé
> dans `archive/` (déplacez-le dans ce dossier pour le réactiver).

Voix masculine francophone, grave, posée, chaleureuse. Ton institutionnel, humain, sans dramatisation.
Respecter les « … » (silences). Un fichier par scène, nommé exactement comme ci-dessous,
puis lancer `./build.sh` : la musique se baisse automatiquement sous la voix.

Prononciation : « Pas-Pas » (comme « pas »), Lompoul, Kébémer, Léona, Thiéppe.

| Fichier | Fenêtre | Texte |
|---|---|---|
| `vo_scene_01_intro.mp3` (essai archivé) | 2,0 → 5,5 s | Mouvement Pas-Pas. … Communiqué officiel. |
| `vo_scene_02_naufrage.mp3` | 7,0 → 13,5 s | Le Mouvement Pas-Pas a appris, avec une profonde tristesse, le naufrage d'une pirogue au large de Lompoul, dans le département de Kébémer. |
| `vo_scene_03_hommage.mp3` | 14,6 → 26,5 s | Il s'incline devant la mémoire des victimes, et présente ses sincères condoléances aux familles endeuillées. … Il exprime sa solidarité au rescapé, aux proches qui attendent encore des nouvelles, et aux populations de Léona et de Thiéppe. |
| `vo_scene_04_solidarite.mp3` | 27,6 → 38,5 s | Le Mouvement salue la mobilisation des riverains et des équipes de secours. … La poursuite des recherches, l'identification des victimes et l'information régulière des familles doivent rester prioritaires. |
| `vo_scene_05_prevention.mp3` | 39,6 → 49,8 s | La répétition de ces drames nous oblige à mieux comprendre ce qui conduit à une traversée aussi dangereuse. … La prévention engage chacun dans son rôle : pouvoirs publics, collectivités territoriales, acteurs économiques et associatifs, familles, et les jeunes eux-mêmes. |
| `vo_scene_06_conclusion.mp3` | 50,8 → 59,5 s | À travers ses Ateliers de Progrès, le Mouvement Pas-Pas ira à l'écoute des jeunes et des territoires, pour construire des réponses adaptées aux réalités locales. … Ensemble, pour un avenir meilleur. |

Attention au minutage : les scènes 03 et 05 sont denses (~12 s de parole). Si une prise dépasse sa
fenêtre, allonger la scène (constante `DUR` dans `scenes/<scène>/scene.js`) et décaler l'offset dans `build.sh`.

Génération ElevenLabs déjà préparée (voix « PUMBA – professional and deep », voix naturelle de Dakar,
modèle eleven_multilingual_v2) : flow « PAS-PAS – Naufrage Lompoul – Voix off ». Seule la scène 01 a pu
être générée : le quota du compte était épuisé (≈ 1 060 crédits nécessaires pour les 5 autres).
