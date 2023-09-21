import { escapeHTML } from "../../utils.js";
import { Capture, CommandResult, Parsed, compile, compileParsed, defaultCapture } from "./compile.js";

export default (args: string[], content: Parsed, captures: {[label: string]: Capture}): {[type: string]: string | CommandResult | (() => CommandResult)} => ({
  $: 'math',
  'l': 'link',
  'b': 'bold',
  'i': 'italic',
  's': 'strike',
  'u': 'underline',
  'math': () => {
    let value = compileParsed(content, captures, {escapeBackslash: false, command: false});
    if (args[0] != null) return {result: `\\(\\begin{${args[0]}}${value}\\end{${args[0]}}\\)`}
    return {result: `\\(${value}\\)`};
  },
  'ce': {result: '\\(\\ce{' + compileParsed(content, captures, {command: false}) + '}\\)'},
  'fitb': () => {
    let value = compileParsed(content, captures);
    let blanks = Array.from(new Set(value.match(/(?<=\()[^)]+(?=\))/g)?.filter(i => !i.match(/^\s*$/))));
    let count = Math.floor(getArgValue(args[0], 'ratio', {amount: blanks.length}) ?? blanks.length);
    let notBlanks = blanks.concat();
    for (let i = 0; i < count; i++) {
      notBlanks.splice(Math.floor(Math.random() * notBlanks.length), 1);
    }
    return {
      result: value.replace(/\(([^)]+)\)/g, (m, g) => g.match(/^\s*$/) ? m : notBlanks.includes(g) ? g : '(' + '\u00a0'.repeat(10) + ')'),
      capture: {
        answer: value.replace(/\(([^)]+)\)/g, (m, g) => g.match(/^\s*$/) || !notBlanks.includes(g) ? m : g)
      }
    }
  },
  'answer': {result: getArgValue(args[0], 'capture', {captures: captures})?.answer ?? ''},
  'link': {result: `<a href="${getArgValue(args[0], 'string')}">${compileParsed(content, captures)}</a>`},
  'bold': {result: `<strong>${compileParsed(content, captures)}</strong>`},
  'italic': {result: `<em>${compileParsed(content, captures)}</em>`},
  'strike': {result: `<del>${compileParsed(content, captures)}</del>`},
  'underline': {result: `<u>${compileParsed(content, captures)}</u>`},
})

function getArgValue(raw: string | null, type: 'ratio', extra: {amount: number}): number | null;
function getArgValue(raw: string | null, type: 'capture', extra: {captures: {[label: string]: Capture, [defaultCapture]?: Capture}}): Capture | null;
function getArgValue(raw: string | null, type: 'string', extra?: {}): Capture | null;
function getArgValue(raw: string | null, type: 'ratio' | 'capture' | 'string', extra?) {
  switch (type) {
    case 'ratio': {
      if (raw == null) return null;
      let value: number;
      if (raw.endsWith('%')) value = extra.amount * Math.min(1, Number(raw.slice(0, -1)) / 100);
      else value = Math.min(extra.amount, Number(raw))
      return Number.isNaN(value) ? null : value;
    }
    case 'capture': {
      if (raw == null) return extra.captures[defaultCapture] ?? null;
      return extra.captures[raw] ?? null;
    }
    case 'string': {
      return escapeHTML(raw ?? '');
    }
  }
}
