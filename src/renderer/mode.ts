import { listViewAddButton, backSpan, titleH1 } from "./elements.js";
import { updateGroups } from "./group/group.js";
import { currentWork, updateWorks, works } from "./work/work.js";

type ModeType = 
| 'all-work'
| 'work'

export let currentMode: ModeType = 'all-work';

export function setMode(mode: ModeType) {
  currentMode = mode;

  [backSpan, listViewAddButton].forEach(i => i.style.display = 'block');

  switch (mode) {
    case 'all-work': {
      titleH1.innerText = 'すべてのワーク';
      backSpan.style.display = 'none';

      updateWorks();
    }
    break;
    case 'work': {
      titleH1.innerText = works[currentWork].name;

      updateGroups();
    }
    break;
  }
}
