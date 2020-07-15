import { SignedContract } from './SignedContract'
import { ContractState } from '../../../../common/models/dlc/Contract'
import { StatelessContract } from './StatelessContract'

export interface BroadcastContract extends StatelessContract<SignedContract> {
  readonly state: ContractState.Broadcast
}
