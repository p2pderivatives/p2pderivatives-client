import { Contract } from '../../../common/models/dlc/Contract'
import { RepositoryResult } from '../../storage/RepositoryResult'
import { ContractQuery } from './ContractQuery'

export interface ContractRepository {
  CreateContract(contract: Contract): Promise<void>
  GetContract(contractId: string): Promise<RepositoryResult<Contract>>
  GetContracts(query?: ContractQuery): Promise<Contract[]>
  UpdateContract(contract: Contract): Promise<void>
  DeleteContract(contractId: string): Promise<void>
  HasContract(contractId: string): Promise<boolean>
}

export class DlcService {
  private readonly _repository: ContractRepository

  constructor(repository: ContractRepository) {
    this._repository = repository
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
