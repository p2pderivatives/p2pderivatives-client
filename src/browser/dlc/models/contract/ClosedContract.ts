import { ContractState } from '../../../../common/models/dlc/Contract'
import { MaturedContract } from './MaturedContract'
import { StatelessContract } from './StatelessContract'

export interface ClosedContract extends StatelessContract<MaturedContract> {
  readonly state: ContractState.Closed
  readonly closingTxHex?: string
  readonly closingTxId?: string
}
