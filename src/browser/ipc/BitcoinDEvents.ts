import {
  CHECK_BITCOIND,
  GET_BALANCE,
  GET_CONFIG,
} from '../../common/constants/IPC'
import { BalanceAnswer } from '../../common/models/ipc/BalanceAnswer'
import { BitcoinDConfig } from '../../common/models/ipc/BitcoinDConfig'
import { ConfigAnswer } from '../../common/models/ipc/ConfigAnswer'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { IPCError } from '../../common/models/ipc/IPCError'
import { isSuccessful } from '../../common/utils/failable'
import BitcoinDClient from '../api/bitcoind'
import ConfigRepository from '../config/ConfigRepository'
import { IPCEventsBase } from './IPCEventsBase'
import { TaggedCallback } from './TaggedCallback'

export class BitcoinDEvents extends IPCEventsBase {
  private _client = new BitcoinDClient()
  private _storage: ConfigRepository
  private _config: BitcoinDConfig | null = null

  constructor(storage: ConfigRepository) {
    super()
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

  protected taggedCallbacks(): TaggedCallback[] {
    return [
      {
        tag: CHECK_BITCOIND,
        callback: (data): Promise<GeneralAnswer> =>
          this.bitcoinDCheckCallback(data),
      },
      {
        tag: GET_BALANCE,
        callback: (): Promise<BalanceAnswer> => this.getBalanceCallback(),
      },
      {
        tag: GET_CONFIG,
        callback: (): Promise<ConfigAnswer> => this.getConfigCallback(),
      },
    ]
  }

  async bitcoinDCheckCallback(data: unknown): Promise<GeneralAnswer> {
    try {
      const config = data as BitcoinDConfig
      await this._client.configure(config)
      await this._storage.WriteBitcoinDConfig(config)
      this._config = config
      return new GeneralAnswer(true)
    } catch (e) {
      return new GeneralAnswer(false, e)
    }
  }

  async getBalanceCallback(): Promise<BalanceAnswer> {
    try {
      const balance = await this._client.getBalance()
      return new BalanceAnswer(true, balance)
    } catch (e) {
      return new BalanceAnswer(false, 0, e)
    }
  }

  async getConfigCallback(): Promise<ConfigAnswer> {
    if (this._config) {
      return new ConfigAnswer(true, this._config)
    } else {
      return new ConfigAnswer(
        false,
        null,
        new IPCError('general', -1, 'No valid config found', 'NoValidConfig')
      )
    }
  }
}
