import { ipcMain, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { dataFolder } from '../utils.js';

export default () => {
  ipcMain.handle('addWork', (e, name: string) => {
    let worksdir = path.join(dataFolder, 'works');
    if (!fs.existsSync(worksdir)) fs.mkdirSync(worksdir);
    let dir = path.join(worksdir, crypto.randomUUID());
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify({name}));
  })

  ipcMain.handle('getWorks', (e) => {
    let dirs = fs.readdirSync(path.join(dataFolder, 'works'))
    let works: {name: string, id: string}[] = [];
    dirs.map(dir => path.join(dataFolder, 'works', dir)).filter(dir => fs.statSync(dir).isDirectory()).forEach(dir => {
      let infoFile = path.join(dir, 'info.json');
      if (fs.existsSync(infoFile)) works.push({
        name: JSON.parse(fs.readFileSync(infoFile).toString()).name ?? '',
        id: path.basename(dir)
      })
    })
    return works;
  })
}
