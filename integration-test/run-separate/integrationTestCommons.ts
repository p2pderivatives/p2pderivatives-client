import BitcoinDClient from '../../src/browser/api/bitcoind'
import { LevelUp } from 'levelup'
import { DlcService } from '../../src/browser/dlc/service/DlcService'
import { ContractUpdater } from '../../src/browser/dlc/utils/ContractUpdater'
import { DlcEventHandler } from '../../src/browser/dlc/utils/DlcEventHandler'
import level from 'level-test'
import { LevelContractRepository } from '../../src/browser/dlc/repository/LevelContractRepository'
import { ContractState } from '../../src/common/models/dlc/ContractState'
import { Contract } from '../../src/common/models/dlc/Contract'
import { isSuccessful } from '../../src/common/utils/failable'
import * as Utils from '../../src/browser/dlc/utils/CfdUtils'
import * as cfddlcjs from 'cfd-dlc-js'
import { TEST_BITCOIND_CONFIG } from '../../services/bitcoind/env'

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
}

export async function createWallets() {
  const client = new BitcoinDClient()
  await client.configure({
    rpcUsername: TEST_BITCOIND_CONFIG.rpcUsername,
    rpcPassword: TEST_BITCOIND_CONFIG.rpcPassword,
    network: TEST_BITCOIND_CONFIG.network,
    port: TEST_BITCOIND_CONFIG.port,
  })
  await client.createWallet(localParty, localParty)
  await client.createWallet(remoteParty, remoteParty)
  await client.createWallet(oneBtcParty, oneBtcParty)
}

export function getOracleContext() {
  const oracleKeyPair = Utils.createKeyPair()
  const oraclePrivateKey = oracleKeyPair.privkey
  const oraclePublicKey = oracleKeyPair.pubkey
  const kRPair = Utils.createKeyPair()
  const oracleKValue = kRPair.privkey
  const oracleRValue = cfddlcjs.GetSchnorrPublicNonce({ kValue: oracleKValue })
    .hex
  return {
    oraclePublicKey,
    oraclePrivateKey,
    oracleKValue,
    oracleRValue,
  }
}

export async function getNewPartyContext(
  partyName: string,
  generateToWallet: boolean = true
): Promise<PartyContext> {
  const options = {
    keyEncoding: 'hex',
    valueEncoding: 'json',
  }
  const client = new BitcoinDClient()
  await client.configure({
    rpcUsername: TEST_BITCOIND_CONFIG.rpcUsername,
    rpcPassword: TEST_BITCOIND_CONFIG.rpcPassword,
    network: TEST_BITCOIND_CONFIG.network,
    port: TEST_BITCOIND_CONFIG.port,
    wallet: partyName,
    walletPassphrase: partyName,
  })
  if (generateToWallet) {
    await client.generateBlocksToWallet(110)
  }
  const db = level({ mem: true })(options)
  const repository = new LevelContractRepository(db)
  const dlcService = new DlcService(repository)
  const contractUpdater = new ContractUpdater(client, partyName)
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
