import { listViewAddButton, backSpan, titleH1 } from "./elements.js";
import { updateWorks } from "./work_list/work_list.js";

type ModeType = 'work-list';

export let currentMode: ModeType = 'work-list';

export function setMode(mode: ModeType) {
  currentMode = mode;

  backSpan.style.display = 'block';
  listViewAddButton.style.display = 'block';
  switch (mode) {
    case 'work-list': {
      titleH1.innerText = 'すべてのワーク';
      backSpan.style.display = 'none';

      updateWorks();
    }
    break;
  }
}
