import { listViewAddButton, backSpan, titleH1, menuDiv, listViewDiv } from "./elements.js";
import { updateGroups } from "./group/group.js";
import { currentWork, updateWorks, works } from "./work/work.js";

type ModeType = 
| 'all-work'
| 'work'
const modeToBack: {[key in ModeType]?: ModeType} = {
  'work': 'all-work',
}

export let currentMode: ModeType = 'all-work';

export function init() {
  backSpan.addEventListener('click', () => {
    setMode(modeToBack[currentMode] ?? 'all-work');
  })
}

export function setMode(mode: ModeType) {
  currentMode = mode;

  backSpan.style.display = modeToBack[currentMode] == null ? 'none' : 'block';
  [menuDiv, listViewDiv, listViewAddButton].forEach(i => i.style.display = 'none');

  let viewElems: HTMLElement[] = [];
  switch (mode) {
    case 'all-work': {
      titleH1.innerText = 'すべてのワーク';
      viewElems = [listViewDiv, listViewAddButton];
      updateWorks();
    }
    break;
    case 'work': {
      titleH1.innerText = works[currentWork].name;
      viewElems = [menuDiv, listViewDiv, listViewAddButton];

      updateGroups();
    }
    break;
  }
  viewElems.forEach(i => i.style.display = 'block');
}
