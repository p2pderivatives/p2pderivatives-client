import { IPCEvents } from '../../common/models/ipc/IPCEvents'
import { DLC_UPDATE } from '../../common/constants/IPC'
import { GeneralAnswer } from '../../common/models/ipc/GeneralAnswer'
import { Store } from 'redux'
import { ApplicationState } from '../store'
import { ContractSimple } from '../../common/models/ipc/ContractSimple'
import { dlcUpdate } from '../store/dlc/actions'
import { DlcCall } from '../../common/models/ipc/DlcCall'
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

export class DlcEvents implements IPCEvents {
  private _store: Store<ApplicationState>

  constructor(store: Store<ApplicationState>) {
    this._store = store
  }

  registerReplies(): void {
    console.log('REGISTERING REPLIES')
    ipc.answerMain(DLC_UPDATE, (data: { contract: ContractSimple }) => {
      this._store.dispatch(dlcUpdate(data.contract))
      return new GeneralAnswer(true)
    })
  }
}
