import {
  PartyContext,
  CreateWallets,
  GetNewPartyContext,
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

let localParty = 'alice'
let remoteParty = 'bob'

let localPartyContext: PartyContext
let remotePartyContext: PartyContext

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

describe('dlc-event-handler', () => {
  beforeAll(async () => {
    try {
      await CreateWallets()
      localPartyContext = await GetNewPartyContext(localParty)
      remotePartyContext = await GetNewPartyContext(remoteParty)
    } catch (error) {
      fail(error)
    }
  })

  test('mutual-closing', async () => {
    await CommonTests()
    const mutualClosedOfferContract = await localPartyContext.eventHandler.OnSendMutualCloseOffer(
      contractId,
      outcomes[0]
    )
    const mutualClosingMessage = mutualClosedOfferContract.ToMutualClosingMessage()

    AssertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.MutualCloseProposed
    )

    const mutualClosedContract = await remotePartyContext.eventHandler.OnMutualCloseOffer(
      localParty,
      mutualClosingMessage,
      () => {
        throw Error()
      }
    )

    AssertContractState(
      remotePartyContext.dlcService,
      mutualClosedContract.id,
      ContractState.MutualClosed
    )
  })

  test('unilateral-closing', async () => {
    await CommonTests()
    await localPartyContext.eventHandler.OnUnilateralClose(contractId)

    await AssertContractState(
      localPartyContext.dlcService,
      contractId,
      ContractState.UnilateralClosed
    )

    await remotePartyContext.eventHandler.OnUnilateralClosedByOther(
      contractId,
      '1'
    )
  })

  async function CommonTests() {
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
      localCollateral: Amount.FromBitcoin(1),
      remoteCollateral: Amount.FromBitcoin(1),
      maturityTime: DateTime.utc().minus({ hours: 1 }),
      outcomes: outcomes,
      feeRate: 2,
    }

    const offerMessage = await TestOnSendOffer(contract)
    const offeredContract = await TestOnOfferMessage(offerMessage)
    const acceptMessage = await TestOnOfferAccepted(offeredContract)
    const signMessage = await TestOnAcceptMessage(acceptMessage)
    await TestOnSignMessage(signMessage)

    const finalOutcome = outcomes[0]

    const oracleSignature = cfddlcjs.SchnorrSign({
      privkey: oraclePrivateKey,
      kValue: kValue,
      message: finalOutcome.message,
    }).hex

    await TestOnContractConfirmed(localPartyContext, contract.id)
    await TestOnContractConfirmed(remotePartyContext, contract.id)

    await TestOnContractMature(
      localPartyContext,
      contract.id,
      finalOutcome.message,
      oracleSignature
    )

    await TestOnContractMature(
      remotePartyContext,
      contract.id,
      finalOutcome.message,
      oracleSignature
    )
  }

  async function TestOnSendOffer(contract: Contract): Promise<OfferMessage> {
    let offeredContract = await localPartyContext.eventHandler.OnSendOffer(
      contract
    )

    expect(offeredContract.id).toEqual(contract.id)
    expect(offeredContract.localPartyInputs.utxos.length).toBeGreaterThan(0)

    contract = await AssertContractState(
      localPartyContext.dlcService,
      contract.id,
      ContractState.Offered
    )

    offeredContract = contract as OfferedContract

    expect(offeredContract.isLocalParty).toBeTruthy()

    return offeredContract.ToOfferMessage()
  }

  async function TestOnOfferMessage(
    offerMessage: OfferMessage
  ): Promise<OfferedContract> {
    const offeredContract = await remotePartyContext.eventHandler.OnOfferMessage(
      offerMessage,
      localParty
    )

    const contract = await AssertContractState(
      remotePartyContext.dlcService,
      offeredContract.id,
      ContractState.Offered
    )

    expect(contract).toEqual(offeredContract)

    expect(offeredContract.isLocalParty).toBeFalsy()

    return offeredContract
  }

  async function TestOnOfferAccepted(
    contract: Contract
  ): Promise<AcceptMessage> {
    const acceptedContract = await remotePartyContext.eventHandler.OnOfferAccepted(
      contract.id
    )
    const acceptMessage = acceptedContract.ToAcceptMessage()

    AssertContractState(
      remotePartyContext.dlcService,
      contract.id,
      ContractState.Accepted
    )

    return acceptMessage
  }

  async function TestOnAcceptMessage(
    acceptMessage: AcceptMessage
  ): Promise<SignMessage> {
    const {
      contract,
      message,
    } = await localPartyContext.eventHandler.OnAcceptMessage(
      remoteParty,
      acceptMessage
    )

    AssertContractState(
      localPartyContext.dlcService,
      acceptMessage.contractId,
      ContractState.Signed
    )

    return message
  }

  async function TestOnSignMessage(signMessage: SignMessage) {
    const broadcastContract = await remotePartyContext.eventHandler.OnSignMessage(
      localParty,
      signMessage
    )

    AssertContractState(
      remotePartyContext.dlcService,
      broadcastContract.id,
      ContractState.Broadcast
    )
  }

  async function TestOnContractMature(
    partyContext: PartyContext,
    contractId: string,
    outcomeValue: string,
    oracleSignature: string
  ) {
    await partyContext.eventHandler.OnContractMature(
      contractId,
      outcomeValue,
      oracleSignature
    )

    AssertContractState(
      partyContext.dlcService,
      contractId,
      ContractState.Mature
    )
  }

  async function TestOnContractConfirmed(
    partyContext: PartyContext,
    contractId: string
  ) {
    await partyContext.eventHandler.OnContractConfirmed(contractId)

    AssertContractState(
      partyContext.dlcService,
      contractId,
      ContractState.Confirmed
    )
  }

  async function AssertContractState(
    dlcService: DlcService,
    contractId: string,
    expectedState: ContractState
  ): Promise<Contract> {
    const result = await dlcService.GetContract(contractId)

    expect(result.hasError()).toBeFalsy()

    const value = result.getValue()

    expect(value.state).toEqual(expectedState)

    return value
  }
})
