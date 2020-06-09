import { ContractState } from '../../common/models/dlc/ContractState'
import { DlcEventType } from '../../common/constants/DlcEventType'
import { ContractSimple } from '../../common/models/ipc/ContractSimple'
import { DlcAnswer } from '../../common/models/ipc/DlcAnswer'

export interface DlcRendererAPI {
  dlcCall(type: DlcEventType, contractId: string): Promise<DlcAnswer>
  offerContract(contract: ContractSimple): Promise<DlcAnswer>
  getContracts(
    id?: string,
    state?: ContractState,
    counterPartyName?: string
  ): Promise<ContractSimple[]>
}
