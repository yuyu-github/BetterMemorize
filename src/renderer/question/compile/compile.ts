import { escapeHTML } from '../../utils.js';
import { parse } from './parser.js';

type Parsed = ({
  type: 'text',
  values: string
} | {
  type: 'command',
  name: string,
  values: Parsed
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
      let value = i.values;
      if (options.escapeBackslash) value = value.replaceAll('\\', '\\\\');
      str += value;
    }
    else if (i.type == 'command') str += command(i.name, i.values);
  }
  return str;
}

function command(name: string, content: Parsed): string {
  switch (name) {
    case '$':
    case 'math': {
      return '\\(' + compileParsed(content, {escapeBackslash: false}) + '\\)';
    }
    case 'ce': {
      return '\\(\\ce{' + compileParsed(content) + '}\\)';
    }
    default: return '';
  }
}
