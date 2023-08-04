import { listViewAddButton, backSpan, titleH1, menuDiv, listViewDiv, editQuestionViewDiv, editQuestionViewQuestionTextarea, editQuestionViewAnswerTextarea, questionViewDiv, questionViewQuestionTextarea, questionViewAnswerTextarea, listViewListDiv, menuStartButton, startTestViewDiv, testQuestionViewDiv, testAnswerViewDiv, listViewGroupAddButton, listViewQuestionAddButton, startTestViewSettingDiv, startTestViewCustomAmountInput, testResultViewDiv, menuExportButton, listViewImportButton, testViewDiv, menuMoveButton, listViewMoveHereButton, listViewCancelMoveButton } from "./elements.js";
import { backGroup, currentGroup, groups, updateGroups } from "./group/group.js";
import { inMoving, type as movingType, workId as movingWorkId } from "./move.js";
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
let listViewScrollHistory: number[] = [];

export function init() {
  backSpan.addEventListener('click', back);
}

export async function setMode(mode: ModeType, updateHistory = true) {
  currentMode = mode;

  let rewriteHistory = 0;
  if (['test-question', 'test-answer'].includes(modeHistory.at(-1)!) && ['test-question', 'test-answer'].includes(mode)) rewriteHistory = 1;
  if (mode == 'test-result') rewriteHistory = 2;
  if (modeHistory.at(-1) == 'test-result' && mode == 'start-test') rewriteHistory = 1;

  if (listViewListDiv.checkVisibility()) listViewScrollHistory.splice(-1, 1, listViewListDiv.scrollTop);
  if (updateHistory && rewriteHistory == 0) {
    modeHistory.push(mode);
    listViewScrollHistory.push(0);
  }
  if (rewriteHistory > 0) {
    modeHistory.splice(-rewriteHistory, rewriteHistory, mode);
    listViewScrollHistory.splice(-rewriteHistory, rewriteHistory);
  }

  backSpan.style.display = 'block';
  [
    menuDiv, menuStartButton, menuMoveButton, menuExportButton,
    listViewDiv, listViewMoveHereButton, listViewCancelMoveButton, listViewAddButton, listViewGroupAddButton, listViewQuestionAddButton, listViewImportButton,
    editQuestionViewDiv, questionViewDiv, startTestViewDiv, testViewDiv, testQuestionViewDiv, testAnswerViewDiv, testResultViewDiv
  ].forEach(i => i.style.display = 'none');
  listViewListDiv.innerHTML = '';

  const view = (elems) => elems.forEach(i => i.style.display = '');
  switch (mode) {
    case 'all-work': {
      titleH1.innerText = 'すべてのワーク';
      backSpan.style.display = 'none'
      view([listViewDiv, listViewAddButton, listViewImportButton]);
      if (inMoving) view([listViewCancelMoveButton]);
      await updateWorks();
    }
    break;
    case 'work': {
      titleH1.innerText = works[currentWork].name;
      view([menuDiv, menuStartButton, menuExportButton, listViewDiv, listViewAddButton, listViewImportButton]);
      if (inMoving && movingWorkId == currentWork && movingType == 'group') view([listViewMoveHereButton]);
      if (inMoving) view([listViewCancelMoveButton]);
      await updateGroups();
    }
    break;
    case 'group': {
      titleH1.innerText = groups[currentGroup].name;
      view([menuDiv, menuStartButton, menuMoveButton, menuExportButton, listViewDiv, listViewGroupAddButton, listViewQuestionAddButton, listViewImportButton]);
      if (inMoving && movingWorkId == currentWork) view([listViewMoveHereButton]);
      if (inMoving) view([listViewCancelMoveButton]);
      await updateGroupChildren();
    }
    break;
    case 'question': {
      titleH1.innerText = questions[currentQuestion].question.replace('\n', ' ');
      questionViewQuestionTextarea.value = questions[currentQuestion].question;
      questionViewAnswerTextarea.value = questions[currentQuestion].answer;
      view([menuDiv, menuMoveButton, questionViewDiv]);
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
      view([testViewDiv, testQuestionViewDiv]);
    }
    break;
    case 'test-answer': {
      view([testViewDiv, testAnswerViewDiv]);
    }
    break;
    case 'test-result': {
      view([testResultViewDiv]);
    }
    break;
  }
}

export async function reload() {
  await setMode(currentMode, false);
  if (listViewListDiv.checkVisibility()) listViewListDiv.scrollTop = listViewScrollHistory.at(-1)!;
}

export async function back() {
  if (currentMode == 'group' && modeHistory.at(-1) == 'group') backGroup();

  if (modeHistory.length > 0) {
    modeHistory.pop();
    listViewScrollHistory.pop();
    await setMode(modeHistory.at(-1)!, false);
  } else {
    await setMode('all-work', false);
  }

  if (listViewListDiv.checkVisibility()) {
    listViewListDiv.scrollTop = listViewScrollHistory.at(-1)!;
  }
}
