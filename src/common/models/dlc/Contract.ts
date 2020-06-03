import Amount from './Amount'
import { Outcome } from './Outcome'
import { PremiumInfo } from './PremiumInfo'
import { ContractState } from './ContractState'
import { OracleInfo } from '../../../common/models/dlc/OracleInfo'
import { DateTime } from 'luxon'

export interface Contract {
  readonly state: ContractState
  readonly id: string
  readonly oracleInfo: OracleInfo
  readonly counterPartyName: string
  readonly localCollateral: Amount
  readonly remoteCollateral: Amount
  readonly outcomes: Outcome[]
  readonly maturityTime: DateTime
  readonly feeRate: number
  readonly premiumInfo?: PremiumInfo
}
