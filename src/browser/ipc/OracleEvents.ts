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
import { registerTaggedCallbacks, TaggedCallback } from './Utils'

export class OracleEvents implements IPCEvents {
  private _client: OracleClient
  private _unregisterers: (() => void)[] = []

  constructor(client: OracleClient) {
    this._client = client
  }

  public unregisterReplies(): void {
    for (const unregisterer of this._unregisterers) {
      unregisterer()
    }
  }

  public registerReplies(): void {
    const taggedCallbacks: TaggedCallback[] = [
      {
        tag: GET_ORACLE_ASSET_CONFIG,
        callback: data => this.getOracleAssetConfigCallback(data),
      },
    ]

    this._unregisterers = registerTaggedCallbacks(taggedCallbacks)
  }

  private async getOracleAssetConfigCallback(data: unknown) {
    const assetID = data as string
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
