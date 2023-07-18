import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('api', {
  addWork: data => ipcRenderer.invoke('addWork', data),
  editWork: (id, data) => ipcRenderer.invoke('editWork', id, data),
  getWorks: () => ipcRenderer.invoke('getWorks'),
})
