import { IPCEventsConsumer } from '../../../common/ipc/BaseIPC'
import { OracleChannels, ORACLE_TAGS } from '../../../common/ipc/model/oracle'

export default class OracleIPC extends IPCEventsConsumer<
  OracleChannels,
  'main'
> {
  constructor() {
    super('main', ORACLE_TAGS)
  }
}
