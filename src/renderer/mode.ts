import { addButton, backSpan, titleH1 } from "./elements.js";

type ModeType = 'work-list';

export let currentMode: ModeType = 'work-list';

export function setMode(mode: ModeType) {
  currentMode = mode;

  backSpan.style.display = 'block';
  addButton.style.display = 'block';
  switch (mode) {
    case 'work-list': {
      titleH1.innerText = 'すべてのワーク';
      backSpan.style.display = 'none';
    }
    break;
  }
}
