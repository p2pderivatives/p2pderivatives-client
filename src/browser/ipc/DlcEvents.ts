import { DlcEventType } from '../../common/constants/DlcEventType'
import {
  DLC_EVENT,
  GET_CONTRACTS,
  OFFER_CONTRACT,
} from '../../common/constants/IPC'
import { Contract } from '../../common/models/dlc/Contract'
import { DlcAnswer } from '../../common/models/ipc/DlcAnswer'
import { DlcCall } from '../../common/models/ipc/DlcCall'
import { GetContractsAnswer } from '../../common/models/ipc/GetContractsAnswer'
import { IPCError } from '../../common/models/ipc/IPCError'
import { DlcManager } from '../dlc/controller/DlcManager'
import { toSimpleContract } from '../dlc/models/contract'
import { DlcService } from '../dlc/service/DlcService'
import { DlcError } from '../dlc/utils/DlcEventHandler'
import { IPCEventsBase } from './IPCEventsBase'
import { TaggedCallback } from './TaggedCallback'

export class DlcEvents extends IPCEventsBase {
  private readonly _dlcManager: DlcManager
  private readonly _dlcService: DlcService

  constructor(dlcManager: DlcManager, dlcService: DlcService) {
    super()
    this._dlcManager = dlcManager
    this._dlcService = dlcService
  }

  protected taggedCallbacks(): TaggedCallback[] {
    return [
      {
        tag: DLC_EVENT,
        callback: (data): Promise<DlcAnswer> =>
          this.dlcEventsCallback(data as DlcCall),
      },
      {
        tag: OFFER_CONTRACT,
        callback: (data): Promise<DlcAnswer> =>
          this.offerContractCallback(data as Contract),
      },
      {
        tag: GET_CONTRACTS,
        callback: (): Promise<GetContractsAnswer> =>
          this.getContractsCallback(),
      },
    ]
  }

  private async dlcEventsCallback(call: DlcCall): Promise<DlcAnswer> {
    try {
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
      return answer
    } catch (error) {
      return new DlcAnswer(
        false,
        undefined,
        new IPCError('DLCERROR', 1, error.message, 'Dlc error')
      )
    }
  }

  private async offerContractCallback(contract: Contract): Promise<DlcAnswer> {
    try {
      const returnContract = await this._dlcManager.sendContractOffer(contract)
      const answer = new DlcAnswer(true, returnContract)
      return answer
    } catch (error) {
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
  }

  private async getContractsCallback(): Promise<GetContractsAnswer> {
    const contracts = await this._dlcService.getAllContracts()
    return Promise.resolve(
      new GetContractsAnswer(
        true,
        contracts.map(x => toSimpleContract(x))
      )
    )
  }
}
