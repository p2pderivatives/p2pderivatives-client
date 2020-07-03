import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { DLC_UPDATE } from '../../common/constants/IPC'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { Store } from 'redux'
import { ApplicationState } from '../store'
import { Contract } from '../../common/models/dlc/Contract'
import { dlcUpdate } from '../store/dlc/actions'
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export class DlcEvents implements IPCEvents {
  private _store: Store<ApplicationState>

  constructor(store: Store<ApplicationState>) {
    this._store = store
  }

  registerReplies(): void {
    ipc.answerMain(DLC_UPDATE, (data: { contract: Contract }) => {
      this._store.dispatch(dlcUpdate(data.contract))
      return new GeneralAnswer(true)
    })
  }
}