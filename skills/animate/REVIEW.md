# Revue du skill `animate` (v4)

Revue de `SKILL.md` seul : les fichiers référencés n'ont pas été fournis.

## 1. Bloquant : le skill est incomplet

Le `SKILL.md` renvoie vers des fichiers absents de ce dépôt. Sans eux, le « fast path » échoue dès l'étape 3.

| Manquant | Utilisé par |
|---|---|
| `references/*.md` (9 fichiers) | tableau de routage, toutes les tâches |
| `styles/<videoId>.md`, `styles/top10-ranking.md` | copie de style |
| `assets/components/youtube-longform-engine/` (`story.py`, `final_mix.py`, `theme.json`, exemples) | montage long format |
| `assets/components/split-presenter-reel/` (`render_reel.sh`, `retime.py`) | reels |
| `assets/sound-effects/` | SFX |
| `scripts/check-render.py`, `notify.py`, `fal-generate.py`, `run-hyperframes.mjs`, `prepare-video-folders.mjs` | règles 9 et 10, génération |
| `library/register-asset.mjs`, `build.mjs`, `index.html`, `motion-studio.html` | règles 1 et 2 |
| `templates/`, `blocks/`, `examples/hook-intro-*.html` | compositions |
| `config/keys.env` | clés API |
| Skill `coupe-facecam` | règle 7, étape 2 du fast path |

**Action :** ajouter le dossier complet du skill, ou retirer du `SKILL.md` tout ce qui pointe vers un fichier absent.

## 2. Contradictions internes

1. **SFX.** La règle « SFX only where the reference has one » se heurte à « Animate house sounds only ». Si la référence a un son précis, le skill impose de le remplacer, sans préciser par lequel. Il faut fixer une table de correspondance entre type de son de la référence et son maison.
2. **Musique du hook.** Elle est donnée à « ~-12 dB sous la médiane de la voix », alors que l'audio doit être « measured, never guessed » (« jamais de gains fixes »). Une cible en dB est cohérente, la formulation « ~ » ne l'est pas. Il faut une tolérance chiffrée (par exemple -12 ± 1 dB).
3. **Ordre des rendus.** L'étape 6 dit « render all parts », mais la note sur le budget temps dit « render the sections ONCE, after eye contact ». Il faut indiquer explicitement dans l'étape 6 d'attendre la fin de la correction du regard.
4. **Images par seconde.** Le skill fixe « animation sampled at 15 fps » et « Presenter footage true 30 fps », puis demande un rendu en `--fps 30`. C'est cohérent, mais l'interaction avec le « strong moving blur » de 0,4 s n'est pas précisée : un flou de mouvement échantillonné à 15 fps saccade.

## 3. Ambiguïtés

- **« ≈ 0.6× realtime »** est contredit par l'exemple qui suit : 30 min de rendu pour 18 min de vidéo, soit 1,7× la durée et non 0,6×. Il faut écrire « ≈ 1,7 min de rendu par minute de vidéo ».
- **« validated Oct 2026 »** : validé par qui et sur quelle vidéo ? Sans trace, la mention n'a pas de valeur.
- **« Scenes ≤ 6 s »** entre en conflit avec les scènes de présentateur plein écran d'un montage long format de 20 min. Il faut préciser si la limite vise les scènes graphiques seulement.
- **Règle 0 « within 0.3 s of the spoken name »** : la vérification n'est décrite nulle part. Elle peut être automatisée à partir de `mots-coupe-v1.json` : comparer le timestamp du mot à l'entrée de la scène.

## 4. Risques

- **Droits.** L'outil « copie le style de montage de <URL> » est acceptable pour la mise en forme. En revanche, montrer des captures de concurrents pendant 2 s, même avec les noms de chaînes floutés, reste un risque Content ID ou de réclamation. Garder la règle, et y ajouter : jamais de miniature ni de visage identifiable.
- **Clés.** `config/keys.env` doit figurer dans `.gitignore` partout où le skill est copié. C'est déjà le cas ici via `.claude`, mais pas si le skill vit dans `skills/`.
- **Charge cognitive.** Le fichier fait environ 11 Ko pour un point d'entrée et cumule 10 règles universelles, des règles audio, de montage, de reels et de motion. La règle « Read only the file for the job in hand » est contredite par la masse de règles chargées d'office. Il faudrait déplacer les sections audio et motion dans `references/`.
- **Langue.** Le texte est en anglais, avec des déclencheurs et des citations en français (« tel que dit », « dans la description »). Ce n'est pas bloquant, mais il faut choisir une langue principale.

## 5. Priorités

1. Fournir les fichiers manquants (sans cela, rien ne marche).
2. Corriger « 0.6× realtime » et l'ordre des rendus (erreurs factuelles).
3. Lever la contradiction sur les SFX.
4. Alléger `SKILL.md` en déplaçant les sections audio et motion dans `references/`.
