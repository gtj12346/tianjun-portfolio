(() => {
  const root = document.querySelector('[data-record-player]');
  const toggle = root.querySelector('.record-toggle');
  const audio = root.querySelector('audio');
  const status = root.querySelector('[data-record-status]');
  const clock = root.querySelector('.record-time');
  const progress = root.querySelector('.record-progress span');
  const copy = {
    en: {kicker:'ON MY TURNTABLE', idle:'Click to listen', loading:'Loading · click to pause', playing:'Playing · click to pause', paused:'Paused · click to resume', ended:'Play it again', error:'Couldn’t load · click to retry', play:'Play 航海', pause:'Pause 航海', region:'Music corner', move:'Drag right to tuck away; use left or right arrow keys', smaller:'Smaller player', larger:'Larger player', minimize:'Tuck player into sidebar', expand:'Expand player'},
    zh: {kicker:'在我的唱盤上', idle:'點一下，聽一會兒', loading:'載入中 · 點擊可暫停', playing:'播放中 · 點擊暫停', paused:'已暫停 · 點擊繼續', ended:'再聽一遍', error:'載入失敗 · 點擊重試', play:'播放《航海》', pause:'暫停《航海》', region:'音樂角落', move:'向右拖入側邊；左方向鍵展開，右方向鍵收起', smaller:'縮小唱片機', larger:'放大唱片機', minimize:'收進側邊欄', expand:'展開唱片機'}
  };
  let state = 'idle';
  let wantsPlayback = false;
  let request = 0;
  audio.volume = 0.65;
  const layoutKey = 'galaxy-record-dock-v3';
  const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
  const layout = {scale:1,docked:true};
  try {
    const saved = JSON.parse(localStorage.getItem(layoutKey));
    if (saved && typeof saved === 'object') {
      if (Number.isFinite(saved.scale)) layout.scale = clamp(saved.scale,.85,1.15);
      if (typeof saved.docked === 'boolean') layout.docked = saved.docked;
    }
  } catch {}
  let drag = null;
  let suppressClickUntil = 0;
  const saveLayout = () => {try{localStorage.setItem(layoutKey,JSON.stringify(layout));}catch{}};
  function applyLayout() {
    root.classList.toggle('is-docked',layout.docked);
    root.style.setProperty('--record-scale',layout.scale);
    root.style.removeProperty('--drag-offset');
    root.querySelector('.record-collapse').setAttribute('aria-expanded',String(!layout.docked));
    root.querySelector('.record-collapse span').textContent = layout.docked ? '‹' : '›';
    root.querySelector('[data-record-size="-1"]').disabled = layout.scale <= .85;
    root.querySelector('[data-record-size="1"]').disabled = layout.scale >= 1.15;
    render();
  }
  function dock(value) {layout.docked=value;applyLayout();saveLayout();}
  root.querySelector('.record-collapse').addEventListener('click', () => dock(!layout.docked));
  root.querySelectorAll('[data-record-size]').forEach(button => button.addEventListener('click', () => {
    layout.scale = clamp(Math.round((layout.scale+Number(button.dataset.recordSize)*.1)*100)/100,.85,1.15);
    applyLayout(); saveLayout();
  }));
  // A horizontal drawer gesture, never free positioning over the page.
  root.addEventListener('pointerdown', event => {
    const capture = event.target.closest('.record-toggle,.record-move');
    if (!event.isPrimary || event.button !== 0 || !capture) return;
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,moved:false,capture};
    capture.setPointerCapture(event.pointerId);
  });
  root.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX-drag.x, dy = event.clientY-drag.y;
    if (!drag.moved && Math.hypot(dx,dy)<6) return;
    drag.moved = true;
    drag.dx = dx;
    root.classList.add('is-dragging');
    // Leave a visible edge even before release. Vertical movement is ignored.
    root.style.setProperty('--drag-offset',`${layout.docked ? clamp(dx,-32,0) : clamp(dx,0,root.offsetWidth-44)}px`);
    event.preventDefault();
  });
  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const last = drag;
    drag = null;
    if (last.moved) {
      suppressClickUntil=performance.now()+400;
      if (event.type !== 'pointercancel') {
        if (!layout.docked && last.dx>44) layout.docked=true;
        else if (layout.docked && last.dx < -24) layout.docked=false;
      }
    }
    root.classList.remove('is-dragging');
    if (last.capture.hasPointerCapture(event.pointerId)) last.capture.releasePointerCapture(event.pointerId);
    applyLayout();
    if(last.moved) saveLayout();
  }
  root.addEventListener('pointerup',finishDrag);
  root.addEventListener('pointercancel',finishDrag);
  root.addEventListener('lostpointercapture',finishDrag);
  root.querySelector('.record-move').addEventListener('keydown', event => {
    if (event.key==='ArrowRight'||event.key==='ArrowLeft') {
      event.preventDefault(); dock(event.key==='ArrowRight');
      // The handle disappears when docked; move focus to the visible opener.
      if(layout.docked) root.querySelector('.record-collapse').focus();
    }
  });
  function render() {
    const lang = document.documentElement.lang === 'zh-Hans' ? 'zh-CN' : document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
    const text = Object.fromEntries(Object.entries(copy[lang === 'en' ? 'en' : 'zh']).map(([key,value]) => [key,window.GalaxyLocale.text(value,lang)]));
    root.querySelector('.record-kicker').textContent = text.kicker;
    root.querySelector('.record-state').textContent = text[state];
    root.setAttribute('aria-label', text.region);
    root.classList.toggle('is-playing', state === 'playing');
    root.classList.toggle('is-active', wantsPlayback);
    toggle.setAttribute('aria-label', wantsPlayback ? text.pause : text.play);
    toggle.setAttribute('aria-pressed', String(wantsPlayback));
    for (const [selector,key] of [['.record-move','move'],['[data-record-size="-1"]','smaller'],['[data-record-size="1"]','larger'],['.record-collapse',layout.docked?'expand':'minimize']]) {
      const control = root.querySelector(selector);
      control.setAttribute('aria-label',text[key]);
      control.title = text[key];
    }
    // Announce state changes, never the continuously changing playback time.
    status.textContent = text[state];
  }
  function updateProgress() {
    const time = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    clock.textContent = `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2,'0')}`;
    progress.style.width = Number.isFinite(audio.duration) && audio.duration > 0 ? `${Math.min(100,time / audio.duration * 100)}%` : '0%';
  }
  toggle.addEventListener('click', event => {
    if (event.detail > 0 && performance.now() < suppressClickUntil) {event.preventDefault(); return;}
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
  applyLayout();
})();
