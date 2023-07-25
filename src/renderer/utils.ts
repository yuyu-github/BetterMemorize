export enum Subject {
  Japanese = 0,
  Math = 10,
  Science = 20,
  SocialStudies = 30,
  English = 40,
  Music = 100,
  Art = 110,
  PE = 120,
  Health = 130,
  Technical = 140,
  HomeEconomics = 150,
}
export const subjectName: {[key in Subject]: string} = {
  0: '国語',
  10: '数学',
  20: '理科',
  30: '社会',
  40: '英語',
  100: '音楽',
  110: '美術',
  120: '体育',
  130: '保健',
  140: '技術',
  150: '家庭科',
}

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
