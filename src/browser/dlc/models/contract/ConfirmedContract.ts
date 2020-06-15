import { SignedContract } from './SignedContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { StatelessContract } from './StatelessContract'

export interface ConfirmedContract extends StatelessContract<SignedContract> {
  readonly state: ContractState.Confirmed
}
