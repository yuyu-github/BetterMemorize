import { listViewListDiv, menuStartButton, questionViewAnswerTextarea, startTestViewCustomAmountInput, startTestViewSettingDiv, startTestViewStartButton } from "../elements.js";
import { currentGroup, groups } from "../group/group.js";
import { currentMode, setMode } from "../mode.js";
import { Question, QuestionWithId } from "../question/question.js";
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
      else if (currentMode == 'group') type = 'group';
      id = target.parentElement!.dataset.id!;
      setMode('start-test');
      e.stopImmediatePropagation();
    }
  })

  startTestViewCustomAmountInput.addEventListener('focus', () => {
    startTestViewSettingDiv.querySelector<HTMLInputElement>('input[name=amount][value=custom]')!.checked = true;
  })
  startTestViewCustomAmountInput.addEventListener('keydown', e => {
    if (e.key.length == 1 && !'0123456789'.includes(e.key)) e.preventDefault();
  })
  startTestViewCustomAmountInput.addEventListener('input', () => {
    if (Number(startTestViewCustomAmountInput.value) > 1000) startTestViewCustomAmountInput.value = '1000';
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
    let questions: QuestionWithId[];
    questions = [
      ...Object.entries(await api.getQuestions(workId, groupId)).map(([k, v]) => ({workId, groupId, id: k, ...v})),
      ...(await Promise.all(Object.entries(await api.getGroups(workId, groupId)).map(async ([k, v]) => await getGroupQuestions(workId, k)))).flat(),
    ];
    return questions;
  }

  let questions: QuestionWithId[] = [];
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

  let amount: number | string = startTestViewSettingDiv.querySelector<HTMLInputElement>('input[name=amount]:checked')!.value;
  if (amount == 'custom') amount = Number(startTestViewCustomAmountInput.value);
  let options: TestOptions = {
    method: startTestViewSettingDiv.querySelector<HTMLInputElement>('input[name=method]:checked')!.value as any,
    amount: amount as any,
  };
  test(getTitleName(), questions, options);
}
