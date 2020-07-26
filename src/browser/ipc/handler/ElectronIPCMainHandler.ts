import { ipcMain } from 'electron-better-ipc'
import { EventIPCHandler } from '../../../common/ipc/IPC'

export class ElectronIPCMainHandler implements EventIPCHandler {
  register(
    event: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (data: unknown, ...args: any) => unknown
  ): () => void {
    return ipcMain.answerRenderer(event, callback)
  }

  call(
    event: string,
    data: unknown,
    window: Electron.BrowserWindow
  ): Promise<unknown> {
    return ipcMain.callRenderer(window, event, data)
  }
}
