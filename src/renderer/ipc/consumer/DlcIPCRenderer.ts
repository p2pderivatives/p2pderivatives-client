import { IPCEventsConsumer } from '../../../common/ipc/BaseIPC'
import { DlcChannels, DLC_TAGS } from '../../../common/ipc/model/dlc'

export class DlcIPCRenderer extends IPCEventsConsumer<DlcChannels, 'main'> {
  constructor() {
    super('main', DLC_TAGS)
  }
}
