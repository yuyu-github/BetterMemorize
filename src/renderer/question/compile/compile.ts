import { escapeHTML } from '../../utils.js';
import { parse } from './parser.js';

type Parsed = ({
  type: 'text',
  value: string
} | {
  type: 'command',
  name: string,
  value: Parsed
})[]

export function compile(text: string): string {
  let parsed = parse(text) as Parsed;
  return compileParsed(parsed)
}

type compileOptions = {
  escapeBackslash: boolean;
}
function compileParsed(data: Parsed, options: Partial<compileOptions> = {}): string {
  options = {
    escapeBackslash: true,
    ...options
  } as compileOptions;

  let str = '';
  for (let i of data) {
    if (i.type == 'text') {
      let value = i.value;
      if (options.escapeBackslash) value = value.replaceAll('\\', '\\\\');
      str += value;
    }
    else if (i.type == 'command') str += command(i.name, i.value);
  }
  return str;
}

function command(name: string, value: Parsed): string {
  switch (name) {
    case '$':
    case 'math': {
      return '\\(' + compileParsed(value, {escapeBackslash: false}) + '\\)';
    }
    default: return '';
  }
}
