import { backSpan, dialogDiv, editQuestionViewAnswerTextarea, editQuestionViewOkButton, editQuestionViewQuestionTextarea, listViewAddButton, listViewGroupAddButton, listViewImportButton, listViewListDiv, listViewQuestionAddButton, menuDeleteButton, menuEditButton, menuExportButton, menuStartButton, questionViewToggleButton, testAnswerViewButtonOuterDiv, testQuestionViewCheckButton, testResultViewAgainButton, testResultViewBackButton, testResultViewDiv, testViewBackButton } from "./elements.js";
import { back, currentMode, forward } from "./mode.js";

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
    clickShortcut(listViewImportButton, e.code == 'KeyI' && e.ctrlKey && !e.shiftKey, e);
    clickShortcut(questionViewToggleButton, e.code == 'Space', e);
    clickShortcut(testViewBackButton, e.code == 'KeyR' && !e.ctrlKey, e);
    clickShortcut(testQuestionViewCheckButton, e.key == 'Enter' || e.code == 'Space', e);
    clickShortcut(testAnswerViewButtonOuterDiv.querySelector<HTMLElement>('button[value="0"]'), e.code == 'KeyS', e);
    clickShortcut(testAnswerViewButtonOuterDiv.querySelector<HTMLElement>('button[value="1"]'), e.code == 'KeyD', e);
    clickShortcut(testAnswerViewButtonOuterDiv.querySelector<HTMLElement>('button[value="2"]'), e.code == 'KeyF', e);
    clickShortcut(testResultViewAgainButton, e.code == 'Enter' || e.code == 'Space', e);
    clickShortcut(testResultViewBackButton, e.code == 'KeyR' && !e.ctrlKey, e);

    if (e.code == 'ArrowLeft' && e.altKey) back();
    if (e.code == 'ArrowRight' && e.altKey) forward();
    if (listViewListDiv.checkVisibility()) {
      let elem: HTMLElement | null = null;
      if (e.code == 'ArrowUp' && !e.ctrlKey) elem = (listViewListDiv.querySelector('& > div:has(+ div:focus)') ?? listViewListDiv.querySelector('& > div:first-of-type')) as HTMLElement | null;
      if (e.code == 'ArrowDown' && !e.ctrlKey) elem = (listViewListDiv.querySelector('& > div:focus + div, & > div:focus:last-of-type') ?? listViewListDiv.querySelector('& > div:first-of-type')) as HTMLElement | null;
      if (elem != null) {
        if (elem.getBoundingClientRect().top < listViewListDiv.getBoundingClientRect().top) elem?.scrollIntoView({block: 'start'});
        if (elem.getBoundingClientRect().bottom > listViewListDiv.getBoundingClientRect().bottom) elem?.scrollIntoView({block: 'end'});
        elem?.focus();
        e.preventDefault();
      }

      if (e.code == 'ArrowUp' && e.ctrlKey && !e.repeat) {
        let timer = setInterval(() => listViewListDiv.scrollBy({top: -Math.max(3, listViewListDiv.scrollHeight / 1000)}), 5)
        let stop = () => {
          clearInterval(timer);
          removeEventListener('keyup', onKeyup);
          removeEventListener('keydown', onKeydown);
        };
        let onKeyup = (e: KeyboardEvent) => {if (e.code == 'ArrowUp' || !e.ctrlKey) stop()};
        let onKeydown = (e: KeyboardEvent) => {if (e.code == 'ArrowDown' || !e.ctrlKey) stop()};
        addEventListener('keyup', onKeyup)
        addEventListener('keydown', onKeydown);
        e.preventDefault();
      }
      if (e.code == 'ArrowDown' && e.ctrlKey && !e.repeat) {
        let timer = setInterval(() => listViewListDiv.scrollBy({top: Math.max(3, listViewListDiv.scrollHeight / 1000)}), 5)
        let stop = () => {
          clearInterval(timer);
          removeEventListener('keyup', onKeyup);
          removeEventListener('keyup', onKeydown);
        };
        let onKeyup = (e: KeyboardEvent) => {if (e.code == 'ArrowDown' || !e.ctrlKey) stop()};
        let onKeydown = (e: KeyboardEvent) => {if (e.code == 'ArrowUp' || !e.ctrlKey) stop()};
        addEventListener('keyup', onKeyup)
        addEventListener('keydown', onKeydown);
        e.preventDefault();
      }
    }
  })

  listViewListDiv.addEventListener('keydown', e => {
    if (e.key == 'Enter') {
      (e.target as HTMLElement).click();
    }
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
