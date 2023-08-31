import { listViewAddButton, backSpan, titleH1, menuDiv, listViewDiv, editQuestionViewDiv, editQuestionViewQuestionTextarea, editQuestionViewAnswerTextarea, questionViewDiv, listViewListDiv, menuStartButton, startTestViewDiv, testQuestionViewDiv, testAnswerViewDiv, listViewGroupAddButton, listViewQuestionAddButton, startTestViewSettingDiv, startTestViewCustomAmountInput, testResultViewDiv, menuExportButton, listViewImportButton, testViewDiv, menuMoveButton, listViewMoveHereButton, listViewCancelMoveButton, questionContentViewDiv } from "./elements.js";
import { backGroup, currentGroup, forwardGroup, groups, updateGroups } from "./group/group.js";
import { inMoving, type as movingType, workId as movingWorkId } from "./move.js";
import { currentQuestion, questions, showQuestion, updateGroupChildren } from "./question/question.js";
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
export let modeHistoryIndex: number = -1;
let listViewScrollHistory: number[] = [];

export function init() {
  backSpan.addEventListener('click', () => back());

  history.replaceState({type: 'back'}, '');
  history.pushState(null, '');
  history.pushState({type: 'forward'}, '');
  history.back();
  addEventListener('popstate', e => {
    if (e.state == null) return;
    if (e.state?.type == 'back') {
      back();
      history.forward();
    }
    else if (e.state?.type == 'forward') {
      forward();
      history.back();
    }
  })
}

export async function setMode(mode: ModeType, updateHistory = true, replaceHistory = 0) {
  currentMode = mode;

  if (listViewListDiv.checkVisibility()) listViewScrollHistory.splice(modeHistoryIndex, 1, listViewListDiv.scrollTop);
  if (replaceHistory > 0) {
    modeHistory.splice(modeHistoryIndex - replaceHistory + 1, replaceHistory);
    listViewScrollHistory.splice(modeHistoryIndex - replaceHistory + 1, replaceHistory);
    modeHistoryIndex -= replaceHistory;
  }
  if (updateHistory) {
    (modeHistory = modeHistory.slice(0, modeHistoryIndex + 1)).push(mode);
    (listViewScrollHistory = listViewScrollHistory.slice(0, modeHistoryIndex + 1)).push(0);
    modeHistoryIndex++;
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
      showQuestion();
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
    'question': [menuDiv, menuMoveButton, questionContentViewDiv, questionViewDiv],
    'add-question': [editQuestionViewDiv],
    'edit-question': [editQuestionViewDiv],
    'start-test': [startTestViewDiv],
    'test-question': [questionContentViewDiv, testViewDiv, testQuestionViewDiv],
    'test-answer': [questionContentViewDiv, testViewDiv, testAnswerViewDiv],
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
    questionContentViewDiv, editQuestionViewDiv, questionViewDiv, startTestViewDiv, testViewDiv, testQuestionViewDiv, testAnswerViewDiv, testResultViewDiv
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
  if (listViewListDiv.checkVisibility()) listViewListDiv.scrollTop = listViewScrollHistory.at(modeHistoryIndex)!;
}

export async function back(deleteAfter = false) {
  if (modeHistoryIndex >= 1) {
    if (currentMode == 'group') backGroup();

    await setMode(modeHistory[modeHistoryIndex - 1], false);
    if (deleteAfter) modeHistory = modeHistory.slice(0, modeHistoryIndex);
    modeHistoryIndex--;

    if (listViewListDiv.checkVisibility()) {
      listViewListDiv.scrollTop = listViewScrollHistory.at(modeHistoryIndex)!;
    }
  }
}

export async function forward() {
  if (modeHistoryIndex + 1 < modeHistory.length) {
    if (modeHistory[modeHistoryIndex + 1] == 'group') forwardGroup();

    await setMode(modeHistory[modeHistoryIndex + 1], false);
    modeHistoryIndex++;

    if (listViewListDiv.checkVisibility()) {
      listViewListDiv.scrollTop = listViewScrollHistory.at(modeHistoryIndex)!;
    }
  }
}
