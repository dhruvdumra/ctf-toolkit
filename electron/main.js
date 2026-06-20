const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { readFile, writeFile } = require('node:fs/promises')
const path = require('node:path')

const DEV_URL = process.env.VITE_DEV_SERVER_URL

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 900,
    minHeight: 560,
    backgroundColor: '#181818',
    title: 'CipherDeck',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
nodeIntegration: false,
    },
  })

  if (DEV_URL) {
    win.loadURL(DEV_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('file:open', async (_e, { encoding } = {}) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
})
  if (canceled || !filePaths.length) return null
  const data = await readFile(filePaths[0], encoding ?? null)
  return {
    path: filePaths[0],
    name: path.basename(filePaths[0]),
      data: encoding ? data : Array.from(data),
}
})

ipcMain.handle('file:save', async (_e, { defaultName, content }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName,
  })
  if (canceled || !filePath) return null
  const buf = Array.isArray(content) ? Buffer.from(content) : content
  await writeFile(filePath, buf)
  return filePath
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
