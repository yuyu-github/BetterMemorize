import { listViewListDiv, menuStartButton, questionViewAnswerTextarea, startTestViewSettingDiv, startTestViewStartButton } from "../elements.js";
import { currentGroup, groups } from "../group/group.js";
import { currentMode, setMode } from "../mode.js";
import { Question } from "../question/question.js";
import { toNumberOrString } from "../utils.js";
import { currentWork, works } from "../work/work.js";
import { TestOptions, test } from "./test.js";

let type: 'work' | 'group' = 'work';
let id: string = '';

export function init() {
  menuStartButton.addEventListener('click', e => {
    if (currentMode == 'work') {
      type = 'work';
      id = currentWork;
    } else if (currentMode == 'group') {
      type = 'group';
      id = currentGroup;
    }
    setMode('start-test');
    e.stopImmediatePropagation();
  })

  listViewListDiv.addEventListener('click', e => {
    let target = e.target as HTMLElement;
    if (target.nodeName == 'BUTTON' && target.classList.contains('start')) {
      if (currentMode == 'all-work') type = 'work';
      else if (currentMode == 'work') type = 'group';
      id = target.parentElement!.dataset.id!;
      setMode('start-test');
      e.stopImmediatePropagation();
    }
  })

  startTestViewStartButton.addEventListener('click', () => {
    start();
  })
}

export function getTitleName() {
  if (type == 'work') return works[id].name;
  else if (type == 'group') return groups[id].name;
  return '';
}

export async function getAllQuestion() {
  async function getGroupQuestions(workId: string, groupId: string) {
    let questions: Question[];
    questions = Object.entries(await api.getQuestions(workId, groupId)).map(([k, v]) => ({id: k, ...v}));
    return questions;
  }

  let questions: Question[] = [];
  if (type == 'work') {
    for(let i of Object.keys(await api.getGroups(id))) {
      questions = [...questions, ...(await getGroupQuestions(id, i))]
    }
  } else if (type == 'group') {
    questions = await getGroupQuestions(currentWork, id);
  }
  return questions;
}

export async function start() {
  let questions = await getAllQuestion();
  let options: TestOptions = {
    method: startTestViewSettingDiv.querySelector<HTMLInputElement>('input[name=method]:checked')!.value as any,
    amount: toNumberOrString(startTestViewSettingDiv.querySelector<HTMLInputElement>('input[name=amount]:checked')!.value) as any,
  };
  test(getTitleName(), questions, options);
}
