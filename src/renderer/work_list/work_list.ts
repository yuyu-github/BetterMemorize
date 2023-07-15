import { createElement } from "../utils.js";
import { ButtonResult, showDialog } from "../dialog.js";
import { addButton, listDiv } from "../elements.js";
import { currentMode } from "../mode.js";

export let works: {
  id: string;
  name: string;
}[] = []

export function init() {
  addButton.addEventListener('click', async () => {
    if (currentMode == 'work-list') {
      let result = await showDialog('ワークを追加', null, 'ok-cancel', {name: {name: '名前', type: 'text'}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        addWork(result.input.name);
      }
    }
  });
}

async function addWork(name: string) {
  await api.addWork(name);
  updateWorks();
}

export async function updateWorks() {
  works = await api.getWorks();
  let newelem = createElement('div');
  for (let work of works) {
    newelem.appendChild(createElement('div', {data: {id: work.id}}, [createElement('p', {}, [work.name])]));
  }
  listDiv.innerHTML = newelem.innerHTML;
}
