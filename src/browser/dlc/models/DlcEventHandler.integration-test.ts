import * as cfddlcjs from 'cfd-dlc-js'
import { DateTime } from 'luxon'
import { Contract } from '../../../common/models/dlc/Contract'
import { ContractState } from '../../../common/models/dlc/ContractState'
import * as Utils from '../utils/CfdUtils'
import {
  OfferedContract,
  toAcceptMessage,
  toMutualClosingMessage,
  toOfferMessage,
} from './contract'
import {
  assertContractState,
  createWallets,
  getNewPartyContext,
  PartyContext,
} from './IntegrationTestCommons-test'
import { AcceptMessage, OfferMessage, SignMessage } from './messages'

let localParty = 'alice'
let remoteParty = 'bob'

let localPartyContext: PartyContext
let remotePartyContext: PartyContext

const contractId = '1'
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

describe('dlc-event-handler', () => {
  beforeAll(async () => {
    try {
      await createWallets()
      localPartyContext = await getNewPartyContext(localParty)
      remotePartyContext = await getNewPartyContext(remoteParty)
    } catch (error) {
      fail(error)
    }
  })

  test('mutual-closing', async () => {
    await commonTests()
    const mutualClosedOfferContract = await localPartyContext.eventHandler.onSendMutualCloseOffer(
      contractId,
      outcomes[0]
    )
    const mutualClosingMessage = toMutualClosingMessage(
      mutualClosedOfferContract
    )

    assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.MutualCloseProposed
    )

    const mutualClosedContract = await remotePartyContext.eventHandler.onMutualCloseOffer(
      localParty,
      mutualClosingMessage,
      () => {
        throw Error()
      }
    )

    assertContractState(
      remotePartyContext.dlcService,
      mutualClosedContract.id,
      ContractState.MutualClosed
    )
  })

  test('unilateral-closing', async () => {
    await commonTests()
    await localPartyContext.eventHandler.onUnilateralClose(contractId)

    await assertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.UnilateralClosed
    )

    await remotePartyContext.eventHandler.onUnilateralClosedByOther(
      contractId,
      '1'
    )
  })

  async function commonTests() {
    const keyPair = Utils.createKeyPair()
    const oraclePrivateKey = keyPair.privkey
    const oraclePublicKey = keyPair.pubkey
    const kRPair = Utils.createKeyPair()
    const kValue = kRPair.privkey
    const rValue = cfddlcjs.GetSchnorrPublicNonce({ kValue: kValue }).hex
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

    const offerMessage = await testOnSendOffer(contract)
    const offeredContract = await testOnOfferMessage(offerMessage)
    const acceptMessage = await testOnOfferAccepted(offeredContract)
    const signMessage = await testOnAcceptMessage(acceptMessage)
    await testOnSignMessage(signMessage)

    const finalOutcome = outcomes[0]

    const oracleSignature = cfddlcjs.SchnorrSign({
      privkey: oraclePrivateKey,
      kValue: kValue,
      message: finalOutcome.message,
    }).hex

    await testOnContractConfirmed(localPartyContext, contract.id!)
    await testOnContractConfirmed(remotePartyContext, contract.id!)

    await testOnContractMature(
      localPartyContext,
      contract.id!,
      finalOutcome.message,
      oracleSignature
    )

    await testOnContractMature(
      remotePartyContext,
      contract.id!,
      finalOutcome.message,
      oracleSignature
    )
  }

  async function testOnSendOffer(contract: Contract): Promise<OfferMessage> {
    let offeredContract = await localPartyContext.eventHandler.onSendOffer(
      contract
    )

    expect(offeredContract.id).toEqual(contract.id)
    expect(offeredContract.localPartyInputs.utxos.length).toBeGreaterThan(0)

    contract = await assertContractState(
      localPartyContext.dlcService,
      contract.id!,
      ContractState.Offered
    )

    offeredContract = contract as OfferedContract

    expect(offeredContract.isLocalParty).toBeTruthy()

    return toOfferMessage(offeredContract)
  }

  async function testOnOfferMessage(
    offerMessage: OfferMessage
  ): Promise<OfferedContract> {
    const offeredContract = await remotePartyContext.eventHandler.onOfferMessage(
      offerMessage,
      localParty
    )

    const contract = await assertContractState(
      remotePartyContext.dlcService,
      offeredContract.id,
      ContractState.Offered
    )

    expect(contract).toEqual(offeredContract)

    expect(offeredContract.isLocalParty).toBeFalsy()

    return offeredContract
  }

  async function testOnOfferAccepted(
    contract: Contract
  ): Promise<AcceptMessage> {
    const acceptedContract = await remotePartyContext.eventHandler.onOfferAccepted(
      contract.id!
    )

    const acceptMessage = toAcceptMessage(acceptedContract)

    assertContractState(
      remotePartyContext.dlcService,
      contract.id!,
      ContractState.Accepted
    )

    return acceptMessage
  }

  async function testOnAcceptMessage(
    acceptMessage: AcceptMessage
  ): Promise<SignMessage> {
    const {
      contract,
      message,
    } = await localPartyContext.eventHandler.onAcceptMessage(
      remoteParty,
      acceptMessage
    )

    assertContractState(
      localPartyContext.dlcService,
      acceptMessage.contractId,
      ContractState.Signed
    )

    return message
  }

  async function testOnSignMessage(signMessage: SignMessage) {
    const broadcastContract = await remotePartyContext.eventHandler.onSignMessage(
      localParty,
      signMessage
    )

    assertContractState(
      remotePartyContext.dlcService,
      broadcastContract.id,
      ContractState.Broadcast
    )
  }

  async function testOnContractMature(
    partyContext: PartyContext,
    contractId: string,
    outcomeValue: string,
    oracleSignature: string
  ) {
    await partyContext.eventHandler.onContractMature(
      contractId,
      outcomeValue,
      oracleSignature
    )

    assertContractState(
      partyContext.dlcService,
      contractId,
      ContractState.Mature
    )
  }

  async function testOnContractConfirmed(
    partyContext: PartyContext,
    contractId: string
  ) {
    await partyContext.eventHandler.onContractConfirmed(contractId)

    assertContractState(
      partyContext.dlcService,
      contractId,
      ContractState.Confirmed
    )
  }
})
