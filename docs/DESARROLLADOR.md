# 🛠 Guía técnica para desarrolladores

Todo lo necesario para mantener, personalizar y hacer crecer el proyecto.
Si solo vas a usar la web, ve al [manual de usuario](USUARIO.md).

---

## 1. Stack y principios

| | |
|---|---|
| Lenguajes | HTML5, CSS3, JavaScript (ES2020) **sin frameworks ni build** |
| Dependencias | [`marked`](https://marked.js.org/) y [`DOMPurify`](https://github.com/cure53/DOMPurify) por CDN (jsDelivr) |
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
├── js/app.js           Toda la lógica (≈1000 líneas, 12 secciones)
├── scripts/check.js    Validador sin dependencias (lo usa el CI)
├── .github/workflows/ci.yml  CI: sintaxis, rutas, ids y servido
├── assets/icon.svg     Logo (cabecera, og:image, apple-touch-icon)
├── assets/favicon.svg  Favicon
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
| **1. Biblioteca** | CRUD de documentos en `localStorage` | `cargarDocs()`, `escribirDocs()`, `persistir(silencioso)`, `docActual()` |
| **2. Modal Mis docs** | Pinta la lista y sus acciones | `pintaListaDocs()`, `abrirDoc()`, `renombrarDoc()`, `borrarDoc()` |
| **3. Acciones de archivo** | Nuevo / abrir / descargar | `nuevo()`, `abrirDisco()`, `descargar()`, `descargarComo()`, `guardar()`, `copiar()` |
| **4. Autoguardado** | 1,2 s de rebote + indicador del pie | `marcarSucio()`, `persistir`, `actualizarSaveInfo()`, `tiempoDesde()`, `beforeunload` |
| **4b. Historial** | Deshacer/rehacer propios | `notaCambio()`, `deshacer()`, `rehacer()`, `restaura()`, `reiniciarHistorial()` |
| **5. Barra de formato** | Comandos de sintaxis | `envolver()`, `prefijo()`, `prefijoConEjemplo()`, `comando(cmd)`, `PLANTILLA` |
| **5b. Tabla** | Rejilla tipo Word (8×6) | `construirGrid()`, `pintaGrid()`, `insertarTabla(cols, filas)`, `posicionaPop()` |
| **5c. Exportar** | HTML, PDF, MD, compartir | `exportarHTML()`, `CSS_EXPORT`, `aB64()`, `desdeB64()`, `compartir()`, `cargarDesdeEnlace()` |
| **5d. Pegar imágenes** | `Ctrl+V` → base64 | listener `editor.addEventListener('paste', …)` |
| **5e. Menús** | Menú Exportar y ventana Guía | `exportPop`, `helpModal`, `cierraExportPop()`, `cierraAyuda()` |
| **6. Esquema** | Índice de títulos | `construirEsquema()`, `saltarA(i)`, `marcaActivo(i)` |
| **7. Render** | Markdown → HTML | `render()`, `trasCambiar()` |
| **8. Atajos** | `keydown` global y del editor | `Ctrl+Z/Y/S/O/N/B/I/K`, `Tab`, `Esc` |
| **9. Tema y botones** | Suscripciones de la UI | `aplicarTema()`, listeners de cada `btn*` |
| **10. Inicio** | `iniciar()` (IIFE) | Restaura tema, biblioteca, esquema y contenido |

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
| `md-editor:tema` | `'light'` \| `'dark'` |
| `md-editor:esquema` | `'1'` \| `'0'` — esquema visible |
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
[data-theme="dark"] { /* mismas variables en oscuro */ }
```

Todo lo demás (botones, esquema, modales, impresión) coge esas variables.

### 5.5 Añadir una zona de contenido nuevo al HTML

Sigue el patrón existente: elemento con `id`, clase de estilo existente o nueva
en `style.css`, y en `app.js` un `document.getElementById(...)` cerca de la
sección relacionada. Cierra con `Esc` añadiendo una rama en la sección 8.

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
| Sintaxis | `node --check js/app.js` | Que JavaScript no tenga errores de sintaxis |
| Estructura | `node scripts/check.js` | Las 9 comprobaciones de abajo |
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

Sale con **código 1** si algo falla → el paso del workflow se pone rojo.

> 💡 Es exactamente el tipo de errores que cuestan descubrir a mano: al mover
> `style.css` a `css/`, renombrar un id o borrar un botón, el CI lo dice antes
> que los usuarios.

**Cómo añadir una comprobación nueva:** añade un bloque en `scripts/check.js`
usando `ok()` / `mal()` / `aviso()` y ya se ejecuta solo en cada push.

---

## 11. Ideas para el futuro

- Buscar y reemplazar (`Ctrl+F`).
- Exportar todos los documentos de la biblioteca a un `.zip`.
- Sincronización opcional (GitHub Gist, WebDAV) para no depender del navegador.
- Resaltado de sintaxis dentro del editor (overlay).
- Editor en modo «typewriter» y ancho de línea ajustable.
- Pruebas automáticas con Playwright sobre el checklist del apartado 9.

---

## 12. Licencia

Licencia personalizada de **Alberto Ortiz (`alberto2005-coder`)**: uso libre con
fines **no comerciales** y atribución obligatoria — ver [`LICENSE`](../LICENSE).
Si necesitas uso comercial, contacta con el autor por GitHub.

> Ojo si distribuyes forks: además de respetar la licencia, las dependencias
> (`marked`, `DOMPurify`) mantienen su licencia **MIT** original.

Vuelve al [README](../README.md) · [Manual de usuario](USUARIO.md)
