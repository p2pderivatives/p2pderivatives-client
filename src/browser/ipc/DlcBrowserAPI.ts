import { ContractSimple } from '../../common/models/ipc/ContractSimple'

export interface DlcBrowserAPI {
  dlcUpdate(contract: ContractSimple): Promise<void>
}
