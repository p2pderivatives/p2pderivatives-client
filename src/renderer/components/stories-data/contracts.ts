import { DateTime } from 'luxon'
import { Contract, ContractState } from '../../../common/models/dlc/Contract'

export const contracts: Contract[] = [
  {
    id: 'testid1',
    state: ContractState.Offered,
    counterPartyName: 'UserB',
    feeRate: 2,
    oracleInfo: { name: 'Oracle', uri: 'www.ooracle.com' },
    assetId: 'btcusd',
    localCollateral: 201000000,
    maturityTime: DateTime.utc().toMillis(),
    remoteCollateral: 299000000,
    outcomes: [
      {
        payout: {
          local: 500000000,
          remote: 0,
        },
        outcome: 'yes',
      },
      {
        payout: {
          local: 0,
          remote: 500000000,
        },
        outcome: 'no',
      },
      {
        payout: {
          local: 250000000,
          remote: 250000000,
        },
        outcome: 'maybe',
      },
    ],
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
        payout: {
          local: 500000000,
          remote: 0,
        },
        outcome: 'yes',
      },
      {
        payout: {
          local: 0,
          remote: 500000000,
        },
        outcome: 'no',
      },
      {
        payout: {
          local: 250000000,
          remote: 250000000,
        },
        outcome: 'maybe',
      },
    ],
    assetId: 'btcusd',
    oracleInfo: {
      name: 'Olivia',
      uri: 'www.oracle.com',
    },
  },
  {
    id: 'testid3',
    state: ContractState.Closed,
    counterPartyName: 'UserD',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc()
      .plus({ days: 2 })
      .toMillis(),
    remoteCollateral: 299000000,
    outcomes: [
      {
        payout: {
          local: 500000000,
          remote: 0,
        },
        outcome: 'yes',
      },
      {
        payout: {
          local: 0,
          remote: 500000000,
        },
        outcome: 'no',
      },
      {
        payout: {
          local: 250000000,
          remote: 250000000,
        },
        outcome: 'maybe',
      },
    ],
    assetId: 'btcusd',
    oracleInfo: {
      name: 'Olivia',
      uri: 'www.oracle.com',
    },
  },
  {
    id: 'testid4',
    state: ContractState.Closed,
    counterPartyName: 'UserE',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc()
      .plus({ days: 3 })
      .toMillis(),
    remoteCollateral: 299000000,
    outcomes: [
      {
        payout: {
          local: 500000000,
          remote: 0,
        },
        outcome: 'yes',
      },
      {
        payout: {
          local: 0,
          remote: 500000000,
        },
        outcome: 'no',
      },
      {
        payout: {
          local: 250000000,
          remote: 250000000,
        },
        outcome: 'maybe',
      },
    ],
    assetId: 'btcusd',
    oracleInfo: {
      name: 'Olivia',
      uri: 'www.oracle.com',
    },
  },
  {
    id: 'testid6',
    state: ContractState.Closed,
    counterPartyName: 'UserF',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc()
      .plus({ days: 6 })
      .toMillis(),
    remoteCollateral: 299000000,
    outcomes: [
      {
        payout: {
          local: 500000000,
          remote: 0,
        },
        outcome: 'yes',
      },
      {
        payout: {
          local: 0,
          remote: 500000000,
        },
        outcome: 'no',
      },
      {
        payout: {
          local: 250000000,
          remote: 250000000,
        },
        outcome: 'maybe',
      },
    ],
    assetId: 'btcusd',
    oracleInfo: {
      name: 'Olivia',
      uri: 'www.oracle.com',
    },
  },
  {
    id: 'testid7',
    state: ContractState.Closed,
    counterPartyName: 'UserG',
    feeRate: 2,
    localCollateral: 201000000,
    maturityTime: DateTime.utc()
      .plus({ days: 10 })
      .toMillis(),
    remoteCollateral: 299000000,
    outcomes: [
      {
        payout: {
          local: 500000000,
          remote: 0,
        },
        outcome: 'yes',
      },
      {
        payout: {
          local: 0,
          remote: 500000000,
        },
        outcome: 'no',
      },
      {
        payout: {
          local: 250000000,
          remote: 250000000,
        },
        outcome: 'maybe',
      },
    ],
    assetId: 'btcusd',
    oracleInfo: {
      name: 'Olivia',
      uri: 'www.oracle.com',
    },
  },
]
