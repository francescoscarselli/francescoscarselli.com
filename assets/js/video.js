document.addEventListener('click', (event) => {
  const link = event.target.closest('.video a');
  if (!link) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

  const article = link.closest('.video');
  const identificativo = article.dataset.youtube;
  if (!identificativo) return;

  event.preventDefault();
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${identificativo}?autoplay=1`;
  frame.title = link.querySelector('span').textContent;
  frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  article.replaceChildren(frame);
});

function preparaPresentazione() {
  const video = document.querySelector('.video-principale video');
  if (!video || video.dataset.pronto) return;
  video.dataset.pronto = 'si';

  const invito = document.querySelector('.video-principale .avviso-audio');

  const accendiAudio = () => {
    if (!video.muted) return;
    video.muted = false;
    video.volume = 1;
    if (invito) invito.hidden = true;
    rimuoviAscoltatori();
  };

  const alPrimoGesto = () => {
    if (video.paused) return;
    accendiAudio();
  };

  function rimuoviAscoltatori() {
    document.removeEventListener('pointerdown', alPrimoGesto);
    document.removeEventListener('keydown', alPrimoGesto);
  }

  video.play().then(() => {
    video.muted = false;
    video.play().then(() => {
      if (invito) invito.hidden = true;
    }).catch(() => {
      video.muted = true;
      video.play().catch(() => {});
      if (invito) invito.hidden = false;
    });
  }).catch(() => {});

  if (invito) {
    invito.addEventListener('click', (event) => {
      event.preventDefault();
      accendiAudio();
    });
  }

  document.addEventListener('pointerdown', alPrimoGesto);
  document.addEventListener('keydown', alPrimoGesto);
  video.addEventListener('volumechange', () => {
    if (!video.muted && invito) invito.hidden = true;
  });
}

preparaPresentazione();
window.addEventListener('page:changed', preparaPresentazione);
