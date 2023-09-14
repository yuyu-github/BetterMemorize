import { ButtonResult, showDialog } from "../dialog.js";
import { backSpan, editQuestionViewAnswerTextarea, editQuestionViewCancelButton, editQuestionViewOkButton, editQuestionViewQuestionTextarea, listViewAddButton, listViewListDiv, listViewQuestionAddButton, menuDeleteButton, menuEditButton, questionContentViewDiv, questionViewToggleButton, titleH1 } from "../elements.js";
import { cacheGroups, currentGroup, drawGroupList } from "../group/group.js";
import { back, currentMode, reload, setMode } from "../mode.js";
import { isMoving } from "../move.js";
import { createElement, drawList } from "../utils.js";
import { currentWork } from "../work/work.js";
import { compile } from "./compile/compile.js";
import { showQuestionContent } from "./show.js";

export type Question = {
  question: string,
  answer: string,
}
export type QuestionWithId = Question & {
  workId: string,
  groupId: string,
  id: string
}

export let questions: {[id: string]: Question} = {};
export let currentQuestion = '';

let compiledQuestion: {question: string, answer: string} | null = null;
let showing: 'question' | 'answer' = 'question';

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
        back(true);
      }
    }
  })

  listViewListDiv.addEventListener('click', async e => {
    if (currentMode == 'group') {
      let target = e.target as HTMLElement;
      if (target.dataset.type != 'question' && target.parentElement?.dataset.type != 'question') return;
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
        let question = target.parentElement!.dataset.id!;
        let result = await showDialog('問題を削除', '本当に削除しますか？', 'yes-no-danger');
        if (result.button == ButtonResult.Yes) {
          deleteQuestion(currentWork, currentGroup, question);
          reload();
        }
      }
    }
  })

  listViewQuestionAddButton.addEventListener('click', async e => {
    if (currentMode == 'group') {
      setMode('add-question');
      e.stopImmediatePropagation();
    }
  });

  questionViewToggleButton.addEventListener('click', () => {
    if (showing == 'question') {
      showing = 'answer';
      questionViewToggleButton.innerText = '問題';
      showQuestionContent(compiledQuestion!.answer);
    } else if (showing == 'answer') {
      showing = 'question';
      questionViewToggleButton.innerText = '解答';
      showQuestionContent(compiledQuestion!.question);
    }
  })

  editQuestionViewQuestionTextarea.addEventListener('input', () => {
    titleH1.innerText = editQuestionViewQuestionTextarea.value.replaceAll('\n', ' ');
  })

  backSpan.addEventListener('click', e => {
    if (currentMode == 'edit-question') {
      editQuestionViewOkButton.click();
      e.stopImmediatePropagation();
    }
  }, {capture: true})
  editQuestionViewOkButton.addEventListener('click', () => {
    if (editQuestionViewQuestionTextarea.value != '') {
      if (currentMode == 'add-question') {
        addQuestion(editQuestionViewQuestionTextarea.value, editQuestionViewAnswerTextarea.value);
        updateGroupChildren();
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
  Object.assign(questions, data);
}

export async function updateGroupChildren() {
  let groups = await api.getGroups(currentWork, currentGroup);
  cacheGroups(groups);
  let questions = await api.getQuestions(currentWork, currentGroup);
  cacheQuestions(questions);

  drawGroupList(groups);
  listViewListDiv.insertAdjacentHTML('beforeend', '<hr>');
  drawList(Object.entries(questions).sort((a, b) => b[1].lastAccessTime - a[1].lastAccessTime), ([id, question]) => {
    if (isMoving('question', id)) return;
    return createElement('div', {tabIndex: 0, data: {id: id, type: 'question'}}, [
      createElement('p', {}, [question.question]),
      createElement('button', {class: 'edit'}, ['編集']),
      createElement('button', {class: 'move'}, ['移動']),
      createElement('button', {class: 'delete'}, ['削除'])
    ]);
  }, false);
  listViewListDiv.querySelector('& > hr:first-child, & > hr:last-child')?.remove();
}

export function showQuestion() {
  compiledQuestion = compile(questions[currentQuestion].question, questions[currentQuestion].answer);
  showing = 'question';
  questionViewToggleButton.innerText = '解答';
  showQuestionContent(compiledQuestion.question);
}
