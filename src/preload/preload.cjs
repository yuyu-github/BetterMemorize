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
  getPriorityData: (workId, groupId) => ipcRenderer.invoke('getPriorityData', workId, groupId),
  setPriorityData: (workId, groupId, data) => ipcRenderer.invoke('setPriorityData', workId, groupId, data),
  getImportSourceFile: () => ipcRenderer.invoke('getImportSourceFile'),
  importWork: (path) => ipcRenderer.invoke('importWork', path),
  importGroup: (path, method, workId) => ipcRenderer.invoke('importGroup', path, method, workId),
  importSubGroup: (path, method, workId, groupId) => ipcRenderer.invoke('importSubGroup', path, method, workId, groupId),
  exportWork: (workId) => ipcRenderer.invoke('exportWork', workId),
  exportGroup: (workId, groupId) => ipcRenderer.invoke('exportGroup', workId, groupId),
})
