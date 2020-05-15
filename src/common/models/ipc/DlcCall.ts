import { Contract } from '../dlc/Contract'
import { DlcEventType } from '../../constants/DlcEventType'

export interface DlcCall {
  type: DlcEventType
  contract: Contract
}
