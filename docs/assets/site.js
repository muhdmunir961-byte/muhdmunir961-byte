(() => {
  'use strict';
  document.documentElement.classList.add('js-ready');
  const $ = id => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenarioData = {
    software: {
      kicker: 'SCENARIO / WEB PLATFORM', number:'01 / 03', title: 'Build for predictable behavior.',
      description: 'Reliable services begin with clear boundaries. Keep input validation, state changes and failure handling understandable before scaling complexity.',
      decision: 'Explicit contracts and observable failures make a system easier to operate than hidden magic.',
      nodes: [['01 / INPUT','Client'],['02 / ENTRY','API'],['03 / LOGIC','Service'],['04 / STATE','Store']],
      code: `async function update(request) {
  const data = schema.parse(request);
  const result = await service.run(data);
  return { ok: true, result };
}`
    },
    ai: {
      kicker: 'SCENARIO / AI WORKFLOW', number:'02 / 03', title: 'Let the model assist. Keep control.',
      description: 'Useful agents need scoped tools, traceable decisions and a deliberate boundary before any action affects the real world.',
      decision: 'A confirmation checkpoint is often more valuable than another autonomous step.',
      nodes: [['01 / ASK','Intent'],['02 / GROUND','Context'],['03 / EXECUTE','Tools'],['04 / REVIEW','Human']],
      code: `const action = await agent.plan(input);
const safe = policy.check(action);
if (safe.requiresApproval) {
  return await requestApproval(action);
}`
    },
    telemetry: {
      kicker: 'SCENARIO / CONNECTED SYSTEM', number:'03 / 03', title: 'Make device data actionable.',
      description: 'A dashboard is only useful when it communicates freshness, disconnections and unsafe readings as clearly as the happy path.',
      decision: 'Never render stale sensor values as if they were live. Surface the timestamp and offline state.',
      nodes: [['01 / DEVICE','ESP32'],['02 / CHANNEL','Socket'],['03 / RULES','Validate'],['04 / DISPLAY','UI']],
      code: `if (Date.now() - sample.at > timeout) {
  showStatus('offline');
} else {
  renderReading(validate(sample));
}`
    }
  };
  const tabs = [...document.querySelectorAll('.scenario-tab')];
  let activeScenario = 'software';
  function setScenario(id, focus = false) {
    const item = scenarioData[id]; if(!item) return;
    activeScenario = id;
    tabs.forEach(tab => { const selected=tab.dataset.scenario===id;tab.classList.toggle('is-active',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(focus&&selected)tab.focus(); });
    $('scenario-panel').setAttribute('aria-labelledby','tab-'+id);
    $('scenario-kicker').textContent=item.kicker;$('scenario-index').textContent=item.number;
    $('scenario-title').textContent=item.title;$('scenario-desc').textContent=item.description;
    $('scenario-decision').textContent=item.decision;$('scenario-code').textContent=item.code;
    $('pipeline').setAttribute('aria-label',item.nodes.map(n=>n[1]).join(' to '));
    $('pipeline').innerHTML=item.nodes.map((node,i)=>`<div class="node"><span>${node[0]}</span><strong>${node[1]}</strong></div>${i<3?'<div class="route-line" aria-hidden="true"><span></span></div>':''}`).join('');
  }
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>setScenario(tab.dataset.scenario));
    tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=tabs.indexOf(tab);let to=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(i+1)%tabs.length:(i+tabs.length-1)%tabs.length;setScenario(tabs[to].dataset.scenario,true)});
  });
  const shortcuts = [
    {text:'Approach — how I think',hint:'01',href:'#approach',tokens:'principles process'},
    {text:'Systems — architecture explorer',hint:'02',href:'#systems',tokens:'software api ai connected design'},
    {text:'Practice — technical focus',hint:'03',href:'#work',tokens:'skills tools stack'},
    {text:'About — AWA & background',hint:'04',href:'#about',tokens:'founder automotive'},
    {text:'Lab — play SIGNAL / 60',hint:'05',href:'#lab',tokens:'game arcade'},
    {text:'GitHub — open profile',hint:'↗',href:'https://github.com/muhdmunir961-byte',external:true,tokens:'source code'},
    {text:'AWA — visit company',hint:'↗',href:'https://awatech.my.id',external:true,tokens:'company'}
  ];
  const dialog=$('command-dialog'), search=$('command-search'), results=$('command-results');let filtered=[...shortcuts],cursor=0;
  function renderActions(query=''){
    const q=query.trim().toLowerCase();filtered=shortcuts.filter(x=>[x.text,x.tokens].join(' ').toLowerCase().includes(q));cursor=0;results.replaceChildren();
    if(!filtered.length){const p=document.createElement('p');p.className='command-empty';p.textContent='No matching actions.';results.append(p);return}
    filtered.forEach((action,i)=>{const b=document.createElement('button');b.type='button';b.className='command-item';b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===cursor));const label=document.createElement('span');label.textContent=action.text;const hint=document.createElement('small');hint.textContent=action.hint;b.append(label,hint);b.addEventListener('mouseenter',()=>select(i));b.addEventListener('click',()=>activate(action));results.append(b)})
  }
  function select(i){cursor=i;[...results.children].forEach((node,j)=>node.setAttribute('aria-selected',String(j===cursor)));results.children[cursor]?.scrollIntoView({block:'nearest'});}
  function openMenu(){search.value='';renderActions();dialog.showModal();search.focus()}
  function closeMenu(){if(dialog.open)dialog.close()}
  function activate(action){closeMenu();if(action.external){window.open(action.href,'_blank','noopener,noreferrer')}else{document.querySelector(action.href)?.scrollIntoView({behavior:reduceMotion?'auto':'smooth'})}}
  $('command-trigger').addEventListener('click',openMenu);$('command-close').addEventListener('click',closeMenu);
  search.addEventListener('input',()=>renderActions(search.value));
  search.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','Enter'].includes(e.key))e.preventDefault();if(e.key==='ArrowDown'&&filtered.length)select((cursor+1)%filtered.length);if(e.key==='ArrowUp'&&filtered.length)select((cursor+filtered.length-1)%filtered.length);if(e.key==='Enter'&&filtered[cursor])activate(filtered[cursor])});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.open?closeMenu():openMenu()} });
  const reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!reduceMotion){const io=new IntersectionObserver((es,obs)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px 35px 0px'});reveals.forEach(el=>io.observe(el));}else reveals.forEach(el=>el.classList.add('is-visible'));
  const navItems=[...document.querySelectorAll('[data-nav]')],sections=['approach','systems','lab','about'].map(id=>$(id));
  if('IntersectionObserver' in window){const spy=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){navItems.forEach(a=>{if(a.dataset.nav===entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}}),{rootMargin:'-30% 0px -60% 0px'});sections.forEach(el=>spy.observe(el))}
  let pending=false;function progress(){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);$('reading-progress').style.width=(Math.min(1,scrollY/max)*100).toFixed(2)+'%';pending=false}
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(progress)}},{passive:true});progress();addEventListener('resize',progress);
  $('game-help-toggle').addEventListener('click',()=>{const h=$('game-help'),visible=h.hidden;h.hidden=!visible;$('game-help-toggle').setAttribute('aria-expanded',String(visible))});
  let toastTimer=0;function toast(str){clearTimeout(toastTimer);const el=$('toast');el.textContent=str;el.hidden=false;toastTimer=setTimeout(()=>el.hidden=true,2800)}
  $('copy-page').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Link copied.')}catch(e){toast('Copy the URL from your address bar.')}});
  $('current-year').textContent=String(new Date().getFullYear());
})();