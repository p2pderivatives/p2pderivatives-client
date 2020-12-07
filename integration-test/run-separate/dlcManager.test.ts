import { DlcMessage } from '@internal/gen-grpc/user_pb'
import { Semaphore } from 'await-semaphore'
import { DateTime, Settings } from 'luxon'
import { Readable } from 'stream'
import winston from 'winston'
import { AuthenticationService } from '../../src/browser/api/grpc/AuthenticationService'
import {
  DlcMessageServiceApi,
  DlcMessageStream,
} from '../../src/browser/api/grpc/DlcMessageService'
import { GrpcAuth } from '../../src/browser/api/grpc/GrpcAuth'
import {
  OracleClientApi,
  OracleError,
} from '../../src/browser/api/oracle/oracleClient'
import { DlcManager } from '../../src/browser/dlc/controller/DlcManager'
import { DlcTypedMessage } from '../../src/browser/dlc/models/messages'
import { OracleAnnouncement } from '../../src/browser/dlc/models/oracle/oracleAnnouncement'
import { DlcBrowserAPI } from '../../src/browser/ipc/DlcBrowserAPI'
import { Contract, ContractState } from '../../src/common/models/dlc/Contract'
import { Failable } from '../../src/common/utils/failable'
import {
  assertContractState,
  createWallets,
  getNewMockedEnumerationOracleContext,
  getNewPartyContext,
  PartyContext,
} from './integrationTestCommons'

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
    outcome: 'bull',
    payout: {
      local: 200000000,
      remote: 0,
    },
  },
  {
    outcome: 'bear',
    payout: {
      local: 0,
      remote: 200000000,
    },
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

const oracleContext = getNewMockedEnumerationOracleContext(
  outcomes.map(x => x.outcome)
)

let throwOnSend = false
const mockGetAttestation = jest.fn()

const contract: Contract = {
  state: ContractState.Initial,
  id: undefined,
  assetId: 'btcusd',
  oracleInfo: {
    name: 'olivia',
    uri: '',
  },
  counterPartyName: 'bob',
  localCollateral: 100000000,
  remoteCollateral: 100000000,
  maturityTime: now.minus({ hours: 1 }).toMillis(),
  outcomes: outcomes,
  feeRate: 2,
}

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
        refreshAuth: () => Promise.resolve(),
      }
      const remoteDlcMessageService: DlcMessageServiceApi = {
        getDlcMessageStream: () => getDlcMessageStreamMock(remoteStream),
        sendDlcMessage: (message: DlcTypedMessage, dest: string) =>
          sendDlcMessageMock(message, dest, remoteParty, localStream),
        refreshAuth: () => Promise.resolve(),
      }
      const logger = winston.createLogger({
        level: 'debug',
        format: winston.format.json(),
        defaultMeta: { test: 'dlc-manager-test' },
        transports: [new winston.transports.Console()],
      })

      const mockGetAnnouncement = jest.fn()
      mockGetAnnouncement.mockReturnValue(
        Promise.resolve<Failable<OracleAnnouncement, OracleError>>({
          success: true,
          value: oracleContext.announcement,
        })
      )
      const mockGetPublicKey = jest.fn()
      mockGetPublicKey.mockReturnValue(
        Promise.resolve({
          success: true,
          value: oracleContext.oraclePublicKey,
        })
      )

      mockGetAttestation.mockReturnValue(
        Promise.resolve({
          success: true,
          value: {
            eventId: '',
            signatures: oracleContext.signatures,
            values: oracleContext.outcomeValues,
          },
        })
      )

      const oracleClient: OracleClientApi = {
        getAnnouncement: mockGetAnnouncement,
        getOraclePublicKey: mockGetPublicKey,
        getAssets: jest.fn(),
        getOracleConfig: jest.fn(),
        getAttestation: mockGetAttestation,
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

  test('19-closed-by-local', async () => {
    const contractId = await commonTests()
    await closedByLocal(contractId)
  })

  test('20-send-offer-fails', async () => {
    throwOnSend = true
    await expect(
      localPartyManager.sendContractOffer(contract)
    ).rejects.toBeDefined()

    const contracts = await localPartyContext.dlcService.getAllContracts()
    expect(contracts.length).toBe(1)
    expect(contracts[0].state).toBe(ContractState.Failed)
  })

  test('21-send-accept-fails', async () => {
    const semaphore = new Semaphore(1)
    let release = await semaphore.acquire()
    remotePartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
    localPartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
    const offeredContract = await localPartyManager.sendContractOffer(contract)
    release = await semaphore.acquire()
    throwOnSend = true
    await expect(
      remotePartyManager.acceptContractOffer(offeredContract.id)
    ).rejects.toBeDefined()
    assertContractState(
      remotePartyContext.dlcService,
      offeredContract.id,
      ContractState.Offered
    )
  })

  test('22-refund-succeeds', async () => {
    const semaphore = new Semaphore(1)
    const contractId = await commonTests()
    Settings.now = (): number => now.plus({ days: 7, hours: 1 }).valueOf()

    mockGetAttestation.mockRejectedValue({
      success: false,
      error: {
        requestID: 'id',
        httpStatusCode: 500,
        code: 0,
        message: 'InternalError',
      },
    })

    let release = await semaphore.acquire()
    localPartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )

    jest.advanceTimersByTime(10000)

    release = await semaphore.acquire()
    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.Refunded
    )
    remotePartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )

    await localPartyContext.client.generateBlocksToWallet(10)

    jest.advanceTimersByTime(1000)
    release = await semaphore.acquire()
    await assertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.Refunded
    )
  })

  test('23-rejects-works', async () => {
    const semaphore = new Semaphore(1)
    let release = await semaphore.acquire()
    remotePartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
    const offeredContract = await localPartyManager.sendContractOffer(contract)
    release = await semaphore.acquire()
    await remotePartyManager.rejectContractOffer(offeredContract.id)
    localPartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
    release = await semaphore.acquire()
    await assertContractState(
      localPartyContext.dlcService,
      offeredContract.id,
      ContractState.Rejected
    )
    await assertContractState(
      remotePartyContext.dlcService,
      offeredContract.id,
      ContractState.Rejected
    )
  })

  test('24-rejects-error-stay-offer', async () => {
    const semaphore = new Semaphore(1)
    let release = await semaphore.acquire()
    remotePartyIpcMock.dlcUpdate.mockImplementation(() =>
      Promise.resolve(release())
    )
    const offeredContract = await localPartyManager.sendContractOffer(contract)
    release = await semaphore.acquire()
    throwOnSend = true
    await expect(
      remotePartyManager.rejectContractOffer(offeredContract.id)
    ).rejects.toBeDefined()
    await assertContractState(
      localPartyContext.dlcService,
      offeredContract.id,
      ContractState.Offered
    )
  })

  async function commonTests(): Promise<string> {
    const semaphore = new Semaphore(1)

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
