import { GET_ORACLE_ASSET_CONFIG } from '../../common/constants/IPC'
import {
  GeneralAnswer,
  GeneralAnswerProps,
} from '../../common/models/ipc/GeneralAnswer'
import {
  OracleConfigAnswerProps,
  OracleIPCError,
} from '../../common/models/ipc/OracleConfigAnswer'
import { isSuccessful } from '../../common/utils/failable'
import { OracleClient } from '../api/oracle'
import { IPCEventsBase } from './IPCEventsBase'
import { TaggedCallback } from './TaggedCallback'

export class OracleEvents extends IPCEventsBase {
  private _client: OracleClient

  constructor(client: OracleClient) {
    super()
    this._client = client
  }

  protected taggedCallbacks(): TaggedCallback[] {
    return [
      {
        tag: GET_ORACLE_ASSET_CONFIG,
        callback: (data): Promise<GeneralAnswerProps | GeneralAnswer> =>
          this.getOracleConfigCallback(data as string),
      },
    ]
  }

  private async getOracleConfigCallback(
    assetID: string
  ): Promise<GeneralAnswerProps | GeneralAnswer> {
    try {
      const oracleResponse = await this._client.getOracleConfig(assetID)
      if (isSuccessful(oracleResponse)) {
        const answer: OracleConfigAnswerProps = {
          _success: true,
          _error: null,
          startDate: oracleResponse.value.startDate.toISO(),
          frequency: oracleResponse.value.frequency.toISO(),
          range: oracleResponse.value.range.toISO(),
        }
        return answer
      } else {
        const answer: GeneralAnswerProps = {
          _success: false,
          _error: {
            ...OracleIPCError,
            _message: oracleResponse.error.message,
            _code: oracleResponse.error.code,
          },
        }
        return answer
      }
    } catch (e) {
      return new GeneralAnswer(false, e)
    }
  }
}
