/* EDA Quest: partida local, corrección determinista y recuperación de errores. */
(() => {
  'use strict';
  const C = window.EDA_CONTENT;
  const E = window.EDA_CHALLENGES;
  const KEY = 'eda_quest_city_v8';
  const main = document.getElementById('main');
  const $ = (s, el = document) => el.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = x => JSON.parse(JSON.stringify(x));
  const paths = {
    map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z"/><path d="M9 3v16M15 5v16"/>',
    book:'<path d="M12 6C8 3 4 4 2 5v15c3-1 6-1 10 1 4-2 7-2 10-1V5c-2-1-6-2-10 1Z"/><path d="M12 6v15"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
    badge:'<path d="m9 15-2 7 5-3 5 3-2-7"/><circle cx="12" cy="9" r="7"/><path d="m9 9 2 2 4-4"/>',
    star:'<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1 3-6Z"/>',
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
    back:'<path d="M20 12H5m6-6-6 6 6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    moon:'<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    sound:'<path d="m4 9 4 0 5-5v16l-5-5H4V9Z"/><path d="M17 8c3 2 3 6 0 8m2-11c5 4 5 10 0 14"/>',
    mute:'<path d="m4 9 4 0 5-5v16l-5-5H4V9Z"/><path d="m17 9 5 6m0-6-5 6"/>',
    lock:'<rect x="4" y="10" width="16" height="12" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>',
    bulb:'<path d="M8 15C1 8 8 1 13 3s8 7 3 12l-1 3H9l-1-3Zm2 6h4"/>',
    repeat:'<path d="m3 10 3-6 5-1h8m-4-3 4 3-4 4M21 14l-3 6-5 1H5m4 3-4-3 4-4"/>',
    chart:'<path d="M3 3v18h18M7 17v-5m5 5V7m5 10V4"/>',
    robot:'<rect x="3" y="5" width="18" height="15" rx="5"/><path d="M12 1v4M7 11v2m10-2v2M9 16h6M1 10v5m22-5v5"/>',
    shield:'<path d="m12 2 9 4v6c-1 5-5 8-9 10-4-2-8-5-9-10V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
    pen:'<path d="m3 17 12-12 4 4L7 21H3v-4Zm12-12 3-3 4 4-3 3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
    trophy:'<path d="M7 3h10v6a5 5 0 0 1-10 0V3ZM7 5H3v4a4 4 0 0 0 4 4m10-8h4v4a4 4 0 0 1-4 4m-5 1v6m-4 0h8"/>',
    heart:'<path d="M12 21C-5 10 4-3 12 5c8-8 17 5 0 16Z"/>',
    focus:'<path d="M3 9V3h6m6 0h6v6m0 6v6h-6m-6 0H3v-6"/><circle cx="12" cy="12" r="3"/>',
    code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>'
  };
  paths.compass='<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>';
  paths.bus='<rect x="4" y="3" width="16" height="17" rx="4"/><path d="M4 11h16M8 3v8M7 20v2m10-2v2M7 16h1m8 0h1"/>';
  function icon(name, cls = '') { return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`; }
  function readJSON(key, fallback) { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch (_) { return fallback; } }
  function fresh() { return {version:8,completed:{},earned:{},read:[],quiz:{},drafts:{},writtenReview:{},errors:{},settings:{sound:false,focus:false},session:null,lastResult:null,legacy:null,sequence:0}; }
  function load() {
    const old = readJSON(KEY, null);
    if (old && old.version === 8 && Array.isArray(old.read) && old.completed && old.earned && old.errors) return {...fresh(), ...old, settings:{...fresh().settings,...old.settings}};
    const n = fresh(), prior = readJSON('eda_state', {}), drafts = readJSON('eda_drafts', {}), quest = readJSON('eda_quest_v1', {});
    if (Array.isArray(prior.read)) n.read = prior.read.filter(v => Number.isInteger(v) && v>=0 && v<38).map(v=>'l'+v);
    if (prior.answered && typeof prior.answered==='object') Object.entries(prior.answered).forEach(([i,v])=>{const q=C.quizzes[+i];if(q&&Number.isInteger(v)&&v>=0&&v<q.options.length)n.quiz[q.id]={answer:v,correct:v===q.answer,attempts:1};});
    if(drafts&&typeof drafts==='object')Object.entries(drafts).forEach(([i,v])=>{if(C.written[+i]&&typeof v==='string')n.drafts['w'+i]=v;});
    if (quest.completed) n.legacy={missions:Object.values(quest.completed).filter(Boolean).length};
    return n;
  }
  let state = load();
  let page = 'map', theoryFilter='all', search='', writtenId='w0', writtenShown=false;
  let quizRun=null, quizPick=null, quizFeedback=null;
  let selectedChip=null, selectedMatch=null, modalAction=null, toastTimer=null, storageWarning=false, audioCtx=null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { if(!storageWarning){storageWarning=true;toast('El navegador no permite guardar: mantén esta pestaña abierta.');} } }
  function toast(msg) { const t=$('#toast'); t.textContent=msg; t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3300); }
  const xp = () => Object.values(state.earned).reduce((a,v)=>a+(Number(v)||0),0);
  const core = () => E.missions.filter(m=>!m.extra);
  const done = () => core().filter(m=>state.completed[m.id]).length;
  function rank(){const n=done();return n>=5?'Analista de Ciudad Delta':n>=3?'Investigador de datos':n>=1?'Explorador de evidencias':'Aprendiz de EDA';}
  function mission(id){return E.missions.find(m=>m.id===id);}
  function unlocked(m){return m.id!=='auditoria'||['variables','autobuses','esperas','graficos'].every(id=>state.completed[id]);}
  function nextMission(){return core().find(m=>!state.completed[m.id]&&unlocked(m)) || mission('auditoria');}
  function stars(n){return `<span class="stars" aria-label="${n} de 3 estrellas">${[1,2,3].map(i=>icon('star',i<=n?'earned':'')).join('')}</span>`;}
  function updateChrome(){
    $('#header-xp').textContent=`${xp()} XP`;
    $('#theme-button').innerHTML=icon(document.documentElement.dataset.theme==='dark'?'sun':'moon');
    $('#theme-button').setAttribute('aria-label',document.documentElement.dataset.theme==='dark'?'Activar modo claro':'Activar modo oscuro');
    $('#sound-button').innerHTML=icon(state.settings.sound?'sound':'mute');
    $('#sound-button').setAttribute('aria-label',state.settings.sound?'Desactivar sonidos':'Activar sonidos');
    $('#sound-button').setAttribute('aria-pressed',String(!!state.settings.sound));
    document.body.classList.toggle('focus-mode',!!state.settings.focus&&page==='game');
    document.querySelector('meta[name=theme-color]').content=document.documentElement.dataset.theme==='dark'?'#101d27':'#f3f3ed';
    document.querySelectorAll('.bottom-nav button').forEach(b=>{const active=b.dataset.page===(['briefing','game','result'].includes(page)?'map':['quiz','quiz-result','written','review'].includes(page)?'practice':page);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  }
  function navigate(to){page=to;selectedChip=null;selectedMatch=null;render();window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});}
  function render(){
    updateChrome();
    if(page==='map')renderMap();else if(page==='theory')renderTheory();else if(page==='practice')renderPractice();else if(page==='profile')renderProfile();else if(page==='game')renderGame();else if(page==='result')renderResult();else if(page==='quiz')renderQuiz();else if(page==='quiz-result')renderQuizResult();else if(page==='written')renderWritten();
  }
  function city(){
    const active=id=>state.completed[id]?'repaired':'';
    const windows=(x,y,w,h)=>Array.from({length:4},(_,i)=>`<rect class="city-window" x="${x+(i%2)*w}" y="${y+Math.floor(i/2)*h}" width="7" height="10" rx="2"/>`).join('');
    return `<svg viewBox="0 0 420 300" class="city-svg" role="img" aria-label="Ciudad Delta: ${done()} de 5 zonas recuperadas"><ellipse class="city-ground" cx="210" cy="228" rx="175" ry="47"/><path d="M69 211 120 168 204 201 290 161 349 207M120 168 180 116 290 161" fill="none" class="city-connector" stroke-width="3"/><g class="${active('variables')}"><path class="city-block ${active('variables')}" d="M63 154h57v66H63zM58 154l33-24 35 24"/>${windows(75,168,22,23)}<text x="90" y="243" text-anchor="middle" class="city-label">ARCHIVO</text></g><g class="${active('autobuses')}"><rect class="city-block ${active('autobuses')}" x="141" y="185" width="67" height="37" rx="10"/><rect class="city-window" x="151" y="194" width="16" height="11" rx="2"/><rect class="city-window" x="174" y="194" width="23" height="11" rx="2"/><circle cx="157" cy="222" r="6" fill="var(--faint)"/><circle cx="193" cy="222" r="6" fill="var(--faint)"/></g><g class="${active('esperas')}"><path class="city-block ${active('esperas')}" d="M158 146V89h58v57Z"/><path d="M187 67v22m-10-10h20" stroke="var(--gold)" stroke-width="3"/><circle cx="187" cy="111" r="13" fill="var(--field)" stroke="var(--line)"/><path d="M187 102v9l6 4" stroke="var(--accent)" stroke-width="2" fill="none"/><text x="187" y="161" text-anchor="middle" class="city-label">OFICINA</text></g><g class="${active('graficos')}"><rect class="city-block ${active('graficos')}" x="254" y="114" width="54" height="75" rx="5"/>${windows(266,128,20,25)}<path d="M263 114V97h35v17" class="city-block ${active('graficos')}"/><text x="282" y="207" text-anchor="middle" class="city-label">OBSERVATORIO</text></g><g class="${active('auditoria')}"><path class="city-block ${active('auditoria')}" d="M322 174h40v46h-40zM317 174l25-18 25 18"/>${windows(329,184,16,18)}</g><g transform="translate(239 221)"><rect width="30" height="27" rx="9" fill="var(--accent)"/><path d="M15-6v6" stroke="var(--accent)" stroke-width="3"/><circle cx="15" cy="-7" r="3" fill="var(--gold)"/><rect x="6" y="8" width="5" height="6" rx="2" fill="var(--accent-ink)"/><rect x="20" y="8" width="5" height="6" rx="2" fill="var(--accent-ink)"/><path d="M11 20h9" stroke="var(--accent-ink)" stroke-width="2"/></g><path d="m104 76 3 7 7 3-7 3-3 7-3-7-7-3 7-3Zm227-8 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" class="city-star"/><circle cx="244" cy="55" r="2" class="city-star"/><circle cx="53" cy="111" r="2" class="city-star"/></svg>`;
  }
  function renderMap(){
    const next=nextMission(), all=done()===core().length;
    main.innerHTML=`${state.session?`<div class="session-banner"><div><strong>Tu partida está guardada</strong><p>${esc(state.session.title)} · reto ${Math.min(state.session.index+1,state.session.queue.length)} de ${state.session.queue.length}</p></div><button class="btn" data-action="resume">Continuar ${icon('arrow')}</button></div>`:''}
      <section class="hero"><div class="hero-copy"><span class="pill green">${icon('map')} UNA AVENTURA PARA TU EXAMEN</span><h1>${all?'La ciudad vuelve<br>a tener <em>sentido.</em>':'Los datos son un lío.<br><em>Tú tienes la clave.</em>'}</h1><p>${all?'Has reconstruido el informe de Ciudad Delta. Pon a prueba lo aprendido con nuevos datos o recupera una estrella.':'Viajes duplicados, esperas extrañas y gráficos sin sentido. Recupera Ciudad Delta resolviendo el misterio, un ejercicio cada vez.'}</p><div class="hero-actions"><button class="btn" data-action="${state.session?'resume':'brief'}" data-id="${next.id}">${state.session?'Continuar partida':all?'Nueva auditoría':'Empezar aventura'} ${icon('arrow')}</button><button class="btn secondary" data-action="how">Cómo se juega</button></div></div><div class="hero-art">${city()}<span class="city-footer">${done()} de 5 zonas recuperadas</span></div></section>
      <div class="status-grid"><div class="status-card">${icon('bolt')}<div><b>${xp()}</b><small>Experiencia ganada</small></div></div><div class="status-card">${icon('star')}<div><b>${Object.values(state.completed).reduce((s,m)=>s+m.stars,0)}</b><small>Estrellas de precisión</small></div></div><div class="status-card">${icon('repeat')}<div><b>${Object.values(state.errors).filter(e=>!e.resolved).length}</b><small>Evidencias por repasar</small></div></div></div>
      <div class="section-heading"><h2>Tu ruta por la ciudad</h2><small>5 misiones + un taller extra</small></div><div class="map-grid">${core().map((m,i)=>missionCard(m,i+1,next.id)).join('')}</div>
      ${E.missions.filter(m=>m.extra).map(m=>missionCard(m,'+',null,'extra-card')).join('')}
      <div class="helper-strip">${icon('robot')}<p><strong>Aprender también cuenta cuando te equivocas.</strong> Un fallo trae una explicación y una revancha. Puedes pausar la partida y volver cuando quieras.</p></div>
      <p class="footer-note">EDA y contenido posterior · Sin Python inicial · ${C.topics.reduce((n,t)=>n+t.lessons.length,0)} lecciones de consulta</p>`;
  }
  function missionCard(m,n,recommended,extra=''){
    const complete=state.completed[m.id],locked=!unlocked(m);
    return `<button class="mission ${extra} ${complete?'completed':''} ${recommended===m.id&&!complete?'recommended':''} ${locked?'locked':''}" data-action="brief" data-id="${m.id}" ${locked?'aria-label="Auditoría final: completa las cuatro primeras zonas"':''}><span class="mission-icon">${icon(locked?'lock':m.icon)}</span><span class="mission-body"><span class="mission-number">${m.extra?'TALLER EXTRA':`ZONA 0${n}`}${recommended===m.id&&!complete?' · SIGUIENTE':''}</span><h3>${esc(m.shortTitle||m.title)}</h3><p>${esc(m.description)}</p><span class="mission-bottom">${stars(complete?.stars||0)}<span class="tiny muted">${locked?'Recupera 4 zonas':complete?'Practicar otra vez':m.id==='auditoria'?'Reto final · 6 ejercicios':'5 ejercicios'}</span></span></span><span class="mission-arrow">${icon(locked?'lock':'arrow')}</span></button>`;
  }
  function showBrief(id){
    const m=mission(id);if(!m)return;
    if(!unlocked(m)){toast('Recupera Archivo, Estación, Oficina y Observatorio para abrir el informe final.');return;}
    page='briefing';updateChrome();
    main.innerHTML=`<div class="briefing"><button class="text-btn back" data-action="nav" data-page="map">${icon('back')} Volver al mapa</button><div class="panel"><div class="big-icon">${icon(m.icon)}</div><span class="eyebrow">${m.extra?'CONTENIDO ADICIONAL':'ANTES DE JUGAR · LO ESENCIAL'}</span><h1>${esc(m.title)}</h1><p class="briefing-intro">${esc(m.description)}</p>${m.briefing.map((r,i)=>`<div class="rule"><span class="rule-num">${i+1}</span><p>${esc(r)}</p></div>`).join('')}<div class="helper-strip">${icon('shield')}<p><strong>Tu objetivo:</strong> ${esc(m.repair)}. Resuelve todos los ejercicios; si uno se resiste, tienes pistas y recuperación.</p></div><button class="btn wide start" data-action="start-mission" data-id="${m.id}">Entrar en la misión ${icon('arrow')}</button><p class="footer-note">Las variantes nuevas se marcan como práctica. Los cuartiles siguen la convención indicada en cada reto.</p></div></div>`;
    window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
  }
  function makeSeed(){state.sequence++;return (Date.now()+state.sequence*137)%2147483647;}
  function newSession(mode,id){
    const seed=makeSeed(); let queue,title;
    if(mode==='mission'){const m=mission(id);queue=E.makeMission(id,seed).map((c,i)=>({challenge:c,origin:id,slot:i,recovery:false}));title=m.title;}
    else if(mode==='review') {queue=Object.values(state.errors).filter(e=>!e.resolved).slice(0,8).map(e=>({challenge:clone(e.challenge),origin:e.origin,slot:e.slot,recovery:true}));title='Recupera las evidencias';}
    else {queue=['variables','autobuses','esperas','graficos','auditoria'].map((origin,i)=>{const list=E.makeMission(origin,seed+i);const slot=(Math.floor(seed/11)+i)%list.length;return{challenge:list[slot],origin,slot,recovery:false};});title='Partida rápida';}
    if(!queue.length){toast('No tienes evidencias pendientes. Prueba una partida rápida.');return;}
    state.session={mode,id:mode==='mission'?id:mode,title,seed,queue,index:0,answers:{},attempts:{},hints:{},solutions:{},results:{},pending:[],recoveryAdded:false,feedback:null,showSolution:false,combo:0,maxCombo:0,award:0,startedAt:Date.now(),baseLength:queue.length};save();navigate('game');
  }
  function requestStart(mode,id){
    if(state.session){openModal('Ya tienes una partida guardada','Puedes continuarla o empezar esta misión. Al empezar otra se sustituye la partida en curso; conservas las misiones completadas y tu experiencia.',[{label:'Continuar partida',action:()=>navigate('game')},{label:'Empezar esta partida',action:()=>newSession(mode,id),secondary:true}]);}
    else newSession(mode,id);
  }
  function current(){const s=state.session;return s?.queue[s.index];}
  function answer(){const s=state.session;if(!s)return{};return s.answers[s.index]||(s.answers[s.index]={});}
  function lockedAnswer(){const s=state.session;return !s||!!s.results[s.index]||s.showSolution;}
  function typeLabel(t){return {sort:'Clasifica las evidencias',order:'Reconstruye el orden',fields:'Repara y calcula',match:'Une las piezas',pick:'Audita la decisión',box:'Reconstruye el boxplot'}[t]||'Resuelve el reto';}
  function progressGame(){const s=state.session;return Object.keys(s.results).length/s.queue.length*100;}
  function renderGame(){
    const s=state.session;if(!s){navigate('map');return;}
    const item=current();if(!item){finishSession();return;}const c=item.challenge,a=answer(),result=s.results[s.index];
    main.innerHTML=`<div class="game-shell"><div class="game-top"><button class="icon-btn" data-action="nav" data-page="map" aria-label="Guardar y volver al mapa">${icon('back')}</button><div class="game-track"><div class="row spread"><span>${esc(s.title)}</span><strong>${s.index+1}/${s.queue.length}</strong></div><div class="progress-track" role="progressbar" aria-label="Progreso de la partida" aria-valuemin="0" aria-valuemax="${s.queue.length}" aria-valuenow="${Object.keys(s.results).length}"><div class="progress-fill" style="width:${progressGame()}%"></div></div></div><div class="game-status"><span class="combo">${s.combo>=2?'Racha ×'+s.combo:icon('bolt')}</span><button class="icon-btn" data-action="focus" aria-label="${state.settings.focus?'Salir del':'Activar'} modo concentración">${icon('focus')}</button></div></div>
      <article class="challenge-card ${s.feedback?.kind==='success'?'soft-in':''}"><div class="row spread wrap"><span class="eyebrow">${item.recovery?'REVANCHA · RECUPERA LA EVIDENCIA':typeLabel(c.type)}</span><span class="challenge-source">${esc(c.source||'Práctica')}</span></div><h1>${esc(c.title)}</h1><p class="challenge-prompt">${esc(c.prompt)}</p>${c.context?`<div class="audit-context">${esc(c.context)}</div>`:''}${c.data&&!Array.isArray(c.data)?renderData(c.data):''}<div class="challenge-board">${renderBoard(c,a)}</div>
      ${s.hints[s.index]?`<aside class="hint-box"><strong>Pista:</strong> ${esc(c.hint)}</aside>`:''}
      ${s.showSolution?`<div class="feedback"><div class="feedback-title">${icon('book')} Solución explicada</div><p>${esc(c.explanation)}</p>${solutionView(c)}<p class="small muted">Ahora vuelve a construirla. Se registrará como resuelta con ayuda.</p><button class="btn" data-action="retry-solution">Resolver de nuevo ${icon('repeat')}</button></div>`:
      s.feedback?feedbackView(c,s.feedback,result):''}
      ${!result&&!s.showSolution?`<div class="game-actions"><button class="text-btn" data-action="hint">${icon('bulb')}${s.hints[s.index]?'Recordar pista':'Necesito una pista'}</button><button class="btn" data-action="check">Comprobar ${icon('check')}</button></div>${(s.attempts[s.index]||0)>=2?`<button class="text-btn" data-action="solution">Ver solución y volver a practicar</button>`:''}`:''}
      </article><p class="game-footnote">${s.pending.length&&!s.recoveryAdded?`${s.pending.length} evidencias tendrán una revancha al terminar este tramo.<br>`:''}${iconSmallSave()} Partida guardada automáticamente · Puedes parar en cualquier momento.</p></div>`;
  }
  function iconSmallSave(){return '✓';}
  function renderData(data){return `<div class="table-scroll" tabindex="0" aria-label="Datos del ejercicio"><table class="data-table"><thead><tr>${data.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${data.rows.map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
  function renderBoard(c,a){
    const disabled=lockedAnswer()?'disabled':'',s=state.session;
    if(c.type==='sort'){
      const assigned=a.assign||{},left=c.items.filter(i=>!assigned[i.id]);
      return `<p class="instruction">Toca una ficha y después su destino. Toca una ficha colocada para moverla.</p><div class="chip-pool" aria-label="Fichas sin clasificar">${left.length?left.map(i=>`<button class="chip ${selectedChip===i.id?'selected':''}" data-action="sort-select" data-id="${esc(i.id)}" aria-pressed="${selectedChip===i.id}" ${disabled}>${esc(i.label)}</button>`).join(''):'<span class="small muted">Todas las fichas están colocadas. Comprueba la clasificación.</span>'}</div><div class="bins">${c.categories.map(cat=>`<div class="bin ${selectedChip?'active-target':''}"><button class="bin-target" data-action="sort-place" data-id="${esc(cat.id)}" aria-label="${esc(cat.label)}, colocar ficha seleccionada" ${disabled}><strong>${esc(cat.label)}</strong><small>${selectedChip?'Colocar aquí ↓':'Destino de las fichas'}</small></button><div class="bin-items">${c.items.filter(i=>assigned[i.id]===cat.id).map(i=>`<button class="bin-chip" data-action="sort-remove" data-id="${esc(i.id)}" aria-label="Mover ${esc(i.label)}" ${disabled}>${esc(i.label)}</button>`).join('')}</div></div>`).join('')}</div>${Object.keys(assigned).length&&!disabled?`<button class="text-btn" data-action="reset-answer">${icon('repeat')} Recolocar las fichas</button>`:''}`;
    }
    if(c.type==='order'){
      const ids=a.order||[];return `<p class="instruction">Toca las piezas en el orden que pide el reto. Toca una pieza colocada para devolverla.</p><div class="placed-list ${c.id.startsWith('code-')?'code-stack':''}" aria-label="Tu secuencia ordenada">${ids.length?ids.map((id,i)=>{const it=c.items.find(v=>v.id===id);return`<button class="chip" data-action="order-remove" data-id="${esc(id)}" aria-label="Quitar ${esc(it?.label)} de la posición ${i+1}" ${disabled}>${esc(it?.label)}</button>`;}).join(''):'<span class="order-placeholder">Tu secuencia empieza aquí…</span>'}</div><div class="chip-pool ${c.id.startsWith('code-')?'code-stack':''}" aria-label="Valores disponibles">${c.items.filter(i=>!ids.includes(i.id)).map(i=>`<button class="chip" data-action="order-add" data-id="${esc(i.id)}" ${disabled}>${esc(i.label)}</button>`).join('')}</div><div class="order-footer"><span>${ids.length} de ${c.items.length} colocados</span>${!disabled?'<button class="text-btn" data-action="reset-answer">Reiniciar orden</button>':''}</div>`;
    }
    if(c.type==='fields'){
      const vals=a.values||{},wrong=s.feedback?.wrong||[];
      return `<div class="field-list">${c.fields.map(f=>`<div class="field-row ${wrong.includes(f.id)?'invalid':''}"><label for="field-${esc(f.id)}">${esc(f.label)}</label><div class="field-control">${f.kind==='select'?`<select id="field-${esc(f.id)}" data-input="field" data-id="${esc(f.id)}" ${disabled}><option value="">Elige una acción…</option>${f.options.map(o=>`<option value="${esc(o.value)}" ${String(vals[f.id])===String(o.value)?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`:`<input id="field-${esc(f.id)}" class="${f.unit?'with-unit':''}" data-input="field" data-id="${esc(f.id)}" type="text" ${f.kind==='number'?'inputmode="decimal"':''} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${f.kind==='number'?'Tu resultado':'Completa…'}" value="${esc(vals[f.id]??'')}" ${disabled}>${f.unit?`<span class="field-unit">${esc(f.unit)}</span>`:''}`}</div></div>`).join('')}</div>`;
    }
    if(c.type==='match'){
      const matched=a.matches||{},rights=shuffle(c.pairs.map(x=>({id:x.id,right:x.right})),state.session.seed+c.id.length);
      return `<p class="instruction">Toca una tarjeta de la izquierda y su pareja de la derecha. El número marca cada pareja.</p><div class="match-grid"><div class="match-column">${c.pairs.map((p,i)=>`<button class="match-tile ${selectedMatch===p.id?'selected':''} ${matched[p.id]?'paired':''}" data-action="match-select" data-id="${esc(p.id)}" aria-pressed="${selectedMatch===p.id}" ${disabled}><span class="match-no">${i+1}</span><span>${esc(p.left)}</span></button>`).join('')}</div><div class="match-column">${rights.map(p=>{const left=c.pairs.findIndex(v=>matched[v.id]===p.right);return`<button class="match-tile ${left>=0?'paired':''}" data-action="match-place" data-value="${esc(p.right)}" ${disabled}><span class="match-no">${left>=0?left+1:'·'}</span>${chartMini(p.right)}<span>${esc(p.right)}</span></button>`;}).join('')}</div></div><p class="match-lines">${Object.keys(matched).length}/${c.pairs.length} parejas. Puedes tocar una tarjeta para cambiar su pareja.</p>`;
    }
    if(c.type==='pick'){
      const selected=a.selected||[];return `<p class="instruction">${c.correct.length>1?'Selecciona todas las afirmaciones que correspondan.':'Elige una respuesta.'}</p><div class="answer-options">${c.options.map((o,i)=>`<button class="answer-option ${selected.includes(i)?'selected':''}" data-action="pick" data-value="${i}" aria-pressed="${selected.includes(i)}" ${disabled}><span class="option-letter">${c.correct.length>1?(selected.includes(i)?'✓':'+'):String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
    }
    if(c.type==='box'){
      const positions=a.positions||{};
      return `<p class="instruction">Sitúa cada pieza escribiendo su valor. El dibujo muestra tu construcción; aún no es una solución.</p><div class="box-plot" id="boxplot-display">${boxSVG(c,a)}</div><div class="box-labels">${c.labels.map(l=>`<label for="box-${esc(l.id)}"><span>${esc(l.label)}</span><input id="box-${esc(l.id)}" data-input="box" data-id="${esc(l.id)}" type="text" inputmode="decimal" autocomplete="off" placeholder="min" value="${esc(positions[l.id]??'')}" ${disabled}></label>`).join('')}</div>`;
    }
    return '<p>Este reto no está disponible.</p>';
  }
  function chartMini(name){
    const text=String(name).toLowerCase();let d='';
    if(/barras/.test(text))d='<path d="M8 28V18h6v10M22 28V8h6v20M36 28V13h6v15" stroke-width="5"/>';
    else if(/histograma/.test(text))d='<path d="M7 28V20h8V11h8V6h8v9h8v13Z" fill="currentColor" fill-opacity=".25"/>';
    else if(/dispersi/.test(text))d='<circle cx="10" cy="27" r="2"/><circle cx="19" cy="21" r="2"/><circle cx="29" cy="20" r="2"/><circle cx="37" cy="10" r="2"/><circle cx="44" cy="8" r="2"/>';
    else if(/boxplot/.test(text))d='<path d="M7 16h38M8 10v12m36-12v12"/><rect x="18" y="7" width="17" height="19" fill="currentColor" fill-opacity=".2"/><path d="M25 7v19"/>';
    else if(/calor/.test(text))d='<rect x="8" y="6" width="12" height="10" opacity=".3"/><rect x="22" y="6" width="12" height="10" opacity=".7"/><rect x="36" y="6" width="12" height="10" opacity=".5"/><rect x="8" y="19" width="12" height="10" opacity=".8"/><rect x="22" y="19" width="12" height="10" opacity=".3"/><rect x="36" y="19" width="12" height="10"/>';
    return d?`<svg class="chart-mini" viewBox="0 0 55 36" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${d}</svg>`:'';
  }
  function boxSVG(c,a){
    const axis=c.axis||{min:0,max:40},range=axis.max-axis.min||1,toNum=v=>Number(String(v).replace(',','.')),x=v=>25+(toNum(v)-axis.min)/range*330,p=a.positions||{},colors=['#8ce2c5','#f3cb77','#b7a5e5','#8bbfd7','#ffb6a3'];
    const selected=c.labels.filter(l=>p[l.id]!==undefined&&p[l.id]!==''&&Number.isFinite(toNum(p[l.id]))&&toNum(p[l.id])>=axis.min&&toNum(p[l.id])<=axis.max);
    const q1=c.labels.find(l=>/q1/i.test(l.id+' '+l.label)),q3=c.labels.find(l=>/q3/i.test(l.id+' '+l.label));
    const rect=q1&&q3&&selected.includes(q1)&&selected.includes(q3)?`<rect x="${Math.min(x(p[q1.id]),x(p[q3.id]))}" y="47" width="${Math.abs(x(p[q3.id])-x(p[q1.id]))}" height="30" fill="var(--accent)" opacity=".18" stroke="var(--accent)"/>`:'';
    return `<svg viewBox="0 0 380 145" role="img" aria-label="Recta para colocar las piezas del boxplot"><path d="M25 84H355" stroke="currentColor" opacity=".5"/>${[0,1,2,3,4].map(i=>{const v=axis.min+range*i/4;return`<path d="M${x(v)} 80v8" stroke="currentColor"/><text x="${x(v)}" y="104" text-anchor="middle">${Number(v.toFixed(1))}</text>`;}).join('')}${rect}${c.data.map((v,i)=>`<circle cx="${x(v)}" cy="${122+(i%2)*7}" r="3" fill="currentColor" opacity=".65"/>`).join('')}${selected.map(l=>{const i=c.labels.indexOf(l);return`<line x1="${x(p[l.id])}" y1="${22+(i%2)*16}" x2="${x(p[l.id])}" y2="82" stroke="${colors[i%colors.length]}" stroke-width="2" ${/limit|límite|fence/i.test(l.id+' '+l.label)?'stroke-dasharray="4 3"':''}/><circle cx="${x(p[l.id])}" cy="${22+(i%2)*16}" r="9" fill="var(--surface)" stroke="${colors[i%colors.length]}"/><text x="${x(p[l.id])}" y="${26+(i%2)*16}" text-anchor="middle" style="font-size:10px">${i+1}</text>`;}).join('')}</svg><div class="box-legend">${c.labels.map((l,i)=>`<span><i class="box-dot" style="background:${colors[i%colors.length]}"></i>${i+1}. ${esc(l.label)}</span>`).join('')}</div>`;
  }
  function feedbackView(c,f,result){
    return `<div class="feedback ${f.kind==='success'?'success':f.kind==='retry'?'retry':''}" role="status"><div class="feedback-title">${icon(f.kind==='success'?'check':f.kind==='retry'?'repeat':'info')}${esc(f.title)}</div><p>${esc(f.text)}</p>${f.details?.length?`<details ${f.kind==='retry'?'open':''}><summary class="small">Ver corrección por partes</summary><div class="feedback-details">${f.details.map(d=>`<div class="feedback-detail"><b>${d.ok?'✓':'↻'} ${esc(d.label)}</b><span>${esc(d.explanation)}</span></div>`).join('')}</div></details>`:''}${result?`<button class="btn wide" data-action="next">${state.session.index===state.session.queue.length-1?'Cerrar este tramo':'Siguiente evidencia'} ${icon('arrow')}</button>`:''}</div>`;
  }
  function solutionView(c){
    const sol=E.solution(c);let pairs=[];
    if(c.type==='sort')pairs=c.items.map(i=>[i.label,c.categories.find(cat=>cat.id===sol.assign[i.id])?.label]);
    if(c.type==='fields')pairs=c.fields.map(f=>[f.label,f.kind==='select'?f.options.find(o=>String(o.value)===String(sol.values[f.id]))?.label:sol.values[f.id]]);
    if(c.type==='match')pairs=c.pairs.map(p=>[p.left,p.right]);
    if(c.type==='box')pairs=c.labels.map(l=>[l.label,l.value]);
    if(c.type==='pick')pairs=c.correct.map(i=>['Decisión correcta',c.options[i]]);
    if(c.type==='order')pairs=[['Orden',sol.order.map(id=>c.items.find(i=>i.id===id).label).join(' → ')]];
    return `<div class="solution-box"><dl>${pairs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`;
  }
  function resetFeedback(){const s=state.session;if(s&&!s.results[s.index])s.feedback=null;}
  function checkChallenge(){
    const s=state.session;if(!s||s.results[s.index]||s.showSolution)return;
    const item=current(),c=item.challenge,g=E.grade(c,answer());
    if(!g.complete){s.feedback={kind:'info',title:'Todavía falta una pieza',text:g.feedback||'Completa todos los campos antes de comprobar.'};save();renderGame();scrollFeedback();return;}
    s.attempts[s.index]=(s.attempts[s.index]||0)+1;
    const key=item.origin+':'+item.slot;
    if(g.correct){
      const help=!!s.hints[s.index]||!!s.solutions[s.index],first=s.attempts[s.index]===1&&!help;
      s.results[s.index]={correct:true,first,help,attempts:s.attempts[s.index]};s.combo=first?s.combo+1:0;s.maxCombo=Math.max(s.combo,s.maxCombo);
      const reward=first?20:help?8:12,prior=state.earned[key]||0,gain=Math.max(0,reward-prior);state.earned[key]=Math.max(prior,reward);s.award+=gain;
      if(item.recovery||s.mode==='review'){if(state.errors[key])state.errors[key].resolved=true;}
      s.feedback={kind:'success',title:help?'Evidencia resuelta con ayuda':item.recovery?'¡Evidencia recuperada!':first?'¡Evidencia recuperada a la primera!':'¡Ahora sí! Has reparado la evidencia',text:c.explanation+(gain?` +${gain} XP.`:''),details:g.details};
      tone('correct');
    }else{
      s.combo=0;state.errors[key]={key,origin:item.origin,slot:item.slot,challenge:clone(c),resolved:false};
      if(!item.recovery&&!s.pending.some(p=>p.origin===item.origin&&p.slot===item.slot))s.pending.push({origin:item.origin,slot:item.slot});
      s.feedback={kind:'retry',title:'Hay una pista que no encaja',text:g.feedback||'Revisa la corrección por partes. Puedes corregirlas y volver a comprobar.',wrong:g.wrong,details:g.details};tone('retry');
    }
    save();updateChrome();renderGame();scrollFeedback();
  }
  function scrollFeedback(){requestAnimationFrame(()=>{const f=$('.feedback');if(f){const rect=f.getBoundingClientRect();if(rect.bottom>innerHeight-115)f.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});}});}
  function nextChallenge(){
    const s=state.session;if(!s?.results[s.index])return;
    s.index++;s.feedback=null;s.showSolution=false;selectedChip=null;selectedMatch=null;
    if(s.index===s.queue.length&&!s.recoveryAdded&&s.pending.length){
      s.recoveryAdded=true;
      s.pending.forEach((p,i)=>{const list=E.makeMission(p.origin,s.seed+7919+i*37);const c=list[p.slot];if(c)s.queue.push({challenge:c,origin:p.origin,slot:p.slot,recovery:true});});
      toast('Revancha: vuelve a resolver los conceptos que se resistieron.');
    }
    if(s.index>=s.queue.length){finishSession();return;}
    save();renderGame();window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});
  }
  function finishSession(){
    const s=state.session;if(!s)return;
    const normal=Object.entries(s.results).filter(([i])=>+i<s.baseLength),first=normal.filter(([,r])=>r.first).length,help=normal.filter(([,r])=>r.help).length;
    const ratio=first/s.baseLength,earnedStars=ratio===1?3:ratio>=.8?2:1;
    if(s.mode==='mission'){
      const old=state.completed[s.id];state.completed[s.id]={stars:Math.max(old?.stars||0,earnedStars),bestFirst:Math.max(old?.bestFirst||0,first),total:s.baseLength,completedAt:Date.now()};
    }
    state.lastResult={title:s.title,id:s.id,mode:s.mode,stars:earnedStars,first,total:s.baseLength,help,recoveries:s.queue.length-s.baseLength,xp:s.award,maxCombo:s.maxCombo};state.session=null;save();page='result';render();window.scrollTo({top:0,behavior:'instant'});celebrate();tone('finish');
  }
  function renderResult(){
    const r=state.lastResult;if(!r){navigate('map');return;}const m=mission(r.id),next=nextMission();
    main.innerHTML=`<div class="result"><div class="result-icon">${icon(m?.icon||'badge')}</div><span class="eyebrow">${r.mode==='mission'?'ZONA RECUPERADA':'PARTIDA COMPLETADA'}</span><h1>${esc(r.title)}</h1>${stars(r.stars)}<p>${m?esc(m.repair):'Has cerrado todas las evidencias de esta partida.'}</p><div class="result-grid"><div class="result-metric"><strong>+${r.xp}</strong><small>XP nuevos</small></div><div class="result-metric"><strong>${r.first}/${r.total}</strong><small>A la primera y sin pista</small></div><div class="result-metric"><strong>${r.recoveries}</strong><small>Revancha completada</small></div></div><div class="panel" style="text-align:left"><span class="eyebrow">TU INFORME DE PARTIDA</span><div class="report-line">${icon('shield')}<div><strong>${r.help?'Has resuelto '+r.help+' retos con ayuda.':'Has construido tus propias respuestas.'}</strong><p>Una estrella reconoce que has terminado. Dos requieren un 80 % a la primera sin ayuda; tres, todos los ejercicios.</p></div></div><div class="report-line">${icon('bolt')}<div><strong>Mejor racha: ${r.maxCombo} evidencias</strong><p>Tu mejor puntuación por reto se conserva. Las repeticiones sirven para mejorarla y practicar nuevas variantes.</p></div></div></div><div class="row wrap" style="justify-content:center;margin-top:22px"><button class="btn" data-action="brief" data-id="${next.id}">${done()===5?'Volver a la auditoría':'Siguiente misión'} ${icon('arrow')}</button><button class="btn secondary" data-action="nav" data-page="map">Ver la ciudad</button></div><button class="text-btn" data-action="replay" data-id="${r.id}" data-mode="${r.mode}">${r.mode==='mission'?'Repetir la misión':'Jugar una partida rápida'}</button></div>`;
  }
  function shuffle(items,seed){const a=[...items];let n=(Number(seed)||1)>>>0;for(let i=a.length-1;i>0;i--){n=(n*1664525+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function renderTheory(){
    main.innerHTML=`<header class="page-head"><div><span class="eyebrow">TU CUADERNO DE CAMPO</span><h1>Las reglas del juego.</h1><p>Consulta la teoría antes de una misión o vuelve a una idea cuando te atasques.</p></div><span class="pill green">${state.read.length}/38 leídas</span></header><label class="hidden" for="lesson-search">Buscar en la teoría</label><input id="lesson-search" class="search" type="search" placeholder="Busca mediana, NULL, boxplot…" value="${esc(search)}" data-input="search"><div class="filter-row"><button class="filter-btn ${theoryFilter==='all'?'active':''}" data-action="filter" data-id="all">Todo el temario</button>${C.topics.map(t=>`<button class="filter-btn ${theoryFilter===t.id?'active':''}" data-action="filter" data-id="${t.id}">${esc(t.title.replace('Fundamentos de EDA','Fundamentos').replace('Estadística descriptiva','Estadística').replace('Calidad y limpieza','Limpieza').replace('Gráficos de EDA','Gráficos'))}</button>`).join('')}</div><div id="lesson-list">${lessonList()}</div>`;
  }
  function lessonList(){let n=0;const norm=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),query=norm(search.trim());
    const html=C.topics.filter(t=>theoryFilter==='all'||t.id===theoryFilter).map(t=>{const list=t.lessons.filter(l=>norm(l.title+' '+l.text+' '+l.example).includes(query));n+=list.length;if(!list.length)return'';return`<section class="theory-group"><h2>${esc(t.title)}</h2>${list.map(l=>`<details class="lesson" data-lesson="${l.id}"><summary><span class="lesson-check ${state.read.includes(l.id)?'done':''}">${state.read.includes(l.id)?'✓':''}</span>${esc(l.title)}</summary><div class="lesson-content"><p>${esc(l.text)}</p><div class="lesson-example"><strong>Ejemplo</strong><br>${esc(l.example)}</div><button class="text-btn" data-action="read" data-id="${l.id}">${icon('check')}${state.read.includes(l.id)?'Leída · marcar pendiente':'Marcar como leída'}</button></div></details>`).join('')}</section>`;}).join('');
    return n?html:`<div class="empty">${icon('book')}<h2>No aparece ese concepto</h2><p>Prueba con una palabra más corta o cambia el bloque.</p><button class="btn secondary" data-action="clear-search">Ver todo</button></div>`;
  }
  function renderPractice(){
    const pending=Object.values(state.errors).filter(e=>!e.resolved).length,wrong=Object.values(state.quiz).filter(q=>!q.correct).length;
    main.innerHTML=`<header class="page-head"><div><span class="eyebrow">PARTIDAS A TU MEDIDA</span><h1>Un reto más.</h1><p>Elige cómo entrenar: practicar habilidades, recuperar errores o preparar las preguntas del examen.</p></div></header><div class="practice-grid"><button class="practice-tile" data-action="quick"><span class="tile-icon">${icon('bolt')}</span><h2>Partida rápida</h2><p>Cinco ejercicios mezclados: clasificar, reparar, calcular y conectar evidencias.</p><span class="tile-link">Jugar una ronda ${icon('arrow')}</span></button><button class="practice-tile" data-action="review"><span class="tile-icon">${icon('repeat')}</span><h2>La revancha</h2><p>${pending?`${pending} evidencias pendientes. Vuelve a resolver los conceptos que se resistieron.`:'Has recuperado las evidencias pendientes. Vuelve aquí cuando un reto se resista.'}</p><span class="tile-link">${pending?'Recuperar evidencias':'Ver mi progreso'} ${icon('arrow')}</span></button><button class="practice-tile" data-action="quiz-setup"><span class="tile-icon">${icon('book')}</span><h2>Preguntas de teoría</h2><p>${C.quizzes.length} preguntas con explicación. Entrena por bloque o haz un simulacro sin pistas.</p><span class="tile-link">Preparar preguntas ${icon('arrow')}</span></button><button class="practice-tile" data-action="written"><span class="tile-icon">${icon('pen')}</span><h2>El informe escrito</h2><p>${C.written.length} ejercicios para justificar tus decisiones y revisarlas con criterios concretos.</p><span class="tile-link">Escribir y revisar ${icon('arrow')}</span></button></div>${wrong?`<div class="helper-strip">${icon('bulb')}<p>Hay <strong>${wrong} preguntas de teoría por repasar.</strong> Puedes elegir «Solo mis fallos» en las preguntas de teoría.</p></div>`:''}<div class="section-heading"><h2>Práctica libre por zona</h2></div><div class="map-grid">${E.missions.filter(m=>m.id!=='auditoria').map((m,i)=>missionCard(m,i+1,null)).join('')}</div>`;
  }
  function quizSetup(){
    page='quiz';quizRun=null;updateChrome();
    main.innerHTML=`<div class="briefing"><button class="text-btn" data-action="nav" data-page="practice">${icon('back')} Volver a practicar</button><div class="panel"><span class="eyebrow">COMPRUEBA LA TEORÍA</span><h1>Prepara tu ronda.</h1><p>Entrena con explicaciones después de cada pregunta o recibe toda la corrección al terminar un simulacro.</p><div class="quiz-settings"><label for="quiz-topic">Temario<select id="quiz-topic"><option value="eda">Solo EDA</option><option value="all">EDA + POO y Regex</option>${C.topics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}<option value="wrong">Solo mis fallos</option></select></label><label for="quiz-mode">Cómo jugar<select id="quiz-mode"><option value="learn">Entrenamiento</option><option value="exam">Simulacro</option></select></label><label for="quiz-count">Preguntas<select id="quiz-count"><option value="5">5 preguntas</option><option value="10" selected>10 preguntas</option><option value="20">20 preguntas</option></select></label></div><button class="btn wide" data-action="quiz-start">Empezar ronda ${icon('arrow')}</button><p class="footer-note">Sin límite de tiempo. Los simulacros no otorgan estrellas a las misiones.</p></div></div>`;
    window.scrollTo({top:0,behavior:'instant'});
  }
  function startQuiz(){
    const filter=$('#quiz-topic').value,mode=$('#quiz-mode').value,count=+$('#quiz-count').value;
    let pool=C.quizzes.filter(q=>filter==='all'||filter==='eda'&&q.topic!=='codigo'||q.topic===filter||filter==='wrong'&&state.quiz[q.id]&&!state.quiz[q.id].correct);
    if(!pool.length){toast('No tienes fallos de teoría pendientes. Elige otro bloque.');return;}
    quizRun={list:shuffle(pool,makeSeed()).slice(0,count),mode,index:0,answers:[]};quizPick=null;quizFeedback=null;page='quiz';renderQuiz();
  }
  function renderQuiz(){
    if(!quizRun){quizSetup();return;}const r=quizRun,q=r.list[r.index];if(!q){page='quiz-result';renderQuizResult();return;}
    main.innerHTML=`<div class="game-shell"><div class="game-top"><button class="icon-btn" data-action="nav" data-page="practice" aria-label="Salir de las preguntas">${icon('back')}</button><div class="game-track"><div class="row spread"><span>${r.mode==='exam'?'Simulacro':'Entrenamiento de teoría'}</span><span>${r.index+1}/${r.list.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${r.index/r.list.length*100}%"></div></div></div></div><div class="challenge-card"><span class="eyebrow">${esc(C.topics.find(t=>t.id===q.topic)?.title||'Teoría')}</span><h1>${esc(q.prompt)}</h1><div class="answer-options" style="margin-top:22px">${q.options.map((o,i)=>`<button class="answer-option ${quizPick===i?'selected':''}" data-action="quiz-pick" data-value="${i}" aria-pressed="${quizPick===i}" ${quizFeedback?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div>${quizFeedback?`<div class="feedback ${quizFeedback.ok?'success':'retry'}"><div class="feedback-title">${icon(quizFeedback.ok?'check':'repeat')}${quizFeedback.ok?'Bien explicado.':'Una idea para repasar.'}</div><p>${esc(q.explanation)}</p><p class="small">Respuesta: ${esc(q.options[q.answer])}</p><button class="btn wide" data-action="quiz-next">${r.index+1===r.list.length?'Ver resultado':'Siguiente pregunta'} ${icon('arrow')}</button></div>`:`<button class="btn wide" style="margin-top:20px" data-action="quiz-check" ${quizPick===null?'disabled':''}>${r.mode==='exam'?'Guardar respuesta':'Comprobar'} ${icon('arrow')}</button>`}</div></div>`;
  }
  function checkQuiz(){if(!quizRun||quizPick===null||quizFeedback)return;const q=quizRun.list[quizRun.index],ok=quizPick===q.answer;quizRun.answers[quizRun.index]=quizPick;state.quiz[q.id]={answer:quizPick,correct:ok,attempts:(state.quiz[q.id]?.attempts||0)+1};save();if(quizRun.mode==='exam'){nextQuiz();}else{quizFeedback={ok};tone(ok?'correct':'retry');renderQuiz();scrollFeedback();}}
  function nextQuiz(){if(!quizRun||quizRun.answers[quizRun.index]===undefined)return;quizRun.index++;quizPick=null;quizFeedback=null;renderQuiz();window.scrollTo({top:0,behavior:'instant'});}
  function renderQuizResult(){
    if(!quizRun){quizSetup();return;}const r=quizRun,n=r.list.filter((q,i)=>r.answers[i]===q.answer).length;
    main.innerHTML=`<div class="result"><div class="result-icon">${icon('book')}</div><span class="eyebrow">RONDA TERMINADA</span><h1>${n}/${r.list.length} respuestas correctas.</h1><p>Revisa las explicaciones. Las preguntas falladas quedan disponibles en «Solo mis fallos».</p><div class="row wrap" style="justify-content:center;margin:22px 0"><button class="btn" data-action="quiz-setup">Nueva ronda</button><button class="btn secondary" data-action="nav" data-page="practice">Volver a practicar</button></div><div class="quiz-review">${r.list.map((q,i)=>`<details><summary>${r.answers[i]===q.answer?'✓':'↻'} ${esc(q.prompt)}</summary><p><strong>Tu respuesta:</strong> ${esc(q.options[r.answers[i]])}<br><strong>Respuesta correcta:</strong> ${esc(q.options[q.answer])}<br>${esc(q.explanation)}</p></details>`).join('')}</div></div>`;
  }
  function renderWritten(){
    const w=C.written.find(w=>w.id===writtenId)||C.written[0];writtenId=w.id;
    main.innerHTML=`<div class="game-shell"><button class="text-btn" data-action="nav" data-page="practice">${icon('back')} Volver a practicar</button><header class="page-head"><div><span class="eyebrow">PREPARA TU RESPUESTA</span><h1>El informe escrito.</h1><p>Decide, justifica y compara. Esta revisión personal no se suma a las estrellas del juego.</p></div></header><label class="small muted" for="written-select">Elige un ejercicio</label><select id="written-select" class="draft-select" data-input="written-select">${C.written.map((w,i)=>`<option value="${w.id}" ${w.id===writtenId?'selected':''}>${i+1}. ${esc(w.title)}</option>`).join('')}</select><div class="panel"><h2>${esc(w.title)}</h2><p>${esc(w.prompt)}</p><label class="hidden" for="written-answer">Tu respuesta razonada</label><textarea id="written-answer" class="draft-text" data-input="draft" placeholder="Mi decisión es… porque…">${esc(state.drafts[w.id]||'')}</textarea><p class="tiny muted" id="draft-status">Tu respuesta se guarda en este dispositivo.</p><button class="btn" data-action="written-show" ${!(state.drafts[w.id]||'').trim()?'disabled':''}>Comparar con los criterios</button>${writtenShown?`<div class="rubric"><span class="eyebrow">SOLUCIÓN ORIENTATIVA</span><p>${esc(w.solution)}</p><h3>Revisa tu respuesta</h3>${w.criteria.map((c,i)=>`<label class="rubric-check"><input type="checkbox" data-input="rubric" data-index="${i}" ${state.writtenReview[w.id]?.includes(i)?'checked':''}><span>${esc(c)}</span></label>`).join('')}<p class="tiny">Autoevaluación: marca solo lo que aparece en tu respuesta. Puedes seguir editándola.</p></div>`:''}</div></div>`;
  }
  function renderProfile(){
    const errors=Object.values(state.errors),q=Object.values(state.quiz),correct=q.filter(q=>q.correct).length;
    main.innerHTML=`<header class="page-head"><div class="profile-head"><span class="avatar">${icon('robot')}</span><div><span class="eyebrow">TU CARNÉ DE INVESTIGADOR</span><h1>${rank()}</h1><p>${xp()} XP · ${done()} zonas de la ciudad recuperadas</p></div></div></header><div class="profile-grid"><section class="panel"><span class="eyebrow">INSIGNIAS DE HABILIDAD</span><h2>Tu colección.</h2><div class="badge-grid">${E.missions.map(m=>`<div class="badge-item ${state.completed[m.id]?'on':''}"><span>${icon(m.icon)}</span><small>${esc(m.shortTitle||m.title)}</small>${stars(state.completed[m.id]?.stars||0)}</div>`).join('')}</div><p class="small">Cada insignia reconoce una misión completada. Las estrellas registran la precisión de tu mejor partida.</p></section><section class="panel"><span class="eyebrow">LO QUE LLEVAS APRENDIDO</span><h2>Tu progreso.</h2>${[['Teoría consultada',state.read.length,38],['Misiones completadas',Object.keys(state.completed).length,E.missions.length],['Preguntas correctas',correct,C.quizzes.length],['Errores recuperados',errors.filter(e=>e.resolved).length,errors.length]].map(([label,n,total])=>`<div class="skill-row"><div class="row spread"><span>${label}</span><strong>${n}/${total}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${total?n/total*100:0}%"></div></div></div>`).join('')}${state.legacy?.missions?`<p class="tiny muted">Se conserva el recuerdo de ${state.legacy.missions} misiones de la edición anterior. Esta campaña tiene retos nuevos.</p>`:''}</section><section class="panel"><span class="eyebrow">A TU MANERA</span><h2>Ajustes y partida.</h2><div class="settings-row"><div>Aspecto<small>Claro u oscuro, guardado en este dispositivo</small></div><button class="icon-btn" data-action="theme" aria-label="Cambiar tema">${icon(document.documentElement.dataset.theme==='dark'?'sun':'moon')}</button></div><div class="settings-row"><div>Sonidos de respuesta<small>${state.settings.sound?'Activados':'Desactivados'}</small></div><button class="icon-btn" data-action="sound" aria-label="Cambiar sonidos" aria-pressed="${state.settings.sound}">${icon(state.settings.sound?'sound':'mute')}</button></div><div class="settings-row"><div>Copia de tu progreso<small>Para conservarlo o llevarlo a otro navegador</small></div></div><div class="row wrap"><button class="btn secondary" data-action="export">${icon('download')} Guardar copia</button><button class="btn ghost" data-action="import">${icon('upload')} Restaurar</button></div><input id="backup-input" type="file" accept="application/json,.json" hidden><div class="settings-row" style="margin-top:20px"><div>Empezar desde cero<small>Borra el progreso de esta edición</small></div><button class="text-btn" data-action="reset">Reiniciar</button></div></section><section class="panel about"><span class="eyebrow">GUÍA RÁPIDA</span><h2>Tu academia de bolsillo.</h2><h3>Instalación en iPhone</h3><p>Abre la dirección de tu app en Safari y usa Compartir → Añadir a pantalla de inicio. Abre la app una vez con conexión para preparar el contenido sin conexión.</p><h3>Contenido y corrección</h3><p>${esc(C.sourcesNote)}</p><p>Se excluye Python inicial. POO y Regex aparecen como taller adicional. Los ejercicios escritos usan revisión personal, separada de la puntuación comprobada.</p><h3>Partida local</h3><p>Tu progreso se guarda en este navegador. No se sincroniza automáticamente con otros dispositivos; puedes exportarlo e importarlo.</p><p id="offline-state" class="offline-pill">${offlineMessage()}</p></section></div>`;
  }
  function offlineMessage(){return navigator.serviceWorker?.controller?'Contenido preparado para usar sin conexión.':'El contenido sin conexión se prepara al abrir la app desde HTTPS o localhost.';}
  function openModal(title,description,actions){
    modalAction=actions;$('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="icon-btn modal-close" data-action="close-modal" aria-label="Cerrar">${icon('close')}</button><h2 id="dialog-title">${esc(title)}</h2><p>${esc(description)}</p><div class="modal-actions">${actions.map((a,i)=>`<button class="btn ${a.secondary?'secondary':''}" data-action="modal-choice" data-value="${i}">${esc(a.label)}</button>`).join('')}</div></section></div>`;setTimeout(()=>$('.modal button')?.focus(),0);
  }
  function closeModal(){$('#modal-root').innerHTML='';modalAction=null;main.focus({preventScroll:true});}
  function how(){openModal('Juega para reconstruir el informe.','Cada misión empieza con unas reglas breves. Después clasificas, ordenas, reparas datos y construyes respuestas. Si fallas, recibes una explicación y una revancha. Completar da una estrella; acertar al menos el 80 % a la primera sin ayuda da dos; todo correcto da tres. No hay vidas ni esperas para seguir aprendiendo.',[{label:'Vamos al mapa',action:()=>navigate('map')}]);}
  function tone(kind){
    if(!state.settings.sound)return;try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const notes=kind==='finish'?[523,659,784]:kind==='correct'?[587,784]:[294];notes.forEach((freq,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime+i*.09;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+.15);});}catch(_){}
  }
  function celebrate(){if(reduced)return;const colors=['#8ce2c5','#f3cb77','#baaceb','#8bbfd7'];$('#celebration').innerHTML=Array.from({length:30},(_,i)=>`<i class="confetti-piece" style="--x:${20+(i*17)%60}%;--size:${7+i%8}px;--c:${colors[i%4]};--dx:${(i%2?-1:1)*(25+i*7)}px;--d:${i%5*.04}s"></i>`).join('');setTimeout(()=>$('#celebration').innerHTML='',2000);}
  function toggleTheme(){const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('eda_theme',theme);}catch(_){}updateChrome();if(page==='profile')renderProfile();}
  function exportBackup(){const data={app:'EDA Quest Ciudad Delta',version:8,exportedAt:new Date().toISOString(),state};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='eda-quest-progreso.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Copia preparada. Consérvala para restaurar tu progreso.');}
  function importBackup(file){if(!file)return;if(file.size>2e6){toast('La copia es demasiado grande.');return;}const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result),v=data.state;if(data.version!==8||!v||v.version!==8||!Array.isArray(v.read)||!v.completed||!v.earned||!v.errors||!v.quiz||!v.settings)throw Error('formato');const next=fresh();next.read=v.read.filter(id=>C.topics.some(t=>t.lessons.some(l=>l.id===id)));for(const m of E.missions){const saved=v.completed[m.id];if(saved&&Number.isInteger(saved.stars)&&saved.stars>=1&&saved.stars<=3)next.completed[m.id]={stars:saved.stars,bestFirst:Number(saved.bestFirst)||0,total:Number(saved.total)||5,completedAt:Number(saved.completedAt)||Date.now()};}for(const [k,val] of Object.entries(v.earned)){if(/^(variables|autobuses|esperas|graficos|auditoria|codigo):\d+$/.test(k)&&Number.isFinite(val)&&val>=0&&val<=20)next.earned[k]=val;}for(const q of C.quizzes){const saved=v.quiz[q.id];if(saved&&Number.isInteger(saved.answer)&&saved.answer>=0&&saved.answer<q.options.length)next.quiz[q.id]={answer:saved.answer,correct:saved.answer===q.answer,attempts:Number(saved.attempts)||1};}for(const w of C.written){if(typeof v.drafts?.[w.id]==='string')next.drafts[w.id]=v.drafts[w.id].slice(0,50000);if(Array.isArray(v.writtenReview?.[w.id]))next.writtenReview[w.id]=v.writtenReview[w.id].filter(i=>Number.isInteger(i)&&i>=0&&i<w.criteria.length);}for(const [k,e] of Object.entries(v.errors)){if(mission(e.origin)&&Number.isInteger(e.slot)&&e.slot>=0&&e.slot<10&&k===e.origin+':'+e.slot){const ch=E.makeMission(e.origin,1)[e.slot];if(ch)next.errors[k]={key:k,origin:e.origin,slot:e.slot,challenge:ch,resolved:!!e.resolved};}}next.settings={sound:!!v.settings.sound,focus:!!v.settings.focus};next.sequence=Number(v.sequence)||0;
      openModal('Restaurar esta copia','Se sustituirá el progreso guardado en este navegador. La copia conserva tus misiones, preguntas, teoría y borradores; las partidas en curso se reinician.',[{label:'Restaurar progreso',action:()=>{state=next;save();navigate('profile');toast('Progreso restaurado.');}},{label:'Cancelar',action:()=>{},secondary:true}]);
    }catch(_){toast('No es una copia válida de EDA Quest Ciudad Delta.');}};r.readAsText(file);}
  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-action]');if(!b||b.disabled)return;const act=b.dataset.action,id=b.dataset.id,value=b.dataset.value;
    if(act==='nav'){navigate(b.dataset.page);return;}
    if(act==='theme'){toggleTheme();return;}
    if(act==='sound'){state.settings.sound=!state.settings.sound;save();updateChrome();if(state.settings.sound)tone('correct');if(page==='profile')renderProfile();return;}
    if(act==='how'){how();return;}
    if(act==='brief'){showBrief(id);return;}
    if(act==='start-mission'){requestStart('mission',id);return;}
    if(act==='resume'){navigate('game');return;}
    if(act==='quick'){requestStart('quick','quick');return;}
    if(act==='review'){if(Object.values(state.errors).some(e=>!e.resolved))requestStart('review','review');else navigate('profile');return;}
    if(act==='replay'){requestStart(b.dataset.mode==='mission'?'mission':'quick',id);return;}
    if(act==='focus'){state.settings.focus=!state.settings.focus;save();updateChrome();return;}
    if(act==='close-modal'){closeModal();return;}
    if(act==='modal-choice'){const fn=modalAction?.[+value]?.action;closeModal();fn?.();return;}
    if(act==='filter'){theoryFilter=id;renderTheory();return;}
    if(act==='clear-search'){theoryFilter='all';search='';renderTheory();return;}
    if(act==='read'){state.read=state.read.includes(id)?state.read.filter(l=>l!==id):[...state.read,id];save();const detail=b.closest('details');detail.querySelector('.lesson-check').classList.toggle('done',state.read.includes(id));detail.querySelector('.lesson-check').textContent=state.read.includes(id)?'✓':'';b.innerHTML=icon('check')+(state.read.includes(id)?'Leída · marcar pendiente':'Marcar como leída');const badge=$('.page-head .pill');if(badge)badge.textContent=state.read.length+'/38 leídas';return;}
    if(act==='quiz-setup'){quizSetup();return;}
    if(act==='quiz-start'){startQuiz();return;}
    if(act==='quiz-pick'){if(!quizFeedback){quizPick=+value;renderQuiz();}return;}
    if(act==='quiz-check'){checkQuiz();return;}
    if(act==='quiz-next'){nextQuiz();return;}
    if(act==='written'){page='written';writtenShown=false;render();window.scrollTo({top:0,behavior:'instant'});return;}
    if(act==='written-show'){if((state.drafts[writtenId]||'').trim()){writtenShown=true;renderWritten();}return;}
    if(act==='export'){exportBackup();return;}
    if(act==='import'){$('#backup-input').click();return;}
    if(act==='reset'){openModal('¿Reiniciar esta edición?','Se borrarán las misiones, borradores, respuestas y experiencia de Ciudad Delta en este navegador. Puedes guardar una copia antes de hacerlo.',[{label:'Guardar una copia primero',action:exportBackup},{label:'Borrar el progreso',secondary:true,action:()=>{state=fresh();save();navigate('map');toast('Nueva aventura preparada.');}}]);return;}
    if(act==='check'){checkChallenge();return;}
    if(act==='next'){nextChallenge();return;}
    const s=state.session;if(!s||page!=='game')return;
    if(act==='hint'){s.hints[s.index]=true;save();renderGame();$('.hint-box')?.scrollIntoView({block:'nearest',behavior:reduced?'instant':'smooth'});return;}
    if(act==='solution'){s.solutions[s.index]=true;s.hints[s.index]=true;s.showSolution=true;save();renderGame();scrollFeedback();return;}
    if(act==='retry-solution'){s.showSolution=false;s.feedback=null;s.answers[s.index]={};save();renderGame();return;}
    if(lockedAnswer())return;const a=answer(),c=current().challenge;resetFeedback();
    if(act==='reset-answer'){s.answers[s.index]={};selectedChip=null;selectedMatch=null;}
    else if(act==='sort-select'){selectedChip=id;}
    else if(act==='sort-place'){
      a.assign=a.assign||{};if(selectedChip){a.assign[selectedChip]=id;selectedChip=null;}else{const inCat=c.items.filter(i=>a.assign[i.id]===id);if(inCat.length){const it=inCat[inCat.length-1];delete a.assign[it.id];selectedChip=it.id;}}
    }
    else if(act==='sort-remove'){a.assign=a.assign||{};delete a.assign[id];selectedChip=id;}
    else if(act==='order-add'){a.order=a.order||[];if(!a.order.includes(id))a.order.push(id);}
    else if(act==='order-remove'){a.order=(a.order||[]).filter(v=>v!==id);}
    else if(act==='match-select'){selectedMatch=id;}
    else if(act==='match-place'){
      if(!selectedMatch){toast('Toca primero una tarjeta de la izquierda.');return;}a.matches=a.matches||{};Object.keys(a.matches).forEach(k=>{if(a.matches[k]===value)delete a.matches[k];});a.matches[selectedMatch]=value;selectedMatch=null;
    }
    else if(act==='pick'){const n=+value;a.selected=c.correct.length>1?((a.selected||[]).includes(n)?a.selected.filter(v=>v!==n):[...(a.selected||[]),n]):[n];}
    else return;
    save();renderGame();
    if(act==='sort-select'||act==='sort-remove')$('.bin-target')?.focus({preventScroll:true});
    if(act==='sort-place')$('[data-action="sort-select"]')?.focus({preventScroll:true});
    if(act==='order-add')$('[data-action="order-add"]')?.focus({preventScroll:true});
    if(act==='match-select')$('.match-column:nth-child(2) button')?.focus({preventScroll:true});
    if(act==='match-place')$('.match-column:first-child button:not(.paired)')?.focus({preventScroll:true});
  });
  document.addEventListener('input',event=>{
    const el=event.target,t=el.dataset.input;
    if(t==='search'){search=el.value;$('#lesson-list').innerHTML=lessonList();return;}
    if(t==='draft'){state.drafts[writtenId]=el.value;save();const btn=$('[data-action="written-show"]');if(btn)btn.disabled=!el.value.trim();$('#draft-status').textContent='✓ Borrador guardado en este dispositivo.';return;}
    if(t==='field'&&!lockedAnswer()){const a=answer();a.values=a.values||{};a.values[el.dataset.id]=el.value;resetFeedback();el.closest('.field-row')?.classList.remove('invalid');save();}
    if(t==='box'&&!lockedAnswer()){const a=answer();a.positions=a.positions||{};if(el.value==='')delete a.positions[el.dataset.id];else a.positions[el.dataset.id]=el.value;resetFeedback();save();$('#boxplot-display').innerHTML=boxSVG(current().challenge,a);}
  });
  document.addEventListener('change',event=>{
    const el=event.target,t=el.dataset.input;
    if(el.id==='backup-input'){importBackup(el.files[0]);el.value='';return;}
    if(t==='written-select'){writtenId=el.value;writtenShown=false;renderWritten();return;}
    if(t==='rubric'){const list=state.writtenReview[writtenId]||[],i=+el.dataset.index;state.writtenReview[writtenId]=el.checked?[...new Set([...list,i])]:list.filter(v=>v!==i);save();return;}
    if(t==='box'&&!lockedAnswer()){const a=answer();a.positions=a.positions||{};if(el.value==='')delete a.positions[el.dataset.id];else a.positions[el.dataset.id]=el.value;resetFeedback();save();$('#boxplot-display').innerHTML=boxSVG(current().challenge,a);}
    if(t==='field'&&!lockedAnswer()){const a=answer();a.values=a.values||{};a.values[el.dataset.id]=el.value;resetFeedback();save();}
  });
  document.addEventListener('keydown',event=>{
    if($('#modal-root').children.length){if(event.key==='Escape'){closeModal();return;}if(event.key==='Tab'){const list=[...document.querySelectorAll('.modal button')];const first=list[0],last=list[list.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}
    if(event.key==='Enter'&&event.target.matches('input[data-input=field]')){event.preventDefault();checkChallenge();}
  });
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  save();render();
  if('serviceWorker' in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){navigator.serviceWorker.register('./sw.js').then(reg=>{reg.update();}).catch(()=>{});navigator.serviceWorker.addEventListener('controllerchange',()=>{if(page==='profile')renderProfile();});}
  window.addEventListener('online',()=>{if(page==='profile')renderProfile();});
  window.EDA_APP={getState:()=>clone(state),getPage:()=>page};
})();
