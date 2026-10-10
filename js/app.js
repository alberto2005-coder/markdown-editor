/* =========================================================
   Markdown Editor — crear, abrir, guardar y vista previa
   + biblioteca de documentos, barra de formato, autoguardado
     y esquema de títulos
   ========================================================= */

const editor      = document.getElementById('editor');
const preview     = document.getElementById('preview');
const fileNameIn  = document.getElementById('fileName');
const statsEl     = document.getElementById('stats');
const statusEl    = document.getElementById('status');
const saveInfoEl  = document.getElementById('saveInfo');
const outlinePane = document.getElementById('outlinePane');
const outlineList = document.getElementById('outlineList');
const docsModal   = document.getElementById('docsModal');
const docsListEl  = document.getElementById('docsList');

const DOCS_KEY   = 'md-editor:docs';
const DOC_ID_KEY = 'md-editor:docId';
const THEME_KEY  = 'md-editor:tema';
const LANG_KEY   = 'md-editor:idioma';
const PAPER_KEY  = 'md-editor:papelera';
const HIST_KEY   = 'md-editor:versiones';

/* =========================================================
   0. MODAL PERSONALIZADO (Confirm / Prompt)
   ========================================================= */

function customDialog(message, defaultValue = null) {
  return new Promise(resolve => {
    const modal = document.getElementById('customDialog');
    const msgEl = document.getElementById('dialogMessage');
    const inputEl = document.getElementById('dialogInput');
    const btnCancel = document.getElementById('btnDialogCancel');
    const btnOk = document.getElementById('btnDialogOk');

    if (!modal) {
      // Fallback si no está el HTML
      if (defaultValue !== null) return resolve(prompt(message, defaultValue));
      return resolve(confirm(message));
    }

    const isPrompt = defaultValue !== null;
    msgEl.textContent = message;
    
    if (isPrompt) {
      inputEl.hidden = false;
      inputEl.value = defaultValue;
    } else {
      inputEl.hidden = true;
      inputEl.value = '';
    }

    modal.hidden = false;
    if (isPrompt) inputEl.focus();

    const cleanup = () => {
      modal.hidden = true;
      btnCancel.onclick = null;
      btnOk.onclick = null;
      inputEl.onkeyup = null;
    };

    btnCancel.onclick = () => {
      cleanup();
      resolve(isPrompt ? null : false);
    };

    btnOk.onclick = () => {
      cleanup();
      resolve(isPrompt ? inputEl.value : true);
    };

    inputEl.onkeyup = (e) => {
      if (e.key === 'Enter') btnOk.click();
      if (e.key === 'Escape') btnCancel.click();
    };
  });
}

const customConfirm = (msg) => customDialog(msg);
const customPrompt = (msg, def) => customDialog(msg, def);

/* =========================================================
   0.1. IDIOMA (es / en) — cadenas en js/i18n.js
   ========================================================= */

let idioma = 'es';

function cargarIdioma() {
  let guardado = null;
  try { guardado = localStorage.getItem(LANG_KEY); } catch (e) {}
  idioma = guardado || ((navigator.language || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es');
  if (!window.I18N || !I18N[idioma]) idioma = 'es';
}

/** Traduce una clave. Admite parámetros: t('msg.saved', { n: 'apuntes.md' }) */
function t(clave, params) {
  const dict = (window.I18N && (I18N[idioma] || I18N.es)) || {};
  let txt = dict[clave];
  if (txt === undefined && window.I18N) txt = I18N.es[clave];
  if (txt === undefined) txt = clave;
  if (params) {
    Object.keys(params).forEach(k => { txt = txt.split('{' + k + '}').join(params[k]); });
  }
  return txt;
}

/** Vuelca el diccionario sobre la página y refresca lo dinámico. */
function aplicarIdioma() {
  document.documentElement.lang = idioma;

  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const v = t(el.dataset.i18nTitle);
    el.title = v;
    el.setAttribute('aria-label', v);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });

  document.title = t('doc.title');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = t('doc.desc');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = t('doc.ogdesc');

  const btnIdioma = document.getElementById('btnIdioma');
  if (btnIdioma) btnIdioma.textContent = idioma === 'es' ? '🌐 EN' : '🌐 ES';
  const selIdioma = document.getElementById('ajIdioma');
  if (selIdioma) selIdioma.value = idioma;

  // cadenas generadas por código
  actualizarSaveInfo();
  pintaListaDocs();
  actualizaBarraDocs();
  construirGrid();
  render();
  setMensaje(t('msg.listo'));
}

function cambiaIdioma() { ponIdioma(idioma === 'es' ? 'en' : 'es'); }

/** Fija el idioma (botón de la barra o desplegable de ⚙️ Ajustes). */
function ponIdioma(nuevo) {
  if (nuevo !== 'es' && nuevo !== 'en') return;
  idioma = nuevo;
  try { localStorage.setItem(LANG_KEY, idioma); } catch (e) {}
  aplicarIdioma();
}

document.getElementById('btnIdioma').addEventListener('click', cambiaIdioma);
document.getElementById('ajIdioma').addEventListener('change', e => ponIdioma(e.target.value));

/** Documento de ejemplo de la primera visita (según el idioma). */
function demo() { return t('demo.body'); }

/* =========================================================
   1. BIBLIOTECA DE DOCUMENTOS (localStorage)
   ========================================================= */

let docs       = [];   // [{id, name, content, updated}]
let currentId  = null; // id del documento abierto
let dirty      = false; // hay cambios sin autoguardar
let savedAt    = null;  // timestamp del último guardado

function cargarDocs() {
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    docs = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(docs)) docs = [];
    currentId = localStorage.getItem(DOC_ID_KEY) || null;
    if (currentId && !docs.some(d => d.id === currentId)) currentId = null;
  } catch (e) { docs = []; }
}

function escribirDocs() {
  try {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    localStorage.setItem(DOC_ID_KEY, currentId || '');
    return true;
  } catch (e) {
    setMensaje(t('msg.saveerr'));
    return false;
  }
}

function docActual() {
  return docs.find(d => d.id === currentId) || null;
}

/** Guarda el contenido actual en la biblioteca (crea el doc si no existe). */
function persistir(silencioso) {
  const nombre = (fileNameIn.value || t('msg.defaultname')).trim() || t('msg.defaultname');
  let d = docActual();

  if (!d) {
    d = { id: 'd' + Date.now() + Math.random().toString(36).slice(2, 6),
          name: nombre, content: editor.value, updated: Date.now() };
    docs.unshift(d);
    currentId = d.id;
  } else {
    d.name    = nombre;
    d.content = editor.value;
    d.updated = Date.now();
    // ordenar: el abierto arriba del todo
    docs = [d, ...docs.filter(x => x.id !== d.id)];
  }

  if (escribirDocs()) {
    dirty = false;
    savedAt = Date.now();
    guardaVersionActual(false);   // copia para el historial de versiones
    actualizarSaveInfo();
    pintaListaDocs();
    if (!silencioso) setMensaje(t('msg.saved', { n: d.name + '.md' }));
  }
}

/* =========================================================
   2. MODAL "MIS DOCUMENTOS"
   ========================================================= */

function fechaCorta(ts) {
  try {
    return new Date(ts).toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-ES',
      { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
}

/** "{n} palabras · {f}" con el singular correcto (pasa las dos claves). */
function metaTexto(palabras, plural, singular, param) {
  return t(palabras === 1 ? singular : plural, { n: palabras, f: param, t: param });
}

function pintaListaDocs() {
  docsListEl.innerHTML = '';

  if (vistaVersiones) { pintaVersiones(); return; }
  if (vistaPapelera) { pintaPapelera(); return; }

  const ordenados = [...docs].sort((a, b) => b.updated - a.updated);

  if (!ordenados.length) {
    docsListEl.innerHTML = `<p class="docs-empty">${escapar(t('docs.empty'))}</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  ordenados.forEach(d => {
    const activo = d.id === currentId;
    const palabras = (d.content.match(/\S+/g) || []).length;

    const item = document.createElement('div');
    item.className = 'doc-item' + (activo ? ' activo' : '');
    item.innerHTML = `
      <div class="doc-info" role="button" tabindex="0" title="${escapar(t('docs.open.t', { n: d.name }))}">
        <span class="doc-name">${activo ? '📄 ' : '📕 '}${escapar(d.name)}.md</span>
        <span class="doc-meta">${escapar(metaTexto(palabras, 'docs.meta', 'docs.meta1', fechaCorta(d.updated)))}</span>
      </div>
      <div class="doc-tools">
        <button class="mini" data-act="hist" title="${escapar(t('docs.hist.t'))}">🕘</button>
        <button class="mini" data-act="renombrar" title="${escapar(t('docs.rename.t'))}">✏️</button>
        <button class="mini" data-act="borrar" title="${escapar(t('docs.delete.t'))}">🗑️</button>
      </div>`;

    item.querySelector('.doc-info').addEventListener('click', () => abrirDoc(d.id));
    item.querySelector('[data-act="hist"]').addEventListener('click', () => abreVersiones(d.id));
    item.querySelector('[data-act="renombrar"]').addEventListener('click', () => renombrarDoc(d.id));
    item.querySelector('[data-act="borrar"]').addEventListener('click', () => borrarDoc(d.id));
    fragment.appendChild(item);
  });
  
  docsListEl.appendChild(fragment);
}

/* ---------- papelera: documentos borrados (se pueden restaurar) ---------- */

let papelera = [];      // [{...doc, borrado: ts}] — máximo PAPELERA_MAX
let vistaPapelera = false;
const PAPELERA_MAX = 10;

function cargarPapelera() {
  try {
    papelera = JSON.parse(localStorage.getItem(PAPER_KEY)) || [];
    if (!Array.isArray(papelera)) papelera = [];
  } catch (e) { papelera = []; }
}

function escribirPapelera() {
  try { localStorage.setItem(PAPER_KEY, JSON.stringify(papelera)); } catch (e) {}
  actualizaBarraDocs();
}

/** Pinta la barra del modal según la vista activa: lista, papelera o versiones. */
function actualizaBarraDocs() {
  const btn = document.getElementById('btnTrash');
  const vaciar = document.getElementById('btnVaciar');
  if (btn) {
    const fuera = vistaPapelera || vistaVersiones;
    const etiqueta = fuera ? t('docs.back') : t('docs.trash');
    const cuenta = vistaVersiones ? 0 : papelera.length;
    btn.textContent = cuenta ? `${etiqueta} (${cuenta})` : etiqueta;
  }
  if (vaciar) vaciar.hidden = !(vistaPapelera && papelera.length);

  // en la vista de versiones solo se navega: se ocultan el resto de acciones
  ['btnNewDoc', 'btnBackup', 'btnZip', 'btnRestore'].forEach(idBtn => {
    const el = document.getElementById(idBtn);
    if (el) el.hidden = vistaVersiones;
  });
}

function pintaPapelera() {
  if (!papelera.length) {
    docsListEl.innerHTML = `<p class="docs-empty">${escapar(t('docs.trash.empty'))}</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  papelera.forEach((d, i) => {
    const palabras = (String(d.content || '').match(/\S+/g) || []).length;
    const item = document.createElement('div');
    item.className = 'doc-item';
    item.innerHTML = `
      <div class="doc-info" role="button" tabindex="0" title="${escapar(t('docs.restore.btn'))}">
        <span class="doc-name">🗑️ ${escapar(d.name)}.md</span>
        <span class="doc-meta">${escapar(metaTexto(palabras, 'docs.meta', 'docs.meta1', fechaCorta(d.borrado || d.updated)))}</span>
      </div>
      <div class="doc-tools">
        <button class="mini" data-act="restaurar" title="${escapar(t('docs.restore.btn'))}">♻️</button>
        <button class="mini" data-act="definitivo" title="${escapar(t('docs.deleteforever'))}">❌</button>
      </div>`;

    item.querySelector('.doc-info').addEventListener('click', () => restaurarDoc(i));
    item.querySelector('[data-act="restaurar"]').addEventListener('click', () => restaurarDoc(i));
    item.querySelector('[data-act="definitivo"]').addEventListener('click', () => borrarDefinitivo(i));
    fragment.appendChild(item);
  });
  
  docsListEl.appendChild(fragment);
}

function restaurarDoc(i) {
  const d = papelera[i];
  if (!d) return;
  papelera.splice(i, 1);
  // si ya existe un documento con ese id, se le da uno nuevo
  if (docs.some(x => x.id === d.id)) d.id = 'd' + Date.now() + Math.random().toString(36).slice(2, 6);
  delete d.borrado;
  docs.unshift(d);
  escribirDocs();
  escribirPapelera();
  pintaListaDocs();
  setMensaje(t('msg.trashrestored', { n: d.name + '.md' }));
}

async function borrarDefinitivo(i) {
  const d = papelera[i];
  if (!d) return;
  if (!(await customConfirm(t('msg.confirmpurge', { n: d.name + '.md' })))) return;   // no vuelve a la biblioteca
  papelera.splice(i, 1);
  escribirPapelera();
  borraVersiones(d.id);                 // sin vuelta atrás posible
  pintaListaDocs();
  setMensaje(t('msg.trashpurged', { n: d.name + '.md' }));
}

async function vaciarPapelera() {
  if (!papelera.length) return;
  const n = papelera.length;
  if (!(await customConfirm(t('msg.vaciar', { n: n })))) return;
  papelera.forEach(d => borraVersiones(d.id));
  papelera = [];
  escribirPapelera();
  pintaListaDocs();
  setMensaje(t('msg.trashpurged', { n: n }));
}

/* ---------- historial de versiones: copia automática por documento ---------- */

let versiones = {};      // { [idDoc]: [{ ts, name, content }] }
let vistaVersiones = false;
let versionesDe = null;  // documento cuyas versiones se están viendo
const VERSIONES_MAX = 20;   // copias que se guardan por documento
const VERSIONES_MS  = 60000; // una copia como mucho por minuto

function cargarVersiones() {
  try {
    const raw = JSON.parse(localStorage.getItem(HIST_KEY));
    versiones = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  } catch (e) { versiones = {}; }
}

function escribirVersiones() {
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(versiones));
    return true;
  } catch (e) {
    // sin sitio: se recortan las copias más antiguas y se vuelve a intentar
    try {
      Object.keys(versiones).forEach(k => { versiones[k] = versiones[k].slice(0, 3); });
      localStorage.setItem(HIST_KEY, JSON.stringify(versiones));
      return true;
    } catch (e2) { return false; }
  }
}

/**
 * Guarda una copia del documento abierto para poder volver atrás.
 * Con `forzar` (al cambiar de documento) se salta el límite de un minuto.
 */
function guardaVersionActual(forzar) {
  const d = docActual();
  if (!d || !d.content) return;
  const lista = versiones[d.id] || [];
  const ultima = lista[0];
  if (ultima && ultima.content === d.content && ultima.name === d.name) return;
  if (!forzar && ultima && Date.now() - ultima.ts < VERSIONES_MS) return;
  lista.unshift({ ts: Date.now(), name: d.name, content: d.content });
  versiones[d.id] = lista.slice(0, VERSIONES_MAX);
  escribirVersiones();
}

function borraVersiones(id) {
  if (!versiones[id]) return;
  delete versiones[id];
  escribirVersiones();
}

/* ---------- vista "versiones de un documento" dentro de Mis docs ---------- */

function abreVersiones(id) {
  versionesDe = id;
  vistaVersiones = true;
  vistaPapelera = false;
  actualizaBarraDocs();
  pintaListaDocs();
}

function cierraVersiones() {
  vistaVersiones = false;
  versionesDe = null;
}

function pintaVersiones() {
  const d = docs.find(x => x.id === versionesDe);
  const lista = versiones[versionesDe] || [];

  if (!d) {
    docsListEl.innerHTML = `<p class="docs-empty">${escapar(t('docs.hist.gone'))}</p>`;
    return;
  }

  docsListEl.innerHTML = `<p class="modal-note">🕘 ${escapar(t('docs.hist.for', { n: d.name + '.md' }))}</p>`;

  if (!lista.length) {
    docsListEl.insertAdjacentHTML('beforeend',
      `<p class="docs-empty">${escapar(t('docs.hist.empty'))}</p>`);
    return;
  }

  const fragment = document.createDocumentFragment();

  lista.forEach((v, i) => {
    const palabras = (String(v.content || '').match(/\S+/g) || []).length;
    const item = document.createElement('div');
    item.className = 'doc-item' + (i === 0 ? ' activo' : '');
    item.innerHTML = `
      <div class="doc-info" role="button" tabindex="0" title="${escapar(t('docs.hist.restore.t'))}">
        <span class="doc-name">🕘 ${escapar(fechaCorta(v.ts))}</span>
        <span class="doc-meta">${escapar(metaTexto(palabras, 'docs.vmeta', 'docs.vmeta1', tiempoDesde(v.ts)))}</span>
      </div>
      <div class="doc-tools">
        <button class="mini" data-act="vrestaurar" title="${escapar(t('docs.hist.restore.t'))}">♻️</button>
        <button class="mini" data-act="vborrar" title="${escapar(t('docs.hist.del.t'))}">🗑️</button>
      </div>`;

    item.querySelector('.doc-info').addEventListener('click', () => restauraVersion(i));
    item.querySelector('[data-act="vrestaurar"]').addEventListener('click', () => restauraVersion(i));
    item.querySelector('[data-act="vborrar"]').addEventListener('click', () => borraVersion(i));
    fragment.appendChild(item);
  });
  
  docsListEl.appendChild(fragment);
}

/** Vuelve el documento a la copia elegida (lo actual se guarda antes). */
function restauraVersion(i) {
  const v = (versiones[versionesDe] || [])[i];
  const d = docs.find(x => x.id === versionesDe);
  if (!v || !d) return;

  if (editor.value.trim()) persistir(true);   // lo que hay ahora, primero
  guardaVersionActual(true);                  // y también copiado de seguridad

  currentId = d.id;
  d.content = v.content;
  d.updated = Date.now();
  editor.value = v.content;
  fileNameIn.value = d.name;
  dirty = false;
  savedAt = Date.now();

  escribirDocs();
  reiniciarHistorial();
  cierraVersiones();
  actualizaBarraDocs();
  pintaListaDocs();
  render();
  actualizarSaveInfo();
  setMensaje(t('msg.vrestored', { f: fechaCorta(v.ts) }));
}

async function borraVersion(i) {
  const lista = versiones[versionesDe] || [];
  const v = lista[i];
  if (!v) return;
  if (!(await customConfirm(t('msg.vconfirm', { f: fechaCorta(v.ts) })))) return;
  lista.splice(i, 1);
  if (lista.length) versiones[versionesDe] = lista; else delete versiones[versionesDe];
  escribirVersiones();
  pintaListaDocs();
  setMensaje(t('msg.vdeleted'));
}

function escapar(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function abrirDoc(id) {
  if (id === currentId) { cierraDocs(); return; }
  if (editor.value.trim()) persistir(true);          // nunca se pierde lo actual
  guardaVersionActual(true);                         // copia antes de cambiar
  const d = docs.find(x => x.id === id);
  if (!d) return;
  currentId  = d.id;
  editor.value = d.content;
  fileNameIn.value = d.name;
  escribirDocs();
  reiniciarHistorial();
  cierraDocs();
  render();
  setMensaje(t('msg.opened', { n: d.name + '.md' }));
}

async function renombrarDoc(id) {
  const d = docs.find(x => x.id === id);
  if (!d) return;
  const nuevo = await customPrompt(t('msg.renameprompt'), d.name);
  if (nuevo === null) return;
  const limpio = nuevo.trim() || t('msg.defaultname');
  d.name = limpio;
  d.updated = Date.now();
  if (id === currentId) fileNameIn.value = limpio;
  escribirDocs();
  pintaListaDocs();
  setMensaje(t('msg.renamed', { n: limpio + '.md' }));
}

async function borrarDoc(id) {
  const d = docs.find(x => x.id === id);
  if (!d) return;
  if (!(await customConfirm(t('msg.confirmdelete', { n: d.name + '.md' })))) return;
  docs = docs.filter(x => x.id !== id);

  // a la papelera: se puede restaurar hasta que se vacíe (máx. 10)
  papelera.unshift(Object.assign({}, d, { borrado: Date.now() }));
  if (papelera.length > PAPELERA_MAX) papelera = papelera.slice(0, PAPELERA_MAX);
  escribirPapelera();

  if (currentId === id) {
    currentId = null;
    savedAt = null;
    actualizarSaveInfo();
  }
  escribirDocs();
  pintaListaDocs();
  setMensaje(t('msg.deleted', { n: d.name + '.md' }));
}

function abreDocs() {
  vistaPapelera = false;
  cierraVersiones();
  actualizaBarraDocs();
  pintaListaDocs();
  docsModal.hidden = false;
}
function cierraDocs() { docsModal.hidden = true; }

/* =========================================================
   3. ACCIONES DE ARCHIVO
   ========================================================= */

function nuevo() {
  if (editor.value.trim()) persistir(true);
  guardaVersionActual(true);
  editor.value = '';
  fileNameIn.value = t('msg.defaultname');
  currentId = null;
  dirty = false;
  savedAt = null;
  escribirDocs();
  reiniciarHistorial();
  render();
  editor.focus();
  actualizarSaveInfo();
  setMensaje(t('msg.newdoc'));
}

function abrirDisco() {
  document.getElementById('fileInput').click();
}

function guardar() {
  persistir(false);
  const base = descargar();
  setMensaje(t('msg.savedfile', { n: base }));
}

/** Descarga cualquier texto como archivo. */
function descargarComo(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return nombre;
}

function descargar() {
  const nombre = (fileNameIn.value || t('msg.defaultname')).trim().replace(/[\\/:*?"<>|]/g, '_');
  const base = nombre.endsWith('.md') ? nombre : nombre + '.md';
  descargarComo(editor.value, base, 'text/markdown;charset=utf-8');
  return base;
}

function copiar() {
  navigator.clipboard.writeText(editor.value)
    .then(() => setMensaje(t('msg.copied')))
    .catch(() => setMensaje(t('msg.copyfail')));
}

/** Carga un archivo de texto (.md/.txt) desde el disco y lo abre. */
function abrirArchivoDisco(file) {
  if (!file) return;
  if (!/\.(md|markdown|mdown|txt)$/i.test(file.name) && !/^text\//.test(file.type)) {
    setMensaje(t('msg.badtype', { n: file.name }));
    return;
  }
  const lector = new FileReader();
  lector.onload = () => {
    if (editor.value.trim()) persistir(true);
    editor.value = lector.result;
    fileNameIn.value = file.name.replace(/\.(md|markdown|mdown|txt)$/i, '');
    currentId = null;              // se creará en la biblioteca al primer autoguardado
    reiniciarHistorial();
    render();
    persistir(true);
    setMensaje(t('msg.openedfile', { n: file.name }));
  };
  lector.readAsText(file, 'utf-8');
}

document.getElementById('fileInput').addEventListener('change', (e) => {
  abrirArchivoDisco(e.target.files[0]);
  e.target.value = '';
});

/* =========================================================
   4. AUTOGUARDADO + INDICADOR
   ========================================================= */

let timerAutosave;

function marcarSucio() {
  dirty = true;
  actualizarSaveInfo();
  clearTimeout(timerAutosave);
  timerAutosave = setTimeout(() => persistir(true), 1200); // autoguardado 1,2 s
}

function tiempoDesde(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 15)  return t('msg.now');
  if (s < 60)  return t('msg.ago.s', { n: s });
  const m = Math.floor(s / 60);
  if (m < 60)  return t('msg.ago.min', { n: m });
  const h = Math.floor(m / 60);
  return t('msg.ago.h', { n: h });
}

function actualizarSaveInfo() {
  if (dirty) {
    saveInfoEl.textContent = t('msg.dirty');
    saveInfoEl.classList.add('dirty');
    saveInfoEl.classList.remove('ok');
  } else if (savedAt) {
    saveInfoEl.textContent = t('msg.autosave', { n: tiempoDesde(savedAt) });
    saveInfoEl.classList.remove('dirty');
    saveInfoEl.classList.add('ok');
  } else {
    saveInfoEl.textContent = t('msg.nochanges');
    saveInfoEl.classList.remove('dirty', 'ok');
  }
}

setInterval(actualizarSaveInfo, 10000);

window.addEventListener('beforeunload', (e) => {
  if (dirty) { e.preventDefault(); e.returnValue = ''; }
});

/* =========================================================
   4b. HISTORIAL: DESHACER / REHACER (↶ / ↷)
   ========================================================= */

const btnUndo = document.getElementById('btnUndo');
const btnRedo = document.getElementById('btnRedo');

const MAX_HISTORIAL = 300;
let historial = [];      // estados anteriores
let futuro = [];         // estados para rehacer
let ultimo = null;       // estado tras el último cambio registrado
let pendiente = false;   // cambios de la ráfaga actual sin cerrar
let ultimoCambio = 0;
let timerRafaga;
let restaurando = false;

function snapshot() { return { text: editor.value, caret: editor.selectionStart }; }

function actualizaHistorial() {
  btnUndo.disabled = historial.length === 0;
  btnRedo.disabled = futuro.length === 0;
}

/** Registra un cambio (tecla, botón de formato, tabla…). */
function notaCambio() {
  if (restaurando) return;
  const ahora = Date.now();

  // nuevo paso: se guarda el estado anterior; si la ráfaga es muy larga
  // (más de 4 s escribiendo seguido) se parte en dos
  if (!pendiente || ahora - ultimoCambio > 4000) {
    historial.push(ultimo);
    if (historial.length > MAX_HISTORIAL) historial.shift();
    futuro = [];
    pendiente = true;
    actualizaHistorial();
  }

  ultimoCambio = ahora;
  ultimo = snapshot();
  clearTimeout(timerRafaga);
  timerRafaga = setTimeout(() => { pendiente = false; }, 900);
}

function restaura(paso, mensaje) {
  restaurando = true;
  editor.value = paso.text;
  editor.setSelectionRange(paso.caret, paso.caret);
  restaurando = false;
  render();
  marcarSucio();                    // el estado restaurado se autoguarda
  clearTimeout(timerRafaga);
  ultimo = paso;
  pendiente = false;
  actualizaHistorial();
  setMensaje(mensaje);
}

function deshacer() {
  if (!historial.length) return;
  futuro.push(ultimo);
  restaura(historial.pop(), t('msg.undo'));
}

function rehacer() {
  if (!futuro.length) return;
  historial.push(ultimo);
  restaura(futuro.pop(), t('msg.redo'));
}

/** Vacía el historial (documento nuevo, abrir otro, enlace compartido). */
function reiniciarHistorial() {
  clearTimeout(timerRafaga);
  historial = [];
  futuro = [];
  pendiente = false;
  ultimoCambio = 0;
  ultimo = snapshot();
  actualizaHistorial();
}

/* =========================================================
   5. BARRA DE FORMATO
   ========================================================= */

function envolver(pre, post, ph) {
  const s = editor.selectionStart;
  const f = editor.selectionEnd;
  const sel = editor.value.slice(s, f) || ph || 'texto';
  editor.setRangeText(pre + sel + post, s, f, 'end');
  editor.focus();
  trasCambiar();
}

/** Añade/quita un prefijo en cada línea seleccionada (funciona con línea vacía). */
function prefijo(p) {
  const v = editor.value;
  const s = editor.selectionStart;
  const f = editor.selectionEnd;
  const ini = v.lastIndexOf('\n', s - 1) + 1;
  let fin = v.indexOf('\n', f);
  if (fin === -1) fin = v.length;

  const bloque = v.slice(ini, fin);
  const lineas = bloque.split('\n');
  const hayTexto = bloque.trim() !== '';
  const todas = hayTexto && lineas.every(l => l.startsWith(p));

  const nuevo = lineas
    .map(l => todas ? l.slice(p.length) : p + l)
    .join('\n');

  editor.setRangeText(nuevo, ini, fin, 'end');
  editor.focus();
  trasCambiar();
}

/**
 * Como prefijo(), pero si la línea está vacía deja un texto de ejemplo
 * seleccionado (se sustituye al empezar a escribir, como en Word).
 */
function prefijoConEjemplo(p, ejemplo) {
  const v = editor.value;
  const s = editor.selectionStart;
  const f = editor.selectionEnd;

  if (s !== f) { prefijo(p); return; }          // hay selección → solo prefijo

  const ini = v.lastIndexOf('\n', s - 1) + 1;
  const linea = v.slice(ini, v.indexOf('\n', s) === -1 ? v.length : v.indexOf('\n', s));

  if (linea.trim() !== '') { prefijo(p); return; } // la línea ya tiene texto

  editor.setRangeText(p + ejemplo, s, f, 'end');
  editor.setSelectionRange(s + p.length, s + p.length + ejemplo.length);
  editor.focus();
  trasCambiar();
}

function comando(cmd) {
  switch (cmd) {
    case 'h1':        prefijoConEjemplo('# ', t('ex.h1'));  break;
    case 'h2':        prefijoConEjemplo('## ', t('ex.h2')); break;
    case 'h3':        prefijoConEjemplo('### ', t('ex.h3')); break;
    case 'bold':      envolver('**', '**', t('ex.bold')); break;
    case 'italic':    envolver('*', '*', t('ex.italic')); break;
    case 'strike':    envolver('~~', '~~', t('ex.strike')); break;
    case 'code':      envolver('`', '`', t('ex.code')); break;
    case 'codeblock': envolver('```\n', '\n```', t('ex.code')); break;
    case 'link':      envolver('[', '](https://)', t('ex.link')); break;
    case 'image':     envolver('![', '](https://)', t('ex.image')); break;
    case 'ul':        prefijoConEjemplo('- ', t('ex.item')); break;
    case 'ol':        prefijoConEjemplo('1. ', t('ex.step')); break;
    case 'check':     prefijoConEjemplo('- [ ] ', t('ex.task')); break;
    case 'quote':     prefijoConEjemplo('> ', t('ex.quote')); break;
    case 'table':     insertarTabla(4, 3); break;
    case 'hr':
      editor.setRangeText('\n\n---\n\n', editor.selectionStart, editor.selectionEnd, 'end');
      trasCambiar();
      break;
  }
}

/* =========================================================
   5b. SELECTOR DE TAMAÑO DE TABLA (estilo Word)
   ========================================================= */

const COLS_POP = 8, FILAS_POP = 6;
const tablePop  = document.getElementById('tablePop');
const tableGrid = document.getElementById('tableGrid');
const tableSize = document.getElementById('tableSize');
const btnTable  = document.getElementById('btnTable');

function construirGrid() {
  tableGrid.style.gridTemplateColumns = `repeat(${COLS_POP}, 20px)`;
  tableGrid.innerHTML = '';
  for (let r = 1; r <= FILAS_POP; r++) {
    for (let c = 1; c <= COLS_POP; c++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.title = t('msg.cells', { c: c, f: r });
      cell.addEventListener('mouseenter', () => pintaGrid(r, c));
      cell.addEventListener('focus', () => pintaGrid(r, c));
      cell.addEventListener('click', () => { insertarTabla(c, r); cierraTablaPop(); });
      tableGrid.appendChild(cell);
    }
  }
  pintaGrid(4, 3);
}

function pintaGrid(r, c) {
  tableGrid.querySelectorAll('.cell').forEach(el => {
    const on = Number(el.dataset.r) <= r && Number(el.dataset.c) <= c;
    el.classList.toggle('on', on);
  });
  tableSize.textContent = `${c} × ${r}`;
}

/** Coloca un popover fijo justo debajo de su botón. */
function posicionaPop(pop, btn) {
  const rect = btn.getBoundingClientRect();
  pop.hidden = false;
  const ancho = pop.offsetWidth;
  let izq = rect.left;
  if (izq + ancho > innerWidth - 8) izq = Math.max(8, innerWidth - ancho - 8);
  pop.style.left = izq + 'px';
  pop.style.top = (rect.bottom + 6) + 'px';
}

function abreTablaPop() {
  posicionaPop(tablePop, btnTable);
  pintaGrid(4, 3);
}

function cierraTablaPop() { tablePop.hidden = true; }

function insertarTabla(cols, filas) {
  const cabecera = [], separador = [], cuerpo = [];
  for (let i = 1; i <= cols; i++) cabecera.push(t('ex.col') + i);
  for (let i = 0; i < cols; i++) separador.push('---');
  for (let r = 1; r < filas; r++) cuerpo.push(new Array(cols).fill(''));

  const md =
    '\n\n| ' + cabecera.join(' | ') + ' |\n' +
    '|' + separador.join('|') + '|\n' +
    cuerpo.map(c => '| ' + c.join(' | ') + ' |').join('\n') +
    '\n\n';

  editor.setRangeText(md, editor.selectionStart, editor.selectionEnd, 'end');
  editor.focus();
  trasCambiar();
  setMensaje(t('msg.table', { c: cols, f: filas }));
}

document.getElementById('toolbar').addEventListener('click', (e) => {
  const h = e.target.closest('button[data-hist]');
  if (h) {
    h.dataset.hist === 'undo' ? deshacer() : rehacer();
    return;
  }
  const btn = e.target.closest('button[data-cmd]');
  if (!btn) return;
  if (btn.dataset.cmd === 'table') {
    tablePop.hidden ? abreTablaPop() : cierraTablaPop();
    return;
  }
  cierraTablaPop();
  comando(btn.dataset.cmd);
});

document.addEventListener('click', (e) => {
  if (!tablePop.hidden && !tablePop.contains(e.target) && !btnTable.contains(e.target)) {
    cierraTablaPop();
  }
  if (!exportPop.hidden && !exportPop.contains(e.target) && !btnExport.contains(e.target)) {
    cierraExportPop();
  }
  if (!plantillasPop.hidden && !plantillasPop.contains(e.target) && !btnNew.contains(e.target)) {
    cierraPlantillas();
  }
});

construirGrid();

/* =========================================================
   5c. EXPORTAR (HTML / PDF / MD) Y COMPARTIR POR ENLACE
   ========================================================= */

const exportPop = document.getElementById('exportPop');
const btnExport = document.getElementById('btnExport');
const helpModal = document.getElementById('helpModal');

const CSS_EXPORT = `
  * { box-sizing: border-box; }
  body { max-width: 820px; margin: 0 auto; padding: 42px 22px 70px;
         font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
         color: #1f2430; line-height: 1.7; background: #fff; }
  h1, h2, h3, h4 { line-height: 1.25; margin: 1.4em 0 .5em; }
  h1 { font-size: 2em; border-bottom: 1px solid #e5e7eb; padding-bottom: .25em; }
  h2 { font-size: 1.55em; border-bottom: 1px solid #e5e7eb; padding-bottom: .2em; }
  p { margin: .75em 0; }
  a { color: #2563eb; }
  ul, ol { padding-left: 1.6em; }
  li { margin: .25em 0; }
  blockquote { margin: 1em 0; padding: .2em 1em; color: #6b7280;
               border-left: 4px solid #2563eb; background: #f3f6fe; border-radius: 0 6px 6px 0; }
  code { padding: .15em .4em; background: #eef2ff; border-radius: 5px;
         font: .9em Consolas, Menlo, monospace; }
  pre { padding: 14px 16px; overflow-x: auto; background: #f6f7f9;
        border: 1px solid #e5e7eb; border-radius: 8px; }
  pre code { padding: 0; background: none; }
  table { border-collapse: collapse; margin: 1em 0; width: 100%; }
  th, td { border: 1px solid #e5e7eb; padding: 7px 12px; text-align: left; }
  th { background: #f3f6fe; }
  img { max-width: 100%; border-radius: 8px; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.6em 0; }
  input[type="checkbox"] { margin-right: .5em; }
  footer { margin-top: 46px; padding-top: 14px; border-top: 1px solid #e5e7eb;
           font-size: 12.5px; color: #9ca3af; text-align: center; }
  @media print { body { padding: 0; } footer { display: none; } }
`;

function exportarHTML() {
  const titulo = (fileNameIn.value || t('msg.defaultname')).trim() || t('msg.defaultname');
  const doc =
    `<!DOCTYPE html>\n<html lang="${idioma}">\n<head>\n<meta charset="UTF-8">\n` +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    `<title>${escapar(titulo)}</title>\n<style>${CSS_EXPORT}</style>\n</head>\n<body>\n` +
    `<article>${preview.innerHTML}</article>\n` +
    `<footer>${t('msg.exportfooter')}</footer>\n` +
    '</body>\n</html>\n';

  descargarComo(doc, titulo.replace(/[\\/:*?"<>|]/g, '_') + '.html', 'text/html;charset=utf-8');
  setMensaje(t('msg.exported', { n: titulo + '.html' }));
}

/* --- codificación para compartir por enlace --- */
function aB64(txt) {
  const bytes = new TextEncoder().encode(txt);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function desdeB64(s) {
  let t = s.replace(/-/g, '+').replace(/_/g, '/');
  while (t.length % 4) t += '=';
  const bin = atob(t);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function compartir() {
  const enlace = location.href.split('#')[0] + '#d=' + aB64(editor.value);
  const aviso = enlace.length > 20000 ? '\n\n' + t('msg.linkwarn') : '';

  navigator.clipboard.writeText(enlace)
    .then(() => setMensaje(t('msg.linkcopied') + (aviso ? t('msg.linkaviso') : '')))
    .catch(async () => {
      await customPrompt(t('msg.linkprompt'), enlace);
    });

  if (aviso) setTimeout(() => alert(t('msg.linkalert') + aviso), 150);
}

/** Si la página se abre con #d=..., carga el documento que trae el enlace. */
function cargarDesdeEnlace() {
  if (location.hash.indexOf('#d=') !== 0) return false;
  try {
    const txt = desdeB64(location.hash.slice(3));
    if (!txt) return false;
    editor.value = txt;
    fileNameIn.value = t('msg.sharedname');
    currentId = null;
    history.replaceState(null, '', location.pathname + location.search);
    return true;
  } catch (e) { return false; }
}

/* =========================================================
   5d. PEGAR IMÁGENES (Ctrl+V)
   ========================================================= */

/** Inserta una imagen en base64 donde está el cursor. */
function pegarImagen(file) {
  if (!file) return;
  if (file.size > 1500000) {
    setMensaje(t('msg.imgbig'));
    return;
  }
  const lector = new FileReader();
  lector.onload = () => {
    const md = `![${t('ex.image')}](${lector.result})`;
    editor.setRangeText(md, editor.selectionStart, editor.selectionEnd, 'end');
    trasCambiar();
    const pesa = Math.round(lector.result.length / 1024);
    setMensaje(t('msg.imgok', { n: pesa }));
  };
  lector.readAsDataURL(file);
}

editor.addEventListener('paste', (e) => {
  const items = (e.clipboardData && e.clipboardData.items) || [];
  for (const it of items) {
    if (it.type && it.type.indexOf('image/') === 0) {
      e.preventDefault();
      pegarImagen(it.getAsFile());
      return;
    }
  }
});

/* =========================================================
   5e. MENÚ EXPORTAR Y GUÍA DE MARKDOWN
   ========================================================= */

function cierraExportPop() { exportPop.hidden = true; }

btnExport.addEventListener('click', () => {
  exportPop.hidden ? posicionaPop(exportPop, btnExport) : cierraExportPop();
});

exportPop.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-exp]');
  if (!btn) return;
  cierraExportPop();
  switch (btn.dataset.exp) {
    case 'md':    descargar(); break;
    case 'html':  exportarHTML(); break;
    case 'pdf':   window.print(); break;
    case 'copy':  copiar(); break;
    case 'share': compartir(); break;
  }
});

function cierraAyuda() { helpModal.hidden = true; }

document.getElementById('btnHelp').addEventListener('click', () => { helpModal.hidden = false; });
document.getElementById('btnCloseHelp').addEventListener('click', cierraAyuda);
helpModal.addEventListener('click', (e) => { if (e.target === helpModal) cierraAyuda(); });

/* =========================================================
   6. ESQUEMA DE TÍTULOS
   ========================================================= */

let titulos = []; // [{nivel, texto, linea}]

function construirEsquema() {
  const lineas = editor.value.split('\n');
  titulos = [];
  let enCodigo = false;

  lineas.forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) { enCodigo = !enCodigo; return; }
    if (enCodigo) return;
    const m = l.match(/^(#{1,4})\s+(.*)$/);
    if (m) titulos.push({
      nivel: m[1].length,
      texto: (m[2] || t('msg.sinuntitulo')).replace(/[*_`~]/g, '').trim() || t('msg.sinuntitulo'),
      linea: i
    });
  });

  if (!titulos.length) {
    outlineList.innerHTML = `<p class="outline-empty">${t('msg.outlineempty')}</p>`;
    return;
  }

  outlineList.innerHTML = '';
  titulos.forEach((t2, i) => {
    const b = document.createElement('button');
    b.className = 'outline-item nivel-' + t2.nivel;
    b.dataset.index = i;
    b.textContent = t2.texto;
    b.title = t('msg.line', { n: t2.linea + 1, t: t2.texto });
    b.addEventListener('click', () => saltarA(i));
    outlineList.appendChild(b);
  });
}

function saltarA(i) {
  // coloca el cursor en el editor
  const t = titulos[i];
  const pos = editor.value.split('\n').slice(0, t.linea).join('\n').length + (t.linea ? 1 : 0);
  editor.focus();
  editor.setSelectionRange(pos, pos);
  const alto = editor.scrollHeight / Math.max(1, editor.value.split('\n').length);
  editor.scrollTop = Math.max(0, t.linea * alto - editor.clientHeight / 3);

  // y desplaza la vista previa al título correspondiente
  const h = document.getElementById('sec-' + i);
  if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
  marcaActivo(i);
}

function marcaActivo(idx) {
  outlineList.querySelectorAll('.outline-item').forEach(el => {
    el.classList.toggle('activo', Number(el.dataset.index) === idx);
  });
}

preview.addEventListener('scroll', () => {
  const hs = preview.querySelectorAll('[id^="sec-"]');
  if (!hs.length) return;
  const top = preview.getBoundingClientRect().top;
  let activo = 0;
  hs.forEach((h, i) => { if (h.getBoundingClientRect().top - top <= 70) activo = i; });
  marcaActivo(activo);
}, { passive: true });

/* =========================================================
   7. RENDER DE LA VISTA PREVIA
   ========================================================= */

function render() {
  const md = editor.value;

  if (window.marked) {
    marked.setOptions({ breaks: true, gfm: true });
    const html = marked.parse(md);
    // ADD_URI_SAFE_ATTR permite las imágenes en base64 (data:image/…) que se pegan con Ctrl+V
    preview.innerHTML = window.DOMPurify
      ? DOMPurify.sanitize(html, { ADD_URI_SAFE_ATTR: ['src'] })
      : html;
  } else {
    // Sin conexión: render básico de respaldo
    const tmp = md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br>');
    preview.innerHTML = '<p>' + tmp + '</p>';
  }

  // id a cada título para poder enlazarlos desde el esquema
  preview.querySelectorAll('h1,h2,h3,h4').forEach((h, i) => { h.id = 'sec-' + i; });

  const palabras = (md.match(/\S+/g) || []).length;
  const min = Math.max(1, Math.round(palabras / 200));
  statsEl.textContent = palabras
    ? t(palabras === 1 ? 'msg.stat1' : 'msg.stat', { n: palabras, m: min })
    : t('msg.stat0');

  construirEsquema();
}

let timerRender;
function trasCambiar() {
  notaCambio();
  marcarSucio();
  clearTimeout(timerRender);
  timerRender = setTimeout(render, 90);
}

function setMensaje(txt) { statusEl.textContent = txt; }

/* =========================================================
   8. ATAJOS DE TECLADO
   ========================================================= */

document.addEventListener('keydown', (e) => {
  const ctrl = e.ctrlKey || e.metaKey;
  if (e.key === 'Escape') {
    if (!buscarPanel.hidden) { cierraBuscar(); return; }
    if (!tablePop.hidden) { cierraTablaPop(); return; }
    if (!exportPop.hidden) { cierraExportPop(); return; }
    if (!plantillasPop.hidden) { cierraPlantillas(); return; }
    if (!settingsModal.hidden) { cierraAjustes(); return; }
    if (!helpModal.hidden) { cierraAyuda(); return; }
    if (!docsModal.hidden) { cierraDocs(); return; }
  }
  if (!ctrl) return;
  const k = e.key.toLowerCase();
  if (k === 'z' && e.shiftKey)   { e.preventDefault(); rehacer(); }
  else if (k === 'z')            { e.preventDefault(); deshacer(); }
  else if (k === 'y')            { e.preventDefault(); rehacer(); }
  else if (k === 's')            { e.preventDefault(); guardar(); }
  else if (k === 'o')            { e.preventDefault(); abrirDisco(); }
  else if (k === 'n')            { e.preventDefault(); nuevo(); }
  else if (k === 'b')            { e.preventDefault(); comando('bold'); }
  else if (k === 'i')            { e.preventDefault(); comando('italic'); }
  else if (k === 'k')            { e.preventDefault(); comando('link'); }
  else if (k === 'f') {
    e.preventDefault();
    if (buscarPanel.hidden) {
      buscarPanel.hidden = false;
      buscarTxt.focus();
      buscarTxt.select();
      resaltaDesde(0);
    } else {
      buscarTxt.focus();
      buscarTxt.select();
    }
  }
});

editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end');
    trasCambiar();
  }
});

/* =========================================================
   9. TEMA Y BOTONES
   ========================================================= */

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  document.getElementById('btnTheme').textContent = tema === 'dark' ? '☀️' : '🌙';
  const selTema = document.getElementById('ajTema');
  if (selTema) selTema.value = tema;   // sincroniza el panel de ajustes
  try { localStorage.setItem(THEME_KEY, tema); } catch (e) {}
}

document.getElementById('btnTheme').addEventListener('click', () => {
  const actual = document.documentElement.getAttribute('data-theme');
  aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

document.getElementById('btnNew').addEventListener('click', () => {
  // abre el menú de plantillas (gestionado en la sección 10d)
  plantillasPop.hidden ? posicionaPop(plantillasPop, btnNew) : cierraPlantillas();
});
document.getElementById('btnOpen').addEventListener('click', abrirDisco);
document.getElementById('btnSave').addEventListener('click', guardar);
document.getElementById('btnDocs').addEventListener('click', abreDocs);
document.getElementById('btnNewDoc').addEventListener('click', () => { cierraDocs(); nuevo(); });
document.getElementById('btnCloseDocs').addEventListener('click', cierraDocs);
docsModal.addEventListener('click', (e) => { if (e.target === docsModal) cierraDocs(); });

document.getElementById('btnOutline').addEventListener('click', () => {
  const oculto = outlinePane.classList.toggle('oculto');
  document.getElementById('btnOutline').classList.toggle('on', !oculto);
  try { localStorage.setItem('md-editor:esquema', oculto ? '0' : '1'); } catch (e) {}
});

editor.addEventListener('input', trasCambiar);
fileNameIn.addEventListener('input', marcarSucio);

/* =========================================================
   10. EXTRAS: MODOS, BÚSQUEDA, AJUSTES, PLANTILLAS,
       RESPALDO, ZIP, PAPELERA Y ARRASTRAR ARCHIVOS
   ========================================================= */

/* ---------- 10a. Modos de vista ---------- */
const splitPane = document.querySelector('.split');

function aplicarModo(m) {
  if (['editor', 'split', 'preview'].indexOf(m) === -1) m = 'split';
  splitPane.className = 'split modo-' + m;
  document.querySelectorAll('.modos button').forEach(b =>
    b.classList.toggle('on', b.dataset.modo === m));
  try { localStorage.setItem('md-editor:modo', m); } catch (e) {}
}

document.querySelectorAll('.modos button').forEach(b =>
  b.addEventListener('click', () => aplicarModo(b.dataset.modo)));

/* ---------- 10b. Buscar y reemplazar ---------- */
const buscarPanel   = document.getElementById('buscarPanel');
const buscarTxt     = document.getElementById('buscarTxt');
const reemplazarTxt = document.getElementById('reemplazarTxt');
const buscarCount   = document.getElementById('buscarCount');
let sensibleMayus = false;

function cierraBuscar() { buscarPanel.hidden = true; }

function posicionesBusqueda() {
  const q = buscarTxt.value;
  if (!q) return [];
  const texto = editor.value;
  const hay = sensibleMayus ? texto : texto.toLowerCase();
  const p   = sensibleMayus ? q    : q.toLowerCase();
  const res = [];
  let i = hay.indexOf(p);
  while (i !== -1) { res.push(i); i = hay.indexOf(p, i + Math.max(1, p.length)); }
  return res;
}

/** Selecciona la coincidencia a partir de `desde` y actualiza el contador. */
function resaltaDesde(desde) {
  const q = buscarTxt.value;
  const pos = posicionesBusqueda();
  if (!q || !pos.length) { buscarCount.textContent = '0/0'; return -1; }
  let i = pos.findIndex(p => p >= desde);
  if (i === -1) i = 0;
  const ini = pos[i];
  editor.setSelectionRange(ini, ini + q.length);
  buscarCount.textContent = (i + 1) + '/' + pos.length;
  return ini;
}

function siguienteCoincidencia() {
  const pos = posicionesBusqueda();
  if (!pos.length) return;
  let i = pos.findIndex(p => p >= editor.selectionEnd);
  if (i === -1) i = 0;
  const ini = pos[i];
  editor.setSelectionRange(ini, ini + buscarTxt.value.length);
  buscarCount.textContent = (i + 1) + '/' + pos.length;
}

function reemplazaUno() {
  const q = buscarTxt.value;
  if (!q) return;
  const sel = editor.value.slice(editor.selectionStart, editor.selectionEnd);
  const coincide = sensibleMayus ? sel === q : sel.toLowerCase() === q.toLowerCase();
  if (!coincide) { resaltaDesde(editor.selectionStart); return; }
  const corte = editor.selectionStart;
  editor.setRangeText(reemplazarTxt.value, editor.selectionStart, editor.selectionEnd, 'end');
  trasCambiar();
  resaltaDesde(corte + reemplazarTxt.value.length);
}

function reemplazaTodo() {
  const q = buscarTxt.value;
  if (!q) return;
  const antes = posicionesBusqueda().length;
  if (sensibleMayus) {
    editor.value = editor.value.split(q).join(reemplazarTxt.value);
  } else {
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    editor.value = editor.value.replace(new RegExp(esc, 'gi'), reemplazarTxt.value);
  }
  editor.setSelectionRange(0, 0);
  trasCambiar();
  buscarCount.textContent = '0/0';
  setMensaje(t('msg.replaced', { n: antes }));
}

buscarTxt.addEventListener('input', () => resaltaDesde(0));
buscarTxt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); siguienteCoincidencia(); }
});
reemplazarTxt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); reemplazaUno(); }
});
document.getElementById('btnNext').addEventListener('click', siguienteCoincidencia);
document.getElementById('btnReplace').addEventListener('click', reemplazaUno);
document.getElementById('btnReplaceAll').addEventListener('click', reemplazaTodo);
document.getElementById('btnCloseBuscar').addEventListener('click', cierraBuscar);
document.getElementById('btnCase').addEventListener('click', (e) => {
  sensibleMayus = !sensibleMayus;
  e.currentTarget.classList.toggle('on', sensibleMayus);
  resaltaDesde(0);
});
document.getElementById('btnBuscar').addEventListener('click', () => {
  if (buscarPanel.hidden) {
    buscarPanel.hidden = false;
    buscarTxt.focus();
    buscarTxt.select();
    resaltaDesde(0);
  } else {
    cierraBuscar();
  }
});

/* ---------- 10c. Ajustes de edición ---------- */
const AJUSTES_DEFECTO = { fuente: 'mono', edSize: 14.5, pvSize: 15.5, ancho: '780px' };
const FUENTES = {
  mono:  '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  sans:  'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", Times, serif'
};
const settingsModal = document.getElementById('settingsModal');
let ajustes = cargarAjustes();

function cargarAjustes() {
  try {
    return Object.assign({}, AJUSTES_DEFECTO,
      JSON.parse(localStorage.getItem('md-editor:ajustes') || '{}'));
  } catch (e) { return Object.assign({}, AJUSTES_DEFECTO); }
}

function guardarAjustes() {
  try { localStorage.setItem('md-editor:ajustes', JSON.stringify(ajustes)); } catch (e) {}
}

function aplicarAjustes() {
  const r = document.documentElement;
  r.style.setProperty('--editor-font', FUENTES[ajustes.fuente] || FUENTES.mono);
  r.style.setProperty('--editor-size', ajustes.edSize + 'px');
  r.style.setProperty('--preview-size', ajustes.pvSize + 'px');
  r.style.setProperty('--preview-max', ajustes.ancho);

  document.getElementById('ajFuente').value = ajustes.fuente;
  document.getElementById('ajEdSize').value = ajustes.edSize;
  document.getElementById('ajPvSize').value = ajustes.pvSize;
  document.getElementById('ajAncho').value  = ajustes.ancho;
  document.getElementById('valEd').textContent = String(ajustes.edSize).replace('.', ',') + ' px';
  document.getElementById('valPv').textContent = String(ajustes.pvSize).replace('.', ',') + ' px';
}

function cambiaAjuste(campo, valor) {
  ajustes[campo] = valor;
  guardarAjustes();
  aplicarAjustes();
}

document.getElementById('ajFuente').addEventListener('change', e => cambiaAjuste('fuente', e.target.value));
document.getElementById('ajEdSize').addEventListener('input',  e => cambiaAjuste('edSize', Number(e.target.value)));
document.getElementById('ajPvSize').addEventListener('input',  e => cambiaAjuste('pvSize', Number(e.target.value)));
document.getElementById('ajAncho').addEventListener('change',   e => cambiaAjuste('ancho',  e.target.value));
document.getElementById('ajTema').addEventListener('change',    e => aplicarTema(e.target.value));

document.getElementById('btnResetAjustes').addEventListener('click', () => {
  ajustes = Object.assign({}, AJUSTES_DEFECTO);
  guardarAjustes();
  aplicarAjustes();
  setMensaje(t('msg.reset'));
});

function cierraAjustes() { settingsModal.hidden = true; }

document.getElementById('btnSettings').addEventListener('click', () => {
  document.getElementById('ajTema').value =
    document.documentElement.getAttribute('data-theme') || 'light';
  aplicarAjustes();
  settingsModal.hidden = false;
});
document.getElementById('btnCloseSettings').addEventListener('click', cierraAjustes);
settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) cierraAjustes(); });

/* ---------- 10d. Plantillas (texto en el idioma activo) ---------- */
const PLANTILLAS = ['blanco', 'apuntes', 'readme', 'informe', 'tareas'];

/** Devuelve {nombre, contenido} de una plantilla traducida. */
function plantilla(clave) {
  if (clave === 'blanco') return { nombre: t('tpl.blank.name'), contenido: '' };
  const fecha = new Date().toLocaleDateString(idioma === 'en' ? 'en-US' : 'es-ES');
  return {
    nombre: t('tpl.' + clave + '.name'),
    contenido: t('tpl.' + clave + '.body').split('{fecha}').join(fecha)
  };
}

const plantillasPop = document.getElementById('plantillasPop');
function cierraPlantillas() { plantillasPop.hidden = true; }

function crearDesdePlantilla(clave) {
  const p = plantilla(clave);
  if (editor.value.trim()) persistir(true);
  guardaVersionActual(true);
  editor.value = p.contenido;
  fileNameIn.value = p.nombre;
  currentId = null;
  dirty = false;
  savedAt = null;
  escribirDocs();
  reiniciarHistorial();
  render();
  persistir(true);
  actualizarSaveInfo();
  setMensaje(p.contenido
    ? t('msg.tpl', { n: p.nombre + '.md' })
    : t('msg.tplblank'));
}

plantillasPop.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-tpl]');
  if (!btn) return;
  cierraPlantillas();
  crearDesdePlantilla(btn.dataset.tpl);
});

/* ---------- 10e. Respaldo de toda la biblioteca ---------- */
function respaldoBiblioteca() {
  const datos = { app: 'markdown-editor', version: 1, fecha: new Date().toISOString(), docs };
  descargarComo(JSON.stringify(datos, null, 2),
    'markdown-editor-respaldo.json', 'application/json;charset=utf-8');
  setMensaje(t('msg.backup', { n: docs.length }));
}

function restaurarRespaldo(file) {
  if (!file) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const datos = JSON.parse(lector.result);
      const lista = Array.isArray(datos) ? datos : (datos && datos.docs) || [];
      const validos = lista.filter(d => d && typeof d.content === 'string');
      if (!validos.length) throw new Error('sin documentos');

      let nuevos = 0;
      validos.forEach(d => {
        docs.push({
          id: docs.some(x => x.id === d.id)
            ? 'd' + Date.now() + Math.random().toString(36).slice(2, 6)
            : d.id,
          name: String(d.name || t('msg.defaultname')).slice(0, 80),
          content: d.content,
          updated: Number(d.updated) || Date.now()
        });
        nuevos++;
      });
      escribirDocs();
      pintaListaDocs();
      setMensaje(t('msg.restored', { n: nuevos }));
    } catch (err) {
      setMensaje(t('msg.badbackup'));
    }
  };
  lector.readAsText(file, 'utf-8');
}

document.getElementById('btnBackup').addEventListener('click', respaldoBiblioteca);
document.getElementById('btnRestore').addEventListener('click', () =>
  document.getElementById('backupInput').click());
document.getElementById('backupInput').addEventListener('change', (e) => {
  restaurarRespaldo(e.target.files[0]);
  e.target.value = '';
});

/* ---------- 10f. Exportar la biblioteca como .zip (sin librerías) ---------- */
const CRC_TABLA = (function () {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLA[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

const u16 = n => [n & 255, (n >> 8) & 255];
const u32 = n => [n & 255, (n >> 8) & 255, (n >> 16) & 255, ((n >>> 24) & 255)];

/** Monta un .zip en memoria con el método "store" (sin comprimir). */
function crearZip(archivos) {
  const enc = new TextEncoder();
  const ahora = new Date();
  const hora  = (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | (ahora.getSeconds() >> 1);
  const fecha = ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate();

  const locales  = [];
  const centrales = [];
  let offset = 0;

  archivos.forEach(f => {
    const nombre = enc.encode(f.nombre);
    const datos  = enc.encode(f.texto);
    const crc = crc32(datos);

    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0),
      ...u16(hora), ...u16(fecha),
      ...u32(crc), ...u32(datos.length), ...u32(datos.length),
      ...u16(nombre.length), ...u16(0), ...nombre
    ]);

    const central = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0),
      ...u16(hora), ...u16(fecha),
      ...u32(crc), ...u32(datos.length), ...u32(datos.length),
      ...u16(nombre.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(0), ...u32(offset), ...nombre
    ]);

    locales.push(local, datos);
    centrales.push(central);
    offset += local.length + datos.length;
  });

  const cdTam = centrales.reduce((s, c) => s + c.length, 0);
  const fin = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0),
    ...u16(archivos.length), ...u16(archivos.length),
    ...u32(cdTam), ...u32(offset), ...u16(0)
  ]);

  return new Blob([...locales, ...centrales, fin], { type: 'application/zip' });
}

function exportarZip() {
  if (!docs.length) { setMensaje(t('docs.empty')); return; }

  const usados = {};
  const archivos = [...docs]
    .sort((a, b) => b.updated - a.updated)
    .map(d => {
      const base = (String(d.name || '').trim() || t('msg.defaultname'))
        .replace(/[\\/:*?"<>|]/g, '_');
      let nombre = base + '.md';
      let n = 2;
      while (usados[nombre]) nombre = `${base} (${n++}).md`;   // sin repetir
      usados[nombre] = 1;
      return { nombre, texto: String(d.content || '') };
    });

  try {
    descargarComo(crearZip(archivos), 'markdown-editor.zip', 'application/zip');
    setMensaje(t('msg.zip', { n: archivos.length }));
  } catch (e) {
    setMensaje(t('msg.ziperr'));
  }
}

document.getElementById('btnZip').addEventListener('click', exportarZip);

/* ---------- 10g. Papelera: mostrar / restaurar / vaciar ---------- */
document.getElementById('btnTrash').addEventListener('click', () => {
  // dentro de "versiones" el botón sirve para volver a la lista
  if (vistaVersiones) cierraVersiones();
  else vistaPapelera = !vistaPapelera;
  actualizaBarraDocs();
  pintaListaDocs();
});
document.getElementById('btnVaciar').addEventListener('click', vaciarPapelera);

/* ---------- 10h. Arrastrar y soltar archivos ---------- */
const dropZone = document.getElementById('dropZone');
let dragContador = 0;

function traeArchivos(e) {
  return !!(e.dataTransfer && e.dataTransfer.types &&
    Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') !== -1);
}

window.addEventListener('dragenter', (e) => {
  if (!traeArchivos(e)) return;
  dragContador++;
  dropZone.hidden = false;
});
window.addEventListener('dragover', (e) => { if (traeArchivos(e)) e.preventDefault(); });
window.addEventListener('dragleave', () => {
  dragContador = Math.max(0, dragContador - 1);
  if (!dragContador) dropZone.hidden = true;
});
window.addEventListener('drop', (e) => {
  if (!traeArchivos(e)) return;
  e.preventDefault();
  dragContador = 0;
  dropZone.hidden = true;
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (!f) return;
  if (f.type && f.type.indexOf('image/') === 0) pegarImagen(f);
  else abrirArchivoDisco(f);
});

/* =========================================================
   11. INICIO
   ========================================================= */

(function iniciar() {
  // idioma (es / en) — antes que nada, para que todo se pinte traducido
  cargarIdioma();
  // tema
  let tema = 'light';
  try { tema = localStorage.getItem(THEME_KEY) || 'light'; } catch (e) {}
  aplicarTema(tema);

  // biblioteca y papelera
  cargarDocs();
  cargarPapelera();
  cargarVersiones();

  // volcar el idioma activo sobre toda la página
  aplicarIdioma();

  // ajustes de edición (fuente, tamaños, ancho) y modo de vista
  aplicarAjustes();
  let modoGuardado = 'split';
  try { modoGuardado = localStorage.getItem('md-editor:modo') || 'split'; } catch (e) {}
  aplicarModo(modoGuardado);

  // ¿se abrió desde un enlace compartido? (#d=...)
  if (cargarDesdeEnlace()) {
    persistir(true);
    reiniciarHistorial();
    render();
    pintaListaDocs();
    actualizarSaveInfo();
    setMensaje(t('msg.shared'));
    document.getElementById('btnOutline').classList.toggle('on', !outlinePane.classList.contains('oculto'));
    return;
  }

  const abierto = docActual();

  if (abierto) {
    editor.value = abierto.content;
    fileNameIn.value = abierto.name;
    savedAt = abierto.updated;
  } else {
    let contenido = null, nombre = t('msg.defaultname');
    try {
      contenido = localStorage.getItem('md-editor:contenido');
      nombre = localStorage.getItem('md-editor:nombre') || t('msg.defaultname');
    } catch (e) {}
    editor.value = contenido !== null && contenido !== undefined ? contenido : demo();
    fileNameIn.value = nombre;
  }

  // esquema: visible en pantallas anchas por defecto
  let esq = '1';
  try { esq = localStorage.getItem('md-editor:esquema') || (innerWidth >= 1100 ? '1' : '0'); } catch (e) {}
  if (esq === '0' || innerWidth < 760) outlinePane.classList.add('oculto');
  document.getElementById('btnOutline').classList.toggle('on', !outlinePane.classList.contains('oculto'));

  reiniciarHistorial();
  render();
  pintaListaDocs();
  actualizarSaveInfo();
  setMensaje(t('msg.ready'));
})();
