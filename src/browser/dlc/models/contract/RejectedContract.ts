import { ContractState } from '../../../../common/models/dlc/ContractState'
import { InitialContract } from './InitialContract'
import { StatelessContract } from './StatelessContract'

export interface RejectedContract extends StatelessContract<InitialContract> {
  readonly state: ContractState.Rejected
  readonly reason?: string
}
