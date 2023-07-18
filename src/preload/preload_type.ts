export interface IApi {
  addWork: (name: string) => Promise<void>;
  editWork: (id: string, data: object) => Promise<void>;
  getWorks: () => Promise<{[id: string]: {name: string}}>;
}

declare global {
  var api: IApi;
}
