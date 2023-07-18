import { init as initMode, setMode } from "./mode.js";
import { init as initWork } from './work/work.js';
import { init as initGroup } from './group/group.js';

initMode();
initWork();
initGroup();

setMode('all-work');
