(() => {
  const video = document.querySelector('#hero-film-video');
  const control = document.querySelector('#film-control');
  if (!video || !control) return;
  const progress = document.querySelector('.film-progress span');
  const label = control.querySelector('.film-control-label');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let wantsPlayback = !reduce.matches && !connection?.saveData;
  let inView = false;
  let frame = 0;
  let failed = false;

  function updateLabels() {
    const playing = !video.paused && !video.ended;
    const locale = document.documentElement.lang;
    const chinese = locale.startsWith('zh');
    const simplified = locale === 'zh-Hans';
    label.textContent = chinese ? (playing ? '暫停影像' : '播放影像') : (playing ? 'Pause film' : 'Play film');
    if (simplified) label.textContent = label.textContent.replace('暫', '暂');
    control.setAttribute('aria-label', chinese ? (playing ? (simplified ? '暂停背景视频' : '暫停背景影片') : (simplified ? '播放背景视频' : '播放背景影片')) : (playing ? 'Pause background film' : 'Play background film'));
    control.dataset.playing = String(playing);
  }

  function drawProgress() {
    if (Number.isFinite(video.duration) && video.duration > 0) progress.style.transform = `scaleX(${video.currentTime / video.duration})`;
    if (!video.paused && !document.hidden) frame = requestAnimationFrame(drawProgress);
  }

  function start() {
    if (!wantsPlayback || !inView || document.hidden || failed) return;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.muted = true;
    video.play().catch(() => { updateLabels(); });
  }

  function syncPlayback() {
    if (wantsPlayback && inView && !document.hidden) start();
    else video.pause();
  }

  control.addEventListener('click', () => {
    if (!video.paused) { wantsPlayback = false; video.pause(); }
    else {
      wantsPlayback = true;
      if (failed) { failed = false; video.load(); }
      start();
    }
  });
  video.addEventListener('play', () => { updateLabels(); cancelAnimationFrame(frame); frame = requestAnimationFrame(drawProgress); });
  video.addEventListener('pause', () => { cancelAnimationFrame(frame); updateLabels(); });
  video.addEventListener('error', () => { failed = true; cancelAnimationFrame(frame); updateLabels(); });
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncPlayback(); }, {threshold:0}).observe(video);
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pagehide', () => video.pause());
  window.addEventListener('pageshow', syncPlayback);
  reduce.addEventListener('change', () => { wantsPlayback = !reduce.matches && !connection?.saveData; syncPlayback(); });
  new MutationObserver(updateLabels).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  updateLabels();
  start();
})();
