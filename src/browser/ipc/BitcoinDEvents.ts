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
import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { isSuccessful } from '../../common/utils/failable'
import BitcoinDClient from '../api/bitcoind'
import { IPCError } from '../../common/models/ipc/IPCError'
import ConfigRepository from '../config/ConfigRepository'
import { TaggedCallback, registerTaggedCallbacks } from './Utils'

export class BitcoinDEvents implements IPCEvents {
  private _client = new BitcoinDClient()
  private _storage: ConfigRepository
  private _config: BitcoinDConfig | null = null
  private _unregisterers: (() => void)[]

  constructor(storage: ConfigRepository) {
    this._storage = storage
    this._unregisterers = []
  }

  public getClient(): BitcoinDClient {
    return this._client
  }

  public async initialize(): Promise<void> {
    const result = await this._storage.ReadBitcoinDConfig()
    if (!isSuccessful(result)) {
      // No config
      return
    }

    try {
      this._config = result.value
      await this._client.configure(this._config)
    } catch (e) {
      // Ignore errors here.
    }
  }

  public unregisterReplies(): void {
    for (const unregisterer of this._unregisterers) {
      unregisterer()
    }
  }

  public registerReplies(): void {
    const taggedCallbacks: TaggedCallback[] = [
      {
        tag: CHECK_BITCOIND,
        callback: data => this.bitcoinDCheckCallback(data),
      },
      { tag: GET_BALANCE, callback: () => this.getBalanceCallback() },
      { tag: GET_CONFIG, callback: () => this.getConfigCallback() },
    ]

    this._unregisterers = registerTaggedCallbacks(taggedCallbacks)
  }

  async bitcoinDCheckCallback(data: unknown) {
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

  async getBalanceCallback() {
    try {
      const balance = await this._client.getBalance()
      return new BalanceAnswer(true, balance)
    } catch (e) {
      return new BalanceAnswer(false, 0, e)
    }
  }

  async getConfigCallback() {
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
