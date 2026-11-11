# 📝 Markdown Editor

[![CI](https://github.com/alberto2005-coder/markdown-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/alberto2005-coder/markdown-editor/actions/workflows/ci.yml)

[Español](#español) · [English](#english)

---

## Español

### Índice

- [Descripción](#descripción)
- [Características](#características)
- [Estructura](#estructura)
- [Documentación](#documentación)
- [Inicio rápido](#inicio-rápido)
- [Publicar en GitHub Pages](#publicar-en-github-pages)
- [Versión de escritorio e instalador](#versión-de-escritorio-e-instalador)
- [Comprobaciones automáticas (CI)](#comprobaciones-automáticas-ci)
- [Tecnologías](#tecnologías)
- [Problemas frecuentes](#problemas-frecuentes)
- [Licencia](#licencia)

### Descripción

Editor de Markdown con **pantalla partida en dos**: escribes a la izquierda y ves el resultado a la derecha en tiempo real. Incluye biblioteca de documentos, autoguardado, deshacer/rehacer, exportación a HTML/PDF y compartir por enlace.

**100 % estático** · sin servidor · sin base de datos · listo para GitHub Pages.

### Características

- ✍️ **Vista previa en vivo** mientras escribes.
- 🌐 **Español / English**: cambia de idioma con un botón (también en ⚙️ Ajustes).
- 🕘 **Historial de versiones**: copias automáticas por documento, para volver a versiones de hace minutos o días.
- 🔍 **Buscar y reemplazar** (`Ctrl+F`) con contador de coincidencias.
- 🗂 **Modos de vista**: solo editor, pantalla dividida o solo vista previa.
- ⚙️ **Ajustes de edición**: fuente, tamaño del texto y ancho de lectura.
- 📄 **Plantillas** al crear: apuntes, README, informe o lista de tareas.
- 📚 **Mis documentos**: biblioteca en tu navegador para abrir, renombrar y borrar.
- 🗑️ **Papelera**: lo borrado se puede restaurar (o borrar para siempre).
- 📦 **ZIP**: descarga toda la biblioteca en un solo `.zip`, sin librerías.
- 💾 **Autoguardado** con indicador en el pie.
- 🧳 **Respaldo** de la biblioteca a un `.json` y restauración.
- 🎛 **Barra de formato**: títulos, negrita, listas, tareas, citas, enlaces, tablas…
- ↶↷ **Deshacer / rehacer** con botones y `Ctrl+Z` / `Ctrl+Y`.
- 📊 **Tabla con rejilla de tamaño** estilo Word (columnas × filas).
- 📑 **Esquema** de títulos para moverte por documentos largos.
- 📤 **Exportar** a `.md`, página HTML con estilo propio, PDF o portapapeles.
- 🔗 **Compartir por enlace**: el documento viaja dentro de la URL.
- 🖼 **Pegar capturas** con `Ctrl+V` o **arrastrar y soltar** un `.md` o una imagen.
- ❓ **Guía de Markdown** integrada.
- 🌙 Tema claro/oscuro y diseño responsive.

### Estructura

```text
markdown-editor/
├── index.html               ← la página (doble clic para abrir)
├── README.md                ← este índice
├── CHANGELOG.md             ← historial de versiones
├── LICENSE                  ← licencia GPL-3.0
├── .nojekyll                ← para GitHub Pages
├── .gitignore / .editorconfig
│
├── css/style.css            ← diseño y variables de tema
├── js/app.js                ← toda la lógica
├── js/i18n.js               ← diccionario de textos (español / inglés)
├── scripts/check.js         ← validador del proyecto (sin dependencias)
├── .github/workflows/ci.yml ← CI: comprueba todo en cada push
│
├── assets/
│   ├── icon.svg             ← logotipo
│   └── favicon.svg          ← icono de pestaña
│
├── desktop/                 ← versión de escritorio e instalador Windows
│   ├── package.json         ← scripts de empaquetado (Electron)
│   ├── main.js              ← proceso principal de la app nativa
│   ├── prepare.js           ← sincronizador de archivos web
│   ├── generate-icon.js     ← generador de icon.ico nativo
│   ├── icon.ico             ← icono multi-resolución de Windows
│   └── setup.iss            ← script de Inno Setup 7
│
└── docs/
    ├── USUARIO.md           ← manual de usuario
    └── DESARROLLADOR.md     ← guía técnica
```

### Documentación

| Documento | Para quién | Qué contiene |
|---|---|---|
| 📖 [Manual de usuario](docs/USUARIO.md) | Quien usa la web | Primeros pasos, cada botón, atajos, ejemplos, casos de uso y preguntas frecuentes |
| 🛠 [Guía técnica](docs/DESARROLLADOR.md) | Quien toca el código | Arquitectura, mapa de `app.js`, modelo de datos, cómo añadir un botón o una exportación, checklist y roadmap |
| 📄 [Changelog](CHANGELOG.md) | Todos | Qué ha cambiado en cada versión |
| ⚖️ [Licencia](LICENSE) | Todos | **GPL-3.0** de Alberto Ortiz (`alberto2005-coder`) |

### Inicio rápido

**En local:** doble clic en `index.html`.

**Con servidor local:**

```powershell
cd Downloads\markdown-editor
py -m http.server 8777
# abre http://127.0.0.1:8777/
```

**Atajos esenciales:**

| Tecla | Acción |
|---|---|
| `Ctrl + S` | Guardar (biblioteca + descargar `.md`) |
| `Ctrl + O` / `Ctrl + N` | Abrir / nuevo |
| `Ctrl + Z` / `Ctrl + Y` | Deshacer / rehacer |
| `Ctrl + F` | Buscar y reemplazar |
| `Ctrl + B` / `Ctrl + I` | Negrita / cursiva |
| `Ctrl + V` | Pegar imagen |

### Publicar en GitHub Pages

1. Crea un repositorio público (por ejemplo `markdown-editor`).
2. Sube el contenido de la carpeta: `index.html`, `README.md`, `CHANGELOG.md`, `LICENSE`, `.nojekyll`, `css/`, `js/`, `assets/` y `docs/`.
3. **Settings → Pages → Source: Deploy from a branch** → rama **`main`** / **`(root)`** → **Save**.
4. En un minuto estará en `https://TU-USUARIO.github.io/markdown-editor/`.

Con Git, desde la carpeta:

```powershell
git init
git add .
git commit -m "Markdown Editor 1.9.2"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/markdown-editor.git
git push -u origin main
```

### Versión de escritorio e instalador

Además del navegador y GitHub Pages, el editor se puede compilar como aplicación nativa de Windows e instalarse con un `.exe` generado con **Inno Setup 7**.

**1. Empaquetar la aplicación**

```powershell
cd desktop
npm install
npm run pack
```

El proceso:

1. Sincroniza `index.html`, `css/`, `js/` y `assets/` en `desktop/src/`.
2. Genera el icono multi-resolución `icon.ico`.
3. Empaqueta el ejecutable en `desktop/dist/Markdown Editor-win32-x64/Markdown Editor.exe`.

**2. Generar el instalador**

- **Desde el Explorador:** clic derecho en [`desktop/setup.iss`](desktop/setup.iss) → **Compile**.
- **Desde la consola:**

  ```powershell
  cd desktop
  iscc setup.iss
  ```

Resultado: `desktop/Output/MarkdownEditor_Setup_v1.0.0.exe`, con estilo moderno para Windows 10/11, instalación por usuario o para todo el equipo, accesos directos opcionales, aceptación obligatoria de la GPL-3.0 y desinstalador registrado.

> La carpeta `desktop/` está aislada: no interfiere con el despliegue web.

### Comprobaciones automáticas (CI)

Cada *push* o *pull request* ejecuta GitHub Actions:

1. **Sintaxis** de `js/app.js` y `js/i18n.js`.
2. **`scripts/check.js`**: rutas rotas, `id` faltantes o duplicados, botones sin `case`, variables CSS sin definir, metadatos, enlaces de documentación y coherencia del diccionario.
3. **Servido real**: que HTML, CSS, JS e iconos respondan.
4. **Artefacto** descargable con el proyecto.

En local, sin instalar nada:

```powershell
node scripts/check.js
```

Si sale ❌, el proyecto **no está listo para publicarse**.

### Tecnologías

- HTML + CSS + JavaScript puros (sin frameworks ni build).
- [marked](https://marked.js.org/) — Markdown → HTML (CDN).
- [DOMPurify](https://github.com/cure53/DOMPurify) — saneado del HTML renderizado.
- SVG vectorial para iconos.

### Problemas frecuentes

| Problema | Solución |
|---|---|
| La vista previa sale en texto plano | Sin internet: `marked` va por CDN. Recupera la conexión |
| Se perdió la biblioteca | Vive en el navegador: **📚 Mis docs → ⬇️ Respaldo** y **⬆️ Restaurar** en el equipo nuevo |
| Borré un documento por error | **📚 Mis docs → 🗑️ Papelera → ♻️** lo devuelve |
| Quiero la web en inglés | **🌐 EN** en la barra superior o **⚙️ Ajustes → Idioma** (se recuerda) |
| GitHub Pages no muestra nada | Comprueba que `.nojekyll` está subido y `index.html` en la raíz |

Hay más en el [manual de usuario](docs/USUARIO.md).

### Licencia

**GPL-3.0** de **Alberto Ortiz (`alberto2005-coder`)**:

- ✅ Uso personal, educativo, comercial y de modificación libre.
- 🔁 Si distribuyes versiones modificadas, publica el código bajo la misma licencia (copyleft).
- 🔗 Ver [LICENSE](LICENSE) para el texto completo.

Las bibliotecas `marked` y `DOMPurify` mantienen su licencia **MIT** original.

---

## English

### Table of contents

- [Overview](#overview)
- [Features](#features)
- [Repository structure](#repository-structure)
- [Documentation](#documentation)
- [Quickstart](#quickstart)
- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Desktop version and installer](#desktop-version-and-installer)
- [Automated testing (CI)](#automated-testing-ci)
- [Tech stack](#tech-stack)
- [FAQ](#faq)
- [License](#license)

### Overview

A Markdown editor with a **split-screen view**: write on the left and watch the rendered output on the right in real time. It ships a document library, autosave, undo/redo, HTML/PDF export and link sharing.

**100 % static** · no server · no database · ready for GitHub Pages.

### Features

- ✍️ **Live preview** while you type.
- 🌐 **Spanish / English**: switch languages with one click (⚙️ Settings too).
- 🕘 **Version history**: automatic per-document snapshots, so you can go back to a version from minutes or days ago.
- 🔍 **Find and replace** (`Ctrl+F`) with a match counter.
- 🗂 **View modes**: editor only, split screen or preview only.
- ⚙️ **Editor settings**: font, text size and readable line width.
- 📄 **Templates** on create: notes, README, report or task list.
- 📚 **My documents**: an in-browser library to open, rename and delete.
- 🗑️ **Trash**: deleted items can be restored (or removed for good).
- 📦 **ZIP**: download the whole library as a single `.zip`, dependency-free.
- 💾 **Autosave** with a footer indicator.
- 🧳 **Backup** the library to a `.json` file and restore it.
- 🎛 **Formatting toolbar**: headings, bold, lists, tasks, quotes, links, tables…
- ↶↷ **Undo / redo** with buttons and `Ctrl+Z` / `Ctrl+Y`.
- 📊 **Word-style table grid** (columns × rows).
- 📑 **Heading outline** to navigate long documents.
- 📤 **Export** to `.md`, a self-styled HTML page, PDF or the clipboard.
- 🔗 **Share by link**: the document travels inside the URL.
- 🖼 **Paste screenshots** with `Ctrl+V`, or **drag and drop** a `.md` file or an image.
- ❓ **Built-in Markdown guide**.
- 🌙 Light/dark theme and responsive layout.

### Repository structure

```text
markdown-editor/
├── index.html               ← the page (double-click to open)
├── README.md                ← this index
├── CHANGELOG.md             ← version history
├── LICENSE                  ← GPL-3.0 license
├── .nojekyll                ← for GitHub Pages
├── .gitignore / .editorconfig
│
├── css/style.css            ← styles and theme variables
├── js/app.js                ← all the logic
├── js/i18n.js               ← text dictionary (Spanish / English)
├── scripts/check.js         ← project validator (no dependencies)
├── .github/workflows/ci.yml ← CI: checks every push
│
├── assets/
│   ├── icon.svg             ← logo
│   └── favicon.svg          ← tab icon
│
├── desktop/                 ← desktop build and Windows installer
│   ├── package.json         ← packaging scripts (Electron)
│   ├── main.js              ← native app main process
│   ├── prepare.js           ← web asset synchronizer
│   ├── generate-icon.js     ← native icon.ico generator
│   ├── icon.ico             ← multi-resolution Windows icon
│   └── setup.iss            ← Inno Setup 7 script
│
└── docs/
    ├── USUARIO.md           ← user manual (Spanish)
    └── DESARROLLADOR.md     ← developer guide (Spanish)
```

### Documentation

| Document | Audience | Contents |
|---|---|---|
| 📖 [User manual](docs/USUARIO.md) | Web users | Getting started, every button, shortcuts, examples, use cases and FAQ |
| 🛠 [Developer guide](docs/DESARROLLADOR.md) | Code contributors | Architecture, `app.js` map, data model, how to add a button or an export, checklist and roadmap |
| 📄 [Changelog](CHANGELOG.md) | Everyone | What changed in each version |
| ⚖️ [License](LICENSE) | Everyone | **GPL-3.0** by Alberto Ortiz (`alberto2005-coder`) |

### Quickstart

**Locally:** double-click `index.html`.

**With a local server:**

```powershell
cd Downloads\markdown-editor
py -m http.server 8777
# open http://127.0.0.1:8777/
```

**Essential shortcuts:**

| Key | Action |
|---|---|
| `Ctrl + S` | Save (library + download `.md`) |
| `Ctrl + O` / `Ctrl + N` | Open / new |
| `Ctrl + Z` / `Ctrl + Y` | Undo / redo |
| `Ctrl + F` | Find and replace |
| `Ctrl + B` / `Ctrl + I` | Bold / italic |
| `Ctrl + V` | Paste image |

### Deploy to GitHub Pages

1. Create a public repository (e.g. `markdown-editor`).
2. Push the contents of this folder: `index.html`, `README.md`, `CHANGELOG.md`, `LICENSE`, `.nojekyll`, `css/`, `js/`, `assets/` and `docs/`.
3. **Settings → Pages → Source: Deploy from a branch** → branch **`main`** / **`(root)`** → **Save**.
4. One minute later it is live at `https://YOUR-USERNAME.github.io/markdown-editor/`.

With Git, from the folder:

```powershell
git init
git add .
git commit -m "Markdown Editor 1.9.2"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/markdown-editor.git
git push -u origin main
```

### Desktop version and installer

Besides the browser and GitHub Pages, the editor can be packaged as a native Windows app and installed with an `.exe` built by **Inno Setup 7**.

**1. Package the app**

```powershell
cd desktop
npm install
npm run pack
```

This pipeline:

1. Synchronizes `index.html`, `css/`, `js/` and `assets/` into `desktop/src/`.
2. Generates the multi-resolution `icon.ico`.
3. Packages the executable at `desktop/dist/Markdown Editor-win32-x64/Markdown Editor.exe`.

**2. Build the installer**

- **From Explorer:** right-click [`desktop/setup.iss`](desktop/setup.iss) → **Compile**.
- **From the console:**

  ```powershell
  cd desktop
  iscc setup.iss
  ```

Output: `desktop/Output/MarkdownEditor_Setup_v1.0.0.exe`, with a modern Windows 10/11 style, per-user or machine-wide install, optional shortcuts, mandatory GPL-3.0 acceptance and a registered uninstaller.

> The `desktop/` folder is isolated: it never affects the web deployment.

### Automated testing (CI)

Every *push* or *pull request* runs GitHub Actions:

1. **Syntax** of `js/app.js` and `js/i18n.js`.
2. **`scripts/check.js`**: broken paths, missing or duplicate `id`s, buttons without a `case`, undefined CSS variables, metadata, documentation links and dictionary consistency.
3. **Real serving**: HTML, CSS, JS and icons must respond.
4. **Artifact** with the project available for download.

Locally, with nothing installed:

```powershell
node scripts/check.js
```

If it prints ❌, the project **is not ready to publish**.

### Tech stack

- Vanilla HTML + CSS + JavaScript (no frameworks, no build).
- [marked](https://marked.js.org/) — Markdown → HTML (CDN).
- [DOMPurify](https://github.com/cure53/DOMPurify) — sanitizes the rendered HTML.
- Vector SVG icons.

### FAQ

| Issue | Solution |
|---|---|
| Preview shows as plain text | No internet: `marked` loads from a CDN. Reconnect |
| Library disappeared | It lives in your browser: **📚 My docs → ⬇️ Backup** regularly and **⬆️ Restore** on the new machine |
| Deleted a document by mistake | **📚 My docs → 🗑️ Trash → ♻️** brings it back |
| I want the UI in English | **🌐 EN** in the top bar or **⚙️ Settings → Language** (remembered) |
| GitHub Pages shows nothing | Check that `.nojekyll` is uploaded and `index.html` sits at the root |

More in the [user manual](docs/USUARIO.md).

### License

**GPL-3.0** by **Alberto Ortiz (`alberto2005-coder`)**:

- ✅ Free for personal, educational and commercial use, and for modification.
- 🔁 If you distribute modified versions, publish the source under the same license (copyleft).
- 🔗 See [LICENSE](LICENSE) for the full text.

The `marked` and `DOMPurify` libraries keep their original **MIT** license.
