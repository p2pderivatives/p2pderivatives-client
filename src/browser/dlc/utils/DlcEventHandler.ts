import { v4 } from 'uuid'
import { Contract, ContractState } from '../../../common/models/dlc/Contract'
import { areRangeOutcomes, Outcome } from '../../../common/models/dlc/Outcome'
import { isSuccessful } from '../../../common/utils/failable'
import { ErrorCode } from '../../storage/ErrorCode'
import {
  AcceptedContract,
  AnyContract,
  BroadcastContract,
  ClosedContract,
  ConfirmedContract,
  FailedContract,
  fromOfferMessage,
  InitialContract,
  MaturedContract,
  OfferedContract,
  RefundedContract,
  RejectedContract,
  SignedContract,
} from '../models/contract'
import { AcceptMessage, OfferMessage, SignMessage } from '../models/messages'
import { isDecompositionDescriptor } from '../models/oracle/descriptor'
import { OracleAnnouncement } from '../models/oracle/oracleAnnouncement'
import { DlcService } from '../service/DlcService'
import { ContractUpdater } from './ContractUpdater'
import { getMaxRanges } from './Decomposition'

export class DlcEventHandler {
  private readonly _contractUpdater: ContractUpdater
  private readonly _dlcService: DlcService

  constructor(contractUpdated: ContractUpdater, dlcService: DlcService) {
    this._contractUpdater = contractUpdated
    this._dlcService = dlcService
  }

  async onInitialize(
    contract: Contract,
    oracleAnnouncement: OracleAnnouncement
  ): Promise<InitialContract> {
    if (!contract.oracleInfo) {
      throw new Error('Invalid state')
    }

    let outcomes: ReadonlyArray<Outcome> | undefined = undefined
    const eventDescriptor = oracleAnnouncement.oracleEvent.eventDescriptor
    if (isDecompositionDescriptor(eventDescriptor)) {
      if (areRangeOutcomes(contract.outcomes)) {
        outcomes = getMaxRanges(
          contract.outcomes,
          eventDescriptor.base,
          oracleAnnouncement.oracleEvent.nonces.length
        )
      }
    }

    const oracleInfo = contract.oracleInfo
    const initialContract: InitialContract = {
      ...contract,
      outcomes: outcomes || contract.outcomes,
      id:
        contract.id ||
        v4()
          .split('-')
          .join(''),
      state: ContractState.Initial,
      isLocalParty: true,
      oracleInfo,
      oracleAnnouncement,
    }

    if (contract.id) {
      await this._dlcService.updateContract(initialContract)
    } else {
      await this._dlcService.createContract(initialContract)
    }

    return initialContract
  }

  async onSendOffer(
    initialContract: InitialContract
  ): Promise<OfferedContract> {
    const offeredContract = await this._contractUpdater.toOfferedContract(
      initialContract
    )

    await this._dlcService.updateContract(offeredContract)

    return offeredContract
  }

  async onSendOfferFail(
    contractId: string,
    reason: string
  ): Promise<FailedContract> {
    const offeredContract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Offered,
      ContractState.Initial,
    ])) as OfferedContract | InitialContract

    const failedContract = await this._contractUpdater.toFailedContract(
      offeredContract,
      'Failed to send offer ' + reason
    )

    await this._dlcService.updateContract(failedContract)

    return failedContract
  }

  async onOfferMessage(
    offerMessage: OfferMessage,
    from: string
  ): Promise<OfferedContract> {
    const initialContract = fromOfferMessage(offerMessage, from)
    await this._dlcService.createContract(initialContract)
    const offeredContract = await this._contractUpdater.toOfferedContract(
      initialContract,
      {
        ...offerMessage.localPartyInputs,
        utxos: offerMessage.localPartyInputs.utxos,
      }
    )

    await this._dlcService.updateContract(offeredContract)

    return offeredContract
  }

  async onOfferAccepted(contractId: string): Promise<AcceptedContract> {
    const offeredContract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Offered,
    ])) as OfferedContract
    const acceptedContract = await this._contractUpdater.toAcceptContract(
      offeredContract
    )

    await this._dlcService.updateContract(acceptedContract)

    return acceptedContract
  }

  async onOfferAcceptFailed(contractId: string): Promise<OfferedContract> {
    const acceptedContract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Accepted,
    ])) as AcceptedContract

    const offeredContract = await this._contractUpdater.toOfferedContract(
      acceptedContract,
      acceptedContract.localPartyInputs
    )

    await this._dlcService.updateContract(offeredContract)

    return offeredContract
  }

  async onAcceptMessage(
    from: string,
    acceptMessage: AcceptMessage
  ): Promise<SignedContract> {
    const offeredContract = (await this.tryGetContractOrThrow(
      acceptMessage.contractId,
      [ContractState.Offered],
      from
    )) as OfferedContract

    const acceptedContract = await this._contractUpdater.toAcceptContract(
      offeredContract,
      {
        ...acceptMessage.remotePartyInputs,
        utxos: acceptMessage.remotePartyInputs.utxos,
      },
      acceptMessage.refundSignature,
      acceptMessage.cetAdaptorPairs
    )

    await this._dlcService.updateContract(acceptedContract)

    if (!this._contractUpdater.verifyContractSignatures(acceptedContract)) {
      await this.handleInvalidContract(acceptedContract, 'Invalid signatures')
    }

    const signedContract = await this._contractUpdater.toSignedContract(
      acceptedContract
    )

    await this._dlcService.updateContract(signedContract)

    return signedContract
  }

  async onSignMessage(
    from: string,
    signMessage: SignMessage
  ): Promise<BroadcastContract> {
    const contract = (await this.tryGetContractOrThrow(
      signMessage.contractId,
      [ContractState.Accepted],
      from
    )) as AcceptedContract

    const signedContract = await this._contractUpdater.toSignedContract(
      contract,
      signMessage.fundTxSignatures,
      signMessage.utxoPublicKeys,
      signMessage.refundSignature,
      signMessage.cetAdaptorPairs
    )

    if (!this._contractUpdater.verifyContractSignatures(signedContract)) {
      await this.handleInvalidContract(signedContract, 'Invalid signatures')
    }

    const broadcastContract = await this._contractUpdater.toBroadcast(
      signedContract
    )

    await this._dlcService.updateContract(broadcastContract)

    return broadcastContract
  }

  async onClosed(contractId: string): Promise<ClosedContract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Mature,
    ])) as MaturedContract

    const closed = await this._contractUpdater.toClosed(contract)

    await this._dlcService.updateContract(closed)
    return closed
  }

  async onClosedByOther(contractId: string): Promise<ClosedContract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Mature,
    ])) as MaturedContract

    const updatedContract = await this._contractUpdater.toClosedByOther(
      contract
    )

    await this._dlcService.updateContract(updatedContract)

    return updatedContract
  }

  async onContractConfirmed(contractId: string): Promise<Contract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Broadcast,
      ContractState.Signed,
    ])) as BroadcastContract

    const confirmedContract = this._contractUpdater.toConfirmedContract(
      contract
    )

    await this._dlcService.updateContract(confirmedContract)

    return confirmedContract
  }

  // TODO(tibo): consider holding a reference to an
  // oracle client here instead of passing parameters.
  async onContractMature(
    contractId: string,
    oracleSignatures: string[],
    outcomeValues: string[]
  ): Promise<MaturedContract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Confirmed,
    ])) as ConfirmedContract

    const matureContract = this._contractUpdater.toMatureContract(
      contract,
      oracleSignatures,
      outcomeValues
    )

    await this._dlcService.updateContract(matureContract)

    return matureContract
  }

  async onContractRefund(contractId: string): Promise<Contract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Confirmed,
    ])) as ConfirmedContract

    const refundedContract = await this._contractUpdater.toRefundedContract(
      contract
    )
    await this._dlcService.updateContract(refundedContract)
    return refundedContract
  }

  async onContractRefundByOther(contractId: string): Promise<Contract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Confirmed,
    ])) as ConfirmedContract
    const refundedContract: RefundedContract = {
      ...contract,
      state: ContractState.Refunded,
    }

    await this._dlcService.updateContract(refundedContract)
    return refundedContract
  }

  private async tryGetContractOrThrow(
    contractId: string,
    expectedStates: ContractState[] = [],
    from?: string
  ): Promise<AnyContract> {
    const result = await this._dlcService.getContract(contractId)

    if (!isSuccessful(result)) {
      const error = result.error

      if (error.errorCode === ErrorCode.NotFound) {
        throw new DlcError(`Contract ${contractId} was not found.`)
      }

      throw error
    }

    const contract = result.value

    if (
      (from && contract.counterPartyName !== from) ||
      (expectedStates.length > 0 && !expectedStates.includes(contract.state))
    ) {
      throw new DlcError(
        `Invalid contract expected one of ${expectedStates} but got ${contract.state}`
      )
    }

    return contract
  }

  async onContractRejected(
    contractId: string,
    from: string
  ): Promise<RejectedContract> {
    const contract = (await this.tryGetContractOrThrow(
      contractId,
      [ContractState.Offered],
      from
    )) as OfferedContract

    const rejectedContract = await this._contractUpdater.toRejectedContract(
      contract
    )
    await this._dlcService.updateContract(rejectedContract)

    return rejectedContract
  }

  async onRejectContract(contractId: string): Promise<RejectedContract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Offered,
    ])) as OfferedContract
    const rejectedContract: RejectedContract = {
      ...contract,
      state: ContractState.Rejected,
    }
    await this._dlcService.updateContract(rejectedContract)

    return rejectedContract
  }

  private async handleInvalidContract(
    contract: OfferedContract | AcceptedContract | SignedContract,
    reason: string
  ): Promise<never> {
    const rejectedContract = await this._contractUpdater.toRejectedContract(
      contract,
      reason
    )
    await this._dlcService.updateContract(rejectedContract)
    throw new DlcError(`Contract was rejected: ${reason}`)
  }
}

export class DlcError extends Error {
  constructor(message: string, readonly contract?: Contract) {
    super(message)
  }
}
