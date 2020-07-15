import { ContractState } from '../../../../common/models/dlc/Contract'
import { MaturedContract } from './MaturedContract'
import { StatelessContract } from './StatelessContract'

export interface MutualClosedContract
  extends StatelessContract<MaturedContract> {
  readonly state: ContractState.MutualClosed
  readonly mutualCloseTx: string
  readonly mutualCloseTxId: string
  readonly mutualCloseSignature?: string
}
