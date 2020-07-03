import {
  GeneralAnswerProps,
  GeneralAnswer,
} from '../../common/models/ipc/GeneralAnswer'
import { ipcMain as ipc } from 'electron-better-ipc'
import { DlcBrowserAPI } from './DlcBrowserAPI'
import { DLC_UPDATE } from '../../common/constants/IPC'
import { Contract } from '../../common/models/dlc/Contract'
import electron from 'electron'

export class DlcIPCBrowser implements DlcBrowserAPI {
  constructor(private readonly window: electron.BrowserWindow) {}

  async dlcUpdate(contract: Contract): Promise<void> {
    const call = { contract: contract }
    try {
      const answerProps = (await ipc.callRenderer(
        this.window,
        DLC_UPDATE,
        call
      )) as GeneralAnswerProps
      const answer = GeneralAnswer.parse(answerProps)

      if (!answer.isSuccess()) {
        const error = answer.getError()
        throw error
      }
    } catch (e) {
      throw e
    }
  }
}
