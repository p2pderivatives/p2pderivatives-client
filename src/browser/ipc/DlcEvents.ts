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
import { TaggedCallback, registerTaggedCallbacks } from './Utils'

export class DlcEvents implements IPCEvents {
  private readonly _dlcManager: DlcManager
  private readonly _dlcService: DlcService
  private _unregisterers: (() => void)[] = []

  constructor(dlcManager: DlcManager, dlcService: DlcService) {
    this._dlcManager = dlcManager
    this._dlcService = dlcService
  }

  unregisterReplies(): void {
    for (const unregisterer of this._unregisterers) {
      unregisterer()
    }
  }

  registerReplies(): void {
    const taggedCallbacks: TaggedCallback[] = [
      { tag: DLC_EVENT, callback: data => this.dlcEventsCallback(data) },
      {
        tag: OFFER_CONTRACT,
        callback: data => this.offerContractCallback(data),
      },
      { tag: GET_CONTRACTS, callback: () => this.getContractsCallback() },
    ]

    this._unregisterers = registerTaggedCallbacks(taggedCallbacks)
  }

  private async dlcEventsCallback(data: unknown) {
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
  }

  private async offerContractCallback(data: unknown) {
    const contract = data as Contract
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

  private async getContractsCallback() {
    const contracts = await this._dlcService.getAllContracts()
    return Promise.resolve(new GetContractsAnswer(true, contracts))
  }
}
