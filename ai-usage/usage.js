(() => {
  const L=window.GalaxyLocale, $=s=>document.querySelector(s);
  const copy={
    en:{modelsTitle:'Who’s in the mix?',modelsScope:'TOTAL · ALL-TIME SHARE',modelsCaption:'Each model’s share of cumulative tokens, using the same scope as Total above.',modelNames:'Names follow TokenTracker; unknown means the source did not identify a model. Percentages are rounded.',moreModels:'More models',other:'Other models',noModels:'No model usage recorded yet.',skip:'Skip to usage',brand:'Galaxy<span class="logo-dot"></span>',work:'Work',about:'About',blog:'Journal',usage:'AI Token Usage',contact:'Contact',resume:'Résumé <span class="tiny">PDF</span>',name:'Tianjun Gao',headline:'Big ideas.<br><span>Counted tokens.</span>',deck:'A few questions, a few experiments. Here’s what they add up to.',totalLabel:'TOTAL — ALL TIME',totalCaption:'Cumulative token usage recorded by TokenTracker.',trend:'Recent activity',seven:'7 days',thirty:'30 days',period:'Selected period',average:'Daily average',help:'Hover, tap or use arrow keys to explore each day.',definition:'Token counts follow TokenTracker’s reporting. Today’s count is still accumulating.',details:'Daily data ↗',date:'Date',snapshot:'TokenTracker · synced snapshot',note:'This is the latest synced record, not a live feed.',backHome:'← Back home',loading:'Loading usage…',error:'Usage could not be loaded. Please refresh to try again.',updated:'Updated',empty:'No tokens recorded in this period.'},
    zh:{modelsTitle:'誰在一起開腦洞？',modelsScope:'TOTAL · 累計占比',modelsCaption:'按各模型的累計 token 用量計算，與上方 Total 使用相同口徑。',modelNames:'保留 TokenTracker 的模型名稱；unknown 表示來源未標記模型。百分比經過四捨五入。',moreModels:'其餘模型',other:'其餘模型',noModels:'尚未記錄模型用量。',skip:'跳至用量趨勢',brand:'Galaxy<span class="logo-dot"></span>',work:'作品',about:'關於',blog:'隨筆',usage:'AI Token 用量',contact:'聯絡',resume:'簡歷 <span class="tiny">PDF</span>',name:'高天駿',headline:'腦洞不限，<br><span>Token 有數。</span>',deck:'問一問，試一試。好奇心，也有自己的刻度。',totalLabel:'TOTAL — 累計用量',totalCaption:'TokenTracker 記錄至今的 token 總量。',trend:'近期趨勢',seven:'7 天',thirty:'30 天',period:'所選期間用量',average:'日均用量',help:'移到、點選柱形，或用方向鍵查看每日用量。',definition:'沿用 TokenTracker 的 token 統計口徑；當天數據仍在累積。',details:'每日數據 ↗',date:'日期',snapshot:'TokenTracker · 同步快照',note:'這是最近一次同步的記錄，並非即時數據。',backHome:'← 回到首頁',loading:'正在讀取用量…',error:'暫時無法讀取用量，請重新整理再試。',updated:'更新於',empty:'這段期間沒有記錄到 token 用量。'}
  };
  let lang=L.initial(),data=null,range=30,selected=null,failed=false;
  const t=k=>L.text(copy[lang==='en'?'en':'zh'][k],lang);
  const num=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n);
  const compact=n=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(n);
  const date=s=>new Intl.DateTimeFormat(L.htmlLang(lang),{month:'short',day:'numeric',timeZone:'Asia/Singapore'}).format(new Date(s+'T00:00:00+08:00'));
  function select(row){selected=row.date;$('#selected-date').textContent=date(row.date);$('#selected-tokens').textContent=num(row.tokens)+' tokens';document.querySelectorAll('.day-bar').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.date===selected)));}
  const palette=['var(--blue)','var(--ink)','var(--yellow)','var(--green)','#83847a','#d4d3ce'];
  const share=tokens=>data.totalTokens ? tokens/data.totalTokens*100 : 0;
  const percent=tokens=>{const p=share(tokens);return p>0 && p<.01 ? '<0.01%' : p.toFixed(2)+'%';};
  function modelName(model){return model.name==='__other__'?t('other'):model.name;}
  function modelReadout(model){$('#model-readout').textContent=modelName(model)+' · '+num(model.tokens)+' tokens · '+percent(model.tokens);}
  function renderModels(){
    const models=data.models,top=models.slice(0,5),rest=models.slice(5);
    $('#model-stack').replaceChildren();$('#model-leaders').replaceChildren();$('#model-rest').replaceChildren();
    const segments=[...top];if(rest.length)segments.push({name:'__other__',tokens:rest.reduce((sum,m)=>sum+m.tokens,0)});
    segments.forEach((model,index)=>{const b=document.createElement('button');b.type='button';b.style.flexGrow=String(model.tokens);b.style.background=palette[index];b.setAttribute('aria-label',modelName(model)+': '+num(model.tokens)+' tokens, '+percent(model.tokens));b.addEventListener('pointerenter',()=>modelReadout(model));b.addEventListener('focus',()=>modelReadout(model));b.addEventListener('click',()=>modelReadout(model));$('#model-stack').append(b);});
    models.forEach((model,index)=>{const row=document.createElement('div');row.className='model-row';const name=document.createElement('span');name.className='model-name';const dot=document.createElement('i');dot.style.background=palette[Math.min(index,5)];dot.setAttribute('aria-hidden','true');name.append(dot,document.createTextNode(model.name));const tokens=document.createElement('span');tokens.className='model-tokens';tokens.textContent=num(model.tokens)+' tokens';const ratio=document.createElement('strong');ratio.className='model-ratio';ratio.textContent=percent(model.tokens);row.append(name,tokens,ratio);$(index<5?'#model-leaders':'#model-rest').append(row);});
    $('.model-details').hidden=!rest.length;$('#more-models').textContent=t('moreModels')+' ('+rest.length+')';$('#model-stack').setAttribute('aria-label',t('modelsScope'));
    if(top.length)modelReadout(top[0]);else $('#model-readout').textContent=t('noModels');
  }
  function render(){
    if(!data)return;
    renderModels();
    const rows=data.daily.slice(-range),total=rows.reduce((a,b)=>a+b.tokens,0),max=Math.max(...rows.map(r=>r.tokens),1);
    if(!rows.some(r=>r.date===selected)) selected=rows[rows.length-1].date;
    $('#all-total').textContent=num(data.totalTokens);$('#period-total').textContent=compact(total);$('#period-total').title=num(total);$('#daily-average').textContent=compact(total/rows.length);$('#daily-average').title=num(total/rows.length);
    $('#date-range').textContent=rows[0].date+' — '+rows[rows.length-1].date;
    $('#chart-max').textContent=compact(max);$('#chart-start').textContent=date(rows[0].date);$('#chart-end').textContent=date(rows[rows.length-1].date);
    $('#daily-chart').replaceChildren();$('#daily-rows').replaceChildren();
    rows.forEach((row,index)=>{
      const bar=document.createElement('button');bar.type='button';bar.className='day-bar';bar.dataset.date=row.date;bar.dataset.zero=String(row.tokens===0);bar.style.setProperty('--bar-height',(row.tokens/max*100)+'%');bar.setAttribute('aria-label',row.date+': '+num(row.tokens)+' tokens');bar.innerHTML='<i aria-hidden="true"></i>';bar.addEventListener('click',()=>select(row));bar.addEventListener('pointerenter',()=>select(row));bar.addEventListener('focus',()=>select(row));
      bar.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%rows.length;if(e.key==='ArrowLeft')next=(index+rows.length-1)%rows.length;if(e.key==='Home')next=0;if(e.key==='End')next=rows.length-1;if(next!==undefined){e.preventDefault();$('#daily-chart').children[next].focus();}});$('#daily-chart').append(bar);
      const tr=document.createElement('tr'),dayCell=document.createElement('td'),tokenCell=document.createElement('td');dayCell.textContent=row.date;tokenCell.textContent=num(row.tokens);tr.append(dayCell,tokenCell);$('#daily-rows').prepend(tr);
    });
    select(rows.find(r=>r.date===selected));
    $('#updated-at').textContent=t('updated')+' '+new Intl.DateTimeFormat(L.htmlLang(lang),{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:data.timezone}).format(new Date(data.updatedAt))+' · UTC+8';
    document.querySelectorAll('[data-range]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.range)===range)));
  }
  function language(value){lang=L.normalize(value);document.documentElement.lang=L.htmlLang(lang);document.title='Galaxy — '+t('usage');document.querySelectorAll('[data-i18n]').forEach(el=>el.innerHTML=t(el.dataset.i18n));document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===lang)));$('nav').setAttribute('aria-label',lang==='en'?'Main navigation':L.text('主要導覽',lang));$('.range-switch').setAttribute('aria-label',lang==='en'?'Time range':L.text('時間範圍',lang));$('#daily-chart').setAttribute('aria-label',lang==='en'?'Daily token usage':L.text('每日 token 用量',lang));try{localStorage.setItem('tianjun-language',lang);}catch{}$('#load-status').textContent=failed?t('error'):data?'':t('loading');render();}
  document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>language(b.dataset.language)));
  document.querySelectorAll('[data-range]').forEach(b=>b.addEventListener('click',()=>{range=Number(b.dataset.range);render();}));
  language(lang);
  fetch('usage.json?v=0279589f9223',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('load');return r.json();}).then(value=>{
    if(value.schemaVersion!==2||!Number.isSafeInteger(value.totalTokens)||value.totalTokens<0||value.daily?.length!==30||!value.daily.every(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&Number.isSafeInteger(r.tokens)&&r.tokens>=0)||!Number.isFinite(Date.parse(value.updatedAt)))throw new Error('schema');
    if(!Array.isArray(value.models)||!value.models.every(m=>typeof m.name==='string'&&Number.isSafeInteger(m.tokens)&&m.tokens>=0)||value.models.reduce((sum,m)=>sum+m.tokens,0)!==value.totalTokens)throw new Error('models');
    data=value;$('#usage-data').hidden=false;$('#load-status').textContent='';render();
  }).catch(()=>{failed=true;$('#load-status').textContent=t('error');});
})();
