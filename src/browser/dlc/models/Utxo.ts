import Amount from '../../../common/models/dlc/Amount'

export interface Utxo {
  readonly txid: string
  readonly vout: number
  readonly amount: Amount
  readonly address: string
}
