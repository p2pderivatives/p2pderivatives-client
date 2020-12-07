import { DateTime } from 'luxon'
import { ContractState } from '../src/common/models/dlc/Contract'
import { Contract } from './common/models/dlc/Contract'

export const ContractTest: Contract = {
  state: ContractState.Initial,
  id: '1',
  counterPartyName: 'Bob',
  localCollateral: 100000000,
  remoteCollateral: 100000000,
  outcomes: [
    {
      outcome: '10000',
      payout: {
        local: 200000000,
        remote: 0,
      },
    },
  ],
  assetId: 'btcusd',
  oracleInfo: {
    name: '1',
    uri: '2',
  },
  maturityTime: DateTime.fromObject({
    year: 2020,
    month: 7,
    day: 8,
    hour: 1,
    minute: 1,
  }).toMillis(),
  feeRate: 2,
}
