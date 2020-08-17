import { EventIPCHandler } from '../../../common/ipc/IPC'
const { ipcRenderer } = window.require('electron-better-ipc')

export class ElectronIPCRendererHandler implements EventIPCHandler {
  register(
    event: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (data: any, ...args: any) => any
  ): () => void {
    return ipcRenderer.answerMain(event, callback)
  }
  call(event: string, data: unknown): Promise<unknown> {
    return ipcRenderer.callMain(event, data)
  }
}
