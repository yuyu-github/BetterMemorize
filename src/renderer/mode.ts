import { addButton, backSpan, titleH1 } from "./elements.js";

type modeType = 'work-list';

export let currentMode: modeType = 'work-list';

export function setMode(mode: modeType) {
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
