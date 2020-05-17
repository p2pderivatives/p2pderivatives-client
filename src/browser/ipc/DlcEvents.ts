import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { ipcMain as ipc } from 'electron-better-ipc'
import { DLC_EVENT, GET_CONTRACTS } from '../../common/constants/IPC'
import { DlcAnswer } from '../../common/models/ipc/DlcAnswer'
import { GetContractsAnswer } from '../../common/models/ipc/GetContractsAnswer'
import { Contract } from '../../common/models/dlc/Contract'
import { ContractState } from '../../common/models/dlc/ContractState'
import Amount from '../../common/models/dlc/Amount'
import { DateTime } from 'luxon'
import { DlcService } from '../dlc/service/DlcService'

export class DlcEvents implements IPCEvents {
  private readonly _dlcService: DlcService

  constructor(dlcService: DlcService) {
    this._dlcService = dlcService
  }

  registerReplies(): void {
    ipc.answerRenderer(DLC_EVENT, data => {
      // TODO(Tibo): implement logic
      const contract: Contract = {
        id: '1',
        counterPartyName: 'bob',
        state: ContractState.Offered,
        localCollateral: Amount.FromBitcoin(1),
        remoteCollateral: Amount.FromBitcoin(1),
        outcomes: [],
        maturityTime: DateTime.utc(),
        feeRate: 2,
        oracleInfo: {
          name: 'olivia',
          rValue: '1',
          publicKey: '1',
        },
        premiumInfo: {
          premiumAmount: Amount.FromBitcoin(1),
          localPays: true,
        },
      }
      return Promise.resolve(new DlcAnswer(true, contract))
    })
    ipc.answerRenderer(GET_CONTRACTS, async () => {
      const contracts = await this._dlcService.GetAllContracts()
      return Promise.resolve(new GetContractsAnswer(true, contracts))
    })
  }
}
