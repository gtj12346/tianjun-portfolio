(() => {
  if (document.querySelector('.galaxy-pet')) return;
  const asset = name => new URL(`assets/pet/${name}`, document.currentScript.src).href;
  const portrait = asset('companion.webp'), actions = asset('actions.webp'), coding = asset('coding.webp'), resting = asset('idle.webp');
  const root = document.createElement('aside');
  root.className = 'galaxy-pet';
  root.innerHTML = `<div class="pet-bubble" role="status" aria-live="polite"></div><div class="pet-body"><button class="pet-greet" type="button" aria-describedby="pet-help"><span class="pet-actor"><img class="pet-idle" src="${portrait}" alt="" width="100" height="150" draggable="false"><span class="pet-sprite" aria-hidden="true"></span><span class="pet-rest" aria-hidden="true"></span><span class="pet-coding" aria-hidden="true"></span></span><span class="pet-zzz" aria-hidden="true">z z z</span></button><button class="pet-hide" type="button"><span aria-hidden="true">×</span></button></div><button class="pet-peek" type="button" hidden><img src="${portrait}" alt="" draggable="false"></button><button class="pet-return" type="button" hidden><img src="${portrait}" alt="" draggable="false"></button><span id="pet-help" class="sr-only"></span>`;
  // Clip only the companion layer, so dragging off-screen never widens the page.
  const stage=document.createElement('div');stage.className='pet-stage';stage.append(root);document.body.append(stage);
  const greet = root.querySelector('.pet-greet'), body = root.querySelector('.pet-body');
  const hide = root.querySelector('.pet-hide'), restore = root.querySelector('.pet-return');
  const peek = root.querySelector('.pet-peek');
  const bubble = root.querySelector('.pet-bubble'), sprite = root.querySelector('.pet-sprite');
  const help = root.querySelector('#pet-help');
  const codingSprite = root.querySelector('.pet-coding');
  const restSprite = root.querySelector('.pet-rest');
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
  const size = () => { const w=parseFloat(getComputedStyle(root).getPropertyValue('--pet-size'));return {w,h:w*1.5}; };
  const viewport = () => ({w:document.documentElement.clientWidth,h:window.innerHeight});
  const floor = () => Math.max(10,viewport().h-size().h-14);
  let tucked = false, x = 0, y = 0, onFloor = true, state = 'idle';
  let hovered = false, focused = false, drag = null, swallowClick = false;
  let frame = 0, actionTimer = 0, bubbleTimer = 0, brainTimer = 0, idleTimer = 0, dragFrame = 0, dockTimer = 0, settleTimer = 0, move = null;
  let lastActivity = now(), lastPointerActivity = 0, nextWalk = now()+3500, nextChat = now()+between(25000,40000);
  let nextCoding = now()+between(18000,28000);
  let nextSip = now()+between(4500,6500), idleBeat = 0;
  let visibleMessage = null, lastContext = '', contextPending = '', contextAt = 0;
  let lastReaction = -1, lastRandom = -1, pressedSleeping = false;
  try { tucked = localStorage.getItem('galaxy-pet-tucked') === 'true'; } catch {}
  const texts = {
    en:{name:'Galaxy companion',greet:'Say hi — drag to move',hide:'Tuck the companion away',restore:'Bring the companion back',peek:'Bring me back — click or drag left',help:'Click to interact. Drag to move; drag to the right edge to peek out. Arrow keys move the companion; Home returns it to the bottom. Escape closes its speech bubble.',welcome:'Welcome to my Galaxy!',work:'A few ideas I brought to life.\nCome take a look.',about:'The person behind the pixels.\nYep, that’s me!',journal:'A few thoughts,\nstill taking shape.',usage:'Turns out, curiosity\nuses a lot of tokens.',project:'There’s a story behind this one.\nLet’s get into it.',contact:'Got an idea?\nLet’s talk.',wave:'Hey, good to see you!',smile:'You just made my day.',drink:'Cheers!\nHere’s to good ideas.',coding:'Just one more line…',wake:'Oh, hey!\nI was just resting my eyes.',random:['Don’t be shy,\ncome grab a drink with me!','Take your time.\nI’m in no hurry.','A tiny break,\na fresh idea.'],sleep:'A little nap…'},
    'zh-Hans':{name:'Galaxy 小伙伴',greet:'点我互动，也可以拖动',hide:'收起小伙伴',restore:'叫小伙伴回来',peek:'点一下或向左拖，把我叫回来',help:'点击互动，拖动换位置，拖到右边缘可以探头。方向键移动，Home 键回到底边，Escape 键关闭气泡。',welcome:'欢迎来到我的 Galaxy！',work:'这些想法，\n后来真的做出来了。',about:'屏幕背后的我，\n也爱出来透透气。',journal:'一些还在生长的想法，\n慢慢看。',usage:'好奇心，\n原来真的会消耗 Token。',project:'这个项目，\n还得从一个想法说起。',contact:'有想法？\n来聊聊吧。',wave:'嘿，你来啦！',smile:'见到你，心情都好了。',drink:'碰个杯，\n好想法慢慢聊。',coding:'再写一行，\n就一行。',wake:'嗯？我醒着呢，\n刚刚只是眯了一下。',random:['别拘着了，\n跟我一起来一杯吧！','你慢慢逛，\n我不着急。','歇一会儿，\n灵感说不定就来了。'],sleep:'先眯一小会儿……'},
    'zh-Hant':{name:'Galaxy 小夥伴',greet:'點我互動，也可以拖動',hide:'收起小夥伴',restore:'叫小夥伴回來',peek:'點一下或向左拖，把我叫回來',help:'點擊互動，拖動換位置，拖到右邊緣可以探頭。方向鍵移動，Home 鍵回到底邊，Escape 鍵關閉氣泡。',welcome:'歡迎來到我的 Galaxy！',work:'這些想法，\n後來真的做出來了。',about:'螢幕背後的我，\n也愛出來透透氣。',journal:'一些還在生長的想法，\n慢慢看。',usage:'好奇心，\n原來真的會消耗 Token。',project:'這個項目，\n還得從一個想法說起。',contact:'有想法？\n來聊聊吧。',wave:'嘿，你來啦！',smile:'見到你，心情都好了。',drink:'碰個杯，\n好想法慢慢聊。',coding:'再寫一行，\n就一行。',wake:'嗯？我醒著呢，\n剛剛只是瞇了一下。',random:['別拘著了，\n跟我一起來一杯吧！','你慢慢逛，\n我不著急。','歇一會兒，\n靈感說不定就來了。'],sleep:'先瞇一小會兒……'}
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
      if(now()-lastActivity>=10000){sleep();return;}
      const index=idleBeat++%2===0?1:(Math.random()<.5?2:3);
      restPose(index);
      idleTimer=setTimeout(()=>{idleTimer=0;if(state==='idle'){restPose();scheduleIdle();}},index===1?150:1050);
    },delay);
  }
  function constrainBubble() {
    const w = viewport().w, bw = bubble.offsetWidth || 220;
    const offset = clamp(x + size().w/2 - bw/2, 10, w-bw-10) - x;
    bubble.style.left = `${offset}px`;
    bubble.style.setProperty('--tail-x',`${clamp(size().w/2-offset,12,bw-12)}px`);
    root.classList.toggle('bubble-below', y < bubble.offsetHeight+22);
  }
  function draw() {
    const view = viewport(), dim = size();
    x = clamp(x,10,view.w-dim.w-10); y = clamp(y,10,view.h-dim.h-10);
    root.style.transform = `translate3d(${x}px,${y}px,0)`;
    root.classList.toggle('controls-below',y<44);
    if (visibleMessage) constrainBubble();
  }
  function silence() { clearTimeout(bubbleTimer); visibleMessage = null; bubble.textContent = ''; root.classList.remove('is-chatting'); }
  function say(key,index = 0) {
    if (tucked || document.hidden || drag) return;
    clearTimeout(bubbleTimer);
    visibleMessage = {key,index};
    bubble.textContent = key === 'random' ? copy().random[index] : copy()[key];
    root.classList.add('is-chatting'); constrainBubble();
    bubbleTimer = setTimeout(silence, 4800);
    nextChat = now()+between(26000,43000);
  }
  function localize() {
    const text = copy(); root.setAttribute('aria-label',text.name);
    for (const [button,key] of [[greet,'greet'],[hide,'hide'],[restore,'restore'],[peek,'peek']]) { button.setAttribute('aria-label',text[key]); button.title = text[key]; }
    help.textContent = text.help;
    if (visibleMessage) { const {key,index} = visibleMessage; bubble.textContent = key==='random'?text.random[index]:text[key]; constrainBubble(); }
  }
  function stopMotion() { cancelAnimationFrame(frame); frame = 0; move = null; }
  function idle() { stopMotion(); clearTimeout(actionTimer);clearTimeout(dockTimer); setState('idle'); pose(); root.style.setProperty('--facing',1); }
  function blocked() { return tucked || state==='peek' || state==='docking' || document.hidden || !!document.querySelector('dialog[open]') || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable; }
  function activity() {
    lastActivity = now();
    if (state==='sleep') { idle(); nextWalk=now()+6000; nextChat=now()+30000; }
  }
  function react(kind) {
    if(kind==='coding') { activity(); if(startCoding())return; kind='smile'; }
    if(kind==='drink' && restReady) { sip(true);return; }
    idle(); setState(kind); activity(); nextWalk=now()+between(8000,13000);
    const sequence = kind==='wave' ? [[4,400],[-1,180],[4,500],[-1,200]] : kind==='drink' ? [[6,1500],[-1,250]] : [[5,1300],[-1,150]];
    let i=0;
    const step=()=>{
      if (i>=sequence.length) { idle(); return; }
      const [index,duration]=sequence[i++]; pose(index); actionTimer=setTimeout(step,duration);
    };
    step(); say(kind);
  }
  function sip(manual=false) {
    idle();setState('sip');
    nextSip=now()+between(14000,24000);nextWalk=Math.max(nextWalk,now()+2800);
    if(manual){activity();say('drink');}
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
    idle(); setState('coding'); say('coding');
    nextCoding=now()+between(24000,42000);
    nextWalk=now()+10000;
    const began=now(), sequence=[0,1,0,3,1,0,2,1];
    let i=0;
    const type=()=>{
      if(state!=='coding')return;
      if(now()-began>=6000){idle();return;}
      const index=reducedMotion.matches?0:sequence[i++%sequence.length];
      codingSprite.style.backgroundPosition=`${index%2*100}% ${index>=2?100:0}%`;
      actionTimer=setTimeout(type,reducedMotion.matches?6000:240);
    };
    type(); return true;
  }
  function walk() {
    if (blocked() || hovered || focused || !onFloor || reducedMotion.matches || !atlasReady) return;
    const max=viewport().w-size().w-10;
    let target=clamp(x+(Math.random()<.5?-1:1)*between(90,Math.min(300,Math.max(100,max*.55))),10,max);
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
      if(progress>=1){idle();nextWalk=now()+between(6000,12000);return;}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
  }
  function sleep() { idle(); silence(); setState('sleep'); pose(7); }
  function brain() {
    clearTimeout(brainTimer);
    if (!blocked() && !drag) {
      const t=now();
      if (t-lastActivity>=10000 && state!=='sleep') sleep();
      else if(state==='idle') {
        if(!idleTimer)scheduleIdle();
        if(contextPending && t>=contextAt) { say(contextPending); contextPending=''; nextWalk=t+5500; }
        else if(t>=nextCoding && !hovered && !focused) { nextCoding=t+12000; startCoding(); }
        else if(t>=nextSip && !visibleMessage && restReady && !reducedMotion.matches) sip();
        else if(t>=nextChat && !hovered && !focused) { let index=Math.floor(Math.random()*3); if(index===lastRandom)index=(index+1)%3; lastRandom=index;say('random',index); nextWalk=t+5000; }
        else if(t>=nextWalk) { nextWalk=t+between(6000,12000); walk(); }
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
  const peekSize=()=>({w:viewport().w<=760?48:58,h:viewport().w<=760?54:62});
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
    idle();silence();setState('docking');onFloor=false;peek.hidden=true;
    root.classList.add('is-settling');
    x=viewport().w+12;root.style.transform=`translate3d(${x}px,${y}px,0)`;
    if(reducedMotion.matches)finishPeek();else dockTimer=setTimeout(finishPeek,260);
  }
  function reveal(focus=false) {
    clearTimeout(dockTimer);idle();peek.hidden=true;body.hidden=false;
    x=viewport().w-size().w-18;onFloor=Math.abs(y-floor())<32;if(onFloor)y=floor();
    root.classList.add('is-settling');draw();
    clearTimeout(settleTimer);settleTimer=setTimeout(()=>root.classList.remove('is-settling'),300);
    activity();nextWalk=now()+9000;nextSip=now()+15000;nextCoding=now()+20000;
    if(focus)greet.focus({preventScroll:true});
  }
  peek.addEventListener('click',event=>{if(swallowClick){swallowClick=false;event.preventDefault();return;}reveal(event.detail===0);});
  peek.addEventListener('keydown',event=>{if(event.key==='ArrowLeft' || event.key==='Home'){event.preventDefault();reveal(true);if(event.key==='Home'){onFloor=true;y=floor();draw();}}});
  greet.addEventListener('click',event=>{
    if(swallowClick){swallowClick=false;event.preventDefault();return;}
    const wasSleeping=state==='sleep' || pressedSleeping;pressedSleeping=false;
    let index=Math.floor(Math.random()*4);if(index===lastReaction)index=(index+1)%4;lastReaction=index;
    react(['wave','smile','drink','coding'][index]);if(wasSleeping)say('wake');
  });
  function beginDrag(event,handle,fromPeek=false) {
    if(!event.isPrimary || event.button!==0 || drag)return;
    const visual=root.getBoundingClientRect();x=visual.left;y=visual.top;
    clearTimeout(dockTimer);clearTimeout(settleTimer);root.classList.remove('is-settling');
    root.style.transform=`translate3d(${x}px,${y}px,0)`;
    stopMotion();clearTimeout(actionTimer);clearTimeout(idleTimer);idleTimer=0;pressedSleeping=state==='sleep';
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
    if(!drag || drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.px,dy=event.clientY-drag.py;
    if(!drag.started && Math.hypot(dx,dy)<(event.pointerType==='touch'?6:3))return;
    if(!drag.started){
      drag.started=true;silence();setState('drag');pose();restPose();root.style.setProperty('--facing',1);body.hidden=false;
      if(drag.fromPeek)drag.tx=drag.px-drag.dim.w/2;
    }
    event.preventDefault();lastActivity=now();
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
      idle();activity();nextWalk=now()+9000;nextCoding=now()+between(18000,28000);nextSip=now()+between(12000,22000);draw();
    } else if(!ended.fromPeek && state!=='sleep') idle();
  }
  root.addEventListener('pointerup',event=>endDrag(event));
  root.addEventListener('pointercancel',event=>endDrag(event,true));
  root.addEventListener('lostpointercapture',event=>{if(drag)endDrag(event,true);});
  root.addEventListener('dragstart',event=>event.preventDefault());
  greet.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
    event.preventDefault();idle();activity();
    const step=event.shiftKey?40:12;
    if(event.key==='Home'){onFloor=true;x=viewport().w-size().w-18;y=floor();}
    else {x+=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0;y+=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0;draw();onFloor=Math.abs(y-floor())<24;if(onFloor)y=floor();}
    nextWalk=now()+8000;nextCoding=now()+between(18000,28000);nextSip=now()+between(12000,22000);draw();
  });
  root.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;if(state==='walk'){idle();nextWalk=now()+4000;}}});
  root.addEventListener('pointerleave',()=>{hovered=false;nextWalk=now()+2500;});
  root.addEventListener('focusin',()=>{focused=true;if(state==='walk')idle();});
  root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget))focused=false;});
  root.addEventListener('keydown',event=>{if(event.key==='Escape')silence();});
  hide.addEventListener('click',()=>{tucked=true;idle();silence();renderTucked(true);try{localStorage.setItem('galaxy-pet-tucked','true');}catch{}});
  restore.addEventListener('click',event=>{tucked=false;idle();activity();if(onFloor)y=floor();renderTucked(true);if(event.detail>0){greet.blur();focused=false;}say('welcome');nextWalk=now()+6000;try{localStorage.setItem('galaxy-pet-tucked','false');}catch{}});
  // Mouse clicks should not leave the keyboard-focus pause latched indefinitely.
  greet.addEventListener('pointerup',()=>{if(!greet.matches(':focus-visible')){greet.blur();focused=false;}});
  function resize(){const oldFloor=onFloor;stopMotion();if(state==='walk')idle();if(drag)endDrag(null,true);if(state==='peek' || state==='docking'){finishPeek();return;}if(oldFloor)y=floor();draw();if(tucked)root.style.transform='none';}
  window.addEventListener('resize',resize);
  window.visualViewport?.addEventListener('resize',resize);
  window.addEventListener('blur',()=>{if(drag)endDrag(null,true);stopMotion();if(state==='walk')idle();hovered=false;});
  for(const type of ['pointerdown','keydown','scroll'])document.addEventListener(type,activity,{passive:true});
  document.addEventListener('pointermove',()=>{if(now()-lastPointerActivity>1000){lastPointerActivity=now();activity();}},{passive:true});
  document.addEventListener('visibilitychange',()=>{root.classList.toggle('is-paused',document.hidden);if(document.hidden){if(drag)endDrag(null,true);stopMotion();clearTimeout(actionTimer);clearTimeout(brainTimer);clearTimeout(idleTimer);clearTimeout(settleTimer);idleTimer=0;silence();if(state==='docking')finishPeek();else if(state!=='sleep' && state!=='peek')idle();}else{activity();nextWalk=now()+4000;brain();}});
  reducedMotion.addEventListener('change',()=>{if(state==='walk' || state==='sip' || state==='idle')idle();nextWalk=now()+6000;});
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  function context(key,immediate=false){
    if(!key || key===lastContext)return;
    lastContext=key;contextPending=key;contextAt=now()+1000;if(state==='walk')idle();nextWalk=now()+5500;
  }
  const path=location.pathname;
  if(path.includes('/projects/'))context('project',true);
  else if(path.includes('/blog/'))context('journal',true);
  else if(path.includes('/ai-usage/'))context('usage',true);
  else {
    const sections=[['.hero','welcome'],['#work','work'],['#about','about'],['#contact','contact']].map(([selector,key])=>({element:document.querySelector(selector),key})).filter(item=>item.element);
    let sectionFrame=0;
    const updateContext=()=>{sectionFrame=0;const line=innerHeight*.5;const current=sections.find(({element})=>{const r=element.getBoundingClientRect();return r.top<=line && r.bottom>line;});if(current)context(current.key);};
    document.addEventListener('scroll',()=>{if(!sectionFrame)sectionFrame=requestAnimationFrame(updateContext);},{passive:true});
    updateContext();
  }
  x=viewport().w-size().w-18;y=floor();setState('idle');draw();localize();renderTucked();brain();
})();
