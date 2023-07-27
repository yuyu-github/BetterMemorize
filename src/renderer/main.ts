import { init as initMode, setMode } from "./mode.js";
import { init as initWork } from './work/work.js';
import { init as initGroup } from './group/group.js';
import { init as initQuestion } from './question/question.js';
import { init as initTestStart } from "./test/start.js";
import { init as initTest } from "./test/test.js";
import { init as initImport } from "./file/import.js";
import { init as initExport } from "./file/export.js";

initMode();
initWork();
initGroup();
initQuestion();
initTestStart();
initTest();
initImport();
initExport();

setMode('all-work');
document.documentElement.style.display = 'block';
