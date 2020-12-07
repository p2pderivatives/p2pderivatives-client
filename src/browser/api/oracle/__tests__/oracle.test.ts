import axios, { AxiosError } from 'axios'
import { DateTime, Duration } from 'luxon'
import { OracleAssetConfiguration } from '../../../../common/oracle/oracle'
import { isFailed, isSuccessful } from '../../../../common/utils/failable'
import { OracleAnnouncement } from '../../../dlc/models/oracle/oracleAnnouncement'
import { OracleAttestation } from '../../../dlc/models/oracle/oracleAttestation'
import {
  APIAnnouncement,
  APIAssetConfig,
  APIAssets,
  APIAttestation,
  APIError,
  APIOraclePublicKey,
} from '../apitypes'
import OracleClient, {
  FailableOracle,
  HeaderRequestIDTag,
  OracleError,
  ROUTE_ASSET,
  ROUTE_ORACLE_PUBLIC_KEY,
} from '../oracleClient'

// setup mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
mockedAxios.create = jest.fn(() => mockedAxios)

describe('Oracle Client', () => {
  let client: OracleClient
  beforeEach(() => {
    mockedAxios.get.mockRestore()
    client = new OracleClient({ name: 'olivia', uri: 'http://try' })
  })

  test('Get Oracle public key', async () => {
    // arrange
    const expectedRoute = ROUTE_ORACLE_PUBLIC_KEY
    const expected = 'test-public-key'
    const mockValue: APIOraclePublicKey = {
      publicKey: expected,
    }
    mockedAxios.get.mockResolvedValueOnce({ data: mockValue })

    // act
    const result = await client.getOraclePublicKey()

    // assert
    expect(mockedAxios.get).toHaveBeenCalledWith(expectedRoute)
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual).toEqual(expected)
    }
  })
  test('Get asset list', async () => {
    // arrange
    const expectedRoute = ROUTE_ASSET
    const expected = ['assetA', 'assetB']
    const mockValue: APIAssets = [...expected]
    mockedAxios.get.mockResolvedValueOnce({ data: mockValue })

    // act
    const result = await client.getAssets()

    // assert
    expect(mockedAxios.get).toHaveBeenCalledWith(expectedRoute)
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual).toEqual(expected)
    }
  })

  test('Get oracle config', async () => {
    // arrange
    const assetID = 'testasset'
    const startDate = DateTime.utc()
    const mockValue: APIAssetConfig = {
      startDate: startDate.toISO(),
      frequency: 'PT1H',
      range: 'P2MT',
      base: 2,
      nbDigits: 20,
    }
    const expected: OracleAssetConfiguration = {
      startDate: DateTime.fromISO(mockValue.startDate, { setZone: true }),
      frequency: Duration.fromISO(mockValue.frequency),
      range: Duration.fromISO(mockValue.range),
    }

    const expectedRoute = `asset/${assetID}/config`
    mockedAxios.get.mockResolvedValueOnce({ data: mockValue })

    // act
    const result = await client.getOracleConfig(assetID)

    // assert
    expect(mockedAxios.get).toHaveBeenCalledWith(expectedRoute)
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual).toEqual(expected)
    }
  })

  test('Get asset announcement', async () => {
    // arrange
    const testAsset = 'assetA'
    const paramDate = DateTime.utc(2020, 10, 2, 1, 1, 1, 0)
    const mockValue: APIAnnouncement = {
      oraclePublicKey: 'oracle',
      announcementSignature: 'a',
      oracleEvent: {
        nonces: ['test'],
        eventId: '1',
        eventMaturity: DateTime.utc(2020, 10, 2, 1, 1, 1).toISO(),
        eventDescriptor: {
          base: 2,
          isSigned: false,
          unit: 'btcusd',
          precision: 0,
        },
      },
    }
    const expected: OracleAnnouncement = {
      oraclePublicKey: mockValue.oraclePublicKey,
      announcementSignature: 'a',
      oracleEvent: {
        nonces: ['test'],
        eventId: '1',
        eventMaturity: DateTime.utc(2020, 10, 2, 1, 1, 1).toISO(),
        eventDescriptor: {
          base: 2,
          isSigned: false,
          unit: 'btcusd',
          precision: 0,
        },
      },
    }
    const expectedRoute = `asset/${testAsset}/announcement/${paramDate.toISO({
      suppressMilliseconds: true,
    })}`
    mockedAxios.get.mockResolvedValueOnce({ data: mockValue })

    // act
    const result = await client.getAnnouncement(testAsset, paramDate)

    // assert
    expect(mockedAxios.get).toHaveBeenCalledWith(expectedRoute)
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual).toEqual(expected)
    }
  })

  test('Get asset attestation', async () => {
    // arrange
    const testAsset = 'assetA'
    const paramDate = DateTime.utc()
    const mockValue: APIAttestation = {
      signatures: ['test-signature'],
      values: ['test-value'],
      eventId: '1',
    }
    const expected: OracleAttestation = {
      signatures: ['test-signature'],
      values: ['test-value'],
      eventId: '1',
    }
    const expectedRoute = `asset/${testAsset}/attestation/${paramDate.toISO()}`
    mockedAxios.get.mockResolvedValueOnce({ data: mockValue })

    // act
    const result = await client.getAttestation(testAsset, paramDate)

    // assert
    expect(mockedAxios.get).toHaveBeenCalledWith(expectedRoute)
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual).toEqual(expected)
    }
  })

  test('Catch and returns API error', async () => {
    // arrange
    const expectedRequestID = 'someId'
    const expectedStatusCode = 500
    const mockValue: APIError = {
      errorCode: 5,
      message: 'some test error',
      cause: 'Some cause',
    }

    const expected: OracleError = {
      httpStatusCode: expectedStatusCode,
      requestID: expectedRequestID,
      code: mockValue.errorCode,
      message: mockValue.message + `\n` + mockValue.cause,
    }

    const headers: { [key: string]: string } = {}
    headers[HeaderRequestIDTag] = expectedRequestID
    const mockedAxiosError: Partial<AxiosError<APIError>> = {
      isAxiosError: true,
      response: {
        data: mockValue,
        headers: headers,
        status: expectedStatusCode,
        statusText: '', // ignored
        config: {}, // ignored
      },
    }
    mockedAxios.get.mockRejectedValue(mockedAxiosError)

    // act
    const results: FailableOracle<unknown>[] = [
      await client.getOraclePublicKey(),
      await client.getAssets(),
      await client.getOracleConfig(''),
      await client.getAnnouncement('', DateTime.utc()),
      await client.getAttestation('', DateTime.utc()),
    ]

    // assert
    expect(mockedAxios.get).toHaveBeenCalledTimes(results.length)
    results.forEach(res => {
      expect(isFailed(res)).toBeTruthy()
      if (isFailed(res)) {
        const actual = res.error
        expect(actual).toEqual(expected)
      }
    })
  })
})
