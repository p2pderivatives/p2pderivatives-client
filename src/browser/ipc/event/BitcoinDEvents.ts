import { IPCEventRegisterBase } from '../../../common/ipc/BaseIPC'
import { TaggedCallbacks } from '../../../common/ipc/IPC'
import {
  BitcoindChannels,
  BitcoindFailableAsync,
} from '../../../common/ipc/model/bitcoind'
import { BitcoinDConfig } from '../../../common/models/bitcoind/config'
import { isFailed, Success } from '../../../common/utils/failable'
import BitcoinDClient from '../../api/bitcoind'
import ConfigRepository from '../../config/ConfigRepository'

export class BitcoinDEvents extends IPCEventRegisterBase<BitcoindChannels> {
  private _client = new BitcoinDClient()
  private _storage: ConfigRepository
  private _config: BitcoinDConfig | null = null

  constructor(storage: ConfigRepository) {
    super()
    this._storage = storage
  }

  public getClient(): BitcoinDClient {
    return this._client
  }

  public async initialize(): Promise<void> {
    const result = await this._storage.ReadBitcoinDConfig()
    if (isFailed(result)) {
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

  protected taggedCallbacks: TaggedCallbacks<BitcoindChannels> = {
    getBalance: {
      tag: 'bitcoind/balance/get',
      callback: this.getBalanceCallback.bind(this),
    },
    getConfig: {
      tag: 'bitcoind/config/get',
      callback: this.getConfigCallback.bind(this),
    },
    getUtxoAmount: {
      tag: 'bitcoind/utxo/get',
      callback: this.getUtxoAmount.bind(this),
    },
    checkConfig: {
      tag: 'bitcoind/config/check',
      callback: this.bitcoinDCheckCallback.bind(this),
    },
  }

  private async bitcoinDCheckCallback(
    config: BitcoinDConfig
  ): BitcoindFailableAsync<void> {
    try {
      await this._client.configure(config)
      await this._storage.WriteBitcoinDConfig(config)
      this._config = config
      return Success()
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'bitcoind',
          message: e.message,
          name: 'Check config Error',
          code: -1,
        },
      }
    }
  }

  private async getBalanceCallback(): BitcoindFailableAsync<number> {
    try {
      const balance = await this._client.getBalance()
      return Success(balance)
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'bitcoind',
          message: e.message,
          code: -1,
          name: 'Get Balance Error',
        },
      }
    }
  }

  private async getConfigCallback(): BitcoindFailableAsync<BitcoinDConfig> {
    if (this._config) {
      return Success(this._config)
    }
    return {
      success: false,
      error: {
        type: 'bitcoind',
        message: 'No valid config found',
        code: -1,
        name: 'Get Config Error',
      },
    }
  }

  private async getUtxoAmount(): BitcoindFailableAsync<number> {
    try {
      const balance = await this._client.getAvailableUtxoAmount()
      return Success(balance)
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'bitcoind',
          message: e.message,
          code: -2,
          name: 'Get UTXO Amount Error',
        },
      }
    }
  }
}
