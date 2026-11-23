/* EDA Quest — gráficos construidos solo con la respuesta del jugador.
 * Este módulo no consulta soluciones ni decide si una respuesta es correcta.
 */
(function (root) {
  'use strict';
  let sequence = 0;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const bins = Object.freeze([
    {id:'bin0', from:0, to:10, label:'[0, 10)'},
    {id:'bin1', from:10, to:20, label:'[10, 20)'},
    {id:'bin2', from:20, to:30, label:'[20, 30)'},
    {id:'bin3', from:30, to:40, label:'[30, 40]'}
  ]);
  const sampleSize = 8;
  const maxAxis = 32;

  function entered(value) {
    const raw = value === null || value === undefined ? '' : String(value).trim();
    if (raw === '') return {raw, state:'blank', value:null};
    const decimal = raw.replace(',', '.');
    // A decimal/scientific number is accepted; hexadecimal and incidental text are not.
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(decimal)) return {raw, state:'invalid', value:null};
    const n = Number(decimal);
    if (!Number.isFinite(n) || n < 0) return {raw, state:'invalid', value:null};
    return {raw, state:Number.isInteger(n)?'number':'fraction', value:n};
  }

  function exact(n) { return String(n).replace('.', ','); }
  function compact(n) {
    const full = exact(n);
    if (full.length <= 9) return full;
    const short = n.toExponential(2).replace('.', ',');
    return Number(n.toExponential(2)) === n ? short : '≈' + short;
  }

  function histogram(c, a = {}) {
    if (!c || c.id !== 'graph-histograma' || !Array.isArray(c.fields) || !bins.every(bin => c.fields.some(field => field.id === bin.id))) return '';
    const values = a && typeof a.values === 'object' && a.values ? a.values : {};
    const rows = bins.map(bin => ({...bin, ...entered(values[bin.id])}));
    const numeric = rows.filter(row => row.value !== null);
    const blank = rows.filter(row => row.state === 'blank').length;
    const invalid = rows.filter(row => row.state === 'invalid').length;
    const fractional = rows.some(row => row.state === 'fraction');
    const clipped = rows.some(row => row.value > maxAxis);
    const maximum = Math.max(sampleSize, ...numeric.map(row => Math.min(row.value, maxAxis)));
    const yMax = maximum <= 8 ? 8 : maximum <= 16 ? 16 : maxAxis;
    const total = numeric.reduce((sum, row) => sum + row.value, 0);
    const totalText = Number.isFinite(total) ? compact(total) : 'Fuera de rango';
    const fullTotalText = Number.isFinite(total) ? exact(total) : 'El total supera el rango numérico';
    const id = 'live-histogram-' + (++sequence);
    const plot = {left:62, right:478, top:44, bottom:204};
    const height = plot.bottom - plot.top, width = (plot.right - plot.left) / bins.length;
    const y = frequency => plot.bottom - Math.min(frequency, yMax) / yMax * height;
    const descriptions = rows.map(row => `${row.label} minutos: ${row.state==='blank'?'sin completar':row.state==='invalid'?'entrada no válida '+row.raw:exact(row.value)+' visitas'+(row.state==='fraction'?', debe ser un recuento entero':'')}.`).join(' ');
    const notes = [];
    if (blank) notes.push(`${blank} ${blank===1?'intervalo pendiente':'intervalos pendientes'}; ? significa sin completar, no cero.`);
    if (invalid) notes.push('Las entradas no numéricas, negativas o fuera de rango no se dibujan ni se suman.');
    if (fractional) notes.push('Las frecuencias cuentan visitas: usa números enteros.');
    if (clipped) notes.push('Escala visual limitada a 32 visitas. Las barras con un corte superan ese límite; la etiqueta conserva el valor introducido.');
    if (!Number.isFinite(total)) notes.push('El total introducido es demasiado grande para calcularlo de forma finita.');
    if (Number.isFinite(total) && total > sampleSize) notes.push('El recuento introducido supera las 8 visitas de la muestra.');
    if (!blank && !invalid && !fractional && total === sampleSize) notes.push('El total suma 8; todavía debes comprobar cómo lo has repartido.');
    if (!notes.length) notes.push('Este dibujo representa tus respuestas. Comprueba los intervalos cuando termines.');

    const grid = Array.from({length:5}, (_, i) => {
      const frequency = yMax / 4 * i, top = y(frequency);
      return `<g class="histogram-grid-line"><line x1="${plot.left}" y1="${top}" x2="${plot.right}" y2="${top}" stroke="currentColor" opacity="${i===0?'.6':'.17'}"/><text x="${plot.left-11}" y="${top+4}" text-anchor="end" fill="currentColor">${frequency}</text></g>`;
    }).join('');
    const bars = rows.map((row, i) => {
      const x = plot.left + i * width, center = x + width / 2;
      if (row.value === null) {
        const label = row.state === 'blank' ? '?' : '!';
        return `<g class="histogram-bin ${row.state}" data-bin="${row.id}"><title>${escape(row.label+' minutos: '+(row.state==='blank'?'sin completar':'entrada no válida: '+row.raw))}</title><text class="histogram-pending" x="${center}" y="${plot.bottom-18}" text-anchor="middle" fill="currentColor" font-size="26" font-weight="700">${label}</text>${row.state==='invalid'?`<text x="${center}" y="${plot.bottom-3}" text-anchor="middle" fill="currentColor" font-size="14">Revisar</text>`:''}</g>`;
      }
      const top = y(row.value), barHeight = plot.bottom - top;
      const cut = row.value > yMax;
      return `<g class="histogram-bin ${row.state}${cut?' clipped':''}" data-bin="${row.id}"><title>${escape(row.label+' minutos: '+exact(row.value)+' visitas'+(cut?'. Barra recortada en '+yMax:'') )}</title><rect class="histogram-bar" x="${x}" y="${top}" width="${width}" height="${barHeight}" fill="var(--accent, #79ebbe)" fill-opacity="${i%2?'.68':'.9'}" stroke="var(--bg, #11152f)" stroke-width="1"/>${cut?`<path class="histogram-cut" d="M${x+4} ${top+10}l12-5 12 5 12-5 12 5 12-5 12 5 12-5 12 5" fill="none" stroke="var(--bg, #11152f)" stroke-width="3"/>`:''}<text class="histogram-value" x="${center}" y="${Math.max(22,top-9)}" text-anchor="middle" fill="currentColor" font-size="17" font-weight="750">${escape(compact(row.value))}</text></g>`;
    }).join('');
    const xTicks = [0,10,20,30,40].map((frequency, i) => `<g><line x1="${plot.left+i*width}" y1="${plot.bottom}" x2="${plot.left+i*width}" y2="${plot.bottom+5}" stroke="currentColor"/><text x="${plot.left+i*width}" y="${plot.bottom+21}" text-anchor="middle" fill="currentColor">${frequency}</text></g>`).join('');
    const intervalLabels = rows.map((row, i) => `<text x="${plot.left+(i+.5)*width}" y="${plot.bottom+43}" text-anchor="middle" fill="currentColor" font-size="16">${escape(row.label)}</text>`).join('');
    return `<figure class="live-histogram"><div class="histogram-heading"><strong>Tu histograma</strong><span>Se dibuja con tus respuestas</span></div><svg class="histogram-svg" viewBox="0 0 520 290" role="img" aria-labelledby="${id}-title ${id}-desc" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;color:var(--ink, #e9efff);font-family:inherit;font-size:16px"><title id="${id}-title">Tu histograma en construcción</title><desc id="${id}-desc">Espera en minutos en el eje horizontal y frecuencia de visitas en el vertical. ${escape(descriptions)} Escala vertical de 0 a ${yMax}.${clipped?' Las barras que superan la escala llevan una marca de corte.':''}</desc>${grid}${bars}<path d="M${plot.left} ${plot.top}V${plot.bottom}H${plot.right}" fill="none" stroke="currentColor" stroke-width="1.5"/>${xTicks}${intervalLabels}<text x="${(plot.left+plot.right)/2}" y="279" text-anchor="middle" fill="currentColor" font-size="18">Espera (minutos)</text><text x="17" y="${(plot.top+plot.bottom)/2}" text-anchor="middle" transform="rotate(-90 17 ${(plot.top+plot.bottom)/2})" fill="currentColor" font-size="18">Frecuencia (visitas)</text></svg><figcaption class="histogram-summary" aria-live="polite"><strong title="${escape(fullTotalText)}">${escape(totalText)} / ${sampleSize} visitas introducidas</strong><span>${blank||invalid?'Recuento parcial de los valores numéricos no negativos.':'Recuento construido con tus frecuencias.'}</span></figcaption><p class="histogram-note">${notes.map(escape).join(' ')}</p></figure>`;
  }
  root.EDA_EXERCISE_VISUALS = Object.freeze({histogram});
})(typeof window !== 'undefined' ? window : globalThis);
