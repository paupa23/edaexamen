/* EDA Quest — ilustraciones SVG originales, animables y sin recursos externos. */
(function (root) {
  'use strict';
  let serial = 0;
  const uid = name => 'eq-' + name + '-' + (++serial);
  const P = { mint:'#72ebbb', gold:'#ffd277', cyan:'#7bdfff', lilac:'#a994ff', ink:'#11152f', navy:'#1c2545', white:'#eef9ff', muted:'#738db5', rose:'#ffa3b4' };
  const star = (x,y,s,c=P.gold) => `<path d="M${x} ${y-s}q${s*.19} ${s*.82} ${s} ${s}q-${s*.81} ${s*.18}-${s} ${s}q-${s*.19}-${s*.82}-${s}-${s}q${s*.81}-${s*.18} ${s}-${s}Z" fill="${c}"/>`;
  const bolt = (x,y,s=1) => `<path d="m${x+7*s} ${y} -7 ${10*s}h${6*s}l-${s} ${7*s} ${9*s}-${11*s}h-${6*s}Z" fill="${P.gold}"/>`;
  function defs(p) {
    return `<defs>
      <radialGradient id="${p}-sky" cx="47%" cy="32%" r="74%"><stop stop-color="#253a62"/><stop offset=".56" stop-color="#182243"/><stop offset="1" stop-color="#10142f"/></radialGradient>
      <linearGradient id="${p}-ground" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#466e7d"/><stop offset="1" stop-color="#29495c"/></linearGradient>
      <linearGradient id="${p}-ground-lit" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#68b6a3"/><stop offset="1" stop-color="#307d79"/></linearGradient>
      <linearGradient id="${p}-rock" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#233754"/><stop offset="1" stop-color="#121c38"/></linearGradient>
      <linearGradient id="${p}-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b4f6ff"/><stop offset=".5" stop-color="#70cce3"/><stop offset="1" stop-color="#3876a0"/></linearGradient>
      <linearGradient id="${p}-roof" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9af2d3"/><stop offset="1" stop-color="#42b9a6"/></linearGradient>
      <linearGradient id="${p}-lilac" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c7b9ff"/><stop offset="1" stop-color="#7762c4"/></linearGradient>
      <linearGradient id="${p}-gold" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#ffe2a4"/><stop offset="1" stop-color="#e9a94b"/></linearGradient>
      <linearGradient id="${p}-body" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#eafff8"/><stop offset=".45" stop-color="#99edce"/><stop offset="1" stop-color="#49a896"/></linearGradient>
      <linearGradient id="${p}-visor" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="#233a58"/><stop offset="1" stop-color="#111c37"/></linearGradient>
      <linearGradient id="${p}-trail" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#72ebbb" stop-opacity="0"/><stop offset=".5" stop-color="#72ebbb" stop-opacity=".65"/><stop offset="1" stop-color="#7bdfff" stop-opacity="0"/></linearGradient>
      <radialGradient id="${p}-halo"><stop stop-color="#8feddf" stop-opacity=".38"/><stop offset="1" stop-color="#8feddf" stop-opacity="0"/></radialGradient>
      <filter id="${p}-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="${p}-soft" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="10"/></filter>
    </defs>`;
  }
  function tinyTree(x,y,s=1,lit=false) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="7" rx="12" ry="4" fill="#0a1834" opacity=".3"/><path d="M0-8V7" stroke="#826c75" stroke-width="3"/><path d="M-10-5 0-27 10-5Z" fill="${lit?'#6dd7bb':'#45949a'}"/><path d="M0-27 10-5H0Z" fill="${lit?'#3aaf99':'#32737e'}"/></g>`;
  }
  function lamp(x,y,lit=true) {
    return `<g transform="translate(${x} ${y})"><path d="M0 5V-23h10" stroke="#8095b7" stroke-width="3" fill="none" stroke-linecap="round"/><path d="m5-25 9 1 2 5H4Z" fill="${lit?P.gold:'#516889'}"/>${lit?'<path d="M4-18 0 1h22l-7-19" fill="#ffd277" opacity=".09"/>':''}</g>`;
  }
  function checkBadge(x,y,lit) {
    if(!lit)return'';
    return `<g class="art-check" transform="translate(${x} ${y})"><circle r="13" fill="#1d3954" stroke="${P.mint}" stroke-width="2"/><path d="m-5 0 3 3 7-7" fill="none" stroke="${P.mint}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  function platform(p,id,cx,cy,lit,current,building) {
    return `<g class="world-island ${lit?'recovered':''} ${current?'current':''}" data-island="${id}" transform="translate(${cx} ${cy})">
      <ellipse class="island-shadow" cx="0" cy="56" rx="89" ry="22" fill="#070d25" opacity=".25"/>
      ${current?`<ellipse class="current-beacon" cy="4" rx="111" ry="46" fill="none" stroke="${P.mint}" stroke-width="2" opacity=".7"/><ellipse class="current-beacon beacon-outer" cy="4" rx="123" ry="52" fill="none" stroke="${P.mint}" opacity=".23"/>`:''}
      <path d="M-94-7 0-42 94-7 85 22 35 47-6 53-62 31-88 17Z" fill="url(#${p}-rock)"/>
      <path d="m0 8 94-15-9 29-50 25-41 6Z" fill="#192945"/>
      <path d="m-61 12 10 22 20 10-5-22m58-2 13 27 18-9 4-26" fill="#263958"/>
      <path d="m-94-7 94-36 94 36-94 37Z" fill="url(#${p}-${lit?'ground-lit':'ground'})" stroke="${lit?'#84d9c3':'#527f8c'}" stroke-width="1.4"/>
      <path d="m-80-6 80-29 80 29-80 31Z" fill="none" stroke="${lit?'#98f1d4':'#6f9bac'}" stroke-opacity=".15"/>
      <path d="M-71 5-31-9 14 8 63-9" stroke="#acc7ca" stroke-opacity=".15" stroke-width="10" fill="none"/>
      <path d="m-84-3 10 4m147-7 10-4m-87 39 15-6" stroke="${lit?P.mint:'#50738a'}" stroke-width="3" stroke-linecap="round"/>
      ${tinyTree(-66,-4,.65,lit)}${tinyTree(69,0,.5,lit)}
      ${building}
      ${lamp(66,9,lit||current)}
      <path d="M-52 33v12m5-9v7" stroke="${lit?P.cyan:'#44506b'}" stroke-width="2" opacity=".5"/>
      ${checkBadge(75,-52,lit)}
    </g>`;
  }
  function archive(p,lit) {
    return `<g class="archive-building">
      <path d="m-46-7 49 18 42-19-48-17Z" fill="#0a1732" opacity=".32"/>
      <path d="m-39-59 40 15v52l-40-15Z" fill="#417a80"/>
      <path d="m1-44 39-17V-8L1 8Z" fill="#2b596e"/>
      <path d="m-45-62 44-19 48 19L1-42Z" fill="url(#${p}-roof)" stroke="#a9eddb" stroke-width="1.3"/>
      <path d="m-45-62 0 8 46 18 46-20v-6L1-42Z" fill="#367e7c"/>
      <path d="m-38-59 38 15" stroke="#d6fff0" stroke-opacity=".35"/>
      ${[0,1,2].map(i=>`<g transform="translate(0 ${i*15})"><path d="m-31-44 23 9v10l-23-9Z" fill="${lit?'#ffdb8c':'#819f9b'}" class="building-window"/><path d="m-28-40 16 6" stroke="#a9804f" stroke-width="2"/><path d="m11-36 20-9v10l-20 9Z" fill="${lit?'#a5f3e5':'#467e88'}" class="building-window"/></g>`).join('')}
      <path d="m-19-77 21-9 22 9-21 9Z" fill="#c8f8e8"/>
      <path d="m-12-84 14-5 13 5v9l-14 6-13-5Z" fill="#6bcdb4"/><path d="m2-89v14l13-5v-4Z" fill="#309b93"/>
      <g transform="translate(-51 -25) rotate(-10)"><g class="art-paper"><rect x="-7" y="-14" width="17" height="23" rx="3" fill="#ffd277"/><path d="M-3-8H5M-3-3H5M-3 2H2" stroke="#a87942" stroke-width="1.6"/></g></g>
    </g>`;
  }
  function bus(p,lit) {
    return `<g class="bus-building">
      <path d="m-42-9 40 16 47-20-40-17Z" fill="#0a1732" opacity=".25"/>
      <path d="m-39-59 41 15v45l-41-14Z" fill="#9a7669"/><path d="m2-44 43-18v45L2 1Z" fill="#655a6d"/>
      <path d="m-45-62 45-20 50 20L3-42Z" fill="url(#${p}-gold)"/><path d="m-45-62 2 7 46 18 47-19v-6L3-42Z" fill="#b78057"/>
      <path d="m11-35 25-11v29L11-7Z" fill="#182b43"/><path d="m14-29 19-8m-19 14 19-8m-19 14 19-8" stroke="#58627c" stroke-width="2"/>
      <path d="m-32-47 25 9v10l-25-9Z" class="building-window" fill="${lit?P.gold:'#b48f70'}"/>
      <g transform="translate(-43 -8)"><g class="art-bus">
        <path d="m-18-19 31-13 46 17v21L28 19-18 2Z" fill="#d89a4b"/>
        <path d="m-18-19 46 17v21L-18 2Z" fill="#ffca72"/><path d="m28-2 31-13v21L28 19Z" fill="#b87541"/>
        <path d="m-17-20 30-13 47 18L28-2Z" fill="#ffe6a5"/>
        <path d="m-11-14 10 4v11l-10-4Zm15 6 10 4V7L4 3Zm15 5 5 2v11l-5-2Z" fill="#294d65"/>
        <path d="m34-2 18-8V2l-18 8Z" fill="#36617b"/><path d="m37-3 12-5" stroke="#b4eff7" stroke-width="2"/>
        <path d="m-9-13 6 2m9 3 6 3" stroke="#b8f4ff" stroke-width="2" opacity=".7"/>
        <ellipse cx="-6" cy="5" rx="6" ry="8" transform="rotate(-18 -6 5)" fill="#18243f"/><ellipse cx="-6" cy="5" rx="2.5" ry="3.5" fill="#8197ad"/>
        <ellipse cx="39" cy="13" rx="5" ry="7" transform="rotate(18 39 13)" fill="#18243f"/><ellipse cx="39" cy="13" rx="2" ry="3" fill="#8197ad"/>
        <path d="m-15-1 37 14" stroke="#fff0bb" stroke-width="2"/>
        <path d="m52 6 5-2v4l-5 2Z" fill="${lit?'#fff5cc':'#c8b07b'}"/>
      </g></g>
      <g transform="translate(57 -36)"><path d="M0 0v31" stroke="#7d94b5" stroke-width="2.5"/><rect x="-7" y="-8" width="15" height="14" rx="4" fill="#ffd277"/><path d="M-3-3H4M-3 1H4" stroke="#9d734c" stroke-width="2"/></g>
    </g>`;
  }
  function tower(p,lit) {
    return `<g class="clock-building">
      <path d="m-33-3 33 12 33-14-33-12Z" fill="#0a1732" opacity=".28"/>
      <path d="m-26-66 26 10v62L-26-4Z" fill="#7f74aa"/><path d="m0-56 27-11v62L0 6Z" fill="#514c83"/>
      <path d="m-32-69 31-16 34 15L1-56Z" fill="url(#${p}-lilac)"/><path d="m-32-69 1 6 32 14 32-15v-6L1-56Z" fill="#635693"/>
      <path d="m-14-82 13-18 16 18-16 7Z" fill="#c5b7ff"/><path d="m-1-100 16 18-16 7Z" fill="#947cdf"/>
      <path d="M-1-100v-13" stroke="#ceb8ff" stroke-width="2.5"/><circle cx="-1" cy="-115" r="4" fill="${lit?P.gold:'#a08ed3'}"/>
      <ellipse cx="-13" cy="-41" rx="9" ry="13" transform="rotate(-11 -13 -41)" fill="#1c2c4b" stroke="#c4b2ee" stroke-width="2.2"/>
      <g class="art-clock-hand" style="transform-origin:-13px -41px"><path d="M-13-49v9l5 3" stroke="#ffd277" stroke-width="2" fill="none" stroke-linecap="round"/></g>
      <path d="m8-47 10-4v13L8-34Z" class="building-window" fill="${lit?'#ffdf9b':'#8d8fb2'}"/>
      <path d="m-19-18 10 4v14l-10-4Z" fill="#bfd9e4"/><path d="m7-19 11-5v17L7-2Z" fill="#2f345d"/>
      <path d="m-29 1 31 12 30-13-3 5-27 13-30-12Z" fill="#8c85a9"/>
      <g transform="translate(43 -1)"><ellipse cy="5" rx="14" ry="4" fill="#0e1a35" opacity=".4"/><circle cx="-5" cy="-13" r="5" fill="#ffcf94"/><path d="M-10 0v-6a5 5 0 0 1 10 0v6" fill="#83d6ca"/><circle cx="8" cy="-9" r="4" fill="#d9bdf0"/><path d="M4 3v-6a4 4 0 0 1 8 0v6" fill="#b59bf1"/></g>
    </g>`;
  }
  function observatory(p,lit) {
    return `<g class="observatory-building">
      <path d="m-40-3 39 15L44-8 3-23Z" fill="#07172f" opacity=".28"/>
      <path d="m-35-43 35 13v37l-35-13Z" fill="#3b779b"/><path d="m0-30 38-16v37L0 7Z" fill="#2d4d79"/>
      <path d="m-38-44 39 16 40-18-40-15Z" fill="#83d9ee"/>
      <path d="M-32-48a34 25 0 0 1 66 0l-34 14Z" fill="url(#${p}-glass)"/><path d="M0-71v37" stroke="#437b9d" stroke-width="3"/><path d="M-25-62q29-16 49 1" fill="none" stroke="#d1faff" stroke-width="2" opacity=".45"/>
      <path d="m-26-29 11 4v15l-11-4Zm18 7 5 2v14l-5-2Z" class="building-window" fill="${lit?'#ffdc87':'#6ca7ba'}"/>
      <path d="m9-23 20-8v23L9 0Z" fill="#162b4d"/><path d="m13-12 4-3 4 1 5-10" stroke="${lit?P.mint:'#5ea7bc'}" stroke-width="2" fill="none"/>
      <g class="art-telescope" transform="translate(36 -62)"><path d="m0 5-9 20m9-20 8 17" stroke="#b7d8e7" stroke-width="3"/><path d="m-20-10 41-17 8 15L-12 5Z" fill="#85d8f2" stroke="#2d567f" stroke-width="1.5"/><path d="m-16-8 38-16" stroke="#d0f7ff" stroke-width="2.5"/><path d="m18-30 10-5 10 22-10 4Z" fill="#3e7ca2"/><ellipse cx="33" cy="-25" rx="5" ry="11" transform="rotate(-24 33 -25)" fill="#132845" stroke="#b1f4ff" stroke-width="2"/></g>
      <g transform="translate(-56 -8)"><path d="M0 0v-25h19v25" fill="#203858" stroke="#6facc3" stroke-width="2"/><path d="M4-5v-5m5 5v-12m5 12v-18" stroke="${lit?P.mint:'#5d9daf'}" stroke-width="3"/></g>
    </g>`;
  }
  function headquarters(p,lit) {
    return `<g class="hq-building">
      <path d="m-45-4 45 17 45-18L0-24Z" fill="#0a1732" opacity=".28"/>
      <path d="m-37-45 36 15v37l-36-14Z" fill="#5c729f"/><path d="m-1-30 38-16v37L-1 7Z" fill="#3a4e7d"/>
      <path d="m-44-47 44-21 44 20L0-27Z" fill="#a9bceb"/><path d="m-44-47 2 6 42 17 44-18v-6L0-27Z" fill="#6f84b4"/>
      <path d="m-19-66 18 7 21-8V-91l-20-8-19 9Z" fill="#7c94c8"/>
      <path d="m-19-90 19 8 20-9-20-9Z" fill="#c4d6ff"/>
      <path d="m0-99 0 41 20-9V-91Z" fill="#4f659a"/>
      <g class="art-prism"><path d="M0-135-13-111 0-91l13-20Z" fill="${lit?P.gold:'#a994ff'}"/><path d="M0-135v44l13-20Z" fill="${lit?'#f2a94d':'#7560c0'}"/><path d="M-13-111H13" stroke="#fff4c7" stroke-opacity=".5"/></g>
      <ellipse class="art-orbit" cx="0" cy="-111" rx="25" ry="8" fill="none" stroke="${lit?P.gold:'#b7a5f3'}" stroke-width="1.5" opacity=".6" transform="rotate(-20 0 -111)"/>
      ${[-25,-12].map(x=>`<path d="m${x}-33 8 3v17l-8-3Z" class="building-window" fill="${lit?'#ffdc8e':'#7c9bc1'}"/>`).join('')}
      <path d="m9-29 9-4v17l-9 4Zm15-6 7-3v17l-7 3Z" class="building-window" fill="${lit?'#8dedca':'#7094b9'}"/>
      <path d="m-8-10 8 3 9-4V5L0 9-8 6Z" fill="#1a2a49"/><path d="m-17 8 17 6 18-8-1 6-17 8-17-6Z" fill="#7f92bb"/>
      <path d="M-45-44v-26m0 0 19 4-19 7" fill="${lit?P.mint:'#829cc4'}" stroke="#becbe6" stroke-width="1.5"/>
    </g>`;
  }
  function codeShip(p) {
    return `<g class="code-ship art-float"><ellipse cy="16" rx="33" ry="8" fill="#0a1431" opacity=".3"/><ellipse class="art-propeller" cy="7" rx="36" ry="9" fill="none" stroke="#a994ff" stroke-width="1.5" opacity=".7"/><path d="M-24-5Q-20-29 0-29T24-5L11 7h-22Z" fill="url(#${p}-lilac)"/><path d="M-25-6q25 14 50 0L14 8h-28Z" fill="#665aab"/><path d="M-14-12q14-6 28 0v10q-14 6-28 0Z" fill="#1b294b"/><path d="m-7-10-4 4 4 3m14-7 4 4-4 3m-6-8-2 9" fill="none" stroke="#c4baff" stroke-width="1.6"/><circle cy="11" r="4" fill="#7bdfff"/></g>`;
  }
  function mascot(mood='idle',size=96) {
    const p=uid('byte'),mode=['idle','happy','thinking','sad'].includes(mood)?mood:'idle',w=Math.max(24,Math.min(600,Number(size)||96));
    const eyes=mode==='happy'?'<path d="M35 52q5-8 10 0m13 0q5-8 10 0" fill="none" stroke="#8cefd6" stroke-width="4" stroke-linecap="round"/>':mode==='thinking'?'<path d="M34 48h11m14 1 10-3" fill="none" stroke="#8cefd6" stroke-width="4" stroke-linecap="round"/>':mode==='sad'?'<path d="m34 49 10 3m15 0 10-3" fill="none" stroke="#8cefd6" stroke-width="4" stroke-linecap="round"/>':'<rect x="35" y="46" width="9" height="12" rx="4.5" fill="#8cefd6"/><rect x="59" y="46" width="9" height="12" rx="4.5" fill="#8cefd6"/>';
    return `<svg class="byte-mascot mood-${mode}" width="${w}" height="${w}" viewBox="0 0 104 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${defs(p)}<ellipse class="byte-shadow" cx="52" cy="99" rx="26" ry="6" fill="#020a22" opacity=".28"/><g class="art-float byte-body"><ellipse class="byte-hover-ring" cx="52" cy="91" rx="18" ry="4" stroke="#72ebbb" stroke-width="2" opacity=".65"/><path d="m42 81 4 10h12l5-10" fill="#477e88"/><path d="m45 86 7 10 7-10" fill="#7bdfff" opacity=".8"/><g class="byte-arm byte-arm-left" style="transform-origin:25px 62px"><path d="M25 58 15 ${mode==='happy'?'47':'69'}" stroke="#79c6b4" stroke-width="9" stroke-linecap="round"/><circle cx="14" cy="${mode==='happy'?'45':'70'}" r="7" fill="#c9ffec"/></g><g class="byte-arm byte-arm-right" style="transform-origin:80px 62px"><path d="M79 59 89 ${mode==='thinking'?'48':'68'}" stroke="#4b9d96" stroke-width="9" stroke-linecap="round"/><circle cx="91" cy="${mode==='thinking'?'47':'69'}" r="7" fill="#91e7ca"/></g><path d="M30 59h44l5 15q-4 12-27 12T25 74Z" fill="url(#${p}-body)" stroke="#3d867e" stroke-width="1.8"/><path d="M48 75h8" stroke="#265d62" stroke-width="3" stroke-linecap="round"/><circle cx="52" cy="68" r="3" fill="#ffd277"/><path d="M52 13v12" stroke="#a5eacf" stroke-width="3"/><circle class="byte-antenna" cx="52" cy="11" r="5" fill="#ffd277"/><path d="M27 28q26-14 51 0l5 31q-2 12-31 12T21 59Z" fill="url(#${p}-body)" stroke="#4b9a90" stroke-width="1.8"/><path d="M28 28q23-11 47 0" stroke="#eefff8" stroke-width="3" stroke-linecap="round"/><rect x="27" y="35" width="50" height="29" rx="12" fill="url(#${p}-visor)" stroke="#356c7b" stroke-width="1.5"/><path d="M33 40h35" stroke="#c9eeff" opacity=".13" stroke-width="3" stroke-linecap="round"/><g class="art-blink byte-eyes" style="transform-origin:52px 52px">${eyes}</g><circle cx="24" cy="48" r="4" fill="#a7f3d9"/><circle cx="80" cy="48" r="4" fill="#5cb5a2"/></g>${mode==='happy'?`<g class="byte-sparkles">${star(14,20,5)}${star(88,25,4,P.cyan)}${star(83,87,3,P.mint)}</g>`:''}</svg>`;
  }
  function world(completed={},activeId='variables') {
    const p=uid('world'),done=id=>!!completed[id],active=String(activeId);
    const route='M170 680C171 611 420 634 420 545S170 493 170 405 420 354 420 270 230 211 230 120';
    const stars=Array.from({length:32},(_,i)=>{const x=27+(i*173)%547,y=32+(i*127)%759,s=i%5===0?2.4:1.2;return`<circle class="world-star" cx="${x}" cy="${y}" r="${s}" fill="${i%3===0?'#a994ff':'#a9d9ed'}" opacity="${.2+(i%4)*.13}" style="animation-delay:${(i%9)*-.7}s"/>`;}).join('');
    return `<svg class="quest-world-art" viewBox="0 0 600 830" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${defs(p)}<rect width="600" height="830" rx="40" fill="url(#${p}-sky)"/><ellipse cx="250" cy="130" rx="180" ry="135" fill="url(#${p}-halo)" opacity=".33"/><ellipse cx="415" cy="525" rx="170" ry="230" fill="#605cb0" opacity=".035"/>${stars}
      <g class="world-cloud cloud-one" opacity=".12"><path d="M380 87c-26-20-56-11-60 8-30-6-47 7-41 18h143c9-14-10-30-42-26Z" fill="#94b9dc"/></g>
      <g class="world-cloud cloud-two" opacity=".1"><path d="M86 314c-22-14-44-8-49 7-26-5-37 9-31 19h124c7-16-12-29-44-26Z" fill="#94b9dc"/></g>
      <g class="world-cloud cloud-three" opacity=".12"><path d="M485 711c-24-18-49-10-52 8-26-6-42 8-38 18h140c5-15-19-30-50-26Z" fill="#94b9dc"/></g>
      <path class="world-river" d="M587 57C427 153 522 339 333 390S95 587 24 791" fill="none" stroke="#38537a" stroke-width="38" opacity=".11"/>
      <path class="world-water" d="M587 57C427 153 522 339 333 390S95 587 24 791" fill="none" stroke="#517a9e" stroke-width="2" stroke-dasharray="3 22" opacity=".2"/>
      <path d="${route}" fill="none" stroke="#070e28" stroke-width="20" opacity=".26"/>
      <path class="world-route" d="${route}" fill="none" stroke="#3b527b" stroke-width="12"/>
      <path class="route-flow" d="${route}" fill="none" stroke="#8fb9cb" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 12" opacity=".65"/>
      ${done('variables')?'<path d="M170 680C171 611 420 634 420 545" fill="none" stroke="#72ebbb" stroke-width="4" stroke-opacity=".75"/>':''}
      ${done('autobuses')?'<path d="M420 545C420 456 170 493 170 405" fill="none" stroke="#72ebbb" stroke-width="4" stroke-opacity=".75"/>':''}
      ${done('esperas')?'<path d="M170 405C170 317 420 354 420 270" fill="none" stroke="#72ebbb" stroke-width="4" stroke-opacity=".75"/>':''}
      ${done('graficos')?'<path d="M420 270C420 186 230 211 230 120" fill="none" stroke="#72ebbb" stroke-width="4" stroke-opacity=".75"/>':''}
      <g transform="translate(80 155)">${codeShip(p)}</g>
      <g opacity=".6">${star(342,74,6,P.gold)}${star(93,472,4,P.cyan)}${star(480,379,5,P.lilac)}${star(282,736,7,P.mint)}</g>
      ${platform(p,'auditoria',230,120,done('auditoria'),active==='auditoria',`<g transform="translate(0 3) scale(.82)">${headquarters(p,done('auditoria'))}</g>`)}
      ${platform(p,'graficos',420,270,done('graficos'),active==='graficos',observatory(p,done('graficos')))}
      ${platform(p,'esperas',170,405,done('esperas'),active==='esperas',tower(p,done('esperas')))}
      ${platform(p,'autobuses',420,545,done('autobuses'),active==='autobuses',bus(p,done('autobuses')))}
      ${platform(p,'variables',170,680,done('variables'),active==='variables',archive(p,done('variables')))}
      <g transform="translate(360 725)"><g class="world-crystal art-float"><path d="m0-20-11 18 11 19 11-19Z" fill="#7bdfff"/><path d="M0-20v37L11-2Z" fill="#4b83bf"/><ellipse cy="24" rx="17" ry="5" fill="#7bdfff" opacity=".1"/></g></g>
      <g transform="translate(81 583)"><g class="world-crystal art-float"><path d="m0-13-7 12 7 12 7-12Z" fill="#a994ff"/><path d="M0-13v24L7-1Z" fill="#6a58a8"/></g></g>
      <path d="M214 779h172" stroke="url(#${p}-trail)" stroke-width="2"/><circle cx="300" cy="779" r="4" fill="#72ebbb" opacity=".7"/>
    </svg>`;
  }
  function missionScene(id,phase='idle') {
    const p=uid('scene-'+String(id).replace(/[^a-z]/gi,'')),solved=phase==='solved'||phase==='success',m=['variables','autobuses','esperas','graficos','auditoria','codigo'].includes(id)?id:'variables';
    const accent={variables:P.mint,autobuses:P.gold,esperas:P.lilac,graficos:P.cyan,auditoria:P.rose,codigo:P.lilac}[m];
    const silhouettes=`<path d="M0 146V107h24V85h22v61h21v-43h21v43h32V93h33v53h23V65h30v81h34V94h23v52h32v-77h30v77h31V98h40v48h25V82h32v64h32V97h22v49h28V61h32v85h22V89h45v57h25v-35h38v35Z" fill="#101a36" opacity=".6"/>`;
    let art='';
    if(m==='variables')art=`<g transform="translate(161 136) scale(.8)">${archive(p,solved)}</g><g class="scene-conveyor"><path d="M271 122h205" stroke="#324c70" stroke-width="12" stroke-linecap="round"/><path class="route-flow" d="M271 122h205" stroke="#7ab3b9" stroke-width="2" stroke-dasharray="4 9"/><g class="art-card" transform="translate(295 76) rotate(-9)"><rect width="34" height="41" rx="6" fill="#c9b6ff"/><path d="M7 12h20m-20 8h14m-14 8h18" stroke="#6a5d9a" stroke-width="3"/></g><g class="art-card" transform="translate(354 65) rotate(8)"><rect width="36" height="46" rx="6" fill="#ffd277"/><path d="M8 14h20m-20 8h13m-13 8h17" stroke="#a27641" stroke-width="3"/></g><g class="art-card" transform="translate(418 83) rotate(-4)"><rect width="32" height="37" rx="6" fill="#72ebbb"/><path d="M7 12h18m-18 8h12m-12 8h16" stroke="#398678" stroke-width="3"/></g></g>`;
    if(m==='autobuses')art=`<g transform="translate(170 136) scale(.9)">${bus(p,solved)}</g><path d="M274 132h227" stroke="#33476b" stroke-width="19" stroke-linecap="round"/><path class="route-flow" d="M274 132h227" stroke="#b0b8ce" stroke-width="2" stroke-dasharray="13 12"/><g class="scene-repair" transform="translate(358 85)"><circle r="35" fill="#233a59" stroke="#415d80" stroke-width="2"/><path d="m-16 14 17-17a12 12 0 0 0 14-17l-7 8-8-2-2-7a12 12 0 0 0-5 16l-17 17Z" fill="${solved?P.mint:'#ffd277'}"/><circle cx="-15" cy="13" r="3" fill="#41617b"/></g><g transform="translate(465 94)">${lamp(0,0,true)}</g>`;
    if(m==='esperas')art=`<g transform="translate(166 142) scale(.85)">${tower(p,solved)}</g><g class="scene-queue" transform="translate(290 109)">${[0,1,2,3].map(i=>`<g class="art-queue-person" transform="translate(${i*44} ${i%2*5})"><ellipse cy="28" rx="13" ry="4" fill="#0a1430" opacity=".4"/><circle cy="-5" r="9" fill="${['#ffcf94','#e4b5ce','#c4d2ef','#a9dacf'][i]}"/><path d="M-11 23V10a11 11 0 0 1 22 0v13Z" fill="${['#72ebbb','#a994ff','#7bdfff','#ffd277'][i]}"/><path d="M-5 23v8m10-8v8" stroke="#5b7495" stroke-width="4" stroke-linecap="round"/></g>`).join('')}</g><g class="scene-time-pulse" transform="translate(480 65)"><circle r="17" fill="#263a5b" stroke="#a994ff" stroke-width="2"/><path d="M0-10V0l6 5" stroke="#d2c5ff" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`;
    if(m==='graficos')art=`<g transform="translate(151 139) scale(.78)">${observatory(p,solved)}</g><g class="scene-chart" transform="translate(294 40)"><path d="M6 0h173l10 90H0Z" fill="#223958" stroke="#597ba0" stroke-width="2"/><path d="M17 12h151l7 64H12Z" fill="#142841"/><path d="M24 24v38h128" stroke="#4b7890" stroke-width="1.5"/><g class="chart-energy"><path d="M40 58V44m25 14V34m25 24V23m25 35V13m25 45V29" stroke="${solved?P.mint:'#7bdfff'}" stroke-width="10" stroke-linecap="round"/></g><path d="m79 92-4 17h32l-4-17" fill="#416183"/><path d="M62 109h58" stroke="#6f97b7" stroke-width="4" stroke-linecap="round"/></g>`;
    if(m==='auditoria')art=`<g transform="translate(147 145) scale(.82)">${headquarters(p,solved)}</g><g class="scene-report" transform="translate(309 39) rotate(5 66 50)"><rect x="0" y="0" width="137" height="101" rx="12" fill="#e7e8dc"/><path d="M18 23h66m-66 14h92m-92 16h50" stroke="#79969d" stroke-width="5" stroke-linecap="round"/><path d="M18 69h31v17H18Z" fill="#7acbb5"/><path d="M58 82V67m15 15V60m15 22V70" stroke="#a694d3" stroke-width="7"/><circle cx="112" cy="77" r="22" fill="${solved?P.mint:'#ffd277'}"/><path d="m102 77 7 7 15-17" fill="none" stroke="#46776f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    if(m==='codigo')art=`<g transform="translate(155 99) scale(1.5)">${codeShip(p)}</g><g class="scene-terminal" transform="translate(292 38)"><rect width="193" height="103" rx="13" fill="#263556" stroke="#7e73af" stroke-width="2"/><path d="M0 24h193" stroke="#7e73af" stroke-opacity=".5"/><circle cx="15" cy="13" r="3.5" fill="#ffa3b4"/><circle cx="29" cy="13" r="3.5" fill="#ffd277"/><circle cx="43" cy="13" r="3.5" fill="#72ebbb"/><path d="m23 48 10 7-10 7m20 0h43M24 79h96" stroke="${solved?P.mint:'#a994ff'}" stroke-width="4" stroke-linecap="round" fill="none"/><rect class="art-cursor" x="129" y="72" width="8" height="12" rx="2" fill="#72ebbb"/></g>`;
    return `<svg class="mission-scene scene-${m} ${solved?'scene-solved':''}" viewBox="0 0 660 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${defs(p)}<rect width="660" height="180" rx="24" fill="#17213e"/><ellipse cx="350" cy="100" rx="235" ry="120" fill="${accent}" opacity=".045"/>${silhouettes}<path d="M22 151h616" stroke="#2c4365" stroke-width="2"/><path class="scene-ground-lines" d="M32 163h60m60 0h21m238 0h36m78 0h95" stroke="#425b7b" stroke-width="2" stroke-linecap="round"/><g class="world-star">${star(65,49,4,P.gold)}${star(237,32,3,P.cyan)}${star(525,46,4,accent)}</g>${art}<g class="art-scanner" opacity=".14"><path d="M0 154H660" stroke="${accent}" stroke-width="2"/></g>${solved?`<g class="scene-win"><circle cx="571" cy="84" r="24" fill="#214b4b" stroke="#72ebbb" stroke-width="2"/><path d="m559 83 8 8 16-18" fill="none" stroke="#72ebbb" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`:`<g transform="translate(561 81)"><circle r="19" fill="#213856" stroke="#486283" stroke-width="1.5"/>${bolt(-6,-8,.95)}</g>`}</svg>`;
  }
  root.EDA_VISUALS = { mascot, missionScene, world };
})(typeof window !== 'undefined' ? window : globalThis);
