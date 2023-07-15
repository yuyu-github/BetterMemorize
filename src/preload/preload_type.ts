export interface IApi {
  addWork: (name: string) => Promise<void>;
  getWorks: () => Promise<{name: string, id: string}[]>;
}

declare global {
  var api: IApi;
}
