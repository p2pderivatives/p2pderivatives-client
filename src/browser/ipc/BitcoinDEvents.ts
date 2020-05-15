import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { ipcMain as ipc } from 'electron-better-ipc'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { BalanceAnswer } from '../../common/models/ipc/BalanceAnswer'
import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import { ConfigAnswer } from '../../common/models/ipc/ConfigAnswer'
import {
  CHECK_BITCOIND,
  GET_BALANCE,
  GET_CONFIG,
} from '../../common/constants/IPC'
import BitcoinDClient from '../api/bitcoind'
import Storage from '../storage/storage'

export class BitcoinDEvents implements IPCEvents {
  private _client = new BitcoinDClient()
  private _storage: Storage
  private _config: BitcoinDConfig | null = null

  constructor(storage: Storage) {
    this._storage = storage
    try {
      const bitcoinConfig = this._storage.readBitcoinDConfig()
      if (bitcoinConfig) {
        this._client.configure(bitcoinConfig)
        this._config = bitcoinConfig
      }
    } catch (e) {
      // pretend nothing happened
    }
  }

  public registerReplies(): void {
    ipc.answerRenderer(CHECK_BITCOIND, async data => {
      const config = data as BitcoinDConfig
      try {
        await this._client.configure(config)
        this._storage.writeBitcoinDConfig(config)
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
        return new ConfigAnswer(false, null)
      }
    })
  }
}
