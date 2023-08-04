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

  backSpan.style.display = '';

  switch (mode) {
    case 'all-work': {
      titleH1.innerText = 'すべてのワーク';
      backSpan.style.display = 'none';
      await updateWorks();
    }
    break;
    case 'work': {
      titleH1.innerText = works[currentWork].name;
      await updateGroups();
    }
    break;
    case 'group': {
      titleH1.innerText = groups[currentGroup].name;
      await updateGroupChildren();
    }
    break;
    case 'question': {
      titleH1.innerText = questions[currentQuestion].question.replace('\n', ' ');
      questionViewQuestionTextarea.value = questions[currentQuestion].question;
      questionViewAnswerTextarea.value = questions[currentQuestion].answer;
    }
    break;
    case 'add-question': {
      titleH1.innerText = '';
      editQuestionViewQuestionTextarea.value = '';
      editQuestionViewAnswerTextarea.value = '';
    }
    break;
    case 'edit-question': {
      titleH1.innerText = questions[currentQuestion].question.replace('\n', ' ');
      editQuestionViewQuestionTextarea.value = questions[currentQuestion].question;
      editQuestionViewAnswerTextarea.value = questions[currentQuestion].answer;
    }
    break;
    case 'start-test': {
      titleH1.innerText = getTestTitleName();
      loadPreviousOptions();
    }
    break;
  }

  let viewElems: HTMLElement[] = ({
    'all-work': [listViewDiv, listViewAddButton, listViewImportButton],
    'work': [menuDiv, menuStartButton, menuExportButton, listViewDiv, listViewAddButton, listViewImportButton],
    'group': [menuDiv, menuStartButton, menuMoveButton, menuExportButton, listViewDiv, listViewGroupAddButton, listViewQuestionAddButton, listViewImportButton],
    'question': [menuDiv, menuMoveButton, questionViewDiv],
    'add-question': [editQuestionViewDiv],
    'edit-question': [editQuestionViewDiv],
    'start-test': [startTestViewDiv],
    'test-question': [testViewDiv, testQuestionViewDiv],
    'test-answer': [testViewDiv, testAnswerViewDiv],
    'test-result': [testResultViewDiv],
  } as {[key in ModeType]: HTMLElement[]})[mode];
  switch (mode) {
    case 'all-work': {
      if (inMoving) viewElems.push(listViewCancelMoveButton);
    }
    break;
    case 'work': {
      if (inMoving && movingWorkId == currentWork && movingType == 'group') viewElems.push(listViewMoveHereButton);
      if (inMoving) viewElems.push(listViewCancelMoveButton);
    }
    break;
    case 'group': {
      if (inMoving && movingWorkId == currentWork) viewElems.push(listViewMoveHereButton);
      if (inMoving) viewElems.push(listViewCancelMoveButton);
    }
    break;
  }

  [
    menuDiv, menuStartButton, menuMoveButton, menuExportButton,
    listViewDiv, listViewMoveHereButton, listViewCancelMoveButton, listViewAddButton, listViewGroupAddButton, listViewQuestionAddButton, listViewImportButton,
    editQuestionViewDiv, questionViewDiv, startTestViewDiv, testViewDiv, testQuestionViewDiv, testAnswerViewDiv, testResultViewDiv
  ].forEach(i => i.style.display = viewElems.includes(i) ? '' : 'none');

  switch (mode) {
    case 'add-question': {
      editQuestionViewQuestionTextarea.focus();
    }
    break;
    case 'edit-question': {
      editQuestionViewQuestionTextarea.focus();
    }
    break;
    case 'start-test': {
      editQuestionViewQuestionTextarea.focus();
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
