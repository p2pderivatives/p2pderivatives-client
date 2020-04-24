import { ipcMain as ipc } from 'electron-better-ipc'
import { IPCEvents } from './IPCEvents'
import OutcomeCall from '../../common/models/ipc/OutcomeCall'
import OutcomeAnswer from '../../common/models/ipc/OutcomeAnswer'
import { PARSE_OUTCOME } from '../../common/constants/IPC'
import IOAPI from '../api/io'

export class FileEvents implements IPCEvents {
  private _client = new IOAPI()

  public registerReplies(): void {
    ipc.answerRenderer(PARSE_OUTCOME, async data => {
      const outcomeCall = data as OutcomeCall
      try {
        const outcomesList = await this._client.readOutcomes(
          outcomeCall.outcomesPath
        )
        return new OutcomeAnswer(true, outcomesList)
      } catch (e) {
        return new OutcomeAnswer(false, [], e)
      }
    })
  }
}
