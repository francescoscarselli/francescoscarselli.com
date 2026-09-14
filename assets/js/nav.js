const parser = new DOMParser();
const cache = new Map();

async function fetchPage(url) {
  if (cache.has(url)) return cache.get(url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(String(response.status));
  const documento = parser.parseFromString(await response.text(), 'text/html');
  cache.set(url, documento);
  return documento;
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

  if (push) history.pushState({}, '', url);

  document.title = incoming.title;
  document.documentElement.lang = incoming.documentElement.lang;

  sostituisci('.testata', incoming);
  sostituisci('main', incoming);
  sostituisci('.piede', incoming);

  window.scrollTo({ top: 0 });
  window.dispatchEvent(new CustomEvent('page:changed'));
}

function interno(link) {
  if (link.origin !== location.origin) return false;
  if (link.hasAttribute('download') || link.target) return false;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('#') || href.startsWith('mailto:')) return false;
  return link.pathname.endsWith('.html') || link.pathname.endsWith('/');
}

document.addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const link = event.target.closest('a');
  if (!link || !interno(link)) return;

  event.preventDefault();
  go(link.href, true).catch(() => { location.href = link.href; });
});

window.addEventListener('popstate', () => {
  go(location.href, false).catch(() => location.reload());
});
