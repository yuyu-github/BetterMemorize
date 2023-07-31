import { ButtonResult, showDialog } from "../dialog.js";
import { listViewImportButton } from "../elements.js";
import { currentGroup } from "../group/group.js";
import { currentMode, reload } from "../mode.js";
import { currentWork } from "../work/work.js";

export function init() {
  listViewImportButton.addEventListener('click', async () => {
    let path = await api.getImportSourceFile(currentMode);
    if (path == null) return;

    let options = {
      extract: false,
    }
    if (currentMode == 'all-work') await api.importWork(path, options);
    else {
      if (path.endsWith('.bmr')) {
        let dialog = (await showDialog('インポート', null, 'ok-cancel', {extract: {name: '展開してインポートする', type: 'checkbox'}}));
        if (dialog.button != ButtonResult.Ok) return;
        options.extract = dialog.input.extract;
      }

      if (currentMode == 'work') await api.importGroup(path, currentWork, options);
      else if (currentMode == 'group') await api.importSubGroup(path, currentWork, currentGroup, options);
    }
    reload();
  })
}
