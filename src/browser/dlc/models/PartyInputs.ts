import { Utxo } from './Utxo'

export interface PartyInputs {
  readonly fundPublicKey: string
  readonly changeAddress: string
  readonly finalAddress: string
  readonly utxos: ReadonlyArray<Utxo>
  readonly premiumDest?: string
}
