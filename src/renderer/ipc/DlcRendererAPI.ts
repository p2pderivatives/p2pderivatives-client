import { ContractState } from '../../common/models/dlc/ContractState'
import { DlcEventType } from '../../common/constants/DlcEventType'
import { Contract } from '../../common/models/dlc/Contract'
import { DlcAnswer } from '../../common/models/ipc/DlcAnswer'

export interface DlcRendererAPI {
  dlcCall(type: DlcEventType, contractId: string): Promise<DlcAnswer>
  offerContract(contract: Contract): Promise<DlcAnswer>
  getContracts(
    id?: string,
    state?: ContractState,
    counterPartyName?: string
  ): Promise<Contract[]>
}
