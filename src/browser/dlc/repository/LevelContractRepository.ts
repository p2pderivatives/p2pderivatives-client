import { LevelUp } from 'levelup'
import { ContractRepository } from '../service/DlcService'
import { KeyPrefix, GetKeyPrefix } from '../../storage/KeyPrefix'
import { RepositoryError } from '../../storage/RepositoryError'
import { ErrorCode } from '../../storage/ErrorCode'
import { GetRepositoryResult } from '../../storage/LevelUtils'
import { RepositoryResult } from '../../storage/RepositoryResult'
import { Contract } from '../../../common/models/dlc/Contract'
import { ContractQuery, ExtendedContractQuery } from '../service/ContractQuery'
import contractConverter from '../models/contract/ContractConverter'

export class LevelContractRepository implements ContractRepository {
  private readonly _db: LevelUp

  constructor(db: LevelUp) {
    this._db = db
  }

  async HasContract(contractId: string): Promise<boolean> {
    try {
      const key = this.GetKey(contractId)
      await this._db.get(key)
      return true
    } catch (error) {
      if (error.notFound) {
        return false
      }
      throw new RepositoryError(ErrorCode.InternalError, error.message)
    }
  }

  async CreateContract(contract: Contract): Promise<void> {
    if (await this.HasContract(contract.id)) {
      throw new RepositoryError(
        ErrorCode.AlreadyExists,
        'Trying to create a contract that already exists.'
      )
    }
    try {
      const key = this.GetKey(contract.id)
      return this._db.put(key, contract)
    } catch (error) {
      throw new RepositoryError(ErrorCode.InternalError, error.message)
    }
  }

  GetContracts(query?: ContractQuery): Promise<Contract[]> {
    return new Promise<Contract[]>((resolve, reject) => {
      const contracts: Contract[] = []
      this._db
        .createReadStream({
          gte: GetKeyPrefix(KeyPrefix.CONTRACT),
          lt: GetKeyPrefix(KeyPrefix.CONTRACT + 1),
        })
        .on('error', error => reject(error))
        .on('data', data => {
          let contract = data.value as Contract
          if (contract == null) {
            throw new RepositoryError(
              ErrorCode.InternalError,
              'Expected Contract type but was not.'
            )
          }

          contract = contractConverter(contract)

          if (!query || this.IsMatch(contract, query)) {
            contracts.push(contract)
          }
        })
        .on('end', () => resolve(contracts))
    })
  }

  async GetContract(contractId: string): Promise<RepositoryResult<Contract>> {
    const key = this.GetKey(contractId)

    return GetRepositoryResult<Contract>(this._db, key, contractConverter)
  }

  async UpdateContract(contract: Contract): Promise<void> {
    const key = this.GetKey(contract.id)
    return this._db.put(key, contract)
  }

  async DeleteContract(contractId: string): Promise<void> {
    try {
      const key = this.GetKey(contractId)
      await this._db.del(key)
    } catch (error) {
      throw new RepositoryError(ErrorCode.InternalError, error.message)
    }
  }

  private GetKey(contractId: string): string {
    return GetKeyPrefix(KeyPrefix.CONTRACT) + contractId
  }

  private IsMatch(contract: Contract, query: ExtendedContractQuery): boolean {
    const getTypedKeys = function<T>(o: T): (keyof T)[] {
      return Object.keys(o) as (keyof T)[]
    }

    const hasEqualKeys: boolean = getTypedKeys(query as ContractQuery)
      .filter(key => key in contract)
      .every(key => query[key] === contract[key])

    if (hasEqualKeys && query.maturedBefore) {
      return contract.maturityTime < query.maturedBefore
    }

    return hasEqualKeys
  }
}
