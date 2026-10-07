#!/usr/bin/env node
/**
 * Validación del proyecto — SIN dependencias (solo Node).
 *
 * Comprueba que la web no se rompe al mover archivos o editar rutas:
 *   1. Estructura de carpetas y archivos obligatorios
 *   2. Sintaxis de js/app.js
 *   3. Que todas las rutas locales del HTML existen
 *   4. Que cada getElementById() del JS tiene su id en el HTML
 *   5. Sin ids duplicados
 *   6. Que todos los data-cmd del toolbar tienen su case en comando()
 *   7. Variables CSS usadas -> definidas
 *   8. Metadatos mínimos (lang, title, charset, viewport, descripción)
 *   9. Enlaces relativos del README y docs/ existen
 *
 * Uso:  node scripts/check.js
 * Sale con código 1 si hay algún fallo (para que falle el CI).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
let fallos = 0;

const lee  = (p) => fs.readFileSync(path.join(RAIZ, p), 'utf8');
const hay  = (p) => fs.existsSync(path.join(RAIZ, p));
const tit  = (t) => console.log('\n' + t);
const ok   = (m) => console.log('   ✅ ' + m);
const mal  = (m) => { fallos++; console.log('   ❌ ' + m); };
const aviso = (m) => console.log('   ⚠️  ' + m);

/* ───────────────────────── 1. Estructura ───────────────────────── */
tit('1. Estructura de carpetas');
const obligatorios = [
  'index.html', 'README.md', 'CHANGELOG.md', 'LICENSE', '.nojekyll',
  'css/style.css', 'js/app.js', 'assets/icon.svg', 'assets/favicon.svg',
  'docs/USUARIO.md', 'docs/DESARROLLADOR.md'
];
obligatorios.forEach(f => hay(f) ? ok(f) : mal('Falta el archivo: ' + f));

/* ───────────────────────── 2. Sintaxis JS ───────────────────────── */
tit('2. Sintaxis de js/app.js');
try {
  execFileSync(process.execPath, ['--check', path.join(RAIZ, 'js/app.js')], { stdio: 'pipe' });
  ok('Sintaxis correcta');
} catch (e) {
  mal('Error de sintaxis:\n' + (e.stderr ? e.stderr.toString() : e.message));
}

const html = hay('index.html') ? lee('index.html') : '';
const js   = hay('js/app.js') ? lee('js/app.js') : '';

/* ─────────────── 3. Rutas locales del HTML ─────────────── */
tit('3. Rutas locales del HTML');
const rutas = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
// og:image va en content=, también se comprueba
const og = (html.match(/property="og:image"\s+content="([^"]+)"/) || [])[1];
if (og) rutas.push(og);

const externas = rutas.filter(r => /^(https?:|\/\/|#|data:|mailto:|tel:)/.test(r));
const locales = rutas.filter(r => !/^(https?:|\/\/|#|data:|mailto:|tel:)/.test(r) && r !== '');
locales.forEach(r => hay(r) ? ok(r) : mal('Rota en index.html: ' + r));
ok(`${locales.length} rutas locales · ${externas.length} externas`);
if (locales.some(r => r.startsWith('/') || /^[a-z]:/i.test(r))) {
  mal('Hay rutas absolutas; usa rutas relativas para GitHub Pages');
} else {
  ok('Sin rutas absolutas (funciona desde cualquier carpeta)');
}

/* ─────── 4. Los getElementById del JS existen en el HTML ─────── */
tit('4. Referencias JS → HTML (getElementById)');
const idsHtml = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const idsJs = new Set([...js.matchAll(/getElementById\(\s*'([^']+)'\s*\)/g)].map(m => m[1]));
[...idsJs].forEach(id => {
  if (id.startsWith('sec-')) return;          // los crea render() al vuelo
  idsHtml.has(id) ? ok(id) : mal('app.js pide id="' + id + '" pero no existe en index.html');
});
ok(idsJs.size + ' referencias comprobadas');

/* ─────────────────── 5. Ids duplicados ─────────────────── */
tit('5. Ids duplicados en index.html');
const listaIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const duplicados = listaIds.filter((v, i) => listaIds.indexOf(v) !== i);
duplicados.length
  ? mal('Ids repetidos: ' + [...new Set(duplicados)].join(', '))
  : ok(listaIds.length + ' ids, todos únicos');

/* ─── 6. data-cmd del toolbar → case en comando() ─── */
tit('6. Botones del toolbar → comando()');
const cmds = [...new Set([...html.matchAll(/data-cmd="([^"]+)"/g)].map(m => m[1]))];
cmds.forEach(c => {
  const esta = new RegExp("case\\s+'" + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'").test(js)
            || new RegExp('case\\s+"' + c + '"').test(js);
  esta ? ok(c) : mal('El botón data-cmd="' + c + '" no tiene case en comando()');
});

/* ─────────────── 7. Variables CSS ─────────────── */
tit('7. Variables CSS');
if (hay('css/style.css')) {
  const css = lee('css/style.css');
  const definidas = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
  const usadas = new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map(m => m[1]));
  const sinDefinir = [...usadas].filter(v => !definidas.has(v));
  sinDefinir.length
    ? sinDefinir.forEach(v => mal('Se usa ' + v + ' pero no está definida'))
    : ok(usadas.size + ' variables usadas, todas definidas (' + definidas.size + ' en total)');
} else {
  mal('No se pudo leer css/style.css');
}

/* ─────────────── 8. Metadatos ─────────────── */
tit('8. Metadatos del HTML');
const meta = [
  [/<html[^>]*\slang="/, 'atributo lang'],
  [/<title>[^<]+<\/title>/, 'title'],
  [/charset\s*=\s*"?utf-8/i, 'charset utf-8'],
  [/name="viewport"/, 'viewport'],
  [/name="description"/, 'meta description'],
  [/rel="icon"/, 'favicon'],
  [/<meta[^>]+og:title/, 'og:title (al compartir el enlace)']
];
meta.forEach(([re, nombre]) => re.test(html) ? ok(nombre) : mal('Falta: ' + nombre));

/* ─────────────── 9. Enlaces de la documentación ─────────────── */
tit('9. Enlaces de la documentación');
const mdDocs = ['README.md', 'docs/USUARIO.md', 'docs/DESARROLLADOR.md', 'CHANGELOG.md']
  .filter(hay);

mdDocs.forEach(doc => {
  const base = path.dirname(doc);
  const texto = lee(doc);
  const enlaces = [...texto.matchAll(/\]\(([^)\s]+)\)/g)]
    .map(m => m[1])
    .filter(l => !/^(https?:|mailto:|#)/.test(l));

  const rotos = [];
  enlaces.forEach(l => {
    const destino = l.split('#')[0];
    if (!destino) return;
    const completo = path.join(RAIZ, base, destino);
    if (!fs.existsSync(completo)) rotos.push(l);
  });

  rotos.length
    ? rotos.forEach(l => mal(doc + ' → enlace roto: ' + l))
    : ok(doc + ' (' + enlaces.length + ' enlaces)');
});

/* ─────────────── Resumen ─────────────── */
console.log('\n' + '─'.repeat(56));
if (fallos) {
  console.log(`❌ ${fallos} fallo(s). Corrígelos antes de subir a GitHub.`);
  process.exit(1);
} else {
  console.log('✅ Todo correcto: el proyecto está listo para publicarse.');
}
