const L = window.GalaxyLocale;
const ui = value => L.text(value, language);
let language = "en";
const composition = document.querySelector('.composition');
let compositionIndex = 0;
composition.addEventListener('click', () => {
  compositionIndex = (compositionIndex + 1) % 3;
  composition.dataset.remix = String(compositionIndex);
  document.querySelector('#composition-status').textContent = language !== "en" ? ui(`構圖 ${compositionIndex + 1} / 3`) : `Composition ${compositionIndex + 1} of 3`;
});
document.querySelector('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('gaotianjun319@gmail.com');document.querySelector('#copy-status').textContent=language !== 'en' ? ui('電郵地址已複製。') : 'Email copied.';}catch{document.querySelector('#copy-status').textContent=language !== 'en' ? ui('可選取上方電郵地址複製，或點擊開啟郵件應用程式。') : 'Select the email address above to copy it, or click it to open your email app.';}});
const projects=[
 {tab:'Research platform',short:'Research,\nwith attention.',title:'A clearer view of human attention.',category:'PRODUCT OWNER · FEB—JUN 2026',description:'A client-commissioned survey platform connecting experiment setup, A/B testing, and webcam-calibrated attention tracking in one researcher workflow.',stat:'6 languages',statLabel:'One experiment. A wider range of participants.',color:'var(--red)',ink:'var(--ink)',steps:['Design','Calibrate','Understand'],footer:'EXPERIMENTS / ATTENTION / PRIVACY',meta:'Sydney · Product Owner · Client-commissioned, live product',challenge:'Researchers needed a coherent journey from creating an experiment to collecting usable behavioural and attention data.',contribution:['Owned experiment setup, content configuration, A/B assignment, publication, participation, analysis, and export.','Designed random assignment and six-language delivery, with separate preview and live data and clear participation states.','Translated webcam calibration, click, and gaze data into attention-confidence and calibration-quality metrics. Set a no-video-storage privacy boundary.','Coordinated a team of 5+ across front-end, back-end, and tracking modules, and contributed to the Next.js/React calibration experience.'],outcome:'Defined completion, required-response, and low-quality-session rules so exported data could be used directly in research analysis.',result:'Research-ready data'},
 {tab:'Flash Man',short:'Real tasks.\nIntelligent agents.',title:'From a simple request to a real delivery.',category:'PRODUCT LEAD · MAR—SEP 2025',description:'A Sydney errand product, built from zero. An AI agent translated natural-language orders into coordinated tasks, with clear boundaries for exceptions and human decisions.',stat:'88–92%',statLabel:'On-time rate across approximately 60–100 trial orders.',color:'var(--yellow)',ink:'var(--ink)',steps:['Intent','Tools','Fulfilment'],footer:'AGENTS / ORCHESTRATION / OPERATIONS',meta:'Sydney · Product Lead · Local errand app',challenge:'Everyday errands contain messy details: substitutions, changed addresses, delays, and incomplete instructions. An agent needed to work within real fulfilment rules.',contribution:['Designed an intent parsing, task decomposition, tool calling, and state update workflow for natural-language ordering and dispatch.','Used the order state machine to define context, task boundaries, and execution rules.','Designed exception detection, failure recovery, and duplicate-execution safeguards.','Required manual confirmation for low-confidence, high-risk, and irreversible actions, and iterated using real orders and exception cases.'],outcome:'Approximately 60–100 trial orders achieved an 88–92% on-time rate, 5–8% cancellation rate, and a complaint rate below 4%. These are pilot results.',result:'60–100 trial orders'},
 {tab:'AI + GIS',short:'Less friction.\nBetter journeys.',title:'Making complex maps easier to navigate.',category:'PRODUCT INTERN · JUN—AUG 2025',description:'Product discovery, conversion improvements, and AI use-case research for a GIS platform—connecting user behaviour with decisions the team could act on.',stat:'+15% CTR',statLabel:'Alongside a 12% increase in conversion rate.',color:'var(--blue)',ink:'#fff',steps:['Discover','Prioritize','Validate'],footer:'GIS / PRODUCT DISCOVERY / MEASUREMENT',meta:"Beijing · Product Intern, AI / GIS · Beijing De’an IoT Technology",challenge:'The journey from advertising to a GIS landing page had friction in interaction feedback, performance, information density, and conversion guidance.',contribution:['Benchmarked five competing products, including Google Maps and Amap Open Platform, and created a prioritized product improvement backlog.','Designed improvements to interaction feedback, information architecture, and conversion guidance.','Worked with product, engineering, and business stakeholders through requirements review, implementation, testing, and launch.','Built a KPI framework for CTR, CVR, and bounce rate, and explored GeoAI, spatial analytics, visualization, and decision-support use cases.'],outcome:'The resulting iterations increased click-through rate by 15% and conversion rate by 12%.',result:'+12% conversion rate'},
 {tab:'raizz growth',short:'Create. Publish.\nLearn. Repeat.',title:'Closing the loop between content and growth.',category:'PRODUCT GROWTH INTERN · JUL 2026—PRESENT',description:'AI-assisted content workflows and search-growth operations for a sleep-technology brand, from search intent and human review to publishing and diagnosis.',stat:'50 articles',statLabel:'Supported launches or updates, plus 12 website pages.',color:'var(--green)',ink:'var(--ink)',steps:['Create','Review','Publish'],footer:'AI WORKFLOWS / SEARCH / GROWTH',meta:'Shenzhen · Product Growth Intern · Axi Technology (raizz)',challenge:'Scaling useful content required a dependable workflow connecting research, multi-model generation, human quality review, publishing, and search monitoring.',contribution:['Produced 25 new articles and optimized 16 existing pieces using ChatGPT, Claude, and Gemini alongside human review.','Owned HTML checks, image and alt-text configuration, sitemap updates, and GitHub submissions.','Monitored Google Search Console and helped resolve 12 indexing or web-page issues through diagnosis and iteration.','Evaluated 85+ creators and 34+ websites or media outlets, shortlisting 13 high-fit opportunities for further outreach.'],outcome:'Supported the launch or update of 50 articles and 12 website pages, with a closed-loop process from production to monitoring and improvement.',result:'12 issues resolved'}
];

// Chinese copy is edited from the supplied Chinese résumé, not translated from English.
const projectsZh = [
  {
    "tab": "實驗與注意力",
    "short": "實驗設計\n注意力分析",
    "title": "社交媒體實驗與注意力分析平臺",
    "category": "Product Owner · 2026.02—06",
    "description": "主導融合 A/B 實驗與瀏覽器端注意力追蹤的研究平臺，覆蓋實驗工作流定義、核心能力設計、部分前端開發與 5+ 人跨端協作。",
    "stat": "6",
    "statUnit": "種語言",
    "statLabel": "支持 A/B 隨機分組、6 種語言實驗投遞及瀏覽器端眼動追蹤。",
    "steps": [
      "實驗創建",
      "參與者作答",
      "數據分析"
    ],
    "footer": "A/B 實驗 / 注意力追蹤 / 數據質量",
    "meta": "悉尼 · Product Owner · 客戶委託 · 已上線",
    "challenge": "覆蓋研究者從實驗創建、內容配置、A/B 分組與預覽、發佈、參與者作答，到數據分析與導出的完整產品流程。",
    "contribution": [
      "端到端實驗產品設計：定義 Preview 與正式實驗數據隔離、參與狀態及完成校驗等核心產品邏輯。",
      "實驗與注意力能力設計：推動 A/B 隨機分組、6 種語言實驗投遞及瀏覽器端眼動追蹤，將攝像頭校準、點擊與注視數據轉化爲 attention confidence、calibration quality 等質量指標，明確原始視頻不存儲的隱私邊界。",
      "跨團隊推進與開發落地：將實驗配置、互動模擬、注意力追蹤及數據質量等需求拆解爲開發任務，協調 5+ 人團隊完成前後端及追蹤模塊集成；參與 Next.js / React 前端核心交互開發，包括參與者端 calibration 校準流程。",
      "數據完整性與異常機制：設計實驗 completion 判定、必答項校驗及異常 session 質量標記，識別低質量或未完整參與樣本。"
    ],
    "outcome": "保障導出行爲與注意力數據可直接用於後續研究分析。",
    "result": "客戶委託 · 已上線"
  },
  {
    "tab": "Flash Man 跑腿",
    "short": "Agent 編排\n履約驗證",
    "title": "悉尼同城跑腿 App（Flash Man）",
    "category": "Product Lead · 2025.03—09",
    "description": "從 0–1 設計同城跑腿產品，將 AI Agent 引入訂單理解、任務編排與履約異常處理，構建面向真實服務流程的智能化執行鏈路。",
    "stat": "88–92%",
    "statUnit": "預約準時率",
    "statLabel": "累計完成約 60–100 單試運營。",
    "steps": [
      "意圖解析",
      "任務拆解",
      "狀態更新"
    ],
    "footer": "Agent 工作流 / 異常恢復 / 人工確認",
    "meta": "悉尼 · Product Lead · Flash Man",
    "challenge": "圍繞自然語言下單、派單、缺貨替代、改址及超時等高頻場景，設計面向真實服務流程的 Agent 工作流。",
    "contribution": [
      "Agent 產品設計：設計 Intent Parsing → Task Decomposition → Tool Calling → State Update 工作流，結合訂單狀態機定義上下文、任務邊界與執行規則。",
      "可靠性與安全機制：設計異常識別、失敗恢復、重複執行防護及 Human-in-the-loop 機制，對低置信度、高風險及不可逆操作進行人工確認，保障 Agent 決策與履約規則一致。",
      "業務驗證：結合真實訂單與異常 case，持續迭代 Agent 流程及業務規則。"
    ],
    "outcome": "累計完成約 60–100 單試運營，預約準時率 88%–92%、取消率 5%–8%、客訴率低於 4%。",
    "result": "60–100 單試運營"
  },
  {
    "tab": "AI + GIS",
    "short": "產品優化\n數據驗證",
    "title": "GIS / 智慧城市產品",
    "category": "產品實習生（AI / GIS 方向）· 2025.06—08",
    "description": "參與 GIS / 智慧城市產品智能化規劃及核心轉化鏈路優化，圍繞用戶需求、產品方案、數據分析與上線驗證開展產品工作。",
    "stat": "+15%",
    "statUnit": "CTR",
    "statLabel": "推動 CTR 提升 15%、CVR 提升 12%。",
    "steps": [
      "問題定義",
      "方案設計",
      "上線驗證"
    ],
    "footer": "AI + GIS / 轉化鏈路 / 指標監控",
    "meta": "北京 · 產品實習生（AI / GIS 方向）· 北京德安物聯科技有限公司",
    "challenge": "針對 GIS 平臺廣告展示—落地頁轉化鏈路中 CTR 偏低、跳出率偏高等問題，定位廣告交互反饋弱、頁面加載與信息承載冗餘等關鍵流失節點。",
    "contribution": [
      "產品發現與問題定義：調研 Google Maps、高德地圖開放平臺等 5 款競品並拆解用戶路徑，形成產品問題清單與優化優先級。",
      "方案設計與開發落地：設計廣告交互反饋強化、落地頁信息精簡及轉化引導前置等方案，結合業務影響與開發複雜度確定優先級，協同研發及業務團隊推進需求評審、方案實現、測試與上線。",
      "數據驗證與持續迭代：搭建 CTR、CVR、跳出率等核心指標監控體系，結合上線後用戶行爲數據與可用性測試驗證方案效果。",
      "AI + GIS 產品規劃：圍繞 GeoAI、空間數據智能分析、地圖可視化及輔助決策開展用戶場景和競品研究，結合 SuperMap 平臺能力拆解 AI 應用機會與功能鏈路，輸出智能化場景及產品建議。"
    ],
    "outcome": "通過數據驗證與持續迭代，最終推動 CTR 提升 15%、CVR 提升 12%。",
    "result": "+12% CVR"
  },
  {
    "tab": "Raizz 增長",
    "short": "AI 工作流\n搜索增長",
    "title": "Raizz AI 內容與搜索增長",
    "category": "Product Growth Intern · 2026.07—至今",
    "description": "負責消費級睡眠科技品牌 Raizz 的 AI 內容工作流、Web 發佈與搜索增長，並參與海外增長渠道及競品生態研究。",
    "stat": "50",
    "statUnit": "篇文章",
    "statLabel": "支持 50 篇文章及 12 個站點頁面上線或更新。",
    "steps": [
      "內容生產",
      "頁面發佈",
      "搜索監控"
    ],
    "footer": "SEO / GEO / AI 內容工作流",
    "meta": "深圳 · Product Growth Intern · Axi Technology（Raizz）",
    "challenge": "主導搭建並持續迭代 Raizz 的 SEO / GEO 內容工作流，覆蓋關鍵詞與搜索意圖研究、多模型內容生成、人工質量評估及 Web 發佈。",
    "contribution": [
      "AI 內容與發佈工作流：使用 ChatGPT / Claude / Gemini 生成內容，進行人工質量評估、HTML 頁面檢查、圖片與 alt text 配置、sitemap 更新及 GitHub 提交；累計完成 25 篇新內容、16 篇存量內容優化。",
      "搜索監控與異常閉環：使用 Google Search Console 跟蹤頁面發現、抓取、索引及 canonical 狀態，結合站內入口、資源路徑、緩存及版本發佈流程定位問題；累計協助處理 12 個索引 / Web 頁面異常。",
      "增長渠道與競品研究：圍繞 Whoop、Hatch、Withings、SleepScore 等品牌開展 Creator、Guest Post 及 PR / Media Research，建立內容相關性、互動表現、合作歷史、網站質量及品牌匹配度等篩選標準。",
      "渠道篩選：累計評估 85+ 位 creators、34+ 個網站及媒體資源，篩選 13 個高匹配對象進入後續 outreach。"
    ],
    "outcome": "支持 50 篇文章及 12 個站點頁面上線或更新，形成內容生產—頁面發佈—搜索監控—問題定位—迭代優化的完整閉環。",
    "result": "12 個索引 / Web 頁面異常"
  }
];
function localizedProject(i) { return language !== 'en' ? {...projects[i], ...projectsZh[i]} : projects[i]; }
document.querySelector('#project-content').innerHTML=`<div class="project-tabs" role="tablist" aria-label="Selected projects">${projects.map((p,i)=>`<button type="button" role="tab" id="tab-${i}" aria-controls="project-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-project="${i}"><span>0${i+1}</span>${p.tab}</button>`).join('')}</div><div id="project-panel" class="project-panel" role="tabpanel" aria-labelledby="tab-0" tabindex="0"></div><p class="project-footnote">FOUR PROJECTS. DIFFERENT PROBLEMS. THE SAME CURIOSITY.</p>`;
let activeProject=0;
function renderProject(i,focus=false){activeProject=i;const p=localizedProject(i);document.querySelectorAll('[data-project]').forEach((b,n)=>{b.innerHTML=`<span>0${n+1}</span>${ui(localizedProject(n).tab)}`;b.setAttribute('aria-selected',n===i);b.tabIndex=n===i?0:-1;if(n===i&&focus)b.focus();});const panel=document.querySelector('#project-panel');panel.setAttribute('aria-labelledby',`tab-${i}`);panel.innerHTML=ui(`<div class="project-visual" style="background:${p.color};color:${p.ink}"><div class="visual-top"><span>${language !== 'en' ? '項目手記' : 'FIELD NOTES'} — 0${i+1}</span><span>Galaxy</span></div><div class="visual-title">${p.short.replace('\n','<br>')}</div><div class="mini-flow" aria-label="${p.steps.join(language !== 'en' ? '，然後' : ', then ')}">${p.steps.map((s,n)=>(n?'<b aria-hidden="true"></b>':'')+`<span>${s}</span>`).join('')}</div><div class="visual-bottom"><span>${p.footer}</span><span>0${i+1}/04</span></div></div><div class="project-info"><p class="eyebrow">${p.category}</p><h3>${p.title}</h3><p class="project-description">${p.description}</p><div class="project-stat">${p.stat}${p.statUnit ? `<span class="stat-unit">${p.statUnit}</span>` : ''}</div><p class="stat-label">${p.statLabel}</p><button class="text-button" id="read-case" type="button">${language !== 'en' ? '探索項目' : 'Explore the project'}<span aria-hidden="true" class="action-arrow">↗</span></button></div>`);document.querySelector('#read-case').addEventListener('click',openCase);}
document.querySelectorAll('[data-project]').forEach((b,i)=>{b.addEventListener('click',()=>renderProject(i));b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%4;if(e.key==='ArrowLeft')next=(i+3)%4;if(e.key==='Home')next=0;if(e.key==='End')next=3;if(next!==undefined){e.preventDefault();renderProject(next,true);}});});
document.querySelector('#about-content').innerHTML=`<div class="about-grid"><div><p class="small-title">MY TOOLKIT</p><div class="skill-list">${['AI agent workflows','Product discovery','Human-in-the-loop design','A/B testing','Python & SQL','Figma & prototyping','KPI frameworks'].map(s=>`<span>${s}</span>`).join('')}</div><p class="small-title">EDUCATION</p><div class="education"><p><strong>The University of Sydney</strong>Master of Data Science<br><span>NOV 2024 — DEC 2026</span></p><p><strong>Hebei University of Science and Technology</strong>B.Eng. in Communication Engineering<br><span>2020 — 2024 · TOP 5% · GPA 3.58/4.00</span></p></div><p class="about-note">A background in engineering. A focus on people. I work across requirements, solution design, delivery, and validation.</p></div><div class="experience"><p class="small-title">EXPERIENCE & PRACTICE</p><details open><summary><span class="date">JUL 2026 — PRESENT · SHENZHEN</span><strong>raizz / Axi Technology</strong><span class="role">Product Growth Intern</span></summary><p>Building and refining AI-assisted content and publishing workflows, diagnosing search issues, and researching international growth opportunities.</p></details><details><summary><span class="date">FEB — JUN 2026 · SYDNEY</span><strong>Social Media Survey Platform</strong><span class="role">Product Owner · Client-commissioned project</span></summary><p>Led a team of 5+ to connect experimental design, calibrated attention tracking, and usable research data in a live product.</p></details><details><summary><span class="date">JUN — AUG 2025 · BEIJING</span><strong>Beijing De’an IoT Technology</strong><span class="role">Product Intern · AI / GIS</span></summary><p>Translated research and user behaviour into product improvements, measured their impact, and explored applications for AI in GIS.</p></details><details><summary><span class="date">MAR — SEP 2025 · SYDNEY</span><strong>Flash Man</strong><span class="role">Product Lead · Local errand app</span></summary><p>Designed a local errand product from zero, including agent orchestration, exception handling, and human confirmation for consequential actions.</p></details></div></div>`;
const dialog=document.createElement('dialog');dialog.setAttribute('aria-labelledby','case-title');dialog.innerHTML='<div class="modal-header"><span>SELECTED WORK / CASE NOTES</span><button type="button" id="close-case">Close ✕</button></div><div class="modal-body" id="case-body"></div>';document.body.append(dialog);
function openCase(){const p=localizedProject(activeProject);document.querySelector('#case-body').innerHTML=ui(`<p class="eyebrow">0${activeProject+1} — ${p.tab.toUpperCase()}</p><h2 id="case-title">${p.title}</h2><p class="modal-meta">${p.meta}</p><h3>${language !== 'en' ? '項目背景' : 'The challenge'}</h3><p>${p.challenge}</p><h3>${language !== 'en' ? '工作內容' : 'What I did'}</h3><ul>${p.contribution.map(x=>`<li>${x}</li>`).join('')}</ul><div class="modal-result"><strong>${p.result}</strong><p>${p.outcome}</p></div>`);if(!dialog.open) dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';}
document.querySelector('#close-case').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.style.overflow='';document.querySelector('#read-case').focus();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});renderProject(0);

// Each locale has its own editorial hierarchy; English originals stay reversible.
const translatedSections = [
 ["nav a[href=\"/tianjun-portfolio/blog/\"]", "隨筆"],
 [
  "header .wordmark",
  "Galaxy<span class=\"logo-dot\"></span>"
 ],
 [
  "footer .wordmark",
  "Galaxy<span class=\"logo-dot\"></span>"
 ],
 [
  "nav a[href=\"#work\"]",
  "作品"
 ],
 [
  "nav a[href=\"#about\"]",
  "關於"
 ],
 [
  "nav a[href=\"#contact\"]",
  "聯絡"
 ],
 [
  ".hero-copy .eyebrow",
  "AI 應用 × Agent 產品"
 ],
 [
  "h1",
  "讓想法，<br><span>成為現實。</span>"
 ],
 [
  ".intro",
  "我是高天駿，悉尼大學數據科學碩士在讀。<br>聚焦 AI 應用與 Agent 產品方向。"
 ],
 [
  ".hero-copy .button",
  "探索作品 <span aria-hidden=\"true\" class=\"action-arrow\">↗</span>"
 ],
 [
  ".composition-caption > span",
  "有秩序，也有趣。"
 ],
 [
  ".hero-bottom",
  "<span>產品思考 · 動手實踐</span><span>悉尼 / 深圳</span><span class=\"index-mark\">01 / 04</span>"
 ],
 [
  "#work .eyebrow",
  "01 — 精選作品"
 ],
 [
  "#work h2",
  "項目與<br>實習經歷。"
 ],
 [
  ".section-heading > p:last-child",
  "AI + GIS、智能實驗平臺、<br>AI 工作流及 0–1 產品實踐。"
 ],
 [
  ".project-footnote",
  "從需求定義、方案設計，到上線驗證。"
 ],
 [
  "#about > .eyebrow",
  "02 — 關於我"
 ],
 [
  "#about > h2",
  "從需求定義，<br>到上線驗證。"
 ],
 [
  ".about-intro",
  "熟悉 AI 場景拆解、需求分析、方案設計、A/B 實驗與指標體系。具備 Agent 任務編排、Tool Calling、上下文管理、異常恢復及 Human-in-the-loop 等產品設計經驗。"
 ],
 [
  ".about-grid > div:first-child > .small-title:first-child",
  "我的工具箱"
 ],
 [
  ".education",
  "<p><strong>悉尼大學</strong>數據科學專業 · 碩士<br><span>2024.11 — 2026.12</span></p><p><strong>河北科技大學</strong>通信工程專業 · 本科<br><span>2020.08 — 2024.06 · 專業前 5%<br>GPA 3.58 / 4.00</span></p>"
 ],
 [
  ".education + .about-note",
  "能夠使用 SQL、Python 開展數據分析，<br>並協同研發推動 AI 產品從需求定義到上線驗證。"
 ],
 [
  ".about-grid > div:first-child > .small-title:nth-of-type(2)",
  "教育背景"
 ],
 [
  ".skill-list",
  "<span>Agent 任務編排</span><span>Tool Calling</span><span>上下文管理</span><span>異常恢復</span><span>Human-in-the-loop</span><span>需求分析</span><span>A/B 實驗</span><span>Figma / Axure</span><span>SQL / Python</span>"
 ],
 [
  ".experience > .small-title",
  "經歷與實踐"
 ],
 [
  "#contact > .eyebrow",
  "03 — 聊聊想法"
 ],
 [
  "#contact h2",
  "好的開始，<br>來自一次<span>對話。</span>"
 ],
 [
  "#copy-email",
  "複製電郵"
 ],
 [
  "footer > p",
  "從人的角度出發。"
 ],
 [
  "footer > span",
  "© 2026 高天駿"
 ],
 [
  "footer > a:last-child",
  "回到頂部 ↑"
 ],
 [
  ".skip",
  "跳至作品"
 ],
 [
  ".modal-header > span",
  "精選作品 / 項目手記"
 ],
 [
  ".experience details:nth-of-type(1) .date",
  "2026.07 — 至今 · 深圳"
 ],
 [
  ".experience details:nth-of-type(1) strong",
  "Axi Technology（Raizz）"
 ],
 [
  ".experience details:nth-of-type(1) .role",
  "Product Growth Intern"
 ],
 [
  ".experience details:nth-of-type(1) p",
  "負責消費級睡眠科技品牌 Raizz 的 AI 內容工作流、Web 發佈與搜索增長，並參與海外增長渠道及競品生態研究。"
 ],
 [
  ".experience details:nth-of-type(2) .date",
  "2026.02 — 06 · 悉尼"
 ],
 [
  ".experience details:nth-of-type(2) strong",
  "社交媒體實驗與注意力分析平臺"
 ],
 [
  ".experience details:nth-of-type(2) .role",
  "Product Owner · 客戶委託 · 已上線"
 ],
 [
  ".experience details:nth-of-type(2) p",
  "主導融合 A/B 實驗與瀏覽器端注意力追蹤的研究平臺，覆蓋實驗工作流定義、核心能力設計、部分前端開發與 5+ 人跨端協作。"
 ],
 [
  ".experience details:nth-of-type(3) .date",
  "2025.06 — 08 · 北京"
 ],
 [
  ".experience details:nth-of-type(3) strong",
  "北京德安物聯科技有限公司"
 ],
 [
  ".experience details:nth-of-type(3) .role",
  "產品實習生（AI / GIS 方向）"
 ],
 [
  ".experience details:nth-of-type(3) p",
  "參與 GIS / 智慧城市產品智能化規劃及核心轉化鏈路優化，圍繞用戶需求、產品方案、數據分析與上線驗證開展產品工作。"
 ],
 [
  ".experience details:nth-of-type(4) .date",
  "2025.03 — 09 · 悉尼"
 ],
 [
  ".experience details:nth-of-type(4) strong",
  "悉尼同城跑腿 App（Flash Man）"
 ],
 [
  ".experience details:nth-of-type(4) .role",
  "Product Lead"
 ],
 [
  ".experience details:nth-of-type(4) p",
  "從 0–1 設計同城跑腿產品，將 AI Agent 引入訂單理解、任務編排與履約異常處理，構建面向真實服務流程的智能化執行鏈路。"
 ]
].map(([selector,zh]) => {const element=document.querySelector(selector);return {element,en:element.innerHTML,zh};});
const resumeLinks=[document.querySelector('.resume-link'),document.querySelector('footer a[href$=".pdf"]')].map(element=>({element,en:element.innerHTML}));
function applyLanguage(next, persist = true) {
 language = L.normalize(next);
 const chinese = language !== 'en';
 document.documentElement.lang = L.htmlLang(language);
 document.title = chinese ? ui('Galaxy — 讓想法成為現實') : 'Galaxy — Ideas into things that work';
 document.querySelector('meta[name="description"]').content = chinese ? ui('Galaxy，高天駿的個人網站：AI 應用、Agent 工作流、實驗平臺、產品設計與增長實踐。') : 'Galaxy is the personal website of Tianjun Gao, building AI-powered products and workflows. Explore selected work in agent systems, research platforms, growth and GIS.';
 translatedSections.forEach(({element,en,zh})=>{element.innerHTML=chinese?ui(zh):en;element.lang=L.htmlLang(language);});
 resumeLinks.forEach(({element,en},i)=>{element.href=chinese?'Tianjun-Gao-Resume-ZH.pdf':'Tianjun-Gao-Resume.pdf';element.innerHTML=chinese?ui(i===0?'簡歷 <span class="tiny">PDF</span>':'中文簡歷 ↗'):en;element.lang=L.htmlLang(language);});
 document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
 document.querySelector('#copy-status').textContent='';
 document.querySelector('#composition-status').textContent='';
 document.querySelector('.composition').setAttribute('aria-label',chinese?ui('切換幾何構圖'):'Remix the geometric composition');
 document.querySelector('#close-case').textContent=chinese?ui('關閉 ✕'):'Close ✕';
 document.querySelector('nav').setAttribute('aria-label',chinese?ui('主要導覽'):'Main navigation');
 document.querySelector('header .wordmark').setAttribute('aria-label',chinese?ui('Galaxy 首頁'):'Galaxy home');
 document.querySelector('.project-tabs').setAttribute('aria-label',chinese?ui('精選作品'):'Selected projects');
 document.querySelectorAll('.brand-wordmark').forEach(el=>el.lang='en');
 renderProject(activeProject);
 if(dialog.open) openCase();
 if(persist){try{localStorage.setItem('tianjun-language',language);}catch{}}
}
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>applyLanguage(button.dataset.language)));
applyLanguage(L.initial(),false);
