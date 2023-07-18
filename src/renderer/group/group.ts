import { ButtonResult, showDialog } from "../dialog.js";
import { listViewAddButton, listViewListDiv } from "../elements.js";
import { currentMode, setMode } from "../mode.js";
import { Subject, createElement } from "../utils.js";
import { currentWork } from "../work/work.js";

export let groups: {[id: string]: {name: string}} = {};
export let currentGroup = '';

export function init() {
  listViewListDiv.addEventListener('click', e => {
    if (currentMode == 'work') {
      let id = (e.target as HTMLElement).dataset.id;
      if (id == null) return;
      currentGroup = id;
      setMode('group');
      e.stopImmediatePropagation();
    }
  })

  listViewAddButton.addEventListener('click', async () => {
    if (currentMode == 'work') {
      let result = await showDialog('グループを追加', null, 'ok-cancel', {name: {name: '名前', type: 'text'}, subject: {name: '教科', type: 'subject'}});
      if (result.button == ButtonResult.Ok && result.input.name != '' && result.input.subject != '') {
        addGroup(result.input.name, result.input.subject);
      }
    }
  });
}

async function addGroup(name: string, subject: Subject) {
  await api.addGroup(currentWork, {name, subject});
  updateGroups();
}

export async function updateGroups() {
  groups = await api.getGroups(currentWork);
  let newelem = createElement('div');
  for (let id in groups) {
    newelem.appendChild(createElement('div', {data: {id: id}}, [createElement('p', {}, [groups[id].name])]));
  }
  listViewListDiv.innerHTML = newelem.innerHTML;
}
