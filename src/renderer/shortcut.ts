import { backSpan, editQuestionViewAnswerTextarea, editQuestionViewOkButton, editQuestionViewQuestionTextarea, listViewAddButton, listViewGroupAddButton, listViewImportButton, listViewQuestionAddButton, menuDeleteButton, menuEditButton, menuExportButton, menuStartButton, testAnswerViewButtonOuterDiv, testQuestionViewCheckButton, testResultViewBackButton, testResultViewDiv } from "./elements.js";
import { currentMode } from "./mode.js";

function clickShortcut(elem: HTMLElement | null, cond: boolean, e: KeyboardEvent) {
  if (elem != null && elem.checkVisibility() && cond) {
    elem.click();
    e.preventDefault();
  }
}

export function init() {
  addEventListener('keydown', e => {
    clickShortcut(backSpan, e.key == 'Escape', e);
    clickShortcut(backSpan, e.key == 'Backspace' && e.target == document.body, e);
    clickShortcut(menuStartButton, e.code == 'Space' && e.ctrlKey, e);
    clickShortcut(menuEditButton, e.code == 'KeyE' && e.ctrlKey, e);
    clickShortcut(menuExportButton, e.code == 'KeyS' && e.ctrlKey, e);
    clickShortcut(menuDeleteButton, currentMode == 'question' && e.code == 'KeyD' && e.ctrlKey, e);
    clickShortcut(listViewAddButton, e.code == 'KeyA' && e.ctrlKey, e);
    clickShortcut(listViewQuestionAddButton, e.code == 'KeyA' && e.ctrlKey && !e.shiftKey, e);
    clickShortcut(listViewGroupAddButton, e.code == 'KeyA' && e.ctrlKey && e.shiftKey, e);
    clickShortcut(listViewImportButton, e.code == 'KeyI' && e.ctrlKey, e);
    clickShortcut(testQuestionViewCheckButton, e.key == 'Enter' || e.code == 'Space', e);
    clickShortcut(testAnswerViewButtonOuterDiv.querySelector<HTMLElement>('button[value="0"]'), e.code == 'KeyS', e);
    clickShortcut(testAnswerViewButtonOuterDiv.querySelector<HTMLElement>('button[value="1"]'), e.code == 'KeyD', e);
    clickShortcut(testAnswerViewButtonOuterDiv.querySelector<HTMLElement>('button[value="2"]'), e.code == 'KeyF', e);
  })

  editQuestionViewQuestionTextarea.addEventListener('keydown', e => {
    if (e.key == 'Enter' && e.shiftKey) {
      editQuestionViewAnswerTextarea.focus();
      e.preventDefault();
    }
  })
  editQuestionViewAnswerTextarea.addEventListener('keydown', e => {
    clickShortcut(editQuestionViewOkButton, e.key == 'Enter' && e.shiftKey, e);
  })
}
