import { AcceptedContract } from './AcceptedContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { StatelessContract } from './StatelessContract'

export interface SignedContract extends StatelessContract<AcceptedContract> {
  readonly state: ContractState.Signed
  readonly fundTxSignatures: string[]
  readonly localUtxoPublicKeys: string[]
  readonly refundLocalSignature: string
  readonly localCetSignatures: string[]
}
