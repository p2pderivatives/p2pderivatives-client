import { IPCEventsConsumer } from '../../../common/ipc/BaseIPC'
import { FileChannels, FILE_TAGS } from '../../../common/ipc/model/file'

export default class FileIPC extends IPCEventsConsumer<FileChannels, 'main'> {
  constructor() {
    super('main', FILE_TAGS)
  }
}
