#!/usr/bin/env python3
import datetime, hashlib, pathlib, re, subprocess, sys

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

def ultima_modifica(pagina):
    relativo = str(pagina.relative_to(ROOT))
    pendente = subprocess.run(["git", "status", "--porcelain", "--", relativo],
                              cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if pendente:
        return datetime.date.today().isoformat()
    data = subprocess.run(["git", "log", "-1", "--format=%cs", "--", relativo],
                          cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return data or datetime.date.today().isoformat()

mappa = ROOT / "sitemap.xml"
if mappa.exists():
    testo = mappa.read_text(encoding="utf-8")
    originale = testo
    for pagina in pagine:
        if pagina.name == "404.html":
            continue
        canonico = re.search(r'<link rel="canonical" href="([^"]+)">', pagina.read_text(encoding="utf-8"))
        if not canonico:
            continue
        data = ultima_modifica(pagina)
        testo = re.sub(rf'(<loc>{re.escape(canonico.group(1))}</loc>\s*<lastmod>)[^<]*(</lastmod>)',
                       rf'\g<1>{data}\g<2>', testo)
    if testo != originale:
        mappa.write_text(testo, encoding="utf-8")
        print("sitemap: date aggiornate")

print(f"{cambiate} pagine aggiornate")
for relativo, impronta in impronte.items():
    print(f"  {pathlib.Path(relativo).name}: {impronta}")
