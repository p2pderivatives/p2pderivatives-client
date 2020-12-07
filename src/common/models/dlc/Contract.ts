import { Outcome } from './Outcome'
import { OracleInfo } from '../../oracle/oracleInfo'

export enum ContractState {
  Initial = 1,
  Offered,
  Accepted,
  Rejected,
  Signed,
  Broadcast,
  Confirmed,
  Mature,
  Closed,
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
  readonly oracleInfo: OracleInfo
  readonly assetId: string
  readonly premiumAmount?: number
  readonly isLocalParty?: boolean
  readonly finalOutcome?: Outcome
  readonly outcomeValues?: string[]
}
