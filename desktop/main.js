const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let fileToOpenOnStartup = getFilePathFromArgs(process.argv);

function getFilePathFromArgs(argv, cwd = process.cwd()) {
  if (!argv || !Array.isArray(argv)) return null;
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg || arg.startsWith('--') || arg === '.') continue;
    const resolved = path.isAbsolute(arg) ? arg : path.resolve(cwd, arg);
    try {
      if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        return resolved;
      }
    } catch (_) {}
  }
  return null;
}

function openFileInWindow(win, filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    win.webContents.executeJavaScript(`
      if (typeof window.abrirContenidoDirecto === 'function') {
        window.abrirContenidoDirecto(${JSON.stringify(fileName)}, ${JSON.stringify(content)});
      }
    `);
  } catch (err) {
    console.error('Error al abrir archivo en ventana:', err);
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.ico');

  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'Markdown Editor',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: true
    }
  });

  // Intentar cargar la carpeta src/ empaquetada; si no existe, cargar desde la raíz
  let indexPath = path.join(__dirname, 'src', 'index.html');
  if (!fs.existsSync(indexPath)) {
    indexPath = path.join(__dirname, '..', 'index.html');
  }

  win.loadFile(indexPath);

  // Si se inició la aplicación con un archivo (doble clic o "Abrir con"), cargarlo al iniciar
  win.webContents.on('did-finish-load', () => {
    if (fileToOpenOnStartup) {
      openFileInWindow(win, fileToOpenOnStartup);
      fileToOpenOnStartup = null;
    }
  });

  // Abrir enlaces externos (http / https) en el navegador por defecto del sistema
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// Limitar a una sola instancia de la aplicación
const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const win = windows[0];
      if (win.isMinimized()) win.restore();
      win.focus();

      const targetFile = getFilePathFromArgs(commandLine, workingDirectory);
      if (targetFile) {
        openFileInWindow(win, targetFile);
      }
    }
  });

  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      openFileInWindow(windows[0], filePath);
    } else {
      fileToOpenOnStartup = filePath;
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
