import { ipcMain as ipc } from 'electron-better-ipc'
import { DlcEventType } from '../../common/constants/DlcEventType'
import {
  DLC_EVENT,
  GET_CONTRACTS,
  OFFER_CONTRACT,
} from '../../common/constants/IPC'
import { DlcAnswer } from '../../common/models/ipc/DlcAnswer'
import { DlcCall } from '../../common/models/ipc/DlcCall'
import { GetContractsAnswer } from '../../common/models/ipc/GetContractsAnswer'
import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { DlcManager } from '../dlc/controller/DlcManager'
import { DlcService } from '../dlc/service/DlcService'
import { DlcError } from '../dlc/utils/DlcEventHandler'
import { IPCError } from '../../common/models/ipc/IPCError'
import { Contract } from '../../common/models/dlc/Contract'

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
          await this._dlcManager.acceptContractOffer(call.contractId)
        )
      } else {
        answer = new DlcAnswer(
          true,
          await this._dlcManager.rejectContractOffer(call.contractId)
        )
      }
      return Promise.resolve(answer)
    })

    ipc.answerRenderer(OFFER_CONTRACT, async data => {
      const contract = data as Contract
      try {
        console.log('RECEIVED CALL')
        const returnContract = await this._dlcManager.sendContractOffer(
          contract
        )
        const answer = new DlcAnswer(true, returnContract)
        return answer
      } catch (error) {
        console.log(error)
        if (error instanceof DlcError) {
          return new DlcAnswer(
            false,
            error.contract,
            new IPCError('DLCERROR', 1, error.message, error.name)
          )
        }
        return new DlcAnswer(
          false,
          undefined,
          new IPCError('DLCERROR', 1, error.message, error.name)
        )
      }
    })

    ipc.answerRenderer(GET_CONTRACTS, async () => {
      const contracts = await this._dlcService.getAllContracts()
      return Promise.resolve(new GetContractsAnswer(true, contracts))
    })
  }
}
