import { createElement } from "../utils.js";
import { ButtonResult, showDialog } from "../dialog.js";
import { listViewAddButton, listViewListDiv } from "../elements.js";
import { currentMode, setMode } from "../mode.js";

export let works: {[id: string]: {name: string}} = {};
export let currentWork = '';

export function init() {
  listViewListDiv.addEventListener('click', e => {
    let id = (e.target as HTMLElement).dataset.id;
    if (id == null) return;
    currentWork = id;
    setMode('work');
  })

  listViewAddButton.addEventListener('click', async () => {
    if (currentMode == 'all-work') {
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
  for (let id in works) {
    newelem.appendChild(createElement('div', {data: {id: id}}, [createElement('p', {}, [works[id].name])]));
  }
  listViewListDiv.innerHTML = newelem.innerHTML;
}
