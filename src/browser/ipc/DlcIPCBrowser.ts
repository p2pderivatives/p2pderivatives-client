import {
  GeneralAnswerProps,
  GeneralAnswer,
} from '../../common/models/ipc/GeneralAnswer'
import { ipcMain as ipc } from 'electron-better-ipc'
import { DlcBrowserAPI } from './DlcBrowserAPI'
import { DLC_UPDATE } from '../../common/constants/IPC'
import electron from 'electron'
import { AnyContract, toSimpleContract } from '../dlc/models/contract'

export class DlcIPCBrowser implements DlcBrowserAPI {
  constructor(private readonly window: electron.BrowserWindow) {}

  async dlcUpdate(contract: AnyContract): Promise<void> {
    const answerProps = (await ipc.callRenderer(
      this.window,
      DLC_UPDATE,
      toSimpleContract(contract)
    )) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      throw error
    }
  }
}
