import { ContractState } from '../../../../common/models/dlc/ContractState'
import { MaturedContract } from './MaturedContract'
import { StatelessContract } from './StatelessContract'

export interface UnilateralClosedByOtherContract
  extends StatelessContract<MaturedContract> {
  readonly state: ContractState.UnilateralClosedByOther
  readonly finalCetTxId: string
}
