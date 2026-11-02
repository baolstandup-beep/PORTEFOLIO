# ÑAYLER — animation du flyer IYAT TV (Remotion)

Bande-annonce de 15 s (30 fps, H.264 + AAC) générée à partir du flyer original.
Aucun portrait, logo ou texte n'est recréé par IA : chaque calque animé est une
**découpe exacte** du flyer (`public/flyer.jpg`), et le flyer original intact
repasse au premier plan en scène 5 (fidélité pixel garantie sur le plan final).

## Rendus

| Fichier | Format | Remarque |
|---|---|---|
| `renders/nayler-960x1600.mp4` | 960×1600 (3:5) | Format demandé. Le flyer (960×1280) est posé à l'échelle 1, centré ; les bandes haut/bas (160 px) prolongent le fond flouté. |
| `renders/nayler-960x1280.mp4` | 960×1280 (3:4) | Format natif du flyer, plein cadre. |

## Commandes

```bash
npm install
npm run dev            # Remotion Studio (prévisualisation)
npm run render         # MP4 960×1600 -> renders/
npm run render:native  # MP4 960×1280 -> renders/
npm run audio          # régénère public/audio/soundtrack.wav (Python 3 + numpy)
```

Réseau restreint (Remotion ne peut pas télécharger son navigateur) :
`REMOTION_BROWSER=/chemin/vers/chrome-headless-shell npm run render`

## Scénario (frames @30 fps — `src/timeline.ts`)

| Scène | Temps | Contenu |
|---|---|---|
| 1 Intro | 0–2 s | fondu depuis le blanc, balayage lumineux, rubans verts/blancs, révélation du logo IYAT TV |
| 2 Présentateurs | 2–5 s | portraits en parallaxe 2.5D, logo PAS-PAS, badges noms/fonctions, reflet sur les tenues |
| 3 Titre | 5–8 s | impact du titre (spring + secousse caméra contrôlée), rotation/rebond du micro, lumière traversant les lettres |
| 4 Rendez-vous | 8–11 s | bandeau en volet, pop du calendrier, MARDI, horloge qui tourne, révélation type compteur et pulsation de 20H00 |
| 5 Signature | 11–15 s | logo du bas, retour du flyer original intégral, halo + reflet sur le logo, zoom lent 1→1.03, visuel complet tenu ~2,8 s, fondu au blanc |

## Structure

- `src/regions.ts` — coordonnées de chaque élément dans le flyer (à ajuster si le flyer change)
- `src/timeline.ts` — tous les timings
- `src/Scenes.tsx` — un composant par calque animé
- `src/components/FlyerCrop.tsx` — calque = découpe du flyer (masques, polygones, glissements internes)
- `scripts/make_plates.py` — « clean plate » du bandeau (texte effacé par interpolation du dégradé) pour révéler MARDI / 20H00 sans doublon
- `scripts/generate_audio.py` — musique afro instrumentale + whooshes + impact + signature, 100 % synthétisés (aucun sample sous licence)

## Limites connues

- Le titre du flyer est écrit « NAYLER » (sans tilde) : il est conservé tel quel.
- La bande-son est synthétisée par code : propre et libre de droits, mais pas du niveau d'une musique composée. Remplacer `public/audio/soundtrack.wav` par une piste sous licence pour une diffusion TV.
