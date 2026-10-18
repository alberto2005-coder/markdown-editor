# 🛠 Guía técnica para desarrolladores

Todo lo necesario para mantener, personalizar y hacer crecer el proyecto.
Si solo vas a usar la web, ve al [manual de usuario](USUARIO.md).

---

## 1. Stack y principios

| | |
|---|---|
| Lenguajes | HTML5, CSS3, JavaScript (ES2020) **sin frameworks ni build** |
| Dependencias | [`marked`](https://marked.js.org/) y [`DOMPurify`](https://github.com/cure53/DOMPurify) por CDN (jsDelivr) |
| Idiomas | `js/i18n.js` — diccionario es/en propio, sin librerías de i18n |
| Persistencia | `localStorage` (sin backend) |
| Imágenes | SVG vectoriales propios |
| Compatibilidad | Navegadores modernos (Chrome/Edge/Firefox/Safari). Si falla `crypto`/`TextEncoder` no hace falta: no se usan APIs exóticas. |

**Principios de diseño:** todo estático (se puede servir desde GitHub Pages),
cero configuración, funcionamiento offline con degradación elegante.

---

## 2. Estructura del proyecto

```
markdown-editor/
├── index.html          Marcado: barra, toolbar, split, modales
├── README.md           Índice de documentación
├── CHANGELOG.md        Historial de versiones
├── LICENSE             ← Licencia personalizada (uso no comercial)
├── .nojekyll           Desactiva Jekyll en GitHub Pages
├── .gitignore          Qué no subir a Git
├── .editorconfig       Estilo de edición uniforme
├── css/style.css       Estilos + variables de tema + print
├── js/app.js           Toda la lógica (≈1750 líneas, secciones 0–11)
├── js/i18n.js          Diccionario de textos (es / en) — se carga antes que app.js
├── scripts/check.js    Validador sin dependencias (lo usa el CI)
├── .github/workflows/ci.yml  CI: sintaxis, rutas, ids, i18n y servido
├── assets/icon.svg     Logo (cabecera, og:image, apple-touch-icon)
├── assets/favicon.svg  Favicon
├── desktop/            Versión de escritorio e instalador Windows
│   ├── package.json    Scripts de empaquetado (Electron)
│   ├── main.js         Proceso principal de Electron (aislado y single instance)
│   ├── prepare.js      Sincronizador de archivos web
│   ├── generate-icon.js Generador de icon.ico nativo multi-resolución
│   ├── icon.ico        Icono de Windows (16, 32, 48, 64)
│   └── setup.iss       Script de Inno Setup 7 para compilar el instalador
└── docs/
    ├── USUARIO.md      Manual de usuario
    └── DESARROLLADOR.md  Este documento
```

---

## 3. Mapa de `js/app.js`

El archivo está dividido en secciones numeradas con un comentario de cabecera.
Busca `/* ======` o el número de sección.

| Sección | Contenido | Piezas clave |
|---|---|---|
| **0. Idioma** | Diccionario es/en y volcado sobre la página | `cargarIdioma()`, `t(clave, params)`, `aplicarIdioma()`, `ponIdioma()`, `demo()` |
| **1. Biblioteca** | CRUD de documentos en `localStorage` | `cargarDocs()`, `escribirDocs()`, `persistir(silencioso)`, `docActual()` |
| **2. Modal Mis docs** | Pinta la lista, la papelera y las versiones de un documento | `pintaListaDocs()`, `pintaPapelera()`, `pintaVersiones()`, `abreVersiones()`, `actualizaBarraDocs()`, `abrirDoc()`, `renombrarDoc()`, `borrarDoc()`, `restaurarDoc()`, `borrarDefinitivo()`, `vaciarPapelera()` |
| **3. Acciones de archivo** | Nuevo / abrir / descargar | `nuevo()`, `abrirDisco()`, `abrirArchivoDisco(file)`, `descargar()`, `descargarComo()`, `guardar()`, `copiar()` |
| **4. Autoguardado** | 1,2 s de rebote + indicador del pie | `marcarSucio()`, `persistir`, `actualizarSaveInfo()`, `tiempoDesde()`, `beforeunload` |
| **4b. Historial** | Deshacer/rehacer propios | `notaCambio()`, `deshacer()`, `rehacer()`, `restaura()`, `reiniciarHistorial()` |
| **5. Barra de formato** | Comandos de sintaxis | `envolver()`, `prefijo()`, `prefijoConEjemplo()`, `comando(cmd)`, `PLANTILLA` |
| **5b. Tabla** | Rejilla tipo Word (8×6) | `construirGrid()`, `pintaGrid()`, `insertarTabla(cols, filas)`, `posicionaPop()` |
| **5c. Exportar** | HTML, PDF, MD, compartir | `exportarHTML()`, `CSS_EXPORT`, `aB64()`, `desdeB64()`, `compartir()`, `cargarDesdeEnlace()` |
| **5d. Pegar imágenes** | `Ctrl+V` → base64 | `pegarImagen(file)`, listener `editor.addEventListener('paste', …)` |
| **5e. Menús** | Menú Exportar y ventana Guía | `exportPop`, `helpModal`, `cierraExportPop()`, `cierraAyuda()` |
| **6. Esquema** | Índice de títulos | `construirEsquema()`, `saltarA(i)`, `marcaActivo(i)` |
| **7. Render** | Markdown → HTML | `render()`, `trasCambiar()` |
| **8. Atajos** | `keydown` global y del editor | `Ctrl+Z/Y/S/O/N/B/I/K/F`, `Tab`, `Esc` |
| **9. Tema y botones** | Suscripciones de la UI | `aplicarTema()`, listeners de cada `btn*` |
| **10a. Modos de vista** | Solo editor / dividido / solo preview | `aplicarModo(m)`, clase `split modo-*`, `md-editor:modo` |
| **10b. Buscar y reemplazar** | Barra con contador y reemplazo | `posicionesBusqueda()`, `resaltaDesde()`, `siguienteCoincidencia()`, `reemplazaUno()`, `reemplazaTodo()` |
| **10c. Ajustes** | Fuente, tamaños, ancho y tema | `aplicarAjustes()` (variables CSS), `cambiaAjuste()`, `AJUSTES_DEFECTO`, `md-editor:ajustes` |
| **10d. Plantillas** | Crear desde plantilla (texto traducido) | `PLANTILLAS` (claves), `plantilla(clave)`, `plantillasPop`, `crearDesdePlantilla(clave)` |
| **10e. Respaldo** | Exportar/importar la biblioteca | `respaldoBiblioteca()`, `restaurarRespaldo(file)`, `#backupInput` |
| **10f. ZIP** | `.zip` de toda la biblioteca, escrito a mano | `crc32(bytes)`, `crearZip([{nombre, texto}])`, `exportarZip()`, `CRC_TABLA` |
| **10g. Papelera** | Mostrar / restaurar / borrar para siempre | `actualizaContadorPapelera()`, `#btnTrash`, `#btnVaciar`, `PAPELERA_MAX` |
| **10h. Arrastrar** | Soltar `.md` o imagen | `traeArchivos(e)`, listeners `dragenter/over/leave/drop`, `#dropZone` |
| **10i. Historial** | Copias automáticas por documento | `guardaVersionActual(forzar)`, `pintaVersiones()`, `restauraVersion(i)`, `borraVersion(i)`, `VERSIONES_MAX`, `md-editor:versiones` |
| **11. Inicio** | `iniciar()` (IIFE) | Idioma, tema, biblioteca, papelera, versiones, ajustes, modo, esquema y contenido |

### Flujo de un cambio de texto

```
usuario escribe / pulsa botón
        │
        ▼
 trasCambiar()  ──► notaCambio()      (empuja paso al historial)
        │      ──► marcarSucio()      (estado "sin guardar" + timer 1,2 s)
        │      ──► setTimeout 90 ms ──► render()
                                              │
                                              ▼
                              marked.parse(md) ──► DOMPurify.sanitize()
                                              │
                                              ▼
                              preview.innerHTML + ids #sec-0, #sec-1…
                                              │
                                              ▼
                              construirEsquema() + stats + guardarBorrador
```

El *debounce* de 90 ms evita re-renderizar en cada tecla; el de 1,2 s evita
escribir en `localStorage` en cada pulsación.

---

## 4. Modelo de datos (`localStorage`)

| Clave | Contenido |
|---|---|
| `md-editor:docs` | `[{ id, name, content, updated }]` — biblioteca |
| `md-editor:docId` | `id` del documento abierto (`''` si ninguno) |
| `md-editor:papelera` | `[{ ...doc, borrado: ts }]` — papelera (máx. 10) |
| `md-editor:versiones` | `{ [idDoc]: [{ ts, name, content }] }` — historial (máx. 20/doc) |
| `md-editor:idioma` | `'es'` \| `'en'` — idioma elegido (si no, `navigator.language`) |
| `md-editor:tema` | `'light'` \| `'dark'` |
| `md-editor:esquema` | `'1'` \| `'0'` — esquema visible |
| `md-editor:modo` | `'editor'` \| `'split'` \| `'preview'` — modo de vista |
| `md-editor:ajustes` | `{ fuente, edSize, pvSize, ancho }` — panel ⚙️ (JSON) |
| `md-editor:contenido` / `md-editor:nombre` | Legacy (se siguen leyendo si no hay biblioteca) |

> **Cuota:** `localStorage` ronda los 5 MB por origen. Un documento con imágenes
> en base64 la llena rápido; por eso `paste` rechaza archivos de más de 1,5 MB.
> Si `escribirDocs()` falla, se muestra un aviso en la barra de estado.

**IDs de documento:** `'d' + Date.now() + random(4)` → sin colisiones prácticas.

---

## 5. Cómo añadir cosas

### 5.1 Un botón nuevo de formato

1. En `index.html`, dentro de `#toolbar`:
   ```html
   <button data-cmd="subrayado" title="Subrayado">U</button>
   ```
2. En `js/app.js`, en `comando(cmd)`:
   ```js
   case 'subrayado': envolver('<u>', '</u>', 'texto'); break;
   ```
   - `envolver(pre, post, ejemplo)` → rodea la selección (o deja ejemplo seleccionado).
   - `prefijo(p)` → añade/quita un prefijo por línea (listas, títulos).
   - `prefijoConEjemplo(p, ejemplo)` → como `prefijo` pero deja texto de ejemplo seleccionado si la línea está vacía.
3. Si quieres atajo: añade una rama en la sección 8.

No hay que registrar nada más: el listener de `#toolbar` es delegado por `data-cmd`.

### 5.2 Una opción nueva en Exportar

1. En `index.html`, dentro de `#exportPop`:
   ```html
   <button data-exp="epub">📘 Exportar EPUB</button>
   ```
2. En la sección 5e, dentro del `switch (btn.dataset.exp)`:
   ```js
   case 'epub': exportarEPUB(); break;
   ```
3. Escribe `exportarEPUB()` (usa `descargarComo(contenido, nombre, tipo)`).

### 5.3 Cambiar el motor de render

La única entrada es `render()` (sección 7). Cambia `marked.parse(md)` por lo que
quieras (markdown-it, micromark…) y **mantén el paso de sanitizado**:

```js
preview.innerHTML = DOMPurify.sanitize(html, { ADD_URI_SAFE_ATTR: ['src'] });
```

`ADD_URI_SAFE_ATTR: ['src']` es imprescindible para que sobrevivan las imágenes
`data:image/…` que se pegan con `Ctrl+V`.

### 5.4 Cambiar colores o tipografías

En `css/style.css`, arriba del todo:

```css
:root        { --bg, --panel, --border, --text, --muted, --accent, --accent-soft, --shadow }
             { --editor-font, --editor-size, --preview-size, --preview-max }
[data-theme="dark"] { /* mismas variables en oscuro */ }
```

Todo lo demás (botones, esquema, modales, impresión) coge esas variables.

Las cuatro últimas son las que mueve **⚙️ Ajustes** con
`document.documentElement.style.setProperty(...)`; sus valores por defecto
están en `:root` (funcionan sin JS) y los del usuario en `md-editor:ajustes`.
Para añadir un ajuste nuevo: variable en `:root`, control en `#settingsModal`,
y una línea en `aplicarAjustes()` (sección 10c).

### 5.5 Añadir una zona de contenido nuevo al HTML

Sigue el patrón existente: elemento con `id`, clase de estilo existente o nueva
en `style.css`, y en `app.js` un `document.getElementById(...)` cerca de la
sección relacionada. Cierra con `Esc` añadiendo una rama en la sección 8.

### 5.6 Añadir un texto nuevo (español / inglés)

1. En **`js/i18n.js`** añade una fila con las tres tripas — clave, español,
   inglés — en el grupo que corresponda:
   ```js
   ['msg.micosa', '🟢 Cosita nueva', '🟢 New thing'],
   ```
   Claves en minúsculas con puntos (`grupo.subclave`) y **siempre las dos
   traducciones en la misma línea**: así `check.js` puede exigir la paridad.
2. Si el texto vive en el **HTML**, marca el elemento:
   `data-i18n="msg.micosa"` (contenido), `data-i18n-title=` (título y
   `aria-label`), `data-i18n-ph=` (placeholder) o `data-i18n-html=` (si lleva
   etiquetas).
3. Si el texto se calcula en **JS**, usa `t('msg.micosa')` o con parámetros:
   `t('msg.micosa', { n: 3 })` con `{n}` en la cadena. Si el singular y el
   plural son distintos, usa **dos claves** (`msg.micosa` y `msg.micosa1`) y
   elige una como hace `metaTexto(palabras, 'a.b', 'a.b1', f)`.
4. Ejecuta `node scripts/check.js`: te dirá si la clave no existe en el
   diccionario o si sobra (también detecta las claves que vas pasando por
   variable).

No hace falta registrar nada más: `aplicarIdioma()` recorre todos los
`data-i18n*` de la página y repinta además la lista de documentos, la papelera,
las versiones, el esquema, las estadísticas y el indicador de guardado.

---

## 6. Sistemas con "trucos" que conviene conocer

### Historial (deshacer/rehacer)
No se usa el historial nativo del `textarea` (se rompe al modificar `value` por
código). En su lugar:

- `ultimo` = estado tras el último cambio registrado.
- Al cambiar: si no hay ráfaga en curso → se empuja `ultimo` (el estado *anterior*).
- Ráfaga = cambios con menos de **900 ms** entre ellos → un solo paso.
- Si la ráfaga supera **4 s**, se parte en dos pasos.
- Máximo **300** pasos; se vacía al abrir/crear documento.
- `restaura()` llama a `render()` y `marcarSucio()` para que también se autoguarde.

### Compartir por enlace
`compartir()` → `btoa` sobre UTF-8 con base64 **URL-safe** (`-` y `_`), metido en
`#d=…`. Al cargar, `cargarDesdeEnlace()` lo descodifica, limpia el hash con
`history.replaceState` y lo guarda en la biblioteca como `compartido`.

> Si `location` es `file://`, `navigator.clipboard` no existe → hay *fallback*
> con `prompt()`.

### Popovers (tabla y exportar)
`posicionaPop(pop, btn)` los posiciona fijos bajo su botón y los cierra el
listener global de `document` (o `Esc`). Nunca los metas dentro del `#toolbar`:
tiene `overflow-x: auto` y los recortaría.

### Esquema
Se reconstruye en cada `render()` leyendo el Markdown (ignorando lo que haya
dentro de bloques ` ``` `). Los títulos del preview reciben `id="sec-N"` para
poder hacer scroll hasta ellos y resaltar el activo en el scroll.

### Buscar y reemplazar
No se resaltan coincidencias con `innerHTML` (rompería la edición): lo que se
hace es **seleccionar** la coincidencia dentro del `textarea` con
`setSelectionRange()`. `posicionesBusqueda()` devuelve todas las posiciones con
un `indexOf` en bucle, reutilizando la lógica de mayúsculas (`sensibleMayus`).
Ese mismo array da el contador `n/total` y el «dar la vuelta» al final.

### Modos, ajustes y plantillas
- `aplicarModo(m)` solo cambia la clase del `<main class="split">`
  (`split modo-editor|split|preview`); el CSS se encarga del resto.
- `aplicarAjustes()` escribe variables CSS en `:root` en línea: sin tocar el
  fichero CSS ni recargar.
- `crearDesdePlantilla()` hace lo mismo que `nuevo()` pero con contenido, y
  llama a `persistir(true)` para que la plantilla aparezca ya en la biblioteca.

### Multi-idioma (sección 0 + `js/i18n.js`)

- El diccionario son **filas de tripas** `[clave, español, inglés]` que se
  convierten en `window.I18N = { es: {…}, en: {…} }`; `js/i18n.js` se carga
  **antes** que `app.js` en el HTML.
- `t(clave, params)` traduce sustituyendo `{param}`; si falta una clave, se
  muestra la propia clave (se ve al momento en pantalla, no se rompe nada).
- `aplicarIdioma()` hace el volcado completo: textos `data-i18n*`, `<html lang>`,
  `<title>`, contador de la papelera, lista de documentos, esquema, estadísticas,
  indicador de guardado y el botón/señuelo del idioma (`🌐 EN` ↔ `🌐 ES`).
- El idioma se guarda en `md-editor:idioma`; sin elección previa se detecta con
  `navigator.language` y se **guarda** el resultado (para que no cambie si el
  sistema cambia de idioma).

### Papelera (secciones 1 y 2 + 10g)

- `borrarDoc()` ya no borra: hace `papelera.unshift({...doc, borrado: Date.now()})`
  y recorta con `slice(0, PAPELERA_MAX)` (10). Los más antiguos se descartan.
- La lista del modal cambia de modo con `vistaPapelera` y `#btnTrash`; los
  botones ♻️/❌ se pintan en `pintaPapelera()` con `restaurarDoc(i)` y
  `borrarDefinitivo(i)`, siempre con `confirm()`.
- `restaurarDoc()` **regenera el `id`** si ya existe un documento con ese id en
  la biblioteca, para no pisar nada.
- Al restaurar, la papelera se recorta otra vez a 10 por si el `localStorage`
  venía de una versión anterior.

### Historial de versiones (sección 10i)

- `persistir()` llama a `guardaVersionActual(false)` en cada autoguardado: solo
  copia si ha pasado **1 minuto** (`VERSIONES_MS`) desde la anterior y el
  contenido cambió.
- Al **cambiar de documento** (`abrirDoc()`, `nuevo()`, `crearDesdePlantilla()`)
  se llama con `forzar = true`, para que el último estado no se quede sin copiar.
- Máximo **20 copias** por documento (`VERSIONES_MAX`), guardadas **aparte** en
  `md-editor:versiones` para no inflar `md-editor:docs`.
- La vista es un **modo más del modal** de Mis docs (`vistaVersiones`), igual
  que la papelera: `pintaListaDocs()` despacha a `pintaVersiones()`, y mientras
  está activa `#btnTrash` pasa a ser "↩ Documentos" y se ocultan los botones de
  acción (`actualizaBarraDocs()`).
- Restaurar hace primero `persistir(true)` y `guardaVersionActual(true)`: lo
  actual queda guardado como documento **y** como copia, y solo después se
  aplica la versión elegida.
- Si `localStorage` se llena, `escribirVersiones()` recorta a 3 copias por
  documento y reintenta en lugar de perderlo todo.
- Al borrar un documento para siempre (o al vaciar la papelera) se borran
  también sus versiones con `borraVersiones(id)`.

### `.zip` sin librerías (sección 10f)

- `crearZip()` escribe el formato ZIP a mano con el método **store** (sin
  comprimir): cabeceras locales (`0x04034b50`), directorio central
  (`0x02014b50`) y fin de archivo (`0x06054b50`), todo con bandera
  `0x0800` (*UTF-8* en los nombres).
- `crc32()` usa una tabla de 256 entradas (`CRC_TABLA`) calculada una vez con el
  polinomio `0xEDB88320`; es la misma comprobación que exigen los descomprimidores.
- Todo son `Uint8Array` y un `Blob`, así que el archivo **no se materializa** en
  memoria hasta que el navegador lo baja con `descargarComo()`.
- `exportarZip()` ordena por fecha, limpia caracteres prohibidos
  (`\ / : * ? " < > |`) y añade ` (2)`, ` (3)`… si se repite el nombre.

---

## 7. Seguridad

- Todo HTML renderizado pasa por **DOMPurify** (nada de `innerHTML` en bruto con
  contenido del usuario).
- El Markdown compartido viaja en la URL y también se sanitiza al renderizar.
- Se escapan los textos con `escapar()` al pintar la lista de documentos.
- No se envía nada a ningún servidor: la red solo se usa para los CDN.

---

## 8. Rendimiento

- Render con *debounce* de 90 ms → cómodo con documentos de miles de líneas.
- Guardado con *debounce* de 1,2 s → sin cuelgues al escribir rápido.
- La vista previa usa un único `innerHTML`; el esquema solo lee el Markdown.
- En documentos enormes (>100 KB) el cuello de botella es `marked.parse()`.

---

## 9. Checklist antes de publicar un cambio

```text
[ ] Recargar sin errores de consola (F12)
[ ] Escribir → la vista previa se actualiza
[ ] Ctrl+Z / Ctrl+Y funcionan con formato y con tabla
[ ] Guardar → aparece en 📚 Mis docs → se puede abrir/renombrar/borrar
[ ] Abrir un .md del disco y exportar HTML/PDF
[ ] Pegar una imagen pequeña (Ctrl+V)
[ ] Compartir enlace → abrirlo en una pestaña de incógnito
[ ] Tema oscuro y claro
[ ] Ctrl+F → buscar, siguiente, reemplazar y reemplazar todo
[ ] Modos ✍️ ◫ 👀 → cada uno deja solo sus paneles
[ ] ⚙️ Ajustes → cambiar fuente/tamaño/ancho y recargar (se recuerdan)
[ ] ＋ Nuevo → plantillas (README, tareas…) crean documento en la biblioteca
[ ] 📚 Mis docs → ⬇️ Respaldo → ⬆️ Restaurar en limpio
[ ] 📚 Mis docs → 📦 ZIP → el .zip abre y contiene todos los .md
[ ] 📚 Mis docs → 🕘 → listar versiones → ♻️ restaurar una → sigue intacto
[ ] 🗑️ Borrar un documento → va a la papelera → ♻️ lo restaura
[ ] 🗑️ ❌ borrar para siempre / Vaciar → avisan que no se puede recuperar
[ ] 🌐 EN: toda la interfaz traducida (sin textos en español sueltos) y al
    volver a ES se restaura todo; recargar mantiene el idioma elegido
[ ] `node scripts/check.js` en verde (incluye la comprobación de i18n)
[ ] Arrastrar un .md a la ventana → se abre
[ ] Ventana estrecha (< 760 px): las columnas se apilan
[ ] Ctrl+P: el PDF sale sin barra ni editor
```

---

## 10. Integración continua (CI)

En `.github/workflows/ci.yml` hay un workflow que se ejecuta **en cada push o pull
request** y pone la build en verde o roja antes de que llegues a la web rota.

**Qué comprueba, en 4 pasos:**

| Paso | Herramienta | Qué valida |
|---|---|---|
| Sintaxis | `node --check js/app.js` + `node --check js/i18n.js` | Que JavaScript no tenga errores de sintaxis |
| Estructura | `node scripts/check.js` | Las 10 comprobaciones de abajo |
| Servidor | `python3 -m http.server` + `curl` | Que `index.html`, CSS, JS e iconos responden |
| Artefacto | `upload-artifact` | Sube el proyecto compilado por si quieres descargarlo |

**`scripts/check.js` — validador sin dependencias** (también lo puedes correr en
local con `node scripts/check.js`):

1. Existencia de todos los archivos obligatorios
2. Sintaxis de `js/app.js`
3. Que **todas las rutas locales** del HTML existen y no haya rutas absolutas
4. Que cada **`getElementById()`** del JS tenga su `id=` en el HTML
5. Que no haya **ids duplicados**
6. Que cada **`data-cmd`** del toolbar tenga su `case` en `comando()`
7. Que todas las **variables CSS** usadas estén definidas
8. **Metadatos**: `lang`, `title`, charset, viewport, descripción, favicon, `og:title`
9. Que los **enlaces relativos** de README y `docs/` no estén rotos
10. **i18n**: sintaxis de `js/i18n.js`, **paridad es↔en** de todas las claves,
    que cada clave de los atributos `data-i18n*` del HTML y de cada `t('…')` de
    `app.js` exista en el diccionario (también las que van por variable), y
    aviso de las claves que no usa nadie

Sale con **código 1** si algo falla → el paso del workflow se pone rojo.

> 💡 Es exactamente el tipo de errores que cuestan descubrir a mano: al mover
> `style.css` a `css/`, renombrar un id o borrar un botón, el CI lo dice antes
> que los usuarios.

**Cómo añadir una comprobación nueva:** añade un bloque en `scripts/check.js`
usando `ok()` / `mal()` / `aviso()` y ya se ejecuta solo en cada push.

---

## 11. Ideas para el futuro

- Más idiomas (portugués, francés…) — solo hace falta añadir una columna al
  diccionario y una rama en `cargarIdioma()`.
- Sincronización opcional (GitHub Gist, WebDAV) para no depender del navegador.
- Resaltado de sintaxis dentro del editor (overlay).
- PWA instalable y offline (manifest + service worker + iconos PNG).
- Pruebas automáticas con Playwright sobre el checklist del apartado 9.
- Comprimir el `.zip` (método *deflate*) para bibliotecas grandes: ahora es
  *store* a propósito, para poder escribirlo sin librerías.

## 12. Empaquetado de escritorio e instalador (Inno Setup 7)

La carpeta `desktop/` mantiene el empaquetado para Windows completamente desacoplado del código web:

- **Electron wrapper (`desktop/main.js`):**
  - Carga los recursos locales con `contextIsolation: true`, `sandbox: true` y sin `nodeIntegration` por seguridad.
  - Implementa `app.requestSingleInstanceLock()` para enfocar la ventana existente si el usuario ejecuta la app dos veces.
  - Intercepta la navegación externa con `setWindowOpenHandler` para abrir enlaces web en el navegador del sistema (`shell.openExternal`).
- **Sincronización (`desktop/prepare.js`):** copia de manera determinista `index.html`, `css/`, `js/` y `assets/` a `desktop/src/` antes del empaquetado.
- **Icono nativo (`desktop/generate-icon.js`):** dibuja y genera sin dependencias externas un archivo `icon.ico` multi-resolución (16x16, 32x32, 48x48 y 64x64) en formato DIB 32-bit compatible con Windows Explorer e Inno Setup.
- **Instalador Inno Setup 7 ([`desktop/setup.iss`](../desktop/setup.iss)):**
  - Utiliza `WizardStyle=modern` nativo de Inno Setup 7 (estilo Windows 11).
  - Admite instalación estándar de usuario (sin permisos UAC) o para todos los usuarios en `Program Files`.
  - Integra la aceptación obligatoria de [`LICENSE`](../LICENSE) en el asistente previo a la instalación.
  - Registra accesos directos en el Menú Inicio y Escritorio con su correspondiente desinstalador.

---

## 13. Licencia

Licencia personalizada de **Alberto Ortiz (`alberto2005-coder`)**: uso libre con
fines **no comerciales** y atribución obligatoria — ver [`LICENSE`](../LICENSE).
Si necesitas uso comercial, contacta con el autor por GitHub.

> Ojo si distribuyes forks: además de respetar la licencia, las dependencias
> (`marked`, `DOMPurify`) mantienen su licencia **MIT** original.

Vuelve al [README](../README.md) · [Manual de usuario](USUARIO.md)
