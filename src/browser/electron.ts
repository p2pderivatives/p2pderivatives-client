import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import * as isDev from 'electron-is-dev'
import { AuthenticationClient } from './api/grpc/gen/authentication_grpc_pb'
import * as grpc from 'grpc'
import { LoginRequest } from './api/grpc/gen/authentication_pb'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  console.log('isDev: ', isDev)
  const client = new AuthenticationClient(
    'localhost:8080',
    grpc.credentials.createInsecure()
  )
  const loginRequest = new LoginRequest()
  loginRequest.setAccount('test')
  loginRequest.setPassword('p@ssw0rd')
  client.login(loginRequest, (error, response) => {
    console.log('error: ', error)
    console.log('res: ', response)
  })

  mainWindow = new BrowserWindow({ width: 900, height: 680 })
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  mainWindow.webContents.toggleDevTools()
  mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
