(() => {
  const menu=document.querySelector('.site-explore');
  if(!menu)return;
  const label=menu.querySelector('summary');
  function language(){label.textContent=document.documentElement.lang.startsWith('en')?'Explore':'探索';}
  language();new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));
  document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;});
  menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;label.focus();}});
})();
