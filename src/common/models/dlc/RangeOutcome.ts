import { Payout } from './Payout'

export interface RangeOutcome {
  readonly start: number
  readonly count: number
  readonly payout: Payout
}
