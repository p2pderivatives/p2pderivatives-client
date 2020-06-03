import { DlcIPCBrowserAPI } from '../src/browser/ipc/DlcBrowserAPI'
import { DlcEventType } from '../src/common/constants/DlcEventType'
import { Contract } from '../src/common/models/dlc/Contract'

export class DlcIPCBrowserAPIMock implements DlcIPCBrowserAPI {
  public callback: () => void = () => {}

  dlcCall(eventCode: DlcEventType, contract: Contract): Promise<void> {
    this.callback()
    return Promise.resolve()
  }
}
