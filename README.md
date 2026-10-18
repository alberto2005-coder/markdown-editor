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
├── LICENSE                 ← licencia personalizada (uso no comercial)
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
| ⚖️ **[Licencia](LICENSE)** | Todos | Personalizada de Alberto Ortiz (`alberto2005-coder`): uso libre **no comercial** con atribución |

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
- Muestra el acuerdo de tu licencia personalizada [`LICENSE`](LICENSE) para aceptación obligatoria previa.
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

Licencia **personalizada, no comercial** de **Alberto Ortiz (`alberto2005-coder`)**:

- ✅ Uso personal, educativo y modificación libres (con atribución)
- ❌ No se puede usar con fines comerciales sin autorización escrita
- 🔗 Ver [`LICENSE`](LICENSE) — incluye un resumen de una lectura rápida

Las bibliotecas `marked` y `DOMPurify` mantienen su licencia **MIT** original.

---

Hecho con ❤️ para escribir cómodo y ver el resultado al momento.
