import { Store } from 'redux'
import { IPCEventRegisterBase } from '../../../common/ipc/BaseIPC'
import { TaggedCallbacks } from '../../../common/ipc/IPC'
import {
  UpdateChannels,
  UpdateFailableAsync,
} from '../../../common/ipc/model/update'
import { Contract } from '../../../common/models/dlc/Contract'
import { Success } from '../../../common/utils/failable'
import { ApplicationState } from '../../store'
import { dlcUpdate } from '../../store/dlc/actions'

export class DlcEvents extends IPCEventRegisterBase<UpdateChannels> {
  private _store: Store<ApplicationState>

  constructor(store: Store<ApplicationState>) {
    super()
    this._store = store
  }

  protected taggedCallbacks: TaggedCallbacks<UpdateChannels> = {
    updateDlc: {
      tag: 'update/dlc',
      callback: (data: Contract): UpdateFailableAsync<void> => {
        this._store.dispatch(dlcUpdate(data))
        return Promise.resolve(Success())
      },
    },
  }
}
