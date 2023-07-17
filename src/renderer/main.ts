import { init as initMode, setMode } from "./mode.js";
import { init as initWork } from './work/work.js';

initMode();
initWork();

setMode('all-work');
