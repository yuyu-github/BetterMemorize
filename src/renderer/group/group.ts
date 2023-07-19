import { ButtonResult, showDialog } from "../dialog.js";
import { listViewAddButton, listViewListDiv, menuDeleteButton, menuEditButton } from "../elements.js";
import { back, currentMode, reload, setMode } from "../mode.js";
import { Subject, createElement } from "../utils.js";
import { currentWork } from "../work/work.js";

export let groups: {[id: string]: {name: string, subject: Subject}} = {};
export let currentGroup = '';

export function init() {
  menuEditButton.addEventListener('click', async () => {
    if (currentMode == 'group') {
      let result = await showDialog('ワークを編集', null, 'ok-cancel', {name: {name: '名前', type: 'text', init: groups[currentGroup].name}, subject: {name: '教科', type: 'subject', init: groups[currentGroup].subject}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        editGroup(currentWork, currentGroup, result.input.name, result.input.subject);
      }
    }
  })

  menuDeleteButton.addEventListener('click', async () => {
    if (currentMode == 'group') {
      let result = await showDialog('ワークを削除', '本当に削除しますか？', 'yes-no-danger');
      if (result.button == ButtonResult.Yes) {
        deleteGroup(currentWork, currentGroup);
      }
    }
  })

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
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        addGroup(result.input.name, result.input.subject);
      }
    }
  });
}

async function addGroup(name: string, subject: Subject) {
  await api.addGroup(currentWork, {name, subject});
  updateGroups();
}

async function editGroup(workId: string, id: string, name: string, subject: Subject) {
  groups[id] = {name, subject};
  await api.editGroup(workId, id, groups[id]);
  reload();
}

async function deleteGroup(workId: string, id: string) {
  delete groups[id];
  await api.deleteGroup(workId, id);
  back();
}

export async function updateGroups() {
  groups = await api.getGroups(currentWork);
  let newelem = createElement('div');
  for (let id in groups) {
    newelem.appendChild(createElement('div', {data: {id: id}}, [createElement('p', {}, [groups[id].name])]));
  }
  listViewListDiv.innerHTML = newelem.innerHTML;
}
