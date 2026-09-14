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
