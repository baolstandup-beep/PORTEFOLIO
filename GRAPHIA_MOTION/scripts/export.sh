#!/usr/bin/env bash
# Range les rendus de out/ dans exports/ (MP4 H.264 + AAC 48 kHz, faststart pour le web).
set -euo pipefail
cd "$(dirname "$0")/.."
# Remotion produit du yuvj420p (plage « full ») : conversion en yuv420p plage TV standard (compatibilité plateformes).
declare -A DONE
remux() {
  local key="$1"
  if [ -z "${DONE[$key]:-}" ]; then
    ffmpeg -v error -y -i "$1" -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 16 \
      -profile:v high -level 4.1 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
      -c:a copy -movflags +faststart "$2"
    DONE[$key]="$2"
  else
    cp "${DONE[$key]}" "$2"
  fi
  echo "→ $2"
}
[ -f out/GRAPHIA-60-H.mp4 ] && {
  remux out/GRAPHIA-60-H.mp4 exports/master/GRAPHIA2026_Film_60s_1920x1080.mp4
  remux out/GRAPHIA-60-H.mp4 exports/youtube/GRAPHIA2026_YouTube-Presentation_60s_1920x1080.mp4
}
[ -f out/GRAPHIA-60-V.mp4 ] && {
  remux out/GRAPHIA-60-V.mp4 exports/master/GRAPHIA2026_Film_60s_1080x1920.mp4
  remux out/GRAPHIA-60-V.mp4 exports/tiktok/GRAPHIA2026_TikTok_60s_1080x1920.mp4
  remux out/GRAPHIA-60-V.mp4 exports/instagram/GRAPHIA2026_Reels_60s_1080x1920.mp4
}
[ -f out/GRAPHIA-30-H.mp4 ] && remux out/GRAPHIA-30-H.mp4 exports/short/GRAPHIA2026_Court_30s_1920x1080.mp4
[ -f out/GRAPHIA-30-V.mp4 ] && {
  remux out/GRAPHIA-30-V.mp4 exports/short/GRAPHIA2026_Court_30s_1080x1920.mp4
  remux out/GRAPHIA-30-V.mp4 exports/instagram/GRAPHIA2026_Reels_30s_1080x1920.mp4
  remux out/GRAPHIA-30-V.mp4 exports/tiktok/GRAPHIA2026_TikTok_30s_1080x1920.mp4
  # Statut WhatsApp : 30 s (passe sur toutes les versions de l'app), fichier allégé — WhatsApp recompresse de toute façon
  ffmpeg -v error -y -i out/GRAPHIA-30-V.mp4 -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -level 4.1 \
    -c:a aac -b:a 160k -ar 48000 -movflags +faststart exports/whatsapp/GRAPHIA2026_WhatsApp-Statut_30s_1080x1920.mp4
  echo "→ exports/whatsapp/GRAPHIA2026_WhatsApp-Statut_30s_1080x1920.mp4"
}
