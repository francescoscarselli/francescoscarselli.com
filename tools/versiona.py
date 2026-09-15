#!/usr/bin/env python3
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
RISORSE = ["assets/css/site.css", "assets/js/player.js", "assets/js/player-core.js",
           "assets/js/nav.js", "assets/js/video.js", "assets/js/consenso.js",
           "assets/img/marchi/bugari-armando.png", "assets/img/marchi/worldwide-accordionists.png"]

impronte = {}
for relativo in RISORSE:
    percorso = ROOT / relativo
    if percorso.exists():
        impronte[relativo] = hashlib.sha1(percorso.read_bytes()).hexdigest()[:8]

pagine = sorted(ROOT.glob("*.html")) + sorted((ROOT / "en").glob("*.html"))
cambiate = 0
for pagina in pagine:
    testo = pagina.read_text(encoding="utf-8")
    originale = testo
    for relativo, impronta in impronte.items():
        testo = re.sub(rf'((?:\.\./)?{re.escape(relativo)})(\?v=[0-9a-f]+)?', rf'\g<1>?v={impronta}', testo)
    if testo != originale:
        pagina.write_text(testo, encoding="utf-8")
        cambiate += 1

print(f"{cambiate} pagine aggiornate")
for relativo, impronta in impronte.items():
    print(f"  {pathlib.Path(relativo).name}: {impronta}")
