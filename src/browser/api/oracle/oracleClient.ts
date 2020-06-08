import axios, { AxiosError, AxiosInstance } from 'axios'
import { DateTime, Duration, ToISOTimeOptions } from 'luxon'
import {
  OracleAssetConfiguration,
  OracleRvalue,
  OracleSignature,
} from '../../../common/oracle/oracle'
import { Failable, isSuccessful } from '../../../common/utils/failable'
import {
  APIAssetConfig,
  APIAssets,
  APIError,
  APIOraclePublicKey,
  APIRvalue,
  APISignature,
} from './apitypes'
import { OracleConfig } from './oracleConfig'
import { OracleError } from './oracleError'

export const HeaderRequestIDTag = 'Request-Id'
export type FailableOracle<R> = Failable<R, OracleFail>
export interface OracleFail {
  requestID: string
  httpStatusCode: number
  code: number
  message: string
}

type APIDLCRoute<T extends APIRvalue | APISignature> = T extends APISignature
  ? 'signature'
  : 'rvalue'

export interface OracleClientApi {
  getOraclePublicKey(): Promise<FailableOracle<string>>
  getAssets(): Promise<FailableOracle<string[]>>
  getOracleConfig(
    assetID: string
  ): Promise<FailableOracle<OracleAssetConfiguration>>
  getRvalue(
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<OracleRvalue>>
  getSignature(
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<OracleSignature>>
}

export default class OracleClient implements OracleClientApi {
  private readonly _httpClient: AxiosInstance

  constructor(config: OracleConfig) {
    this._httpClient = axios.create({
      baseURL: config.baseUrl,
    })
  }

  async getOraclePublicKey(): Promise<FailableOracle<string>> {
    const resp = await this.get<APIOraclePublicKey>('oracle')
    if (isSuccessful(resp)) {
      // transform response data
      const apiResp = resp.value
      return {
        success: true,
        value: apiResp.publicKey,
      }
    } else {
      return resp
    }
  }

  async getAssets(): Promise<FailableOracle<string[]>> {
    return this.get<APIAssets>('asset')
  }

  async getOracleConfig(
    assetID: string
  ): Promise<FailableOracle<OracleAssetConfiguration>> {
    const resp = await this.get<APIAssetConfig>(`asset/${assetID}/config`)

    if (isSuccessful(resp)) {
      // transform response data
      const apiResp = resp.value
      return {
        success: true,
        value: {
          frequency: Duration.fromISO(apiResp.frequency),
          range: Duration.fromISO(apiResp.range),
        },
      }
    } else {
      return resp
    }
  }

  async getRvalue(
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<OracleRvalue>> {
    const resp = await this.getDLCData<APIRvalue>('rvalue', assetID, date)
    if (isSuccessful(resp)) {
      // transform response data
      const apiResp = resp.value
      return {
        success: true,
        value: {
          publishDate: DateTime.fromISO(apiResp.publishDate, { setZone: true }),
          rvalue: apiResp.rvalue,
          assetID: apiResp.assetID,
        },
      }
    } else {
      return resp
    }
  }

  async getSignature(
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<OracleSignature>> {
    const resp = await this.getDLCData<APISignature>('signature', assetID, date)
    if (isSuccessful(resp)) {
      // transform response data
      const apiResp = resp.value
      return {
        success: true,
        value: {
          publishDate: DateTime.fromISO(apiResp.publishDate, { setZone: true }),
          rvalue: apiResp.rvalue,
          assetID: apiResp.assetID,
          signature: apiResp.signature,
          value: apiResp.value,
        },
      }
    } else {
      return resp
    }
  }

  private getDLCData<T extends APIRvalue | APISignature>(
    route: APIDLCRoute<T>,
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<T>> {
    const utcDate = date
    const options: ToISOTimeOptions = {
      suppressMilliseconds: true,
    }
    console.log('HAHAHA')
    return this.get<T>(`asset/${assetID}/${route}/${utcDate.toISO(options)}`)
  }

  private async get<T>(url: string): Promise<FailableOracle<T>> {
    try {
      console.log(url)
      console.log('Base url:')
      console.log(this._httpClient.defaults.baseURL)
      const resp = await axios.get(url, { baseURL: 'http://3.115.1.105:443/' })
      return { success: true, value: resp.data }
    } catch (err) {
      if (!err.isAxiosError) {
        throw err
      }
      const errResponse = err as AxiosError<APIError>
      if (!errResponse.response) {
        throw new OracleError(errResponse)
      }
      const resp = errResponse.response

      let message = resp.data.message
      message += resp.data.cause ? '\n' + resp.data.cause : ''

      return {
        success: false,
        error: {
          httpStatusCode: resp.status,
          requestID: resp.headers['Request-Id'] as string,
          code: resp.data.errorCode,
          message: message,
        },
      }
    }
  }
}
