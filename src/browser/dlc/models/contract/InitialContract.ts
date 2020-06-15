import { Contract } from '../../../../common/models/dlc/Contract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import { StatelessContract } from './StatelessContract'
import { OracleInfo } from '../../../../common/models/dlc/OracleInfo'

export interface InitialContract extends StatelessContract<Contract> {
  readonly state: ContractState.Initial
  readonly id: string
  readonly oracleInfo: OracleInfo
  readonly isLocalParty: boolean
}
