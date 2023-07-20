import { init as initMode, setMode } from "./mode.js";
import { init as initWork } from './work/work.js';
import { init as initGroup } from './group/group.js';
import { init as initQuestion } from './question/question.js';

initMode();
initWork();
initGroup();
initQuestion();

setMode('all-work');
