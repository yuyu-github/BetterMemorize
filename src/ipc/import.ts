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

export function importWork(e, importPath: string, options: any) {
  importFile('work', importPath, path.join(dataFolder, 'works'), null, options);
}

export function importGroup(e, importPath: string, workId: string, options: any) {
  importFile('group', importPath, path.join(dataFolder, 'works', workId), workId, options);
}

export function importSubGroup(e, importPath: string, workId: string, groupId: string, options: any) {
  importFile('subGroup', importPath, path.join(dataFolder, 'works', workId, 'groups', groupId), workId, options);
}

function importFile(mode: string, importPath: string, dir: string, workId: string | null, options: any) {
  switch (path.extname(importPath)) {
    case '.csv': importCsvData(fs.readFileSync(importPath).toString().split('\n').map(i => i.split(',')), dir); break;
    default: importData(mode, JSON.parse(fs.readFileSync(importPath).toString()), dir, workId, options); break;
  }
}

type Data = {
  info: {},
  questions: {}[],
  groups: Data[],
  priority: {}[],
};
function importData(mode: string, data: Data, dir: string, workId: string | null, options: {extract: boolean}) {
  data.priority ??= [];

  let newDir = dir;
  let newWorkId = workId;
  if (!options.extract) {
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
  }

  if ((mode == 'work' || (mode == 'group' && options.extract)) && data.questions.length > 0) {
    data.groups.push({
      info: data.info,
      groups: [],
      questions: data.questions,
      priority: data.priority,
    })
    data.questions = [];
  } else {
    let questionsFile = path.join(newDir, 'questions.json');
    let questions: string[] = fs.existsSync(questionsFile) ? JSON.parse(fs.readFileSync(questionsFile).toString()) : {};
    let ids = Array.from(Array(data.questions.length), () => crypto.randomUUID());
    Object.assign(questions, Object.fromEntries(data.questions.map((item, index) => [ids[index], item])));
    fs.writeFileSync(questionsFile, JSON.stringify(questions));
    let priorityFile = path.join(newDir, 'priority.json');
    let priority: string[] = fs.existsSync(priorityFile) ? JSON.parse(fs.readFileSync(priorityFile).toString()) : {};
    Object.assign(priority, Object.fromEntries(data.priority.map((item, index) => [ids[index], item]).filter(i => i[1] != null)));
    fs.writeFileSync(priorityFile, JSON.stringify(priority));
  }

  options.extract = false;
  data.groups.forEach(group => importData('', group, newDir, newWorkId, options))
}

function importCsvData(data: string[][], dir: string) {
  let questionsFile = path.join(dir, 'questions.json');
  let questions: string[] = fs.existsSync(questionsFile) ? JSON.parse(fs.readFileSync(questionsFile).toString()) : {};
  Object.assign(questions, Object.fromEntries(data.map(i => [crypto.randomUUID(), {question: i[0], answer: i[1]}])));
  fs.writeFileSync(questionsFile, JSON.stringify(questions));
}
