import { ContractUpdater } from './ContractUpdater'
import { DlcService } from '../service/DlcService'
import { Contract } from '../../../common/models/dlc/Contract'
import { InitialContract } from './contract/InitialContract'
import { OfferMessage } from './OfferMessage'
import { ContractState } from '../../../common/models/dlc/ContractState'
import { AcceptMessage } from './AcceptMessage'
import { RepositoryError } from '../../storage/RepositoryError'
import { ErrorCode } from '../../storage/ErrorCode'
import { OfferedContract } from './contract/OfferedContract'
import { SignMessage } from './SignMessage'
import { AcceptedContract } from './contract/AcceptedContract'
import { RejectedContract } from './contract/RejectedContract'
import { BroadcastContract } from './contract/BroadcastContract'
import { Outcome } from '../../../common/models/dlc/Outcome'
import { MaturedContract } from './contract/MaturedContract'
import { MutualClosedContract } from './contract/MutualClosedContract'
import { MutualClosingMessage } from './MutualClosingMessage'
import { ConfirmedContract } from './contract/ConfirmedContract'
import { MutualCloseProposedContract } from './contract/MutualCloseProposedContract'
import { SignedContract } from './contract/SignedContract'
import { DateTime } from 'luxon'

export class DlcEventHandler {
  private readonly _contractUpdater: ContractUpdater
  private readonly _dlcService: DlcService

  constructor(contractUpdated: ContractUpdater, dlcService: DlcService) {
    this._contractUpdater = contractUpdated
    this._dlcService = dlcService
  }

  async OnSendOffer(contract: Contract): Promise<OfferedContract> {
    const initialContract = InitialContract.CreateInitialContract(
      contract.id,
      contract.counterPartyName,
      contract.localCollateral,
      contract.remoteCollateral,
      contract.outcomes,
      contract.maturityTime,
      contract.feeRate,
      contract.oracleInfo,
      true,
      contract.premiumInfo
    )

    await this._dlcService.CreateContract(initialContract)

    const offeredContract = await this._contractUpdater.ToOfferedContract(
      initialContract
    )

    await this._dlcService.UpdateContract(offeredContract)

    return offeredContract
  }

  async OnOfferMessage(
    offerMessage: OfferMessage,
    from: string
  ): Promise<OfferedContract> {
    const initialContract = InitialContract.FromOfferMessage(offerMessage, from)
    await this._dlcService.CreateContract(initialContract)
    const offeredContract = await this._contractUpdater.ToOfferedContract(
      initialContract,
      offerMessage.localPartyInputs
    )

    await this._dlcService.UpdateContract(offeredContract)

    return offeredContract
  }

  async OnOfferAccepted(contractId: string): Promise<AcceptedContract> {
    const result = await this._dlcService.GetContract(contractId)

    if (result.hasError()) {
      throw result.getError()
    }

    const retrievedContract = result.getValue()

    if (retrievedContract.state != ContractState.Offered) {
      throw new Error('Contract in invalid state')
    }

    const offeredContract = retrievedContract as OfferedContract
    const acceptedContract = await this._contractUpdater.ToAcceptContract(
      offeredContract
    )

    await this._dlcService.UpdateContract(acceptedContract)

    return acceptedContract
  }

  async OnAcceptMessage(
    from: string,
    acceptMessage: AcceptMessage
  ): Promise<SignMessage> {
    const contract = await this.TryGetContractOrThrow(
      acceptMessage.contractId,
      [ContractState.Offered],
      from
    )

    if (contract === null) {
      throw new DlcError(`Contract ${acceptMessage.contractId} was not found`)
    }

    const offeredContract = contract as OfferedContract

    const acceptedContract = await this._contractUpdater.ToAcceptContract(
      offeredContract,
      acceptMessage.remotePartyInputs,
      acceptMessage.refundSignature,
      acceptMessage.cetSignatures
    )

    await this._dlcService.UpdateContract(acceptedContract)

    if (!this._contractUpdater.VerifyAcceptedContract(acceptedContract)) {
      this.RejectContract(acceptedContract)
    }

    const signedContract = await this._contractUpdater.ToSignedContract(
      acceptedContract
    )

    await this._dlcService.UpdateContract(signedContract)

    const cetSignatures = this._contractUpdater.GetCetSignatures(
      signedContract,
      signedContract.remoteCetsHex,
      signedContract.fundTxId,
      signedContract.fundTxOutAmount,
      signedContract.localPartyInputs
    )

    return signedContract.ToSignMessage(cetSignatures)
  }

  async OnSignMessage(
    from: string,
    signMessage: SignMessage
  ): Promise<BroadcastContract> {
    const contract = await this.TryGetContractOrThrow(
      signMessage.contractId,
      [ContractState.Accepted],
      from
    )

    const signedContract = await this._contractUpdater.ToSignedContract(
      contract as AcceptedContract,
      signMessage.fundTxSignatures,
      signMessage.utxoPublicKeys
    )

    if (!this._contractUpdater.VerifyAcceptedContract(signedContract)) {
      this.RejectContract(signedContract)
    }

    const broadcastContract = await this._contractUpdater.ToBroadcast(
      signedContract
    )

    await this._dlcService.UpdateContract(broadcastContract)

    return broadcastContract
  }

  async OnSendMutualCloseOffer(
    contractId: string,
    outcome: Outcome
  ): Promise<MutualClosingMessage> {
    const contract = (await this.TryGetContractOrThrow(contractId, [
      ContractState.Mature,
    ])) as MaturedContract

    const mutualCloseProposedContract = await this._contractUpdater.ToMutualClosedProposed(
      contract,
      outcome
    )

    await this._dlcService.UpdateContract(mutualCloseProposedContract)

    return mutualCloseProposedContract.ToMutualClosingMessage()
  }

  async OnMutualCloseOffer(
    from: string,
    mutualClosingMessage: MutualClosingMessage,
    getOracleValue: (
      assetId: string,
      maturityTime: DateTime
    ) => Promise<{ value: string; signature: string }>
  ): Promise<MutualClosedContract> {
    let contract = await this.TryGetContractOrThrow(
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
        contract.oracleInfo.assetId,
        contract.maturityTime
      )
      contract = await this.OnContractMature(
        contract.id,
        contractOutcome.value,
        contractOutcome.signature
      )
    }

    const mutualClosed = await this._contractUpdater.ToMutualClosed(
      contract as MaturedContract,
      mutualClosingMessage
    )

    await this._dlcService.UpdateContract(mutualClosed)
    return mutualClosed
  }

  async OnMutualCloseConfirmed(contractId: string): Promise<Contract> {
    const contract = (await this.TryGetContractOrThrow(contractId, [
      ContractState.MutualCloseProposed,
    ])) as MutualCloseProposedContract

    const mutualClosedContract = this._contractUpdater.ToMutualClosedConfirmed(
      contract
    )

    await this._dlcService.UpdateContract(mutualClosedContract)

    return mutualClosedContract
  }

  async OnUnilateralClose(contractId: string): Promise<Contract> {
    const contract = (await this.TryGetContractOrThrow(contractId, [
      ContractState.Mature,
      ContractState.MutualCloseProposed,
    ])) as MaturedContract

    const unilateralClosed = await this._contractUpdater.ToUnilateralClosed(
      contract
    )

    await this._dlcService.UpdateContract(unilateralClosed)
    return unilateralClosed
  }

  async OnUnilateralClosedByOther(
    contractId: string,
    finalCetTxId: string
  ): Promise<void> {
    const contract = (await this.TryGetContractOrThrow(contractId, [
      ContractState.Mature,
    ])) as MaturedContract

    const updatedContract = this._contractUpdater.ToUnilateralClosedByOther(
      contract,
      finalCetTxId
    )

    this._dlcService.UpdateContract(updatedContract)
  }

  async OnContractConfirmed(contractId: string): Promise<Contract> {
    const contract = (await this.TryGetContractOrThrow(contractId, [
      ContractState.Broadcast,
      ContractState.Signed,
    ])) as BroadcastContract

    const confirmedContract = this._contractUpdater.ToConfirmedContract(
      contract
    )

    await this._dlcService.UpdateContract(confirmedContract)

    return confirmedContract
  }

  // TODO(tibo): consider holding a reference to an
  // oracle client here instead of passing parameters.
  async OnContractMature(
    contractId: string,
    outcomeValue: string,
    oracleSignature: string
  ): Promise<Contract> {
    const contract = (await this.TryGetContractOrThrow(contractId, [
      ContractState.Confirmed,
    ])) as ConfirmedContract

    const matureContract = this._contractUpdater.ToMatureContract(
      contract,
      outcomeValue,
      oracleSignature
    )

    await this._dlcService.UpdateContract(matureContract)

    return matureContract
  }

  async OnContractRefund(contractId: string): Promise<Contract> {
    const contract = (await this.TryGetContractOrThrow(contractId, [
      ContractState.Signed,
      ContractState.Broadcast,
    ])) as SignedContract

    const refundedContract = await this._contractUpdater.ToRefundedContract(
      contract
    )
    await this._dlcService.UpdateContract(refundedContract)
    return refundedContract
  }

  private async TryGetContractOrThrow(
    contractId: string,
    expectedStates: ContractState[] = [],
    from?: string
  ): Promise<Contract> {
    const result = await this._dlcService.GetContract(contractId)

    if (result.hasError()) {
      const error = result.getError() as RepositoryError

      if (error.errorCode == ErrorCode.NotFound) {
        throw new DlcError(`Contract ${contractId} was not found.`)
      }

      throw error
    }

    const contract = result.getValue()

    if (
      (from && contract.counterPartyName != from) ||
      (expectedStates.length > 0 && !expectedStates.includes(contract.state))
    ) {
      console.log(expectedStates)
      console.log(contract.state)
      throw new DlcError(
        `Invalid contract expected one of ${expectedStates} but got ${contract.state}`
      )
    }

    return contract
  }

  async OnContractRejected(
    contractId: string,
    from: string
  ): Promise<RejectedContract> {
    const contract = (await this.TryGetContractOrThrow(
      contractId,
      [ContractState.Offered],
      from
    )) as OfferedContract

    const rejectedContract = RejectedContract.CreateRejectedContract(contract)
    await this._dlcService.UpdateContract(rejectedContract)

    return rejectedContract
  }

  async OnRejectContract(contractId: string): Promise<RejectedContract> {
    const contract = (await this.TryGetContractOrThrow(contractId, [
      ContractState.Offered,
    ])) as OfferedContract
    const rejectedContract = RejectedContract.CreateRejectedContract(contract)
    await this._dlcService.UpdateContract(rejectedContract)

    return rejectedContract
  }

  private async RejectContract(contract: OfferedContract): Promise<void> {
    const rejectedContract = RejectedContract.CreateRejectedContract(contract)
    await this._dlcService.UpdateContract(rejectedContract)
    throw new DlcError('Contract was rejected')
  }
}

export class DlcError extends Error {}
