(() => {
  const L=window.GalaxyLocale, $=s=>document.querySelector(s);
  const copy={en:{brand:'Galaxy<span class="logo-dot"></span>',work:'Work',about:'About',blog:'Journal',usage:'AI Usage',contact:'Contact',resume:'Résumé <span class="tiny">PDF</span>',name:'Tianjun Gao',skip:'Skip to story',backWork:'← Back to work',original:'PROJECT STORY',figures:'14 IMAGES',contents:'IN THIS STORY',top:'Back to the beginning ↑',enlarge:'View larger ↗',originalImage:'Original ↗',close:'Close ✕'},zh:{brand:'Galaxy<span class="logo-dot"></span>',work:'作品',about:'關於',blog:'隨筆',usage:'AI 用量',contact:'聯絡',resume:'簡歷 <span class="tiny">PDF</span>',name:'高天駿',skip:'跳至正文',backWork:'← 回到作品',original:'項目手記',figures:'14 幅配圖',contents:'文章目錄',top:'回到開頭 ↑',enlarge:'點擊放大 ↗',originalImage:'原圖 ↗',close:'關閉 ✕'}};
  let lang=L.initial(),current=0,opener=null;
  const editions=JSON.parse($('#story-translations').textContent);
  const viewer=$('.image-viewer'),figures=[...document.querySelectorAll('.figure-link')];
  function language(value){
    lang=L.normalize(value);
    const edition=editions[lang],htmlLang=L.htmlLang(lang);
    document.documentElement.lang=htmlLang;
    document.querySelectorAll('[data-i18n]').forEach(el=>el.innerHTML=L.text(copy[lang==='en'?'en':'zh'][el.dataset.i18n],lang));
    document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===lang)));
    document.querySelectorAll('[data-story-paragraph]').forEach(el=>el.textContent=edition.paragraphs[Number(el.dataset.storyParagraph)]);
    document.querySelectorAll('[data-story-heading]').forEach(el=>el.textContent=edition.headings[Number(el.dataset.storyHeading)]);
    document.querySelectorAll('[data-story-caption]').forEach(el=>{const i=Number(el.dataset.storyCaption);el.textContent=String(i+1).padStart(2,'0')+' / '+edition.images[i].alt;});
    figures.forEach((link,i)=>{link.querySelector('img').alt=edition.images[i].alt;link.setAttribute('aria-label',(lang==='en'?'View larger: ':'放大：')+edition.images[i].alt);});
    const title=$('#story-title'),split=edition.title.indexOf(lang==='en'?'. ':'，')+1,second=document.createElement('span');
    second.textContent=edition.title.slice(split).trim();
    title.replaceChildren(document.createTextNode(edition.title.slice(0,split)),document.createElement('br'),second);
    title.lang=htmlLang;$('#story').lang=htmlLang;
    document.title=edition.title+' — Flash Man · Galaxy';
    $('meta[name="description"]').content=lang==='en'?'The story of Flash Man: a missing key in Sydney, an errand service, and what we learnt along the way.':lang==='zh-CN'?'Flash Man 项目手记：从悉尼的一把钥匙，到跑腿服务、Agent 工作流与一次产品复盘。':'Flash Man 項目手記：從悉尼的一把鑰匙，到跑腿服務、Agent 工作流與一次產品復盤。';
    $('.resume-link').href=lang==='en'?'../../Tianjun-Gao-Resume.pdf':'../../Tianjun-Gao-Resume-ZH.pdf';
    $('header nav').setAttribute('aria-label',lang==='en'?'Main navigation':L.text('主要導覽',lang));
    $('.story-contents nav').setAttribute('aria-label',lang==='en'?'Article chapters':L.text('文章章節',lang));
    $('#image-prev').setAttribute('aria-label',lang==='en'?'Previous image':lang==='zh-CN'?'上一张':'上一張');
    $('#image-next').setAttribute('aria-label',lang==='en'?'Next image':lang==='zh-CN'?'下一张':'下一張');
    if(viewer.open)show(current);
    try{localStorage.setItem('tianjun-language',lang);}catch{}
  }
  document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>language(b.dataset.language)));language(lang);
  function show(index){current=(index+figures.length)%figures.length;const link=figures[current],image=link.querySelector('img');$('#image-full').src=link.href;$('#image-full').alt=image.alt;$('#image-original').href=link.href;$('#image-caption').textContent=String(current+1).padStart(2,'0')+' / '+figures.length+' — '+image.alt;$('.image-stage').scrollTop=0;}
  figures.forEach((link,index)=>link.addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();opener=link;show(index);viewer.showModal();document.body.style.overflow='hidden';$('#image-close').focus();}));
  $('#image-close').addEventListener('click',()=>viewer.close());$('#image-prev').addEventListener('click',()=>show(current-1));$('#image-next').addEventListener('click',()=>show(current+1));viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}});viewer.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus({preventScroll:true});});viewer.addEventListener('click',e=>{if(e.target!==viewer)return;const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close();});
  const chapters=[...document.querySelectorAll('.essay-chapter')],links=[...document.querySelectorAll('.story-contents nav a')];let queued=false;
  function highlight(){queued=false;let active=chapters[0];for(const c of chapters){if(c.getBoundingClientRect().top<innerHeight*.35)active=c;}links.forEach(a=>{if(a.hash==='#'+active.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(highlight);}},{passive:true});highlight();
  if(matchMedia('(max-width:760px)').matches)$('.story-contents').open=false;
})();
