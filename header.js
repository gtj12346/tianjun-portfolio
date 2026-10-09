(() => {
  const menu=document.querySelector('.site-explore');
  if(!menu)return;
  const label=menu.querySelector('summary');
  function language(){
    const english=document.documentElement.lang.startsWith('en');
    const locale=document.documentElement.lang==='zh-Hans'?'zh-CN':'zh';
    label.textContent=english?'Explore':'探索';
    menu.querySelectorAll('[data-project-nav]').forEach(link=>{
      const names={attention:english?'Attention research platform':'社交媒體實驗與注意力分析平台',flash:'Flash Man',deyan:english?'AI + GIS internship':'AI + GIS 實習',raizz:english?'raizz internship':'raizz 實習'};
      const text=names[link.dataset.projectNav];
      link.textContent=english?text:window.GalaxyLocale.text(text,locale);
      if(new URL(link.href).pathname===location.pathname)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  }
  language();new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  const panel = menu.querySelector('.explore-menu');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let animation = null, expanded = menu.open;
  menu.classList.add('glass-explore');
  label.setAttribute('aria-expanded', String(expanded));
  function setOpen(open) {
    if (expanded === open) return;
    expanded = open;
    const current = menu.open ? getComputedStyle(panel) : null;
    const from = current ? {opacity:current.opacity, transform:current.transform} : {opacity:0, transform:'translateY(-7px) scale(.97)'};
    if (animation) { animation.cancel(); animation = null; }
    label.setAttribute('aria-expanded', String(open));
    if (open) menu.open = true;
    panel.inert = !open;
    if (reduce.matches) { menu.open = open; return; }
    animation = panel.animate([from, open ? {opacity:1,transform:'translateY(0) scale(1)'} : {opacity:0,transform:'translateY(-5px) scale(.98)'}],
      {duration:open ? 300 : 170, easing:'cubic-bezier(.22,1,.36,1)', fill:'both'});
    const running = animation;
    running.onfinish = () => {
      if (animation !== running) return;
      menu.open = expanded; running.cancel(); animation = null;
    };
  }
  label.addEventListener('click', event => { event.preventDefault(); setOpen(!expanded); });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('click',event=>{if(!menu.contains(event.target))setOpen(false);});
  menu.addEventListener('keydown',event=>{if(event.key==='Escape'){setOpen(false);label.focus();}});
  const highlight = link => {
    panel.style.setProperty('--menu-accent', getComputedStyle(link).getPropertyValue('--project-accent').trim());
    panel.style.setProperty('--menu-y', `${link.offsetTop}px`);
    panel.style.setProperty('--menu-h', `${link.offsetHeight}px`);
    panel.classList.add('has-hover');
  };
  panel.addEventListener('pointermove', event => { const link = event.target.closest('a'); if(link)highlight(link); });
  panel.addEventListener('pointerdown', event => { const link=event.target.closest('a'); if(link)highlight(link); });
  panel.addEventListener('focusin', event => { const link = event.target.closest('a'); if(link)highlight(link); });
  panel.addEventListener('pointerleave', () => { if (!panel.contains(document.activeElement)) panel.classList.remove('has-hover'); });
  panel.addEventListener('focusout', event => { if(!panel.contains(event.relatedTarget))panel.classList.remove('has-hover'); });
  reduce.addEventListener('change', () => { if(animation){animation.cancel();animation=null;} menu.open=expanded; });
})();

// Shared continuous spring for language and time-range controls.
document.querySelectorAll('.language-switch, .range-switch').forEach(group => {
  const buttons = [...group.querySelectorAll('button[data-language], button[data-range]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, velocity = 0, target = 0, width = 44, frame = 0, last = 0;
  let pressure = 0, pressureVelocity = 0, pressed = false, initialized = false;
  let gesture = null, suppressClick = false;
  const draw = () => {
    const stretch = reduce.matches ? 0 : Math.min(Math.abs(velocity) / 1600, .16);
    group.style.setProperty('--lens-x', `${x.toFixed(3)}px`);
    group.style.setProperty('--lens-width', `${width}px`);
    group.style.setProperty('--lens-sx', (1 + stretch + pressure * .065).toFixed(4));
    group.style.setProperty('--lens-sy', (1 - stretch * .35 + pressure * .045).toFixed(4));
    group.style.setProperty('--lens-clarity', (0.62 - pressure * .2).toFixed(3));
  };
  const settle = () => {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    x = target; velocity = 0; pressure = 0; pressureVelocity = 0; draw();
  };
  const tick = time => {
    const dt = Math.min((time - (last || time - 16.67)) / 1000, .032);
    last = time;
    // Substeps keep the spring stable on slower displays and after a busy frame.
    for (let i = 0; i < 4; i++) {
      const step = dt / 4;
      velocity += ((target - x) * 230 - velocity * 29) * step;
      x += velocity * step;
      pressureVelocity += (((pressed ? 1 : 0) - pressure) * 420 - pressureVelocity * 32) * step;
      pressure += pressureVelocity * step;
    }
    draw();
    if (Math.abs(target - x) > .015 || Math.abs(velocity) > .03 ||
        Math.abs((pressed ? 1 : 0) - pressure) > .002 || Math.abs(pressureVelocity) > .01) {
      frame = requestAnimationFrame(tick);
    } else { frame = 0; last = 0; x = target; velocity = 0; draw(); }
  };
  const start = () => {
    if (reduce.matches) { settle(); return; }
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const selected = () => buttons.find(button => button.getAttribute('aria-pressed') === 'true') || buttons[0];
  const aim = button => { target = button.offsetLeft; width = button.offsetWidth; start(); };
  const measure = () => {
    const button = selected(); target = button.offsetLeft; width = button.offsetWidth;
    settle(); initialized = true; group.classList.add('has-lens');
  };
  group.classList.add('glass-language');
  new MutationObserver(() => { if (initialized && !gesture) aim(selected()); }).observe(group,
    {subtree:true, attributes:true, attributeFilter:['aria-pressed']});
  const resize = new ResizeObserver(measure); resize.observe(group);
  measure();
  const nearest = clientX => buttons.reduce((best, button) => {
    const box = button.getBoundingClientRect();
    const distance = Math.abs(clientX - box.left - box.width / 2);
    return distance < best.distance ? {button, distance} : best;
  }, {button:buttons[0], distance:Infinity}).button;
  group.addEventListener('pointerdown', event => {
    const button = event.target.closest('button[data-language], button[data-range]');
    if (!button || !event.isPrimary || event.button !== 0) return;
    gesture = {id:event.pointerId, startX:event.clientX, moved:false};
    group.setPointerCapture(event.pointerId); pressed = true; aim(button);
  });
  group.addEventListener('pointermove', event => {
    const box = group.getBoundingClientRect();
    group.style.setProperty('--light-x', `${event.clientX - box.left}px`);
    if (!gesture || gesture.id !== event.pointerId) return;
    if (Math.abs(event.clientX - gesture.startX) > 5) gesture.moved = true;
    if (gesture.moved) { target = Math.max(buttons[0].offsetLeft, Math.min(buttons.at(-1).offsetLeft, event.clientX - box.left - width / 2)); start(); }
  }, {passive:true});
  const release = event => {
    if (!gesture || (event.pointerId !== undefined && gesture.id !== event.pointerId)) return;
    const previous = gesture; gesture = null; pressed = false;
    if (group.hasPointerCapture(previous.id)) group.releasePointerCapture(previous.id);
    if (event.type === 'pointerup') {
      const button = nearest(event.clientX);
      // Pointer capture retargets the native click; dispatch exactly one selection change.
      button.focus({preventScroll:true}); button.click(); suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
    }
    aim(selected());
  };
  group.addEventListener('click', event => {
    if (suppressClick && event.detail > 0) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  for (const name of ['pointerup','pointercancel','lostpointercapture']) group.addEventListener(name, release);
  group.addEventListener('pointerleave', () => group.style.removeProperty('--light-x'));
  window.addEventListener('blur', () => { if (gesture) release({type:'cancel'}); });
  reduce.addEventListener('change', settle);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (gesture) release({type:'cancel'}); settle(); } });
});
