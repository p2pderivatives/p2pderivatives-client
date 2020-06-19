import { ContractState } from '../src/common/models/dlc/ContractState'
import { DateTime } from 'luxon'
import { InitialContract } from '../src/browser/dlc/models/contract'

export const ContractTest: InitialContract = {
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
  maturityTime: DateTime.utc().toMillis(),
  feeRate: 2,
  isLocalParty: true,
}
