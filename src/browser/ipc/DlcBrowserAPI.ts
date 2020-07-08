import { Contract } from '../../common/models/dlc/Contract'

export interface DlcBrowserAPI {
  dlcUpdate(contract: Contract): Promise<void>
}
