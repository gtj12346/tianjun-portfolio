(() => {
  if (document.querySelector('.galaxy-pet')) return;
  const imageUrl = new URL('assets/pet/companion.webp', document.currentScript.src).href;
  const root = document.createElement('aside');
  root.className = 'galaxy-pet';
  root.innerHTML = `<div class="pet-bubble" role="status" aria-live="polite"></div><div class="pet-body"><button class="pet-greet" type="button"><img src="${imageUrl}" width="100" height="150" alt="" draggable="false"></button><button class="pet-hide" type="button">×</button></div><button class="pet-return" type="button" hidden><img src="${imageUrl}" alt="" draggable="false"></button>`;
  document.body.append(root);
  const greet = root.querySelector('.pet-greet');
  const body = root.querySelector('.pet-body');
  const hide = root.querySelector('.pet-hide');
  const restore = root.querySelector('.pet-return');
  const bubble = root.querySelector('.pet-bubble');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let tucked = false, message = -1, timer, hop;
  try { tucked = localStorage.getItem('galaxy-pet-tucked') === 'true'; } catch {}
  const copy = () => {
    const lang = document.documentElement.lang;
    if (lang === 'zh-Hans') return {name:'Galaxy 小伙伴', greet:'和小伙伴碰个杯', hide:'收起小伙伴', restore:'叫小伙伴回来', messages:['别拘着了，\n跟我一起来一杯吧！','碰个杯，\n好想法慢慢聊。','你慢慢逛，\n我就在这儿。']};
    if (lang.startsWith('zh')) return {name:'Galaxy 小夥伴', greet:'和小夥伴碰個杯', hide:'收起小夥伴', restore:'叫小夥伴回來', messages:['別拘著了，\n跟我一起來一杯吧！','碰個杯，\n好想法慢慢聊。','你慢慢逛，\n我就在這兒。']};
    return {name:'Galaxy companion', greet:'Say cheers to your little companion', hide:'Tuck the companion away', restore:'Bring the companion back', messages:['Don’t be shy,\ncome grab a drink with me!','Cheers!\nLet’s talk ideas.','Take your time.\nI’ll be right here.']};
  };
  function localize() {
    const text = copy();
    root.setAttribute('aria-label', text.name);
    for (const [button,key] of [[greet,'greet'],[hide,'hide'],[restore,'restore']]) {
      button.setAttribute('aria-label', text[key]); button.title = text[key];
    }
    if (message >= 0) bubble.textContent = text.messages[message];
  }
  function silence() { clearTimeout(timer); root.classList.remove('is-chatting'); bubble.textContent = ''; message = -1; }
  function renderTucked(focus = false) {
    root.classList.toggle('is-tucked', tucked);
    body.hidden = tucked; restore.hidden = !tucked;
    if (focus) (tucked ? restore : greet).focus({preventScroll:true});
  }
  let nextMessage = 0;
  greet.addEventListener('click', () => {
    clearTimeout(timer);
    message = nextMessage++ % copy().messages.length;
    bubble.textContent = copy().messages[message];
    root.classList.add('is-chatting');
    hop?.cancel();
    if (!reducedMotion.matches) hop = greet.animate([
      {transform:'translateY(0) rotate(0)'},
      {transform:'translateY(-12px) rotate(-5deg)',offset:.38},
      {transform:'translateY(-2px) rotate(3deg)',offset:.7},
      {transform:'translateY(0) rotate(0)'}
    ], {duration:620,easing:'cubic-bezier(.22,1,.36,1)'});
    timer = setTimeout(silence, 4500);
  });
  hide.addEventListener('click', () => { tucked = true; silence(); hop?.cancel(); renderTucked(true); try { localStorage.setItem('galaxy-pet-tucked','true'); } catch {} });
  restore.addEventListener('click', () => { tucked = false; renderTucked(true); try { localStorage.setItem('galaxy-pet-tucked','false'); } catch {} });
  root.addEventListener('keydown', event => { if (event.key === 'Escape') silence(); });
  reducedMotion.addEventListener('change', () => hop?.cancel());
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('visibilitychange', () => { if (document.hidden) { silence(); hop?.cancel(); } });
  renderTucked(); localize();
})();
