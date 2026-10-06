# SETRANS — Film de lancement (90 s)

Film institutionnel motion design pour le lancement officiel de **SETRANS**
(Transit · Transport · Logistique). 16:9, 1920 × 1080, 30 fps, export MP4.

Le film combine :

- **12 plans cinéma générés avec Higgsfield** (Kling 3.0 Pro, 6 s chacun) :
  porte-conteneurs, avion cargo, port, camion, commerçant, contrôle documentaire,
  scellé, agent SETRANS, équipe, poignée de main, réception de marchandise, route vers Touba ;
- **du motion design codé** avec [Remotion](https://www.remotion.dev) (React) : globe,
  cartes, séquence douanière, conteneur sécurisé, chaîne logistique, carte Dakar → Touba,
  interface de suivi, Touba connectée au monde, particules et révélation du logo.

## Démarrage

```bash
cd setrans-video
npm install
npm run fetch-media   # télécharge les plans Higgsfield, la musique et la voix off
npm run studio        # prévisualisation interactive (timeline, scènes nommées)
npm run render        # export final 16:9 → out/setrans-lancement.mp4
npm run render:vertical  # version téléphone 9:16 (1080×1920) → out/setrans-lancement-9x16.mp4
```

Le rendu inclut les effets sonores (générés automatiquement avant chaque rendu).
`npm run render:muet` exporte l'image seule ; `npm run render:audio` exporte la piste
d'effets seule en WAV (`out/setrans-sfx.wav`) pour la mixer avec la musique et la voix off.

`npm run render:draft` produit un brouillon en demi-résolution, plus rapide.
`npm run stills -- 90 840 2650` rend des images de contrôle dans `out/stills/`.

## Organisation

```
setrans-video/
├── public/assets/          ← zone de dépôt des médias
│   ├── logo/               logo SETRANS (PNG/SVG transparent)
│   ├── images/             images complémentaires
│   ├── videos/             plans vidéo (Higgsfield)
│   ├── sfx/                effets sonores (générés par `npm run sfx`)
│   ├── music/              musique
│   └── voiceover/          voix off
├── src/
│   ├── config/setrans.config.ts   ← TOUS les réglages (voir ci-dessous)
│   ├── scenes/             une scène = un fichier (S01Globe.tsx … S16Logo.tsx)
│   ├── components/         briques réutilisables (fonds, plans vidéo, cartes, pictos)
│   ├── lib/                animations (easing, progressions) et données géographiques
│   ├── SetransFilm.tsx     assemblage : scènes, fondus enchaînés, pistes audio
│   └── Root.tsx            composition Remotion (format, fps, durée)
└── scripts/                téléchargement des plans, images de contrôle
```

## Fichier de configuration

`src/config/setrans.config.ts` regroupe :

| Bloc | Contenu |
|------|---------|
| `VIDEO` | résolution, fps, durée totale, durée des fondus |
| `COLORS` | bleu SETRANS `#1C3F88`, bleu nuit, blanc, gris… |
| `FONTS` / `TYPE` | polices (Montserrat, Inter) et tailles des titres |
| `TEXTS` | tous les textes affichés |
| `ASSETS` | chemins du logo, de la musique, de la voix off et des 12 plans |
| `SCENES` | début et durée de chaque scène (secondes) |
| `VOICEOVER_SCRIPT` | script wolof minuté (repère d'enregistrement, sous-titres optionnels) |
| `SFX` | effets sonores : volume général, liste des repères (fichier, instant, volume, fondus) |
| `PLACES` | coordonnées de Dakar, Touba et des villes reliées |

### Ajouter le logo, la musique et la voix off

1. Déposer les fichiers dans `public/assets/logo/`, `music/`, `voiceover/`.
2. Renseigner les chemins dans `ASSETS` :

```ts
logo: 'assets/logo/setrans-logo.png',
music: 'assets/music/theme.mp3',
voiceover: 'assets/voiceover/voix-off.wav',
```

Sans logo, un logo typographique SETRANS est utilisé. Musique et voix off sont
des pistes séparées, calées sur 0 s : on peut aussi exporter la vidéo muette et
mixer le son dans un logiciel de montage.

## Découpage

| # | Temps | Scène |
|---|-------|-------|
| 01 | 0–6 s | Noir → globe, lignes entre continents, plongée vers l'océan |
| 02 | 6–12 s | Porte-conteneurs à l'aube, trajectoire maritime |
| 03 | 12–18 s | Avion cargo, trajectoires internationales sur la carte |
| 04 | 18–24 s | Terminal portuaire actif → commerçant |
| 05 | 24–30 s | Douane : DOSSIER → CONTRÔLE → VALIDATION → AUTORISATION |
| 06 | 30–36 s | Scellé posé → conteneur sécurisé, cadenas, suivi numérique |
| 07 | 36–42 s | Camion → la route devient une ligne → silhouette du Sénégal |
| 08 | 42–48 s | Agent SETRANS → SETRANS et ses trois pôles |
| 09 | 48–54 s | Chaîne : NAVIRE → PORT → DOUANE → CONTENEUR → CAMION → CLIENT |
| 10 | 54–60 s | Carte du Sénégal, Dakar → Touba (pulsation sur Touba) |
| 11 | 60–66 s | Interface de suivi : DOSSIER REÇU → … → LIVRÉ |
| 12 | 66–72 s | Poignée de main → réception, pictogrammes sur courbe de croissance |
| 13 | 72–78 s | Camion vers Touba, parallaxe, indicateur d'itinéraire |
| 14 | 78–83 s | Touba connectée au Sénégal, à l'Afrique, l'Europe, l'Asie, l'Amérique |
| 15 | 83–86 s | Silence visuel, particules qui convergent |
| 16 | 86–90 s | Logo, TOUBA. CONNECTÉE AU MONDE., signature — maintien ~2 s |

## Effets sonores

25 sons synthétisés par `scripts/generate-sfx.mjs` (libres de droits, sans dépendance) :
whoosh, risers, impacts graves, impact final, tics et pops d'interface, confirmation,
tampon, verrou, fermeture de porte de conteneur, scintillements, flux de données, et
ambiances océan, avion, port, camion, vent.

Ils sont posés sur les animations via le bloc `SFX` de la config (environ 80 repères).
Pour ajuster : modifier `at` (instant), `volume`, ou supprimer une ligne. Quand la
musique et la voix off seront ajoutées, baisser `SFX.master` (vers 0,5–0,6).
Pour utiliser vos propres bruitages : déposer un `.wav` dans `public/assets/sfx/`,
ajouter sa durée dans `src/config/sfx-durations.ts`, puis le référencer dans `SFX.cues`.

## Version téléphone (9:16)

La composition `SetransFilmVertical` (1080 × 1920) réutilise les mêmes scènes : chaque
scène lit le format courant (`useLayout()` dans `src/lib/layout.ts`) et adapte sa
mise en page — chaîne logistique verticale, interface de suivi façon application mobile,
plan documentaire en haut et étapes douanières dessous, carte et pôles recentrés. Les plans
vidéo sont recadrés automatiquement au centre. Son, musique et voix off sont identiques.
