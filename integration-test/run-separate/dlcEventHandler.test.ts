import { DateTime } from 'luxon'
import {
  ClosedContract,
  OfferedContract,
  toAcceptMessage,
  toOfferMessage,
  toSignMessage,
} from '../../src/browser/dlc/models/contract'
import {
  AcceptMessage,
  DlcMessageType,
  OfferMessage,
  RejectMessage,
  SignMessage,
} from '../../src/browser/dlc/models/messages'
import { getCommonFee } from '../../src/browser/dlc/utils/FeeEstimator'
import { Contract, ContractState } from '../../src/common/models/dlc/Contract'
import { Outcome } from '../../src/common/models/dlc/Outcome'
import {
  assertContractState,
  createWallets,
  getNewMockedDecompositionOracleContext,
  getNewMockedEnumerationOracleContext,
  getNewPartyContext,
  OracleContext,
  PartyContext,
} from './integrationTestCommons'

const localParty = 'alice'
const remoteParty = 'bob'
const noBtcParty = 'carol'

let localPartyContext: PartyContext
let remotePartyContext: PartyContext
let noBtcPartyContext: PartyContext
let enumerationOracleContext: OracleContext
let decompositionOracleContext: OracleContext
const oracleName = 'Olivia'

const oneBtc = 100000000

const baseOutcomes = [
  {
    outcome: 'bull',
    payout: {
      local: 2 * oneBtc,
      remote: 0,
    },
  },
  {
    outcome: 'bear',
    payout: {
      local: 0,
      remote: 2 * oneBtc,
    },
  },
]

const outcomesWithDust = [
  {
    outcome: 'bull',
    payout: {
      local: 1 * oneBtc - 100,
      remote: 100,
    },
  },
  {
    outcome: 'bear',
    payout: {
      local: 100,
      remote: 1 * oneBtc - 100,
    },
  },
]

describe('dlc-event-handler', () => {
  beforeAll(async () => {
    try {
      await createWallets()
      localPartyContext = await getNewPartyContext(localParty)
      remotePartyContext = await getNewPartyContext(remoteParty)
      noBtcPartyContext = await getNewPartyContext(noBtcParty, false)
      enumerationOracleContext = getNewMockedEnumerationOracleContext(
        baseOutcomes.map(x => x.outcome)
      )
      decompositionOracleContext = getNewMockedDecompositionOracleContext(
        20,
        2,
        [
          '0',
          '0',
          '0',
          '0',
          '0',
          '1',
          '0',
          '1',
          '0',
          '0',
          '1',
          '0',
          '0',
          '0',
          '0',
          '0',
          '1',
          '0',
          '0',
          '0',
        ]
      )
    } catch (error) {
      fail(error)
    }
  })

  test('1-unilateral-closing', async () => {
    const offerMessage = await sendOffer()
    await acceptOffer(offerMessage)
    await localPartyContext.eventHandler.onClosed(offerMessage.contractId)

    const contract = (await assertContractState(
      localPartyContext.dlcService,
      offerMessage.contractId,
      ContractState.Closed
    )) as ClosedContract

    await remotePartyContext.eventHandler.onClosedByOther(contract.id)

    await assertContractState(
      remotePartyContext.dlcService,
      contract.id,
      ContractState.Closed
    )
  })

  test('2-rejected', async () => {
    const offerMessage = await sendOffer()
    await rejectOffer(offerMessage)
  })

  test('3-on-offer-just-enough-with-fee-should-work', async () => {
    const carolAddress = await noBtcPartyContext.client.getNewAddress()
    const feeRate = 2
    const carolCollateral = oneBtc
    const estimatedFee = getCommonFee(feeRate) + 100 * feeRate
    await localPartyContext.client.sendToAddress(
      carolAddress,
      carolCollateral + estimatedFee
    )
    await localPartyContext.client.generateBlocksToWallet(1)
    const offerMessage = await sendOffer({ localContext: noBtcPartyContext })
    await acceptOffer(offerMessage, noBtcPartyContext)
  })

  test('4-on-offer-not-enough-with-fee-should-throw', async () => {
    const carolAddress = await noBtcPartyContext.client.getNewAddress()
    const carolCollateral = oneBtc
    await localPartyContext.client.sendToAddress(carolAddress, carolCollateral)
    await localPartyContext.client.generateBlocksToWallet(1)
    await expect(
      sendOffer({ localContext: noBtcPartyContext })
    ).rejects.toThrow(Error)
  })

  test('5-on-accept-not-enough-with-fee-should-throw', async () => {
    const carolAddress = await noBtcPartyContext.client.getNewAddress()
    const carolCollateral = oneBtc
    await localPartyContext.client.sendToAddress(carolAddress, carolCollateral)
    await localPartyContext.client.generateBlocksToWallet(1)
    const offerMessage = await sendOffer({ remoteContext: noBtcPartyContext })
    expect(
      noBtcPartyContext.eventHandler.onOfferAccepted(offerMessage.contractId)
    ).rejects.toThrow(Error)
  })

  test('6-with-dust-payout-local-closed-dust-is-discarded', async () => {
    const offerMessage = await sendOffer({
      localCollateral: 0.5 * oneBtc,
      remoteCollateral: 0.5 * oneBtc,
      outcomes: outcomesWithDust,
    })
    await acceptOffer(offerMessage)

    const localContract = await localPartyContext.eventHandler.onClosed(
      offerMessage.contractId
    )

    expect(localContract.finalOutcome.payout.remote).toEqual(0)

    const remoteContract = await remotePartyContext.eventHandler.onClosedByOther(
      offerMessage.contractId
    )

    expect(remoteContract.finalOutcome.payout.remote).toEqual(0)
  })

  test('7-with-dust-payout-unilateral-remote-closed-dust-is-discarded', async () => {
    const offerMessage = await sendOffer({
      localCollateral: 0.5 * oneBtc,
      remoteCollateral: 0.5 * oneBtc,
      outcomes: outcomesWithDust,
    })
    await acceptOffer(offerMessage)

    const remoteContract = await remotePartyContext.eventHandler.onClosed(
      offerMessage.contractId
    )

    expect(remoteContract.finalOutcome.payout.remote).toEqual(0)

    const localContract = await localPartyContext.eventHandler.onClosedByOther(
      offerMessage.contractId
    )

    expect(localContract.finalOutcome.payout.remote).toEqual(0)
  })

  test('8-process-two-contracts-both-succeed', async () => {
    const offerMessage1 = await sendOffer()
    const offerMessage2 = await sendOffer()
    const firstId = offerMessage1.contractId
    const secondId = offerMessage2.contractId
    await acceptOffer(offerMessage1)
    await acceptOffer(offerMessage2)

    const closedContract1 = await remotePartyContext.eventHandler.onClosed(
      firstId
    )

    const closedContract2 = await remotePartyContext.eventHandler.onClosed(
      secondId
    )

    assertContractState(
      remotePartyContext.dlcService,
      closedContract1.id,
      ContractState.Closed
    )

    assertContractState(
      remotePartyContext.dlcService,
      closedContract2.id,
      ContractState.Closed
    )
  })

  test('9-invalid-cet-sign-on-accept-throws', async () => {
    const offerMessage = await sendOffer()
    const offeredContract = await testOnOfferMessage(offerMessage)
    const acceptMessage = await testOnOfferAccepted(offeredContract)
    const badCetAdaptorPairs = [...acceptMessage.cetAdaptorPairs]
    badCetAdaptorPairs[0].signature =
      nextHex(badCetAdaptorPairs[0].signature) +
      badCetAdaptorPairs[0].signature.substring(1)
    const badAcceptMessage: AcceptMessage = {
      ...acceptMessage,
      cetAdaptorPairs: badCetAdaptorPairs,
    }

    expect(
      localPartyContext.eventHandler.onAcceptMessage(
        remoteParty,
        badAcceptMessage
      )
    ).rejects.toThrow(Error)
  })

  test('10-invalid-cets-sign-on-sign-message-throws', async () => {
    const offerMessage = await sendOffer()
    const offeredContract = await testOnOfferMessage(offerMessage)
    const acceptMessage = await testOnOfferAccepted(offeredContract)
    const signedContract = await localPartyContext.eventHandler.onAcceptMessage(
      remoteParty,
      acceptMessage
    )

    const signMessage = toSignMessage(signedContract)
    const badAdaptorCetPairs = [...signMessage.cetAdaptorPairs]
    badAdaptorCetPairs[0].signature =
      nextHex(badAdaptorCetPairs[0].signature) +
      badAdaptorCetPairs[0].signature.substring(1)
    const badSignMessage: SignMessage = {
      ...signMessage,
      cetAdaptorPairs: badAdaptorCetPairs,
    }

    await expect(
      remotePartyContext.eventHandler.onSignMessage(localParty, badSignMessage)
    ).rejects.toThrow(Error)
  })

  test('11-invalid-refund-sign-on-accept-throws', async () => {
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

  test('12-invalid-refund-sign-on-sign-message-throws', async () => {
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

  test('13-just-enough-with-fee-first-rejected-second-should-work', async () => {
    const carolAddress = await noBtcPartyContext.client.getNewAddress()
    const feeRate = 2
    const carolCollateral = oneBtc
    const estimatedFee = getCommonFee(feeRate) + 100 * feeRate
    await localPartyContext.client.sendToAddress(
      carolAddress,
      carolCollateral + estimatedFee
    )
    await localPartyContext.client.generateBlocksToWallet(1)
    const offerMessage = await sendOffer({
      localContext: noBtcPartyContext,
    })
    await rejectOffer(offerMessage, noBtcPartyContext)
    const offerMessage2 = await sendOffer({ localContext: noBtcPartyContext })
    await acceptOffer(offerMessage2, noBtcPartyContext)
  })

  test('14-local-closes-remote-can-see-transaction', async () => {
    const offerMessage = await sendOffer()
    await acceptOffer(offerMessage)
    const closedContract = await localPartyContext.eventHandler.onClosed(
      offerMessage.contractId
    )

    await assertContractState(
      localPartyContext.dlcService,
      closedContract.id,
      ContractState.Closed
    )

    await expect(
      remotePartyContext.client.getTransaction(closedContract.finalCetId)
    ).resolves.toBeDefined()
  })

  test('15-closing-with-premium', async () => {
    const offerMessage = await sendOffer({ premiumAmount: 10000 })
    await acceptOffer(offerMessage)
    const closedContract = await localPartyContext.eventHandler.onClosed(
      offerMessage.contractId
    )

    assertContractState(
      localPartyContext.dlcService,
      closedContract.id,
      ContractState.Closed
    )

    const closedByOtherContract = await remotePartyContext.eventHandler.onClosedByOther(
      offerMessage.contractId
    )

    assertContractState(
      remotePartyContext.dlcService,
      closedByOtherContract.id,
      ContractState.Closed
    )
  })

  test('16-on-accept-with-premium-just-enough-with-fee-should-work', async () => {
    const carolAddress = await noBtcPartyContext.client.getNewAddress()
    const carolCollateralAndPremium = oneBtc + oneBtc
    const feeRate = 2
    const estimatedFee = getCommonFee(feeRate) + 100 * feeRate
    await localPartyContext.client.sendToAddress(
      carolAddress,
      carolCollateralAndPremium + estimatedFee
    )
    await localPartyContext.client.sendToAddress(
      carolAddress,
      oneBtc + estimatedFee
    )
    await localPartyContext.client.generateBlocksToWallet(1)
    const offerMessage = await sendOffer({
      localContext: noBtcPartyContext,
      premiumAmount: oneBtc,
    })
    await localPartyContext.eventHandler.onOfferMessage(
      offerMessage,
      localParty
    )
    await expect(
      localPartyContext.eventHandler.onOfferAccepted(offerMessage.contractId)
    ).resolves.toBeDefined()
  })

  test('17-no-remote-collateral-should-work', async () => {
    const offerMessage = await sendOffer({
      localCollateral: 2 * oneBtc,
      remoteCollateral: 0,
    })
    await acceptOffer(offerMessage)
  })

  test('18-unilateral-closing-decomposition', async () => {
    const offerMessage = await sendOffer({
      outcomes: [
        {
          start: 0,
          count: 20000,
          payout: {
            local: 2 * oneBtc,
            remote: 0,
          },
        },
        {
          start: 20000,
          count: 1028575,
          payout: {
            local: 0,
            remote: 2 * oneBtc,
          },
        },
      ],
      oracleContext: decompositionOracleContext,
    })
    await acceptOffer(
      offerMessage,
      localPartyContext,
      decompositionOracleContext
    )
    await localPartyContext.eventHandler.onClosed(offerMessage.contractId)

    const contract = (await assertContractState(
      localPartyContext.dlcService,
      offerMessage.contractId,
      ContractState.Closed
    )) as ClosedContract

    await remotePartyContext.eventHandler.onClosedByOther(contract.id)

    await assertContractState(
      remotePartyContext.dlcService,
      contract.id,
      ContractState.Closed
    )
  })

  async function sendOffer(
    params: {
      localContext?: PartyContext
      remoteContext?: PartyContext
      localCollateral?: number
      remoteCollateral?: number
      outcomes?: Outcome[]
      premiumAmount?: number
      oracleContext?: OracleContext
    } = {}
  ): Promise<OfferMessage> {
    const localContext = params.localContext || localPartyContext
    const remoteContext = params.remoteContext || remotePartyContext
    const localCollateral =
      params.localCollateral === undefined ? 1 * oneBtc : params.localCollateral
    const remoteCollateral =
      params.remoteCollateral === undefined
        ? 1 * oneBtc
        : params.remoteCollateral
    const outcomes = params.outcomes || baseOutcomes
    const premiumAmount = params.premiumAmount || 0
    const oracleContext = params.oracleContext || enumerationOracleContext
    const contract: Contract = {
      state: ContractState.Initial,
      assetId: 'btcusd',
      oracleInfo: {
        name: oracleName,
        uri: '',
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
    return await testOnSendOffer(contract, localContext, oracleContext)
  }

  async function acceptOffer(
    offerMessage: OfferMessage,
    localContext = localPartyContext,
    oracleContext = enumerationOracleContext
  ): Promise<void> {
    const offeredContract = await testOnOfferMessage(offerMessage)
    const acceptMessage = await testOnOfferAccepted(offeredContract)
    const signMessage = await testOnAcceptMessage(acceptMessage, localContext)
    await testOnSignMessage(signMessage)

    await testOnContractConfirmed(localContext, offeredContract.id)
    await testOnContractConfirmed(remotePartyContext, offeredContract.id)

    await testOnContractMature(
      localContext,
      offeredContract.id,
      oracleContext.signatures,
      oracleContext.outcomeValues
    )

    await testOnContractMature(
      remotePartyContext,
      offeredContract.id,
      oracleContext.signatures,
      oracleContext.outcomeValues
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
    localContext = localPartyContext,
    oracleContext = enumerationOracleContext
  ): Promise<OfferMessage> {
    const initialContract = await localContext.eventHandler.onInitialize(
      contract,
      oracleContext.announcement
    )
    let offeredContract = await localContext.eventHandler.onSendOffer(
      initialContract
    )

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
    oracleSignatures: string[],
    outcomeValues: string[]
  ): Promise<void> {
    await partyContext.eventHandler.onContractMature(
      contractId,
      oracleSignatures,
      outcomeValues
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
