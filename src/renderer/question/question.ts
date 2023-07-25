import { ButtonResult, showDialog } from "../dialog.js";
import { backSpan, editQuestionViewAnswerTextarea, editQuestionViewCancelButton, editQuestionViewOkButton, editQuestionViewQuestionTextarea, listViewAddButton, listViewListDiv, menuDeleteButton, menuEditButton, titleH1 } from "../elements.js";
import { currentGroup } from "../group/group.js";
import { back, currentMode, reload, setMode } from "../mode.js";
import { createElement } from "../utils.js";
import { currentWork } from "../work/work.js";

export type Question = {
  question: string,
  answer: string,
}

export let questions: {[id: string]: Question} = {};
export let currentQuestion = '';

export function init() {
  menuEditButton.addEventListener('click', e => {
    if (currentMode == 'question') {
      setMode('edit-question');
      e.stopImmediatePropagation();
    }
  })

  menuDeleteButton.addEventListener('click', async () => {
    if (currentMode == 'question') {
      let result = await showDialog('問題を削除', '本当に削除しますか？', 'yes-no-danger');
      if (result.button == ButtonResult.Yes) {
        deleteQuestion(currentWork, currentGroup, currentQuestion);
        back();
      }
    }
  })

  listViewListDiv.addEventListener('click', async e => {
    if (currentMode == 'group') {
      let target = e.target as HTMLElement;
      let id = target.dataset.id;
      if (id != null) {
        currentQuestion = id;
        setMode('question');
        e.stopImmediatePropagation();
      } else if (target.nodeName == 'BUTTON' && target.classList.contains('edit')) {
        currentQuestion = target.parentElement!.dataset.id!;
        setMode('edit-question');
        e.stopImmediatePropagation();
      } else if (target.nodeName == 'BUTTON' && target.classList.contains('delete')) {
        currentQuestion = target.parentElement!.dataset.id!;
        let result = await showDialog('問題を削除', '本当に削除しますか？', 'yes-no-danger');
        if (result.button == ButtonResult.Yes) {
          deleteQuestion(currentWork, currentGroup, currentQuestion);
          reload();
        }
      }
    }
  })

  listViewAddButton.addEventListener('click', async e => {
    if (currentMode == 'group') {
      setMode('add-question');
      e.stopImmediatePropagation();
    }
  });

  editQuestionViewQuestionTextarea.addEventListener('input', () => {
    titleH1.innerText = editQuestionViewQuestionTextarea.value.replace('\n', ' ');
  })

  backSpan.addEventListener('click', e => {
    if (currentMode == 'edit-question') {
      editQuestionViewOkButton.click();
      e.stopImmediatePropagation();
    }
  }, {capture: true})
  editQuestionViewOkButton.addEventListener('click', () => {
    if (editQuestionViewQuestionTextarea.value != '' && editQuestionViewAnswerTextarea.value != '') {
      if (currentMode == 'add-question') {
        addQuestion(editQuestionViewQuestionTextarea.value, editQuestionViewAnswerTextarea.value);
        updateQuestions();
      }
      else if (currentMode == 'edit-question') editQuestion(currentWork, currentGroup, currentQuestion, editQuestionViewQuestionTextarea.value, editQuestionViewAnswerTextarea.value)
    }
    back();
  })

  editQuestionViewCancelButton.addEventListener('click', () => {
    back();
  })
}

async function addQuestion(question: string, answer: string) {
  await api.addQuestion(currentWork, currentGroup, {question, answer});
}

async function editQuestion(workId: string, groupId: string, id: string, question: string, answer: string) {
  questions[id] = {question, answer};
  await api.editQuestion(workId, groupId, id, {question, answer});
}

async function deleteQuestion(workId: string, groupId: string, id: string) {
  delete questions[id];
  await api.deleteQuestion(workId, groupId, id);
}

export function cacheQuestions(data: {[key: string]: Question}) {
  questions = {...questions, ...data};
}

export async function updateQuestions() {
  let questions = await api.getQuestions(currentWork, currentGroup);
  cacheQuestions(questions);

  let newelem = createElement('div');
  for (let id in questions) {
    newelem.appendChild(createElement('div', {data: {id: id}}, [
      createElement('p', {}, [questions[id].question]),
      createElement('button', {class: 'edit'}, ['編集']),
      createElement('button', {class: 'delete'}, ['削除'])
    ]));
  }
  listViewListDiv.innerHTML = newelem.innerHTML;
}
