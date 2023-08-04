import { listViewListDiv, menuStartButton, questionViewAnswerTextarea, startTestViewCustomAmountInput, startTestViewDiv, startTestViewSettingDiv, startTestViewStartButton } from "../elements.js";
import { currentGroup, groups } from "../group/group.js";
import { currentMode, setMode } from "../mode.js";
import { Question, QuestionWithId } from "../question/question.js";
import { WithLastAccessTime, toNumberOrString } from "../utils.js";
import { currentWork, works } from "../work/work.js";
import { TestOptions, test } from "./test.js";

type SavedOptions = TestOptions & {
  amount: TestOptions['amount'] | 'custom',
  customAmount: string,
};

let type: 'work' | 'group' = 'work';
let workId: string = '';
let groupId: string | null = null;

export function init() {
  menuStartButton.addEventListener('click', e => {
    if (currentMode == 'work') { 
      type = 'work';
      workId = currentWork;
    } else if (currentMode == 'group') {
      type = 'group';
      workId = currentWork;
      groupId = currentGroup;
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
      if (type == 'work') workId = target.parentElement!.dataset.id!;
      else {
        workId = currentWork;
        groupId = target.parentElement!.dataset.id!;
      }
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
  startTestViewCustomAmountInput.addEventListener('focusout', () => {
    if (Number(startTestViewCustomAmountInput.value) > 1000) startTestViewCustomAmountInput.value = '1000';
    if (Number(startTestViewCustomAmountInput.value) <= 0) startTestViewCustomAmountInput.value = '1';
  })

  startTestViewStartButton.addEventListener('click', () => {
    start();
  })

  addEventListener('keydown', e => {
    if (currentMode == 'start-test') {
      if (e.code == 'Enter' || e.code == 'Space') {
        startTestViewStartButton.click();
        e.preventDefault();
      }
    }
  })
}  

export function getTitleName() {
  if (type == 'work') return works[workId].name;
  else if (type == 'group') return groups[groupId!].name;
  return '';
}

export function loadPreviousOptions() {
  if (localStorage.getItem('testOptions') != null) {
    let options: SavedOptions = JSON.parse(localStorage.getItem('testOptions')!);
    startTestViewSettingDiv.querySelector<HTMLInputElement>(`input[name=mode][value=${options.mode ?? options['method']}]`)!.checked = true;
    startTestViewSettingDiv.querySelector<HTMLInputElement>(`input[name=amount][value=${options.amount}]`)!.checked = true;
    startTestViewCustomAmountInput.value = options.customAmount;
  }
}

export async function getAllQuestion() {
  async function getGroupQuestions(workId: string, groupId: string) {
    let questions: WithLastAccessTime<QuestionWithId>[];
    questions = [
      ...Object.entries(await api.getQuestions(workId, groupId)).map(([k, v]) => ({workId, groupId, id: k, ...v})),
      ...(await Promise.all(Object.entries(await api.getGroups(workId, groupId)).map(async ([k, v]) => await getGroupQuestions(workId, k)))).flat(),
    ];
    return questions;
  }

  let questions: WithLastAccessTime<QuestionWithId>[] = [];
  if (type == 'work') {
    for(let i of Object.keys(await api.getGroups(workId))) {
      questions = [...questions, ...(await getGroupQuestions(workId, i))]
    }
  } else if (type == 'group') {
    questions = await getGroupQuestions(workId, groupId!);
  }
  return questions;
}

export async function start() {
  let questions = await getAllQuestion();
  if (questions.length == 0) return;

  let amount: number | string = startTestViewSettingDiv.querySelector<HTMLInputElement>('input[name=amount]:checked')!.value;
  if (amount == 'custom') amount = Number(startTestViewCustomAmountInput.value);
  let options: TestOptions = {
    mode: startTestViewSettingDiv.querySelector<HTMLInputElement>('input[name=mode]:checked')!.value as any,
    amount: amount as any,
  };
  localStorage.setItem('testOptions', JSON.stringify({
    ...options,
    amount: startTestViewSettingDiv.querySelector<HTMLInputElement>('input[name=amount]:checked')!.value,
    customAmount: startTestViewCustomAmountInput.value,
  } as SavedOptions));

  api.updateLastAccessTime(workId, groupId)
  test(workId, groupId, getTitleName(), questions, options);
}
