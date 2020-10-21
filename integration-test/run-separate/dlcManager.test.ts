import { DlcMessage } from '@internal/gen-grpc/user_pb'
import { Semaphore } from 'await-semaphore'
import { DateTime, Settings } from 'luxon'
import { Readable } from 'stream'
import winston from 'winston'
import {
  DlcMessageServiceApi,
  DlcMessageStream,
} from '../../src/browser/api/grpc/DlcMessageService'
import { OracleClientApi } from '../../src/browser/api/oracle/oracleClient'
import { DlcManager } from '../../src/browser/dlc/controller/DlcManager'
import { DlcTypedMessage } from '../../src/browser/dlc/models/messages'
import { DlcBrowserAPI } from '../../src/browser/ipc/DlcBrowserAPI'
import { Contract, ContractState } from '../../src/common/models/dlc/Contract'
import {
  assertContractState,
  createWallets,
  getNewMockedOracleContext,
  getNewPartyContext,
  PartyContext,
} from './integrationTestCommons'
import { AuthenticationService } from '../../src/browser/api/grpc/AuthenticationService'
import { GrpcAuth } from '../../src/browser/api/grpc/GrpcAuth'

const localParty = 'alice'
const remoteParty = 'bob'

let localPartyManager: DlcManager
let remotePartyManager: DlcManager

let localPartyContext: PartyContext
let remotePartyContext: PartyContext

const localPartyIpcMock: jest.Mocked<DlcBrowserAPI> = {
  dlcUpdate: jest.fn(),
}
const remotePartyIpcMock: jest.Mocked<DlcBrowserAPI> = {
  dlcUpdate: jest.fn(),
}

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

const now = DateTime.fromObject({
  year: 2020,
  month: 7,
  day: 8,
  hour: 10,
  minute: 0,
  second: 0,
})

const oracleContext = getNewMockedOracleContext(outcomes[0].message)

let throwOnSend = false

describe('dlc-manager', () => {
  beforeEach(async () => {
    try {
      jest.useFakeTimers()
      Settings.now = (): number => now.valueOf()
      await createWallets()
      localPartyContext = await getNewPartyContext(localParty)
      remotePartyContext = await getNewPartyContext(remoteParty)
      const localStream = new Readable({
        objectMode: true,
        read: jest.fn(),
      })
      const remoteStream = new Readable({
        objectMode: true,
        read: jest.fn(),
      })
      const localDlcMessageService: DlcMessageServiceApi = {
        getDlcMessageStream: () => getDlcMessageStreamMock(localStream),
        sendDlcMessage: (message: DlcTypedMessage, dest: string) =>
          sendDlcMessageMock(message, dest, localParty, remoteStream),
      }
      const remoteDlcMessageService: DlcMessageServiceApi = {
        getDlcMessageStream: () => getDlcMessageStreamMock(remoteStream),
        sendDlcMessage: (message: DlcTypedMessage, dest: string) =>
          sendDlcMessageMock(message, dest, remoteParty, localStream),
      }
      const logger = winston.createLogger({
        level: 'debug',
        format: winston.format.json(),
        defaultMeta: { test: 'dlc-manager-test' },
        transports: [new winston.transports.Console()],
      })

      const publishDate = now.plus({ minutes: 1 })
      const assetId = 'btcusd'

      const mockGetRValue = jest.fn()
      mockGetRValue.mockReturnValue(
        Promise.resolve({
          success: true,
          value: {
            oraclePublicKey: oracleContext.oraclePublicKey,
            publishDate: publishDate,
            assetID: assetId,
            rvalue: oracleContext.oracleRValue,
          },
        })
      )
      const mockGetPublicKey = jest.fn()
      mockGetPublicKey.mockReturnValue(
        Promise.resolve({
          success: true,
          value: oracleContext.oraclePublicKey,
        })
      )

      const mockGetSignature = jest.fn()
      mockGetSignature.mockReturnValue(
        Promise.resolve({
          success: true,
          value: {
            signature: oracleContext.signature,
            publishDate: publishDate,
            assetID: assetId,
            value: outcomes[0].message,
            rvalue: oracleContext.oracleRValue,
            oraclePublicKey: oracleContext.oraclePublicKey,
          },
        })
      )

      const oracleClient: OracleClientApi = {
        getRvalue: mockGetRValue,
        getOraclePublicKey: mockGetPublicKey,
        getAssets: jest.fn(),
        getOracleConfig: jest.fn(),
        getSignature: mockGetSignature,
      }
      localPartyManager = new DlcManager(
        localPartyContext.eventHandler,
        localPartyContext.dlcService,
        localPartyContext.client,
        localPartyIpcMock,
        oracleClient,
        localDlcMessageService,
        logger,
        10
      )
      remotePartyManager = new DlcManager(
        remotePartyContext.eventHandler,
        remotePartyContext.dlcService,
        remotePartyContext.client,
        remotePartyIpcMock,
        oracleClient,
        remoteDlcMessageService,
        logger,
        11
      )
    } catch (error) {
      fail(error)
    }
  })

  afterEach(() => {
    localPartyManager.finalize()
    remotePartyManager.finalize()
  })

  test('18-closed-by-local', async () => {
    const contractId = await commonTests()
    await closedByLocal(contractId)
  })

  async function commonTests(): Promise<string> {
    const semaphore = new Semaphore(1)
    const contract: Contract = {
      state: ContractState.Initial,
      id: undefined,
      oracleInfo: {
        name: 'olivia',
        rValue: oracleContext.oracleRValue,
        publicKey: oracleContext.oraclePublicKey,
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
    remotePartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
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

    remotePartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
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

    localPartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
    remotePartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
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

  async function closedByLocal(contractId: string): Promise<void> {
    const semaphore = new Semaphore(1)
    throwOnSend = true
    let release = await semaphore.acquire()
    localPartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
    jest.advanceTimersByTime(10000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.Closed
    )

    await localPartyContext.client.generateBlocksToWallet(10)

    jest.advanceTimersByTime(1000)

    remotePartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )

    release = await semaphore.acquire()

    await assertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.Closed
    )
  }
})

function sendDlcMessageMock(
  message: DlcTypedMessage,
  dest: string,
  from: string,
  destStream: Readable
): Promise<void> {
  if (throwOnSend) {
    throw Error('Throw on send')
  }

  const payload = new Uint8Array(
    new TextEncoder().encode(JSON.stringify(message))
  )
  const dlcMessage = new DlcMessage()
  dlcMessage.setDestName(dest)
  dlcMessage.setOrgName(from)
  dlcMessage.setPayload(payload)

  destStream.push(dlcMessage)
  return Promise.resolve()
}

function getDlcMessageStreamMock(stream: Readable): DlcMessageStream {
  const grpcAuth = new GrpcAuth()
  grpcAuth.authorize('', 100000, '')
  return new DlcMessageStream(
    stream,
    new AuthenticationService(
      {
        login: jest.fn(),
        refresh: jest.fn(),
        logout: jest.fn(),
        updatePassword: jest.fn(),
      },
      grpcAuth
    ),
    jest.fn()
  )
}
