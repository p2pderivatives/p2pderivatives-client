import { IUserClient } from '@internal/gen-grpc/user_grpc_pb'
import { DlcMessage, Empty } from '@internal/gen-grpc/user_pb'
import { Metadata } from 'grpc'
import { DlcAbstractMessage } from '../../dlc/models/messages/DlcAbstractMessage'
import { DlcTypedMessage } from '../../dlc/models/messages/DlcTypedMessage'
import { GrpcAuth } from './GrpcAuth'
import { promisify } from './grpcPromisify'
import { Readable } from 'stream'

export interface DlcMessageServiceApi {
  sendDlcMessage(message: DlcTypedMessage, dest: string): Promise<void>
  getDlcMessageStream(): DlcMessageStream
}

export class DlcMessageStream {
  constructor(
    private readonly grpcStream: Readable,
    readonly cancel: () => void
  ) {}

  async *listen(): AsyncGenerator<DlcAbstractMessage, void, unknown> {
    try {
      for await (const chunk of this.grpcStream) {
        const message = JSON.parse(
          new TextDecoder().decode(chunk.getPayload() as Uint8Array)
        )
        const abstractMessage: DlcAbstractMessage = {
          from: chunk.getOrgName(),
          payload: message,
        }

        yield abstractMessage
      }
    } catch (error) {
      // Stream was cancelled
      if (error.code === 1) {
        return
      }

      throw error
    }
  }
}

export class DlcMessageService implements DlcMessageService {
  private readonly _client: IUserClient
  private readonly _auth: GrpcAuth

  constructor(client: IUserClient, auth: GrpcAuth) {
    this._client = client
    this._auth = auth
  }

  public async sendDlcMessage(
    message: DlcTypedMessage,
    dest: string
  ): Promise<void> {
    const payload = new Uint8Array(
      new TextEncoder().encode(JSON.stringify(message))
    )
    const dlcMessage = new DlcMessage()
    dlcMessage.setDestName(dest)
    dlcMessage.setPayload(payload)
    const metaData = new Metadata()
    metaData.add(GrpcAuth.AuthTokenMeta, this._auth.getAuthToken())

    const sendDlcMessageAsync = promisify<DlcMessage, Empty>(
      this._client.sendDlcMessage.bind(this._client)
    )

    await sendDlcMessageAsync(dlcMessage, metaData)
  }

  public getDlcMessageStream(): DlcMessageStream {
    const metaData = new Metadata()
    metaData.add(GrpcAuth.AuthTokenMeta, this._auth.getAuthToken())

    const grpcStream = this._client.receiveDlcMessages(new Empty(), metaData)

    return new DlcMessageStream(grpcStream, () => grpcStream.cancel())
  }
}
