import { ButtonResult, showDialog } from "../dialog.js";
import { listViewAddButton, listViewGroupAddButton, listViewListDiv, menuDeleteButton, menuEditButton } from "../elements.js";
import { back, currentMode, reload, setMode } from "../mode.js";
import { isMoving } from "../move.js";
import { updateGroupChildren } from "../question/question.js";
import { WithLastAccessTime, createElement } from "../utils.js";
import { currentWork } from "../work/work.js";

export type Group = {
  name: string
}

export let groups: {[id: string]: Group} = {};
export let currentGroup = '';
export let groupPath: string[] = [];

export function init() {
  menuEditButton.addEventListener('click', async () => {
    if (currentMode == 'group') {
      let result = await showDialog('グループを編集', null, 'ok-cancel', {name: {name: '名前', type: 'text', init: groups[currentGroup].name}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        editGroup(currentWork, currentGroup, result.input.name);
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

  listViewListDiv.addEventListener('click', async e => {
    if (currentMode == 'work' || currentMode == 'group') {
      let target = e.target as HTMLElement;
      if (currentMode == 'group' && target.dataset.type != 'group' && target.parentElement?.dataset.type != 'group') return;
      let id = target.dataset.id;
      if (id != null) {
        if (currentGroup != '') groupPath.push(currentGroup);
        currentGroup = id;
        setMode('group');
        e.stopImmediatePropagation();
      } else if (target.nodeName == 'BUTTON' && target.classList.contains('edit')) {
        let group = target.parentElement!.dataset.id!;
        let result = await showDialog('グループを編集', null, 'ok-cancel', {name: {name: '名前', type: 'text', init: groups[group].name}});
        if (result.button == ButtonResult.Ok && result.input.name != '') {
          editGroup(currentWork, group, result.input.name);
          reload();
        }
      }
    }
  })

  listViewAddButton.addEventListener('click', async () => {
    if (currentMode == 'work') {
      let result = await showDialog('グループを追加', null, 'ok-cancel', {name: {name: '名前', type: 'text'}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        addGroup(null, result.input.name);
        updateGroups();
      }
    }
  });

  listViewGroupAddButton.addEventListener('click', async () => {
    if (currentMode == 'group') {
      let result = await showDialog('グループを追加', null, 'ok-cancel', {name: {name: '名前', type: 'text'}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        addGroup(currentGroup, result.input.name);
        updateGroupChildren();
      }
    }
  })
}

export function backGroup() {
  currentGroup = groupPath.at(-1) ?? '';
  groupPath.pop();
}

async function addGroup(groupId: string | null, name: string) {
  await api.addGroup(currentWork, groupId, {name});
}

async function editGroup(workId: string, id: string, name: string) {
  groups[id] = {name};
  await api.editGroup(workId, id, groups[id]);
}

async function deleteGroup(workId: string, groupId: string | null, id: string) {
  delete groups[id];
  await api.deleteGroup(workId, groupId, id);
}

export function cacheGroups(data: {[key: string]: Group}) {
  Object.assign(groups, data);
}

export async function updateGroups() {
  let groups = await api.getGroups(currentWork);
  cacheGroups(groups);
  listViewListDiv.innerHTML = getGroupListElem(groups).innerHTML;
}
export function getGroupListElem(groups: {[id: string]: WithLastAccessTime<Group>}) {
  let elem = createElement('div');
  for (let [id, group] of Object.entries(groups).sort((a, b) => b[1].lastAccessTime - a[1].lastAccessTime)) {
    if (isMoving('group', id)) continue;
    elem.appendChild(createElement('div', {tabIndex: 0, data: {id: id, type: 'group'}}, [
      createElement('p', {}, [group.name]),
      createElement('button', {class: 'start color-green'}, ['スタート']),
      createElement('button', {class: 'edit'}, ['編集']),
      createElement('button', {class: 'move'}, ['移動']),
    ]));
  }
  return elem;
}
