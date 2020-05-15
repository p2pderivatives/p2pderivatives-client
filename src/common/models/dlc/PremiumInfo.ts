import Amount from './Amount'

export interface PremiumInfo {
  readonly premiumAmount: Amount
  readonly localPays: boolean
}
