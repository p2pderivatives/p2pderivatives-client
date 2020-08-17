import Client, {
  ClientConstructorOption,
  ListUnspentOptions,
  UnspentTxInfo,
  WalletTransaction,
} from 'bitcoin-core'
import {
  BitcoinDConfig,
  BitcoinNetwork,
} from '../../../common/models/bitcoind/config'
import { btcToSats, satsToBtc } from '../../../common/utils/conversion'
import { Utxo } from '../../dlc/models/Utxo'
import * as Utils from '../../dlc/utils/CfdUtils'

export default class BitcoinDClient {
  private rpcUser = ''
  private rpcPassword = ''
  private host = ''
  private port = 833
  private network: BitcoinNetwork = 'regtest'
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
      if (!wallets.includes(this.wallet)) {
        await this.client.loadWallet(this.wallet)
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

  public async getNewAddress(
    label = '',
    addressType = 'bech32'
  ): Promise<string> {
    return await this.getClient().getNewAddress(label, addressType)
  }

  public async getAvailableUtxoAmount(minConfirmations = 0): Promise<number> {
    const spendable = (await this.getSpendableUtxos()).filter(
      x => x.confirmations >= minConfirmations
    )

    return spendable.reduce((sum, cur) => sum + btcToSats(cur.amount), 0)
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

    return btcToSats(balanceBtc)
  }

  public async createWallet(name: string, passphrase: string): Promise<void> {
    await this.getClient().createWallet(name, false, false, passphrase)
  }

  public async getNewPrivateKey(): Promise<string> {
    if (this.walletPassphrase)
      await this.getClient().walletPassphrase(this.walletPassphrase, 10)
    const address = await this.getClient().getNewAddress()
    return this.dumpPrivHex(address)
  }

  public async dumpPrivHex(address: string): Promise<string> {
    const wif = await this.getClient().dumpPrivKey(address)
    return Utils.getPrivkeyFromWif(wif)
  }

  private async getSpendableUtxos(): Promise<UnspentTxInfo[]> {
    const unspent = await this.getClient().listUnspent(
      1,
      undefined,
      undefined,
      false
    )
    return unspent.filter(x => x.spendable)
  }

  public async getUtxosForAmount(
    amount: number,
    feeRate?: number,
    lockUtxos = true
  ): Promise<Utxo[]> {
    let success = true
    let utxoSet: Utxo[] = []
    do {
      const spendable = await this.getSpendableUtxos()
      const utxosIn: Utxo[] = spendable.map(utxo => {
        return {
          txid: utxo.txid,
          vout: utxo.vout,
          amount: btcToSats(utxo.amount),
          address: utxo.address,
        }
      })

      utxoSet = Utils.selectUtxosForAmount(amount, utxosIn, feeRate)

      // TODO(tibo): locking utxos using the bitcoind wallet is not ideal:
      // 1. Information lost on wallet restart
      // 2. Doesn't decrease balance
      // Ideally should use wallet lock + store information locally.
      if (lockUtxos) {
        success = await this.lockUtxos(utxoSet)
      }
    } while (success !== true)

    return utxoSet
  }

  public async lockUtxos(utxos: Utxo[], unlock = false): Promise<boolean> {
    return this.getClient().lockUnspent(
      unlock,
      utxos.map(x => {
        return {
          txid: x.txid,
          vout: x.vout,
        }
      })
    )
  }

  public async generateBlocksToWallet(nbBlocks: number): Promise<void> {
    const address = await this.getClient().getNewAddress()
    await this.getClient().generateToAddress(nbBlocks, address)
  }

  public async sendToAddress(address: string, amount: number): Promise<void> {
    await this.getClient().sendToAddress(address, satsToBtc(amount))
  }

  public getNetwork(): BitcoinNetwork {
    return this.network
  }

  public async importAddress(address: string): Promise<void> {
    await this.getClient().importAddress(address, '', false)
  }

  public async importPublicKey(pubKey: string): Promise<void> {
    await this.getClient().importPubKey(pubKey, '', false)
  }
}
