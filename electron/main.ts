import { app, BrowserWindow, shell } from 'electron';
import { existsSync } from 'node:fs';
import * as path from 'node:path';
import { registerHashHandlers } from './ipc/hash.handler';

const isDev = process.env['ELECTRON_DEV'] === '1';
const DEV_URL = 'http://127.0.0.1:4200';

function resolveIconPath(): string | undefined {
  const candidate = path.join(__dirname, '..', 'build', 'icon.png');
  return existsSync(candidate) ? candidate : undefined;
}

async function createMainWindow(): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 720,
    minHeight: 480,
    backgroundColor: '#1b1b1f',
    title: 'MD5 Tools',
    icon: resolveIconPath(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    await win.loadURL(DEV_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexHtml = path.join(
      __dirname,
      '..',
      'dist',
      'angular',
      'browser',
      'index.html',
    );
    await win.loadFile(indexHtml);
  }

  return win;
}

app.whenReady().then(async () => {
  registerHashHandlers();
  await createMainWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
