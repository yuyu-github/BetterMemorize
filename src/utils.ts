import { app } from "electron";
import path from "path";
import fs from 'fs';

export const dataFolder = path.join(app.getPath('userData'), 'data');

export function useFile(path: string | string[], type: 'string' | 'json', func: (content: any) => any) {
  let file: string | null = null;
  if (typeof path == 'string') file = path;
  else {
    for (let i of path) {
      if (fs.existsSync(i)) {
        file = i;
        break;
      }
    }
  }
  let buffer = file == null || !fs.existsSync(file) ? null : fs.readFileSync(file);
  let content: any;
  switch (type) {
    case 'string': content = buffer != null ? buffer.toString() : ''; break;
    case 'json': content = buffer != null ? JSON.parse(buffer.toString()) : {}; break;
  }
  let result = func(content);
  let newdata;
  switch (type) {
    case 'string': newdata = content; break;
    case 'json': newdata = JSON.stringify(content); break;
  }
  if (file != null || path.length > 0) fs.writeFileSync(file ?? path[0], newdata);
  return result;
}
