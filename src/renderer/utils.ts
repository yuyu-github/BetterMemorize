export function createElement<T extends HTMLElement>(tag: string, attrs: {[key: string]: any} = {}, children: (string | HTMLElement)[] = []): T {
  let elem = document.createElement(tag);
  for (let attr in attrs) {
    if (attr == 'style') {
      for (let style in attrs.style) {
        elem.style[style] = attrs.style[style];
      }
    } else if (attr == 'data') {
      for (let data in attrs.data) {
        elem.dataset[data] = attrs.data[data];
      }
    }
    else if (attr == 'class') elem.className = attrs[attr];
    else {
      elem[attr] = attrs[attr];
    }
  }
  for (let child of children) {
    elem.append(child);
  }
  return elem as T;
}

export function toNumberOrString(str: string) {
  if (isNaN(Number(str))) return str;
  else return Number(str);
}
