#!/usr/bin/env bash
# Télécharge les 12 plans générés avec Higgsfield (Kling 3.0 Pro) dans public/assets/videos/.
# Les liens CDN peuvent expirer : en cas d'erreur, re-télécharger les plans depuis
# la bibliothèque Higgsfield et les renommer comme ci-dessous.
set -euo pipefail
cd "$(dirname "$0")/../public/assets/videos"
B=https://d8j0ntlcm91z4.cloudfront.net/user_3Bj8idyIKworgY673qFnl1G5sfi
while read -r name file; do
  [ -z "$name" ] && continue
  echo "→ $name"
  curl -fSL --retry 3 -o "$name" "$B/$file.mp4"
done <<'LIST'
01-porte-conteneurs.mp4 hf_20261006_131904_dcc59896-f010-46a4-a53c-1f568ff7c5c5
02-avion-cargo.mp4 hf_20261006_131904_e9cd937e-c7e7-4fc8-8d6e-5206f2030d28
03-terminal-portuaire.mp4 hf_20261006_131916_6ccd0a6d-3a2a-45ea-b6c1-d7223e077de3
04-camion-autoroute.mp4 hf_20261006_131918_e163cb89-71c0-4619-bf3c-962fa9d3f0d7
05-commercant.mp4 hf_20261006_131904_81782233-0c4c-4661-ac38-5c8228acdf3b
06-controle-documents.mp4 hf_20261006_131905_121af1ab-e402-495c-844d-c33ec7bbabf6
07-scelle-conteneur.mp4 hf_20261006_131924_d157fe4c-2f6e-4dc3-a409-4fdb929c9655
08-agent-setrans.mp4 hf_20261006_131905_71d8cb0d-d4d3-4b20-a177-39a634841e25
09-equipe-bureau.mp4 hf_20261006_131930_ddec4e2a-6625-4e1c-8d7c-3e318d72bfae
10-poignee-de-main.mp4 hf_20261006_131924_3daf4a22-234b-4262-a9a4-035377368314
11-reception-marchandise.mp4 hf_20261006_131904_477a4632-ae0b-4295-9899-0bcae37aca08
12-route-touba.mp4 hf_20261006_131904_a890c178-dbee-45ff-9b31-5f7cd17f7a66
LIST
echo "OK — 12 plans prêts."
