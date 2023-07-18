import { ipcMain, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { dataFolder } from '../utils.js';

export default () => {
  ipcMain.handle('addWork', (e, data: object) => {
    let worksdir = path.join(dataFolder, 'works');
    if (!fs.existsSync(worksdir)) fs.mkdirSync(worksdir);
    let dir = path.join(worksdir, crypto.randomUUID());
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify(data));
  })

  ipcMain.handle('editWork', (e, id: string, data: object) => {
    fs.writeFileSync(path.join(dataFolder, 'works', id, 'info.json'), JSON.stringify(data));
  })

  ipcMain.handle('getWorks', (e) => {
    let dirs = fs.readdirSync(path.join(dataFolder, 'works'))
    let works: {[id: string]: {name: string}} = {};
    dirs.map(dir => path.join(dataFolder, 'works', dir)).filter(dir => fs.statSync(dir).isDirectory()).forEach(dir => {
      let infoFile = path.join(dir, 'info.json');
      if (fs.existsSync(infoFile)) {
        works[path.basename(dir)] = {
          name: JSON.parse(fs.readFileSync(infoFile).toString()).name ?? ''
        };
      }
    })
    return works;
  })
}
