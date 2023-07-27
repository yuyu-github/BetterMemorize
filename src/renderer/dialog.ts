import { dialogDiv, dialogViewDiv } from "./elements.js";
import { createElement } from "./utils.js";

type InputType = 'text' | 'select';
type ButtonType = 'ok-cancel' | 'yes-no' | 'yes-no-danger';
type InputListType = {
  [id: string]: {
    name: string,
    type: InputType,
    init?: any,
    choices?: [string, string][]
  }
}

export enum ButtonResult {
  Cancel = 0,
  No = 1,
  Ok = 10,
  Yes = 11,
}

export function showDialog<T extends InputListType>(title: string, message: string | null, buttonList: ButtonType, inputList?: T): Promise<{button: ButtonResult, input: {[key in keyof T]: any}}> {
  let titleElem = document.createElement('h1');
  titleElem.innerText = title;
  dialogViewDiv.appendChild(titleElem);
  if (message != null) {
    let messageElem = document.createElement('p');
    messageElem.innerText = message;
    messageElem.classList.add('message')
    dialogViewDiv.appendChild(messageElem);
  }

  let inputElems: HTMLElement[] = [];
  for (let [id, {name, type, init, choices}] of Object.entries(inputList ?? {})) {
    let nameElem = document.createElement('p');
    nameElem.innerText = name;
    dialogViewDiv.appendChild(nameElem);

    let inputElem: HTMLElement | null = null;
    switch (type) {
      case 'text': {
        inputElem = createElement('input', {type: 'text'});
      }
      break;
      case 'select': {
        inputElem = createElement('select', {}, (choices ?? []).map(i => createElement('option', {value: i[0]}, [i[1]])));
      }
    }
    if (inputElem != null) {
      if (init != null) {
        switch (type) {
          default:
            (inputElem as HTMLInputElement).value = init;
            break;
        }
      }

      inputElem.classList.add('input');
      inputElem.dataset.id = id;
      dialogViewDiv.appendChild(inputElem);
      inputElems.push(inputElem);
    }
  }

  let buttonsOuterElem = document.createElement('div');
  buttonsOuterElem.classList.add('button-outer');
  let buttons: [string, number, string?][]= [];
  let buttonElems: HTMLButtonElement[] = [];
  switch (buttonList) {
    case 'ok-cancel': buttons = [['OK', ButtonResult.Ok, 'blue'], ['キャンセル', ButtonResult.Cancel]]; break;
    case 'yes-no': buttons = [['はい', ButtonResult.Yes, 'blue'], ['いいえ', ButtonResult.No]]; break;
    case 'yes-no-danger': buttons = [['はい', ButtonResult.Yes, 'red'], ['いいえ', ButtonResult.No]]; break;
  }
  for (let button of buttons) {
    let elem = document.createElement('button');
    elem.innerText = button[0],
    elem.dataset.value = button[1].toString();
    if (button[2] != null) {
      elem.classList.add('color-' + button[2]);
    }
    buttonsOuterElem.appendChild(elem);
    buttonElems.push(elem);
  }
  dialogViewDiv.appendChild(buttonsOuterElem);

  dialogDiv.style.display = 'block';
  if (inputElems.length > 0) inputElems[0].focus();

  return new Promise(resolve => {
    function returnResult(button: HTMLButtonElement) {
      let buttonResult = parseInt(button.dataset.value ?? '0');
      let inputResult = {};
      dialogViewDiv.querySelectorAll<HTMLInputElement | HTMLSelectElement>('.input').forEach(e => {
        if (e.dataset.id != null) {
          switch (e.tagName) {
            case 'INPUT':
            case 'SELECT':
              inputResult[e.dataset.id] = e.value;
              break;
          }
        }
      })
      resolve({button: buttonResult, input: inputResult as {[key in keyof T]: string}});

      dialogViewDiv.innerHTML = '';
      dialogDiv.style.display = 'none';
      dialogViewDiv.removeEventListener('keydown', onKeydown);
    }

    for (let button of buttonsOuterElem.children) {
      button.addEventListener('click', e => returnResult(e.currentTarget as HTMLButtonElement));
    }

    function onKeydown(e: KeyboardEvent) {
      if (e.code == 'Enter') {
        let index = inputElems.indexOf(document.activeElement as HTMLElement)
        if (index == -1 || index == inputElems.length - 1) {
          let defaultButton = buttons.reduce((p, c, i) => p.max < c[1] ? {index: i, max: c[1]} : p, {index: 0, max: -1}).index;
          returnResult(buttonElems[defaultButton]);
        } else {
          inputElems[index + 1].focus();
        }
      } else if (e.code == 'Tab') {
        e.preventDefault();

        let index = inputElems.indexOf(document.activeElement as HTMLElement)
        if (index == -1) index = inputElems.length + buttonElems.indexOf(document.activeElement as HTMLButtonElement);
        if (index == -1) index = 0;

        let focusable = [...inputElems, ...buttonElems];
        if (focusable.length > 0) {
          if (index == focusable.length - 1) index = -1;
          focusable[index + 1].focus();
        }
      } else if (e.code == 'Escape') {
        let defaultButton = buttons.reduce((p, c, i) => p.min >= c[1] || p.min == -1 ? {index: i, min: c[1]} : p, {index: 0, min: -1}).index;
        returnResult(buttonElems[defaultButton]);
      }
    }
    dialogViewDiv.addEventListener('keydown', onKeydown);
  })
}
