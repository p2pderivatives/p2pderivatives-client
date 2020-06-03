import {
  GeneralAnswerProps,
  GeneralAnswer,
} from '../../common/models/ipc/GeneralAnswer'
import { ipcMain as ipc } from 'electron-better-ipc'
import { DlcIPCBrowserAPI } from './DlcBrowserAPI'
import { DLC_EVENT } from '../../common/constants/IPC'
import { DlcEventType } from '../../common/constants/DlcEventType'
import { Contract } from '../../common/models/dlc/Contract'
import { DlcCall } from '../../common/models/ipc/DlcCall'

export class DlcIPCBrowser implements DlcIPCBrowserAPI {
  async dlcCall(eventType: DlcEventType, contract: Contract): Promise<void> {
    const call: DlcCall = { type: eventType, contract: contract }
    const answerProps = (await ipc.callFocusedRenderer(
      DLC_EVENT,
      call
    )) as GeneralAnswerProps
    const answer = GeneralAnswer.parse(answerProps)

    if (!answer.isSuccess()) {
      const error = answer.getError()
      throw error
    }
  }
}
