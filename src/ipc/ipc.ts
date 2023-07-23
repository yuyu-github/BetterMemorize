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

  ipcMain.handle('deleteWork', (e, id: string) => {
    fs.rmdirSync(path.join(dataFolder, 'works', id), {recursive: true});
  })

  ipcMain.handle('getWorks', (e) => {
    let dirname = path.join(dataFolder, 'works');
    if (!fs.existsSync(dirname)) return;
    let dirs = fs.readdirSync(dirname)
    let works: {[id: string]: object} = {};
    dirs.map(dir => path.join(dirname, dir)).filter(dir => fs.statSync(dir).isDirectory()).forEach(dir => {
      let infoFile = path.join(dir, 'info.json');
      if (fs.existsSync(infoFile)) {
        works[path.basename(dir)] = JSON.parse(fs.readFileSync(infoFile).toString());
      }
    })
    return works;
  })

  ipcMain.handle('addGroup', (e, workId: string, data: object) => {
    let groupsdir = path.join(dataFolder, 'works', workId, 'groups');
    if (!fs.existsSync(groupsdir)) fs.mkdirSync(groupsdir);
    let dir = path.join(groupsdir, crypto.randomUUID());
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify(data));
  })

  ipcMain.handle('editGroup', (e, workId: string, id: string, data: object) => {
    fs.writeFileSync(path.join(dataFolder, 'works', workId, 'groups', id, 'info.json'), JSON.stringify(data));
  })

  ipcMain.handle('deleteGroup', (e, workId: string, id: string) => {
    fs.rmdirSync(path.join(dataFolder, 'works', workId, 'groups', id), {recursive: true});
  })

  ipcMain.handle('getGroups', (e, workId: string) => {
    let dirname = path.join(dataFolder, 'works', workId, 'groups');
    if (!fs.existsSync(dirname)) return;
    let dirs = fs.readdirSync(dirname)
    let groups: {[id: string]: object} = {};
    dirs.map(dir => path.join(dirname, dir)).filter(dir => fs.statSync(dir).isDirectory()).forEach(dir => {
      let infoFile = path.join(dir, 'info.json');
      if (fs.existsSync(infoFile)) {
        groups[path.basename(dir)] = JSON.parse(fs.readFileSync(infoFile).toString());
      }
    })
    return groups;
  })

  ipcMain.handle('addQuestion', (e, workId: string, groupId: string, data: object) => {
    let filename = path.join(dataFolder, 'works', workId, 'groups', groupId, 'questions.json');
    let currentData = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename).toString()) : {};
    currentData[crypto.randomUUID()] = data;
    fs.writeFileSync(filename, JSON.stringify(currentData));
  })

  ipcMain.handle('editQuestion', (e, workId: string, groupId: string, id: string, data: object) => {
    let filename = path.join(dataFolder, 'works', workId, 'groups', groupId, 'questions.json');
    let currentData = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename).toString()) : {};
    currentData[id] = data;
    fs.writeFileSync(filename, JSON.stringify(currentData));
  })
  
  ipcMain.handle('getQuestions', (e, workId: string, groupId: string) => {
    let dirname = path.join(dataFolder, 'works', workId, 'groups', groupId);
    if (!fs.existsSync(dirname)) return;
    let questions: {[id: string]: object} = {};
    let dataFile = path.join(dirname, 'questions.json');
    if (fs.existsSync(dataFile)) {
      questions = JSON.parse(fs.readFileSync(dataFile).toString());
    }
    return questions;
  })
}
