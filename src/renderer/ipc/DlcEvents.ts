import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { DLC_EVENT } from '../../common/constants/IPC'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export class DlcEvents implements IPCEvents {
  registerReplies(): void {
    ipc.answerMain(DLC_EVENT, () => {
      // TODO(Wesley): implement logic
      return new GeneralAnswer(true)
    })
  }
}
