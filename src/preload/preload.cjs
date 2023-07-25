import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('api', {
  addWork: (data) => ipcRenderer.invoke('addWork', data),
  editWork: (id, data) => ipcRenderer.invoke('editWork', id, data),
  deleteWork: (id) => ipcRenderer.invoke('deleteWork', id),
  getWorks: () => ipcRenderer.invoke('getWorks'),
  addGroup: (workId, groupId, data) => ipcRenderer.invoke('addGroup', workId, groupId, data),
  editGroup: (workId, id, data) => ipcRenderer.invoke('editGroup', workId, id, data),
  deleteGroup: (workId, groupId, id) => ipcRenderer.invoke('deleteGroup', workId, groupId, id),
  getGroups: (workId, groupId = null) => ipcRenderer.invoke('getGroups', workId, groupId),
  addQuestion: (workId, groupId, data) => ipcRenderer.invoke('addQuestion', workId, groupId, data),
  editQuestion: (workId, groupId, id, data) => ipcRenderer.invoke('editQuestion', workId, groupId, id, data),
  deleteQuestion: (workId, groupId, id) => ipcRenderer.invoke('deleteQuestion', workId, groupId, id),
  getQuestions: (workId, groupId) => ipcRenderer.invoke('getQuestions', workId, groupId),
})
