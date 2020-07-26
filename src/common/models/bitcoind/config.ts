export type BitcoinNetwork = 'mainnet' | 'testnet' | 'regtest'
export interface BitcoinDConfig {
  host?: string
  port?: number
  network?: BitcoinNetwork
  rpcUsername?: string
  rpcPassword?: string
  wallet?: string
  walletPassphrase?: string
}
