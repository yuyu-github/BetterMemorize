import { testAnswerViewButtonOuterDiv, testAnswerViewContentP, testQuestionViewCheckButton, testQuestionViewContentP, titleH1 } from "../elements.js";
import { setMode } from "../mode.js";
import { Question } from "../question/question.js";
import { createElement } from "../utils.js";

export type TestOptions = {
  method: 'auto' | 'random',
  amount: number | 'half' | 'all',
}

let sortedQuestions: Question[] = [];
let amount = 0;
let index = 0;

export function init() {
  testQuestionViewCheckButton.addEventListener('click', () => {
    showAnswer();
  })

  testAnswerViewButtonOuterDiv.addEventListener('click', e => {
    let target = e.target as HTMLElement;
    if (target.tagName == 'BUTTON') {
      index++;
      if (index < amount) showQuestion();
    }
  })
}

export async function test(title: string, questions: Question[], options: TestOptions) {
  titleH1.innerText = title;

  let sortScores: [number, number][] = [];
  if (options.method === 'random') {
    sortScores = questions.map((i, index) => [index, Math.random()]);
  }
  sortScores.sort((a, b) => a[1] - b[1]);
  sortedQuestions = sortScores.map(i => questions[i[0]]);
  
  if (typeof options.amount == 'number') amount = options.amount;
  else {
    if (options.amount == 'all') amount = sortedQuestions.length;
    else if (options.amount == 'half') amount = Math.ceil(sortedQuestions.length / 2);
  }
  amount = Math.min(sortedQuestions.length, amount);

  index = 0;
  showQuestion();
}

function calcFontSize(str: string) {
  let ctx = document.createElement('canvas').getContext('2d')!;
  let width = ctx.measureText(str).width;
  let size = 64 - width / 15;
  return Math.max(36, Math.ceil(size / 4) * 4);
}

function showQuestion() {
  setMode('test-question');
  testQuestionViewContentP.style.fontSize = calcFontSize(sortedQuestions[index].question) + 'px';
  testQuestionViewContentP.innerText = sortedQuestions[index].question;
}

function showAnswer() {
  setMode('test-answer');
  testAnswerViewContentP.style.fontSize = calcFontSize(sortedQuestions[index].answer) + 'px';
  testAnswerViewContentP.innerText = sortedQuestions[index].answer;
}
