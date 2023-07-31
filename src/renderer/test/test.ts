import { backSpan, testAnswerViewButtonOuterDiv, testAnswerViewContentP, testQuestionViewCheckButton, testQuestionViewContentP, testResultViewAgainButton, testResultViewBackButton, testResultViewCorrectAnswerRateSpan, testViewBackButton, testViewCurrentQuestionP, titleH1 } from "../elements.js";
import { back, currentMode, setMode } from "../mode.js";
import { Question, QuestionWithId } from "../question/question.js";
import { createElement } from "../utils.js";
import { currentWork } from "../work/work.js";
import { AnswerResult, cachePriority, calcPriority, getPriorityScores, resetPriorityCache, updatePriority } from "./priority.js";

export type TestOptions = {
  method: 'auto' | 'random',
  amount: number | 'half' | 'all',
}

let workId: string = '';
let groupId: string | null = null;
let sortedQuestions: QuestionWithId[] = [];
let amount = 0;
let index = 0;
let results: AnswerResult[] = [];

export function init() {
  backSpan.addEventListener('click', () => {
    if (currentMode == 'test-question' || currentMode == 'test-answer') {
      updatePriority();
    }
  }, {capture: true})

  testViewBackButton.addEventListener('click', () => {
    if (currentMode == 'test-question') {
      index--;
      if (index == -1) back();
      else {
        results.pop();
        showAnswer();
      }
    } else if (currentMode == 'test-answer') {
      showQuestion();
    }
  })

  testQuestionViewCheckButton.addEventListener('click', () => {
    showAnswer();
  })

  testAnswerViewButtonOuterDiv.addEventListener('click', e => {
    let target = e.target as HTMLElement;
    if (target.tagName == 'BUTTON') {
      cachePriority(sortedQuestions[index].workId, sortedQuestions[index].groupId, sortedQuestions[index].id, calcPriority(Number((target as HTMLButtonElement).value)));
      results.push(Number((target as HTMLButtonElement).value))
      index++;
      if (index < amount) showQuestion();
      else {
        updatePriority();

        setMode('test-result');
        testResultViewCorrectAnswerRateSpan.innerText = (Math.floor(results.filter(i => i == AnswerResult.Correct).length / amount * 10) * 10) + '%';
      }
    }
  })

  testResultViewAgainButton.addEventListener('click', () => {
    setMode('start-test');
  })

  testResultViewBackButton.addEventListener('click', () => {
    back();
  })
}

export async function test(title: string, questions: QuestionWithId[], options: TestOptions) {
  titleH1.innerText = title;

  let sortScores: [number, number][] = [];
  if (options.method === 'random') {
    sortScores = questions.map((i, index) => [index, Math.random()]);
  } else if (options.method === 'auto') {
    sortScores = (await getPriorityScores(questions)).map((item, index) => [index, item]);
  }
  sortScores.sort((a, b) => b[1] - a[1]);
  sortedQuestions = sortScores.map(i => questions[i[0]]);
  
  if (typeof options.amount == 'number') amount = options.amount;
  else {
    if (options.amount == 'all') amount = sortedQuestions.length;
    else if (options.amount == 'half') amount = Math.ceil(sortedQuestions.length / 2);
  }
  amount = Math.min(sortedQuestions.length, amount);

  index = 0;
  results = [];
  resetPriorityCache();

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
  testViewCurrentQuestionP.innerText = `${index + 1}/${amount}`;
}

function showAnswer() {
  setMode('test-answer');
  testAnswerViewContentP.style.fontSize = calcFontSize(sortedQuestions[index].answer) + 'px';
  testAnswerViewContentP.innerText = sortedQuestions[index].answer;
  testViewCurrentQuestionP.innerText = `${index + 1}/${amount}`;
}
