import { InitialContract } from './InitialContract'
import { PartyInputs } from '../PartyInputs'
import { PrivateParams } from './PrivateParams'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { StatelessContract } from './StatelessContract'

export interface OfferedContract extends StatelessContract<InitialContract> {
  readonly state: ContractState.Offered
  readonly localPartyInputs: PartyInputs
  readonly privateParams: PrivateParams
}
