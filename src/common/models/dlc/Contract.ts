import { Outcome } from './Outcome'
import { PremiumInfo } from './PremiumInfo'
import { OracleInfo } from '../../../common/models/dlc/OracleInfo'

export enum ContractState {
  Initial = 1,
  Offered,
  Accepted,
  Rejected,
  Signed,
  Broadcast,
  Confirmed,
  Mature,
  UnilateralClosed,
  UnilateralClosedByOther,
  MutualCloseProposed,
  MutualClosed,
  Refunded,
  Failed,
}

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
  readonly premiumInfo?: PremiumInfo
  readonly isLocalParty?: boolean
  readonly finalOutcome?: Outcome
}
