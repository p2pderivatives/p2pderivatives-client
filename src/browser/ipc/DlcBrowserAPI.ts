import { Contract } from '../../common/models/dlc/Contract'
import { DlcEventType } from '../../common/constants/DlcEventType'

export interface DlcBrowserAPI {
  dlcCall(eventCode: DlcEventType, contract: Contract): Promise<void>
}
