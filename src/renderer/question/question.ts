import { editQuestionAnswerTextarea, editQuestionCancelButton, editQuestionOkButton, editQuestionQuestionTextarea, listViewAddButton, listViewListDiv, titleH1 } from "../elements.js";
import { currentGroup } from "../group/group.js";
import { back, currentMode, setMode } from "../mode.js";
import { createElement } from "../utils.js";
import { currentWork } from "../work/work.js";

export type Question = {
  question: string,
  answer: string,
}

export let questions: {[id: string]: Question} = {};
export let currentQuestion = '';

export function init() {
  listViewListDiv.addEventListener('click', e => {
    if (currentMode == 'group') {
      let id = (e.target as HTMLElement).dataset.id;
      if (id == null) return;
      currentQuestion = id;
      setMode('question');
      e.stopImmediatePropagation();
    }
  })

  listViewAddButton.addEventListener('click', async e => {
    if (currentMode == 'group') {
      setMode('add-question');
      e.stopImmediatePropagation();
    }
  });

  editQuestionQuestionTextarea.addEventListener('input', () => {
    titleH1.innerText = editQuestionQuestionTextarea.value;
  })

  editQuestionOkButton.addEventListener('click', () => {
    if (editQuestionQuestionTextarea.value != '' && editQuestionAnswerTextarea.value != '') {
      addQuestion(editQuestionQuestionTextarea.value, editQuestionAnswerTextarea.value);
    }
    back();
  })

  editQuestionCancelButton.addEventListener('click', () => {
    back();
  })
}

async function addQuestion(question: string, answer: string) {
  await api.addQuestion(currentWork, currentGroup, {question, answer});
  updateQuestions();
}

export function cacheQuestions(data: {[key: string]: Question}) {
  questions = {...questions, ...data};
}

export async function updateQuestions() {
  let questions = await api.getQuestions(currentWork, currentGroup);
  cacheQuestions(questions);

  let newelem = createElement('div');
  for (let id in questions) {
    newelem.appendChild(createElement('div', {data: {id: id}}, [createElement('p', {}, [questions[id].question])]));
  }
  listViewListDiv.innerHTML = newelem.innerHTML;
}
