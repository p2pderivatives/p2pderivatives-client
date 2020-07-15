import { Semaphore } from 'await-semaphore'
import * as cfddlcjs from 'cfd-dlc-js'
import { DateTime, Settings } from 'luxon'
import { Readable } from 'stream'
import winston from 'winston'
import { DlcManager } from '../../src/browser/dlc/controller/DlcManager'
import * as Utils from '../../src/browser/dlc/utils/CfdUtils'
import { Contract } from '../../src/common/models/dlc/Contract'
import { ContractState } from '../../src/common/models/dlc/ContractState'
import { DlcIPCBrowserAPIMock } from '../../__mocks__/dlcIPCBrowserAPIMock'
import { DlcMessageServiceMock } from '../../__mocks__/dlcMessageServiceMock'
import { OracleClientMock } from '../../__mocks__/oracleClientApiMock'
import {
  assertContractState,
  createWallets,
  getNewPartyContext,
  PartyContext,
} from './integrationTestCommons'

const localParty = 'alice'
const remoteParty = 'bob'

let localPartyManager: DlcManager
let remotePartyManager: DlcManager

let localPartyContext: PartyContext
let remotePartyContext: PartyContext

const localPartyIPC = new DlcIPCBrowserAPIMock()
const remotePartyIPC = new DlcIPCBrowserAPIMock()

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

const now = DateTime.fromObject({
  year: 2020,
  month: 7,
  day: 8,
  hour: 10,
  minute: 0,
  second: 0,
})
const publishDate = now.plus({ minutes: 1 })
const assetId = 'btcusd'

const oracleClientMock = new OracleClientMock(
  oraclePublicKey,
  rValue,
  signature,
  publishDate,
  assetId,
  outcomes[0].message
)

let throwOnSend = false
let ignoreSend = false

describe('dlc-manager', () => {
  beforeAll(async () => {
    try {
      jest.useFakeTimers()
      Settings.now = (): number => now.valueOf()
      await createWallets()
      localPartyContext = await getNewPartyContext(localParty)
      remotePartyContext = await getNewPartyContext(remoteParty)
      const localStream = new Readable({
        objectMode: true,
        read: (): void => {
          // do nothing
        },
      })
      const remoteStream = new Readable({
        objectMode: true,
        read: (): void => {
          // do nothing
        },
      })
      const localDlcMessageService = new DlcMessageServiceMock(
        localStream,
        remoteStream,
        localParty,
        () => throwOnSend,
        () => ignoreSend
      )
      const remoteDlcMessageService = new DlcMessageServiceMock(
        remoteStream,
        localStream,
        remoteParty,
        () => throwOnSend,
        () => ignoreSend
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

  test('18-mutual-closing-both-send', async () => {
    const contractId = await commonTests()
    await bothReceiveMutualClose(contractId)
    localPartyManager.finalize()
    remotePartyManager.finalize()
  })

  test('19-mutual-closing-local-send', async () => {
    const contractId = await commonTests()
    await onlyLocalSendsMutualClosing(contractId)
    localPartyManager.finalize()
    remotePartyManager.finalize()
  })

  test('20-unilateral-close-by-local', async () => {
    const contractId = await commonTests()
    await unilateralCloseFromLocal(contractId)
    localPartyManager.finalize()
    remotePartyManager.finalize()
  })

  test('21-unilateral-close-by-remote', async () => {
    const contractId = await commonTests()
    await unilateralCloseFromRemote(contractId)
    localPartyManager.finalize()
    remotePartyManager.finalize()
  })

  test('22-unilateral-close-by-local-after-timeout', async () => {
    const contractId = await commonTests()
    await unilateralCloseFromLocalAfterProposeTimeout(contractId)
    localPartyManager.finalize()
    remotePartyManager.finalize()
  })

  async function commonTests(): Promise<string> {
    const semaphore = new Semaphore(1)
    const contract: Contract = {
      state: ContractState.Initial,
      id: undefined,
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
    remotePartyIPC.callback = (): void => release()
    const offeredContract = await localPartyManager.sendContractOffer(contract)
    const contractId = offeredContract.id

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

    remotePartyIPC.callback = (): void => release()
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

    localPartyIPC.callback = (): void => release()
    remotePartyIPC.callback = (): void => release()
    jest.advanceTimersByTime(11000)

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
    return contractId
  }

  async function bothReceiveMutualClose(contractId: string): Promise<void> {
    const semaphore = new Semaphore(1)
    let release = await semaphore.acquire()
    localPartyIPC.callback = (): void => release()
    remotePartyIPC.callback = (): void => release()
    jest.advanceTimersByTime(11000)

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

  async function onlyLocalSendsMutualClosing(
    contractId: string
  ): Promise<void> {
    const semaphore = new Semaphore(1)
    let release = await semaphore.acquire()
    localPartyIPC.callback = (): void => release()
    remotePartyIPC.callback = (): void => release()
    jest.advanceTimersByTime(10000)

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

    jest.advanceTimersByTime(10000)

    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.MutualClosed
    )
  }

  async function unilateralCloseFromLocal(contractId: string): Promise<void> {
    const semaphore = new Semaphore(1)
    throwOnSend = true
    let release = await semaphore.acquire()
    localPartyIPC.callback = (): void => release()
    jest.advanceTimersByTime(10000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()
    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.UnilateralClosed
    )

    await localPartyContext.client.generateBlocksToWallet(10)

    jest.advanceTimersByTime(1000)

    remotePartyIPC.callback = (): void => release()
    release = await semaphore.acquire()

    await assertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.UnilateralClosedByOther
    )
  }

  async function unilateralCloseFromRemote(contractId: string): Promise<void> {
    const semaphore = new Semaphore(1)
    let release = await semaphore.acquire()
    localPartyIPC.callback = (): void => release()
    ignoreSend = true
    jest.advanceTimersByTime(10000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.MutualCloseProposed
    )

    throwOnSend = true
    remotePartyIPC.callback = (): void => release()
    jest.advanceTimersByTime(1000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()
    release = await semaphore.acquire()

    await assertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.UnilateralClosed
    )

    Settings.now = (): number => now.plus({ seconds: 30 }).valueOf()
    jest.advanceTimersByTime(10000)

    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.UnilateralClosedByOther
    )
  }

  async function unilateralCloseFromLocalAfterProposeTimeout(
    contractId: string
  ): Promise<void> {
    const semaphore = new Semaphore(1)
    ignoreSend = true
    let release = await semaphore.acquire()
    localPartyIPC.callback = (): void => release()
    jest.advanceTimersByTime(10000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.MutualCloseProposed
    )

    Settings.now = (): number => now.plus({ seconds: 30 }).valueOf()
    jest.advanceTimersByTime(100000)

    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.UnilateralClosed
    )
  }
})
