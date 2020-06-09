import { DateTime, Duration } from 'luxon'

export interface OracleAssetConfiguration {
  frequency: Duration
  range: Duration
}

export interface OracleRvalue {
  publishDate: DateTime
  assetID: string
  rvalue: string
}

export interface OracleSignature extends OracleRvalue {
  signature: string
  value: string
}