import { listViewAddButton, backSpan, titleH1, menuDiv, listViewDiv, editQuestionViewDiv, editQuestionViewQuestionTextarea, editQuestionViewAnswerTextarea, questionViewDiv, questionViewQuestionTextarea, questionViewAnswerTextarea, listViewListDiv, menuStartButton, startTestViewDiv, testQuestionViewDiv, testAnswerViewDiv } from "./elements.js";
import { currentGroup, groups, updateGroups } from "./group/group.js";
import { currentQuestion, questions, updateQuestions } from "./question/question.js";
import { getTitleName as getTestTitleName } from "./test/start.js";
import { currentWork, updateWorks, works } from "./work/work.js";

type ModeType = 
| 'all-work'
| 'work'
| 'group'
| 'question'
| 'add-question'
| 'edit-question'
| 'start-test'
| 'test-question'
| 'test-answer'

export let currentMode: ModeType = 'all-work';
export let modeHistory: ModeType[] = [];

export function init() {
  backSpan.addEventListener('click', back);
}

export function setMode(mode: ModeType, updateHistory = true) {
  currentMode = mode;
  
  if (['test-question', 'test-answer'].includes(modeHistory.at(-1)!) && ['test-question', 'test-answer'].includes(mode)) updateHistory = false;
  if (updateHistory) modeHistory.push(mode);

  backSpan.style.display = 'block';
  [menuDiv, menuStartButton, listViewDiv, listViewAddButton, editQuestionViewDiv, questionViewDiv, startTestViewDiv, testQuestionViewDiv, testAnswerViewDiv].forEach(i => i.style.display = 'none');
  listViewListDiv.innerHTML = '';

  let viewElems: HTMLElement[] = [];
  switch (mode) {
    case 'all-work': {
      titleH1.innerText = 'すべてのワーク';
      backSpan.style.display = 'none'
      viewElems = [listViewDiv, listViewAddButton];
      updateWorks();
    }
    break;
    case 'work': {
      titleH1.innerText = works[currentWork].name;
      viewElems = [menuDiv, menuStartButton, listViewDiv, listViewAddButton];
      updateGroups();
    }
    break;
    case 'group': {
      titleH1.innerText = groups[currentGroup].name;
      viewElems = [menuDiv, menuStartButton, listViewDiv, listViewAddButton];
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
    case 'start-test': {
      titleH1.innerText = getTestTitleName();
      viewElems = [startTestViewDiv];
    }
    break;
    case 'test-question': {
      viewElems = [testQuestionViewDiv];
    }
    break;
    case 'test-answer': {
      viewElems = [testAnswerViewDiv]
    }
    break;
  }
  viewElems.forEach(i => i.style.display = '');
}

export function reload() {
  setMode(currentMode, false);
}

export function back() {
  if (modeHistory.length > 0) {
    modeHistory.pop();
    setMode(modeHistory.at(-1)!, false);
  } else {
    setMode('all-work', false);
  }
}
