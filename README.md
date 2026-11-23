# EDA Quest · Ciudad Delta

Juego de estudio en español para móvil. Aplicación estática, sin dependencias de producción, sin cuenta y sin servidor de datos. Se puede publicar en Vercel.

## Contenido

- Cinco zonas de EDA: archivo de variables, registro de autobuses, esperas, gráficos e informe final.
- Un taller adicional de POO y Regex. Se excluye la primera parte de Python.
- 31 retos con seis mecánicas: clasificar, ordenar, completar y reparar, emparejar, construir boxplots y auditar conclusiones.
- 38 lecciones, 42 preguntas de teoría, simulacros configurables y 18 ejercicios escritos con criterios de revisión personal.
- Claro/oscuro, sonido opcional, modo concentración, partida guardada, recuperación de errores y exportación/importación del progreso.

## Cómo se juega

Cada misión empieza con una explicación breve. Hay que resolver todos sus retos; fallar abre una corrección y añade una recuperación al final. No hay vidas que agotar ni tiempos de espera. Los retos cuantitativos admiten coma y punto decimal. Una respuesta vacía nunca vale cero.

Una estrella reconoce completar la misión y sus recuperaciones; dos exigen al menos el 80 % a la primera sin ayuda; tres exigen el 100 %. La experiencia conserva la mejor recompensa por objetivo (hasta 20 XP); repetir no suma XP ilimitados. Las respuestas escritas tienen revisión personal y no inflan las estrellas.

El archivo, los autobuses, las esperas y los gráficos se pueden explorar libremente. La auditoría se abre al completar las cuatro zonas. Los datos nuevos están marcados como variantes de práctica. Algunos retos cambian sus datos y otros mantienen el caso y cambian el orden de sus piezas.

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

El progreso se guarda en `localStorage` de este navegador y dominio. Actualizar en el mismo dominio conserva las lecciones marcadas, respuestas antiguas y borradores compatibles. Las misiones rediseñadas empiezan de nuevo porque tienen objetivos distintos; se conserva una referencia al número de misiones completadas en la edición previa.

Para trasladar los avances, abre **Perfil → Guardar copia** y después **Restaurar** en el otro navegador. Las copias incluyen misiones, teoría, preguntas y borradores. La importación reinicia la partida en curso y reconstruye las evidencias pendientes con ejercicios compatibles. Si borras los datos de Safari o cambias de dominio, necesitas esa copia para recuperarlos.

## Ejecutar localmente

Desde esta carpeta:

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000`. El service worker funciona en localhost y HTTPS.

## Estructura

- `index.html`: aplicación y navegación.
- `styles.css`: diseño adaptable, tema claro/oscuro y movimiento reducido.
- `content.js`: teoría, preguntas y ejercicios escritos.
- `challenges.js`: generadores de retos, datos y corrector determinista.
- `app.js`: interfaz, misiones, guardado, migración y recuperación.
- `sw.js`: contenido sin conexión y actualización de recursos.
- `manifest.webmanifest` e iconos: instalación en pantalla de inicio.

## Base didáctica

Se utiliza el temario y los casos que ya aparecían en la conversación y en la aplicación anterior. No se ha podido volver a abrir el PDF original en este entorno. Las nuevas tablas y variantes se indican como práctica, sin atribuirlas al PDF. Para cuartiles se usa explícitamente la mediana de cada mitad, que reproduce Q1 = 6 y Q3 = 13 del caso de esperas.

Los ejercicios escritos no reciben una supuesta corrección por IA: se muestran una solución orientativa y criterios de revisión. Las misiones jugables se corrigen con respuestas y cálculos verificables.


## Verificación de esta edición

Se han comprobado las soluciones de los 31 retos en 100 semillas por misión (3.100 calificaciones), además de entradas vacías, cero, decimales, números repetidos y opciones incorrectas. Un arnés de eventos en Node ejecutó 42 retos a través de la lógica de la app, incluida una recuperación, una repetición y una partida rápida. Se verificaron puntuación sin duplicados, continuidad de la partida, tema, búsqueda, borradores, preguntas y autoevaluación separada.

El navegador de prueba quedó bloqueado por restricciones del entorno. Por ello no se afirma haber verificado la distribución visual en Safari ni en un iPhone físico. El proyecto incluye el diseño adaptable y los recursos de PWA, pero esa revisión visual sigue pendiente.

Configuración de Vercel contrastada con su [documentación de compilación](https://vercel.com/docs/builds/configure-a-build): para sitios estáticos se usa Other y se omite la compilación.
