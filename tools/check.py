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
            if candidate.startswith("/"):
                note(page, f"collegamento assoluto, usare percorsi relativi: {candidate}")
                continue
            resolved = (base / candidate.split("#")[0]).resolve()
            if not resolved.exists():
                note(page, f"collegamento rotto: {candidate}")

    langs = re.findall(r'<link rel="alternate" hreflang="([a-z-]+)" href="([^"]+)"', source)
    if {code for code, _ in langs} != {"it", "en", "x-default"}:
        note(page, "hreflang incompleto: servono it, en e x-default")

REQUIRED_FONTS = [
    "assets/fonts/newsreader-200.woff2",
    "assets/fonts/newsreader-300.woff2",
    "assets/fonts/newsreader-300-italic.woff2",
    "assets/fonts/archivo-400.woff2",
    "assets/fonts/archivo-500.woff2",
    "assets/fonts/OFL.txt",
]
for relative in REQUIRED_FONTS:
    if not (ROOT / relative).exists():
        problems.append(f"file mancante: {relative}")

for problem in problems:
    print(problem)
print(f"{len(PAGES)} pagine controllate, {len(problems)} problemi")
sys.exit(1 if problems else 0)
