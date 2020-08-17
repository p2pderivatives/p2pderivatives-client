import { IPCEventsConsumer } from '../../../common/ipc/BaseIPC'
import { UpdateChannels, UPDATE_TAGS } from '../../../common/ipc/model/update'

export class DlcUpdate extends IPCEventsConsumer<UpdateChannels, 'renderer'> {
  constructor(window: Electron.BrowserWindow) {
    super('renderer', UPDATE_TAGS, window)
  }
}
