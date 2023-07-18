import { listViewAddButton, backSpan, titleH1, menuDiv, listViewDiv } from "./elements.js";
import { currentGroup, groups, updateGroups } from "./group/group.js";
import { currentWork, updateWorks, works } from "./work/work.js";

type ModeType = 
| 'all-work'
| 'work'
| 'group'
const modeToBack: {[key in ModeType]?: ModeType} = {
  'work': 'all-work',
  'group': 'work',
}

export let currentMode: ModeType = 'all-work';

export function init() {
  backSpan.addEventListener('click', back);
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
    case 'group': {
      titleH1.innerText = groups[currentGroup].name;
      viewElems = [menuDiv, listViewDiv, listViewAddButton];
    }
    break;
  }
  viewElems.forEach(i => i.style.display = 'block');
}

export function reload() {
  setMode(currentMode);
}

export function back() {
  setMode(modeToBack[currentMode] ?? 'all-work');
}
