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
    id: 'testid3',
    state: ContractState.MutualClosed,
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
]
