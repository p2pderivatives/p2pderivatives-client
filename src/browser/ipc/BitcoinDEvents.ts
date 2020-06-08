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
import ConfigRepository from '../config/ConfigRepository'

export type BitcoinDConfigCallback = (
  config: BitcoinDConfig,
  client: BitcoinDClient
) => void

export class BitcoinDEvents implements IPCEvents {
  private _client = new BitcoinDClient()
  private _storage: ConfigRepository
  private _config: BitcoinDConfig | null = null
  private _configCallback: BitcoinDConfigCallback

  constructor(
    storage: ConfigRepository,
    configCallback: BitcoinDConfigCallback
  ) {
    this._storage = storage
    this._configCallback = configCallback
  }

  public async Initialize(): Promise<void> {
    console.log('AHAHAHAHHAH')
    const result = await this._storage.ReadBitcoinDConfig()
    if (result.hasError()) {
      // No config
      console.log('No config!!')
      return
    }

    this._config = result.getValue()
    await this._client.configure(this._config)
    console.log(this._configCallback)
    console.log('Im calling it')
    this._configCallback(this._config, this._client)
  }

  public registerReplies(): void {
    ipc.answerRenderer(CHECK_BITCOIND, async data => {
      const config = data as BitcoinDConfig
      try {
        console.log('CHECK ME OUT')
        await this._client.configure(config)
        await this._storage.WriteBitcoinDConfig(config)
        this._config = config
        this._configCallback(this._config, this._client)
        return new GeneralAnswer(true)
      } catch (e) {
        console.log('There is a catch though')
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
      console.log('Trying to get config')
      if (this._config) {
        console.log('There is a config')
        return new ConfigAnswer(true, this._config)
      } else {
        console.log('There is no config though')
        return new ConfigAnswer(false, null)
      }
    })
  }
}
