import { ContractRepository } from '../src/browser/dlc/service/DlcService'
import { Contract } from '../src/common/models/dlc/Contract'
import { RepositoryResult } from '../src/browser/storage/RepositoryResult'
import { ContractQuery } from '../src/browser/dlc/service/ContractQuery'
import { ContractTest } from '../test/Consts'

export class ContractRepositoryMock implements ContractRepository {
  CreateContract(contract: Contract): Promise<void> {
    return Promise.resolve()
  }
  GetContract(contractId: string): Promise<RepositoryResult<Contract>> {
    return Promise.resolve(new RepositoryResult<Contract>(ContractTest))
  }
  GetContracts(query?: ContractQuery): Promise<Contract[]> {
    return Promise.resolve([])
  }
  UpdateContract(contract: Contract): Promise<void> {
    return Promise.resolve()
  }
  DeleteContract(contractId: string): Promise<void> {
    return Promise.resolve()
  }
  HasContract(contractId: string): Promise<boolean> {
    return Promise.resolve(true)
  }
}
