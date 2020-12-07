import { DateTime, Duration } from 'luxon'

export interface OracleAssetConfiguration {
  startDate: DateTime
  frequency: Duration
  range: Duration
}
