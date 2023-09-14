import { mainElem, questionContentViewDiv } from "../elements.js";
import { createElement } from "../utils.js";

function calcFontSize(content: string) {
  let elem = createElement('div', {style: {position: 'fixed', visibility: 'hidden', whiteSpace: 'pre'}});
  elem.innerHTML = content;
  document.body.appendChild(elem);
  MathJax.typeset([elem]);
  let widthSize = mainElem.clientWidth / elem.clientWidth * 0.84 * 16;
  let heightSize = mainElem.clientHeight / elem.clientHeight * 0.84 * 16;
  elem.remove();
  console.log(widthSize);
  let fontSize = content.includes('\n') ? Math.min(widthSize, heightSize) : Math.max(widthSize, Math.min(widthSize * 2, 45));
  return Math.max(30, Math.min(fontSize, 70));
}

export function showQuestionContent(content: string) {
  questionContentViewDiv.style.fontSize = calcFontSize(content) + 'px';
  questionContentViewDiv.innerHTML = content;
  MathJax.typeset([questionContentViewDiv]);
}
