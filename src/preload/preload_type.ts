import { Group } from "../renderer/group/group.js";
import { Question } from "../renderer/question/question.js";
import { PriorityData } from "../renderer/test/priority.js";
import { WithLastAccessTime } from "../renderer/utils.js";
import { Work } from "../renderer/work/work.js";

export interface IApi {
  addWork: (data: Work) => Promise<void>;
  editWork: (id: string, data: Work) => Promise<void>;
  deleteWork: (id: string) => Promise<void>;
  getWorks: () => Promise<{[id: string]: WithLastAccessTime<Work>}>;
  addGroup: (workId: string, groupId: string | null, data: Group) => Promise<void>;
  editGroup: (workId: string, id: string, data: Group) => Promise<void>;
  deleteGroup: (workId: string, groupId: string | null, id: string) => Promise<void>;
  getGroups: (workId: string, groupId?: string | null) => Promise<{[id: string]: WithLastAccessTime<Group>}>;
  addQuestion: (workId: string, groupId: string, data: Question) => Promise<void>;
  editQuestion: (workId: string, groupId: string, id: string, data: Question) => Promise<void>;
  deleteQuestion: (workId: string, groupId: string, id: string) => Promise<void>;
  getQuestions: (workId: string, groupId: string) => Promise<{[id: string]: WithLastAccessTime<Question>}>;
  getPriorityData: (workId: string, groupId: string) => Promise<{[id: string]: PriorityData}>;
  setPriorityData: (workId: string, groupId: string, data: {[id: string]: PriorityData}) => Promise<void>;
  getImportSourceFile: (mode) => Promise<string>;
  importWork: (path: string) => Promise<void>;
  importGroup: (path: string, method: string, workId: string) => Promise<void>;
  importSubGroup: (path: string, method: string, workId: string, groupId: string) => Promise<void>;
  exportWork: (workId: string) => Promise<void>;
  exportGroup: (workId: string, groupId: string) => Promise<void>;
  updateLastAccessTime: (workId: string, groupId?: string | null) => Promise<void>;
}

declare global {
  var api: IApi;
}
