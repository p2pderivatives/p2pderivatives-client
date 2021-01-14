import {
  AddressType,
  BitcoinRpcError,
  Client,
  ClientOption,
  ListUnspentOptions,
  UnspentTxInfo,
  WalletTransaction,
} from 'bitcoin-simple-rpc'
import { SocksProxyAgent } from 'socks-proxy-agent'
import {
  BitcoinDConfig,
  BitcoinNetwork,
} from '../../../common/models/ipc/BitcoinDConfig'
import { btcToSats, satsToBtc } from '../../../common/utils/conversion'
import { Utxo } from '../../dlc/models/Utxo'
import * as Utils from '../../dlc/utils/CfdUtils'

const P2WPKHMaxWitnessSize = 108

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
    if (options.network) {
      this.network = options.network
    }
    if (options.host) {
      this.host = options.host
    }
    if (options.port) {
      this.port = options.port
    } else {
      if (this.network === 'mainnet') this.port = 8332
      if (this.network === 'testnet') this.port = 18332
      if (this.network === 'regtest') this.port = 18443
    }

    const clientConfig: ClientOption = {
      baseURL: getBaseUrl(this.host, this.port),
    }

    if (this.host.includes('.onion')) {
      const proxy = options.sockProxy || 'socks5h://127.0.0.1:9050'
      clientConfig.httpAgent = new SocksProxyAgent(proxy)
      clientConfig.httpsAgent = new SocksProxyAgent(proxy)
    }

    if (options.rpcUsername && options.rpcPassword) {
      this.rpcUser = options.rpcUsername
      this.rpcPassword = options.rpcPassword
      clientConfig.auth = { username: this.rpcUser, password: this.rpcPassword }
    }

    const client = new Client(clientConfig)
    const walletList = await client.listWallets()
    if (options.wallet || walletList.length > 1) {
      clientConfig.baseURL = clientConfig.baseURL.concat('wallet/')
      if (options.wallet) {
        this.wallet = options.wallet
        if (!walletList.includes(this.wallet)) {
          await client.loadWallet(this.wallet)
        }
        clientConfig.baseURL = clientConfig.baseURL.concat(this.wallet)
      }
      this.client = new Client(clientConfig)
    } else {
      this.client = client
    }

    if (options.walletPassphrase) {
      this.walletPassphrase = options.walletPassphrase
      await this.client.walletPassphrase(this.walletPassphrase, 1)
    } else {
      let isEncrypted = false
      try {
        await this.client.walletLock()
        isEncrypted = true
      } catch (error) {
        if (!(error instanceof BitcoinRpcError) || error.code !== -15) {
          throw new Error(`Unknown error: ${error}`)
        }
      }

      if (isEncrypted) {
        throw new Error('No passphrase was provided but wallet is encrypted.')
      }
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
    addressType: AddressType = 'bech32'
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
    if (this.walletPassphrase) {
      await this.getClient().walletPassphrase(this.walletPassphrase, 10)
    }
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
          //TODO(tibo): consider other type of addresses.
          maxWitnessLength: P2WPKHMaxWitnessSize,
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

export function getBaseUrl(host: string, port: number): string {
  if (host.startsWith('btcrpc')) {
    host = host.replace('btcrpc', 'http')
  }
  const queryPos = host.indexOf('?')
  if (queryPos >= 0) {
    host = host.substring(0, queryPos)
  }
  if (host.startsWith('http')) {
    return host
  }

  return `http://${host}:${port}/`
}
