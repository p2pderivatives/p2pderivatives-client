import Amount from './Amount'

export interface Outcome {
  readonly message: string
  readonly local: Amount
  readonly remote: Amount
}
