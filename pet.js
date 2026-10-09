(() => {
  if (document.querySelector('.galaxy-pet')) return;
  const asset = name => new URL(`assets/pet/${name}`, document.currentScript.src).href;
  const portrait = asset('companion.webp'), actions = asset('actions.webp'), coding = asset('coding.webp'), resting = asset('idle.webp'), peeking = asset('peek-frame.webp'), singing = asset('singing.webp');
  const root = document.createElement('aside');
  root.className = 'galaxy-pet';
  root.innerHTML = `<div class="pet-bubble" role="status" aria-live="polite"></div><div class="pet-invite" hidden><p class="pet-invite-text" id="pet-song-question" role="status"></p><div class="pet-song-choices" role="group" aria-labelledby="pet-song-question"><button class="pet-song-yes" type="button"></button><button class="pet-song-no" type="button"></button></div></div><div class="pet-body"><button class="pet-greet" type="button" aria-describedby="pet-help"><span class="pet-actor"><img class="pet-idle" src="${portrait}" alt="" width="100" height="150" draggable="false"><span class="pet-sprite" aria-hidden="true"></span><span class="pet-rest" aria-hidden="true"></span><span class="pet-coding" aria-hidden="true"></span><span class="pet-singing" aria-hidden="true"></span></span></button><button class="pet-hide" type="button"><span aria-hidden="true">×</span></button><div class="pet-song-controls" hidden><button class="pet-song-toggle" type="button"></button><button class="pet-song-stop" type="button"><span aria-hidden="true">×</span></button><span class="pet-song-status" role="status" hidden></span></div></div><button class="pet-peek" type="button" hidden><img src="${peeking}" alt="" width="86" height="129" draggable="false"></button><button class="pet-return" type="button" hidden><img src="${portrait}" alt="" draggable="false"></button><span id="pet-help" class="sr-only"></span>`;
  // Clip only the companion layer, so dragging off-screen never widens the page.
  const stage=document.createElement('div');stage.className='pet-stage';stage.append(root);document.body.append(stage);
  const greet = root.querySelector('.pet-greet'), body = root.querySelector('.pet-body');
  const hide = root.querySelector('.pet-hide'), restore = root.querySelector('.pet-return');
  const peek = root.querySelector('.pet-peek');
  const bubble = root.querySelector('.pet-bubble'), sprite = root.querySelector('.pet-sprite');
  const help = root.querySelector('#pet-help');
  const codingSprite = root.querySelector('.pet-coding');
  const restSprite = root.querySelector('.pet-rest');
  const singingSprite = root.querySelector('.pet-singing');
  const invitation = root.querySelector('.pet-invite'), invitationText = root.querySelector('.pet-invite-text');
  const songYes = root.querySelector('.pet-song-yes'), songNo = root.querySelector('.pet-song-no');
  const songControls = root.querySelector('.pet-song-controls'), songToggle = root.querySelector('.pet-song-toggle');
  const songStop = root.querySelector('.pet-song-stop'), songStatus = root.querySelector('.pet-song-status');
  const song = document.createElement('audio');song.preload='none';song.src=asset('song.mp3');song.hidden=true;root.append(song);
  singingSprite.style.backgroundImage = `url("${singing}")`;
  sprite.style.backgroundImage = `url("${actions}")`;
  codingSprite.style.backgroundImage = `url("${coding}")`;
  restSprite.style.backgroundImage = `url("${resting}")`;
  const atlas = new Image(); atlas.src = actions;
  let atlasReady = false;
  atlas.onload = () => { atlasReady = true; };
  if (atlas.complete && atlas.naturalWidth) atlasReady = true;
  const codingAtlas = new Image(); codingAtlas.src = coding;
  let codingReady = false;
  codingAtlas.onload = () => { codingReady = true; };
  if (codingAtlas.complete && codingAtlas.naturalWidth) codingReady = true;
  const restAtlas = new Image(); restAtlas.src = resting;
  let restReady = false;
  restAtlas.onload = () => { restReady = true; root.classList.add('has-rest'); if(state==='idle')scheduleIdle(); };
  if(restAtlas.complete && restAtlas.naturalWidth) { restReady=true;root.classList.add('has-rest'); }
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const now = () => performance.now();
  const between = (a,b) => a + Math.random() * (b-a);
  const clamp = (n,a,b) => Math.min(Math.max(n,a),Math.max(a,b));
  const size = () => { const w=parseFloat(getComputedStyle(root).getPropertyValue('--pet-size'));return {w,h:w*1.5+(performing?38:0)}; };
  const viewport = () => ({w:document.documentElement.clientWidth,h:window.innerHeight});
  const floor = () => Math.max(10,viewport().h-size().h-14);
  let tucked = false, x = 0, y = 0, onFloor = true, state = 'idle';
  let hovered = false, focused = false, drag = null, swallowClick = false;
  let frame = 0, actionTimer = 0, bubbleTimer = 0, brainTimer = 0, idleTimer = 0, dragFrame = 0, dockTimer = 0, settleTimer = 0, move = null;
  let nextWalk = now()+3500;
  const quietDelay=15000;
  let lastPetInteraction=now(), quietMode='';
  let nextSip = now()+between(4500,6500), idleBeat = 0;
  let visibleMessage = null, contextPending = '', contextAt = 0;
  let lastReaction = -1;
  let invited=false, performing=false, audioPlaying=false, playPending=false, songError=false;
  let nextInvite=now()+10000, inviteTimer=0, singingTimer=0, playRequest=0;
  const inviteStorageKey='galaxy-pet-song-invitation-v1';
  function readInvitation() {
    try { const value=localStorage.getItem(inviteStorageKey);if(value)return value; } catch {}
    try { return sessionStorage.getItem(inviteStorageKey) || ''; } catch { return ''; }
  }
  let invitationRecord=readInvitation();
  function rememberInvitation(value) {
    invitationRecord=value;
    try { localStorage.setItem(inviteStorageKey,value); } catch {}
    try { sessionStorage.setItem(inviteStorageKey,value); } catch {}
  }
  try { tucked = localStorage.getItem('galaxy-pet-tucked') === 'true'; } catch {}
  const texts = {
    en:{
      name:'Galaxy companion',greet:'Say hi — drag to move',hide:'Tuck the companion away',restore:'Bring the companion back',peek:'Bring me back — click or drag left',
      help:'Click to interact. Drag to move; drag to the right edge to peek out. Arrow keys move the companion; Home returns it to the bottom. Escape closes its speech bubble.',
      drink:'Cheers!\nHere’s to good ideas.',invite:'Wanna hear me sing?',yes:'Sure',no:'No thanks',pause:'Pause',resume:'Play',loading:'Loading…',stop:'End the song',retry:'Try again',audioError:'Couldn’t play this time. Try again?',
      welcome:'Good day, mate!\nHow’s your day going?',journal:'A few thoughts,\nstill taking shape.',usage:'Turns out, curiosity\nuses a lot of tokens.'
    },
    'zh-Hans':{
      name:'Galaxy 小伙伴',greet:'点我互动，也可以拖动',hide:'收起小伙伴',restore:'叫小伙伴回来',peek:'点一下或向左拖，把我叫回来',
      help:'点击互动，拖动换位置，拖到右边缘可以探头。方向键移动，Home 键回到底边，Escape 键关闭气泡。',
      drink:'碰个杯，\n好想法慢慢聊。',invite:'你想听我唱歌吗？',yes:'可以',no:'不了',pause:'暂停',resume:'继续',loading:'加载中…',stop:'结束演唱',retry:'重试',audioError:'暂时播放不了，点一下重试。',
      welcome:'吃了吗您内？',journal:'一些还在生长的想法，\n慢慢看。',usage:'好奇心，\n原来真的会消耗 Token。'
    },
    'zh-Hant':{
      name:'Galaxy 小夥伴',greet:'點我互動，也可以拖動',hide:'收起小夥伴',restore:'叫小夥伴回來',peek:'點一下或向左拖，把我叫回來',
      help:'點擊互動，拖動換位置，拖到右邊緣可以探頭。方向鍵移動，Home 鍵回到底邊，Escape 鍵關閉氣泡。',
      drink:'碰個杯，\n好想法慢慢聊。',invite:'你想聽我唱歌嗎？',yes:'可以',no:'不了',pause:'暫停',resume:'繼續',loading:'載入中…',stop:'結束演唱',retry:'重試',audioError:'暫時播放不了，點一下重試。',
      welcome:'食咗飯未呀？',journal:'一些還在生長的想法，\n慢慢看。',usage:'好奇心，\n原來真的會消耗 Token。'
    }
  };
  const copy = () => texts[document.documentElement.lang] || texts.en;
  function pose(index = -1) {
    root.classList.toggle('has-pose', index >= 0 && atlasReady);
    if (index >= 0) sprite.style.backgroundPosition = `${(index%4)*100/3}% ${index>=4?100:0}%`;
  }
  function restPose(index=0) {
    // Register the generated frames to the same center and foot baseline.
    const offsets=[[-9.94,-.16],[-3.87,.03],[4.01,-.16],[8.84,-.16],[-9.67,3.89],[-3.45,3.89],[4.28,3.71],[9.12,3.71]];
    restSprite.style.backgroundPosition=`${index%4*100/3}% ${index>=4?100:0}%`;
    restSprite.style.transform=`translate(${offsets[index][0]}%,${offsets[index][1]}%)`;
    root.dataset.mood=['rest','blink','look-left','look-right','raise','sip','lower','smile'][index];
  }
  function setState(next) {
    clearTimeout(idleTimer);idleTimer=0;
    state = next; root.dataset.state = next; root.dataset.mood='';
    if(next==='idle'){restPose();scheduleIdle();}
  }
  function scheduleIdle(delay=between(1600,2800)) {
    clearTimeout(idleTimer);idleTimer=0;
    if(state!=='idle' || blocked() || reducedMotion.matches || !restReady)return;
    idleTimer=setTimeout(()=>{
      idleTimer=0;
      if(state!=='idle' || blocked() || drag || reducedMotion.matches)return;
      const index=idleBeat++%2===0?1:(Math.random()<.5?2:3);
      restPose(index);
      idleTimer=setTimeout(()=>{idleTimer=0;if(state==='idle'){restPose();scheduleIdle();}},index===1?150:1050);
    },delay);
  }
  function constrainBubble(panel=bubble) {
    const w = viewport().w, bw = panel.offsetWidth || 220;
    const offset = clamp(x + size().w/2 - bw/2, 10, w-bw-10) - x;
    panel.style.left = `${offset}px`;
    panel.style.setProperty('--tail-x',`${clamp(size().w/2-offset,12,bw-12)}px`);
    root.classList.toggle('bubble-below', y < panel.offsetHeight+48);
  }
  function draw() {
    const view = viewport(), dim = size();
    x = clamp(x,10,view.w-dim.w-10); y = clamp(y,10,view.h-dim.h-10);
    root.style.transform = `translate3d(${x}px,${y}px,0)`;
    root.classList.toggle('controls-below',y<44);
    if (visibleMessage) constrainBubble();
    if(invited)constrainBubble(invitation);
  }
  function silence() { clearTimeout(bubbleTimer); visibleMessage = null; bubble.textContent = ''; root.classList.remove('is-chatting'); }
  function say(key) {
    if (tucked || document.hidden || drag) return;
    clearTimeout(bubbleTimer);
    visibleMessage = key;
    bubble.textContent = copy()[key];
    root.classList.add('is-chatting'); constrainBubble();
    bubbleTimer = setTimeout(silence, 4800);
  }
  function localize() {
    const text = copy(); root.setAttribute('aria-label',text.name);
    for (const [button,key] of [[greet,'greet'],[hide,'hide'],[restore,'restore'],[peek,'peek']]) { button.setAttribute('aria-label',text[key]); button.title = text[key]; }
    help.textContent = text.help;
    invitationText.textContent=text.invite;songYes.textContent=text.yes;songNo.textContent=text.no;
    songStop.setAttribute('aria-label',text.stop);songStop.title=text.stop;updateSongControls();
    if(invited)constrainBubble(invitation);
    if (visibleMessage) { bubble.textContent = text[visibleMessage]; constrainBubble(); }
  }
  function stopMotion() { cancelAnimationFrame(frame); frame = 0; move = null; }
  function idle() { stopMotion(); clearTimeout(actionTimer);clearTimeout(dockTimer); setState(performing?'singing':'idle'); pose(); root.style.setProperty('--facing',1); }
  function blocked() { return tucked || state==='peek' || state==='docking' || document.hidden || !!document.querySelector('dialog[open]') || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable; }
  function engage() {
    lastPetInteraction=now();quietMode='';root.dataset.activity='';
    if(state==='coding' || state==='walk')idle();
    nextWalk=now()+6000;
  }
  function react(kind) {
    dismissInvitation();
    if(kind==='drink' && restReady) { sip(true);return; }
    idle(); setState(kind); nextWalk=now()+between(8000,13000);
    const sequence = kind==='wave' ? [[4,400],[-1,180],[4,500],[-1,200]] : kind==='drink' ? [[6,1500],[-1,250]] : [[5,1300],[-1,150]];
    let i=0;
    const step=()=>{
      if (i>=sequence.length) { idle(); return; }
      const [index,duration]=sequence[i++]; pose(index); actionTimer=setTimeout(step,duration);
    };
    step();if(kind==='drink')say('drink');
  }
  function sip(manual=false) {
    idle();setState('sip');if(manual)say('drink');
    nextSip=now()+between(14000,24000);nextWalk=Math.max(nextWalk,now()+2800);
    const sequence=reducedMotion.matches?[[7,1600]]:[[4,170],[5,620],[6,240],[4,170],[5,650],[6,230],[7,260]];
    let i=0;
    const step=()=>{
      if(state!=='sip')return;
      if(i>=sequence.length){idle();return;}
      const [index,duration]=sequence[i++];restPose(index);actionTimer=setTimeout(step,duration);
    };
    step();
  }
  function startCoding() {
    if(!codingReady) return false;
    idle(); setState('coding');
    nextWalk=now()+10000;
    const sequence=[0,1,0,3,1,0,2,1];
    let i=0;
    const type=()=>{
      if(state!=='coding')return;
      if(quietMode!=='coding' || blocked()){idle();return;}
      const index=reducedMotion.matches?0:sequence[i++%sequence.length];
      codingSprite.style.backgroundPosition=`${index%2*100}% ${index>=2?100:0}%`;
      actionTimer=setTimeout(type,reducedMotion.matches?1000:240);
    };
    type(); return true;
  }
  function walk() {
    if (blocked() || hovered || focused || !onFloor || reducedMotion.matches || !atlasReady) return;
    const max=viewport().w-size().w-10;
    let target=clamp(x+(Math.random()<.5?-1:1)*between(90,Math.min(300,Math.max(100,max*.55))),10,max);
    if(quietMode==='walking')target=clamp(x<max/2?max-20:20,10,max);
    if (Math.abs(target-x)<50) target=clamp(x+(x<max/2?1:-1)*120,10,max);
    if (Math.abs(target-x)<20) return;
    const direction=target>x?1:-1;
    setState('walk'); root.style.setProperty('--facing',direction);
    move={start:x,target,began:now(),duration:Math.abs(target-x)/45*1000};
    const tick=t=>{
      if (state!=='walk' || !move) return;
      if (blocked() || hovered || focused || reducedMotion.matches) { idle(); nextWalk=now()+4000; return; }
      const progress=Math.min((t-move.began)/move.duration,1);
      x=move.start+(move.target-move.start)*progress; y=floor();
      pose(Math.floor((t-move.began)/170)%4); draw();
      if(progress>=1){idle();nextWalk=now()+(quietMode==='walking'?400:between(6000,12000));return;}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
  }
  function dismissInvitation() {
    clearTimeout(inviteTimer);inviteTimer=0;
    if(invitation.contains(document.activeElement)){
      if(songYes.matches(':focus-visible') || songNo.matches(':focus-visible'))greet.focus({preventScroll:true});
      else document.activeElement.blur();
    }
    invited=false;invitation.hidden=true;root.classList.remove('is-inviting');
  }
  function inviteToSing() {
    // Persist the first display, even if it is ignored. Recheck for other tabs.
    invitationRecord=invitationRecord || readInvitation();
    if(invitationRecord)return;
    rememberInvitation('seen');
    idle();silence();invited=true;invitation.hidden=false;root.classList.add('is-inviting');
    invitationText.textContent=copy().invite;constrainBubble(invitation);
    // Leave enough time to answer and never dismiss a focused keyboard choice.
    const expire=()=>{
      if(invitation.contains(document.activeElement)){inviteTimer=setTimeout(expire,1000);return;}
      dismissInvitation();
    };
    inviteTimer=setTimeout(expire,6000);
  }
  function updateSongControls() {
    const text=copy(),key=songError?'retry':playPending?'loading':audioPlaying?'pause':'resume';
    songToggle.textContent=text[key];songToggle.setAttribute('aria-label',text[key]);
    songStatus.hidden=!songError;songStatus.textContent=songError?text.audioError:'';
    songControls.hidden=!performing;
  }
  function singingPose(index) {
    singingSprite.style.backgroundPosition=`${index%2*100}% ${index>=2?100:0}%`;
    singingSprite.style.transform=`translateX(${index%2?2.8:-2.8}%)`;
  }
  function animateSinging() {
    clearTimeout(singingTimer);singingTimer=0;
    if(!performing || document.hidden || tucked || state==='peek' || state==='docking')return;
    if(!audioPlaying || reducedMotion.matches){singingPose(0);return;}
    const sequence=[0,1,0,3,2,1,0,3];
    singingPose(sequence[Math.floor(song.currentTime/.22)%sequence.length]);
    singingTimer=setTimeout(animateSinging,110);
  }
  function changePerformance(active) {
    const atEdge=state==='peek' || state==='docking';
    const previous=size();performing=active;root.classList.toggle('is-performing',active);
    const current=size();x+=(previous.w-current.w)/2;y+=previous.h-current.h;
    if(onFloor)y=floor();idle();draw();updateSongControls();
    if(atEdge)finishPeek();
  }
  function endSong() {
    const restoreFocus=songControls.contains(document.activeElement),keyboardFocus=songToggle.matches(':focus-visible') || songStop.matches(':focus-visible');
    ++playRequest;playPending=false;audioPlaying=false;songError=false;
    song.pause();song.currentTime=0;clearTimeout(singingTimer);singingTimer=0;
    if(performing)changePerformance(false);
    if(restoreFocus){if(keyboardFocus)greet.focus({preventScroll:true});else document.activeElement?.blur();}
    engage();nextWalk=now()+7000;nextSip=now()+14000;
  }
  function playbackFailed(request) {
    if(request!==playRequest || !performing)return;
    playPending=false;audioPlaying=false;songError=true;animateSinging();updateSongControls();
  }
  function playSong() {
    const request=++playRequest;playPending=true;songError=false;updateSongControls();
    // Call play directly in the click handler so mobile browsers allow audio.
    try { const result=song.play();if(result?.catch)result.catch(()=>playbackFailed(request)); }
    catch { playbackFailed(request); }
  }
  function startSong() {
    rememberInvitation('accepted');dismissInvitation();silence();
    if(!performing){changePerformance(true);singingPose(0);}
    songToggle.focus({preventScroll:true});playSong();
  }
  function toggleSong() {
    if(playPending || !song.paused){++playRequest;playPending=false;song.pause();audioPlaying=false;animateSinging();updateSongControls();}
    else playSong();
  }
  songYes.addEventListener('click',startSong);
  songNo.addEventListener('click',()=>{rememberInvitation('declined');dismissInvitation();});
  songToggle.addEventListener('click',toggleSong);
  songStop.addEventListener('click',endSong);
  song.addEventListener('playing',()=>{if(!performing){song.pause();return;}rememberInvitation('heard');audioPlaying=true;playPending=false;songError=false;updateSongControls();animateSinging();});
  song.addEventListener('pause',()=>{audioPlaying=false;playPending=false;updateSongControls();animateSinging();});
  song.addEventListener('waiting',()=>{audioPlaying=false;playPending=true;updateSongControls();animateSinging();});
  song.addEventListener('ended',endSong);
  song.addEventListener('error',()=>playbackFailed(playRequest));
  function brain() {
    clearTimeout(brainTimer);
    if (!blocked() && !drag) {
      const t=now();
      if(!invitationRecord && !performing && !invited && t>=nextInvite && !contextPending && !visibleMessage)inviteToSing();
      if(!quietMode && !performing && !invited && !visibleMessage && !contextPending && t-lastPetInteraction>=quietDelay && (state==='idle' || state==='walk')) {
        quietMode=(!onFloor || reducedMotion.matches || hovered || focused || Math.random()<.6)?'coding':'walking';
        root.dataset.activity=quietMode;idle();nextWalk=t;
      }
      if(state==='idle' && !invited && !performing) {
        if(!idleTimer)scheduleIdle();
        if(contextPending && t>=contextAt && !visibleMessage) { say(contextPending); contextPending=''; nextWalk=t+5500; }
        else if(quietMode==='coding')startCoding();
        else if(quietMode==='walking' && t>=nextWalk){nextWalk=t+1000;walk();}
        else if(!quietMode && t>=nextSip && t-lastPetInteraction<quietDelay-2500 && !visibleMessage && restReady && !reducedMotion.matches) sip();
      }
    }
    brainTimer=setTimeout(brain,1000);
  }
  function renderTucked(focus=false) {
    root.classList.toggle('is-tucked',tucked); body.hidden=tucked;restore.hidden=!tucked;peek.hidden=true;
    // The small recall button stays at a predictable corner.
    if(tucked) root.style.transform='none'; else draw();
    if(focus)(tucked?restore:greet).focus({preventScroll:true});
  }
  const peekSize=()=>({w:viewport().w<=760?66:86,h:viewport().w<=760?99:129});
  function placePeek() {
    const view=viewport(),dim=peekSize();
    x=view.w-dim.w;y=clamp(y,10,view.h-dim.h-10);
    root.style.transform=`translate3d(${x}px,${y}px,0)`;
  }
  function finishPeek() {
    clearTimeout(dockTimer);root.classList.remove('is-settling');
    setState('peek');body.hidden=true;peek.hidden=false;placePeek();
  }
  function dock() {
    dismissInvitation();clearTimeout(singingTimer);singingTimer=0;idle();silence();setState('docking');onFloor=false;peek.hidden=true;
    root.classList.add('is-settling');
    x=viewport().w+12;root.style.transform=`translate3d(${x}px,${y}px,0)`;
    if(reducedMotion.matches)finishPeek();else dockTimer=setTimeout(finishPeek,260);
  }
  function reveal(focus=false) {
    clearTimeout(dockTimer);idle();peek.hidden=true;body.hidden=false;
    x=viewport().w-size().w-18;onFloor=Math.abs(y-floor())<32;if(onFloor)y=floor();
    root.classList.add('is-settling');draw();
    clearTimeout(settleTimer);settleTimer=setTimeout(()=>root.classList.remove('is-settling'),300);
    nextWalk=now()+9000;nextSip=now()+15000;
    animateSinging();if(focus)greet.focus({preventScroll:true});
  }
  peek.addEventListener('click',event=>{if(swallowClick){swallowClick=false;event.preventDefault();return;}reveal(event.detail===0);});
  peek.addEventListener('keydown',event=>{if(event.key==='ArrowLeft' || event.key==='Home'){event.preventDefault();reveal(true);if(event.key==='Home'){onFloor=true;y=floor();draw();}}});
  greet.addEventListener('click',event=>{
    if(swallowClick){swallowClick=false;event.preventDefault();return;}
    if(performing){toggleSong();return;}
    engage();
    let index=Math.floor(Math.random()*3);if(index===lastReaction)index=(index+1)%3;lastReaction=index;
    react(['wave','smile','drink'][index]);
  });
  function beginDrag(event,handle,fromPeek=false) {
    if(!event.isPrimary || event.button!==0 || drag)return;
    const visual=root.getBoundingClientRect();x=visual.left;y=visual.top;
    clearTimeout(dockTimer);clearTimeout(settleTimer);root.classList.remove('is-settling');
    root.style.transform=`translate3d(${x}px,${y}px,0)`;
    stopMotion();clearTimeout(actionTimer);clearTimeout(idleTimer);idleTimer=0;
    // Cache bounds once per gesture; pointer moves do no layout reads.
    drag={id:event.pointerId,handle,fromPeek,dim:size(),view:viewport(),startX:x,startY:y,tx:x,ty:y,px:event.clientX,py:event.clientY,lastX:event.clientX,lastY:event.clientY,started:false,wasFloor:onFloor};
    if(state==='walk'){setState('idle');pose();}
    handle.setPointerCapture(event.pointerId);
  }
  greet.addEventListener('pointerdown',event=>beginDrag(event,greet));
  peek.addEventListener('pointerdown',event=>beginDrag(event,peek,true));
  function paintDrag() {
    dragFrame=0;if(!drag?.started)return;
    x=drag.tx;y=drag.ty;
    root.style.transform=`translate3d(${x}px,${y}px,0)`;
    root.classList.toggle('controls-below',y<44);
  }
  root.addEventListener('pointermove',event=>{
    if(!drag){if(event.pointerType==='mouse')engage();return;}
    if(drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.px,dy=event.clientY-drag.py;
    if(!drag.started && Math.hypot(dx,dy)<(event.pointerType==='touch'?6:3))return;
    if(!drag.started){
      drag.started=true;dismissInvitation();silence();setState('drag');pose();restPose();root.style.setProperty('--facing',1);body.hidden=false;
      if(drag.fromPeek)drag.tx=drag.px-drag.dim.w/2;
    }
    event.preventDefault();
    drag.tx=clamp(drag.tx+event.clientX-drag.lastX,10,drag.view.w+drag.dim.w*.25);
    drag.ty=clamp(drag.ty+event.clientY-drag.lastY,10,drag.view.h-drag.dim.h-10);
    drag.lastX=event.clientX;drag.lastY=event.clientY;
    if(!dragFrame)dragFrame=requestAnimationFrame(paintDrag);
  });
  function endDrag(event,cancel=false) {
    if(!drag || (event && drag.id!==event.pointerId))return;
    cancelAnimationFrame(dragFrame);dragFrame=0;paintDrag();
    const ended=drag;drag=null;
    if(ended.handle.hasPointerCapture(ended.id))ended.handle.releasePointerCapture(ended.id);
    if(ended.started){
      swallowClick=true;setTimeout(()=>{swallowClick=false;},400);
      if(cancel){x=ended.startX;y=ended.startY;onFloor=ended.wasFloor;if(ended.fromPeek){finishPeek();return;}}
      else if(ended.lastX>=ended.view.w-18 || x+ended.dim.w*.65>=ended.view.w){dock();return;}
      else {onFloor=Math.abs(y-floor())<32;if(onFloor)y=floor();}
      peek.hidden=true;body.hidden=false;
      idle();nextWalk=now()+9000;nextSip=now()+between(12000,22000);draw();animateSinging();
    } else if(!ended.fromPeek) idle();
  }
  root.addEventListener('pointerup',event=>endDrag(event));
  root.addEventListener('pointercancel',event=>endDrag(event,true));
  root.addEventListener('lostpointercapture',event=>{if(drag)endDrag(event,true);});
  root.addEventListener('dragstart',event=>event.preventDefault());
  greet.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
    event.preventDefault();idle();
    const step=event.shiftKey?40:12;
    if(event.key==='Home'){onFloor=true;x=viewport().w-size().w-18;y=floor();}
    else {x+=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0;y+=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0;draw();onFloor=Math.abs(y-floor())<24;if(onFloor)y=floor();}
    nextWalk=now()+8000;nextSip=now()+between(12000,22000);draw();
  });
  root.addEventListener('pointerdown',engage);
  root.addEventListener('pointerup',engage);
  root.addEventListener('keydown',engage);
  root.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){engage();hovered=true;if(state==='walk'){idle();nextWalk=now()+4000;}}});
  root.addEventListener('pointerleave',()=>{hovered=false;nextWalk=now()+2500;});
  root.addEventListener('focusin',()=>{engage();focused=true;if(state==='walk')idle();});
  root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget))focused=false;});
  root.addEventListener('keydown',event=>{if(event.key==='Escape'){silence();dismissInvitation();}});
  hide.addEventListener('click',()=>{dismissInvitation();endSong();tucked=true;idle();silence();renderTucked(true);try{localStorage.setItem('galaxy-pet-tucked','true');}catch{}});
  restore.addEventListener('click',event=>{tucked=false;idle();if(onFloor)y=floor();renderTucked(true);if(event.detail>0){greet.blur();focused=false;}nextWalk=now()+6000;try{localStorage.setItem('galaxy-pet-tucked','false');}catch{}});
  // Mouse clicks should not leave the keyboard-focus pause latched indefinitely.
  greet.addEventListener('pointerup',()=>{if(!greet.matches(':focus-visible')){greet.blur();focused=false;}});
  function resize(){const oldFloor=onFloor;stopMotion();if(state==='walk')idle();if(drag)endDrag(null,true);if(state==='peek' || state==='docking'){finishPeek();return;}if(oldFloor)y=floor();draw();if(tucked)root.style.transform='none';}
  window.addEventListener('storage',event=>{
    if(event.key!==inviteStorageKey || !event.newValue)return;
    invitationRecord=event.newValue;
    if(invited)dismissInvitation();
  });
  window.addEventListener('resize',resize);
  window.visualViewport?.addEventListener('resize',resize);
  window.addEventListener('blur',()=>{if(drag)endDrag(null,true);stopMotion();if(state==='walk')idle();hovered=false;});
  document.addEventListener('visibilitychange',()=>{root.classList.toggle('is-paused',document.hidden);if(document.hidden){dismissInvitation();clearTimeout(singingTimer);singingTimer=0;if(drag)endDrag(null,true);stopMotion();clearTimeout(actionTimer);clearTimeout(brainTimer);clearTimeout(idleTimer);clearTimeout(settleTimer);idleTimer=0;silence();if(state==='docking')finishPeek();else if(state!=='peek')idle();}else{nextInvite=now()+10000;nextWalk=now()+4000;animateSinging();brain();}});
  reducedMotion.addEventListener('change',()=>{animateSinging();if(state==='walk' || state==='sip' || state==='idle')idle();nextWalk=now()+6000;});
  let previousLanguage=document.documentElement.lang;
  new MutationObserver(()=>{
    localize();
    const language=document.documentElement.lang;
    if(language===previousLanguage)return;
    previousLanguage=language;contextPending='welcome';contextAt=now();
    // Language greetings may accompany a performance without restarting audio.
    // Keep an open invitation readable; greet after it closes instead.
    if(!blocked() && !drag && !invited){contextPending='';say('welcome');}
  }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  // Greet on page entry and language changes; automatic activities stay quiet.
  const path=location.pathname;
  if(path.includes('/blog/'))contextPending='journal';
  else if(path.includes('/ai-usage/'))contextPending='usage';
  else if(!path.includes('/projects/') && document.querySelector('.hero'))contextPending='welcome';
  contextAt=now()+1000;
  x=viewport().w-size().w-18;y=floor();setState('idle');draw();localize();renderTucked();brain();
})();
