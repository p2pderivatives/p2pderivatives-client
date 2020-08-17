import axios, { AxiosError, AxiosInstance } from 'axios'
import { DateTime, Duration, ToISOTimeOptions } from 'luxon'
import {
  OracleAssetConfiguration,
  OracleRvalue,
  OracleSignature,
} from '../../../common/models/oracle/oracle'
import {
  FailableAsync,
  isSuccessful,
  Success,
} from '../../../common/utils/failable'
import {
  APIAssetConfig,
  APIAssets,
  APIError,
  APIOraclePublicKey,
  APIRvalue,
  APISignature,
} from './apitypes'
import { OracleConfig } from './oracleConfig'
import { UnknownServerError } from './unknownServerError'

export const HeaderRequestIDTag = 'Request-Id'
export type OracleFailbleAsync<R> = FailableAsync<R, OracleError>
export interface OracleError {
  requestID: string
  httpStatusCode: number
  code: number
  message: string
}

export interface OracleClientApi {
  getOraclePublicKey(): OracleFailbleAsync<string>
  getAssets(): OracleFailbleAsync<string[]>
  getOracleConfig(assetID: string): OracleFailbleAsync<OracleAssetConfiguration>
  getRvalue(assetID: string, date: DateTime): OracleFailbleAsync<OracleRvalue>
  getSignature(
    assetID: string,
    date: DateTime
  ): OracleFailbleAsync<OracleSignature>
}

export const ROUTE_ORACLE_PUBLIC_KEY = 'oracle/publickey'
export const ROUTE_ASSET = 'asset'

type APIDLCRoute<T extends APIRvalue | APISignature> = T extends APISignature
  ? 'signature'
  : 'rvalue'

export default class OracleClient implements OracleClientApi {
  private readonly _httpClient: AxiosInstance

  constructor(config: OracleConfig) {
    this._httpClient = axios.create({
      baseURL: config.baseUrl,
    })
  }

  async getOraclePublicKey(): OracleFailbleAsync<string> {
    const resp = await this.get<APIOraclePublicKey>(ROUTE_ORACLE_PUBLIC_KEY)
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

  async getAssets(): OracleFailbleAsync<string[]> {
    return this.get<APIAssets>(ROUTE_ASSET)
  }

  async getOracleConfig(
    assetID: string
  ): OracleFailbleAsync<OracleAssetConfiguration> {
    const resp = await this.get<APIAssetConfig>(`asset/${assetID}/config`)

    if (isSuccessful(resp)) {
      // transform response data
      const apiResp = resp.value
      return {
        success: true,
        value: {
          startDate: DateTime.fromISO(apiResp.startDate, { setZone: true }),
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
  ): OracleFailbleAsync<OracleRvalue> {
    const resp = await this.getDLCData<APIRvalue>('rvalue', assetID, date)
    if (isSuccessful(resp)) {
      // transform response data
      const apiResp = resp.value
      return {
        success: true,
        value: {
          publishDate: DateTime.fromISO(apiResp.publishDate, { setZone: true }),
          oraclePublicKey: apiResp.oraclePublicKey,
          rvalue: apiResp.rvalue,
          assetID: apiResp.asset,
        },
      }
    } else {
      return resp
    }
  }

  async getSignature(
    assetID: string,
    date: DateTime
  ): OracleFailbleAsync<OracleSignature> {
    const resp = await this.getDLCData<APISignature>('signature', assetID, date)
    if (isSuccessful(resp)) {
      // transform response data
      const apiResp = resp.value
      return {
        success: true,
        value: {
          publishDate: DateTime.fromISO(apiResp.publishDate, { setZone: true }),
          oraclePublicKey: apiResp.oraclePublicKey,
          rvalue: apiResp.rvalue,
          assetID: apiResp.asset,
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
  ): OracleFailbleAsync<T> {
    const utcDate = date.toUTC()
    const options: ToISOTimeOptions = {
      suppressMilliseconds: true,
    }
    return this.get<T>(`asset/${assetID}/${route}/${utcDate.toISO(options)}`)
  }

  private async get<T>(url: string): OracleFailbleAsync<T> {
    try {
      const resp = await this._httpClient.get<T>(url)
      return Success(resp.data)
    } catch (err) {
      if (!err.isAxiosError) {
        throw err
      }
      const errResponse = err as AxiosError<APIError>
      if (!errResponse.response) {
        throw new UnknownServerError(errResponse)
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
