import { listViewListDiv, menuStartButton } from "../elements.js";
import { currentGroup, groups } from "../group/group.js";
import { currentMode, setMode } from "../mode.js";
import { currentWork, works } from "../work/work.js";

let type: 'work' | 'group' = 'work';
let id: string = '';

export function init() {
  menuStartButton.addEventListener('click', e => {
    if (currentMode == 'work') {
      type = 'work';
      id = currentWork;
    } else if (currentMode == 'group') {
      type = 'group';
      id = currentGroup;
    }
    setMode('start-test');
    e.stopImmediatePropagation();
  })

  listViewListDiv.addEventListener('click', e => {
    let target = e.target as HTMLElement;
    if (target.nodeName == 'BUTTON' && target.classList.contains('start')) {
      if (currentMode == 'all-work') type = 'work';
      else if (currentMode == 'work') type = 'group';
      id = target.parentElement!.dataset.id!;
      setMode('start-test');
      e.stopImmediatePropagation();
    }
  })
}

export function getTitleName() {
  if (type == 'work') return works[id].name;
  else if (type == 'group') return groups[id].name;
  return '';
}
