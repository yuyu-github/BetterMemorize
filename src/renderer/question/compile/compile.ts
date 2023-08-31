import { escapeHTML } from '../../utils.js';
import { parse } from './parser.js';

type Parsed = ({
  type: 'text',
  value: string
} | {
  type: 'command',
  name: string,
  label: string,
  args: string[],
  values: Parsed,
  raw: string
})[]

type Capture = {

}

export const defaultCapture = Symbol('default');

export function compile(questionText: string, answerText: string): {question: string, answer: string} {
  let captures = {};
  let question, answer
  try {
    let parsed = parse(questionText) as Parsed;
    question = compileParsed(parsed, captures);
  } catch {
    question = escapeHTML(questionText);
  }
  try {
    let parsed = parse(answerText) as Parsed;
    answer = compileParsed(parsed, captures);
  } catch {
    answer = escapeHTML(answerText);
  }
  return {question, answer};
}

type compileOptions = {
  command: boolean;
  escapeBackslash: boolean;
}
function compileParsed(data: Parsed, captures: {[label: string]: Capture, [defaultCapture]?: Capture}, options: Partial<compileOptions> = {}): string {
  options = {
    command: true,
    escapeBackslash: true,
    ...options
  } as compileOptions;

  let compiled = '';
  for (let i of data) {
    if (i.type == 'command' && options.command) {
      let cmd = command(i.name, i.args, i.values, captures);
      compiled += cmd.result;
      if (cmd.capture != null) {
        captures[defaultCapture] ??= cmd.capture;
        if (i.label != '') captures[i.label] = cmd.capture;
      }
    }
    else {
      let value = i.type == 'text' ? i.value : i.raw;
      value = escapeHTML(value);
      if (options.escapeBackslash) value = value.replaceAll('\\', '\\\\');
      compiled += value;
    }
  }
  return compiled;
}

function command(name: string, args: string[], content: Parsed, captures: {[label: string]: Capture}): {result: string, capture?: Capture} {
  switch (name) {
    case '$':
    case 'math': {
      return {result: '\\(' + compileParsed(content, {escapeBackslash: false, command: false}) + '\\)'};
    }
    case 'ce': {
      return {result: '\\(\\ce{' + compileParsed(content, {command: false}) + '}\\)'};
    }
    case 'fitb': {
      let value = compileParsed(content, captures);
      let blanks = Array.from(new Set(value.match(/(?<=\()[^)]+(?=\))/g)?.filter(i => !i.match(/^\s*$/))));
      let count = Math.floor(getArgValue(args[0], 'ratio', {amount: blanks.length}) ?? blanks.length);
      let notBlanks = Array.of(count);
      for (let i = 0; i < count; i++) {
        notBlanks.splice(Math.floor(Math.random() * notBlanks.length), 1);
      }
      return {
        result: value.replace(/\(([^)]+)\)/g, (m, g) => g.match(/^\s*$/) ? m : notBlanks.includes(g) ? g : '(' + '\u00a0'.repeat(10) + ')'),
        capture: value.replace(/\(([^)]+)\)/g, (m, g) => g.match(/^\s*$/) || notBlanks.includes(g) ? m : g)
      }
    }
    default: return {result: ''};
  }
}

function getArgValue(raw: string | null, type: 'ratio', extra) {
  if (raw == null) return;
  switch (type) {
    case 'ratio': {
      let value: number;
      if (raw.endsWith('%')) value = extra.amount * Math.min(1, Number(raw.slice(0, -1)) / 100);
      else value = Math.min(extra.amount, Number(raw))
      return Number.isNaN(value) ? null : value;
    }
  }
}
