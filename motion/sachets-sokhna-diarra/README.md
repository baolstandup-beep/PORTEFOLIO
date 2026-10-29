# Sachets Super Marché Sokhna Diarra : vidéo de présentation (Remotion)

Format vertical 1080×1920 à 30 i/s, 24 s, pour les statuts WhatsApp, les Reels et TikTok. La bande-son est synthétisée à 120 BPM et toutes les coupes tombent sur la grille.

| Temps | Scène |
|---|---|
| 0–3 s | Révélation du logo, ondes de choc, « présente ses NOUVEAUX SACHETS » |
| 3–7 s | Sachet blanc, chute et balancement |
| 7–11 s | Volet circulaire orange, sachet vert en rotation 3D |
| 11–15 s | Volet vert, sachet orange |
| 15–20 s | Les trois sachets réunis : « 3 couleurs. 1 seule promesse. » |
| 20–24 s | Signature : rayons, téléphones, Touba, « Service proche & confiance » |

```bash
npm install
npx remotion studio
npx remotion render SachetsSokhnaDiarra out/sachets-sokhna-diarra.mp4
```

Les détourages (`public/sachet-*.png`, `public/logo-blanc.png`) sont générés depuis les maquettes par `scripts/cutout.py`, et la bande-son par `scripts/soundtrack.py`.
