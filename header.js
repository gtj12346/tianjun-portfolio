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
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));
  document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;});
  menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;label.focus();}});
})();
