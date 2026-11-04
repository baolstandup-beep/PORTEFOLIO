# Hook reel — extrait IYAT TV (Remotion)

Format vertical 1080×1920, 30 i/s, durée calée sur le clip source (24,8 s).

## Contenu
- Titre d'accroche animé mot par mot, mots-clés surlignés en or
- Clip source centré, avec zooms « punch-in » sur les temps forts
- Fond flouté issu du clip, pastille « En direct », forme d'onde audio, barre de progression
- Appel à l'action sur les 2,6 dernières secondes

## Utilisation
1. Déposer le clip dans `public/source.mp4` (non versionné), puis extraire l'audio pour la forme d'onde :
   `ffmpeg -i public/source.mp4 -vn -ac 1 -ar 22050 public/source-audio.wav`
2. `npm install`
3. `npm run studio` pour prévisualiser et modifier les textes (props `hookLines`, `highlight`, `badge`, `teaser`, `cta`)
4. `npm run render` → `out/hook-reel.mp4`

Changer de clip : ajuster `DURATION` dans `src/Root.tsx` et les temps `PUNCHES` dans `src/HookReel.tsx`.
