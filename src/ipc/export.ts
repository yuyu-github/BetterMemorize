import path from "path";
import fs from 'fs';
import { dataFolder } from "../utils.js";
import { dialog } from "electron";
import { mainWindow } from "../main.js";

export function getExportTargetFile(e, name: string) {
  return dialog.showSaveDialogSync(mainWindow!, {
    title: 'エクスポート',
    buttonLabel: 'エクスポート',
    filters: [
      {name: 'BetterMemorizeファイル', extensions: ['bmr']},
      {name: 'CSVファイル', extensions: ['csv']},
    ],
    properties: ["createDirectory"],
    defaultPath: name,
  })
}

export function exportWork(e, exportPath: string, workId: string, options: any) {
  exportData(exportPath, workId, path.join(dataFolder, 'works', workId), options);
}

export function exportGroup(e, exportPath: string, workId: string, groupId: string, options: any) {
  exportData(exportPath, workId, path.join(dataFolder, 'works', workId, 'groups', groupId), options);
}

function exportData(exportPath: string, workId: string, dir: string, options: any) {
  switch (path.extname(exportPath)) {
    case '.csv': {
      let data = getCsvData(workId, dir, options);
      fs.writeFileSync(exportPath, data.map(i => i.join(',')).join('\n'));
    }
    break;
    default: {
      let data = getData(workId, dir, options);
      fs.writeFileSync(exportPath, JSON.stringify(data));
    }
    break;
  }
}

function getData(workId: string, dir: string, options: {includeStatData: boolean}) {
  let info: object = JSON.parse(fs.readFileSync(path.join(dir, 'info.json')).toString());
  let groupsFile = path.join(dir, 'groups.json');
  let groupIds: string[] = fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile).toString()) : [];
  let questionsFile = path.join(dir, 'questions.json');
  let questionEntries: [string, object][] = fs.existsSync(questionsFile) ? Object.entries(JSON.parse(fs.readFileSync(questionsFile).toString())) : [];
  let questions: object[] = questionEntries.map(i => i[1]);
  let priority: object[] = [];
  if (options.includeStatData) {
    let priorityFile = path.join(dir, 'priority.json');
    let priorityRawData = fs.existsSync(priorityFile) ? JSON.parse(fs.readFileSync(priorityFile).toString()) : [];
    priority = questionEntries.map(i => priorityRawData[i[0]]);
  }
  let groups = groupIds.map(id => getData(workId, path.join(dataFolder, 'works', workId, 'groups', id), options))
  return {info, questions, groups, priority};
}

function getCsvData(workId: string, dir: string, options: {}) {
  let groupsFile = path.join(dir, 'groups.json');
  let groupIds: string[] = fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile).toString()) : [];
  let questionsFile = path.join(dir, 'questions.json');
  let questionObjs: any[] = fs.existsSync(questionsFile) ? Object.values(JSON.parse(fs.readFileSync(questionsFile).toString())) : [];
  let questions: [string, string][] = questionObjs.map(i => [i.question, i.answer])
  groupIds.forEach(id => questions = questions.concat(getCsvData(workId, path.join(dataFolder, 'works', workId, 'groups', id), options)))
  return questions;
}
