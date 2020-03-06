import Client, {
  ClientConstructorOption,
  WalletTransaction,
  ListUnspentOptions,
  UnspentTxInfo,
} from 'bitcoin-core'

interface BitcoinDConfiguration {
  rpcUser: string
  rpcPassword: string
  host?: string
  port?: number
  network?: 'mainnet' | 'regtest' | 'testnet'
  wallet?: string
  walletPassphrase?: string
}

export default class BitcoinDClient {
  private rpcUser = ''
  private rpcPassword = ''
  private host = ''
  private port = 8332
  private network: 'mainnet' | 'regtest' | 'testnet' = 'mainnet'
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

  public async configure(options: BitcoinDConfiguration): Promise<void> {
    const clientConfig: ClientConstructorOption = {}
    if (options.rpcUser) {
      this.rpcUser = options.rpcUser
      clientConfig['username'] = this.rpcUser
    }
    if (options.rpcPassword) {
      this.rpcPassword = options.rpcPassword
      clientConfig['password'] = this.rpcPassword
    }
    if (options.host) {
      this.host = options.host
      clientConfig['host'] = this.host
    }
    if (options.port) {
      this.port = options.port
      clientConfig['port'] = this.port
    }
    if (options.network) {
      this.network = options.network
      clientConfig['network'] = this.network
    }
    if (options.wallet) {
      this.wallet = options.wallet
      clientConfig['wallet'] = this.wallet
    }
    if (options.walletPassphrase) {
      this.walletPassphrase = options.walletPassphrase
    }

    this.client = new Client(clientConfig)
    if (this.wallet) {
      // load wallet will fail if already loaded
      try {
        await this.client.loadWallet(this.wallet)
      } catch (e) {
        // do nothing
      }
    }
    if (options.walletPassphrase) {
      await this.client.walletPassphrase(this.walletPassphrase, 60)
    }
    // this will crash if bitcoind is not running
    await this.client.getNetworkInfo()
  }

  public async sendRawTransaction(
    hexString: string,
    allowHighFees = false
  ): Promise<void> {
    return await this.getClient().sendRawTransaction(hexString, allowHighFees)
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
    return await this.getClient().getBalance(
      '*',
      minConfirmations,
      includeWatchOnly
    )
  }
}
