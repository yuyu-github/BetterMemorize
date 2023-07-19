import { Subject } from "../renderer/utils.js";

export interface IApi {
  addWork: (data: object) => Promise<void>;
  editWork: (id: string, data: object) => Promise<void>;
  deleteWork: (id: string) => Promise<void>;
  getWorks: () => Promise<{[id: string]: {name: string}}>;
  addGroup: (workId: string, data: object) => Promise<void>;
  editGroup: (workId: string, id: string, data: object) => Promise<void>;
  deleteGroup: (workId: string, id: string) => Promise<void>;
  getGroups: (workId: string) => Promise<{[id: string]: {name: string, subject: Subject}}>;
}

declare global {
  var api: IApi;
}
