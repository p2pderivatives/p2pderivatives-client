import { MaturedContract } from './MaturedContract'
import { StatelessContract } from './StatelessContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'

export interface MutualCloseProposedContract
  extends StatelessContract<MaturedContract> {
  readonly state: ContractState.MutualCloseProposed
  readonly mutualCloseTx: string
  readonly mutualCloseTxId: string
  readonly ownMutualClosingSignature: string
  readonly proposeTimeOut: number
}
