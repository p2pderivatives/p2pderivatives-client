import {
  GeneralAnswerProps,
  GeneralAnswer,
} from '../../common/models/ipc/GeneralAnswer'
import { ipcMain as ipc } from 'electron-better-ipc'
import { DlcBrowserAPI } from './DlcBrowserAPI'
import { DLC_UPDATE } from '../../common/constants/IPC'
import { ContractSimple } from '../../common/models/ipc/ContractSimple'

export class DlcIPCBrowser implements DlcBrowserAPI {
  async dlcUpdate(contract: ContractSimple): Promise<void> {
    const call = { contract: contract }
    const answerProps = (await ipc.callFocusedRenderer(DLC_UPDATE, {
      call,
    })) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      throw error
    }
  }
}
