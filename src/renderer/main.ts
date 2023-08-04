import { init as initMode, setMode } from "./mode.js";
import { init as initWork } from './work/work.js';
import { init as initGroup } from './group/group.js';
import { init as initQuestion } from './question/question.js';
import { init as initTestStart } from "./test/start.js";
import { init as initTest } from "./test/test.js";
import { init as initImport } from "./file/import.js";
import { init as initExport } from "./file/export.js";
import { init as initShortcut } from "./shortcut.js";
import { init as initMove } from "./move.js";

initMode();
initWork();
initGroup();
initQuestion();
initTestStart();
initTest();
initImport();
initExport();
initShortcut();
initMove();

await setMode('all-work');
document.documentElement.style.display = 'block';
