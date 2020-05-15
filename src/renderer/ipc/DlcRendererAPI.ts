import { ContractState } from '../../common/models/dlc/ContractState'
import { Contract } from '../../common/models/dlc/Contract'
import { DlcEventType } from '../../common/constants/DlcEventType'

export interface DlcRendererAPI {
  dlcCall(type: DlcEventType, contract: Contract): Promise<Contract>
  getContracts(
    id?: string,
    state?: ContractState,
    counterPartyName?: string
  ): Promise<Contract[]>
}
