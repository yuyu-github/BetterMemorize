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
  getImportSourceFile: (mode) => ipcRenderer.invoke('getImportSourceFile', mode),
  importWork: (path, options) => ipcRenderer.invoke('importWork', path, options),
  importGroup: (path, workId, options) => ipcRenderer.invoke('importGroup', path, workId, options),
  importSubGroup: (path, workId, groupId, options) => ipcRenderer.invoke('importSubGroup', path, workId, groupId, options),
  getExportTargetFile: (name) => ipcRenderer.invoke('getExportTargetFile', name),
  exportWork: (path, workId, options) => ipcRenderer.invoke('exportWork', path, workId, options),
  exportGroup: (path, workId, groupId, options) => ipcRenderer.invoke('exportGroup', path, workId, groupId, options),
  updateLastAccessTime: (workId, groupId = null) => ipcRenderer.invoke('updateLastAccessTime', workId, groupId),
  moveGroup: (workId, id, source, target) => ipcRenderer.invoke('moveGroup', workId, id, source, target),
  moveQuestion: (workId, id, source, target) => ipcRenderer.invoke('moveQuestion', workId, id, source, target),
  setLastTestQuestions: (workId, groupId, questions) => ipcRenderer.invoke('setLastTestQuestions', workId, groupId, questions),
  getLastTestQuestions: (workId, groupId) => ipcRenderer.invoke('getLastTestQuestions', workId, groupId),
})
