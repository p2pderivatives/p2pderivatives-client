import { LevelUp } from 'levelup'
import { DateTime } from 'luxon'
import { ContractState } from '../../../common/models/dlc/Contract'
import { Failable } from '../../../common/utils/failable'
import { ErrorCode } from '../../storage/ErrorCode'
import { getKeyPrefix, KeyPrefix } from '../../storage/KeyPrefix'
import { getRepositoryResult } from '../../storage/LevelUtils'
import { RepositoryError } from '../../storage/RepositoryError'
import { AnyContract } from '../models/contract'
import { ContractQuery, ExtendedContractQuery } from '../service/ContractQuery'
import { ContractRepository } from '../service/DlcService'

export class LevelContractRepository implements ContractRepository {
  private readonly _db: LevelUp

  constructor(db: LevelUp) {
    this._db = db
  }

  async hasContract(contractId: string): Promise<boolean> {
    try {
      const key = this.getKey(contractId)
      await this._db.get(key)
      return true
    } catch (error) {
      if (error.notFound) {
        return false
      }
      throw new RepositoryError(ErrorCode.InternalError, error.message)
    }
  }

  async createContract(contract: AnyContract): Promise<void> {
    if (await this.hasContract(contract.id)) {
      throw new RepositoryError(
        ErrorCode.AlreadyExists,
        'Trying to create a contract that already exists.'
      )
    }
    try {
      const key = this.getKey(contract.id)
      await this._db.put(key, contract)
    } catch (error) {
      throw new RepositoryError(ErrorCode.InternalError, error.message)
    }
  }

  getContracts(query?: ExtendedContractQuery): Promise<AnyContract[]> {
    return new Promise<AnyContract[]>((resolve, reject) => {
      const contracts: AnyContract[] = []
      this._db
        .createReadStream({
          gte: getKeyPrefix(KeyPrefix.CONTRACT),
          lt: getKeyPrefix(KeyPrefix.CONTRACT + 1),
        })
        .on('error', error => reject(error))
        .on('data', data => {
          const contract = data.value as AnyContract
          if (contract == null) {
            throw new RepositoryError(
              ErrorCode.InternalError,
              'Expected object to be of Contract type.'
            )
          }

          if (!query || this.isMatch(contract, query)) {
            contracts.push(contract)
          }
        })
        .on('end', () => {
          return resolve(contracts)
        })
    })
  }

  async getContract(
    contractId: string
  ): Promise<Failable<AnyContract, RepositoryError>> {
    const key = this.getKey(contractId)

    return getRepositoryResult<AnyContract>(this._db, key)
  }

  async updateContract(contract: AnyContract): Promise<void> {
    const key = this.getKey(contract.id)
    return this._db.put(key, contract)
  }

  async deleteContract(contractId: string): Promise<void> {
    try {
      const key = this.getKey(contractId)
      await this._db.del(key)
    } catch (error) {
      throw new RepositoryError(ErrorCode.InternalError, error.message)
    }
  }

  private isHex(value: string): boolean {
    const regexp = /^([0-9a-fA-F]{2})+$/
    return value.length > 0 && regexp.test(value)
  }

  private getKey(contractId: string): string {
    const key = getKeyPrefix(KeyPrefix.CONTRACT) + contractId
    if (!this.isHex(key)) {
      throw new Error('Received invalid key')
    }
    return key
  }

  private isMatch(
    contract: AnyContract,
    query: ExtendedContractQuery
  ): boolean {
    const getTypedKeys = function<T>(o: T): (keyof T)[] {
      return Object.keys(o) as (keyof T)[]
    }

    const hasEqualKeys: boolean = getTypedKeys(query as ContractQuery)
      .filter(key => key in contract)
      .every(key => query[key] === contract[key])

    return (
      hasEqualKeys &&
      this.isMatureBefore(query.maturedBefore, contract) &&
      this.hasOneOfState(query.states, contract)
    )
  }

  private isMatureBefore(
    maturedBefore: DateTime | undefined,
    contract: AnyContract
  ): boolean {
    return (
      !maturedBefore ||
      DateTime.fromMillis(contract.maturityTime) < maturedBefore
    )
  }

  private hasOneOfState(
    states: ContractState[] | undefined,
    contract: AnyContract
  ): boolean {
    return !states || states.includes(contract.state)
  }
}
