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
      message: '10000',
      local: 200000000,
      remote: 0,
    },
  ],
  oracleInfo: {
    name: '1',
    rValue: '1',
    publicKey: '1',
    assetId: 'btcusd',
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
