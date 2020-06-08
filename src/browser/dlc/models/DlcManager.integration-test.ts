import {
  PartyContext,
  CreateWallets,
  GetNewPartyContext,
  AssertContractState,
} from './IntegrationTestCommons'
import Amount from '../../../common/models/dlc/Amount'
import { ContractState } from '../../../common/models/dlc/ContractState'
import * as Utils from '../utils/CfdUtils'
import * as cfddlcjs from 'cfd-dlc-js'
import { Contract } from '../../../common/models/dlc/Contract'
import { DateTime } from 'luxon'
import { OfferMessage } from './OfferMessage'
import { OfferedContract } from './contract/OfferedContract'
import { AcceptMessage } from './AcceptMessage'
import { SignMessage } from './SignMessage'
import { DlcService } from '../service/DlcService'
import { DlcManager } from './DlcManager'
import { DlcIPCBrowser } from '../../ipc/DlcIPCBrowser'
import { OracleClientMock } from '../../../../__mocks__/oracleClientApiMock'
import { DlcMessageServiceMock } from '../../../../__mocks__/dlcMessageServiceMock'
import { DlcIPCBrowserAPIMock } from '../../../../__mocks__/dlcIPCBrowserAPIMock'
import { Readable } from 'stream'
import winston from 'winston'
import { Semaphore } from 'await-semaphore'
import { fromContract } from '../../../common/models/ipc/ContractSimple'

let localParty = 'alice'
let remoteParty = 'bob'

let localPartyManager: DlcManager
let remotePartyManager: DlcManager

let localPartyContext: PartyContext
let remotePartyContext: PartyContext

let localPartyIPC = new DlcIPCBrowserAPIMock()
let remotePartyIPC = new DlcIPCBrowserAPIMock()

const contractId = '1'
const outcomes = [
  {
    message: 'bull',
    local: Amount.FromBitcoin(2),
    remote: Amount.FromBitcoin(0),
  },
  {
    message: 'bear',
    local: Amount.FromBitcoin(0),
    remote: Amount.FromBitcoin(2),
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
      await CreateWallets()
      localPartyContext = await GetNewPartyContext(localParty)
      remotePartyContext = await GetNewPartyContext(remoteParty)
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
        1
      )
      remotePartyManager = new DlcManager(
        remotePartyContext.eventHandler,
        remotePartyContext.dlcService,
        remotePartyContext.client,
        remotePartyIPC,
        oracleClientMock,
        remoteDlcMessageService,
        logger,
        1
      )
    } catch (error) {
      fail(error)
    }
  })

  test('mutual-closing', async () => {
    await CommonTests()
  })

  async function CommonTests() {
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
      localCollateral: Amount.FromBitcoin(1),
      remoteCollateral: Amount.FromBitcoin(1),
      maturityTime: DateTime.utc().minus({ hours: 1 }),
      outcomes: outcomes,
      feeRate: 2,
    }

    const semaphore = new Semaphore(1)
    let release = await semaphore.acquire()
    remotePartyIPC.callback = () => release()
    await localPartyManager.SendContractOffer(fromContract(contract))

    release = await semaphore.acquire()
    await AssertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.Offered
    )

    await AssertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.Offered
    )

    localPartyIPC.callback = () => release()
    await remotePartyManager.AcceptContractOffer(contractId)
    release = await semaphore.acquire()

    await AssertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.Signed
    )

    await AssertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.Broadcast
    )

    await localPartyContext.client.generateBlocksToWallet(6)

    localPartyIPC.callback = () => release()
    remotePartyIPC.callback = () => release()
    jest.runTimersToTime(1000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()
    await AssertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.Confirmed
    )

    await AssertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.Confirmed
    )

    localPartyIPC.callback = () => release()
    remotePartyIPC.callback = () => release()
    jest.runTimersToTime(1000)

    release = await semaphore.acquire()
    release = await semaphore.acquire()

    await AssertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.MutualClosed
    )

    await AssertContractState(
      remotePartyContext.dlcService,
      contractId,
      ContractState.MutualClosed
    )
  }
})
