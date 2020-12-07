import axios, { AxiosError, AxiosInstance } from 'axios'
import { DateTime, Duration, ToISOTimeOptions } from 'luxon'
import { OracleAssetConfiguration } from '../../../common/oracle/oracle'
import { OracleInfo } from '../../../common/oracle/oracleInfo'
import { Failable, isSuccessful } from '../../../common/utils/failable'
import { OracleAnnouncement } from '../../dlc/models/oracle/oracleAnnouncement'
import { OracleAttestation } from '../../dlc/models/oracle/oracleAttestation'
import {
  APIAnnouncement,
  APIAssetConfig,
  APIAssets,
  APIAttestation,
  APIError,
  APIOraclePublicKey,
} from './apitypes'
import { UnknownServerError } from './unknownServerError'

export const HeaderRequestIDTag = 'Request-Id'
export type FailableOracle<R> = Failable<R, OracleError>
export interface OracleError {
  requestID: string
  httpStatusCode: number
  code: number
  message: string
}

export interface OracleClientApi {
  getOraclePublicKey(): Promise<FailableOracle<string>>
  getAssets(): Promise<FailableOracle<string[]>>
  getOracleConfig(
    assetID: string
  ): Promise<FailableOracle<OracleAssetConfiguration>>
  getAnnouncement(
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<OracleAnnouncement>>
  getAttestation(
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<OracleAttestation>>
}

export const ROUTE_ORACLE_PUBLIC_KEY = 'oracle/publickey'
export const ROUTE_ASSET = 'asset'

type APIDLCRoute<
  T extends APIAnnouncement | APIAttestation
> = T extends APIAttestation ? 'attestation' : 'announcement'

export default class OracleClient implements OracleClientApi {
  private readonly _httpClient: AxiosInstance

  constructor(info: OracleInfo) {
    this._httpClient = axios.create({
      baseURL: info.uri,
    })
  }

  async getOraclePublicKey(): Promise<FailableOracle<string>> {
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

  async getAssets(): Promise<FailableOracle<string[]>> {
    return this.get<APIAssets>(ROUTE_ASSET)
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
          startDate: DateTime.fromISO(apiResp.startDate, { setZone: true }),
          frequency: Duration.fromISO(apiResp.frequency),
          range: Duration.fromISO(apiResp.range),
        },
      }
    } else {
      return resp
    }
  }

  async getAnnouncement(
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<OracleAnnouncement>> {
    const resp = await this.getDLCData<APIAnnouncement>(
      'announcement',
      assetID,
      date
    )
    if (isSuccessful(resp)) {
      // transform response data
      const apiResp = resp.value
      return {
        success: true,
        value: {
          announcementSignature: apiResp.announcementSignature,
          oraclePublicKey: apiResp.oraclePublicKey,
          oracleEvent: {
            nonces: apiResp.oracleEvent.nonces,
            eventId: apiResp.oracleEvent.eventId,
            eventDescriptor: apiResp.oracleEvent.eventDescriptor,
            eventMaturity: apiResp.oracleEvent.eventMaturity,
          },
        },
      }
    } else {
      return resp
    }
  }

  async getAttestation(
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<OracleAttestation>> {
    const resp = await this.getDLCData<APIAttestation>(
      'attestation',
      assetID,
      date
    )
    if (isSuccessful(resp)) {
      // transform response data
      const apiResp = resp.value
      return {
        success: true,
        value: {
          eventId: apiResp.eventId,
          signatures: apiResp.signatures,
          values: apiResp.values,
        },
      }
    } else {
      return resp
    }
  }

  private getDLCData<T extends APIAnnouncement | APIAttestation>(
    route: APIDLCRoute<T>,
    assetID: string,
    date: DateTime
  ): Promise<FailableOracle<T>> {
    const utcDate = date.toUTC()
    const options: ToISOTimeOptions = {
      suppressMilliseconds: true,
    }
    return this.get<T>(`asset/${assetID}/${route}/${utcDate.toISO(options)}`)
  }

  private async get<T>(url: string): Promise<FailableOracle<T>> {
    try {
      const resp = await this._httpClient.get<T>(url)
      return { success: true, value: resp.data }
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
