import { escapeHTML } from '../../utils.js';
import { parse } from './parser.js';

type Parsed = ({
  type: 'text',
  value: string
} | {
  type: 'command',
  name: string,
  args: string[],
  values: Parsed,
  raw: string
})[]

export function compile(text: string): string {
  try {
    let parsed = parse(text) as Parsed;
    return compileParsed(parsed)
  } catch {
    return escapeHTML(text);
  }
}

type compileOptions = {
  command: boolean;
  escapeBackslash: boolean;
}
function compileParsed(data: Parsed, options: Partial<compileOptions> = {}): string {
  options = {
    command: true,
    escapeBackslash: true,
    ...options
  } as compileOptions;

  let str = '';
  for (let i of data) {
    if (i.type == 'command' && options.command) str += command(i.name, i.args, i.values);
    else {
      let value = i.type == 'text' ? i.value : i.raw;
      value = escapeHTML(value);
      if (options.escapeBackslash) value = value.replaceAll('\\', '\\\\');
      str += value;
    }
  }
  return str;
}

function command(name: string, args: string[], content: Parsed): string {
  switch (name) {
    case '$':
    case 'math': {
      return '\\(' + compileParsed(content, {escapeBackslash: false, command: false}) + '\\)';
    }
    case 'ce': {
      return '\\(\\ce{' + compileParsed(content, {command: false}) + '}\\)';
    }
    case 'fitb': {
      let value = compileParsed(content);
      let blanks = Array.from(new Set(value.match(/(?<=\()[^)]+(?=\))/g)?.filter(i => !i.match(/^\s*$/))));
      let count = Math.floor(getArgValue(args[0], 'ratio', {amount: blanks.length}) ?? blanks.length);
      let notBlanks = Array.of(count);
      for (let i = 0; i < count; i++) {
        notBlanks.splice(Math.floor(Math.random() * notBlanks.length), 1);
      }
      return value.replace(/\(([^)]+)\)/g, (m, g) => g.match(/^\s*$/) ? m : notBlanks.includes(g) ? g : '(' + '\u00a0'.repeat(10) + ')')
    }
    default: return '';
  }
}

function getArgValue(raw: string | null, type: 'ratio', extra) {
  if (raw == null) return;
  switch (type) {
    case 'ratio': {
      let value;
      if (raw.endsWith('%')) value = extra.amount * Math.min(1, Number(raw.slice(0, -1)) / 100);
      else value = Math.min(extra.amount, Number(raw))
      return Number.isNaN(value) ? null : value;
    }
  }
}
