# 📄 Changelog

Todas las versiones notables de **Markdown Editor**.
El formato sigue las convenciones de [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [1.9.2] — 2026-10-07

### Documentation
- **Repaso de coherencia** de toda la documentación con el código de la 1.9.1:
  - `README.md`: dos filas nuevas en *Problemas frecuentes* (borrado por error
    → papelera; usarlo en inglés → 🌐) y emoji del idioma unificado con la web.
  - `docs/USUARIO.md`: el **Idioma** ya aparece en *Primeros pasos* y en las dos
    menciones de ⚙️ Ajustes que lo olvidaban.
  - `docs/DESARROLLADOR.md`: la fila 2 del mapa de `app.js` recoge las funciones
    de versiones (`pintaVersiones()`, `abreVersiones()`, `actualizaBarraDocs()`).
- `CHANGELOG.md`: añadidos los enlaces de referencia que faltaban (1.8.0,
  1.9.0 y 1.9.1).

## [1.9.1] — 2026-10-07

### Fixed
- **Singular de «palabras»**: las estadísticas, la lista de documentos, la
  papelera y el historial ahora dicen `1 word` / `1 palabra` en lugar de
  «1 words» / «1 palabras» (claves `msg.stat1`, `docs.meta1` y `docs.vmeta1`
  + helper `metaTexto()`).
- `scripts/check.js` reconoce también las claves de i18n que se pasan por
  variable (`t(clave)`) y se salta los comentarios del JS: ni falsos avisos de
  «claves sin usar» ni mensajes falsos por ejemplos dentro de comentarios.

## [1.9.0] — 2026-10-07

### Added
- **Historial de versiones por documento**: se guarda una copia automática al
  autoguardar y al cambiar de documento — como mucho **una por minuto** y hasta
  **20 por documento** —. Botón 🕘 en cada fila de *📚 Mis docs*: lista las
  versiones con fecha y tamaño, las **restaura** (♻️) y las borra (🗑️). Nueva
  clave `md-editor:versiones`; si el almacenamiento se llena, se recortan las
  copias más antiguas en lugar de perder el resto.

### Fixed
- El botón y el selector de idioma usaban banderas (🇬🇧 / 🇪🇸), que **Windows no
  dibuja** (salen como las letras "GB" / "ES"): ahora llevan 🌐, que se ve bien
  en todos los sistemas. Documentación actualizada.

## [1.8.0] — 2026-10-07

### Added
- **Multi-idioma español / inglés**: nuevo `js/i18n.js` con el diccionario
  (271 claves; español e inglés fila a fila), botón **🌐 EN / 🌐 ES** en la
  cabecera y selector en ⚙️ Ajustes. Se recuerda en el navegador y, si no hay
  elección previa, se usa el idioma del sistema (`navigator.language`).
- **Papelera**: borrar un documento ya no lo elimina: pasa a **🗑️ Papelera**
  (máx. 10 documentos) desde donde se puede **restaurar**, **borrar para siempre**
  o **vaciar**. Nueva clave `md-editor:papelera`.
- **Exportar la biblioteca a `.zip`** (botón 📦 en *📚 Mis docs*): se genera en
  el navegador con el formato ZIP *store* y el CRC32 escritos a mano — **sin
  librerías ni compresión** —, con nombres `.md` sin repetirse.
- `scripts/check.js` añade la comprobación **10. i18n**: sintaxis de `i18n.js`,
  paridad es↔en, claves usadas por el HTML (`data-i18n*`) y por `app.js`
  (`t('clave')`) presentes en el diccionario, y aviso de claves sin usar.

### Changed
- Todo el texto visible de la interfaz sale del diccionario: mensajes de la
  barra de estado, ejemplos de la barra de formato, esquema, estadísticas,
  plantillas, compartir, respaldo, respuestas de apertura/guardado…
- El HTML exportado lleva `lang="es"` / `lang="en"` y el pie traducido.
- El aviso de **borrar para siempre** ya no promete que «irá a la papelera»;
  vaciar la papelera indica el número real de documentos borrados.

## [1.7.0] — 2026-10-07

### Added
- **Buscar y reemplazar** (`Ctrl+F`): contador de coincidencias `n/total`,
  opción *Aa* (mayúsculas/minúsculas), *Siguiente*, *Reemplazar* y *Todo*.
- **Modos de vista**: ✍️ solo editor, ◫ pantalla dividida y 👀 solo vista previa;
  se recuerda en el navegador.
- **Panel de ajustes** (⚙️): fuente del editor, tamaño del editor, tamaño de la
  vista previa, ancho de lectura y tema; con valores por defecto y restablecer.
- **Plantillas** al crear: documento en blanco, apuntes de clase, README de
  proyecto, informe y lista de tareas (ahora **＋ Nuevo** abre el menú).
- **Respaldo de la biblioteca**: descarga y restauración de todo el contenido
  en un `.json` desde *📚 Mis docs*.
- **Arrastrar y soltar**: suelta un `.md`/`.txt` para abrirlo o una imagen para
  insertarla (con zona de aviso a pantalla completa).

### Changed
- `Ctrl+F` abre la búsqueda propia en lugar de la del navegador.
- Las funciones de abrir archivo y de insertar imagen se reutilizan
  (`abrirArchivoDisco()`, `pegarImagen()`) entre botón, pegado y arrastre.

## [1.6.0] — 2026-10-07

### Added
- **CI con GitHub Actions** (`.github/workflows/ci.yml`): sintaxis de JS,
  validación de estructura y rutas, servido real del sitio y artefacto descargable.
- **`scripts/check.js`** — validador sin dependencias: rutas rotas, ids faltantes
  o duplicados, botones sin `case`, variables CSS sin definir, metadatos y enlaces
  de la documentación.
- `.gitignore` y `.editorconfig`.

### Changed
- Accesibilidad: foco visible con `:focus-visible`, `role="dialog"` en las
  ventanas, `aria-label` en los botones de solo icono y respeto a
  `prefers-reduced-motion`.
- `meta theme-color` (se adapta al tema claro/oscuro).

## [1.5.1] — 2026-10-07

### Added
- **Licencia personalizada** de Alberto Ortiz (`alberto2005-coder`): uso libre
  no comercial con atribución obligatoria, con resumen de una lectura rápida.
- Aviso de código de terceros (`marked` y `DOMPurify`, licencia MIT propia).
- **Crédito de autor** discreto en el pie de la web y en el HTML exportado.

### Changed
- Referencias de licencia actualizadas en `README.md` y guía técnica.

## [1.5.0] — 2026-10-07

### Added
- Estructura de carpetas: `css/`, `js/`, `assets/` y `docs/`.
- Documentación completa: manual de usuario, guía técnica, changelog y licencia (en ese momento MIT).

### Changed
- Rutas relativas actualizadas (`css/style.css`, `js/app.js`, `assets/*`).
- El `README.md` pasa a ser el índice de toda la documentación.

## [1.4.0] — 2026-10-07

### Added
- Botones **↶ Deshacer** y **↷ Rehacer** al inicio de la barra de formato.
- Historial propio de hasta 300 pasos: agrupa la escritura en ráfagas de 0,9 s y
  parte las de más de 4 s.
- Atajos `Ctrl+Z`, `Ctrl+Y` y `Ctrl+Shift+Z`.

## [1.3.0] — 2026-10-07

### Added
- Menú **📤 Exportar ▾**: descargar `.md`, exportar **HTML** con estilos propios,
  imprimir/PDF, copiar Markdown y **copiar enlace para compartir** (`#d=…`).
- **Pegar imágenes** con `Ctrl+V` (se insertan en base64, máx. 1,5 MB).
- Ventana **❓ Guía** con sintaxis y atajos (funciona sin conexión).
- Esc para cerrar cualquier ventana.

### Security
- Configurado DOMPurify con `ADD_URI_SAFE_ATTR` para permitir imágenes `data:`
  sin relajar el resto del saneado.

## [1.2.0] — 2026-10-07

### Added
- Textos de ejemplo seleccionados en H1/H2/H3, listas, tareas y cita
  (como Word: escribimos y sustituimos).

### Fixed
- Los títulos y listas no hacían nada si la línea estaba vacía.

### Changed
- Selector de tamaño de tabla estilo Word (rejilla 8 × 6 con vista previa del
  tamaño `columnas × filas`).

## [1.1.0] — 2026-10-07

### Added
- **📚 Mis documentos**: biblioteca en `localStorage` con abrir, renombrar y borrar.
- **🎛 Barra de formato** completa (títulos, énfasis, listas, citas, enlaces, tablas…).
- **Autoguardado** a los 1,2 s con indicador en el pie (`● sin guardar` / `✔ hace 5 s`).
- **📑 Esquema** de títulos con navegación y resaltado del título activo.
- Cuenta de palabras y tiempo de lectura.

### Changed
- Aviso al cerrar la pestaña con cambios sin guardar.

## [1.0.0] — 2026-10-07

### Added
- Primera versión: pantalla partida (editor | vista previa en vivo).
- Crear, abrir y guardar archivos `.md`.
- Botones de tema claro/oscuro y diseño responsive.
- Icono y favicon SVG propios.
- Listo para GitHub Pages (`.nojekyll`).

[1.9.1]: #191--2026-10-07
[1.9.0]: #190--2026-10-07
[1.8.0]: #180--2026-10-07
[1.7.0]: #170--2026-10-07
[1.6.0]: #160--2026-10-07
[1.5.1]: #151--2026-10-07
[1.5.0]: #150--2026-10-07
[1.4.0]: #140--2026-10-07
[1.3.0]: #130--2026-10-07
[1.2.0]: #120--2026-10-07
[1.1.0]: #110--2026-10-07
[1.0.0]: #100--2026-10-07
