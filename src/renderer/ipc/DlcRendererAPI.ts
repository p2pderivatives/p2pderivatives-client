import { DlcEventType } from '../../common/constants/DlcEventType'
import { Contract } from '../../common/models/dlc/Contract'
import { DlcAnswer } from '../../common/models/ipc/DlcAnswer'
import { GetContractsCall } from '../../common/models/ipc/GetContractsCall'

export interface DlcRendererAPI {
  dlcCall(type: DlcEventType, contractId: string): Promise<DlcAnswer>
  offerContract(contract: Contract): Promise<DlcAnswer>
  getContracts(call?: GetContractsCall): Promise<Contract[]>
}
