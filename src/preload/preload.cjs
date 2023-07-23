import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('api', {
  addWork: (data) => ipcRenderer.invoke('addWork', data),
  editWork: (id, data) => ipcRenderer.invoke('editWork', id, data),
  deleteWork: (id) => ipcRenderer.invoke('deleteWork', id),
  getWorks: () => ipcRenderer.invoke('getWorks'),
  addGroup: (workId, data) => ipcRenderer.invoke('addGroup', workId, data),
  editGroup: (workId, id, data) => ipcRenderer.invoke('editGroup', workId, id, data),
  deleteGroup: (workId, id) => ipcRenderer.invoke('deleteGroup', workId, id),
  getGroups: (workId) => ipcRenderer.invoke('getGroups', workId),
  addQuestion: (workId, groupId, data) => ipcRenderer.invoke('addQuestion', workId, groupId, data),
  editQuestion: (workId, groupId, id, data) => ipcRenderer.invoke('editQuestion', workId, groupId, id, data),
  deleteQuestion: (workId, groupId, id) => ipcRenderer.invoke('deleteQuestion', workId, groupId, id),
  getQuestions: (workId, groupId) => ipcRenderer.invoke('getQuestions', workId, groupId),
})
