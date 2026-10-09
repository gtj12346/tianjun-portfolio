(() => {
  const root=document.querySelector('[data-record-player]');
  if(!root)return;
  const audio=root.querySelector('audio'),panel=root.querySelector('.record-panel');
  const launcher=root.querySelector('.record-launcher'),open=root.querySelector('.record-open');
  const close=root.querySelector('.record-collapse'),toggles=[...root.querySelectorAll('.record-toggle,.record-mini-toggle')];
  const status=root.querySelector('[data-record-status]');
  const copy={
    en:{music:'MUSIC',kicker:'ON MY TURNTABLE',idle:'Click to listen',loading:'Loading…',playing:'Playing · tap to pause',paused:'Paused · tap to play',error:'Tap to try again',play:'Play Sailing',pause:'Pause Sailing',open:'Open Sailing and play',close:'Close player — music keeps playing',region:'Music corner'},
    zh:{music:'音樂',kicker:'在我的唱盤上',idle:'點一下，聽一會兒',loading:'載入中…',playing:'播放中 · 點擊暫停',paused:'已暫停 · 點擊播放',error:'點擊重試',play:'播放 Sailing',pause:'暫停 Sailing',open:'展開 Sailing 並播放',close:'收起播放器，不中斷音樂',region:'音樂角落'}
  };
  let state='idle',wantsPlayback=false,request=0;
  audio.volume=.65;
  function render(){
    const lang=document.documentElement.lang==='zh-Hans'?'zh-CN':document.documentElement.lang.startsWith('zh')?'zh':'en';
    const text=Object.fromEntries(Object.entries(copy[lang==='en'?'en':'zh']).map(([key,value])=>[key,window.GalaxyLocale.text(value,lang)]));
    root.setAttribute('aria-label',text.region);
    root.querySelector('.record-launcher-label').textContent=text.music;
    root.querySelector('.record-kicker').textContent=text.kicker;
    root.querySelector('.record-state').textContent=text[state];
    open.setAttribute('aria-label',text.open);close.setAttribute('aria-label',text.close);
    root.classList.toggle('is-playing',state==='playing');root.classList.toggle('is-active',wantsPlayback);
    toggles.forEach(button=>{button.setAttribute('aria-label',wantsPlayback?text.pause:text.play);button.setAttribute('aria-pressed',String(wantsPlayback));});
    if(status.textContent!==text[state])status.textContent=text[state];
  }
  function expand(value){
    if(value)root.classList.remove('was-swiped');
    root.dataset.expanded=String(value);open.setAttribute('aria-expanded',String(value));
    panel.inert=!value;panel.setAttribute('aria-hidden',String(!value));
    launcher.inert=value;launcher.setAttribute('aria-hidden',String(value));
    (value?close:open).focus({preventScroll:true});
  }
  function play(){
    if(wantsPlayback)return;
    const current=++request;
    if(audio.error)audio.load();
    wantsPlayback=true;state='loading';render();
    // Called directly from a click, keeping browser audio permission tied to the user.
    audio.play().catch(error=>{if(current!==request)return;console.warn('Sailing playback:',error.name,error.message);wantsPlayback=false;state='error';render();});
  }
  function pause(){++request;wantsPlayback=false;audio.pause();state='paused';render();}
  open.addEventListener('click',()=>{expand(true);play();});
  close.addEventListener('click',()=>expand(false));
  toggles.forEach(button=>button.addEventListener('click',()=>{if(wantsPlayback||!audio.paused)pause();else play();}));
  root.addEventListener('keydown',event=>{if(event.key==='Escape'&&root.dataset.expanded==='true'){event.preventDefault();expand(false);}});
  // A rightward dismiss gesture only; the player never changes its fixed position.
  let swipe=null,suppressClickUntil=0;
  panel.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0||root.dataset.expanded!=='true'||event.target.closest('.record-collapse'))return;
    swipe={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,active:false};
  });
  panel.addEventListener('pointermove',event=>{
    if(!swipe||event.pointerId!==swipe.id)return;
    const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;
    if(!swipe.active){
      if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){swipe=null;return;}
      if(dx<=8||dx<Math.abs(dy))return;
      swipe.active=true;panel.setPointerCapture(event.pointerId);root.classList.add('is-swiping');
    }
    swipe.dx=Math.max(0,Math.min(dx,panel.offsetWidth));
    root.style.setProperty('--swipe-x',`${swipe.dx}px`);event.preventDefault();
  });
  function finishSwipe(event){
    if(!swipe||(event.pointerId!==undefined&&event.pointerId!==swipe.id))return;
    const previous=swipe;swipe=null;
    if(panel.hasPointerCapture(previous.id))panel.releasePointerCapture(previous.id);
    if(previous.active){
      suppressClickUntil=performance.now()+400;
      if(event.type==='pointerup'&&previous.dx>42){root.classList.add('was-swiped');expand(false);}
    }
    root.classList.remove('is-swiping');root.style.removeProperty('--swipe-x');
  }
  for(const name of ['pointerup','pointercancel','lostpointercapture'])panel.addEventListener(name,finishSwipe);
  root.addEventListener('click',event=>{if(event.detail>0&&performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
  window.addEventListener('blur',()=>finishSwipe({type:'cancel'}));

  audio.addEventListener('playing',()=>{if(audio.paused)return;wantsPlayback=true;state='playing';render();});
  audio.addEventListener('waiting',()=>{if(!audio.paused&&wantsPlayback){state='loading';render();}});
  audio.addEventListener('pause',()=>{if(!audio.paused)return;wantsPlayback=false;if(state!=='error')state='paused';render();});
  audio.addEventListener('error',()=>{wantsPlayback=false;state='error';render();});
  function progress(){
    const time=Number.isFinite(audio.currentTime)?audio.currentTime:0;
    root.querySelector('.record-time').textContent=`${Math.floor(time/60)}:${String(Math.floor(time%60)).padStart(2,'0')}`;
    root.querySelector('.record-progress span').style.width=Number.isFinite(audio.duration)&&audio.duration>0?`${Math.min(100,time/audio.duration*100)}%`:'0%';
  }
  audio.addEventListener('timeupdate',progress);audio.addEventListener('loadedmetadata',progress);
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.addEventListener('pagehide',()=>{++request;wantsPlayback=false;audio.pause();});
  render();
})();
