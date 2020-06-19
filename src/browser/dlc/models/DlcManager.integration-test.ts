import { Semaphore } from 'await-semaphore'
import * as cfddlcjs from 'cfd-dlc-js'
import { DateTime } from 'luxon'
import { Readable } from 'stream'
import winston from 'winston'
import { DlcIPCBrowserAPIMock } from '../../../../__mocks__/dlcIPCBrowserAPIMock'
import { DlcMessageServiceMock } from '../../../../__mocks__/dlcMessageServiceMock'
import { OracleClientMock } from '../../../../__mocks__/oracleClientApiMock'
import { Contract } from '../../../common/models/dlc/Contract'
import { ContractState } from '../../../common/models/dlc/ContractState'
import * as Utils from '../utils/CfdUtils'
import { DlcManager } from './DlcManager'
import {
  assertContractState,
  createWallets,
  getNewPartyContext,
  PartyContext,
} from './IntegrationTestCommons-test'

let localParty = 'alice'
let remoteParty = 'bob'

let localPartyManager: DlcManager
let remotePartyManager: DlcManager

let localPartyContext: PartyContext
let remotePartyContext: PartyContext

let localPartyIPC = new DlcIPCBrowserAPIMock()
let remotePartyIPC = new DlcIPCBrowserAPIMock()

let contractId = ''
const outcomes = [
  {
    message: 'bull',
    local: 200000000,
    remote: 0,
  },
  {
    message: 'bear',
    local: 0,
    remote: 200000000,
  },
]
const keyPair = Utils.createKeyPair()
const oraclePrivateKey = keyPair.privkey
const oraclePublicKey = keyPair.pubkey
const kRPair = Utils.createKeyPair()
const kValue = kRPair.privkey
const rValue = cfddlcjs.GetSchnorrPublicNonce({ kValue: kValue }).hex
const signature = cfddlcjs.SchnorrSign({
  privkey: oraclePrivateKey,
  kValue: kValue,
  message: outcomes[0].message,
}).hex

const publishDate = DateTime.utc().minus({ hours: 1 })
const assetId = 'btcusd'

const oracleClientMock = new OracleClientMock(
  oraclePublicKey,
  rValue,
  signature,
  publishDate,
  assetId,
  outcomes[0].message
)

describe('dlc-manager', () => {
  beforeAll(async () => {
    try {
      jest.useFakeTimers()
      await createWallets()
      localPartyContext = await getNewPartyContext(localParty)
      remotePartyContext = await getNewPartyContext(remoteParty)
      const localStream = new Readable({
        objectMode: true,
        read: () => {},
      })
      const remoteStream = new Readable({
        objectMode: true,
        read: () => {},
      })
      const localDlcMessageService = new DlcMessageServiceMock(
        localStream,
        remoteStream,
        localParty
      )
      const remoteDlcMessageService = new DlcMessageServiceMock(
        remoteStream,
        localStream,
        remoteParty
      )
      const logger = winston.createLogger({
        level: 'debug',
        format: winston.format.json(),
        defaultMeta: { test: 'dlc-manager-test' },
        transports: [new winston.transports.Console()],
      })
      localPartyManager = new DlcManager(
        localPartyContext.eventHandler,
        localPartyContext.dlcService,
        localPartyContext.client,
        localPartyIPC,
        oracleClientMock,
        localDlcMessageService,
        logger,
        10
      )
      remotePartyManager = new DlcManager(
        remotePartyContext.eventHandler,
        remotePartyContext.dlcService,
        remotePartyContext.client,
        remotePartyIPC,
        oracleClientMock,
        remoteDlcMessageService,
        logger,
        11
      )
    } catch (error) {
      fail(error)
    }
  })

  test('mutual-closing-both-send', async () => {
    await commonTests()
    await bothReceiveMutualClose()
  })

  test('mutual-closing-local-send', async () => {
    await commonTests()
    await onlyLocalSendsMutualClosing()
  })

  async function commonTests() {
    const semaphore = new Semaphore(1)
    const contract: Contract = {
      state: ContractState.Initial,
      id: contractId,
      oracleInfo: {
        name: 'olivia',
        rValue: rValue,
        publicKey: oraclePublicKey,
        assetId: 'btcusd',
      },
      counterPartyName: 'bob',
      localCollateral: 100000000,
      remoteCollateral: 100000000,
      maturityTime: DateTime.utc()
        .minus({ hours: 1 })
        .toMillis(),
      outcomes: outcomes,
      feeRate: 2,
    }

    let release = await semaphore.acquire()
    remotePartyIPC.callback = () => release()
    const offeredContract = await localPartyManager.sendContractOffer(contract)
    contractId = offeredContract.id

    release = await semaphore.acquire()
    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.Offered
    )

    await assertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.Offered
    )

    remotePartyIPC.callback = () => release()
    await remotePartyManager.acceptContractOffer(contractId)
    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.Signed
    )

    await assertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.Broadcast
    )

    await localPartyContext.client.generateBlocksToWallet(6)

    localPartyIPC.callback = () => release()
    remotePartyIPC.callback = () => release()
    jest.runTimersToTime(11000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()
    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.Confirmed
    )

    await assertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.Confirmed
    )
  }

  async function bothReceiveMutualClose() {
    const semaphore = new Semaphore(1)
    let release = await semaphore.acquire()
    localPartyIPC.callback = () => release()
    remotePartyIPC.callback = () => release()
    jest.runTimersToTime(11000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()
    release = await semaphore.acquire()
    release = await semaphore.acquire()
    release = await semaphore.acquire()
    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.MutualClosed
    )

    await assertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.MutualClosed
    )
  }

  async function onlyLocalSendsMutualClosing() {
    const semaphore = new Semaphore(1)
    let release = await semaphore.acquire()
    localPartyIPC.callback = () => release()
    remotePartyIPC.callback = () => release()
    jest.runTimersToTime(10000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()
    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.MutualCloseProposed
    )

    await assertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.MutualClosed
    )

    jest.runTimersToTime(10000)

    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.MutualClosed
    )
  }
})
