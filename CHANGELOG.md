# 📄 Changelog

Todas las versiones notables de **Markdown Editor**.
El formato sigue las convenciones de [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

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

[1.6.0]: #160--2026-10-07
[1.5.1]: #151--2026-10-07
[1.5.0]: #150--2026-10-07
[1.4.0]: #140--2026-10-07
[1.3.0]: #130--2026-10-07
[1.2.0]: #120--2026-10-07
[1.1.0]: #110--2026-10-07
[1.0.0]: #100--2026-10-07
