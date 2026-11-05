# Vidéo motion design : Inauguration Daara Tànneef (Touba Ça Kanam)

Publicité verticale 9:16, 1080×1920, 30 fps, 40 s, H.264, faite avec React et Remotion à partir de l'affiche originale (`public/assets/affiche.jpg`).

## Commandes

```bash
npm install
npm run studio   # aperçu interactif (Remotion Studio)
npm run audio    # régénère bande-son.wav (musique + bruitages) et bruitages.wav (bruitages seuls)
npm run render   # rend toutes les versions dans out/
```

## Livrables (`out/`, non versionné)

| Fichier | Usage |
|---|---|
| `daara-tanneef_master_1080x1920.mp4` | Master haute qualité (CRF 16), avec musique |
| `daara-tanneef_sans-musique_1080x1920.mp4` | Même image, piste audio silencieuse |
| `daara-tanneef_bruitages-sans-musique_1080x1920.mp4` | Bruitages seuls, sans musique : whooshes, impacts, montée, pops, tics du compteur |
| `daara-tanneef_bruitages_reseaux-sociaux.mp4` / `…_bruitages_whatsapp_720x1280.mp4` | Version bruitages déclinée pour les réseaux et WhatsApp |
| `daara-tanneef_reseaux-sociaux_instagram-tiktok-facebook.mp4` | Reels, TikTok, Facebook : H.264 High 4.1, ≤ 8 Mb/s, faststart |
| `daara-tanneef_whatsapp_720x1280.mp4` | WhatsApp (statut et envoi) : 720p, ~11 Mo, sous la limite de 16 Mo |

## Structure

- `src/timeline.ts` : découpage des 7 scènes, en frames.
- `src/scenes/S1Intro … S7Final` : une scène par fichier.
- `src/components/` : fond et particules, animations de texte (lettres, mots, reflet doré, filet), logo, icônes, fondu enchaîné.
- `public/assets/` : éléments extraits de l'affiche. Le logo, le bâtiment détouré et les QR codes sont des découpes de l'original : rien n'est redessiné.
- `scripts/generate_audio.py` : bande-son originale synthétisée (pad, arpèges, percussions inspirées du djembé, whooshes, impacts, montée), avec un niveau intégré d'environ −15 LUFS.

## Vérifications faites

- Les deux QR codes décodent dans le master **et** dans la version WhatsApp. Wave : `pay.wave.com/m/M_MWpn9-lb-6Zo`. Orange Money : marchand `410818` « TOUBA CA KANAM ».
- Le 08/11/2026 tombe bien un dimanche.
