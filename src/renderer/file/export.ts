import { ButtonResult, showDialog } from "../dialog.js";
import { menuExportButton } from "../elements.js";
import { currentGroup, groups } from "../group/group.js";
import { currentMode } from "../mode.js";
import { currentWork, works } from "../work/work.js";

export function init() {
  menuExportButton.addEventListener('click', async () => {
    let name = currentMode == 'work' ? works[currentWork].name : currentMode == 'group' ? groups[currentGroup].name : '';
    let path = await api.getExportTargetFile(name);
    if (path == null) return;
    
    let options = {
      includeStatData: false,
    }
    if (path.endsWith('.bmr')) {
      let dialog = (await showDialog('エクスポート', null, 'ok-cancel', {includeStatData: {name: '統計データを含める', type: 'checkbox'}}));
      if (dialog.button != ButtonResult.Ok) return;
      options.includeStatData = dialog.input.includeStatData;
    }

    if (currentMode == 'work') api.exportWork(path, currentWork, options);
    else if (currentMode == 'group') api.exportGroup(path, currentWork, currentGroup, options);
  })
}
