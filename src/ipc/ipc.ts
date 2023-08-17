import { ipcMain, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { dataFolder, useFile } from '../utils.js';
import { exportGroup, exportWork, getExportTargetFile } from './export.js';
import { getImportSourceFile, importGroup, importSubGroup, importWork } from './import.js';

export default () => {
  ipcMain.handle('addWork', (e, data: object) => {
    let worksdir = path.join(dataFolder, 'works');
    if (!fs.existsSync(worksdir)) fs.mkdirSync(worksdir);
    let id = crypto.randomUUID();
    let dir = path.join(worksdir, id);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify({...data, lastAccessTime: Date.now()}));
  })

  ipcMain.handle('editWork', (e, id: string, data: object) => {
    fs.writeFileSync(path.join(dataFolder, 'works', id, 'info.json'), JSON.stringify(data));
    updateLastAccessTime(id);
  })

  ipcMain.handle('deleteWork', (e, id: string) => {
    fs.rmSync(path.join(dataFolder, 'works', id), {recursive: true});
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
    fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify({...data, lastAccessTime: Date.now()}));

    let groupsFile = groupId == null ? path.join(dataFolder, 'works', workId, 'groups.json') : path.join(dataFolder, 'works', workId, 'groups', groupId, 'groups.json');
    let groupsFileData: string[] = fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile).toString()) : [];
    groupsFileData.push(id)
    fs.writeFileSync(groupsFile, JSON.stringify(groupsFileData));
    updateLastAccessTime(workId);
  })

  ipcMain.handle('editGroup', (e, workId: string, id: string, data: object) => {
    fs.writeFileSync(path.join(dataFolder, 'works', workId, 'groups', id, 'info.json'), JSON.stringify(data));
    updateLastAccessTime(workId, id);
  })

  ipcMain.handle('deleteGroup', (e, workId: string, groupId: string | null, id: string) => {
    deleteGroup(workId, id);
    let groupsFile = groupId == null ? path.join(dataFolder, 'works', workId, 'groups.json') : path.join(dataFolder, 'works', workId, 'groups', groupId, 'groups.json');
    let groupsFileData = JSON.parse(fs.readFileSync(groupsFile).toString());
    groupsFileData.splice(groupsFileData.indexOf(id), 1);
    fs.writeFileSync(groupsFile, JSON.stringify(groupsFileData));
    updateLastAccessTime(workId);
  })
  function deleteGroup(workId: string, id: string) {
    useFile(path.join(dataFolder, 'works', workId, 'groups', id, 'groups.json'), 'json', list => list.forEach(i => deleteGroup(workId, i)), {ignoreNotExist: true})
    fs.rmSync(path.join(dataFolder, 'works', workId, 'groups', id), {recursive: true});
  }

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
    currentData[crypto.randomUUID()] = {...data, lastAccessTime: Date.now()};
    fs.writeFileSync(filename, JSON.stringify(currentData));
    updateLastAccessTime(workId, groupId);
  })

  ipcMain.handle('editQuestion', (e, workId: string, groupId: string, id: string, data: object) => {
    let filename = path.join(dataFolder, 'works', workId, 'groups', groupId, 'questions.json');
    let currentData = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename).toString()) : {};
    currentData[id] = {...data, lastAccessTime: Date.now()};
    fs.writeFileSync(filename, JSON.stringify(currentData));
    updateLastAccessTime(workId, groupId);
  })

  ipcMain.handle('deleteQuestion', (e, workId: string, groupId: string, id: string) => {
    useFile(path.join(dataFolder, 'works', workId, 'groups', groupId, 'questions.json'), 'json', data => {
      delete data[id];
    });
    useFile(path.join(dataFolder, 'works', workId, 'groups', groupId, 'priority.json'), 'json', data => {
      delete data[id];
    });
    updateLastAccessTime(workId, groupId);
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
    fs.writeFileSync(dataFile, JSON.stringify(data));
  })

  ipcMain.handle('getImportSourceFile', getImportSourceFile);
  ipcMain.handle('importWork', importWork);
  ipcMain.handle('importGroup', importGroup);
  ipcMain.handle('importSubGroup', importSubGroup);
  
  ipcMain.handle('getExportTargetFile', getExportTargetFile);
  ipcMain.handle('exportWork', exportWork);
  ipcMain.handle('exportGroup', exportGroup);

  ipcMain.handle('updateLastAccessTime', (e, workId, groupId) => updateLastAccessTime(workId, groupId))
  function updateLastAccessTime(workId: string, groupId: string | null = null) {
    let infoFile = path.join(dataFolder, 'works', workId, 'info.json');
    let info = JSON.parse(fs.readFileSync(infoFile).toString());
    info.lastAccessTime = Date.now();
    fs.writeFileSync(infoFile, JSON.stringify(info));
    if (groupId != null) {
      infoFile = path.join(dataFolder, 'works', workId, 'groups', groupId, 'info.json');
      info = JSON.parse(fs.readFileSync(infoFile).toString());
      info.lastAccessTime = Date.now();
      fs.writeFileSync(infoFile, JSON.stringify(info));
    }
  }

  ipcMain.handle('moveGroup', (e, workId: string, id: string, source: string | null, target: string | null) => {
    if (!fs.existsSync(path.join(dataFolder, 'works', workId))) return;
    let sourceGroupsFile = source == null ? path.join(dataFolder, 'works', workId, 'groups.json') : path.join(dataFolder, 'works', workId, 'groups', source, 'groups.json');
    let sourceGroupsData = JSON.parse(fs.readFileSync(sourceGroupsFile).toString());
    sourceGroupsData.splice(sourceGroupsData.indexOf(id), 1);
    fs.writeFileSync(sourceGroupsFile, JSON.stringify(sourceGroupsData));
    let targetGroupsFile = target == null ? path.join(dataFolder, 'works', workId, 'groups.json') : path.join(dataFolder, 'works', workId, 'groups', target, 'groups.json');
    let targetGroupsData = fs.existsSync(targetGroupsFile) ? JSON.parse(fs.readFileSync(targetGroupsFile).toString()) : [];
    targetGroupsData.push(id);
    fs.writeFileSync(targetGroupsFile, JSON.stringify(targetGroupsData));
    updateLastAccessTime(workId, id);
  })

  ipcMain.handle('moveQuestion', (e, workId, id, source, target) => {
    if (!fs.existsSync(path.join(dataFolder, 'works', workId, 'groups', source))) return;
    let question;
    useFile(path.join(dataFolder, 'works', workId, 'groups', source, 'questions.json'), 'json', data => {
      question = data[id];
      delete data[id];
    });
    useFile(path.join(dataFolder, 'works', workId, 'groups', target, 'questions.json'), 'json', data => {
      data[id] = {...question, lastAccessTime: Date.now()};
    });
    let priority;
    useFile(path.join(dataFolder, 'works', workId, 'groups', source, 'priority.json'), 'json', data => {
      priority = data[id];
      delete data[id];
    });
    if (priority != null) {
      useFile(path.join(dataFolder, 'works', workId, 'groups', target, 'priority.json'), 'json', data => {
        data[id] = priority;
      });
    }
    updateLastAccessTime(workId, target);
  })

  ipcMain.handle('setLastTestQuestions', (e, workId: string, groupId: string, questions: string[]) => {
    useFile(groupId == null ? path.join(dataFolder, 'works', workId, 'last_test.json') : path.join(dataFolder, 'works', workId, 'groups', groupId, 'last_test.json'), 'json', data => {
      data.questions = questions;
    })
  })

  ipcMain.handle('getLastTestQuestions', (e, workId: string, groupId: string) => {
    return useFile(groupId == null ? path.join(dataFolder, 'works', workId, 'last_test.json') : path.join(dataFolder, 'works', workId, 'groups', groupId, 'last_test.json'), 'json', data => {
      return data.questions ?? [];
    })
  })
}
