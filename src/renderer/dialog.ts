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
    }
  }

  let buttonsElem = document.createElement('div');
  buttonsElem.classList.add('buttons');
  let buttons: [string, number][] = [];
  switch (buttonList) {
    case 'ok-cancel': 
      buttons = [['OK', ButtonResult.Ok], ['キャンセル', ButtonResult.Cancel]]
      break;
  }
  for (let button of buttons) {
    let elem = document.createElement('button');
    elem.innerText = button[0],
    elem.dataset.value = button[1].toString();
    buttonsElem.appendChild(elem);
  }
  dialogDiv.appendChild(buttonsElem);

  dialogDisplayDiv.style.display = 'block';

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
    }

    for (let button of buttonsElem.children) {
      button.addEventListener('click', e => returnResult(e.currentTarget as HTMLButtonElement));
    }
  })
}
