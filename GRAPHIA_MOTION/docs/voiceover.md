# Voix off — GRAPHIA 2026

- **Voix** : ElevenLabs « Tony – Punchy Ad & Social Voice » (`fsYODoWLWYJ5ai6CAN3M`) : français, léger accent africain, ton publicitaire chaleureux.
- **Modèle** : `eleven_v4`, avec indications de jeu entre crochets.
- **Fichiers** : `public/audio/vo/vo60_takeA.mp3` (prise retenue, 45,8 s), `vo60_takeB.mp3` (prise alternative, 47,8 s), `vo30.mp3` (21,2 s).
- **Projet ElevenLabs** (flow) : « GRAPHIA 2026 — Voix off film promo ».
- **Débit naturel** : la voix n'est jamais accélérée. Elle est découpée **aux pauses naturelles** (détection de silences) et chaque phrase est posée au temps voulu par la timeline (`src/timeline.json → vo`).
- Les chiffres et l'adresse sont écrits en toutes lettres pour la prononciation (« deux mille vingt-six », « graphia tiret deux mille vingt-six point vercel point app »).

## Script 60 s (texte fourni, inchangé sur le fond)

> Le monde de la création évolue. Et les opportunités aussi.
> Aujourd'hui, le design graphique rencontre l'intelligence artificielle pour repousser les limites de la créativité.
> Découvrez GRAPHIA 2026, le bootcamp dédié aux créatifs de Touba et Mbacké.
> Cinq jours pour apprendre, expérimenter et développer de nouvelles compétences.
> Au programme : design graphique, création numérique, intelligence artificielle, entrepreneuriat et ateliers pratiques.
> Avec 70 % de pratique, 50 participants et une formation prise en charge à 80 %.
> Que vous soyez designer, infographiste, étudiant ou jeune passionné, c'est le moment de faire évoluer votre potentiel.
> Votre créativité mérite de nouvelles opportunités.
> GRAPHIA 2026. Créez le futur.
> Candidatez maintenant sur graphia-2026.vercel.app.

### Placement dans le film (ordre de montage ≠ ordre d'enregistrement)

Les phrases sont enregistrées dans l'ordre du script, puis **montées dans l'ordre des scènes** du storyboard :

| Film | Phrase | Scène |
|---|---|---|
| 00:00,6 | Le monde de la création évolue… Et les opportunités aussi. | 01 Hook |
| 00:06,6 | Découvrez GRAPHIA 2026 : le bootcamp dédié aux créatifs de Touba et Mbacké. | 02 Présentation |
| 00:12,6 | Avec 70 % de pratique, 50 participants, et une formation prise en charge à 80 %. | 03 Statistiques |
| 00:20,3 | Cinq jours pour apprendre, expérimenter, et développer de nouvelles compétences. | 04 Compétences |
| 00:24,7 | Au programme : design graphique, création numérique, intelligence artificielle, entrepreneuriat, et ateliers pratiques. | 04 Compétences |
| 00:32,5 | Aujourd'hui, le design graphique rencontre l'intelligence artificielle, pour repousser les limites de la créativité. | 05 IA |
| 00:42,1 | Que vous soyez designer, infographiste, étudiant ou jeune passionné, c'est le moment de faire évoluer votre potentiel. | 06 Transformation |
| 00:48,0 | Votre créativité mérite de nouvelles opportunités. | 06 → 07 |
| 00:51,8 | GRAPHIA 2026. Créez le futur. | 07 Appel |
| 00:54,5 | Candidatez maintenant, sur graphia-2026.vercel.app. | 07 Appel |

La phrase « Aujourd'hui, le design graphique rencontre l'IA… » passe de la 2e place du script à la scène IA, où elle illustre l'image. Si l'ordre du script doit être respecté à la lettre, il suffit de modifier les `at` dans `src/timeline.json` puis de relancer `npm run audio`.

## Script 30 s

> Le monde de la création évolue.
> GRAPHIA 2026 : le bootcamp infographie et intelligence artificielle, pour les créatifs de Touba et Mbacké.
> Cinq jours. Cinquante participants. Soixante-dix pour cent de pratique. Une formation prise en charge à quatre-vingts pour cent.
> Cinquante places. Une opportunité.
> Candidatez maintenant, sur graphia-2026.vercel.app.

## À vérifier à l'écoute (non vérifiable automatiquement)

Les temps de placement viennent d'une **détection de silences**, pas d'une transcription mot à mot. Écoutez le master une fois et contrôlez :
- que chaque chiffre de la scène 03 apparaît bien sur sa syllabe ;
- la prononciation de l'adresse du site.

Pour corriger, il suffit de décaler la valeur `at` concernée dans `src/timeline.json`.

---

## Version 2 — voix « cheikh awq » + Comment candidater + Partenaires (EN ATTENTE DE CRÉDITS)

- **Voix** : clone ElevenLabs « cheikh awq » (`RGg7er9jBMCMqqe7ArTY`), modèle `eleven_multilingual_v2`.
- **Blocage** : la génération a été refusée par ElevenLabs. Il faut 1 379 crédits pour la version longue (et environ 500 pour le 30 s), alors que l'espace de travail n'en a plus que 92 sur un quota de 40 000. Rien n'a été facturé.
- **Fichier attendu** : `public/audio/vo/vo_full_cheikh.mp3`, utilisé par les montages `full`, `candidater` et `partenaires` de `src/timeline.json` (liste `vo` vide en attendant la prise).

### Script version longue (≈ 90 s)

> Le monde de la création évolue… Et les opportunités aussi.
> Découvrez GRAPHIA 2026 : le bootcamp dédié aux créatifs de Touba et Mbacké.
> Avec 70 % de pratique, 50 participants, et une formation prise en charge à 80 %.
> Cinq jours pour apprendre, expérimenter, et développer de nouvelles compétences.
> Au programme : design graphique, création numérique, intelligence artificielle, entrepreneuriat, et ateliers pratiques.
> Aujourd'hui, le design graphique rencontre l'intelligence artificielle, pour repousser les limites de la créativité.
> Que vous soyez designer, infographiste, étudiant ou jeune passionné, c'est le moment de faire évoluer votre potentiel.
> Votre créativité mérite de nouvelles opportunités.
> **Pour candidater, c'est simple. Rendez-vous sur graphia-2026.vercel.app, et cliquez sur « Candidater ».**
> **Remplissez le formulaire en six étapes : environ dix minutes, depuis votre téléphone.**
> **L'équipe étudie chaque dossier. Les cinquante retenus sont contactés par téléphone ou WhatsApp.**
> GRAPHIA 2026. Créez le futur. Candidatez maintenant.
> **Entreprises, institutions, médias : devenez partenaire, et investissez dans les talents créatifs de Touba et Mbacké.**
> **Pack Or, Argent, Bronze, ou contribution technique : rendez-vous sur la page Partenaires du site.**

Chaque phrase vient du site : les 6 étapes du formulaire, les 10 minutes, le contact par téléphone ou WhatsApp, les 4 offres et les 4 types de partenaires.

### Après la génération

1. Télécharger la prise dans `public/audio/vo/vo_full_cheikh.mp3`.
2. Repérer les pauses, puis remplir `cuts.full.vo` dans `src/timeline.json` (même format que `cuts.long.vo`) et ajuster les `cues` des scènes S08 et S09.
3. Lancer `npm run audio`, puis `node scripts/render-all.mjs GRAPHIA-LONG-H GRAPHIA-LONG-V …`.
