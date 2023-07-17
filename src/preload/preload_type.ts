export interface IApi {
  addWork: (name: string) => Promise<void>;
  getWorks: () => Promise<{[id: string]: {name: string}}>;
}

declare global {
  var api: IApi;
}
