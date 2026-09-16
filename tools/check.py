#!/usr/bin/env python3
import sys, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = sorted(ROOT.glob("*.html")) + sorted((ROOT / "en").glob("*.html"))
MAX_PAGE_BYTES = 60_000

problems = []

def note(page, message):
    problems.append(f"{page.relative_to(ROOT)}: {message}")

def attrs(tag):
    return dict(re.findall(r'([a-zA-Z-]+)\s*=\s*"([^"]*)"', tag))

if not PAGES:
    problems.append("nessuna pagina HTML trovata")

for page in PAGES:
    source = page.read_text(encoding="utf-8")
    base = page.parent

    if not re.search(r'<html[^>]+lang="(it|en)"', source):
        note(page, 'manca lang="it" o lang="en" su <html>')
    if '<meta charset="utf-8">' not in source:
        note(page, "manca il meta charset")
    if not re.search(r'<meta name="viewport"', source):
        note(page, "manca il meta viewport")
    if not re.search(r"<title>[^<]{5,70}</title>", source):
        note(page, "titolo assente o di lunghezza implausibile")
    if not re.search(r'<meta name="description" content="[^"]{50,170}"', source):
        note(page, "descrizione assente o di lunghezza implausibile")
    if len(source.encode()) > MAX_PAGE_BYTES:
        note(page, f"documento di {len(source.encode())} byte, oltre il limite")

    for tag in re.findall(r"<img\b[^>]*>", source):
        a = attrs(tag)
        if "alt" not in a:
            note(page, f"immagine senza alt: {tag[:70]}")
        if not a.get("width") or not a.get("height"):
            note(page, f"immagine senza width/height: {a.get('src', tag[:50])}")

    for tag in re.findall(r"<(?:a|link|script|img|source)\b[^>]*>", source):
        a = attrs(tag)
        target = a.get("href") or a.get("src") or a.get("srcset") or ""
        for candidate in [t.strip().split(" ")[0] for t in target.split(",") if t.strip()]:
            if not candidate or candidate.startswith(("http", "mailto:", "#", "data:")):
                continue
            errore = page.name == "404.html"
            if candidate.startswith("/") != errore:
                if errore:
                    note(page, f"il 404 compare a qualsiasi profondita, usare percorsi dalla radice: {candidate}")
                else:
                    note(page, f"collegamento assoluto, usare percorsi relativi: {candidate}")
                continue
            richiesto = candidate.split("#")[0].split("?")[0]
            if not richiesto:
                continue
            resolved = (ROOT / richiesto.lstrip("/")).resolve() if errore else (base / richiesto).resolve()
            alternative = [resolved, resolved.with_suffix(".html"), resolved / "index.html"]
            if not any(a.exists() for a in alternative):
                note(page, f"collegamento rotto: {candidate}")

    if page.name != "404.html":
        langs = re.findall(r'<link rel="alternate" hreflang="([a-z-]+)" href="([^"]+)"', source)
        if {code for code, _ in langs} != {"it", "en", "x-default"}:
            note(page, "hreflang incompleto: servono it, en e x-default")

def blocco(source, apertura, chiusura):
    trovato = re.search(apertura + r".*?" + chiusura, source, re.S)
    if not trovato:
        return None
    testo = trovato.group(0)
    testo = re.sub(r'(href|src)="[^"]*"', r'\1=""', testo)
    return re.sub(r"\s+", " ", testo).strip()

for lingua, pagine in (("it", [p for p in PAGES if p.parent == ROOT]),
                       ("en", [p for p in PAGES if p.parent != ROOT])):
    riferimento = None
    for page in pagine:
        source = page.read_text(encoding="utf-8")
        for nome, apertura, chiusura in (("testata", r"<header", r"</header>"),
                                         ("piede", r"<footer", r"</footer>")):
            corrente = blocco(source, apertura, chiusura)
            if corrente is None:
                note(page, f"manca il blocco {nome}")
                continue
            chiave = (lingua, nome)
            if riferimento is None:
                riferimento = {}
            if chiave not in riferimento:
                riferimento[chiave] = (corrente, page)
            elif riferimento[chiave][0] != corrente:
                note(page, f"{nome} diversa da {riferimento[chiave][1].name}")

REQUIRED_FONTS = [
    "assets/fonts/newsreader-300.woff2",
    "assets/fonts/newsreader-300-italic.woff2",
    "assets/fonts/newsreader-500.woff2",
    "assets/fonts/archivo-400.woff2",
    "assets/fonts/archivo-500.woff2",
    "assets/fonts/instrument-serif.woff2",
    "assets/fonts/OFL.txt",
]
for relative in REQUIRED_FONTS:
    if not (ROOT / relative).exists():
        problems.append(f"file mancante: {relative}")

for problem in problems:
    print(problem)
print(f"{len(PAGES)} pagine controllate, {len(problems)} problemi")
sys.exit(1 if problems else 0)
