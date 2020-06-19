import Client, {
  ClientConstructorOption,
  WalletTransaction,
  ListUnspentOptions,
  UnspentTxInfo,
} from 'bitcoin-core'

import { BitcoinDConfig } from '../../../common/models/ipc/BitcoinDConfig'
import * as Utils from '../../dlc/utils/CfdUtils'
import { Utxo } from '../../dlc/models/Utxo'

export default class BitcoinDClient {
  private rpcUser = ''
  private rpcPassword = ''
  private host = ''
  private port = 8332
  private network: 'mainnet' | 'regtest' | 'testnet' = 'regtest'
  private wallet = ''
  private walletPassphrase = ''

  private client: Client | null = null
  private getClient(): Client {
    if (this.client) {
      return this.client
    } else {
      throw new Error('BitcoinD client not initialized!')
    }
  }

  public async configure(options: BitcoinDConfig): Promise<void> {
    const clientConfig: ClientConstructorOption = {}
    if (options.rpcUsername) {
      this.rpcUser = options.rpcUsername
      clientConfig['username'] = this.rpcUser
    }
    if (options.rpcPassword) {
      this.rpcPassword = options.rpcPassword
      clientConfig['password'] = this.rpcPassword
    }
    if (options.network) {
      this.network = options.network
      clientConfig['network'] = this.network
    }
    if (options.host) {
      this.host = options.host
      clientConfig['host'] = this.host
    }
    if (options.port) {
      this.port = options.port
    } else {
      if (this.network === 'mainnet') this.port = 8332
      if (this.network === 'testnet') this.port = 18332
      if (this.network === 'regtest') this.port = 18443
    }
    clientConfig['port'] = this.port

    if (options.wallet) {
      this.wallet = options.wallet
    }
    clientConfig['wallet'] = this.wallet

    if (options.walletPassphrase) {
      this.walletPassphrase = options.walletPassphrase
    }

    clientConfig.useWalletURL = true

    this.client = new Client(clientConfig)
    if (this.wallet) {
      const wallets = await this.client.listWallets()
      if (!(this.wallet in wallets)) {
        try {
          await this.client.loadWallet(this.wallet)
        } catch (e) {
          if (e.code === -18) {
            throw e
          }
        }
      }
    }
    if (options.walletPassphrase) {
      await this.client.walletPassphrase(this.walletPassphrase, 10)
    }
    await this.client.getNetworkInfo()
  }

  public async sendRawTransaction(hexString: string): Promise<void> {
    return await this.getClient().sendRawTransaction(hexString)
  }

  public async getTransaction(
    transactionId: string,
    includeWatchOnly = false
  ): Promise<WalletTransaction> {
    return await this.getClient().getTransaction(
      transactionId,
      includeWatchOnly
    )
  }

  public async dumpPrivKey(address: string): Promise<string> {
    return await this.getClient().dumpPrivKey(address)
  }

  public async listUnspent(
    minConfirmations = 1,
    maxConfirmations = 9999999,
    addresses: Array<string> = [],
    includeUnsafe = false,
    queryOptions?: ListUnspentOptions
  ): Promise<UnspentTxInfo[]> {
    return await this.getClient().listUnspent(
      minConfirmations,
      maxConfirmations,
      addresses,
      includeUnsafe,
      queryOptions
    )
  }

  public async getNewAddress(label = ''): Promise<string> {
    return await this.getClient().getNewAddress(label)
  }

  public async getBalance(
    minConfirmations = 0,
    includeWatchOnly = false
  ): Promise<number> {
    const balanceBtc = await this.getClient().getBalance(
      '*',
      minConfirmations,
      includeWatchOnly
    )

    return this.btcToSats(balanceBtc)
  }

  public async createWallet(name: string) {
    return await this.getClient().createWallet(name, false, false, name)
  }

  public async getNewPrivateKey(): Promise<string> {
    if (this.walletPassphrase)
      await this.getClient().walletPassphrase(this.walletPassphrase, 10)
    const address = await this.getClient().getNewAddress()
    return this.dumpPrivHex(address)
  }

  public async dumpPrivHex(address: string) {
    const wif = await this.getClient().dumpPrivKey(address)
    return Utils.getPrivkeyFromWif(wif)
  }

  public async getUtxosForAmount(amount: number): Promise<Utxo[]> {
    const unspent = await this.getClient().listUnspent(1)
    const utxosIn: Utxo[] = unspent.map(utxo => {
      return {
        txid: utxo.txid,
        vout: utxo.vout,
        amount: this.btcToSats(utxo.amount),
        address: utxo.address,
      }
    })

    const utxoSet = Utils.selectUtxosForAmount(amount, utxosIn)

    return utxoSet
  }

  public async generateBlocksToWallet(nbBlocks: number): Promise<void> {
    const address = await this.getClient().getNewAddress()
    await this.getClient().generateToAddress(nbBlocks, address)
  }

  private btcToSats(amount: number) {
    return amount * 100000000
  }
}
