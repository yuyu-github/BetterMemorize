import { Group } from "../renderer/group/group.js";
import { Question } from "../renderer/question/question.js";
import { Subject } from "../renderer/utils.js";
import { Work } from "../renderer/work/work.js";

export interface IApi {
  addWork: (data: Work) => Promise<void>;
  editWork: (id: string, data: Work) => Promise<void>;
  deleteWork: (id: string) => Promise<void>;
  getWorks: () => Promise<{[id: string]: Work}>;
  addGroup: (workId: string, data: Group) => Promise<void>;
  editGroup: (workId: string, id: string, data: Group) => Promise<void>;
  deleteGroup: (workId: string, id: string) => Promise<void>;
  getGroups: (workId: string) => Promise<{[id: string]: Group}>;
  addQuestion: (workId: string, groupId: string, data: Question) => Promise<void>;
  editQuestion: (workId: string, groupId: string, id: string, data: Question) => Promise<void>;
  getQuestions: (workId: string, groupId: string) => Promise<{[id: string]: Question}>;
}

declare global {
  var api: IApi;
}
