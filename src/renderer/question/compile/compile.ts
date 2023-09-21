import { escapeHTML } from '../../utils.js';
import { parse } from './parser.js';
import commandProcess from './command.js';

export type Parsed = ({
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

export type CommandResult = {result: string, capture?: Capture};
export type Capture = {
  answer?: string
}

export const defaultCapture = Symbol('default');

export function compile(questionText: string, answerText: string): {question: string, answer: string} {
  let captures = {};
  let question, answer;
  try {
    let parsed = parse(questionText) as Parsed;
    question = compileParsed(parsed, captures);
  } catch {
    question = escapeHTML(questionText);
  }
  try {
    let parsed = parse(answerText != '' ? answerText : '/answer') as Parsed;
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
export function compileParsed(data: Parsed, captures: {[label: string]: Capture, [defaultCapture]?: Capture}, options: Partial<compileOptions> = {}): string {
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

function command(name: string, args: string[], content: Parsed, captures: {[label: string]: Capture}): CommandResult {
  let commandList = commandProcess(args, content, captures);
  if (name in commandList) {
    let value = commandList[name];
    if (typeof value == 'string') value = commandList[value];
    if (typeof value == 'function') return value();
    if (typeof value == 'object') return value;
  }
  return {result: ''};
}
