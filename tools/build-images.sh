#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
sorgenti="assets/img/src"
destinazione="assets/img"
lavoro=$(mktemp -d)
trap 'rm -rf "$lavoro"' EXIT

if [ ! -d "$sorgenti" ]; then
  echo "manca $sorgenti" >&2
  exit 1
fi

ritagli=(
  "strumento ritratto-apertura.jpg 600x440+420+310"
  "apertura-stretta ritratto-apertura.jpg 660x853+330+0"
)

shopt -s nullglob
for originale in "$sorgenti"/*.jpg "$sorgenti"/*.jpeg "$sorgenti"/*.png; do
  cp "$originale" "$lavoro/$(basename "$originale")"
done

for riga in "${ritagli[@]}"; do
  read -r nome fonte finestra <<< "$riga"
  magick "$sorgenti/$fonte" -crop "$finestra" +repage "$lavoro/$nome.jpg"
done

for originale in "$lavoro"/*; do
  nome=$(basename "$originale")
  nome="${nome%.*}"
  larghezza_originale=$(magick identify -format "%w" "$originale")

  if [[ "$nome" == cover-* ]]; then
    trattamento=(-quality 84)
    misure=(480 640)
  else
    trattamento=(-colorspace Gray -channel RGB -level 3%,96%,1.05 +channel
                 -fill '#181310' -colorize 15 -quality 84)
    misure=(480 640 960 1280 1920)
  fi

  utili=()
  for larghezza in "${misure[@]}"; do
    if [ "$larghezza" -le "$larghezza_originale" ]; then
      utili+=("$larghezza")
    fi
  done
  if [[ "$nome" != cover-* && ! " ${utili[*]} " == *" $larghezza_originale "* ]]; then
    utili+=("$larghezza_originale")
  fi

  for larghezza in "${utili[@]}"; do
    magick "$originale" "${trattamento[@]}" -resize "${larghezza}x" \
      -strip "$destinazione/$nome-$larghezza.jpg"
    magick "$originale" "${trattamento[@]}" -resize "${larghezza}x" \
      -strip -define webp:method=6 "$destinazione/$nome-$larghezza.webp"
  done
  echo "$nome ${larghezza_originale}px"
done
