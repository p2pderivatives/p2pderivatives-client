import { IPCEventsConsumer } from '../../../common/ipc/BaseIPC'
import {
  AuthChannels,
  AUTH_TAGS,
} from '../../../common/ipc/model/authentication'

export class AuthenticationIPC extends IPCEventsConsumer<AuthChannels, 'main'> {
  constructor() {
    super('main', AUTH_TAGS)
  }
}
