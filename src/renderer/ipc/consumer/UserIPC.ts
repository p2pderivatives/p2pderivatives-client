import { IPCEventsConsumer } from '../../../common/ipc/BaseIPC'
import { UserChannels, USER_TAGS } from '../../../common/ipc/model/user'

export class UserIPC extends IPCEventsConsumer<UserChannels, 'main'> {
  constructor() {
    super('main', USER_TAGS)
  }
}
