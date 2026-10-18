const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

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
  app.on('second-instance', () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      if (windows[0].isMinimized()) windows[0].restore();
      windows[0].focus();
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
