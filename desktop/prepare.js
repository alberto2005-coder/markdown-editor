/**
 * Script de preparación para empaquetado de escritorio.
 * Sincroniza los archivos de la web (index.html, css, js, assets)
 * dentro de desktop/src/ para que el empaquetado sea completamente autónomo.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEST = path.resolve(__dirname, 'src');

function copyRecursiveSync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('📦 Sincronizando archivos web en desktop/src/...');

// Limpiar la carpeta de destino previa si existe
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true, force: true });
}
fs.mkdirSync(DEST, { recursive: true });

// 1. Copiar index.html
const indexFile = path.join(ROOT, 'index.html');
if (fs.existsSync(indexFile)) {
  fs.copyFileSync(indexFile, path.join(DEST, 'index.html'));
} else {
  console.error('❌ Error: no se encontró index.html en la raíz del repositorio.');
  process.exit(1);
}

// 2. Copiar carpetas css, js, assets
const webFolders = ['css', 'js', 'assets'];
for (const folder of webFolders) {
  const srcFolder = path.join(ROOT, folder);
  if (fs.existsSync(srcFolder)) {
    copyRecursiveSync(srcFolder, path.join(DEST, folder));
  }
}

console.log('✅ Archivos web preparados correctamente en desktop/src/');
