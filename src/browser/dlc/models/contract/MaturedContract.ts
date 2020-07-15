import { SignedContract } from './SignedContract'
import { Outcome } from '../../../../common/models/dlc/Outcome'
import { ContractState } from '../../../../common/models/dlc/Contract'
import { StatelessContract } from './StatelessContract'

export interface MaturedContract extends StatelessContract<SignedContract> {
  readonly state: ContractState.Mature
  readonly finalOutcome: Outcome
  readonly oracleSignature: string
  readonly otherPartyFinalCetId: string
}
