import { DateTime, Duration } from 'luxon'
import { TEST_ASSET_ID, TEST_ORACLE_CONFIG } from '../services/oracle/env'
import { OracleClient } from '../src/browser/api/oracle'
import { isSuccessful } from '../src/common/utils/failable'

describe('Oracle Client', () => {
  let client: OracleClient
  beforeEach(() => {
    client = new OracleClient(TEST_ORACLE_CONFIG)
  })

  test('Get Oracle public key', async () => {
    // act
    const result = await client.getOraclePublicKey()

    // assert
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual).toHaveLength(64)
    }
  })

  test('Get asset list', async () => {
    // act
    const result = await client.getAssets()

    // assert
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual.length).toBeGreaterThan(0)
    }
  })

  test('Get oracle config', async () => {
    // act
    const result = await client.getOracleConfig(TEST_ASSET_ID)

    // assert
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual.frequency).toBeDefined()
      expect(actual.range).toBeDefined()
      expect(actual.startDate).toBeDefined()
    }
  })

  test('Get asset announcement', async () => {
    // arrange
    const paramDate = DateTime.utc()

    // act
    const result = await client.getAnnouncement(TEST_ASSET_ID, paramDate)

    // assert
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual.oraclePublicKey).toBeDefined()
      expect(actual.oracleEvent.eventMaturity).toBeDefined()
      expect(actual.oracleEvent.eventDescriptor).toBeDefined()
      expect(actual.oracleEvent.nonces).toBeDefined()
    }
  })

  test('Get asset attestation', async () => {
    // arrange
    const paramDate = DateTime.utc().minus(Duration.fromISO('P1DT'))

    // act
    const result = await client.getAttestation(TEST_ASSET_ID, paramDate)

    // assert
    expect(isSuccessful(result)).toBeTruthy()
    if (isSuccessful(result)) {
      const actual = result.value
      expect(actual.signatures).toBeDefined()
      expect(actual.values).toBeDefined()
      expect(actual.eventId).toBeDefined()
    }
  })
})
