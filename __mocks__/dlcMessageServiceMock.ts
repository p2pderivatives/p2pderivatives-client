import { DlcMessage } from '@internal/gen-grpc/user_pb'
import { Readable } from 'stream'
import {
  DlcMessageServiceApi,
  DlcMessageStream,
} from '../src/browser/api/grpc/DlcMessageService'
import { DlcTypedMessage } from '../src/browser/dlc/models/messages'

export class DlcMessageServiceMock implements DlcMessageServiceApi {
  constructor(
    readonly ownStream: Readable,
    readonly destStream: Readable,
    readonly sender: string,
    readonly throwOnSend: () => boolean,
    readonly ignoreSend: () => boolean
  ) {}

  sendDlcMessage(message: DlcTypedMessage, dest: string): Promise<void> {
    if (this.throwOnSend()) {
      throw Error('Throw on send')
    }

    if (this.ignoreSend()) {
      return Promise.resolve()
    }

    const payload = new Uint8Array(
      new TextEncoder().encode(JSON.stringify(message))
    )
    const dlcMessage = new DlcMessage()
    dlcMessage.setDestName(dest)
    dlcMessage.setPayload(payload)

    this.destStream.push(dlcMessage)
    return Promise.resolve()
  }

  getDlcMessageStream(): DlcMessageStream {
    return new DlcMessageStream(this.ownStream, () => {})
  }
}
