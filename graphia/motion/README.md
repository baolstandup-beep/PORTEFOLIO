# Séquences HyperFrames

Vidéos de motion design du site, écrites en HTML et rendues avec [HyperFrames](https://github.com/heygen-com/hyperframes).
Ce dossier a ses propres dépendances : il n'est **pas** utilisé par le build Vercel. Seules les vidéos rendues
(`../public/motion/`) sont servies par le site.

| Séquence | Source | Fichiers servis | Où |
|---|---|---|---|
| Parcours IA (12 s, boucle, muette) | `parcours-ia/index.html` | `public/motion/parcours-ia.{webm,mp4}` + `-poster.webp` | Accueil, section « Votre parcours avec l'IA » |

## Modifier et re-rendre

Prérequis : Node 22+, FFmpeg, Chrome.

```bash
cd graphia/motion && npm install
```

```bash
cd parcours-ia && npx hyperframes preview
```

```bash
npx hyperframes check && npx hyperframes render -o ../renders/parcours-ia.mp4
```

Puis encoder pour le web (première image retirée pour une boucle propre) :

```bash
cd .. && ffmpeg -y -ss 0.034 -i renders/parcours-ia.mp4 -an -c:v libx264 -preset slow -crf 20 -tune animation -pix_fmt yuv420p -movflags +faststart ../public/motion/parcours-ia.mp4
```

```bash
ffmpeg -y -ss 0.034 -i renders/parcours-ia.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 30 -row-mt 1 ../public/motion/parcours-ia.webm
```

```bash
ffmpeg -y -ss 0.5 -i renders/parcours-ia.mp4 -frames:v 1 -c:v libwebp -quality 85 ../public/motion/parcours-ia-poster.webp
```

GSAP est servi localement (`parcours-ia/assets/gsap.min.js`) : le rendu ne dépend d'aucun CDN.
