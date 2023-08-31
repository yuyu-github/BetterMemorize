import { questionContentViewDiv } from "../elements.js";
import { createElement } from "../utils.js";

function calcFontSize(content: string) {
  let elem = createElement('div', {style: {position: 'fixed', visibility: 'hidden', whiteSpace: 'pre'}});
  elem.innerHTML = content;
  document.body.appendChild(elem);
  MathJax.typeset([elem]);
  let width = elem.clientWidth;
  elem.remove();
  let size = 64 - width / 15;
  return Math.max(36, Math.ceil(size / 4) * 4);
}

export function showQuestionContent(content: string) {
  questionContentViewDiv.style.fontSize = calcFontSize(content) + 'px';
  questionContentViewDiv.innerHTML = content;
  MathJax.typeset([questionContentViewDiv]);
}
