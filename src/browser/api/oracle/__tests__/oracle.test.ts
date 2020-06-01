import axios, { AxiosError } from 'axios'
import { DateTime, Duration } from 'luxon'
import {
  OracleAssetConfiguration,
  OracleRvalue,
  OracleSignature,
} from '../../../../common/oracle/oracle'
import { isFailed, isSuccessful } from '../../../../common/utils/failable'
import {
  APIAssetConfig,
  APIAssets,
  APIError,
  APIOraclePublicKey,
  APIRvalue,
  APISignature,
} from '../apitypes'
import OracleClient, { FailableOracle, OracleFail } from '../oracleClient'

// setup mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
mockedAxios.create = jest.fn(() => mockedAxios)

describe('Oracle Client', () => {
  let client: OracleClient
  beforeEach(() => {
    mockedAxios.get.mockRestore()
    client = new OracleClient({ baseUrl: 'ignoredbymock' })
  })

  test('Get Oracle public key', async () => {
    // arrange
    const expectedRoute = 'oracle'
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
    const expectedRoute = 'asset'
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
    const mockValue: APIAssetConfig = {
      frequency: 'PT1H',
      range: 'P2MT',
    }
    const expected: OracleAssetConfiguration = {
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

  test('Get asset rvalue', async () => {
    // arrange
    const testAsset = 'assetA'
    const paramDate = DateTime.utc()
    const mockValue: APIRvalue = {
      publishDate: paramDate.toISO(),
      rvalue: 'test-rvalue',
      assetID: testAsset,
    }
    const expected: OracleRvalue = {
      publishDate: paramDate,
      rvalue: mockValue.rvalue,
      assetID: mockValue.assetID,
    }
    const expectedRoute = `asset/${testAsset}/rvalue/${paramDate.toISO()}`
    mockedAxios.get.mockResolvedValueOnce({ data: mockValue })

    // act
    const result = await client.getRvalue(testAsset, paramDate)

    // assert
    expect(mockedAxios.get).toHaveBeenCalledWith(expectedRoute)
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual).toEqual(expected)
    }
  })

  test('Get asset signature', async () => {
    // arrange
    const testAsset = 'assetA'
    const paramDate = DateTime.utc()
    const mockValue: APISignature = {
      assetID: testAsset,
      publishDate: paramDate.toISO(),
      rvalue: 'test-rvalue',
      signature: 'test-signature',
      value: 'test-value',
    }
    const expected: OracleSignature = {
      publishDate: paramDate,
      assetID: mockValue.assetID,
      rvalue: mockValue.rvalue,
      signature: mockValue.signature,
      value: mockValue.value,
    }
    const expectedRoute = `asset/${testAsset}/signature/${paramDate.toISO()}`
    mockedAxios.get.mockResolvedValueOnce({ data: mockValue })

    // act
    const result = await client.getSignature(testAsset, paramDate)

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

    const expected: OracleFail = {
      httpStatusCode: expectedStatusCode,
      requestID: expectedRequestID,
      code: mockValue.errorCode,
      message: mockValue.message + `\n` + mockValue.cause,
    }

    const mockedAxiosError: Partial<AxiosError<APIError>> = {
      isAxiosError: true,
      response: {
        data: mockValue,
        headers: { RequestID: expectedRequestID },
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
      await client.getRvalue('', DateTime.utc()),
      await client.getSignature('', DateTime.utc()),
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
