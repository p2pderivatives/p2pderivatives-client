import { DlcBrowserAPI } from '../src/browser/ipc/DlcBrowserAPI'
import { DlcEventType } from '../src/common/constants/DlcEventType'
import { Contract } from '../src/common/models/dlc/Contract'
import { ContractSimple } from '../src/common/models/ipc/ContractSimple'

export class DlcIPCBrowserAPIMock implements DlcBrowserAPI {
  public callback: () => void = () => {}

  dlcUpdate(contract: ContractSimple): Promise<void> {
    this.callback()
    return Promise.resolve()
  }
}
