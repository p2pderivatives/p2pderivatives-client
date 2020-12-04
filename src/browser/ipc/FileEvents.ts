import { PARSE_OUTCOME } from '../../common/constants/IPC'
import OutcomeAnswer from '../../common/models/ipc/OutcomeAnswer'
import OutcomeCall from '../../common/models/ipc/OutcomeCall'
import IOAPI from '../api/io'
import { IPCEventsBase } from './IPCEventsBase'
import { TaggedCallback } from './TaggedCallback'

export class FileEvents extends IPCEventsBase {
  private _client = new IOAPI()

  protected taggedCallbacks(): TaggedCallback[] {
    return [
      {
        tag: PARSE_OUTCOME,
        callback: (data): Promise<OutcomeAnswer> =>
          this.parseOutcomeCallback(data as OutcomeCall),
      },
    ]
  }

  private async parseOutcomeCallback(
    outcomeCall: OutcomeCall
  ): Promise<OutcomeAnswer> {
    try {
      const outcomesList = await this._client.readRangeOutcomes(
        outcomeCall.outcomesPath
      )
      return new OutcomeAnswer(true, outcomesList)
    } catch (e) {
      return new OutcomeAnswer(false, [], e)
    }
  }
}
