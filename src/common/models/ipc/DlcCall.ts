import { DlcEventType } from '../../constants/DlcEventType'

export interface DlcCall {
  type: DlcEventType
  contractId: string
}
