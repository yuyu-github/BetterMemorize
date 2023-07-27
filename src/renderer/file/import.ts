import { showDialog } from "../dialog.js";
import { listViewImportButton } from "../elements.js";
import { currentGroup } from "../group/group.js";
import { currentMode, reload } from "../mode.js";
import { currentWork } from "../work/work.js";

export function init() {
  listViewImportButton.addEventListener('click', async () => {
    let path = await api.getImportSourceFile(currentMode);
    if (path == null) return;
    if (currentMode == 'all-work') await api.importWork(path);
    else {
      let method: string;
      if (path.endsWith('.bmr'))
        method = (await showDialog('インポート', null, 'ok-cancel', {method: {name: 'インポート方法', type: 'select', choices: [['default', '通常のインポート'], ['extract', '展開してインポート']]}})).input.method;
      else method = 'default';

      if (currentMode == 'work') await api.importGroup(path, method, currentWork);
      else if (currentMode == 'group') await api.importSubGroup(path, method, currentWork, currentGroup);
    }
    reload();
  })
}
