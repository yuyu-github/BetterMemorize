import { createElement } from "../utils.js";
import { ButtonResult, showDialog } from "../dialog.js";
import { listViewAddButton, listViewListDiv, menuDeleteButton, menuEditButton } from "../elements.js";
import { back, currentMode, reload, setMode } from "../mode.js";

export type Work = {
  name: string,
}
export type WorkWithLastAccessTime = Work & {
  lastAccessTime: number
}

export let works: {[id: string]: Work} = {};
export let currentWork = '';

export function init() {
  menuEditButton.addEventListener('click', async () => {
    if (currentMode == 'work') {
      let result = await showDialog('ワークを編集', null, 'ok-cancel', {name: {name: '名前', type: 'text', init: works[currentWork].name}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        editWork(currentWork, result.input.name);
        reload();
      }
    }
  })

  menuDeleteButton.addEventListener('click', async () => {
    if (currentMode == 'work') {
      let result = await showDialog('ワークを削除', '本当に削除しますか？', 'yes-no-danger');
      if (result.button == ButtonResult.Yes) {
        deleteWork(currentWork);
        back();
      }
    }
  })
  
  listViewAddButton.addEventListener('click', async () => {
    if (currentMode == 'all-work') {
      let result = await showDialog('ワークを追加', null, 'ok-cancel', {name: {name: '名前', type: 'text'}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        addWork(result.input.name);
        updateWorks();
      }
    }
  });

  listViewListDiv.addEventListener('click', e => {
    if (currentMode == 'all-work') {
      let id = (e.target as HTMLElement).dataset.id;
      if (id == null) return;
      currentWork = id;
      setMode('work');
      e.stopImmediatePropagation();
    }
  })
}

async function addWork(name: string) {
  await api.addWork({name});
}

async function editWork(id: string, name: string) {
  works[id] = {name};
  await api.editWork(id, works[id]);
}

async function deleteWork(id: string) {
  delete works[id];
  await api.deleteWork(id);
}

export function cacheWorks(data: {[key: string]: Work}) {
  Object.assign(works, data);
}


export async function updateWorks() {
  let works = await api.getWorks();
  cacheWorks(works);
  let newelem = createElement('div');
  for (let [id, work] of Object.entries(works).sort((a, b) => b[1].lastAccessTime - a[1].lastAccessTime)) {
    newelem.appendChild(createElement('div', {data: {id: id}}, [
      createElement('p', {}, [work.name]),
      createElement('button', {class: 'start color-green'}, ['スタート'])
    ]));
  }
  listViewListDiv.innerHTML = newelem.innerHTML;
}
