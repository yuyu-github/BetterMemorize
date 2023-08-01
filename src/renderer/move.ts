import { listViewCancelMoveButton, listViewMoveHereButton, menuMoveButton } from "./elements.js";
import { currentGroup, groupPath } from "./group/group.js";
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
      source = groupPath.at(-1) ?? null;
    } else if (currentMode == 'question') {
      type = 'question';
      id = currentQuestion;
      source = currentGroup;
    }

    inMoving = true;
    back();
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
