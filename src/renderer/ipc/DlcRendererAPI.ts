import { ContractState } from '../../common/models/dlc/ContractState'
import { DlcEventType } from '../../common/constants/DlcEventType'
import { ContractSimple } from '../../common/models/ipc/ContractSimple'

export interface DlcRendererAPI {
  dlcCall(type: DlcEventType, contractId: string): Promise<ContractSimple>
  offerContract(contract: ContractSimple): Promise<ContractSimple>
  getContracts(
    id?: string,
    state?: ContractState,
    counterPartyName?: string
  ): Promise<ContractSimple[]>
}
