export interface Utxo {
  readonly txid: string
  readonly vout: number
  readonly amount: number
  readonly address: string
}
