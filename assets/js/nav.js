const parser = new DOMParser();
const cache = new Map();

document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((icona) => {
  icona.href = icona.href;
});

const osservatoreTestata = typeof ResizeObserver === 'function'
  ? new ResizeObserver(([voce]) => {
    const altezza = Math.ceil(voce.target.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--altezza-testata', altezza + 'px');
  })
  : null;

function osservaTestata() {
  const testata = document.querySelector('.testata');
  if (!testata || !osservatoreTestata) return;
  osservatoreTestata.disconnect();
  osservatoreTestata.observe(testata);
}

osservaTestata();

async function fetchPage(url) {
  if (cache.has(url)) return cache.get(url);
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(String(response.status));
  const documento = parser.parseFromString(await response.text(), 'text/html');
  cache.set(url, documento);
  return documento;
}

function versioniRisorse(documento) {
  return [...documento.querySelectorAll('link[rel="stylesheet"], script[src]')]
    .map((e) => e.getAttribute('href') || e.getAttribute('src') || '')
    .filter((indirizzo) => !/^(https?:)?\/\//.test(indirizzo))
    .map((indirizzo) => indirizzo.split('/').pop())
    .sort()
    .join('|');
}

function inAscolto() {
  return Boolean(document.querySelector('.barra:not(.in-pausa):not(.in-uscita)'));
}

function aggiornaStile(incoming, url) {
  const nuovo = incoming.querySelector('link[rel="stylesheet"]');
  const vecchio = document.querySelector('link[rel="stylesheet"]');
  if (!nuovo || !vecchio) return;
  const indirizzo = new URL(nuovo.getAttribute('href'), url).href;
  if (vecchio.href === indirizzo) return;
  const foglio = document.createElement('link');
  foglio.rel = 'stylesheet';
  foglio.href = indirizzo;
  foglio.addEventListener('load', () => vecchio.remove(), { once: true });
  vecchio.after(foglio);
}

function sostituisci(selettore, incoming) {
  const nuovo = incoming.querySelector(selettore);
  const vecchio = document.querySelector(selettore);
  if (!nuovo || !vecchio) return false;
  vecchio.replaceWith(nuovo.cloneNode(true));
  return true;
}

async function go(url, push) {
  const incoming = await fetchPage(url);
  if (!incoming.querySelector('main')) throw new Error('pagina senza contenuto');

  if (versioniRisorse(incoming) !== versioniRisorse(document)) {
    if (!inAscolto()) {
      location.href = url;
      return;
    }
    aggiornaStile(incoming, url);
  }

  if (push) history.pushState({}, '', url);

  document.title = incoming.title;
  document.documentElement.lang = incoming.documentElement.lang;

  sostituisci('.testata', incoming);
  osservaTestata();
  sostituisci('main', incoming);
  sostituisci('.piede', incoming);

  document.body.classList.add('gia-navigato');
  const ancora = new URL(url, location.href).hash.slice(1);
  const bersaglio = ancora ? document.getElementById(ancora) : null;
  if (bersaglio) bersaglio.scrollIntoView({ behavior: 'auto', block: 'start' });
  else window.scrollTo({ top: 0 });
  window.dispatchEvent(new CustomEvent('page:changed'));
}

function interno(link) {
  if (link.origin !== location.origin) return false;
  if (link.hasAttribute('download') || link.target) return false;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('#') || href.startsWith('mailto:')) return false;
  const ultimo = link.pathname.split('/').pop();
  if (!ultimo) return true;
  if (ultimo.endsWith('.html')) return true;
  return !ultimo.includes('.');
}

function scorriVerso(selettore) {
  const bersaglio = document.querySelector(selettore);
  if (!bersaglio) return false;
  const fermo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  bersaglio.scrollIntoView({ behavior: fermo ? 'auto' : 'smooth', block: 'start' });
  history.replaceState({}, '', selettore);
  return true;
}

document.addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const link = event.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  if (href.length > 1 && href.startsWith('#') && link.origin === location.origin) {
    if (scorriVerso(href)) event.preventDefault();
    return;
  }

  if (!interno(link)) return;

  const destinazione = new URL(link.href);
  if (destinazione.hash && destinazione.pathname === location.pathname) {
    if (scorriVerso(destinazione.hash)) event.preventDefault();
    return;
  }

  event.preventDefault();
  go(link.href, true).catch(() => { location.href = link.href; });
});

window.addEventListener('popstate', () => {
  go(location.href, false).catch(() => location.reload());
});
