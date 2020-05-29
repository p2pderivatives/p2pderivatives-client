import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { ipcMain as ipc } from 'electron-better-ipc'
import {
  DLC_EVENT,
  GET_CONTRACTS,
  OFFER_CONTRACT,
} from '../../common/constants/IPC'
import { DlcAnswer } from '../../common/models/ipc/DlcAnswer'
import { GetContractsAnswer } from '../../common/models/ipc/GetContractsAnswer'
import { fromContract, ContractSimple, toContract } from '../../common/models/ipc/ContractSimple'
import { ContractState } from '../../common/models/dlc/ContractState'
import Amount from '../../common/models/dlc/Amount'
import { DateTime } from 'luxon'
import { DlcService } from '../dlc/service/DlcService'
import { Contract } from '../../common/models/dlc/Contract'
import { DlcCall } from '../../common/models/ipc/DlcCall'
import { DlcEventType } from '../../common/constants/DlcEventType'
import { DlcManager } from '../dlc/models/DlcManager'
import { ContractOfferCall } from '../../common/models/ipc/ContractOfferCall'

export class DlcEvents implements IPCEvents {
  private readonly _dlcManager: DlcManager
  private readonly _dlcService: DlcService

  constructor(dlcManager: DlcManager, dlcService: DlcService) {
    this._dlcManager = dlcManager
    this._dlcService = dlcService
  }

  registerReplies(): void {
    ipc.answerRenderer(DLC_EVENT, async data => {
      const call = data as DlcCall
      let answer: DlcAnswer
      if (call.type === DlcEventType.Accept) {
        answer = new DlcAnswer(
          true,
          fromContract(
            await this._dlcManager.AcceptContractOffer(call.contractId)
          )
        )
      } else {
        answer = new DlcAnswer(
          true,
          fromContract(
            await this._dlcManager.RejectContractOffer(call.contractId)
          )
        )
      }
      return Promise.resolve(answer)
    })

    ipc.answerRenderer(OFFER_CONTRACT, async data => {
      const call = data as ContractOfferCall
      const newContract = toContract(call.contract)
      const returnContract = fromContract(
        await this._dlcManager.SendContractOffer(newContract)
      )
      //TODO return answer with new contract
    })

    ipc.answerRenderer(GET_CONTRACTS, async () => {
      const contracts = await this._dlcService.GetAllContracts()
      const simpleContracts = contracts.map(c => fromContract(c))
      return Promise.resolve(new GetContractsAnswer(true, simpleContracts))
    })
  }
}
