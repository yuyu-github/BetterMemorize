import { listViewAddButton, backSpan, titleH1, menuDiv, listViewDiv, editQuestionViewDiv, editQuestionViewQuestionTextarea, editQuestionViewAnswerTextarea, questionViewDiv, questionViewQuestionTextarea, questionViewAnswerTextarea, listViewListDiv, menuStartButton, startTestViewDiv, testQuestionViewDiv, testAnswerViewDiv, listViewGroupAddButton, listViewQuestionAddButton, startTestViewSettingDiv, startTestViewCustomAmountInput, testResultViewDiv, menuExportButton, listViewImportButton } from "./elements.js";
import { backGroup, currentGroup, groups, updateGroups } from "./group/group.js";
import { currentQuestion, questions, updateGroupChildren } from "./question/question.js";
import { getTitleName as getTestTitleName, loadPreviousOptions } from "./test/start.js";
import { TestOptions } from "./test/test.js";
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
| 'test-result'

export let currentMode: ModeType = 'all-work';
export let modeHistory: ModeType[] = [];

export function init() {
  backSpan.addEventListener('click', back);
}

export function setMode(mode: ModeType, updateHistory = true) {
  currentMode = mode;

  let rewriteHistory = 0;
  if (['test-question', 'test-answer'].includes(modeHistory.at(-1)!) && ['test-question', 'test-answer'].includes(mode)) rewriteHistory = 1;
  if (mode == 'test-result') rewriteHistory = 2;
  if (modeHistory.at(-1) == 'test-result' && mode == 'start-test') rewriteHistory = 1;

  if (updateHistory && rewriteHistory == 0) modeHistory.push(mode);
  if (rewriteHistory > 0) modeHistory.splice(-rewriteHistory, rewriteHistory, mode);

  backSpan.style.display = 'block';
  [
    menuDiv, menuStartButton, menuExportButton,
    listViewDiv, listViewAddButton, listViewGroupAddButton, listViewQuestionAddButton, listViewImportButton,
    editQuestionViewDiv, questionViewDiv, startTestViewDiv, testQuestionViewDiv, testAnswerViewDiv, testResultViewDiv
  ].forEach(i => i.style.display = 'none');
  listViewListDiv.innerHTML = '';

  const view = (elems) => elems.forEach(i => i.style.display = '');
  switch (mode) {
    case 'all-work': {
      titleH1.innerText = 'すべてのワーク';
      backSpan.style.display = 'none'
      view([listViewDiv, listViewAddButton, listViewImportButton]);
      updateWorks();
    }
    break;
    case 'work': {
      titleH1.innerText = works[currentWork].name;
      view([menuDiv, menuStartButton, menuExportButton, listViewDiv, listViewAddButton, listViewImportButton]);
      updateGroups();
    }
    break;
    case 'group': {
      titleH1.innerText = groups[currentGroup].name;
      view([menuDiv, menuStartButton, menuExportButton, listViewDiv, listViewGroupAddButton, listViewQuestionAddButton, listViewImportButton]);
      updateGroupChildren();
    }
    break;
    case 'question': {
      titleH1.innerText = questions[currentQuestion].question.replace('\n', ' ');
      questionViewQuestionTextarea.value = questions[currentQuestion].question;
      questionViewAnswerTextarea.value = questions[currentQuestion].answer;
      view([menuDiv, questionViewDiv]);
    }
    break;
    case 'add-question': {
      titleH1.innerText = '';
      editQuestionViewQuestionTextarea.value = '';
      editQuestionViewAnswerTextarea.value = '';
      view([editQuestionViewDiv]);
      editQuestionViewQuestionTextarea.focus();
    }
    break;
    case 'edit-question': {
      titleH1.innerText = questions[currentQuestion].question.replace('\n', ' ');
      editQuestionViewQuestionTextarea.value = questions[currentQuestion].question;
      editQuestionViewAnswerTextarea.value = questions[currentQuestion].answer;
      view([editQuestionViewDiv]);
      editQuestionViewQuestionTextarea.focus();
    }
    break;
    case 'start-test': {
      titleH1.innerText = getTestTitleName();
      view([startTestViewDiv]);
      editQuestionViewQuestionTextarea.focus();
      loadPreviousOptions();
    }
    break;
    case 'test-question': {
      view([testQuestionViewDiv]);
    }
    break;
    case 'test-answer': {
      view([testAnswerViewDiv]);
    }
    break;
    case 'test-result': {
      view([testResultViewDiv]);
    }
    break;
  }
}

export function reload() {
  setMode(currentMode, false);
}

export function back() {
  if (currentMode == 'group' && modeHistory.at(-1) == 'group') backGroup();

  if (modeHistory.length > 0) {
    modeHistory.pop();
    setMode(modeHistory.at(-1)!, false);
  } else {
    setMode('all-work', false);
  }
}
