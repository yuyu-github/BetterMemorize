import { ButtonResult, showDialog } from "../dialog.js";
import { listViewAddButton, listViewGroupAddButton, listViewListDiv, menuDeleteButton, menuEditButton } from "../elements.js";
import { back, currentMode, reload, setMode } from "../mode.js";
import { updateGroupChildren } from "../question/question.js";
import { Subject, createElement } from "../utils.js";
import { currentWork } from "../work/work.js";

export type Group = {
  name: string,
  subject: Subject
}

export let groups: {[id: string]: Group} = {};
export let currentGroup = '';
export let groupPath: string[] = [];

export function init() {
  menuEditButton.addEventListener('click', async () => {
    if (currentMode == 'group') {
      let result = await showDialog('グループを編集', null, 'ok-cancel', {name: {name: '名前', type: 'text', init: groups[currentGroup].name}, subject: {name: '教科', type: 'subject', init: groups[currentGroup].subject}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        editGroup(currentWork, currentGroup, result.input.name, result.input.subject);
        reload();
      }
    }
  })

  menuDeleteButton.addEventListener('click', async () => {
    if (currentMode == 'group') {
      let result = await showDialog('グループを削除', '本当に削除しますか？', 'yes-no-danger');
      if (result.button == ButtonResult.Yes) {
        deleteGroup(currentWork, groupPath.at(-1) ?? null, currentGroup);
        back();
      }
    }
  })

  listViewListDiv.addEventListener('click', e => {
    if (currentMode == 'work' || currentMode == 'group') {
      let target = e.target as HTMLElement;
      if (currentMode == 'group' && target.dataset.type != 'group') return;
      let id = target.dataset.id;
      if (id == null) return;
      if (currentGroup != '') groupPath.push(currentGroup);
      currentGroup = id;
      setMode('group');
      e.stopImmediatePropagation();
    }
  })

  listViewAddButton.addEventListener('click', async () => {
    if (currentMode == 'work') {
      let result = await showDialog('グループを追加', null, 'ok-cancel', {name: {name: '名前', type: 'text'}, subject: {name: '教科', type: 'subject'}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        addGroup(null, result.input.name, result.input.subject);
        updateGroups();
      }
    }
  });

  listViewGroupAddButton.addEventListener('click', async () => {
    if (currentMode == 'group') {
      let result = await showDialog('グループを追加', null, 'ok-cancel', {name: {name: '名前', type: 'text'}, subject: {name: '教科', type: 'subject'}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        addGroup(currentGroup, result.input.name, result.input.subject);
        updateGroupChildren();
      }
    }
  })
}

export function backGroup() {
  currentGroup = groupPath.at(-1) ?? '';
  groupPath.pop();
}

async function addGroup(groupId: string | null, name: string, subject: Subject) {
  await api.addGroup(currentWork, groupId, {name, subject});
}

async function editGroup(workId: string, id: string, name: string, subject: Subject) {
  groups[id] = {name, subject};
  await api.editGroup(workId, id, groups[id]);
}

async function deleteGroup(workId: string, groupId: string | null, id: string) {
  delete groups[id];
  await api.deleteGroup(workId, groupId, id);
}

export function cacheGroups(data: {[key: string]: Group}) {
  groups = {...groups, ...data};
}

export async function updateGroups() {
  let groups = await api.getGroups(currentWork);
  cacheGroups(groups);

  let newelem = createElement('div');
  for (let id in groups) {
    newelem.appendChild(createElement('div', {data: {id: id}}, [
      createElement('p', {}, [groups[id].name]),
      createElement('button', {class: 'start color-green'}, ['スタート'])
    ]));
  }
  listViewListDiv.innerHTML = newelem.innerHTML;
}
