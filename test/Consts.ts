import { Contract } from './common/models/dlc/Contract'
import Amount from '../src/common/models/dlc/Amount'
import { ContractState } from '../src/common/models/dlc/ContractState'
import { DateTime } from 'luxon'

export const ContractTest: Contract = {
  state: ContractState.Initial,
  id: '1',
  counterPartyName: 'Bob',
  localCollateral: Amount.FromBitcoin(1),
  remoteCollateral: Amount.FromBitcoin(1),
  outcomes: [
    {
      message: '10000',
      local: Amount.FromBitcoin(2),
      remote: Amount.FromBitcoin(0),
    },
  ],
  oracleInfo: {
    name: '1',
    rValue: '1',
    publicKey: '1',
    assetId: 'btcusd',
  },
  maturityTime: new DateTime(),
  feeRate: 2,
}
