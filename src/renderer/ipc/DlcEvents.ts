import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { DLC_UPDATE } from '../../common/constants/IPC'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { Store } from 'redux'
import { ApplicationState } from '../store'
import { Contract } from '../../common/models/dlc/Contract'
import { dlcUpdate } from '../store/dlc/actions'

export class DlcEvents implements IPCEvents {
  private _store: Store<ApplicationState>
  private _unregisterCall: () => void = () => {
    // do nothing
  }

  constructor(store: Store<ApplicationState>) {
    this._store = store
  }

  registerReplies(): void {
    this._unregisterCall = window.api.answerMain(
      DLC_UPDATE,
      (contract: Contract) => {
        this._store.dispatch(dlcUpdate(contract))
        return new GeneralAnswer(true)
      }
    )
  }

  unregisterReplies(): void {
    this._unregisterCall()
  }
}
