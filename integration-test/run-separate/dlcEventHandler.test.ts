import * as cfddlcjs from 'cfd-dlc-js'
import { DateTime } from 'luxon'
import { Contract } from '../../src/common/models/dlc/Contract'
import { ContractState } from '../../src/common/models/dlc/ContractState'
import {
  OfferedContract,
  toAcceptMessage,
  toMutualClosingMessage,
  toOfferMessage,
  MutualClosedContract,
  UnilateralClosedContract,
  toSignMessage,
} from '../../src/browser/dlc/models/contract'
import {
  assertContractState,
  createWallets,
  getNewPartyContext,
  PartyContext,
  OracleContext,
  getNewMockedOracleContext,
} from './integrationTestCommons'
import {
  AcceptMessage,
  OfferMessage,
  SignMessage,
  RejectMessage,
  DlcMessageType,
} from '../../src/browser/dlc/models/messages'
import { getCommonFee } from '../../src/browser/dlc/utils/FeeEstimator'

const localParty = 'alice'
const remoteParty = 'bob'
const noBtcParty = 'carol'

let localPartyContext: PartyContext
let remotePartyContext: PartyContext
let noBtcPartyContext: PartyContext
let oracleContext: OracleContext
const assetId = 'btcusd'
const oracleName = 'Olivia'

const oneBtc = 100000000

const baseOutcomes = [
  {
    message: 'bull',
    local: 2 * oneBtc,
    remote: 0,
  },
  {
    message: 'bear',
    local: 0,
    remote: 2 * oneBtc,
  },
]

const outcomesWithDust = [
  {
    message: 'bull',
    local: 1 * oneBtc - 100,
    remote: 100,
  },
  {
    message: 'bear',
    local: 100,
    remote: 1 * oneBtc - 100,
  },
]

describe('dlc-event-handler', () => {
  beforeAll(async () => {
    try {
      await createWallets()
      localPartyContext = await getNewPartyContext(localParty)
      remotePartyContext = await getNewPartyContext(remoteParty)
      noBtcPartyContext = await getNewPartyContext(noBtcParty, false)
      oracleContext = getNewMockedOracleContext()
    } catch (error) {
      fail(error)
    }
  })

  test('1-mutual-closing', async () => {
    const offerMessage = await sendOffer()
    await acceptOffer(offerMessage)
    const mutualClosedOfferContract = await localPartyContext.eventHandler.onSendMutualCloseOffer(
      offerMessage.contractId,
      baseOutcomes[0]
    )
    const mutualClosingMessage = toMutualClosingMessage(
      mutualClosedOfferContract
    )

    assertContractState(
      localPartyContext.dlcService,
      mutualClosingMessage.contractId,
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

  test('2-unilateral-closing', async () => {
    const offerMessage = await sendOffer()
    await acceptOffer(offerMessage)
    await localPartyContext.eventHandler.onUnilateralClose(
      offerMessage.contractId
    )

    const contract = (await assertContractState(
      localPartyContext.dlcService,
      offerMessage.contractId,
      ContractState.UnilateralClosed
    )) as UnilateralClosedContract

    await remotePartyContext.eventHandler.onUnilateralClosedByOther(contract.id)

    await assertContractState(
      remotePartyContext.dlcService,
      contract.id,
      ContractState.UnilateralClosedByOther
    )
  })

  test('3-rejected', async () => {
    const offerMessage = await sendOffer()
    await rejectOffer(offerMessage)
  })

  test('4-on-offer-just-enough-with-fee-should-work', async () => {
    const carolAddress = await noBtcPartyContext.client.getNewAddress()
    const feeRate = 2
    const carolCollateral = oneBtc
    const estimatedFee = getCommonFee(feeRate) + 100 * feeRate
    await localPartyContext.client.sendToAddress(
      carolAddress,
      carolCollateral + estimatedFee
    )
    await localPartyContext.client.generateBlocksToWallet(1)
    const offerMessage = await sendOffer(noBtcPartyContext)
    await acceptOffer(offerMessage, noBtcPartyContext)
  })

  test('5-on-offer-not-enough-with-fee-should-throw', async () => {
    const carolAddress = await noBtcPartyContext.client.getNewAddress()
    const carolCollateral = oneBtc
    await localPartyContext.client.sendToAddress(carolAddress, carolCollateral)
    await localPartyContext.client.generateBlocksToWallet(1)
    expect(sendOffer(noBtcPartyContext)).rejects.toThrow(Error)
  })

  test('6-on-accept-not-enough-with-fee-should-throw', async () => {
    const carolAddress = await noBtcPartyContext.client.getNewAddress()
    const carolCollateral = oneBtc
    await localPartyContext.client.sendToAddress(carolAddress, carolCollateral)
    await localPartyContext.client.generateBlocksToWallet(1)
    const offerMessage = await sendOffer()
    expect(
      noBtcPartyContext.eventHandler.onOfferAccepted(offerMessage.contractId)
    ).rejects.toThrow(Error)
  })

  test('7-with-dust-payout-mutual-closed-dust-is-discarded', async () => {
    const offerMessage = await sendOffer(
      localPartyContext,
      remotePartyContext,
      0.5 * oneBtc,
      0.5 * oneBtc,
      outcomesWithDust
    )
    await acceptOffer(offerMessage)
    const mutualClosedOfferContract = await localPartyContext.eventHandler.onSendMutualCloseOffer(
      offerMessage.contractId,
      outcomesWithDust[0]
    )
    const mutualClosingMessage = toMutualClosingMessage(
      mutualClosedOfferContract
    )

    const mutualClosedContract = await remotePartyContext.eventHandler.onMutualCloseOffer(
      localParty,
      mutualClosingMessage,
      () => {
        throw Error()
      }
    )

    const contract = (await assertContractState(
      remotePartyContext.dlcService,
      mutualClosedContract.id,
      ContractState.MutualClosed
    )) as MutualClosedContract

    expect(contract.finalOutcome.remote).toEqual(0)
  })

  test('8-with-dust-payout-unilateral-local-closed-dust-is-discarded', async () => {
    const offerMessage = await sendOffer(
      localPartyContext,
      remotePartyContext,
      0.5 * oneBtc,
      0.5 * oneBtc,
      outcomesWithDust
    )
    await acceptOffer(offerMessage)

    const localContract = await localPartyContext.eventHandler.onUnilateralClose(
      offerMessage.contractId
    )

    expect(localContract.finalOutcome.remote).toEqual(0)

    const remoteContract = await remotePartyContext.eventHandler.onUnilateralClosedByOther(
      offerMessage.contractId
    )

    expect(remoteContract.finalOutcome.remote).toEqual(0)
  })

  test('9-with-dust-payout-unilateral-remote-closed-dust-is-discarded', async () => {
    const offerMessage = await sendOffer(
      localPartyContext,
      remotePartyContext,
      0.5 * oneBtc,
      0.5 * oneBtc,
      outcomesWithDust
    )
    await acceptOffer(offerMessage)

    const remoteContract = await remotePartyContext.eventHandler.onUnilateralClose(
      offerMessage.contractId
    )

    expect(remoteContract.finalOutcome.remote).toEqual(0)

    const localContract = await localPartyContext.eventHandler.onUnilateralClosedByOther(
      offerMessage.contractId
    )

    expect(localContract.finalOutcome.remote).toEqual(0)
  })

  test('10-process-two-contracts-both-succeed', async () => {
    const offerMessage1 = await sendOffer()
    const offerMessage2 = await sendOffer()
    const firstId = offerMessage1.contractId
    const secondId = offerMessage2.contractId
    await acceptOffer(offerMessage1)
    await acceptOffer(offerMessage2)
    const mutualClosedOfferContract1 = await localPartyContext.eventHandler.onSendMutualCloseOffer(
      firstId,
      baseOutcomes[0]
    )
    const mutualClosedOfferContract2 = await localPartyContext.eventHandler.onSendMutualCloseOffer(
      secondId,
      baseOutcomes[0]
    )
    const mutualClosingMessage1 = toMutualClosingMessage(
      mutualClosedOfferContract1
    )
    const mutualClosingMessage2 = toMutualClosingMessage(
      mutualClosedOfferContract2
    )

    assertContractState(
      localPartyContext.dlcService,
      firstId,
      ContractState.MutualCloseProposed
    )

    assertContractState(
      localPartyContext.dlcService,
      secondId,
      ContractState.MutualCloseProposed
    )

    const mutualClosedContract1 = await remotePartyContext.eventHandler.onMutualCloseOffer(
      localParty,
      mutualClosingMessage1,
      () => {
        throw Error()
      }
    )

    const mutualClosedContract2 = await remotePartyContext.eventHandler.onMutualCloseOffer(
      localParty,
      mutualClosingMessage2,
      () => {
        throw Error()
      }
    )

    assertContractState(
      remotePartyContext.dlcService,
      mutualClosedContract1.id,
      ContractState.MutualClosed
    )

    assertContractState(
      remotePartyContext.dlcService,
      mutualClosedContract2.id,
      ContractState.MutualClosed
    )
  })

  test('11-invalid-cet-sign-on-accept-throws', async () => {
    const offerMessage = await sendOffer()
    const offeredContract = await testOnOfferMessage(offerMessage)
    const acceptMessage = await testOnOfferAccepted(offeredContract)
    const badCetSignatures = [...acceptMessage.cetSignatures]
    badCetSignatures[0] =
      nextHex(badCetSignatures[0]) + badCetSignatures[0].substring(1)
    const badAcceptMessage: AcceptMessage = {
      ...acceptMessage,
      cetSignatures: badCetSignatures,
    }

    expect(
      localPartyContext.eventHandler.onAcceptMessage(
        remoteParty,
        badAcceptMessage
      )
    ).rejects.toThrow(Error)
  })

  test('12-invalid-cets-sign-on-sign-message-throws', async () => {
    const offerMessage = await sendOffer()
    const offeredContract = await testOnOfferMessage(offerMessage)
    const acceptMessage = await testOnOfferAccepted(offeredContract)
    const signedContract = await localPartyContext.eventHandler.onAcceptMessage(
      remoteParty,
      acceptMessage
    )

    const signMessage = toSignMessage(signedContract)
    const badCetSignatures = [...signMessage.cetSignatures]
    badCetSignatures[0] =
      nextHex(badCetSignatures[0]) + badCetSignatures[0].substring(1)
    const badSignMessage: SignMessage = {
      ...signMessage,
      cetSignatures: badCetSignatures,
    }

    expect(
      remotePartyContext.eventHandler.onSignMessage(localParty, badSignMessage)
    ).rejects.toThrow(Error)
  })

  test('13-invalid-refund-sign-on-accept-throws', async () => {
    const offerMessage = await sendOffer()
    const offeredContract = await testOnOfferMessage(offerMessage)
    const acceptMessage = await testOnOfferAccepted(offeredContract)
    const badRefundSignature =
      nextHex(acceptMessage.refundSignature[0]) +
      acceptMessage.refundSignature[0].substring(1)
    const badAcceptMessage: AcceptMessage = {
      ...acceptMessage,
      refundSignature: badRefundSignature,
    }

    expect(
      localPartyContext.eventHandler.onAcceptMessage(
        remoteParty,
        badAcceptMessage
      )
    ).rejects.toThrow(Error)
  })

  test('14-invalid-refund-sign-on-sign-message-throws', async () => {
    const offerMessage = await sendOffer()
    const offeredContract = await testOnOfferMessage(offerMessage)
    const acceptMessage = await testOnOfferAccepted(offeredContract)
    const signedContract = await localPartyContext.eventHandler.onAcceptMessage(
      remoteParty,
      acceptMessage
    )

    const signMessage = toSignMessage(signedContract)
    const badRefundSignature =
      nextHex(acceptMessage.refundSignature[0]) +
      acceptMessage.refundSignature[0].substring(1)
    const badSignMessage: SignMessage = {
      ...signMessage,
      refundSignature: badRefundSignature,
    }

    expect(
      remotePartyContext.eventHandler.onSignMessage(localParty, badSignMessage)
    ).rejects.toThrow(Error)
  })

  test('15-just-enough-with-fee-first-rejected-second-should-work', async () => {
    const carolAddress = await noBtcPartyContext.client.getNewAddress()
    const feeRate = 2
    const carolCollateral = oneBtc
    const estimatedFee = getCommonFee(feeRate) + 100 * feeRate
    await localPartyContext.client.sendToAddress(
      carolAddress,
      carolCollateral + estimatedFee
    )
    await localPartyContext.client.generateBlocksToWallet(1)
    const offerMessage = await sendOffer(noBtcPartyContext)
    await rejectOffer(offerMessage, noBtcPartyContext)

    const offerMessage2 = await sendOffer(noBtcPartyContext)
    await acceptOffer(offerMessage2, noBtcPartyContext)
  })

  test('16-local-mutual-closes-remote-can-see-transaction', async () => {
    const offerMessage = await sendOffer()
    await acceptOffer(offerMessage)
    const mutualClosedOfferContract = await remotePartyContext.eventHandler.onSendMutualCloseOffer(
      offerMessage.contractId,
      baseOutcomes[0]
    )
    const mutualClosingMessage = toMutualClosingMessage(
      mutualClosedOfferContract
    )

    assertContractState(
      remotePartyContext.dlcService,
      mutualClosingMessage.contractId,
      ContractState.MutualCloseProposed
    )

    await localPartyContext.eventHandler.onMutualCloseOffer(
      remoteParty,
      mutualClosingMessage,
      () => {
        throw Error()
      }
    )

    expect(
      remotePartyContext.client.getTransaction(
        mutualClosedOfferContract.mutualCloseTxId
      )
    ).resolves.toBeDefined()
  })

  test('17-mutual-closing-with-premium', async () => {
    const offerMessage = await sendOffer(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      10000
    )
    await acceptOffer(offerMessage)
    const mutualClosedOfferContract = await localPartyContext.eventHandler.onSendMutualCloseOffer(
      offerMessage.contractId,
      baseOutcomes[0]
    )
    const mutualClosingMessage = toMutualClosingMessage(
      mutualClosedOfferContract
    )

    assertContractState(
      localPartyContext.dlcService,
      mutualClosingMessage.contractId,
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

  async function sendOffer(
    localContext = localPartyContext,
    remoteContext = remotePartyContext,
    localCollateral = 1 * oneBtc,
    remoteCollateral = 1 * oneBtc,
    outcomes = baseOutcomes,
    premiumAmount = 0
  ): Promise<OfferMessage> {
    const contract: Contract = {
      state: ContractState.Initial,
      oracleInfo: {
        name: oracleName,
        rValue: oracleContext.oracleRValue,
        publicKey: oracleContext.oraclePublicKey,
        assetId: assetId,
      },
      counterPartyName: remoteContext.name,
      localCollateral,
      remoteCollateral,
      maturityTime: DateTime.utc()
        .minus({ hours: 1 })
        .toMillis(),
      outcomes,
      feeRate: 2,
      premiumAmount,
    }

    return await testOnSendOffer(contract, localContext)
  }

  async function acceptOffer(
    offerMessage: OfferMessage,
    localContext = localPartyContext
  ): Promise<void> {
    const offeredContract = await testOnOfferMessage(offerMessage)
    const acceptMessage = await testOnOfferAccepted(offeredContract)
    const signMessage = await testOnAcceptMessage(acceptMessage, localContext)
    await testOnSignMessage(signMessage)

    const finalOutcome = baseOutcomes[0]

    const oracleSignature = cfddlcjs.SchnorrSign({
      privkey: oracleContext.oraclePrivateKey,
      kValue: oracleContext.oracleKValue,
      message: finalOutcome.message,
    }).hex

    await testOnContractConfirmed(localContext, offeredContract.id)
    await testOnContractConfirmed(remotePartyContext, offeredContract.id)

    await testOnContractMature(
      localContext,
      offeredContract.id,
      finalOutcome.message,
      oracleSignature
    )

    await testOnContractMature(
      remotePartyContext,
      offeredContract.id,
      finalOutcome.message,
      oracleSignature
    )
  }

  async function rejectOffer(
    offerMessage: OfferMessage,
    localParty = localPartyContext
  ): Promise<void> {
    const offeredContract = await testOnOfferMessage(offerMessage, localParty)
    const rejectMessage = await testOnRejectOffer(offeredContract)
    await testOnOfferRejected(rejectMessage, localParty)
  }

  async function testOnSendOffer(
    contract: Contract,
    localContext = localPartyContext
  ): Promise<OfferMessage> {
    let offeredContract = await localContext.eventHandler.onSendOffer(contract)

    expect(offeredContract.localPartyInputs.utxos.length).toBeGreaterThan(0)

    contract = await assertContractState(
      localContext.dlcService,
      offeredContract.id,
      ContractState.Offered
    )

    offeredContract = contract as OfferedContract

    expect(offeredContract.isLocalParty).toBeTruthy()

    return toOfferMessage(offeredContract)
  }

  async function testOnOfferMessage(
    offerMessage: OfferMessage,
    localContext = localPartyContext,
    remoteContext = remotePartyContext
  ): Promise<OfferedContract> {
    const offeredContract = await remoteContext.eventHandler.onOfferMessage(
      offerMessage,
      localContext.name
    )

    const contract = await assertContractState(
      remoteContext.dlcService,
      offeredContract.id,
      ContractState.Offered
    )

    expect(contract).toEqual(offeredContract)

    expect(offeredContract.isLocalParty).toBeFalsy()

    return offeredContract
  }

  async function testOnOfferAccepted(
    contract: OfferedContract
  ): Promise<AcceptMessage> {
    const acceptedContract = await remotePartyContext.eventHandler.onOfferAccepted(
      contract.id
    )

    const acceptMessage = toAcceptMessage(acceptedContract)

    assertContractState(
      remotePartyContext.dlcService,
      acceptedContract.id,
      ContractState.Accepted
    )

    return acceptMessage
  }

  async function testOnRejectOffer(
    contract: OfferedContract
  ): Promise<RejectMessage> {
    await remotePartyContext.eventHandler.onRejectContract(contract.id)

    assertContractState(
      remotePartyContext.dlcService,
      contract.id,
      ContractState.Rejected
    )

    return {
      messageType: DlcMessageType.Reject,
      contractId: contract.id,
    }
  }

  async function testOnOfferRejected(
    message: RejectMessage,
    localParty = localPartyContext
  ): Promise<void> {
    await localParty.eventHandler.onContractRejected(
      message.contractId,
      remoteParty
    )

    assertContractState(
      localParty.dlcService,
      message.contractId,
      ContractState.Rejected
    )
  }

  async function testOnAcceptMessage(
    acceptMessage: AcceptMessage,
    localContext = localPartyContext
  ): Promise<SignMessage> {
    const contract = await localContext.eventHandler.onAcceptMessage(
      remoteParty,
      acceptMessage
    )

    const message = toSignMessage(contract)

    assertContractState(
      localContext.dlcService,
      acceptMessage.contractId,
      ContractState.Signed
    )

    return message
  }

  async function testOnSignMessage(signMessage: SignMessage): Promise<void> {
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
  ): Promise<void> {
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
  ): Promise<void> {
    await partyContext.eventHandler.onContractConfirmed(contractId)

    assertContractState(
      partyContext.dlcService,
      contractId,
      ContractState.Confirmed
    )
  }

  function nextHex(letter: string): string {
    const aCharCode = 'A'.charCodeAt(0)
    const interval = 'A'.charCodeAt(0) - 'Z'.charCodeAt(0) - 1

    return String.fromCharCode(
      ((letter.charCodeAt(0) + 1 - aCharCode) % interval) + aCharCode
    )
  }
})
