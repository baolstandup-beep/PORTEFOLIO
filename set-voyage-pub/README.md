# SET VOYAGE — Publicité animée (Remotion)

Publicité verticale **1080×1920 · 30 fps · 40 s (1200 frames)**, en React + Remotion 4.

## Démarrage

```bash
cd set-voyage-pub
npm install
npm run studio        # prévisualisation interactive (timeline, scènes nommées)
npm run render        # MP4 final → out/set-voyage-pub.mp4 (H.264, CRF 18)
npm run render:draft  # brouillon rapide en demi-résolution
```

## Personnaliser : un seul fichier, `src/config.ts`

| Élément | Où | Remarque |
|---|---|---|
| Logo | `public/assets/logo.svg` → `MEDIAS.logo` | PNG transparent ou SVG. Si le logo contient déjà le texte, mettre `logoContientTexte: true` |
| Portrait du responsable | `public/assets/responsable.jpg` → `MEDIAS.portrait` | Régler `RESPONSABLE.cadrage` (object-position) et `zoom` |
| Avion | `public/assets/avion.svg` → `MEDIAS.avion` | PNG détouré, **nez vers la droite**, ratio ≈ 3:1 |
| Téléphone, WhatsApp, adresse, slogan | `AGENCE` | Valeurs **factices** à remplacer |
| Nom / fonction / citation du responsable | `RESPONSABLE` | |
| Musique | `public/audio/musique.mp3` → `AUDIO.musique` | Fondu entrée/sortie + baisse automatique sous la voix |
| Voix off | `public/audio/voix/01-intro.mp3`… → `VOIX_OFF[i].fichier` | Un fichier par réplique, calé sur `debut` |
| Destinations, services, avantages | `DESTINATIONS`, `SERVICES`, `AVANTAGES` | |
| Durées des scènes | `SCENES`, `TRANSITION` | La durée totale se recalcule seule |

> Un fichier audio déclaré mais absent fait échouer le rendu : laisser `null` tant qu'il n'existe pas.

## Voix off : synchronisation

Le script est dans `VOIX_OFF` (texte + frame de début, calculée depuis le début réel de chaque scène).
Enregistrez **une piste par réplique** en respectant la durée indiquée (`duree` / 30 = secondes) :
chaque piste est automatiquement posée au bon moment. Si une prise est plus longue, augmentez la
durée de la scène dans `SCENES` ; tout le reste se décale.

## Structure

```
src/
  config.ts              ← tout ce qui se remplace
  theme.ts               couleurs, polices (Montserrat / Inter via Google Fonts)
  SetVoyageAd.tsx        montage : TransitionSeries + audio + vignettage
  scenes/                1 fichier par scène (6)
  components/            Sky (nuages parallaxe), Plane, Logo, Text (révélations),
                         Media (Ken Burns, portrait circulaire), FlightRoute,
                         Transitions (zoomThrough, bands), AudioLayer, Icons
  lib/anim.ts            springs, easings, helpers
```

| # | Scène | Durée | Animations clés |
|---|---|---|---|
| 1 | Intro aérienne | 5,5 s | Traversée de nuages, avion en diagonale (motion blur), logo + rayons |
| 2 | Responsable | 6,5 s | Cadre circulaire qui se dessine, avion en orbite, 3 plans en parallaxe |
| 3 | Billets | 8 s | Carte d'embarquement en bascule 3D, cartes services en alternance |
| 4 | Destinations | 10 s | 4 villes, volets diagonaux, trajet animé le long d'un arc, Ken Burns |
| 5 | Service client | 6,5 s | Bulle de chat, coches qui se dessinent |
| 6 | Écran final | 6,5 s | Logo, slogan, panneau contact, appel à l'action pulsé |

## À valider avant diffusion

- **Photos** : ce sont des photos de banque d'images fournies en référence. Vérifier la licence.
  `responsable.jpg` est un **placeholder** (un mannequin, pas le responsable).
- **Destinations** : les photos montrent des voyageurs, pas les villes. Pour plus d'impact, remplacer
  par des photos des villes (`DESTINATIONS[i].photo`).
- **Promesses commerciales** (`SERVICES`, `AVANTAGES`) : « 7j/7 », « paiement en plusieurs fois »,
  « mobile money »… à supprimer si l'agence ne les propose pas réellement.
- **Avion et logo** : fichiers vectoriels provisoires. Un PNG d'avion photoréaliste détouré améliore
  nettement le rendu.
- Les polices sont téléchargées depuis Google Fonts au rendu : une connexion internet est nécessaire.
