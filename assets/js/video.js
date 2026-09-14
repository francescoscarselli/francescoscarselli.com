document.addEventListener('click', (event) => {
  const button = event.target.closest('.video button');
  if (!button) return;
  const article = button.closest('.video');
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${article.dataset.youtube}?autoplay=1`;
  frame.title = button.querySelector('span').textContent;
  frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
  frame.allowFullscreen = true;
  frame.loading = 'lazy';
  article.replaceChildren(frame);
});
