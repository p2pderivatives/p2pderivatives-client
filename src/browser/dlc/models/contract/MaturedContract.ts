import { ContractState } from '../../../../common/models/dlc/Contract'
import { Outcome } from '../../../../common/models/dlc/Outcome'
import { SignedContract } from './SignedContract'
import { StatelessContract } from './StatelessContract'

export interface MaturedContract extends StatelessContract<SignedContract> {
  readonly state: ContractState.Mature
  readonly finalOutcome: Outcome
  readonly oracleSignatures: string[]
  readonly outcomeValues: string[]
  readonly finalCetId: string
  readonly finalSignedCetHex: string
}
