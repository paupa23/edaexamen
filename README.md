# EDA Quest · Ciudad Delta

Juego de estudio en español para móvil. Aplicación estática, sin dependencias de producción, sin cuenta y sin servidor de datos. Se puede publicar en Vercel.

## Campaña secuencial y revisión de jugabilidad

Las seis misiones se desbloquean en este orden:

1. Archivo de variables.
2. Taller de autobuses.
3. Torre de las esperas.
4. Observatorio de gráficos.
5. Gran auditoría.
6. Laboratorio de POO y Regex.

Se exige completar todas las anteriores, incluidas sus recuperaciones; una estrella basta. Los candados están comprobados en la lógica de inicio, repetición, continuación y corrección, además de en la interfaz. Las partidas rápidas y de repaso solo utilizan zonas abiertas y no completan misiones de la campaña. La lectura de teoría y las preguntas siguen disponibles para estudiar.

Tocar una misión cerrada muestra los requisitos y lleva a la siguiente misión disponible. Al terminar aparece la zona que acabas de desbloquear. Un botón Jugar/Continuar antes del mapa permite entrar sin recorrer toda la pantalla.

### Ejercicios y repaso

- El tablero indica cuántas piezas has colocado o campos has rellenado, sin confundir ese progreso con la corrección de la respuesta.
- La corrección breve aparece junto al tablero. El razonamiento completo se abre cuando lo necesitas y el botón Revisar devuelve el foco a las piezas.
- Las pistas y los conceptos relacionados se consultan sin perder tu respuesta. Consultar el concepto durante un reto cuenta como ayuda; antes de empezar puedes repasar la teoría de la zona libremente.
- El ejercicio del histograma dibuja barras contiguas a medida que escribes las frecuencias. Distingue datos en blanco, ceros y valores inválidos, y muestra el recuento parcial sobre ocho. El dibujo representa tu construcción, no adelanta la solución.
- Las rondas rápidas priorizan errores pendientes y objetivos resueltos con ayuda dentro de las zonas desbloqueadas.
- Los errores pendientes se resuelven también al acertar en una repetición normal. Las rondas de repaso muestran su número real de evidencias recuperadas.
- Tocar un destino de clasificación sin seleccionar una ficha ya no deshace una respuesta.

### Guardado y comodidad

Las rondas de preguntas y los simulacros se guardan al seleccionar y responder, por lo que puedes recargar y continuar. Antes de sustituir una ronda o misión en curso se pide confirmación dentro de la app. El perfil muestra el mejor resultado a la primera por zona y las evidencias que conviene repasar.

Se han ampliado textos y controles móviles, reducido el preámbulo del tablero y acercado la acción principal. La ayuda usa una ventana desplazable con conceptos desplegables. Se conserva el modo claro/oscuro, el movimiento reducido y el modo concentración.

## Aspecto visual: un tablero de aventura

El mapa es una ciudad de islas flotantes dibujada en SVG. Cada edificio abre una misión; los lugares recuperados se iluminan y conservan sus estrellas. Byte, el compañero robot, cambia de expresión al investigar, resolver o recibir una pista.

Las seis misiones tienen escenarios propios: archivo con fichas, taller de autobuses, torre de las esperas, observatorio, sede de auditoría y laboratorio de código. Al acertar se activa el escenario y se recoge una evidencia en el HUD. Las fichas se desplazan al colocarlas, las parejas reaccionan al conectarse y las piezas incorrectas se señalan para poder revisarlas. Las victorias revelan la insignia y las estrellas. La experiencia animada muestra solo XP realmente nuevos.

Los botones y fichas tienen profundidad y respuesta al toque. El icono de instalación también es Byte. Todo el arte, los estilos y la lógica están incluidos localmente; no se cargan fuentes, imágenes ni bibliotecas externas.

Las animaciones se pueden reducir en **Perfil → Animaciones**. También se respeta la preferencia de movimiento reducido del dispositivo; el modo concentración detiene la decoración animada. Las animaciones no bloquean los controles ni añaden tiempos de espera a la partida. El sonido sigue siendo opcional.

## Contenido

- Cinco zonas de EDA: archivo de variables, registro de autobuses, esperas, gráficos e informe final.
- Un taller adicional de POO y Regex. Se excluye la primera parte de Python.
- 31 retos con seis mecánicas: clasificar, ordenar, completar y reparar, emparejar, construir boxplots y auditar conclusiones.
- 38 lecciones, 42 preguntas de teoría, simulacros configurables y 18 ejercicios escritos con criterios de revisión personal.
- Claro/oscuro, sonido opcional, movimiento reducido, modo concentración, partida guardada, recuperación de errores y exportación/importación del progreso.

## Cómo se juega

Cada misión empieza con una explicación breve. Hay que resolver todos sus retos; fallar abre una corrección y añade una recuperación al final. No hay vidas que agotar ni tiempos de espera. Los retos cuantitativos admiten coma y punto decimal. Una respuesta vacía nunca vale cero.

Una estrella reconoce completar la misión y sus recuperaciones; dos exigen al menos el 80 % a la primera sin ayuda; tres exigen el 100 %. La experiencia conserva la mejor recompensa por objetivo (hasta 20 XP); repetir no suma XP ilimitados. Las respuestas escritas tienen revisión personal y no inflan las estrellas.

La campaña se recorre en orden y el taller de POO y Regex se abre después de la auditoría. Las misiones ya completadas se pueden repetir cuando sus requisitos están satisfechos. Los datos nuevos están marcados como variantes de práctica. Algunos retos cambian sus datos y otros mantienen el caso y cambian el orden de sus piezas.

## Publicación en Vercel

1. Descomprime el ZIP y coloca estos archivos directamente en la raíz de tu repositorio: `index.html` debe estar al mismo nivel que `vercel.json`.
2. Sustituye los archivos de la versión anterior en ese mismo proyecto. No hace falta `npm install` ni compilar.
3. Importa el repositorio o deja que el proyecto ya conectado publique el nuevo commit. Es una web estática: selecciona **Other** si Vercel solicita un framework, deja vacíos los comandos de instalación y compilación y sirve la raíz (`.`).
4. Abre la URL resultante y recarga una vez con conexión para preparar la versión nueva.

Este paquete no ha sido desplegado en tu cuenta de Vercel: contiene los archivos listos para hacerlo.

## En el iPhone

Abre la dirección publicada en Safari y usa **Compartir → Añadir a pantalla de inicio**. Abre la app al menos una vez con conexión; los recursos se guardan mediante el service worker. El ZIP o la vista previa de un HTML en la app Archivos no equivalen a instalar la PWA.

El modo oscuro está activado inicialmente y se cambia con el botón de la parte superior. Si ya habías elegido un tema en la versión anterior, se conserva esa preferencia.

## Progreso y actualizaciones

El progreso se guarda en `localStorage` de este navegador y dominio. Esta actualización mantiene la clave y el formato de guardado de Ciudad Delta: conserva misiones, estrellas, XP, teoría, borradores, respuestas y la partida en curso. Si una edición anterior permitía jugar fuera de orden, esos logros se conservan, pero es necesario cerrar los huecos de la ruta para acceder a las zonas posteriores. Una partida antigua con zonas todavía bloqueadas queda en espera y no se elimina automáticamente. Actualiza los archivos en el mismo proyecto y dominio para conservar esos datos. Si vienes de ediciones anteriores a Ciudad Delta, se migran las lecciones, respuestas y borradores compatibles; la campaña nueva comienza con sus propios retos y se conserva una referencia a las misiones de la edición antigua.

Para trasladar los avances, abre **Perfil → Guardar copia** y después **Restaurar** en el otro navegador. Las copias incluyen misiones, teoría, preguntas y borradores. La importación reinicia las partidas y rondas de preguntas en curso y reconstruye las evidencias pendientes con ejercicios compatibles. Si borras los datos de Safari o cambias de dominio, necesitas esa copia para recuperarlos.

## Ejecutar localmente

Desde esta carpeta:

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000`. El service worker funciona en localhost y HTTPS.

## Estructura

- `index.html`: aplicación y navegación.
- `styles.css`: base de interfaz y componentes de estudio.
- `game.css`: aspecto del juego, mapa, HUD, fichas, animaciones y temas.
- `polish.css`: legibilidad móvil, progreso, bloqueos, ayuda y acciones de ejercicios.
- `visuals.js`: arte SVG original de la ciudad, seis escenarios y Byte.
- `content.js`: teoría, preguntas y ejercicios escritos.
- `challenges.js`: generadores de retos, datos y corrector determinista.
- `campaign.js`: requisitos, desbloqueos y acceso a partidas guardadas.
- `exercise-visuals.js`: construcción visual del histograma con tus respuestas.
- `app.js`: interfaz, misiones, guardado, migración y recuperación.
- `sw.js`: contenido sin conexión y actualización de recursos.
- `manifest.webmanifest` e iconos: instalación en pantalla de inicio.

## Base didáctica

Se utiliza el temario y los casos que ya aparecían en la conversación y en la aplicación anterior. No se ha podido volver a abrir el PDF original en este entorno. Las nuevas tablas y variantes se indican como práctica, sin atribuirlas al PDF. Para cuartiles se usa explícitamente la mediana de cada mitad, que reproduce Q1 = 6 y Q3 = 13 del caso de esperas.

Los ejercicios escritos no reciben una supuesta corrección por IA: se muestran una solución orientativa y criterios de revisión. Las misiones jugables se corrigen con respuestas y cálculos verificables.


## Verificación de esta edición

El corrector y el contenido didáctico se conservan. La edición previa comprobó las soluciones de los 31 retos en 100 semillas por misión (3.100 calificaciones), además de vacíos, ceros, decimales, números repetidos y opciones incorrectas.

Esta revisión ha pasado 187 comprobaciones específicas de requisitos, desbloqueo en orden, progreso antiguo, datos de logro inválidos y partidas guardadas con zonas bloqueadas.

Un arnés de eventos en Node ha completado 53 retos con movimiento reducido y otros 53 con movimiento permitido. Cubre las seis misiones y mecánicas, entradas alternativas bloqueadas, partidas rápidas sin temas futuros, recuperación de errores, puntuación sin duplicados, continuidad, temas, búsqueda, borradores y preguntas. También verifica que un destino sin selección no borra fichas, que los errores anteriores se recuperan al repetir y que el repaso cuenta sus evidencias correctamente.

El guardado de cuestionarios se ha comprobado con una selección pendiente, una respuesta corregida de entrenamiento y una pregunta ya contestada de simulacro. Se comprueba también la confirmación antes de reemplazar una ronda. El histograma se actualiza al editar los valores, y consultar el concepto conserva las respuestas y registra la ayuda.

Se revisaron los 31 retos y la correspondencia entre cada uno y su ayuda conceptual. Se rasterizó el nuevo histograma a anchuras de 780 y 320 píxeles: ejes, intervalos, alturas, ceros y etiquetas correctos. Las nueve variantes de la función cubren vacíos, decimales, cifras negativas, no numéricas y muy grandes. La función visual no lee las soluciones del corrector.

El navegador de prueba está bloqueado por restricciones del entorno. Las comprobaciones de eventos y SVG no equivalen a validar el CSS, los gestos, las capas adhesivas o las animaciones en Safari o en un iPhone físico. Esa revisión de navegador sigue pendiente.

Configuración de Vercel contrastada con su [documentación de compilación](https://vercel.com/docs/builds/configure-a-build): para sitios estáticos se usa Other y se omite la compilación.
