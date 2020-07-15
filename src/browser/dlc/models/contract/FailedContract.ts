import { StatelessContract } from './StatelessContract'
import { InitialContract } from './InitialContract'
import { ContractState } from '../../../../common/models/dlc/Contract'

export interface FailedContract extends StatelessContract<InitialContract> {
  readonly state: ContractState.Failed
  readonly reason: string
}
