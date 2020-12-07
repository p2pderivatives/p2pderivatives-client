import level from 'level-test'
import { DateTime } from 'luxon'
import { ContractState } from '../../../../common/models/dlc/Contract'
import { isSuccessful } from '../../../../common/utils/failable'
import { ErrorCode } from '../../../storage/ErrorCode'
import { RepositoryError } from '../../../storage/RepositoryError'
import {
  AnyContract,
  InitialContract,
  RejectedContract,
} from '../../models/contract'
import { ExtendedContractQuery } from '../../service/ContractQuery'
import { ContractRepository } from '../../service/DlcService'
import { LevelContractRepository } from '../LevelContractRepository'

const baseMaturityDate = DateTime.utc(2020, 5, 17, 15, 24)
const laterMaturityDate = DateTime.utc(2020, 5, 18, 15, 24)

function generateContract(
  id: number,
  name: string,
  maturityDate: DateTime = baseMaturityDate
): InitialContract {
  return {
    state: ContractState.Initial,
    id: id.toString().padStart(4, '0'),
    counterPartyName: name,
    localCollateral: 100000000,
    remoteCollateral: 100000000,
    assetId: 'btcusd',
    oracleAnnouncement: {
      announcementSignature: '',
      oraclePublicKey: 'pubkey',
      oracleEvent: {
        nonces: [''],
        eventMaturity: DateTime.fromObject({ year: 2010 }).toISO(),
        eventId: '',
        eventDescriptor: {
          outcomes: [''],
        },
      },
    },
    outcomes: [
      {
        payout: {
          local: 200000000,
          remote: 0,
        },
        outcome: '1',
      },
    ],
    maturityTime: maturityDate.toMillis(),
    feeRate: 2,
    oracleInfo: {
      name: 'oracle',
      uri: 'www.oracle.com',
    },
    isLocalParty: true,
  }
}

function generateContracts(
  nbContracts: number,
  names: string[] = ['alice', 'bob', 'carol'],
  maturityDate: DateTime = baseMaturityDate
): AnyContract[] {
  const contracts: InitialContract[] = []

  for (let i = 0; i < nbContracts; i++) {
    const contract = generateContract(i, names[i % names.length], maturityDate)
    contracts.push(contract)
  }

  return contracts
}

async function insertContracts(
  contractRepo: ContractRepository,
  nbContracts: number,
  names: string[] = ['alice', 'bob', 'carol'],
  maturityDate: DateTime = baseMaturityDate
): Promise<AnyContract[]> {
  const contracts = generateContracts(nbContracts, names, maturityDate)
  for (let i = 0; i < nbContracts; i++) {
    await contractRepo.createContract(contracts[i])
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
  const contracts = await insertContracts(contractRepo, nbContracts)

  // Assert
  for (let i = 0; i < nbContracts; i++) {
    const hasContract = await contractRepo.hasContract(contracts[i].id)
    expect(hasContract).toBeTruthy()
    const result = await contractRepo.getContract(contracts[i].id)

    if (isSuccessful(result)) {
      const value = result.value
      expect(value).toEqual(contracts[i])
    } else {
      fail()
    }
  }
})

test('Test create contract already inserted returns already exists error', async done => {
  // Arrange
  const contract = (await insertContracts(contractRepo, 1))[0]

  // Act
  try {
    await contractRepo.createContract(contract)
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
  const unknownContractId = '0203'

  // Act
  const hasContract = await contractRepo.hasContract(unknownContractId)

  // Assert

  expect(hasContract).toBeFalsy()
})

test('Test get unknown contract returns error', async () => {
  // Arrange
  const unknownContractId = '0203'

  // Act
  const result = await contractRepo.getContract(unknownContractId)

  // Assert

  if (!isSuccessful(result)) {
    const error = result.error
    expect(error.errorCode).toEqual(ErrorCode.NotFound)
  } else {
    fail()
  }
})

test('Test update contract is updated', async () => {
  // Arrange
  const contract = (await insertContracts(contractRepo, 1))[0]
  const updatedContract: RejectedContract = {
    ...contract,
    state: ContractState.Rejected,
    isLocalParty: true,
  }

  // Act
  await contractRepo.updateContract(updatedContract)

  // Assert
  const result = await contractRepo.getContract(contract.id)
  if (isSuccessful(result)) {
    const value = result.value
    expect(value.state).toEqual(ContractState.Rejected)
  } else {
    fail()
  }
})

test('Get contracts with initial state returns all contract in initial state', async () => {
  // Arrange
  const nbContracts = 10
  const contracts = generateContracts(nbContracts, ['alice', 'bob', 'carol'])
  contracts[0] = { ...contracts[0], state: ContractState.Rejected }

  for (let i = 0; i < nbContracts; i++) {
    await contractRepo.createContract(contracts[i])
  }

  // Act
  const retrievedContracts = await contractRepo.getContracts({
    states: [ContractState.Initial],
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
  const contracts = generateContracts(nbContracts, ['alice', 'bob', 'carol'])
  contracts[0] = { ...contracts[0], state: ContractState.Rejected }

  for (let i = 0; i < nbContracts; i++) {
    await contractRepo.createContract(contracts[i])
  }

  // Act
  const retrievedContracts = await contractRepo.getContracts({
    states: [ContractState.Initial, ContractState.Rejected],
  })

  // Assert
  expect(retrievedContracts.length).toEqual(nbContracts)
})

test('Get contracts with state returns all contract in state', async () => {
  // Arrange
  const nbContracts = 10
  await insertContracts(contractRepo, nbContracts)

  // Act
  const aliceContracts = await contractRepo.getContracts({
    counterPartyName: 'alice',
  })
  const bobContracts = await contractRepo.getContracts({
    counterPartyName: 'bob',
  })
  const carolContracts = await contractRepo.getContracts({
    counterPartyName: 'carol',
  })

  // Assert
  expect(aliceContracts.length).toEqual(4)
  expect(bobContracts.length).toEqual(3)
  expect(carolContracts.length).toEqual(3)
})

test('Get contracts matured before returns matured contracts', async () => {
  // Arrange
  const contracts = await insertContracts(contractRepo, 10)
  await contractRepo.deleteContract(contracts[0].id)

  await insertContracts(contractRepo, 1, undefined, laterMaturityDate)
  const queryDate = laterMaturityDate.minus({ hour: 2 })
  const query: ExtendedContractQuery = {
    maturedBefore: queryDate,
  }

  // Act
  const retrieved = await contractRepo.getContracts(query)

  // Assert
  expect(retrieved.length).toEqual(9)
})

test('Get contracts with state returns all contract in state', async () => {
  // Arrange
  const contract = (await insertContracts(contractRepo, 1))[0]

  // Act
  await contractRepo.deleteContract(contract.id)
  const result = await contractRepo.getContract(contract.id)

  // Assert
  if (!isSuccessful(result)) {
    const error = result.error
    expect(error.errorCode).toEqual(ErrorCode.NotFound)
  } else {
    fail()
  }
})

test('Create contract with invalid id throws', async () => {
  const contract = {
    ...generateContract(1, 'test'),
    id: '1',
  }
  expect(contractRepo.createContract(contract)).rejects.toThrow(Error)
})
