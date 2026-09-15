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
  "apertura-stretta ritratto-apertura.jpg 2063x2666+1031+0"
  "volto ritratto-apertura.jpg 1469x1563+1109+56"
  "strumento ritratto-apertura.jpg 1875x1375+1312+969"
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
    case "$nome" in
      ritratto-apertura) misure=(640 960 1280 1920 2560) ;;
      apertura-stretta)  misure=(480 640 960 1280) ;;
      *)                 misure=(480 640 960 1280) ;;
    esac
  fi

  utili=()
  for larghezza in "${misure[@]}"; do
    if [ "$larghezza" -le "$larghezza_originale" ]; then
      utili+=("$larghezza")
    fi
  done
  if [ ${#utili[@]} -eq 0 ]; then
    utili=("$larghezza_originale")
  fi

  for larghezza in "${utili[@]}"; do
    magick "$originale" "${trattamento[@]}" -resize "${larghezza}x" \
      -unsharp 0x0.7+0.6+0.02 -strip "$destinazione/$nome-$larghezza.jpg"
    magick "$originale" "${trattamento[@]}" -resize "${larghezza}x" \
      -unsharp 0x0.7+0.6+0.02 -strip -define webp:method=6 "$destinazione/$nome-$larghezza.webp"
  done
  echo "$nome ${larghezza_originale}px -> ${utili[*]}"
done
