import { dialog } from "electron";
import { mainWindow } from "../main.js";
import { dataFolder } from "../utils.js";
import path from "path";
import fs from 'fs';
import crypto from 'crypto';

export function getImportSourceFile(e, mode) {
  return dialog.showOpenDialogSync(mainWindow!, {
    title: 'インポート',
    buttonLabel: 'インポート',
    filters: [
      {name: 'BetterMemorizeファイル', extensions: ['bmr']},
      ...(mode == 'group' ? [{name: 'CSVファイル', extensions: ['csv']}] : []),
    ],
    properties: ["openFile"]
  })?.[0]
}

export function importWork(e, importPath: string) {
  importFile(importPath, path.join(dataFolder, 'works'), null, 'default');
}

export function importGroup(e, importPath: string, method: string, workId: string) {
  importFile(importPath, path.join(dataFolder, 'works', workId), workId, method);
}

export function importSubGroup(e, importPath: string, method: string, workId: string, groupId: string) {
  importFile(importPath, path.join(dataFolder, 'works', workId, 'groups', groupId), workId, method);
}

function importFile(importPath: string, dir: string, workId: string | null, method: string = 'default') {
  switch (path.extname(importPath)) {
    case '.csv': importCsvData(fs.readFileSync(importPath).toString().split('\n').map(i => i.split(',')), dir); break;
    default: importData(JSON.parse(fs.readFileSync(importPath).toString()), dir, workId, method); break;
  }
}

type Data = {
  info: {},
  questions: {}[],
  groups: Data[]
};
function importData(data: Data, dir: string, workId: string | null, method: string = 'default') {
  let newDir = dir;
  let newWorkId = workId;
  if (method != 'extract') {
    if (workId == null) {
      newWorkId = crypto.randomUUID();
      newDir = path.join(dataFolder, 'works', newWorkId);
    } else {
      let id = crypto.randomUUID();
      newDir = path.join(dataFolder, 'works', workId, 'groups', id)

      let groupsFile = path.join(dir, 'groups.json');
      let groups: string[] = fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile).toString()) : [];
      groups.push(id);
      fs.writeFileSync(groupsFile, JSON.stringify(groups));
    }
    fs.mkdirSync(newDir, {recursive: true});

    fs.writeFileSync(path.join(newDir, 'info.json'), JSON.stringify(data.info));
    if (workId != null) {
      fs.writeFileSync(path.join(newDir, 'questions.json'), JSON.stringify(Object.fromEntries(data.questions.map(i => [crypto.randomUUID(), i]))));
    } else if (data.questions.length > 0) {
      data.groups.push({
        info: data.info,
        groups: [],
        questions: data.questions,
      })
      data.questions = [];
    }
  } else {
    let questionsFile = path.join(dir, 'questions.json');
    let questions: string[] = fs.existsSync(questionsFile) ? JSON.parse(fs.readFileSync(questionsFile).toString()) : {};
    Object.assign(questions, data.questions);
    fs.writeFileSync(questionsFile, JSON.stringify(questions));
  }
  data.groups.forEach(group => importData(group, newDir, newWorkId))
}

function importCsvData(data: string[][], dir: string) {
  let questionsFile = path.join(dir, 'questions.json');
  let questions: string[] = fs.existsSync(questionsFile) ? JSON.parse(fs.readFileSync(questionsFile).toString()) : {};
  Object.assign(questions, Object.fromEntries(data.map(i => [crypto.randomUUID(), {question: i[0], answer: i[1]}])));
  fs.writeFileSync(questionsFile, JSON.stringify(questions));
}
