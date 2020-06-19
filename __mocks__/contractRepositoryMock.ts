import { ContractRepository } from '../src/browser/dlc/service/DlcService'
import { ContractQuery } from '../src/browser/dlc/service/ContractQuery'
import { ContractTest } from '../test/Consts'
import { AnyContract } from '../src/browser/dlc/models/contract'
import { RepositoryError } from '../src/browser/storage/RepositoryError'
import { Failable } from '../src/common/utils/failable'

export class ContractRepositoryMock implements ContractRepository {
  createContract(contract: AnyContract): Promise<void> {
    return Promise.resolve()
  }
  getContract(
    contractId: string
  ): Promise<Failable<AnyContract, RepositoryError>> {
    return Promise.resolve({ success: true, value: ContractTest })
  }
  getContracts(query?: ContractQuery): Promise<AnyContract[]> {
    return Promise.resolve([])
  }
  updateContract(contract: AnyContract): Promise<void> {
    return Promise.resolve()
  }
  deleteContract(contractId: string): Promise<void> {
    return Promise.resolve()
  }
  hasContract(contractId: string): Promise<boolean> {
    return Promise.resolve(true)
  }
}
