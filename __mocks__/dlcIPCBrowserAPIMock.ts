import { DlcBrowserAPI } from '../src/browser/ipc/DlcBrowserAPI'
import { Contract } from '../src/common/models/dlc/Contract'

export class DlcIPCBrowserAPIMock implements DlcBrowserAPI {
  public callback: () => void = () => {}

  dlcUpdate(contract: Contract): Promise<void> {
    this.callback()
    return Promise.resolve()
  }
}
