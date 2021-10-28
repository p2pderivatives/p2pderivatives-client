import { GET_OUTCOME } from '../../common/constants/IPC'
import OutcomeAnswer from '../../common/models/ipc/OutcomeAnswer'
import IOAPI from '../api/io'
import { IPCEventsBase } from './IPCEventsBase'
import { TaggedCallback } from './TaggedCallback'
import { dialog } from 'electron'

export class FileEvents extends IPCEventsBase {
  private _client = new IOAPI()

  protected taggedCallbacks(): TaggedCallback[] {
    return [
      {
        tag: GET_OUTCOME,
        callback: (): Promise<OutcomeAnswer> => this.getOutcomes(),
      },
    ]
  }

  private async getOutcomes(): Promise<OutcomeAnswer> {
    try {
      const files = await dialog.showOpenDialog({ properties: ['openFile'] })
      if (files !== undefined) {
        const filepath = files.filePaths[0]
        const outcomesList = await this._client.readRangeOutcomes(filepath)
        return new OutcomeAnswer(true, outcomesList)
      }
      return new OutcomeAnswer(false, [], null)
    } catch (e) {
      return new OutcomeAnswer(false, [], e)
    }
  }
}
