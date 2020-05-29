import { ContractRepository } from '../service/DlcService'
import { KeyPrefix, GetKeyPrefix } from '../../storage/KeyPrefix'
import { RepositoryError } from '../../storage/RepositoryError'
import { ErrorCode } from '../../storage/ErrorCode'
import { GetRepositoryResult } from '../../storage/LevelUtils'
import { RepositoryResult } from '../../storage/RepositoryResult'
import { Contract } from '../../../common/models/dlc/Contract'
import { ContractQuery } from '../service/ContractQuery'
import { ContractState } from '../../../common/models/dlc/ContractState'
import Amount from '../../../common/models/dlc/Amount'

export class TestContractRepository implements ContractRepository {
  private _contracts: Contract[] = [
    {
      id: 'testid1',
      state: ContractState.Offered,
      counterPartyName: 'UserB',
      feeRate: 1.01,
      localCollateral: Amount.FromBitcoin(2.01),
      maturityTime: new Date(),
      remoteCollateral: Amount.FromBitcoin(2.99),
      outcomes: [
        {
          local: Amount.FromBitcoin(5),
          remote: Amount.FromBitcoin(0),
          message: 'yes',
        },
        {
          local: Amount.FromBitcoin(0),
          remote: Amount.FromBitcoin(5.0),
          message: 'no',
        },
        {
          local: Amount.FromBitcoin(2.5),
          remote: Amount.FromBitcoin(2.5),
          message: 'maybe',
        },
      ],
    },
    {
      id: 'testid2',
      state: ContractState.Accepted,
      counterPartyName: 'UserB',
      feeRate: 1.01,
      localCollateral: Amount.FromBitcoin(2.01),
      maturityTime: new Date(),
      remoteCollateral: Amount.FromBitcoin(2.99),
      outcomes: [
        {
          local: Amount.FromBitcoin(5),
          remote: Amount.FromBitcoin(0),
          message: 'yes',
        },
        {
          local: Amount.FromBitcoin(0),
          remote: Amount.FromBitcoin(5.0),
          message: 'no',
        },
        {
          local: Amount.FromBitcoin(2.5),
          remote: Amount.FromBitcoin(2.5),
          message: 'maybe',
        },
      ],
    },
    {
      id: 'testid3',
      state: ContractState.MutualClosed,
      counterPartyName: 'UserB',
      feeRate: 1.01,
      localCollateral: Amount.FromBitcoin(2.01),
      maturityTime: new Date(),
      remoteCollateral: Amount.FromBitcoin(2.99),
      outcomes: [
        {
          local: Amount.FromBitcoin(5),
          remote: Amount.FromBitcoin(0),
          message: 'yes',
        },
        {
          local: Amount.FromBitcoin(0),
          remote: Amount.FromBitcoin(5.0),
          message: 'no',
        },
        {
          local: Amount.FromBitcoin(2.5),
          remote: Amount.FromBitcoin(2.5),
          message: 'maybe',
        },
      ],
    },
  ]

  async HasContract(contractId: string): Promise<boolean> {
    try {
      return this._contracts.some(c => c.id === contractId)
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
      this._contracts.push(contract)
    } catch (error) {
      throw new RepositoryError(ErrorCode.InternalError, error.message)
    }
  }

  GetContracts(query?: ContractQuery): Promise<Contract[]> {
    return new Promise<Contract[]>((resolve, reject) => {
      resolve(
        this._contracts
          .concat(this._contracts)
          .concat(this._contracts)
          .concat(this._contracts)
      )
    })
  }

  async GetContract(contractId: string): Promise<RepositoryResult<Contract>> {
    const contract = this._contracts.find(c => c.id === contractId)
    if (contract) {
      return new RepositoryResult<Contract>(contract)
    } else {
      return new RepositoryResult<Contract>(
        undefined,
        new RepositoryError(ErrorCode.NotFound, 'Not Found!')
      )
    }
  }

  async UpdateContract(contract: Contract): Promise<void> {
    this._contracts = this._contracts.filter(c => c.id !== contract.id)
    this._contracts.push(contract)
    return Promise.resolve()
  }

  async DeleteContract(contractId: string): Promise<void> {
    this._contracts = this._contracts.filter(c => c.id !== contractId)
    return Promise.resolve()
  }

  private GetKey(contractId: string): string {
    return GetKeyPrefix(KeyPrefix.CONTRACT) + contractId
  }

  private IsMatch(contract: Contract, query: ContractQuery): boolean {
    const getTypedKeys = function<T>(o: T): (keyof T)[] {
      return Object.keys(o) as (keyof T)[]
    }

    return getTypedKeys(query).every(key => query[key] === contract[key])
  }
}
