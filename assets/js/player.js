import { formatTime, createQueue, currentTrack, advance, selectTrack, progress } from './player-core.js';

const audio = new Audio();
audio.preload = 'none';

let queue = createQueue([]);
let barra = null;
let chiusaDallUtente = false;

function readTracks(section) {
  return [...section.querySelectorAll('.tracce button')].map((button) => ({
    title: button.querySelector('.traccia-titolo').textContent.trim(),
    src: button.dataset.src,
    duration: Number(button.dataset.duration)
  }));
}

function buildBar() {
  if (barra) return barra;
  barra = document.createElement('div');
  barra.className = 'barra in-pausa';
  barra.hidden = true;
  barra.innerHTML = `
    <button type="button" class="barra-play" aria-label="Riproduci"></button>
    <div class="barra-testo">
      <span class="barra-titolo"></span>
      <span class="barra-tempo minuto">0:00</span>
    </div>
    <div class="barra-linea"><i></i></div>
    <button type="button" class="barra-chiudi" aria-label="Chiudi il lettore">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
        <path d="M3 3l10 10M13 3L3 13"/>
      </svg>
    </button>`;
  document.body.append(barra);

  barra.querySelector('.barra-play').addEventListener('click', toggle);
  barra.querySelector('.barra-chiudi').addEventListener('click', chiudiLettore);
  return barra;
}

function chiudiLettore() {
  if (!barra) return;
  chiusaDallUtente = true;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  queue = createQueue([]);
  barra.remove();
  barra = null;
  paintTracks();
}

function paintBar() {
  const track = currentTrack(queue);
  if (!track || !barra || chiusaDallUtente) return;
  barra.hidden = false;
  barra.querySelector('.barra-titolo').textContent = track.title;
  barra.querySelector('.barra-play').setAttribute(
    'aria-label', audio.paused ? 'Riproduci' : 'Metti in pausa'
  );
  barra.classList.toggle('in-pausa', audio.paused);
  barra.querySelector('.barra-tempo').textContent = formatTime(audio.currentTime);
  const ratio = progress(audio.currentTime, audio.duration || track.duration);
  barra.querySelector('.barra-linea i').style.transform = `scaleX(${ratio})`;
}

function paintTracks() {
  const track = currentTrack(queue);
  const suona = Boolean(track) && !audio.paused;
  document.querySelectorAll('.tracce button').forEach((button) => {
    const attiva = suona && button.dataset.src === track.src;
    button.closest('li').classList.toggle('in-ascolto', attiva);
    button.setAttribute('aria-pressed', attiva ? 'true' : 'false');
  });
}

function play(index) {
  chiusaDallUtente = false;
  queue = selectTrack(queue, index);
  const track = currentTrack(queue);
  if (!track || !track.src) return;
  if (!audio.src.endsWith(track.src)) audio.src = track.src;
  audio.play().catch(() => {});
  buildBar();
  paintBar();
  paintTracks();
}

function toggle() {
  if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  paintBar();
  paintTracks();
}

function step(direction) {
  queue = advance(queue, direction);
  play(queue.index);
}

audio.addEventListener('timeupdate', paintBar);
audio.addEventListener('play', () => { paintBar(); paintTracks(); });
audio.addEventListener('pause', () => { paintBar(); paintTracks(); });
audio.addEventListener('ended', () => step(1));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') chiudiLettore();
});

export function mountPlayer() {
  const sections = [...document.querySelectorAll('.disco')];
  if (!sections.length) return;

  sections.forEach((section) => {
    const tracks = readTracks(section);
    const ascoltabile = tracks.some((track) => track.src);

    section.querySelectorAll('.tracce button').forEach((button, index) => {
      if (!button.dataset.src) {
        button.disabled = true;
        return;
      }
      button.addEventListener('click', () => {
        const track = currentTrack(queue);
        if (track && track.src === button.dataset.src) {
          toggle();
          return;
        }
        queue = selectTrack(createQueue(tracks), index);
        play(queue.index);
      });
    });

    if (!ascoltabile) section.classList.add('senza-audio');

    section.addEventListener('keydown', (event) => {
      if (!ascoltabile) return;
      if (event.key === 'ArrowDown') { event.preventDefault(); step(1); }
      if (event.key === 'ArrowUp') { event.preventDefault(); step(-1); }
      if (event.key === 'ArrowRight') audio.currentTime += 5;
      if (event.key === 'ArrowLeft') audio.currentTime -= 5;
    });
  });

  paintTracks();
}

mountPlayer();
window.addEventListener('page:changed', mountPlayer);
