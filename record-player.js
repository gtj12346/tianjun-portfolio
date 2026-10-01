(() => {
  const root = document.querySelector('[data-record-player]');
  const toggle = root.querySelector('.record-toggle');
  const panel = root.querySelector('.record-panel');
  const embed = root.querySelector('.record-embed');
  const status = root.querySelector('[data-record-status]');
  const external = root.querySelector('.record-external');
  const tracks = [
    {name: 'Paradise City — Guns N’ Roses', url: 'https://music.apple.com/us/album/paradise-city/1377826053?i=1377826748'},
    {name: '樹 — 刺蝟', url: 'https://music.apple.com/cn/album/1808900373?i=1808900389'}
  ];
  const copy = {
    en: {kicker:'ON MY TURNTABLE', invite:'Put a record on', tree:'Tree', hedgehog:'Hedgehog', note:'Free preview. Sign in with an Apple Music subscription for full tracks.', external:'Open in Apple Music', loading:'Loading the player…', ready:'Press ▶ in the player below to listen.', slow:'Taking a while? Try the Apple Music link below.', open:'Open the record player', close:'Close the record player and stop audio', group:'Choose a record', region:'Music corner'},
    zh: {kicker:'在我的唱盤上', invite:'放一張唱片', tree:'樹', hedgehog:'刺蝟', note:'免登入試聽片段；登入 Apple Music 訂閱帳號可聽完整歌曲。', external:'前往 Apple Music', loading:'正在載入播放器…', ready:'點下方播放器的 ▶，聽一會兒。', slow:'載入較久？也可以用下方連結開啟 Apple Music。', open:'打開唱片機', close:'收起唱片機並停止聲音', group:'選一張唱片', region:'音樂角落'}
  };
  let selected = 0;
  let state = 'ready';
  let timer;
  const locale = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  function translate() {
    const text = copy[locale()];
    root.querySelectorAll('[data-record-text]').forEach(el => el.textContent = text[el.dataset.recordText]);
    root.setAttribute('aria-label', text.region);
    root.querySelector('.record-tracks').setAttribute('aria-label', text.group);
    toggle.setAttribute('aria-label', panel.hidden ? text.open : text.close);
    status.textContent = text[state];
  }
  function mountPlayer() {
    clearTimeout(timer);
    // Replacing the iframe stops the previous track, so audio never overlaps.
    embed.replaceChildren();
    state = 'loading';
    external.href = tracks[selected].url;
    const iframe = document.createElement('iframe');
    iframe.title = `Apple Music — ${tracks[selected].name}`;
    iframe.allow = 'autoplay *; encrypted-media *; fullscreen *; clipboard-write';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = tracks[selected].url.replace('://music.apple.com/', '://embed.music.apple.com/') + (locale() === 'zh' ? '&l=zh-Hant-TW' : '&l=en-US');
    iframe.addEventListener('load', () => {
      if (iframe !== embed.firstElementChild) return;
      clearTimeout(timer);
      state = 'ready';
      translate();
    });
    embed.append(iframe);
    timer = setTimeout(() => {state = 'slow'; translate();}, 15000);
    translate();
  }
  function closePlayer() {
    clearTimeout(timer);
    embed.replaceChildren();
    panel.hidden = true;
    root.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    root.querySelector('.record-toggle-mark').textContent = '＋';
    translate();
  }
  toggle.addEventListener('click', () => {
    if (!panel.hidden) {closePlayer(); return;}
    panel.hidden = false;
    root.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    root.querySelector('.record-toggle-mark').textContent = '−';
    mountPlayer();
  });
  root.querySelectorAll('[data-record]').forEach(button => button.addEventListener('click', () => {
    const next = Number(button.dataset.record);
    if (next === selected) return;
    selected = next;
    root.dataset.side = String(selected);
    root.querySelector('.vinyl-label').textContent = selected ? 'B' : 'A';
    root.querySelectorAll('[data-record]').forEach(el => el.setAttribute('aria-pressed', String(Number(el.dataset.record) === selected)));
    mountPlayer();
  }));
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {event.preventDefault(); closePlayer(); toggle.focus();}
  });
  // Update our labels without reloading (and interrupting) an active music frame.
  new MutationObserver(translate).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  window.addEventListener('pagehide', closePlayer);
  translate();
})();
