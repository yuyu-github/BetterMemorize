import { menuExportButton } from "../elements.js";
import { currentGroup } from "../group/group.js";
import { currentMode } from "../mode.js";
import { currentWork } from "../work/work.js";

export function init() {
  menuExportButton.addEventListener('click', () => {
    if (currentMode == 'work') api.exportWork(currentWork);
    else if (currentMode == 'group') api.exportGroup(currentWork, currentGroup);
  })
}
