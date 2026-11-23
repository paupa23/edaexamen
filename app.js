/* EDA Quest: partida local, corrección determinista y recuperación de errores. */
(() => {
  'use strict';
  const C = window.EDA_CONTENT;
  const E = window.EDA_CHALLENGES;
  const V = window.EDA_VISUALS;
  const P = window.EDA_CAMPAIGN;
  const X = window.EDA_EXERCISE_VISUALS;
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
  function fresh() { return {version:8,completed:{},earned:{},read:[],quiz:{},drafts:{},writtenReview:{},errors:{},settings:{sound:false,focus:false,motion:true},session:null,quizSession:null,tips:{},lastResult:null,legacy:null,sequence:0}; }
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
  const restoredQuiz=restoreQuiz(state.quizSession);
  let quizRun=restoredQuiz?.run||null, quizPick=restoredQuiz?.pick??null, quizFeedback=restoredQuiz?.feedback||null;
  let theoryReturn=null;
  let selectedChip=null, selectedMatch=null, modalAction=null, modalReturnFocus=null, toastTimer=null, storageWarning=false, audioCtx=null;
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => !motionQuery.matches && state.settings.motion !== false;
  let stageKey = '';
  const animationEpoch = Date.now();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { if(!storageWarning){storageWarning=true;toast('El navegador no permite guardar: mantén esta pestaña abierta.');} } }
  function toast(msg) { const t=$('#toast'); t.textContent=msg; t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3300); }
  const xp = () => Object.values(state.earned).reduce((a,v)=>a+(Number(v)||0),0);
  const core = () => E.missions.filter(m=>!m.extra);
  const done = () => P.completedCount(state.completed);
  const allDone = () => P.completedCount(state.completed,true)===P.order.length;
  const pendingErrors = () => Object.values(state.errors).filter(e=>!e.resolved&&P.unlocked(e.origin,state.completed));
  function rank(){const n=done();return n>=5?'Analista de Ciudad Delta':n>=3?'Investigador de datos':n>=1?'Explorador de evidencias':'Aprendiz de EDA';}
  function mission(id){return E.missions.find(m=>m.id===id);}
  function unlocked(m){return !!m&&P.unlocked(m.id,state.completed);}
  function nextMission(){return mission(P.next(state.completed));}
  function stars(n){return `<span class="stars" aria-label="${n} de 3 estrellas">${[1,2,3].map(i=>icon('star',i<=n?'earned':'')).join('')}</span>`;}
  function updateChrome(){
    $('#header-xp').textContent=`${xp()} XP`;
    $('#theme-button').innerHTML=icon(document.documentElement.dataset.theme==='dark'?'sun':'moon');
    $('#theme-button').setAttribute('aria-label',document.documentElement.dataset.theme==='dark'?'Activar modo claro':'Activar modo oscuro');
    $('#sound-button').innerHTML=icon(state.settings.sound?'sound':'mute');
    $('#sound-button').setAttribute('aria-label',state.settings.sound?'Desactivar sonidos':'Activar sonidos');
    $('#sound-button').setAttribute('aria-pressed',String(!!state.settings.sound));
    document.body.classList.toggle('focus-mode',!!state.settings.focus&&page==='game');
    document.documentElement.dataset.motion=motionAllowed()?'on':'off';
    document.documentElement.dataset.page=page;
    document.querySelector('meta[name=theme-color]').content=document.documentElement.dataset.theme==='dark'?'#11152f':'#f3f5ff';
    document.querySelectorAll('.bottom-nav button').forEach(b=>{const active=b.dataset.page===(['briefing','game','result'].includes(page)?'map':['quiz','quiz-setup','quiz-result','written','review'].includes(page)?'practice':page);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  }
  function navigate(to){if(to==='game'&&!sessionAllowed()){blockedSession();return;}page=to;selectedChip=null;selectedMatch=null;render();window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});}
  function render(){
    updateChrome();
    if(page==='map')renderMap();else if(page==='theory')renderTheory();else if(page==='practice')renderPractice();else if(page==='profile')renderProfile();else if(page==='game')renderGame();else if(page==='result')renderResult();else if(page==='quiz')renderQuiz();else if(page==='quiz-setup')quizSetup();else if(page==='quiz-result')renderQuizResult();else if(page==='written')renderWritten();
  }
  function byteMessage(text,mood='idle'){
    return `<div class="byte-message"><div class="byte-portrait" aria-hidden="true">${V.mascot(mood,84)}</div><div class="byte-bubble"><span class="byte-name">BYTE · TU COMPAÑERO</span><p>${esc(text)}</p></div></div>`;
  }
  function shortName(id){return mission(id)?.shortTitle||mission(id)?.title||'la misión anterior';}
  function lockReason(id){const missing=P.missing(id,state.completed);return missing.length?'Completa «'+shortName(missing[0])+'» para seguir la ruta.':'Completa las misiones anteriores para entrar.';}
  function showLocked(id){
    const m=mission(id);if(!m)return;
    const next=nextMission();
    const steps=P.prerequisites(id).map((mid,i)=>`<li class="${P.isComplete(mid,state.completed)?'done':mid===next.id?'next':'waiting'}"><span class="step-number">${P.isComplete(mid,state.completed)?icon('check'):i+1}</span><span class="step-copy"><strong>${esc(shortName(mid))}</strong><small>${P.isComplete(mid,state.completed)?'Completada':mid===next.id?'Tu siguiente misión':'Pendiente'}</small></span></li>`).join('');
    openModal('Esta misión todavía está cerrada',lockReason(id),[{label:'Ir a '+shortName(next.id),action:()=>showBrief(next.id)},{label:'Seguir mirando el mapa',action:()=>{},secondary:true}],`<div class="lock-sheet"><div class="lock-title">${icon('lock')}<strong>${esc(m.title)}</strong></div><ol class="unlock-steps">${steps}</ol><p>Completar cada misión, con sus recuperaciones, abre la siguiente. No necesitas tres estrellas.</p></div>`);
  }
  function sessionAllowed(){return !!state.session&&P.canResume(state.session,state.completed);}
  function blockedSession(){
    if(!state.session){navigate('map');return;}
    const id=(state.session.queue||[]).find(item=>!P.unlocked(item.origin,state.completed))?.origin||state.session.id;
    if(page==='game'){page='map';updateChrome();renderMap();}
    if(mission(id))showLocked(id);else toast('Esta partida no es compatible. Empieza la misión que aparece en tu ruta.');
  }
  function campaignStrip(){
    const n=P.completedCount(state.completed,true),next=nextMission();
    return `<section class="campaign-strip" aria-label="Progreso de la campaña"><div><span class="eyebrow">CAMPAÑA EN ORDEN</span><strong>${n}/6 misiones completadas</strong></div><div class="progress-track" role="progressbar" aria-label="Misiones completadas" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${n}"><div class="progress-fill" style="width:${n/6*100}%"></div></div><small>${allDone()?'Toda la ruta está abierta. Vuelve a por tus mejores estrellas.':'Siguiente: '+esc(shortName(next.id))}</small><button class="btn campaign-start" data-action="${sessionAllowed()?'resume':'brief'}" data-id="${next.id}">${sessionAllowed()?'Continuar':allDone()?'Repetir':'Jugar'} ${icon('arrow')}</button></section>`;
  }
  function miniRoute(active){return `<ol class="mission-mini-map" aria-label="Ruta de la campaña">${P.order.map((id,i)=>`<li class="${id===active?'active':P.isComplete(id,state.completed)?'done':P.unlocked(id,state.completed)?'available':'locked'}" aria-label="${i+1}. ${esc(shortName(id))}${P.isComplete(id,state.completed)?', completada':id===active?', misión actual':!P.unlocked(id,state.completed)?', bloqueada':''}"><span>${P.isComplete(id,state.completed)?icon('check'):!P.unlocked(id,state.completed)?icon('lock'):i+1}</span></li>`).join('')}</ol>`;}
  function resumeCard(){
    const s=state.session;if(!s)return'';const allowed=sessionAllowed();
    return `<div class="session-resume-card ${allowed?'':'waiting'}"><span class="resume-icon">${icon(allowed?'pen':'lock')}</span><div><strong>${allowed?'Tu aventura te espera':'Partida en espera'}</strong><p>${esc(s.title)} · evidencia ${Math.min(s.index+1,s.queue.length)} de ${s.queue.length}</p>${allowed?'':'<small>Completa primero los huecos de tu ruta. Tu progreso está guardado.</small>'}</div><button class="btn ${allowed?'':'secondary'}" data-action="resume">${allowed?'Continuar':'Ver requisitos'} ${icon(allowed?'arrow':'lock')}</button></div>`;
  }
  function quizResumeCard(){
    if(!quizRun||quizRun.index>=quizRun.list.length)return'';
    return `<div class="session-resume-card"><span class="resume-icon">${icon('book')}</span><div><strong>${quizRun.mode==='exam'?'Simulacro':'Ronda de teoría'} guardado</strong><p>Pregunta ${quizRun.index+1} de ${quizRun.list.length}. Puedes seguir donde lo dejaste.</p></div><button class="btn secondary" data-action="quiz-resume">Continuar ${icon('arrow')}</button></div>`;
  }
  function worldNode(m,n,next){
    const points={variables:[170,727],autobuses:[420,592],esperas:[170,452],graficos:[420,317],auditoria:[230,167]};
    const labels={variables:'El archivo',autobuses:'La estación',esperas:'La torre',graficos:'El observatorio',auditoria:'La gran auditoría'};
    const [x,y]=points[m.id],complete=P.isComplete(m.id,state.completed)?state.completed[m.id]:null,locked=!unlocked(m),isCurrent=next.id===m.id&&!complete;
    return `<button class="world-node ${complete?'completed':''} ${isCurrent?'current':''} ${locked?'locked':''}" style="--node-x:${x/6}%;--node-y:${y/8.3}%" data-action="brief" data-id="${m.id}" aria-label="${esc(m.title)}. ${locked?'Bloqueada. Ver requisitos. '+esc(lockReason(m.id)):complete?complete.stars+' de 3 estrellas. Volver a jugar':isCurrent?'Siguiente misión. Entrar':'Entrar en la misión'}" ${locked?'data-locked="true"':''}><span class="node-number">${locked?icon('lock'):complete?icon('check'):n}</span><span class="node-label">${labels[m.id]}</span><span class="node-stars">${stars(complete?.stars||0)}</span><span class="node-state">${locked?'BLOQUEADA':isCurrent?(done()?'SIGUIENTE MISIÓN':'¡EMPIEZA AQUÍ!'):complete?'RECUPERADA':''}</span></button>`;
  }
  function renderMap(){
    const next=nextMission(),all=allDone(),starCount=Object.values(state.completed).reduce((n,m)=>n+m.stars,0),pending=pendingErrors().length;
    const availableXP=E.makeMission(next.id,1).reduce((sum,_,i)=>sum+Math.max(0,20-(state.earned[next.id+':'+i]||0)),0);
    const byte=all?'¡Ciudad Delta vuelve a brillar! ¿Vamos a por las estrellas que faltan?':done()?'Una zona menos a oscuras. Cada respuesta que construyes devuelve energía a la ciudad.':'¡Soy Byte! Los datos de la ciudad se han mezclado. Tú resuelves las evidencias; yo te acompaño.';
    main.innerHTML=`<div class="game-map-page scene-enter"><header class="world-heading"><div><span class="eyebrow">TU AVENTURA DE EDA</span><h1>Ciudad <em>Delta.</em></h1><p>${all?'La ciudad está en tus manos. Sigue explorando.':'Cinco zonas. Un misterio. Tú tienes la clave.'}</p></div><div class="world-score"><span>${icon('star')}<strong>${starCount}</strong><small>estrellas</small></span><span>${icon('map')}<strong>${done()}/5</strong><small>zonas</small></span></div></header>
      ${campaignStrip()}${resumeCard()}${quizResumeCard()}
      <div class="world-layout"><section class="overworld" aria-label="Mapa de misiones de Ciudad Delta"><div class="world-map-caption"><span class="map-signal"></span> EXPLORA · RESUELVE · RECUPERA</div><div class="world-scene" aria-hidden="true">${V.world(state.completed,next.id)}</div>${core().map((m,i)=>worldNode(m,i+1,next)).join('')}<div class="world-legend">${icon('compass')} Toca un edificio para entrar</div></section>
      <aside class="quest-journal">${byteMessage(byte,all?'happy':'idle')}<section class="map-mission-dock"><div class="dock-top"><span class="dock-icon">${icon(next.icon)}</span><span class="eyebrow">${all?'EL RETO FINAL':done()?'TU SIGUIENTE DESTINO':'TU PRIMERA MISIÓN'}</span></div><h2>${esc(next.shortTitle||next.title)}</h2><p>${esc(next.description)}</p><div class="mission-reward-preview"><span>${icon('bolt')} ${availableXP?'Hasta '+availableXP+' XP nuevos':'Mejor puntuación guardada'}</span><span>${icon('star')} 3 estrellas</span></div><button class="btn wide" data-action="${sessionAllowed()?'resume':'brief'}" data-id="${next.id}">${sessionAllowed()?'Continuar aventura':all?'Volver a jugar':'¡Vamos allá!'} ${icon('arrow')}</button><button class="text-btn" data-action="how">Cómo se juega</button></section>
      <div class="journal-objectives"><h3>${icon('shield')} Tu misión</h3><p>Termina una misión para abrir la siguiente. Las pistas y las recuperaciones también te permiten avanzar.</p><div class="progress-track"><div class="progress-fill" style="width:${done()/5*100}%"></div></div><small>${done()} de 5 zonas recuperadas</small></div>
      ${pending?`<button class="review-route" data-action="review">${icon('repeat')}<span><strong>Te esperan ${pending} evidencias</strong><small>Vuelve a intentarlo con lo aprendido</small></span>${icon('arrow')}</button>`:''}
      ${E.missions.filter(m=>m.extra).map(m=>`<button class="bonus-dock ${unlocked(m)?'':'locked'}" data-action="brief" data-id="${m.id}"><span>${icon('code')}</span><span><small>MISIÓN 6 · EXPEDICIÓN EXTRA</small><strong>Laboratorio de POO y Regex</strong><em>${!unlocked(m)?'Se abre después de la auditoría':P.isComplete(m.id,state.completed)?'Completado · Volver a jugar':'Nueva misión disponible'}</em></span>${icon(unlocked(m)?'arrow':'lock')}</button>`).join('')}</aside></div><p class="footer-note">Estudia jugando · Teoría, preguntas y ejercicios · Sin Python inicial</p></div>`;
  }
  function missionCard(m,n,recommended,extra=''){
    const complete=P.isComplete(m.id,state.completed)?state.completed[m.id]:null,locked=!unlocked(m);
    return `<button class="mission ${extra} ${complete?'completed':''} ${recommended===m.id&&!complete?'recommended':''} ${locked?'locked':''}" data-action="brief" data-id="${m.id}" aria-label="${esc(m.title)}. ${locked?'Bloqueada. Ver requisitos. '+esc(lockReason(m.id)):complete?'Volver a jugar':'Entrar en la misión'}"><span class="mission-icon">${icon(locked?'lock':m.icon)}</span><span class="mission-body"><span class="mission-number">${m.extra?'TALLER EXTRA':`ZONA 0${n}`}${recommended===m.id&&!complete?' · SIGUIENTE':''}</span><h3>${esc(m.shortTitle||m.title)}</h3><p>${esc(m.description)}</p><span class="mission-bottom">${stars(complete?.stars||0)}<span class="tiny muted">${locked?'Completa las anteriores':complete?'Practicar otra vez':m.id==='auditoria'?'Reto final · 6 ejercicios':'5 ejercicios'}</span></span></span><span class="mission-arrow">${icon(locked?'lock':'arrow')}</span></button>`;
  }
  function showBrief(id){
    const m=mission(id);if(!m)return;
    if(!unlocked(m)){showLocked(id);return;}
    page='briefing';updateChrome();
    main.innerHTML=`<div class="briefing scene-enter">${miniRoute(id)}<button class="text-btn back" data-action="nav" data-page="map">${icon('back')} Volver al mapa</button><div class="brief-scene mission-scene" aria-hidden="true">${V.missionScene(id,state.completed[id]?'solved':'idle')}</div><div class="panel briefing-panel"><span class="eyebrow">${m.extra?'EXPEDICIÓN EXTRA':'MISIÓN '+(core().findIndex(x=>x.id===id)+1)+' · PREPARA TU EQUIPO'}</span><h1>${esc(m.title)}</h1><p class="briefing-intro">${esc(m.description)}</p><div class="mission-goal">${icon('shield')}<p><strong>Abres la siguiente misión al terminar.</strong> Una estrella basta; puedes usar pistas y reintentos.</p></div>${byteMessage('Antes de entrar, estas dos ideas son nuestras herramientas. Luego toca ponerlas en práctica.','thinking')}<button class="study-link" data-action="study-zone" data-id="${m.id}">${icon('book')} Ver la teoría de esta zona ${icon('arrow')}</button><div class="mission-rules">${m.briefing.map((r,i)=>`<div class="rule"><span class="rule-num">${i+1}</span><p>${esc(r)}</p></div>`).join('')}</div><div class="helper-strip">${icon('shield')}<p><strong>Objetivo:</strong> ${esc(m.repair)}.</p></div><div class="mission-reward-preview"><span>${icon('bolt')} ${id==='auditoria'?6:5} evidencias</span><span>${icon('star')} Hasta 3 estrellas</span><span>${icon('heart')} Reintentos libres</span></div>${!state.tips?.basics?`<div class="first-play-tip"><strong>Tu primera partida</strong><p>Construye la respuesta, pulsa Comprobar y recoge la evidencia. Si algo falla, corrígelo: no pierdes vidas.</p></div>`:''}<button class="btn wide start" data-action="start-mission" data-id="${m.id}">¡Entrar en la misión! ${icon('arrow')}</button><p class="footer-note">Tendrás pistas y explicaciones si te atascas. Puedes pausar cuando quieras.</p></div></div>`;
    window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
  }
  function makeSeed(){state.sequence++;return (Date.now()+state.sequence*137)%2147483647;}
  function newSession(mode,id){
    if(!['mission','quick','review'].includes(mode))return;
    if(mode==='mission'&&!unlocked(mission(id))){showLocked(id);return;}
    const seed=makeSeed();let queue,title;
    if(mode==='mission'){const m=mission(id);queue=E.makeMission(id,seed).map((c,i)=>({challenge:c,origin:id,slot:i,recovery:false}));title=m.title;}
    else if(mode==='review'){queue=pendingErrors().slice(0,8).map(e=>({challenge:clone(e.challenge),origin:e.origin,slot:e.slot,recovery:true}));title='Recupera las evidencias';}
    else{
      const pool=P.accessible(state.completed).flatMap((origin,j)=>E.makeMission(origin,seed+j).map((challenge,slot)=>({challenge,origin,slot,recovery:false})));
      const priority=item=>{const key=item.origin+':'+item.slot;return state.errors[key]&&!state.errors[key].resolved?0:state.earned[key]>0&&state.earned[key]<20?1:!state.earned[key]?2:3;};
      queue=shuffle(pool,seed).sort((a,b)=>priority(a)-priority(b)).slice(0,5);title='Partida rápida';
    }
    if(!queue.length){toast('No tienes evidencias pendientes en las zonas abiertas. Sigue tu campaña.');return;}
    state.session={mode,id:mode==='mission'?id:mode,title,seed,queue,index:0,answers:{},attempts:{},hints:{},solutions:{},results:{},pending:[],recoveryAdded:false,feedback:null,showSolution:false,combo:0,maxCombo:0,award:0,startedAt:Date.now(),baseLength:queue.length};save();navigate('game');
  }
  function requestStart(mode,id){
    if(mode==='mission'&&!unlocked(mission(id))){showLocked(id);return;}
    if(state.session){
      const allowed=sessionAllowed();
      openModal('Ya tienes una partida guardada',allowed?'Puedes continuarla o empezar esta misión. Al empezar otra se sustituye la partida en curso; conservas tus misiones completadas y experiencia.':'Tu partida guardada pertenece a una zona que aún requiere completar misiones anteriores. Puedes conservarla o sustituirla para avanzar desde tu misión disponible.',allowed?[{label:'Continuar partida',action:()=>navigate('game')},{label:'Empezar esta partida',action:()=>newSession(mode,id),secondary:true}]:[{label:'Empezar la misión disponible',action:()=>newSession(mode,id)},{label:'Conservar la partida guardada',action:()=>{},secondary:true}]);
    }else newSession(mode,id);
  }
  function current(){const s=state.session;return s?.queue[s.index];}
  function answer(){const s=state.session;if(!s)return{};return s.answers[s.index]||(s.answers[s.index]={});}
  function lockedAnswer(){const s=state.session;return !s||!!s.results[s.index]||s.showSolution;}
  function typeLabel(t){return {sort:'Clasifica las evidencias',order:'Reconstruye el orden',fields:'Repara y calcula',match:'Une las piezas',pick:'Audita la decisión',box:'Reconstruye el boxplot'}[t]||'Resuelve el reto';}
  function progressGame(){const s=state.session;return Object.keys(s.results).length/s.queue.length*100;}
  function byteLine(c,s,result){
    if(result)return s.feedback?.title||'¡Evidencia recuperada! Un paso más cerca de recuperar la ciudad.';
    if(s.showSolution)return 'Miremos cómo funciona. Después podrás reconstruirlo tú.';
    if(s.feedback?.kind==='retry')return 'Casi. Revisa las partes señaladas: la explicación nos da la siguiente pista.';
    if(s.feedback?.kind==='info')return 'Nos falta alguna pieza. Completa el tablero y lo comprobamos.';
    if(s.hints[s.index])return 'He dejado una pista debajo del tablero. ¡Tú puedes construir la respuesta!';
    return {sort:'Ordenemos el archivo. Cada evidencia tiene su sitio.',order:'Las piezas están mezcladas. Reconstruye la secuencia.',match:'Hay pistas que encajan. Encuentra cada pareja.',fields:'Reparemos el panel con tus cálculos.',pick:'Investiga las evidencias y toma una decisión.',box:'Construye el gráfico con los valores que calcules.'}[c.type];
  }
  function boardStatus(c,a){
    let total=1,n=0,label='';
    if(c.type==='sort'){total=c.items.length;n=c.items.filter(i=>c.categories.some(cat=>cat.id===a.assign?.[i.id])).length;label='fichas colocadas';}
    if(c.type==='order'){total=c.items.length;n=new Set((a.order||[]).filter(id=>c.items.some(i=>i.id===id))).size;label='piezas ordenadas';}
    if(c.type==='match'){total=c.pairs.length;n=c.pairs.filter(p=>typeof a.matches?.[p.id]==='string').length;label='parejas conectadas';}
    if(c.type==='fields'){total=c.fields.length;n=c.fields.filter(f=>{const v=a.values?.[f.id];return v!==undefined&&String(v).trim()!==''&&(f.kind!=='number'||Number.isFinite(Number(String(v).replace(',','.'))));}).length;label='campos completados';}
    if(c.type==='box'){total=c.labels.length;n=c.labels.filter(l=>{const v=a.positions?.[l.id];return v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(String(v).replace(',','.')));}).length;label='piezas del gráfico';}
    if(c.type==='pick'){n=(a.selected||[]).length?1:0;label=(a.selected||[]).length+' '+((a.selected||[]).length===1?'opción seleccionada':'opciones seleccionadas');}
    return {total,n,label,text:c.type==='pick'?label:n+'/'+total+' '+label};
  }
  function boardProgress(c,a){const p=boardStatus(c,a);return `<div class="board-progress"><span>${esc(p.text)}</span><div class="progress-track" role="progressbar" aria-label="Piezas de tu respuesta" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.n}"><div class="progress-fill" style="width:${p.n/p.total*100}%"></div></div><small>El progreso indica lo que has rellenado; se corrige al comprobar.</small></div>`;}
  function quickFeedback(f,result){
    if(!f)return'';const ok=f.kind==='success',wrong=f.wrong?.length||0;
    return `<div class="quick-feedback ${ok?'success':f.kind==='retry'?'retry':'info'}" role="status" tabindex="-1" data-correction><span>${icon(ok?'check':f.kind==='retry'?'repeat':'info')}</span><div><strong>${esc(f.title)}</strong><p>${ok?'Evidencia recogida. Puedes continuar cuando quieras.':f.kind==='retry'?(wrong?'Revisa '+wrong+' '+(wrong===1?'parte señalada':'partes señaladas')+'. ':'')+'La corrección te ayuda a reconstruir la respuesta.':esc(f.text)}</p>${f.kind!=='info'?'<button class="text-btn" data-action="explain">Ver la explicación</button>':''}</div></div>`;
  }
  function focusBoard(){
    const el=$('.needs-review input')||$('.needs-review select')||$('button.needs-review')||$('.challenge-board button:not([disabled])')||$('.challenge-board input:not([disabled])')||$('.challenge-board');
    if(!el)return;el.setAttribute('tabindex',el.matches?.('button,input,select')?'0':'-1');el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',behavior:motionAllowed()?'smooth':'instant'});
  }
  function renderGame(){
    const s=state.session;if(!s){navigate('map');return;}if(!sessionAllowed()){blockedSession();return;}
    const item=current();if(!item){finishSession();return;}const c=item.challenge,a=answer(),result=s.results[s.index];
    const chapter=mission(item.origin),phase=result?'solved':'idle',mood=result?'happy':s.feedback||s.hints[s.index]?'thinking':'idle';
    const renderKey=s.startedAt+':'+s.index,enter=renderKey!==stageKey;stageKey=renderKey;
    const ready=!result&&!s.showSolution&&E.grade(c,a).complete;
    main.innerHTML=`<div class="game-shell game-play ${enter?'scene-enter':''}" data-mission="${item.origin}"><div class="game-top game-hud"><button class="icon-btn" data-action="nav" data-page="map" aria-label="Guardar y volver al mapa">${icon('back')}</button><div class="game-track"><span class="chapter-label">${s.mode==='mission'?'MISIÓN '+(P.order.indexOf(item.origin)+1)+' DE 6':s.mode==='review'?'RECUPERA LAS EVIDENCIAS':'PARTIDA RÁPIDA'}</span><div class="row spread"><span>${esc(chapter?.shortTitle||s.title)}</span><strong class="hud-counter">${s.index+1}/${s.queue.length}</strong></div><div class="progress-track" role="progressbar" aria-label="Evidencias recuperadas" aria-valuemin="0" aria-valuemax="${s.queue.length}" aria-valuenow="${Object.keys(s.results).length}"><div class="progress-fill" style="width:${progressGame()}%"></div></div></div><div class="game-status"><span class="combo ${s.combo>=2?'combo-active':''}">${s.combo>=2?'×'+s.combo:icon('bolt')}</span><button class="icon-btn" data-action="focus" aria-label="${state.settings.focus?'Salir del':'Activar'} modo concentración" aria-pressed="${!!state.settings.focus}">${icon('focus')}</button></div></div>
      <div class="mission-scene ${result?'scene-solved':''}" aria-hidden="true" style="--art-phase:-${(Date.now()-animationEpoch)%6000}ms">${V.missionScene(item.origin,phase)}</div><div class="evidence-bar"><span>${icon('shield')} Evidencias</span><div class="evidence-slots" aria-label="${Object.keys(s.results).length} de ${s.queue.length} evidencias recuperadas">${s.queue.map((q,i)=>`<span class="evidence-slot ${s.results[i]?'filled':''} ${i===s.index?'current':''}" aria-hidden="true">${s.results[i]?icon('check'):q.recovery?icon('repeat'):'◆'}</span>`).join('')}</div><strong>+${s.award} XP</strong></div>
      ${byteMessage(byteLine(c,s,result),mood)}
      <article class="challenge-card ${result?'challenge-solved':''}" data-challenge="${esc(c.id)}"><div class="row spread wrap"><span class="eyebrow">${item.recovery?'REVANCHA · RECUPERA LA EVIDENCIA':typeLabel(c.type)}</span><span class="challenge-source">${esc(c.source||'Práctica')}</span></div><h1 tabindex="-1">${esc(c.title)}</h1><p class="challenge-prompt">${esc(c.prompt)}</p>${c.context?`<div class="audit-context">${esc(c.context)}</div>`:''}${c.data&&!Array.isArray(c.data)?renderData(c.data):''}
      <div class="challenge-toolbar"><strong>Construye tu respuesta</strong>${!result&&!s.showSolution?`<div><button class="text-btn" data-action="hint">${icon('bulb')}${s.hints[s.index]?'Ver pista':'Pista'}</button><button class="study-link" data-action="study-concept">${icon('book')} Concepto</button></div>`:''}</div><div id="board-progress">${boardProgress(c,a)}</div>
      ${s.feedback?quickFeedback(s.feedback,result):''}${s.hints[s.index]?`<aside class="hint-box"><strong>Pista:</strong> ${esc(c.hint)}</aside>`:''}
      ${c.id==='graph-histograma'?`<div id="histogram-display">${X.histogram(c,a)}</div>`:''}
      <div class="challenge-board" tabindex="-1">${renderBoard(c,a)}</div>
      ${s.showSolution?`<div class="feedback"><div class="feedback-title">${icon('book')} Solución explicada</div><p>${esc(c.explanation)}</p>${solutionView(c)}<p class="small muted">Ahora vuelve a construirla. Se registrará como resuelta con ayuda.</p></div>`:s.feedback&&s.feedback.kind!=='info'?feedbackView(c,s.feedback,result):''}
      <div class="game-actions">${result?`<button class="btn wide" data-action="next">${s.index===s.queue.length-1?(s.pending.length&&!s.recoveryAdded?'Ir a la revancha':'Ver resultado'):'Siguiente evidencia'} ${icon('arrow')}</button>`:s.showSolution?`<button class="btn wide" data-action="retry-solution">Resolver de nuevo ${icon('repeat')}</button>`:`${s.feedback?.kind==='retry'?'<button class="text-btn" data-action="focus-board">Revisar</button>':''}<button class="btn ${ready?'answer-ready':''}" data-action="check">Comprobar ${icon('check')}</button>`}</div>
      ${!result&&!s.showSolution&&(s.attempts[s.index]||0)>=2?'<button class="text-btn solution-link" data-action="solution">Ver solución y volver a practicar</button>':''}
      </article><p class="game-footnote">${s.pending.length&&!s.recoveryAdded?`${s.pending.length} evidencias tendrán una revancha al terminar este tramo.<br>`:''}${iconSmallSave()} Partida guardada · Puedes parar cuando quieras.</p></div>`;
    if(s.feedback?.kind==='retry')highlightWrong(c,s.feedback.wrong||[]);
  }
  function control(action,key,value){
    const safe=String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
    return $(`[data-action="${action}"][data-${key}="${safe}"]`);
  }
  function animateElement(el,keyframes,options={}){
    if(!el||!motionAllowed()||typeof el.animate!=='function')return;
    const animation=el.animate(keyframes,{duration:260,easing:'cubic-bezier(.2,.8,.2,1)',...options});
    animation.finished?.catch(()=>{});
  }
  function pieceOrigin(el){
    if(!el||!motionAllowed())return null;
    const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};
  }
  function movePiece(from,target){
    if(!target)return;
    if(!from){animateElement(target,[{transform:'scale(.94)'},{transform:'scale(1.04)',offset:.65},{transform:'scale(1)'}]);return;}
    const r=target.getBoundingClientRect(),dx=from.x-r.left-r.width/2,dy=from.y-r.top-r.height/2;
    animateElement(target,[{transform:`translate(${dx}px,${dy}px) scale(.92)`,opacity:.65},{transform:'translate(0,0) scale(1.07)',opacity:1,offset:.78},{transform:'translate(0,0) scale(1)'}],{duration:300});
  }
  function highlightWrong(c,wrong){
    for(const id of wrong){
      let el;
      if(c.type==='sort')el=control('sort-remove','id',id);
      if(c.type==='order')el=control('order-remove','id',(answer().order||[])[Number(id)]);
      if(c.type==='match')el=control('match-select','id',id);
      if(c.type==='pick')el=control('pick','value',id);
      if(c.type==='fields')el=$('#field-'+id)?.closest('.field-row');
      if(c.type==='box')el=$('#box-'+id)?.closest('label');
      el?.classList.add('needs-review');
      el?.setAttribute('data-review','Revisar');
    }
  }
  function answerEffects(correct,gain=0){
    const face=$('.byte-portrait'),feedback=$('.quick-feedback')||$('.feedback');
    animateElement(face,correct?[{transform:'translateY(0) rotate(-5deg)'},{transform:'translateY(-12px) rotate(6deg)',offset:.45},{transform:'translateY(0) rotate(0)'}]:[{transform:'rotate(0)'},{transform:'rotate(-7deg)',offset:.45},{transform:'rotate(0)'}],{duration:correct?480:320});
    animateElement(feedback,[{transform:'translateY(8px)',opacity:.6},{transform:'translateY(0)',opacity:1}],{duration:240});
    if(correct){
      $('.challenge-card')?.classList.add('pulse-success');
      animateElement($('.evidence-slot.current'),[{transform:'scale(.5)',opacity:.3},{transform:'scale(1.3)',offset:.6},{transform:'scale(1)',opacity:1}],{duration:430});
      if(state.session.combo>=2)animateElement($('.combo'),[{transform:'scale(.75)'},{transform:'scale(1.2)',offset:.65},{transform:'scale(1)'}]);
      if(gain>0&&motionAllowed()){
        const burst=document.createElement('span');burst.className='xp-burst';burst.textContent='+'+gain+' XP';burst.setAttribute('aria-hidden','true');feedback?.append(burst);setTimeout(()=>burst.remove(),1400);
        animateElement($('#header-xp'),[{transform:'scale(1)'},{transform:'scale(1.12)',offset:.5},{transform:'scale(1)'}],{duration:400});
      }
    }else document.querySelectorAll('.needs-review').forEach(el=>animateElement(el,[{transform:'translateX(0)'},{transform:'translateX(-3px)',offset:.25},{transform:'translateX(3px)',offset:.6},{transform:'translateX(0)'}],{duration:240}));
  }
  function updateReady(){
    const s=state.session;if(!s||lockedAnswer())return;
    const c=current().challenge,a=answer();
    $('[data-action="check"]')?.classList.toggle('answer-ready',E.grade(c,a).complete);
    const progress=$('#board-progress');if(progress)progress.innerHTML=boardProgress(c,a);
    if(c.id==='graph-histograma'){const view=$('#histogram-display');if(view)view.innerHTML=X.histogram(c,a);}
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
    return `<details class="feedback feedback-explanation ${f.kind==='success'?'success':f.kind==='retry'?'retry':''}" data-correction><summary>${icon('book')} ${f.kind==='success'?'Por qué esta respuesta funciona':'La corrección, paso a paso'}</summary><p>${esc(f.text)}</p>${f.details?.length?`<div class="feedback-details">${f.details.map(d=>`<div class="feedback-detail"><b>${d.ok?'✓':'↻'} ${esc(d.label)}</b><span>${esc(d.explanation)}</span></div>`).join('')}</div>`:''}</details>`;
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
  function resetFeedback(){const s=state.session;if(s&&!s.results[s.index]&&s.feedback){s.feedback=null;document.querySelectorAll('[data-correction]').forEach(el=>el.remove());document.querySelectorAll('.needs-review,.field-row.invalid').forEach(el=>{el.classList.remove('needs-review','invalid');el.removeAttribute('data-review');});const bubble=$('.game-play .byte-bubble p');if(bubble)bubble.textContent=byteLine(current().challenge,s,false);}}
  function checkChallenge(){
    const s=state.session;if(!s||s.results[s.index]||s.showSolution)return;if(!sessionAllowed()){blockedSession();return;}
    const item=current(),c=item.challenge,g=E.grade(c,answer());
    if(!g.complete){s.feedback={kind:'info',title:'Todavía falta una pieza',text:g.feedback||'Completa todos los campos antes de comprobar.'};save();renderGame();scrollFeedback();return;}
    s.attempts[s.index]=(s.attempts[s.index]||0)+1;
    const key=item.origin+':'+item.slot;let earnedNow=0;
    if(g.correct){
      const help=!!s.hints[s.index]||!!s.solutions[s.index],first=s.attempts[s.index]===1&&!help;
      s.results[s.index]={correct:true,first,help,attempts:s.attempts[s.index]};s.combo=first?s.combo+1:0;s.maxCombo=Math.max(s.combo,s.maxCombo);
      const reward=first?20:help?8:12,prior=state.earned[key]||0,gain=Math.max(0,reward-prior);state.earned[key]=Math.max(prior,reward);s.award+=gain;earnedNow=gain;
      if(state.errors[key])state.errors[key].resolved=true;
      state.tips={...state.tips,basics:true};
      s.feedback={kind:'success',title:help?'Evidencia resuelta con ayuda':item.recovery?'¡Evidencia recuperada!':first?'¡Evidencia recuperada a la primera!':'¡Ahora sí! Has reparado la evidencia',text:c.explanation+(gain?` +${gain} XP.`:''),details:g.details};
      tone('correct');
    }else{
      s.combo=0;state.errors[key]={key,origin:item.origin,slot:item.slot,challenge:clone(c),resolved:false};
      if(!item.recovery&&!s.pending.some(p=>p.origin===item.origin&&p.slot===item.slot))s.pending.push({origin:item.origin,slot:item.slot});
      s.feedback={kind:'retry',title:'Hay una pista que no encaja',text:g.feedback||'Revisa la corrección por partes. Puedes corregirlas y volver a comprobar.',wrong:g.wrong,details:g.details};tone('retry');
    }
    save();updateChrome();renderGame();answerEffects(g.correct,earnedNow);scrollFeedback();
  }
  function scrollFeedback(){requestAnimationFrame(()=>{
    const f=$('.quick-feedback')||$('.feedback');if(!f)return;
    f.setAttribute('tabindex','-1');f.focus({preventScroll:true});const rect=f.getBoundingClientRect();
    if(rect.top<0||rect.bottom>innerHeight-120)f.scrollIntoView({behavior:motionAllowed()?'smooth':'instant',block:'nearest'});
  });}
  function nextChallenge(){
    const s=state.session;if(!s?.results[s.index])return;if(!sessionAllowed()){blockedSession();return;}
    s.index++;s.feedback=null;s.showSolution=false;selectedChip=null;selectedMatch=null;
    if(s.index===s.queue.length&&!s.recoveryAdded&&s.pending.length){
      s.recoveryAdded=true;
      s.pending.forEach((p,i)=>{const list=E.makeMission(p.origin,s.seed+7919+i*37);const c=list[p.slot];if(c)s.queue.push({challenge:c,origin:p.origin,slot:p.slot,recovery:true});});
      toast('Revancha: vuelve a resolver los conceptos que se resistieron.');
    }
    if(s.index>=s.queue.length){finishSession();return;}
    save();renderGame();$('.challenge-card h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:motionAllowed()?'smooth':'instant'});
  }
  function finishSession(){
    const s=state.session;if(!s||!sessionAllowed())return;
    const before=P.accessible(state.completed);
    const normal=Object.entries(s.results).filter(([i])=>+i<s.baseLength),first=normal.filter(([,r])=>r.first).length,help=normal.filter(([,r])=>r.help).length;
    const ratio=first/s.baseLength,earnedStars=ratio===1?3:ratio>=.8?2:1;
    if(s.mode==='mission'){
      const old=state.completed[s.id];state.completed[s.id]={stars:Math.max(old?.stars||0,earnedStars),bestFirst:Math.max(old?.bestFirst||0,first),total:s.baseLength,completedAt:Date.now()};
    }
    state.lastResult={title:s.title,id:s.id,mode:s.mode,stars:earnedStars,first,total:s.baseLength,help,recoveries:s.queue.filter(item=>item.recovery).length,xp:s.award,maxCombo:s.maxCombo,newlyUnlocked:P.accessible(state.completed).filter(id=>!before.includes(id)),nextId:P.next(state.completed)};state.session=null;save();page='result';render();window.scrollTo({top:0,behavior:'instant'});celebrate();tone('finish');
  }
  function renderResult(){
    const r=state.lastResult;if(!r){navigate('map');return;}const m=mission(r.id),next=nextMission();
    main.innerHTML=`<div class="result scene-enter"><div class="reward-stage"><div class="reward-rays" aria-hidden="true"></div><div class="reward-emblem">${icon(m?.icon||'trophy')}</div><div class="reward-stars">${stars(r.stars)}</div><div class="reward-byte" aria-hidden="true">${V.mascot('happy',92)}</div></div><span class="eyebrow">${r.mode==='mission'?'¡ZONA RECUPERADA!':'¡MISIÓN CUMPLIDA!'}</span><h1>${esc(r.title)}</h1><p>${m?esc(m.repair):'Has cerrado todas las evidencias de esta partida.'}</p>${m?`<div class="mission-scene result-scene" aria-hidden="true">${V.missionScene(m.id,'solved')}</div>`:''}<div class="result-grid"><div class="result-metric"><strong>+${r.xp}</strong><small>XP nuevos</small></div><div class="result-metric"><strong>${r.first}/${r.total}</strong><small>A la primera sin pista</small></div><div class="result-metric"><strong>${r.recoveries}</strong><small>Revancha completada</small></div></div>${unlockCard(r)}<div class="row wrap result-actions"><button class="btn" data-action="brief" data-id="${next.id}">${allDone()?'Volver a la auditoría':next.extra?'Entrar al laboratorio':'Siguiente misión'} ${icon('arrow')}</button><button class="btn secondary" data-action="nav" data-page="map">Ver la ciudad</button></div><div class="panel result-report"><span class="eyebrow">TU INFORME DE PARTIDA</span><div class="report-line">${icon('shield')}<div><strong>${r.help?'Has resuelto '+r.help+' retos con ayuda.':'Has construido tus propias respuestas.'}</strong><p>Una estrella por completar; dos por acertar al menos el 80 % a la primera sin ayuda; tres por acertarlo todo.</p></div></div><div class="report-line">${icon('bolt')}<div><strong>Mejor racha: ${r.maxCombo} evidencias</strong><p>Se conserva tu mejor puntuación por reto. Repite para mejorarla y afianzar lo aprendido.</p></div></div></div><button class="text-btn" data-action="replay" data-id="${r.id}" data-mode="${r.mode}">${r.mode==='mission'?'Repetir la misión':'Jugar una partida rápida'}</button></div>`;
  }
  function shuffle(items,seed){const a=[...items];let n=(Number(seed)||1)>>>0;for(let i=a.length-1;i>0;i--){n=(n*1664525+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  const lessonForChallenge={
    'var-clasifica':['l4','l5','l6'],'var-unidad':['l1','l2','l3'],'var-frecuencia':['l15'],'var-ordinal':['l5'],'var-inicio':['l0'],
    'bus-repara':['l7','l8','l10'],'bus-diagnostico':['l7','l8','l9','l10'],'bus-duplicados':['l9'],'bus-trazabilidad':['l11'],'bus-imputa':['l12'],
    'wait-ordena':['l17'],'wait-centro':['l16','l17','l18'],'wait-cuartiles':['l20','l21','l22'],'wait-box':['l26'],'wait-transferencia':['l16','l17','l21'],
    'graph-preguntas':['l24','l25','l26','l27','l28'],'graph-ejes':['l27'],'graph-barras-histo':['l24','l25'],'graph-histograma':['l25'],'graph-evidencia':['l1','l22','l23'],
    'audit-triaje':['l7','l8','l9','l10'],'audit-orden':['l17'],'audit-calculos':['l16','l17','l21','l26'],'audit-box':['l26'],'audit-procedencia':['l1','l9','l11','l23'],'audit-informe':['l1','l22','l23'],
    'code-objetos':['l29'],'code-print':['l33'],'code-orden':['l29','l30'],'code-regex':['l35','l36','l37'],'code-valida':['l35','l36','l37']
  };
  function studyConcept(){
    if(!sessionAllowed()||lockedAnswer())return;const s=state.session,c=current().challenge;
    s.hints[s.index]=true;save();renderGame();
    const ids=lessonForChallenge[c.id]||[],lessons=C.topics.flatMap(t=>t.lessons).filter(l=>ids.includes(l.id));
    const html=`<div class="concept-lessons">${lessons.map((l,i)=>`<details class="concept-lesson" ${i===0?'open':''}><summary>${esc(l.title)}</summary><p>${esc(l.text)}</p><div class="lesson-example"><strong>Ejemplo</strong><p>${esc(l.example)}</p></div></details>`).join('')}</div>`;
    openModal('La idea que necesitas','Consultar este concepto cuenta como ayuda en este reto. Puedes completar la misión y desbloquear la siguiente igualmente.',[{label:'Volver al ejercicio',action:focusBoard}],html);
  }
  function studyZone(id){
    theoryReturn={id};theoryFilter={variables:'fundamentos',autobuses:'limpieza',esperas:'estadistica',graficos:'graficos',auditoria:'all',codigo:'codigo'}[id]||'all';search='';navigate('theory');
  }
  function unlockCard(r){
    if(r.mode!=='mission')return'';
    if(allDone())return `<div class="unlock-card campaign-finished">${icon('trophy')}<div><span class="eyebrow">RUTA COMPLETA</span><h2>¡Ciudad Delta está recuperada!</h2><p>Has terminado las seis misiones. Sigue practicando los conceptos que quieras afianzar.</p></div></div>`;
    const id=(r.newlyUnlocked||[]).find(id=>!P.isComplete(id,state.completed));if(!id)return'';
    const m=mission(id);return `<div class="unlock-card">${icon(m.icon)}<div><span class="eyebrow">NUEVA MISIÓN DESBLOQUEADA</span><h2>${esc(m.title)}</h2><p>${esc(m.description)}</p></div></div>`;
  }
  function skillPanel(){
    return `<section class="panel"><span class="eyebrow">QUÉ REPASAR AHORA</span><h2>Tu avance por zona.</h2><div class="profile-skill-list">${E.missions.map(m=>{
      const saved=P.isComplete(m.id,state.completed)?state.completed[m.id]:null,n=E.makeMission(m.id,1).length,first=Math.min(n,Math.max(0,saved?.bestFirst||0)),pending=Object.values(state.errors).filter(e=>e.origin===m.id&&!e.resolved).length,open=unlocked(m);
      return `<div class="skill-summary ${open?'':'locked'}"><span class="skill-icon">${icon(open?m.icon:'lock')}</span><div><strong>${esc(m.shortTitle||m.title)}</strong><small>${!open?esc(lockReason(m.id)):saved?'Mejor partida: '+first+'/'+n+' a la primera sin ayuda.':'Primera misión pendiente.'}</small>${open&&saved?`<div class="progress-track"><div class="progress-fill" style="width:${first/n*100}%"></div></div>`:''}${open&&pending?`<small>${pending} evidencias para repasar</small>`:''}</div><button class="icon-btn" data-action="brief" data-id="${m.id}" aria-label="${open?'Practicar':'Ver requisitos de'} ${esc(m.title)}">${icon(open?'arrow':'lock')}</button></div>`;
    }).join('')}</div><p class="small muted">Este registro describe tus partidas; no es una predicción de la nota del examen.</p></section>`;
  }
  function renderTheory(){
    main.innerHTML=`${theoryReturn?`<button class="text-btn" data-action="back-study">${icon('back')} Volver a ${esc(shortName(theoryReturn.id))}</button>`:''}<header class="page-head"><div><span class="eyebrow">TU CUADERNO DE CAMPO</span><h1>Las reglas del juego.</h1><p>Consulta la teoría antes de una misión o vuelve a una idea cuando te atasques.</p></div><span class="pill green">${state.read.length}/38 leídas</span></header><label class="hidden" for="lesson-search">Buscar en la teoría</label><input id="lesson-search" class="search" type="search" placeholder="Busca mediana, NULL, boxplot…" value="${esc(search)}" data-input="search"><div class="filter-row"><button class="filter-btn ${theoryFilter==='all'?'active':''}" data-action="filter" data-id="all">Todo el temario</button>${C.topics.map(t=>`<button class="filter-btn ${theoryFilter===t.id?'active':''}" data-action="filter" data-id="${t.id}">${esc(t.title.replace('Fundamentos de EDA','Fundamentos').replace('Estadística descriptiva','Estadística').replace('Calidad y limpieza','Limpieza').replace('Gráficos de EDA','Gráficos'))}</button>`).join('')}</div><div id="lesson-list">${lessonList()}</div>`;
  }
  function lessonList(){let n=0;const norm=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),query=norm(search.trim());
    const html=C.topics.filter(t=>theoryFilter==='all'||t.id===theoryFilter).map(t=>{const list=t.lessons.filter(l=>norm(l.title+' '+l.text+' '+l.example).includes(query));n+=list.length;if(!list.length)return'';return`<section class="theory-group"><h2>${esc(t.title)}</h2>${list.map(l=>`<details class="lesson" data-lesson="${l.id}"><summary><span class="lesson-check ${state.read.includes(l.id)?'done':''}">${state.read.includes(l.id)?'✓':''}</span>${esc(l.title)}</summary><div class="lesson-content"><p>${esc(l.text)}</p><div class="lesson-example"><strong>Ejemplo</strong><br>${esc(l.example)}</div><button class="text-btn" data-action="read" data-id="${l.id}">${icon('check')}${state.read.includes(l.id)?'Leída · marcar pendiente':'Marcar como leída'}</button></div></details>`).join('')}</section>`;}).join('');
    return n?html:`<div class="empty">${icon('book')}<h2>No aparece ese concepto</h2><p>Prueba con una palabra más corta o cambia el bloque.</p><button class="btn secondary" data-action="clear-search">Ver todo</button></div>`;
  }
  function renderPractice(){
    const pending=pendingErrors().length,wrong=Object.values(state.quiz).filter(q=>!q.correct).length;
    main.innerHTML=`<header class="page-head"><div><span class="eyebrow">PARTIDAS A TU MEDIDA</span><h1>Un reto más.</h1><p>Elige cómo entrenar: practicar habilidades, recuperar errores o preparar las preguntas del examen.</p></div></header>${quizResumeCard()}<div class="practice-grid"><button class="practice-tile" data-action="quick"><span class="tile-icon">${icon('bolt')}</span><h2>Partida rápida</h2><p>Cinco ejercicios de tus zonas abiertas. Prioriza los errores y los retos que resolviste con ayuda.</p><span class="tile-link">Jugar una ronda ${icon('arrow')}</span></button><button class="practice-tile" data-action="review"><span class="tile-icon">${icon('repeat')}</span><h2>La revancha</h2><p>${pending?`${pending} evidencias pendientes. Vuelve a resolver los conceptos que se resistieron.`:'Has recuperado las evidencias pendientes. Vuelve aquí cuando un reto se resista.'}</p><span class="tile-link">${pending?'Recuperar evidencias':'Ver mi progreso'} ${icon('arrow')}</span></button><button class="practice-tile" data-action="quiz-setup"><span class="tile-icon">${icon('book')}</span><h2>Preguntas de teoría</h2><p>${C.quizzes.length} preguntas con explicación. Entrena por bloque o haz un simulacro sin pistas.</p><span class="tile-link">Preparar preguntas ${icon('arrow')}</span></button><button class="practice-tile" data-action="written"><span class="tile-icon">${icon('pen')}</span><h2>El informe escrito</h2><p>${C.written.length} ejercicios para justificar tus decisiones y revisarlas con criterios concretos.</p><span class="tile-link">Escribir y revisar ${icon('arrow')}</span></button></div>${wrong?`<div class="helper-strip">${icon('bulb')}<p>Hay <strong>${wrong} preguntas de teoría por repasar.</strong> Puedes elegir «Solo mis fallos» en las preguntas de teoría.</p></div>`:''}<div class="section-heading"><h2>Tu ruta de misiones</h2><small>Las zonas se abren en orden</small></div><div class="map-grid">${E.missions.map((m,i)=>missionCard(m,i+1,null)).join('')}</div>`;
  }
  function restoreQuiz(raw){
    if(!raw||!Array.isArray(raw.ids)||raw.ids.length<1||raw.ids.length>C.quizzes.length||new Set(raw.ids).size!==raw.ids.length||!['learn','exam'].includes(raw.mode)||!Number.isInteger(raw.index)||raw.index<0||raw.index>=raw.ids.length||!Array.isArray(raw.answers))return null;
    const list=raw.ids.map(id=>C.quizzes.find(q=>q.id===id));if(list.some(q=>!q))return null;
    const answers=[];
    for(let i=0;i<raw.index;i++){const v=raw.answers[i];if(!Number.isInteger(v)||v<0||v>=list[i].options.length)return null;answers[i]=v;}
    const q=list[raw.index],saved=raw.answers[raw.index];
    const pick=Number.isInteger(raw.pick)&&raw.pick>=0&&raw.pick<q.options.length?raw.pick:null;
    let feedback=null;
    if(raw.mode==='learn'&&raw.feedback&&Number.isInteger(saved)&&saved>=0&&saved<q.options.length){answers[raw.index]=saved;feedback={ok:saved===q.answer};}
    return {run:{list,mode:raw.mode,index:raw.index,answers},pick:feedback?saved:pick,feedback};
  }
  function persistQuiz(){
    state.quizSession=quizRun&&quizRun.index<quizRun.list.length?{ids:quizRun.list.map(q=>q.id),mode:quizRun.mode,index:quizRun.index,answers:quizRun.answers.slice(),pick:quizPick,feedback:quizFeedback}:null;save();
  }
  function quizSetup(){
    page='quiz-setup';updateChrome();
    main.innerHTML=`<div class="briefing"><button class="text-btn" data-action="nav" data-page="practice">${icon('back')} Volver a practicar</button><div class="panel">${quizResumeCard()}<span class="eyebrow">COMPRUEBA LA TEORÍA</span><h1>Prepara tu ronda.</h1><p>Entrena con explicaciones después de cada pregunta o recibe toda la corrección al terminar un simulacro.</p><div class="quiz-settings"><label for="quiz-topic">Temario<select id="quiz-topic"><option value="eda">Solo EDA</option><option value="all">EDA + POO y Regex</option>${C.topics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}<option value="wrong">Solo mis fallos</option></select></label><label for="quiz-mode">Cómo jugar<select id="quiz-mode"><option value="learn">Entrenamiento</option><option value="exam">Simulacro</option></select></label><label for="quiz-count">Preguntas<select id="quiz-count"><option value="5">5 preguntas</option><option value="10" selected>10 preguntas</option><option value="20">20 preguntas</option></select></label></div><button class="btn wide" data-action="quiz-start">Empezar ronda ${icon('arrow')}</button><p class="footer-note">Sin límite de tiempo. Los simulacros no otorgan estrellas a las misiones.</p></div></div>`;
    window.scrollTo({top:0,behavior:'instant'});
  }
  function startQuiz(){
    const filter=$('#quiz-topic').value,mode=$('#quiz-mode').value==='exam'?'exam':'learn',count=[5,10,20].includes(+$('#quiz-count').value)?+$('#quiz-count').value:10;
    const pool=C.quizzes.filter(q=>filter==='all'||filter==='eda'&&q.topic!=='codigo'||q.topic===filter||filter==='wrong'&&state.quiz[q.id]&&!state.quiz[q.id].correct);
    if(!pool.length){toast('No tienes fallos de teoría pendientes. Elige otro bloque.');return;}
    const begin=()=>{quizRun={list:shuffle(pool,makeSeed()).slice(0,count),mode,index:0,answers:[]};quizPick=null;quizFeedback=null;persistQuiz();page='quiz';updateChrome();renderQuiz();main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});};
    if(quizRun&&quizRun.index<quizRun.list.length){openModal('Tienes una ronda de teoría guardada','Puedes continuarla o sustituirla por esta nueva ronda. Tus respuestas y resultados anteriores se conservan.',[{label:'Continuar la ronda guardada',action:()=>navigate('quiz')},{label:'Empezar la nueva ronda',action:begin,secondary:true}]);}else begin();
  }
  function renderQuiz(){
    if(!quizRun){quizSetup();return;}const r=quizRun,q=r.list[r.index];if(!q){page='quiz-result';renderQuizResult();return;}
    main.innerHTML=`<div class="game-shell quiz-play"><p class="quiz-save-note">${icon('check')} Esta ronda se guarda automáticamente.</p><div class="game-top"><button class="icon-btn" data-action="nav" data-page="practice" aria-label="Guardar y salir de las preguntas">${icon('back')}</button><div class="game-track"><div class="row spread"><span>${r.mode==='exam'?'Simulacro':'Entrenamiento de teoría'}</span><span>${r.index+1}/${r.list.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${r.index/r.list.length*100}%"></div></div></div></div><div class="challenge-card"><span class="eyebrow">${esc(C.topics.find(t=>t.id===q.topic)?.title||'Teoría')}</span><h1>${esc(q.prompt)}</h1><div class="answer-options" style="margin-top:22px">${q.options.map((o,i)=>`<button class="answer-option ${quizPick===i?'selected':''}" data-action="quiz-pick" data-value="${i}" aria-pressed="${quizPick===i}" ${quizFeedback?'disabled':''}><span class="option-letter">${String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div>${quizFeedback?`<div class="feedback ${quizFeedback.ok?'success':'retry'}"><div class="feedback-title">${icon(quizFeedback.ok?'check':'repeat')}${quizFeedback.ok?'Bien explicado.':'Una idea para repasar.'}</div><p>${esc(q.explanation)}</p><p class="small">Respuesta: ${esc(q.options[q.answer])}</p><button class="btn wide" data-action="quiz-next">${r.index+1===r.list.length?'Ver resultado':'Siguiente pregunta'} ${icon('arrow')}</button></div>`:`<button class="btn wide" style="margin-top:20px" data-action="quiz-check" ${quizPick===null?'disabled':''}>${r.mode==='exam'?'Guardar respuesta':'Comprobar'} ${icon('arrow')}</button>`}</div></div>`;
  }
  function checkQuiz(){
    if(!quizRun||quizPick===null||quizFeedback)return;
    const q=quizRun.list[quizRun.index],ok=quizPick===q.answer;quizRun.answers[quizRun.index]=quizPick;
    state.quiz[q.id]={answer:quizPick,correct:ok,attempts:(state.quiz[q.id]?.attempts||0)+1};
    if(quizRun.mode==='exam'){nextQuiz();}else{quizFeedback={ok};persistQuiz();tone(ok?'correct':'retry');renderQuiz();scrollFeedback();}
  }
  function nextQuiz(){
    if(!quizRun||quizRun.answers[quizRun.index]===undefined)return;
    quizRun.index++;quizPick=null;quizFeedback=null;persistQuiz();renderQuiz();window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
  }
  function renderQuizResult(){
    if(!quizRun){quizSetup();return;}updateChrome();const r=quizRun,n=r.list.filter((q,i)=>r.answers[i]===q.answer).length;
    main.innerHTML=`<div class="result"><div class="result-icon">${icon('book')}</div><span class="eyebrow">RONDA TERMINADA</span><h1>${n}/${r.list.length} respuestas correctas.</h1><p>Revisa las explicaciones. Las preguntas falladas quedan disponibles en «Solo mis fallos».</p><div class="row wrap" style="justify-content:center;margin:22px 0"><button class="btn" data-action="quiz-setup">Nueva ronda</button><button class="btn secondary" data-action="nav" data-page="practice">Volver a practicar</button></div><div class="quiz-review">${r.list.map((q,i)=>`<details><summary>${r.answers[i]===q.answer?'✓':'↻'} ${esc(q.prompt)}</summary><p><strong>Tu respuesta:</strong> ${esc(q.options[r.answers[i]])}<br><strong>Respuesta correcta:</strong> ${esc(q.options[q.answer])}<br>${esc(q.explanation)}</p></details>`).join('')}</div></div>`;
  }
  function renderWritten(){
    const w=C.written.find(w=>w.id===writtenId)||C.written[0];writtenId=w.id;
    main.innerHTML=`<div class="game-shell"><button class="text-btn" data-action="nav" data-page="practice">${icon('back')} Volver a practicar</button><header class="page-head"><div><span class="eyebrow">PREPARA TU RESPUESTA</span><h1>El informe escrito.</h1><p>Decide, justifica y compara. Esta revisión personal no se suma a las estrellas del juego.</p></div></header><label class="small muted" for="written-select">Elige un ejercicio</label><select id="written-select" class="draft-select" data-input="written-select">${C.written.map((w,i)=>`<option value="${w.id}" ${w.id===writtenId?'selected':''}>${i+1}. ${esc(w.title)}</option>`).join('')}</select><div class="panel"><h2>${esc(w.title)}</h2><p>${esc(w.prompt)}</p><label class="hidden" for="written-answer">Tu respuesta razonada</label><textarea id="written-answer" class="draft-text" data-input="draft" placeholder="Mi decisión es… porque…">${esc(state.drafts[w.id]||'')}</textarea><p class="tiny muted" id="draft-status">Tu respuesta se guarda en este dispositivo.</p><button class="btn" data-action="written-show" ${!(state.drafts[w.id]||'').trim()?'disabled':''}>Comparar con los criterios</button>${writtenShown?`<div class="rubric"><span class="eyebrow">SOLUCIÓN ORIENTATIVA</span><p>${esc(w.solution)}</p><h3>Revisa tu respuesta</h3>${w.criteria.map((c,i)=>`<label class="rubric-check"><input type="checkbox" data-input="rubric" data-index="${i}" ${state.writtenReview[w.id]?.includes(i)?'checked':''}><span>${esc(c)}</span></label>`).join('')}<p class="tiny">Autoevaluación: marca solo lo que aparece en tu respuesta. Puedes seguir editándola.</p></div>`:''}</div></div>`;
  }
  function renderProfile(){
    const errors=Object.values(state.errors),q=Object.values(state.quiz),correct=q.filter(q=>q.correct).length;
    main.innerHTML=`<header class="page-head"><div class="profile-head"><span class="avatar avatar-byte" aria-hidden="true">${V.mascot('happy',88)}</span><div><span class="eyebrow">TU CARNÉ DE INVESTIGADOR</span><h1>${rank()}</h1><p>${xp()} XP · ${done()} zonas de la ciudad recuperadas</p></div></div></header><div class="profile-grid">${skillPanel()}<section class="panel"><span class="eyebrow">INSIGNIAS DE HABILIDAD</span><h2>Tu colección.</h2><div class="badge-grid">${E.missions.map(m=>`<div class="badge-item ${state.completed[m.id]?'on':''}"><span>${icon(m.icon)}</span><small>${esc(m.shortTitle||m.title)}</small>${stars(state.completed[m.id]?.stars||0)}</div>`).join('')}</div><p class="small">Cada insignia reconoce una misión completada. Las estrellas registran la precisión de tu mejor partida.</p></section><section class="panel"><span class="eyebrow">LO QUE LLEVAS APRENDIDO</span><h2>Tu progreso.</h2>${[['Teoría consultada',state.read.length,38],['Misiones completadas',P.completedCount(state.completed,true),E.missions.length],['Preguntas correctas',correct,C.quizzes.length],['Errores recuperados',errors.filter(e=>e.resolved).length,errors.length]].map(([label,n,total])=>`<div class="skill-row"><div class="row spread"><span>${label}</span><strong>${n}/${total}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${total?n/total*100:0}%"></div></div></div>`).join('')}${state.legacy?.missions?`<p class="tiny muted">Se conserva el recuerdo de ${state.legacy.missions} misiones de la edición anterior. Esta campaña tiene retos nuevos.</p>`:''}</section><section class="panel"><span class="eyebrow">A TU MANERA</span><h2>Ajustes y partida.</h2><div class="settings-row"><div>Aspecto<small>Claro u oscuro, guardado en este dispositivo</small></div><button class="icon-btn" data-action="theme" aria-label="Cambiar tema">${icon(document.documentElement.dataset.theme==='dark'?'sun':'moon')}</button></div><div class="settings-row"><div>Sonidos de respuesta<small>${state.settings.sound?'Activados':'Desactivados'}</small></div><button class="icon-btn" data-action="sound" aria-label="Cambiar sonidos" aria-pressed="${state.settings.sound}">${icon(state.settings.sound?'sound':'mute')}</button></div><div class="settings-row"><div>Animaciones<small>${!motionAllowed()?'Movimiento reducido': 'Personajes, fichas y recompensas animadas'}${motionQuery.matches?' · Preferencia del dispositivo':''}</small></div><button class="icon-btn" data-action="motion" aria-label="${state.settings.motion===false?'Activar animaciones':'Reducir animaciones'}" aria-pressed="${state.settings.motion!==false}">${icon(state.settings.motion===false?'focus':'bolt')}</button></div><div class="settings-row"><div>Copia de tu progreso<small>Para conservarlo o llevarlo a otro navegador</small></div></div><div class="row wrap"><button class="btn secondary" data-action="export">${icon('download')} Guardar copia</button><button class="btn ghost" data-action="import">${icon('upload')} Restaurar</button></div><input id="backup-input" type="file" accept="application/json,.json" hidden><div class="settings-row" style="margin-top:20px"><div>Empezar desde cero<small>Borra el progreso de esta edición</small></div><button class="text-btn" data-action="reset">Reiniciar</button></div></section><section class="panel about"><span class="eyebrow">GUÍA RÁPIDA</span><h2>Tu academia de bolsillo.</h2><h3>Instalación en iPhone</h3><p>Abre la dirección de tu app en Safari y usa Compartir → Añadir a pantalla de inicio. Abre la app una vez con conexión para preparar el contenido sin conexión.</p><h3>Contenido y corrección</h3><p>${esc(C.sourcesNote)}</p><p>Se excluye Python inicial. POO y Regex aparecen como taller adicional. Los ejercicios escritos usan revisión personal, separada de la puntuación comprobada.</p><h3>Partida local</h3><p>Tu progreso se guarda en este navegador. No se sincroniza automáticamente con otros dispositivos; puedes exportarlo e importarlo.</p><p id="offline-state" class="offline-pill">${offlineMessage()}</p></section></div>`;
  }
  function offlineMessage(){return navigator.serviceWorker?.controller?'Contenido preparado para usar sin conexión.':'El contenido sin conexión se prepara al abrir la app desde HTTPS o localhost.';}
  function openModal(title,description,actions,body=''){
    modalReturnFocus=document.activeElement;modalAction=actions;$('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="icon-btn modal-close" data-action="close-modal" aria-label="Cerrar">${icon('close')}</button><h2 id="dialog-title">${esc(title)}</h2><p>${esc(description)}</p>${body}<div class="modal-actions">${actions.map((a,i)=>`<button class="btn ${a.secondary?'secondary':''}" data-action="modal-choice" data-value="${i}">${esc(a.label)}</button>`).join('')}</div></section></div>`;setTimeout(()=>$('.modal button')?.focus(),0);
  }
  function closeModal(){$('#modal-root').innerHTML='';modalAction=null;const target=modalReturnFocus?.isConnected?modalReturnFocus:main;modalReturnFocus=null;target.focus({preventScroll:true});}
  function how(){openModal('Juega para reconstruir el informe.','Las misiones se abren en orden. Completar una, incluidas sus recuperaciones, abre la siguiente. Cada misión empieza con unas reglas breves. Después clasificas, ordenas, reparas datos y construyes respuestas. Si fallas, recibes una explicación y una revancha. Completar da una estrella; acertar al menos el 80 % a la primera sin ayuda da dos; todo correcto da tres. No hay vidas ni esperas para seguir aprendiendo.',[{label:'Vamos al mapa',action:()=>navigate('map')}]);}
  function tone(kind){
    if(!state.settings.sound)return;try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const notes=kind==='finish'?[523,659,784]:kind==='correct'?[587,784]:[294];notes.forEach((freq,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime+i*.09;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+.15);});}catch(_){}
  }
  function celebrate(){if(!motionAllowed())return;const colors=['#8ce2c5','#f3cb77','#baaceb','#8bbfd7'];$('#celebration').innerHTML=Array.from({length:30},(_,i)=>`<i class="confetti-piece" style="--x:${20+(i*17)%60}%;--size:${7+i%8}px;--c:${colors[i%4]};--dx:${(i%2?-1:1)*(25+i*7)}px;--d:${i%5*.04}s"></i>`).join('');setTimeout(()=>$('#celebration').innerHTML='',2000);}
  function toggleTheme(){const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('eda_theme',theme);}catch(_){}updateChrome();if(page==='profile')renderProfile();}
  function exportBackup(){const data={app:'EDA Quest Ciudad Delta',version:8,exportedAt:new Date().toISOString(),state};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='eda-quest-progreso.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Copia preparada. Consérvala para restaurar tu progreso.');}
  function importBackup(file){if(!file)return;if(file.size>2e6){toast('La copia es demasiado grande.');return;}const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result),v=data.state;if(data.version!==8||!v||v.version!==8||!Array.isArray(v.read)||!v.completed||!v.earned||!v.errors||!v.quiz||!v.settings)throw Error('formato');const next=fresh();next.read=v.read.filter(id=>C.topics.some(t=>t.lessons.some(l=>l.id===id)));for(const m of E.missions){const saved=v.completed[m.id];if(saved&&Number.isInteger(saved.stars)&&saved.stars>=1&&saved.stars<=3)next.completed[m.id]={stars:saved.stars,bestFirst:Number(saved.bestFirst)||0,total:Number(saved.total)||5,completedAt:Number(saved.completedAt)||Date.now()};}for(const [k,val] of Object.entries(v.earned)){if(/^(variables|autobuses|esperas|graficos|auditoria|codigo):\d+$/.test(k)&&Number.isFinite(val)&&val>=0&&val<=20)next.earned[k]=val;}for(const q of C.quizzes){const saved=v.quiz[q.id];if(saved&&Number.isInteger(saved.answer)&&saved.answer>=0&&saved.answer<q.options.length)next.quiz[q.id]={answer:saved.answer,correct:saved.answer===q.answer,attempts:Number(saved.attempts)||1};}for(const w of C.written){if(typeof v.drafts?.[w.id]==='string')next.drafts[w.id]=v.drafts[w.id].slice(0,50000);if(Array.isArray(v.writtenReview?.[w.id]))next.writtenReview[w.id]=v.writtenReview[w.id].filter(i=>Number.isInteger(i)&&i>=0&&i<w.criteria.length);}for(const [k,e] of Object.entries(v.errors)){if(mission(e.origin)&&Number.isInteger(e.slot)&&e.slot>=0&&e.slot<10&&k===e.origin+':'+e.slot){const ch=E.makeMission(e.origin,1)[e.slot];if(ch)next.errors[k]={key:k,origin:e.origin,slot:e.slot,challenge:ch,resolved:!!e.resolved};}}next.settings={sound:!!v.settings.sound,focus:!!v.settings.focus,motion:v.settings.motion!==false};next.sequence=Number(v.sequence)||0;
      openModal('Restaurar esta copia','Se sustituirá el progreso guardado en este navegador. La copia conserva tus misiones, preguntas, teoría y borradores; las partidas en curso se reinician.',[{label:'Restaurar progreso',action:()=>{state=next;quizRun=null;quizPick=null;quizFeedback=null;save();navigate('profile');toast('Progreso restaurado.');}},{label:'Cancelar',action:()=>{},secondary:true}]);
    }catch(_){toast('No es una copia válida de EDA Quest Ciudad Delta.');}};r.readAsText(file);}
  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-action]');if(!b||b.disabled)return;const act=b.dataset.action,id=b.dataset.id,value=b.dataset.value;
    if(act==='nav'){navigate(b.dataset.page);return;}
    if(act==='theme'){toggleTheme();return;}
    if(act==='sound'){state.settings.sound=!state.settings.sound;save();updateChrome();if(state.settings.sound)tone('correct');if(page==='profile')renderProfile();return;}
    if(act==='motion'){state.settings.motion=state.settings.motion===false;save();updateChrome();renderProfile();return;}
    if(act==='how'){how();return;}
    if(act==='study-zone'){studyZone(id);return;}
    if(act==='back-study'){if(theoryReturn)showBrief(theoryReturn.id);else navigate('map');return;}
    if(act==='study-concept'){studyConcept();return;}
    if(act==='focus-board'){focusBoard();return;}
    if(act==='explain'){const detail=$('.feedback-explanation');if(detail){detail.open=true;detail.querySelector('summary')?.focus({preventScroll:true});detail.scrollIntoView({block:'nearest',behavior:motionAllowed()?'smooth':'instant'});}return;}
    if(act==='brief'){showBrief(id);return;}
    if(act==='start-mission'){requestStart('mission',id);return;}
    if(act==='resume'){navigate('game');return;}
    if(act==='quick'){requestStart('quick','quick');return;}
    if(act==='review'){if(pendingErrors().length)requestStart('review','review');else navigate('profile');return;}
    if(act==='replay'){requestStart(b.dataset.mode==='mission'?'mission':'quick',id);return;}
    if(act==='focus'){state.settings.focus=!state.settings.focus;save();updateChrome();b.setAttribute('aria-pressed',String(state.settings.focus));b.setAttribute('aria-label',(state.settings.focus?'Salir del':'Activar')+' modo concentración');return;}
    if(act==='close-modal'){closeModal();return;}
    if(act==='modal-choice'){const fn=modalAction?.[+value]?.action;closeModal();fn?.();return;}
    if(act==='filter'){theoryFilter=id;renderTheory();return;}
    if(act==='clear-search'){theoryFilter='all';search='';renderTheory();return;}
    if(act==='read'){state.read=state.read.includes(id)?state.read.filter(l=>l!==id):[...state.read,id];save();const detail=b.closest('details');detail.querySelector('.lesson-check').classList.toggle('done',state.read.includes(id));detail.querySelector('.lesson-check').textContent=state.read.includes(id)?'✓':'';b.innerHTML=icon('check')+(state.read.includes(id)?'Leída · marcar pendiente':'Marcar como leída');const badge=$('.page-head .pill');if(badge)badge.textContent=state.read.length+'/38 leídas';return;}
    if(act==='quiz-setup'){quizSetup();return;}
    if(act==='quiz-resume'){if(quizRun)navigate('quiz');else quizSetup();return;}
    if(act==='quiz-start'){startQuiz();return;}
    if(act==='quiz-pick'){if(!quizFeedback){quizPick=+value;persistQuiz();renderQuiz();control('quiz-pick','value',value)?.focus({preventScroll:true});}return;}
    if(act==='quiz-check'){checkQuiz();return;}
    if(act==='quiz-next'){nextQuiz();return;}
    if(act==='written'){page='written';writtenShown=false;render();window.scrollTo({top:0,behavior:'instant'});return;}
    if(act==='written-show'){if((state.drafts[writtenId]||'').trim()){writtenShown=true;renderWritten();}return;}
    if(act==='export'){exportBackup();return;}
    if(act==='import'){$('#backup-input').click();return;}
    if(act==='reset'){openModal('¿Reiniciar esta edición?','Se borrarán las misiones, borradores, respuestas y experiencia de Ciudad Delta en este navegador. Puedes guardar una copia antes de hacerlo.',[{label:'Guardar una copia primero',action:exportBackup},{label:'Borrar el progreso',secondary:true,action:()=>{state=fresh();quizRun=null;quizPick=null;quizFeedback=null;save();navigate('map');toast('Nueva aventura preparada.');}}]);return;}
    if(act==='check'){checkChallenge();return;}
    if(act==='next'){nextChallenge();return;}
    const s=state.session;if(!s||page!=='game')return;if(!sessionAllowed()){blockedSession();return;}
    if(act==='hint'){if(lockedAnswer())return;s.hints[s.index]=true;save();renderGame();const hint=$('.hint-box');hint?.setAttribute('tabindex','-1');hint?.focus({preventScroll:true});hint?.scrollIntoView({block:'nearest',behavior:motionAllowed()?'smooth':'instant'});return;}
    if(act==='solution'){s.solutions[s.index]=true;s.hints[s.index]=true;s.showSolution=true;save();renderGame();scrollFeedback();return;}
    if(act==='retry-solution'){s.showSolution=false;s.feedback=null;s.answers[s.index]={};save();renderGame();focusBoard();return;}
    if(lockedAnswer())return;const a=answer(),c=current().challenge;resetFeedback();
    const movingId=act==='sort-place'?selectedChip:act==='match-place'?selectedMatch:id;
    const from=pieceOrigin(act==='sort-place'&&selectedChip?control('sort-select','id',selectedChip):b);
    if(act==='reset-answer'){s.answers[s.index]={};selectedChip=null;selectedMatch=null;}
    else if(act==='sort-select'){selectedChip=id;}
    else if(act==='sort-place'){
      a.assign=a.assign||{};if(selectedChip){a.assign[selectedChip]=id;selectedChip=null;}else{toast('Selecciona primero una ficha. Para mover una colocada, tócala directamente.');return;}
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
    let target;
    if(act==='sort-place'&&movingId)movePiece(from,control('sort-remove','id',movingId));
    if(act==='sort-remove')movePiece(from,control('sort-select','id',id));
    if(act==='order-add')movePiece(from,control('order-remove','id',id));
    if(act==='order-remove')movePiece(from,control('order-add','id',id));
    if(act==='match-place'){
      animateElement(control('match-select','id',movingId),[{transform:'scale(.95)'},{transform:'scale(1.04)',offset:.6},{transform:'scale(1)'}]);
      animateElement(control('match-place','value',value),[{transform:'scale(.95)'},{transform:'scale(1.04)',offset:.6},{transform:'scale(1)'}]);
    }
    if(act==='pick')animateElement(control('pick','value',value),[{transform:'scale(.98)'},{transform:'scale(1)'}],{duration:150});
    if(act==='sort-select'||act==='sort-remove')target=$('.bin-target');
    if(act==='sort-place')target=$('[data-action="sort-select"]')||$('[data-action="check"]');
    if(act==='order-add')target=$('[data-action="order-add"]')||$('[data-action="check"]');
    if(act==='order-remove')target=control('order-add','id',id);
    if(act==='match-select')target=$('.match-column:nth-child(2) button');
    if(act==='match-place')target=$('.match-column:first-child button:not(.paired)')||$('[data-action="check"]');
    if(act==='pick')target=control('pick','value',value);
    if(act==='reset-answer')target=$('[data-action="sort-select"]')||$('[data-action="order-add"]')||$('[data-action="check"]');
    target?.focus({preventScroll:true});
  });
  document.addEventListener('input',event=>{
    const el=event.target,t=el.dataset.input;
    if(t==='search'){search=el.value;$('#lesson-list').innerHTML=lessonList();return;}
    if(t==='draft'){state.drafts[writtenId]=el.value;save();const btn=$('[data-action="written-show"]');if(btn)btn.disabled=!el.value.trim();$('#draft-status').textContent='✓ Borrador guardado en este dispositivo.';return;}
    if(t==='field'&&!lockedAnswer()){const a=answer();a.values=a.values||{};a.values[el.dataset.id]=el.value;resetFeedback();el.closest('.field-row')?.classList.remove('invalid','needs-review');save();updateReady();}
    if(t==='box'&&!lockedAnswer()){const a=answer();a.positions=a.positions||{};if(el.value==='')delete a.positions[el.dataset.id];else a.positions[el.dataset.id]=el.value;resetFeedback();save();$('#boxplot-display').innerHTML=boxSVG(current().challenge,a);el.closest('label')?.classList.remove('needs-review');updateReady();}
  });
  document.addEventListener('change',event=>{
    const el=event.target,t=el.dataset.input;
    if(el.id==='backup-input'){importBackup(el.files[0]);el.value='';return;}
    if(t==='written-select'){writtenId=el.value;writtenShown=false;renderWritten();return;}
    if(t==='rubric'){const list=state.writtenReview[writtenId]||[],i=+el.dataset.index;state.writtenReview[writtenId]=el.checked?[...new Set([...list,i])]:list.filter(v=>v!==i);save();return;}
    if(t==='box'&&!lockedAnswer()){const a=answer();a.positions=a.positions||{};if(el.value==='')delete a.positions[el.dataset.id];else a.positions[el.dataset.id]=el.value;resetFeedback();save();$('#boxplot-display').innerHTML=boxSVG(current().challenge,a);el.closest('label')?.classList.remove('needs-review');updateReady();}
    if(t==='field'&&!lockedAnswer()){const a=answer();a.values=a.values||{};a.values[el.dataset.id]=el.value;resetFeedback();save();updateReady();}
  });
  document.addEventListener('keydown',event=>{
    if($('#modal-root').children.length){if(event.key==='Escape'){closeModal();return;}if(event.key==='Tab'){const list=[...document.querySelectorAll('.modal button')];const first=list[0],last=list[list.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}
    if(event.key==='Enter'&&event.target.matches('input[data-input=field],input[data-input=box]')){event.preventDefault();checkChallenge();}
  });
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  motionQuery.addEventListener?.('change',()=>{updateChrome();if(page==='profile')renderProfile();});
  save();render();
  if('serviceWorker' in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){navigator.serviceWorker.register('./sw.js').then(reg=>{reg.update();}).catch(()=>{});navigator.serviceWorker.addEventListener('controllerchange',()=>{if(page==='profile')renderProfile();});}
  window.addEventListener('online',()=>{if(page==='profile')renderProfile();});
  window.EDA_APP={getState:()=>clone(state),getPage:()=>page};
})();
