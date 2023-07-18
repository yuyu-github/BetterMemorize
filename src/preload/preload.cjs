import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('api', {
  addWork: name => ipcRenderer.invoke('addWork', name),
  editWork: (id, data) => ipcRenderer.invoke('editWork', id, data),
  getWorks: () => ipcRenderer.invoke('getWorks'),
})
