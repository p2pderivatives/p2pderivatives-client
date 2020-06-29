import { Contract } from '../../../common/models/dlc/Contract'
import { ContractState } from '../../../common/models/dlc/ContractState'
import { DateTime } from 'luxon'

export const contracts: Contract[] = [
  {
    id: 'testid1',
    state: ContractState.Offered,
    counterPartyName: 'UserB',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc().toMillis(),
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
      name: 'Olivia',
      rValue: '1',
      publicKey: '1',
      assetId: 'btcusd',
    },
  },
  {
    id: 'testid2',
    state: ContractState.Accepted,
    counterPartyName: 'UserC',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc()
      .plus({ days: 1 })
      .toMillis(),
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
      name: 'Olivia',
      rValue: '1',
      publicKey: '1',
      assetId: 'btcusd',
    },
  },
  {
    id: 'testid3',
    state: ContractState.MutualClosed,
    counterPartyName: 'UserD',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc()
      .plus({ days: 2 })
      .toMillis(),
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
      name: 'Olivia',
      rValue: '1',
      publicKey: '1',
      assetId: 'btcusd',
    },
  },
  {
    id: 'testid4',
    state: ContractState.MutualClosed,
    counterPartyName: 'UserE',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc()
      .plus({ days: 3 })
      .toMillis(),
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
      name: 'Olivia',
      rValue: '1',
      publicKey: '1',
      assetId: 'btcusd',
    },
  },
  {
    id: 'testid6',
    state: ContractState.MutualClosed,
    counterPartyName: 'UserF',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc()
      .plus({ days: 6 })
      .toMillis(),
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
      name: 'Olivia',
      rValue: '1',
      publicKey: '1',
      assetId: 'btcusd',
    },
  },
  {
    id: 'testid7',
    state: ContractState.MutualClosed,
    counterPartyName: 'UserG',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc()
      .plus({ days: 10 })
      .toMillis(),
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
      name: 'Olivia',
      rValue: '1',
      publicKey: '1',
      assetId: 'btcusd',
    },
  },
]
