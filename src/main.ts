import { app, ipcMain, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { env } from 'process';
import ipc from './ipc/ipc.js';

export let mainWindow: BrowserWindow | null;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload/preload.cjs'),
    },
  });

  let menu: Menu | null = null;
  if (env.TYPE == 'debug') {
    menu = Menu.buildFromTemplate([
      {
        label: 'デバッグ',
        submenu: [
          { label: 'デベロッパーツール', role: 'toggleDevTools' },
          { label: '再読み込み', role: 'reload' }
        ]
      }
    ]);
  }
  if (process.platform == 'darwin') Menu.setApplicationMenu(menu);
  else mainWindow.setMenu(menu);

  mainWindow.loadFile('renderer/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipc();
createMainWindow();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
