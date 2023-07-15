import { app } from "electron";
import path from "path";

export const dataFolder = path.join(app.getPath('userData'), 'data');
