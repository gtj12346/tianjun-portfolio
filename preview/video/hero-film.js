(() => {
  const video = document.querySelector('#hero-film-video');
  if (!video) return;
  const progress = document.querySelector('.film-progress span');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let inView = false;
  let frame = 0;
  let failed = false;

  function drawProgress() {
    if (progress && Number.isFinite(video.duration) && video.duration > 0) progress.style.transform = `scaleX(${video.currentTime / video.duration})`;
    if (!video.paused && !document.hidden) frame = requestAnimationFrame(drawProgress);
  }

  function start() {
    if (reduce.matches || connection?.saveData || !inView || document.hidden || failed) return;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.muted = true;
    video.play().catch(() => {});
  }

  function syncPlayback() {
    if (!reduce.matches && !connection?.saveData && inView && !document.hidden) start();
    else video.pause();
  }

  // A normal page interaction can resume autoplay if the browser initially blocks it.
  function retryPlayback() { if (video.paused) start(); }
  document.addEventListener('pointerdown', retryPlayback, {passive:true});
  document.addEventListener('keydown', retryPlayback);
  video.addEventListener('play', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(drawProgress); });
  video.addEventListener('pause', () => cancelAnimationFrame(frame));
  video.addEventListener('error', () => { failed = true; cancelAnimationFrame(frame); });
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncPlayback(); }, {threshold:0}).observe(video);
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pagehide', () => video.pause());
  window.addEventListener('pageshow', syncPlayback);
  reduce.addEventListener('change', syncPlayback);
})();
