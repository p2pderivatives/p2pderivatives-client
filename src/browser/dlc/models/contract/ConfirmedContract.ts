import { SignedContract } from './SignedContract'
import { ContractState } from '../../../../common/models/dlc/Contract'
import { StatelessContract } from './StatelessContract'

export interface ConfirmedContract extends StatelessContract<SignedContract> {
  readonly state: ContractState.Confirmed
}
