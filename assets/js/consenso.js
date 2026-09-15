const MISURAZIONE = 'G-MGKRQP3WTJ';

const CHIAVE = 'statistiche';
const TESTI = {
  it: {
    testo: 'Questo sito può usare Google Analytics per contare le visite in forma aggregata.',
    informativa: 'Come funziona',
    accetta: 'Accetta',
    rifiuta: 'Rifiuta',
    pagina: 'privacy'
  },
  en: {
    testo: 'This site may use Google Analytics to count visits in aggregate form.',
    informativa: 'How it works',
    accetta: 'Accept',
    rifiuta: 'Decline',
    pagina: 'privacy'
  }
};

function lingua() {
  return document.documentElement.lang === 'en' ? 'en' : 'it';
}

function scelta() {
  try {
    return localStorage.getItem(CHIAVE);
  } catch {
    return null;
  }
}

function ricorda(valore) {
  try {
    localStorage.setItem(CHIAVE, valore);
  } catch {
    return;
  }
}

function avviaStatistiche() {
  if (!MISURAZIONE || window.dataLayer) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MISURAZIONE}`;
  document.head.append(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MISURAZIONE, { anonymize_ip: true });
}

function misuraBanner() {
  const banner = document.querySelector('.consenso');
  const altezza = banner ? Math.ceil(banner.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty('--spazio-banner', altezza + 'px');
}

function chiudiBanner() {
  document.querySelector('.consenso')?.remove();
  misuraBanner();
}

function mostraBanner() {
  if (document.querySelector('.consenso')) return;
  const t = TESTI[lingua()];
  const dentroEn = location.pathname.includes('/en/');
  const indirizzo = (lingua() === 'en' && !dentroEn) ? 'en/privacy.html'
    : (lingua() === 'it' && dentroEn) ? '../privacy.html'
    : t.pagina;

  const banner = document.createElement('div');
  banner.className = 'consenso';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Statistiche');

  const testo = document.createElement('p');
  testo.textContent = t.testo + ' ';
  const link = document.createElement('a');
  link.href = indirizzo;
  link.textContent = t.informativa;
  testo.append(link);

  const azioni = document.createElement('div');
  azioni.className = 'consenso-azioni';

  const rifiuta = document.createElement('button');
  rifiuta.type = 'button';
  rifiuta.className = 'bottone tenue';
  rifiuta.textContent = t.rifiuta;
  rifiuta.addEventListener('click', () => { ricorda('no'); chiudiBanner(); });

  const accetta = document.createElement('button');
  accetta.type = 'button';
  accetta.className = 'bottone';
  accetta.textContent = t.accetta;
  accetta.addEventListener('click', () => { ricorda('si'); chiudiBanner(); avviaStatistiche(); });

  azioni.append(rifiuta, accetta);
  const dentro = document.createElement('div');
  dentro.className = 'consenso-dentro';
  dentro.append(testo, azioni);
  banner.append(dentro);
  document.body.append(banner);
  misuraBanner();
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(misuraBanner).observe(banner);
  }
  window.addEventListener('resize', misuraBanner);
}

export function riapriScelta() {
  try {
    localStorage.removeItem(CHIAVE);
  } catch {
    mostraBanner();
    return;
  }
  mostraBanner();
}

function avvia() {
  if (!MISURAZIONE) return;
  const decisione = scelta();
  if (decisione === 'si') avviaStatistiche();
  else if (decisione !== 'no') mostraBanner();
}

document.addEventListener('click', (event) => {
  const richiesta = event.target.closest('[data-preferenze]');
  if (!richiesta) return;
  event.preventDefault();
  riapriScelta();
});

avvia();
