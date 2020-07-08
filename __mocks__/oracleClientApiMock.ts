import { DateTime } from 'luxon'
import {
  FailableOracle,
  OracleClientApi,
} from '../src/browser/api/oracle/oracleClient'
import {
  OracleAssetConfiguration,
  OracleRvalue,
  OracleSignature,
} from '../src/common/oracle/oracle'

export class OracleClientMock implements OracleClientApi {
  constructor(
    readonly publicKey: string,
    readonly rValue: string,
    readonly signature: string,
    readonly publishDate: DateTime,
    readonly assetId: string,
    readonly outcomeValue: string
  ) {}

  getOraclePublicKey(): Promise<FailableOracle<string>> {
    return Promise.resolve({ success: true, value: this.publicKey })
  }
  getAssets(): Promise<FailableOracle<string[]>> {
    throw new Error('Method not implemented.')
  }
  getOracleConfig(
    assetID: string
  ): Promise<FailableOracle<OracleAssetConfiguration>> {
    throw new Error('Method not implemented.')
  }
  getRvalue(
    assetID: string,
    date: Date | DateTime
  ): Promise<FailableOracle<OracleRvalue>> {
    return Promise.resolve({
      success: true,
      value: {
        oraclePublicKey: this.publicKey,
        publishDate: this.publishDate,
        assetID: this.assetId,
        rvalue: this.rValue,
      },
    })
  }
  getSignature(
    assetID: string,
    date: Date | DateTime
  ): Promise<FailableOracle<OracleSignature>> {
    return Promise.resolve({
      success: true,
      value: {
        signature: this.signature,
        publishDate: this.publishDate,
        assetID: this.assetId,
        value: this.outcomeValue,
        rvalue: this.rValue,
        oraclePublicKey: this.publicKey,
      },
    })
  }
}
