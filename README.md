# 📝 Markdown Editor

[![CI](https://github.com/alberto2005-coder/markdown-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/alberto2005-coder/markdown-editor/actions/workflows/ci.yml)

Editor de Markdown con **pantalla partida en dos**: escribes a la izquierda y ves
cómo va quedando a la derecha, en tiempo real. Con biblioteca de documentos,
autoguardado, deshacer/rehacer, exportación a HTML/PDF y compartir por enlace.

**100 % estático** · sin servidor · sin base de datos · listo para GitHub Pages.

---

## ✨ Características

- ✍️ **Vista previa en vivo** mientras escribes
- 🌐 **Español / English** — cambia de idioma con un botón (⚙️ Ajustes también)
- 🕘 **Historial de versiones** — copias automáticas por documento: vuelves
  atrás a la versión de hace minutos o días
- 🔍 **Buscar y reemplazar** (`Ctrl+F`) con contador de coincidencias
- 🗂 **Modos de vista**: solo editor, pantalla dividida o solo vista previa
- ⚙️ **Ajustes de edición**: fuente, tamaño del texto y ancho de lectura
- 📄 **Plantillas** al crear: apuntes, README, informe o lista de tareas
- 📚 **Mis documentos** — biblioteca en tu navegador: abrir, renombrar, borrar
- 🗑️ **Papelera**: lo que borras se puede **restaurar** (o borrar para siempre)
- 📦 **ZIP** — descarga toda la biblioteca en un solo `.zip` (sin librerías)
- 💾 **Autoguardado** con indicador en el pie (nada de perder trabajo)
- 🧳 **Respaldo** de toda la biblioteca a un `.json` y restauración
- 🎛 **Barra de formato** — títulos, negrita, listas, tareas, citas, enlaces, tablas…
- ↶↷ **Deshacer / rehacer** con botones y `Ctrl+Z` / `Ctrl+Y`
- 📊 **Tabla con rejilla de tamaño** estilo Word (columnas × filas)
- 📑 **Esquema** de títulos para moverte por documentos largos
- 📤 **Exportar** — `.md`, página HTML con estilo propio, PDF, copiar
- 🔗 **Compartir por enlace** — el documento viaja dentro de la URL
- 🖼 **Pegar capturas** con `Ctrl+V`, o **arrastra y suelta** un `.md` o una imagen
- ❓ **Guía de Markdown** integrada
- 🌙 Tema claro/oscuro y diseño responsive

---

## 📁 Estructura

```
markdown-editor/
├── index.html              ← la página (doble clic para abrir)
├── README.md               ← este índice
├── CHANGELOG.md            ← historial de versiones
├── LICENSE                 ← licencia GPL-3.0
├── .nojekyll               ← para GitHub Pages
├── .gitignore / .editorconfig
│
├── css/style.css           ← diseño y variables de tema
├── js/app.js               ← toda la lógica
├── js/i18n.js              ← diccionario de textos (español / inglés)
├── scripts/check.js        ← validador del proyecto (sin dependencias)
├── .github/workflows/ci.yml ← CI: comprueba todo en cada push
│
├── assets/
│   ├── icon.svg            ← logotipo
│   └── favicon.svg         ← icono de pestaña
│
├── desktop/                ← versión de escritorio e instalador Windows
│   ├── package.json        ← scripts de empaquetado (Electron)
│   ├── main.js             ← proceso principal de la app nativa
│   ├── prepare.js          ← sincronizador de archivos web
│   ├── generate-icon.js    ← generador de icon.ico nativo
│   ├── icon.ico            ← icono multi-resolución de Windows
│   └── setup.iss           ← script de Inno Setup 7 para crear el instalador
│
└── docs/
    ├── USUARIO.md          ← manual de usuario
    └── DESARROLLADOR.md    ← guía técnica
```

---

## 📚 Documentación

| Documento | Para quién | Qué contiene |
|---|---|---|
| 📖 **[Manual de usuario](docs/USUARIO.md)** | Quién usa la web | Primeros pasos, cada botón, atajos, ejemplos, casos de uso y preguntas frecuentes |
| 🛠 **[Guía técnica](docs/DESARROLLADOR.md)** | Quién toca el código | Arquitectura, mapa de `app.js`, modelo de datos, *cómo añadir un botón o una exportación*, checklist y roadmap |
| 📄 **[Changelog](CHANGELOG.md)** | Todos | Qué ha cambiado en cada versión |
| ⚖️ **[Licencia](LICENSE)** | Todos | **GPL-3.0** de Alberto Ortiz (`alberto2005-coder`): uso libre, incluso comercial, con copyleft |

---

## 🚀 Inicio rápido

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

---

## 🌐 Publicar en GitHub Pages

1. Crea un repositorio público en GitHub (ej. `markdown-editor`).
2. Sube **el contenido** de esta carpeta: `index.html`, `README.md`,
   `CHANGELOG.md`, `LICENSE`, `.nojekyll`, `css/`, `js/`, `assets/` y `docs/`.
3. **Settings → Pages → Source: Deploy from a branch** → Branch **`main`** /
   **`(root)`** → **Save**.
4. En ~1 minuto: `https://TU-USUARIO.github.io/markdown-editor/`

Con Git, desde la carpeta:

```powershell
git init
git add .
git commit -m "Markdown Editor 1.9.2"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/markdown-editor.git
git push -u origin main
```

---

## 🖥️ Versión de escritorio e instalador Windows (Inno Setup 7)

Además de ejecutarse en el navegador y servirse en **GitHub Pages**, el editor puede compilarse como aplicación nativa de escritorio para Windows e instalarse mediante un ejecutable (`.exe`) generado con **Inno Setup 7**.

### 1. Empaquetar la aplicación
Desde una terminal en la carpeta `desktop/`:

```powershell
cd desktop
npm install
npm run pack
```

Esto ejecuta los pasos de preparación:
1. Sincroniza los archivos web (`index.html`, `css/`, `js/`, `assets/`) en `desktop/src/`.
2. Genera el icono de Windows multi-resolución `icon.ico`.
3. Empaqueta el ejecutable en `desktop/dist/Markdown Editor-win32-x64/Markdown Editor.exe`.

### 2. Generar el instalador `.exe` con Inno Setup 7

- **Desde el Explorador de Windows:** Clic derecho sobre [`desktop/setup.iss`](desktop/setup.iss) y pulsa **Compile** (o ábrelo con Inno Setup 7 y pulsa **F9**).
- **Desde la consola:**
  ```powershell
  cd desktop
  iscc setup.iss
  ```

El instalador final se creará en:
```
desktop/Output/MarkdownEditor_Setup_v1.0.0.exe
```

Características del instalador:
- Estilo moderno adaptado a **Windows 10 y Windows 11**.
- Instalación seleccionable por usuario o para todo el equipo en `Program Files`.
- Acceso directo opcional en el **Escritorio** y en el **Menú Inicio**.
- Muestra el acuerdo de la licencia [`LICENSE`](LICENSE) (GPL-3.0) para aceptación obligatoria previa.
- Desinstalador automático registrado en el Panel de Control / Configuración de Windows.

> **Importante para GitHub Pages:** La carpeta `desktop/` está completamente aislada. Ninguno de sus archivos ni compilaciones interfiere con el despliegue web.

---

## 🧪 Comprobaciones automáticas (CI)

Cada *push* o *pull request* se comprueba solo (GitHub Actions):

1. **Sintaxis** de `js/app.js` y `js/i18n.js`
2. **`scripts/check.js`** → rutas rotas, `id` faltantes o duplicados, botones sin
   `case`, variables CSS sin definir, metadatos, enlaces de la documentación y
   **coherencia del diccionario** (claves del HTML y de `app.js` en `i18n.js`)
3. **Servido real**: que HTML, CSS, JS e iconos respondan
4. **Artefacto** descargable con el proyecto

En local, sin instalar nada:

```powershell
node scripts/check.js
```

Si sale ❌ el proyecto **no está listo para publicarse**.

---

## 🧰 Tecnologías

- HTML + CSS + JavaScript puros (sin frameworks ni build)
- [marked](https://marked.js.org/) — Markdown → HTML (CDN)
- [DOMPurify](https://github.com/cure53/DOMPurify) — saneado del HTML renderizado
- SVG vectorial para iconos

---

## ❓ Problemas frecuentes

| Problema | Solución |
|---|---|
| La vista previa sale en texto plano | Sin internet: `marked` va por CDN. Conexión y se arregla solo |
| Se perdió la biblioteca | Vive en el navegador: haz **📚 Mis docs → ⬇️ Respaldo** de vez en cuando y **⬆️ Restaurar** en el equipo nuevo |
| Borré un documento por error | No pasa nada: **📚 Mis docs → 🗑️ Papelera → ♻️** lo devuelve |
| Quiero la web en inglés | **🌐 EN** en la barra superior o **⚙️ Ajustes → Idioma** (se recuerda) |
| GitHub Pages no muestra nada | Comprueba que `.nojekyll` está subido y `index.html` en la raíz |

Hay más en el [manual de usuario](docs/USUARIO.md#8-preguntas-frecuentes).

---

## ⚖️ Licencia

**GPL-3.0** de **Alberto Ortiz (`alberto2005-coder`)**:

- ✅ Uso personal, educativo, comercial y de modificación libre
- 🔁 Si distribuyes versiones modificadas, publica su código fuente bajo la misma licencia (copyleft)
- 🔗 Ver [`LICENSE`](LICENSE) — texto completo de la Licencia Pública General GNU v3

Las bibliotecas `marked` y `DOMPurify` mantienen su licencia **MIT** original.
---

Hecho con ❤️ para escribir cómodo y ver el resultado al momento.


# 📝 Markdown Editor

Markdown editor with a **split-screen view**: write on the left and see the rendered output on the right in real time. Features a document library, autosave, undo/redo, HTML/PDF export, and link sharing.

**100% static** · no server · no database · ready for GitHub Pages.

---

## ✨ Features

* ✍️ **Live preview** as you type
* 🌐 **Spanish / English** — switch languages with one click (⚙️ Settings included)
* 🕘 **Version history** — automatic snapshots per document: revert back to versions from minutes or days ago
* 🔍 **Find and replace** (`Ctrl+F`) with match counter
* 🗂 **View modes**: editor only, split screen, or preview only
* ⚙️ **Editor settings**: font family, text size, and readable line width
* 📄 **Starter templates**: notes, README, report, or task checklist
* 📚 **My documents** — in-browser library: open, rename, delete
* 🗑️ **Trash bin**: deleted files can be **restored** (or permanently removed)
* 📦 **ZIP export** — download your entire library in a single `.zip` (dependency-free)
* 💾 **Autosave** with footer status indicator (never lose your work)
* 🧳 **Library backup** to a single `.json` file and restore
* 🎛 **Formatting toolbar** — headings, bold, lists, tasks, blockquotes, links, tables…
* ↶↷ **Undo / redo** via buttons and `Ctrl+Z` / `Ctrl+Y`
* 📊 **Table grid selector** Word-style (columns × rows)
* 📑 **Heading outline** for smooth navigation across long documents
* 📤 **Export** — `.md`, self-styled HTML page, PDF, or copy to clipboard
* 🔗 **Share via link** — document payload stored directly inside the URL
* 🖼 **Paste screenshots** with `Ctrl+V`, or **drag and drop** `.md` files and images
* ❓ **Integrated Markdown guide**
* 🌙 Light/dark theme toggle and responsive layout

---

## 📁 Repository Structure

```
markdown-editor/
├── index.html              ← main page (double-click to open)
├── README.md               ← this index
├── CHANGELOG.md            ← version history
├── LICENSE                 ← GPL-3.0 license
├── .nojekyll               ← GitHub Pages bypass
├── .gitignore / .editorconfig
│
├── css/style.css           ← styles and theme variables
├── js/app.js               ← core application logic
├── js/i18n.js              ← translation dictionary (Spanish / English)
├── scripts/check.js        ← project validator (zero dependencies)
├── .github/workflows/ci.yml ← CI pipeline: checks every push
│
├── assets/
│   ├── icon.svg            ← main logo
│   └── favicon.svg         ← browser tab favicon
│
├── desktop/                ← desktop version & Windows installer
│   ├── package.json        ← packaging scripts (Electron)
│   ├── main.js             ← native app main process
│   ├── prepare.js          ← web asset synchronizer
│   ├── generate-icon.js    ← native icon.ico generator
│   ├── icon.ico            ← multi-resolution Windows icon
│   └── setup.iss           ← Inno Setup 7 installer script
│
└── docs/
    ├── USUARIO.md          ← user manual
    └── DESARROLLADOR.md    ← technical developer guide

```

---

## 📚 Documentation

| Document | Target Audience | Contents |
| --- | --- | --- |
| 📖 **[User Manual](https://www.google.com/search?q=docs/USUARIO.md)** | Web users | Getting started, button overview, shortcuts, examples, use cases, and FAQ |
| 🛠 **[Developer Guide](https://www.google.com/search?q=docs/DESARROLLADOR.md)** | Code contributors | Architecture, `app.js` mapping, data model, *how to add buttons or exporters*, checklist, and roadmap |
| 📄 **[Changelog](CHANGELOG.md)** | Everyone | Detailed release notes per version |
| ⚖️ **[License](https://www.google.com/search?q=LICENSE)** | Everyone | **GPL-3.0** by Alberto Ortiz (`alberto2005-coder`): free to use and modify, including commercial use, under copyleft terms |

---

## 🚀 Quickstart

**Locally:** Double-click `index.html`.

**Using a local web server:**

```powershell
cd Downloads\markdown-editor
py -m http.server 8777
# open http://127.0.0.1:8777/

```

**Essential shortcuts:**

| Key Combination | Action |
| --- | --- |
| `Ctrl + S` | Save (to library + download `.md`) |
| `Ctrl + O` / `Ctrl + N` | Open / New document |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo |
| `Ctrl + F` | Find and replace |
| `Ctrl + B` / `Ctrl + I` | Bold / Italic |
| `Ctrl + V` | Paste image |

---

## 🌐 Deploy to GitHub Pages

1. Create a public repository on GitHub (e.g., `markdown-editor`).
2. Push **the contents** of this folder: `index.html`, `README.md`, `CHANGELOG.md`, `LICENSE`, `.nojekyll`, `css/`, `js/`, `assets/`, and `docs/`.
3. Go to **Settings → Pages → Source: Deploy from a branch** → select Branch **`main`** / **`(root)`** → **Save**.
4. In ~1 minute, your site will be live at: `[https://YOUR-USERNAME.github.io/markdown-editor/](https://YOUR-USERNAME.github.io/markdown-editor/)`

Using Git via command line:

```powershell
git init
git add .
git commit -m "Markdown Editor 1.9.2"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/markdown-editor.git
git push -u origin main

```

---

## 🖥️ Desktop Version & Windows Installer (Inno Setup 7)

In addition to running inside the browser and via **GitHub Pages**, the editor can be packaged as a native Windows desktop app and installed with an executable installer (`.exe`) generated by **Inno Setup 7**.

### 1. Package the Application

Open a terminal in the `desktop/` folder:

```powershell
cd desktop
npm install
npm run pack

```

This runs the automated preparation pipeline:

1. Synchronizes web source files (`index.html`, `css/`, `js/`, `assets/`) into `desktop/src/`.
2. Generates the multi-resolution Windows `icon.ico`.
3. Packages the application executable into `desktop/dist/Markdown Editor-win32-x64/Markdown Editor.exe`.

### 2. Generate the Installer (`.exe`) with Inno Setup 7

* **Via File Explorer:** Right-click [`desktop/setup.iss`](https://www.google.com/search?q=desktop/setup.iss) and click **Compile** (or open it with Inno Setup 7 and press **F9**).
* **Via Command Line:**
```powershell
cd desktop
iscc setup.iss

```



The installer will be generated at:

```
desktop/Output/MarkdownEditor_Setup_v1.0.0.exe

```

Installer features:

* Modern UI style compatible with **Windows 10 and Windows 11**.
* Flexible installation: per-user or machine-wide in `Program Files`.
* Optional **Desktop** and **Start Menu** shortcuts.
* Displays the [`LICENSE`](https://www.google.com/search?q=LICENSE) (GPL-3.0) agreement for mandatory acceptance prior to installation.
* Clean uninstaller registered in Windows Settings / Control Panel.

> **Note for GitHub Pages:** The `desktop/` directory is completely isolated. Its files and build outputs do not affect web deployments.

---

## 🧪 Automated Testing (CI)

Every *push* or *pull request* triggers automated checks on GitHub Actions:

1. **Syntax validation** for `js/app.js` and `js/i18n.js`
2. **`scripts/check.js`** → detects broken paths, missing or duplicate `id`s, buttons without handlers, undefined CSS variables, metadata discrepancies, broken documentation links, and **dictionary consistency** (HTML/JS keys vs `i18n.js`)
3. **HTTP server test**: verifies HTML, CSS, JS, and icons serve with HTTP 200
4. **Artifact generation**: bundles the project for download

Run locally without third-party dependencies:

```powershell
node scripts/check.js

```

If it fails with ❌, the project **is not ready for production**.

---

## 🧰 Tech Stack

* Vanilla HTML + CSS + JavaScript (no frameworks or build pipeline required)
* [marked](https://marked.js.org/) — Markdown → HTML parser (via CDN)
* [DOMPurify](https://github.com/cure53/DOMPurify) — rendered HTML sanitization
* Scalable SVG vector icons

---

## ❓ Frequently Asked Questions

| Issue | Solution |
| --- | --- |
| Preview renders as plain text | No internet connection: `marked` loads via CDN. Connect to the internet to fix it |
| Library disappeared | Data is stored in your browser: run **📚 My docs → ⬇️ Backup** regularly, and use **⬆️ Restore** on new devices |
| Accidentally deleted a document | Go to **📚 My docs → 🗑️ Trash → ♻️** to recover it |
| Switch language to English | Click **🌐 EN** in the top bar or go to **⚙️ Settings → Language** (preference is preserved) |
| GitHub Pages returns a 404 or blank screen | Verify `.nojekyll` is uploaded and `index.html` is in the repository root |

For more troubleshooting, consult the [User Manual](https://www.google.com/search?q=docs/USUARIO.md%238-preguntas-frecuentes).

---

## ⚖️ License

**GPL-3.0** by **Alberto Ortiz (`alberto2005-coder`)**:

* ✅ Free for personal, educational, commercial use, and modification
* 🔁 If you distribute modified versions, source code must be shared under the same license (copyleft)
* 🔗 See [`LICENSE`](https://www.google.com/search?q=LICENSE) for the full GNU General Public License v3 text

The `marked` and `DOMPurify` libraries retain their original **MIT** licenses.

---

Built with ❤️ for a distraction-free writing experience and real-time preview.
