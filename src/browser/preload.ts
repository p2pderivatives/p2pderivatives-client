import { contextBridge } from 'electron'
import { ipcRenderer } from 'electron-better-ipc'
import { WHITELIST } from '../common/constants/IPC'

contextBridge.exposeInMainWorld('api', {
  callMain: <T>(channel: string, data?: T) => {
    if (WHITELIST.includes(channel)) {
      return ipcRenderer.callMain(channel, data)
    }

    throw new Error(`Unknown channel ${channel}`)
  },
  answerMain: <T, V>(channel: string, callback: (data: T) => V) => {
    if (WHITELIST.includes(channel)) {
      return ipcRenderer.answerMain(channel, callback)
    }

    throw new Error(`Unknown channel ${channel}`)
  },
})
