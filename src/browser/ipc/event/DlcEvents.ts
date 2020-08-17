import { DlcEventType } from '../../../common/constants/DlcEventType'
import { IPCEventRegisterBase } from '../../../common/ipc/BaseIPC'
import { TaggedCallbacks } from '../../../common/ipc/IPC'
import {
  DlcCall,
  DlcChannels,
  DlcFailableAsync,
} from '../../../common/ipc/model/dlc'
import { Contract } from '../../../common/models/dlc/Contract'
import { Success } from '../../../common/utils/failable'
import { DlcManager } from '../../dlc/controller/DlcManager'
import { OfferedContract } from '../../dlc/models/contract'
import { DlcService } from '../../dlc/service/DlcService'
import { DlcError } from '../../dlc/utils/DlcEventHandler'

export class DlcEvents extends IPCEventRegisterBase<DlcChannels> {
  private readonly _dlcManager: DlcManager
  private readonly _dlcService: DlcService

  constructor(dlcManager: DlcManager, dlcService: DlcService) {
    super()
    this._dlcManager = dlcManager
    this._dlcService = dlcService
  }

  protected taggedCallbacks: TaggedCallbacks<DlcChannels> = {
    getAllContracts: {
      tag: 'dlc/contract/get-all',
      callback: this.getContractsCallback.bind(this),
    },
    offerContract: {
      tag: 'dlc/contract/offer',
      callback: this.offerContractCallback.bind(this),
    },
    dlcCall: {
      tag: 'dlc/events',
      callback: this.dlcEventsCallback.bind(this),
    },
  }

  private async dlcEventsCallback(call: DlcCall): DlcFailableAsync<Contract> {
    try {
      let contract: Contract
      switch (call.type) {
        case DlcEventType.Accept:
          contract = await this._dlcManager.acceptContractOffer(call.contractId)
          break
        default:
          contract = await this._dlcManager.rejectContractOffer(call.contractId)
          break
      }
      return Success(contract)
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'dlc',
          code: 1,
          message: e.message,
          name: 'Events Error',
        },
      }
    }
  }

  private async offerContractCallback(
    contract: Contract
  ): DlcFailableAsync<OfferedContract> {
    try {
      const returnedContract = await this._dlcManager.sendContractOffer(
        contract
      )
      return Success(returnedContract)
    } catch (e) {
      return {
        success: false,
        error: {
          type: 'dlc',
          code: 2,
          message: e.message,
          name: 'Offer Contract Error',
          contract: e instanceof DlcError ? e.contract : undefined,
        },
      }
    }
  }

  private async getContractsCallback(): DlcFailableAsync<Contract[]> {
    const contracts = await this._dlcService.getAllContracts()
    return Success(contracts)
  }
}
