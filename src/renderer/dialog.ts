import { dialogDisplayDiv, dialogDiv } from "./elements.js";

type InputType = 'text' | 'subject';
type ButtonType = 'ok-cancel'
type InputListType = {
  [id: string]: {
    name: string,
    type: InputType
  }
}

export enum ButtonResult {
  Cancel = 0,
  Ok = 1,
}

export function showDialog<T extends InputListType>(title: string, message: string | null, buttonList: ButtonType, inputList?: T): Promise<{button: ButtonResult, input: {[key in keyof T]: string}}> {
  let titleElem = document.createElement('h1');
  titleElem.innerText = title;
  dialogDiv.appendChild(titleElem);
  if (message != null) {
    let messageElem = document.createElement('p');
    messageElem.innerText = message;
    messageElem.classList.add('message')
    dialogDiv.appendChild(messageElem);
  }

  let inputElems: HTMLElement[] = [];
  for (let [id, {name, type}] of Object.entries(inputList ?? {})) {
    let nameElem = document.createElement('p');
    nameElem.innerText = name;
    dialogDiv.appendChild(nameElem);

    let inputElem: HTMLElement | null = null;
    switch (type) {
      case 'text': {
        let elem = document.createElement('input');
        elem.type = 'text';
        inputElem = elem;
      }
      break;
    }
    if (inputElem != null) {
      inputElem.dataset.id = id;
      dialogDiv.appendChild(inputElem);
      inputElems.push(inputElem);
    }
  }

  let buttonsOuterElem = document.createElement('div');
  buttonsOuterElem.classList.add('buttons');
  let buttons: [string, number][] = [];
  let buttonElems: HTMLButtonElement[] = [];
  switch (buttonList) {
    case 'ok-cancel': 
      buttons = [['OK', ButtonResult.Ok], ['キャンセル', ButtonResult.Cancel]]
      break;
  }
  for (let button of buttons) {
    let elem = document.createElement('button');
    elem.innerText = button[0],
    elem.dataset.value = button[1].toString();
    buttonsOuterElem.appendChild(elem);
    buttonElems.push(elem);
  }
  dialogDiv.appendChild(buttonsOuterElem);

  dialogDisplayDiv.style.display = 'block';
  if (inputElems.length > 0) inputElems[0].focus();

  return new Promise(resolve => {
    function returnResult(button: HTMLButtonElement) {
      let buttonResult = parseInt(button.dataset.value ?? '0');
      let inputResult = {};
      dialogDiv.querySelectorAll('input').forEach(e => {
        if (e.dataset.id != null) {
          switch (e.tagName) {
            case 'INPUT':
              inputResult[e.dataset.id] = e.value;
              break;
          }
        }
      })
      resolve({button: buttonResult, input: inputResult as {[key in keyof T]: string}});

      dialogDiv.innerHTML = '';
      dialogDisplayDiv.style.display = 'none';
      dialogDiv.removeEventListener('keydown', onKeydown);
    }

    for (let button of buttonsOuterElem.children) {
      button.addEventListener('click', e => returnResult(e.currentTarget as HTMLButtonElement));
    }

    function onKeydown(e: KeyboardEvent) {
      if (e.key == 'Enter') {
        let index = inputElems.indexOf(document.activeElement as HTMLElement)
        if (index == -1 || index == inputElems.length - 1) {
          let defaultButton = buttons.reduce((p, c, i) => p.max < c[1] ? {index: i, max: c[1]} : p, {index: 0, max: -1}).index;
          returnResult(buttonElems[defaultButton]);
        } else {
          inputElems[index + 1].focus();
        }
      } else if (e.key == 'Tab') {
        e.preventDefault();

        let index = inputElems.indexOf(document.activeElement as HTMLElement)
        if (index == -1) index = inputElems.length + buttonElems.indexOf(document.activeElement as HTMLButtonElement);
        if (index == -1) index = 0;

        let focusable = [...inputElems, ...buttonElems];
        if (focusable.length > 0) {
          if (index == focusable.length - 1) index = -1;
          focusable[index + 1].focus();
        }
      } else if (e.key == 'Escape') {
        let defaultButton = buttons.reduce((p, c, i) => p.min >= c[1] || p.min == -1 ? {index: i, min: c[1]} : p, {index: 0, min: -1}).index;
        returnResult(buttonElems[defaultButton]);
      }
    }
    dialogDiv.addEventListener('keydown', onKeydown);
  })
}
