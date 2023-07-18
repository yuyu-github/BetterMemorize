import { createElement } from "../utils.js";
import { ButtonResult, showDialog } from "../dialog.js";
import { listViewAddButton, listViewListDiv, menuEditButton } from "../elements.js";
import { currentMode, reload, setMode } from "../mode.js";

export let works: {[id: string]: {name: string}} = {};
export let currentWork = '';

export function init() {
  menuEditButton.addEventListener('click', async () => {
    if (currentMode == 'work') {
      let result = await showDialog('ワークを編集', null, 'ok-cancel', {name: {name: '名前', type: 'text', init: works[currentWork].name}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        editWork(currentWork, result.input.name);
      }
    }
  })
  
  listViewAddButton.addEventListener('click', async () => {
    if (currentMode == 'all-work') {
      let result = await showDialog('ワークを追加', null, 'ok-cancel', {name: {name: '名前', type: 'text'}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        addWork(result.input.name);
      }
    }
  });

  listViewListDiv.addEventListener('click', e => {
    if (currentMode == 'all-work') {
      let id = (e.target as HTMLElement).dataset.id;
      if (id == null) return;
      currentWork = id;
      setMode('work');
    }
  })
}

async function addWork(name: string) {
  await api.addWork({name});
  updateWorks();
}

async function editWork(id: string, name: string) {
  works[id] = {name};
  await api.editWork(id, works[id]);
  reload();
}

export async function updateWorks() {
  works = await api.getWorks();
  let newelem = createElement('div');
  for (let id in works) {
    newelem.appendChild(createElement('div', {data: {id: id}}, [createElement('p', {}, [works[id].name])]));
  }
  listViewListDiv.innerHTML = newelem.innerHTML;
}
