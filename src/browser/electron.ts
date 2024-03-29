import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import url from 'url'
import { initialize } from './initialize'

let mainWindow: BrowserWindow | null = null
let finalize: () => Promise<void> = (): Promise<void> => Promise.resolve()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  finalize = initialize(mainWindow)
  let reactUrl = url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  })
  if (!app.isPackaged) {
    reactUrl = `http://${process.env.REACT_DEV_URL || 'localhost:9000'}`
  }
  mainWindow.loadURL(reactUrl)
  if (!app.isPackaged) {
    mainWindow.webContents.toggleDevTools()
  }
  mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    finalize()
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
