import { Contract } from '../../../common/models/dlc/Contract'
import { RepositoryResult } from '../../storage/RepositoryResult'
import { ContractQuery, ExtendedContractQuery } from './ContractQuery'
import { ContractState } from '../../../common/models/dlc/ContractState'
import { DateTime } from 'luxon'

export interface ContractRepository {
  CreateContract(contract: Contract): Promise<void>
  GetContract(contractId: string): Promise<RepositoryResult<Contract>>
  GetContracts(query?: ExtendedContractQuery): Promise<Contract[]>
  UpdateContract(contract: Contract): Promise<void>
  DeleteContract(contractId: string): Promise<void>
  HasContract(contractId: string): Promise<boolean>
}

export class DlcService {
  private readonly _repository: ContractRepository

  constructor(repository: ContractRepository) {
    this._repository = repository
  }

  GetConfirmedContractsToMature(): Promise<Contract[]> {
    const now = DateTime.utc()
    const query: ExtendedContractQuery = {
      state: ContractState.Confirmed,
      maturedBefore: now,
    }

    return this._repository.GetContracts(query)
  }

  GetSignedAndBroadcastContracts(): Promise<Contract[]> {
    const query: ExtendedContractQuery = {
      states: [ContractState.Signed, ContractState.Broadcast],
    }

    return this._repository.GetContracts(query)
  }

  GetMutualCloseOfferedContracts(): Promise<Contract[]> {
    const query: ExtendedContractQuery = {
      state: ContractState.MutualCloseProposed,
    }

    return this._repository.GetContracts(query)
  }

  GetRefundableContracts(): Promise<Contract[]> {
    const query: ExtendedContractQuery = {
      maturedBefore: DateTime.utc().minus({ days: 7 }),
    }

    return this._repository.GetContracts(query)
  }

  GetAllContracts(): Promise<Contract[]> {
    return this._repository.GetContracts()
  }

  CreateContract(contract: Contract): Promise<void> {
    return this._repository.CreateContract(contract)
  }

  UpdateContract(contract: Contract): Promise<void> {
    return this._repository.UpdateContract(contract)
  }

  GetContract(contractId: string): Promise<RepositoryResult<Contract>> {
    return this._repository.GetContract(contractId)
  }
}
