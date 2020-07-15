import { ContractState } from '../../../../common/models/dlc/Contract'
import { MaturedContract } from './MaturedContract'
import { StatelessContract } from './StatelessContract'

export interface UnilateralClosedContract
  extends StatelessContract<MaturedContract> {
  readonly state: ContractState.UnilateralClosed
  readonly finalCetTxId: string
  readonly closingTxHex?: string
  readonly closingTxId?: string
}
