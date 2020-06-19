import { DateTime } from 'luxon'
import { v4 } from 'uuid'
import { Contract } from '../../../common/models/dlc/Contract'
import { ContractState } from '../../../common/models/dlc/ContractState'
import { Outcome } from '../../../common/models/dlc/Outcome'
import { ErrorCode } from '../../storage/ErrorCode'
import { RepositoryError } from '../../storage/RepositoryError'
import { DlcService } from '../service/DlcService'
import {
  AcceptedContract,
  BroadcastContract,
  ConfirmedContract,
  fromOfferMessage,
  InitialContract,
  MaturedContract,
  MutualClosedContract,
  MutualCloseProposedContract,
  OfferedContract,
  RejectedContract,
  SignedContract,
  toSignMessage,
  UnilateralClosedContract,
} from './contract'
import { ContractUpdater } from './ContractUpdater'
import {
  AcceptMessage,
  MutualClosingMessage,
  OfferMessage,
  SignMessage,
} from './messages'
import { isSuccessful } from '../../../common/utils/failable'
import { FailedContract } from './contract/FailedContract'

export class DlcEventHandler {
  private readonly _contractUpdater: ContractUpdater
  private readonly _dlcService: DlcService

  constructor(contractUpdated: ContractUpdater, dlcService: DlcService) {
    this._contractUpdater = contractUpdated
    this._dlcService = dlcService
  }

  async onSendOffer(contract: Contract): Promise<OfferedContract> {
    if (!contract.oracleInfo) {
      throw new Error('Invalid state')
    }

    const oracleInfo = contract.oracleInfo

    const initialContract: InitialContract = {
      ...contract,
      id: contract.id ? contract.id : v4(),
      state: ContractState.Initial,
      isLocalParty: true,
      oracleInfo,
    }

    if (contract.id) {
      await this._dlcService.updateContract(initialContract)
    } else {
      await this._dlcService.createContract(initialContract)
    }

    // TODO(tibo): handle errors here (fail contract)
    const offeredContract = await this._contractUpdater.toOfferedContract(
      initialContract
    )

    await this._dlcService.updateContract(offeredContract)

    return offeredContract
  }

  async onSendOfferFail(contractId: string): Promise<FailedContract> {
    const initialContract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Offered,
    ])) as OfferedContract
    const failedContract: FailedContract = {
      ...initialContract,
      state: ContractState.Failed,
    }

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
    const result = await this._dlcService.getContract(contractId)

    if (!isSuccessful(result)) {
      throw result.error
    }

    const retrievedContract = result.value

    if (retrievedContract.state != ContractState.Offered) {
      throw new DlcError('Contract in invalid state')
    }

    const offeredContract = retrievedContract as OfferedContract
    const acceptedContract = await this._contractUpdater.toAcceptContract(
      offeredContract
    )

    await this._dlcService.updateContract(acceptedContract)

    return acceptedContract
  }

  async onAcceptMessage(
    from: string,
    acceptMessage: AcceptMessage
  ): Promise<{ contract: SignedContract; message: SignMessage }> {
    const contract = await this.tryGetContractOrThrow(
      acceptMessage.contractId,
      [ContractState.Offered],
      from
    )

    if (contract === null) {
      throw new DlcError(`Contract ${acceptMessage.contractId} was not found`)
    }

    const offeredContract = contract as OfferedContract

    const acceptedContract = await this._contractUpdater.toAcceptContract(
      offeredContract,
      {
        ...acceptMessage.remotePartyInputs,
        utxos: acceptMessage.remotePartyInputs.utxos,
      },
      acceptMessage.refundSignature,
      acceptMessage.cetSignatures
    )

    await this._dlcService.updateContract(acceptedContract)

    if (!this._contractUpdater.verifyAcceptedContract(acceptedContract)) {
      this.rejectContract(acceptedContract)
    }

    const signedContract = await this._contractUpdater.toSignedContract(
      acceptedContract
    )

    await this._dlcService.updateContract(signedContract)

    const cetSignatures = this._contractUpdater.getCetSignatures(
      signedContract,
      signedContract.remoteCetsHex,
      signedContract.fundTxId,
      signedContract.fundTxOutAmount,
      signedContract.localPartyInputs
    )

    return {
      contract: signedContract,
      message: toSignMessage(signedContract, cetSignatures),
    }
  }

  async onSignMessage(
    from: string,
    signMessage: SignMessage
  ): Promise<BroadcastContract> {
    const contract = await this.tryGetContractOrThrow(
      signMessage.contractId,
      [ContractState.Accepted],
      from
    )

    const signedContract = await this._contractUpdater.toSignedContract(
      contract as AcceptedContract,
      signMessage.fundTxSignatures,
      signMessage.utxoPublicKeys
    )

    if (!this._contractUpdater.verifyAcceptedContract(signedContract)) {
      this.rejectContract(signedContract)
    }

    const broadcastContract = await this._contractUpdater.toBroadcast(
      signedContract
    )

    await this._dlcService.updateContract(broadcastContract)

    return broadcastContract
  }

  async onSendMutualCloseOffer(
    contractId: string,
    outcome: Outcome
  ): Promise<MutualCloseProposedContract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Mature,
    ])) as MaturedContract

    const mutualCloseProposedContract = await this._contractUpdater.ToMutualClosedProposed(
      contract,
      outcome
    )

    await this._dlcService.updateContract(mutualCloseProposedContract)

    return mutualCloseProposedContract
  }

  async onMutualCloseOffer(
    from: string,
    mutualClosingMessage: MutualClosingMessage,
    getOracleValue: (
      assetId: string,
      maturityTime: DateTime
    ) => Promise<{ value: string; signature: string }>
  ): Promise<MutualClosedContract> {
    let contract = await this.tryGetContractOrThrow(
      mutualClosingMessage.contractId,
      [
        ContractState.Mature,
        ContractState.Confirmed,
        ContractState.MutualCloseProposed,
      ],
      from
    )

    if (contract.state == ContractState.Confirmed) {
      const contractOutcome = await getOracleValue(
        contract.oracleInfo!.assetId,
        DateTime.fromMillis(contract.maturityTime)
      )
      contract = await this.onContractMature(
        contract.id!,
        contractOutcome.value,
        contractOutcome.signature
      )
    }

    const mutualClosed = await this._contractUpdater.toMutualClosed(
      contract as MaturedContract,
      mutualClosingMessage
    )

    await this._dlcService.updateContract(mutualClosed)
    return mutualClosed
  }

  async onMutualCloseConfirmed(
    contractId: string
  ): Promise<MutualClosedContract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.MutualCloseProposed,
    ])) as MutualCloseProposedContract

    const mutualClosedContract = this._contractUpdater.toMutualClosedConfirmed(
      contract
    )

    await this._dlcService.updateContract(mutualClosedContract)

    return mutualClosedContract
  }

  async onUnilateralClose(
    contractId: string
  ): Promise<UnilateralClosedContract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Mature,
      ContractState.MutualCloseProposed,
    ])) as MaturedContract

    const unilateralClosed = await this._contractUpdater.toUnilateralClosed(
      contract
    )

    await this._dlcService.updateContract(unilateralClosed)
    return unilateralClosed
  }

  async onUnilateralClosedByOther(
    contractId: string,
    finalCetTxId: string
  ): Promise<void> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Mature,
    ])) as MaturedContract

    const updatedContract = this._contractUpdater.toUnilateralClosedByOther(
      contract,
      finalCetTxId
    )

    this._dlcService.updateContract(updatedContract)
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
    outcomeValue: string,
    oracleSignature: string
  ): Promise<MaturedContract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Confirmed,
    ])) as ConfirmedContract

    const matureContract = this._contractUpdater.toMatureContract(
      contract,
      outcomeValue,
      oracleSignature
    )

    await this._dlcService.updateContract(matureContract)

    return matureContract
  }

  async onContractRefund(contractId: string): Promise<Contract> {
    const contract = (await this.tryGetContractOrThrow(contractId, [
      ContractState.Signed,
      ContractState.Broadcast,
    ])) as SignedContract

    const refundedContract = await this._contractUpdater.toRefundedContract(
      contract
    )
    await this._dlcService.updateContract(refundedContract)
    return refundedContract
  }

  private async tryGetContractOrThrow(
    contractId: string,
    expectedStates: ContractState[] = [],
    from?: string
  ): Promise<Contract> {
    const result = await this._dlcService.getContract(contractId)

    if (!isSuccessful(result)) {
      const error = result.error as RepositoryError

      if (error.errorCode == ErrorCode.NotFound) {
        throw new DlcError(`Contract ${contractId} was not found.`)
      }

      throw error
    }

    const contract = result.value

    if (
      (from && contract.counterPartyName != from) ||
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

    const rejectedContract: RejectedContract = {
      ...contract,
      state: ContractState.Rejected,
    }
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

  private async rejectContract(
    contract: OfferedContract | AcceptedContract | SignedContract
  ): Promise<void> {
    const rejectedContract: RejectedContract = {
      ...contract,
      state: ContractState.Rejected,
    }
    await this._dlcService.updateContract(rejectedContract)
    throw new DlcError('Contract was rejected')
  }
}

export class DlcError extends Error {
  constructor(message: string, readonly contract?: Contract) {
    super(message)
  }
}
