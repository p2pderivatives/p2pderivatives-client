import * as cfddlcjs from 'cfd-dlc-js'
import level from 'level-test'
import { LevelUp } from 'levelup'
import { TEST_BITCOIND_CONFIG } from '../../services/bitcoind/env'
import BitcoinDClient from '../../src/browser/api/bitcoind'
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
  readonly oracleKValue: string
  readonly oracleRValue: string
  readonly signature: string
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

export function getNewMockedOracleContext(message: string): OracleContext {
  const oracleKeyPair = Utils.createKeyPair()
  const oraclePrivateKey = oracleKeyPair.privkey
  const oraclePublicKey = oracleKeyPair.pubkey
  const kRPair = Utils.createKeyPair()
  const oracleKValue = kRPair.privkey
  const oracleRValue = cfddlcjs.GetSchnorrPublicNonce({ kValue: oracleKValue })
    .hex
  const signature = cfddlcjs.SchnorrSign({
    privkey: oraclePrivateKey,
    kValue: oracleKValue,
    message,
  }).hex
  return {
    oraclePublicKey,
    oraclePrivateKey,
    oracleKValue,
    oracleRValue,
    signature,
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
