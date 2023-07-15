import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('api', {
  addWork: name => ipcRenderer.invoke('addWork', name),
  getWorks: () => ipcRenderer.invoke('getWorks'),
})
