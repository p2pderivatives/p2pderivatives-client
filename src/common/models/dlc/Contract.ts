import { Outcome } from './Outcome'
import { ContractState } from './ContractState'
import { OracleInfo } from '../../../common/models/dlc/OracleInfo'

export interface Contract {
  readonly state: ContractState
  readonly id?: string
  readonly counterPartyName: string
  readonly localCollateral: number
  readonly remoteCollateral: number
  readonly outcomes: ReadonlyArray<Outcome>
  readonly maturityTime: number
  readonly feeRate: number
  readonly oracleInfo?: OracleInfo
  readonly premiumAmount?: number
  readonly isLocalParty?: boolean
  readonly finalOutcome?: Outcome
}
