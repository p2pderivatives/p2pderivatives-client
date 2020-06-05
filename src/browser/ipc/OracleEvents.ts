import { ipcMain as ipc } from 'electron-better-ipc'
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
import { IPCEvents } from '../../common/models/ipc/IPCEvents'

export class OracleEvents implements IPCEvents {
  private _client: OracleClient

  constructor(client: OracleClient) {
    this._client = client
  }

  public registerReplies(): void {
    ipc.answerRenderer(GET_ORACLE_ASSET_CONFIG, async data => {
      const assetID = data as string
      try {
        const oracleResponse = await this._client.getOracleConfig(assetID)
        if (isSuccessful(oracleResponse)) {
          const answer: OracleConfigAnswerProps = {
            _success: true,
            _error: null,
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
    })
  }
}
