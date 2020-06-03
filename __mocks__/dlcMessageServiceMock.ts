import { DlcMessageServiceApi } from '../src/browser/api/grpc/DlcMessageService'
import { DlcTypedMessage } from '../src/browser/dlc/models/DlcTypedMessage'
import { Readable } from 'stream'
import { DlcAbstractMessage } from '../src/browser/dlc/models/DlcAbstractMessage'

export class DlcMessageServiceMock implements DlcMessageServiceApi {
  constructor(
    readonly ownStream: Readable,
    readonly destStream: Readable,
    readonly sender: string
  ) {}

  sendDlcMessage(message: DlcTypedMessage, dest: string): Promise<void> {
    const abstractMessage: DlcAbstractMessage = {
      from: this.sender,
      payload: message,
    }
    this.destStream.emit('data', abstractMessage)
    return Promise.resolve()
  }
  getDlcMessageStream(): Readable {
    return this.ownStream
  }
}
