import { listViewAddButton, backSpan, titleH1 } from "./elements.js";
import { updateGroups } from "./group/group.js";
import { currentWork, updateWorks, works } from "./work/work.js";

type ModeType = 
| 'work-list'
| 'group-list'

export let currentMode: ModeType = 'work-list';

export function setMode(mode: ModeType) {
  currentMode = mode;

  [backSpan, listViewAddButton].forEach(i => i.style.display = 'block');

  switch (mode) {
    case 'work-list': {
      titleH1.innerText = 'すべてのワーク';
      backSpan.style.display = 'none';

      updateWorks();
    }
    break;
    case 'group-list': {
      titleH1.innerText = works[currentWork].name;

      updateGroups();
    }
    break;
  }
}
