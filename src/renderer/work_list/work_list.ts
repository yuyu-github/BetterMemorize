import { ButtonResult, showDialog } from "../dialog.js";
import { addButton } from "../elements.js";
import { currentMode } from "../mode.js";

export function init() {
  addButton.addEventListener('click', async () => {
    if (currentMode == 'work-list') {
      let result = await showDialog('ワークを追加', null, 'ok-cancel', {name: {name: '名前', type: 'text'}, name2: {name: '名前2', type: 'text'}});
      if (result.button == ButtonResult.Ok && result.input.name != '') {
        addWork(result.input.name);
      }
    }
  });
}

function addWork(name: string) {

}
