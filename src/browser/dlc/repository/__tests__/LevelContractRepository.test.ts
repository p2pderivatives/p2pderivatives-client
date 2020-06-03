import level from 'level-test'
import { LevelContractRepository } from '../LevelContractRepository'
import { InitialContract } from '../../models/contract/InitialContract'
import { ContractState } from '../../../../common/models/dlc/ContractState'
import Amount from '../../../../common/models/dlc/Amount'
import { ErrorCode } from '../../../storage/ErrorCode'
import { RepositoryError } from '../../../storage/RepositoryError'
import { RejectedContract } from '../../models/contract/RejectedContract'
import { ContractRepository } from '../../service/DlcService'
import { Contract } from '../../../../common/models/dlc/Contract'
import { ExtendedContractQuery } from '../../service/ContractQuery'
import { DateTime } from 'luxon'

const baseMaturityDate = DateTime.utc(2020, 5, 17, 15, 24)
const laterMaturityDate = DateTime.utc(2020, 5, 18, 15, 24)

function GenerateContract(
  id: number,
  name: string,
  maturityDate: DateTime = baseMaturityDate
): InitialContract {
  return InitialContract.CreateInitialContract(
    id.toString().padStart(4, '0'),
    name,
    Amount.FromBitcoin(1),
    Amount.FromBitcoin(1),
    [
      {
        local: Amount.FromBitcoin(2),
        remote: Amount.FromBitcoin(0),
        message: '1',
      },
    ],
    maturityDate ? maturityDate : baseMaturityDate,
    2,
    {
      name: 'oracle',
      rValue: 'a',
      publicKey: 'a',
      assetId: 'btcusd',
    },
    true,
    {
      premiumAmount: Amount.FromSatoshis(10000),
      localPays: true,
    }
  )
}

function GenerateContracts(
  nbContracts: number,
  names: string[] = ['alice', 'bob', 'carol'],
  maturityDate: DateTime = baseMaturityDate
): InitialContract[] {
  const contracts: InitialContract[] = []

  for (let i = 0; i < nbContracts; i++) {
    const contract = GenerateContract(i, names[i % names.length])
    contracts.push(contract)
  }

  return contracts
}

async function InsertContracts(
  contractRepo: ContractRepository,
  nbContracts: number,
  names: string[] = ['alice', 'bob', 'carol'],
  maturityDate: DateTime = baseMaturityDate
): Promise<InitialContract[]> {
  const contracts = GenerateContracts(nbContracts, names)
  for (let i = 0; i < nbContracts; i++) {
    await contractRepo.CreateContract(contracts[i])
  }

  return contracts
}

function InitializeDataBase(): ContractRepository {
  const options = {
    keyEncoding: 'hex',
    valueEncoding: 'json',
  }

  const db = level({ mem: true })(options)

  return new LevelContractRepository(db)
}

let contractRepo: ContractRepository

beforeEach(() => {
  contractRepo = InitializeDataBase()
})

test('Test create contract has contract and can be retrieved', async () => {
  // Arrange / Act
  const nbContracts = 10
  const contracts = await InsertContracts(contractRepo, nbContracts)

  // Assert
  for (let i = 0; i < nbContracts; i++) {
    const hasContract = await contractRepo.HasContract(contracts[i].id)
    expect(hasContract).toBeTruthy()
    const result = await contractRepo.GetContract(contracts[i].id)
    expect(result.hasError()).toBeFalsy()

    const value = result.getValue() as Contract
    expect(value).toEqual(contracts[i])
  }
})

test('Test create contract already inserted returns already exists error', async done => {
  // Arrange
  const contract = (await InsertContracts(contractRepo, 1))[0]

  // Act
  try {
    await contractRepo.CreateContract(contract)
    fail()
  } catch (error) {
    expect(error).toBeInstanceOf(RepositoryError)
    expect(error.errorCode).toEqual(ErrorCode.AlreadyExists)
    done()
  }
})

test('Test has contract with unknown contract returns false', async () => {
  // Arrange
  const contractRepo = InitializeDataBase()
  const unknownContractId = 'abc'

  // Act
  const hasContract = await contractRepo.HasContract(unknownContractId)

  // Assert

  expect(hasContract).toBeFalsy()
})

test('Test get unknown contract returns error', async () => {
  // Arrange
  const unknownContractId = 'abc'

  // Act
  const result = await contractRepo.GetContract(unknownContractId)

  // Assert

  expect(result.hasError()).toBeTruthy()
  const error = result.getError() as RepositoryError
  expect(error.errorCode).toEqual(ErrorCode.NotFound)
})

test('Test update contract is updated', async () => {
  // Arrange
  const contract = (await InsertContracts(contractRepo, 1))[0]
  const updatedContract = RejectedContract.CreateRejectedContract(contract)

  // Act
  await contractRepo.UpdateContract(updatedContract)

  // Assert
  const result = await contractRepo.GetContract(contract.id)
  const value = result.getValue() as Contract
  expect(value.state).toEqual(ContractState.Rejected)
})

test('Get contracts with initial state returns all contract in initial state', async () => {
  // Arrange
  const nbContracts = 10
  const contracts = GenerateContracts(nbContracts, ['alice', 'bob', 'carol'])
  contracts[0] = RejectedContract.CreateRejectedContract(contracts[0])

  for (let i = 0; i < nbContracts; i++) {
    await contractRepo.CreateContract(contracts[i])
  }

  // Act
  const retrievedContracts = await contractRepo.GetContracts({
    state: ContractState.Initial,
  })

  // Assert
  expect(retrievedContracts.length).toEqual(nbContracts - 1)
  retrievedContracts.forEach(contract =>
    expect(contract.state).toEqual(ContractState.Initial)
  )
})

test('Get contracts with multiple states returns all contract in requested states', async () => {
  // Arrange
  const nbContracts = 10
  const contracts = GenerateContracts(nbContracts, ['alice', 'bob', 'carol'])
  contracts[0] = RejectedContract.CreateRejectedContract(contracts[0])

  for (let i = 0; i < nbContracts; i++) {
    await contractRepo.CreateContract(contracts[i])
  }

  // Act
  const retrievedContracts = await contractRepo.GetContracts({
    states: [ContractState.Initial, ContractState.Rejected],
  })

  // Assert
  expect(retrievedContracts.length).toEqual(nbContracts)
})

test('Get contracts with state returns all contract in state', async () => {
  // Arrange
  const nbContracts = 10
  await InsertContracts(contractRepo, nbContracts)

  // Act
  const aliceContracts = await contractRepo.GetContracts({
    counterPartyName: 'alice',
  })
  const bobContracts = await contractRepo.GetContracts({
    counterPartyName: 'bob',
  })
  const carolContracts = await contractRepo.GetContracts({
    counterPartyName: 'carol',
  })

  // Assert
  expect(aliceContracts.length).toEqual(4)
  expect(bobContracts.length).toEqual(3)
  expect(carolContracts.length).toEqual(3)
})

test('Get contracts matured before returns matured contracts', async () => {
  // Arrange
  const contracts = await InsertContracts(contractRepo, 10)
  await contractRepo.DeleteContract(contracts[0].id)

  await InsertContracts(contractRepo, 1, undefined, laterMaturityDate)
  const queryDate = laterMaturityDate.minus({ hour: 2 })
  const query: ExtendedContractQuery = {
    maturedBefore: queryDate,
  }

  // Act
  const retrieved = await contractRepo.GetContracts(query)

  // Assert
  expect(retrieved.length).toEqual(10)
})

test('Get contracts with state returns all contract in state', async () => {
  // Arrange
  const contract = (await InsertContracts(contractRepo, 1))[0]

  // Act
  await contractRepo.DeleteContract(contract.id)
  const result = await contractRepo.GetContract(contract.id)

  // Assert
  expect(result.hasError()).toBeTruthy()
  const error = result.getError() as RepositoryError
  expect(error.errorCode).toEqual(ErrorCode.NotFound)
})
