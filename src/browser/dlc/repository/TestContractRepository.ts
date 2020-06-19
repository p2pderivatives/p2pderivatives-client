import { DateTime } from 'luxon'
import { ContractState } from '../../../common/models/dlc/ContractState'
import { ErrorCode } from '../../storage/ErrorCode'
import { getKeyPrefix, KeyPrefix } from '../../storage/KeyPrefix'
import { RepositoryError } from '../../storage/RepositoryError'
import { AnyContract } from '../models/contract'
import { ContractQuery } from '../service/ContractQuery'
import { ContractRepository } from '../service/DlcService'
import { Failable } from '../../../common/utils/failable'

export class TestContractRepository implements ContractRepository {
  private _contracts: AnyContract[] = [
    {
      id: 'testid1',
      state: ContractState.Initial,
      counterPartyName: 'UserB',
      feeRate: 2,
      localCollateral: 201000000,
      maturityTime: new DateTime().toMillis(),
      remoteCollateral: 299000000,
      outcomes: [
        {
          local: 500000000,
          remote: 0,
          message: 'yes',
        },
        {
          local: 0,
          remote: 500000000,
          message: 'no',
        },
        {
          local: 250000000,
          remote: 250000000,
          message: 'maybe',
        },
      ],
      oracleInfo: {
        rValue: '1',
        publicKey: '1',
        assetId: '1',
        name: '1',
      },
      isLocalParty: false,
    },
    {
      id: 'testid2',
      state: ContractState.Initial,
      counterPartyName: 'UserB',
      feeRate: 2,
      localCollateral: 201000000,
      maturityTime: new DateTime().toMillis(),
      remoteCollateral: 299000000,
      outcomes: [
        {
          local: 500000000,
          remote: 0,
          message: 'yes',
        },
        {
          local: 0,
          remote: 500000000,
          message: 'no',
        },
        {
          local: 250000000,
          remote: 250000000,
          message: 'maybe',
        },
      ],
      oracleInfo: {
        rValue: '1',
        publicKey: '1',
        assetId: '1',
        name: '1',
      },
      isLocalParty: true,
    },
    {
      id: 'testid3',
      state: ContractState.Initial,
      counterPartyName: 'UserB',
      feeRate: 1.01,
      localCollateral: 201000000,
      maturityTime: new DateTime().toMillis(),
      remoteCollateral: 299000000,
      outcomes: [
        {
          local: 500000000,
          remote: 0,
          message: 'yes',
        },
        {
          local: 0,
          remote: 500000000,
          message: 'no',
        },
        {
          local: 250000000,
          remote: 250000000,
          message: 'maybe',
        },
      ],
      oracleInfo: {
        rValue: '1',
        publicKey: '1',
        assetId: '1',
        name: '1',
      },
      isLocalParty: false,
    },
  ]

  async hasContract(contractId: string): Promise<boolean> {
    try {
      return this._contracts.some(c => c.id === contractId)
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
      this._contracts.push(contract)
    } catch (error) {
      throw new RepositoryError(ErrorCode.InternalError, error.message)
    }
  }

  getContracts(query?: ContractQuery): Promise<AnyContract[]> {
    return new Promise<AnyContract[]>((resolve, reject) => {
      resolve(
        this._contracts
          .concat(this._contracts)
          .concat(this._contracts)
          .concat(this._contracts)
      )
    })
  }

  async getContract(
    contractId: string
  ): Promise<Failable<AnyContract, RepositoryError>> {
    const contract = this._contracts.find(c => c.id === contractId)
    if (contract) {
      return {
        success: true,
        value: contract,
      }
    } else {
      return {
        success: false,
        error: new RepositoryError(ErrorCode.NotFound, 'Not Found!'),
      }
    }
  }

  async updateContract(contract: AnyContract): Promise<void> {
    this._contracts = this._contracts.filter(c => c.id !== contract.id)
    this._contracts.push(contract)
    return Promise.resolve()
  }

  async deleteContract(contractId: string): Promise<void> {
    this._contracts = this._contracts.filter(c => c.id !== contractId)
    return Promise.resolve()
  }

  private GetKey(contractId: string): string {
    return getKeyPrefix(KeyPrefix.CONTRACT) + contractId
  }

  private IsMatch(contract: AnyContract, query: ContractQuery): boolean {
    const getTypedKeys = function<T>(o: T): (keyof T)[] {
      return Object.keys(o) as (keyof T)[]
    }

    return getTypedKeys(query).every(key => query[key] === contract[key])
  }
}
