import { IPCEventRegisterBase } from '../../../common/ipc/BaseIPC'
import { TaggedCallbacks } from '../../../common/ipc/IPC'
import {
  FileChannels,
  FileFailableAsync,
  OutcomeCall,
} from '../../../common/ipc/model/file'
import { Outcome } from '../../../common/models/dlc/Outcome'
import { Success } from '../../../common/utils/failable'
import IOAPI from '../../api/io'

export class FileEvents extends IPCEventRegisterBase<FileChannels> {
  protected _provider = {}
  private _client = new IOAPI()

  protected taggedCallbacks: TaggedCallbacks<FileChannels> = {
    parseOutcomes: {
      tag: 'file/outcome/parse',
      callback: this.parseOutcomeCallback.bind(this),
    },
  }

  private async parseOutcomeCallback(
    outcomeCall: OutcomeCall
  ): FileFailableAsync<Outcome[]> {
    try {
      const outcomesList = await this._client.readOutcomes(
        outcomeCall.outcomesPath
      )
      return Success(outcomesList)
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'file',
          code: 1,
          message: e.message,
          name: 'Parse csv outcomes Error',
        },
      }
    }
  }
}
