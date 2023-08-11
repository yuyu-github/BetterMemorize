import { listViewCancelMoveButton, listViewListDiv, listViewMoveHereButton, menuMoveButton } from "./elements.js";
import { currentGroup, groupHistory } from "./group/group.js";
import { back, currentMode, reload } from "./mode.js";
import { currentQuestion } from "./question/question.js";
import { currentWork } from "./work/work.js";

export let inMoving = false;
export let type: 'group' | 'question' = 'group';
export let workId: string = '';

let id: string = '';
let source: string | null = '';

export function init() {
  menuMoveButton.addEventListener('click', () => {
    workId = currentWork;
    if (currentMode == 'group') {
      type = 'group';
      id = currentGroup;
      source = groupHistory.at(-1) ?? null;
    } else if (currentMode == 'question') {
      type = 'question';
      id = currentQuestion;
      source = currentGroup;
    }

    inMoving = true;
    back();
  })

  listViewListDiv.addEventListener('click', async e => {
    let target = e.target as HTMLElement;
    if (target.nodeName == 'BUTTON' && target.classList.contains('move')) {
      workId = currentWork;
      if (currentMode == 'work') type = 'group';
      else if (currentMode == 'group' && target.parentElement!.dataset.type == 'group') type = 'group';
      else if (currentMode == 'group' && target.parentElement!.dataset.type == 'question') type = 'question';
      id = target.parentElement!.dataset.id!;
      source = currentMode == 'group' ? currentGroup : null;

      inMoving = true;
      reload();
      e.stopImmediatePropagation();
    }
  })

  listViewMoveHereButton.addEventListener('click', async () => {
    if (type == 'group') await api.moveGroup(workId, id, source, currentMode == 'work' ? null : currentGroup);
    else if (type == 'question') await api.moveQuestion(workId, id, source!, currentGroup);
    inMoving = false;
    reload();
  })

  listViewCancelMoveButton.addEventListener('click', () => {
    inMoving = false;
    reload();
  })
}

export function isMoving(type_: 'group' | 'question', id_: string) {
  return inMoving && type_ == type && id_ == id;
}
