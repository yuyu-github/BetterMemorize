import { backSpan, testAnswerViewButtonOuterDiv, testAnswerViewContentP, testQuestionViewCheckButton, testQuestionViewContentP, testResultViewAgainButton, testResultViewBackButton, testResultViewCorrectAnswerRateSpan, testViewBackButton, testViewCurrentQuestionP, titleH1 } from "../elements.js";
import { back, currentMode, setMode } from "../mode.js";
import { Question, QuestionWithId } from "../question/question.js";
import { WithLastAccessTime, createElement } from "../utils.js";
import { currentWork } from "../work/work.js";
import { AnswerResult, cachePriority, calcPriority, getPriorityScores, resetPriorityCache, updatePriority } from "./priority.js";

export type TestOptions = {
  mode: 'auto' | 'random' | 'new' | 'repeat',
  amount: number | 'half' | 'all',
}

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

        setMode('test-result', true, 2);
        testResultViewCorrectAnswerRateSpan.innerText = (Math.floor(results.filter(i => i == AnswerResult.Correct).length / amount * 10) * 10) + '%';
      }
    }
  })

  testResultViewAgainButton.addEventListener('click', () => {
    setMode('start-test', true, currentMode == 'test-result' ? 1 : 0);
  })

  testResultViewBackButton.addEventListener('click', () => {
    back();
  })
}

export async function test(workId: string, groupId: string | null, title: string, questions: WithLastAccessTime<QuestionWithId>[], options: TestOptions) {
  titleH1.innerText = title;

  let sortScores: [number, number][] = [];
  if (options.mode === 'random') {
    sortScores = questions.map((i, index) => [index, Math.random()]);
  } else if (options.mode === 'auto') {
    sortScores = (await getPriorityScores(questions)).map((item, index) => [index, item]);
  } else if (options.mode === 'new') {
    sortScores = questions.map((i, index) => [index, i.lastAccessTime]);
  } else if (options.mode === 'repeat') {
    let last = await api.getLastTestQuestions(workId, groupId);
    sortScores = questions.map((i, index) => [index, last.includes(i.id) ? 1 + Math.random() : Math.random()]);
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
  api.setLastTestQuestions(workId, groupId, sortedQuestions.slice(0, amount).map(i => i.id))
}

function calcFontSize(str: string) {
  let ctx = document.createElement('canvas').getContext('2d')!;
  let width = ctx.measureText(str).width;
  let size = 64 - width / 15;
  return Math.max(36, Math.ceil(size / 4) * 4);
}

function showQuestion() {
  setMode('test-question', true, currentMode == 'test-answer' ? 1 : 0);
  testQuestionViewContentP.style.fontSize = calcFontSize(sortedQuestions[index].question) + 'px';
  testQuestionViewContentP.innerText = sortedQuestions[index].question;
  testViewCurrentQuestionP.innerText = `${index + 1}/${amount}`;
}

function showAnswer() {
  setMode('test-answer', true, currentMode == 'test-question' ? 1 : 0);
  testAnswerViewContentP.style.fontSize = calcFontSize(sortedQuestions[index].answer) + 'px';
  testAnswerViewContentP.innerText = sortedQuestions[index].answer;
  testViewCurrentQuestionP.innerText = `${index + 1}/${amount}`;
}
