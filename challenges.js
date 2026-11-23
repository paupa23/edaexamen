/* EDA Quest — ejercicios construidos a partir del temario disponible en la conversación.
 * Sin red, DOM, evaluación de código ni bibliotecas externas.
 * Los datos nuevos se identifican como variantes de práctica.
 */
(function (root) {
  'use strict';

  const missions = [
    { id: 'variables', title: 'El archivo de las variables', shortTitle: 'Ordena el archivo', icon: 'compass', color: 'mint', description: 'Clasifica las evidencias y descubre qué representa cada dato.', briefing: ['Cada fila representa una observación. Un identificador numérico sigue siendo una etiqueta.', 'Discreta = recuento; continua = medida. Nominal = categorías sin orden; ordinal = categorías ordenadas.'], repair: 'El archivo vuelve a clasificar los registros correctamente.', extra: false },
    { id: 'autobuses', title: 'El taller de autobuses', shortTitle: 'Repara el registro', icon: 'bus', color: 'amber', description: 'Arregla celdas, conserva los ceros y elimina solo copias confirmadas.', briefing: ['Cero, dato ausente y error significan cosas distintas. Un dato ausente no invalida toda la fila.', 'Recuperar un valor de una fuente no es imputar. Una imputación es una estimación y debe marcarse.'], repair: 'El registro de viajes está limpio y conserva sus evidencias.', extra: false },
    { id: 'esperas', title: 'La torre de las esperas', shortTitle: 'Recupera los tiempos', icon: 'clock', color: 'violet', description: 'Ordena las esperas, calcula sus medidas y reconstruye el boxplot.', briefing: ['Ordena antes de calcular la mediana. Con ocho datos se promedian el cuarto y el quinto.', 'Aquí calculamos Q1 y Q3 como medianas de las mitades. El bigote termina en un dato observado, no en el límite teórico.'], repair: 'La torre vuelve a mostrar medidas e intervalos correctos.', extra: false },
    { id: 'graficos', title: 'El observatorio de datos', shortTitle: 'Construye la evidencia', icon: 'chart', color: 'blue', description: 'Conecta preguntas con gráficos y completa un histograma.', briefing: ['Barras para categorías; histograma para la distribución de una variable numérica; dispersión para dos variables numéricas.', 'Una relación observada no demuestra causalidad. La conclusión tiene que respetar el alcance de la muestra.'], repair: 'El observatorio muestra gráficos que responden a las preguntas.', extra: false },
    { id: 'auditoria', title: 'La gran auditoría', shortTitle: 'Firma el informe', icon: 'shield', color: 'rose', description: 'Combina limpieza, cálculos y criterio en un caso nuevo.', briefing: ['Este es un caso de práctica nuevo: aplica las reglas, sin memorizar los números del caso anterior.', 'Comprueba calidad, calcula, interpreta y explica hasta dónde llegan los datos.'], repair: 'El informe de la ciudad tiene datos y conclusiones defendibles.', extra: false },
    { id: 'codigo', title: 'El taller de código', shortTitle: 'POO y Regex', icon: 'code', color: 'violet', description: 'Un distrito extra para clases, métodos y expresiones regulares.', briefing: ['Un método que solo hace print devuelve None. Los atributos de instancia pertenecen a cada objeto.', 'En estos retos, los patrones de letras y dígitos son ASCII. fullmatch exige que coincida toda la cadena.'], repair: 'El taller interpreta objetos y valida códigos sin confundirlos.', extra: true }
  ];

  function hashSeed(input) {
    const str = String(input === undefined ? 1 : input);
    let n = 2166136261;
    for (let i = 0; i < str.length; i++) { n ^= str.charCodeAt(i); n = Math.imul(n, 16777619); }
    return n >>> 0;
  }
  function rngFor(seed) {
    let a = hashSeed(seed);
    return function () { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function shuffle(values, rng) {
    const copy = values.slice();
    for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = copy[i]; copy[i] = copy[j]; copy[j] = t; }
    return copy;
  }
  const opt = (value, label) => ({ value: value, label: label });
  const opts = function () { return Array.from(arguments).map(pair => opt(pair[0], pair[1])); };
  const num = (id, label, answer, explanation, unit, tolerance) => ({ id, label, kind: 'number', answer, explanation, unit: unit || '', tolerance: tolerance === undefined ? 0.001 : tolerance });
  const select = (id, label, answer, options, explanation) => ({ id, label, kind: 'select', answer, options, explanation });
  function challenge(id, type, title, prompt, hint, explanation, data) {
    return Object.assign({ id, type, title, prompt, hint, explanation, source: 'Caso trabajado' }, data || {});
  }
  const fmt = n => String(n).replace('.', ',');
  const WAIT = [4, 6, 6, 8, 10, 12, 14, 36];
  function median(values) { const x = values.slice().sort((a, b) => a - b); return x.length % 2 ? x[(x.length - 1) / 2] : (x[x.length / 2 - 1] + x[x.length / 2]) / 2; }
  function stats(values) {
    const x = values.slice().sort((a, b) => a - b), mid = Math.floor(x.length / 2);
    const q1 = median(x.slice(0, mid)), q3 = median(x.slice(Math.ceil(x.length / 2))), iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
    const nonOutliers = x.filter(v => v >= lo && v <= hi);
    return { mean: x.reduce((a, b) => a + b, 0) / x.length, median: median(x), q1, q3, iqr, lo, hi, lowWhisker: nonOutliers[0], highWhisker: nonOutliers[nonOutliers.length - 1] };
  }
  function orderedItems(values, prefix, suffix) { return values.map((value, i) => ({ id: prefix + i, label: fmt(value) + (suffix || ''), value })); }
  function boxTask(id, title, values, source) {
    const s = stats(values);
    return challenge(id, 'box', title,
      'Coloca cada etiqueta en su valor. Datos: ' + values.map(fmt).join(', ') + ' minutos. Usa medianas de las dos mitades para Q1 y Q3.',
      'Ordena los datos. IQR = Q3 − Q1. Límite superior = Q3 + 1,5 × IQR. El bigote acaba en el mayor dato que no supera ese límite.',
      'La caja va de Q1=' + fmt(s.q1) + ' a Q3=' + fmt(s.q3) + ', con mediana ' + fmt(s.median) + '. El límite superior es ' + fmt(s.hi) + ', mientras que el bigote superior termina en ' + fmt(s.highWhisker) + '.',
      { source, data: values.slice(), axis: { min: 0, max: Math.max(40, Math.ceil((Math.max.apply(null, values) + 2) / 10) * 10), step: 0.5 }, labels: [
        { id: 'q1', label: 'Q1', value: s.q1 },
        { id: 'mediana', label: 'Mediana', value: s.median },
        { id: 'q3', label: 'Q3', value: s.q3 },
        { id: 'bigote', label: 'Bigote superior', value: s.highWhisker },
        { id: 'limite', label: 'Límite superior', value: s.hi }
      ] });
  }

  function variables(rng) {
    const counts = [[6, 9, 5], [4, 3, 3], [8, 7, 5], [9, 12, 9]][Math.floor(rng() * 4)];
    const total = counts.reduce((a, b) => a + b, 0), percent = counts[0] / total * 100;
    return [
      challenge('var-clasifica', 'sort', 'Cada dato en su carpeta', 'Asigna cada variable a su tipo. Fíjate en qué significa, no solo en cómo está escrita.', 'Un código puede contener números y seguir siendo una etiqueta.', 'Pasajeros es un recuento; duración es una medida. Línea y código de viaje son etiquetas. Ocupación baja/media/alta tiene orden.', {
        categories: [{ id: 'discreta', label: 'Numérica discreta' }, { id: 'continua', label: 'Numérica continua' }, { id: 'nominal', label: 'Categórica nominal' }, { id: 'ordinal', label: 'Categórica ordinal' }],
        items: [
          { id: 'pasajeros', label: 'Número de pasajeros', correct: 'discreta', explanation: 'Se cuenta en valores enteros.' },
          { id: 'duracion', label: 'Duración: 18,5 minutos', correct: 'continua', explanation: 'Una duración admite valores intermedios.' },
          { id: 'linea', label: 'Línea A o B', correct: 'nominal', explanation: 'A y B son categorías sin orden natural.' },
          { id: 'ocupacion', label: 'Ocupación baja / media / alta', correct: 'ordinal', explanation: 'Las categorías tienen un orden natural.' },
          { id: 'codigo', label: 'Código de viaje: 106', correct: 'nominal', explanation: '106 identifica el viaje; no mide una cantidad.' }
        ]
      }),
      challenge('var-unidad', 'match', 'Reconstruye la ficha del estudio', 'Conecta cada descripción con el concepto que representa.', 'Pregunta primero qué representa una fila y qué conjunto quieres estudiar.', 'La unidad es un viaje; la población es el conjunto de interés y la muestra es la parte observada.', {
        pairs: [
          { id: 'fila', left: 'Cada fila representa un viaje', right: 'Unidad de observación', explanation: 'La unidad de observación es el elemento que ocupa cada fila.' },
          { id: 'todo', left: 'Todos los viajes del mes que queremos estudiar', right: 'Población', explanation: 'La población es el conjunto completo de interés.' },
          { id: 'parte', left: 'Los viajes del lunes que se registraron', right: 'Muestra', explanation: 'La muestra es la parte de la población con datos disponibles.' },
          { id: 'id', left: 'V106 distingue un viaje concreto', right: 'Identificador', explanation: 'Un identificador permite distinguir registros.' }
        ]
      }),
      challenge('var-frecuencia', 'fields', 'Repara el contador de viajes', 'Completa el recuento total y la frecuencia de la línea A. Escribe el porcentaje sin el símbolo %.', 'Frecuencia relativa (%) = recuento de A ÷ total × 100.', 'La frecuencia absoluta cuenta observaciones; la relativa compara ese recuento con el total.', {
        source: 'Variante de práctica',
        data: { headers: ['Línea', 'Viajes registrados'], rows: [['A', String(counts[0])], ['B', String(counts[1])], ['C', String(counts[2])]] },
        fields: [num('total', 'Total de viajes', total, counts.map(String).join(' + ') + ' = ' + total, 'viajes'), num('absoluta', 'Frecuencia absoluta de A', counts[0], 'Es el número de viajes de A, sin dividir.', 'viajes'), num('relativa', 'Frecuencia relativa de A', percent, counts[0] + ' ÷ ' + total + ' × 100 = ' + fmt(percent) + ' %.', '%')]
      }),
      challenge('var-ordinal', 'order', 'Restaura el orden de ocupación', 'Coloca las categorías desde la menor ocupación hasta la mayor.', 'Las categorías ordinales tienen un orden con significado; no es el orden alfabético.', 'Baja → media → alta → muy alta. El orden no indica que las distancias entre categorías sean iguales.', {
        source: 'Variante de práctica', ascending: true, items: [
          { id: 'baja', label: 'Baja', value: 1 }, { id: 'media', label: 'Media', value: 2 }, { id: 'alta', label: 'Alta', value: 3 }, { id: 'muy-alta', label: 'Muy alta', value: 4 }
        ]
      }),
      challenge('var-inicio', 'pick', 'Prepara la exploración', 'Selecciona todas las acciones justificadas antes de comparar las líneas.', 'EDA empieza por entender las filas y la calidad de los datos.', 'Revisar ausencias, comprobar duplicados e identificar la unidad de observación son pasos de EDA. No hay que convertir ausencias en cero ni borrar extremos sin revisar.', {
        options: ['Revisar los valores ausentes.', 'Comprobar si hay registros duplicados.', 'Borrar todos los valores extremos.', 'Identificar qué representa cada fila.', 'Convertir cualquier NULL en cero.'], correct: [0, 1, 3]
      })
    ];
  }

  function autobuses() {
    return [
      challenge('bus-repara', 'fields', 'Repara cuatro celdas', 'Completa la versión limpia. Los viajes vacíos son válidos y el parte confirma que V104 duró 23 minutos.', 'Quita espacios de la categoría. Conserva los ceros conocidos. Si no recuperas un dato imposible, déjalo ausente.', 'Se normaliza el formato, se conserva el cero, se marca la duración imposible como ausente y se recupera 23 de la fuente.', {
        data: { headers: ['Registro', 'Campo', 'Valor original'], rows: [['V102', 'Línea', '" A "'], ['V102', 'Pasajeros', '0'], ['V103', 'Duración', '−8 min (sin valor recuperable)'], ['V104', 'Duración', 'Vacía; parte verificado: 23 min']] },
        fields: [
          { id: 'linea', label: 'Línea limpia de V102', kind: 'text', answer: 'A', explanation: 'Elimina los espacios: la categoría es A.' },
          num('pasajeros', 'Pasajeros de V102', 0, 'El cero registra un viaje vacío real.', 'pasajeros'),
          select('duracion103', 'Duración de V103', 'null', opts(['null', 'Ausente (NULL)'], ['cero', '0 minutos'], ['menos8', '−8 minutos']), '−8 es imposible. Sin recuperación, la duración queda ausente; se conservan los otros campos.'),
          num('duracion104', 'Duración de V104 recuperada del parte', 23, '23 es un dato comprobado de la fuente, no una imputación.', 'min')
        ]
      }),
      challenge('bus-diagnostico', 'sort', 'Marca qué le pasa a cada dato', 'Clasifica cada incidencia para elegir el tratamiento adecuado.', 'Un valor extraño no siempre es un error. La espera o duración extrema puede ser real.', 'Cada tipo de incidencia exige una decisión diferente; no se resuelve borrando todas las filas.', {
        categories: [{ id: 'valido', label: 'Válido' }, { id: 'ausente', label: 'Ausente' }, { id: 'error', label: 'Error' }, { id: 'formato', label: 'Formato' }, { id: 'duplicado', label: 'Duplicado' }],
        items: [
          { id: 'cero', label: '0 pasajeros; se permiten viajes vacíos', correct: 'valido', explanation: 'Cero es una cantidad conocida y posible.' },
          { id: 'nulo', label: 'Pasajeros NULL', correct: 'ausente', explanation: 'No se conoce el número de pasajeros.' },
          { id: 'negativo', label: 'Duración −8 minutos', correct: 'error', explanation: 'Una duración negativa contradice el contexto.' },
          { id: 'espacios', label: 'Línea " A "', correct: 'formato', explanation: 'Los espacios no crean una categoría nueva.' },
          { id: 'copia', label: 'Segunda fila V106: copia confirmada del mismo viaje', correct: 'duplicado', explanation: 'Se ha verificado que representa la misma observación.' },
          { id: 'extremo', label: 'Duración 52 minutos verificada', correct: 'valido', explanation: 'Un valor extremo puede ser real y debe conservarse.' }
        ]
      }),
      challenge('bus-duplicados', 'fields', 'Retira una copia, conserva los viajes', 'Hay dos filas V106 idénticas y se confirma que son una copia del mismo viaje. B12 aparece también en otros viajes distintos.', 'La unidad de observación es el viaje, no el autobús.', 'De V106 se conserva una fila. Que B12 aparezca varias veces no convierte sus viajes diferentes en duplicados.', {
        fields: [
          num('copias', 'Filas V106 que deben quedar', 1, 'Dos copias del mismo viaje deben quedar en una única observación.', 'fila'),
          select('b12', 'Otros viajes distintos de B12', 'conservar', opts(['conservar', 'Conservarlos'], ['eliminar', 'Eliminarlos por repetir autobús'], ['fusionar', 'Fusionarlos en un único viaje']), 'Un autobús puede realizar varios viajes válidos.'),
          select('unidad', 'Identificador que distingue aquí cada observación', 'viaje', opts(['viaje', 'Identificador del viaje'], ['bus', 'Identificador del autobús'], ['linea', 'Línea']), 'La fila representa un viaje; por eso se comprueba su identidad.')
        ]
      }),
      challenge('bus-trazabilidad', 'match', 'Conserva el rastro de cada cambio', 'Relaciona la acción con la etiqueta que debería quedar en el registro de cambios.', 'Una fuente comprobada y una estimación no tienen la misma procedencia.', 'La limpieza debe dejar claro qué datos fueron verificados, estimados o conservados como desconocidos.', {
        pairs: [
          { id: 'fuente', left: 'La central confirma V104 = 23 minutos', right: 'Recuperación de una fuente', explanation: 'Se recupera un valor observado y comprobado.' },
          { id: 'estimacion', left: 'Se rellena V103 con la mediana de la línea', right: 'Imputación numérica marcada', explanation: 'La mediana aporta una estimación, no recupera el dato original.' },
          { id: 'categoria', left: 'Se estima el servicio con la categoría más frecuente', right: 'Imputación con la moda', explanation: 'La moda es una medida adecuada para una categoría nominal.' },
          { id: 'desconocido', left: 'Pasajeros de V105 siguen sin conocerse', right: 'Ausencia conservada', explanation: 'No se transforma un desconocido en cero.' }
        ]
      }),
      challenge('bus-imputa', 'fields', 'Completa la copia de análisis', 'Para imputar, la línea B tiene duraciones válidas 20, 23 y 52. Hay dos servicios Ordinario y uno Refuerzo. Indica los valores y el criterio; las imputaciones quedarán marcadas como estimadas.', 'Ordena para la mediana; suma y divide para la media. La moda es la categoría más frecuente.', 'La media sube por 52. La mediana 23 es menos sensible. Para servicio nominal se usa la moda Ordinario.', {
        fields: [
          num('media', 'Media de las tres duraciones (1 decimal)', 31.7, '(20 + 23 + 52) ÷ 3 = 31,666…; a un decimal, 31,7.', 'min', 0.001),
          num('mediana', 'Duración que imputarías usando la mediana', 23, 'La mediana de 20, 23 y 52 es 23.', 'min'),
          select('criterio', 'Motivo para elegir la mediana', 'robusta', opts(['robusta', 'Es menos sensible al 52'], ['igual', 'Siempre coincide con la media'], ['borra', 'Permite borrar el 52 real']), 'Se conserva el 52 real y se usa una medida menos sensible para estimar.'),
          select('servicio', 'Tipo de servicio estimado por la moda', 'ordinario', opts(['ordinario', 'Ordinario'], ['refuerzo', 'Refuerzo'], ['promedio', 'Promedio entre categorías']), 'Ordinario aparece dos veces frente a una de Refuerzo.')
        ]
      })
    ];
  }

  function esperas(rng) {
    const offset = 1 + Math.floor(rng() * 6), variant = WAIT.map(v => v + offset), s = stats(variant);
    return [
      challenge('wait-ordena', 'order', 'Reconstruye la cola de esperas', 'Toca las esperas para colocarlas de menor a mayor. Hay dos observaciones de 6 minutos: ambas cuentan.', 'No elimines valores repetidos: dos personas pueden haber esperado lo mismo.', 'El orden es 4, 6, 6, 8, 10, 12, 14, 36. Los dos valores centrales son 8 y 10.', { ascending: true, items: orderedItems(WAIT, 'w', ' min') }),
      challenge('wait-centro', 'fields', 'Enciende el panel de estadística', 'Completa las medidas de las ocho esperas: 4, 6, 6, 8, 10, 12, 14 y 36 minutos.', 'Suma 96 y divide entre ocho. Para la mediana, promedia el cuarto y el quinto valor.', 'Media 12, mediana 9 y moda 6. La espera de 36 es real y eleva la media.', {
        fields: [num('n', 'Número de observaciones', 8, 'Hay ocho visitas registradas.', 'visitas'), num('media', 'Media', 12, '96 ÷ 8 = 12 minutos.', 'min'), num('mediana', 'Mediana', 9, '(8 + 10) ÷ 2 = 9 minutos.', 'min'), num('moda', 'Moda', 6, 'El 6 aparece dos veces; los demás valores, una.', 'min')]
      }),
      challenge('wait-cuartiles', 'fields', 'Repara la regla de los atípicos', 'Con los cuartiles del caso, Q1 = 6 y Q3 = 13, calcula los dos valores que faltan.', 'IQR = Q3 − Q1. Límite superior = Q3 + 1,5 × IQR.', 'El IQR es 7. El límite superior es 23,5. Ese límite no es una observación ni indica dónde acaba necesariamente el bigote.', {
        fields: [num('iqr', 'Rango intercuartílico (IQR)', 7, '13 − 6 = 7 minutos.', 'min'), num('limite', 'Límite superior de atípicos', 23.5, '13 + 1,5 × 7 = 23,5 minutos.', 'min')]
      }),
      boxTask('wait-box', 'Reconstruye el boxplot', WAIT, 'Caso trabajado'),
      challenge('wait-transferencia', 'fields', 'Una cola nueva, las mismas reglas', 'Esta variante añade ' + offset + ' minutos a cada espera: ' + variant.map(fmt).join(', ') + '. Completa el panel. Q1 y Q3 se calculan como medianas de las mitades.', 'Al sumar la misma cantidad a todos los datos, media y mediana aumentan esa cantidad; la distancia entre Q1 y Q3 no cambia.', 'El centro se desplaza ' + offset + ' minutos. El IQR sigue siendo 7 porque ambas fronteras se desplazan por igual.', {
        source: 'Variante de práctica', fields: [num('media', 'Media de la nueva cola', s.mean, 'La media es 12 + ' + offset + ' = ' + fmt(s.mean) + '.', 'min'), num('mediana', 'Mediana de la nueva cola', s.median, 'Los dos valores centrales dan ' + fmt(s.median) + '.', 'min'), num('iqr', 'IQR de la nueva cola', s.iqr, fmt(s.q3) + ' − ' + fmt(s.q1) + ' = 7.', 'min'), num('bigote', 'Bigote superior', s.highWhisker, fmt(s.highWhisker) + ' es el mayor valor que no supera el límite ' + fmt(s.hi) + '.', 'min')]
      })
    ];
  }

  function graficos() {
    return [
      challenge('graph-preguntas', 'match', 'Conecta cada pregunta con su gráfico', 'Elige el gráfico que mejor responde a cada objetivo de análisis.', 'Piensa si comparas categorías, una distribución, dos variables o una tabla de recuentos.', 'La elección depende de la pregunta y de los tipos de variables, no de qué gráfico parece más vistoso.', {
        pairs: [
          { id: 'barras', left: '¿Cuántos viajes hay en cada línea?', right: 'Barras', explanation: 'Compara los recuentos de categorías.' },
          { id: 'histograma', left: '¿Cómo se distribuyen los minutos de espera?', right: 'Histograma', explanation: 'Agrupa una variable numérica en intervalos.' },
          { id: 'dispersion', left: '¿Cómo varían juntas personas por delante y espera?', right: 'Dispersión', explanation: 'Cada punto contiene dos variables numéricas de una visita.' },
          { id: 'boxplot', left: '¿Cómo comparar mediana, dispersión y atípicos por turno?', right: 'Boxplot', explanation: 'Resume el centro, los cuartiles, los bigotes y posibles atípicos.' },
          { id: 'calor', left: '¿Qué celdas destacan en una tabla de línea por franja?', right: 'Mapa de calor', explanation: 'Los tonos representan los valores de una tabla con una leyenda.' }
        ]
      }),
      challenge('graph-ejes', 'fields', 'Configura el diagrama de dispersión', 'Queremos estudiar si la espera se relaciona con las personas que había por delante al llegar. Usa personas por delante en X y espera en Y, con una visita por punto.', 'Coloca personas por delante en X y minutos de espera en Y. El punto representa la misma fila en ambos ejes.', 'En este planteamiento X = personas por delante, Y = espera; cada punto representa una visita.', {
        fields: [
          select('x', 'Eje horizontal (X)', 'personas', opts(['personas', 'Personas por delante'], ['espera', 'Minutos de espera'], ['turno', 'Turno']), 'El eje X representa el número de personas por delante.'),
          select('y', 'Eje vertical (Y)', 'espera', opts(['personas', 'Personas por delante'], ['espera', 'Minutos de espera'], ['turno', 'Turno']), 'El eje Y representa los minutos de espera.'),
          select('punto', 'Cada punto representa…', 'visita', opts(['visita', 'Una visita'], ['mes', 'Un mes'], ['turno', 'Un turno entero']), 'Las dos coordenadas corresponden a una misma visita.')
        ]
      }),
      challenge('graph-barras-histo', 'sort', 'Separa categorías e intervalos', 'Distribuye los objetivos entre barras e histograma.', 'Los números pueden ser etiquetas. Un histograma agrupa medidas o recuentos numéricos por intervalos.', 'Las barras comparan categorías; el histograma representa una distribución numérica por intervalos.', {
        source: 'Variante de práctica', categories: [{ id: 'barras', label: 'Barras' }, { id: 'histograma', label: 'Histograma' }], items: [
          { id: 'lineas', label: 'Recuento de viajes en líneas A, B y C', correct: 'barras', explanation: 'A, B y C son categorías.' },
          { id: 'tiempo', label: 'Reparto de esperas en intervalos de 10 minutos', correct: 'histograma', explanation: 'Se agrupa la variable numérica espera.' },
          { id: 'tipo', label: 'Número de servicios Ordinario y Refuerzo', correct: 'barras', explanation: 'Los tipos de servicio son categorías.' },
          { id: 'duracion', label: 'Distribución de duración de los viajes', correct: 'histograma', explanation: 'La duración es una variable numérica.' },
          { id: 'codigos', label: 'Viajes por línea codificada como 1, 2 o 3', correct: 'barras', explanation: 'Los códigos 1, 2 y 3 representan categorías, no intervalos de cantidad.' }
        ]
      }),
      challenge('graph-histograma', 'fields', 'Construye las barras del histograma', 'Cuenta las esperas 4, 6, 6, 8, 10, 12, 14 y 36 en cada intervalo. [a, b) incluye a y excluye b; el último intervalo incluye también 40.', 'El 10 pertenece al intervalo de 10 a menos de 20. La suma de frecuencias debe ser ocho.', 'Las frecuencias son 4, 3, 0 y 1. Los intervalos evitan contar un dato dos veces.', {
        fields: [num('bin0', '[0, 10) minutos', 4, '4, 6, 6 y 8: cuatro visitas.', 'visitas'), num('bin1', '[10, 20) minutos', 3, '10, 12 y 14: tres visitas.', 'visitas'), num('bin2', '[20, 30) minutos', 0, 'No hay ninguna espera en este intervalo.', 'visitas'), num('bin3', '[30, 40] minutos', 1, '36: una visita.', 'visita')]
      }),
      challenge('graph-evidencia', 'pick', 'Publica solo conclusiones defendibles', 'Marca todas las frases que respetan estas evidencias: ocho visitas de un lunes; con cuatro personas delante hubo esperas de 14 y 36 minutos; el 36 está verificado.', 'Una muestra limitada no describe automáticamente todo el mes, y asociación no demuestra causalidad.', 'El mismo número de personas puede acompañarse de esperas diferentes. El 36 es real. Con esta muestra no se puede demostrar una relación causal ni generalizar a todo el mes.', {
        options: ['Con cuatro personas delante se observaron esperas distintas.', 'El 36 debe borrarse por ser alto.', 'Una relación en el gráfico demuestra causalidad.', 'El 36 puede ser un atípico válido.', 'Ocho visitas de un lunes describen necesariamente todo el mes.', 'La muestra tiene límites para generalizar.'], correct: [0, 3, 5]
      })
    ];
  }

  function auditoria(rng) {
    const shift = Math.floor(rng() * 6), values = [2, 4, 4, 6, 8, 10, 12, 30].map(v => v + shift), s = stats(values);
    const intro = 'Caso nuevo de ocho visitas: ' + values.map(fmt).join(', ') + ' minutos. El valor máximo está verificado. ';
    return [
      challenge('audit-triaje', 'sort', 'Audita el registro entrante', 'Clasifica las incidencias de esta oficina nueva. Se permiten esperas de cero minutos y se ha comprobado la copia indicada.', 'No apliques la misma solución a cero, ausencia, error y duplicado.', 'Cero es válido; NULL es desconocido; −3 minutos es imposible; el espacio es formato y la copia verificada es duplicado.', {
        source: 'Variante de práctica', categories: [{ id: 'valido', label: 'Válido' }, { id: 'ausente', label: 'Ausente' }, { id: 'error', label: 'Error' }, { id: 'formato', label: 'Formato' }, { id: 'duplicado', label: 'Duplicado' }], items: [
          { id: 'cero', label: 'Espera de 0 minutos: atendido al llegar', correct: 'valido', explanation: 'Se conoce que no hubo espera.' },
          { id: 'ausente', label: 'Personas por delante: NULL', correct: 'ausente', explanation: 'El recuento no se registró.' },
          { id: 'error', label: 'Espera de −3 minutos', correct: 'error', explanation: 'Una espera no puede ser negativa en este registro.' },
          { id: 'formato', label: 'Turno "mañana " con espacio final', correct: 'formato', explanation: 'Se normaliza a mañana.' },
          { id: 'copia', label: 'Visita R07: segunda copia confirmada', correct: 'duplicado', explanation: 'Se conserva una observación de la visita.' }
        ]
      }),
      challenge('audit-orden', 'order', 'Ordena las evidencias nuevas', intro + 'Reconstruye el orden ascendente.', 'Los valores repetidos son dos observaciones, no necesariamente duplicados de registro.', 'Una vez ordenados, los valores centrales son ' + fmt(values[3]) + ' y ' + fmt(values[4]) + '.', { source: 'Variante de práctica', ascending: true, items: orderedItems(values, 'a', ' min') }),
      challenge('audit-calculos', 'fields', 'Calcula el panel de auditoría', intro + 'Calcula el centro y la dispersión. Q1 y Q3 son las medianas de las mitades.', 'Media = suma ÷ 8; mediana = promedio de los dos centrales. IQR = Q3 − Q1.', 'Media ' + fmt(s.mean) + ', mediana ' + fmt(s.median) + ', IQR ' + fmt(s.iqr) + '. El bigote superior termina en ' + fmt(s.highWhisker) + '.', {
        source: 'Variante de práctica', fields: [num('media', 'Media', s.mean, 'La suma dividida entre ocho es ' + fmt(s.mean) + '.', 'min'), num('mediana', 'Mediana', s.median, '(' + fmt(values[3]) + ' + ' + fmt(values[4]) + ') ÷ 2 = ' + fmt(s.median) + '.', 'min'), num('iqr', 'IQR', s.iqr, 'Q1=' + fmt(s.q1) + ', Q3=' + fmt(s.q3) + '; su diferencia es ' + fmt(s.iqr) + '.', 'min'), num('bigote', 'Bigote superior', s.highWhisker, 'El límite superior es ' + fmt(s.hi) + ' y el mayor dato que no lo supera es ' + fmt(s.highWhisker) + '.', 'min')]
      }),
      boxTask('audit-box', 'Reconstruye el gráfico del informe', values, 'Variante de práctica'),
      challenge('audit-procedencia', 'match', 'Recupera la trazabilidad', 'Une cada decisión del informe con su criterio.', 'Separa lo que sabes por la fuente, lo que estimas y lo que solo puedes describir.', 'Un informe útil distingue procedencia, calidad e interpretación de los datos.', {
        source: 'Variante de práctica', pairs: [
          { id: 'fuente', left: 'Se consultó el parte para recuperar un dato', right: 'Valor comprobado de la fuente', explanation: 'No es una estimación estadística.' },
          { id: 'estimacion', left: 'Se completó un ausente con una mediana', right: 'Imputación marcada como estimada', explanation: 'Se conserva el rastro de que el dato fue estimado.' },
          { id: 'copia', left: 'Dos filas representan la misma visita confirmada', right: 'Duplicado confirmado', explanation: 'Una sola fila representa esa observación.' },
          { id: 'asociacion', left: 'Dos variables tienden a variar juntas', right: 'Asociación sin causalidad demostrada', explanation: 'La relación observada no demuestra una causa.' },
          { id: 'muestra', left: 'Solo se observaron ocho visitas de un lunes', right: 'Alcance limitado de la muestra', explanation: 'No basta para describir automáticamente todo el mes.' }
        ]
      }),
      challenge('audit-informe', 'fields', 'Firma un informe defendible', intro + 'Completa las decisiones del informe con el criterio más adecuado.', 'El máximo es real. Una medida resistente al extremo ayuda a describir una espera habitual. No confundas muestra con población.', 'Se conserva el máximo verificado, se explica la mediana y se limita la conclusión a la evidencia disponible.', {
        source: 'Variante de práctica', fields: [
          select('extremo', 'Tratamiento del máximo verificado', 'conservar', opts(['conservar', 'Conservar y señalar su efecto'], ['borrar', 'Borrar por ser atípico'], ['cero', 'Sustituir por cero']), 'Un atípico real no se borra solo por ser extremo.'),
          select('centro', 'Espera habitual ante este extremo alto', 'mediana', opts(['media', 'Media: nunca cambia con extremos'], ['mediana', 'Mediana: menos sensible al extremo'], ['maximo', 'Máximo: representa a todas las visitas']), 'La mediana es menos sensible al valor extremo alto.'),
          select('causa', 'Una relación en el gráfico permite afirmar…', 'asociacion', opts(['asociacion', 'Asociación; no prueba causalidad'], ['causa', 'Causalidad demostrada'], ['nada', 'Que los datos son inválidos']), 'La correlación por sí sola no demuestra causalidad.'),
          select('alcance', 'Alcance de ocho visitas de un lunes', 'limitado', opts(['limitado', 'Describe esas visitas; generalización limitada'], ['mes', 'Representa necesariamente todo el mes'], ['todos', 'Representa cualquier oficina']), 'La muestra es pequeña y corresponde a un solo día.')
        ]
      })
    ];
  }

  function codigo() {
    return [
      challenge('code-objetos', 'match', 'Encuentra cada pieza del objeto', 'Relaciona las piezas de este ejemplo con su papel en programación orientada a objetos.', 'Clase = definición; instancia = objeto concreto; atributo = dato; método = comportamiento.', 'Cada objeto tiene su estado y utiliza los métodos definidos por su clase.', {
        source: 'Variante de práctica', pairs: [
          { id: 'clase', left: 'La definición Coche', right: 'Clase', explanation: 'Describe cómo son y qué pueden hacer sus objetos.' },
          { id: 'objeto', left: 'coche01 = Coche()', right: 'Instancia', explanation: 'coche01 referencia un objeto concreto.' },
          { id: 'atributo', left: 'self.velocidad', right: 'Atributo de instancia', explanation: 'Guarda el estado de ese objeto.' },
          { id: 'metodo', left: 'acelerar(self)', right: 'Método', explanation: 'Es una función definida en la clase que opera con la instancia.' }
        ]
      }),
      challenge('code-print', 'fields', 'Separa la salida del valor devuelto', 'Un método saludar hace únicamente print("Hola"). Después ejecutas resultado = objeto.saludar(). Completa lo que sucede.', 'print muestra texto. Si no hay return explícito, el valor devuelto es None.', 'La pantalla muestra Hola y resultado recibe None. Mostrar y devolver no son la misma acción.', {
        source: 'Variante de práctica', fields: [
          { id: 'pantalla', label: 'Texto mostrado en pantalla (sin comillas)', kind: 'text', answer: 'Hola', explanation: 'print("Hola") muestra Hola.' },
          select('resultado', 'Valor guardado en resultado', 'none', opts(['none', 'None'], ['hola', '"Hola"'], ['cero', '0']), 'El método no tiene return explícito, por eso devuelve None.'),
          select('cambio', 'Para devolver el texto y reutilizarlo…', 'return', opts(['return', 'Usar return "Hola"'], ['print', 'Añadir otro print("Hola")'], ['self', 'Cambiar solo el nombre self']), 'return proporciona el valor al código que llamó al método.')
        ]
      }),
      challenge('code-orden', 'order', 'Monta un objeto paso a paso', 'Ordena estas cinco líneas para definir Vehiculo, inicializar marca, crear una instancia y mostrarla. La sangría mostrada pertenece a cada línea.', 'Primero se define la clase y su inicializador; después se crea la instancia y se usa su atributo.', 'La definición guarda marca en self.marca. La instancia v se crea después y print(v.marca) muestra Luna.', {
        source: 'Variante de práctica', ascending: true, items: [
          { id: 'clase', label: 'class Vehiculo:', value: 1 },
          { id: 'init', label: '    def __init__(self, marca):', value: 2 },
          { id: 'asigna', label: '        self.marca = marca', value: 3 },
          { id: 'crea', label: 'v = Vehiculo("Luna")', value: 4 },
          { id: 'muestra', label: 'print(v.marca)', value: 5 }
        ]
      }),
      challenge('code-regex', 'fields', 'Repara el validador de códigos', 'Queremos validar una cadena completa formada por dos letras mayúsculas ASCII y tres dígitos ASCII. Completa la función y el patrón en Python.', 'fullmatch exige toda la cadena. [A-Z] y [0-9] expresan estos rangos ASCII.', 're.fullmatch(r"[A-Z]{2}[0-9]{3}", texto) valida ese formato completo. search podría encontrar un fragmento dentro de una cadena más larga.', {
        source: 'Variante de práctica', fields: [
          select('funcion', 'Función del módulo re', 'fullmatch', opts(['search', 'search'], ['fullmatch', 'fullmatch'], ['sub', 'sub']), 'fullmatch exige que toda la cadena cumpla el patrón.'),
          select('patron', 'Patrón (dentro de una cadena raw)', '[A-Z]{2}[0-9]{3}', opts(['[A-Z]{2}[0-9]{3}', '[A-Z]{2}[0-9]{3}'], ['[A-Z]{3}[0-9]{2}', '[A-Z]{3}[0-9]{2}'], ['[a-z]{2}[0-9]{3}', '[a-z]{2}[0-9]{3}']), 'Son dos mayúsculas ASCII seguidas de tres dígitos ASCII.'),
          select('cadena', '¿xxAB123 pasa la validación completa?', 'no', opts(['si', 'Sí'], ['no', 'No']), 'Tiene caracteres adicionales al principio; fullmatch no coincide.')
        ]
      }),
      challenge('code-valida', 'sort', 'Deja pasar solo códigos válidos', 'Clasifica las cadenas usando validación completa con [A-Z]{2}[0-9]{3}. Las letras y los dígitos del patrón son ASCII.', 'La cadena debe tener exactamente dos mayúsculas y tres dígitos del 0 al 9.', 'Se valida el formato completo. Minúsculas, caracteres extra y dígitos de otro rango no cumplen este patrón ASCII.', {
        source: 'Variante de práctica', categories: [{ id: 'si', label: 'Pasa' }, { id: 'no', label: 'No pasa' }], items: [
          { id: 'a', label: 'AA123', correct: 'si', explanation: 'Dos mayúsculas ASCII y tres dígitos ASCII.' },
          { id: 'b', label: 'AB012', correct: 'si', explanation: 'El cero inicial es válido para este código.' },
          { id: 'c', label: 'ab123', correct: 'no', explanation: 'Las letras son minúsculas.' },
          { id: 'd', label: 'ABC12', correct: 'no', explanation: 'Contiene tres letras y solo dos dígitos.' },
          { id: 'e', label: 'AA１２３', correct: 'no', explanation: '１２３ son dígitos de anchura completa, fuera de [0-9].' },
          { id: 'f', label: 'AA123x', correct: 'no', explanation: 'Contiene un carácter adicional al final.' }
        ]
      })
    ];
  }

  function makeMission(id, seed) {
    const rng = rngFor(id + ':' + String(seed === undefined ? 1 : seed));
    const builders = { variables, autobuses, esperas, graficos, auditoria, codigo };
    if (!Object.prototype.hasOwnProperty.call(builders, id)) throw new Error('Misión desconocida: ' + id);
    const result = builders[id](rng);
    result.forEach(ch => {
      if (ch.items) ch.items = shuffle(ch.items, rng);
      if (ch.type === 'order' && ch.items.every((item, i, items) => i === 0 || items[i - 1].value <= item.value)) ch.items.reverse();
      if (ch.type === 'match') ch.pairs = shuffle(ch.pairs, rng);
      if (ch.fields) ch.fields.forEach(field => { if (field.options) field.options = shuffle(field.options, rng); });
      if (ch.type === 'pick') {
        const indexed = ch.options.map((label, i) => ({ label, isCorrect: ch.correct.indexOf(i) !== -1 }));
        const mixed = shuffle(indexed, rng);
        ch.options = mixed.map(x => x.label);
        ch.correct = mixed.reduce((out, x, i) => { if (x.isCorrect) out.push(i); return out; }, []);
      }
    });
    return result;
  }

  function nonblank(value) { return value !== null && value !== undefined && String(value).trim() !== ''; }
  function numeric(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
    if (!nonblank(value)) return NaN;
    const text = String(value).trim();
    if (!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(text)) return NaN;
    return Number(text.replace(',', '.'));
  }
  function normalizeText(value) { return String(value).normalize('NFC').trim(); }
  function expectedField(field, value) {
    if (!nonblank(value)) return false;
    if (field.kind === 'number') { const parsed = numeric(value); return Number.isFinite(parsed) && Math.abs(parsed - field.answer) <= (field.tolerance === undefined ? 0.001 : field.tolerance); }
    const submitted = normalizeText(value);
    return (field.accepted || [field.answer]).some(expected => submitted === normalizeText(expected));
  }
  function solution(ch) {
    switch (ch.type) {
      case 'sort': return { assign: Object.fromEntries(ch.items.map(item => [item.id, item.correct])) };
      case 'order': return { order: ch.items.slice().sort((a, b) => a.value - b.value).map(item => item.id) };
      case 'fields': return { values: Object.fromEntries(ch.fields.map(field => [field.id, String(field.answer)])) };
      case 'match': return { matches: Object.fromEntries(ch.pairs.map(pair => [pair.id, pair.right])) };
      case 'pick': return { selected: ch.correct.slice() };
      case 'box': return { positions: Object.fromEntries(ch.labels.map(label => [label.id, label.value])) };
      default: throw new Error('Tipo de reto desconocido: ' + ch.type);
    }
  }
  function grade(ch, answer) {
    const a = answer && typeof answer === 'object' ? answer : {};
    let complete = false, details = [], wrong = [], score = 0;
    if (ch.type === 'sort') {
      const values = a.assign || {}, categories = new Set(ch.categories.map(c => c.id));
      complete = ch.items.every(item => categories.has(values[item.id]));
      details = ch.items.map(item => ({ id: item.id, label: item.label, ok: values[item.id] === item.correct, explanation: item.explanation || ch.explanation }));
    } else if (ch.type === 'fields') {
      const values = a.values || {};
      complete = ch.fields.every(field => nonblank(values[field.id]) && (field.kind !== 'number' || Number.isFinite(numeric(values[field.id]))));
      details = ch.fields.map(field => ({ id: field.id, label: field.label, ok: expectedField(field, values[field.id]), explanation: field.explanation || ch.explanation }));
    } else if (ch.type === 'match') {
      const values = a.matches || {}, allowed = new Set(ch.pairs.map(p => p.right));
      complete = ch.pairs.every(pair => allowed.has(values[pair.id]));
      details = ch.pairs.map(pair => ({ id: pair.id, label: pair.left, ok: values[pair.id] === pair.right, explanation: pair.explanation || ch.explanation }));
    } else if (ch.type === 'box') {
      const values = a.positions || {};
      complete = ch.labels.every(label => Number.isFinite(numeric(values[label.id])));
      details = ch.labels.map(label => ({ id: label.id, label: label.label, ok: Number.isFinite(numeric(values[label.id])) && Math.abs(numeric(values[label.id]) - label.value) <= 0.001, explanation: label.label + ' = ' + fmt(label.value) + ' minutos.' }));
    } else if (ch.type === 'order') {
      const order = Array.isArray(a.order) ? a.order : [], lookup = Object.fromEntries(ch.items.map(item => [item.id, item]));
      const expected = ch.items.slice().sort((x, y) => x.value - y.value);
      complete = order.length === ch.items.length && new Set(order).size === order.length && order.every(id => Object.prototype.hasOwnProperty.call(lookup, id));
      details = expected.map((item, index) => {
        const given = lookup[order[index]];
        return { id: String(index), label: 'Posición ' + (index + 1), ok: !!given && given.value === item.value, explanation: 'En esta posición va ' + item.label + '. Los elementos con el mismo valor pueden intercambiarse.' };
      });
    } else if (ch.type === 'pick') {
      const selected = Array.isArray(a.selected) ? Array.from(new Set(a.selected)) : [], valid = selected.every(i => Number.isInteger(i) && i >= 0 && i < ch.options.length);
      complete = valid && selected.length > 0;
      const expected = new Set(ch.correct), picked = new Set(selected);
      details = ch.options.map((label, index) => ({ id: String(index), label, ok: picked.has(index) === expected.has(index), explanation: expected.has(index) ? 'Esta afirmación está justificada por los datos y debe seleccionarse.' : 'Esta afirmación no está justificada y no debe seleccionarse.' }));
      const truePositives = selected.filter(i => expected.has(i)).length, falsePositives = selected.filter(i => !expected.has(i)).length;
      score = Math.max(0, truePositives - falsePositives) / expected.size;
    } else throw new Error('Tipo de reto desconocido: ' + ch.type);
    if (ch.type !== 'pick') score = details.length ? details.filter(d => d.ok).length / details.length : 0;
    wrong = details.filter(d => !d.ok).map(d => d.id);
    const correct = complete && wrong.length === 0;
    let feedback;
    if (!complete) feedback = 'Completa todas las respuestas antes de comprobar. En los cálculos escribe un número; se admite coma o punto decimal.';
    else if (correct) feedback = ch.explanation;
    else feedback = details.filter(d => d.ok).length + ' de ' + details.length + ' comprobaciones correctas. Revisa la corrección por partes y vuelve a intentarlo.';
    return { complete, correct, score, wrong, feedback, details };
  }

  root.EDA_CHALLENGES = { missions, makeMission, grade, solution };
})(typeof window !== 'undefined' ? window : globalThis);
