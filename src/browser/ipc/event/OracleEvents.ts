import { IPCEventRegisterBase } from '../../../common/ipc/BaseIPC'
import { TaggedCallbacks } from '../../../common/ipc/IPC'
import {
  OracleChannels,
  OracleConfigAnswer,
  OracleFailableAsync,
} from '../../../common/ipc/model/oracle'
import { isSuccessful, Success } from '../../../common/utils/failable'
import { OracleClient } from '../../api/oracle'

export class OracleEvents extends IPCEventRegisterBase<OracleChannels> {
  private _client: OracleClient

  constructor(client: OracleClient) {
    super()
    this._client = client
  }

  protected taggedCallbacks: TaggedCallbacks<OracleChannels> = {
    getAssetConfig: {
      tag: 'oracle/asset/config/get',
      callback: this.getOracleConfigCallback.bind(this),
    },
  }

  private async getOracleConfigCallback(
    assetID: string
  ): OracleFailableAsync<OracleConfigAnswer> {
    try {
      const oracleResponse = await this._client.getOracleConfig(assetID)
      if (isSuccessful(oracleResponse)) {
        return Success({
          startDate: oracleResponse.value.startDate.toISO(),
          frequency: oracleResponse.value.frequency.toISO(),
          range: oracleResponse.value.range.toISO(),
        })
      } else {
        return {
          success: false,
          error: {
            type: 'oracle',
            name: 'Get Oracle Config',
            message: oracleResponse.error.message,
            code: oracleResponse.error.code,
          },
        }
      }
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'oracle',
          code: 1,
          message: e.message,
          name: 'Get Oracle Config',
        },
      }
    }
  }
}
