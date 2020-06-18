import { DateTime, Duration } from 'luxon'
import { ContractState } from '../../../common/models/dlc/ContractState'
import { Failable } from '../../../common/utils/failable'
import { RepositoryError } from '../../storage/RepositoryError'
import { AnyContract } from '../models/contract'
import { ExtendedContractQuery } from './ContractQuery'

const RefundTimeout: Duration = Duration.fromObject({ days: 7 })

export interface ContractRepository {
  createContract(contract: AnyContract): Promise<void>
  getContract(
    contractId: string
  ): Promise<Failable<AnyContract, RepositoryError>>
  getContracts(query?: ExtendedContractQuery): Promise<AnyContract[]>
  updateContract(contract: AnyContract): Promise<void>
  deleteContract(contractId: string): Promise<void>
  hasContract(contractId: string): Promise<boolean>
}

export class DlcService {
  private readonly _repository: ContractRepository

  constructor(repository: ContractRepository) {
    this._repository = repository
  }

  getConfirmedContractsToMature(): Promise<AnyContract[]> {
    const now = DateTime.utc()
    const query: ExtendedContractQuery = {
      state: ContractState.Confirmed,
      maturedBefore: now,
    }

    return this._repository.getContracts(query)
  }

  getSignedAndBroadcastContracts(): Promise<AnyContract[]> {
    const query: ExtendedContractQuery = {
      states: [ContractState.Signed, ContractState.Broadcast],
    }

    return this._repository.getContracts(query)
  }

  getMutualCloseOfferedContracts(): Promise<AnyContract[]> {
    const query: ExtendedContractQuery = {
      state: ContractState.MutualCloseProposed,
    }

    return this._repository.getContracts(query)
  }

  getRefundableContracts(): Promise<AnyContract[]> {
    const query: ExtendedContractQuery = {
      maturedBefore: DateTime.utc().minus(RefundTimeout),
    }

    return this._repository.getContracts(query)
  }

  getAllContracts(): Promise<AnyContract[]> {
    return this._repository.getContracts()
  }

  createContract(contract: AnyContract): Promise<void> {
    return this._repository.createContract(contract)
  }

  updateContract(contract: AnyContract): Promise<void> {
    return this._repository.updateContract(contract)
  }

  getContract(
    contractId: string
  ): Promise<Failable<AnyContract, RepositoryError>> {
    return this._repository.getContract(contractId)
  }
}
