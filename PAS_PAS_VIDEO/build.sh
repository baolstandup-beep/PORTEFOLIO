#!/usr/bin/env bash
# build.sh — mixage audio + exports finaux (TikTok, Instagram Reels, WhatsApp Status, horizontal).
#
#   ./build.sh                 mixe sound_design/music.wav + les voix off présentes dans voice_over/
#                              puis muxe avec les vidéos rendues (out/PAS_PAS_VIDEO/video_*.mp4)
#
# Voix off : déposez un fichier par scène dans voice_over/ (mp3 ou wav). Seuls les fichiers présents
# sont utilisés ; la musique baisse automatiquement sous la voix (ducking), elle ne la couvre jamais.
#   vo_scene_01_intro.*        posé à  2.0 s
#   vo_scene_02_naufrage.*     posé à  7.0 s
#   vo_scene_03_hommage.*      posé à 14.6 s
#   vo_scene_04_solidarite.*   posé à 27.6 s
#   vo_scene_05_prevention.*   posé à 39.6 s
#   vo_scene_06_conclusion.*   posé à 50.8 s
# Le texte exact à enregistrer est dans voice_over/script_voix_off.md.
set -euo pipefail
cd "$(dirname "$0")"
ROOT=..
REND="$ROOT/out/PAS_PAS_VIDEO"
NAME="PAS-PAS_naufrage_Lompoul"
mkdir -p sound_design exports/{tiktok,instagram,whatsapp,horizontal}

[ -f sound_design/music.wav ] || uv run -q sound_design/score.py

# ---------------------------------------------------------------- voix off
declare -A OFF=( [01_intro]=2.0 [02_naufrage]=7.0 [03_hommage]=14.6 [04_solidarite]=27.6 [05_prevention]=39.6 [06_conclusion]=50.8 )
inputs=(-i sound_design/music.wav); chains=""; labels=""; n=0
for k in 01_intro 02_naufrage 03_hommage 04_solidarite 05_prevention 06_conclusion; do
  f=$(ls voice_over/vo_scene_${k}.* 2>/dev/null | head -1 || true)
  [ -n "$f" ] || continue
  n=$((n+1)); inputs+=(-i "$f")
  ms=$(python3 -c "print(int(${OFF[$k]}*1000))")
  chains+="[$n:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,adelay=${ms}|${ms}[v$n];"
  labels+="[v$n]"
  echo "voix off : $f  @ ${OFF[$k]} s"
done

if [ "$n" -gt 0 ]; then
  fc="${chains}${labels}amix=inputs=$n:normalize=0,apad=whole_dur=60,volume=1.6[vo];[vo]asplit[vo1][vo2];"
  fc+="[0:a]aformat=channel_layouts=stereo[mus];[mus][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=600:makeup=1[duck];"
  fc+="[duck][vo2]amix=inputs=2:normalize=0,atrim=0:60[pre]"
else
  echo "aucune voix off trouvée : version musicale"
  fc="[0:a]atrim=0:60[pre]"
fi
ffmpeg -hide_banner -loglevel error -y "${inputs[@]}" -filter_complex "$fc" -map "[pre]" -ar 48000 sound_design/premix.wav
# mastering : -14 LUFS intégré, -1 dBTP (normes TikTok / Instagram / YouTube)
ffmpeg -hide_banner -loglevel error -y -i sound_design/premix.wav -af "loudnorm=I=-14:TP=-1:LRA=11,aresample=48000" sound_design/mix_master.wav
ffmpeg -hide_banner -loglevel error -y -i sound_design/mix_master.wav assets/audio/bande_son_master.flac
ffmpeg -hide_banner -i sound_design/mix_master.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1

# ---------------------------------------------------------------- exports (H.264 / AAC, 30 i/s, faststart)
enc() { # src out crf maxrate
  ffmpeg -hide_banner -loglevel error -y -i "$1" -i sound_design/mix_master.wav -map 0:v -map 1:a \
    -c:v libx264 -preset slow -profile:v high -level 4.2 -pix_fmt yuv420p -r 30 -crf "$3" -maxrate "$4" -bufsize "$4" \
    -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$2"
  echo "-> $2 ($(du -h "$2" | cut -f1))"
}
V=$REND/video_9x16.mp4; HZ=$REND/video_16x9.mp4
[ -f "$V" ]  && { enc "$V" "exports/tiktok/${NAME}_TikTok_1080x1920.mp4" 18 14M
                  cp "exports/tiktok/${NAME}_TikTok_1080x1920.mp4" "exports/instagram/${NAME}_Reels_1080x1920.mp4"
                  enc "$V" "exports/whatsapp/${NAME}_Status_1080x1920.mp4" 24 3500k; }
[ -f "$HZ" ] && enc "$HZ" "exports/horizontal/${NAME}_1920x1080.mp4" 18 14M
echo ok
