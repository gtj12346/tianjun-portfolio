(() => {
  const root = document.querySelector('[data-record-player]');
  const toggle = root.querySelector('.record-toggle');
  const audio = root.querySelector('audio');
  const status = root.querySelector('[data-record-status]');
  const clock = root.querySelector('.record-time');
  const progress = root.querySelector('.record-progress span');
  const copy = {
    en: {kicker:'ON MY TURNTABLE', idle:'Click to listen', loading:'Loading · click to pause', playing:'Playing · click to pause', paused:'Paused · click to resume', ended:'Play it again', error:'Couldn’t load · click to retry', play:'Play 航海', pause:'Pause 航海', region:'Music corner'},
    zh: {kicker:'在我的唱盤上', idle:'點一下，聽一會兒', loading:'載入中 · 點擊可暫停', playing:'播放中 · 點擊暫停', paused:'已暫停 · 點擊繼續', ended:'再聽一遍', error:'載入失敗 · 點擊重試', play:'播放《航海》', pause:'暫停《航海》', region:'音樂角落'}
  };
  let state = 'idle';
  let wantsPlayback = false;
  let request = 0;
  audio.volume = 0.65;
  function render() {
    const text = copy[document.documentElement.lang.startsWith('zh') ? 'zh' : 'en'];
    root.querySelector('.record-kicker').textContent = text.kicker;
    root.querySelector('.record-state').textContent = text[state];
    root.setAttribute('aria-label', text.region);
    root.classList.toggle('is-playing', state === 'playing');
    root.classList.toggle('is-active', wantsPlayback);
    toggle.setAttribute('aria-label', wantsPlayback ? text.pause : text.play);
    toggle.setAttribute('aria-pressed', String(wantsPlayback));
    // Announce state changes, never the continuously changing playback time.
    status.textContent = text[state];
  }
  function updateProgress() {
    const time = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    clock.textContent = `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2,'0')}`;
    progress.style.width = Number.isFinite(audio.duration) && audio.duration > 0 ? `${Math.min(100,time / audio.duration * 100)}%` : '0%';
  }
  toggle.addEventListener('click', () => {
    const currentRequest = ++request;
    if (wantsPlayback || !audio.paused) {
      wantsPlayback = false;
      audio.pause();
      state = audio.currentTime > 0 ? 'paused' : 'idle';
      render();
      return;
    }
    if (audio.error) audio.load();
    if (audio.ended) audio.currentTime = 0;
    wantsPlayback = true;
    state = 'loading';
    render();
    // Keep play() in the click handler, preserving the browser's user gesture.
    audio.play().catch(() => {
      if (currentRequest !== request) return;
      wantsPlayback = false;
      state = 'error';
      render();
    });
  });
  audio.addEventListener('playing', () => {
    if (audio.paused) return;
    wantsPlayback = true;
    state = 'playing';
    render();
  });
  audio.addEventListener('waiting', () => {
    if (!audio.paused && wantsPlayback) {state = 'loading'; render();}
  });
  audio.addEventListener('pause', () => {
    if (!audio.paused) return;
    wantsPlayback = false;
    if (state !== 'error') state = audio.ended ? 'ended' : audio.currentTime > 0 ? 'paused' : 'idle';
    render();
  });
  audio.addEventListener('ended', () => {wantsPlayback = false; state = 'ended'; render();});
  audio.addEventListener('error', () => {wantsPlayback = false; state = 'error'; render();});
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', updateProgress);
  new MutationObserver(render).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  window.addEventListener('pagehide', () => {++request; wantsPlayback = false; audio.pause();});
  render();
})();
