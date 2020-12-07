import * as cfdjs from 'cfd-js'
import level from 'level-test'
import { LevelUp } from 'levelup'
import { DateTime } from 'luxon'
import { TEST_BITCOIND_CONFIG } from '../../services/bitcoind/env'
import BitcoinDClient from '../../src/browser/api/bitcoind'
import { OracleAnnouncement } from '../../src/browser/dlc/models/oracle/oracleAnnouncement'
import { LevelContractRepository } from '../../src/browser/dlc/repository/LevelContractRepository'
import { DlcService } from '../../src/browser/dlc/service/DlcService'
import * as Utils from '../../src/browser/dlc/utils/CfdUtils'
import { ContractUpdater } from '../../src/browser/dlc/utils/ContractUpdater'
import { DlcEventHandler } from '../../src/browser/dlc/utils/DlcEventHandler'
import { Contract, ContractState } from '../../src/common/models/dlc/Contract'
import { isSuccessful } from '../../src/common/utils/failable'

const localParty = 'alice'
const remoteParty = 'bob'
const oneBtcParty = 'carol'

export interface PartyContext {
  readonly name: string
  readonly client: BitcoinDClient
  readonly db: LevelUp
  readonly dlcService: DlcService
  readonly contractUpdater: ContractUpdater
  readonly eventHandler: DlcEventHandler
}

export interface OracleContext {
  readonly oraclePublicKey: string
  readonly oraclePrivateKey: string
  readonly oracleKValues: string[]
  readonly oracleRValues: string[]
  readonly signatures: string[]
  readonly outcomeValues: string[]
  readonly announcement: OracleAnnouncement
}

export async function createWallets(): Promise<void> {
  const client = new BitcoinDClient()
  await client.configure({
    ...TEST_BITCOIND_CONFIG,
    wallet: undefined,
    walletPassphrase: undefined,
  })
  await client.createWallet(localParty, localParty)
  await client.createWallet(remoteParty, remoteParty)
  await client.createWallet(oneBtcParty, oneBtcParty)
}

export function getNewMockedDecompositionOracleContext(
  nbDigits: number,
  base: number,
  outcomeValues: string[]
): OracleContext {
  const oracleKeyPair = Utils.createSchnorrKeyPair()
  const oraclePrivateKey = oracleKeyPair.privkey
  const oraclePublicKey = oracleKeyPair.pubkey
  const oracleKValues = []
  const oracleRValues = []
  const signatures = []

  for (let i = 0; i < nbDigits; i++) {
    const krPair = Utils.createSchnorrKeyPair()
    oracleKValues.push(krPair.privkey)
    oracleRValues.push(krPair.pubkey)
    signatures.push(
      cfdjs.SchnorrSign({
        privkey: oraclePrivateKey,
        nonceOrAux: krPair.privkey,
        isNonce: true,
        message: outcomeValues[i],
      }).hex
    )
  }

  const announcement: OracleAnnouncement = {
    announcementSignature: '',
    oraclePublicKey: oraclePublicKey,
    oracleEvent: {
      nonces: oracleRValues,
      eventMaturity: DateTime.utc().toISODate(),
      eventId: 'id',
      eventDescriptor: {
        base,
        isSigned: false,
        unit: 'btcusd',
        precision: 0,
      },
    },
  }
  return {
    oraclePublicKey,
    oraclePrivateKey,
    oracleKValues: oracleKValues,
    oracleRValues: oracleRValues,
    outcomeValues,
    signatures,
    announcement,
  }
}

export function getNewMockedEnumerationOracleContext(
  outcomes: string[]
): OracleContext {
  const oracleKeyPair = Utils.createSchnorrKeyPair()
  const oraclePrivateKey = oracleKeyPair.privkey
  const oraclePublicKey = oracleKeyPair.pubkey
  const kRPair = Utils.createSchnorrKeyPair()
  const oracleKValue = kRPair.privkey
  const oracleRValue = kRPair.pubkey
  const signature = cfdjs.SchnorrSign({
    privkey: oraclePrivateKey,
    nonceOrAux: oracleKValue,
    isNonce: true,
    message: outcomes[0],
  }).hex
  const announcement: OracleAnnouncement = {
    announcementSignature: '',
    oraclePublicKey: oraclePublicKey,
    oracleEvent: {
      nonces: [oracleRValue],
      eventMaturity: DateTime.utc().toISODate(),
      eventId: 'id',
      eventDescriptor: {
        outcomes,
      },
    },
  }
  return {
    oraclePublicKey,
    oraclePrivateKey,
    oracleKValues: [oracleKValue],
    oracleRValues: [oracleRValue],
    outcomeValues: [outcomes[0]],
    signatures: [signature],
    announcement,
  }
}

export async function getNewPartyContext(
  partyName: string,
  generateToWallet = true
): Promise<PartyContext> {
  const options = {
    keyEncoding: 'hex',
    valueEncoding: 'json',
  }
  const client = new BitcoinDClient()
  await client.configure({
    ...TEST_BITCOIND_CONFIG,
    wallet: partyName,
    walletPassphrase: partyName,
  })
  if (generateToWallet) {
    await client.generateBlocksToWallet(110)
  }
  const db = level({ mem: true })(options)
  const repository = new LevelContractRepository(db)
  const dlcService = new DlcService(repository)
  const contractUpdater = new ContractUpdater(client)
  const eventHandler = new DlcEventHandler(contractUpdater, dlcService)

  return {
    name: partyName,
    client,
    db,
    dlcService,
    contractUpdater,
    eventHandler,
  }
}

export async function assertContractState(
  dlcService: DlcService,
  contractId: string,
  expectedState: ContractState
): Promise<Contract> {
  const result = await dlcService.getContract(contractId)

  if (!isSuccessful(result)) {
    throw result.error
  }

  const value = result.value

  expect(value.state).toEqual(expectedState)

  return value
}
