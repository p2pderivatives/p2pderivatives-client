import { Utxo, UtxoSimple } from './Utxo'

export interface PartyInputs {
  readonly fundPublicKey: string
  readonly sweepPublicKey: string
  readonly changeAddress: string
  readonly finalAddress: string
  readonly utxos: Utxo[]
}

export interface PartyInputsSimple {
  readonly fundPublicKey: string
  readonly sweepPublicKey: string
  readonly changeAddress: string
  readonly finalAddress: string
  readonly utxos: UtxoSimple[]
}
