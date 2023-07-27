import path from "path";
import fs from 'fs';
import { dataFolder } from "../utils.js";
import { dialog } from "electron";
import { mainWindow } from "../main.js";

export function exportWork(e, workId: string) {
  exportData(workId, path.join(dataFolder, 'works', workId));
}

export function exportGroup(e, workId: string, groupId: string) {
  
  exportData(workId, path.join(dataFolder, 'works', workId, 'groups', groupId));
}

function exportData(workId: string, dir: string) {
  let filepath = dialog.showSaveDialogSync(mainWindow!, {
    title: 'エクスポート',
    buttonLabel: 'エクスポート',
    filters: [
      {name: 'BetterMemorizeファイル', extensions: ['bmr']},
      {name: 'CSVファイル', extensions: ['csv']},
    ],
    properties: ["createDirectory"]
  })
  if (filepath == null) return;
  
  switch (path.extname(filepath)) {
    case '.csv': {
      let data = getCsvData(workId, dir);
      fs.writeFileSync(filepath, data.map(i => i.join(',')).join('\n'));
    }
    break;
    default: {
      let data = getData(workId, dir);
      fs.writeFileSync(filepath, JSON.stringify(data));
    }
    break;
  }
}

function getData(workId: string, dir: string) {
  let info: object = JSON.parse(fs.readFileSync(path.join(dir, 'info.json')).toString());
  let groupsFile = path.join(dir, 'groups.json');
  let groupIds: string[] = fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile).toString()) : [];
  let questionsFile = path.join(dir, 'questions.json');
  let questions: object[] = fs.existsSync(questionsFile) ? Object.values(JSON.parse(fs.readFileSync(questionsFile).toString())) : [];
  let groups = groupIds.map(id => getData(workId, path.join(dataFolder, 'works', workId, 'groups', id)))
  return {info, questions, groups}
}

function getCsvData(workId: string, dir: string) {
  let groupsFile = path.join(dir, 'groups.json');
  let groupIds: string[] = fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile).toString()) : [];
  let questionsFile = path.join(dir, 'questions.json');
  let questionObjs: any[] = fs.existsSync(questionsFile) ? Object.values(JSON.parse(fs.readFileSync(questionsFile).toString())) : [];
  let questions: [string, string][] = questionObjs.map(i => [i.question, i.answer])
  groupIds.forEach(id => questions = questions.concat(getCsvData(workId, path.join(dataFolder, 'works', workId, 'groups', id))))
  return questions;
}
