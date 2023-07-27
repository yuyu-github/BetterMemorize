import { ipcMain, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { dataFolder } from '../utils.js';
import { exportGroup, exportWork } from './file.js';

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
    if (!fs.existsSync(dirname)) return {};
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

  ipcMain.handle('addGroup', (e, workId: string, groupId: string | null, data: object) => {
    let groupsdir = path.join(dataFolder, 'works', workId, 'groups');
    if (!fs.existsSync(groupsdir)) fs.mkdirSync(groupsdir);
    let id = crypto.randomUUID();
    let dir = path.join(groupsdir, id);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify(data));

    let groupsFile = groupId == null ? path.join(dataFolder, 'works', workId, 'groups.json') : path.join(dataFolder, 'works', workId, 'groups', groupId, 'groups.json');
    let groupsFileData: string[] = fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile).toString()) : [];
    groupsFileData.push(id)
    fs.writeFileSync(groupsFile, JSON.stringify(groupsFileData));
  })

  ipcMain.handle('editGroup', (e, workId: string, id: string, data: object) => {
    fs.writeFileSync(path.join(dataFolder, 'works', workId, 'groups', id, 'info.json'), JSON.stringify(data));
  })

  ipcMain.handle('deleteGroup', (e, workId: string, groupId: string | null, id: string) => {
    fs.rmdirSync(path.join(dataFolder, 'works', workId, 'groups', id), {recursive: true});

    let groupsFile = groupId == null ? path.join(dataFolder, 'works', workId, 'groups.json') : path.join(dataFolder, 'works', workId, 'groups', groupId, 'groups.json');
    let groupsFileData = JSON.parse(fs.readFileSync(groupsFile).toString());
    groupsFileData.splice(groupsFileData.indexOf(id), 1);
    fs.writeFileSync(groupsFile, JSON.stringify(groupsFileData));
  })

  ipcMain.handle('getGroups', (e, workId: string, groupId: string | null) => {
    let groupsFile = groupId == null ? path.join(dataFolder, 'works', workId, 'groups.json') : path.join(dataFolder, 'works', workId, 'groups', groupId, 'groups.json');
    let dirname = path.join(dataFolder, 'works', workId, 'groups');
    if (!fs.existsSync(dirname) || !fs.existsSync(groupsFile)) return {};

    let groupIdList = JSON.parse(fs.readFileSync(groupsFile).toString());
    let groups: {[id: string]: object} = {};
    groupIdList.map(dir => path.join(dirname, dir)).filter(dir => fs.statSync(dir).isDirectory()).forEach(dir => {
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

  ipcMain.handle('deleteQuestion', (e, workId: string, groupId: string, id: string) => {
    let filename = path.join(dataFolder, 'works', workId, 'groups', groupId, 'questions.json');
    let currentData = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename).toString()) : {};
    delete currentData[id];
    fs.writeFileSync(filename, JSON.stringify(currentData));
  })
  
  ipcMain.handle('getQuestions', (e, workId: string, groupId: string) => {
    let dirname = path.join(dataFolder, 'works', workId, 'groups', groupId);
    if (!fs.existsSync(dirname)) return {};
    let questions: {[id: string]: object} = {};
    let dataFile = path.join(dirname, 'questions.json');
    if (fs.existsSync(dataFile)) {
      questions = JSON.parse(fs.readFileSync(dataFile).toString());
    }
    return questions;
  })

  ipcMain.handle('getPriorityData', (e, workId: string, groupId: string) => {
    let dataFile = path.join(dataFolder, 'works', workId, 'groups', groupId, 'priority.json');
    if (!fs.existsSync(dataFile)) return {};
    return JSON.parse(fs.readFileSync(dataFile).toString());
  })

  ipcMain.handle('setPriorityData', (e, workId: string, groupId: string, data: object) => {
    let dataFile = path.join(dataFolder, 'works', workId, 'groups', groupId, 'priority.json');
    return fs.writeFileSync(dataFile, JSON.stringify(data));
  })

  ipcMain.handle('exportWork', exportWork);
  ipcMain.handle('exportGroup', exportGroup);
}
