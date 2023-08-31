import { questionContentViewDiv } from "../elements.js";

function calcFontSize(str: string) {
  let ctx = document.createElement('canvas').getContext('2d')!;
  let width = ctx.measureText(str).width;
  let size = 64 - width / 15;
  return Math.max(36, Math.ceil(size / 4) * 4);
}

export function showQuestionContent(content: string) {
  questionContentViewDiv.style.fontSize = calcFontSize(content) + 'px';
  questionContentViewDiv.innerHTML = content;
  MathJax.typeset();
}
