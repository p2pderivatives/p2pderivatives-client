import BitcoinDClient from '../../api/bitcoind'
import { LevelUp } from 'levelup'
import { DlcService } from '../service/DlcService'
import { ContractUpdater } from './ContractUpdater'
import { DlcEventHandler } from './DlcEventHandler'
import level from 'level-test'
import { LevelContractRepository } from '../repository/LevelContractRepository'
import { ContractState } from '../../../common/models/dlc/ContractState'
import { Contract } from '../../../common/models/dlc/Contract'
import { isSuccessful } from '../../../common/utils/failable'

const RPC_USER = 'testuser'
const RPC_PASSWORD = 'J-e0g9UOOz8HAD9B9BDgbFlZoqg3fO6R63zZeaNpQ8I='
const NETWORK = 'regtest'
const PORT = 18443

const localParty = 'alice'
const remoteParty = 'bob'

export interface PartyContext {
  readonly client: BitcoinDClient
  readonly db: LevelUp
  readonly dlcService: DlcService
  readonly contractUpdater: ContractUpdater
  readonly eventHandler: DlcEventHandler
}

export async function createWallets() {
  const client = new BitcoinDClient()
  await client.configure({
    rpcUsername: RPC_USER,
    rpcPassword: RPC_PASSWORD,
    network: NETWORK,
    port: PORT,
  })
  await client.createWallet(localParty)
  await client.createWallet(remoteParty)
}

export async function getNewPartyContext(
  partyName: string
): Promise<PartyContext> {
  const options = {
    keyEncoding: 'hex',
    valueEncoding: 'json',
  }
  const client = new BitcoinDClient()
  await client.configure({
    rpcUsername: RPC_USER,
    rpcPassword: RPC_PASSWORD,
    network: NETWORK,
    port: PORT,
    wallet: partyName,
    walletPassphrase: partyName,
  })
  await client.generateBlocksToWallet(110)
  const db = level({ mem: true })(options)
  const repository = new LevelContractRepository(db)
  const dlcService = new DlcService(repository)
  const contractUpdater = new ContractUpdater(client, partyName)
  const eventHandler = new DlcEventHandler(contractUpdater, dlcService)

  return {
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
    fail(result.error)
  }

  const value = result.value

  expect(value.state).toEqual(expectedState)

  return value
}
