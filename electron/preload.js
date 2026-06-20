const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('deck', {
  openFile: (opts) => ipcRenderer.invoke('file:open', opts ?? {}),
  saveFile: (defaultName, content) =>
    ipcRenderer.invoke('file:save', { defaultName, content }),
  platform: process.platform,
})
