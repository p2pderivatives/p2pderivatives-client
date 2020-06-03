import {
  OracleClientApi,
  OracleError,
} from '../src/browser/api/oracle/oracleClient'
import {
  OracleAssetConfiguration,
  OracleRvalue,
  OracleSignature,
} from '../src/common/oracle/oracle'
import { DateTime } from 'luxon'

export class OracleClientMock implements OracleClientApi {
  constructor(
    readonly publicKey: string,
    readonly rValue: string,
    readonly signature: string,
    readonly publishDate: DateTime,
    readonly assetId: string,
    readonly outcomeValue: string
  ) {}

  getOraclePublicKey(): Promise<
    | Readonly<{
        success: false
        error: OracleError
      }>
    | Readonly<{ success: true; value: string }>
  > {
    return Promise.resolve({ success: true, value: this.publicKey })
  }
  getAssets(): Promise<
    | Readonly<{
        success: false
        error: OracleError
      }>
    | Readonly<{ success: true; value: string[] }>
  > {
    throw new Error('Method not implemented.')
  }
  getOracleConfig(
    assetID: string
  ): Promise<
    | Readonly<{
        success: false
        error: OracleError
      }>
    | Readonly<{
        success: true
        value: OracleAssetConfiguration
      }>
  > {
    throw new Error('Method not implemented.')
  }
  getRvalue(
    assetID: string,
    date: Date | DateTime
  ): Promise<
    | Readonly<{
        success: false
        error: OracleError
      }>
    | Readonly<{
        success: true
        value: OracleRvalue
      }>
  > {
    return Promise.resolve({
      success: true,
      value: {
        publishDate: this.publishDate,
        assetID: this.assetId,
        rvalue: this.rValue,
      },
    })
  }
  getSignature(
    assetID: string,
    date: Date | DateTime
  ): Promise<
    | Readonly<{
        success: false
        error: OracleError
      }>
    | Readonly<{
        success: true
        value: OracleSignature
      }>
  > {
    return Promise.resolve({
      success: true,
      value: {
        signature: this.signature,
        publishDate: this.publishDate,
        assetID: this.assetId,
        value: this.outcomeValue,
        rvalue: this.rValue,
      },
    })
  }
}
