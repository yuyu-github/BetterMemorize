import { mainElem, questionContentViewDiv } from "../elements.js";
import { createElement } from "../utils.js";

function calcFontSize(content: string) {
  let elem = createElement('div', {style: {position: 'fixed', visibility: 'hidden', whiteSpace: 'pre'}});
  elem.innerHTML = content;
  document.body.appendChild(elem);
  MathJax.typeset([elem]);
  let widthSize = mainElem.clientWidth / elem.clientWidth * 0.88 * 16;
  let heightSize = mainElem.clientHeight / elem.clientHeight * 0.88 * 16;
  elem.remove();
  let fontSize = content.includes('\n') ? Math.min(widthSize, heightSize) : Math.max(widthSize, Math.min(widthSize * 2, 45));
  return Math.max(mainElem.clientHeight / 20, Math.min(fontSize, mainElem.clientHeight / 10));
}

export function showQuestionContent(content: string) {
  questionContentViewDiv.style.fontSize = calcFontSize(content) + 'px';
  questionContentViewDiv.innerHTML = content;
  MathJax.typeset([questionContentViewDiv]);
}
