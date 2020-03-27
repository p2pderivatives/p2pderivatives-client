export type BitcoinNetwork = 'mainnet' | 'regtest' | 'testnet'

export interface BitcoinDConfig {
  host?: string
  port?: number
  network?: BitcoinNetwork
  rpcUsername?: string
  rpcPassword?: string
  wallet?: string
  walletPassphrase?: string
}
