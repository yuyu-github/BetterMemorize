import { listViewAddButton, backSpan, titleH1, menuDiv, listViewDiv, editQuestionViewDiv, editQuestionViewQuestionTextarea, editQuestionViewAnswerTextarea, questionViewDiv, questionViewQuestionTextarea, questionViewAnswerTextarea } from "./elements.js";
import { currentGroup, groups, updateGroups } from "./group/group.js";
import { currentQuestion, questions, updateQuestions } from "./question/question.js";
import { currentWork, updateWorks, works } from "./work/work.js";

type ModeType = 
| 'all-work'
| 'work'
| 'group'
| 'question'
| 'add-question'
| 'edit-question'
const modeToBack: {[key in ModeType]?: ModeType} = {
  'work': 'all-work',
  'group': 'work',
  'question': 'group',
  'add-question': 'group',
  'edit-question': 'question',
}

export let currentMode: ModeType = 'all-work';

export function init() {
  backSpan.addEventListener('click', back);
}

export function setMode(mode: ModeType) {
  currentMode = mode;

  backSpan.style.display = modeToBack[currentMode] == null ? 'none' : 'block';
  [menuDiv, listViewDiv, listViewAddButton, editQuestionViewDiv, questionViewDiv].forEach(i => i.style.display = 'none');

  let viewElems: HTMLElement[] = [];
  switch (mode) {
    case 'all-work': {
      titleH1.innerText = 'すべてのワーク';
      viewElems = [listViewDiv, listViewAddButton];
      updateWorks();
    }
    break;
    case 'work': {
      titleH1.innerText = works[currentWork].name;
      viewElems = [menuDiv, listViewDiv, listViewAddButton];
      updateGroups();
    }
    break;
    case 'group': {
      titleH1.innerText = groups[currentGroup].name;
      viewElems = [menuDiv, listViewDiv, listViewAddButton];
      updateQuestions();
    }
    break;
    case 'question': {
      titleH1.innerText = questions[currentQuestion].question.replace('\n', ' ');
      viewElems = [menuDiv, questionViewDiv];
      questionViewQuestionTextarea.value = questions[currentQuestion].question;
      questionViewAnswerTextarea.value = questions[currentQuestion].answer;
    }
    break;
    case 'add-question': {
      titleH1.innerText = '';
      editQuestionViewQuestionTextarea.value = '';
      editQuestionViewAnswerTextarea.value = '';
      viewElems = [editQuestionViewDiv];
    }
    break;
    case 'edit-question': {
      titleH1.innerText = questions[currentQuestion].question.replace('\n', ' ');
      editQuestionViewQuestionTextarea.value = questions[currentQuestion].question;
      editQuestionViewAnswerTextarea.value = questions[currentQuestion].answer;
      viewElems = [editQuestionViewDiv];
    }
    break;
  }
  viewElems.forEach(i => i.style.display = '');
}

export function reload() {
  setMode(currentMode);
}

export function back() {
  setMode(modeToBack[currentMode] ?? 'all-work');
}
