import { ipcMain as ipc } from 'electron-better-ipc'
import {
  CHECK_BITCOIND,
  GET_BALANCE,
  GET_CONFIG,
} from '../../common/constants/IPC'
import { BalanceAnswer } from '../../common/models/ipc/BalanceAnswer'
import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import { ConfigAnswer } from '../../common/models/ipc/ConfigAnswer'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { IPCEvents } from './IPCEvents'
import { isSuccessful } from '../../common/utils/failable'
import BitcoinDClient from '../api/bitcoind'
import { IPCError } from '../../common/models/ipc/IPCError'
import ConfigRepository from '../config/ConfigRepository'

export class BitcoinDEvents implements IPCEvents {
  private _client = new BitcoinDClient()
  private _storage: ConfigRepository
  private _config: BitcoinDConfig | null = null

  constructor(storage: ConfigRepository) {
    this._storage = storage
  }

  public async Initialize(): Promise<void> {
    const result = await this._storage.ReadBitcoinDConfig()
    if (!isSuccessful(result)) {
      // No config
      return
    }

    this._config = result.value
    await this._client.configure(this._config)
  }

  public registerReplies(): void {
    ipc.answerRenderer(CHECK_BITCOIND, async data => {
      const config = data as BitcoinDConfig
      try {
        await this._client.configure(config)
        await this._storage.WriteBitcoinDConfig(config)
        this._config = config
        return new GeneralAnswer(true)
      } catch (e) {
        return new GeneralAnswer(false, e)
      }
    })

    ipc.answerRenderer(GET_BALANCE, async () => {
      try {
        const balance = await this._client.getBalance()
        return new BalanceAnswer(true, balance)
      } catch (e) {
        return new BalanceAnswer(false, 0, e)
      }
    })

    ipc.answerRenderer(GET_CONFIG, () => {
      if (this._config) {
        return new ConfigAnswer(true, this._config)
      } else {
        return new ConfigAnswer(
          false,
          null,
          new IPCError('general', -1, 'No valid config found', 'NoValidConfig')
        )
      }
    })
  }
}
